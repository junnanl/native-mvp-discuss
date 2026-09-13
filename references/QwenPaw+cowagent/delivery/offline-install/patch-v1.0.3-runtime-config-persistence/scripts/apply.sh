#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

copy_tree_if_exists() {
  local src="$1"
  local dst="$2"
  if [ -d "${src}" ]; then
    mkdir -p "${dst}"
    cp -a "${src}/." "${dst}/"
  fi
}

abs_path() {
  local path="$1"
  case "${path}" in
    /*) printf '%s\n' "${path}" ;;
    *) printf '%s\n' "$(pwd)/${path}" ;;
  esac
}

seed_runtime_config_from_image() {
  local dst="$1"
  local image
  image="$(image_for_target)"
  docker image inspect "${image}" >/dev/null 2>&1 || die "missing image: ${image}"
  docker run --rm --entrypoint sh "${image}" -c '
    set -e
    if [ -f /app/config.json ]; then
      cat /app/config.json
    elif [ -f /app/config-template.json ]; then
      cat /app/config-template.json
    else
      printf "%s\n" "{}"
    fi
  ' > "${dst}"
}

seed_runtime_config_from_container() {
  local dst="$1"
  local container
  container="$(container_for_target)"
  if docker inspect "${container}" >/dev/null 2>&1; then
    if docker cp "${container}:/app/config.json" "${dst}" >/dev/null 2>&1; then
      info "seeded runtime config from running container"
      return 0
    fi
  fi
  seed_runtime_config_from_image "${dst}"
  info "seeded runtime config from image template"
}

merge_env_defaults_into_config() {
  local image
  image="$(image_for_target)"
  docker run --rm \
    -v "${TARGET_ROOT}:/mnt/root" \
    --entrypoint python \
    "${image}" \
    - <<'PY'
import json
from pathlib import Path

root = Path("/mnt/root")
config_path = root / "storage/cow/app-config/config.json"
env_path = root / "compose/.env"

with config_path.open("r", encoding="utf-8") as f:
    config = json.load(f)
if not isinstance(config, dict):
    config = {}

env = {}
if env_path.exists():
    for raw in env_path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip()

string_map = {
    "COW_LANG": "cow_lang",
    "COW_CHANNEL_TYPE": "channel_type",
    "COW_WEB_PASSWORD": "web_password",
    "MODEL": "model",
    "BOT_TYPE": "bot_type",
    "OPEN_AI_API_BASE": "open_ai_api_base",
    "OPEN_AI_API_KEY": "open_ai_api_key",
    "DASHSCOPE_API_KEY": "dashscope_api_key",
    "DEEPSEEK_API_KEY": "deepseek_api_key",
    "DEEPSEEK_API_BASE": "deepseek_api_base",
    "EMBEDDING_PROVIDER": "embedding_provider",
    "EMBEDDING_MODEL": "embedding_model",
}
for env_key, cfg_key in string_map.items():
    value = env.get(env_key, "")
    if value:
        config[cfg_key] = value

int_map = {
    "COW_AGENT_MAX_CONTEXT_TOKENS": "agent_max_context_tokens",
    "COW_AGENT_MAX_CONTEXT_TURNS": "agent_max_context_turns",
    "COW_AGENT_MAX_STEPS": "agent_max_steps",
}
for env_key, cfg_key in int_map.items():
    value = env.get(env_key, "")
    if value:
        try:
            config[cfg_key] = int(value)
        except ValueError:
            pass

config.setdefault("web_console", True)
config.setdefault("agent", True)
config.setdefault("agent_workspace", "/home/agent/cow")
config.setdefault("tools", {})
if not isinstance(config["tools"], dict):
    config["tools"] = {}
config["tools"].setdefault("vision", {"provider": "", "model": ""})
config.setdefault("skills", {})
config.setdefault("custom_providers", [])

config_path.write_text(json.dumps(config, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
PY
}

prepare_runtime_config() {
  local backup_dir="$1"
  local config_file
  local config_dir
  local source_file
  local env_config_file

  config_file="$(runtime_config_path)"
  config_dir="$(dirname "${config_file}")"
  env_config_file="${TARGET_ROOT}/storage/cow/env-config/.env"
  mkdir -p "${config_dir}"

  mkdir -p "${backup_dir}/runtime-config"
  if [ -f "${config_file}" ]; then
    cp -a "${config_file}" "${backup_dir}/runtime-config/config.json.before"
  else
    : > "${backup_dir}/runtime-config/config.json.absent"
  fi
  mkdir -p "${backup_dir}/env-config"
  if [ -f "${env_config_file}" ]; then
    cp -a "${env_config_file}" "${backup_dir}/env-config/.env.before"
  else
    : > "${backup_dir}/env-config/.env.absent"
  fi

  if [ -n "${CONFIG_SOURCE:-}" ]; then
    source_file="$(abs_path "${CONFIG_SOURCE}")"
    [ -f "${source_file}" ] || die "CONFIG_SOURCE not found: ${source_file}"
    cp -a "${source_file}" "${config_file}"
    info "runtime config initialized from CONFIG_SOURCE"
  elif [ ! -f "${config_file}" ]; then
    seed_runtime_config_from_container "${config_file}"
    merge_env_defaults_into_config
  else
    info "preserving existing runtime config: ${config_file}"
  fi

  validate_runtime_config_json
  sync_env_config_from_runtime_config
}

main() {
  require_target_root
  verify_patch_checksums
  verify_target_compatibility

  grep -q '"dependencyChange"[[:space:]]*:[[:space:]]*true' "${PATCH_ROOT}/manifest.json" \
    && die "dependencyChange=true requires a base image upgrade, not a lightweight patch"

  local patch_version
  patch_version="$(grep -o '"patchVersion"[[:space:]]*:[[:space:]]*"[^"]*"' "${PATCH_ROOT}/manifest.json" | cut -d'"' -f4)"
  [ -n "${patch_version}" ] || die "patchVersion not found in manifest"

  local backup_dir="${TARGET_ROOT}/storage/backups/patches/${patch_version}/$(date +%Y%m%d-%H%M%S)"
  mkdir -p "${backup_dir}"

  mkdir -p "${backup_dir}/compose"
  if [ -f "${TARGET_ROOT}/compose/docker-compose.override.yml" ]; then
    cp -a "${TARGET_ROOT}/compose/docker-compose.override.yml" "${backup_dir}/compose/docker-compose.override.yml.before"
  else
    : > "${backup_dir}/compose/docker-compose.override.yml.absent"
  fi

  prepare_runtime_config "${backup_dir}"
  copy_tree_if_exists "${PATCH_ROOT}/patches/compose" "${TARGET_ROOT}/compose"

  mkdir -p "${TARGET_ROOT}/storage/backups/patches"
  {
    echo "patchVersion=${patch_version}"
    echo "appliedAt=$(date -Iseconds)"
    echo "backupDir=${backup_dir}"
  } >> "${TARGET_ROOT}/storage/backups/patches/apply.log"

  normalize_cow_storage_permissions
  restart_service
  write_patch_state "applying"
  trap 'remove_patch_state' ERR
  SKIP_PATCH_STATE_CHECK=1 "${SCRIPT_DIR}/verify.sh"
  write_patch_state "applied"
  trap - ERR
}

main "$@"
