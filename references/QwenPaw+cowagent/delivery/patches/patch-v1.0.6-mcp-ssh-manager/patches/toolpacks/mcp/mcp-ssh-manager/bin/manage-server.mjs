#!/usr/bin/env node

import fs from 'fs';
import os from 'os';
import path from 'path';
import TOML from '@iarna/toml';
import { TOOL_GROUPS, getAllTools } from '../src/tool-registry.js';

const managerHome = process.env.SSH_MANAGER_HOME
  || path.join(os.homedir(), '.ssh-manager');
const configPath = process.env.SSH_CONFIG_PATH
  || path.join(path.dirname(managerHome), '..', 'config', 'servers.toml');
const toolsPath = path.join(managerHome, 'tools-config.json');
const knownHostsPath = path.join(path.dirname(managerHome), '.ssh', 'known_hosts');
const validModes = new Set(['unrestricted', 'readonly', 'restricted']);
const validPlatforms = new Set(['linux', 'windows']);
const allTools = new Set(getAllTools());
const allGroups = new Set(Object.keys(TOOL_GROUPS));

function fail(message) {
  console.error(`错误：${message}`);
  process.exit(2);
}

function parseArgs(argv) {
  const result = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      result._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith('--')) result[key] = true;
    else {
      if (result[key] === undefined) result[key] = next;
      else result[key] = [].concat(result[key], next);
      index += 1;
    }
  }
  return result;
}

function values(args, name) {
  if (args[name] === undefined) return [];
  return [].concat(args[name]).flatMap((value) => String(value).split(','));
}

function readToml() {
  if (!fs.existsSync(configPath)) return { ssh_servers: {} };
  const parsed = TOML.parse(fs.readFileSync(configPath, 'utf8'));
  if (!parsed.ssh_servers) parsed.ssh_servers = {};
  if (typeof parsed.ssh_servers !== 'object' || Array.isArray(parsed.ssh_servers)) {
    fail('servers.toml 的 ssh_servers 必须是对象。');
  }
  return parsed;
}

function writePrivate(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const temporary = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, content, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temporary, filePath);
  fs.chmodSync(filePath, 0o600);
}

function requiredText(value, field) {
  if (typeof value !== 'string' || !value.trim()) fail(`${field} 不能为空。`);
  if (/\p{Cc}/u.test(value)) fail(`${field} 不能包含控制字符。`);
  return value.trim();
}

function optionalText(value, field) {
  if (value === undefined || value === null || value === '') return undefined;
  return requiredText(value, field);
}

function validateServerInput(input, existing) {
  const allowed = new Set([
    'name', 'host', 'port', 'user', 'password', 'keyPath', 'passphrase',
    'sudoPassword', 'defaultDir', 'description', 'platform', 'proxyJump',
    'proxyCommand', 'forwardAgent', 'mode', 'allowPatterns', 'denyPatterns',
    'auditLog'
  ]);
  const unknown = Object.keys(input).filter((key) => !allowed.has(key));
  if (unknown.length) fail(`不支持的连接字段：${unknown.join(', ')}。`);

  const name = requiredText(input.name, 'name').toLowerCase();
  if (name.length > 80 || /[\[\]]/.test(name)) fail('name 最长 80 字符且不能包含方括号。');
  const port = input.port === undefined ? (existing?.port || 22) : Number(input.port);
  if (!Number.isInteger(port) || port < 1 || port > 65535) fail('port 必须是 1-65535 的整数。');
  const mode = String(input.mode || existing?.mode || 'unrestricted').toLowerCase();
  if (!validModes.has(mode)) fail('mode 只能是 unrestricted、readonly 或 restricted。');
  const platformValue = input.platform ?? existing?.platform;
  const platform = platformValue ? String(platformValue).toLowerCase() : undefined;
  if (platform && !validPlatforms.has(platform)) fail('platform 只能是 linux 或 windows。');
  const allowPatterns = input.allowPatterns ?? existing?.allow_patterns ?? [];
  const denyPatterns = input.denyPatterns ?? existing?.deny_patterns ?? [];
  if (!Array.isArray(allowPatterns) || !Array.isArray(denyPatterns)) {
    fail('allowPatterns 和 denyPatterns 必须是字符串数组。');
  }
  if (mode === 'restricted' && allowPatterns.length === 0) {
    fail('restricted 模式必须提供至少一个 allowPatterns。');
  }
  return { name, port, mode, platform, allowPatterns, denyPatterns };
}

function normalizeServer(input, existing = null) {
  const details = validateServerInput(input, existing);
  const server = {
    ...(existing || {}),
    host: requiredText(input.host ?? existing?.host, 'host'),
    port: details.port,
    user: requiredText(input.user ?? existing?.user, 'user'),
    mode: details.mode
  };
  const mapping = {
    password: 'password', keyPath: 'key_path', passphrase: 'passphrase',
    sudoPassword: 'sudo_password', defaultDir: 'default_dir',
    description: 'description', proxyJump: 'proxy_jump',
    proxyCommand: 'proxy_command', auditLog: 'audit_log'
  };
  for (const [source, target] of Object.entries(mapping)) {
    if (!(source in input)) continue;
    const value = optionalText(input[source], source);
    if (value === undefined) delete server[target];
    else server[target] = value;
  }
  if (input.password && !input.keyPath) {
    delete server.key_path;
    delete server.passphrase;
  }
  if (input.keyPath) delete server.password;
  if (!server.password && !server.key_path) {
    fail('必须提供 password 或 keyPath。');
  }
  if (details.platform) server.platform = details.platform;
  if ('forwardAgent' in input) {
    if (input.forwardAgent === true) server.forward_agent = true;
    else delete server.forward_agent;
  }
  if (details.allowPatterns.length) server.allow_patterns = details.allowPatterns.map(String);
  else delete server.allow_patterns;
  if (details.denyPatterns.length) server.deny_patterns = details.denyPatterns.map(String);
  else delete server.deny_patterns;
  return { name: details.name, server };
}

function publicServer(name, server) {
  return {
    name,
    host: server.host,
    port: server.port || 22,
    user: server.user,
    authentication: server.key_path ? 'key' : 'password',
    mode: server.mode || 'unrestricted',
    description: server.description || ''
  };
}

function upsert(args) {
  if (!args.file) fail('upsert 需要 --file <JSON 文件>。');
  const source = path.resolve(String(args.file));
  const input = JSON.parse(fs.readFileSync(source, 'utf8'));
  const config = readToml();
  const inputName = requiredText(input.name, 'name').toLowerCase();
  const { name, server } = normalizeServer(input, config.ssh_servers[inputName]);
  config.ssh_servers[name] = server;
  writePrivate(configPath, TOML.stringify(config));
  console.log(JSON.stringify({ status: 'saved', server: publicServer(name, server) }));
}

function setMode(name, mode, args) {
  const config = readToml();
  const normalized = requiredText(name, 'name').toLowerCase();
  const server = config.ssh_servers[normalized];
  if (!server) fail(`连接不存在：${normalized}。`);
  const normalizedMode = requiredText(mode, 'mode').toLowerCase();
  if (!validModes.has(normalizedMode)) {
    fail('mode 只能是 unrestricted、readonly 或 restricted。');
  }
  const patterns = values(args, 'allow-pattern');
  if (normalizedMode === 'restricted' && patterns.length === 0 && !server.allow_patterns?.length) {
    fail('restricted 模式必须通过 --allow-pattern 提供至少一个允许规则。');
  }
  server.mode = normalizedMode;
  if (patterns.length) server.allow_patterns = patterns;
  config.ssh_servers[normalized] = server;
  writePrivate(configPath, TOML.stringify(config));
  console.log(JSON.stringify({ status: 'saved', server: publicServer(normalized, server) }));
}

function listServers() {
  const config = readToml();
  const servers = Object.entries(config.ssh_servers)
    .map(([name, server]) => publicServer(name, server));
  console.log(JSON.stringify({ count: servers.length, servers }, null, 2));
}

function removeServer(name) {
  const config = readToml();
  const normalized = requiredText(name, 'name').toLowerCase();
  if (!config.ssh_servers[normalized]) fail(`连接不存在：${normalized}。`);
  delete config.ssh_servers[normalized];
  writePrivate(configPath, TOML.stringify(config));
  console.log(JSON.stringify({ status: 'removed', name: normalized }));
}

function removeKnownHost(name) {
  const config = readToml();
  const normalized = requiredText(name, 'name').toLowerCase();
  const server = config.ssh_servers[normalized];
  if (!server) fail(`连接不存在：${normalized}。`);
  if (!fs.existsSync(knownHostsPath)) {
    console.log(JSON.stringify({ status: 'not-found', name: normalized }));
    return;
  }
  const hostEntry = (server.port || 22) === 22
    ? server.host : `[${server.host}]:${server.port}`;
  const lines = fs.readFileSync(knownHostsPath, 'utf8').split('\n');
  const kept = lines.filter((line) => {
    const first = line.trim().split(/\s+/)[0] || '';
    return !first.split(',').includes(hostEntry);
  });
  if (kept.length === lines.length) {
    console.log(JSON.stringify({ status: 'not-found', name: normalized }));
    return;
  }
  writePrivate(knownHostsPath, kept.join('\n'));
  console.log(JSON.stringify({ status: 'forgotten', name: normalized }));
}

function defaultTools() {
  return {
    version: '1.0', mode: 'all',
    groups: Object.fromEntries([...allGroups].map((name) => [name, { enabled: true }])),
    tools: {}, _comment: 'Managed by Evo-Harness SSH connection administration.'
  };
}

function setTools(args) {
  let config = fs.existsSync(toolsPath)
    ? JSON.parse(fs.readFileSync(toolsPath, 'utf8')) : defaultTools();
  const mode = args.mode ? String(args.mode).toLowerCase() : undefined;
  if (mode && !['all', 'minimal', 'custom'].includes(mode)) {
    fail('工具模式只能是 all、minimal 或 custom。');
  }
  if (mode) config.mode = mode;
  const changes = ['enable-group', 'disable-group', 'enable-tool', 'disable-tool']
    .some((name) => values(args, name).length > 0);
  if (changes) config.mode = 'custom';
  config.groups ||= defaultTools().groups;
  config.tools ||= {};
  for (const name of values(args, 'enable-group')) setGroup(config, name, true);
  for (const name of values(args, 'disable-group')) setGroup(config, name, false);
  for (const name of values(args, 'enable-tool')) setTool(config, name, true);
  for (const name of values(args, 'disable-tool')) setTool(config, name, false);
  writePrivate(toolsPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(JSON.stringify({ status: 'saved', mode: config.mode }));
}

function setGroup(config, name, enabled) {
  if (!allGroups.has(name)) fail(`未知工具组：${name}。`);
  config.groups[name] = { enabled };
}

function setTool(config, name, enabled) {
  if (!allTools.has(name)) fail(`未知工具：${name}。`);
  config.tools[name] = enabled;
}

function usage() {
  console.log(`用法：
  manage-server.mjs upsert --file <server.json>
  manage-server.mjs list
  manage-server.mjs remove <name>
  manage-server.mjs set-mode <name> unrestricted|readonly|restricted [--allow-pattern <正则>]
  manage-server.mjs forget-host <name>
  manage-server.mjs set-tools --mode all|minimal|custom
  manage-server.mjs set-tools [--enable-group <组>] [--disable-group <组>]
                          [--enable-tool <工具>] [--disable-tool <工具>]`);
}

const args = parseArgs(process.argv.slice(2));
const command = args._[0];
try {
  if (command === 'upsert') upsert(args);
  else if (command === 'list') listServers();
  else if (command === 'remove') removeServer(args._[1]);
  else if (command === 'set-mode') setMode(args._[1], args._[2], args);
  else if (command === 'forget-host') removeKnownHost(args._[1]);
  else if (command === 'set-tools') setTools(args);
  else if (command === 'help' || !command) usage();
  else fail(`未知命令：${command}。`);
} catch (error) {
  fail(error.message);
}
