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

# browser-use 停用但保留，回滚时翻回 disabled: false 即可
if "browser-use" in servers:
    servers["browser-use"]["disabled"] = True

servers["browser-dp"] = {
    "command": "/opt/cowagent/toolpacks/mcp/browser-dp/bin/browser-dp",
    "args": [],
    "env": {
        "DP_BROWSER_ADDRESS": "browser:9222",
        "DP_DOWNLOADS_DIR": "/home/agent/cow/browser-dp/downloads",
        "DP_UPLOADS_DIR": "/home/agent/cow/browser-dp/uploads",
        "DP_WORKSPACE_DIR": "/home/agent/cow/browser-dp/workspace"
    },
    "timeout": 120,
    "disabled": False
}
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
PY
}

unmerge_mcp_config() {
  local image
  image="$(image_for_target)"
  docker run --rm -i -v "${TARGET_ROOT}:/mnt/root" --entrypoint python "${image}" - <<'PY'
import json
from pathlib import Path

path = Path("/mnt/root/storage/cow/mcp.json")
if not path.exists():
    raise SystemExit(0)
data = json.loads(path.read_text(encoding="utf-8"))
servers = data.get("mcpServers", {})
servers.pop("browser-dp", None)
if "browser-use" in servers:
    servers["browser-use"]["disabled"] = False
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
PY
}

register_skill() {
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
data["browser-dp"] = {
    "name": "browser-dp",
    "description": "Use the browser-dp MCP (DrissionPage over CDP) when a task needs reliable clicking, typing, form filling, table extraction, file download/upload, JavaScript-rendered pages, login sessions, or page verification. The browser runs in a dedicated container that survives MCP restarts. Keep CowAgent as the only task planner; use browser-dp tools for browser execution.",
    "source": "custom",
    "enabled": True,
    "category": "skill",
    "display_name": "DrissionPage 浏览器执行",
}
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
PY
}

unregister_skill() {
  local image
  image="$(image_for_target)"
  docker run --rm -i -v "${TARGET_ROOT}:/mnt/root" --entrypoint python "${image}" - <<'PY'
import json
from pathlib import Path

path = Path("/mnt/root/storage/cow/skills/skills_config.json")
if not path.exists():
    raise SystemExit(0)
data = json.loads(path.read_text(encoding="utf-8"))
data.pop("browser-dp", None)
path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
PY
}

main() {
  require_tools
  require_target_root
  verify_patch_checksums
  verify_target_compatibility

  local backup tool_source tool_target skill_source skill_target
  backup="${TARGET_ROOT}/storage/backups/patches/${PATCH_VERSION}/$(date +%Y%m%d-%H%M%S)"
  tool_source="${PATCH_ROOT}/patches/toolpacks/mcp/browser-dp"
  tool_target="${TARGET_ROOT}/toolpacks/mcp/browser-dp"
  site_source="${PATCH_ROOT}/patches/toolpacks/python/drissionpage"
  site_target="${TARGET_ROOT}/toolpacks/python/drissionpage"
  skill_source="${PATCH_ROOT}/patches/skills/browser-dp"
  skill_target="${TARGET_ROOT}/storage/cow/skills/browser-dp"
  mkdir -p "${backup}"
  backup_path "${tool_target}" "${backup}" "toolpack"
  backup_path "${site_target}" "${backup}" "site-packages"
  backup_path "${TARGET_ROOT}/storage/cow/mcp.json" "${backup}" "mcp-json"
  backup_path "${skill_target}" "${backup}" "skill"
  backup_path "${TARGET_ROOT}/storage/cow/skills/skills_config.json" "${backup}" "skills-config"
  backup_path "${TARGET_ROOT}/compose/docker-compose.browser.yml" "${backup}" "compose-browser"

  rm -rf "${tool_target}" "${site_target}" "${skill_target}"
  mkdir -p "${tool_target}" "${site_target}" "${skill_target}"
  cp -a "${tool_source}/." "${tool_target}/"
  cp -a "${site_source}/." "${site_target}/"
  cp -a "${skill_source}/." "${skill_target}/"
  cp -a "${PATCH_ROOT}/patches/compose/docker-compose.browser.yml" "${TARGET_ROOT}/compose/docker-compose.browser.yml"

  install -d "${TARGET_ROOT}/storage/browser/profile" \
             "${TARGET_ROOT}/storage/browser/downloads" \
             "${TARGET_ROOT}/storage/browser/uploads" \
             "${TARGET_ROOT}/storage/logs/browser" 2>/dev/null || \
    mkdir -p "${TARGET_ROOT}/storage/browser/profile" \
             "${TARGET_ROOT}/storage/browser/downloads" \
             "${TARGET_ROOT}/storage/browser/uploads" \
             "${TARGET_ROOT}/storage/logs/browser"

  merge_mcp_config
  register_skill
  ensure_compose_file_chain

  write_patch_state "applying"
  trap 'remove_patch_state' ERR
  normalize_permissions
  restart_service
  wait_for_web
  "${SCRIPT_DIR}/verify.sh"
  write_patch_state "applied"
  trap - ERR
  printf 'patchVersion=%s\nappliedAt=%s\nbackupDir=%s\n' "${PATCH_VERSION}" "$(date -Iseconds)" "${backup}" \
    >> "${TARGET_ROOT}/storage/backups/patches/apply.log"
  info "browser-container-drissionpage update applied"
}

main "$@"
