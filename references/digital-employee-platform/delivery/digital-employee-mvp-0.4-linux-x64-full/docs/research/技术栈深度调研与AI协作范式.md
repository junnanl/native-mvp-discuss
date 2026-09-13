# 技术栈深度调研与 AI 协作范式

> 调研日期：2026-08-18。本文记录本轮 Exa 多工作流检索、官方资料核验、高星开源项目观察和最终推断。
> 事实、推断、建议分开写；搜索摘要只用于发现候选，最终判断以官方文档、源码、issue 和真实项目为依据。

## 1. 调研范围与方法

本轮共运行 20 个定向搜索工作流，按每个工作流请求 8 条结果计，合计覆盖约 160 条搜索结果，并批量读取官方文档、GitHub README、项目协作规则和公开 issue。
覆盖以下角度：

- 高星 AI 产品的真实前端分层：LobeHub、Vercel Chatbot、assistant-ui、Lobe UI、Tremor。
- shadcn/Tailwind 与 AntD 混合的 CSS、token、SSR、portal 和升级风险。
- Recharts、Tremor、Apache ECharts 的普通/复杂图表边界。
- Lucide、Iconify、Tabler、AntD Icons 的 tree-shaking、搜索、Next hydration 和许可证。
- Motion、GSAP、AutoAnimate 的 React 适配、性能和复杂度。
- Three.js、React Three Fiber、drei、react-postprocessing 的 React 19 配对、MCP 文档和性能边界。
- assistant-ui、Vercel AI SDK UI、Ant Design X、CopilotKit、AG-UI、A2UI 的职责边界。

来源优先级：协议/框架官方文档 > 官方仓库与变更记录 > 高星项目源码与 AGENTS.md > 社区文章和讨论。厂商自述的下载量或性能数据只作为其立场，不当作独立基准。

## 2. 高星项目给出的真实模式

### Vercel Chatbot

[Vercel Chatbot](https://github.com/vercel/chatbot/) 约 20K stars，README 明确采用 Next.js App Router、AI SDK、shadcn/ui、Tailwind 和 Radix。它说明：

- shadcn/Tailwind 对 AI 代码生成和可修改源码非常友好；
- AI SDK 是模型/流式/工具调用层，不是视觉设计系统；
- 真实项目仍需要数据库、认证、限流、附件和错误处理，不能只生成聊天页面。

### assistant-ui

[assistant-ui](https://github.com/assistant-ui/assistant-ui) 约 11K stars，提供 Thread、Message、Composer、工具调用、附件、审批和无障碍行为，
并可接 Vercel AI SDK、LangGraph、AG-UI/A2A 或自定义后端。它的 CLI 可复制 shadcn/Base UI 风格组件到项目，说明 AI chat 也可以采用“源码在仓库”的模式。

结论：固定聊天 UX 可由 assistant-ui 提供，但它不替代 AG-UI/A2UI 协议，也不应与 CopilotKit 同时维护两份会话状态。

### LobeHub 与 Lobe UI

[LobeHub](https://github.com/lobehub/lobehub/) 约 80K stars；其 [AGENTS.md](https://github.com/lobehub/lobehub/blob/main/AGENTS.md) 规定：

```text
@lobehub/ui/base-ui（headless）
  -> @lobehub/ui（自有高层组件）
  -> antd（最后后备）
```

[Lobe UI](https://github.com/lobehub/lobe-ui) 基于 AntD，并另外提供 AI 组件、图标和基于 Recharts 的图表。它证明成熟 AI 产品的常见答案是分层和混合，
而不是寻找“一个包包办所有场景”。

### 收敛的模式

```text
Next.js/React
  -> 项目源码基础层（shadcn/headless/base-ui）
  -> 项目语义组件
  -> 复杂企业专业组件（AntD 等）
  -> 独立图表/图标/动效/3D 能力
  -> Agent runtime、协议和受控 Catalog
```

## 3. shadcn 与 AntD 的混合判断

### 事实

- shadcn 提供项目内源码、registry、Blocks、MCP 和 Tailwind token；官方 Chart 组件基于 Recharts v3，并强调“不包装 Recharts”，因此不会把底层 API 锁死。assistant-ui 最新文档还说明，2026 年 7 月起 shadcn 新项目默认 Base UI flavor，同时兼容 Radix。
- AntD 提供成熟的 Form、Table、Tree、筛选、反馈和中文企业资料，且有 token、semantic DOM、For Agents 和 MCP。
- AntD/Tailwind 社区讨论和官方 CSS compatible 文档都指出，混合需要处理 CSS layer、reset、token、portal、z-index、SSR 和多主题。

### 推断

“固定页面使用 shadcn，复杂 Table/Tree 用 AntD”不是妥协，而是职责分层；前提是 AntD 被包进项目级 adapter，不能让页面同时拥有两套 Button、Dialog、Form 和主题语义。

### 建议

```text
components/ui       -> shadcn 基础源码
components/domain   -> 业务语义组件
components/antd     -> EnterpriseTable、EnterpriseTree 等隔离 adapter
features/a2ui       -> Catalog definitions、renderers、事件契约
```

Catalog 只暴露 `ResultTable` 这样的语义组件。Agent 不知道 `TableProps`、AntD class、Tailwind 任意类和 DOM 结构。

## 4. 图表边界

### Recharts / shadcn Chart / Tremor

[Recharts](https://recharts.org/en-US/) 是 React 组合式 SVG 图表，适合折线、柱状、面积、饼和常规 dashboard。
[shadcn Chart](https://ui.shadcn.com/docs/components/radix/chart) 使用 Recharts v3，组件源码属于项目，保留直接使用 Recharts 的升级路径。
[Tremor](https://www.tremor.so/docs/visualizations/area-chart) 提供 Tailwind dashboard 图表模式，安装示例仍以 Recharts 和可复制源码为中心。

建议把三者理解为“普通图表的源码/设计模式”，默认只维护 Recharts 一套运行时。

补充：Vercel Chatbot 使用 Radix 是真实高星项目证据，但不是当前 shadcn CLI 的唯一或强制选择；新项目采用 Base UI，已有 Radix 生态时保持 Radix，避免无意义迁移。

### Apache ECharts

[ECharts](https://echarts.apache.org/en/index.html) 官方列出 20+ 图表类型、Canvas/SVG 切换、渐进式渲染、流式加载和多维数据变换，适合地图、Sankey、Treemap、热力图、时间轴和大数据。
[`echarts-for-react`](https://github.com/hustcc/echarts-for-react) 支持 ECharts 5/6 的模块化注册，可以只加载需要的 chart/component/renderer。

建议：普通图表走 Recharts；复杂图表进入单独 `ComplexChart` adapter，并对 option 做 schema 白名单和性能测试。不要把 ECharts option 直接作为 A2UI 的自由输入。

## 5. 图标边界

### Lucide

[Lucide React](https://lucide.dev/guide/react/) 的官方特性是 standalone SVG component、tree-shakable、TypeScript 和 a11y；GitHub 约 24K stars、1600+ 图标。
它与 shadcn 的 import 方式和源码示例最一致，因此是默认集。

### Iconify 与 Tabler

[Iconify](https://iconify.design/docs/icon-components/react/) 提供一个语法访问 200+ 图标集、按需加载 300,000+ 图标，适合搜索和发现；但官方文档明确 Next 下组件是 client-only，公共 API 会造成首屏延迟和 hydration 约束。
[Tabler](https://github.com/tabler/tabler-icons) 约 21K stars、6100+ MIT 图标，适合作为局部填充/品牌候选，但不应和 Lucide 无规则混用。

建议：开发时用 Iconify 搜索，生产默认固化为 Lucide；缺口才审查并局部固化 Tabler/品牌 SVG。通过 `icon-library.ts` 和组件对象传递图标，禁止 AI 生成新 SVG。

## 6. 动效边界

### Motion

[Motion for React](https://motion.dev/docs/react) 提供声明式 props、layout、gesture、scroll、spring 和 `AnimatePresence`；官方强调 tree-shaking 和 React 原生 API。
它适合状态驱动的微交互、面板展开、列表布局和拖拽，是默认动画库。

### GSAP

[GSAP](https://gsap.com/docs/v3/) 约 27K stars，核心零依赖，插件覆盖 ScrollTrigger、Flip、Morph 和 SVG；React 通过 `@gsap/react` 的 `useGSAP()` 清理生命周期。
它的 imperative 时间轴适合复杂滚动叙事和 SVG/Canvas 编排，但会引入 refs 和额外的心智负担。

### AutoAnimate

[AutoAnimate](https://auto-animate.formkit.com/) 是零配置的增删移动过渡工具，适合低风险列表；它只观察直接子节点，不能替代明确的状态机、a11y 和复杂动画设计。

建议：CSS -> Motion -> GSAP 逐级升级，任何动画都要支持 reduced motion 和真实浏览器检查。

## 7. 3D 边界

[React Three Fiber](https://r3f.docs.pmnd.rs/getting-started/introduction) 是 Three.js 的 React renderer，官方文档列出 React 19 对应的 v9、性能、测试和 MCP 文档入口。
[drei](https://github.com/pmndrs/drei) 约 9K stars，提供相机、控制器、GLTF、加载、性能和材质 helper；
[react-postprocessing](https://docs.pmnd.rs/react-postprocessing/introduction) 通过 EffectPass 合并后处理，降低传统 pass chain 的重复渲染。

建议：3D 作为按需 Client-only vertical slice，不进默认首屏依赖。使用 `next/dynamic` 禁止 SSR，模型和纹理懒加载，限制 DPR/帧率，提供降级图像和移动端预算。

## 8. AI UI、AG-UI 与 A2UI 的边界

| 层 | 事实 | 本项目职责 |
| --- | --- | --- |
| `assistant-ui` | 聊天 UI/runtime，支持多种后端和 AG-UI adapter | 固定聊天和工具调用视觉；不管理 A2UI Catalog |
| CopilotKit | Agent runtime、frontend actions、共享状态和 A2UI 接入 | 统一 Agent 会话和 Catalog 接入；避免再维护第二份会话状态 |
| AG-UI | 事件流、工具调用、状态同步和人机协作协议 | 默认 SSE；前端验证事件顺序、取消、重试和恢复 |
| A2UI | 流式声明式 UI 消息、surface、组件树和数据绑定 | v0.9.1；只允许项目 Catalog 组件 |
| Catalog | schema、renderer、组件白名单和事件边界 | 由项目控制，映射 shadcn 或 AntD adapter |

[A2UI 官方](https://a2ui.org/) 标明 v0.9.1 是 current production，v1.0 是 candidate；[AG-UI 官方](https://docs.ag-ui.com/introduction) 明确 AG-UI 连接 Agent 和前端，而 A2UI 是生成式 UI 规范。

## 9. AI 协作最佳范式

### 让 Agent 能正确生成

项目必须给 Agent 提供比“组件名字”更完整的上下文：

```text
AGENTS.md：架构、目录、命令、禁止事项
components/ui：可读的 shadcn 源码
components/domain：稳定语义 API 和状态矩阵
components/antd：第三方复杂能力 adapter
design-tokens：颜色、间距、字体、状态和主题
Storybook：props、示例、loading/empty/error/a11y stories
features/a2ui：Catalog schema、renderer、事件白名单
```

### 让 Agent 不造轮子

提示词中明确：

1. 先搜索项目组件和 registry，再写 JSX。
2. 图标从 `icon-library.ts` 选择，不写 SVG。
3. 普通图表从 `TrendChart` 等语义组件选择，不直接组合任意 chart props。
4. 复杂 Table/Tree 使用 adapter，不在页面重复实现虚拟滚动和键盘行为。
5. 先写状态和允许转换，再实现组件。

### 让 Agent 证明结果

```text
typecheck/lint
  -> Vitest/RTL：状态、schema、事件
  -> Storybook：状态矩阵、a11y
  -> Playwright：真实浏览器、SSE、键盘、窄屏
  -> 截图/视觉检查
  -> Chrome DevTools：Console、网络、DOM、性能
```

## 10. 不应一开始安装的东西

- 不同时安装 AntD、MUI、PrimeReact 和 shadcn 作为四套全局设计系统。
- 不同时安装 Recharts、Tremor runtime、Ant Design Plots、Nivo、visx；先用 Recharts 源码模式。
- 不同时安装 Lucide、Tabler、Iconify runtime；Iconify 先作为搜索工具。
- 不默认安装 GSAP、Three.js、R3F、postprocessing；没有真实动画/3D需求就不引入。
- 不默认安装 assistant-ui、AntD X 和 Vercel AI SDK UI 三个聊天抽象；选一个会话 UI 层，协议层仍保持 AG-UI/A2UI。

## 11. 最终推断与置信度

**高置信度事实**：Next/React/TS、shadcn/Tailwind 的 AI 源码模式、AntD 的复杂企业能力、Recharts/ECharts 的复杂度分界、Lucide 的 tree-shaking、R3F 的 React renderer、AG-UI/A2UI 的职责分层。

**中置信度推断**：assistant-ui 作为完整聊天 UX 的按需候选；本条 runtime spike 已由 CopilotKit 独占会话状态，未引入 assistant-ui，因此没有重复状态证据。

**已完成本轮实战验证**：AntD `EnterpriseTable` adapter 的业务边界、A2UI Catalog 动态绑定、Zod 3 兼容性、SSR/build 和浏览器 renderer 链路。

**仍需真实项目验证**：AntD CSS/token/portal 在更复杂页面的主题边界、RHF 与复杂 AntD 控件的组合、图表语义 schema，以及外部 Agent 的鉴权、重连和恢复。

## 12. 下一步

不再继续做无目标的库排行榜。进入[第一条前端垂直切片](../poc/第一条前端垂直切片.md)，用一个真实闭环验证：

```text
shadcn/RHF/Zod 任务表单
  -> TanStack Query 任务状态
  -> EnterpriseTable（若结果区需要）
  -> Mock AG-UI
  -> CopilotKit + A2UI + BYOC Catalog
  -> loading/success/empty/error/retry/approval
  -> 测试、Storybook、浏览器和 a11y 验收
```
