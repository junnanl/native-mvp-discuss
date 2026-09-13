"""AI-native OA · 业务后端。

方案 §1：这一层是主体，不是转发层。业务逻辑、流程状态、表单定义、可见范围
都在这儿；代理 CowAgent 对话只是它很小的一个功能。
"""
from datetime import datetime, timezone

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel

from . import ai, db, forms, repo

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
