# ExecutionProvider 适配 Gate 与 dsh/LoopX PoC 执行清单

> 版本基线：dsh `dsh-v0.1.1-rc.2`；当前执行 Provider 为 CowAgent 2.1.7（官方发布说明，2026-08-20）。
> 本文件只依据官方公开文档定义边界，不读取本地 CowAgent 源码，也不把 Web Console 的内部请求当作公共 API。
> 状态：dsh 主体选型已冻结；CowAgent Provider Gate 尚未通过。需求和架构以
> [`../00-需求与架构决策基线.md`](../00-需求与架构决策基线.md) 为准。

## 1. 本轮结论

当前可以证明 CowAgent 具备一次任务所需的产品能力：Plan、工具调用、Skills、子 Agent、每会话工作区与权限、
有界步数、`/cancel`/`/steer` 以及 Scheduler。但目前不能证明它提供给外部 Loop 使用的稳定 Runtime 契约。

官方 CLI 文档列出的 `cow` 命令是服务管理、技能、记忆、知识、备份和状态等命令，没有公开的 `cow run`、
`cow inspect <run_id>` 或 `cow cancel <run_id>`。`/cancel` 和 `/steer` 是当前聊天会话命令；Scheduler 的公开
入口是自然语言/已认证 Web Console，调度结果在隔离 session 执行后注回用户会话。它们不能直接替代：

```text
start(request) -> run_id + ordered events -> terminal result
inspect(run_id)
cancel(run_id)
resume(run_id | checkpoint)
```

因此当前决策是：dsh、Loop 和插件选型继续推进，但真实 CowAgent 接入要先获得公开接口或维护者确认；
不抓取私有 Web endpoint，不把“产品上能运行”写成“第三方可编程接入”。

## 2. 适配器边界

Loop 层只拥有长效控制，不重复实现当前 Harness 的 Plan、工具、Skills 或子 Agent。通用适配器负责把一次
有界执行转换成 Loop 可审计结果，并隐藏 CowAgent 或未来其他 Harness 的具体传输方式。

```text
dsh / LoopX runner
  -> ExecutionProvider.start(request)
  -> current Provider bounded turn
  -> normalized events / evidence
  -> terminal result
  -> independent validator
  -> durable writeback
```

建议先冻结以下项目语义接口（不是对 CowAgent 现有 API 的断言）：

```ts
type PermissionMode = "read-only" | "workspace-write" | "full-access";
type RunTerminal = "succeeded" | "failed" | "cancelled" | "timed_out";

interface RunRequest {
  goalId: string;
  roundId: string;
  prompt: string;
  workspace: string;
  permissionMode: PermissionMode;
  maxSteps: number;
  timeoutMs: number;
  idempotencyKey: string;
  resumeHandle?: string;
}

interface RunEvent {
  runId: string;
  sequence: number;
  type: "started" | "message" | "tool_call" | "tool_result" | "artifact" | "warning" | "heartbeat";
  occurredAt: string;
  payload: unknown;
}

interface RunSnapshot {
  runId: string;
  terminal: RunTerminal;
  startedAt: string;
  finishedAt: string;
  resumeHandle?: string;
  errorCode?: string;
  errorMessage?: string;
  evidenceRefs: string[];
}

interface ExecutionProvider {
  start(request: RunRequest): Promise<{ runId: string }>;
  events(runId: string, afterSequence?: number): AsyncIterable<RunEvent>;
  inspect(runId: string): Promise<RunSnapshot | { terminal: false }>;
  cancel(runId: string, reason: string): Promise<void>;
}
```

这组类型必须由真实 `CowAgentExecutionProvider` 实现后才算当前契约通过；以后替换 Harness 时新增实现即可。
`payload` 不能把未经校验的 Provider 内部对象透传给前端，需在 adapter/事件层做版本化、大小限制和敏感字段过滤。

## 3. Gate 0 验收矩阵

| 编号 | 必须证明 | 通过证据 | 未通过时的处理 |
| --- | --- | --- | --- |
| G0-1 | 外部启动一次任务，不依赖浏览器点击或私有 endpoint | 官方 CLI/HTTP/SDK 示例、版本锁定的 smoke 日志 | 暂停 Loop 二开，向上游申请 runtime contract |
| G0-2 | 返回稳定唯一 `runId`，事件可按序读取 | 重启前后事件序号与终态记录 | 适配器不得自行猜测会话 ID |
| G0-3 | `succeeded/failed/cancelled/timed_out` 可区分 | 四种受控 fixture 的终态报告 | 自定义映射必须记录原始错误，不得统一成 failed |
| G0-4 | 取消/超时后不再启动新工具调用 | 事件时间线 + 工具调用计数 | 不得只 kill 进程后宣称取消成功 |
| G0-5 | workspace 与权限按请求生效 | 只读/写入/全权限三组文件系统断言 | 角色隔离失败即阻断生产接入 |
| G0-6 | 可恢复或明确声明不可恢复 | 中断后 `resumeHandle`/检查点测试 | 若只能重跑，必须引入副作用 reconciliation |
| G0-7 | 重复 `idempotencyKey` 不重复危险副作用 | 重复提交 + 外部 effect ledger/readback | 无法证明时只允许 read-only fixture |
| G0-8 | 断网仍使用内网模型并完成 fixture | 禁用公网后的网络审计、模型与日志 | 任何外连都判 air-gap 失败 |

### 最小 fixture

先使用不产生外部副作用的真实工作区任务：读取一个固定输入文件，生成一个结果文件，运行确定性校验并返回
结构化摘要。第二个 fixture 才测试取消、崩溃恢复和重复唤醒；邮件、生产数据库、支付或不可逆 API 不进入
Gate 0。

## 4. Gate 1：dsh/LoopX 单 SOP 闭环

Gate 0 通过后，在 dsh `rc.2` 中只启用一个 LoopX owner，并复用 MEA 的角色隔离原则：

```text
Manager（LoopX frontier + 当前 Provider，只读上下文）
  -> 一个可机器检查的 bounded next step
Executor（当前 Provider，workspace-write）
  -> 产出文件/事件/工具证据
Machine validator
  -> 确定性测试、schema、文件和权限断言
Auditor（机器检查优先；当前 Provider 独立只读 run 可选）
  -> 只读检查真实工作区，不读取 Executor 的自报完成结论作为唯一依据
Writeback
  -> verified progress / evidence / next wake or stop
```

每轮持久化至少包含：`goalId`、`roundId`、原始目标、输入快照、停止条件、预算、CowAgent `runId`、最后事件
序号、机器验证结果、Audit 结果、证据引用、外部 effect keys、下一次唤醒时间和状态版本。对话 transcript 是
观测材料，不是跨轮状态真源。

## 5. dsh 主体下的触发与故障策略

第一 PoC 用 `systemd service` 保持 dsh profile 进程存活，由 LoopX dsh Driver 应用唯一 scheduler hint；
不部署 Trigger.dev、Temporal 或第二套 scheduler。每次自动 continuation 都执行：

1. 读取 LoopX 唯一 ledger，解析精确 dsh Session/Goal binding，并锁定一个可运行 round。
2. 检查停止条件、预算、人工 Gate 和租约，重复唤醒不得重复 claim。
3. 通过 `ExecutionProvider` 调用当前 CowAgent 一次 bounded turn，持续落盘带序号事件。
4. 进程异常时把未决 round 标记为 `unknown`，先 inspect/readback，再决定 retry 或人工 Gate；不得盲目重跑。
5. 只有 validator/Auditor 通过才写入 `verified`；失败只写 evidence 和 rework 原因。

`systemd` 只负责 dsh 进程生命周期，不拥有业务完成状态或第二套 timer。若后续需要多 worker、持久审批等待、
任务级退避或可靠 fan-out，再单独评估 Trigger.dev/Temporal，并保持 Goal/Audit 的业务事实源唯一。

## 6. 退出与复核条件

- CowAgent 没有公开稳定启动/事件/终态/取消契约：停止逆向接入，向上游协作；dsh/LoopX 继续用 Mock
  Provider 验证，不反向推翻主体选型。
- LoopX dsh 插件未通过 `rc.2` smoke：维护最小兼容 fork；若核心 binding/writeback 语义失败，再退回 dsh
  原生 Goal 做窄范围 PoC，LongHorizon 只作为 MEA/Audit 参考。
- 出现多 Goal、组织级配额、跨员工 handoff 或竞争认领：继续由 LoopX 做唯一治理状态核，不增加第二个 owner。
- 出现持久等待、任务级 retry/backoff、可靠 fan-out 或实时 run stream 缺口：启动 Trigger.dev self-host
  的隔离 PoC，并重新核验 Postgres、Redis、遥测和 air-gapped 升级成本。

## 7. 公开证据

- [CowAgent 文档索引](https://docs.cowagent.ai/llms.txt)
- [CowAgent 2.1.7 发布说明](https://docs.cowagent.ai/releases/v2.1.7.md)
- [CLI 命令总览](https://docs.cowagent.ai/cli/index.md)
- [进程管理 CLI](https://docs.cowagent.ai/cli/process.md)
- [Scheduler](https://docs.cowagent.ai/tools/scheduler.md)
- [Web Console](https://docs.cowagent.ai/channels/web.md)
- [官方 OpenAPI（当前为 Mintlify Plant Store 示例）](https://docs.cowagent.ai/api-reference/openapi.json)

### dsh 主体与生态补充核验

dsh `rc.2` 自身已有 Goal、Jobs、Schedule、Workflow、Approval、Storage、Session 和 Web 插槽；社区又提供
LoopX、AG-UI、A2UI、taskboard/task-center、auto-review、background-agents、DAG 和 automation 等实现。
这些能力优先复用，不另写同类模块。需要注意的是，多数插件默认依赖 `ctx.agents`、session 或 subagent：
它们证明了 dsh 生态能力，不证明 CowAgent 已接入。PoC 的工作是验证 `rc.2` 并把业务执行点统一接到
`ExecutionProvider`；`dsh-dag` 无 journaling/resume、`dsh_workflow` 锁旧快照、在线 `dsh-market` 不符合
air-gapped，因此当前不进入核心组合。完整矩阵见
[dsh 主体与插件职责矩阵](../02-dsh主体与插件职责矩阵.md)。
