import unittest
from fastapi.testclient import TestClient
from backend.app.main import app

class FlowAPITest(unittest.TestCase):
    def test_missing_instance_does_not_get_invented(self):
        with TestClient(app) as client:
            self.assertEqual(client.get('/api/flow-instances/999999').status_code, 404)
            self.assertEqual(client.post('/api/flow-instances/999999/advance', json={'actor_role': '提需求'}).status_code, 404)

    def test_arriving_at_terminal_node_completes_without_extra_click(self):
        with TestClient(app) as client:
            item = client.post('/api/flow-instances', json={'flow_def_id': 1, 'data': {'name': '终点测试'}}).json()
            url = f"/api/flow-instances/{item['id']}/advance"
            for role in ['提需求', '评审', '开发']:
                response = client.post(url, json={'actor_role': role})
                self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()['status'], '已完成')
            self.assertEqual(client.post(url, json={'actor_role': '开发'}).status_code, 409)

    def test_todo_moves_to_next_role_after_submission(self):
        with TestClient(app) as client:
            item = client.post('/api/flow-instances', json={'flow_def_id': 1, 'data': {'name': '实际待办'}}).json()
            def ids(role):
                return [row['id'] for row in client.get('/api/todos', params={'role': role}).json()]
            self.assertIn(item['id'], ids('提需求'))
            self.assertNotIn(item['id'], ids('使用者'))
            client.post(f"/api/flow-instances/{item['id']}/advance", json={'actor_role': '提需求'})
            self.assertIn(item['id'], ids('评审'))
            self.assertNotIn(item['id'], ids('提需求'))

    def test_second_flow_is_configuration_only(self):
        with TestClient(app) as client:
            item = client.post('/api/flow-instances', json={'flow_def_id': 2, 'data': {'name': '差旅报销'}}).json()
            self.assertEqual(item['flow_def_id'], 2)
            for role in ['提需求', '评审', '开发']:
                response = client.post(f"/api/flow-instances/{item['id']}/advance", json={'actor_role': role})
                self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()['status'], '已完成')

if __name__ == '__main__':
    unittest.main()
