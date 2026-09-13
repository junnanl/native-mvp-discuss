import {getEmployee} from './employee-store';

type HarnessConfig = {baseUrl: string; password: string};
const defaultBaseUrl = () => (process.env.COWAGENT_BASE_URL ?? 'http://127.0.0.1:19989').replace(/\/$/, '');
const sessions = new Map<string, string>();

async function resolveConfig(employeeId?: string): Promise<HarnessConfig> {
  const employee = employeeId ? await getEmployee(employeeId) : undefined;
  return {baseUrl: (employee?.harnessUrl || defaultBaseUrl()).replace(/\/$/, ''), password: employee?.harnessPassword ?? process.env.COWAGENT_WEB_PASSWORD ?? ''};
}

async function login(config: HarnessConfig) {
  const response = await fetch(`${config.baseUrl}/auth/login`, {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({password: config.password}), cache: 'no-store'});
  if (!response.ok) throw new Error(`Evo-Harness 连接失败（HTTP ${response.status}）`);
  const result = await response.json() as {status?: string; message?: string};
  if (result.status !== 'success') throw new Error(result.message ?? 'Evo-Harness 连接失败');
  const session = response.headers.get('set-cookie')?.split(';', 1)[0] ?? '';
  sessions.set(config.baseUrl, session);
  return session;
}

export async function cowFetch(path: string, init: RequestInit = {}, employeeId?: string) {
  const config = await resolveConfig(employeeId);
  let session = sessions.get(config.baseUrl) ?? await login(config);
  const headers = new Headers(init.headers);
  if (session) headers.set('cookie', session);
  let response = await fetch(`${config.baseUrl}${path}`, {...init, headers, cache: 'no-store'});
  if (response.status === 401) {
    session = await login(config);
    headers.set('cookie', session);
    response = await fetch(`${config.baseUrl}${path}`, {...init, headers, cache: 'no-store'});
  }
  return response;
}

export function errorMessage(error: unknown) { return publicHarnessMessage(error instanceof Error ? error.message : 'Evo-Harness 服务暂不可用'); }
export function publicHarnessMessage(message: string) {
  if (/CC Switch|DataCodex|local proxy|upstream/i.test(message)) return 'Evo-Harness 模型请求未通过，请调整任务内容后重试。';
  return message.replaceAll('CowAgent', 'Evo-Harness').replaceAll('cowagent', 'Evo-Harness');
}
