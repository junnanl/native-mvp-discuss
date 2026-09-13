#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCH_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TARGET_ROOT="${TARGET_ROOT:-}"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

info() {
  echo "INFO: $*"
}

require_target_root() {
  if [ -z "${TARGET_ROOT}" ]; then
    die "TARGET_ROOT is required, e.g. TARGET_ROOT=/opt/cowagent-offline $0"
  fi
  [ -d "${TARGET_ROOT}/compose" ] || die "TARGET_ROOT does not look like an installed CowAgent package: ${TARGET_ROOT}"
  [ -f "${TARGET_ROOT}/manifest.json" ] || die "missing installed manifest: ${TARGET_ROOT}/manifest.json"
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

require_docker() {
  command -v docker >/dev/null 2>&1 || die "docker is required"
  docker info >/dev/null 2>&1 || die "docker daemon is not available"
}

env_file_path() {
  local env_file="${ENV_FILE:-${TARGET_ROOT}/compose/.env}"
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

verify_patch_checksums() {
  local sums="${PATCH_ROOT}/checksums/SHA256SUMS"
  if [ ! -f "${sums}" ]; then
    die "missing checksums/SHA256SUMS"
  fi
  (cd "${PATCH_ROOT}" && sha256sum -c "checksums/SHA256SUMS")
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
  [ -f "${patch_manifest}" ] || die "missing patch manifest: ${patch_manifest}"
  [ -f "${target_manifest}" ] || die "missing installed manifest: ${target_manifest}"

  expected="$(read_manifest_value "${patch_manifest}" requiresPackageVersion || true)"
  actual="$(read_manifest_value "${target_manifest}" packageVersion || true)"
  require_matching_value "packageVersion" "${expected}" "${actual}"

  expected="$(read_manifest_value "${patch_manifest}" requiresCowAgentVersion || true)"
  actual="$(read_manifest_value "${target_manifest}" cowagentVersion || true)"
  require_matching_value "cowagentVersion" "${expected}" "${actual}"

  expected="$(read_manifest_value "${patch_manifest}" requiresBaseImage || true)"
  actual="$(read_manifest_value "${target_manifest}" baseImage || true)"
  require_matching_value "baseImage" "${expected}" "${actual}"

  actual="$(read_env_file_value "${TARGET_ROOT}/compose/.env" COW_IMAGE || true)"
  require_matching_value "COW_IMAGE" "${expected}" "${actual}"
}

image_for_target() {
  local target_env="${TARGET_ROOT}/compose/.env"
  read_env_file_value "${target_env}" COW_IMAGE || echo "cowagent-offline:2.1.2-base.2-dev"
}

grant_open_mount_permissions() {
  local image
  [ -d "${TARGET_ROOT}" ] || return 0
  require_docker
  image="$(image_for_target)"
  docker image inspect "${image}" >/dev/null 2>&1 || die "missing image for permission normalization: ${image}"
  docker run --rm \
    --user 0:0 \
    -v "${TARGET_ROOT}:/mnt/root" \
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
  grant_open_mount_permissions
}

redact_env() {
  sed -E \
    -e 's/((KEY|TOKEN|SECRET|PASSWORD)[A-Za-z0-9_ -]*[=:][[:space:]]*)[^,}[:space:]]+/\1***REDACTED***/g' \
    -e 's/(sk-[A-Za-z0-9_-]{12,})/***REDACTED***/g'
}

restart_service() {
  local cmd
  local env_file
  require_env_file
  cmd="$(compose_cmd)"
  env_file="$(env_file_path)"
  (cd "${TARGET_ROOT}/compose" && ${cmd} --env-file "${env_file}" up -d)
}
