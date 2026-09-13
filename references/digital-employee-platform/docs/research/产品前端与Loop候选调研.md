# 产品前端参考与 Loop 候选调研（证据归档）

> 调研日期：2026-08-26。Star、版本和活跃度是当日 GitHub/官方仓库快照，会持续变化。
> 本轮先通过 Exa、Tavily、Serper 做广泛召回，再回到官方仓库、源码、许可证和 CowAgent 官方
> 文档逐项核验。没有读取本地 CowAgent 源码，也没有运行集成 PoC。
>
> **后续决策覆盖**：本报告保留前端与 Loop 候选的广搜证据。当前主体已经改为冻结的
> `dsh-v0.1.1-rc.2`，CowAgent 是可替换 `ExecutionProvider` 的当前实现，Loop 优先验证现有
> `dsh-loopx-plugin`。实施单一事实源见
> [需求与架构决策基线](../00-需求与架构决策基线.md)；主体和插件的详细核验见
> [dsh 主体与插件职责矩阵](../02-dsh主体与插件职责矩阵.md)。

## 一、结论

需求已经收敛，但不是“找一个最高 Star 项目整仓拿来改”。当前组合是：

```text
dsh-v0.1.1-rc.2 主体 / 自有产品页面
  ├─ 产品参考：Multica + Mission Control + LobeHub + 专项项目
  ├─ 插件能力：AG-UI + A2UI + taskboard + approval 等
  ├─ 唯一 Loop owner：优先 LoopX dsh 插件
  └─ ExecutionProvider -> CowAgent（当前实现，可替换）
```

阶段性决策如下：

1. **前端不 fork 一个“大而全平台”**。以 Multica 的产品导航和任务协作为主结构，以
   `builderz-labs/mission-control` 的运营总览、审核和系统状态为控制台参考，以 LobeHub 的任务详情和
   Agent 端体验为交互参考；Trace、员工档案、SOP 和短任务聊天分别借鉴专项项目。
2. **dsh `rc.2` 作为主体平台**。它原生已有 Session、Goal、Jobs、Schedule、Workflow、Approval、Storage、
   plugin/profile 和 Web UI；Developer Preview 通过锁版本处理，不再作为选型阻塞。
3. **LoopX 作为首个 Loop PoC**。LoopX 官方仓库已经提供 init、same-session Driver、GoalBar、binding、quota、
   heartbeat、writeback/spend 的 dsh 插件，不需要从零写 Loop 集成。当前只补 `rc.2` smoke 和
   `ExecutionProvider` seam。
4. **Symphony 作为高 Star 运行器工程参考，不作为当前底座**。它的 poll/reconcile、workspace、重试退避、
   hook 和可观测性值得借鉴，但公开规范仍围绕工单、代码工作区和 Coding Agent，且没有强制独立 Audit。
5. **Omnigent、DeerFlow、CrewAI、AutoGen、Ruflo 不进入当前组合**。dsh 已获得主体身份；其他完整平台会
   形成第二套主体或状态模型。CowAgent 只是当前 Provider，不永久绑定。
6. **Trigger.dev 仍是条件式备用，不是默认依赖**。低并发降低了队列平台的收益，但不能作为唯一排除理由；
   只有 PoC 证明轻量本地触发无法覆盖持久等待、任务级重试/幂等、fan-out 或稳定 run stream 时才复核。
7. **真实执行的第一道 Gate 是 CowAgent 公开调用契约**。CowAgent 2.1.7 已公开有界步数、取消、转向、定时任务、
   子 Agent、多工作区和权限模式，但官方 OpenAPI 链接当前返回 Mintlify 的 Plant Store 样例，不是 CowAgent
   Runtime API。这个 Gate 阻塞真实 CowAgent run，不阻塞 dsh/LoopX/插件用 Mock Provider 完成结构验证。

因此，“高 Star”与“最贴需求”需要拆开处理：

- 前端用多个高 Star 产品建立成熟度参照，但只提炼页面职责和交互，不接管其运行时。
- Loop 运行时优先用 LoopX 的 dsh 插件；LongHorizon 补 MEA/Audit 范式，Symphony 补 runner 工程实践。
  参考多个项目不等于部署多个状态 owner。

## 二、已经对齐的需求

### 产品边界

- 每条 run 只能有一个实际 `ExecutionProvider`；CowAgent 是当前实现，未来可以替换。
- 数字员工是产品表达，不是运行时选型。前端候选可以来自 Agent Workspace、Mission Control、任务工作台、
  可观测平台、员工市场和工作流产品。
- 长效 Loop 只负责跨轮控制：自动触发、持久 Goal/State、决定下一步、有界调用 CowAgent、独立 Audit、
  写回证据、Gate、预算、恢复和停止。
- 当前 Provider 内部的 Plan、工具、Skills 和子 Agent 负责“一轮里怎么干”；外层 Loop 不再引入另一条
  业务执行路径抢这个职责。

### 部署与质量边界

- 公司内网、低并发、air-gapped；运行时不得依赖公网模型、云端账号、在线遥测或托管 SaaS。
- 允许复用可自托管开源项目，但依赖包、镜像、模型、升级包和数据服务必须能预先镜像到内网。
- 固定页面继续使用既定 `Next.js + Tailwind CSS + shadcn/ui` 路线；复杂企业控件通过隔离 AntD adapter
  提供；动态区域使用 CopilotKit + AG-UI + A2UI + 受控 Catalog。
- 前端、CowAgent、Loop 和 Trace 存储必须各有明确事实源，不能让多个项目分别维护一套任务真相。

## 三、证据口径

本报告把结论分成三类：

- **事实**：官方文档、公开源码、许可证、Release 或可复现接口直接证明的内容。
- **推断**：由多个事实推导出的适用性判断，会明确写出前提和缺口。
- **建议**：针对当前需求的阶段性路线，必须经过 CowAgent adapter 和真实 SOP PoC 才能转成最终架构。

广搜阶段得到前端 55 条、Loop 48 条去重结果。随后只把能回到 canonical repo 并核验职责边界的项目
纳入结论。同层 Harness、高 Star 但不符合外层 Loop 定义的项目不会因为流行度进入候选。

## 四、CowAgent 2.1.7 的公开边界

### 已由官方资料证明

| 能力 | 官方事实 | 对接含义 |
| --- | --- | --- |
| 当前版本 | 2.1.7，发布日期 2026-08-20 | 以该公开版本为本轮基线，不看本地旧版本 |
| 有界执行 | `agent_max_steps` 控制单任务最大决策步数 | 可作为 bounded episode 的一层硬上限 |
| 运行中控制 | `/cancel` 在下一次工具执行前停止；`/steer` 在安全检查点注入指令 | adapter 需要使用受支持的等价调用面，不能只 kill 进程 |
| 子 Agent | 临时、隔离上下文、可并行，默认最多 3 个 | 一轮内 fan-out 由 CowAgent 负责，不另加多 Agent Harness |
| 定时任务 | 一次性、固定间隔、Cron；动态任务在隔离 session 中执行 | 已有轻量触发能力，但不等于完整 Goal/Audit Loop |
| 工作区与权限 | 每个 session 可绑定 workspace、model 和 read-only/workspace-write/full-access | 为角色隔离提供产品能力；第三方能否程序化设置仍需证明 |
| 本地部署 | 源码或 Docker；Custom Provider 支持 Ollama、vLLM、LocalAI 和内网 OpenAI-compatible 服务 | 整套离线在模型层有官方路径，但仍需做无外连验收 |
| Web 可观测 | Web Console 可展示流式推理、工具调用、历史 session 和运行日志 | 可借鉴或接入，但内部 Web 接口不能自动视为稳定公共 API |

### 尚未由公开契约证明

- 稳定的“提交一轮任务”HTTP/SDK/CLI 接口及其版本策略；
- 标准化事件流、`run_id`、终态、错误码、Token/成本和工具证据结构；
- 外部调用时的 session 创建、恢复、取消和幂等键；
- 对 Manager、Executor、Auditor 分别设置权限的程序化接口；
- 宕机后的执行恢复语义，以及工具产生外部副作用时的 exactly-once/readback 契约。

CowAgent 文档索引列出了 `/api-reference/openapi.json`，但该文件当前是 Mintlify Plant Store 示例。这是本轮
最关键的未决风险：可以证明 CowAgent 有这些产品能力，不能据此证明第三方 Loop 已有稳定程序化接入面。

## 五、前端参考项目

### 5.1 主参考

| 项目 | 2026-08-26 快照 | 最值得借鉴 | 不直接采用的原因 |
| --- | --- | --- | --- |
| [Multica](https://github.com/multica-ai/multica) | 47,708 Star；v0.4.34；自定义许可证 | `Inbox / Chat / Issues / Projects / Autopilot / Agents / Squads / Usage / Runtimes / Skills`；六阶段任务板、Agent 状态、员工详情、执行日志、定时任务、用量 | 自带 runtime 和任务状态；许可证限制白标和品牌移除，适合信息架构参考，不适合直接 fork |
| [Mission Control](https://github.com/builderz-labs/mission-control) | 6,097 Star；v2.3.0；MIT；仍标注 alpha | 总览状态条、Activity、Fleet Status、Task Pipeline、系统健康、待审核入口；`Inbox -> Assigned -> Running -> Review -> Done`；质量 Gate、审批、审计、日志、成本和 Cron | 可选择性复用 MIT 代码，但整仓仍带自己的 runtime adapter 和状态模型，不能成为第二任务事实源 |
| [LobeHub](https://github.com/lobehub/lobehub) | 81,996 Star；v2.2.14；LobeHub Community License | Goals、Tasks、Agent Directory、Agent Builder、Skill Store；任务详情中的定时、子任务、产物、活动、验证、暂停、聊天抽屉和验收 | 商业衍生许可需单审；技术和视觉体系不同，只借用户流程，不复制代码、资产和品牌视觉 |

三者分别回答三个问题：

- Multica：整个工作台有哪些一级对象，人员和 Agent 如何围绕任务协作；
- Mission Control：管理员每天先看什么，异常、审核、成本和系统健康如何集中处理；
- LobeHub：业务用户进入某个 Agent 或任务后，如何创建、跟进、验证和继续对话。

### 5.2 专项参考

| 专项 | 参考项目 | 借鉴边界 | 许可证/部署提醒 |
| --- | --- | --- | --- |
| Trace 与评估 | [Langfuse](https://github.com/langfuse/langfuse)，33,715 Star | Trace/Session 列表与详情、Observation 树、输入输出、耗时、Token、成本、筛选、评分和 Eval | Core 为 MIT；`ee/` 等目录需企业许可；自托管默认遥测需关闭，air-gapped 要单测 |
| 员工市场与档案 | [StaffDeck](https://github.com/OpenBMB/StaffDeck)，1,760 Star；[AgentSpace](https://github.com/HKUDS/AgentSpace)，950 Star | Gallery、工号/岗位/能力、Persona、Skills、Knowledge、团队、申请/借用、Owner Review、组织、审批和权限资源树 | StaffDeck 为 AGPL-3.0；AgentSpace 为 Apache-2.0 但项目很新；优先借语义和页面结构 |
| SOP 与人工节点 | [Dify](https://github.com/langgenius/dify)，153,526 Star | Workflow/SOP 画布、Human Input、超时、用户动作、运行 Trace、日志和 Monitoring | 自定义许可证与外观权利需审查；只借行为模型，不做像素级仿制 |
| 短任务聊天 | [Open WebUI](https://github.com/open-webui/open-webui)，149,934 Star | 会话历史、Knowledge/Skills/Tools、Channels、Automations、Calendar、用户与分析后台 | 明确提供 offline mode；使用 Svelte，品牌许可有限制；只借交互，不迁移其前端栈 |
| SOP 需求补充 | [CrewMeld](https://github.com/proinsight-io/crewmeld)，685 Star | 员工 onboarding、SOP 画布、时间线、待审批、定时任务、对话和日志 | Star 与成熟度不足，许可证和外观限制需审查，只作为需求清单 |

### 5.3 建议的信息架构

| 自有页面 | 主要职责 | 参考来源 |
| --- | --- | --- |
| 总览 / Inbox | 我的待办、异常运行、审批、阻塞、系统健康和最近活动 | Mission Control + Multica |
| 员工 | 员工市场、已启用员工、岗位/能力/Skills/SOP、Owner、权限和状态 | StaffDeck + AgentSpace + LobeHub |
| 任务 | 人与 Agent 共用任务板；短任务、长效任务入口；负责人、阶段、产物和验收 | Multica + LobeHub |
| 短任务工作区 | 对话、Plan、工具/子 Agent 过程、产物、取消/转向和 A2UI action | CowAgent Web + Open WebUI |
| 长效目标 | Goal、停止条件、下一步、轮次、verified state、预算、Gate 和恢复 | LoopX；LongHorizon 只补 MEA/Audit 参考 |
| Runs / Trace | 每轮 Manager、Executor、Audit、工具事件、耗时、Token、成本、证据和失败原因 | Langfuse + LoopX；LongHorizon 补角色视图 |
| SOP / 模板 | 岗位流程、输入、机器验收条件、人工节点、版本和启停 | Dify + StaffDeck |
| 审批 | 高风险动作、缺少输入、验收失败、接管、批准/退回和恢复 | Mission Control + AgentSpace |
| Usage / 设置 | 模型、权限、配额、运行环境、Skills、渠道、离线健康和审计 | Mission Control + CowAgent |

这不是把几个产品的侧栏拼在一起。一级导航要围绕当前用户任务收敛，详情页通过上下文抽屉或页内 Tab
关联员工、任务、Run 和 Trace，避免同一个对象在多个模块重复建模。

### 5.4 为什么不整仓 fork

1. 候选大多自带 Agent runtime、数据库和任务状态，整仓 fork 会形成双执行器和双事实源。
2. 除 Mission Control、AgentSpace 和 Langfuse Core 等明确开放边界外，多数存在白标、商业衍生、AGPL
   或外观权利限制。
3. LobeHub 偏 Ant Design，Open WebUI 使用 Svelte；强行复用会破坏既定 Next.js/shadcn/Tailwind 体系。
4. `self-hosted` 不等于 `air-gapped`。模型端点、插件、邮件、CDN、镜像、升级检查和遥测仍要逐项关闭或镜像。
5. 当前真正缺的是统一领域模型与交互，不是再维护一套别人的后端和发布节奏。

## 六、外层 Loop 候选核验

### 6.0 dsh 生态线索（后续已上升为主体路线）

广搜后核验了几个 2026-08 月新出现的 dsh/Cordis 插件。后续决定让 dsh 做主体，因此它们不再因“以 dsh
为宿主”而被排除；但名字带 `loop` 或 `task` 仍不能证明已接到统一 `ExecutionProvider`：

| 项目 | GitHub 快照 | 实际定位 | 对当前需求的判断 |
| --- | --- | --- | --- |
| [dsh-task-center](https://github.com/Mason-1011/dsh-task-center) | 1 Star；MIT；npm `0.2.0`；2026-08-22 有提交 | DSH 原生任务生命周期套件：JSON/SQLite ledger、CAS、跨会话 claim、wake/scheduled-send、quota、reaper、五列看板 | 最接近“任务中心 + 长效唤醒”的产品语义，可借 ledger、状态转换和看板；依赖 `@deepseek-ai/dsh-*`、`ctx.agents` 和 DSH session，不能直接驱动 CowAgent；单进程、错过触发和外部 effect exactly-once 仍有限 |
| [dsh-dag](https://github.com/HEO-Club/DSH-DAG) | 3 Stars；MIT；2026-08-19 有提交 | DSH 内部声明式 DAG：并发、依赖、超时、有限重试/退避、结果融合 | 可借 DAG 校验和并发测试；明确 foreground-only、无 journaling/resume、无预算 ledger，执行器是 DSH subagent，不是 CowAgent adapter |
| [dsh-loop-dock](https://github.com/euuuuuuzer/dsh-loop-dock) | 7 Stars；MIT；2026-08-16 有提交 | DSH 的 loop registry/agent-loop 路由层，支持 strategy loop 与 driver loop | 不是长效 Goal 控制面，也不接外部 harness；只能说明 DSH 内部可替换 loop/driver，不能作为 CowAgent 外挂层 |
| [dsh_workflow](https://github.com/omdsh-dev/dsh_workflow) | 104 Stars；MIT；2026-08-13 有提交 | DSH 的可保存/可恢复 workflow 图和多 Agent 调度插件 | 比前三者更完整，但 compatibility/peer 仍锁旧 DSH `0.0.1-rc.2`，并且属于 DSH 同层执行栈；当前不作为最新版 CowAgent 的外层底座 |

这条线的共同事实是：**它们已经解决 dsh 内部的任务、DAG 或 Loop 组合，因而不应重复实现；但默认执行
点仍是 dsh Agent/subagent。** 当前做法是选择性复用其 UI、ledger 和状态语义，把实际业务执行 seam 接到
`ExecutionProvider`，而不是把这些插件全装成多个状态源。

### 6.1 候选定位

| 项目 | 2026-08-26 快照 | 真实定位 | 当前判断 |
| --- | --- | --- | --- |
| [Symphony](https://github.com/openai/symphony) | 26,858 Star；0.0.2；Apache-2.0；engineering preview | 工单轮询、每工单工作区、Coding Agent runner、重试和 reconciliation | 高 Star 工程参考；不是通用 MEA Loop |
| [Omnigent](https://github.com/omnigent-ai/omnigent) | 9,283 Star；0.12.0.dev0；Apache-2.0；Alpha | 统一多 Harness 会话、策略、审批、沙箱、sub-agent 和 Web/桌面协作 | 与 CowAgent 职责重叠，不进入当前运行组合 |
| [LoopX](https://github.com/huangruiteng/loopx) | 5,169 Star；0.5.2；Apache-2.0 | local-first Goal/Todo/Gate/Evidence/Quota/Handoff 状态核；已有 dsh plugin | dsh 主体下的第一 Loop 候选；`rc.2` 兼容和 Provider seam 仍需补测 |
| [LongHorizon-Harness](https://github.com/AMAP-ML/LongHorizon-Harness) | 1,320 Star；0.1.7；MIT；仓库创建不足一个月 | Manager-Executor-Auditor 外层循环、verified state、round ledger、公开 AgentAdapter | MEA/Audit 工程参考；不进入第一运行时 |
| [Mission Control](https://github.com/MeisnerDan/mission-control) | 924 Star；0.10；AGPL-3.0 | Claude daemon、持续 Mission、依赖、审批和费用限制 | 可作 daemon/UI 参考，默认绑定 Claude，不作为 CowAgent Loop |
| [c9r orchestrator](https://github.com/c9r-io/orchestrator) | 21 Star；MIT；活跃开发 | shell-native YAML workflow、trigger、guard、SQLite、event stream | 方向相关但不满足高 Star/成熟度要求 |

### 6.2 核心 Loop 能力

`强` 表示官方实现直接覆盖；`部分` 表示存在相关构件但仍需补模块或重新证明；`缺失` 表示官方主路径
没有该能力。这里不是通用项目排名，只判断它是否满足当前 CowAgent 外层 Loop 合同。

| 验收项 | Symphony | Omnigent | LoopX | LongHorizon |
| --- | --- | --- | --- | --- |
| 自动触发 | 强：轮询 tracker | 部分：RRULE | 部分：只给 scheduler hint，runner 应用 | 缺失：需外部 trigger |
| 持久 Goal/State | 部分：tracker + workspace | 部分：session/schedule，不是 verified Goal | 强 | 部分：单 run task/contract/ledger |
| Manager/下一步 | 缺失语义 Manager | 缺失外层 MEA Manager | 部分：frontier/todo，无永久 Manager | 强 |
| CowAgent 有界执行 | 部分：需替换 Codex app-server | 部分：需 ACP/自定义 executor | 部分：custom runner；typed Turn 仍 experimental | 部分：公开 `AgentAdapter` + episode budget；CowAgent 尚未接入 |
| 独立 Audit | 缺失 | 部分：可配 reviewer，非强制闭环 | 部分：契约要求，validator 由 runner 实现 | 强：主循环硬门 |
| 停止条件 | 部分：tracker 状态 | 弱：主要是 session/策略 | 强：typed frontier/quota/no-follow-up | 部分：Audit 门控，但完成头仍由自然语言解析 |

### 6.3 可靠性、治理与离线

| 验收项 | Symphony | Omnigent | LoopX | LongHorizon |
| --- | --- | --- | --- | --- |
| 幂等写回 | 部分：单权威调度，业务副作用另算 | 部分 | 强：claim/lease/writeback/ACK | 部分：控制 API 有幂等，业务 effect 仍需补 |
| Gate/预算 | 部分：tracker 状态、并发/轮次 | 强：ASK、工具数、成本策略 | 强 | 强：人工 Gate、轮数、角色超时 |
| 重启恢复 | 部分：重新轮询；retry timer/live worker 丢失 | 部分：停机漏触发不补跑 | 强：状态核跨重启 | 部分：ledger/manual resume，非自动续跑 |
| 可观测性 | 强：结构日志/状态接口 | 强 | 强 | 强：Dashboard、round/audit/event 记录 |
| 离线与 CowAgent 适配 | 部分；tracker 与 Coding Agent 耦合，成本高 | 部分；默认 telemetry 且平台职责重 | 强离线；适配成本中偏高 | 本地核心强；适配成本中，接口不稳时升为高 |

### 6.4 LongHorizon 为什么仍有参考价值

以下是它在早期被选为 PoC 基线的原因；当前运行时优先级已让给 LoopX dsh 插件，但这些 MEA/Audit 设计仍可
作为验收清单：

- 真实代码每轮执行 Manager -> Executor -> Auditor，不只是一份 Loop 方法说明；
- Manager 从原始目标、verified progress、失败证据和剩余工作重建下一步；
- Executor 每轮使用新上下文，只完成一个 bounded step；
- Auditor 独立检查文件、UI、日志和测试，未通过的结果只能成为 evidence，不能成为 progress；
- `AgentAdapter.run_episode(prompt, env, budget, ...)` 是公开而且较薄的接入边界；
- round ledger、人工 Gate、stop/resume、Dashboard 和角色权限为首个真实 SOP 提供了完整验证面。

必须同时接受它的缺口：

- 只有约 1.3k Star、版本 0.1.7、项目很新；
- 没有 cron/事件 scheduler 和多 Goal 注册表；
- 自动完成仍依赖 Auditor 的结构化自然语言控制头，不是任意机器谓词；
- 宕机后需要显式 resume，不是无人值守自动续跑；
- 控制 API 的幂等不等于 CowAgent 工具副作用幂等；
- 内置 adapter 的只读 Auditor 不能证明自定义 CowAgent adapter 也正确隔离。

因此 LongHorizon 当前只获得“MEA/Audit 工程参考”身份，不先 fork、不成为第二状态源。

### 6.5 LoopX 成为 dsh 主体下的第一 Loop 候选

LoopX 官方 custom runner 合同与需求高度一致：

```text
runner: wake -> should-run -> claim -> CowAgent bounded action
        -> independent validation -> writeback/evidence -> spend -> scheduler ACK
```

它尤其适合审查以下内容：

- Goal、Todo、Gate、Evidence、Quota 和 Handoff 是否有唯一持久事实源；
- claim/lease 是否防止两个执行者重复处理同一工作；
- validator 失败是否禁止 complete 和 spend；
- scheduler 应用与 ACK 是否幂等；
- 每次唤醒是否从新状态包开始，而不是重放旧 transcript；
- 原始 transcript、凭据和无界日志是否留在状态核之外。

LoopX core 仍让外部 runner 拥有 wakeup、session、Agent invocation 和真实 timer；但后续核验发现官方仓库
已经提供 `packages/dsh-loopx-plugin`，实现了 dsh-native skill、same-session Driver、GoalBar、binding、quota、
heartbeat、writeback/spend 和 scheduler hint。它没有消除 Manager/validator 与当前 Provider adapter 的工作，
但已经消除了“从零写大半个 Loop 插件”的必要。

当前第一阶段就验证 LoopX 的 dsh 插件，且让 LoopX 成为唯一状态权威。现有插件主要锁 dsh
`0.1.0-rc.7/rc.8`，所以必须先在 `0.1.1-rc.2` 上做真实 profile/runtime/browser smoke，并将其 dsh Agent
follow-up 执行点改走 `ExecutionProvider`。LongHorizon 不同时提交任务完成状态。

### 6.6 为什么不选 Star 更高的两个项目

**Symphony** 已支持多种 tracker adapter，但 SPEC 仍把 `Issue Tracker + per-issue workspace + Coding Agent`
写进核心合同，Agent Runner 针对 Codex app-server。它没有独立 Manager/Auditor；scheduler state 在内存中，
重启后 retry timer、running session 和 live worker state 不恢复。适合借鉴轮询、reconciliation、重试退避、
workspace 和 hook，不适合为当前需求大改核心语义。

**Omnigent** 确实有自托管 Server、SQLite/Postgres、RRULE scheduler、策略 Gate、预算和 custom ACP agent，
但官方定位就是 meta-harness，并会拥有会话、推理 loop、工具、sub-agent 和 reviewer。它仍标注 Alpha；当前
scheduler 不补跑停机触发，重叠任务跳过，失败默认等下一周期，retry/backfill/completion tracking 仍不完整。
在坚持“每条 run 只有一个 Provider、且当前 Provider 为 CowAgent”的前提下，接入成本高且边界更差。

## 七、运行时组合与参考组合必须分开

### 实际 PoC 运行时

```text
内网用户
  -> dsh-v0.1.1-rc.2 / 自有产品页面
  -> LoopX dsh plugin（唯一 Loop owner）
  -> ExecutionProvider
       Manager/Executor: 当前 CowAgent 的有界 run
       Auditor: 机器检查优先 + 可选独立只读 Provider run
  -> LoopX ledger / evidence / trace
```

所有业务执行都通过统一 Provider；CowAgent 是当前实现，dsh/LoopX 不绑定其私有类型。机器检查优先于 LLM
Audit；语义 Auditor 不能读取 Executor 的自报结论作为唯一证据。

第一 PoC 用 `systemd service` 保持 dsh profile 存活，LoopX Driver 应用唯一 scheduler hint；不再叠加另一套
timer 或通用队列平台。systemd 不承担 Goal、Audit 或业务状态。

### 只作为设计/工程参考，不安装到运行时

- Multica、LobeHub、StaffDeck、AgentSpace、Dify、Open WebUI：产品与交互参考；
- Mission Control：可选择性复用 MIT 前端模式和组件，但不接其 runtime；
- Langfuse：先借 Trace 信息架构，是否部署服务另做数据量和许可证 PoC；
- LongHorizon：MEA/独立 Audit 参考；
- Symphony：runner 可靠性、reconciliation 和 observability；
- Trigger.dev：未来执行基础设施备用。

## 八、PoC 顺序与退出条件

### Gate 0：冻结 dsh profile 与插件兼容

先锁定 `dsh-v0.1.1-rc.2`、Node/pnpm、profile、tarball、lockfile 和镜像，断网启动后逐个验证 LoopX、
`dsh-ag-ui`、Valuz A2UI 与选定 taskboard 的 artifact/profile/runtime/browser smoke。版本范围不一致只允许
最小兼容 patch，不重写插件。

### Gate 1：ExecutionProvider Spike

先获得官方公开或维护者确认的稳定接入面，验证一轮最小合同：

```text
start(prompt, workspace, permission_mode, max_steps, timeout, idempotency_key)
  -> run_id
  -> ordered events / tool evidence
  -> terminal result: succeeded | failed | cancelled | timed_out

cancel(run_id)
inspect(run_id)
```

必须证明：

- 可以在不操作 Web UI、不抓私有 endpoint 的情况下启动一次任务；
- 能识别唯一 `run_id`、终态和错误原因；
- 超时和取消不会继续启动新工具；
- workspace 与只读/写入权限能按角色设置；
- 全程使用内网模型，断开公网后仍可完成；
- 重复提交同一 `idempotency_key` 不会产生两个危险副作用，或 adapter 能在执行前 readback。

若没有这样的公开面，PoC 在这里停止：向 CowAgent 上游补正式 runtime contract，或在获得明确维护授权后
提供官方 adapter。不能通过逆向 Web 私有接口把“暂时能跑”包装成稳定集成。

### Gate 2：一个真实 SOP 的 Loop 闭环

- 固化 original goal、输入、机器验收条件、最大轮数/时间/预算；
- LoopX frontier/Manager 只产生一个 bounded next step；
- Executor 通过当前 `ExecutionProvider` 完成该步；
- 先运行确定性测试/规则，再由独立只读 Provider Auditor 检查语义结果；
- 只有 Audit 通过才能写入 verified progress；失败只能写 evidence 并进入 rework。

### Gate 3：恢复、幂等与 Gate

- 在 Executor 运行中杀进程并重启，确认从 ledger 恢复而不是重放整段对话；
- 同一 round 重复唤醒不会重复写外部系统；
- 缺少输入或高风险动作会进入人工 Gate，批准后从原状态继续；
- 达到最大轮数、预算或机器停止条件后必然停止；
- stop/cancel 重复调用是幂等的。

### Gate 4：前端最小闭环

管理台只实现一个纵向路径：

```text
员工详情 -> 创建短任务/长效 Goal -> 运行详情 -> Trace/Audit
         -> 人工 Gate -> 恢复 -> verified 完成或明确失败
```

这条路径通过后再扩员工市场、SOP 画布、用量和组织权限，避免先复刻完整产品外观却没有真实执行链路。

### 退出与复核条件

- CowAgent 无稳定 adapter contract：停止真实 CowAgent 接入，不逆向私有接口；用 Mock Provider 继续验证平台。
- LoopX dsh 插件未通过 `rc.2` smoke：维护最小兼容 fork；核心语义失败才退回 dsh 原生 Goal 做窄 PoC。
- 需要多 Goal、组织级 Gate/Quota/Handoff：继续由 LoopX 作为唯一状态核，不引入第二 owner。
- 轻量 trigger 无法覆盖持久等待、任务级 retry/backoff、fan-out 或可靠 run stream：复核 Trigger.dev。
- 任务长期收敛为 issue-driven coding：重新评估 Symphony，而不是现在提前承担其改造成本。

## 九、Trigger.dev 的准确位置

本轮仍不把 Trigger.dev 放进默认组合，理由不是“低并发所以永远不需要”，而是当前首个 SOP 只需要单机/内网
有界轮次、一个真实状态权威和确定性恢复。dsh + LoopX Driver 可以先回答核心风险。

以下任一事实出现时才启动 Trigger.dev self-host PoC：

- 同一时刻需要可靠 fan-out/fan-in 多个独立 CowAgent run；
- 等待审批需要跨部署保存 continuation，而现有 Gate/ledger 无法覆盖；
- 任务级 retry/backoff、队列隔离或并发限制必须成为统一基础设施；
- 前端需要稳定的实时 run stream，现有 CowAgent/Loop 事件无法提供；
- 多 worker 部署后，单机 systemd/cron 已经成为真实故障点。

届时还必须核验它的 Postgres、Redis、对象/事件存储、镜像、遥测和 air-gapped 升级成本，并明确它只拥有
任务执行生命周期，不拥有 Goal/Audit 的业务真相。

## 十、最终决策表

| 层 | 当前决策 | 采用方式 | 复核条件 |
| --- | --- | --- | --- |
| 主体平台 | dsh `0.1.1-rc.2` | 锁 tag/commit、profile 和离线制品；作为插件宿主与管理入口 | 只有真实阻断缺陷才复核，不跟随上游滚动升级 |
| 执行 Provider | CowAgent 2.1.7+ | 当前实现；本地模型；公开 adapter contract | 上游接口能力或业务 Harness 变化 |
| 产品前端 | dsh Web + 自有产品页面 | 组合借鉴 Multica、Mission Control、LobeHub 和专项项目 | 真实用户流程或品牌系统变化 |
| 动态 UI | dsh AG-UI + Valuz A2UI + 受控 Catalog | 先做 `rc.2` smoke，不重写 renderer | 插件兼容 PoC 失败 |
| 首个长效 Loop | LoopX + `dsh-loopx-plugin` | rc.2 薄适配，唯一状态 owner | binding/writeback 核心语义失败 |
| Loop 范式参考 | LongHorizon-Harness | 借 Manager-Executor-Auditor 和独立验收 | 不进入运行时 |
| Runner 参考 | Symphony | 借 polling/reconcile/backoff/workspace/hook | 任务转为 issue-driven coding |
| 通用任务平台 | Trigger.dev | 暂不部署 | 出现持久等待、retry、fan-out、run stream 缺口 |
| 其他完整平台 | Omnigent/DeerFlow 等 | 不采用 | 明确替换 dsh 主体时另开选型 |

## 十一、官方来源

### CowAgent

- [官方文档索引](https://docs.cowagent.ai/llms.txt)
- [2.1.7 Release Notes](https://docs.cowagent.ai/releases/v2.1.7.md)
- [通用命令：max steps、cancel、steer](https://docs.cowagent.ai/cli/general.md)
- [Scheduler](https://docs.cowagent.ai/tools/scheduler.md)
- [Sub Agent](https://docs.cowagent.ai/multi-agent/subagent.md)
- [Web Console](https://docs.cowagent.ai/channels/web.md)
- [Custom Provider 与本地模型](https://docs.cowagent.ai/models/custom.md)
- [源码/Docker 部署](https://docs.cowagent.ai/guide/manual-install.md)
- [当前 OpenAPI 文件](https://docs.cowagent.ai/api-reference/openapi.json)

### Loop

- [LongHorizon-Harness README](https://github.com/AMAP-ML/LongHorizon-Harness)
- [LongHorizon AgentAdapter](https://github.com/AMAP-ML/LongHorizon-Harness/blob/main/src/lh_harness/adapters/base.py)
- [LongHorizon Manager Loop](https://github.com/AMAP-ML/LongHorizon-Harness/blob/main/src/lh_harness/manager.py)
- [LoopX README](https://github.com/huangruiteng/loopx)
- [LoopX Custom Runner Contract](https://github.com/huangruiteng/loopx/blob/main/docs/guides/custom-agent-runner-integration.md)
- [LoopX Peer Supervisor](https://github.com/huangruiteng/loopx/blob/main/docs/reference/protocols/peer-supervisor-v0.md)
- [LoopX dsh plugin](https://github.com/huangruiteng/loopx/tree/main/packages/dsh-loopx-plugin)
- [dsh `v0.1.1-rc.2` packages](https://github.com/deepseek-ai/DeepSeek-Harness/tree/dsh-v0.1.1-rc.2/packages)
- [Symphony SPEC](https://github.com/openai/symphony/blob/main/SPEC.md)
- [Omnigent README](https://github.com/omnigent-ai/omnigent)
- [Omnigent Agent YAML](https://github.com/omnigent-ai/omnigent/blob/main/docs/AGENT_YAML_SPEC.md)

### 前端参考

- [Multica](https://github.com/multica-ai/multica)
- [builderz-labs/mission-control](https://github.com/builderz-labs/mission-control)
- [LobeHub](https://github.com/lobehub/lobehub)
- [Langfuse](https://github.com/langfuse/langfuse)
- [StaffDeck](https://github.com/OpenBMB/StaffDeck)
- [AgentSpace](https://github.com/HKUDS/AgentSpace)
- [Dify](https://github.com/langgenius/dify)
- [Open WebUI](https://github.com/open-webui/open-webui)

## 十二、本轮没有证明的事情

- 没有实际实现或运行 CowAgent adapter；
- 没有证明 LoopX dsh 插件能在 `dsh-v0.1.1-rc.2` 通过完整 smoke；
- 没有证明当前 CowAgent Provider 能完成一轮 start/events/inspect/cancel；
- 没有做断网、断电、重复唤醒或外部副作用的故障注入；
- 没有部署 Langfuse、Trigger.dev 或任何候选平台；
- 没有确认最终行业 SOP、RBAC、审计留存期和具体内网拓扑。

这些不是文档措辞可以消除的风险。下一步应先完成 Gate 0，而不是继续扩大候选清单。
