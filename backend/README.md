# 后端

Python + FastAPI + Pydantic。复制 `.env.example` 为环境配置后启动：

```bash
backend/.venv/bin/pip install -r backend/requirements.txt
backend/.venv/bin/python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 18000
```

流程实例和数字员工使用 PostgreSQL；模型调用走 OpenAI 兼容接口，数字员工对话走 CowAgent HTTP/SSE。
