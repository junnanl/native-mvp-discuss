"""测试环境：独立测试库 + 每个用例前重置。"""
import os

os.environ.setdefault("DATABASE_URL", "postgresql://oa:oa@127.0.0.1:5432/ai_native_oa_test")

from backend.app import db  # noqa: E402  必须在设好 DATABASE_URL 之后导入

TABLES = ("agent", "flow_instance", "flow_def", "form_def", "prompt_suggestion", '"user"')


def reset() -> None:
    with db.connection() as conn:
        for table in TABLES:
            conn.execute(f"DROP TABLE IF EXISTS {table} CASCADE")
        conn.commit()
    db.init_schema()


def set_form_fields(form_id: int, fields: list[dict]) -> None:
    """改表单定义——只动数据，不动代码。"""
    import json
    with db.connection() as conn:
        conn.execute("UPDATE form_def SET fields=%s WHERE id=%s", (json.dumps(fields, ensure_ascii=False), form_id))
        conn.commit()


def add_form(form_id: int, name: str, fields: list[dict]) -> None:
    import json
    with db.connection() as conn:
        conn.execute("INSERT INTO form_def (id,name,fields) VALUES (%s,%s,%s)",
                     (form_id, name, json.dumps(fields, ensure_ascii=False)))
        conn.commit()


def add_flow(flow_id: int, name: str, nodes: list[dict]) -> None:
    import json
    with db.connection() as conn:
        conn.execute("INSERT INTO flow_def (id,name,nodes) VALUES (%s,%s,%s)",
                     (flow_id, name, json.dumps(nodes, ensure_ascii=False)))
        conn.commit()


def add_user(name: str, role: str) -> int:
    with db.connection() as conn:
        row = conn.execute('INSERT INTO "user" (name,role) VALUES (%s,%s) RETURNING id', (name, role)).fetchone()
        conn.commit()
    return row[0]


def user_id(name: str) -> int:
    with db.connection() as conn:
        return conn.execute('SELECT id FROM "user" WHERE name=%s', (name,)).fetchone()[0]


def headers(name: str) -> dict[str, str]:
    return {"X-User-Id": str(user_id(name))}
