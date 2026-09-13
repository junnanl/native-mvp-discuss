# CowAgent 内网离线交付工程契约

## 1. 目标

本项目以 CowAgent 为基础，面向客户服务器内网离线环境交付。交付目标不是仅让服务运行，而是形成可重复安装、可升级、可回滚、可排障的离线工程结构。

客户现场默认只有 Docker 和 `docker compose` / `docker-compose`，不得依赖现场联网、现场构建或现场安装依赖。

## 2. 现场禁止事项

客户现场不得执行以下动作：

- 拉取镜像。
- 拉取源码。
- 拉取 npm、pnpm、pip 或系统依赖。
- 执行 `npm install`、`pnpm install`、`pip install`。
- 执行 `git clone`。
- 构建前端产物。
- 构建 Docker 镜像。

所有依赖、镜像、前端构建产物和二进制资产必须在开发或制包环境中提前准备。

## 3. 环境一致性原则

开发环境和客户现场运行环境必须走同一套 Docker Compose 和挂载逻辑。

开发态可以使用 `source-mounted` 做源码级覆盖，但不能绕过基础镜像、启动脚本、配置加载和补丁加载路径。否则会出现开发环境可运行、客户现场不可运行的问题。

客户现场增量交付使用 `patch-mounted`，不使用 `source-mounted`。

## 4. 运行分层

### 4.0 宿主机与容器边界

客户现场部署在客户服务器上。

客户可见、可配置、可备份的对象是宿主机侧内容：

- 部署根目录，例如 `/opt/cowagent-offline`。
- 宿主机对外暴露端口，例如 `COW_WEB_PORT=9899`。
- 宿主机运行数据目录，例如 `storage/`。
- 宿主机补丁目录，例如 `patch-mounted/`。
- 宿主机开发覆盖目录，例如 `source-mounted/`。
- 启停、验证、日志采集脚本。

容器内端口和容器内路径保持官方默认：

- 容器内 Web 端口：`9899`。
- 容器内工作区：`/home/agent/cow`。
- 容器内应用目录：`/app`。

客户部署参数不暴露容器内端口和容器内路径。Compose、脚本和 bootstrap 内部可以使用这些固定值，但客户文档不要求客户修改。

### 4.1 基础镜像层

基础镜像只固化重资产：

- 系统依赖。
- Python / Node 等运行时。
- Python / npm / pnpm 依赖。
- 前端构建依赖。
- 二进制依赖。
- CowAgent 基础运行环境。

基础镜像使用固定版本，不使用 `latest`。

### 4.2 运行配置层

运行配置分为两类：

- Docker 启动配置：通过 `.env.example` 管理，真实 `.env` 不进入交付包。
- CowAgent 运行配置：以前台模型管理和 `/app/config.json` 为准，必须持久化到宿主机 `storage/cow/app-config/config.json`。

`.env` 只负责宿主机端口、容器名、Web 密码初始值、主模型初始值等启动参数，不能作为前台模型配置的唯一来源。

前台保存的主对话模型、多模态视觉模型、向量模型、上下文长度、智能体步数等配置必须写入宿主机持久化 `config.json`。增量补丁不得覆盖该文件；只有显式提供 `CONFIG_SOURCE` 或人工确认时，才允许初始化或替换。

所有宿主机对外暴露端口必须可配置，避免客户现场端口冲突。

容器内端口和容器内路径保持 CowAgent 官方默认，不作为客户部署配置项暴露。

### 4.3 源码挂载层

`source-mounted` 用于开发态或源码级覆盖，便于本地调试和二次开发。

该目录不得存放运行数据、日志、数据库、上传文件、生成文件、缓存、真实密钥或 support bundle。

### 4.4 补丁挂载层

`patch-mounted` 用于客户现场增量补丁。

增量补丁只包含变化的轻资产：

- 前端构建产物。
- 后端解释型代码补丁。
- collector 补丁。
- 插件。
- 配置覆盖。
- 小型静态资源。

如果某次变更新增系统依赖、npm/pnpm/pip 依赖或二进制依赖，则不能走轻量补丁，必须升级基础镜像，并在补丁 manifest 中标记 `dependencyChange=true`。

### 4.5 运行数据层

`storage` 只保存运行数据和现场持久配置：

- 数据库。
- 上传文件。
- 用户生成文件。
- 日志。
- 缓存。
- support bundle。
- CowAgent 运行配置 `storage/cow/app-config/config.json`。

`storage` 不能作为代码补丁目录。

## 5. 补丁加载策略

容器启动时必须有明确的补丁加载策略。

优先级如下：

1. 如果 CowAgent 原生支持外部插件或配置加载，优先使用原生机制。
2. 如果原生机制不足，通过 entrypoint/bootstrap 脚本将 `patch-mounted` 中的补丁覆盖到容器内固定目标路径。
3. 覆盖前必须保留备份，或保证可通过补丁 manifest 和脚本执行回滚。
4. 补丁加载失败必须明确报错并停止，不允许静默降级。

## 6. 首装包要求

首装包必须支持：

- 一键安装。
- 一键启动。
- 一键停止。
- 一键状态检查。
- 一键验证。
- 一键采集日志。
- 离线镜像加载。
- SHA256 完整性校验。
- 包内容白名单检查。
- 敏感信息扫描。
- `docker compose` 和 `docker-compose` 兼容。

建议结构：

```text
delivery/offline-install/
  compose/
    docker-compose.yml
    .env.example
  images/
  model-assets/
  source-mounted/
  patch-mounted/
  toolpacks/
  scripts/
    install.sh
    start.sh
    stop.sh
    status.sh
    verify.sh
    collect-logs.sh
    build-package.sh
  docs/
    部署手册.md
    运维手册.md
    常见问题.md
  manifest.json
  dist/
```

## 7. 增量补丁包要求

增量补丁包只包含变化内容，不包含完整基础镜像，除非 manifest 明确标记 `dependencyChange=true` 且本次为基础镜像升级包。

补丁脚本必须支持：

- `apply`
- `verify`
- `rollback`
- `collect-logs`

补丁应用目标为部署目录下的挂载目录，例如：

```text
TARGET_ROOT/patch-mounted
```

补丁应用后可以重启容器，但不得要求客户重新构建镜像。

建议结构：

```text
delivery/patches/patch-v1.0.1/
  patches/
    frontend/
    backend/
    collector/
    plugins/
    config/
  scripts/
    apply.sh
    rollback.sh
    verify.sh
    collect-logs.sh
    build-package.sh
  docs/
    更新说明.md
    回滚说明.md
  manifest.json
  dist/
```

## 8. Manifest 要求

首装包和增量补丁包都必须包含 `manifest.json`。

manifest 至少记录：

- 包类型。
- 包版本。
- CowAgent 固定版本。
- 镜像名称和镜像 tag。
- 依赖是否变化。
- 宿主机对外端口配置项。
- 挂载目录。
- 覆盖路径。
- 回滚方式。
- SHA256 校验信息。
- 制包时间。

## 9. 校验要求

首装包和补丁包都必须包含：

```text
checksums/SHA256SUMS
```

安装脚本和补丁脚本必须校验包完整性。

制包和验证阶段必须检查：

- 脚本语法。
- SHA256。
- 内部 checksums。
- 敏感信息。
- 包内容边界。
- 宿主机对外端口是否可配置。
- 挂载目录是否正确。
- 是否兼容 `docker compose` 和 `docker-compose`。

## 10. 打包边界

打包必须使用白名单方式，不得直接压缩整个项目目录。

交付包不得包含：

- `.env`
- storage
- 数据库
- 上传文件
- 生成文件
- 日志
- support bundle
- 缓存
- 私钥
- 真实 API Key
- 现场临时文件

## 11. 后续执行顺序

本项目按以下顺序推进：

1. 调研 CowAgent 官方部署方式、镜像、端口、数据目录、环境变量、许可证、版本发布时间。
2. 判断 CowAgent 是否适合代码或构建产物挂载；不适合时说明原因和替代方案。
3. 选择固定版本，并说明为什么不用 `latest`。
4. 设计基础镜像层、运行配置层、挂载补丁层、运行数据层。
5. 设计首装包结构和增量补丁包结构。
6. 准备 compose、`.env.example`、脚本和文档。
7. 构建首装离线包。
8. 构建增量补丁包。
9. 执行校验，发现问题后先修复，再 review，再验证，直到本地可验证链路没有明显交付阻断问题。

## 12. API 调用文档

外部系统可以通过 Evo-Harness Web 通道 HTTP API 调用平台能力。当前 API 是 Web 控制台内部接口，不是 OpenAI 标准 `/v1/chat/completions` 协议。

调用顺序固定为：

1. `POST /auth/login` 登录并保存 Cookie。
2. `POST /message` 发送消息并获得 `request_id`。
3. `GET /stream?request_id=<request_id>` 读取 SSE 流式结果。
4. 如需附件，先 `POST /upload`，再把返回的 `file_path` 放入 `/message` 的 `attachments`。
5. 如需取消任务，调用 `POST /cancel`。

详细字段、curl 示例、Python 示例、JavaScript 示例、附件上传、文件下载和错误排查见：

```text
API_CALLING.md
delivery/offline-install/docs/API调用手册.md
```

后续如果要把平台能力正式开放给第三方业务系统，建议在现有 Web API 之上新增稳定 API Gateway 层，例如 `/api/v1/chat` 或 OpenAI-compatible `/v1/chat/completions`，并补充 Token 鉴权、请求审计、限流、统一错误码和 OpenAPI 文档。

## 13. 调研确认项

以下内容已通过 CowAgent 2.1.2 官方仓库、文档和镜像信息确认：

- CowAgent 固定版本：`2.1.2`。
- 官方镜像和 tag：`zhayujie/chatgpt-on-wechat:2.1.2`。
- 容器内默认 Web 端口：`9899`。
- 官方 Docker 默认工作区：`/home/agent/cow`。
- 容器内应用目录：`/app`。
- Web 控制台资源路径：`channel/web/chat.html` 和 `channel/web/static/`。
- 插件统一配置入口：`plugins/config.json`。
- Skill 工作区优先级：工作区 `skills/` 高于项目内置 `skills/`。
- Web 控制台不是前端构建型项目，客户现场不需要前端 build。

## 14. CowAgent 2.1.2 调研结论

### 14.1 固定版本

首版离线交付建议固定 CowAgent `2.1.2`。

选择依据：

- GitHub release `2.1.2` 发布于 `2026-06-18`。
- Docker Hub 存在固定镜像 tag `zhayujie/chatgpt-on-wechat:2.1.2`。
- 该版本包含 Web 控制台管理能力增强、知识库分类管理、多自定义模型供应商、会话重命名、Bash 流式输出、安全加固等能力。
- 该版本修复了 SSRF、skill 安装路径穿越等安全问题，适合作为离线交付基线。

不得使用 `latest`，原因：

- 官方仓库根部 `Dockerfile` 继承 `ghcr.io/zhayujie/chatgpt-on-wechat:latest`，不满足可重复交付要求。
- 官方 `docker/docker-compose.yml` 使用 `zhayujie/chatgpt-on-wechat`，未显式固定 tag。
- `latest` 会随上游推送变化，客户现场问题无法可靠复现。

### 14.2 镜像事实

官方 Docker Hub 固定镜像：

```text
zhayujie/chatgpt-on-wechat:2.1.2
digest: sha256:02b33e78f6f0ccef4180359192613da8d63736d1c517b05bbed6f6f2d283822f
architecture: linux/amd64
size: 约 703 MB
last_pushed: 2026-06-18
```

离线交付时不直接依赖客户现场拉取该镜像。制包环境可以基于该镜像或源码构建内部基础镜像，然后导出为离线镜像 tar，并在 compose 中使用内部固定镜像名，例如：

```text
cowagent-offline:2.1.2-base.2-dev
```

### 14.3 官方 Docker 部署结构

官方 Docker Compose 关键事实：

- 服务名：`chatgpt-on-wechat`
- 容器名：`chatgpt-on-wechat`
- 默认端口映射：`9899:9899`
- 默认工作区挂载：`./cow:/home/agent/cow`
- Web 对外访问需要将 `WEB_HOST` 设置为 `0.0.0.0`
- Web 密码通过 `WEB_PASSWORD` 配置

官方 Docker entrypoint 行为：

- 默认工作目录为 `/app`
- 默认执行命令为 `python app.py`
- 默认配置路径为 `/app/config.json`
- 容器启动时会创建 `/home/agent/cow` 并将其 owner 调整为 `agent`
- 最终以非 root 用户 `agent` 运行应用

### 14.4 核心配置

CowAgent 读取根目录下的 `config.json`。

官方支持通过 Docker 环境变量覆盖部分配置，关键项包括：

- `COW_LANG`
- `CHANNEL_TYPE`
- `MODEL`
- `WEB_HOST`
- `WEB_PASSWORD`
- `AGENT`
- `AGENT_MAX_CONTEXT_TOKENS`
- `AGENT_MAX_CONTEXT_TURNS`
- `AGENT_MAX_STEPS`

源码配置中还存在离线交付需要重点固定的配置：

- `web_port`：默认 `9899`
- `agent_workspace`：默认 `~/cow`
- `appdata_dir`：默认空，数据路径落在项目根目录
- `web_file_serve_root`：默认 `~`
- `knowledge`：默认开启
- `web_console`：默认开启

离线交付建议保持容器内默认值，只暴露宿主机配置：

- 宿主机 Web 端口：`.env` 中的 `COW_WEB_PORT`，默认可取 `9899` 或项目自定义端口。
- Compose 项目名：`.env` 中的 `COW_COMPOSE_PROJECT_NAME`，用于避免同机多实例或开发/交付环境互相影响。
- 容器名：`.env` 中的 `COW_CONTAINER_NAME`，用于运维定位和多实例隔离。
- Compose 端口映射：`${COW_WEB_PORT:-9899}:9899`。
- 容器内 Web 端口：固定使用 CowAgent 默认 `9899`。
- 容器内工作区：固定使用官方 Docker 默认 `/home/agent/cow`。
- 宿主机工作区数据：固定映射到部署目录下的 `storage/cow`。
- 内网模型、密钥、Web 密码等运行配置仍通过 `.env` 或启动脚本生成，不把真实 `.env` 放入交付包。

客户部署文档只说明宿主机端口和宿主机部署目录；容器内端口和路径作为实现细节，不要求客户理解或修改。

### 14.5 Web 前端形态

CowAgent Web 控制台不是前端构建型项目。

Web 资源位于：

```text
channel/web/chat.html
channel/web/static/
```

静态资源包含本地 vendored 资源，例如 Tailwind、FontAwesome、Markdown-it、Highlight.js、字体和图标。客户现场不需要执行 `npm install`、`pnpm install` 或前端 build。

因此前端二开可以作为轻量补丁挂载静态文件，例如：

```text
patches/frontend/channel/web/chat.html
patches/frontend/channel/web/static/js/console.js
patches/frontend/channel/web/static/css/console.css
patches/frontend/channel/web/static/logo.jpg
```

### 14.6 技能与插件加载机制

CowAgent Skill 加载优先级：

1. 工作空间技能：`~/cow/skills/`
2. 项目内置技能：`skills/`

同名技能按优先级覆盖。

在离线交付中，容器内工作空间保持官方默认：

```text
/home/agent/cow
```

则客户现场增量技能可以落到：

```text
/home/agent/cow/skills/
```

宿主机侧对应运行数据目录：

```text
storage/cow/skills/
```

`patch-mounted` 用于交付补丁输入，不直接当作 CowAgent 工作空间。补丁脚本负责把增量技能或配置写入对应宿主机挂载目录。

插件配置支持统一配置文件：

```text
plugins/config.json
```

官方注释明确说明该入口用于解决 Docker 运行时插件配置不方便映射的问题。因此插件配置覆盖优先走原生机制，不应优先修改插件源码。

### 14.7 运行数据目录

CowAgent 的持久化运行数据应按工作区隔离，主要包括：

- `AGENT.md`
- `USER.md`
- `RULE.md`
- `MEMORY.md`
- `memory/`
- `knowledge/`
- `skills/skills_config.json`
- `sessions/conversations.db`
- `tmp/`
- `websites/`
- `mcp.json`
- 浏览器 profile，默认可能落在 `~/.cow/browser_profile`

离线交付必须将这些运行数据归入 `storage` 或工作区挂载，不得混入 `patch-mounted`。

### 14.8 离线风险点

以下能力在内网离线环境中必须特别处理：

- Skill Hub、GitHub、ClawHub、URL 安装技能默认依赖外网，客户现场不得使用在线安装。
- MCP 配置可能使用 `npx`、`uvx` 等命令，首次运行可能拉包；离线交付必须改为本地已打包命令或禁用。
- Browser 工具依赖 Playwright 和 Chromium，必须固化进基础镜像，不能现场执行 `playwright install chromium`。
- Office/PDF 读取能力依赖 `python-docx`、`openpyxl`、`python-pptx`、`pypdf` 等可选依赖，若交付目标包含 Office 文件处理，必须固化进基础镜像。

### 14.9 当前预置 Skill 与依赖基线

开发环境已安装并计划纳入离线交付资产的 Skill：

- `xlsx`
- `docx`
- `official-writing`
- `markdown-converter`
- `Word---DOCX`
- `pdf`
- `pptx`
- `eda-reporter`

这些都是 Skill，不是 MCP。它们安装后位于：

```text
storage/cow/skills/
```

但“Skill 已下载”不等于“能力已完整可用”。当前开发基础镜像 `cowagent-offline:2.1.2-base.2-dev` 已补齐以下办公处理依赖：

- 系统/二进制：`LibreOffice/soffice`、`pandoc`、`poppler-utils/pdftoppm`、`tesseract`。
- Node 工具链：`node`、`npm`、`npx`，以及 `docx`、`pptxgenjs` 等全局包。
- Python 包：`markitdown`、`pdfplumber`、`pdf2image`、`pytesseract`、`pandas`、`matplotlib`、`jinja2`、`seaborn`、`scipy`、`scikit-learn`、`defusedxml`。
- `markdown-converter` 使用基础镜像内置 `markitdown` 命令，不依赖 `uvx` 在线拉取。
- `eda-reporter` 的 ECharts 资源已本地化，不再依赖 jsDelivr CDN。

结论：开发态办公依赖基线已经跑通；正式首装包仍未冻结。后续若新增系统依赖、Python 依赖、Node 依赖或二进制依赖，仍必须升级基础镜像，并在 manifest 中标记 `dependencyChange=true`。

注意：`cow skill list` 默认读取 `/app/config.json`，不会正确反映 Compose 环境变量中的 `AGENT_WORKSPACE`。验收工作区 Skill 时应以 `SkillManager(custom_dir="/home/agent/cow/skills")` 或 Web/Agent 初始化结果为准，不以该 CLI 输出作为唯一依据。

注意：官方 `2.1.2` 镜像中的 `/app/cli/VERSION` 可能仍显示 `2.1.1`，会导致 `/api/version` 和 Web UI 版本号不一致。开发基础镜像 `cowagent-offline:2.1.2-base.2-dev` 已显式修正该文件为 `2.1.2`。

- 默认模型、语音、图片、搜索、在线渠道配置中包含公网地址，离线包必须通过默认配置关闭或替换为客户内网模型/服务地址。

## 15. 离线交付分层设计

### 15.1 宿主机部署根目录

客户服务器上的部署根目录由安装脚本参数决定，默认建议：

```text
/opt/cowagent-offline
```

安装后宿主机目录结构：

```text
/opt/cowagent-offline/
  compose/
    docker-compose.yml
    .env
    .env.example
    storage/
      cow/
      logs/
      backups/
    source-mounted/
    patch-mounted/
  images/
  scripts/
  checksums/
  manifest.json
```

`storage/` 是运行数据，客户需要备份。`patch-mounted/` 是补丁应用后的挂载输入，不能放日志、数据库和上传文件。`source-mounted/` 只用于开发态或二开调试，客户现场默认不使用。

### 15.2 Compose 映射设计

Compose 只暴露宿主机端口配置：

```yaml
name: ${COW_COMPOSE_PROJECT_NAME:-cowagent-offline}

network_mode: bridge

ports:
  - "${COW_WEB_PORT:-9899}:9899"
```

容器内端口固定为 CowAgent 默认 `9899`。当前是单容器服务，使用 Docker 默认 `bridge` 网络，不让 Compose 创建额外 project network，减少客户服务器 Docker 网段池冲突风险。

建议挂载：

```yaml
volumes:
  - ../storage/cow:/home/agent/cow
  - ../storage/logs:/var/log/cowagent-offline
  - ../patch-mounted:/opt/cowagent/patch-mounted:ro
  - ../source-mounted:/opt/cowagent/source-mounted:ro
  - ../toolpacks:/opt/cowagent/toolpacks:ro
```

其中 `/home/agent/cow`、`/opt/cowagent/patch-mounted`、`/opt/cowagent/source-mounted` 是内部实现细节，不作为客户配置项。

### 15.3 基础镜像设计

基础镜像建议命名：

```text
cowagent-offline:2.1.2-base.2-dev
```

当前开发基础镜像已固化：

- CowAgent 2.1.2 基础代码。
- Python 运行时。
- CowAgent 核心依赖。
- Office/PDF 文件处理依赖：LibreOffice、pandoc、poppler、tesseract、常用字体。
- Node 24.18.0、npm/npx，以及全局 `docx`、`pptxgenjs`。
- Python 办公分析依赖：`markitdown`、`pdfplumber`、`pdf2image`、`pytesseract`、`pandas`、`scipy`、`scikit-learn`、`matplotlib`、`seaborn`、`jinja2`、`PyMuPDF` 等。

当前开发基础镜像尚未纳入 Playwright/Chromium 浏览器工具。若后续 Web 自动化、浏览器 MCP 或网页抓取能力成为交付范围，必须单独评估基础镜像升级或 sidecar 镜像，不能在客户现场执行 `playwright install`。

基础镜像不得固化：

- 客户真实 `.env`。
- 客户模型 API Key。
- storage 运行数据。
- 客户现场生成文件。
- 日志。
- support bundle。

### 15.4 运行配置设计

`.env.example` 面向客户只暴露宿主机和启动必要配置：

```text
COW_COMPOSE_PROJECT_NAME=cowagent-offline
COW_CONTAINER_NAME=cowagent-offline
COW_WEB_PORT=9899
COW_WEB_PASSWORD=
COW_MODEL=
COW_OPENAI_COMPATIBLE_BASE_URL=
COW_OPENAI_COMPATIBLE_API_KEY=
```

真实 `.env` 由客户现场从 `.env.example` 复制或由安装脚本生成，不进入交付包。

容器内 `WEB_HOST=0.0.0.0` 固定在 compose 或启动脚本中，客户不需要修改。

CowAgent 前台运行配置必须持久化为：

```text
storage/cow/app-config/config.json
```

并挂载到容器：

```text
/app/config.json
```

该文件是现场模型和智能体参数的长期主配置，至少覆盖：

- `model`
- `bot_type`
- `open_ai_api_base`
- `open_ai_api_key`
- `dashscope_api_key`
- `tools.vision.provider`
- `tools.vision.model`
- `embedding_provider`
- `embedding_model`
- `agent_max_context_tokens`
- `agent_max_context_turns`
- `agent_max_steps`
- `web_password`

前台模型管理保存配置时会写入 `/app/config.json`。如果该文件没有宿主机持久化挂载，容器重建或某些增量补丁应用后会丢失模型、视觉模型、向量模型和上下文长度配置，导致客户必须重新在前台配置。该情况属于交付阻断问题。

配置文件挂载后，模型、Embedding、Rerank 和 Agent 上下文参数必须以 `storage/cow/app-config/config.json` 为唯一运行来源。Compose 中的 `MODEL`、`BOT_TYPE`、模型 Key/Base URL、`EMBEDDING_*`、`RERANK_*` 和 `AGENT_MAX_*` 只允许用于首次生成配置文件；容器正式启动前必须清除这些环境变量，避免 CowAgent 的环境变量优先级在每次重启时覆盖前台保存值。

容器网络地址规则：

- 模型服务在 CowAgent 宿主机：Base URL 使用 `host.docker.internal`，Compose 增加 `host.docker.internal:host-gateway`。
- 模型服务在其他内网服务器：Base URL 使用实际内网 IP 或域名。
- 禁止把宿主机模型服务写成容器内 `127.0.0.1`；该地址只指向 CowAgent 容器自身，会产生 `Connection refused`。

2026-07-13 开发环境验证：自定义 `gpt-5.5` 服务原配置为 `http://127.0.0.1:15721/v1`，修正为 `http://host.docker.internal:15721/v1` 后，模型直连和 Evo-Harness Agent SSE 对话均成功。开发 Compose 已挂载 `storage/cow/app-config/config.json`，并在容器重建后保持模型和上下文配置不变。

增量补丁对运行配置的规则：

1. 不得把真实 `config.json` 打进补丁包。
2. 不得默认覆盖 `storage/cow/app-config/config.json`。
3. 需要初始化现场配置时，通过补丁脚本参数 `CONFIG_SOURCE=/path/to/config.json` 显式传入。
4. 应用前必须备份原配置到 `storage/backups/patches/<patchVersion>/`。
5. 验证必须确认容器 `/app/config.json` 已挂载到宿主机运行配置文件。

### 15.5 补丁加载设计

补丁来源目录：

```text
patch-mounted/
```

补丁输入目录只保存本次已应用的轻资产，不保存运行数据。

容器启动时 bootstrap 处理顺序：

1. 读取补丁 manifest。
2. 校验补丁文件 SHA256。
3. 判断 `dependencyChange`。
4. 如果 `dependencyChange=true` 且当前基础镜像版本不匹配，启动失败并提示升级基础镜像。
5. 对每个覆盖项执行备份。
6. 将补丁覆盖到容器内目标路径。
7. 写入补丁应用记录。
8. 启动 CowAgent。

优先使用 CowAgent 原生机制：

- Skill 增量：写入宿主机 `storage/cow/skills/`。
- MCP 配置：写入宿主机 `storage/cow/mcp.json`，但必须引用离线可用命令。
- 插件配置：通过 `plugins/config.json` 覆盖。

源码或静态资源补丁才走 bootstrap 覆盖。

品牌、logo、favicon、Web 文案、外链隐藏等前端轻量补丁不升级基础镜像，按以下方式交付：

1. 补丁包将前端覆盖文件写入宿主机 `patch-mounted/frontend/`。
2. 补丁包将 `docker-compose.override.yml` 写入宿主机 `compose/`。
3. override 只增加启动环境变量，例如 `CHATGPT_ON_WECHAT_EXEC`，让容器启动时先执行 `patch-mounted/frontend/bootstrap-brand.sh`。
4. bootstrap 在容器内把 `patch-mounted/frontend/channel/` 覆盖到 `/app/channel/`，再执行原应用启动命令。
5. 回滚时恢复应用前备份的 `patch-mounted` 和 `compose/docker-compose.override.yml`，然后重启服务。

已验证的品牌补丁示例：`delivery/patches/patch-v1.0.2-brand-evo-harness/`，补丁目标是将 Web 可见品牌改为 `Evo-Harness`，隐藏外部文档、官网、GitHub 和技能广场入口。

运行配置持久化补丁示例：`delivery/patches/patch-v1.0.3-runtime-config-persistence/`，补丁目标是把现场 `/app/config.json` 固定到宿主机 `storage/cow/app-config/config.json`。该补丁不包含真实模型 Key；真实配置通过现场 `CONFIG_SOURCE` 初始化或由前台模型管理继续写入。

### 15.6 运行数据设计

宿主机运行数据目录：

```text
storage/
```

建议拆分：

```text
storage/
  cow/
    app-config/
      config.json
    AGENT.md
    USER.md
    RULE.md
    MEMORY.md
    memory/
    knowledge/
    skills/
    sessions/
    tmp/
    websites/
    mcp.json
  logs/
  backups/
```

`storage/cow` 映射到容器内 `/home/agent/cow`。

补丁回滚备份放在：

```text
storage/backups/patches/<patchVersion>/
```

日志采集输出放在：

```text
storage/logs/support-bundles/
```

support bundle 不进入补丁包和首装包打包输入。

### 15.7 挂载目录权限

CowAgent 官方镜像入口会以容器内 `agent` 用户运行应用进程。宿主机挂载目录如果保留宿主机用户 owner 和常规 `755/644` 权限，就容易因为 UID/GID 不一致导致容器内不可写。

本项目交付优先保证内网离线环境的可用性。对 CowAgent 运行和补丁写入相关的挂载目录，采用宽松权限策略：

```text
storage/
patch-mounted/
source-mounted/
toolpacks/
model-assets/
scripts/
```

这些目录在安装、启动和补丁应用后统一设置为所有用户可读写，目录和脚本保留可执行位。这样开发环境、客户服务器和补丁脚本以不同宿主机用户执行时，都不会因为 owner 不一致影响上传、Skill 配置保存、补丁覆盖或回滚。

权限开放边界必须明确：

```text
开放：运行数据目录、Skill 目录、tmp 目录、补丁挂载目录、开发挂载目录、toolpacks、model-assets、交付脚本
不开放：.env、真实密钥、镜像 tar、SHA256 清单、manifest
```

原因是开发迁移、离线预置 Skill、补丁包写入 Skill/MCP 配置时，文件 owner 可能变成任意宿主机用户。若只依赖 owner，CowAgent 可能读取到 Skill，但无法写入 `storage/cow/skills/skills_config.json`，日志中会出现 `Permission denied`。

Web 上传文件会写入工作区 `tmp/`，宿主机侧对应 `storage/cow/tmp`。该目录也必须允许容器内 `agent` 用户写入，否则上传附件时会出现类似：

```text
Permission denied: '/home/agent/cow/tmp/web_xxxxxxxx.pptx'
```

`install.sh`、`start.sh`、补丁 `apply.sh` 和补丁 `rollback.sh` 会对上述挂载目录做宽松权限归一化；`verify.sh` 会使用容器内 `agent` 用户实际写入临时文件，验证上传目录可写。

`storage/logs/support-bundles/` 作为运行目录也会继承宽松权限，但它仍然是运行产物，不得进入首装包和补丁包打包输入。日志采集脚本必须继续执行脱敏。

权限归一化属于部署脚本职责，不作为客户需要手动理解或修改的配置项。

## 16. 首装包设计

### 16.1 制品结构

首装包源码目录：

```text
delivery/offline-install/
  compose/
    docker-compose.yml
    .env.example
  patch-mounted/
  source-mounted/
  toolpacks/
  model-assets/
  seed/
    workspace/
      AGENT.md
      USER.md
      MEMORY.md
      RULE.md
      skills/
  images/
    cowagent-offline-2.1.2-base.2-dev.tar
  scripts/
    install.sh
    start.sh
    stop.sh
    status.sh
    verify.sh
    collect-logs.sh
    build-package.sh
  docs/
    部署手册.md
    运维手册.md
    常见问题.md
  checksums/
    SHA256SUMS
  manifest.json
  dist/
```

`dist/` 只保存打包输出，不作为打包输入。当前阶段 `dist/`、`images/` 和 `checksums/` 下已有文件只视为过程产物，不代表正式首装包已经冻结。首次正式交付前必须重新导出镜像 tar、重新打包、重新生成 SHA256。

`seed/workspace/` 是首装默认工作区种子，用于预置干净的工作区文件和默认办公 Skill。安装脚本会把它复制到目标服务器的 `storage/cow`，但不覆盖客户已有文件。

`storage/` 是安装后运行时目录，由安装脚本在目标服务器创建，不进入首装包打包输入。开发态 `storage/` 下的上传文件、生成文件、memory、knowledge、tmp 和日志不得进入首装包。

### 16.2 安装脚本职责

`install.sh` 必须执行：

1. 检查 Docker。
2. 检查 `docker compose` 或 `docker-compose`。
3. 校验 `checksums/SHA256SUMS`。
4. 检查目标目录是否存在。
5. 创建宿主机目录结构。
6. 复制 compose、脚本、manifest、checksums。
7. 从 `seed/workspace` 初始化目标服务器 `storage/cow`，不覆盖已有文件。
8. 只加载 manifest 中 `baseImage` 对应的离线镜像 tar，不扫描加载 `images/` 下其他 tar。
9. 如果目标目录没有 `.env`，从 `.env.example` 生成。
10. 执行包内容和敏感信息边界检查。
11. 输出启动命令。

`install.sh` 不自动生成真实密钥，不自动访问外网，不自动修改客户防火墙。

### 16.3 启停和验证脚本职责

`start.sh`：

- 自动选择 `docker compose` 或 `docker-compose`。
- 使用目标目录下的 `.env`。
- 启动服务。

`stop.sh`：

- 停止服务。
- 不删除 volume、storage 和镜像。

`status.sh`：

- 输出容器状态。
- 输出宿主机端口。
- 输出镜像版本。

`verify.sh`：

- 校验 compose 配置。
- 校验宿主机端口配置存在。
- 校验容器健康状态。
- 请求 Web 首页或健康探测地址。
- 校验 storage、patch-mounted、source-mounted 映射存在。

`collect-logs.sh`：

- 采集 compose 配置脱敏副本。
- 采集容器状态。
- 采集容器日志。
- 采集 manifest。
- 采集 `.env` 脱敏副本。
- 打包到 `storage/logs/support-bundles/`。

## 17. 增量补丁包设计

### 17.1 制品结构

```text
delivery/patches/patch-v1.0.1/
  patches/
    frontend/
    backend/
    plugins/
    skills/
    config/
  scripts/
    apply.sh
    rollback.sh
    verify.sh
    collect-logs.sh
    build-package.sh
  docs/
    更新说明.md
    回滚说明.md
  checksums/
    SHA256SUMS
  manifest.json
  dist/
```

### 17.2 轻量补丁允许范围

允许走轻量补丁：

- `channel/web/chat.html`
- `channel/web/static/` 下的 JS、CSS、图片、字体、图标。
- 后端 Python 源码小补丁。
- 内置插件配置。
- 新增或更新 Skill。
- 默认配置覆盖。
- MCP 配置，但必须只引用离线已存在命令。

不允许走轻量补丁：

- 新增系统包。
- 新增 Python 包。
- 新增 npm/pnpm 包。
- 新增 Playwright 浏览器。
- 新增二进制依赖。
- 需要重新构建镜像才能生效的变更。

### 17.3 Toolpack 机制

为避免每次新增 MCP 或 Skill 都升级完整基础镜像，离线交付需要预留 `toolpacks/` 机制。

Toolpack 用于承载“比纯源码补丁重、但又不一定需要重做主镜像”的能力包。

建议宿主机目录：

```text
toolpacks/
  mcp/
  skills/
  binaries/
  node/
  python/
```

建议容器内只读挂载：

```text
/opt/cowagent/toolpacks
```

Toolpack 可承载：

- 已下载好的 MCP server 源码或包。
- 已离线化的 Node/Python 用户态依赖。
- 小型可执行文件。
- Skill 依赖的资源包。
- 插件依赖的静态资源。

Toolpack 不承载：

- 需要 apt/yum/apk 安装的系统库。
- Playwright/Chromium 这类浏览器运行时。
- LibreOffice 这类大型系统软件。
- 需要修改主镜像 PATH、系统链接库、系统字体或 glibc 的内容。

新增 MCP / Skill 时按以下规则判断：

1. 仅新增 `SKILL.md`、脚本、配置、静态资源：走轻量补丁。
2. 新增用户态依赖且可通过固定路径直接运行：走 toolpack。
3. 新增独立服务型 MCP：优先做 MCP sidecar 镜像，避免改 CowAgent 主镜像。
4. 新增系统级依赖或必须安装到主容器系统路径：升级基础镜像，manifest 标记 `dependencyChange=true`。

Toolpack 仍属于离线包的一部分，客户现场不得执行 `npm install`、`pip install`、`npx`、`uvx` 在线拉取。

### 17.4 OfficeCLI 引入决策

`iOfficeAI/OfficeCLI` 是候选的本地 Office 文件引擎：它为 Agent 提供 `.docx`、`.xlsx`、`.pptx` 的创建、读取、修改和渲染校验能力。它补强现有 `docx`、`xlsx`、`pptx` 等 Skill 的执行能力，不替代 CowAgent 的 Web 界面、模型服务或 Skill 管理机制。

截至 2026-07-10，候选上游版本为 `v1.0.134`（2026-07-09 发布，Apache-2.0）；该版本发布过新，不直接冻结进客户交付。先在开发环境完成 Office 三件套、中文字体、附件读写、渲染预览、断网运行和权限的验收，再锁定实际交付版本、下载地址和 SHA256。

预期交付方式：将已校验的 Linux x64 单文件二进制置于 `toolpacks/binaries/officecli/officecli`，由专用 CowAgent Skill 使用该固定绝对路径调用；Skill 文档和调用脚本置于工作区 `storage/cow/skills/`。不在客户服务器安装 npm、.NET、Microsoft Office 或 LibreOffice 扩展，也不暴露 OfficeCLI 的预览端口。

OfficeCLI 只有同时满足以下条件，才可作为 `dependencyChange=false` 的 Toolpack 增量包交付：

1. 在当前 Debian 基础镜像中可直接运行，且不依赖现场安装的系统库或运行时。
2. 断网状态下可完成创建、编辑、渲染三类验证，执行期间不访问外部网络。
3. 输出的中文 Word、Excel、PowerPoint 可被 LibreOffice 和常用 Office 客户端正常打开。
4. 二进制、Skill 和版本清单均具备 SHA256 校验、备份和回滚路径。

任一条件不满足，或后续需要增加系统库、字体、运行时或其他二进制依赖时，必须升级基础镜像，并在 manifest 中标记 `dependencyChange=true`；不得伪装成普通轻量补丁。

#### 17.4.1 开发环境验收结论（2026-07-10）

已使用上游 `v1.0.134` 的 `officecli-linux-x64` 完成开发态验证。二进制 SHA256 为 `86a0b7d2a847ff2a9ee9e4be83b39300a3620184911698900608a32914970f51`，与上游 Release 资产一致。

- 在 `cowagent-offline:2.1.2-base.2-dev` 中，以 `--network none` 启动成功，版本输出为 `1.0.134`。
- 动态库仅使用基础镜像已具备的 glibc、`libdl`、`librt`、`libgcc_s`、`libpthread`、`libm`、`libstdc++`；未发现需要现场安装的运行时或系统包。
- 中文 DOCX、XLSX、PPTX 均完成了创建、编辑、`close` 保存、OpenXML `validate` 和 HTML 截图渲染；人工检查截图未发现中文乱码、截断、重叠或低对比度。
- 三份生成文件均能在同一断网容器中由已预置的 LibreOffice 转为 PDF，证明其可被现有离线办公基线打开。

因此，OfficeCLI 当前可按 `dependencyChange=false` 的 Toolpack 路线在开发环境接入：

```text
toolpacks/binaries/officecli/officecli
storage/cow/skills/officecli/SKILL.md
```

对应二进制清单为 `toolpacks/binaries/officecli/manifest.json`。开发容器已挂载并识别该 Skill。该结论不等于已向客户交付：上游项目和版本仍较新，正式客户补丁必须在真实业务文档回归、版本冻结和完整增量包校验后另行制作。现有 `v1.0.3` 运行配置现场更新包仍未部署，不受本次开发态验证影响。

#### 17.4.2 既有 Office Skill 的协作规则

OfficeCLI 已内置官方通用 Skill 和 `word`、`excel`、`pptx` 等官方专项 Skill。专项 Skill 可由固定二进制的 `load_skill` 命令在断网环境中直接输出；`v1.0.134` 已完成三类专项 Skill 的断网加载验证。

尚未冻结“OfficeCLI 完全替代现有 Skill”的交付决策。当前开发工作区保留并启用既有 `docx`、`xlsx`、`pptx` 和 `Word / DOCX` Skill，同时保留 OfficeCLI 离线适配层；本轮不改变客户环境。

拟定的目标主链路如下，须在真实业务样本回归后才执行切换：

1. Agent 命中 `officecli` 离线适配层。
2. 按文件类型执行官方 `load_skill word`、`load_skill excel` 或 `load_skill pptx`。
3. 严格遵循官方 Skill 的帮助优先和文件操作规则。
4. 本地适配层补充离线边界：不安装、不联网、不启动预览服务；完成 `close`、`validate` 和截图渲染。

判定是否切换的依据不是“OfficeCLI 可以运行”，而是官方专项 Skill 对真实业务 Word、Excel、PPT 的生成质量、编辑保真、模板兼容、中文渲染、公式/图表和回归稳定性均达到现有 Skill 基线。达到后，才把旧 Skill 改为默认停用但保留回退；未达到则继续采用组合模式。

“停用”仅指 CowAgent 前台的启用状态：在工作区 `skills/skills_config.json` 中将旧 Skill 的 `enabled` 设为 `false`。不得删除 `skills/docx/`、`skills/xlsx/`、`skills/pptx/`、`skills/Word---DOCX/` 及其文档、脚本和资源；需要回退时只把相应 `enabled` 改回 `true`，不重新下载或安装。该开关切换仅在官方 Skill 替代验收通过后执行。

开发工作区与首次安装种子目前仅包含 OfficeCLI 离线适配层，不预置旧 Skill 的停用配置：

```text
storage/cow/skills/officecli/SKILL.md
seed/workspace/skills/officecli/SKILL.md
```

#### 17.4.3 官方专项 Skill 代表性回归（2026-07-10）

已在 `--network none` 的当前基础镜像中，通过官方 `word`、`excel`、`pptx` 专项 Skill 的规则完成代表性回归：

- Word：中文标题、正文、固定宽度表格、OpenXML 校验、问题扫描和截图渲染均通过。
- Excel：中文表格、公式 `SUM(B2:B4)`、柱状图、公式结果、OpenXML 校验、问题扫描和截图渲染均通过。
- PPT：中文标题/正文/形状/演讲者备注、OpenXML 校验、问题扫描和截图渲染均通过。
- 三份文件均可在同一断网容器中由预置 LibreOffice 转为 PDF。

OfficeCLI 的问题扫描曾提示 Word 段落首行缩进不足；按其建议修正后，三种文件的 `view issues --json` 均为零问题。这证明官方 Skill 的“生成—检查—修复—复查”链路可用。

此结果仅说明官方 Skill 已达到开发态代表性基线，不能替代客户真实模板、带修订 Word、复杂公式/透视表 Excel、复杂母版/动画 PPT 的回归。正式停用旧 Skill 前，仍需用这些真实业务样本做最终对比验收。

### 17.5 补丁脚本职责

`apply.sh`：

1. 校验补丁包 SHA256。
2. 读取补丁 manifest。
3. 校验目标部署根目录。
4. 校验当前安装版本和基础镜像版本。
5. 如果 `dependencyChange=true`，停止轻量补丁流程并提示升级基础镜像。
6. 将源码、静态资源、插件配置补丁写入 `TARGET_ROOT/patch-mounted`。
7. 将 Skill、MCP 配置等 CowAgent 原生工作区资产写入对应宿主机 storage 目录。
8. 将可离线运行的用户态依赖包写入 `TARGET_ROOT/toolpacks`。
9. 备份被覆盖文件到 `TARGET_ROOT/storage/backups/patches/<patchVersion>/`。
10. 重启容器。
11. 执行补丁验证。

`rollback.sh`：

- 根据 manifest 和备份目录回滚。
- 回滚后重启容器。
- 执行回滚验证。

`verify.sh`：

- 校验补丁 manifest。
- 校验补丁文件 SHA256。
- 校验目标文件已写入。
- 校验服务可启动。
- 校验 Web 可访问。

`collect-logs.sh`：

- 复用首装包日志采集逻辑。
- 额外采集补丁应用记录和回滚记录。

### 17.6 PPT、HTML 汇报与固定工作流决策

详细调研和候选项目对比见仓库根目录：

```text
CAPABILITY_SKILL_WORKFLOW_RESEARCH.md
```

当前冻结以下原则：

1. OfficeCLI 继续作为 DOCX/XLSX/PPTX 的本地执行引擎，不直接叠加第二个大而全的通用 PPT Skill。
2. PPT 保持现状，不新增项目自有顶层 Skill，不创建 `evo-presentation` 或其他重复入口；继续使用现有 `pptx`、OfficeCLI 和 PptxGenJS 能力，后续只在现有 Skill 内做必要优化。
3. 新增通用 HTML 汇报 Skill，用于高管简报、项目汇报、调研报告、复盘和综合材料；现有 `eda-reporter` 继续只负责 CSV/Excel 探索性数据分析。
4. HTML 输出必须为自包含单文件或仅引用包内本地资产，不得使用 CDN、在线字体、远程图片或现场安装依赖。
5. 固定办公流程默认封装为“一个顶层 Skill + 确定性脚本 + 可选 Toolpack”，当前不引入 n8n、Dify、Flowise 等第二套工作流平台。
6. `skill-creator` 是创建 Skill 的元能力，与具体业务 Workflow Skill 不重复；后续增强现有创建规范，不再安装重复的 Generate Skill。
7. CowAgent 2.1.2 在多个匹配 Skill 中只读取一个最匹配 Skill，因此不得设计依赖连续读取多个 Skill 才能完成的主链路。
8. 项目方已明确当前部署和离线使用不涉及向第三方分发，因此 Anthropic `pptx/docx/xlsx/pdf` Skill 的相关条款不作为当前交付风险或阻断项，不因本次调研删除、关闭或替换现有 Skill。只有未来使用边界变为向独立第三方法律主体销售、转交或公开分发时，才重新确认许可证适用性。
9. 客户后续更新已冻结为三个连续增量版本：`v1.0.3` 运行配置持久化、`v1.0.4` OfficeCLI Toolpack、`v1.0.5` HTML Report Skill。三个现场包均已制作完成，但尚未在客户内网部署；开发环境已完成正序更新、逆序回滚、再次正序更新和状态依赖校验。
10. 通用 HTML 汇报唯一采用 `TheoRata/Report-Skill` 的 `skills/report/`，固定提交 `ffb97c2ce0c2f44449c1bc4fb6ef6057a27d02ca`。它已按 `html-report` 名称接入开发工作区，使用 Node.js 内置模块把 Markdown 机械渲染为单文件 HTML；113 项断网测试、中文截图和 CowAgent Web 文件下载已通过。正式客户增量包为 `v1.0.5-html-report`，当前尚未在客户内网部署。正式交付继续禁止重写渲染器或同时安装第二个 HTML 汇报 Skill。详细证据见根目录 `HTML_REPORT_SKILL_SELECTION.md`。
11. HTML 方案复核后继续使用 Report-Skill。`nexu-io/html-anything` 当前暂缓，不增加独立 Next.js 服务、不修改 Compose、不制作其基础镜像或增量包；只有 Report-Skill 的真实业务效果无法满足需求时才重新立项评估。

### 17.7 三个现场增量包的版本链

客户现场必须按以下顺序部署：

1. `v1.0.3-runtime-config-persistence`。
2. `v1.0.4-officecli-toolpack`。
3. `v1.0.5-html-report`。

每个包在 `storage/cow/patch-state/` 写入独立状态文件。后一个包必须检测到前一个包的 `status=applied` 才能继续；回滚必须按 `v1.0.5 → v1.0.4 → v1.0.3` 执行，较早版本发现后续版本仍为已应用状态时必须拒绝回滚。

三个客户现场包及总控脚本统一放在：

```text
delivery/intranet-updates/
```

该目录提供：

- `deploy-all.sh`：按顺序一键部署并逐包验证。
- `verify-all.sh`：验证三个版本状态和能力。
- `rollback-all.sh`：按逆序整体回滚。
- `collect-logs-all.sh`：采集四个更新相关日志。
- `checksums/SHA256SUMS`：校验总控脚本、文档和四个现场包。

## 18. 模型配置策略

模型侧不作为离线交付包的固定资产。开发环境可使用云端模型验证能力；客户现场替换为内网模型服务。

通用首装包和通用补丁只保留配置入口，不写入真实 key。客户明确授权制作的现场专用配置包可以包含该现场凭据，但必须在 manifest 标记为敏感现场资产，只允许受控内网保存和受控传输，不得进入公开仓库、普通文档、日志或通用交付包。

开发环境当前模型偏好：

- 主对话模型：DeepSeek V4 Pro。
- Embedding：通过阿里百炼 / DashScope key 配置。
- Rerank：通过阿里百炼 / DashScope key 配置。
- 轻量模型候选：Qwen 3.5 系列中较小参数量模型，准确模型 ID 在开发环境中验证后固定。

如果后续出现 multi-agent：

- 主智能体可继续使用 DeepSeek V4 Pro 处理核心规划、复杂推理和最终输出。
- 子智能体、分类、摘要、简单工具选择等任务可使用较轻量模型。
- 轻量模型属于配置项，不应写死在代码中。

模型配置必须通过 `.env`、宿主机持久化 `config.json` 或 Web 控制台完成。真实 key 不进入通用交付包、manifest、普通文档和日志采集结果；现场专用包是唯一例外，且必须显式标记并限制流转范围。

## 19. Manifest 设计

首装包 manifest 建议字段：

```json
{
  "packageType": "offline-install",
  "packageVersion": "1.0.0",
  "packageStatus": "development-not-frozen",
  "distArtifactsOfficial": false,
  "cowagentVersion": "2.1.2",
  "baseImage": "cowagent-offline:2.1.2-base.2-dev",
  "upstreamImage": "zhayujie/chatgpt-on-wechat:2.1.2",
  "upstreamDigest": "sha256:02b33e78f6f0ccef4180359192613da8d63736d1c517b05bbed6f6f2d283822f",
  "hostPorts": {
    "web": "COW_WEB_PORT"
  },
  "hostDirectories": {
    "storage": "storage",
    "patchMounted": "patch-mounted",
    "sourceMounted": "source-mounted",
    "toolpacks": "toolpacks"
  },
  "dependencyChange": false,
  "createdAt": ""
}
```

补丁包 manifest 建议字段：

```json
{
  "packageType": "patch",
  "patchVersion": "1.0.1",
  "packageStatus": "development-template-not-frozen",
  "requiresPackageVersion": "1.0.0",
  "requiresCowAgentVersion": "2.1.2",
  "requiresBaseImage": "cowagent-offline:2.1.2-base.2-dev",
  "dependencyChange": false,
  "restartRequired": true,
  "targets": [
    {
      "type": "frontend",
      "source": "patches/frontend/channel/web/static/logo.jpg",
      "target": "channel/web/static/logo.jpg",
      "strategy": "bootstrap-overlay",
      "rollback": "backup"
    }
  ],
  "checksums": {},
  "createdAt": ""
}
```

`target` 是相对目标路径，不写客户宿主机绝对路径。

## 20. 当前实施状态

[√] 首装包目录、Compose、`.env.example`、安装运维脚本和离线镜像已完成。
[√] 宿主机 Web 端口通过 `COW_WEB_PORT` 配置。
[√] 运行配置、代码补丁、Skill、Toolpack 和运行数据已分层。
[√] `v1.0.3`、`v1.0.4`、`v1.0.5`、`v1.0.6` 四个现场增量包已生成。
[√] 每个包具备 SHA256、备份、更新、验证、回滚和日志采集能力。
[√] 三包正序部署、逆序回滚、版本依赖阻断和再次正序部署已在开发环境通过。
[√] OfficeCLI 在 Docker 断网环境中完成版本及 Word/Excel/PPTX 官方 Skill 加载验证。
[√] HTML Report 113 项断网测试通过。
[√] 更新后 Evo-Harness Web、模型 SSE、OfficeCLI 和 HTML Report 均验证通过。
[ ] 四个现场增量包尚未导入和部署到客户内网。

### 20.1 v1.0.6 MCP SSH Manager

新增 `v1.0.6-mcp-ssh-manager`，固定上游 `bvisible/mcp-ssh-manager v3.7.0`、提交 `5c3a8137a3d8e083708770f067cada948d16022b`。采用 CowAgent 原生 stdio MCP 和 `toolpacks/mcp`，生产依赖已完整离线固化，不新增容器、端口或基础镜像依赖。

功能与安全基线：补丁不携带现场真实 SSH 凭据；37 个工具默认全部启用；连接默认 `unrestricted`，并可按服务器切换为 `readonly` 或带允许规则的 `restricted`；首次连接记录 SSH 主机密钥，后续密钥变化时拒绝，用户确认轮换后可重新信任。开发环境已完成真实 SSH 密码认证、命令执行、SFTP、rsync、主机密钥轮换、PostgreSQL 档案查询、四包逆序回滚和 `v1.0.3 → v1.0.6` 正序再部署。

最终标准补丁压缩包已独立解压，并在 `cowagent-offline:2.1.2-base.2-dev` 的 `--network none` 容器中完成 CowAgent 原生 stdio 握手、5/37 工具切换、SSH/数据库档案持久化、单服务器权限变更、管理脚本、rsync/sshpass/OpenSSH 运行和全部固化二进制动态库检查。现场执行脚本未发现 npm、pnpm、npx、apt、git clone、curl 或 wget 拉取依赖的行为。

客户内网当前仍只有首装包 `1.0.0` 和品牌补丁 `1.0.2`；`v1.0.3` 至 `v1.0.6` 均尚未部署。
