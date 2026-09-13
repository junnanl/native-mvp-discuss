"""一个最小的 OpenAI 兼容桩服务，只用于测试。

用它验证三层防线的第 1、2 层：schema 约束、Pydantic 业务校验与重试。
**真实内网模型仍未验**（方案 §8），桩跑通不等于内网模型跑通。
"""
import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer


class StubModel:
    def __init__(self, replies: list[str], reject_response_format: bool = False):
        self.replies = list(replies)
        self.reject_response_format = reject_response_format
        self.requests: list[dict] = []
        self._server: HTTPServer | None = None
        self._thread: threading.Thread | None = None

    def __enter__(self) -> "StubModel":
        stub = self

        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_args):  # 静音
                pass

            def do_POST(self):
                body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
                stub.requests.append(body)
                if stub.reject_response_format and "response_format" in body:
                    self.send_response(400)
                    self.end_headers()
                    self.wfile.write(b'{"error":"response_format not supported"}')
                    return
                content = stub.replies.pop(0) if stub.replies else "{}"
                payload = json.dumps({"choices": [{"message": {"content": content}}]})
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(payload)))
                self.end_headers()
                self.wfile.write(payload.encode())

        self._server = HTTPServer(("127.0.0.1", 0), Handler)
        self._thread = threading.Thread(target=self._server.serve_forever, daemon=True)
        self._thread.start()
        return self

    @property
    def base_url(self) -> str:
        assert self._server is not None
        return f"http://127.0.0.1:{self._server.server_port}/v1"

    def __exit__(self, *_exc) -> None:
        if self._server:
            self._server.shutdown()
            self._server.server_close()
