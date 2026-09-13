'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import type {Employee} from '../lib/agents';
import type {AguiEvent, ChatTurn, Classification, InputAttachment, OutputAttachment, ReviewResult, RunStatus, ToolTrace} from '../lib/chat-types';

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseEventBlock(block: string): AguiEvent | null {
  const data = block.split(/\r?\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trimStart()).join('\n');
  if (!data) return null;
  try { return JSON.parse(data) as AguiEvent; } catch { return null; }
}

function patchTool(tools: ToolTrace[], id: string, patch: Partial<ToolTrace>): ToolTrace[] {
  const index = tools.findIndex((tool) => tool.id === id);
  if (index < 0) return [...tools, {id, name: 'tool', status: 'running', arguments: '', progress: '', result: '', substeps: [], ...patch}];
  return tools.map((tool, toolIndex) => toolIndex === index ? {...tool, ...patch} : tool);
}

function outputFromEvent(event: Record<string, unknown>, fallbackId: string): OutputAttachment | null {
  const type = String(event.type ?? 'file');
  const fileType = String(event.file_type ?? '');
  const kind = type === 'artifact' ? 'artifact' : type === 'voice_attach' || fileType === 'audio' ? 'audio' : type === 'image' || fileType === 'image' ? 'image' : type === 'video' || fileType === 'video' ? 'video' : 'file';
  const url = String(event.raw_url ?? event.content ?? event.url ?? '');
  if (!url) return null;
  return {
    id: `${fallbackId}-${type}-${String(event.seq ?? url)}`,
    kind,
    name: String(event.file_name ?? event.rel_path ?? `${kind} attachment`),
    url,
    previewUrl: typeof event.preview_url === 'string' ? event.preview_url : undefined,
    size: typeof event.size === 'number' ? event.size : undefined,
    classification: 'pending',
  };
}

export function useEvoRun(employee: Employee) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [activeRequestId, setActiveRequestId] = useState('');
  const turnsRef = useRef<ChatTurn[]>([]);
  const activeRequestRef = useRef('');
  const abortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef(uid(`mvp-${employee.id}`));

  useEffect(() => { turnsRef.current = turns; }, [turns]);
  useEffect(() => () => abortRef.current?.abort(), []);

  const updateTurn = useCallback((turnId: string, updater: (turn: ChatTurn) => ChatTurn) => {
    setTurns((current) => current.map((turn) => turn.id === turnId ? updater(turn) : turn));
  }, []);

  const handleEvent = useCallback((turnId: string, event: AguiEvent) => {
    updateTurn(turnId, (turn) => {
      if (event.type === 'RUN_STARTED') return {...turn, status: turn.status === 'cancel_requested' ? turn.status : 'running'};
      if (event.type === 'TEXT_MESSAGE_CONTENT') return {...turn, assistant: turn.assistant + (event.delta ?? '')};
      if (event.type === 'REASONING_MESSAGE_CONTENT') return {...turn, reasoning: turn.reasoning + (event.delta ?? '')};
      if (event.type === 'TOOL_CALL_START') return {...turn, tools: patchTool(turn.tools, event.toolCallId ?? 'tool', {name: event.toolCallName ?? 'tool', status: 'running'})};
      if (event.type === 'TOOL_CALL_ARGS') {
        const tool = turn.tools.find((item) => item.id === event.toolCallId);
        return {...turn, tools: patchTool(turn.tools, event.toolCallId ?? 'tool', {arguments: `${tool?.arguments ?? ''}${event.delta ?? ''}`})};
      }
      if (event.type === 'TOOL_CALL_RESULT') {
        const status: ToolTrace['status'] = event.status === 'success' ? 'success' : 'error';
        return {...turn, tools: patchTool(turn.tools, event.toolCallId ?? 'tool', {status, result: event.content ?? '', display: event.display, executionTime: event.executionTime, permissionDenied: event.permissionDenied, permissionMode: event.permissionMode})};
      }
      if (event.type === 'CUSTOM') {
        const value = event.value ?? {};
        if (event.name === 'evo.tool_progress') return {...turn, tools: patchTool(turn.tools, String(value.tool_call_id ?? 'tool'), {progress: String(value.content ?? '')})};
        if (event.name === 'evo.subagent_step') {
          const cardId = String(value.card_id ?? 'subagent');
          const tool = turn.tools.find((item) => item.id === cardId);
          const stepId = String(value.step_id ?? uid('step'));
          const steps = [...(tool?.substeps ?? [])];
          const stepIndex = steps.findIndex((step) => step.id === stepId);
          const step = {id: stepId, tool: String(value.tool ?? 'tool'), phase: String(value.phase ?? ''), status: typeof value.status === 'string' ? value.status : undefined, arguments: value.arguments, error: typeof value.error === 'string' ? value.error : undefined, executionTime: typeof value.execution_time === 'number' ? value.execution_time : undefined};
          if (stepIndex < 0) steps.push(step); else steps[stepIndex] = step;
          return {...turn, tools: patchTool(turn.tools, cardId, {name: tool?.name ?? 'subagent', substeps: steps})};
        }
        if (event.name === 'evo.phase') {
          const phase = String(value.content ?? '执行阶段更新');
          return {...turn, phases: turn.phases.includes(phase) ? turn.phases : [...turn.phases, phase]};
        }
        if (event.name === 'evo.text' || event.name === 'evo.done') {
          const content = String(value.content ?? '');
          return content ? {...turn, assistant: content} : turn;
        }
        if (event.name === 'evo.cancel_acknowledged') return {...turn, status: 'cancel_requested'};
        if (event.name === 'evo.cancelled_final') return {...turn, status: 'cancelled'};
        return turn;
      }
      if (event.type === 'RAW') {
        const raw = event.event ?? {};
        if (raw.kind === 'unknown_event') return {...turn, unknownEvents: [...turn.unknownEvents, raw]};
        const attachment = outputFromEvent(raw, turn.id);
        return attachment ? {...turn, attachments: [...turn.attachments, attachment]} : turn;
      }
      if (event.type === 'RUN_FINISHED') return {...turn, status: event.result?.cancelled ? 'cancelled' : 'completed'};
      if (event.type === 'RUN_ERROR') return {...turn, status: 'failed', error: event.message ?? '执行失败'};
      return turn;
    });
  }, [updateTurn]);

  const consumeStream = useCallback(async (turnId: string, requestId: string, signal: AbortSignal) => {
    let afterSeq = 0;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(`/api/cow/stream?requestId=${encodeURIComponent(requestId)}&employeeId=${encodeURIComponent(employee.id)}&afterSeq=${afterSeq}`, {signal});
        if (!response.ok || !response.body) {
          const payload = await response.json().catch(() => ({})) as {error?: string};
          throw new Error(payload.error ?? `事件流连接失败（HTTP ${response.status}）`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let terminal = false;
        while (!terminal) {
          const {done, value} = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, {stream: true});
          const blocks = buffer.split(/\r?\n\r?\n/);
          buffer = blocks.pop() ?? '';
          for (const block of blocks) {
            const event = parseEventBlock(block);
            if (!event) continue;
            if (event.providerSeq) afterSeq = Math.max(afterSeq, event.providerSeq);
            handleEvent(turnId, event);
            terminal = event.type === 'RUN_FINISHED' || event.type === 'RUN_ERROR';
          }
        }
        if (terminal) return;
        throw new Error('事件流意外断开');
      } catch (error) {
        if (signal.aborted) return;
        if (attempt < 2) {
          updateTurn(turnId, (turn) => ({...turn, status: 'reconnecting'}));
          await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
          continue;
        }
        updateTurn(turnId, (turn) => ({...turn, status: 'failed', error: error instanceof Error ? error.message : '事件流连接失败'}));
      }
    }
  }, [employee.id, handleEvent, updateTurn]);

  const startRequest = useCallback(async (turnId: string, message: string, attachments: InputAttachment[], reviewConfirmed: boolean) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setActiveRequestId(turnId);
    try {
      const response = await fetch('/api/cow/message', {method: 'POST', headers: {'content-type': 'application/json'}, signal: controller.signal, body: JSON.stringify({sessionId: sessionIdRef.current, employeeId: employee.id, message, attachments, reviewConfirmed})});
      const payload = await response.json() as {status?: string; requestId?: string; review?: ReviewResult; error?: string};
      if (!response.ok) throw new Error(payload.error ?? '任务提交失败');
      if (payload.status === 'deny' && payload.review) {
        updateTurn(turnId, (turn) => ({...turn, status: 'blocked', review: payload.review, error: payload.review?.summary}));
        return;
      }
      if (payload.status === 'confirm' && payload.review) {
        updateTurn(turnId, (turn) => ({...turn, status: 'awaiting_confirmation', review: payload.review}));
        return;
      }
      if (!payload.requestId) throw new Error('Evo-Harness 未返回运行标识');
      activeRequestRef.current = payload.requestId;
      setActiveRequestId(payload.requestId);
      updateTurn(turnId, (turn) => ({...turn, requestId: payload.requestId, review: payload.review ?? turn.review, status: 'running'}));
      await consumeStream(turnId, payload.requestId, controller.signal);
    } catch (error) {
      if (!controller.signal.aborted) updateTurn(turnId, (turn) => ({...turn, status: 'failed', error: error instanceof Error ? error.message : '任务提交失败'}));
    } finally {
      activeRequestRef.current = '';
      setActiveRequestId('');
    }
  }, [consumeStream, employee.id, updateTurn]);

  const send = useCallback(async (message: string, attachments: InputAttachment[] = []) => {
    const content = message.trim();
    if (!content || activeRequestId) return;
    const turnId = uid('turn');
    setTurns((current) => [...current, {id: turnId, user: content, assistant: '', reasoning: '', phases: [], tools: [], inputAttachments: attachments, attachments: [], unknownEvents: [], status: 'reviewing'}]);
    await startRequest(turnId, content, attachments, false);
  }, [activeRequestId, startRequest]);

  const confirmReview = useCallback(async (turnId: string) => {
    const turn = turnsRef.current.find((item) => item.id === turnId);
    if (!turn || turn.status !== 'awaiting_confirmation') return;
    updateTurn(turnId, (current) => ({...current, status: 'connecting'}));
    await startRequest(turnId, turn.user, turn.inputAttachments, true);
  }, [startRequest, updateTurn]);

  const cancelReview = useCallback((turnId: string) => {
    updateTurn(turnId, (turn) => ({...turn, status: 'cancelled'}));
  }, [updateTurn]);

  const classifyArtifact = useCallback((turnId: string, artifactId: string, classification: Classification) => {
    updateTurn(turnId, (turn) => ({...turn, attachments: turn.attachments.map((attachment) => attachment.id === artifactId ? {...attachment, classification} : attachment)}));
  }, [updateTurn]);

  const cancel = useCallback(async () => {
    const requestId = activeRequestRef.current;
    if (!requestId) {
      abortRef.current?.abort();
      setTurns((current) => current.map((turn) => ['reviewing', 'connecting', 'reconnecting'].includes(turn.status) ? {...turn, status: 'cancelled' as RunStatus} : turn));
      setActiveRequestId('');
      return;
    }
    setTurns((current) => current.map((turn) => turn.requestId === requestId ? {...turn, status: 'cancel_requested' as RunStatus} : turn));
    await fetch('/api/cow/cancel', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({requestId, employeeId: employee.id})}).catch(() => undefined);
  }, [employee.id]);

  return {turns, activeRequestId, sessionId: sessionIdRef.current, send, cancel, confirmReview, cancelReview, classifyArtifact};
}
