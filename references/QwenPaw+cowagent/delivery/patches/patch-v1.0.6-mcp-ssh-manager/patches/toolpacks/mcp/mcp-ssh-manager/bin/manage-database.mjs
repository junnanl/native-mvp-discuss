#!/usr/bin/env node

import fs from 'fs';
import os from 'os';
import path from 'path';
import TOML from '@iarna/toml';

const managerHome = process.env.SSH_MANAGER_HOME
  || path.join(os.homedir(), '.ssh-manager');
const configPath = process.env.SSH_CONFIG_PATH
  || path.join(path.dirname(managerHome), '..', 'config', 'servers.toml');
const validTypes = new Set(['mysql', 'postgresql', 'mongodb']);
const defaultPorts = { mysql: 3306, postgresql: 5432, mongodb: 27017 };

function fail(message) {
  console.error(`错误：${message}`);
  process.exit(2);
}

function parseArgs(argv) {
  const result = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) result._.push(arg);
    else {
      const next = argv[index + 1];
      if (!next || next.startsWith('--')) result[arg.slice(2)] = true;
      else {
        result[arg.slice(2)] = next;
        index += 1;
      }
    }
  }
  return result;
}

function requiredText(value, field) {
  if (typeof value !== 'string' || !value.trim()) fail(`${field} 不能为空。`);
  if (/\p{Cc}/u.test(value)) fail(`${field} 不能包含控制字符。`);
  return value.trim();
}

function readConfig() {
  if (!fs.existsSync(configPath)) return { ssh_servers: {}, database_connections: {} };
  const parsed = TOML.parse(fs.readFileSync(configPath, 'utf8'));
  parsed.ssh_servers ||= {};
  parsed.database_connections ||= {};
  return parsed;
}

function writeConfig(config) {
  fs.mkdirSync(path.dirname(configPath), { recursive: true, mode: 0o700 });
  const temporary = `${configPath}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, TOML.stringify(config), { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temporary, configPath);
  fs.chmodSync(configPath, 0o600);
}

function publicProfile(name, profile) {
  return {
    name,
    server: profile.server,
    type: profile.type,
    host: profile.host || 'localhost',
    port: profile.port || defaultPorts[profile.type],
    user: profile.user || '',
    database: profile.database || '',
    authentication: profile.password ? 'password' : 'server-default',
    description: profile.description || ''
  };
}

function normalize(input, existing, config) {
  const allowed = new Set([
    'name', 'server', 'type', 'host', 'port', 'user', 'password',
    'database', 'description'
  ]);
  const unknown = Object.keys(input).filter((key) => !allowed.has(key));
  if (unknown.length) fail(`不支持的数据库字段：${unknown.join(', ')}。`);
  const name = requiredText(input.name, 'name').toLowerCase();
  const server = requiredText(input.server ?? existing?.server, 'server').toLowerCase();
  if (!config.ssh_servers[server]) fail(`SSH 连接不存在：${server}。`);
  const type = requiredText(input.type ?? existing?.type, 'type').toLowerCase();
  if (!validTypes.has(type)) fail('type 只能是 mysql、postgresql 或 mongodb。');
  const port = input.port === undefined
    ? (existing?.port || defaultPorts[type]) : Number(input.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    fail('port 必须是 1-65535 的整数。');
  }
  const profile = {
    ...(existing || {}), server, type, port,
    host: requiredText(input.host ?? existing?.host ?? 'localhost', 'host')
  };
  for (const field of ['user', 'password', 'database', 'description']) {
    if (!(field in input)) continue;
    if (input[field] === null || input[field] === '') delete profile[field];
    else profile[field] = requiredText(input[field], field);
  }
  return { name, profile };
}

function upsert(args) {
  if (!args.file) fail('upsert 需要 --file <JSON 文件>。');
  const input = JSON.parse(fs.readFileSync(path.resolve(String(args.file)), 'utf8'));
  const config = readConfig();
  const inputName = requiredText(input.name, 'name').toLowerCase();
  const current = config.database_connections[inputName];
  const { name, profile } = normalize(input, current, config);
  config.database_connections[name] = profile;
  writeConfig(config);
  console.log(JSON.stringify({ status: 'saved', database: publicProfile(name, profile) }));
}

function listProfiles() {
  const config = readConfig();
  const databases = Object.entries(config.database_connections)
    .map(([name, profile]) => publicProfile(name, profile));
  console.log(JSON.stringify({ count: databases.length, databases }, null, 2));
}

function removeProfile(name) {
  const config = readConfig();
  const normalized = requiredText(name, 'name').toLowerCase();
  if (!config.database_connections[normalized]) fail(`数据库连接不存在：${normalized}。`);
  delete config.database_connections[normalized];
  writeConfig(config);
  console.log(JSON.stringify({ status: 'removed', name: normalized }));
}

function usage() {
  console.log(`用法：
  manage-database.mjs upsert --file <database.json>
  manage-database.mjs list
  manage-database.mjs remove <name>`);
}

const args = parseArgs(process.argv.slice(2));
try {
  if (args._[0] === 'upsert') upsert(args);
  else if (args._[0] === 'list') listProfiles();
  else if (args._[0] === 'remove') removeProfile(args._[1]);
  else if (args._[0] === 'help' || !args._[0]) usage();
  else fail(`未知命令：${args._[0]}。`);
} catch (error) {
  fail(error.message);
}
