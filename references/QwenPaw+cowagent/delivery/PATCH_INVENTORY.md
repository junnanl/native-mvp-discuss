# CowAgent / Evo-Harness 补丁台账

最后更新：2026-09-07

## 状态口径

- `已制包`：正式压缩包和外部 SHA256 文件已生成。
- `开发验证通过`：已在本项目开发部署中完成安装、验证或回滚测试。
- `已内网部署`：已在客户内网目标服务器实际执行并确认成功。
- 开发目录 `delivery/offline-install/storage/cow/patch-state/` 中的状态文件只代表开发验证，不代表客户内网部署状态。

## 基线口径更正（2026-09-07）

**客户内网实际基线为 `offline-install 1.1.0`（CowAgent 2.1.7 + browser-use Toolpack），已于 2026-08 底实际导入。**
下表中 1.0.3 ~ 1.0.6 的"客户内网状态：尚未部署"为历史记录——这些补丁的内容已包含在
1.1.0 首装包中一并部署（1.0.3/1.0.4/1.0.5 的功能与 1.1.0 基线合并交付）。
`evo-harness-intranet-updates-v1.0.3-to-v1.0.6.tar.gz` 合集作为历史制品保留，现场无需再单独执行。

## 基线与补丁

| 版本 | 类型 | 内容 | 制品状态 | 客户内网状态 |
|---|---|---|---|---|
| `1.0.0` | 离线首装包 | CowAgent 2.1.2 基础镜像、Compose、运行目录、8 个办公 Skill、安装运维脚本 | 已制包、已部署 | 已部署 |
| `1.0.1` | 标准补丁模板 | 8 个办公 Skill | 已制包，但 manifest 标记为开发模板、未冻结 | 不作为正式现场补丁 |
| `1.0.2-brand-evo-harness` | 品牌补丁 | Evo-Harness 品牌、Logo、favicon、标题、外部入口隐藏及前端覆盖 bootstrap | 已制包、已部署 | 已部署 |
| `1.0.3-runtime-config-persistence` | 标准补丁及现场更新包 | 模型与 Agent 配置持久化、Skill 环境配置、`host.docker.internal` 映射 | 已制包、开发验证通过 | **尚未部署** |
| `1.0.4-officecli-toolpack` | 标准补丁及现场更新包 | OfficeCLI `v1.0.134` 离线 Toolpack 与 CowAgent Skill | 已制包、开发验证通过 | **尚未部署** |
| `1.0.5-html-report` | 标准补丁及现场更新包 | 固定提交的 HTML Report Skill 离线适配 | 已制包、开发验证通过 | **尚未部署** |
| `1.0.6-mcp-ssh-manager` | 标准补丁及现场更新包 | `mcp-ssh-manager v3.7.0` 离线 stdio Toolpack、37 工具、对话式 SSH/数据库连接管理、TOFU 主机密钥校验 | 已制包；上游测试、真实 SSH/数据库、正序部署、逆序回滚及最终包完全断网验收通过 | **尚未部署** |
| `1.1.0` | 离线首装基线升级 | CowAgent 2.1.7 基础镜像、Chromium、官方 browser-use 0.13.8 CLI-MCP Toolpack、browser-use Skill；保留 2.1.2 回滚镜像 | 已制包；开发验收通过 | **已部署**（2026-08 底实际导入，客户内网当前基线） |
| `1.0.7-browser-container-drissionpage` | 标准补丁 | 独立浏览器容器（复用 2.1.7 镜像，Chromium 120.0.6099.224，4G mem_limit，profile 卷持久登录态，CDP 容器内转发器）+ DrissionPage 4.0.5.6 薄 MCP（browser-dp，4 固定工具 + 50 动作库）+ browser-use 停用保留 | 已制包；开发验证 10/10 全绿、接管-断开 30 轮零重启（根因已修复，见下） | **尚未部署** |

## 当前客户内网基线

客户内网当前基线是：

```text
offline-install 1.1.0（CowAgent 2.1.7 + browser-use Toolpack + 品牌止血包 hotfix-v1.1.0-brand-bootstrap.1）
```

开发交付的下一增量补丁为 `1.0.7-browser-container-drissionpage`，直接依赖 1.1.0 现场基线。

## 已冻结的待部署更新链（历史）

`v1.0.3-to-v1.0.6` 合集已被 1.1.0 首装基线吸收，现场无需单独执行，制品保留用于追溯。

## 后续补丁编号

`1.0.7` 已占用（browser-container-drissionpage）。下一正式增量补丁从 `1.0.8` 开始。新补丁必须明确依赖基线：

- 现场当前基线为 `1.1.0`；应用 `1.0.7` 后基线升级为 `1.1.0 + patch 1.0.7`。
- 尚未完成制包和验证的功能不得写成已交付或已部署。

## v1.0.7 功能与架构口径

- 浏览器以独立容器运行（compose service `browser`），与 CowAgent 生命周期解耦；MCP 重启不影响浏览器与登录态。
- 镜像复用现场 `cowagent-offline:2.1.7-base.1-dev`（Chromium 120.0.6099.224-1~deb11u1），补丁不携带任何镜像。
- CDP 链路三道安全闸的过法（部署排障必读）：Chromium 110+ 强制 DevTools 绑环回 → 容器内 python3 TCP 转发器（9222→9223）；Chromium 66+ Host 头校验 → MCP 侧先把服务名解析为容器 IP；Chromium 111+ WebSocket Origin 校验 → `--remote-allow-origins=*`。
- profile 卷 `storage/browser/profile` 持久登录态；entrypoint 启动前清理 SingletonLock、重置 exit_type=Crashed。
- DrissionPage 4.0.5.6 全依赖固化（site-packages 72MB，wheel 制包），Python 3.11.15 复用 1.1.0 基线 runtime；现场零安装。
- 已知问题闭环：开发期"浏览器偶发自退"根因已查明——**DrissionPage 4.0.5.6 接管启发式**
  （options 未声明 --headless 且 UA 含 HeadlessChrome 时，接管即发 `Browser.close` 杀掉
  被接管浏览器再尝试重启）。修复：session 层声明 `--headless=new` 跳过启发式 +
  close_tabs 空浏览器保护。修复后 Chromium 120 接管-断开 30 轮零重启、全量 verify 10/10。
  详见补丁 `docs/KNOWN-ISSUE-chromium-self-exit.md`（根因报告）。
- 顺带发现：Chromium 120（Debian bullseye 已 EOL）存在 120 时代公开 UAF
  （GWP-ASan 偶发可采样到，browser-use 时代内网故障的叠加因素）。不影响本补丁交付；
  建议下一基线升级采用 Chrome for Testing 152+（实测可在 2.1.7 镜像内以卷挂载方式
  运行，无需换镜像）。

## 安全说明

`1.0.3` 现场更新包包含现场专用模型凭据，只能通过受控内网链路保存和传输，不得上传公开仓库或发送给无关人员。
