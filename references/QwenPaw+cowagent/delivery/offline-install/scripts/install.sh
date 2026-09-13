#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

TARGET_ROOT="${1:-/opt/cowagent-offline}"

source "${SCRIPT_DIR}/common.sh"

copy_tree_if_exists() {
  local src="$1"
  local dst="$2"
  if [ -d "${src}" ]; then
    mkdir -p "${dst}"
    cp -a "${src}/." "${dst}/"
  fi
}

copy_tree_without_overwrite() {
  local src="$1"
  local dst="$2"
  local item
  local rel
  local target
  if [ -d "${src}" ]; then
    (cd "${src}" && find . -mindepth 1 -print0) | while IFS= read -r -d '' item; do
      rel="${item#./}"
      target="${dst}/${rel}"
      if [ -d "${src}/${rel}" ] && [ ! -L "${src}/${rel}" ]; then
        mkdir -p "${target}"
      elif [ -L "${src}/${rel}" ]; then
        mkdir -p "$(dirname "${target}")"
        [ -e "${target}" ] || [ -L "${target}" ] || cp -P "${src}/${rel}" "${target}"
      else
        mkdir -p "$(dirname "${target}")"
        [ -e "${target}" ] || cp -p "${src}/${rel}" "${target}"
      fi
    done
  fi
}

main() {
  require_docker
  compose_cmd >/dev/null
  verify_checksums

  [ -f "${ROOT_DIR}/manifest.json" ] || die "missing manifest.json"
  [ -f "${ROOT_DIR}/compose/docker-compose.yml" ] || die "missing compose/docker-compose.yml"
  [ -f "${ROOT_DIR}/compose/docker-compose.override.yml" ] || die "missing compose/docker-compose.override.yml"
  [ -f "${ROOT_DIR}/compose/.env.example" ] || die "missing compose/.env.example"

  mkdir -p "${TARGET_ROOT}"
  mkdir -p "${TARGET_ROOT}/compose"
  mkdir -p "${TARGET_ROOT}/storage/cow"
  mkdir -p "${TARGET_ROOT}/storage/logs"
  mkdir -p "${TARGET_ROOT}/storage/backups"
  mkdir -p "${TARGET_ROOT}/patch-mounted"
  mkdir -p "${TARGET_ROOT}/source-mounted"
  mkdir -p "${TARGET_ROOT}/toolpacks"
  mkdir -p "${TARGET_ROOT}/model-assets"

  cp -a "${ROOT_DIR}/compose/docker-compose.yml" "${TARGET_ROOT}/compose/"
  cp -a "${ROOT_DIR}/compose/docker-compose.override.yml" "${TARGET_ROOT}/compose/"
  cp -a "${ROOT_DIR}/compose/.env.example" "${TARGET_ROOT}/compose/"
  copy_tree_if_exists "${ROOT_DIR}/patch-mounted" "${TARGET_ROOT}/patch-mounted"
  copy_tree_if_exists "${ROOT_DIR}/source-mounted" "${TARGET_ROOT}/source-mounted"
  copy_tree_if_exists "${ROOT_DIR}/toolpacks" "${TARGET_ROOT}/toolpacks"
  copy_tree_if_exists "${ROOT_DIR}/model-assets" "${TARGET_ROOT}/model-assets"
  copy_tree_without_overwrite "${ROOT_DIR}/seed/workspace" "${TARGET_ROOT}/storage/cow"
  cp -a "${ROOT_DIR}/scripts" "${TARGET_ROOT}/"
  cp -a "${ROOT_DIR}/docs" "${TARGET_ROOT}/"
  cp -a "${ROOT_DIR}/manifest.json" "${TARGET_ROOT}/"
  cp -a "${ROOT_DIR}/checksums" "${TARGET_ROOT}/"

  local base_image
  local image_tar
  base_image="$(read_manifest_value "${ROOT_DIR}/manifest.json" baseImage || true)"
  [ -n "${base_image}" ] || die "baseImage not found in manifest.json"
  image_tar="${ROOT_DIR}/images/${base_image//[:\/]/-}.tar"

  if [ -f "${image_tar}" ]; then
    mkdir -p "${TARGET_ROOT}/images"
    cp -a "${image_tar}" "${TARGET_ROOT}/images/"
    info "loading image ${image_tar}"
    docker load -i "${image_tar}"
  else
    die "missing image tar: ${image_tar}"
  fi

  if [ ! -f "${TARGET_ROOT}/compose/.env" ]; then
    cp "${TARGET_ROOT}/compose/.env.example" "${TARGET_ROOT}/compose/.env"
    info "created ${TARGET_ROOT}/compose/.env from .env.example"
  fi

  normalize_cow_storage_permissions "${TARGET_ROOT}"

  info "installed to ${TARGET_ROOT}"
  info "edit ${TARGET_ROOT}/compose/.env, then run ${TARGET_ROOT}/scripts/start.sh"
}

main "$@"
