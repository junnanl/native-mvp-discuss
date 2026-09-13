#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_tools
  require_target_root
  local backup image
  image="$(image_for_target)"
  backup="$(latest_backup_dir)" || die "no backup found for ${PATCH_VERSION}"
  info "restoring from ${backup}"

  restore_path() {
    local label target
    label="$1"
    target="$2"
    if [ -f "${backup}/${label}/absent" ]; then
      rm -rf "${target}"
    elif [ -d "${backup}/${label}/before" ]; then
      rm -rf "${target}"
      mkdir -p "$(dirname "${target}")"
      cp -a "${backup}/${label}/before" "${target}"
    fi
  }

  restore_path "mcp-json" "${TARGET_ROOT}/storage/cow/mcp.json"
  restore_path "skills-config" "${TARGET_ROOT}/storage/cow/skills/skills_config.json"
  restore_path "skill" "${TARGET_ROOT}/storage/cow/skills/browser-dp"
  restore_path "toolpack" "${TARGET_ROOT}/toolpacks/mcp/browser-dp"
  restore_path "site-packages" "${TARGET_ROOT}/toolpacks/python/drissionpage"
  restore_path "compose-browser" "${TARGET_ROOT}/compose/docker-compose.browser.yml"

  # mcp.json 兜底：确保 browser-use 恢复启用（即使备份缺失）
  docker run --rm -i -v "${TARGET_ROOT}:/mnt/root" --entrypoint python "${image}" - <<'PY'
import json
from pathlib import Path
path = Path("/mnt/root/storage/cow/mcp.json")
if path.exists():
    data = json.loads(path.read_text(encoding="utf-8"))
    servers = data.get("mcpServers", {})
    servers.pop("browser-dp", None)
    if "browser-use" in servers:
        servers["browser-use"]["disabled"] = False
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
PY

  remove_compose_file_chain
  stop_browser_container
  normalize_permissions

  local cmd file
  file="$(env_file_path)"
  cmd="$(compose_cmd)"
  (cd "${TARGET_ROOT}/compose" && ${cmd} --env-file "${file}" up -d)
  wait_for_web

  local state
  state="$(patch_state_file)"
  [ -f "${state}" ] && rm -f "${state}"
  info "rollback of ${PATCH_VERSION} completed (browser profile/downloads/uploads volumes preserved)"
}

main "$@"
