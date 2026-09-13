#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_tools
  require_target_root
  verify_patch_checksums
  verify_target_compatibility
  require_previous_patch
  if [ "${SKIP_PATCH_STATE_CHECK:-0}" != "1" ]; then
    grep -q '"status"[[:space:]]*:[[:space:]]*"applied"' "$(patch_state_file)" \
      || die "patch state is not applied"
  fi

  local root container image
  root="${TARGET_ROOT}/toolpacks/mcp/mcp-ssh-manager"
  [ -s "${root}/src/secure-entrypoint.mjs" ] || die "secure MCP entrypoint is missing"
  [ -s "${root}/bin/manage-server.mjs" ] || die "SSH connection manager is missing"
  [ -s "${root}/bin/manage-database.mjs" ] || die "database connection manager is missing"
  [ -s "${root}/node_modules/@modelcontextprotocol/sdk/package.json" ] || die "offline MCP SDK is missing"
  [ -f "${TARGET_ROOT}/storage/cow/mcp-ssh-manager/config/servers.toml" ] \
    || die "SSH server config file is missing"
  [ -s "${TARGET_ROOT}/storage/cow/skills/ssh-manager-admin/SKILL.md" ] \
    || die "SSH manager administration Skill is missing"
  image="$(image_for_target)"
  docker run --rm -v "${TARGET_ROOT}:/mnt/root" --entrypoint python "${image}" \
    -m json.tool "/mnt/root/storage/cow/mcp.json" >/dev/null || die "mcp.json is invalid"
  grep -q '"ssh-manager"' "${TARGET_ROOT}/storage/cow/mcp.json" || die "ssh-manager is not registered"
  grep -q '"ssh-manager-admin"' "${TARGET_ROOT}/storage/cow/skills/skills_config.json" \
    || die "SSH manager administration Skill is not registered"

  container="$(container_for_target)"
  docker inspect -f '{{.State.Running}}' "${container}" 2>/dev/null | grep -qx true \
    || die "container is not running: ${container}"
  docker exec -i --user agent "${container}" python - < "${SCRIPT_DIR}/verify-cowagent.py" \
    || die "CowAgent MCP stdio verification failed"
  docker exec --user agent \
    -e HOME=/home/agent/cow/mcp-ssh-manager/home \
    -e SSH_MANAGER_HOME=/home/agent/cow/mcp-ssh-manager/home/.ssh-manager \
    -e SSH_CONFIG_PATH=/home/agent/cow/mcp-ssh-manager/config/servers.toml \
    "${container}" /opt/node-v24.18.0-linux-x64/bin/node \
    /opt/cowagent/toolpacks/mcp/mcp-ssh-manager/bin/manage-server.mjs list >/dev/null \
    || die "SSH connection manager smoke test failed"
  docker exec --user agent \
    -e HOME=/home/agent/cow/mcp-ssh-manager/home \
    -e SSH_MANAGER_HOME=/home/agent/cow/mcp-ssh-manager/home/.ssh-manager \
    -e SSH_CONFIG_PATH=/home/agent/cow/mcp-ssh-manager/config/servers.toml \
    "${container}" /opt/node-v24.18.0-linux-x64/bin/node \
    /opt/cowagent/toolpacks/mcp/mcp-ssh-manager/bin/manage-database.mjs list >/dev/null \
    || die "database connection manager smoke test failed"
  docker exec --user agent "${container}" sh -lc '
    set -e
    ROOT=/opt/cowagent/toolpacks/mcp/mcp-ssh-manager/runtime
    PATH="$ROOT/bin:$PATH" LD_LIBRARY_PATH="$ROOT/lib" rsync --version >/dev/null
    PATH="$ROOT/bin:$PATH" LD_LIBRARY_PATH="$ROOT/lib" sshpass -V >/dev/null 2>&1
    PATH="$ROOT/bin:$PATH" LD_LIBRARY_PATH="$ROOT/lib" ssh -V >/dev/null 2>&1
    PATH="$ROOT/bin:$PATH" LD_LIBRARY_PATH="$ROOT/lib" ssh-keygen -? 2>&1 | grep -q usage
    test "$(stat -c %a /home/agent/cow/mcp-ssh-manager/config/servers.toml)" = 600
  ' || die "offline SSH runtime dependency verification failed"
  wait_for_web
  info "mcp-ssh-manager verify passed"
}

main "$@"
