#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOTFIX_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_ROOT="${TARGET_ROOT:-/opt/cowagent-offline}"
HOTFIX_VERSION="1.1.0-brand-bootstrap.1"

die() {
  echo "错误: $*" >&2
  exit 1
}

info() {
  echo "信息: $*"
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
  die "未找到 docker compose 或 docker-compose"
}

require_docker() {
  command -v docker >/dev/null 2>&1 || die "未安装 Docker"
  docker info >/dev/null 2>&1 || die "Docker 服务不可用"
}

require_target() {
  [ -f "${TARGET_ROOT}/manifest.json" ] || die "目标目录缺少 manifest.json: ${TARGET_ROOT}"
  [ -f "${TARGET_ROOT}/compose/docker-compose.yml" ] || die "目标目录缺少 compose/docker-compose.yml"
  [ -f "${TARGET_ROOT}/compose/.env" ] || die "目标目录缺少 compose/.env"
  [ -f "${TARGET_ROOT}/patch-mounted/frontend/bootstrap-brand.sh" ] \
    || die "目标目录缺少品牌启动脚本"
  [ -d "${TARGET_ROOT}/patch-mounted/frontend/channel" ] \
    || die "目标目录缺少前端品牌补丁"
  [ -f "${TARGET_ROOT}/patch-mounted/plugins/cow_cli/cow_cli.py" ] \
    || die "目标目录缺少 cow_cli 品牌补丁"
  grep -Fq "const BRAND_NAME = 'Evo-Harness';" \
    "${TARGET_ROOT}/patch-mounted/frontend/channel/web/static/js/console.js" \
    || die "目标目录的前端补丁不是 Evo-Harness 品牌版本"
  grep -Fq 'Evo-Harness v' \
    "${TARGET_ROOT}/patch-mounted/plugins/cow_cli/cow_cli.py" \
    || die "目标目录的 cow_cli 补丁不是 Evo-Harness 品牌版本"
}

read_json_string() {
  local file="$1"
  local key="$2"
  grep -o "\"${key}\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "${file}" \
    | head -n 1 \
    | cut -d'"' -f4
}

read_env_value() {
  local key="$1"
  awk -F= -v k="${key}" '$1 == k {print substr($0, length(k) + 2); exit}' \
    "${TARGET_ROOT}/compose/.env"
}

verify_compatibility() {
  local expected
  local actual

  expected="$(read_json_string "${HOTFIX_ROOT}/manifest.json" requiresPackageVersion)"
  actual="$(read_json_string "${TARGET_ROOT}/manifest.json" packageVersion)"
  [ "${actual}" = "${expected}" ] \
    || die "离线包版本不匹配，需要 ${expected}，现场为 ${actual:-未知}"

  expected="$(read_json_string "${HOTFIX_ROOT}/manifest.json" requiresCowAgentVersion)"
  actual="$(read_json_string "${TARGET_ROOT}/manifest.json" cowagentVersion)"
  [ "${actual}" = "${expected}" ] \
    || die "CowAgent 基线不匹配，需要 ${expected}，现场为 ${actual:-未知}"

  expected="$(read_json_string "${HOTFIX_ROOT}/manifest.json" requiresBaseImage)"
  actual="$(read_env_value COW_IMAGE || true)"
  [ -z "${actual}" ] || [ "${actual}" = "${expected}" ] \
    || die "COW_IMAGE 不匹配，需要 ${expected}，现场为 ${actual}"
}

verify_hotfix_checksums() {
  [ -f "${HOTFIX_ROOT}/checksums/SHA256SUMS" ] || die "止血包缺少校验清单"
  (cd "${HOTFIX_ROOT}" && sha256sum -c "checksums/SHA256SUMS")
}

container_name() {
  local value
  value="$(read_env_value COW_CONTAINER_NAME || true)"
  printf '%s\n' "${value:-cowagent-offline}"
}

web_port() {
  local value
  value="$(read_env_value COW_WEB_PORT || true)"
  printf '%s\n' "${value:-9899}"
}

state_file() {
  printf '%s\n' "${TARGET_ROOT}/storage/backups/hotfixes/${HOTFIX_VERSION}.state"
}

prepare_state_storage() {
  local state_dir="${TARGET_ROOT}/storage/backups/hotfixes"
  mkdir -p "${state_dir}"
  chmod a+rwx "${TARGET_ROOT}/storage/backups" "${state_dir}"
}

write_state() {
  local status="$1"
  local backup_dir="$2"
  local override_was_present="$3"
  local path
  prepare_state_storage
  path="$(state_file)"
  {
    printf 'hotfixVersion=%s\n' "${HOTFIX_VERSION}"
    printf 'status=%s\n' "${status}"
    printf 'updatedAt=%s\n' "$(date -Iseconds)"
    printf 'backupDir=%s\n' "${backup_dir}"
    printf 'overrideWasPresent=%s\n' "${override_was_present}"
  } > "${path}"
}

read_state_value() {
  local key="$1"
  local path
  path="$(state_file)"
  [ -f "${path}" ] || return 1
  awk -F= -v k="${key}" '$1 == k {print substr($0, length(k) + 2); exit}' "${path}"
}

compose_config() {
  local cmd
  cmd="$(compose_cmd)"
  (
    cd "${TARGET_ROOT}/compose"
    ${cmd} --env-file ".env" \
      -f "docker-compose.yml" \
      -f "docker-compose.override.yml" \
      config
  )
}

restart_service() {
  local cmd
  cmd="$(compose_cmd)"
  (
    cd "${TARGET_ROOT}/compose"
    ${cmd} --env-file ".env" \
      -f "docker-compose.yml" \
      -f "docker-compose.override.yml" \
      up -d --force-recreate cowagent
  )
}

http_get() {
  local port="$1"
  local status
  exec 3<>"/dev/tcp/127.0.0.1/${port}" || return 1
  printf 'GET /chat HTTP/1.0\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n' >&3
  IFS= read -r status <&3 || {
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
  local attempt
  port="$(web_port)"
  for attempt in $(seq 1 45); do
    if http_get "${port}"; then
      return 0
    fi
    sleep 2
  done
  die "Web 控制台在端口 ${port} 上未就绪"
}
