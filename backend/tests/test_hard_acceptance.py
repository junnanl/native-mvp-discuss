"""方案 §12 的硬标准：配一条完全不同的流程，不改代码。

> 新配一条完全不同的流程（报销：提交 → 主管批 → 财务批 → 完成），
> **不改代码，一天内配完并跑通**。做不到，说明第一条流程的架构白做了。

这个文件就是那条标准的可执行版本。报销流程的表单、字段、角色、节点全部来自
数据，跟需求流程没有一行共用的代码分支。如果有人把字段或角色写回代码里，
这里会红。
"""
import os
import unittest

from fastapi.testclient import TestClient

from . import support
from .stub_model import StubModel
from backend.app.main import app

REIMBURSEMENT = 2


class HardAcceptanceTest(unittest.TestCase):
    def setUp(self):
        support.reset()
        self.client = TestClient(app)

    def test_the_two_flows_do_not_share_a_form(self):
        requirement = self.client.get("/api/flows/1").json()["form"]
        expense = self.client.get(f"/api/flows/{REIMBURSEMENT}").json()["form"]
        self.assertNotEqual(requirement["id"], expense["id"], "报销不能借用需求单")
        self.assertEqual({field["key"] for field in expense["fields"]},
                         {"reason", "amount", "happened_on", "category", "invoice_no", "remark"})
        self.assertNotIn("level", {field["key"] for field in expense["fields"]})

    def test_requirement_fields_are_not_accepted_by_the_expense_form(self):
        wrong = self.client.post("/api/flow-instances", headers=support.headers("小美"), json={
            "flow_def_id": REIMBURSEMENT, "data": {"name": "打车", "level": "高", "description": "x"},
        })
        self.assertEqual(wrong.status_code, 422)

    def test_expense_runs_end_to_end_through_its_own_roles(self):
        created = self.client.post("/api/flow-instances", headers=support.headers("小美"), json={
            "flow_def_id": REIMBURSEMENT,
            "data": {"reason": "客户现场支持打车", "amount": "268.5",
                     "happened_on": "2026-09-10", "category": "差旅", "invoice_no": "FP20260910"},
        })
        self.assertEqual(created.status_code, 200, created.text)
        instance = created.json()
        self.assertEqual(instance["current_node"], "manager")
        self.assertEqual(instance["data"]["amount"], 268.5)

        def todo_ids(who: str) -> list[int]:
            return [row["id"] for row in self.client.get("/api/todos", headers=support.headers(who)).json()]

        # 主管审批：评审和开发插不上手
        self.assertIn(instance["id"], todo_ids("陈主管"))
        self.assertNotIn(instance["id"], todo_ids("老周"))
        self.assertEqual(403, self.client.post(f"/api/flow-instances/{instance['id']}/advance",
                                               headers=support.headers("老周"), json={}).status_code)
        self.client.post(f"/api/flow-instances/{instance['id']}/advance",
                         headers=support.headers("陈主管"), json={})

        # 财务审批 → 完成
        self.assertIn(instance["id"], todo_ids("何会计"))
        self.assertNotIn(instance["id"], todo_ids("陈主管"))
        finished = self.client.post(f"/api/flow-instances/{instance['id']}/advance",
                                    headers=support.headers("何会计"), json={}).json()
        self.assertEqual(finished["status"], "已完成")
        self.assertEqual(finished["current_node"], "done")

    def test_only_the_submitting_role_can_start_it(self):
        forbidden = self.client.post("/api/flow-instances", headers=support.headers("何会计"), json={
            "flow_def_id": REIMBURSEMENT,
            "data": {"reason": "x", "amount": 1, "happened_on": "2026-09-10", "category": "其他"},
        })
        self.assertEqual(forbidden.status_code, 403)

    def test_ai_fills_the_expense_form_not_the_requirement_form(self):
        with StubModel(['{"reason":"打车去客户现场","amount":268.5,"happened_on":"2026-09-10","category":"差旅"}']) as stub:
            os.environ["MODEL_BASE_URL"] = stub.base_url
            response = self.client.post("/api/ai/fill-form",
                                        json={"text": "9月10号打车去客户现场，268块5", "flow_def_id": REIMBURSEMENT})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["form"]["name"], "费用报销单")
        system = stub.requests[0]["messages"][0]["content"]
        self.assertIn("category（费用类别），只能取：差旅、招待、办公、其他", system)
        self.assertNotIn("紧急程度", system)

    def test_dispatch_can_route_to_the_new_flow_without_code_changes(self):
        with StubModel(['{"route":"fill_form","flow_def_id":2}']) as stub:
            os.environ["MODEL_BASE_URL"] = stub.base_url
            response = self.client.post("/api/ai/dispatch", json={"text": "我要报销一笔差旅费"})
        self.assertEqual(response.json()["flow_def_id"], REIMBURSEMENT)
        self.assertIn("费用报销审批", stub.requests[0]["messages"][0]["content"])

    def test_the_original_flow_still_works(self):
        instance = self.client.post("/api/flow-instances", headers=support.headers("小林"), json={
            "flow_def_id": 1, "data": {"name": "合同助手", "level": "高", "description": "解析合同"},
        }).json()
        for who in ("老周", "阿凯"):
            self.client.post(f"/api/flow-instances/{instance['id']}/advance", headers=support.headers(who), json={})
        self.assertEqual(self.client.get(f"/api/flow-instances/{instance['id']}").json()["status"], "已完成")


if __name__ == "__main__":
    unittest.main()
