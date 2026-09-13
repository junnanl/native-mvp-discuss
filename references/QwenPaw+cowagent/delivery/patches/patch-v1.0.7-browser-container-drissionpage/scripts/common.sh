#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCH_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_ROOT="${TARGET_ROOT:-/opt/cowagent-offline}"
PATCH_VERSION="1.0.7-browser-container-drissionpage"
REQUIRED_PACKAGE_VERSION="1.1.0"

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

write_patch_state() {
  mkdir -p "$(dirname "$(patch_state_file)")"
  printf '{\n  "patchVersion": "%s",\n  "status": "%s",\n  "updatedAt": "%s"\n}\n' \
    "${PATCH_VERSION}" "$1" "$(date -Iseconds)" > "$(patch_state_file)"
}

remove_patch_state() { rm -f "$(patch_state_file)"; }
image_for_target() { read_env_value COW_IMAGE || echo "cowagent-offline:2.1.7-base.1-dev"; }
container_for_target() { read_env_value COW_CONTAINER_NAME || echo "cowagent-offline"; }
browser_container_for_target() { echo "$(container_for_target)-browser"; }

# compose 文件链：基线 + 现场 override + browser。通过 COMPOSE_FILE 固化，
# 保证后续任何 `docker compose up -d` 都带上 browser 容器定义。
ensure_compose_file_chain() {
  local file env_line current
  file="$(env_file_path)"
  [ -f "${file}" ] || die "missing env file: ${file}"
  if grep -q "^COMPOSE_FILE=" "${file}"; then
    current="$(read_env_value COMPOSE_FILE)"
    case ":${current}:" in
      *":docker-compose.browser.yml:"*) : ;;
      *) printf 's/^COMPOSE_FILE=/COMPOSE_FILE=docker-compose.browser.yml:/' "${file}" > "${file}.tmp" \
           && mv "${file}.tmp" "${file}" ;;
    esac
  else
    printf '\nCOMPOSE_FILE=docker-compose.yml:docker-compose.override.yml:docker-compose.browser.yml\n' >> "${file}"
  fi
}

remove_compose_file_chain() {
  local file current
  file="$(env_file_path)"
  [ -f "${file}" ] || return 0
  if grep -q "^COMPOSE_FILE=" "${file}"; then
    current="$(read_env_value COMPOSE_FILE)"
    local filtered
    filtered="$(printf '%s\n' "${current}" | tr ':' '\n' | grep -v '^docker-compose\.browser\.yml$' | paste -sd: -)"
    if [ -n "${filtered}" ]; then
      sed -i "s|^COMPOSE_FILE=.*|COMPOSE_FILE=${filtered}|" "${file}"
    else
      sed -i '/^COMPOSE_FILE=/d' "${file}"
    fi
  fi
}

restart_service() {
  local cmd file
  file="$(env_file_path)"
  [ -f "${file}" ] || die "missing env file: ${file}"
  cmd="$(compose_cmd)"
  (cd "${TARGET_ROOT}/compose" && ${cmd} \
    -f docker-compose.yml -f docker-compose.override.yml -f docker-compose.browser.yml \
    --env-file "${file}" up -d)
}

stop_browser_container() {
  local name browser
  name="$(container_for_target)"
  browser="${name}-browser"
  docker rm -f "${browser}" >/dev/null 2>&1 || true
}

normalize_permissions() {
  local image
  image="$(image_for_target)"
  docker run --rm --user 0:0 -v "${TARGET_ROOT}:/mnt/root" --entrypoint sh "${image}" -c '
    set -e
    mkdir -p /mnt/root/storage/browser/profile /mnt/root/storage/browser/downloads /mnt/root/storage/browser/uploads /mnt/root/storage/logs/browser /mnt/root/storage/cow/browser-dp/workspace /mnt/root/storage/cow/skills/browser-dp /mnt/root/storage/cow/patch-state /mnt/root/toolpacks/mcp/browser-dp /mnt/root/toolpacks/python/drissionpage
    chmod a+rwx /mnt/root/storage /mnt/root/storage/browser /mnt/root/storage/browser/profile /mnt/root/storage/browser/downloads /mnt/root/storage/browser/uploads /mnt/root/storage/cow /mnt/root/storage/cow/skills
    chmod -R a+rX /mnt/root/toolpacks/mcp/browser-dp /mnt/root/toolpacks/python/drissionpage
    chown -R agent:agent /mnt/root/storage/cow/browser-dp
    chmod -R a+rwX /mnt/root/storage/cow/browser-dp /mnt/root/storage/cow/patch-state /mnt/root/storage/cow/skills/browser-dp
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
