# dsh 主体与插件职责矩阵

> 决策日期：2026-08-26。本文件是主基线的详细能力和源码证据，不替代
> [`00-需求与架构决策基线.md`](./00-需求与架构决策基线.md)。
> dsh 基线锁定为官方 tag `dsh-v0.1.1-rc.2`，commit
> `b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`。Developer Preview 和未来破坏性变更不作为当前
> 阻塞；所有结论都只对该冻结基线及随项目保存的离线制品成立。

## 一、结论

**dsh 可以作为主体平台，这比另造一套 Agent 管理台、插件宿主和 Loop 控制壳更合适。** 当前组合收敛为：

```text
自有产品前端 / dsh Web UI / A2UI
                 |
dsh-v0.1.1-rc.2 主体平台
  ├─ profile / bundle / plugin / settings
  ├─ session / storage / approval / jobs / schedule
  ├─ AG-UI / A2UI / taskboard 等社区插件
  └─ 一个 Loop owner（优先 LoopX 的 dsh 集成路线）
                 |
ExecutionProvider 稳定兼容层
                 |
CowAgent（当前 Provider；以后可替换）
```

这里有两个关键边界：

1. CowAgent 是当前业务执行 Provider，不是永久绑定的产品架构。每条 run 同时只能有一个实际执行
   Provider；以后更换 Harness 时只新增 adapter，不修改 dsh、Loop、A2UI 和产品领域层。
2. “已有插件”不等于“当前锁定版本可直接生产使用”。横向能力大多已有实现，默认动作是安装、验证、
   薄适配或借鉴，绝不重写；但仍要证明 `rc.2` profile 能加载、浏览器能运行、离线依赖闭包完整，且插件
   不会绕开 `ExecutionProvider` 直接创建第二个业务执行器。

因此，真正需要自研的不是另一套 Harness、Loop、任务队列、A2UI renderer 或插件市场，而是很薄的执行兼容
层、业务领域投影和离线制品配置。

## 二、dsh `rc.2` 已有的主体能力

以下是官方 `dsh-v0.1.1-rc.2` 源码直接证明的能力，不依赖社区宣传。

| 能力 | 官方实现 | 可以直接复用什么 | 明确边界 |
| --- | --- | --- | --- |
| 插件宿主 | Cordis Loader、profile、bundle patch、plugin inventory、settings UI | 插件加载、组合、配置、启停状态和 Web/Host 双侧扩展 | inventory 是只读投影；离线安装仍需本地 tarball/内部包源 |
| 会话与持久化 | Session event log，JSONL/SQLite persistence、projection、checkpoint | 事件溯源会话、恢复、Trace 基础 | 业务 Goal/Run 仍要定义唯一领域投影 |
| Goal | `dsh-goal` | 单会话一个持久 Goal、revision、pause/resume/complete/block、Round 上限 | 只管状态；没有独立评估器、重试、多 Goal 注册表或资源预算 |
| Goal continuation | `dsh-goal-round-driver` | live dsh Agent 空闲后继续下一 Round，取消后暂停 | 同一 dsh 会话；异常不自动重试；恢复后必须显式 resume |
| 后台 Job | `dsh-jobs` + `dsh-jobs-local` | id、owner 隔离、读取、取消、等待、通知、并发上限 | 默认进程内，进程重启即丢失；不是 durable queue |
| Schedule | `dsh-schedule` | 持久 `after/at/every` 提醒、会话恢复后的 overdue 投递 | 只对 live session；无 Cron、无积压回放、存在狭窄重复窗口 |
| Workflow | `dsh-workflow` | 有界脚本、pipeline/parallel、subagent fan-out、事件与取消 | 前台收集；没有 journaling、重启恢复、已保存 workflow 或 token 预算 |
| Approval | `dsh-user-approval` | 当前轮次的一次性允许/拒绝/取消和审计事件 | 不是跨轮持久审批；没有 `allow-always` 和内置人工应答者 |
| Storage | `dsh-storage` + domain KV + JSON/SQLite backend | 插件统一存储 seam，按领域选择后端 | 当前主要是 KV 形态；领域 schema 和迁移仍由插件负责 |
| 外部 Agent 接点 | ACP、subagent provider、workflow `subagentProvider` 等扩展 seam | 可复用外部进程/Provider 桥接思路 | 尚无经过核验的 CowAgent 专用插件；是否可接取决于 CowAgent 公共接口 |
| Web 产品壳 | conversation、goal、jobs、workflow run、settings、slots、client modules | 现成聊天、状态条、运行视图和插件 UI 插槽 | 数字员工、员工市场、SOP、组织权限是产品领域层，不是 dsh 原生对象 |

这说明 dsh 已经覆盖了平台骨架和大量控制面能力。它原生 Goal/Schedule 足以做低风险、同会话的简单 Loop，
但不能把这些能力相加后就宣称拥有组织级长效任务闭环。多 Goal、独立验收、claim/lease、配额、跨员工
handoff 和可靠 writeback 仍应交给一个明确的 Loop owner。

插件运行在受信任的 dsh/Cordis 进程内；Loader、VM timeout 或 profile 隔离不是安全沙箱。第三方插件进入
内网前仍需代码审查、许可证/SBOM、权限最小化和离线网络审计。插件市场的“可安装”只说明装配路径，不说明
供应链或执行安全已经满足生产要求。

## 三、Loop 决策

### 当前默认

优先验证 **LoopX + dsh**，LongHorizon-Harness 降为 MEA/Audit 工程参考，不再作为第一默认运行时。

原因不是只看 Star，而是 LoopX 已经存在官方仓库内的 `packages/dsh-loopx-plugin`：包含初始化命令、
same-session Driver、GoalBar、binding、quota、heartbeat、writeback/spend 和 scheduler hint 的真实代码及
profile/runtime smoke。它证明了 dsh 可以同时作为 UI 宿主和 Loop 控制入口，不需要我们从零写 Loop 插件。

当前仍有两项薄适配：

- LoopX 插件的 peer/dev 基线主要是 dsh `0.1.0-rc.7/rc.8`，必须在冻结的 `0.1.1-rc.2` 上完成
  build、artifact、profile、runtime 和浏览器 smoke；不能只放宽 `peerDependencies`。
- 现有 Driver 给 dsh 的 live Agent 排入 follow-up，默认实际执行仍是 dsh Agent。接入 CowAgent 时，要把
  “执行一个 bounded turn”改走统一 `ExecutionProvider`，或实现 CowAgent 支持的 ACP/provider bridge。

第一阶段只允许一个 Loop 状态权威：采用 LoopX 后，不再让 LongHorizon、`dsh_workflow`、taskboard
execution 和另一套 scheduler 同时提交完成状态。

### dsh 原生 Loop 何时足够

只有同时满足以下范围时，可先不用 LoopX：单个 live 会话、一个当前 Goal、只按 Round 上限控制、不要求独立
Audit、不要求跨员工 handoff/claim、重启后允许人工 resume。它适合验证 dsh 与执行 Provider 的基本链路，
不适合作为最终的企业长效任务合同。

## 四、插件复用矩阵

| 能力 | 候选实现 | 当前处理 | 不重复造轮子的边界 |
| --- | --- | --- | --- |
| AG-UI / HTTP / SSE | `dsh-ag-ui` | **直接复用后薄改执行路由**；它已有 `rc.2` 真实 profile、SSE、幂等和恢复测试 | 不重写 Gateway；把默认 `ctx.agents.create/resume` 改接 `ExecutionProvider` |
| A2UI | `@valuz/dsh-valuz-genui` | **rc.2 兼容 PoC**；它是真 A2UI 路线 | 不重写 renderer；只做版本兼容、受控 Catalog、主题 token 和 Action 路由 |
| 另一套 GenUI | `@changfenhuang/dsh-genui` | 暂不与 Valuz 同时部署 | 它是 `dsh-ui` DSL，不是 A2UI；只在放弃 A2UI 路线时二选一 |
| Loop | `dsh-loopx-plugin` + LoopX | **首选薄适配** | 不自研 Goal/Todo/Gate/Evidence/Quota/Handoff；只补 rc.2 和 Provider seam |
| 任务台账/看板 | `dsh-taskboard`、`dsh-task-center` | **复用 UI/ledger，替换 ExecutionService** | 不重写看板、状态转换、SSE 和恢复语义；禁止其直接创建 dsh Agent 执行业务 |
| 审核 | `dsh-auto-review` | **可选直接装/薄适配** | 不重写 approval/audit UI；若 reviewer 也必须由当前 Provider 执行，则替换 subagent 路由 |
| 长会话 Agent | `dsh-background-agents` | 暂不进核心 | 它没有 scheduler，且默认使用 dsh continuable subagent；有明确需求再接 Provider |
| DAG | `dsh-dag` | 只借 DAG 校验/测试，暂不作为长效状态源 | 无 journaling/resume，不能代替 LoopX |
| 持久 workflow | `dsh_workflow` | 暂不安装 | 公开兼容基线是旧 dsh 快照，且会形成另一套执行/状态模型 |
| 自动化 | `dsh-automation` | 暂不安装 | 现有证据不足以证明 `rc.2` 真宿主兼容；低并发也不需要第二 scheduler |
| 插件市场 | `dsh-market` | 仅联网环境用于发现，不进入内网运行时 | 不自研在线市场；把审核后的 tarball 和 manifest 放入现有 Nexus/Verdaccio/制品库 |
| 通用任务平台 | Trigger.dev/Temporal/Hatchet | 当前不部署 | 出现多 worker、持久 waitpoint、统一 retry/backoff 或可靠 fan-out 后再复核 |

## 五、最小自研面

### 1. `ExecutionProvider` 接口和 CowAgent adapter

不要把公共接口命名为 `CowAgentAdapter`，避免产品层永久绑定当前 Harness。建议冻结：

```ts
interface ExecutionProvider {
  start(request: RunRequest): Promise<{ runId: string }>;
  events(runId: string, afterSequence?: number): AsyncIterable<RunEvent>;
  inspect(runId: string): Promise<RunSnapshot>;
  cancel(runId: string, reason: string): Promise<void>;
}
```

当前实现是 `CowAgentExecutionProvider`。以后换 Harness 只新增实现。工作量主要是字段映射和生命周期桥接，
代码量预期不大；风险不在代码行数，而在 CowAgent 是否公开稳定的启动、事件、终态、取消、权限与恢复契约。

### 2. 插件执行边界适配

把 `dsh-ag-ui`、LoopX Driver、taskboard 和 auto-review 中直接调用 `ctx.agents`/`ctx.subagents` 的位置统一
路由到 `ExecutionProvider`。这是少量有边界的 patch，不是重新实现这些插件。

### 3. 产品领域投影

定义 `Employee / Skill / SOP / Goal / Run / Gate / Evidence / Artifact` 与 dsh/LoopX id 的映射，构建员工
市场、员工详情、任务、Run/Trace 和审批页面。这里是本产品真正需要二开的部分。

### 4. 离线制品配置

在联网构建区保存精确 tarball、lockfile、SHA-256、许可证/SBOM 和容器镜像，导入已有内网制品库。内网
profile 只引用固定版本和本地源，运行时禁止 npm、GitHub、CDN、遥测和在线插件目录访问。这是供应链配置，
不是重写一个插件市场。

## 六、验证顺序

1. 冻结 dsh `rc.2`、Node/pnpm、profile 和所有 tarball，完成断网 boot。
2. 对 LoopX、`dsh-ag-ui`、Valuz A2UI 和选定 taskboard 逐个做 artifact/profile/runtime/browser smoke。
3. 用无外部副作用 fixture 验证 `ExecutionProvider` 的 start/events/inspect/cancel、权限、超时和断网运行。
4. 只启用一个 Loop owner，跑通一条 `Goal -> bounded turn -> validator -> evidence -> next/stop` SOP。
5. 最后接产品页面和 A2UI action，验证刷新、重连、重复事件、人工 Gate 与恢复。

任何插件只要第 2 步不通过，就固定 fork 到项目命名空间并维护最小兼容 patch；不因此重写其完整功能。

## 七、最终回答

“很多插件兼容应该已经有人做了”这个判断大方向是对的：AG-UI、A2UI、LoopX、任务看板、审核、后台
Agent、DAG、workflow 和插件发现都已有实现，dsh 本身也已经提供 Goal、Jobs、Schedule、Approval、Storage、
Session 和 Web 插槽。我们不需要重复造这些轮子。

需要保留的工程判断是：目前没有找到一个已证明在 `dsh-v0.1.1-rc.2 + air-gapped + CowAgent` 组合下
开箱通过的整包方案。剩余工作应该叫“锁版本、做 smoke、替换执行 seam、接产品领域”，而不是“从零开发
平台”。

## 八、主要证据

- dsh 官方 tag：`dsh-v0.1.1-rc.2`
- 本地官方 checkout 的源码核验（对应上述 tag）：
  - Agent 公共运行/取消/idle/maintenance：`packages/core/agent/src/runtime-types.ts:64-104`
  - AgentFactory create/resume：`packages/core/agent/src/index.ts:172-213,405-430`
  - Goal continuation 直接 `agent.followup(...)`：`packages/goal/goal-round-driver/src/index.ts:137-192`
  - Schedule runtime 使用 `runMaintenance`/`followup`：`packages/schedule/schedule/src/runtime.ts:76-110,254-278`
  - Jobs-local 进程内 Map 与 owner 并发上限：`packages/jobs/jobs-local/src/index.ts:86-116,131-145`
  - WorkflowEngine start seam：`packages/workflow/workflow/src/index.ts:150-168`
  - 外部 SubagentProvider 类型接点：`packages/subagent/subagent/src/types.ts:247-305`
  - Approval 只接受开放 dsh Agent turn 并写审计 pair：`packages/interaction/user-approval/src/index.ts:239-275`
  - Session append-only persistence：`packages/session/session-persistence/src/index.ts:78-115`
  - Storage hub 只注册 backend/form：`packages/storage/storage/src/index.ts:1-68`
- dsh 官方包总览：<https://github.com/deepseek-ai/DeepSeek-Harness/tree/dsh-v0.1.1-rc.2/packages>
- dsh Goal：<https://github.com/deepseek-ai/DeepSeek-Harness/tree/dsh-v0.1.1-rc.2/packages/goal/goal>
- dsh Jobs：<https://github.com/deepseek-ai/DeepSeek-Harness/tree/dsh-v0.1.1-rc.2/packages/jobs/jobs>
- dsh Schedule：<https://github.com/deepseek-ai/DeepSeek-Harness/tree/dsh-v0.1.1-rc.2/packages/schedule/schedule>
- dsh Workflow：<https://github.com/deepseek-ai/DeepSeek-Harness/tree/dsh-v0.1.1-rc.2/packages/workflow/workflow>
- dsh Approval：<https://github.com/deepseek-ai/DeepSeek-Harness/tree/dsh-v0.1.1-rc.2/packages/interaction/user-approval>
- LoopX dsh 插件：<https://github.com/huangruiteng/loopx/tree/main/packages/dsh-loopx-plugin>
- LoopX custom runner：<https://github.com/huangruiteng/loopx/blob/main/docs/guides/custom-agent-runner-integration.md>
