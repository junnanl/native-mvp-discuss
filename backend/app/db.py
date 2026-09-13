import json
import os
from contextlib import contextmanager
from typing import Iterator

import psycopg

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://sub2api@127.0.0.1:5432/ai_native_oa")


@contextmanager
def connection() -> Iterator[psycopg.Connection]:
    with psycopg.connect(DATABASE_URL) as conn:
        yield conn


def init_schema(definitions: dict[str, list] | None = None) -> None:
    schema = open(os.path.join(os.path.dirname(os.path.dirname(__file__)), "schema.sql"), encoding="utf-8").read()
    with connection() as conn:
        try:
            conn.execute(schema)
        except psycopg.errors.DuplicateTable:
            conn.rollback()
        if definitions:
            conn.execute("INSERT INTO \"user\" (id,name,role) VALUES (1,%s,%s) ON CONFLICT (id) DO NOTHING", ("演示用户", "使用者"))
            conn.execute("SELECT setval(pg_get_serial_sequence('user','id'), GREATEST((SELECT COALESCE(MAX(id), 1) FROM \"user\"), 1), true)")
            for form in definitions.get("forms", []):
                conn.execute("INSERT INTO form_def (id,name,fields) VALUES (%s,%s,%s) ON CONFLICT (id) DO NOTHING", (form["id"], form["name"], json.dumps(form["fields"])))
            for flow in definitions.get("flows", []):
                conn.execute("INSERT INTO flow_def (id,name,nodes) VALUES (%s,%s,%s) ON CONFLICT (id) DO NOTHING", (flow["id"], flow["name"], json.dumps(flow["nodes"])))
        conn.commit()


def create_instance(flow_def_id: int, data: dict[str, object]) -> dict[str, object]:
    with connection() as conn:
        row = conn.execute(
            "INSERT INTO flow_instance (flow_def_id,current_node,status,creator_id,data,visible_to) VALUES (%s,%s,%s,%s,%s,%s) RETURNING id",
            (flow_def_id, "submit", "待提交", 1, json.dumps(data), json.dumps([])),
        ).fetchone()
        conn.commit()
    return {"id": row[0], "flow_def_id": flow_def_id, "current_node": "submit", "status": "待提交", "data": data}


def get_instance(instance_id: int) -> dict[str, object] | None:
    with connection() as conn:
        row = conn.execute("SELECT id,flow_def_id,current_node,status,data FROM flow_instance WHERE id=%s", (instance_id,)).fetchone()
    if not row:
        return None
    return {"id": row[0], "flow_def_id": row[1], "current_node": row[2], "status": row[3], "data": row[4]}


def update_instance(instance: dict[str, object]) -> None:
    with connection() as conn:
        conn.execute("UPDATE flow_instance SET current_node=%s,status=%s,data=%s WHERE id=%s", (instance["current_node"], instance["status"], json.dumps(instance["data"]), instance["id"]))
        conn.commit()


def list_instances() -> list[dict[str, object]]:
    with connection() as conn:
        rows = conn.execute("SELECT id,flow_def_id,current_node,status,data FROM flow_instance ORDER BY id").fetchall()
    return [{"id": r[0], "flow_def_id": r[1], "current_node": r[2], "status": r[3], "data": r[4]} for r in rows]


def create_agent(data: dict[str, object]) -> dict[str, object]:
    with connection() as conn:
        row = conn.execute("""INSERT INTO agent (name,description,avatar,category,maturity,tags,quick_questions,capabilities,skill_md,status,usage_count,visible_to)
          VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,0,%s) RETURNING id""", (data['name'], data.get('description',''), data.get('avatar'), data.get('category','业务支撑'), data.get('maturity','草稿'), json.dumps(data.get('tags',[])), json.dumps(data.get('quick_questions',[])), json.dumps(data.get('capabilities',[])), data.get('skill_md'), data.get('status','草稿'), json.dumps(data.get('visible_to',[])))).fetchone()
        conn.commit()
    return {**data, 'id': row[0], 'usage_count': 0}


def update_agent(agent_id: int, **fields: object) -> dict[str, object] | None:
    allowed = {'skill_md': 'skill_md', 'status': 'status', 'flow_instance_id': 'flow_instance_id'}
    changes = [(allowed[key], value) for key, value in fields.items() if key in allowed]
    if not changes: return None
    with connection() as conn:
        conn.execute(f"UPDATE agent SET {', '.join(f'{key}=%s' for key, _ in changes)} WHERE id=%s", [value for _, value in changes] + [agent_id]); conn.commit()
    return {'id': agent_id, **fields}
