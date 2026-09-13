import {EventType} from '@ag-ui/core';
import {NextResponse} from 'next/server';
import {cowFetch, errorMessage, publicHarnessMessage} from '../../../../lib/cowagent';
import {getEmployee} from '../../../../lib/employee-store';

type CowEvent = {type?: string; seq?: number; [key: string]: unknown};
type AguiEvent = {type: string; [key: string]: unknown};

function stringify(value: unknown) {
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function proxyUrl(value: unknown, employeeId: string) {
  if (typeof value !== 'string' || /^https?:\/\//i.test(value)) return value;
  if (value.startsWith('/api/file?')) {
    const path = new URL(value, 'http://cow.local').searchParams.get('path');
    return path ? `/api/cow/file?path=${encodeURIComponent(path)}&employeeId=${encodeURIComponent(employeeId)}` : value;
  }
  if (value.startsWith('/uploads/') || value.startsWith('/preview/')) {
    return `/api/cow/resource?path=${encodeURIComponent(value)}&employeeId=${encodeURIComponent(employeeId)}`;
  }
  return value;
}

function sanitizeCowEvent(event: CowEvent, employeeId: string) {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(event)) {
    if (key === 'abs_path' || key === 'path') continue;
    result[key] = ['content', 'url', 'raw_url', 'preview_url', 'download_url'].includes(key)
      ? proxyUrl(value, employeeId)
      : value;
  }
  return result;
}

function parseSseBlock(block: string): CowEvent | null {
  const data = block.split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');
  if (!data || data === '[DONE]') return null;
  try {
    return JSON.parse(data) as CowEvent;
  } catch {
    return {type: 'error', message: `无法解析 Evo-Harness 事件：${data.slice(0, 160)}`};
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestId = url.searchParams.get('requestId');
  const employeeId = url.searchParams.get('employeeId') ?? '';
  const afterSeq = Math.max(0, Number(url.searchParams.get('afterSeq') ?? 0) || 0);
  if (!requestId || !employeeId || !await getEmployee(employeeId)) return NextResponse.json({error: '缺少有效的任务标识'}, {status: 400});

  let upstream: Response;
  try {
    upstream = await cowFetch(`/stream?request_id=${encodeURIComponent(requestId)}&after_seq=${afterSeq}`, {}, employeeId);
  } catch (error) {
    return NextResponse.json({error: errorMessage(error)}, {status: 503});
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({error: `Evo-Harness 流连接失败（HTTP ${upstream.status}）`}, {status: 502});
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let aguiSequence = 0;
      let textStarted = false;
      let textEnded = false;
      let reasoningStarted = false;
      let planningAnnounced = false;
      let finished = false;
      let runErrored = false;
      let cancelSeen = false;
      let buffer = '';
      const textMessageId = `message-${requestId}`;
      const reasoningMessageId = `reasoning-${requestId}`;

      const emit = (event: AguiEvent, source?: CowEvent) => {
        if (finished) return;
        const rawEvent = source ? sanitizeCowEvent(source, employeeId) : undefined;
        const envelope = {
          ...event,
          sequence: ++aguiSequence,
          providerSeq: source?.seq,
          timestamp: Date.now(),
          ...(rawEvent ? {rawEvent} : {}),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(envelope)}\n\n`));
      };
      const finish = () => {
        if (finished) return;
        finished = true;
        controller.close();
      };
      const startText = (source?: CowEvent) => {
        if (textStarted) return;
        textStarted = true;
        emit({type: EventType.TEXT_MESSAGE_START, messageId: textMessageId, role: 'assistant'}, source);
      };
      const endText = (source?: CowEvent) => {
        if (!textStarted || textEnded) return;
        textEnded = true;
        emit({type: EventType.TEXT_MESSAGE_END, messageId: textMessageId}, source);
      };
      const closeReasoning = (source?: CowEvent) => {
        if (!reasoningStarted) return;
        emit({type: EventType.REASONING_MESSAGE_END, messageId: reasoningMessageId}, source);
        emit({type: EventType.REASONING_END, messageId: reasoningMessageId}, source);
        reasoningStarted = false;
      };
      const fail = (message: string, code: string, source?: CowEvent) => {
        runErrored = true;
        closeReasoning(source);
        endText(source);
        emit({type: EventType.RUN_ERROR, message, code}, source);
      };

      const handle = (event: CowEvent) => {
        const type = String(event.type ?? '');
        if (type === 'reasoning') {
          if (!planningAnnounced) {
            planningAnnounced = true;
            emit({type: EventType.CUSTOM, name: 'evo.phase', value: {content: '正在分析任务并规划执行步骤'}}, event);
          }
        } else if (type === 'delta') {
          closeReasoning(event);
          startText(event);
          emit({type: EventType.TEXT_MESSAGE_CONTENT, messageId: textMessageId, delta: String(event.content ?? '')}, event);
        } else if (type === 'text') {
          emit({type: EventType.CUSTOM, name: 'evo.text', value: sanitizeCowEvent(event, employeeId)}, event);
        } else if (type === 'message_end') {
          emit({type: EventType.CUSTOM, name: 'evo.message_end', value: sanitizeCowEvent(event, employeeId)}, event);
        } else if (type === 'tool_start') {
          closeReasoning(event);
          const toolCallId = String(event.tool_call_id ?? `tool-${event.seq ?? aguiSequence + 1}`);
          emit({type: EventType.TOOL_CALL_START, toolCallId, toolCallName: String(event.tool ?? 'tool'), parentMessageId: textMessageId}, event);
          emit({type: EventType.TOOL_CALL_ARGS, toolCallId, delta: stringify(event.arguments ?? {})}, event);
        } else if (type === 'tool_progress') {
          emit({type: EventType.CUSTOM, name: 'evo.tool_progress', value: sanitizeCowEvent(event, employeeId)}, event);
        } else if (type === 'tool_end') {
          const toolCallId = String(event.tool_call_id ?? 'tool');
          emit({type: EventType.TOOL_CALL_END, toolCallId}, event);
          emit({
            type: EventType.TOOL_CALL_RESULT,
            messageId: `tool-result-${toolCallId}`,
            toolCallId,
            role: 'tool',
            content: stringify(event.display ?? event.result ?? ''),
            status: event.status,
            executionTime: event.execution_time,
            display: event.display,
            permissionDenied: event.permission_denied,
            permissionMode: event.permission_mode,
          }, event);
        } else if (type === 'phase' || type === 'subagent_step') {
          emit({type: EventType.CUSTOM, name: `evo.${type}`, value: sanitizeCowEvent(event, employeeId)}, event);
        } else if (['file', 'image', 'video', 'voice_attach', 'artifact'].includes(type)) {
          emit({type: EventType.RAW, source: 'evo-harness', event: sanitizeCowEvent(event, employeeId)}, event);
        } else if (type === 'cancelled') {
          cancelSeen = true;
          emit({type: EventType.CUSTOM, name: 'evo.cancel_acknowledged', value: sanitizeCowEvent(event, employeeId)}, event);
        } else if (type === 'done') {
          closeReasoning(event);
          const rawContent = String(event.content ?? '');
          const content = publicHarnessMessage(rawContent);
          if (content && !textStarted) {
            startText(event);
            emit({type: EventType.TEXT_MESSAGE_CONTENT, messageId: textMessageId, delta: content}, event);
          }
          endText(event);
          emit({type: EventType.CUSTOM, name: 'evo.done', value: sanitizeCowEvent(event, employeeId)}, event);
          if (rawContent.startsWith('❌')) fail(content, 'EVO_HARNESS_ERROR', event);
        } else if (type === 'resync_required') {
          emit({type: EventType.CUSTOM, name: 'evo.resync_required', value: sanitizeCowEvent(event, employeeId)}, event);
          fail('事件游标已失效，请重试本轮任务', 'RESYNC_REQUIRED', event);
          finish();
        } else if (type === 'error') {
          fail(publicHarnessMessage(String(event.message ?? event.error ?? 'Evo-Harness 执行失败')), 'EVO_HARNESS_ERROR', event);
          finish();
        } else if (type === 'stream_end') {
          closeReasoning(event);
          endText(event);
          if (!runErrored) {
            if (cancelSeen) emit({type: EventType.CUSTOM, name: 'evo.cancelled_final', value: sanitizeCowEvent(event, employeeId)}, event);
            emit({type: EventType.RUN_FINISHED, threadId: requestId, runId: requestId, result: {cancelled: cancelSeen}, outcome: {type: 'success'}}, event);
          }
          finish();
        } else {
          emit({type: EventType.RAW, source: 'evo-harness', event: {kind: 'unknown_event', ...sanitizeCowEvent(event, employeeId)}}, event);
        }
      };

      emit({type: EventType.RUN_STARTED, threadId: requestId, runId: requestId});
      try {
        const reader = upstream.body!.getReader();
        while (!finished) {
          const {done, value} = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, {stream: true});
          const blocks = buffer.split(/\r?\n\r?\n/);
          buffer = blocks.pop() ?? '';
          for (const block of blocks) {
            const event = parseSseBlock(block);
            if (event) handle(event);
          }
        }
        if (!finished && buffer.trim()) {
          const event = parseSseBlock(buffer);
          if (event) handle(event);
        }
        if (!finished) {
          fail('Evo-Harness 事件流在终态前关闭', 'STREAM_CLOSED');
          finish();
        }
      } catch (error) {
        if (!finished) {
          fail(errorMessage(error), 'STREAM_ERROR');
          finish();
        }
      }
    },
  });

  return new Response(stream, {
    headers: {'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive'},
  });
}
