"""视图、数字员工、统计。核心是：看到的每个数都得能追到库里的行。"""
import os
import unittest

from fastapi.testclient import TestClient

from . import support
from .stub_model import StubModel
from backend.app import harness
from backend.app.main import app


class ViewTest(unittest.TestCase):
    def setUp(self):
        support.reset()
        self.client = TestClient(app)
        self.who = support.headers("小林")

    def _requirement(self, name: str, level: str = "高") -> dict:
        return self.client.post("/api/flow-instances", headers=self.who, json={
            "flow_def_id": 1, "data": {"name": name, "level": level, "description": "x"}}).json()

    def test_registry_grows_with_the_flow_definitions(self):
        keys = {spec["key"] for spec in self.client.get("/api/views").json()}
        self.assertIn("flow:1", keys)
        self.assertIn("flow:2", keys, "新配的报销流程应当自动多出一个可查视图")
        support.add_flow(7, "请假", [{"key": "a", "name": "申请", "type": "填单", "role": "使用者"},
                                     {"key": "z", "name": "完成", "type": "完成"}])
        self.assertIn("flow:7", {spec["key"] for spec in self.client.get("/api/views").json()})

    def test_table_columns_come_from_the_form_definition(self):
        self._requirement("合同助手")
        table = self.client.get("/api/views/flow:1", headers=self.who).json()
        labels = [column["label"] for column in table["columns"]]
        self.assertEqual(labels[:3], ["需求名称", "紧急程度", "需求描述"])
        self.assertEqual(table["rows"][0]["name"], "合同助手")

    def test_paging_and_filtering_do_not_go_through_the_model(self):
        for index in range(12):
            self._requirement(f"需求{index}", "高" if index % 2 else "低")
        first = self.client.get("/api/views/flow:1", headers=self.who).json()
        self.assertEqual(len(first["rows"]), 10)
        self.assertEqual(first["total"], 12)
        second = self.client.get("/api/views/flow:1?page=2", headers=self.who).json()
        self.assertEqual(len(second["rows"]), 2)
        filtered = self.client.get("/api/views/flow:1?level=低", headers=self.who).json()
        self.assertEqual(filtered["total"], 6)
        self.assertTrue(all(row["level"] == "低" for row in filtered["rows"]))

    def test_chart_counts_real_instances(self):
        self._requirement("甲")
        chart = self.client.get("/api/views/flow_by_node:1", headers=self.who).json()
        self.assertEqual(chart["categories"], ["提交需求", "评审", "开发", "已上线"])
        self.assertEqual(chart["series"][0]["data"], [0, 1, 0, 0], "那一条应该正卡在评审")

    def test_unknown_view_is_a_404_not_an_empty_card(self):
        self.assertEqual(self.client.get("/api/views/nonsense", headers=self.who).status_code, 404)

    def test_resolve_view_can_only_pick_from_the_registry(self):
        with StubModel(['{"view":"随便编一个","query":{}}', '{"view":"flow:1","query":{"level":"高"}}']) as stub:
            os.environ["MODEL_BASE_URL"] = stub.base_url
            response = self.client.post("/api/ai/resolve-view", headers=self.who,
                                        json={"text": "查一下高优先级的需求"})
        body = response.json()
        self.assertEqual(body["view"], "flow:1")
        self.assertEqual(body["component"], "table")
        self.assertEqual(body["_model"]["attempts"], 2)
        self.assertNotIn("rows", body, "resolve-view 不该带数据，取数是组件的事")

    def test_resolve_view_rejects_filters_the_view_does_not_have(self):
        with StubModel(['{"view":"flow:1","query":{"随便":"x"}}', '{"view":"flow:1","query":{}}']) as stub:
            os.environ["MODEL_BASE_URL"] = stub.base_url
            response = self.client.post("/api/ai/resolve-view", headers=self.who, json={"text": "查需求"})
        self.assertEqual(response.json()["query"], {})


class AgentTest(unittest.TestCase):
    def setUp(self):
        support.reset()
        self.client = TestClient(app)
        self.who = support.headers("阿凯")

    def test_no_agents_means_an_empty_list_not_demo_cards(self):
        self.assertEqual(self.client.get("/api/agents", headers=self.who).json(), [])

    def test_cannot_go_live_without_a_finished_flow(self):
        agent = self.client.post("/api/agents", headers=self.who,
                                 json={"name": "合同解析助手", "description": "解析合同"}).json()
        self.client.put(f"/api/agents/{agent['id']}/skill", headers=self.who, json={"skill_md": "# 合同解析\n步骤..."})

        instance = self.client.post("/api/flow-instances", headers=support.headers("小林"), json={
            "flow_def_id": 1, "data": {"name": "合同解析助手", "level": "高", "description": "x"}}).json()

        blocked = self.client.post(f"/api/agents/{agent['id']}/publish", headers=self.who,
                                   json={"flow_instance_id": instance["id"]})
        self.assertEqual(blocked.status_code, 409)

        for person in ("老周", "阿凯"):
            self.client.post(f"/api/flow-instances/{instance['id']}/advance", headers=support.headers(person), json={})
        ok = self.client.post(f"/api/agents/{agent['id']}/publish", headers=self.who,
                              json={"flow_instance_id": instance["id"]})
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(ok.json()["status"], "已上线")

    def test_publish_requires_a_flow_instance_at_all(self):
        agent = self.client.post("/api/agents", headers=self.who, json={"name": "甲"}).json()
        self.assertEqual(422, self.client.post(f"/api/agents/{agent['id']}/publish",
                                               headers=self.who, json={}).status_code)

    def test_stats_mean_what_they_say(self):
        instance = self.client.post("/api/flow-instances", headers=support.headers("小林"), json={
            "flow_def_id": 1, "data": {"name": "甲", "level": "高", "description": "x"}}).json()
        self.assertEqual(self.client.get("/api/stats").json()["completed_today"], 0)
        for person in ("老周", "阿凯"):
            self.client.post(f"/api/flow-instances/{instance['id']}/advance", headers=support.headers(person), json={})
        self.assertEqual(self.client.get("/api/stats").json()["completed_today"], 1)


class HarnessProjectionTest(unittest.TestCase):
    """方案 §6.7：执行进度必须绑真实事件。"""

    def test_tool_events_keep_their_identity_and_get_a_readable_label(self):
        projected = harness.project({"type": "tool_start", "tool": "web_search", "tool_call_id": "c1"})
        self.assertEqual(projected["type"], "tool_start")
        self.assertEqual(projected["tool"], "web_search")
        self.assertEqual(projected["label"], "检索资料")
        self.assertEqual(projected["call_id"], "c1")

    def test_unknown_events_are_passed_through_not_dropped(self):
        projected = harness.project({"type": "某个新事件", "content": "x"})
        self.assertEqual(projected["type"], "unknown")
        self.assertEqual(projected["raw"]["type"], "某个新事件")

    def test_text_events_carry_their_content(self):
        self.assertEqual(harness.project({"type": "delta", "content": "你好"})["content"], "你好")
        self.assertEqual(harness.project({"type": "phase", "content": "正在分析"})["content"], "正在分析")


if __name__ == "__main__":
    unittest.main()
