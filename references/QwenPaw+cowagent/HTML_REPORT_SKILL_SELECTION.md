# CowAgent 通用 HTML 汇报 Skill 选型记录

更新日期：2026-07-13  
项目：CowAgent 2.1.2 / Evo-Harness  
状态：已安装到 CowAgent 开发工作区，并完成断网测试、中文视觉和 Web 文件下载验证；已制作 `v1.0.5-html-report` 客户增量包，尚未在客户内网部署

## 1. 选型边界

本轮只处理通用 HTML 汇报能力：

- 不新增、替换或修改 PPT Skill。
- 不引入新的 Workflow 平台。
- 不引入新的 Generate Skill。
- 不从零编写 HTML 引擎、模板库或导出器。
- 优先采用社区现有 Skill，只做 CowAgent 和离线环境所必需的最小适配。

## 2. 检索范围

已检索：

- Cow Skill Hub：`https://skills.cowagent.ai/`
- GitHub Agent Skill 项目
- Agent Skills 开放规范及社区索引
- HTML Anything 等高关注度 HTML 生成项目

Cow Skill Hub 当前只检索到现有 `eda-reporter`，没有满足“通用长篇 HTML 汇报”的现成 Skill。`eda-reporter` 继续只负责 CSV/Excel 探索性数据分析。

## 3. 候选比较

Star 数为 2026-07-13 的检索快照，只表示社区关注度。

| 候选 | Star 快照 | 许可证 | 依赖与输出 | 主要问题 | 结论 |
|---|---:|---|---|---|---|
| [nexu-io/html-anything](https://github.com/nexu-io/html-anything) | 7,723 | Apache-2.0，部分 vendor 模板需单独核验 | Next.js、React、pnpm、本地 coding-agent CLI；75 套模板 | 是完整 HTML 编辑应用，不是单一通用汇报 Skill；与 CowAgent Web 平台重复 | 不引入完整项目 |
| [TheoRata/Report-Skill](https://github.com/TheoRata/Report-Skill) | 4 | MIT | Node.js 20+，零 npm 依赖；Markdown 机械渲染为单文件 HTML | 上游模板默认引用 Google Fonts；Skill 路径按 Claude Code 编写 | **选定**，只做离线字体和 CowAgent 路径适配 |
| [zjp1997720/html-express](https://github.com/zjp1997720/html-express) | 6 | MIT | 零脚本依赖，由 Agent 直接拼装单文件 HTML | 无确定性渲染器，复杂长报告主要依赖模型直接编写 HTML | 作为轻量备选，不同时安装 |
| [rnnh-code/html-workbench](https://github.com/rnnh-code/html-workbench) | 1 | MIT | 零 npm，单文件 HTML，20 类模式 | 触发范围包含计划、代码审查、原型和幻灯片，容易抢占其他 Skill，且会变相增加 HTML/PPT 能力边界 | 不选 |
| [iwasff/data-analysis-report-skill](https://github.com/iwasff/data-analysis-report-skill) | 11 | 未声明 | 单文件数据报告 | 与 `eda-reporter` 重叠，且缺少明确许可证 | 不选 |

## 4. 为什么选 Report-Skill

选定上游：

```text
https://github.com/TheoRata/Report-Skill
commit: ffb97c2ce0c2f44449c1bc4fb6ef6057a27d02ca
skill path: skills/report/
license: MIT
```

选择原因：

1. 它已经是完整 Agent Skill，不需要重新设计工作流。
2. Agent 只编写 Markdown，现有 `render.mjs` 负责确定性生成 HTML，避免模型每次重新编写整页 HTML。
3. 渲染器只使用 Node.js 内置模块，不需要 npm、pnpm、pip 或其他包管理器。
4. 生成结果是单文件 HTML，内嵌 CSS、JavaScript 和原始 Markdown，可直接双击打开。
5. 已具备目录、亮暗主题、表格、代码块、提示块、脚注、图片、阅读进度、导出 Markdown 和报告索引能力。
6. 上游自带完整 Node 测试，便于固定版本后做离线回归。
7. 当前基础镜像已经包含 Node.js `v24.18.0`，满足其 Node.js 20+ 要求，不需要升级基础镜像。

该选择不是因为 Star 最高。高 Star 的 HTML Anything 是完整应用，接入它会重复 CowAgent 的 Web 平台和 Agent 调用层。Report-Skill 的社区规模较小，但形态与当前需求更一致，且代码、依赖和测试边界清晰。

## 5. 允许的最小适配

后续如果进入正式开发接入，只允许以下适配：

1. 将 Skill 名称和触发描述收敛为“用户明确要求 HTML 汇报、HTML 报告或浏览器可打开的长篇汇报”才触发，避免抢占普通问答、Word、PPT 和 `eda-reporter`。
2. 将 `~/.claude/skills/report/` 路径改为 CowAgent 工作区固定路径，例如：

   ```text
   /home/agent/cow/skills/html-report/
   ```

3. 将默认输出目录改为 CowAgent 可写、可由 Web 端下载的目录，例如：

   ```text
   /home/agent/cow/tmp/reports/
   ```

4. 移除 `template.html` 和 `index-template.html` 中的 Google Fonts 链接。
5. 字体优先使用当前基础镜像已具备的文泉驿字体：

   ```text
   WenQuanYi Zen Hei
   WenQuanYi Zen Hei Mono
   ```

6. 在 Skill 中明确禁止 npm/pnpm/pip 安装、远程字体、CDN、远程脚本和在线更新。
7. 上游 review server 文件仅为保持上游完整性而保留；CowAgent 适配层禁止默认调用，所有渲染命令固定传入 `--no-open`，普通 HTML 交付不启动额外端口。

以下内容不得重写：

- Markdown 解析器。
- HTML 渲染器。
- 报告模板主体。
- 评论和索引实现。
- 导出 Markdown 的前端逻辑。
- 上游测试体系。

## 6. 开发环境验证结果

验证目录：

```text
.local/html-skill-research/
```

离线适配验证副本：

```text
.local/html-skill-research/eval/report-skill-offline-clean/
```

中文测试产物：

```text
.local/html-skill-research/eval/report-output/evo-harness-2026-07-13.html
```

产物 SHA256：

```text
7365cad0698803319c056235ec50703c0549b46dc60dade8ccb0d80f40edf3cf
```

验证结论：

[√] 上游 Skill 目录约 432 KB，不包含 node_modules。

[√] 当前基础镜像 Node.js `v24.18.0` 满足 Node.js 20+ 要求。

[√] 移除 Google Fonts 后，生成产物没有 HTTP、HTTPS 或协议相对的远程资源引用。

[√] 在 `docker --network none` 条件下成功将中文 Markdown 渲染为单文件 HTML。

[√] 生成文件包含中文内容、语义化 `nav/main/section/table`、内嵌原始 Markdown 和减弱动效规则。

[√] 在 `docker --network none` 条件下执行上游测试：110 项通过，0 项失败。

[√] 不需要新增系统包、Node 包、Python 包或二进制，预期可标记 `dependencyChange=false`。

[√] 正式开发工作区接入后，使用基础镜像已内置的 Playwright Chromium 对中文页面完成整页截图检查，字体、表格、目录、提示块和长页排版正常。

## 7. 开发工作区接入结果

正式开发挂载源：

```text
delivery/offline-install/storage/cow/skills/html-report/
```

开发验证源文件与产物：

```text
delivery/offline-install/storage/cow/tmp/reports/evo-harness-html-report-validation.md
delivery/offline-install/storage/cow/tmp/reports/evo-harness-html-report-validation.html
delivery/offline-install/storage/cow/tmp/reports/evo-harness-html-report-validation.png
delivery/offline-install/storage/cow/tmp/reports/evo-harness-html-report-validation-mobile.png
```

HTML SHA256：

```text
65cf3cf967ccf8b60df29db1112a575b301991601a545b884e702249ff0b7b29
```

接入结论：

[√] 顶层适配名固定为 `html-report`，只在用户明确要求 HTML 汇报、HTML 报告或单文件 HTML 交付时触发。

[√] `CSV/Excel` 数据分析报告明确继续由 `eda-reporter` 处理，避免两个 HTML Skill 冲突。

[√] Skill 路径固定为 `/home/agent/cow/skills/html-report`，输出固定为 `/home/agent/cow/tmp/reports`。

[√] 上游原始 `SKILL.md` 已保存在 `references/UPSTREAM_SKILL.md`，MIT 许可证已复制到 Skill 根目录。

[√] `render.mjs` 与固定提交的上游文件一致，没有重写渲染器。

[√] 新增 `verify-offline.mjs`，用于阻断空文件、远程 URL 和缺失嵌入 Markdown 的产物。

[√] 在 `docker --network none` 下执行 113 项测试全部通过，其中 110 项为上游测试，3 项为离线校验适配测试。

[√] 开发容器以 `--no-open` 生成中文 HTML 后，没有出现 `review.mjs` 进程或新增端口。

[√] CowAgent `SkillManager(custom_dir="/home/agent/cow/skills")` 已识别并启用 `html-report`，`pptx` 启用状态未被修改。

[√] 通过 CowAgent `/api/file` 完成鉴权后的 Web 文件读取验证，HTTP 200、类型为 `text/html`，下载内容 SHA256 与宿主机产物一致。

[√] 已完成 1440 像素桌面视口和 390 像素移动视口截图检查；移动端 `scrollWidth` 与 `clientWidth` 均为 390，没有横向溢出。

[√] 已按当前项目的挂载目录权限策略归一化权限，并使用容器内 `agent` 用户完成实际写入测试。

[√] 本次没有新增 npm、pip、系统包或二进制，后续正式补丁可保持 `dependencyChange=false`。

## 8. 当前决定

唯一推荐候选：`TheoRata/Report-Skill` 的 `skills/report/`。

当前已完成选型、最小适配和开发工作区接入：

- 已复制到 `delivery/offline-install/storage/cow/skills/html-report/`。
- 尚未复制到 `delivery/offline-install/seed/workspace/skills/`。
- 已写入并启用开发工作区 `skills_config.json`。
- 已由正在运行的 CowAgent 开发容器识别。
- 已制作并验证 `v1.0.5-html-report` 增量包，尚未在客户内网部署。
- 尚未改变客户内网。

`html-express` 保留为候补研究证据，但不与 Report-Skill 同时安装，避免两个 HTML 汇报 Skill 触发冲突。

2026-07-13 复核决策：当前继续使用已经接入并验证通过的 Report-Skill。`nexu-io/html-anything` 虽然视觉能力上限和模板丰富度更高，但它属于独立 Next.js 应用，默认依赖本地 coding-agent CLI、Tailwind CDN、Google Fonts 和 jsDelivr，且没有正式 Release、Git Tag 或官方 Docker 交付。该项目本阶段暂缓，不启动 PoC、不加入 Compose、不制作镜像或增量包；后续只有在 Report-Skill 的真实业务效果无法满足需求时才重新评估。

## 9. 后续实施边界

进入正式客户更新前，只执行以下工作：

1. 在 CowAgent 前端使用真实业务材料确认模型选择 `html-report`，并观察最终文件附件展示；当前技术接入和 Web 文件下载链路已经通过。
2. 使用至少一份包含长表格的真实业务材料补充内容验收；移动端视口已经通过技术回归。
3. 验收后再决定是否复制到首装种子和制作独立 Skill 增量包。
4. 正式补丁必须包含 apply、verify、rollback、collect-logs、manifest 和 SHA256，且标记 `dependencyChange=false`。

不新增 PPT Skill，不把 HTML Anything、html-express、html-workbench 或第二个 HTML Skill 一并装入工作区。
