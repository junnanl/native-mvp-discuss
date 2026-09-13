"""流程行为测试。节点归谁、能不能推进、什么时候算完成，全部以 flow_def 为准。"""
import unittest

from fastapi.testclient import TestClient

from . import support
from backend.app.main import app


class FlowAPITest(unittest.TestCase):
    def setUp(self):
        support.reset()
        self.client = TestClient(app)
        self.submitter = support.headers("小林")

    def _new_requirement(self, name: str = "合同解析助手") -> dict:
        return self.client.post("/api/flow-instances", headers=self.submitter, json={
            "flow_def_id": 1, "data": {"name": name, "level": "高", "description": "解析合同关键信息"},
        }).json()

    def test_missing_instance_does_not_get_invented(self):
        self.assertEqual(self.client.get("/api/flow-instances/999999").status_code, 404)
        self.assertEqual(
            self.client.post("/api/flow-instances/999999/advance", headers=self.submitter, json={}).status_code, 404)

    def test_only_the_nodes_role_can_advance_it(self):
        instance = self._new_requirement()
        wrong = self.client.post(f"/api/flow-instances/{instance['id']}/advance",
                                 headers=support.headers("阿凯"), json={})
        self.assertEqual(wrong.status_code, 403)
        self.assertIn("评审", wrong.json()["detail"])

    def test_reaching_the_terminal_node_completes_it_once(self):
        instance = self._new_requirement()
        self.assertEqual(instance["current_node"], "review", "提交即完成填单节点")
        for who in ("老周", "阿凯"):
            response = self.client.post(f"/api/flow-instances/{instance['id']}/advance",
                                        headers=support.headers(who), json={})
            self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "已完成")
        self.assertIsNotNone(response.json()["finished_at"])
        again = self.client.post(f"/api/flow-instances/{instance['id']}/advance",
                                 headers=support.headers("阿凯"), json={})
        self.assertEqual(again.status_code, 409)

    def test_todo_belongs_to_whoever_owns_the_current_node(self):
        instance = self._new_requirement()

        def todo_ids(who: str) -> list[int]:
            return [row["id"] for row in self.client.get("/api/todos", headers=support.headers(who)).json()]

        self.assertIn(instance["id"], todo_ids("老周"))
        self.assertNotIn(instance["id"], todo_ids("小林"), "提交人不该再看到自己刚提交的填单节点")
        self.assertNotIn(instance["id"], todo_ids("阿凯"))

        self.client.post(f"/api/flow-instances/{instance['id']}/advance", headers=support.headers("老周"), json={})
        self.assertIn(instance["id"], todo_ids("阿凯"))
        self.assertNotIn(instance["id"], todo_ids("老周"))

    def test_todo_title_comes_from_the_form_data(self):
        self._new_requirement("发票识别助手")
        titles = [row["title"] for row in self.client.get("/api/todos", headers=support.headers("老周")).json()]
        self.assertIn("发票识别助手", titles)

    def test_visible_to_hides_it_from_others(self):
        instance = self.client.post("/api/flow-instances", headers=self.submitter, json={
            "flow_def_id": 1, "data": {"name": "保密需求", "level": "高", "description": "x"},
            "visible_to": ["评审"],
        }).json()
        seen_by_reviewer = self.client.get("/api/flow-instances", headers=support.headers("老周")).json()
        self.assertIn(instance["id"], [row["id"] for row in seen_by_reviewer])
        seen_by_user = self.client.get("/api/flow-instances", headers=support.headers("小美")).json()
        self.assertNotIn(instance["id"], [row["id"] for row in seen_by_user])
        seen_by_creator = self.client.get("/api/flow-instances", headers=self.submitter).json()
        self.assertIn(instance["id"], [row["id"] for row in seen_by_creator], "提交人自己总该看得见")

    def test_login_is_required(self):
        self.assertEqual(self.client.get("/api/todos").status_code, 401)
        self.assertEqual(self.client.post("/api/flow-instances", json={"flow_def_id": 1}).status_code, 401)


if __name__ == "__main__":
    unittest.main()
