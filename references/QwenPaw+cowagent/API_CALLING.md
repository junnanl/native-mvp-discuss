# Evo-Harness API 调用手册

## 1. 定位

Evo-Harness 当前提供的是 Web 控制台使用的 HTTP API。外部系统可以按本文顺序调用，实现发送消息、流式接收结果、上传附件、取消任务和下载生成文件。

这套接口不是 OpenAI 标准 `/v1/chat/completions` 协议。它的稳定边界是 Evo-Harness Web 通道接口：

- 认证使用 Web 登录 Cookie。
- 对话使用 `/message`。
- 流式结果使用 `/stream` 的 SSE。
- 附件先通过 `/upload` 上传，再作为 `attachments` 传给 `/message`。
- 生成文件通过 SSE 事件返回文件 URL，再用登录 Cookie 下载。

如果后续要给第三方业务系统长期集成，建议在此基础上再封装一层稳定的 `/api/v1/chat` 或 OpenAI-compatible API，避免外部系统直接依赖 Web 前端内部事件格式。

## 2. 前置条件

客户服务器已启动 Evo-Harness，并且外部系统能够访问 Web 端口：

```text
http://<服务器IP>:<COW_WEB_PORT>
```

示例变量：

```bash
BASE="http://192.168.1.10:9899"
COOKIE="/tmp/evo-harness.cookie"
```

说明：

- `BASE` 使用客户服务器实际 IP 和宿主机暴露端口。
- `COW_WEB_PORT` 在部署目录 `compose/.env` 中配置。
- 不要使用容器内端口或容器内路径作为外部系统配置。
- 如果 Web 访问密码为空，认证接口会直接返回成功；生产和内网交付建议配置访问密码。

## 3. 调用总流程

标准文本对话流程：

1. 调用 `POST /auth/login` 登录，保存 Cookie。
2. 调用 `POST /message` 发送消息，获得 `request_id`。
3. 调用 `GET /stream?request_id=<request_id>` 读取 SSE 流。
4. 读取到 `type=done` 后认为本轮回答结束。

带附件流程：

1. 调用 `POST /auth/login` 登录，保存 Cookie。
2. 调用 `POST /upload` 上传文件，获得 `file_path`、`file_name` 和 `file_type`。
3. 调用 `POST /message`，在 `attachments` 中传入上传结果。
4. 调用 `GET /stream?request_id=<request_id>` 读取 SSE 流。
5. 如果 SSE 返回 `type=file` 或 `type=image`，使用返回的 URL 下载生成文件。

取消任务流程：

1. 记录 `/message` 返回的 `request_id`。
2. 调用 `POST /cancel`，传入 `request_id` 或 `session_id`。
3. SSE 可能返回 `type=cancelled`，表示任务已中止。

## 4. 认证

### 4.1 登录

请求：

```bash
curl -s -c "$COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"password":"<WEB_PASSWORD>"}' \
  "$BASE/auth/login"
```

成功响应：

```json
{
  "status": "success"
}
```

失败响应：

```json
{
  "status": "error",
  "message": "Wrong password"
}
```

调用说明：

- 登录成功后服务端会设置 `cow_auth_token` Cookie。
- 后续所有受保护接口都需要携带这个 Cookie。
- Cookie 有效期由服务端配置控制，默认按 Web 会话有效期处理。
- 如果后续修改 Web 密码，已有 Cookie 会失效，需要重新登录。

### 4.2 检查登录状态

请求：

```bash
curl -s -b "$COOKIE" "$BASE/auth/check"
```

可能响应：

```json
{
  "status": "success",
  "auth_required": true,
  "authenticated": true
}
```

字段说明：

- `auth_required=true`：当前服务启用了 Web 密码。
- `authenticated=true`：当前 Cookie 有效。
- `authenticated=false`：未登录或 Cookie 失效。

### 4.3 登出

请求：

```bash
curl -s -b "$COOKIE" \
  -X POST \
  "$BASE/auth/logout"
```

## 5. 发送文本消息

### 5.1 请求

```bash
curl -s -b "$COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "api-test-001",
    "message": "帮我写一个项目周报提纲",
    "stream": true
  }' \
  "$BASE/message"
```

### 5.2 请求字段

```json
{
  "session_id": "api-test-001",
  "message": "帮我写一个项目周报提纲",
  "stream": true,
  "attachments": [],
  "is_voice": false,
  "lang": "zh"
}
```

字段说明：

- `session_id`：会话 ID。外部系统自己生成并保持稳定；同一个 `session_id` 会复用上下文。
- `message`：用户输入文本。
- `stream`：是否使用 SSE 流式输出。建议传 `true`。
- `attachments`：附件列表。无附件时可以省略或传空数组。
- `is_voice`：是否来自语音输入。普通 API 调用传 `false` 或省略。
- `lang`：语言偏好。常用 `zh` 或 `en`，可省略。

`session_id` 建议规则：

- 单用户单会话：`user-<用户ID>-<会话ID>`。
- 单次任务独立上下文：`task-<业务单号>`。
- 不要所有外部请求共用同一个固定 `session_id`，否则上下文会互相污染。

### 5.3 成功响应

```json
{
  "status": "success",
  "request_id": "6f1a7f73-6a62-4b4b-8ad1-4e2b62e5e5d1",
  "stream": true
}
```

字段说明：

- `request_id`：本轮请求 ID，用于读取流式结果和取消任务。
- `stream=true`：表示需要继续调用 `/stream`。

### 5.4 失败响应

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

常见原因：

- 未登录。
- Cookie 过期。
- JSON 格式错误。
- 消息被过滤。
- 服务端异常。

## 6. 读取流式结果

### 6.1 请求

```bash
REQUEST_ID="6f1a7f73-6a62-4b4b-8ad1-4e2b62e5e5d1"

curl -N -b "$COOKIE" \
  "$BASE/stream?request_id=$REQUEST_ID"
```

### 6.2 SSE 格式

接口返回 `text/event-stream`。每条消息格式类似：

```text
data: {"type":"delta","content":"这是"}

data: {"type":"delta","content":"回答内容"}

data: {"type":"done","content":"这是回答内容","request_id":"...","timestamp":1780000000.0}
```

客户端需要按 SSE 协议逐行读取：

- 只处理 `data: ` 开头的行。
- 去掉 `data: ` 前缀后按 JSON 解析。
- 空行表示一条 SSE 消息结束。
- 以 `type=done`、`type=cancelled` 或 `type=error` 作为本轮终止条件。

### 6.3 常见事件类型

| type | 含义 | 处理建议 |
| --- | --- | --- |
| `delta` | 模型回答增量文本 | 追加到当前回答 |
| `reasoning` | 推理过程片段 | 可展示为过程，也可忽略 |
| `phase` | 阶段性状态 | 展示为任务进度 |
| `tool_start` | 工具开始执行 | 展示工具名和参数摘要 |
| `tool_progress` | 工具执行进度 | 展示最近进度 |
| `tool_end` | 工具执行结束 | 展示工具结果摘要 |
| `message_end` | 模型消息阶段结束 | 一般不用作为最终结束 |
| `file` | 生成了文件 | 保存返回 URL，后续下载 |
| `image` | 生成了图片 | 保存返回 URL，后续下载或预览 |
| `voice_attach` | 生成了语音附件 | 有语音能力时处理 |
| `done` | 本轮最终回答结束 | 结束本轮读取 |
| `cancelled` | 本轮已取消 | 结束本轮读取 |

### 6.4 `done` 事件

示例：

```json
{
  "type": "done",
  "content": "这是最终回答。",
  "request_id": "6f1a7f73-6a62-4b4b-8ad1-4e2b62e5e5d1",
  "timestamp": 1780000000.0,
  "user_seq": 12,
  "bot_seq": 13
}
```

字段说明：

- `content`：最终回答文本。流式模式下，前面可能已经通过 `delta` 返回过部分内容。
- `user_seq`、`bot_seq`：会话历史中的消息序号，外部系统可记录，也可以忽略。

处理建议：

- 如果客户端已经拼接了 `delta`，`done.content` 可作为最终校准内容。
- 如果客户端没有处理 `delta`，也可以直接使用 `done.content`。

### 6.5 文件事件

示例：

```json
{
  "type": "file",
  "content": "/api/file?path=%2Fhome%2Fagent%2Fcow%2Foutputs%2Freport.docx",
  "file_name": "report.docx"
}
```

下载方式：

```bash
FILE_URL="/api/file?path=%2Fhome%2Fagent%2Fcow%2Foutputs%2Freport.docx"

curl -L -b "$COOKIE" \
  "$BASE$FILE_URL" \
  -o "report.docx"
```

说明：

- 下载生成文件也需要携带登录 Cookie。
- `content` 返回的是相对 URL，不是完整 URL，需要拼接 `BASE`。
- 文件实际路径是容器内路径，外部系统不要自行拼接容器路径，只使用接口返回的 URL 下载。

## 7. 上传附件

### 7.1 上传单文件

请求：

```bash
curl -s -b "$COOKIE" \
  -F "file=@/path/to/demo.pptx" \
  "$BASE/upload"
```

成功响应：

```json
{
  "status": "success",
  "file_path": "/home/agent/cow/tmp/web_1a2b3c4d.pptx",
  "file_name": "demo.pptx",
  "file_type": "file",
  "preview_url": "/uploads/web_1a2b3c4d.pptx"
}
```

字段说明：

- `file_path`：服务端保存后的文件路径，后续传给 `/message` 的 `attachments.file_path`。
- `file_name`：原始文件名。
- `file_type`：文件类型，常见为 `file`、`image`、`video`。
- `preview_url`：Web 预览路径，需要 Cookie 才能访问。

### 7.2 携带附件发送消息

请求：

```bash
curl -s -b "$COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "api-file-001",
    "message": "分析这个 PPT，给出结构优化建议",
    "stream": true,
    "attachments": [
      {
        "file_type": "file",
        "file_path": "/home/agent/cow/tmp/web_1a2b3c4d.pptx",
        "file_name": "demo.pptx"
      }
    ]
  }' \
  "$BASE/message"
```

说明：

- `attachments.file_path` 必须使用 `/upload` 返回的 `file_path`。
- 不要让外部系统自行构造容器内路径。
- 多个附件可以放在同一个 `attachments` 数组中。
- 图片文件上传后通常会返回 `file_type=image`，可直接传给 `/message`。

### 7.3 上传目录

Web 通道支持目录上传，但外部系统集成时建议优先打成压缩包后按单文件上传，原因是不同 HTTP 客户端对目录上传的 multipart 格式支持不一致。

如果必须上传目录，需要传入：

- `upload_id`
- 多个 `files`
- 对应的 `relative_paths`

该能力更适合 Web 前端使用，不建议作为第一版系统集成接口。

## 8. 非流式轮询模式

如果调用 `/message` 时传 `stream=false`，可以使用 `/poll` 查询结果。

发送消息：

```bash
curl -s -b "$COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "api-poll-001",
    "message": "给我一个测试回答",
    "stream": false
  }' \
  "$BASE/message"
```

轮询：

```bash
curl -s -b "$COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"session_id":"api-poll-001"}' \
  "$BASE/poll"
```

无结果响应：

```json
{
  "status": "success",
  "has_content": false
}
```

有结果响应：

```json
{
  "status": "success",
  "has_content": true,
  "content": "回答内容",
  "request_id": "xxxx",
  "timestamp": 1780000000.0
}
```

建议：

- 新集成优先使用 `stream=true` 和 `/stream`。
- `/poll` 适合不能处理 SSE 的老系统，但实时性和事件完整度不如 SSE。

## 9. 取消任务

请求：

```bash
curl -s -b "$COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "request_id": "6f1a7f73-6a62-4b4b-8ad1-4e2b62e5e5d1",
    "session_id": "api-test-001",
    "lang": "zh"
  }' \
  "$BASE/cancel"
```

成功响应：

```json
{
  "status": "success",
  "cancelled": 1
}
```

字段说明：

- `request_id`：优先使用，精确取消某一轮请求。
- `session_id`：可作为兜底，取消该会话内正在运行的任务。
- `cancelled`：被取消的任务数量。为 `0` 时表示没有找到正在运行的任务，但接口仍按幂等成功处理。

## 10. Python 调用示例

以下示例演示登录、发送消息、读取 SSE，并打印最终回答。

```python
import json
import requests

BASE = "http://192.168.1.10:9899"
PASSWORD = "<WEB_PASSWORD>"

session = requests.Session()

login_resp = session.post(
    f"{BASE}/auth/login",
    json={"password": PASSWORD},
    timeout=30,
)
login_resp.raise_for_status()
login_data = login_resp.json()
if login_data.get("status") != "success":
    raise RuntimeError(login_data)

msg_resp = session.post(
    f"{BASE}/message",
    json={
        "session_id": "api-python-001",
        "message": "帮我写一个项目周报提纲",
        "stream": True,
    },
    timeout=30,
)
msg_resp.raise_for_status()
msg_data = msg_resp.json()
if msg_data.get("status") != "success":
    raise RuntimeError(msg_data)

request_id = msg_data["request_id"]
answer_parts = []

with session.get(
    f"{BASE}/stream",
    params={"request_id": request_id},
    stream=True,
    timeout=(10, 900),
) as resp:
    resp.raise_for_status()
    for raw_line in resp.iter_lines(decode_unicode=True):
        if not raw_line or not raw_line.startswith("data: "):
            continue
        event = json.loads(raw_line[len("data: "):])
        event_type = event.get("type")

        if event_type == "delta":
            answer_parts.append(event.get("content", ""))
        elif event_type == "file":
            print("生成文件:", event.get("file_name"), event.get("content"))
        elif event_type == "done":
            final_answer = event.get("content") or "".join(answer_parts)
            print(final_answer)
            break
        elif event_type == "cancelled":
            print("任务已取消")
            break
```

## 11. JavaScript 调用示例

浏览器内调用可以复用 Cookie。后端服务调用时，需要自行保存并转发 `Set-Cookie`。

```javascript
const BASE = "http://192.168.1.10:9899";

async function login(password) {
  const response = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  const data = await response.json();
  if (data.status !== "success") {
    throw new Error(data.message || "login failed");
  }
}

async function sendMessage() {
  const response = await fetch(`${BASE}/message`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: "api-js-001",
      message: "帮我写一个项目周报提纲",
      stream: true,
    }),
  });
  const data = await response.json();
  if (data.status !== "success") {
    throw new Error(data.message || "message failed");
  }
  return data.request_id;
}

function readStream(requestId, onEvent) {
  const source = new EventSource(`${BASE}/stream?request_id=${encodeURIComponent(requestId)}`, {
    withCredentials: true,
  });

  source.onmessage = (message) => {
    const event = JSON.parse(message.data);
    onEvent(event);
    if (event.type === "done" || event.type === "cancelled") {
      source.close();
    }
  };

  source.onerror = () => {
    source.close();
  };
}
```

## 12. 错误码和排查

### 12.1 HTTP 401

现象：

```json
{
  "status": "error",
  "message": "Unauthorized"
}
```

处理：

- 重新调用 `/auth/login`。
- 确认请求携带了 `cow_auth_token` Cookie。
- 确认 Web 密码没有被修改。

### 12.2 `/message` 返回成功，但 `/stream` 返回 invalid request_id

可能原因：

- `request_id` 填错。
- 服务重启后内存中的请求队列已丢失。
- `/message` 传了 `stream=false`，但仍调用 `/stream`。

处理：

- 确认使用 `/message` 返回的原始 `request_id`。
- 对长任务避免中途重启服务。
- `stream=false` 时改用 `/poll`。

### 12.3 SSE 长时间只有 keepalive

现象：

```text
: keepalive
```

说明：

- 服务正在保持连接，任务可能仍在运行。
- 长任务、工具执行或模型响应慢时会出现。

处理：

- 外部客户端读取超时建议设置到 10 分钟以上。
- 如果业务需要主动中止，调用 `/cancel`。
- 同时查看服务日志定位模型、工具或文件处理耗时。

### 12.4 文件上传失败

常见响应：

```json
{
  "status": "error",
  "message": "Permission denied"
}
```

处理：

- 在服务器执行部署目录下的 `scripts/start.sh`，它会归一化运行目录权限。
- 再执行 `scripts/verify.sh`。
- 确认 `storage/cow/tmp` 可写。

### 12.5 下载生成文件 404

可能原因：

- 未携带 Cookie。
- 文件已被清理。
- 使用了错误的文件 URL。
- 服务配置限制了可下载目录。

处理：

- 使用 SSE 返回的 `content` 原样拼接 `BASE` 下载。
- 下载请求携带同一个 Cookie。
- 不要自行构造 `/api/file?path=...`。

## 13. 集成建议

外部系统调用时建议遵守以下约束：

- 每个业务用户或业务任务使用独立 `session_id`。
- 保存 `request_id`，用于查询日志、取消任务和排查问题。
- SSE 客户端要支持长连接、断开重试和超时控制。
- 读取到 `type=done` 后再把任务标记为完成。
- 对 `file` 和 `image` 事件单独保存文件 URL 和文件名。
- 不要依赖容器内路径；只使用接口返回的 URL 下载文件。
- 不要把 Web 密码、Cookie、模型 Key 写入交付包、补丁包、日志包或前端代码。

当前接口适合内网系统集成和自动化调用。若要作为正式平台级开放接口，建议后续补一个 API Gateway 层，增加固定 Token 鉴权、请求审计、调用限流、统一错误码和 OpenAPI 文档。
