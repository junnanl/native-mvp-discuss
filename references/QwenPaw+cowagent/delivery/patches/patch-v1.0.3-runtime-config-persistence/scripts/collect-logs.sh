#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh"

main() {
  require_target_root
  require_docker
  local out_dir="${TARGET_ROOT}/support-bundles/runtime-config-$(date +%Y%m%d-%H%M%S)"
  local container
  mkdir -p "${out_dir}"
  container="$(container_for_target)"

  {
    echo "targetRoot=${TARGET_ROOT}"
    echo "container=${container}"
    echo "runtimeConfig=$(runtime_config_path)"
    echo "createdAt=$(date -Iseconds)"
  } > "${out_dir}/summary.txt"

  if [ -f "$(runtime_config_path)" ]; then
    docker run --rm \
      -v "${TARGET_ROOT}:/mnt/root:ro" \
      --entrypoint python \
      "$(image_for_target)" \
      - <<'PY' > "${out_dir}/config-redacted.json" 2>/dev/null || true
import json
from pathlib import Path
path = Path("/mnt/root/storage/cow/app-config/config.json")
data = json.loads(path.read_text(encoding="utf-8"))
def mask(obj):
    if isinstance(obj, dict):
        out = {}
        for k, v in obj.items():
            lk = str(k).lower()
            if any(s in lk for s in ("key", "secret", "password", "token", "sign")):
                out[k] = "***REDACTED***" if isinstance(v, str) and v else v
            else:
                out[k] = mask(v)
        return out
    if isinstance(obj, list):
        return [mask(x) for x in obj]
    return obj
print(json.dumps(mask(data), ensure_ascii=False, indent=2))
PY
  fi

  if docker inspect "${container}" >/dev/null 2>&1; then
    docker logs --tail 300 "${container}" > "${out_dir}/container.log" 2>&1 || true
    docker inspect "${container}" > "${out_dir}/container-inspect.json" 2>/dev/null || true
  fi

  info "logs collected: ${out_dir}"
}

main "$@"
