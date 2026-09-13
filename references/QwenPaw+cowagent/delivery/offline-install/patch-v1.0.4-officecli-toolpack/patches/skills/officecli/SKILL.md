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

旧 `docx`、`xlsx`、`pptx`、`Word / DOCX` Skill 继续保留并维持现场原有启用状态，不删除、不覆盖其文件，也不由本增量包自动停用。OfficeCLI 先作为可选离线执行引擎接入；只有经过真实业务替代验收并形成单独决策后，才允许在前台把旧 Skill 改为停用，且必须保留随时回退能力。
