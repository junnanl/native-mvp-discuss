# patch-v1.0.7-browser-container-drissionpage 方案设计（已实施）

状态：**已制包，开发验证通过，待现场部署**（2026-09-07）
制品：`dist/cowagent-patch-v1.0.7-browser-container-drissionpage.tar.gz`
实现细节见 `DESIGN.md`；部署/回滚见 `docs/`；已知问题见 `docs/KNOWN-ISSUE-chromium-self-exit.md`。
依赖基线：客户内网现场实际基线 `offline-install 1.1.0`（CowAgent 2.1.7 + browser-use 0.13.8 Toolpack，**已部署**）

> 注意：`delivery/PATCH_INVENTORY.md` 中"1.1.0 尚未部署"的记录已过时，以本方案口径为准。
> 1.1.0 现场已实际导入。本补丁制包后需同步修正台账。

---

## 1. 背景与问题

现场自 1.1.0 上线 browser-use CLI-MCP 后，内网环境下浏览器频繁挂掉或重启。初步分析（待现场日志确认）：

1. **生命周期耦合**：`toolpacks/mcp/browser-use/bin/browser-use` launcher 在 MCP server 进程内拉起 Chromium，`trap ... EXIT` 使 MCP 进程退出时连带杀掉浏览器；MCP 被回收/超时重启即表现为"浏览器重启"，登录态丢失。
2. **资源压力**：容器内存限制下 Chromium OOM；tab 累积、孤儿 Chromium 占用 9223 端口后 launcher 复用不健康 CDP，进一步放大故障。
3. **无复用资产**：`browser_exec(code)` 模式下每次任务由 Agent 现场生成 Python 代码，无固化动作、无沉淀，出错率高且行为不可复现。

## 2. 已对齐的选型决策（与需求方确认过）

| 决策项 | 结论 |
|---|---|
| 执行引擎 | 改用 **DrissionPage**（CDP 直连、无需 webdriver、跨 iframe、内置等待重试、中文文档），替代 browser-use 执行层 |
| DrissionPageMCP | **不直接采用**。仅参考其工具集设计与 DOM 树 JSON 化思路；薄 MCP 自研 |
| 浏览器部署形态 | Chromium **抽离为独立 Docker 容器**，与 CowAgent 容器解耦；预留多实例扩展（多人场景按需起多份，先做单实例） |
| CowAgent 原生 browser 工具 | 保留不动，作为简单场景回退 |
| 2.1.2 回滚资产 | 继续保留 |

## 3. 版本固定（增量原则：能复用现场已有的一律不换）

| 组件 | 版本 | 来源与理由 |
|---|---|---|
| **Python** | **3.11.15**（复用） | 直接复用现场 `toolpacks/python/browser-use/runtime/` 内固化的 CPython 3.11.15，**不新增 Python 运行时**。DrissionPage 要求 Python 3.6+，3.11 兼容，无需升级 |
| **Chromium** | **120.0.6099.224-1~deb11u1**（复用） | 已从 `cowagent-offline:2.1.7-base.1-dev` 镜像 tar 的 dpkg 数据库核实。浏览器容器直接使用该现场已导入镜像运行 Chromium，**不制作、不传输新镜像**。Chromium 120 满足 DrissionPage 要求（官方仅提示避开 92 版），且 browser-use 阶段已验证该 Chromium 的 CDP 可用 |
| **DrissionPage** | **4.0.5.6（已锁定）** | 以需求方提供的离线文档 `DrissionPageDocs4.0.5.6` 为唯一 API 依据。开发环境制包，固化 `requirements.lock`，现场零安装。已确认该版本 `ChromiumPage(addr_or_opts='IP:端口')` 支持接管指定地址的已运行浏览器，满足跨容器 CDP 接管需求 |
| **MCP SDK** | mcp 1.26.0（复用） | 现有 browser-use site-packages 已固化 `mcp 1.26.0`，薄 MCP 基于它实现 stdio server，**不引入 fastmcp** |
| **参考实现** | DrissionPageMCP（仅参考，需版本核对） | 上游 DrissionPageMCP 要求 `drissionpage >= 4.1.0.18`，其工具实现基于 4.1.x API。**参考其工具集设计时，所有 API 调用必须逐一对照 4.0.5.6 官方文档核实**，以 4.0.5.6 文档为准，不得照搬其代码 |
| **mcp.json 注册** | 新增 `browser-dp` server | browser-use 条目置 `disabled: true` 保留（回滚只需翻转布尔值）；不删除原 toolpack |

## 4. 目标架构

```
┌─ 宿主机 docker compose ────────────────────────────────────┐
│                                                            │
│  ┌─ cowagent 容器（不动）────────────────────┐             │
│  │  CowAgent 2.1.7                           │             │
│  │  └─ browser-dp MCP（stdio，薄适配）        │             │
│  │     └─ DrissionPage 连接 CDP ─────────────┼──┐          │
│  └───────────────────────────────────────────┘  │          │
│                                                 │ CDP      │
│  ┌─ browser 容器（新增 service）────────────────▼──┐        │
│  │  镜像：cowagent-offline:2.1.7-base.1-dev        │        │
│  │  进程：chromium headless（固定 flags）           │        │
│  │  端口：9222（仅 compose 内网，不暴露宿主机）      │        │
│  │  卷：chromium-profile（登录态持久化）            │        │
│  │  mem_limit：独立配额（默认建议 2G，现场可调）     │        │
│  │  restart：on-failure                            │        │
│  └─────────────────────────────────────────────────┘        │
└────────────────────────────────────────────────────────────┘
```

要点：

- Chromium 常驻独立容器，MCP 进程重启、回收、超时均不影响浏览器与登录态；
- 浏览器容器崩溃时 `on-failure` 自动拉起，爆炸半径限制在浏览器容器内；
- 新增 compose override 增量下发，CowAgent 容器与镜像零改动。

## 5. 三层软件结构

```
Skill 层    skills/browser-dp/SKILL.md
            动作目录、标准流程、报错恢复、离线红线（不含密码/Cookie 落盘等）
MCP 工具层  toolpacks/mcp/browser-dp/（薄 MCP，stdio，固定 4 个工具）
动作脚本层  toolpacks/mcp/browser-dp/actions/*.py（参数化、可测试、带结构化返回值）
```

### MCP 工具集（固定 4 个）

| 工具 | 职责 |
|---|---|
| `browser_run(action, params)` | 动作分发器：执行 actions/ 库中固化动作 |
| `browser_snapshot()` | 读取当前页面结构化状态（DOM 摘要/可交互元素清单） |
| `browser_screenshot(full, max_dim)` | 截图（对齐现有工具语义） |
| `browser_exec(code)` | 逃生舱：脚本库未覆盖场景的原始执行通道 |

### 动作清单草案（以 DrissionPage 4.0.5.6 官方文档为 API 依据，研读后细化）

导航类：`open_tab` / `goto` / `wait_ready` / `close_tab` / `list_tabs`
定位交互类：`find_element` / `click` / `input_text` / `select_option` / `hover` / `press_key` / `scroll`
读取类：`read_page` / `read_table` / `read_text` / `get_attributes`
复合类（沉淀重点）：`login` / `fill_form` / `download_file` / `upload_file` / `export_table`
系统类：`run_js` / `listen_packets`（参考 DrissionPageMCP 的包监听能力）/ `health_check`

固化循环：现场探索（browser_exec）→ 验证可行 → 固化为 action → 写入 SKILL.md。

## 6. 资源治理（随补丁一并交付）

1. 浏览器容器独立 `mem_limit` + `restart: on-failure`；
2. tab 生命周期治理：动作层默认用完即关，同时存在 tab 数上限（默认 8），超限自动清理最旧非活动 tab；
3. `health_check` action：CDP 连通性 + 页面响应探测，供 CowAgent 在浏览器无响应时执行诊断与恢复（重启浏览器容器由运维脚本/容器策略承担，动作层不擅自重启）；
4. Chromium 启动 flags 维持离线加固（`--no-sandbox --disable-dev-shm-usage --disable-background-networking --disable-component-update` 等）+ `--remote-debugging-address=0.0.0.0`（仅 compose 网络可达）。

## 7. 补丁增量范围与目录布局

新增（不动现有文件）：

```
patch-v1.0.7-browser-container-drissionpage/
├── manifest.json                 # requiresBase: 1.1.0 现场基线
├── update.sh / verify.sh / rollback.sh / collect-logs.sh
├── checksums/
├── docs/（更新说明、部署说明、回滚说明）
└── patches/
    ├── compose/docker-compose.browser.yml        # 新增 browser service
    ├── toolpacks/mcp/browser-dp/                  # 薄 MCP + actions 库
    │   ├── bin/browser-dp                         # 入口（复用 3.11.15 runtime）
    │   ├── mcp_server.py
    │   ├── actions/*.py
    │   ├── requirements.lock（DrissionPage 固化版）
    │   └── manifest.json
    ├── toolpacks/python/drissionpage/site-packages/   # 离线固化的 DrissionPage 依赖闭包
    └── skills/browser-dp/SKILL.md
变更（仅两处布尔/挂载级改动）：
- storage/cow/mcp.json：browser-use → disabled: true；新增 browser-dp 条目
- compose：追加 override 引用 browser service
```

交付约束沿用既有红线：现场不执行 `pip install`/`uv`/`playwright install`/任何联网拉取；全依赖随包固化；SHA256 校验；`--network none` 验收。

## 8. 回滚设计

1. `rollback.sh` 恢复 `mcp.json` 原状（browser-use `disabled: false`、移除 browser-dp 条目）；
2. 撤销 compose override、停止并移除 browser 容器（chromium-profile 卷保留，登录态不丢）；
3. 重启 CowAgent 容器后回到 1.1.0 行为；browser-use toolpack 全程未删除。

## 9. 待定项（阻塞制包，不阻塞评审）

| # | 待定项 | 需要 | 责任方 | 状态 |
|---|---|---|---|---|
| 1 | DrissionPage 版本锁定 + 离线文档 | 提供目标版本的官方文档（离线优先） | 需求方 | **已解决**：锁定 4.0.5.6，离线文档已交付至开发环境 |
| 2 | 动作清单最终版 | 基于 4.0.5.6 文档细化参数/返回值后确认 | 双方 | 待文档研读后出草案 v2 |
| 3 | 浏览器容器内存配额 | 现场宿主机可用内存确认（默认建议 2G） | 需求方 | 待确认 |
| 4 | 现场故障日志（可选） | `BH_RUNTIME_DIR`/harness 日志、容器 dmesg，用于确认 OOM 假设与治理项优先级 | 需求方 | 可选 |

## 10. 验收口径（开发验证，全部 `--network none`）

1. 浏览器容器单独启停、崩溃自动拉起、profile 卷登录态保持；
2. 薄 MCP stdio 握手、4 工具发现、代表性动作（导航/定位点击/输入/读表/截图）通过；
3. MCP 反复重启期间 CDP 连接与浏览器会话不受影响（对应本次故障核心场景）；
4. tab 上限治理与 `health_check` 生效；
5. 补丁正序安装、逆序回滚、SHA256 与敏感信息扫描通过；
6. 验证通过前，本补丁状态只允许标注"开发验证通过"，不得写"已部署"。
