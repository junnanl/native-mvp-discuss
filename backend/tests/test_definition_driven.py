"""铁律测试：表单字段和流程节点是数据不是代码。

每个用例都只改数据库，不改任何 .py。改完行为就得跟着变——变不了就说明
定义没真正驱动实现，第 6 步一定过不去（方案 §9）。
"""
import unittest

from fastapi.testclient import TestClient

from . import support
from backend.app.main import app


class DefinitionDrivenTest(unittest.TestCase):
    def setUp(self):
        support.reset()
        self.client = TestClient(app)
        self.submitter = support.headers("小林")

    def test_adding_a_field_only_needs_a_data_change(self):
        support.set_form_fields(1, [
            {"key": "name", "label": "需求名称", "type": "text", "required": True},
            {"key": "level", "label": "紧急程度", "type": "select", "options": ["高", "中", "低"], "required": True},
            {"key": "budget", "label": "预算", "type": "number", "required": True},
        ])
        # 新字段出现在给前端的定义里
        fields = self.client.get("/api/flows/1").json()["form"]["fields"]
        self.assertIn("budget", [field["key"] for field in fields])

        # 缺了新的必填字段就提交不了
        missing = self.client.post("/api/flow-instances", headers=self.submitter,
                                   json={"flow_def_id": 1, "data": {"name": "甲", "level": "高"}})
        self.assertEqual(missing.status_code, 422)
        self.assertIn("budget", missing.json()["detail"])

        # 带上就能提交，且数字被规范成数字
        created = self.client.post("/api/flow-instances", headers=self.submitter,
                                   json={"flow_def_id": 1, "data": {"name": "甲", "level": "高", "budget": "3000"}})
        self.assertEqual(created.status_code, 200)
        self.assertEqual(created.json()["data"]["budget"], 3000.0)

    def test_select_options_come_from_the_definition_not_the_code(self):
        support.set_form_fields(1, [
            {"key": "name", "label": "需求名称", "type": "text", "required": True},
            {"key": "level", "label": "紧急程度", "type": "select", "options": ["紧急", "普通"], "required": True},
        ])
        rejected = self.client.post("/api/flow-instances", headers=self.submitter,
                                    json={"flow_def_id": 1, "data": {"name": "甲", "level": "高"}})
        self.assertEqual(rejected.status_code, 422, "「高」已经不在选项里了，必须被拦下")
        accepted = self.client.post("/api/flow-instances", headers=self.submitter,
                                    json={"flow_def_id": 1, "data": {"name": "甲", "level": "紧急"}})
        self.assertEqual(accepted.status_code, 200)

    def test_roles_come_from_the_user_table_not_a_literal(self):
        """新流程要用「主管」这种新角色时，加一行用户即可。"""
        support.add_user("陈主管", "主管")
        support.add_form(9, "请假单", [{"key": "reason", "label": "事由", "type": "text", "required": True}])
        support.add_flow(9, "请假", [
            {"key": "apply", "name": "申请", "type": "填单", "role": "提需求", "form_id": 9},
            {"key": "approve", "name": "主管审批", "type": "审批", "role": "主管"},
            {"key": "done", "name": "完成", "type": "完成"},
        ])
        instance = self.client.post("/api/flow-instances", headers=self.submitter,
                                    json={"flow_def_id": 9, "data": {"reason": "看病"}}).json()

        # 评审不能替主管批
        wrong = self.client.post(f"/api/flow-instances/{instance['id']}/advance",
                                 headers=support.headers("老周"), json={})
        self.assertEqual(wrong.status_code, 403)

        # 主管的待办里有它，评审的没有
        self.assertIn(instance["id"], [row["id"] for row in self.client.get("/api/todos", headers=support.headers("陈主管")).json()])
        self.assertNotIn(instance["id"], [row["id"] for row in self.client.get("/api/todos", headers=support.headers("老周")).json()])

        done = self.client.post(f"/api/flow-instances/{instance['id']}/advance",
                                headers=support.headers("陈主管"), json={})
        self.assertEqual(done.status_code, 200)
        self.assertEqual(done.json()["status"], "已完成")


if __name__ == "__main__":
    unittest.main()
