"""AI-native OA · 业务后端。

方案 §1：这一层是主体，不是转发层。业务逻辑、流程状态、表单定义、可见范围
都在这儿；代理 CowAgent 对话只是它很小的一个功能。
"""
import json
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from . import ai, db, forms, harness, repo, views

app = FastAPI(title="AI-native OA")


@app.on_event("startup")
def startup() -> None:
    db.init_schema()


# ---------- 身份 ----------
# 第一版不做鉴权（方案 §11）：前端登录后把用户 id 带在 header 里，
# 后端据此决定「看到什么」，但不做强制访问控制。

def current_user(x_user_id: int | None = Header(default=None)) -> dict:
    if x_user_id is None:
        raise HTTPException(status_code=401, detail="未登录")
    user = repo.get_user(x_user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="用户不存在")
    return user


class LoginRequest(BaseModel):
    name: str


@app.post("/api/auth/login")
def login(request: LoginRequest) -> dict:
    """按姓名登录。角色是 user 表里的数据，不是代码里的枚举——
    新流程要用「主管」「财务」这种角色时加一行用户即可，不改代码。"""
    user = repo.find_user(request.name.strip())
    if user is None:
        raise HTTPException(status_code=404, detail=f"没有叫「{request.name}」的用户")
    return {"user": user}


@app.get("/api/users")
def users() -> list[dict]:
    return repo.list_users()


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


# ---------- 定义（表单 / 流程 / 提示词建议） ----------

@app.get("/api/flows")
def flows() -> list[dict]:
    return repo.list_flow_defs()


@app.get("/api/flows/{flow_def_id}")
def flow(flow_def_id: int) -> dict:
    definition = repo.get_flow_def(flow_def_id)
    if definition is None:
        raise HTTPException(status_code=404, detail="流程定义不存在")
    return {**definition, "form": repo.form_of_flow(definition)}


@app.get("/api/forms")
def form_defs() -> list[dict]:
    return repo.list_form_defs()


@app.get("/api/forms/{form_id}")
def form_def(form_id: int) -> dict:
    found = repo.get_form_def(form_id)
    if found is None:
        raise HTTPException(status_code=404, detail="表单定义不存在")
    return found


@app.get("/api/prompt-suggestions")
def prompt_suggestions(page_key: str) -> list[dict]:
    return repo.list_prompt_suggestions(page_key)


# ---------- 流程实例 ----------

class FlowCreate(BaseModel):
    flow_def_id: int
    data: dict = {}
    visible_to: list = []


class FlowAdvance(BaseModel):
    data: dict = {}


def _node(definition: dict, key: str) -> tuple[int, dict]:
    for index, node in enumerate(definition["nodes"]):
        if node["key"] == key:
            return index, node
    raise HTTPException(status_code=409, detail=f"节点 {key} 不在流程定义中")


def _check_form_data(definition: dict, node: dict, data: dict) -> dict:
    """填单节点提交的数据必须过 form_def 校验。字段从定义来，不从代码来。"""
    if not node.get("form_id"):
        return data
    form = repo.get_form_def(node["form_id"])
    if form is None:
        raise HTTPException(status_code=409, detail=f"节点 {node['key']} 引用的表单 {node['form_id']} 不存在")
    cleaned, problem = forms.validate(form, data)
    if problem:
        raise HTTPException(status_code=422, detail=f"表单校验未通过：{problem}")
    return cleaned


def _state_after(definition: dict, index: int) -> dict:
    """走完第 index 个节点之后，实例处在什么状态。

    终点节点不需要人再点一次「完成」——推进到它就是完成了。
    """
    nodes = definition["nodes"]
    nxt = nodes[index + 1] if index + 1 < len(nodes) else None
    if nxt is None:
        return {"current_node": nodes[index]["key"], "status": "已完成", "finished_at": datetime.now(timezone.utc)}
    if nxt["type"] == "完成":
        return {"current_node": nxt["key"], "status": "已完成", "finished_at": datetime.now(timezone.utc)}
    return {"current_node": nxt["key"], "status": "进行中", "finished_at": None}


@app.post("/api/flow-instances")
def create_flow_instance(request: FlowCreate, user: dict = Depends(current_user)) -> dict:
    """提交表单 = 执行第一个节点。

    所以新实例直接停在**下一个**节点上，不会把「提交需求」又挂回提交人自己的待办。
    """
    definition = repo.get_flow_def(request.flow_def_id)
    if definition is None:
        raise HTTPException(status_code=404, detail="流程定义不存在")
    entry = repo.entry_node(definition)
    if entry.get("role") and entry["role"] != user["role"]:
        raise HTTPException(status_code=403, detail=f"「{entry['name']}」只能由{entry['role']}发起，当前角色是{user['role']}")
    data = _check_form_data(definition, entry, request.data)
    instance = repo.create_instance(request.flow_def_id, entry["key"], data, user["id"], request.visible_to)
    instance.update(_state_after(definition, 0))
    return repo.save_instance(instance)


@app.get("/api/flow-instances")
def list_flow_instances(flow_def_id: int | None = None, status: str | None = None,
                        mine: bool = False, user: dict = Depends(current_user)) -> list[dict]:
    found = repo.list_instances(flow_def_id=flow_def_id, status=status,
                                creator_id=user["id"] if mine else None)
    return [item for item in found if _visible(item, user)]


def _visible(instance: dict, user: dict) -> bool:
    """可见范围过滤（方案 §2）：空列表 = 所有人可见。过滤掉即可，不做强制访问控制。"""
    scope = instance.get("visible_to") or []
    if not scope:
        return True
    return user["role"] in scope or user["id"] in scope or instance["creator_id"] == user["id"]


@app.get("/api/flow-instances/{instance_id}")
def flow_instance(instance_id: int) -> dict:
    instance = repo.get_instance(instance_id)
    if instance is None:
        raise HTTPException(status_code=404, detail="流程实例不存在")
    return instance


@app.post("/api/flow-instances/{instance_id}/advance")
def advance_flow(instance_id: int, request: FlowAdvance, user: dict = Depends(current_user)) -> dict:
    instance = flow_instance(instance_id)
    definition = repo.get_flow_def(instance["flow_def_id"])
    if definition is None:
        raise HTTPException(status_code=409, detail="流程定义不存在")
    index, node = _node(definition, instance["current_node"])
    if instance["status"] == "已完成" or node["type"] == "完成":
        raise HTTPException(status_code=409, detail="流程已完成")
    if node.get("role") and node["role"] != user["role"]:
        raise HTTPException(status_code=403, detail=f"「{node['name']}」由{node['role']}处理，当前角色是{user['role']}")

    merged = {**instance["data"], **request.data}
    instance["data"] = _check_form_data(definition, node, merged) if node.get("form_id") else merged
    instance.update(_state_after(definition, index))
    return repo.save_instance(instance)


@app.get("/api/todos")
def todos(user: dict = Depends(current_user)) -> list[dict]:
    """待办 = 停在「该我处理的节点」上的实例。节点归谁由 flow_def 说了算。"""
    definitions = {item["id"]: item for item in repo.list_flow_defs()}
    items = []
    for instance in repo.list_instances(status="进行中"):
        definition = definitions.get(instance["flow_def_id"])
        if definition is None or not _visible(instance, user):
            continue
        node = next((n for n in definition["nodes"] if n["key"] == instance["current_node"]), None)
        if node is None or node.get("role") != user["role"]:
            continue
        items.append({
            "id": instance["id"],
            "title": _title(instance, definition),
            "kind": node["name"],
            "flow_name": definition["name"],
            "status": instance["status"],
            "created_at": instance["created_at"].isoformat(),
        })
    return items


def _title(instance: dict, definition: dict) -> str:
    """列表标题取表单第一个文本字段的值，取不到就用流程名。"""
    form = repo.form_of_flow(definition)
    if form:
        for field in form["fields"]:
            value = instance["data"].get(field["key"])
            if field.get("type") in forms.TEXT_TYPES and value:
                return str(value)
    return f'{definition["name"]} #{instance["id"]}'


# ---------- AI 调用点 ----------

class TextRequest(BaseModel):
    text: str


class FillFormRequest(BaseModel):
    text: str
    flow_def_id: int


@app.post("/api/ai/dispatch")
async def dispatch(request: TextRequest) -> dict:
    """方案 §4 #1：三选一路由。唯一入口靠它成立——用户说什么都行，系统找对人。

    输入必须带上「有哪些员工、各自能干什么」和「有哪些流程」，否则模型没法选。
    """
    agents = repo.list_agents(status="已上线")
    flows_available = repo.list_flow_defs()
    agent_ids = {item["id"] for item in agents}
    flow_ids = {item["id"] for item in flows_available}

    def validate(raw: dict) -> tuple[dict | None, str | None]:
        route = raw.get("route")
        if route not in {"agent", "fill_form", "view"}:
            return None, "route 只能是 agent、fill_form、view 三者之一"
        if route == "agent":
            if raw.get("agent_id") not in agent_ids:
                return None, f"agent_id 必须是这些已上线员工之一：{sorted(agent_ids) or '（当前没有已上线员工，不能选 agent）'}"
            return {"route": route, "agent_id": raw["agent_id"]}, None
        if route == "fill_form":
            if raw.get("flow_def_id") not in flow_ids:
                return None, f"flow_def_id 必须是这些流程之一：{sorted(flow_ids)}"
            return {"route": route, "flow_def_id": raw["flow_def_id"]}, None
        return {"route": route}, None

    agent_lines = "\n".join(f'- id={a["id"]} {a["name"]}：{a["description"]}' for a in agents) or "（当前没有已上线的数字员工）"
    flow_lines = "\n".join(f'- flow_def_id={f["id"]} {f["name"]}' for f in flows_available)
    system = (
        "你是企业 OA 的调度器。判断用户这句话该走哪条路，只输出 JSON。\n"
        "- 想让某个数字员工干活 → {\"route\":\"agent\",\"agent_id\":数字}\n"
        "- 想发起/提交一件事（提需求、报销等）→ {\"route\":\"fill_form\",\"flow_def_id\":数字}\n"
        "- 想查看已有数据 → {\"route\":\"view\"}\n\n"
        f"已上线的数字员工：\n{agent_lines}\n\n可发起的流程：\n{flow_lines}"
    )
    try:
        value, meta = await ai.structured(system, request.text, validate)
    except ai.ModelUnavailable as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    return {**value, "_model": meta}


@app.post("/api/ai/fill-form")
async def fill_form(request: FillFormRequest) -> dict:
    """方案 §4 #2：填表单。字段来自 form_def，代码里一个字段名都没有。"""
    definition = repo.get_flow_def(request.flow_def_id)
    if definition is None:
        raise HTTPException(status_code=404, detail="流程定义不存在")
    form = repo.form_of_flow(definition)
    if form is None:
        raise HTTPException(status_code=409, detail=f"流程「{definition['name']}」没有配填单节点的表单")

    system = (
        f"根据用户的话填写《{form['name']}》，只输出 JSON 对象，键用下面给的英文 key。\n"
        f"字段：\n{forms.describe(form)}\n"
        "拿不准的选填字段留空或省略；不要编造用户没提到的事实。"
    )
    try:
        value, meta = await ai.structured(system, request.text, lambda raw: forms.validate(form, raw))
    except ai.ModelUnavailable as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    return {"flow_def_id": definition["id"], "form": form, "values": value, "_model": meta}


@app.post("/api/ai/resolve-view")
async def resolve_view(request: TextRequest, user: dict = Depends(current_user)) -> dict:
    """方案 §4 #3：把人话翻译成「看哪个视图、什么条件」。

    它**不查数据**——真正取数由组件自己调 `/api/views/{key}`，翻页排序不过模型。
    原名叫 query 会误导实现者做成「每次翻页都过模型」，所以改了名。
    """
    specs = views.registry()
    keys = {spec["key"] for spec in specs}

    def validate(raw: dict) -> tuple[dict | None, str | None]:
        key = raw.get("view")
        if key not in keys:
            return None, f"view 必须是清单里的 key 之一：{sorted(keys)}"
        spec = next(item for item in specs if item["key"] == key)
        query = raw.get("query") or {}
        if not isinstance(query, dict):
            return None, "query 必须是对象"
        unknown = set(query) - set(spec["filters"])
        if unknown:
            return None, f'{key} 只支持这些筛选：{spec["filters"] or "（无）"}，不认识 {sorted(unknown)}'
        return {"view": key, "component": spec["component"], "title": spec["title"], "query": query}, None

    system = (
        "把用户的话翻译成「看哪个视图、什么筛选条件」，只输出 JSON："
        '{"view":"清单里的 key","query":{筛选条件}}。\n'
        "不要自己造数据，也不要造清单里没有的 key。没有筛选条件就给空对象。\n\n"
        f"可用视图：\n{views.describe(specs)}"
    )
    try:
        value, meta = await ai.structured(system, request.text, validate)
    except ai.ModelUnavailable as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    return {**value, "_model": meta}


@app.get("/api/views")
def view_registry() -> list[dict]:
    return views.registry()


@app.get("/api/views/{key:path}")
def view_data(key: str, page: int = 1, user: dict = Depends(current_user), request: Request = None) -> dict:
    """组件自己来取数：翻页、筛选都走这里，不经过模型。"""
    query = {name: value for name, value in (request.query_params.items() if request else []) if name != "page"}
    try:
        return views.resolve(key, query, max(page, 1), user)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"没有名为 {key} 的视图")


class SkillDraftRequest(BaseModel):
    flow_instance_id: int


@app.post("/api/ai/skill-draft")
async def skill_draft(request: SkillDraftRequest) -> dict:
    """方案 §4 #4：按需求单内容生成 SKILL.md 草稿，给开发当起点。"""
    instance = flow_instance(request.flow_instance_id)
    definition = repo.get_flow_def(instance["flow_def_id"])
    form = repo.form_of_flow(definition) if definition else None
    described = "\n".join(
        f'{field["label"]}：{instance["data"].get(field["key"], "")}'
        for field in (form["fields"] if form else [])
    ) or str(instance["data"])

    def validate(raw: dict) -> tuple[dict | None, str | None]:
        text = (raw.get("skill_md") or "").strip()
        if len(text) < 40:
            return None, "skill_md 太短，至少要有职责说明和执行步骤"
        if "#" not in text:
            return None, "skill_md 要是 markdown，至少有一个标题"
        return {"skill_md": text}, None

    system = (
        "根据需求单写一份数字员工的 SKILL.md 草稿，只输出 JSON："
        '{"skill_md":"markdown 全文"}。\n'
        "包含：这个员工负责什么、可用什么信息、按什么步骤干活、什么情况下要找人确认。\n"
        "这是给开发改的草稿，不要写空话。"
    )
    try:
        value, meta = await ai.structured(system, described, validate)
    except ai.ModelUnavailable as error:
        raise HTTPException(status_code=502, detail=str(error)) from error
    return {**value, "_model": meta}


# ---------- 数字员工 ----------

class AgentCreate(BaseModel):
    name: str
    description: str = ""
    category: str = "业务支撑"
    avatar: str | None = None
    maturity: str | None = None
    tags: list = []
    quick_questions: list = []
    capabilities: list = []
    skill_md: str | None = None
    flow_instance_id: int | None = None
    visible_to: list = []


@app.get("/api/agents")
def agents(status: str | None = None, user: dict = Depends(current_user)) -> list[dict]:
    """没有员工就是空列表。不返回演示数据——空状态是真相，假卡片不是。"""
    found = repo.list_agents(status=status)
    return [agent for agent in found
            if not agent["visible_to"] or user["role"] in agent["visible_to"] or user["id"] in agent["visible_to"]]


@app.get("/api/agents/{agent_id}")
def agent_detail(agent_id: int) -> dict:
    found = repo.get_agent(agent_id)
    if found is None:
        raise HTTPException(status_code=404, detail="数字员工不存在")
    return found


@app.post("/api/agents")
def create_agent(request: AgentCreate, user: dict = Depends(current_user)) -> dict:
    return repo.create_agent({**request.model_dump(), "status": "草稿"})


class SkillSave(BaseModel):
    skill_md: str


@app.put("/api/agents/{agent_id}/skill")
def save_skill(agent_id: int, request: SkillSave, user: dict = Depends(current_user)) -> dict:
    agent_detail(agent_id)
    return repo.update_agent(agent_id, skill_md=request.skill_md, status="开发中")


class PublishRequest(BaseModel):
    flow_instance_id: int


@app.post("/api/agents/{agent_id}/publish")
def publish_agent(agent_id: int, request: PublishRequest, user: dict = Depends(current_user)) -> dict:
    """上线必须有一条走完的流程兜着。

    第一条流程就是「数字员工的申请上线」（方案 §0）——留一条不走流程直接上线的
    近路，等于把这个产品要验证的东西本身架空了。
    """
    agent = agent_detail(agent_id)
    instance = repo.get_instance(request.flow_instance_id)
    if instance is None:
        raise HTTPException(status_code=404, detail="关联的流程实例不存在")
    if instance["status"] != "已完成":
        raise HTTPException(status_code=409, detail="关联流程尚未走完，不能上线")
    if not agent["skill_md"]:
        raise HTTPException(status_code=409, detail="还没有提交 skill 内容，不能上线")
    return repo.update_agent(agent_id, status="已上线", flow_instance_id=request.flow_instance_id)


@app.post("/api/agents/{agent_id}/disable")
def disable_agent(agent_id: int, user: dict = Depends(current_user)) -> dict:
    agent_detail(agent_id)
    return repo.update_agent(agent_id, status="已下线")


@app.get("/api/stats")
def stats() -> dict:
    return repo.stats()


# ---------- 数字员工对话（代理到 CowAgent） ----------

class ChatRequest(BaseModel):
    message: str
    session_id: str


@app.post("/api/agent/{agent_id}/chat")
async def agent_chat(agent_id: int, request: ChatRequest) -> dict:
    agent = agent_detail(agent_id)
    try:
        request_id = await harness.send(agent, request.session_id, request.message)
    except Exception as error:
        raise HTTPException(status_code=502, detail=f"CowAgent 不可用：{error}") from error
    repo.bump_agent_usage(agent_id)
    return {"agent_id": agent_id, "session_id": request.session_id, "request_id": request_id}


@app.get("/api/agent/{agent_id}/stream/{request_id}")
async def agent_stream(agent_id: int, request_id: str) -> StreamingResponse:
    agent = agent_detail(agent_id)

    async def events():
        try:
            async for chunk in harness.stream(agent, request_id):
                yield chunk
        except Exception as error:  # 连不上也要让前端看见，不要静默断流
            yield "data: " + json.dumps({"type": "error", "content": f"执行流中断：{error}"}, ensure_ascii=False) + "\n\n"

    return StreamingResponse(events(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


class DuplicateCheckRequest(BaseModel):
    flow_instance_id: int


@app.post("/api/ai/duplicate-check")
async def duplicate_check(request: DuplicateCheckRequest) -> dict:
    """重复建设检测（方案 §6.6 图谱用法一），给评审用。

    第一版不上向量检索——让模型直接判断这个新需求跟哪几个已有员工像，结果是给人
    看的，人自己会判断。

    ⚠️ 这是方案 §4 那张「四个调用点」表之外的第五处模型调用。已在
    docs/实施进度.md 记录，按 AGENTS.md §1 先说再改。
    """
    instance = flow_instance(request.flow_instance_id)
    definition = repo.get_flow_def(instance["flow_def_id"])
    form = repo.form_of_flow(definition) if definition else None
    described = "\n".join(
        f'{field["label"]}：{instance["data"].get(field["key"], "")}'
        for field in (form["fields"] if form else [])
    ) or str(instance["data"])

    existing = [agent for agent in repo.list_agents() if agent["status"] in {"已上线", "开发中"}]
    known = {agent["id"] for agent in existing}
    if not existing:
        return {"component": "graph", "title": "重复建设检测",
                "nodes": [{"id": "req", "label": "本需求", "type": "需求"}], "edges": [],
                "note": "目前没有已有员工可比对。"}

    def validate(raw: dict) -> tuple[dict | None, str | None]:
        matches = raw.get("matches")
        if not isinstance(matches, list):
            return None, "matches 必须是数组"
        cleaned = []
        for item in matches:
            if not isinstance(item, dict) or item.get("agent_id") not in known:
                return None, f'agent_id 必须是这些之一：{sorted(known)}'
            weight = item.get("weight")
            if not isinstance(weight, (int, float)) or not 0 <= weight <= 1:
                return None, "weight 必须是 0 到 1 之间的数"
            cleaned.append({"agent_id": item["agent_id"], "weight": float(weight),
                            "reason": str(item.get("reason", ""))})
        return {"matches": cleaned}, None

    listing = "\n".join(f'- id={agent["id"]} {agent["name"]}：{agent["description"]}' for agent in existing)
    system = (
        "判断这个新需求跟哪些已有数字员工在做的事情重合，只输出 JSON："
        '{"matches":[{"agent_id":数字,"weight":0到1的相似度,"reason":"一句话说明"}]}。\n'
        "不重合就返回空数组。不要编造清单以外的 id。\n\n"
        f"已有的数字员工：\n{listing}"
    )
    try:
        value, meta = await ai.structured(system, described, validate)
    except ai.ModelUnavailable as error:
        raise HTTPException(status_code=502, detail=str(error)) from error

    by_id = {agent["id"]: agent for agent in existing}
    nodes = [{"id": "req", "label": "本需求", "type": "需求"}]
    edges = []
    for match in value["matches"]:
        agent = by_id[match["agent_id"]]
        nodes.append({"id": f'agent:{agent["id"]}', "label": agent["name"], "type": "已有员工"})
        edges.append({"source": "req", "target": f'agent:{agent["id"]}',
                      "label": f'{int(match["weight"] * 100)}%', "weight": match["weight"]})
    return {"component": "graph", "title": "重复建设检测", "nodes": nodes, "edges": edges,
            "note": "、".join(m["reason"] for m in value["matches"]) or "没有发现明显重合。",
            "_model": meta}
