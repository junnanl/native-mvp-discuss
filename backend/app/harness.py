"""CowAgent（Evo-Harness）适配层。

方案 §1：管理层与执行层之间只有四个动作——装 skill、转发对话、查状态、启停。
接口越窄，换执行层代价越小，所以这里只做协议转换，不放业务逻辑。

事件类型取自仓库内的 `references/QwenPaw+cowagent/API_CALLING.md`：
delta / reasoning / phase / tool_start / tool_progress / tool_end /
message_end / file / image / done / cancelled / error。

方案 §6.7 的底线在这里落地：**执行进度必须绑真实事件**。我们把工具事件按原样
投影给前端，措辞可以美化，状态不许伪造；认不出的事件也照样送上去，不丢弃——
丢掉就等于前端在替 agent 编故事。
"""
import json
import os
from typing import AsyncIterator

import httpx

TERMINAL = {"done", "cancelled", "error"}
TOOL_EVENTS = {"tool_start", "tool_progress", "tool_end"}
KNOWN = TERMINAL | TOOL_EVENTS | {"delta", "reasoning", "phase", "message_end", "file", "image", "voice_attach"}

# 把工具名翻译成人话（方案 §6.7：这是必要的翻译，用户看不懂 tool_call: web_search）。
TOOL_LABELS = {
    "web_search": "检索资料",
    "search": "检索资料",
    "query_db": "查询业务数据",
    "show_chart": "生成图表",
    "show_table": "整理表格",
    "read_file": "读取文件",
    "write_file": "写入文件",
    "shell": "执行命令",
}


def endpoint(agent: dict | None = None) -> tuple[str, str | None]:
    """默认全部员工同一实例；员工上填了 harness_url 就用它（方案 §2）。"""
    base = (agent or {}).get("harness_url") or os.getenv("COWAGENT_BASE_URL", "http://127.0.0.1:19989")
    password = (agent or {}).get("harness_key") or os.getenv("COWAGENT_PASSWORD")
    return base.rstrip("/"), password


def label_for(tool: str) -> str:
    return TOOL_LABELS.get(tool, tool)


async def login(client: httpx.AsyncClient, base: str, password: str | None) -> None:
    """密码为空时服务端直接返回成功，仍然要走一遍以拿到 cookie。"""
    response = await client.post(f"{base}/auth/login", json={"password": password or ""})
    response.raise_for_status()


async def send(agent: dict, session_id: str, message: str) -> str:
    base, password = endpoint(agent)
    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        await login(client, base, password)
        response = await client.post(f"{base}/message",
                                     json={"session_id": session_id, "message": message, "stream": True, "lang": "zh"})
        response.raise_for_status()
        body = response.json()
    if body.get("status") == "error" or not body.get("request_id"):
        raise RuntimeError(body.get("message") or "CowAgent 未返回 request_id")
    return body["request_id"]


def project(raw: dict) -> dict:
    """把 CowAgent 的一条事件投影成前端要用的形状。

    只做翻译和归类，不添加任何 CowAgent 没说过的状态。
    """
    kind = str(raw.get("type") or "")
    if kind in TOOL_EVENTS:
        tool = str(raw.get("tool") or raw.get("name") or "tool")
        return {
            "type": kind,
            "tool": tool,
            "label": label_for(tool),
            "call_id": str(raw.get("tool_call_id") or raw.get("id") or tool),
            "detail": raw.get("content") or raw.get("progress") or raw.get("result") or "",
            "status": raw.get("status"),
        }
    if kind in KNOWN:
        return {"type": kind, "content": raw.get("content", ""), **(
            {"file_name": raw["file_name"]} if raw.get("file_name") else {})}
    # 认不出来的照样送上去，前端折叠显示。看得见才有人去补。
    return {"type": "unknown", "raw": raw}


async def stream(agent: dict, request_id: str) -> AsyncIterator[str]:
    base, password = endpoint(agent)
    async with httpx.AsyncClient(timeout=None, follow_redirects=True) as client:
        await login(client, base, password)
        async with client.stream("GET", f"{base}/stream", params={"request_id": request_id}) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.startswith("data:"):
                    continue
                try:
                    raw = json.loads(line[5:].strip())
                except json.JSONDecodeError:
                    continue
                yield "data: " + json.dumps(project(raw), ensure_ascii=False) + "\n\n"
                if raw.get("type") in TERMINAL:
                    return
