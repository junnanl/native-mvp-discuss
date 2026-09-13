#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${ROOT_DIR}/dist"
PACKAGE_NAME="cowagent-offline-install-1.1.0.tar.gz"
BASE_IMAGE="${BASE_IMAGE:-cowagent-offline:2.1.7-base.1-dev}"
UPSTREAM_IMAGE="${UPSTREAM_IMAGE:-zhayujie/chatgpt-on-wechat:2.1.7}"
IMAGE_TAR="${ROOT_DIR}/images/cowagent-offline-2.1.7-base.1-dev.tar"
IMAGE_TAR_NAME="$(basename "${IMAGE_TAR}")"
ROLLBACK_IMAGE_TAR="${ROOT_DIR}/images/cowagent-offline-2.1.2-base.2-dev.tar"
ROLLBACK_IMAGE_TAR_NAME="$(basename "${ROLLBACK_IMAGE_TAR}")"

die() {
  echo "ERROR: $*" >&2
  exit 1
}

main() {
  [ -f "${ROOT_DIR}/manifest.json" ] || die "missing manifest.json"
  [ -f "${ROOT_DIR}/compose/docker-compose.yml" ] || die "missing compose/docker-compose.yml"
  [ -f "${ROOT_DIR}/compose/docker-compose.override.yml" ] || die "missing compose/docker-compose.override.yml"
  [ -f "${ROOT_DIR}/compose/.env.example" ] || die "missing compose/.env.example"
  [ -f "${ROLLBACK_IMAGE_TAR}" ] || die "missing rollback image tar: ${ROLLBACK_IMAGE_TAR}"
  [ ! -f "${ROOT_DIR}/compose/.env" ] || die "compose/.env must not be packaged"

  mkdir -p "${ROOT_DIR}/checksums" "${DIST_DIR}" "${ROOT_DIR}/images"

  if [ ! -f "${IMAGE_TAR}" ]; then
    command -v docker >/dev/null 2>&1 || die "docker is required to export ${BASE_IMAGE}"
    if ! docker image inspect "${BASE_IMAGE}" >/dev/null 2>&1; then
      docker image inspect "${UPSTREAM_IMAGE}" >/dev/null 2>&1 \
        || die "missing local image ${BASE_IMAGE}; pull or load ${UPSTREAM_IMAGE} in the packaging environment first"
      docker tag "${UPSTREAM_IMAGE}" "${BASE_IMAGE}"
    fi
    docker save -o "${IMAGE_TAR}" "${BASE_IMAGE}"
  fi

  (cd "${ROOT_DIR}" && find \
    compose/docker-compose.yml \
    compose/docker-compose.override.yml \
    compose/.env.example \
    scripts \
    docs \
    "images/${IMAGE_TAR_NAME}" \
    "images/${ROLLBACK_IMAGE_TAR_NAME}" \
    model-assets \
    patch-mounted \
    seed \
    source-mounted \
    toolpacks \
    manifest.json \
    -type f \
    ! -path '*/__pycache__/*' \
    ! -name '*.pyc' \
    ! -name '.DS_Store' \
    -print0 | sort -z | xargs -0 sha256sum > checksums/SHA256SUMS)

  (cd "${ROOT_DIR}/.." && tar -czf "${DIST_DIR}/${PACKAGE_NAME}" \
    --exclude='offline-install/dist' \
    --exclude='*/__pycache__' \
    --exclude='*.pyc' \
    --exclude='.DS_Store' \
    offline-install/compose/docker-compose.yml \
    offline-install/compose/docker-compose.override.yml \
    offline-install/compose/.env.example \
    "offline-install/images/${IMAGE_TAR_NAME}" \
    "offline-install/images/${ROLLBACK_IMAGE_TAR_NAME}" \
    offline-install/model-assets \
    offline-install/patch-mounted \
    offline-install/seed \
    offline-install/source-mounted \
    offline-install/toolpacks \
    offline-install/scripts \
    offline-install/docs \
    offline-install/checksums \
    offline-install/manifest.json)

  if tar -tzf "${DIST_DIR}/${PACKAGE_NAME}" | grep -E '^offline-install/storage/|(^|/)compose/\.env$|support-bundles|__pycache__|\.pyc$|(^|/)(id_rsa|id_ed25519)$|\.key$' >/dev/null; then
    die "package contains forbidden runtime, secret, or support-bundle path"
  fi

  (cd "${DIST_DIR}" && sha256sum "${PACKAGE_NAME}" > "${PACKAGE_NAME}.sha256")
  echo "${DIST_DIR}/${PACKAGE_NAME}"
}

main "$@"
