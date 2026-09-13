---
name: html-report
description: "仅在用户明确要求 HTML 汇报、HTML 报告、浏览器可阅读报告，或要求把结构化汇报交付为单个 .html 文件时，创建或修改设计化、可离线打开的 HTML 报告。普通分析或总结、PPT/Word/Excel/PDF、CSV/Excel 数据分析报告、网站或应用开发、需要自定义代码的交互大屏不得使用。"
---

# HTML 汇报 Skill

基于 `TheoRata/Report-Skill` 的现成渲染器生成专业、可下载、可离线打开的单文件 HTML 汇报。不要重新实现 HTML 引擎，也不要为普通问答、普通总结或未明确要求 HTML 的任务抢占其他 Skill。

固定上游版本：`ffb97c2ce0c2f44449c1bc4fb6ef6057a27d02ca`  
固定 Skill 路径：`/home/agent/cow/skills/html-report`  
固定输出目录：`/home/agent/cow/tmp/reports`

## 适用边界

仅在用户明确要求以下产物时使用：

- HTML 汇报、HTML 报告、浏览器汇报材料。
- 把现有长文、调研结果或 Markdown 转成设计化 HTML。
- 修改本 Skill 已生成的 HTML 报告，并保持同一输出文件。

以下任务不要使用：

- 普通分析、调研、总结、写作或聊天回答，但用户没有要求 HTML。
- PPTX、DOCX、XLSX、PDF 等 Office 文件任务。
- CSV/Excel 数据画像、异常检测和交互图表报告；这类任务由 `eda-reporter` 处理。
- 网站、管理后台、落地页、数据大屏或需要自定义前端工程的交互页面。

## 离线约束

- 禁止引用 CDN、在线字体、远程 CSS、远程 JavaScript 或远程图片。
- 禁止执行 `npm install`、`pnpm install`、`pip install`、`curl`、`wget` 或其他联网安装、下载命令。
- 所有渲染命令必须传入 `--no-open`，避免启动 review server、打开浏览器或产生额外端口。
- 不运行 `review.mjs`。容器内的 `127.0.0.1` review server 不能作为客户服务器的 Web 能力。
- 图片只有在已经嵌入为 `data:` URI 时才能写入报告；普通容器本地路径和 HTTP(S) 图片都会破坏下载后的完整性。没有可嵌入图片时，使用表格、文本和原生排版表达。
- 业务输出只写入 `/home/agent/cow/tmp/reports`，不得写入 Skill 目录。

## 新建报告

1. 创建固定输出目录：

   ```bash
   mkdir -p "/home/agent/cow/tmp/reports"
   ```

2. 将报告源文件写成 UTF-8 Markdown，保存为：

   ```text
   /home/agent/cow/tmp/reports/<safe-slug>.md
   ```

   文件名使用小写字母、数字和连字符，不使用空格。正文必须以 YAML frontmatter 开头：

   ```yaml
   ---
   title: 报告标题
   summary: 一到两句话概括报告目的和主要结论。
   generated_by: Evo-Harness
   date: 2026-07-13
   status: final
   tags: [汇报, 主题]
   ---
   ```

   `date` 使用执行当天日期；`status` 只能是 `draft`、`in-review`、`reviewed` 或 `final`。

3. 使用固定输入、输出路径渲染：

   ```bash
   node "/home/agent/cow/skills/html-report/render.mjs" \
     "/home/agent/cow/tmp/reports/<safe-slug>.md" \
     "/home/agent/cow/tmp/reports/<safe-slug>.html" \
     --no-open
   ```

4. 验证产物：

   ```bash
   node "/home/agent/cow/skills/html-report/verify-offline.mjs" \
     "/home/agent/cow/tmp/reports/<safe-slug>.html"
   ```

   如果扫描命中，先定位并移除远程资源，再重新渲染和验证。SVG 的标准命名空间 `http://www.w3.org/2000/svg` 不是网络请求，是唯一自动放行项。

5. 向用户返回 HTML 文件的绝对路径。Markdown 是可编辑源文件，也要保留，但首要交付物是 `.html`。交付时优先发送/附上 `.html` 文件本体；在文字中只给纯文本绝对路径，避免使用 Markdown 文件链接，因为前端可能把 `/home/...` 转成不可访问的 `127.0.0.1` URL。

## 修改已有报告

- 如果 `.md` 仍存在，直接修改 Markdown，并使用相同的显式 `.html` 输出路径重新渲染。
- 不直接编辑生成后的 HTML；再次渲染会覆盖这些改动。
- 主题/色调改版属于视觉副本需求时，不覆盖原版：先用同一个 Markdown 渲染为带主题后缀的新 `.html`，再只在新版 HTML 的主 `<style>` 末尾注入一段主题覆写 CSS，随后重新运行离线校验。此例外仅用于保留正文不变的样式变体。
- 如果只剩 HTML，先恢复 Markdown：

  ```bash
  node "/home/agent/cow/skills/html-report/extract.mjs" \
    "/home/agent/cow/tmp/reports/<safe-slug>.html" \
    "/home/agent/cow/tmp/reports/<safe-slug>.md" \
    --force
  ```

  修改后按“新建报告”的渲染与验证步骤覆盖原 HTML。

## 内容结构

报告优先采用以下顺序，不为凑版面编造章节：

1. 标题、摘要和元数据。
2. 背景与目标。
3. 核心发现或现状分析。
4. 关键数据、对比表格或证据。
5. 结论、建议和待解决问题。

正文使用 `##` 作为一级章节、`###` 作为二级章节。可使用 Markdown 表格、列表、代码块、脚注和以下 callout：`NOTE`、`INSIGHT`、`CAUTION`、`INFO`、`WARNING`、`TIP`、`DANGER`。

需要查看渲染器支持的完整语法时，读取 `references/UPSTREAM_SKILL.md` 的 Markdown 语法部分。该文件仅保留上游说明用于追溯；其中的 `~/.claude/skills/report`、相对 `reports/` 路径、Google Fonts、自动打开浏览器和 review server 流程均不得执行。

## 失败处理

- 渲染器返回非零状态时，直接报告具体错误并修复 Markdown，不得伪造成功产物。
- frontmatter 缺字段或 `status` 非法时，先修正源文件再重试。
- 发现远程资源、空文件、输出路径不在固定目录或尝试启动额外服务时，视为验证失败。

## 上游与许可证

- 上游原始 Skill 说明：`references/UPSTREAM_SKILL.md`
- 上游许可证：`LICENSE`
- 离线产物校验：`verify-offline.mjs`
- 本地改动仅包括 CowAgent 触发范围、固定路径、离线字体、离线校验和禁止额外端口的适配；渲染器保持上游实现。
