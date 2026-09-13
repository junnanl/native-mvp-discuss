import json
import os
from typing import Literal

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from . import db

app = FastAPI(title="AI-native OA")

with open(os.path.join(os.path.dirname(__file__), "definitions.json"), encoding="utf-8") as definitions_file:
    DEFINITIONS = json.load(definitions_file)
FLOW_DEFS = DEFINITIONS["flows"]
FORM_DEFS = DEFINITIONS["forms"]
FLOW_INSTANCES: dict[int, dict[str, object]] = {}


def configured_flows() -> list[dict[str, object]]:
    with db.connection() as conn:
        rows = conn.execute("SELECT id,name,nodes FROM flow_def ORDER BY id").fetchall()
    return [{"id": row[0], "name": row[1], "nodes": row[2]} for row in rows] or FLOW_DEFS


@app.on_event("startup")
def startup() -> None:
    db.init_schema(DEFINITIONS)


class FlowAdvance(BaseModel):
    actor_role: str
    data: dict[str, object] = {}


class FlowCreate(BaseModel):
    flow_def_id: int = 1
    data: dict[str, object] = {}


class FillFormRequest(BaseModel):
    text: str


class RequirementForm(BaseModel):
    name: str
    level: Literal["高", "中", "低"]
    description: str


class FillFormResponse(BaseModel):
    form: RequirementForm
    source: Literal["model", "fallback"]


class AgentChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class DispatchRequest(BaseModel):
    text: str


class ResolveViewRequest(BaseModel):
    text: str


class SkillDraftRequest(BaseModel):
    requirement: dict[str, object]


class AnalysisRequest(BaseModel):
    table: Literal["flow_instance", "agent"]


class AgentCreate(BaseModel):
    name: str
    description: str = ""
    category: str = "业务支撑"
    skill_md: str | None = None
    status: str = "草稿"
    flow_instance_id: int | None = None


class LoginRequest(BaseModel):
    name: str
    role: Literal["使用者", "提需求", "评审", "开发"]


async def cow_login(client: httpx.AsyncClient, base_url: str, password: str | None) -> httpx.Cookies:
    cookies = httpx.Cookies()
    if password is None:
        return cookies
    response = await client.post(f"{base_url}/auth/login", json={"password": password})
    response.raise_for_status()
    cookies.update(response.cookies)
    return cookies


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/auth/login")
def login(request: LoginRequest) -> dict[str, object]:
    with db.connection() as conn:
        row = conn.execute("SELECT id,name,role FROM \"user\" WHERE name=%s AND role=%s", (request.name, request.role)).fetchone()
        if row is None:
            row = conn.execute("INSERT INTO \"user\" (name,role) VALUES (%s,%s) RETURNING id,name,role", (request.name, request.role)).fetchone()
        conn.commit()
    return {"user": {"id": row[0], "name": row[1], "role": row[2]}}


@app.get("/api/stats")
def stats() -> dict[str, int]:
    with db.connection() as conn:
        online = conn.execute("SELECT count(*) FROM agent WHERE status='已上线'").fetchone()[0]
        completed = conn.execute("SELECT count(*) FROM flow_instance WHERE status='已完成'").fetchone()[0]
        added = conn.execute("SELECT count(*) FROM agent").fetchone()[0]
    return {"online_agents": online, "completed_today": completed, "new_this_month": added}


@app.get("/api/components")
def components() -> list[dict[str, object]]:
    return [
        {"component": "metric", "description": "单值指标", "params": ["value", "title", "change"]},
        {"component": "chart", "description": "趋势与比较", "params": ["type", "series"]},
        {"component": "table", "description": "明细表格", "params": ["columns", "rows", "page"]},
        {"component": "graph", "description": "关系图谱", "params": ["nodes", "edges"]},
        {"component": "text", "description": "叙述文本", "params": ["markdown"]},
    ]


@app.post("/api/analysis/query")
def analysis_query(request: AnalysisRequest) -> dict[str, object]:
    allowed = {"flow_instance": "SELECT id, flow_def_id, current_node, status, data FROM flow_instance ORDER BY id", "agent": "SELECT id, name, category, status, usage_count FROM agent ORDER BY id"}
    with db.connection() as conn:
        cursor = conn.execute(allowed[request.table])
        rows = cursor.fetchall()
        columns = [description.name for description in cursor.description]
    return {"table": request.table, "columns": columns, "rows": [list(row) for row in rows]}


@app.post("/api/ai/fill-form", response_model=FillFormResponse)
async def fill_form(request: FillFormRequest) -> FillFormResponse:
    base_url = os.getenv("MODEL_BASE_URL", "http://127.0.0.1:9182/v1").rstrip("/")
    model = os.getenv("MODEL_NAME", "glm-5.3-flash")
    fields = FORM_DEFS[0]["fields"]
    field_hint = "、".join(f["key"] for f in fields)
    payload = {"model": model, "messages": [{"role": "system", "content": f"只输出 JSON，字段为 {field_hint}；level 只能是高、中、低。"}, {"role": "user", "content": request.text}], "response_format": {"type": "json_object"}, "temperature": 0}
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(f"{base_url}/chat/completions", json=payload)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            return FillFormResponse(form=RequirementForm.model_validate(json.loads(content)), source="model")
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"模型填表失败：{exc}") from exc


@app.post("/api/ai/dispatch")
def dispatch(request: DispatchRequest) -> dict[str, object]:
    text = request.text.strip()
    if any(word in text for word in ("员工", "助手", "帮我干")):
        return {"route": "agent", "agent_id": 1}
    if any(word in text for word in ("提需求", "提个需求", "需求单", "申请")):
        return {"route": "fill_form"}
    return {"route": "view", "component": "table", "query": {}}


@app.post("/api/ai/resolve-view")
def resolve_view(request: ResolveViewRequest) -> dict[str, object]:
    text = request.text
    if any(word in text for word in ("多少", "数量", "指标")):
        return {"component": "metric", "query": {"text": text}, "data": {"title": "当前需求数", "value": len(db.list_instances())}}
    if any(word in text for word in ("趋势", "变化", "增长")):
        return {"component": "chart", "query": {"text": text}, "data": {"type": "bar", "series": [{"name": "需求", "data": [3, 5, 4, 8]}]}}
    if any(word in text for word in ("关系", "关联", "地图")):
        return {"component": "graph", "query": {"text": text}, "data": {"nodes": [{"id": "flow", "label": "需求流程"}, {"id": "agent", "label": "数字员工"}], "edges": [{"source": "flow", "target": "agent", "label": "产生"}]}}
    return {"component": "table", "query": {"text": text}, "data": {"columns": ["需求名称", "状态"], "rows": [{"需求名称": row["data"].get("name", "未命名"), "状态": row["status"]} for row in db.list_instances()]}}


@app.post("/api/ai/skill-draft")
def skill_draft(request: SkillDraftRequest) -> dict[str, str]:
    requirement = request.requirement
    name = requirement.get("name", "未命名数字员工")
    description = requirement.get("description", "")
    return {"skill_md": f"---\nname: {name}\ndescription: {description}\n---\n\n# 执行步骤\n\n1. 根据用户输入完成任务。"}


@app.post("/api/agent/{agent_id}/chat")
async def agent_chat(agent_id: int, request: AgentChatRequest) -> dict[str, object]:
    base_url = os.getenv("COWAGENT_BASE_URL", "http://127.0.0.1:19989").rstrip("/")
    token = os.getenv("COWAGENT_TOKEN")
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    payload = {"session_id": request.session_id, "message": request.message, "stream": True}
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            cookies = await cow_login(client, base_url, os.getenv("COWAGENT_PASSWORD"))
            response = await client.post(f"{base_url}/message", json=payload, headers=headers, cookies=cookies)
            response.raise_for_status()
            body = response.json()
            return {"agent_id": agent_id, "request_id": body.get("request_id"), "session_id": request.session_id}
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"CowAgent 不可用：{exc}") from exc


@app.get("/api/agent/{agent_id}/stream/{request_id}")
async def agent_stream(agent_id: int, request_id: str) -> StreamingResponse:
    base_url = os.getenv("COWAGENT_BASE_URL", "http://127.0.0.1:19989").rstrip("/")
    password = os.getenv("COWAGENT_PASSWORD")

    async def events():
        async with httpx.AsyncClient(timeout=None) as client:
            cookies = await cow_login(client, base_url, password)
            async with client.stream("GET", f"{base_url}/stream", params={"request_id": request_id}, cookies=cookies) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    yield f"{line}\n"

    return StreamingResponse(events(), media_type="text/event-stream")


@app.get("/api/agents")
def agents() -> list[dict[str, object]]:
    try:
        with db.connection() as conn:
            rows = conn.execute("SELECT id,name,description,category,usage_count,status FROM agent WHERE status='已上线' ORDER BY id").fetchall()
        if rows: return [{"id": r[0], "name": r[1], "description": r[2], "category": r[3], "usage_count": r[4], "status": r[5]} for r in rows]
    except Exception:
        pass
    return [
        {"id": 1, "name": "合同解析助手", "description": "提取合同关键信息并生成结构化结果", "category": "业务支撑", "usage_count": 0, "demo": True},
        {"id": 2, "name": "数据分析助手", "description": "查询业务数据，生成图表和分析结论", "category": "数据分析", "usage_count": 0, "demo": True},
        {"id": 3, "name": "制度问答助手", "description": "回答制度与流程相关问题", "category": "知识服务", "usage_count": 0, "demo": True},
    ]


@app.post("/api/agents")
def create_agent(request: AgentCreate) -> dict[str, object]:
    data = request.model_dump()
    flow_instance_id = data.pop('flow_instance_id', None)
    agent = db.create_agent(data)
    if flow_instance_id is not None:
        db.update_agent(agent['id'], flow_instance_id=flow_instance_id)
        agent['flow_instance_id'] = flow_instance_id
    return agent


@app.get("/api/agents/{agent_id}")
def get_agent(agent_id: int) -> dict[str, object]:
    with db.connection() as conn:
        row = conn.execute("SELECT id,name,description,category,status,skill_md,usage_count FROM agent WHERE id=%s", (agent_id,)).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="数字员工不存在")
    return {"id": row[0], "name": row[1], "description": row[2], "category": row[3], "status": row[4], "skill_md": row[5], "usage_count": row[6]}


@app.put("/api/agents/{agent_id}/skill")
def save_agent_skill(agent_id: int, payload: dict[str, str]) -> dict[str, object]:
    return db.update_agent(agent_id, skill_md=payload.get('skill_md', ''), status=payload.get('status', '待评审')) or {}


@app.post("/api/agents/{agent_id}/publish")
def publish_agent(agent_id: int, payload: dict[str, int] | None = None) -> dict[str, object]:
    instance_id = (payload or {}).get('flow_instance_id')
    if instance_id is not None:
        instance = db.get_instance(instance_id)
        if instance is None or instance['status'] != '已完成':
            raise HTTPException(status_code=409, detail='关联流程尚未完成')
    return db.update_agent(agent_id, status='已上线', flow_instance_id=instance_id) or {}


@app.post("/api/agents/{agent_id}/disable")
def disable_agent(agent_id: int) -> dict[str, object]:
    return db.update_agent(agent_id, status='已下线') or {}


@app.get("/api/todos")
def todos(role: str = "使用者") -> list[dict[str, object]]:
    items = []
    for instance in db.list_instances():
        definition = next((d for d in configured_flows() if d['id'] == instance['flow_def_id']), None)
        if not definition or instance['status'] == '已完成':
            continue
        node = next((n for n in definition['nodes'] if n['key'] == instance['current_node']), None)
        if node and node.get('role') == role:
            items.append({'id': instance['id'], 'title': instance['data'].get('name', definition['name']),
                          'kind': node['name'], 'owner': '', 'status': instance['status']})
    return items


@app.get("/api/flows")
def flows() -> list[dict[str, object]]:
    with db.connection() as conn:
        rows = conn.execute("SELECT id,name,nodes FROM flow_def ORDER BY id").fetchall()
    return [{"id": row[0], "name": row[1], "nodes": row[2]} for row in rows] or FLOW_DEFS


@app.get("/api/forms")
def forms() -> list[dict[str, object]]:
    with db.connection() as conn:
        rows = conn.execute("SELECT id,name,fields FROM form_def ORDER BY id").fetchall()
    return [{"id": row[0], "name": row[1], "fields": row[2]} for row in rows] or FORM_DEFS


@app.post("/api/flow-instances")
def create_flow_instance(request: FlowCreate) -> dict[str, object]:
    definition = next((item for item in configured_flows() if item["id"] == request.flow_def_id), None)
    if definition is None:
        raise HTTPException(status_code=404, detail="流程定义不存在")
    instance = db.create_instance(request.flow_def_id, request.data)
    instance["current_node"] = definition["nodes"][0]["key"]
    db.update_instance(instance)
    return instance


@app.get("/api/flow-instances/{instance_id}")
def flow_instance(instance_id: int) -> dict[str, object]:
    instance = db.get_instance(instance_id)
    if instance is None:
        raise HTTPException(status_code=404, detail="流程实例不存在")
    return instance


@app.post("/api/flow-instances/{instance_id}/advance")
def advance_flow(instance_id: int, request: FlowAdvance) -> dict[str, object]:
    instance = flow_instance(instance_id)
    definition = next((item for item in configured_flows() if item['id'] == instance['flow_def_id']), None)
    if definition is None:
        raise HTTPException(status_code=409, detail="流程定义不存在")
    nodes = definition['nodes']
    index = next((i for i, node in enumerate(nodes) if node["key"] == instance["current_node"]), None)
    if index is None:
        raise HTTPException(status_code=409, detail="当前节点不在流程定义中")
    if instance['status'] == '已完成' or nodes[index]['type'] == '完成':
        raise HTTPException(status_code=409, detail="流程已完成")
    current = nodes[index]
    if current.get("role") and current["role"] != request.actor_role:
        raise HTTPException(status_code=403, detail="当前角色不能推进此节点")
    instance["data"] = {**instance.get("data", {}), **request.data}
    if index + 1 >= len(nodes):
        instance["status"] = "已完成"
    else:
        instance["current_node"] = nodes[index + 1]["key"]
        instance["status"] = "已完成" if nodes[index + 1]['type'] == '完成' else "进行中"
    db.update_instance(instance)
    return instance
