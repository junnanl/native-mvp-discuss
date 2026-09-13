#!/usr/bin/env python3
"""browser-dp: DrissionPage 薄 MCP 适配层（CowAgent 离线交付 1.0.7）。

固定暴露 4 个工具：browser_run / browser_snapshot / browser_screenshot / browser_exec。
浏览器本体运行在独立容器（compose service: browser），本进程只通过 CDP 接管，
existing_only 保证永远不会在 CowAgent 容器内拉起浏览器。
"""
import base64
import io
import json
import os
import re
import sys
import traceback
from typing import Any

from mcp.server.fastmcp import FastMCP

from actions import registry
from session import BrowserSession

SESSION = BrowserSession()
mcp = FastMCP(
    "browser-dp",
    instructions=(
        "DrissionPage browser execution over CDP. The browser runs in a dedicated "
        "container; this MCP only attaches to it. CowAgent remains the only planner."
    ),
)

MAX_RETURN_TEXT = 20000


def _pack(ok: bool, action: str | None = None, data: Any = None, error: Any = None) -> str:
    payload: dict[str, Any] = {"ok": ok}
    if action:
        payload["action"] = action
    if error is not None:
        payload["error"] = error
    else:
        payload["data"] = data
    text = json.dumps(payload, ensure_ascii=False, default=str)
    if len(text) > MAX_RETURN_TEXT:
        payload["data"] = str(data)[:MAX_RETURN_TEXT] if error is None else payload["error"]
        payload["truncated"] = True
        text = json.dumps(payload, ensure_ascii=False, default=str)
    return text


@mcp.tool()
def browser_run(action: str, params: dict | None = None) -> str:
    """执行一个固化的浏览器动作。未知 action 时返回完整动作清单。"""
    params = params or {}
    try:
        return SESSION.dispatch(action, params)
    except Exception as exc:  # noqa: BLE001 - MCP 边界必须转结构化错误
        SESSION.reset_if_dead(exc)
        return _pack(False, action, error={
            "type": type(exc).__name__,
            "message": str(exc)[:2000],
        })


@mcp.tool()
def browser_snapshot(locator: str | None = None, max_elements: int = 60) -> str:
    """读取当前标签页摘要与可交互元素清单（每个元素带 ref 供后续动作复用）。"""
    try:
        return SESSION.snapshot(locator, max_elements)
    except Exception as exc:  # noqa: BLE001
        SESSION.reset_if_dead(exc)
        return _pack(False, "snapshot", error={
            "type": type(exc).__name__,
            "message": str(exc)[:2000],
        })


@mcp.tool()
def browser_screenshot(full: bool = False, max_dim: int = 1280) -> str:
    """对当前标签页截图，返回 base64 JPEG（已按 max_dim 缩放）。"""
    try:
        page = SESSION.page_for()
        fmt = "png" if full else "jpg"
        raw = page.get_screenshot(as_bytes=fmt, full_page=full)
        data = SESSION.scale_image(raw, max_dim)
        b64 = base64.b64encode(data).decode("ascii")
        return _pack(True, "screenshot", {"mime": f"image/{'png' if fmt == 'png' else 'jpeg'}",
                                          "base64": b64})
    except Exception as exc:  # noqa: BLE001
        SESSION.reset_if_dead(exc)
        return _pack(False, "screenshot", error={
            "type": type(exc).__name__,
            "message": str(exc)[:2000],
        })


FORBIDDEN_IMPORTS = {"os", "subprocess", "socket", "shutil", "sys", "signal",
                     "ctypes", "multiprocessing", "pathlib", "importlib", "builtins"}
FORBIDDEN_CALLS = {"open", "eval", "exec", "compile", "__import__"}


def _exec_guard(code: str) -> list[str]:
    """静态检查逃生舱代码：拒绝越域 import 与危险内置调用。"""
    import ast

    problems: list[str] = []
    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        return [f"SyntaxError: {exc}"]
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                root = alias.name.split(".")[0]
                if root in FORBIDDEN_IMPORTS:
                    problems.append(f"forbidden import: {alias.name}")
        elif isinstance(node, ast.ImportFrom):
            root = (node.module or "").split(".")[0]
            if root in FORBIDDEN_IMPORTS:
                problems.append(f"forbidden import: from {node.module}")
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id in FORBIDDEN_CALLS:
                problems.append(f"forbidden call: {node.func.id}()")
    return problems


@mcp.tool()
def browser_exec(code: str) -> str:
    """逃生舱：在受控 namespace 执行 Python（DrissionPage 场景）。可用对象：
    browser(ChromiumPage总管), page(当前tab), actions(动作链), Keys, result(赋值以返回)。
    禁止 import os/subprocess/socket 等；需要复用的逻辑应整理为固化 action。"""
    problems = _exec_guard(code)
    if problems:
        return _pack(False, "exec", error={"type": "GuardError", "message": "; ".join(problems)})
    try:
        page = SESSION.page_for()
        namespace: dict[str, Any] = {
            "browser": SESSION.browser,
            "page": page,
            "actions": page.actions,
            "Keys": SESSION.keys,
            "result": None,
            "run_cdp": page.run_cdp,
        }
        exec(code, namespace)  # noqa: S102 - 受控逃生舱，已做静态守卫
        result = namespace.get("result")
        return _pack(True, "exec", {"result": result})
    except Exception as exc:  # noqa: BLE001
        SESSION.reset_if_dead(exc)
        return _pack(False, "exec", error={
            "type": type(exc).__name__,
            "message": str(exc)[:2000],
            "traceback_tail": traceback.format_exc()[-800:],
        })


def main() -> int:
    address = os.environ.get("DP_BROWSER_ADDRESS", "browser:9222")
    SESSION.configure(address)
    mcp.run(transport="stdio")
    return 0


if __name__ == "__main__":
    sys.exit(main())
