---
name: ssh-manager-admin
description: "在用户要求新增、更新、查看或删除 SSH/数据库连接，确认更新已变化的 SSH 主机密钥，或调整 MCP SSH Manager 工具开关时使用。用户可直接提供名称、IP、端口、账号和密码，无需手工编辑配置文件。"
---

# SSH 连接管理

通过本机已固化的管理脚本维护 MCP SSH Manager。用户提供连接信息后直接完成配置，不要求用户登录服务器、进入容器或手工编辑 TOML/JSON。

固定管理脚本：

```text
/opt/cowagent/toolpacks/mcp/mcp-ssh-manager/bin/manage-server.mjs
```

固定运行环境：

```bash
NODE='/opt/node-v24.18.0-linux-x64/bin/node'
MANAGER='/opt/cowagent/toolpacks/mcp/mcp-ssh-manager/bin/manage-server.mjs'
DB_MANAGER='/opt/cowagent/toolpacks/mcp/mcp-ssh-manager/bin/manage-database.mjs'
SSH_HOME='/home/agent/cow/mcp-ssh-manager/home'
SSH_MANAGER_HOME='/home/agent/cow/mcp-ssh-manager/home/.ssh-manager'
SSH_CONFIG_PATH='/home/agent/cow/mcp-ssh-manager/config/servers.toml'
```

所有命令都必须显式传入：

```bash
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" SSH_CONFIG_PATH="$SSH_CONFIG_PATH" \
  "$NODE" "$MANAGER" <子命令>
```

## 新增或更新连接

至少需要：名称、IP/主机名、端口、账号，以及密码或私钥路径。用户未给端口时使用 `22`；未指定权限模式时使用 `unrestricted`，以保证上传、同步、部署、sudo、数据库和备份等完整功能可用。

支持的 JSON 字段：

- 必填：`name`、`host`、`user`。
- 认证二选一：`password` 或 `keyPath`。
- 可选：`port`、`passphrase`、`sudoPassword`、`defaultDir`、`description`、`platform`、`proxyJump`、`proxyCommand`、`forwardAgent`。
- 权限：`mode` 可为 `unrestricted`、`readonly`、`restricted`；`restricted` 必须同时提供 `allowPatterns`。

执行流程：

1. 先创建只有当前用户可读的临时文件，禁止把密码放在命令行参数中。
2. 将用户提供的字段写成 JSON。没有明确提供的密码、sudo 密码、私钥口令不得猜测。
3. 执行 `upsert`。
4. 无论成功或失败都立即删除临时文件。
5. 只向用户反馈连接名称、地址、端口、账号、认证类型和权限模式，不回显密码、私钥口令或 sudo 密码。

命令模板：

```bash
set -e
umask 077
TMP_FILE="$(mktemp '/home/agent/cow/mcp-ssh-manager/config/.server.XXXXXX.json')"
trap 'rm -f "$TMP_FILE"' EXIT
# 使用文件写入工具把连接 JSON 写入 $TMP_FILE，不用 echo 拼接用户密码。
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" SSH_CONFIG_PATH="$SSH_CONFIG_PATH" \
  "$NODE" "$MANAGER" upsert --file "$TMP_FILE"
```

保存后无需手改 `mcp.json`。MCP 会在下一次工具调用时检测 `servers.toml` 变化并加载新连接。

更新现有连接时可以只提供 `name` 和需要变化的字段，管理脚本会保留未提供的地址、账号及凭据。只修改权限模式时使用专用命令，不读取或重写密码：

```bash
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" SSH_CONFIG_PATH="$SSH_CONFIG_PATH" \
  "$NODE" "$MANAGER" set-mode '<连接名称>' unrestricted
```

`readonly` 同理。`restricted` 必须通过一个或多个 `--allow-pattern` 提供允许命令的正则规则。

## 查看和删除连接

查看连接：

```bash
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" SSH_CONFIG_PATH="$SSH_CONFIG_PATH" \
  "$NODE" "$MANAGER" list
```

列表不会输出密码和口令。删除连接：

```bash
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" SSH_CONFIG_PATH="$SSH_CONFIG_PATH" \
  "$NODE" "$MANAGER" remove '<连接名称>'
```

## 主机密钥变化

首次连接自动接受并记录主机密钥；后续主机密钥一致时直接连接，发生变化时拒绝连接。

只有用户明确表示该服务器已重装、密钥轮换，并确认重新信任时，才执行：

```bash
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" SSH_CONFIG_PATH="$SSH_CONFIG_PATH" \
  "$NODE" "$MANAGER" forget-host '<连接名称>'
```

删除旧记录后，下一次连接会按首次连接处理并记录新密钥。不得在没有用户确认的情况下自动删除变化的主机密钥记录。

## 工具开关

默认 `all`，启用上游全部 37 个工具。恢复全部工具：

```bash
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" \
  "$NODE" "$MANAGER" set-tools --mode all
```

只保留 5 个核心工具：

```bash
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" \
  "$NODE" "$MANAGER" set-tools --mode minimal
```

按组或单个工具调整时会自动进入 `custom` 模式：

```bash
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" \
  "$NODE" "$MANAGER" set-tools --disable-group backup --disable-tool ssh_execute_sudo
```

工具组为 `core`、`sessions`、`monitoring`、`backup`、`database`、`advanced`。工具清单变更在新的 MCP 进程中生效；通常下一轮会话会重新加载，当前会话仍显示旧清单时明确告知用户需要重启 CowAgent 服务，不让用户修改配置文件。

## 数据库连接档案

用户要求保存 MySQL、PostgreSQL 或 MongoDB 连接时，至少收集：档案名称、所属 SSH 连接、数据库类型、数据库主机、端口和账号；密码、默认数据库和说明按用户实际提供。数据库主机是从 SSH 服务器看到的地址，数据库与 SSH 在同一台服务器时通常填 `localhost`。

使用与 SSH 连接相同的私有临时 JSON 流程，执行：

```bash
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" SSH_CONFIG_PATH="$SSH_CONFIG_PATH" \
  "$NODE" "$DB_MANAGER" upsert --file "$TMP_FILE"
```

JSON 字段为 `name`、`server`、`type`、`host`、`port`、`user`、`password`、`database`、`description`。其中 `type` 只能是 `mysql`、`postgresql` 或 `mongodb`。更新现有档案时只写变化字段，未提供的密码会保留。

查看和删除：

```bash
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" SSH_CONFIG_PATH="$SSH_CONFIG_PATH" \
  "$NODE" "$DB_MANAGER" list
HOME="$SSH_HOME" SSH_MANAGER_HOME="$SSH_MANAGER_HOME" SSH_CONFIG_PATH="$SSH_CONFIG_PATH" \
  "$NODE" "$DB_MANAGER" remove '<档案名称>'
```

列表不输出数据库密码。调用 `ssh_db_dump`、`ssh_db_import`、`ssh_db_list` 或 `ssh_db_query` 时，把档案名称放入 `dbProfile`；MCP 在进程内部补齐已保存的数据库账号、密码、主机和端口，不把密码重新放入对话或 MCP 工具参数。`server` 必须与档案所属 SSH 连接一致。

## 安全边界

- 不在回复、命令行参数、日志或连接列表中回显密码及口令。
- SSH 和数据库连接共用结构化配置文件，由管理脚本以 `600` 权限原子写入。
- 用户在聊天中发送密码后，密码可能仍进入 CowAgent 对话数据库或模型请求日志；不能声称聊天明文凭据完全不留痕。
- 可以按用户要求使用密码认证；可选择时优先推荐专用低权限账号和私钥认证，但不得以此阻止用户完成连接配置。
- `unrestricted` 允许执行会修改远端系统的操作。执行删除、覆盖、恢复、数据库导入、部署或 sudo 等高影响操作前，仍按用户当前指令和 CowAgent 的通用确认规则处理。
