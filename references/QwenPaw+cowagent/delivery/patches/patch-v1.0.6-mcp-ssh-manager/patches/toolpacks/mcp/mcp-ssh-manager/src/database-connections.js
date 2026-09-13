import fs from 'fs';
import os from 'os';
import path from 'path';
import TOML from '@iarna/toml';

function configPath() {
  return process.env.SSH_CONFIG_PATH
    || path.join(os.homedir(), '.codex', 'ssh-config.toml');
}

function loadConnections() {
  const file = configPath();
  if (!fs.existsSync(file)) return {};
  const parsed = TOML.parse(fs.readFileSync(file, 'utf8'));
  return parsed.database_connections || {};
}

/** Resolve a saved database profile without exposing its password to MCP clients. */
export function resolveDatabaseOptions(options) {
  const { profile, server, type } = options;
  if (!profile) return { ...options };

  const normalized = String(profile).toLowerCase();
  const saved = loadConnections()[normalized];
  if (!saved) throw new Error(`Database connection profile "${profile}" not found`);
  if (saved.server && saved.server.toLowerCase() !== server.toLowerCase()) {
    throw new Error(
      `Database profile "${profile}" belongs to SSH server "${saved.server}", not "${server}"`
    );
  }
  if (type && saved.type && saved.type !== type) {
    throw new Error(
      `Database profile "${profile}" is ${saved.type}, not ${type}`
    );
  }

  return {
    ...options,
    type: type || saved.type,
    database: options.database || saved.database,
    user: options.user || saved.user,
    password: options.password || saved.password,
    host: options.host || saved.host,
    port: options.port || saved.port
  };
}
