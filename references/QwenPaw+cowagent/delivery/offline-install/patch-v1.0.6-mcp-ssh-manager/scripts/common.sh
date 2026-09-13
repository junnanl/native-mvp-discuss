#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCH_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_ROOT="${TARGET_ROOT:-/opt/cowagent-offline}"
PATCH_VERSION="1.0.6-mcp-ssh-manager"
REQUIRED_PATCH_VERSION="1.0.5-html-report"

die() { echo "ERROR: $*" >&2; exit 1; }
info() { echo "INFO: $*"; }

require_target_root() {
  [ -d "${TARGET_ROOT}/compose" ] || die "invalid TARGET_ROOT: ${TARGET_ROOT}"
  [ -f "${TARGET_ROOT}/manifest.json" ] || die "missing installed manifest"
}

require_tools() {
  command -v docker >/dev/null 2>&1 || die "docker is required"
  command -v sha256sum >/dev/null 2>&1 || die "sha256sum is required"
  docker info >/dev/null 2>&1 || die "docker daemon is not available"
}

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then echo "docker compose"; return; fi
  if docker-compose --version >/dev/null 2>&1; then echo "docker-compose"; return; fi
  die "docker compose or docker-compose is required"
}

env_file_path() {
  local value="${ENV_FILE:-${TARGET_ROOT}/compose/.env}"
  case "${value}" in /*) echo "${value}" ;; *) echo "$(pwd)/${value}" ;; esac
}

read_env_value() {
  local file
  file="$(env_file_path)"
  [ -f "${file}" ] || return 1
  awk -F= -v k="$1" '$1 == k {print substr($0, length(k) + 2); exit}' "${file}"
}

read_manifest_value() {
  grep -o "\"$2\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "$1" | head -n 1 | cut -d'"' -f4
}

require_matching_value() {
  [ -z "$2" ] || [ "$2" = "$3" ] || die "$1 mismatch: expected $2, got ${3:-<empty>}"
}

verify_target_compatibility() {
  local patch="${PATCH_ROOT}/manifest.json" target="${TARGET_ROOT}/manifest.json" expected actual
  expected="$(read_manifest_value "${patch}" requiresPackageVersion || true)"
  actual="$(read_manifest_value "${target}" packageVersion || true)"
  require_matching_value "packageVersion" "${expected}" "${actual}"
  expected="$(read_manifest_value "${patch}" requiresCowAgentVersion || true)"
  actual="$(read_manifest_value "${target}" cowagentVersion || true)"
  require_matching_value "cowagentVersion" "${expected}" "${actual}"
  expected="$(read_manifest_value "${patch}" requiresBaseImage || true)"
  actual="$(read_manifest_value "${target}" baseImage || true)"
  require_matching_value "baseImage" "${expected}" "${actual}"
  actual="$(read_env_value COW_IMAGE || true)"
  require_matching_value "COW_IMAGE" "${expected}" "${actual}"
}

verify_patch_checksums() {
  [ -f "${PATCH_ROOT}/checksums/SHA256SUMS" ] || die "missing checksums/SHA256SUMS"
  (cd "${PATCH_ROOT}" && sha256sum -c --quiet "checksums/SHA256SUMS")
}

patch_state_file() { echo "${TARGET_ROOT}/storage/cow/patch-state/${PATCH_VERSION}.json"; }
required_patch_state_file() { echo "${TARGET_ROOT}/storage/cow/patch-state/${REQUIRED_PATCH_VERSION}.json"; }

require_previous_patch() {
  local state
  state="$(required_patch_state_file)"
  [ -f "${state}" ] || die "required previous update is not installed: ${REQUIRED_PATCH_VERSION}"
  grep -q '"status"[[:space:]]*:[[:space:]]*"applied"' "${state}" || die "previous update is not applied"
}

write_patch_state() {
  mkdir -p "$(dirname "$(patch_state_file)")"
  printf '{\n  "patchVersion": "%s",\n  "status": "%s",\n  "updatedAt": "%s"\n}\n' \
    "${PATCH_VERSION}" "$1" "$(date -Iseconds)" > "$(patch_state_file)"
}

remove_patch_state() { rm -f "$(patch_state_file)"; }
image_for_target() { read_env_value COW_IMAGE || echo "cowagent-offline:2.1.7-base.1-dev"; }
container_for_target() { read_env_value COW_CONTAINER_NAME || echo "cowagent-offline"; }

restart_service() {
  local cmd file
  file="$(env_file_path)"
  [ -f "${file}" ] || die "missing env file: ${file}"
  cmd="$(compose_cmd)"
  (cd "${TARGET_ROOT}/compose" && ${cmd} --env-file "${file}" up -d)
}

normalize_permissions() {
  local image
  image="$(image_for_target)"
  docker run --rm --user 0:0 -v "${TARGET_ROOT}:/mnt/root" --entrypoint sh "${image}" -c '
    set -e
    mkdir -p /mnt/root/storage/cow/mcp-ssh-manager/config /mnt/root/storage/cow/mcp-ssh-manager/audit /mnt/root/storage/cow/mcp-ssh-manager/home/.ssh-manager /mnt/root/storage/cow/skills/ssh-manager-admin /mnt/root/storage/cow/patch-state /mnt/root/toolpacks/mcp/mcp-ssh-manager
    chmod a+rwx /mnt/root/storage /mnt/root/storage/cow /mnt/root/storage/cow/skills
    chmod -R a+rX /mnt/root/toolpacks/mcp/mcp-ssh-manager
    chown -R agent:agent /mnt/root/storage/cow/mcp-ssh-manager
    chmod 755 /mnt/root/storage/cow/mcp-ssh-manager /mnt/root/storage/cow/mcp-ssh-manager/config /mnt/root/storage/cow/mcp-ssh-manager/home
    chmod 700 /mnt/root/storage/cow/mcp-ssh-manager/audit /mnt/root/storage/cow/mcp-ssh-manager/home/.ssh-manager
    chmod -R a+rwX /mnt/root/storage/cow/patch-state
    chmod -R a+rX /mnt/root/storage/cow/skills/ssh-manager-admin
    chmod 600 /mnt/root/storage/cow/mcp-ssh-manager/config/servers.env /mnt/root/storage/cow/mcp-ssh-manager/config/servers.toml
    chmod a+rw /mnt/root/storage/cow/mcp.json
    [ ! -f /mnt/root/storage/cow/skills/skills_config.json ] || chmod a+rw /mnt/root/storage/cow/skills/skills_config.json
  '
}

wait_for_web() {
  local port i status
  port="$(read_env_value COW_WEB_PORT || echo 9899)"
  for i in $(seq 1 30); do
    if exec 3<>"/dev/tcp/127.0.0.1/${port}" 2>/dev/null; then
      printf 'GET / HTTP/1.0\r\nHost: 127.0.0.1\r\n\r\n' >&3
      IFS= read -r status <&3 || true
      exec 3<&-; exec 3>&-
      case "${status:-}" in HTTP/*" 2"*|HTTP/*" 3"*) return ;; esac
    fi
    sleep 2
  done
  die "web console is not reachable on port ${port}"
}

latest_backup_dir() {
  local root="${TARGET_ROOT}/storage/backups/patches/${PATCH_VERSION}"
  [ -d "${root}" ] || return 1
  find "${root}" -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1
}
