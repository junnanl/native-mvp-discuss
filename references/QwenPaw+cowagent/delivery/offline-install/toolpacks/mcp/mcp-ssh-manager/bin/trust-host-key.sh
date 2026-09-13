#!/usr/bin/env bash
set -Eeuo pipefail

host="${1:-}"
port="${2:-22}"
expected="${3:-}"

if [ -z "${host}" ] || [ -z "${expected}" ]; then
  echo "Usage: trust-host-key.sh HOST [PORT] SHA256:FINGERPRINT" >&2
  exit 2
fi

case "${expected}" in
  SHA256:*) ;;
  *) echo "Expected fingerprint must start with SHA256:" >&2; exit 2 ;;
esac

tmp="$(mktemp)"
trap 'rm -f "${tmp}"' EXIT
ssh-keyscan -p "${port}" -t ed25519,rsa,ecdsa "${host}" > "${tmp}" 2>/dev/null
[ -s "${tmp}" ] || { echo "Unable to retrieve a host key from ${host}:${port}" >&2; exit 1; }

matched=0
while IFS= read -r fingerprint; do
  if [ "${fingerprint}" = "${expected}" ]; then
    matched=1
    break
  fi
done < <(ssh-keygen -l -E sha256 -f "${tmp}" | awk '{print $2}')

[ "${matched}" = "1" ] || {
  echo "Host key fingerprint does not match the trusted value." >&2
  ssh-keygen -l -E sha256 -f "${tmp}" >&2
  exit 1
}

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"
host_entry="${host}"
if [ "${port}" != "22" ]; then
  host_entry="[${host}]:${port}"
fi
ssh-keygen -R "${host_entry}" -f "${HOME}/.ssh/known_hosts" >/dev/null 2>&1 || true
cat "${tmp}" >> "${HOME}/.ssh/known_hosts"
chmod 600 "${HOME}/.ssh/known_hosts"
echo "Trusted ${host}:${port} with ${expected}"
