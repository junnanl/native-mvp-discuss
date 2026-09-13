# 数字员工平台协作规则

本文件只约束 `digital-employee-platform` 项目；产品需求和架构以 `docs/00-需求与架构决策基线.md` 为准。

## 不可突破的边界

- dsh 官方 `dsh-v0.1.1-rc.2` 是当前主体平台和插件宿主，版本、profile、依赖和离线制品必须锁定。
- 每个业务 run 只能有一个实际 `ExecutionProvider`。当前实现是 CowAgent；不得让 dsh 原生 Agent、Loop 插件或其他 Harness 形成第二条业务执行路径。
- CowAgent 通过通用 Provider 接入，业务层不得依赖 CowAgent 私有类型；未来更换 Harness 只新增 Provider 实现。
- 长效任务只允许一个 Loop owner。Loop 负责 Goal、状态、唤醒、验证、证据、Gate、预算和停止，不重复实现 CowAgent 的 Plan、工具、Skills 或子 Agent。
- A2UI 必须使用受控 Catalog 和 schema/action 校验；禁止执行任意 JSX、JavaScript、CSS 或未审查的底层组件配置。
- 默认 air-gapped、内网、低并发；不把云端服务、在线市场、外部遥测或公网模型作为运行前提。
- 现成 dsh 能力和社区插件优先复用；兼容问题做最小 patch，不重写同类平台。

## 文档规则

- `docs/00-需求与架构决策基线.md` 是需求和架构唯一事实源。
- 详细技术、检索证据和 PoC 步骤不得另立一套当前结论；发生冲突时回写主基线并标记 `R`、`D` 或 `G`。
- CowAgent 的版本号只记录带日期的验证快照；除非重新核验，不把某个版本写成永久架构锁定。

## 实现与验证

- 先定义用户流程、状态、数据/事件契约和验收条件，再实现代码。
- 每个执行适配都必须覆盖事件顺序、终态、取消/超时、权限、恢复和幂等边界；不可通过逆向 CowAgent Web 私有接口假装完成。
- UI 需要覆盖 loading、empty、error、retry、approval、reconnect 等关键状态，并进行类型、交互、浏览器和可访问性验证。
- 新增依赖必须说明离线制品、许可证、遥测和升级方式；不要预装未被真实需求触发的专业库。
