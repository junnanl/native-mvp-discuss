#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
COMPOSE_DIR="${ROOT_DIR}/compose"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

info() {
  echo "INFO: $*"
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
  local env_file="${ENV_FILE:-${COMPOSE_DIR}/.env}"
  case "${env_file}" in
    /*) printf '%s\n' "${env_file}" ;;
    *) printf '%s\n' "$(pwd)/${env_file}" ;;
  esac
}

require_env_file() {
  local env_file
  env_file="$(env_file_path)"
  [ -f "${env_file}" ] || die "missing env file: ${env_file}"
}

require_docker() {
  command -v docker >/dev/null 2>&1 || die "docker is required"
  docker info >/dev/null 2>&1 || die "docker daemon is not available"
}

verify_checksums() {
  local sums="${ROOT_DIR}/checksums/SHA256SUMS"
  if [ ! -f "${sums}" ]; then
    die "missing checksums/SHA256SUMS"
  fi
  (cd "${ROOT_DIR}" && sha256sum -c "checksums/SHA256SUMS")
}

read_env_value() {
  local key="$1"
  local env_file
  env_file="$(env_file_path)"
  read_env_file_value "${env_file}" "${key}"
}

read_env_file_value() {
  local env_file="$1"
  local key="$2"
  [ -f "${env_file}" ] || return 1
  awk -F= -v k="${key}" '$1 == k {print substr($0, length(k) + 2); exit}' "${env_file}"
}

read_manifest_value() {
  local manifest="$1"
  local key="$2"
  [ -f "${manifest}" ] || return 1
  grep -o "\"${key}\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" "${manifest}" | head -n 1 | cut -d'"' -f4
}

image_for_root() {
  local target_root="$1"
  local target_env="${target_root}/compose/.env"
  local active_env
  active_env="$(env_file_path)"
  read_env_file_value "${active_env}" COW_IMAGE && return 0
  read_env_file_value "${target_env}" COW_IMAGE || echo "cowagent-offline:2.1.7-base.1-dev"
}

grant_open_mount_permissions() {
  local target_root="$1"
  local image
  [ -d "${target_root}" ] || return 0
  image="$(image_for_root "${target_root}")"
  docker image inspect "${image}" >/dev/null 2>&1 || die "missing image for permission normalization: ${image}"
  docker run --rm \
    --user 0:0 \
    -v "${target_root}:/mnt/root" \
    --entrypoint sh \
    "${image}" \
    -c '
      set -e
      mkdir -p /mnt/root/storage/cow/tmp /mnt/root/storage/cow/skills
      for path in storage patch-mounted source-mounted toolpacks model-assets scripts; do
        [ -e "/mnt/root/${path}" ] && chmod -R a+rwx "/mnt/root/${path}"
      done
    '
}

normalize_cow_storage_permissions() {
  local target_root="$1"
  grant_open_mount_permissions "${target_root}"
}

normalize_cow_runtime_permissions() {
  local target_root="$1"
  grant_open_mount_permissions "${target_root}"
}

redact_env() {
  sed -E \
    -e 's/((KEY|TOKEN|SECRET|PASSWORD)[A-Za-z0-9_ -]*[=:][[:space:]]*)[^,}[:space:]]+/\1***REDACTED***/g' \
    -e 's/(sk-[A-Za-z0-9_-]{12,})/***REDACTED***/g'
}
