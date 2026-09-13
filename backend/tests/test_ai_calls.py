"""AI 调用点的行为测试（方案 §4）。

用桩模型验证的是**我们这边的防线**：schema 约束、业务值校验、重试、降级、
以及「拿不到合格结果就报错」。真实内网模型是否稳定仍未验（方案 §8 待验项）。
"""
import os
import unittest

from fastapi.testclient import TestClient

from . import support
from .stub_model import StubModel
from backend.app.main import app


class FillFormTest(unittest.TestCase):
    def setUp(self):
        support.reset()
        self.client = TestClient(app)

    def test_out_of_range_value_is_rejected_and_retried(self):
        """AI 返回「特急」——方案 §4 点名的那个例子——必须被拦下并重试。"""
        with StubModel(['{"name":"合同助手","level":"特急","description":"解析合同"}',
                        '{"name":"合同助手","level":"高","description":"解析合同"}']) as stub:
            os.environ["MODEL_BASE_URL"] = stub.base_url
            response = self.client.post("/api/ai/fill-form", json={"text": "做个合同助手，很急", "flow_def_id": 1})
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["values"]["level"], "高")
        self.assertEqual(body["_model"]["attempts"], 2, "第一次应当被业务校验拦下")
        conversation = str(stub.requests[-1]["messages"])
        self.assertIn("特急", conversation, "被拒的那次回答要回放给模型，它才知道错在哪")
        self.assertIn("不符合要求", conversation)

    def test_json_wrapped_in_a_code_fence_is_still_accepted(self):
        with StubModel(['好的：\n```json\n{"name":"甲","level":"中","description":"乙"}\n```']) as stub:
            os.environ["MODEL_BASE_URL"] = stub.base_url
            response = self.client.post("/api/ai/fill-form", json={"text": "随便", "flow_def_id": 1})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["values"]["name"], "甲")

    def test_falls_back_when_the_service_rejects_response_format(self):
        """很多内网服务只兼容基础 chat completions（方案 §8）——要能降级，且如实记录。"""
        with StubModel(['{"name":"甲","level":"低","description":"乙"}'], reject_response_format=True) as stub:
            os.environ["MODEL_BASE_URL"] = stub.base_url
            response = self.client.post("/api/ai/fill-form", json={"text": "随便", "flow_def_id": 1})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["_model"]["schema_enforced"])

    def test_prompt_is_built_from_the_form_definition(self):
        support.set_form_fields(1, [{"key": "amount", "label": "金额", "type": "number", "required": True}])
        with StubModel(['{"amount":88}']) as stub:
            os.environ["MODEL_BASE_URL"] = stub.base_url
            self.client.post("/api/ai/fill-form", json={"text": "八十八块", "flow_def_id": 1})
        system = stub.requests[0]["messages"][0]["content"]
        self.assertIn("amount（金额）", system)
        self.assertNotIn("需求名称", system, "提示词里不该残留上一版表单的字段")

    def test_unreachable_model_reports_an_error_instead_of_inventing_one(self):
        os.environ["MODEL_BASE_URL"] = "http://127.0.0.1:1/v1"
        response = self.client.post("/api/ai/fill-form", json={"text": "随便", "flow_def_id": 1})
        self.assertEqual(response.status_code, 502)
        self.assertNotIn("values", response.json())


class DispatchTest(unittest.TestCase):
    def setUp(self):
        support.reset()
        self.client = TestClient(app)

    def test_route_must_be_one_of_three(self):
        with StubModel(['{"route":"随便聊聊"}', '{"route":"view"}']) as stub:
            os.environ["MODEL_BASE_URL"] = stub.base_url
            response = self.client.post("/api/ai/dispatch", json={"text": "这个月需求都集中在哪"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["route"], "view")
        self.assertEqual(response.json()["_model"]["attempts"], 2)

    def test_cannot_route_to_an_agent_that_is_not_online(self):
        with StubModel(['{"route":"agent","agent_id":42}', '{"route":"fill_form","flow_def_id":1}']) as stub:
            os.environ["MODEL_BASE_URL"] = stub.base_url
            response = self.client.post("/api/ai/dispatch", json={"text": "帮我提个需求"})
        self.assertEqual(response.json()["route"], "fill_form")
        self.assertEqual(response.json()["flow_def_id"], 1)

    def test_available_agents_and_flows_are_given_to_the_model(self):
        with StubModel(['{"route":"view"}']) as stub:
            os.environ["MODEL_BASE_URL"] = stub.base_url
            self.client.post("/api/ai/dispatch", json={"text": "查一下"})
        system = stub.requests[0]["messages"][0]["content"]
        self.assertIn("数字员工申请上线", system, "不给模型流程清单，它没法选")


if __name__ == "__main__":
    unittest.main()
