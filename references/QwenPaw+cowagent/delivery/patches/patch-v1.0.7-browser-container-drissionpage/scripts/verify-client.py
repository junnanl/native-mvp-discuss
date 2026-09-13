#!/usr/bin/env python3
"""browser-dp 补丁验收客户端：stdio MCP 握手 + 冒烟动作。

在基线镜像容器内运行（docker run --add-host host.docker.internal:host-gateway），
经宿主机 loopback 连接浏览器容器 CDP。
"""
import asyncio
import json
import os
import sys

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

FAILURES = []


def check(name: str, ok: bool, detail: str = "") -> None:
    tag = "PASS" if ok else "FAIL"
    print(f"[{tag}] {name}" + (f" :: {detail}" if detail else ""), flush=True)
    if not ok:
        FAILURES.append(name)


def unwrap(raw: str) -> dict:
    return json.loads(raw)


async def run_checks() -> None:
    address = os.environ.get("DP_BROWSER_ADDRESS", "browser:9222")
    params = StdioServerParameters(
        command="/opt/cowagent-offline/toolpacks/mcp/browser-dp/bin/browser-dp",
        args=[],
        env={
            "DP_BROWSER_ADDRESS": address,
            "PATH": "/usr/local/bin:/usr/bin:/bin",
        },
    )
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            init = await session.initialize()
            server_name = init.serverInfo.name if init.serverInfo else "?"
            check("mcp-handshake", server_name == "browser-dp", f"server={server_name}")

            tools = await session.list_tools()
            names = sorted(t.name for t in tools.tools)
            check("tool-discovery",
                  names == ["browser_exec", "browser_run", "browser_screenshot", "browser_snapshot"],
                  ",".join(names))

            health = unwrap((await session.call_tool("browser_run",
                              {"action": "health_check"})).content[0].text)
            check("browser-cdp", health.get("ok") and health["data"].get("cdp_alive"),
                  str(health.get("data", health.get("error")))[:200])

            goto = unwrap((await session.call_tool("browser_run", {
                "action": "goto",
                "params": {"url": "data:text/html,<title>dp-verify</title><button id='b1'>点我</button>"},
            })).content[0].text)
            check("goto-data-url", goto.get("ok") and goto["data"].get("connected"),
                  str(goto.get("data", goto.get("error")))[:200])

            snap = unwrap((await session.call_tool("browser_snapshot", {})).content[0].text)
            refs = [e.get("ref") for e in snap.get("data", {}).get("elements", [])]
            check("snapshot-elements", snap.get("ok") and len(refs) >= 1,
                  f"refs={refs[:5]}")

            if refs:
                clicked = unwrap((await session.call_tool("browser_run", {
                    "action": "click", "params": {"ref": refs[0]},
                })).content[0].text)
                check("click-by-ref", clicked.get("ok"), str(clicked)[:200])

            js = unwrap((await session.call_tool("browser_run", {
                "action": "run_js", "params": {"script": "return document.title;"},
            })).content[0].text)
            check("run-js", js.get("ok") and js["data"].get("result") == "dp-verify",
                  str(js.get("data", js.get("error")))[:200])

            shot = unwrap((await session.call_tool("browser_screenshot", {})).content[0].text)
            b64 = (shot.get("data") or {}).get("base64", "")
            check("screenshot", shot.get("ok") and len(b64) > 500,
                  f"base64_len={len(b64)}")

            info2 = unwrap((await session.call_tool("browser_run", {
                "action": "page_info",
            })).content[0].text)
            check("page-info", info2.get("ok") and info2["data"].get("title") == "dp-verify",
                  str(info2.get("data", info2.get("error")))[:200])

            guard = unwrap((await session.call_tool("browser_exec", {
                "code": "import os",
            })).content[0].text)
            check("exec-guard", not guard.get("ok"), str(guard.get("error"))[:120])

            exec_ok = unwrap((await session.call_tool("browser_exec", {
                "code": "result = page.url",
            })).content[0].text)
            check("exec-escape-hatch", exec_ok.get("ok") and "data:" in str(exec_ok["data"].get("result")),
                  str(exec_ok.get("data", exec_ok.get("error")))[:200])


def main() -> int:
    asyncio.run(run_checks())
    print(f"failures={len(FAILURES)}")
    return 1 if FAILURES else 0


if __name__ == "__main__":
    sys.exit(main())
