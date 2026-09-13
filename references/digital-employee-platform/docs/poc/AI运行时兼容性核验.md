# AI 运行时兼容性核验

核验日期：2026-08-19。这里把“协议版本”“npm 包版本”和“本项目是否已经接入”分开记录，避免把名称相近的层当成同一个东西。

## 当前 registry 事实

| 层 | 当前 registry 版本/peer 事实 | 本项目结论 |
| --- | --- | --- |
| CopilotKit React | `@copilotkit/react-core@1.68.1`，peer React 18/19、Zod >=3 | 已用于 `/v2` Provider 和 `CopilotChat`；“CopilotKit v2”是 API 路径/能力，不是 npm 主版本号 |
| CopilotKit runtime | `@copilotkit/runtime@1.68.1`，依赖 AG-UI 0.0.57 系列和 Zod 3 | 已接入 Next server route；版本由 lockfile 固定，不手动强升 AG-UI |
| CopilotKit A2UI | `@copilotkit/a2ui-renderer@1.68.1`，依赖 `@ag-ui/a2ui-middleware`、A2UI web core 和 Zod 3 | 已通过本地 `AbstractAgent`、基础 Catalog、自定义 Catalog 和浏览器渲染验证 |
| A2UI React | `@a2ui/react@0.10.2`，peer React 19.2.7、Zod 3.25.76 | 可作为协议 renderer 候选，但不能与 CopilotKit renderer 未经验证地同时负责同一 surface |
| AG-UI client/core | 当前 registry `0.0.58`；CopilotKit runtime 依赖 `0.0.57` | 通过 runtime 的依赖树锁定版本；不要把 latest 直接覆盖 runtime 的精确依赖 |
| assistant-ui | `@assistant-ui/react@0.15.15`，peer React 18/19 | 只作为聊天 UX 层按需接入；与 CopilotKit 会话状态不能双重维护 |
| Zod | `3.25.76` 同时满足 A2UI React 和当前 CopilotKit 绑定器 | 当前默认保持 Zod 3；升级 Zod 4 必须重新做 Catalog schema 回归 |

## 已确认的职责边界

```text
聊天/线程 UX       -> assistant-ui（可选）
Agent runtime      -> CopilotKit runtime
事件与状态协议     -> AG-UI
动态 UI 描述       -> A2UI
可信组件映射       -> 项目 BYOC Catalog
```

这些层可以组合，但不是“都安装后自动连接”。必须明确哪一层拥有会话状态、哪一层消费 AG-UI 事件、哪一层执行 A2UI renderer，以及审批事件回到哪个 runtime。

## 从实际包内容得到的关键事实

- CopilotKit 1.68.1 同时提供根入口和 `/v2` 子路径；A2UI 技能文档要求 React 端使用 `@copilotkit/react-core/v2` 的 `CopilotKit` provider，而不是旧的根入口。
- `@copilotkit/a2ui-renderer@1.68.1` 的推荐路径是：服务端 `new CopilotRuntime({ a2ui: {} })`，客户端 `<CopilotKit a2ui={{ theme, catalog }}>`；双方通过 `/info` 自动协商，不需要手动塞 `renderActivityMessages`。
- 自定义 Catalog 使用 `createCatalog(definitions, renderers, { includeBasicCatalog: true })`；定义包含可序列化的 Zod props schema，renderer 是项目控制的 React 组件。这个形态正好支持受控 BYOC Catalog。
- `@a2ui/react@0.10.2` 仍导出 `v0_9` 子路径，说明 npm renderer 版本和 A2UI 协议/消息版本不是同一个编号；项目应按实际协议消息版本锁定，而不是把 npm 版本直接写进协议字段。
- `@ag-ui/client@0.0.57` 提供 `HttpAgent`，可直接连接 SSE/protobuf AG-UI 服务并挂 middleware；这可以作为后端使用 LangGraph、PydanticAI 或其他 AG-UI server 时的传输边界。

## 已完成的 runtime spike 范围

1. 独立 Client boundary 已锁定 CopilotKit、AG-UI、A2UI renderer 和 Zod 的 lockfile。
2. 受控 Catalog 已注册 `ApprovalDialog`，动态 props 和 action event 都由 Zod schema 定义。
3. 本地 `AbstractAgent` 已发送 `RUN_STARTED`、step、`ACTIVITY_SNAPSHOT`、A2UI operations、文本消息和 `RUN_FINISHED`。
4. `/info`、SSR/build、Chromium 桌面/移动端、动态绑定、A2UI 弹层和截图均已验证。
5. 点击批准/退回时，CopilotKit action bridge 会把 `userAction` 放入
   `forwardedProps.a2uiAction`，本地 Agent 已实际读取该事件并返回确认消息；测试直接断言第二次
   POST 的 action 名称、surface、source component 和 context，不以本地 React 文案代替回传证据。
6. assistant-ui 暂未安装；当前由 CopilotKit 负责这条 spike 的会话 UX，避免重复状态 owner。

独立的 [MSW SSE transport 测试](../../../agent-learn/03-React-AI产品前端开发/prototype/lib/agui-sse.test.ts) 另行覆盖延迟、重复事件、503 重试和 401 错误。

## 当前不要做的事

- 不因为 `@a2ui/react` 的 npm 版本是 0.10.x 就直接把文档里的 A2UI 协议版本改成另一个数字；协议、renderer 和 npm 包必须分别引用官方版本说明。
- 不把 `@ag-ui/client@0.0.58` 强行覆盖 CopilotKit runtime 的 0.0.57 依赖。
- 当前结论是“CopilotKit runtime 协议链已接入并验证”，不是“已接入生产模型服务”。外部 Agent endpoint、鉴权、权限、断线重连、服务端幂等和观测仍需下一阶段验证。
- inline A2UI surface、弹层视觉和用户 action 回传是三件不同的事；只有 renderer 出现不代表闭环完成。
