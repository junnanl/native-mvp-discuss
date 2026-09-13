import {cowFetch} from './cowagent';
import {getEmployee} from './employee-store';

type EvoEvent = {type?: string; content?: unknown; message?: unknown; error?: unknown; tool?: unknown; seq?: number};

export type InternalRunTrace = {
  requestId: string;
  durationMs: number;
  phases: string[];
  tools: string[];
};

export type InternalRunResult = InternalRunTrace & {content: string};

function parseBlock(block: string): EvoEvent | null {
  const data = block.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trimStart()).join('\n');
  if (!data || data === '[DONE]') return null;
  try { return JSON.parse(data) as EvoEvent; } catch { return null; }
}

async function cancelRequest(requestId: string, employeeId: string) {
  await cowFetch('/cancel', {
    method: 'POST',
    headers: {'content-type': 'application/json'},
    body: JSON.stringify({request_id: requestId}),
  }, employeeId).catch(() => undefined);
}

/** Executes a hidden employee through the real Evo-Harness Web channel and collects its final result. */
export async function runInternalEmployee(employeeId: string, task: string, timeoutMs = 25_000): Promise<InternalRunResult> {
  const employee = await getEmployee(employeeId);
  if (!employee) throw new Error(`找不到内部员工：${employeeId}`);

  const startedAt = performance.now();
  const sessionId = `internal-${employeeId}-${crypto.randomUUID()}`;
  const prompt = [
    `[数字员工岗位] ${employee.title}`,
    employee.systemPrompt,
    '这是一次内部短任务。严格遵循指定输出格式，不展示思维链。',
    '',
    `[任务输入]\n${task}`,
  ].join('\n');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let requestId = '';

  try {
    const startResponse = await cowFetch('/message', {
      method: 'POST',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({session_id: sessionId, message: prompt, attachments: [], stream: true, lang: 'zh'}),
      signal: controller.signal,
    }, employeeId);
    const startPayload = await startResponse.json() as {request_id?: string; message?: string};
    if (!startResponse.ok || !startPayload.request_id) throw new Error(startPayload.message ?? '内部员工启动失败');
    requestId = startPayload.request_id;

    const streamResponse = await cowFetch(`/stream?request_id=${encodeURIComponent(requestId)}`, {signal: controller.signal}, employeeId);
    if (!streamResponse.ok || !streamResponse.body) throw new Error(`内部员工事件流失败（HTTP ${streamResponse.status}）`);

    const reader = streamResponse.body.getReader();
    const decoder = new TextDecoder();
    const phases: string[] = [];
    const tools = new Set<string>();
    let buffer = '';
    let content = '';
    let finalContent = '';
    let terminal = false;

    while (!terminal) {
      const {done, value} = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, {stream: true});
      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() ?? '';
      for (const block of blocks) {
        const event = parseBlock(block);
        if (!event) continue;
        const type = String(event.type ?? '');
        if (type === 'delta') content += String(event.content ?? '');
        if (type === 'text') content = String(event.content ?? content);
        if (type === 'done') finalContent = String(event.content ?? content);
        if (type === 'phase') {
          const phase = String(event.content ?? '阶段更新');
          if (!phases.includes(phase)) phases.push(phase);
        }
        if (type === 'tool_start' && event.tool) tools.add(String(event.tool));
        if (type === 'error') throw new Error(String(event.message ?? event.error ?? '内部员工执行失败'));
        terminal = type === 'stream_end' || type === 'cancelled';
      }
    }

    const result = (finalContent || content).trim();
    if (!result) throw new Error('内部员工没有返回可解析结果');
    return {requestId, content: result, durationMs: Math.max(0, Math.round(performance.now() - startedAt)), phases, tools: [...tools]};
  } catch (error) {
    if (requestId) await cancelRequest(requestId, employeeId);
    if (controller.signal.aborted) throw new Error(`内部员工执行超时（${Math.round(timeoutMs / 1000)} 秒）`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export function extractStructuredJson(content: string) {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const start = content.indexOf('{');
  const end = content.lastIndexOf('}');
  const candidate = fenced ?? (start >= 0 && end > start ? content.slice(start, end + 1) : content);
  return JSON.parse(candidate);
}
