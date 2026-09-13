# CowAgent 办公能力、HTML 汇报与工作流调研

更新日期：2026-07-12  
适用项目：CowAgent 2.1.2 / Evo-Harness 内网离线交付

## 1. 调研目标

本次调研回答四个问题：

1. 当前已经有 OfficeCLI 和 `pptx` Skill，是否还需要再引入一个 PPT Skill。
2. 是否需要引入通用 HTML 汇报材料 Skill，以及应选择完整应用还是轻量 Skill。
3. 固定办公流程应封装为 Skill、脚本还是传统 Workflow。
4. 固定流程封装是否与现有 `skill-creator` / 自动进化生成 Skill 的能力重复。

调研结论必须服从既定离线交付约束：客户服务器不得联网安装、不得现场拉包、不得现场执行 npm/pip 安装、不得依赖 CDN，并且新增能力要能通过 Skill、Toolpack 或小体积补丁交付。

## 2. 当前项目事实

### 2.1 当前办公能力

开发环境当前包含：

- OfficeCLI `v1.0.134`：Apache-2.0，单文件 Linux x64 二进制，已完成断网 DOCX/XLSX/PPTX 代表性回归。
- `pptx`、`docx`、`xlsx`、`pdf`：当前工作区中的办公 Skill。
- `eda-reporter`：只能处理 CSV/Excel 的探索性数据分析，输出本地 ECharts HTML，不是通用汇报材料生成器。
- `skill-creator`：负责创建、校验和打包 Skill，是元能力，不是具体业务流程。
- CowAgent 自动进化：发现明确、可复用的重复流程后，可以调用 Skill 创建规范，把流程沉淀为新的工作区 Skill。

### 2.2 两个尚未完成客户现场交付的项目

此前提到的“两项尚未离线部署”可以明确为：

1. `v1.0.3` 运行配置持久化现场更新包已经制作，但尚未导入或部署到客户内网服务器。
2. OfficeCLI 已形成 `v1.0.4-officecli-toolpack` 正式客户增量包，并在开发环境完成部署、验证、回滚和再次部署；尚未在客户内网部署。

这两项都不能视为客户现场已经具备。

### 2.3 CowAgent 的 Skill 调度限制

CowAgent 2.1.2 的系统提示要求 Agent 在多个匹配 Skill 中只选择一个最匹配的 Skill，并且明确要求不要同时读取多个 Skill。

因此，以下设计不可靠：

```text
pptx Skill -> 再读取 officecli Skill -> 再读取某个工作流 Skill
```

正确方式是让一个面向业务的顶层 Skill 拥有完整流程，并直接调用固定路径下的脚本或 Toolpack。执行引擎可以复用，但不能依赖运行时连续激活多个 Skill 才能完成任务。

### 2.4 CowAgent 没有本地确定性 Workflow 引擎

当前代码中没有独立的本地 DAG、节点编排、状态机、人工审批或可视化 Workflow 引擎。存在的 LinkAI apps/workflows 属于外部服务接入，不适合作为客户内网离线基线。

CowAgent 当前的“工作流”主要是写在 `SKILL.md` 中的步骤和条件分支，由 Agent 解释执行。它具备复用性，但不天然具备传统工作流引擎的强确定性、断点续跑和节点级审计能力。

## 3. 社区项目检索结果

Star 数为 2026-07-12 的检索快照，只用于判断社区热度，不能替代许可证、依赖、安全和实际效果验收。

| 项目 | Star 快照 | 许可证 | 主要能力 | 离线适配判断 | 结论 |
|---|---:|---|---|---|---|
| [anthropics/skills](https://github.com/anthropics/skills) | 160,492 | 每个 Skill 独立授权 | Agent Skills 官方示例库 | `frontend-design`、`skill-creator` 为 Apache-2.0；`pptx/docx/xlsx/pdf` 为专有限制条款 | 只能逐个 Skill 审核，不能按仓库整体直接打包 |
| [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) | 15,308 | Apache-2.0 | Agent 原生 Office 文件读写、校验和渲染 | 单二进制，已在本项目断网验证 | 继续作为 Office 执行引擎 |
| [nexu-io/html-anything](https://github.com/nexu-io/html-anything) | 7,710 | Apache-2.0，vendor 资产需逐项核验 | 75 套 HTML/Deck/报告 Skill 模板和完整 Web 编辑器 | 完整应用依赖 Next.js、pnpm 和本地 coding-agent CLI；部分模板允许 CDN/在线字体 | 不引入完整应用，只评估并移植少量清晰授权、可自包含的 Skill 模板 |
| [chuspeeism/dashiAI-ppt-skill](https://github.com/chuspeeism/dashiAI-ppt-skill) | 2,532 | AGPL-3.0；PPTX 导出子包含专有授权 | 浏览器可编辑 HTML 演示、12 主题、PPTX/PDF 导出 | 首次运行会 npm 安装，依赖 Node 20、Chrome、预览服务和版本检查；包体较大 | 当前不纳入离线能力基线 |
| [1weiho/open-slide](https://github.com/1weiho/open-slide) | 5,727 | MIT | Agent 编写 React 幻灯片，导出 HTML/PDF | 依赖 React/Vite/Node 构建；不提供原生 PPTX | 可参考 Skill 分层设计，不作为当前客户运行时 |
| [gitbrent/PptxGenJS](https://github.com/gitbrent/PptxGenJS) | 5,829 | MIT | JavaScript 生成 PPTX | 已固化在当前基础镜像 | 保留为 OfficeCLI 不支持复杂场景时的后备引擎 |
| [hakimel/reveal.js](https://github.com/hakimel/reveal.js) | 71,912 | MIT | HTML 演示框架 | 可静态离线运行，但不解决 PPTX 编辑 | 仅在明确需要浏览器演示框架时考虑 |
| [slidevjs/slidev](https://github.com/slidevjs/slidev) | 47,621 | MIT | Markdown/Vue 演示 | 依赖 Node 构建链 | 不符合客户现场不构建原则 |
| [agentskills/agentskills](https://github.com/agentskills/agentskills) | 22,940 | Apache-2.0 / CC-BY-4.0 | Agent Skills 开放规范 | 明确支持用 Skill + scripts/assets 封装可重复工作流 | 作为 Skill 结构和兼容性基线 |
| [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) | 27,893 | MIT（索引） | 1000+ Agent Skill 索引 | 索引中的每个 Skill 仍需单独审核 | 作为候选发现渠道，不直接批量安装 |
| [n8n-io/n8n](https://github.com/n8n-io/n8n) | 196,150 | fair-code | 可视化工作流平台 | 需要独立服务和较大依赖面 | 当前不引入，避免与 CowAgent 平台能力重叠 |
| [langgenius/dify](https://github.com/langgenius/dify) | 148,578 | 项目自有许可 | Agent/Workflow 平台 | 需要完整平台栈 | 不为单一流程能力再引入第二个平台 |
| [FlowiseAI/Flowise](https://github.com/FlowiseAI/Flowise) | 54,544 | 项目自有许可 | 可视化 Agent 流程 | 需要 Node 服务和额外运行组件 | 当前不引入 |

检索时固定的候选提交：

- HTML Anything：`aea749837d780f1da6261f2ed777d7e107231f5f`
- DashiAI PPT Skill：`0daad657ea105fdd2b0f768a4f5ebe75f1f0b60f`
- open-slide：`d3bd0fa4c767c2fcb3986c38886dfb5ada1f5b06`

后续如果进入试验，不得使用 `latest`，必须固定提交或正式版本，并记录 SHA256。

## 4. 许可证适用边界

当前首装包中的 `pptx`、`docx`、`xlsx`、`pdf` Skill 带有 Anthropic 专有限制条款，其中包含复制、衍生和向第三方分发方面的约束。

- 不得在服务之外长期保留副本。
- 不得复制或制作衍生作品。
- 不得向第三方分发、转授权或转移。

项目方已经明确：当前部署和离线使用不涉及向第三方分发。因此，该条款在当前使用边界下不作为交付风险或交付阻断项，也不要求删除、关闭或替换现有 Skill。

当前处理原则：

1. 当前开发目录、离线包和已部署环境继续保留现有 Skill，不因本次调研删除或停用。
2. 只有未来使用边界变为向独立第三方法律主体销售、转交或公开分发时，才重新做许可证适用性确认。
3. 新增 Skill、模板、字体、图标、JavaScript 库和二进制仍记录来源、版本和许可，目的是保持工程可追溯，不代表当前存在许可证风险。
4. 当前 `skill-creator` 文件声明引用 `LICENSE.txt`，但工作区种子中没有对应许可证文件；后续可补齐来源和许可证证据，作为资产清单完善项，不作为当前交付阻断。

## 5. PPT 能力决策

### 5.1 不再新增 PPT Skill

当前决定不是“暂缓”，而是不再安装或创建任何新的 PPT Skill。原因是：

- 会与现有 `pptx`、OfficeCLI 的触发描述重叠。
- CowAgent 运行时只选择一个最匹配 Skill，多个通用 PPT Skill 不会自然形成稳定组合。
- DashiAI 同时引入 AGPL、专有导出组件、Node 依赖、Chrome 和额外预览服务，当前没有必要增加这组复杂度。
- open-slide 主要输出 HTML/PDF，并要求 Node 构建，不等同于可编辑 PPTX。
- 新增完整运行时会扩大补丁体积、依赖面和现场排障范围。

### 5.2 保持现有 PPT 结构

后续 PPT 继续使用现有能力，不创建 `evo-presentation` 或其他新入口：

- 现有 `pptx` Skill 继续负责演示文稿内容和设计规则。
- OfficeCLI 继续作为开发环境已验证的 PPTX 执行候选。
- PptxGenJS 保留为现有后备工具。
- 旧 Skill 文件继续保留，不因本次 HTML 选型发生变化。

如果后续需要固定 PPT 步骤，只允许在现有 Skill 内做必要优化，不能以“统一流程”为名新增一个职责重复的 PPT Skill。

### 5.3 旧 Skill 的处理

现阶段继续遵守既定规则：不直接删除旧 Skill，也不因本轮 HTML 汇报选型调整 PPT Skill 的前台状态。

当前不涉及第三方分发，因此不需要因许可证原因处理旧 Skill。未来是否停用某个旧 Skill，只由 OfficeCLI 的真实业务替代验收决定，停用也只改变前台状态，文件仍保留用于回退。

## 6. HTML 汇报能力决策

### 6.1 需要新增通用 HTML 汇报 Skill

`eda-reporter` 只适合数据画像和异常分析，无法覆盖以下需求：

- 高管决策简报。
- 项目汇报、周报、总结和复盘。
- 调研报告、方案说明和对比报告。
- 带文本、表格、图表、结论和行动项的长页面。
- 浏览器直接打开、打印或归档的单文件 HTML。

因此需要一个独立的通用 HTML 汇报 Skill。社区检索和断网最小验证后，唯一推荐候选已经收敛为 `TheoRata/Report-Skill` 的 `skills/report/`；不再从零创建 `evo-html-report`。

### 6.2 不引入 HTML Anything 完整应用

HTML Anything 的 Skill 模板和设计约束有参考价值，但其完整应用依赖 Next.js、React、pnpm、本地 coding-agent CLI 和独立 Web 编辑器，与 CowAgent Web 平台重复。

本轮不从 HTML Anything 抽取或拼装模板，避免重新组合出一套自建方案。HTML 汇报直接复用已选定的 Report-Skill，仅允许满足以下条件的最小离线适配：

- 授权来源清晰，允许商业分发和修改。
- 最终输出为单文件 HTML 或“HTML + 本地 assets”。
- 不使用 Tailwind CDN、jsDelivr、unpkg、Google Fonts 或远程图片。
- 图表复用当前已离线化的 ECharts `5.6.1`。
- 不要求 npm/pnpm/pip 安装，不要求启动额外常驻服务。
- 生成后执行外部资源扫描、HTML 结构检查和浏览器打开验证。

### 6.3 与 `eda-reporter` 的边界

- `eda-reporter`：输入 CSV/Excel，重点是统计分析、数据质量、相关性和异常值。
- `html-report`（Report-Skill 的 CowAgent 适配名）：输入文档、文本、表格或综合材料，重点是长篇汇报结构、结论表达、决策信息和视觉呈现。

两个 Skill 的 description 必须写出互斥触发条件，避免同时匹配。

## 7. 固定流程如何封装

### 7.1 三种层级

#### 层级 A：说明型 Skill

适合有固定原则、但每次内容变化较大的任务。例如汇报结构设计、写作风格和页面规划。

```text
用户需求 -> Agent 读取 SKILL.md -> 按步骤调用工具
```

优点是轻量；缺点是执行结果仍受模型判断影响。

#### 层级 B：Skill + 确定性脚本

适合本项目大多数固定办公流程，也是推荐默认方案。

```text
用户需求
  -> 顶层 Skill 形成结构化参数
  -> 调用固定脚本
  -> 脚本执行生成、校验、渲染和打包
  -> Skill 负责结果解释和必要修正
```

脚本应负责：

- 固定输入输出路径。
- 参数和 schema 校验。
- 固定命令顺序。
- 失败退出码。
- 日志和中间产物。
- 外部 URL、缺失资源、文件完整性检查。

这已经具备传统 Workflow 的大部分确定性，但不需要引入新的工作流平台。

#### 层级 C：独立 Workflow 引擎

只有出现以下需求时才考虑：

- 大量可视化分支和人工审批节点。
- 多系统长事务编排。
- 任务跨小时或跨天执行。
- 断点续跑、队列、节点级重试和审计是硬要求。

当前 PPT、Word、Excel、HTML 汇报不需要达到这一层，不引入 n8n、Dify 或 Flowise。

### 7.2 默认判断标准

| 场景 | 承载方式 |
|---|---|
| 主要是知识、规则、写作与设计原则 | Skill |
| 有稳定命令链、格式转换和校验 | Skill + scripts |
| 需要额外单二进制或用户态运行时 | Skill + Toolpack |
| 需要系统库或改变主容器运行时 | 基础镜像升级 |
| 需要审批、长事务、可视化 DAG | 再评估独立 Workflow 引擎 |

## 8. 与 `skill-creator` 是否重复

不重复。

- `skill-creator` 是“怎么创建一个合格 Skill”的元 Skill，负责目录结构、触发描述、脚本、资源和校验规范。
- 本轮选定的 `html-report` 或未来某个确实缺失的业务流程，是由它帮助适配或创建的业务 Skill。
- CowAgent 自动进化负责判断“是否出现了值得沉淀的重复流程”，然后按 `skill-creator` 规范创建或修改 Skill。

三者关系是：

```text
自动进化：判断是否需要沉淀
skill-creator：规定如何沉淀
业务 Skill：承载沉淀后的具体流程
```

因此不需要再安装一个新的“Generate Skill Skill”。更合理的改进是扩展现有 Skill 创建治理规则，增加离线交付检查：

- 许可证和署名检查。
- 外部 URL/CDN 扫描。
- npm/pip/npx/uvx 和二进制依赖扫描。
- 依赖变化分类：Skill、Toolpack 或基础镜像。
- manifest、SHA256、备份和回滚要求。
- Skill 触发冲突检查。

## 9. 最终建议

[√] 保留 OfficeCLI 作为 Office 文件执行引擎。

[√] PPT 保持现状，不引入 DashiAI、open-slide，不创建 `evo-presentation` 或其他新 PPT Skill。

[√] 选定 `TheoRata/Report-Skill` 作为唯一通用 HTML 汇报候选，不从零创建 `evo-html-report`。

[√] 固定流程默认采用“一个顶层 Skill + 确定性脚本 + 可选 Toolpack”，暂不引入独立 Workflow 平台。

[√] 保留并增强现有 `skill-creator`，不再安装重复的 Skill 生成器。

[√] 已确认当前不涉及第三方分发，不把现有办公 Skill 的许可证条款作为当前交付风险或阻断项。

[√] Report-Skill 已完成 CowAgent 最小适配、113 项断网测试、中文浏览器截图和 Web 文件下载验证，并已形成 `v1.0.5-html-report` 客户增量包；尚未在客户内网部署。

[√] HTML 方案复核后继续使用 Report-Skill；`nexu-io/html-anything` 暂缓，不进入当前开发、Compose、镜像和补丁范围。只有真实业务效果证明当前方案不足时才重新评估。

## 10. 后续实施顺序

1. 在 CowAgent 前端使用真实业务提示确认 `html-report` 的模型触发和附件展示。
2. 使用包含长表格的真实业务材料补充内容验收；移动端视口技术回归已经通过。
3. 保持 PPT 现状，不新增 PPT Skill。
4. 验收通过后再决定是否制作正式 Skill 增量包，并提供 apply、verify、rollback、collect-logs。

详细候选比较、固定提交和断网验证证据见仓库根目录 `HTML_REPORT_SKILL_SELECTION.md`。
