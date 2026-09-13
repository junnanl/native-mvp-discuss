# 数字员工平台

这是一个面向公司内网的数字员工管理台与员工市场项目。它不是新的 Agent Harness，而是以 dsh 为主体平台、以 CowAgent 为当前唯一实际执行器、以一个 Loop owner 管理长效任务的产品化组合。

## 当前组合

```text
dsh-v0.1.1-rc.2
  -> 主体平台 / 插件宿主 / 管理入口 / Loop 控制面
  -> 一个 Loop owner（首选验证 LoopX dsh plugin）
  -> ExecutionProvider
  -> CowAgent（当前执行实现，未来可替换）
  -> 自有产品前端 + AG-UI/A2UI + 受控 Catalog
```

项目按 air-gapped、公司内网、低并发约束推进。已有插件优先复用；尚未证明的 `rc.2 + air-gap + CowAgent` 兼容性必须通过 PoC，不把“有实现”当作“已生产可用”。

## 从哪里开始

1. 先读 [`docs/00-需求与架构决策基线.md`](./docs/00-需求与架构决策基线.md)。它是需求、架构决策和验证状态的唯一事实源。
2. 再读 [`docs/01-技术栈与前端方案.md`](./docs/01-技术栈与前端方案.md) 和 [`docs/02-dsh主体与插件职责矩阵.md`](./docs/02-dsh主体与插件职责矩阵.md)。
3. 实施前按 [`docs/poc/ExecutionProvider与LoopX验收Gate.md`](./docs/poc/ExecutionProvider与LoopX验收Gate.md) 执行 Gate。

## 文档结构

| 路径 | 用途 |
| --- | --- |
| `docs/00-需求与架构决策基线.md` | 产品需求、硬约束、架构边界、当前决策和待验证项 |
| `docs/01-技术栈与前端方案.md` | React、组件、A2UI/AG-UI 和验证工具的技术细节 |
| `docs/02-dsh主体与插件职责矩阵.md` | dsh 官方能力、插件复用边界和源码证据 |
| `docs/research/` | 前端参考、Loop 候选和外部资料证据 |
| `docs/poc/` | CowAgent adapter、LoopX 和离线运行的验收合同 |
| `docs/archive/` | 已合并或被覆盖的历史文档 |

## 当前未完成

- LoopX 插件在 dsh `rc.2` 上的 artifact/profile/runtime/browser smoke。
- CowAgent 对外稳定的 `start/events/inspect/cancel/resume/idempotency` 接入契约。
- 一条真实 SOP 的跨轮执行、独立验证、写回、重启恢复和人工 Gate。
- 断网运行、插件依赖闭包、许可证/SBOM、遥测关闭和网络审计。

产品学习资料仍保留在 [`agent-learn/03-React-AI产品前端开发`](../agent-learn/03-React-AI产品前端开发/README.md)。现有前端原型暂留在该学习目录，待产品代码边界和依赖清理后再迁入 `apps/web`；本项目只引用其方法和历史验证，不把它作为事实源。
