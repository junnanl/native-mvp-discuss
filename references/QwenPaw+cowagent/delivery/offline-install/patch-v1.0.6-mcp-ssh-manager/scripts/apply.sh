#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

backup_path() {
  local source_rel backup_rel image
  source_rel="${1#"${TARGET_ROOT}/"}"
  backup_rel="${2#"${TARGET_ROOT}/"}"
  [ "${source_rel}" != "$1" ] || die "backup source must be under TARGET_ROOT: $1"
  [ "${backup_rel}" != "$2" ] || die "backup target must be under TARGET_ROOT: $2"
  image="$(image_for_target)"
  docker run --rm --user 0:0 -v "${TARGET_ROOT}:/mnt/root" \
    -e "SOURCE_REL=${source_rel}" -e "BACKUP_REL=${backup_rel}" -e "LABEL=$3" \
    --entrypoint sh "${image}" -c '
      set -e
      target="/mnt/root/${BACKUP_REL}/${LABEL}"
      mkdir -p "${target}"
      if [ -e "/mnt/root/${SOURCE_REL}" ]; then
        cp -a "/mnt/root/${SOURCE_REL}" "${target}/before"
      else
        : > "${target}/absent"
      fi
    '
}

merge_mcp_config() {
  local image
  image="$(image_for_target)"
  docker run --rm -i -v "${TARGET_ROOT}:/mnt/root" --entrypoint python "${image}" - <<'PY'
import json
from pathlib import Path

path = Path("/mnt/root/storage/cow/mcp.json")
data = {}
if path.exists():
    data = json.loads(path.read_text(encoding="utf-8"))
if not isinstance(data, dict):
    raise SystemExit("mcp.json must contain a JSON object")
servers = data.setdefault("mcpServers", {})
if not isinstance(servers, dict):
    raise SystemExit("mcpServers must contain a JSON object")
servers["ssh-manager"] = {
    "command": "/opt/node-v24.18.0-linux-x64/bin/node",
    "args": ["/opt/cowagent/toolpacks/mcp/mcp-ssh-manager/src/secure-entrypoint.mjs"],
    "env": {
        "HOME": "/home/agent/cow/mcp-ssh-manager/home",
        "SSH_MANAGER_HOME": "/home/agent/cow/mcp-ssh-manager/home/.ssh-manager",
        "SSH_ENV_PATH": "/home/agent/cow/mcp-ssh-manager/config/servers.env",
        "SSH_CONFIG_PATH": "/home/agent/cow/mcp-ssh-manager/config/servers.toml",
        "PREFER_TOML_CONFIG": "true",
        "PATH": "/opt/cowagent/toolpacks/mcp/mcp-ssh-manager/runtime/bin:/usr/local/bin:/usr/bin:/bin",
        "LD_LIBRARY_PATH": "/opt/cowagent/toolpacks/mcp/mcp-ssh-manager/runtime/lib",
        "MCP_SSH_MAX_OUTPUT_LENGTH": "10000",
        "MCP_SSH_DEFAULT_TIMEOUT": "120000"
    },
    "timeout": 120,
    "disabled": False
}
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
PY
}

install_runtime_defaults() {
  local image
  image="$(image_for_target)"
  docker run --rm --user 0:0 \
    -v "${PATCH_ROOT}:/mnt/patch:ro" -v "${TARGET_ROOT}:/mnt/root" \
    --entrypoint sh "${image}" -c '
      set -e
      source=/mnt/patch/patches/runtime/mcp-ssh-manager
      target=/mnt/root/storage/cow/mcp-ssh-manager
      mkdir -p "${target}/config" "${target}/audit" "${target}/home/.ssh-manager"
      cp -a "${source}/config/servers.env.example" "${target}/config/servers.env.example"
      cp -a "${source}/config/servers.toml.example" "${target}/config/servers.toml.example"
      [ -f "${target}/config/servers.env" ] || : > "${target}/config/servers.env"
      [ -f "${target}/config/servers.toml" ] || printf "[ssh_servers]\n" > "${target}/config/servers.toml"
      if [ ! -f "${target}/home/.ssh-manager/tools-config.json" ]; then
        cp -a "${source}/home/.ssh-manager/tools-config.json" "${target}/home/.ssh-manager/tools-config.json"
      fi
    '
}

register_admin_skill() {
  local image
  image="$(image_for_target)"
  docker run --rm -i -v "${TARGET_ROOT}:/mnt/root" --entrypoint python "${image}" - <<'PY'
import json
from pathlib import Path

path = Path("/mnt/root/storage/cow/skills/skills_config.json")
data = {}
if path.exists():
    data = json.loads(path.read_text(encoding="utf-8"))
if not isinstance(data, dict):
    raise SystemExit("skills_config.json must contain a JSON object")
data["ssh-manager-admin"] = {
    "name": "ssh-manager-admin",
    "description": "在用户要求新增、更新、查看或删除 SSH/数据库连接，确认更新已变化的 SSH 主机密钥，或调整 MCP SSH Manager 工具开关时使用。用户可直接提供名称、IP、端口、账号和密码，无需手工编辑配置文件。",
    "source": "custom",
    "enabled": True,
    "category": "skill",
    "display_name": "SSH 连接管理",
}
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
PY
}

main() {
  require_tools
  require_target_root
  verify_patch_checksums
  verify_target_compatibility
  require_previous_patch

  local backup tool_source tool_target skill_source skill_target
  backup="${TARGET_ROOT}/storage/backups/patches/${PATCH_VERSION}/$(date +%Y%m%d-%H%M%S)"
  tool_source="${PATCH_ROOT}/patches/toolpacks/mcp/mcp-ssh-manager"
  tool_target="${TARGET_ROOT}/toolpacks/mcp/mcp-ssh-manager"
  skill_source="${PATCH_ROOT}/patches/skills/ssh-manager-admin"
  skill_target="${TARGET_ROOT}/storage/cow/skills/ssh-manager-admin"
  mkdir -p "${backup}"
  backup_path "${tool_target}" "${backup}" "toolpack"
  backup_path "${TARGET_ROOT}/storage/cow/mcp-ssh-manager" "${backup}" "runtime"
  backup_path "${TARGET_ROOT}/storage/cow/mcp.json" "${backup}" "mcp-json"
  backup_path "${skill_target}" "${backup}" "admin-skill"
  backup_path "${TARGET_ROOT}/storage/cow/skills/skills_config.json" "${backup}" "skills-config"
  rm -rf "${tool_target}" "${skill_target}"
  mkdir -p "${tool_target}" "${skill_target}"
  cp -a "${tool_source}/." "${tool_target}/"
  cp -a "${skill_source}/." "${skill_target}/"
  install_runtime_defaults
  merge_mcp_config
  register_admin_skill

  write_patch_state "applying"
  trap 'remove_patch_state' ERR
  normalize_permissions
  restart_service
  SKIP_PATCH_STATE_CHECK=1 "${SCRIPT_DIR}/verify.sh"
  write_patch_state "applied"
  trap - ERR
  printf 'patchVersion=%s\nappliedAt=%s\nbackupDir=%s\n' "${PATCH_VERSION}" "$(date -Iseconds)" "${backup}" \
    >> "${TARGET_ROOT}/storage/backups/patches/apply.log"
  info "mcp-ssh-manager update applied"
}

main "$@"
