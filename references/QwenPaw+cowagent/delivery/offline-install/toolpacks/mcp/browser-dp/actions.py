#!/usr/bin/env python3
"""browser-dp 固化动作库。每个动作: fn(session, tab_id=..., **params) -> dict。

API 依据 DrissionPage 4.0.5.6 官方文档，不得按其他版本想当然。
"""
from __future__ import annotations

import os
from typing import Any

import requests

# 浏览器容器侧路径白名单（compose 挂载 /data/downloads、/data/uploads）
BROWSER_SIDE_ROOTS = ("/data/downloads", "/data/uploads")
# MCP 进程侧（CowAgent 容器内）共享目录：bind 同一宿主目录，见 docker-compose.browser.yml
def _env_dir(name: str, default: str) -> str:
    return os.environ.get(name, default)

MCP_DOWNLOADS_DIR = _env_dir("DP_DOWNLOADS_DIR", "/home/agent/cow/browser-dp/downloads")
MCP_UPLOADS_DIR = _env_dir("DP_UPLOADS_DIR", "/home/agent/cow/browser-dp/uploads")
# MCP 进程侧允许 save_page 落盘的根目录
MCP_SIDE_ROOTS = tuple(filter(None, [os.environ.get("DP_WORKSPACE_DIR",
                                                     "/home/agent/cow/browser-dp/workspace")]))

# MCP 侧目录 -> 浏览器容器侧目录 的映射（同一个宿主 bind 目录的两种视图）
_MCP_TO_BROWSER = {
    os.path.realpath(MCP_DOWNLOADS_DIR): "/data/downloads",
    os.path.realpath(MCP_UPLOADS_DIR): "/data/uploads",
}


def _path_allowed(path: str, roots: tuple[str, ...]) -> bool:
    real = os.path.realpath(path)
    return any(real == r or real.startswith(r.rstrip("/") + "/") for r in roots)


def _normalize_browser_path(path: str, root: str) -> str:
    """接受 MCP 侧共享路径或浏览器侧路径，返回浏览器侧绝对路径并校验不越出 root。"""
    real = os.path.realpath(str(path))
    for mcp_root, browser_root in _MCP_TO_BROWSER.items():
        if real == mcp_root or real.startswith(mcp_root.rstrip("/") + "/"):
            real = browser_root + real[len(mcp_root.rstrip("/")):]
            break
    if not os.path.isabs(real):
        real = os.path.join(root, str(path).lstrip("/"))
    # 去掉 .. 越权尝试
    parts = []
    for seg in real.split("/"):
        if seg in ("", "."):
            continue
        if seg == ".." and parts:
            parts.pop()
            continue
        if seg == "..":
            continue
        parts.append(seg)
    real = "/" + "/".join(parts)
    root_norm = root.rstrip("/") + "/"
    if not (real == root.rstrip("/") or real.startswith(root_norm)):
        raise ValueError(f"path escapes {root}: {path}")
    return real


def _truncate(value: Any, limit: int = 4000) -> Any:
    if isinstance(value, str) and len(value) > limit:
        return value[:limit] + f"...[truncated {len(value) - limit} chars]"
    return value


def _ele_summary(session, ele, locator: str, page) -> dict[str, Any]:
    summary: dict[str, Any] = {"ref": session.register_element(ele, locator, page.tab_id)}
    try:
        summary["tag"] = ele.tag
        summary["text"] = (ele.text or "").strip()[:120]
        attrs = {}
        for name in ("id", "name", "type", "placeholder", "href", "aria-label"):
            val = ele.attr(name)
            if val:
                attrs[name] = str(val)[:120]
        summary["attrs"] = attrs
        summary["states"] = {
            "displayed": bool(ele.states.is_displayed),
            "enabled": bool(ele.states.is_enabled),
        }
        if ele.rect.viewport_midpoint:
            summary["viewport_xy"] = list(ele.rect.viewport_midpoint)
    except Exception as exc:  # noqa: BLE001
        summary["meta_error"] = str(exc)[:200]
    return summary


def _resolve(session, tab_id, ref=None, locator=None):
    return session.resolve_element(ref, locator, tab_id)


# ---------- 导航 ----------

def goto(session, tab_id=None, url="", timeout=None, retry=None, **_):
    page = session.page_for(tab_id)
    ok = page.get(url, timeout=timeout, retry=retry)
    return {"url": page.url, "connected": ok, "url_available": page.url_available,
            "title": page.title}


def back(session, tab_id=None, steps=1, **_):
    session.page_for(tab_id).back(steps)
    return {"done": True}


def forward(session, tab_id=None, steps=1, **_):
    session.page_for(tab_id).forward(steps)
    return {"done": True}


def refresh(session, tab_id=None, ignore_cache=False, **_):
    session.page_for(tab_id).refresh(ignore_cache)
    return {"done": True}


def stop_loading(session, tab_id=None, **_):
    session.page_for(tab_id).stop_loading()
    return {"done": True}


def wait_ready(session, tab_id=None, timeout=None, **_):
    page = session.page_for(tab_id)
    return {"loaded": bool(page.wait.doc_loaded(timeout)), "ready_state": page.states.ready_state}


def wait_url(session, tab_id=None, text="", timeout=None, **_):
    return {"matched": bool(session.page_for(tab_id).wait.url_change(text, timeout))}


def wait_title(session, tab_id=None, text="", timeout=None, **_):
    return {"matched": bool(session.page_for(tab_id).wait.title_change(text, timeout))}


# ---------- 标签页 ----------

def list_tabs(session, **_):
    resp = requests.get(f"http://{session._resolvable_address()}/json/list", timeout=3)
    tabs = [{"tab_id": t.get("id"), "url": t.get("url"), "title": t.get("title"),
             "type": t.get("type")}
            for t in resp.json() if t.get("type") == "page"]
    return {"tabs": tabs, "current": session.current_tab_id}


def new_tab(session, url=None, background=False, new_context=False, **_):
    browser = session.browser
    tab = browser.new_tab(url=url, background=background, new_context=new_context)
    session.current_tab_id = tab.tab_id
    return {"tab_id": tab.tab_id, "url": tab.url, "title": tab.title}


def select_tab(session, tab_id=None, index=None, url=None, title=None, **_):
    browser = session.browser
    if index is not None:
        tab = browser.get_tab(int(index))
    elif tab_id:
        tab = browser.get_tab(tab_id)
    else:
        tab = browser.get_tab(url=url, title=title)
    if tab is None:
        raise ValueError("no matching tab")
    session.current_tab_id = tab.tab_id
    return {"tab_id": tab.tab_id, "url": tab.url, "title": tab.title}


def close_tabs(session, tab_ids=None, others=False, **_):
    browser = session.browser
    # 4.0.5.6 的 close_tabs 在"将关闭最后一个 tab"时会转调 quit() → Browser.close
    # 杀掉整个浏览器。保护：确保始终保留一个哨兵 tab。
    remaining = set(browser.tab_ids)
    to_close = set(tab_ids or [])
    if others:
        to_close = remaining - to_close - ({session.current_tab_id} if session.current_tab_id else set())
    if session.current_tab_id and session.current_tab_id in to_close:
        to_close.discard(session.current_tab_id)
    if len(remaining - to_close) <= 1:
        to_close = to_close - remaining if to_close else set()
        # 只关闭不导致空浏览器的部分
        safe = remaining - {session.current_tab_id or browser.tab_id}
        to_close &= safe
        if not to_close:
            return {"remaining": browser.tab_ids, "current": session.current_tab_id,
                    "note": "refused to close the last tab (would kill browser)"}
    browser.close_tabs(tabs_or_ids=sorted(to_close) if to_close else None, others=False)
    if session.current_tab_id and session.current_tab_id not in browser.tab_ids:
        session.current_tab_id = browser.tab_id
    return {"remaining": browser.tab_ids, "current": session.current_tab_id}


def tab_to_front(session, tab_id=None, **_):
    session.browser.set.tab_to_front(tab_id or session.current_tab_id)
    return {"done": True}


# ---------- 读取 ----------

def page_info(session, tab_id=None, **_):
    page = session.page_for(tab_id)
    return {
        "tab_id": page.tab_id,
        "url": page.url,
        "title": page.title,
        "ready_state": page.states.ready_state,
        "is_loading": page.states.is_loading,
        "has_alert": page.states.has_alert,
        "browser_version": page.browser_version,
        "address": page.address,
    }


def read_text(session, tab_id=None, ref=None, locator=None, max_len=8000, **_):
    if ref or locator:
        ele, page = _resolve(session, tab_id, ref, locator)
        return {"text": _truncate(ele.text, max_len)}
    page = session.page_for(tab_id)
    return {"text": _truncate(page.text, max_len)}


def read_html(session, tab_id=None, ref=None, locator=None, max_len=8000, **_):
    if ref or locator:
        ele, page = _resolve(session, tab_id, ref, locator)
        return {"html": _truncate(ele.inner_html, max_len)}
    page = session.page_for(tab_id)
    return {"html": _truncate(page.html, max_len)}


def read_table(session, tab_id=None, locator="t:table", max_rows=100, **_):
    page = session.page_for(tab_id)
    ele = page.ele(locator)
    if ele is None:
        raise ValueError(f"table not found: {locator}")
    rows_out = []
    for row in ele.eles("t:tr")[:max_rows]:
        cells = row.eles("c:td,th")
        rows_out.append([c.text.strip() for c in cells])
    return {"rows": rows_out, "row_count": len(rows_out)}


def read_json(session, tab_id=None, **_):
    return {"json": session.page_for(tab_id).json}


def get_cookies(session, tab_id=None, all_domains=False, as_dict=False, **_):
    return {"cookies": session.page_for(tab_id).cookies(all_domains=all_domains, as_dict=as_dict)}


def get_storage(session, tab_id=None, type="session", item=None, **_):
    page = session.page_for(tab_id)
    if type == "session":
        return {"storage": page.session_storage(item)}
    if type == "local":
        return {"storage": page.local_storage(item)}
    raise ValueError("type must be session or local")


def save_page(session, tab_id=None, path="", name=None, as_pdf=False, **_):
    if not _path_allowed(path, MCP_SIDE_ROOTS):
        raise ValueError(f"path outside MCP workspace roots {MCP_SIDE_ROOTS}: {path}")
    page = session.page_for(tab_id)
    result = page.save(path=path, name=name, as_pdf=as_pdf)
    return {"path_or_preview": _truncate(result, 500), "as_pdf": as_pdf}


# ---------- 查找与交互 ----------

def find_element(session, tab_id=None, locator="", timeout=None, index=None, **_):
    page = session.page_for(tab_id)
    ele = page.ele(locator, timeout=timeout)
    if ele is None:
        raise ValueError(f"element not found: {locator}")
    if index is not None:
        ele = page.eles(locator)[int(index)]
    return _ele_summary(session, ele, locator, page)


def find_elements(session, tab_id=None, locator="", max_count=30, timeout=None, **_):
    page = session.page_for(tab_id)
    found = page.eles(locator, timeout=timeout)[:max_count]
    return {"count": len(found),
            "elements": [_ele_summary(session, ele, locator, page) for ele in found]}


def click(session, tab_id=None, ref=None, locator=None, by_js=None, timeout=None, **_):
    ele, page = _resolve(session, tab_id, ref, locator)
    result = ele.click(by_js=by_js, timeout=timeout if timeout is not None else 3)
    session.current_tab_id = page.tab_id
    return {"clicked": bool(result), "url": page.url}


def click_at(session, tab_id=None, ref=None, locator=None, offset_x=None, offset_y=None,
             button="left", count=1, **_):
    ele, _page = _resolve(session, tab_id, ref, locator)
    kwargs: dict[str, Any] = {"button": button, "count": count}
    if offset_x is not None:
        kwargs["offset_x"] = offset_x
    if offset_y is not None:
        kwargs["offset_y"] = offset_y
    ele.click.at(**kwargs)
    return {"done": True}


def input_text(session, tab_id=None, ref=None, locator=None, text="", clear=False,
               by_js=False, **_):
    ele, _page = _resolve(session, tab_id, ref, locator)
    ele.input(text, clear=clear, by_js=by_js)
    return {"done": True}


def clear_input(session, tab_id=None, ref=None, locator=None, by_js=False, **_):
    ele, _page = _resolve(session, tab_id, ref, locator)
    ele.clear(by_js)
    return {"done": True}


def press_key(session, tab_id=None, keys=None, **_):
    page = session.page_for(tab_id)
    if keys is None:
        raise ValueError("keys required, e.g. ['CTRL','a'] or 'Enter'")
    seq = keys if isinstance(keys, (list, tuple)) else [keys]
    for step in seq:
        key = getattr(session.keys, str(step).upper(), step)
        page.actions.key_down(key)
        page.actions.key_up(key)
    return {"done": True}


def select_option(session, tab_id=None, ref=None, locator=None, by="text", value=None, **_):
    ele, _page = _resolve(session, tab_id, ref, locator)
    if by == "text":
        return {"selected": bool(ele.select.by_text(value))}
    if by == "value":
        return {"selected": bool(ele.select.by_value(value))}
    if by == "index":
        return {"selected": bool(ele.select.by_index(value))}
    raise ValueError("by must be text/value/index")


def hover(session, tab_id=None, ref=None, locator=None, offset_x=None, offset_y=None, **_):
    ele, _page = _resolve(session, tab_id, ref, locator)
    ele.hover(offset_x, offset_y)
    return {"done": True}


def scroll_page(session, tab_id=None, to=None, x=None, y=None, pixel=None, direction=None, **_):
    page = session.page_for(tab_id)
    if to == "top":
        page.scroll.to_top()
    elif to == "bottom":
        page.scroll.to_bottom()
    elif to == "location":
        page.scroll.to_location(x, y)
    elif pixel and direction:
        getattr(page.scroll, direction)(int(pixel))
    else:
        raise ValueError("need to=top/bottom/location or pixel+direction(up/down/left/right)")
    return {"done": True}


def scroll_element(session, tab_id=None, ref=None, locator=None, to=None, x=None, y=None,
                   pixel=None, direction=None, **_):
    ele, _page = _resolve(session, tab_id, ref, locator)
    if to == "top":
        ele.scroll.to_top()
    elif to == "bottom":
        ele.scroll.to_bottom()
    elif to == "location":
        ele.scroll.to_location(x, y)
    elif pixel and direction:
        getattr(ele.scroll, direction)(int(pixel))
    else:
        raise ValueError("need to=top/bottom/location or pixel+direction(up/down/left/right)")
    return {"done": True}


def scroll_to_see(session, tab_id=None, ref=None, locator=None, center=None, **_):
    ele, page = _resolve(session, tab_id, ref, locator)
    ele.scroll.to_see(center)
    return {"done": True}


def drag(session, tab_id=None, ref=None, locator=None, offset_x=0, offset_y=0, duration=0.5, **_):
    ele, _page = _resolve(session, tab_id, ref, locator)
    ele.drag(offset_x, offset_y, duration)
    return {"done": True}


# ---------- 等待 ----------

def wait_element(session, tab_id=None, locator="", state="displayed", timeout=None, **_):
    page = session.page_for(tab_id)
    if state == "displayed":
        ok = page.wait.ele_displayed(locator, timeout)
    elif state == "hidden":
        ok = page.wait.ele_hidden(locator, timeout)
    elif state == "deleted":
        ok = page.wait.ele_deleted(locator, timeout)
    elif state in ("not_covered", "clickable"):
        ele = page.ele(locator)
        if ele is None:
            raise ValueError(f"element not found: {locator}")
        ok = ele.wait.not_covered(timeout) if state == "not_covered" else ele.wait.clickable(timeout)
    else:
        raise ValueError("state must be displayed/hidden/deleted/not_covered/clickable")
    return {"matched": bool(ok)}


def wait_new_tab(session, timeout=None, **_):
    browser = session.browser
    new_id = browser.wait.new_tab(timeout)
    if new_id:
        session.current_tab_id = new_id
    return {"tab_id": new_id}


def wait_downloads_done(session, tab_id=None, timeout=None, **_):
    page = session.page_for(tab_id)
    page.wait.all_downloads_done(timeout)
    return {"done": True}


# ---------- 弹窗 ----------

def handle_alert(session, tab_id=None, accept=True, send=None, timeout=None, **_):
    result = session.page_for(tab_id).handle_alert(accept=accept, send=send, timeout=timeout)
    return {"alert_text": result if result else False}


def set_auto_alert(session, tab_id=None, on_off=True, accept=True, all_tabs=False, **_):
    page = session.page_for(tab_id)
    page.set.auto_handle_alert(on_off=on_off, accept=accept, all_tabs=all_tabs)
    return {"done": True}


# ---------- 脚本与协议 ----------

def run_js(session, tab_id=None, script="", args=None, **_):
    page = session.page_for(tab_id)
    result = page.run_js(script, *(args or []))
    return {"result": _truncate(result)}


def run_cdp(session, tab_id=None, cmd="", args=None, **_):
    page = session.page_for(tab_id)
    return {"result": _truncate(page.run_cdp(cmd, **(args or {})))}


# ---------- 文件 ----------

def download_by_click(session, tab_id=None, ref=None, locator=None, save_path="",
                      rename=None, suffix=None, new_tab=False, timeout=None, **_):
    save_path = _normalize_browser_path(save_path, "/data/downloads")
    ele, page = _resolve(session, tab_id, ref, locator)
    mission = ele.click.to_download(save_path=save_path, rename=rename, suffix=suffix,
                                    new_tab=new_tab, timeout=timeout)
    mission.wait()
    return {"browser_path": save_path,
            "path": getattr(mission, "path", None), "size": getattr(mission, "size", None),
            "rate": getattr(mission, "rate", None)}


def upload_by_click(session, tab_id=None, ref=None, locator=None, file_paths=None, by_js=False, **_):
    paths_in = file_paths if isinstance(file_paths, (list, tuple)) else [file_paths]
    paths = [_normalize_browser_path(str(p), "/data/uploads") for p in paths_in]
    ele, _page = _resolve(session, tab_id, ref, locator)
    ele.click.to_upload(paths, by_js=by_js)
    return {"uploaded": paths}


def set_download_path(session, tab_id=None, path="", **_):
    path = _normalize_browser_path(path, "/data/downloads")
    session.page_for(tab_id).set.download_path(path)
    return {"browser_path": path}


# ---------- 网络监听 ----------

def _packet_summary(packet, with_body=False):
    summary: dict[str, Any] = {"url": packet.url}
    try:
        summary["method"] = packet.request.method
    except Exception:  # noqa: BLE001
        pass
    try:
        summary["status"] = packet.response.status
    except Exception:  # noqa: BLE001
        pass
    if with_body:
        try:
            body = packet.response.body
            summary["body"] = _truncate(body if isinstance(body, str) else repr(body), 2000)
        except Exception as exc:  # noqa: BLE001
            summary["body_error"] = str(exc)[:200]
    return summary


def listen_start(session, tab_id=None, targets=None, is_regex=False, method=None, **_):
    page = session.page_for(tab_id)
    page.listen.start(targets, is_regex=is_regex, method=method)
    return {"listening": True, "targets": targets}


def listen_wait(session, tab_id=None, count=1, timeout=None, with_body=False, **_):
    page = session.page_for(tab_id)
    packets = page.listen.wait(count=count, timeout=timeout)
    return {"packets": [_packet_summary(p, with_body) for p in packets]}


def listen_results(session, tab_id=None, with_body=False, **_):
    page = session.page_for(tab_id)
    return {"packets": [_packet_summary(p, with_body) for p in page.listen.results()]}


def listen_stop(session, tab_id=None, **_):
    session.page_for(tab_id).listen.stop()
    return {"stopped": True}


# ---------- 治理 ----------

def health_check(session, **_):
    detail: dict[str, Any] = {"cdp_alive": False, "address": session._address}
    try:
        version_resp = requests.get(f"http://{session._resolvable_address()}/json/version",
                                    timeout=3)
        if version_resp.ok:
            detail["cdp_alive"] = True
            detail["browser"] = version_resp.json().get("Browser")
        else:
            detail["http_status"] = version_resp.status_code
    except Exception as exc:  # noqa: BLE001 - 诊断动作必须返回结构化结果而非抛异常
        detail["cdp_error"] = f"{type(exc).__name__}: {str(exc)[:200]}"
    try:
        page = session.page_for()
        detail["current_tab"] = {"tab_id": page.tab_id, "url": page.url,
                                 "alive": bool(page.states.is_alive),
                                 "ready_state": page.states.ready_state}
        detail["tabs_count"] = session.browser.tabs_count
    except Exception as exc:  # noqa: BLE001
        detail["page_error"] = f"{type(exc).__name__}: {str(exc)[:300]}"
    return detail


def cleanup_tabs(session, max_tabs=8, **_):
    browser = session.browser
    resp = requests.get(f"http://{session._resolvable_address()}/json/list", timeout=3)
    pages = [t for t in resp.json() if t.get("type") == "page"]
    keep = {session.current_tab_id, browser.tab_id}
    ordered = [t["id"] for t in pages if t.get("id") not in keep]
    overflow = ordered[:-max(0, max_tabs - len(keep))] if len(ordered) + len(keep) > max_tabs else []
    if overflow:
        browser.close_tabs(tabs_or_ids=overflow)
    return {"closed": overflow, "remaining": browser.tab_ids}


def set_timeouts(session, tab_id=None, base=None, page_load=None, script=None, **_):
    session.page_for(tab_id).set.timeouts(base=base, page_load=page_load, script=script)
    return {"timeouts": session.page_for(tab_id).timeouts}


def set_load_mode(session, tab_id=None, mode="normal", **_):
    if mode not in ("normal", "eager", "none"):
        raise ValueError("mode must be normal/eager/none")
    page = session.page_for(tab_id)
    getattr(page.set.load_mode, mode)()
    return {"load_mode": page.load_mode}


def set_window(session, width=None, height=None, maximize=False, **_):
    page = session.browser
    if maximize:
        page.set.window.max()
    elif width or height:
        page.set.window.size(width, height)
    return {"done": True}


def set_user_agent(session, tab_id=None, ua="", **_):
    session.page_for(tab_id).set.user_agent(ua)
    return {"done": True}


registry = {
    # 导航
    "goto": goto, "back": back, "forward": forward, "refresh": refresh,
    "stop_loading": stop_loading, "wait_ready": wait_ready,
    "wait_url": wait_url, "wait_title": wait_title,
    # 标签页
    "list_tabs": list_tabs, "new_tab": new_tab, "select_tab": select_tab,
    "close_tabs": close_tabs, "tab_to_front": tab_to_front,
    # 读取
    "page_info": page_info, "read_text": read_text, "read_html": read_html,
    "read_table": read_table, "read_json": read_json, "get_cookies": get_cookies,
    "get_storage": get_storage, "save_page": save_page,
    # 查找与交互
    "find_element": find_element, "find_elements": find_elements, "click": click,
    "click_at": click_at, "input_text": input_text, "clear_input": clear_input,
    "press_key": press_key, "select_option": select_option, "hover": hover,
    "scroll_page": scroll_page, "scroll_element": scroll_element,
    "scroll_to_see": scroll_to_see, "drag": drag,
    # 等待
    "wait_element": wait_element, "wait_new_tab": wait_new_tab,
    "wait_downloads_done": wait_downloads_done,
    # 弹窗
    "handle_alert": handle_alert, "set_auto_alert": set_auto_alert,
    # 脚本与协议
    "run_js": run_js, "run_cdp": run_cdp,
    # 文件
    "download_by_click": download_by_click, "upload_by_click": upload_by_click,
    "set_download_path": set_download_path,
    # 网络监听
    "listen_start": listen_start, "listen_wait": listen_wait,
    "listen_results": listen_results, "listen_stop": listen_stop,
    # 治理
    "health_check": health_check, "cleanup_tabs": cleanup_tabs,
    "set_timeouts": set_timeouts, "set_load_mode": set_load_mode,
    "set_window": set_window, "set_user_agent": set_user_agent,
}
