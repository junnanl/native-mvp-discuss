# RULE.md

## 工作空间规则

该目录是 Evo-Harness 的运行工作区，映射到容器内 `/home/agent/cow`。

## 目录结构

```text
AGENT.md          助手身份设定
USER.md           用户基本信息
RULE.md           工作区规则
MEMORY.md         长期记忆索引
skills/           离线预置 Skill 和后续增量 Skill
tmp/              临时文件和上传缓存
websites/         生成的网页类产物
knowledge/        可选知识库目录
```

## 离线要求

客户现场不得执行 `pip install`、`npm install`、`pnpm install`、`git clone` 或在线拉取 Skill/MCP。新增依赖必须在开发环境处理后，通过基础镜像、toolpack、sidecar 镜像或增量补丁交付。
