#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCH_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_ROOT="${TARGET_ROOT:-/opt/cowagent-offline}"
PATCH_VERSION="1.0.5-html-report"
REQUIRED_PATCH_VERSION="1.0.4-officecli-toolpack"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

info() {
  echo "INFO: $*"
}

require_target_root() {
  [ -d "${TARGET_ROOT}/compose" ] \
    || die "TARGET_ROOT does not look like an installed CowAgent package: ${TARGET_ROOT}"
  [ -f "${TARGET_ROOT}/manifest.json" ] \
    || die "missing installed manifest: ${TARGET_ROOT}/manifest.json"
}

require_tools() {
  command -v docker >/dev/null 2>&1 || die "docker is required"
  command -v sha256sum >/dev/null 2>&1 || die "sha256sum is required"
  docker info >/dev/null 2>&1 || die "docker daemon is not available"
}

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    echo "docker compose"
    return 0
  fi
  if docker-compose --version >/dev/null 2>&1; then
    echo "docker-compose"
    return 0
  fi
  die "docker compose or docker-compose is required"
}

env_file_path() {
  local env_file="${ENV_FILE:-${TARGET_ROOT}/compose/.env}"
  case "${env_file}" in
    /*) printf '%s\n' "${env_file}" ;;
    *) printf '%s\n' "$(pwd)/${env_file}" ;;
  esac
}

read_env_value() {
  local key="$1"
  local env_file
  env_file="$(env_file_path)"
  [ -f "${env_file}" ] || return 1
  awk -F= -v k="${key}" '$1 == k {print substr($0, length(k) + 2); exit}' "${env_file}"
}

read_manifest_value() {
  local manifest="$1"
  local key="$2"
  [ -f "${manifest}" ] || return 1
  grep -o "\"${key}\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "${manifest}" \
    | head -n 1 \
    | cut -d'"' -f4
}

require_matching_value() {
  local label="$1"
  local expected="$2"
  local actual="$3"
  if [ -n "${expected}" ] && [ "${expected}" != "${actual}" ]; then
    die "${label} mismatch: expected ${expected}, got ${actual:-<empty>}"
  fi
}

verify_target_compatibility() {
  local patch_manifest="${PATCH_ROOT}/manifest.json"
  local target_manifest="${TARGET_ROOT}/manifest.json"
  local expected
  local actual

  require_target_root
  expected="$(read_manifest_value "${patch_manifest}" requiresPackageVersion || true)"
  actual="$(read_manifest_value "${target_manifest}" packageVersion || true)"
  require_matching_value "packageVersion" "${expected}" "${actual}"

  expected="$(read_manifest_value "${patch_manifest}" requiresCowAgentVersion || true)"
  actual="$(read_manifest_value "${target_manifest}" cowagentVersion || true)"
  require_matching_value "cowagentVersion" "${expected}" "${actual}"

  expected="$(read_manifest_value "${patch_manifest}" requiresBaseImage || true)"
  actual="$(read_manifest_value "${target_manifest}" baseImage || true)"
  require_matching_value "baseImage" "${expected}" "${actual}"

  actual="$(read_env_value COW_IMAGE || true)"
  require_matching_value "COW_IMAGE" "${expected}" "${actual}"
}

verify_patch_checksums() {
  local sums="${PATCH_ROOT}/checksums/SHA256SUMS"
  [ -f "${sums}" ] || die "missing checksums/SHA256SUMS"
  (cd "${PATCH_ROOT}" && sha256sum -c "checksums/SHA256SUMS")
}

patch_state_dir() {
  printf '%s\n' "${TARGET_ROOT}/storage/cow/patch-state"
}

patch_state_file() {
  printf '%s/%s.json\n' "$(patch_state_dir)" "${PATCH_VERSION}"
}

required_patch_state_file() {
  printf '%s/%s.json\n' "$(patch_state_dir)" "${REQUIRED_PATCH_VERSION}"
}

require_previous_patch() {
  local state
  state="$(required_patch_state_file)"
  [ -f "${state}" ] \
    || die "required previous update is not installed: ${REQUIRED_PATCH_VERSION}"
  grep -q '"status"[[:space:]]*:[[:space:]]*"applied"' "${state}" \
    || die "previous update state is not applied: ${state}"
}

write_patch_state() {
  local status="$1"
  local state_dir
  local state_file
  state_dir="$(patch_state_dir)"
  state_file="$(patch_state_file)"
  mkdir -p "${state_dir}"
  cat > "${state_file}" <<EOF
{
  "patchVersion": "${PATCH_VERSION}",
  "status": "${status}",
  "updatedAt": "$(date -Iseconds)"
}
EOF
}

remove_patch_state() {
  rm -f "$(patch_state_file)"
}

image_for_target() {
  read_env_value COW_IMAGE || echo "cowagent-offline:2.1.2-base.2-dev"
}

container_for_target() {
  read_env_value COW_CONTAINER_NAME || echo "cowagent-offline"
}

restart_service() {
  local cmd
  local env_file
  env_file="$(env_file_path)"
  [ -f "${env_file}" ] || die "missing env file: ${env_file}"
  cmd="$(compose_cmd)"
  (cd "${TARGET_ROOT}/compose" && ${cmd} --env-file "${env_file}" up -d)
}

normalize_mount_permissions() {
  local image
  image="$(image_for_target)"
  docker image inspect "${image}" >/dev/null 2>&1 || die "missing image: ${image}"
  docker run --rm \
    --user 0:0 \
    -v "${TARGET_ROOT}:/mnt/root" \
    --entrypoint sh \
    "${image}" \
    -c '
      set -e
      mkdir -p /mnt/root/storage/cow/skills/html-report /mnt/root/storage/cow/patch-state /mnt/root/storage/cow/tmp/reports
      chmod a+rwx /mnt/root/storage /mnt/root/storage/cow /mnt/root/storage/cow/skills /mnt/root/storage/cow/tmp
      chmod -R a+rwx /mnt/root/storage/cow/skills/html-report /mnt/root/storage/cow/patch-state /mnt/root/storage/cow/tmp/reports
      [ ! -f /mnt/root/storage/cow/skills/skills_config.json ] || chmod a+rw /mnt/root/storage/cow/skills/skills_config.json
    '
}

register_html_report_skill() {
  local image
  image="$(image_for_target)"
  docker run --rm \
    -v "${TARGET_ROOT}:/mnt/root" \
    --entrypoint python \
    "${image}" \
    - <<'PY'
import json
from pathlib import Path

path = Path("/mnt/root/storage/cow/skills/skills_config.json")
path.parent.mkdir(parents=True, exist_ok=True)
data = {}
if path.exists():
    parsed = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(parsed, dict):
        raise SystemExit("skills_config.json must contain a JSON object")
    data = parsed

data["html-report"] = {
    "name": "html-report",
    "description": "仅在用户明确要求 HTML 汇报、HTML 报告、浏览器可阅读报告，或要求把结构化汇报交付为单个 .html 文件时，创建或修改设计化、可离线打开的 HTML 报告。普通分析或总结、PPT/Word/Excel/PDF、CSV/Excel 数据分析报告、网站或应用开发、需要自定义代码的交互大屏不得使用。",
    "source": "custom",
    "enabled": True,
    "category": "skill",
    "display_name": "HTML 汇报",
}
path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
PY
}

http_get() {
  local port="$1"
  local status
  exec 3<>"/dev/tcp/127.0.0.1/${port}" || return 1
  printf 'GET / HTTP/1.0\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n' >&3
  IFS= read -r status <&3 2>/dev/null || {
    exec 3<&-
    exec 3>&-
    return 1
  }
  exec 3<&-
  exec 3>&-
  case "${status}" in
    HTTP/*" 2"*|HTTP/*" 3"*) return 0 ;;
    *) return 1 ;;
  esac
}

wait_for_web() {
  local port
  local i
  port="$(read_env_value COW_WEB_PORT || echo 9899)"
  for i in $(seq 1 30); do
    if http_get "${port}"; then
      return 0
    fi
    sleep 2
  done
  die "web console is not reachable on host port ${port}"
}

latest_backup_dir() {
  local root="${TARGET_ROOT}/storage/backups/patches/${PATCH_VERSION}"
  [ -d "${root}" ] || return 1
  find "${root}" -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1
}
