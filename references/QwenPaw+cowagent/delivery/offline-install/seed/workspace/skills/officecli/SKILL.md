---
name: officecli
description: "Use the official OfficeCLI Skill embedded in the local offline OfficeCLI binary for DOCX, XLSX, and PPTX work. This adapter only defines the offline binary path, official Skill loading commands, and delivery constraints."
---

# OfficeCLI 官方 Skill 离线适配层

这不是另一套 Office 业务 Skill。Office 文件的操作规则以当前固定版本 OfficeCLI 内置的**官方 Skill**为准；本文件只让其能在 Evo-Harness 的离线运行环境中被安全使用。

固定版本：`OfficeCLI v1.0.134`  
固定二进制：`/opt/cowagent/toolpacks/binaries/officecli/officecli`

## 官方专项 Skill 加载

先按任务类型加载官方专项 Skill，再严格遵循命令输出的规则：

```bash
OFFICECLI='/opt/cowagent/toolpacks/binaries/officecli/officecli'

# Word / DOCX
"$OFFICECLI" load_skill word

# Excel / XLSX / CSV
"$OFFICECLI" load_skill excel

# PowerPoint / PPTX
"$OFFICECLI" load_skill pptx
```

按需加载的官方专项 Skill：

```bash
"$OFFICECLI" load_skill financial-model
"$OFFICECLI" load_skill data-dashboard
"$OFFICECLI" load_skill academic-paper
"$OFFICECLI" load_skill pitch-deck
```

版本 `v1.0.134` 已在 Docker `--network none` 环境验证：`word`、`excel`、`pptx` 三个官方专项 Skill 均可直接加载，不依赖外部网络。

## 离线运行约束

- 禁止执行 `officecli install`、`officecli skills install`、MCP 注册、`curl`、`npm install`、`pip install` 或任何在线安装命令。
- 禁止 `officecli watch`、`--browser` 和其他预览服务器能力；不得暴露额外端口。
- 使用官方 Skill 时遇到不确定的参数，必须先执行 `"$OFFICECLI" help ...`，不猜测参数名。
- 输入附件先生成副本，最终文件保存到 `/home/agent/cow/tmp/`；不得覆盖用户原始附件。
- 每次修改完成后必须执行 `close <file>`，再执行 `validate <file>`；涉及版式时再执行离线截图渲染并检查。

## 与旧 Skill 的关系

旧 `docx`、`xlsx`、`pptx`、`Word / DOCX` Skill 已停用但保留在工作区，仅用于未来确认 OfficeCLI 不支持的特殊 OOXML、宏、复杂修订或动画时进行人工回退评估。普通 Office 文件任务不使用它们。
