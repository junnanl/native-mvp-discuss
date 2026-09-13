#!/usr/bin/env python3
"""browser-dp 会话层：CDP 连接管理、当前 tab、元素注册表、动作分发。"""
from __future__ import annotations

import io
import json
import threading
from typing import Any

import requests
from DrissionPage import ChromiumOptions, ChromiumPage
from DrissionPage.common import Keys, Settings

from actions import registry

SNAPSHOT_CSS = (
    "a, button, input, select, textarea, [role=button], [role=link], [role=tab], "
    "[role=menuitem], [role=option], [onclick]"
)

INTERACTIVE_META_ATTRS = ("id", "name", "type", "placeholder", "href", "value",
                          "aria-label", "title", "role", "action")


class BrowserSession:
    """维护到浏览器容器的 CDP 连接与会话状态。线程内串行使用。"""

    def __init__(self) -> None:
        self._address: str = "browser:9222"
        self._browser: ChromiumPage | None = None
        self._lock = threading.Lock()
        self.current_tab_id: str | None = None
        self._elements: dict[str, dict[str, Any]] = {}  # ref -> {"ele", "locator", "tab_id"}
        self._ref_seq = 0
        self.keys = Keys
        self.last_error: str | None = None

    # ---------- 连接管理 ----------

    def configure(self, address: str) -> None:
        self._address = address

    def _resolvable_address(self) -> str:
        """把 DP_BROWSER_ADDRESS 中的主机名解析为 IP 后返回。

        Chromium 66+ 的 DevTools HTTP 服务校验 Host 头，只接受 localhost 与
        IP 字面量；docker links / compose 提供的服务名（如 browser）必须先
        转成容器 IP。解析失败时回退原地址，由 DrissionPage 报标准连接错误。
        """
        import socket

        host, _, port = self._address.rpartition(":")
        if not host:
            return self._address
        try:
            ip = socket.gethostbyname(host)
        except OSError:
            return self._address
        return f"{ip}:{port}"

    @property
    def browser(self) -> ChromiumPage:
        with self._lock:
            if self._browser is None:
                co = ChromiumOptions(read_file=False)
                co.set_address(self._resolvable_address())
                co.existing_only(True)
                # 关键：声明 --headless 使 options._headless 为真值，跳过 4.0.5.6
                # ChromiumPage._run_browser 的"配置不匹配→Browser.close 杀掉接管浏览器
                # 再重启"启发式（对无头浏览器接管时必然命中并杀死浏览器）。
                co.set_argument('--headless', 'new')
                co.set_timeouts(base=10, page_load=30, script=30)
                if os_env_flag("DP_IGNORE_CERT_ERRORS"):
                    co.ignore_certificate_errors(True)
                Settings.raise_click_failed = False
                self._browser = ChromiumPage(addr_or_opts=co)
                self.current_tab_id = self._browser.tab_id
            return self._browser

    def _cdp_alive(self) -> bool:
        try:
            resp = requests.get(f"http://{self._resolvable_address()}/json/version",
                                headers={"Host": "localhost"}, timeout=3)
            return resp.ok
        except Exception:  # noqa: BLE001
            return False

    def reset_if_dead(self, exc: Exception) -> None:
        """连接类故障时丢弃缓存对象，下次调用自动重建。"""
        if isinstance(exc, (ConnectionError, TimeoutError)) or not self._cdp_alive():
            with self._lock:
                self._browser = None
                self._elements.clear()
                self.current_tab_id = None

    def page_for(self, tab_id: str | None = None):
        """返回指定 tab 的页面对象；tab_id 为空用当前 tab。"""
        browser = self.browser
        target = tab_id or self.current_tab_id
        if not target or target == browser.tab_id:
            return browser
        tab = browser.get_tab(target)
        if tab is None:
            raise ValueError(f"tab not found: {target}")
        return tab

    # ---------- 元素注册表 ----------

    def register_element(self, ele, locator: str, tab_id: str) -> str:
        self._ref_seq += 1
        ref = f"e{self._ref_seq}"
        # 失效重查需要能唯一定位：批量查询的原始 selector 不行，按元素特征重建
        rebuilt = locator
        try:
            tag = ele.tag
            eid = ele.attr("id")
            name = ele.attr("name")
            if eid:
                rebuilt = f"#{eid}"
            elif name and tag in ("input", "select", "textarea", "button", "form"):
                rebuilt = f"t:{tag}@name={name}"
            elif locator.startswith("t:") and "@" not in locator:
                # 批量 t:xx 查询：加索引不够稳，保留原值但标注为批量
                rebuilt = f"{locator}@text()={ (ele.text or '').strip()[:60] }" if (ele.text or '').strip() else locator
        except Exception:  # noqa: BLE001
            pass
        self._elements[ref] = {"ele": ele, "locator": rebuilt, "tab_id": tab_id,
                               "batch_locator": locator}
        if len(self._elements) > 200:
            for key in list(self._elements)[:50]:
                self._elements.pop(key, None)
        return ref

    def resolve_element(self, ref: str | None, locator: str | None, tab_id: str | None = None):
        """优先用 ref 取缓存元素；失效时按重建 locator -> batch_locator -> 原始 locator 重查。"""
        page = self.page_for(tab_id)
        if ref:
            entry = self._elements.get(ref)
            if entry is not None:
                ele = entry["ele"]
                try:
                    if ele.states.is_alive:
                        return ele, page
                except Exception:  # noqa: BLE001
                    pass
                for candidate in (entry["locator"], entry.get("batch_locator")):
                    if not candidate:
                        continue
                    try:
                        ele = page.ele(candidate, timeout=3)
                    except Exception:  # noqa: BLE001
                        ele = None
                    if ele is not None:
                        new_ref = self.register_element(ele, entry.get("batch_locator") or candidate, page.tab_id)
                        return ele, page
                locator = locator or entry.get("batch_locator")
            if not locator:
                raise ValueError(f"stale ref and no locator recorded: {ref}")
        if not locator:
            raise ValueError("need ref or locator")
        ele = page.ele(locator)
        if ele is None:
            raise ValueError(f"element not found: {locator}")
        new_ref = self.register_element(ele, locator, page.tab_id)
        return ele, page

    # ---------- 分发 ----------

    def dispatch(self, action: str, params: dict[str, Any]) -> str:
        fn = registry.get(action)
        if fn is None:
            return json.dumps({
                "ok": False,
                "error": {"type": "UnknownAction", "message": action,
                          "available": sorted(registry)},
            }, ensure_ascii=False)
        tab_id = params.pop("tab_id", None)
        data = fn(self, tab_id=tab_id, **params)
        return json.dumps({"ok": True, "action": action, "data": data},
                          ensure_ascii=False, default=str)

    # ---------- snapshot ----------

    def snapshot(self, locator: str | None = None, max_elements: int = 60) -> str:
        page = self.page_for()
        info = {
            "tab_id": page.tab_id,
            "url": page.url,
            "title": page.title,
            "ready_state": page.states.ready_state,
            "has_alert": page.states.has_alert,
            "tabs_count": self.browser.tabs_count,
        }
        query = locator or SNAPSHOT_CSS
        found = page.eles(query)
        if not found and not locator:
            # data: URL / 极简页面可能对复合 CSS 选择器无匹配，回退到逐类查询
            fallback: list = []
            for q in ("t:button", "t:a", "t:input", "t:select", "t:textarea"):
                fallback.extend(page.eles(q))
            found = fallback
        items: list[dict[str, Any]] = []
        for ele in found[: max(1, max_elements)]:
            try:
                if not ele.states.is_displayed:
                    continue
            except Exception:  # noqa: BLE001
                continue
            item: dict[str, Any] = {"ref": self.register_element(ele, query, page.tab_id)}
            try:
                item["tag"] = ele.tag
                text = (ele.text or "").strip()
                item["text"] = text[:80]
                attrs = {}
                for name in INTERACTIVE_META_ATTRS:
                    val = ele.attr(name)
                    if val:
                        attrs[name] = str(val)[:80]
                item["attrs"] = attrs
                if ele.states.is_enabled is False:
                    item["disabled"] = True
                rect = ele.rect.viewport_midpoint
                if rect:
                    item["viewport_xy"] = list(rect)
            except Exception:  # noqa: BLE001
                continue
            items.append(item)
            if len(items) >= max_elements:
                break
        info["elements"] = items
        info["elements_truncated"] = len(found) > len(items)
        return json.dumps({"ok": True, "action": "snapshot", "data": info},
                          ensure_ascii=False, default=str)

    # ---------- 图片 ----------

    def scale_image(self, raw: bytes, max_dim: int) -> bytes:
        from PIL import Image

        img = Image.open(io.BytesIO(raw))
        if max(img.size) > max_dim:
            img.thumbnail((max_dim, max_dim))
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=80)
        return buf.getvalue()


def os_env_flag(name: str) -> bool:
    import os

    return os.environ.get(name, "") in ("1", "true", "yes")
