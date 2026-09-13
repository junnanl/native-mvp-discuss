"""视图注册表：AI 只能从这里挑，数据全部来自数据库。

方案 §3 的规矩——模型只出现一次，决定「看哪个视图、什么条件」；真正取数由组件
自己调 `/api/views/{key}`，翻页排序筛选一律不过模型。

注册表大部分是**从流程定义派生的**：新配一条流程，它的列表视图自动出现，
不用改这里。列也来自 form_def，不是写死的表头。
"""
from datetime import datetime, timezone
from typing import Any

from . import repo

PAGE_SIZE = 10


def registry() -> list[dict]:
    """当前可用的视图。给模型看的清单，也给前端看的契约。"""
    specs: list[dict] = []
    for flow in repo.list_flow_defs():
        form = repo.form_of_flow(flow)
        filters = ["status"] + [field["key"] for field in (form["fields"] if form else [])
                                if field.get("type") == "select"]
        specs.append({
            "key": f"flow:{flow['id']}",
            "component": "table",
            "title": f"{flow['name']}·明细",
            "answers": f"有哪些{flow['name']}，具体是哪几条",
            "filters": filters,
        })
        specs.append({
            "key": f"flow_count:{flow['id']}",
            "component": "metric",
            "title": f"{flow['name']}·数量",
            "answers": f"{flow['name']}有多少条",
            "filters": ["status"],
        })
        specs.append({
            "key": f"flow_by_node:{flow['id']}",
            "component": "chart",
            "title": f"{flow['name']}·各节点积压",
            "answers": f"{flow['name']}都卡在哪个环节",
            "filters": [],
        })
    specs.append({
        "key": "agent_list",
        "component": "table",
        "title": "数字员工·明细",
        "answers": "有哪些数字员工，分别谁在用",
        "filters": ["status", "category"],
    })
    specs.append({
        "key": "agent_graph",
        "component": "graph",
        "title": "数字员工·能力地图",
        "answers": "员工都覆盖了哪些业务领域，哪块有空白",
        "filters": [],
    })
    return specs


def describe(specs: list[dict]) -> str:
    return "\n".join(
        f'- key={spec["key"]}（{spec["component"]}）{spec["title"]}：{spec["answers"]}'
        + (f'；可用筛选：{"、".join(spec["filters"])}' if spec["filters"] else "")
        for spec in specs
    )


def resolve(key: str, query: dict[str, Any], page: int, user: dict) -> dict:
    """按 key 取真实数据。取不到就报错，不返回占位内容。"""
    spec = next((item for item in registry() if item["key"] == key), None)
    if spec is None:
        raise KeyError(key)
    kind, _, argument = key.partition(":")
    if kind == "flow":
        return _flow_table(int(argument), query, page, user, spec)
    if kind == "flow_count":
        return _flow_count(int(argument), query, user, spec)
    if kind == "flow_by_node":
        return _flow_by_node(int(argument), user, spec)
    if kind == "agent_list":
        return _agent_table(query, page, spec)
    if kind == "agent_graph":
        return _agent_graph(spec)
    raise KeyError(key)


def _instances(flow_def_id: int, query: dict, user: dict) -> tuple[list[dict], dict | None]:
    flow = repo.get_flow_def(flow_def_id)
    if flow is None:
        raise KeyError(flow_def_id)
    form = repo.form_of_flow(flow)
    found = [item for item in repo.list_instances(flow_def_id=flow_def_id) if _visible(item, user)]
    if query.get("status"):
        found = [item for item in found if item["status"] == query["status"]]
    for key, value in query.items():
        if key in {"status", "page"} or value in (None, ""):
            continue
        found = [item for item in found if str(item["data"].get(key, "")) == str(value)]
    return found, form


def _visible(instance: dict, user: dict) -> bool:
    scope = instance.get("visible_to") or []
    return not scope or user["role"] in scope or user["id"] in scope or instance["creator_id"] == user["id"]


def _flow_table(flow_def_id: int, query: dict, page: int, user: dict, spec: dict) -> dict:
    found, form = _instances(flow_def_id, query, user)
    flow = repo.get_flow_def(flow_def_id)
    node_names = {node["key"]: node["name"] for node in flow["nodes"]}
    people = {person["id"]: person["name"] for person in repo.list_users()}
    columns = [{"key": field["key"], "label": field["label"]} for field in (form["fields"] if form else [])]
    columns += [{"key": "_node", "label": "当前环节"}, {"key": "_creator", "label": "提交人"},
                {"key": "_status", "label": "状态"}]
    start = (page - 1) * PAGE_SIZE
    rows = [{
        **{column["key"]: instance["data"].get(column["key"], "") for column in columns},
        "_id": instance["id"],
        "_node": node_names.get(instance["current_node"], instance["current_node"]),
        "_creator": people.get(instance["creator_id"], ""),
        "_status": instance["status"],
    } for instance in found[start:start + PAGE_SIZE]]
    return {"component": "table", "title": spec["title"], "columns": columns, "rows": rows,
            "page": page, "page_size": PAGE_SIZE, "total": len(found)}


def _flow_count(flow_def_id: int, query: dict, user: dict, spec: dict) -> dict:
    found, _ = _instances(flow_def_id, query, user)
    now = datetime.now(timezone.utc)
    this_month = sum(1 for item in found if (item["created_at"].year, item["created_at"].month) == (now.year, now.month))
    return {"component": "metric", "title": spec["title"], "value": len(found),
            "unit": "条", "change_label": "本月新增", "change_value": this_month}


def _flow_by_node(flow_def_id: int, user: dict, spec: dict) -> dict:
    flow = repo.get_flow_def(flow_def_id)
    found, _ = _instances(flow_def_id, {}, user)
    counts = {node["key"]: 0 for node in flow["nodes"]}
    for instance in found:
        counts[instance["current_node"]] = counts.get(instance["current_node"], 0) + 1
    return {"component": "chart", "title": spec["title"], "type": "bar",
            "categories": [node["name"] for node in flow["nodes"]],
            "series": [{"name": "实例数", "data": [counts.get(node["key"], 0) for node in flow["nodes"]]}]}


def _agent_table(query: dict, page: int, spec: dict) -> dict:
    found = repo.list_agents(status=query.get("status"))
    if query.get("category"):
        found = [item for item in found if item["category"] == query["category"]]
    columns = [{"key": "name", "label": "岗位名"}, {"key": "category", "label": "分类"},
               {"key": "description", "label": "一句话简介"}, {"key": "status", "label": "状态"},
               {"key": "usage_count", "label": "使用次数"}]
    start = (page - 1) * PAGE_SIZE
    rows = [{**{column["key"]: agent[column["key"]] for column in columns}, "_id": agent["id"]}
            for agent in found[start:start + PAGE_SIZE]]
    return {"component": "table", "title": spec["title"], "columns": columns, "rows": rows,
            "page": page, "page_size": PAGE_SIZE, "total": len(found)}


def _agent_graph(spec: dict) -> dict:
    """能力地图（方案 §6.6 第一版用法二）：员工 → 覆盖的业务领域。

    数据来自 agent 与 agent.tags。给 graph 的永远只是 {nodes, edges}——
    换成 Neo4j 当数据源时，组件一行都不用改。
    """
    agents = repo.list_agents()
    nodes, edges, seen = [], [], set()
    for agent in agents:
        nodes.append({"id": f"agent:{agent['id']}", "label": agent["name"], "type": "agent"})
        for tag in (agent["tags"] or []) + ([agent["category"]] if agent["category"] else []):
            if tag not in seen:
                seen.add(tag)
                nodes.append({"id": f"domain:{tag}", "label": tag, "type": "domain"})
            edges.append({"source": f"agent:{agent['id']}", "target": f"domain:{tag}", "label": "覆盖"})
    return {"component": "graph", "title": spec["title"], "nodes": nodes, "edges": edges}
