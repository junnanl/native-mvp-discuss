"""由 form_def.fields 动态生成校验模型。

方案 §4「结构化输出的三层防线」的第 2 层。关键不是校格式，是**校业务值**：
`level` 只能是 form_def 里列的那几个选项，AI 返回「特急」必须被拦下。

这里一个字段名都不许写死——写死了就等于把表单定义搬回代码里。
"""
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, ValidationError, create_model

TEXT_TYPES = {"text", "textarea"}


class FormDefinitionError(ValueError):
    """表单定义本身有问题（例如 select 没给 options）。"""


def _python_type(field: dict) -> Any:
    kind = field.get("type", "text")
    if kind == "select":
        options = field.get("options") or []
        if not options:
            raise FormDefinitionError(f"字段 {field.get('key')} 是 select 但没有 options")
        return Literal[tuple(options)]
    if kind == "number":
        return float
    if kind in TEXT_TYPES or kind == "date":
        return str
    raise FormDefinitionError(f"字段 {field.get('key')} 的类型 {kind} 不支持")


def build_model(form: dict) -> type[BaseModel]:
    """把一张 form_def 变成一个 Pydantic 模型。"""
    definitions: dict[str, Any] = {}
    for field in form["fields"]:
        annotation = _python_type(field)
        if field.get("required"):
            definitions[field["key"]] = (annotation, ...)
        else:
            definitions[field["key"]] = (Optional[annotation], None)
    return create_model(
        f"Form{form['id']}",
        __config__=ConfigDict(extra="ignore"),
        **definitions,
    )


def json_schema(form: dict) -> dict:
    """给模型的 response_format 用（三层防线第 1 层）。"""
    return build_model(form).model_json_schema()


def describe(form: dict) -> str:
    """给提示词用的字段说明。模型不支持 schema 时，这是唯一的约束来源。"""
    lines = []
    for field in form["fields"]:
        parts = [f'{field["key"]}（{field["label"]}）']
        if field.get("type") == "select":
            parts.append("只能取：" + "、".join(field.get("options", [])))
        elif field.get("type") == "number":
            parts.append("数字")
        elif field.get("type") == "date":
            parts.append("日期，格式 YYYY-MM-DD")
        parts.append("必填" if field.get("required") else "选填")
        lines.append("- " + "，".join(parts))
    return "\n".join(lines)


def validate(form: dict, data: dict) -> tuple[dict | None, str | None]:
    """校验一份表单数据。

    返回 (清洗后的数据, None) 或 (None, 给模型看的错误说明)。
    错误说明会原样喂回模型作为重试提示——所以要写成人和模型都看得懂的话。
    """
    try:
        return build_model(form)(**data).model_dump(), None
    except ValidationError as error:
        return None, "；".join(
            f'{".".join(str(part) for part in item["loc"])} {item["msg"]}'
            for item in error.errors()
        )
