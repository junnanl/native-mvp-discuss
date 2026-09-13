import json
import os
from contextlib import contextmanager
from typing import Iterator

import psycopg

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://oa:oa@127.0.0.1:5432/ai_native_oa")

SCHEMA_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "schema.sql")
SEED_PATH = os.path.join(os.path.dirname(__file__), "definitions.json")


@contextmanager
def connection() -> Iterator[psycopg.Connection]:
    with psycopg.connect(DATABASE_URL) as conn:
        yield conn


def load_seed() -> dict[str, list]:
    with open(SEED_PATH, encoding="utf-8") as seed_file:
        return json.load(seed_file)


def init_schema() -> None:
    """建表并灌入种子定义。

    种子只在表为空时写入：definitions.json 是**首次装库的初值**，不是运行时的
    第二数据源。上线后改表单或流程改数据库，不改这个文件。
    """
    with open(SCHEMA_PATH, encoding="utf-8") as schema_file:
        schema = schema_file.read()
    seed = load_seed()
    with connection() as conn:
        conn.execute(schema)
        conn.commit()
        _seed_table(conn, "user", seed["users"], ("id", "name", "role"))
        _seed_table(conn, "form_def", seed["forms"], ("id", "name", "fields"))
        _seed_table(conn, "flow_def", seed["flows"], ("id", "name", "nodes"))
        _seed_table(conn, "prompt_suggestion", seed["prompt_suggestions"], ("id", "page_key", "text", "order"))
        conn.commit()


def _seed_table(conn: psycopg.Connection, table: str, rows: list[dict], columns: tuple[str, ...]) -> None:
    """按行补种：id 不存在就插入，已存在的一律不动。

    于是「往种子文件里加一条流程」会在下次启动时进库，而运行期在库里改过的
    定义不会被文件覆盖回去——数据库始终是运行时的唯一事实源。
    """
    quoted = f'"{table}"'
    column_sql = ", ".join(f'"{column}"' for column in columns)
    placeholders = ", ".join(["%s"] * len(columns))
    for row in rows:
        values = [json.dumps(row[column], ensure_ascii=False) if isinstance(row.get(column), (list, dict)) else row.get(column) for column in columns]
        conn.execute(f"INSERT INTO {quoted} ({column_sql}) VALUES ({placeholders}) ON CONFLICT (id) DO NOTHING", values)
    conn.execute(f"SELECT setval(pg_get_serial_sequence('{table}', 'id'), (SELECT COALESCE(MAX(id), 1) FROM {quoted}), true)")
