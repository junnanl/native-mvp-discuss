# 数字员工 MVP 需求与事件合同

> 版本：MVP-0.1
>
> 日期：2026-08-26
>
> 状态：当前实施基线
>
> 目标：在不引入 dsh、LoopX、登录和持久化的前提下，跑通“员工广场 -> 员工工作台 -> CowAgent 实时执行 -> 结果/事件呈现”。

## 1. 本阶段结论

MVP 是独立的练习与验证切片，代码放在本项目的 `mvp/` 子目录。它保留 React、Next.js、AG-UI 和 A2UI，用于验证产品层与 CowAgent 的实时交互；完整平台的 dsh 插件宿主、ExecutionProvider、Loop owner、多租户和审计仍按主基线另行推进。

### 1.0 前端实施栈

本 MVP 同时承担前端技术栈练习和可落地验证，固定使用：

- Next.js App Router + React 19 + TypeScript strict；
- Tailwind CSS v4 负责布局、Token 和组件样式；
- shadcn/ui 源码模式负责基础交互组件；
- AG-UI Core 负责 CowAgent 事件标准化，A2UI React 负责受控动态界面；
- `react-markdown + remark-gfm` 负责助手正文，不执行原始 HTML；
- Zod 3 负责运行时边界，Lucide React 负责图标。

本阶段不引入 assistant-ui、CopilotKit、TanStack Query、React Hook Form、Ant Design 或独立后端。它们与当前链路职责重叠或没有真实需求，不为凑齐候选技术栈而安装。原生 CSS 仅允许承担全局 Token、基础样式和 A2UI 等第三方 DOM 的窄适配，不再作为页面和业务组件的主要实现方式。

新增包全部精确锁定在 `package.json` 和 `pnpm-lock.yaml`，离线交付时随 pnpm store/npm 镜像准备 tarball。Tailwind、Radix、clsx、tailwind-merge、react-markdown、remark-gfm 均为 MIT；`class-variance-authority` 为 Apache-2.0。它们不包含运行时遥测或云端依赖。升级时按 Tailwind/shadcn 基础层和 Markdown 层分别升级，并重新执行类型检查、生产构建和员工工作台手动验收。

### 1.1 用户流程

```text
员工广场（StaffDeck 风格）
  -> 搜索/浏览数字员工
  -> 点击员工卡片
员工工作台
  -> 查看员工简介、能力和建议问题
  -> 输入任务并提交
  -> Next.js Route Handler 调用 CowAgent /message
  -> /stream SSE 转换为 AG-UI 事件
  -> 实时显示回答、思考、工具调用、记忆检索、文件/产物和终态
```

### 1.2 明确不做

- 不做“经理/需求接待 -> 理解需求 -> 推荐并高亮员工”；这属于下一阶段。
- 不做登录、动态租户、多租户隔离、RBAC、聊天记录持久化、运行台账和审计存储。
- 不接入 dsh、LoopX、dsh 原生 Agent 或第二条执行路径。
- 不逆向 CowAgent 私有 Web 前端接口；只调用其公开 Web Console API。
- 不允许 CowAgent 任意下发 JSX、JavaScript、CSS 或底层组件 Props。

## 2. StaffDeck 参考边界

参考文件：

- `../StaffDeck/frontend-enterprise/src/pages/EmployeeGalleryPage.tsx`
- `../StaffDeck/frontend-enterprise/src/components/EmployeeCard.tsx`
- `../StaffDeck/frontend-enterprise/src/pages/chat/components/ChatEmptyState.tsx`
- `../StaffDeck/frontend-enterprise/src/pages/chat/components/MessageBubble.tsx`
- `../StaffDeck/frontend-enterprise/src/pages/chat/components/ExecutionRecord.tsx`
- `../StaffDeck/frontend-enterprise/src/pages/chat/components/Composer.tsx`
- `../StaffDeck/frontend-enterprise/src/pages/chat/components/HarnessArtifactDownloads.tsx`

只借用信息架构和高频交互：顶部标题、搜索、员工分类、员工卡片、头像/状态/能力标签、点击进入工作台。MVP 自己维护视觉 token 和内容，不复制 StaffDeck 的租户、权限、数据请求或后端 AgentLoop。

## 3. CowAgent 接入合同

### 3.1 模型配置

- 宿主上游：`http://127.0.0.1:15721/v1`
- 模型：`gpt-5.5`
- API key：空，不发送 key
- CowAgent 当前容器：`cowagent-217-verify`，Web Console 映射 `127.0.0.1:19989 -> 9899`
- 由于容器无法访问宿主 loopback，当前容器内配置使用 `http://host.docker.internal:15722/v1`；宿主 `15722` 由用户级 `socat` 服务桥接到 `127.0.0.1:15721`。这是网络可达性适配，不改变上游模型地址。

### 3.2 调用顺序

1. `POST /auth/login` 获取 CowAgent Web Console 会话（凭据只从运行环境读取，不写入仓库）。
2. `POST /message`，请求体至少包含 `session_id`、`message`、`stream: true`，返回 `request_id`。
3. `GET /stream?request_id=...` 读取 SSE。
4. `POST /cancel` 支持用户取消；取消是幂等请求，执行器可能在检查点之后继续发送终态事件。
5. `GET /api/file?path=...` 代理显示 CowAgent 产生的文件/图片，不把本地路径直接暴露给浏览器。

### 3.3 CowAgent 事件到 AG-UI 的映射

| CowAgent 事件 | AG-UI 事件 | UI 用途 |
| --- | --- | --- |
| `delta` | `TEXT_MESSAGE_CONTENT` | 增量回答 |
| `reasoning` | `REASONING_MESSAGE_CONTENT` | 思考/计划折叠区 |
| `text` | `CUSTOM` `cow.text` | 兼容 CowAgent Web 的中间文本分支 |
| `tool_start` | `TOOL_CALL_START` + `TOOL_CALL_ARGS` | 工具名称和参数 |
| `tool_progress` | `CUSTOM` `cow.tool_progress` | 工具实时进度 |
| `tool_end` | `TOOL_CALL_END` + `TOOL_CALL_RESULT` | 工具结果、展示文本、耗时、权限拒绝和成功/失败 |
| `phase` | `CUSTOM` `cow.phase` | 执行阶段 |
| `subagent_step` | `CUSTOM` `cow.subagent_step` | 子 Agent 观测 |
| `file` / `image` / `video` / `voice_attach` / `artifact` | `RAW` | 文件、图片、视频、音频和产物 |
| `message_end` | `CUSTOM` `cow.message_end` | 一轮消息结束提示 |
| `cancelled` | `CUSTOM` `cow.cancel_acknowledged` | 停止请求已确认，继续等待流关闭 |
| `done` | `TEXT_MESSAGE_END` + `CUSTOM` `cow.done` | 最终文本已持久化；不是流终态 |
| `voice_attach` 后的 `stream_end` | `RUN_FINISHED` | 音频附件完成后关闭本轮 |
| `resync_required` | `CUSTOM` + `RUN_ERROR` | 游标失效，提示用户重试 |
| `error` | `RUN_ERROR` | 失败终态 |
| `stream_end` | `RUN_FINISHED` | 唯一正常流结束信号 |
| 未识别类型 | `RAW` `unknown_event` | 不静默丢弃，保留兼容性和诊断信息 |

前端不得只显示最终文本；工具、记忆检索和产物必须能在执行记录中被看到。`memory_search` 与 `memory_get` 作为普通 `tool_start/tool_end` 展示，不在业务层绑定 CowAgent 私有类型。

上述矩阵交叉核对了 CowAgent 2.1.7 的 `web_channel.py` 事件生产分支和 `console.js::startSSE` 全部消费分支。`text`、`video` 当前主要是兼容分支，但 MVP 仍保留处理；内部 `agent_start/turn_start/turn_end/message_start/agent_end` 没有被 Web Channel 对外发布，因此不伪造成浏览器事件。

### 3.4 工具名不是事件类型

`vision`、`bash`、`memory_search` 等属于工具名，不是新的顶层 SSE `type`。它们统一表现为 `tool_start -> tool_progress? -> tool_end`，前端必须使用通用工具卡展示，不能只为 bash 写死分支。

本次源码快照确认的内置工具包括：`bash`、`browser`、`edit`、`env_config`、`evolution_undo`、`ls`、`memory_get`、`memory_search`、`read`、`scheduler`、`search_files`、`send`、`subagent`、`vision`、`web_fetch`、`web_search`、`write`。MCP 工具会在运行时动态注册，也走同一工具事件合同。`subagent` 内部工具步骤额外通过 `subagent_step` 嵌套展示。

## 4. A2UI 合同

MVP 只开放受控目录：`Card`、`Column`、`Text`、`Button`。按钮动作只允许 `prefill_prompt` 和 `submit_prompt`，动作上下文只能是字符串提示词，禁止执行任意代码或样式。

首屏员工工作台使用静态 A2UI 快捷问题。本阶段不要求 CowAgent 动态生成 A2UI，避免为演示协议扩大执行链路。

## 5. 验收清单

- [ ] 员工广场可搜索、浏览并点击至少 4 个数字员工。
- [ ] 员工工作台可提交真实请求，收到 CowAgent 流式文本并显示运行状态。
- [ ] 使用 bash fixture 能显示 `tool_start`、参数、`tool_end` 和结果。
- [ ] 使用 memory fixture 能显示 `memory_search` 工具事件和结果。
- [ ] 取消按钮调用 `/cancel`，UI 显示“取消请求已发送”，最终流正常关闭。
- [ ] 文件/图片事件只通过本地代理链接展示。
- [ ] A2UI 快捷按钮可把提示词填入输入框；动态 A2UI 非法时不执行。
- [ ] loading、empty、error、retry、reconnect、disabled 状态可见；移动视口不发生遮挡。
- [ ] `pnpm typecheck`、`pnpm build` 通过；浏览器完成员工广场和工作台 smoke。
