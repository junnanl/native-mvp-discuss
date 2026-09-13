# Upstream provenance

- Repository: `https://github.com/bvisible/mcp-ssh-manager`
- Version: `3.7.0`
- Commit: `5c3a8137a3d8e083708770f067cada948d16022b`
- License: MIT
- Production dependencies: frozen by `pnpm-lock.yaml` and included under `node_modules/`
- Native runtime utilities: Debian 11 `rsync`, `sshpass`, and OpenSSH client binaries with required non-base shared libraries under `runtime/`

Local adaptations are limited to the offline runtime bootstrap in `src/secure-entrypoint.mjs`, TOFU host-key recording and changed-key rejection in `src/ssh-manager.js` / `src/ssh-key-manager.js`, and deterministic runtime administration through `bin/manage-server.mjs`.
