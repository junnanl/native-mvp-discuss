"""模型 API 直连（方案 §4 的四个调用点共用这一层）。

三条纪律：
1. 只做一次调用，没有 agent loop、没有工具——那是 CowAgent 的事（方案 §1）。
2. 拿不到合格结果就报错，**不许退回关键词匹配或默认值**。假的可用比明确的不可用更坏。
3. `response_format` 能不能用取决于内网模型（方案 §8 待验项），所以要能自动降级到
   纯提示词约束，并如实告诉调用方走了哪条路。
"""
import json
import os
import re
from typing import Any, Callable

import httpx

FENCE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.S)
OBJECT = re.compile(r"\{.*\}", re.S)


class ModelUnavailable(RuntimeError):
    """模型没返回能用的结果。调用方应当如实报错，不要编一个结果出来。"""


def config() -> dict[str, str]:
    return {
        "base_url": os.getenv("MODEL_BASE_URL", "http://127.0.0.1:9182/v1").rstrip("/"),
        "model": os.getenv("MODEL_NAME", "glm-5.3-flash"),
        "api_key": os.getenv("MODEL_API_KEY", ""),
    }


def extract_json(content: str) -> dict:
    """模型常把 JSON 裹在代码块或客套话里，这里只负责剥出来。"""
    for candidate in (FENCE.search(content), OBJECT.search(content)):
        if candidate:
            try:
                return json.loads(candidate.group(1) if candidate.re is FENCE else candidate.group(0))
            except json.JSONDecodeError:
                continue
    return json.loads(content)


async def _post(client: httpx.AsyncClient, messages: list[dict], *, use_response_format: bool) -> str:
    settings = config()
    payload: dict[str, Any] = {"model": settings["model"], "messages": messages, "temperature": 0}
    if use_response_format:
        payload["response_format"] = {"type": "json_object"}
    headers = {"Authorization": f"Bearer {settings['api_key']}"} if settings["api_key"] else {}
    response = await client.post(f"{settings['base_url']}/chat/completions", json=payload, headers=headers)
    response.raise_for_status()
    return response.json()["choices"][0]["message"]["content"]


async def structured(
    system: str,
    user: str,
    validate: Callable[[dict], tuple[Any, str | None]],
    attempts: int = 3,
) -> tuple[Any, dict]:
    """调模型拿结构化结果，校验不过就把错误喂回去重试。

    `validate` 返回 (值, None) 表示通过，(None, 错误说明) 表示要重试。
    """
    messages = [{"role": "system", "content": system}, {"role": "user", "content": user}]
    use_response_format = True
    failures: list[str] = []

    async with httpx.AsyncClient(timeout=60) as client:
        for attempt in range(1, attempts + 1):
            try:
                content = await _post(client, messages, use_response_format=use_response_format)
            except httpx.HTTPStatusError as error:
                # 很多内网服务只兼容基础 chat completions（方案 §8），降一档重来。
                if use_response_format and error.response.status_code in (400, 404, 422, 500):
                    use_response_format = False
                    failures.append(f"第 {attempt} 次：服务不接受 response_format，降级为提示词约束")
                    continue
                raise ModelUnavailable(f"模型调用失败：HTTP {error.response.status_code}") from error
            except httpx.HTTPError as error:
                raise ModelUnavailable(f"模型不可达：{error}") from error

            try:
                raw = extract_json(content)
            except json.JSONDecodeError:
                failures.append(f"第 {attempt} 次：返回的不是 JSON")
                messages.append({"role": "assistant", "content": content})
                messages.append({"role": "user", "content": "上一条不是合法 JSON。只输出 JSON 对象本身，不要解释、不要代码块。"})
                continue

            value, problem = validate(raw)
            if problem is None:
                return value, {
                    "attempts": attempt,
                    "schema_enforced": use_response_format,
                    "retries": failures,
                }
            failures.append(f"第 {attempt} 次：{problem}")
            messages.append({"role": "assistant", "content": json.dumps(raw, ensure_ascii=False)})
            messages.append({"role": "user", "content": f"上一条不符合要求：{problem}。请按要求重新输出 JSON。"})

    raise ModelUnavailable("模型连续 " + str(attempts) + " 次没给出合格结果：" + "；".join(failures))
