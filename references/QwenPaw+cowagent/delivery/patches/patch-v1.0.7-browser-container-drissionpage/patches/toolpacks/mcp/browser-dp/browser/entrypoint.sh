#!/bin/bash
# 浏览器容器入口：Chromium（CDP 绑 127.0.0.1）+ python3 TCP 转发器（0.0.0.0:9222 -> 127.0.0.1:9222）。
# Chromium 110+ 强制 DevTools 只绑环回，跨容器接管靠转发器暴露。
# 两个子进程任一退出都导致容器退出，由 docker restart 策略整体自愈。
set -e
ulimit -n 65536 2>/dev/null || true

# profile 卷上残留的旧容器 SingletonLock 会让 Chromium 拒绝启动；每次启动按当前 hostname 重写。
PROFILE_DIR=""
prev=""
for arg in "$@"; do
  case "${arg}" in
    --user-data-dir=*) PROFILE_DIR="${arg#--user-data-dir=}" ;;
    --user-data-dir) prev="--user-data-dir" ;;
    *) if [ "${prev}" = "--user-data-dir" ]; then PROFILE_DIR="${arg}"; fi ;;
  esac
  prev="${arg}"
done
if [ -n "${PROFILE_DIR}" ] && [ -L "${PROFILE_DIR}/SingletonLock" ]; then
  rm -f "${PROFILE_DIR}/SingletonLock" "${PROFILE_DIR}/SingletonCookie" "${PROFILE_DIR}/SingletonSocket"
fi

# 容器强杀/断电会把 profile 留成 exit_type=Crashed；headless 下 Chromium 的
# 崩溃恢复流程结束时会 rc=0 自退。启动前重置并屏蔽恢复气泡。
if [ -n "${PROFILE_DIR}" ] && [ -f "${PROFILE_DIR}/Default/Preferences" ]; then
  /usr/local/bin/python3 - "$PROFILE_DIR/Default/Preferences" <<'PY' || true
import json, sys
path = sys.argv[1]
try:
    with open(path, encoding="utf-8") as f:
        prefs = json.load(f)
    profile = prefs.setdefault("profile", {})
    if profile.get("exit_type") not in (None, "Normal"):
        profile["exit_type"] = "Normal"
        prefs.setdefault("session", {}).pop("restore_on_startup", None)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(prefs, f, ensure_ascii=False)
        print("entrypoint: reset profile exit_type", file=sys.stderr, flush=True)
except Exception as exc:
    print(f"entrypoint: preferences reset skipped: {exc}", file=sys.stderr, flush=True)
PY
fi

# 端口约定：Chromium DevTools 绑 127.0.0.1:9223（Chromium 110+ 强制环回），
# 转发器绑 0.0.0.0:9222 -> 127.0.0.1:9223，供跨容器经容器 IP 访问。
# 两个端口必须不同，否则转发器目标会指到自己形成自连循环。
/usr/bin/chromium "$@" &
CHROME_PID=$!

/usr/local/bin/python3 /opt/browser/cdp-forwarder.py 0.0.0.0 9222 127.0.0.1 9223 &
FORWARDER_PID=$!

trap 'kill "${CHROME_PID}" "${FORWARDER_PID}" 2>/dev/null || true' EXIT INT TERM

wait -n "${CHROME_PID}" "${FORWARDER_PID}"
RC=$?
if kill -0 "${CHROME_PID}" 2>/dev/null; then
  echo "entrypoint: forwarder exited first (rc=${RC})" >&2
else
  echo "entrypoint: chromium exited first (rc=${RC})" >&2
fi
exit 1
