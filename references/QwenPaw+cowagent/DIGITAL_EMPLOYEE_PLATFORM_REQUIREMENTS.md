# 数字员工平台需求与技术基线

> 状态：需求对齐阶段，尚未开始平台项目检索和二次开发。
> 更新日期：2026-08-26

## 1. 目标

在不替换 CowAgent 执行底座的前提下，把它扩展为可以批量落地和运营数字员工的系统。

数字员工不只是一个聊天 Agent，还需要具备岗位定义、可持续执行、过程可追踪、结果可复盘和统一管理能力。

## 2. 目标架构

```text
数字员工定义 / SOP / Skills / 工具权限
                    |
                    v
管理台与员工市场 <-> 长效任务控制与编排层
                    |
                    v
          CowAgent 执行 Runtime
                    |
                    v
       工具、MCP、浏览器、文件和外部系统
```

### 2.1 CowAgent：执行层

继续承担以下职责：

- 模型推理、任务规划和工具调用。
- Skills、记忆、知识库和 MCP 能力。
- 文件、网页、浏览器、调度器等原子工具。
- 通过 Web/API/SSE 接收任务、输出过程和返回产物。
- 需要时由主 Agent 拆分并行子任务。

CowAgent 当前不是完整的数字员工运营平台，也不是节点级可审计的工作流引擎。现有固定流程主要通过 `Skill + scripts` 承载。

### 2.2 数字员工管理台

需要补齐统一的管理和展示平台：

- 员工档案：名称、工号、岗位、职责、能力、Skills、工具、权限和版本。
- 员工列表：启用、停用、空闲、运行中、异常、等待人工等状态。
- 任务中心：派单、队列、运行中任务、取消、重试、超时和结果。
- 执行详情：步骤、工具调用、模型调用、浏览器操作、文件产物、错误和 Trace。
- 人工确认：高风险动作、审批节点、继续执行和转人工。
- 权限和审计：谁创建、谁修改、谁派单、谁批准、谁执行。
- 多工作区或多项目隔离，避免不同员工任务互相污染。

### 2.3 员工市场 / 模板中心

第一阶段按企业内部模板市场处理，不引入支付或第三方交易：

- 浏览、搜索、分类和筛选员工模板。
- 查看岗位说明、SOP、Skills、工具依赖和权限声明。
- 一键安装、复制、启用和停用。
- 版本管理、升级、回滚和依赖检查。
- 模板安装后的本地配置和实例化。

### 2.4 长效任务控制层

需要解决单次会话结束后任务仍能持续推进的问题：

- 跨会话、跨天运行。
- 目标、状态、检查点和上下文持久化。
- 定时、事件或人工触发。
- 失败重试、超时、暂停、恢复和取消。
- 配额、并发限制和租约，避免重复执行。
- 人工 Gate 和等待外部输入。
- Evidence、Trace、产物和审计记录。
- 通过 adapter 将任务映射到 CowAgent session/API。

长效任务控制层可以参考 Loop Engineering / LoopX，但必须单独核实其是否支持真正的调度、并发、结果聚合和持久化，而不能把“循环执行”直接等同于完整编排。

### 2.5 并发子代理与任务编排

这是一项独立能力，不能默认包含在长效任务层中。

目标能力是：

```text
中心任务
  -> 拆分多个子任务
  -> 并发调用多个 CowAgent 子实例或 session
  -> 收集、校验和聚合结果
  -> 进入下一阶段或提交人工 Gate
```

检索时必须明确项目是否支持 fan-out、队列、并发上限、重试、结果聚合和失败回收。若 LoopX 只负责 goal、gate、evidence、claim/lease 和 bounded turn，则并发编排需要由 CowAgent 的 subagent 能力或独立 manager 承担。

### 2.6 A2UI / 动态 UI

A2UI 主要作为 Agent 到前端的声明式交互层，用于：

- 动态表单和参数收集。
- 审批和人工确认界面。
- 员工运行状态、任务进度和 Trace 面板。
- 结果预览和下一步操作。

A2UI 是否作为管理台的硬性技术栈，需要在项目检索时单独评估。管理台本身可以采用普通 React/Next.js 组件，不能因为使用 A2UI 就牺牲权限、审计、路由和可维护性。

## 3. 当前 CowAgent 基线

### 3.1 本地交付基线

- 客户现场回滚基线：`2.1.2`，基础镜像为 `cowagent-offline:2.1.2-base.2-dev`。
- 新离线交付基线：`1.1.0`，CowAgent 版本 `2.1.7`，基础镜像为 `cowagent-offline:2.1.7-base.1-dev`。
- 新镜像基于 `zhayujie/chatgpt-on-wechat:2.1.7` 二次构建，并保留旧镜像 tar 作为回滚资产。
- 工作区和运行配置通过宿主机目录持久化。
- 当前 Web API 主要是登录、`/message`、SSE `/stream`、上传和 `/cancel`，还不是稳定的外部平台 API。
- 新基础镜像包含办公依赖和系统 Chromium；browser-use 另以独立 Python 3.11 Toolpack 运行。

### 3.2 上游最新版本核对

截至 2026-08-26，上游仓库 `zhayujie/CowAgent` 最新稳定发布为 `2.1.7`，发布时间为 2026-08-21。相对于当前 `2.1.2`，上游已连续增加：

- `2.1.3`：桌面端、知识库文档管理、按需 MCP 工具检索。
- `2.1.4`：调度器改进、MCP OAuth、数据备份等。
- `2.1.5`：工作区文件预览、后台命令、上下文压缩和安全加固。
- `2.1.6`：主 Agent 并行派发 subagent、可配置并发/超时/嵌套深度、可插拔向量后端、SSE 断线重放。
- `2.1.7`：多工作区、会话级权限模式、长任务通知、跨午夜调度修复、Docker 配置持久化修复。

### 3.3 升级判断

当前决策：**后续品牌二开、离线交付和数字员工平台适配，直接以 2.1.7 作为新开发基线；2.1.2 只保留为回滚基线。**

升级优先级较高，原因是 2.1.6 的 subagent 和 2.1.7 的多工作区、权限、调度、SSE 与配置持久化，正好对应数字员工平台的基础依赖。这里的“切换基线”不是把现有 Compose 镜像标签改成 `2.1.7`，而是重新构建 2.1.7 基础镜像并重放现有品牌和离线补丁。

升级必须按以下路径进行：

1. 保留 `2.1.2` 镜像、离线包、运行数据和补丁回滚点。
2. 取得并固定 `2.1.7` 镜像或源码依赖的 digest、许可证和依赖清单。
3. 将现有 OfficeCLI、HTML Report、MCP SSH Manager 等本地补丁逐项重放到新基线。
4. 验证配置持久化、工作区、会话、Skills、MCP、SSE、定时任务、文件产物和权限模式。
5. 验证 Playwright/Chromium 与新镜像的版本、系统库、中文字体和离线运行。
6. 通过完整验收后，更新离线交付 manifest、Compose 和补丁的 `requiresCowAgentVersion`；验收期间保留 `2.1.2` 可启动回滚路径。

## 4. 浏览器能力判断

### 4.1 CowAgent 原生能力

CowAgent 2.1.7 的浏览器工具已经基于 Playwright + Chromium，支持：

- `navigate`、`snapshot`、`click`、`fill`、`select`、`scroll`、`screenshot`、`wait`、`press`、`get_text`、`evaluate`。
- JavaScript 渲染页面和紧凑 DOM snapshot。
- 持久化登录 profile。
- CDP 模式接入独立 Chrome/Edge。
- Linux server headless 和本地桌面 headed 模式。

### 4.2 当前不足

原生浏览器工具适合单 Agent 交互和常规网页操作，但对数字员工平台仍缺少：

- 独立浏览器 worker 的生命周期管理。
- 多任务并发和浏览器实例隔离。
- 任务级 profile、代理、Cookie 和凭据隔离。
- 浏览器操作的结构化事件、录像、网络日志和证据归档。
- 失败恢复、断点续跑、验证码/人工接管和限速策略。
- 面向管理台的浏览器任务队列和资源配额。

### 4.3 浏览器方案方向

本阶段只追求**网页元素识别和点击更准、更稳**，暂不把多员工并发浏览器、独立登录态、录像审计、失败恢复和人工接管列为硬要求。

当前决策：**直接引入 `browser-use`，作为一个新增 CowAgent Skill；不替换、不删除 CowAgent 原生浏览器。**

推荐形态：

```text
CowAgent
  ├─ 原生 browser 工具（保留，简单网页任务和兜底）
  └─ browser-use Skill
       └─ 官方 browser-use CLI-MCP（由 CowAgent 拉起的独立进程）
```

`browser-use` 在点击执行层比当前原生 ref 点击更强：它使用增强 DOM/可访问性信息、JavaScript 事件监听检测、元素索引缓存、滚动到可见区域、遮挡检查、真实坐标点击和多级 fallback。它的 direct browser control 正好适合解决“点得准”这一目标。

实现上不要把 `browser-use` 的 Python 依赖直接混进 CowAgent 主进程，而是作为一个独立 MCP 进程运行：

- CowAgent 通过 MCP 注册 `browser-use` 工具。
- `browser-use` Skill 负责触发条件、工具选择顺序、状态刷新和结果解释。
- 复杂网页操作默认走官方 CLI-MCP 的 `browser_exec` 和 `browser_screenshot`，在执行代码中使用 Accessibility Tree、CDP、坐标点击和状态验证 helper。
- CowAgent 原生 browser 继续作为简单读取、兼容性兜底和故障回退路径。
- `retry_with_browser_use_agent` 这类完整 autonomous Agent 能力可以保留为显式高级模式，但默认不让它和 CowAgent 形成双重规划。

这条路线解决了当前主容器的 Python 版本边界：`browser-use 0.13.8` 要求 Python `>=3.11`，MCP 进程使用独立的 Python 3.11/3.12 运行环境，不需要把 CowAgent 当前运行时整体升级到 3.11。

离线交付时需要固化：browser-use 版本、Python 运行时、MCP server、browser-harness/CDP 依赖、Chromium 运行时、许可证和 SHA256；禁止现场通过 `uvx`、`pip` 或 `playwright install` 拉取依赖。

验收重点是首次点击成功率、误点击率、过期索引率、平均延迟和离线包体积，至少覆盖普通表单、React/Vue 弹层、Ant Design/Element Plus 下拉框、虚拟列表、Shadow DOM、iframe、页面重绘和被遮挡元素。

浏览器增强层不负责替代 CowAgent 的任务规划和 Skills，只把浏览器操作本身做成更可靠的执行能力。

### 4.4 现成资产与复用决策

本轮检索确认，浏览器能力不需要从零实现。优先复用以下官方资产：

| 资产 | 当前证据 | 复用方式 | 判断 |
|---|---|---|---|
| `browser-use/browser-use` | 约 11 万 Star，MIT，最新 `0.13.8`，2026-08-16 发布 | 固定版本、依赖和 Chromium，作为执行引擎 | 首选底座 |
| `browser-use/plugins/browser-use` | 官方插件只有 `.mcp.json`，启动 `browser-use@latest --cli-mcp`，暴露 `browser_exec` 和 `browser_screenshot` | 把 Claude 插件注册层改成 CowAgent 的 `mcp.json`，保留工具协议 | **首选接入模板** |
| `browser-use/skills/browser-use` | 官方 CLI Skill，包含导航、状态、点击、输入、截图和会话规则 | 复制后改写为 CowAgent Skill，删除 Cloud、x402 和在线安装内容 | **首选 Skill 模板** |
| 第三方 browser-use MCP 包（如 `Saik0s/mcp-browser-use`、`kontext-security/browser-use-mcp-server`） | 对官方 browser-use 的 HTTP/SSE/stdio、Dashboard、VNC 等包装 | 只有未来需要独立任务服务、远程观测或 VNC 时才重新评估 | **当前不引入** |

接入时采用“双层复用”：

1. **Skill 层**：复用官方 `skills/browser-use/SKILL.md` 的触发描述、`state -> action -> verify` 工作流和安全边界，改成 CowAgent 的固定路径、中文说明和离线约束。
2. **MCP 层**：复用官方 `plugins/browser-use/.mcp.json` 的 CLI-MCP 方式，把 `uvx` 在线解析改为预装的固定可执行入口；不复制 MCP server 代码。

官方旧式本地 MCP `browser-use --mcp` 暴露多个 direct tools 和 `retry_with_browser_use_agent`；官方插件的新式 `--cli-mcp` 更偏向 `browser_exec` + `browser_screenshot` 的统一控制面。对 CowAgent 应优先采用 `--cli-mcp`，让 CowAgent 保持唯一任务规划者，避免 browser-use 内部 Agent 再做一次规划。需要单步调试或兼容性验证时，再评估旧式 direct tools。

### 4.5 离线适配边界

官方示例使用 `uvx ...@latest`，适合联网开发，不适合当前离线交付。正式适配必须：

- 固定 `browser-use 0.13.8`、`browser-harness 0.1.9` 及全部 Python 依赖版本。
- 在独立 Python 3.11/3.12 运行环境中预装运行时，不修改 CowAgent 主进程的 Python 版本。
- 固化 Playwright/CDP 和 Chromium，生成许可证清单、SHA256、启动健康检查和回滚脚本。
- MCP server 通过 CowAgent 本地 stdio 拉起，不开放额外 HTTP 端口；不使用 Browser Use Cloud、`uvx` 在线解析、`pip install` 或现场浏览器下载。
- 复用 CowAgent 的模型配置时，优先使用 direct control，避免额外配置第二套 browser-use Agent LLM；如果某个版本的 `browser_exec` 强制依赖独立 LLM，再把它作为明确的高级模式而不是默认路径。
- Skill 默认禁止导出 Cookie、访问 Cloud API、启动 tunnel 和执行在线安装；浏览器域名范围和本地网络访问策略沿用 CowAgent 安全约束。

### 4.6 推荐接入顺序

```text
官方 browser-use Skill 模板
              +
官方 browser-use CLI-MCP 配置
              +
CowAgent mcp.json 适配
              +
独立 Python 3.11/3.12 + Chromium 运行环境
```

第一阶段不引入第三方 wrapper 的 Dashboard、VNC、HTTP 任务层。它们只是把官方 browser-use 再包装成常驻服务，并不会自动提升点击准确性；引入后反而会增加端口、进程、配置、鉴权和数据持久化边界，和当前目标无关。

## 5. 后续项目检索标准

管理台、长效任务、并发编排和浏览器增强项目分别评估，不以 Star 数作为唯一标准。至少检查：

- GitHub Star、最近提交、Issue 活跃度和 Release 情况。
- 许可证、商业限制、依赖许可证和二次开发边界。
- Docker/内网/离线部署可行性。
- API、Webhook、事件流和数据模型可扩展性。
- 多租户或多工作区隔离能力。
- 任务持久化、调度、队列、重试、并发和结果聚合能力。
- Agent adapter 的实现成本，尤其是 CowAgent session/API 对接。
- 前端技术栈、组件复用能力和是否能接 A2UI。
- 浏览器 profile、凭据、录像、Trace 和人工接管能力。
- 是否与 CowAgent 已有能力重复，是否值得二开。

## 6. 当前结论

- CowAgent 作为执行 Runtime 够用，而且 2.1.6 起已经具备并行 subagent 基础。
- 后续二开基线切换到 `2.1.7`，但必须重建镜像、重放补丁并完成验收；`2.1.2` 保留为回滚基线。
- 管理台、员工市场和长效任务控制仍需独立补齐。
- LoopX 类项目不能默认承担中心化并发子代理编排，检索时要把这一项单列。
- `browser-use` 直接作为新增 Skill + 官方本地 CLI-MCP 引入；CowAgent 原生浏览器继续保留，按任务复杂度选择或回退。
- 优先直接改造 `browser-use` 官方 Skill 和 `browser-use/plugins` 的 CLI-MCP 配置，不自研浏览器执行层，也不引入第三方 wrapper 服务。
- 在升级验收完成前，不修改现有 `2.1.2` 离线交付基线，也不直接替换生产/客户镜像。
