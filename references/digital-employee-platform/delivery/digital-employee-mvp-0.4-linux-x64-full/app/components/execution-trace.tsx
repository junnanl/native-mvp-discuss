'use client';

import {AlertCircle, Check, ChevronRight, CircleDot, ShieldAlert, X} from 'lucide-react';
import type {ChatTurn, ToolTrace} from '../lib/chat-types';
import {toolDisplay} from '../lib/tool-display';
import {cn} from '@/lib/utils';
import {ToolIcon} from './tool-icon';
import {StatusSpinner} from './ui/status-spinner';

export function ExecutionTrace({turn}: {turn: ChatTurn}) {
  const hasTrace = Boolean(turn.tools.length || turn.phases.length || turn.unknownEvents.length);
  if (!hasTrace) return null;
  return (
    <div className="mb-3 grid gap-2">
      {turn.phases.map((phase) => <div className="flex items-center gap-2 px-1 py-0.5 text-[11px] text-muted-foreground" key={phase}><CircleDot size={13} /><span>{phase}</span></div>)}
      {turn.tools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
      {turn.unknownEvents.map((event, index) => (
        <details className="overflow-hidden rounded-md border bg-card" key={`${String(event.type)}-${index}`}>
          <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs text-muted-foreground"><AlertCircle size={14} />兼容事件：{String(event.type ?? 'unknown')}</summary>
          <pre className="max-h-72 overflow-auto border-t bg-muted/50 p-3 font-mono text-[11px] leading-5 whitespace-pre-wrap break-words text-muted-foreground">{JSON.stringify(event, null, 2)}</pre>
        </details>
      ))}
    </div>
  );
}

function ToolCard({tool}: {tool: ToolTrace}) {
  const isRunning = tool.status === 'running';
  const isFailed = tool.status === 'error';
  const display = toolDisplay(tool.name);
  return (
    <details className={cn('group overflow-hidden rounded-md border bg-card', isFailed && 'border-red-200')} open={isRunning || isFailed || tool.permissionDenied}>
      <summary className={cn('flex min-h-9 cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs text-muted-foreground', isRunning && 'text-blue-700', isFailed && 'text-destructive')}>
        <span className={cn('grid size-[18px] place-items-center rounded-full bg-emerald-100 text-emerald-700', isRunning && 'bg-blue-100 text-blue-700', isFailed && 'bg-red-100 text-destructive')}>
          {isRunning ? <StatusSpinner size={15} /> : isFailed ? <X size={15} /> : <Check size={15} />}
        </span>
        <ToolIcon name={display.icon} />
        <strong className="text-foreground">{display.label}</strong>
        <span className="text-[9px] text-muted-foreground" title="Evo-Harness 原始工具名">{tool.name}</span>
        {tool.executionTime !== undefined && <span className="text-[10px] text-muted-foreground">{tool.executionTime.toFixed(2)}s</span>}
        <ChevronRight className="ml-auto transition-transform group-open:rotate-90" size={14} />
      </summary>
      <div className="grid border-t">
        <TraceSection label="Input" content={tool.arguments || '{}'} />
        {tool.progress && <TraceSection label="Progress" content={tool.progress} />}
        {tool.substeps.length > 0 && (
          <section className="min-w-0 p-3">
            <span className="mb-2 block text-[10px] font-bold uppercase text-muted-foreground">Steps</span>
            <div className="grid gap-2">
              {tool.substeps.map((step) => (
                <div className={cn('grid grid-cols-[15px_auto_minmax(0,1fr)_auto] items-center gap-2 text-[10px] text-muted-foreground', step.status && step.status !== 'success' && 'text-destructive')} key={step.id}>
                  {step.phase === 'start' ? <StatusSpinner size={13} /> : step.status === 'success' ? <Check size={13} /> : <X size={13} />}
                  <strong className="text-foreground">{toolDisplay(step.tool).label}</strong>
                  <span className="truncate">{step.error || summarize(step.arguments)}</span>
                  {step.executionTime ? <time className="text-muted-foreground">{step.executionTime.toFixed(2)}s</time> : null}
                </div>
              ))}
            </div>
          </section>
        )}
        {(tool.display || tool.result) && <TraceSection label={isFailed ? 'Error' : 'Output'} content={tool.display || tool.result} prose={Boolean(tool.display)} />}
        {tool.permissionDenied && (
          <div className="mx-3 mb-3 flex items-center gap-2 rounded-md bg-amber-50 p-2.5 text-[11px] text-amber-800"><ShieldAlert size={15} /><span>当前权限模式拒绝了该工具调用{tool.permissionMode ? `（${tool.permissionMode}）` : ''}</span></div>
        )}
      </div>
    </details>
  );
}

function TraceSection({label, content, prose = false}: {label: string; content: string; prose?: boolean}) {
  return <section className="min-w-0 border-b p-3 last:border-b-0"><span className="mb-2 block text-[10px] font-bold uppercase text-muted-foreground">{label}</span>{prose ? <div className="whitespace-pre-wrap break-words text-xs leading-5 text-muted-foreground">{content}</div> : <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 font-mono text-[11px] leading-5 whitespace-pre-wrap break-words text-slate-600">{content}</pre>}</section>;
}

function summarize(value: unknown) {
  if (!value) return '';
  try {
    const text = JSON.stringify(value);
    return text.length > 100 ? `${text.slice(0, 100)}...` : text;
  } catch {
    return String(value);
  }
}
