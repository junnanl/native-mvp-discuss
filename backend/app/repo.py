"""数据访问。所有查询集中在这里，路由层不写 SQL。

流程节点与表单字段一律从数据库读：代码里不留任何一份默认流程或默认字段。
"""
import json
from contextlib import contextmanager
from typing import Any, Iterator

from psycopg.rows import dict_row

from .db import connection


@contextmanager
def rows() -> Iterator[Any]:
    with connection() as conn:
        yield conn.cursor(row_factory=dict_row)


# ---------- 定义 ----------

def list_flow_defs() -> list[dict]:
    with rows() as cur:
        return cur.execute("SELECT id, name, nodes FROM flow_def ORDER BY id").fetchall()


def get_flow_def(flow_def_id: int) -> dict | None:
    with rows() as cur:
        return cur.execute("SELECT id, name, nodes FROM flow_def WHERE id=%s", (flow_def_id,)).fetchone()


def list_form_defs() -> list[dict]:
    with rows() as cur:
        return cur.execute("SELECT id, name, fields FROM form_def ORDER BY id").fetchall()


def get_form_def(form_id: int) -> dict | None:
    with rows() as cur:
        return cur.execute("SELECT id, name, fields FROM form_def WHERE id=%s", (form_id,)).fetchone()


def entry_node(flow: dict) -> dict:
    """流程的第一个节点。"""
    return flow["nodes"][0]


def form_of_flow(flow: dict) -> dict | None:
    """流程用哪张表单——取第一个「填单」节点上的 form_id（方案 §2）。"""
    node = next((n for n in flow["nodes"] if n.get("form_id")), None)
    return get_form_def(node["form_id"]) if node else None


def list_prompt_suggestions(page_key: str) -> list[dict]:
    with rows() as cur:
        return cur.execute(
            'SELECT id, page_key, text, "order" FROM prompt_suggestion WHERE page_key=%s ORDER BY "order"',
            (page_key,),
        ).fetchall()


# ---------- 用户 ----------

def list_users() -> list[dict]:
    with rows() as cur:
        return cur.execute('SELECT id, name, role FROM "user" ORDER BY id').fetchall()


def get_user(user_id: int) -> dict | None:
    with rows() as cur:
        return cur.execute('SELECT id, name, role FROM "user" WHERE id=%s', (user_id,)).fetchone()


def find_user(name: str) -> dict | None:
    with rows() as cur:
        return cur.execute('SELECT id, name, role FROM "user" WHERE name=%s', (name,)).fetchone()


def list_roles() -> list[str]:
    """系统里存在的角色 —— 来自 user 表，不是代码里的枚举。

    新流程要用「主管」「财务」这种新角色时，加一行 user 即可，不改代码。
    """
    with rows() as cur:
        found = cur.execute('SELECT DISTINCT role FROM "user" ORDER BY role').fetchall()
    return [row["role"] for row in found]


# ---------- 流程实例 ----------

INSTANCE_COLUMNS = "id, flow_def_id, current_node, status, creator_id, data, visible_to, created_at, finished_at"


def create_instance(flow_def_id: int, current_node: str, data: dict, creator_id: int, visible_to: list) -> dict:
    with rows() as cur:
        found = cur.execute(
            f"INSERT INTO flow_instance (flow_def_id, current_node, status, creator_id, data, visible_to)"
            f" VALUES (%s, %s, %s, %s, %s, %s) RETURNING {INSTANCE_COLUMNS}",
            (flow_def_id, current_node, "进行中", creator_id, json.dumps(data, ensure_ascii=False), json.dumps(visible_to, ensure_ascii=False)),
        ).fetchone()
        cur.connection.commit()
    return found


def get_instance(instance_id: int) -> dict | None:
    with rows() as cur:
        return cur.execute(f"SELECT {INSTANCE_COLUMNS} FROM flow_instance WHERE id=%s", (instance_id,)).fetchone()


def save_instance(instance: dict) -> dict:
    with rows() as cur:
        found = cur.execute(
            f"UPDATE flow_instance SET current_node=%s, status=%s, data=%s, finished_at=%s WHERE id=%s"
            f" RETURNING {INSTANCE_COLUMNS}",
            (instance["current_node"], instance["status"], json.dumps(instance["data"], ensure_ascii=False),
             instance.get("finished_at"), instance["id"]),
        ).fetchone()
        cur.connection.commit()
    return found


def list_instances(flow_def_id: int | None = None, status: str | None = None, creator_id: int | None = None) -> list[dict]:
    clauses, params = [], []
    if flow_def_id is not None:
        clauses.append("flow_def_id=%s"); params.append(flow_def_id)
    if status is not None:
        clauses.append("status=%s"); params.append(status)
    if creator_id is not None:
        clauses.append("creator_id=%s"); params.append(creator_id)
    where = f" WHERE {' AND '.join(clauses)}" if clauses else ""
    with rows() as cur:
        return cur.execute(f"SELECT {INSTANCE_COLUMNS} FROM flow_instance{where} ORDER BY id DESC", params).fetchall()


# ---------- 数字员工 ----------

AGENT_COLUMNS = ("id, name, description, avatar, category, maturity, tags, quick_questions, capabilities,"
                 " skill_md, harness_url, harness_key, status, usage_count, flow_instance_id, visible_to, created_at")


def list_agents(status: str | None = None) -> list[dict]:
    where, params = ("", [])
    if status:
        where, params = (" WHERE status=%s", [status])
    with rows() as cur:
        return cur.execute(f"SELECT {AGENT_COLUMNS} FROM agent{where} ORDER BY id", params).fetchall()


def get_agent(agent_id: int) -> dict | None:
    with rows() as cur:
        return cur.execute(f"SELECT {AGENT_COLUMNS} FROM agent WHERE id=%s", (agent_id,)).fetchone()


def create_agent(values: dict) -> dict:
    with rows() as cur:
        found = cur.execute(
            f"INSERT INTO agent (name, description, avatar, category, maturity, tags, quick_questions,"
            f" capabilities, skill_md, status, flow_instance_id, visible_to)"
            f" VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING {AGENT_COLUMNS}",
            (values["name"], values.get("description", ""), values.get("avatar"), values.get("category", "业务支撑"),
             values.get("maturity"), json.dumps(values.get("tags", []), ensure_ascii=False),
             json.dumps(values.get("quick_questions", []), ensure_ascii=False),
             json.dumps(values.get("capabilities", []), ensure_ascii=False), values.get("skill_md"),
             values.get("status", "草稿"), values.get("flow_instance_id"),
             json.dumps(values.get("visible_to", []), ensure_ascii=False)),
        ).fetchone()
        cur.connection.commit()
    return found


UPDATABLE_AGENT_FIELDS = {"name", "description", "avatar", "category", "maturity", "skill_md", "status", "flow_instance_id"}
JSON_AGENT_FIELDS = {"tags", "quick_questions", "capabilities", "visible_to"}


def update_agent(agent_id: int, **changes: Any) -> dict | None:
    assignments, params = [], []
    for key, value in changes.items():
        if key in UPDATABLE_AGENT_FIELDS:
            assignments.append(f"{key}=%s"); params.append(value)
        elif key in JSON_AGENT_FIELDS:
            assignments.append(f"{key}=%s"); params.append(json.dumps(value, ensure_ascii=False))
    if not assignments:
        return get_agent(agent_id)
    with rows() as cur:
        found = cur.execute(
            f"UPDATE agent SET {', '.join(assignments)} WHERE id=%s RETURNING {AGENT_COLUMNS}",
            params + [agent_id],
        ).fetchone()
        cur.connection.commit()
    return found


def bump_agent_usage(agent_id: int) -> None:
    with connection() as conn:
        conn.execute("UPDATE agent SET usage_count = usage_count + 1 WHERE id=%s", (agent_id,))
        conn.commit()
