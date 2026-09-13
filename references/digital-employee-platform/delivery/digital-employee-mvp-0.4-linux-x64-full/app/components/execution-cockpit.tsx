'use client';

import {BookOpen, Brain, Bug, Check, ChevronDown, CircleDot, Eye, FileSearch, FileText, PenTool, Route, Search, ShieldCheck, Terminal, Users, Workflow, X} from 'lucide-react';
import {useMemo, useState} from 'react';
import type {Employee, EmployeeCapability} from '../lib/agents';
import type {ChatTurn, ToolTrace} from '../lib/chat-types';
import {toolDisplay} from '../lib/tool-display';
import {cn} from '../lib/utils';
import {Badge} from './ui/badge';
import {Button} from './ui/button';
import {ToolIcon} from './tool-icon';
import {StatusSpinner} from './ui/status-spinner';

const capabilityIcons = {Search, Brain, FileText, Terminal, FileSearch, Workflow, BookOpen, PenTool, Eye, Bug, Route, ShieldCheck, Users};
const runLabels: Record<string, string> = {reviewing: '审查中', awaiting_confirmation: '待确认', blocked: '已阻止', connecting: '连接中', running: '执行中', reconnecting: '重连中', completed: '已完成', failed: '失败', cancelled: '已取消', cancel_requested: '停止中'};
type TimelineStatus = 'running' | 'success' | 'error' | 'warning' | 'neutral' | 'artifact';
type TimelineEvent = {id: string; status: TimelineStatus; title: string; detail: string; icon?: string};

export function ExecutionCockpit({employee, turns, compact = false}: {employee: Employee; turns: ChatTurn[]; compact?: boolean}) {
  const [showAllCapabilities, setShowAllCapabilities] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const latest = turns.at(-1);
  const events = useMemo(() => latest ? timelineEvents(latest) : [], [latest]);
  const visibleCapabilities = showAllCapabilities ? employee.capabilities : employee.capabilities.slice(0, 4);
  const visibleEvents = showAllEvents ? events : events.slice(-10);

  const body = <div className={cn('flex min-h-0 flex-col', compact ? 'gap-5' : 'h-full')}>
    <section className="max-h-[244px] shrink-0 overflow-y-auto border-b bg-white p-4">
      <div className="mb-3 flex items-center justify-between"><p className="text-[10px] font-bold uppercase text-muted-foreground">能力配置</p><span className="text-[9px] text-muted-foreground">{employee.capabilities.length} 项</span></div>
      <div className="grid grid-cols-2 gap-2">{visibleCapabilities.map((capability) => <Capability key={capability.id} capability={capability} />)}</div>
      {employee.capabilities.length > 4 && <Button className="mt-2 h-7 w-full text-[10px]" variant="ghost" size="sm" onClick={() => setShowAllCapabilities((value) => !value)}>{showAllCapabilities ? '收起能力' : '查看全部能力'}<ChevronDown className={cn('transition-transform', showAllCapabilities && 'rotate-180')} size={12} /></Button>}
    </section>
    <section className={cn('flex min-h-0 flex-1 flex-col p-4', compact && 'max-h-72')}>
      <div className="mb-3 flex shrink-0 items-center justify-between"><p className="text-[10px] font-bold uppercase text-muted-foreground">本轮任务进度</p>{latest && <RunBadge turn={latest} />}</div>
      {!latest ? <div className="grid min-h-28 place-items-center rounded-md border border-dashed bg-white text-center text-xs text-muted-foreground"><div><CircleDot className="mx-auto mb-2 text-blue-500" size={17} />等待任务</div></div> : <div className="min-h-0 flex-1 overflow-y-auto pr-1"><div className="grid gap-2">{events.length > 10 && <Button className="h-7 text-[10px]" variant="ghost" size="sm" onClick={() => setShowAllEvents((value) => !value)}>{showAllEvents ? '只看最近进度' : `查看更早的 ${events.length - 10} 条记录`}</Button>}{visibleEvents.map((event) => <TimelineItem key={event.id} event={event} />)}</div></div>}
    </section>
  </div>;

  if (compact) return body;
  return <aside className="flex h-full min-h-0 flex-col overflow-hidden border-l bg-slate-50"><div className="relative flex h-16 shrink-0 items-center overflow-hidden border-b bg-white px-4"><span className="absolute inset-y-0 left-0 w-1 bg-cyan-500" /><div><strong className="text-sm text-slate-950">实时执行中心</strong><p className="text-[10px] text-muted-foreground">能力调用与任务进度</p></div><div className="ml-auto flex items-center gap-1.5"><i className="size-2.5 rounded-sm bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,.10)]" /><i className="size-2.5 rounded-sm bg-fuchsia-500 shadow-[0_0_0_3px_rgba(217,70,239,.10)]" /><i className="size-2.5 rounded-sm bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,.10)]" /></div></div><div className="min-h-0 flex-1">{body}</div></aside>;
}

function Capability({capability}: {capability: EmployeeCapability}) {
  const Icon = capabilityIcons[capability.icon as keyof typeof capabilityIcons] ?? FileText;
  const styles = {tool: 'border-blue-200 bg-blue-50 text-blue-700', skill: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700', knowledge: 'border-emerald-200 bg-emerald-50 text-emerald-700'};
  const labels = {tool: '原子能力', skill: 'Skill', knowledge: '知识'};
  return <div className={cn('grid min-h-20 content-between rounded-md border p-3', styles[capability.kind])}><Icon size={17} /><div className="min-w-0"><strong className="block truncate text-xs text-slate-900">{capability.name}</strong><span className="text-[9px]">{labels[capability.kind]}</span></div></div>;
}

function RunBadge({turn}: {turn: ChatTurn}) {
  const styles: Record<string, string> = {reviewing: 'border-blue-200 bg-blue-50 text-blue-700', running: 'border-blue-200 bg-blue-50 text-blue-700', awaiting_confirmation: 'border-amber-200 bg-amber-50 text-amber-800', blocked: 'border-red-200 bg-red-50 text-red-700', failed: 'border-red-200 bg-red-50 text-red-700', completed: 'border-emerald-200 bg-emerald-50 text-emerald-700', cancelled: 'border-orange-200 bg-orange-50 text-orange-700', cancel_requested: 'border-orange-200 bg-orange-50 text-orange-700'};
  return <Badge variant="outline" className={styles[turn.status]}>{runLabels[turn.status] ?? turn.status}</Badge>;
}

function timelineEvents(turn: ChatTurn): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const reviewStatus: TimelineStatus = turn.status === 'reviewing' ? 'running' : turn.review?.decision === 'deny' ? 'error' : turn.review?.decision === 'confirm' ? 'warning' : 'success';
  events.push({id: 'review', status: reviewStatus, title: '安全审查员工', detail: turn.status === 'reviewing' ? '正在检查任务内容与附件范围' : turn.review ? `${turn.review.summary}${turn.review.trace ? ` · ${(turn.review.trace.durationMs / 1000).toFixed(1)}s` : ''}` : '审查通过，进入业务执行'});
  turn.phases.forEach((phase, index) => events.push({id: `phase-${index}`, status: 'success', title: '阶段更新', detail: phase}));
  turn.tools.forEach((tool) => events.push(toolEvent(tool)));
  turn.attachments.forEach((file) => events.push({id: `file-${file.id}`, status: 'artifact', title: '生成任务产物', detail: file.name}));
  if (turn.unknownEvents.length) events.push({id: 'unknown', status: 'neutral', title: '兼容事件', detail: `${turn.unknownEvents.length} 条未识别事件已保留`});
  const terminal = terminalEvent(turn);
  if (terminal) events.push(terminal);
  return events;
}

function toolEvent(tool: ToolTrace): TimelineEvent {
  const display = toolDisplay(tool.name);
  const status: TimelineStatus = tool.status === 'running' ? 'running' : tool.status === 'error' ? 'error' : 'success';
  const detail = tool.status === 'running' ? tool.progress || '正在执行' : tool.status === 'error' ? tool.display || tool.result || '执行失败' : tool.display || tool.result || '执行完成';
  return {id: `tool-${tool.id}`, status, title: display.label, detail: detail.slice(0, 120), icon: display.icon};
}

function terminalEvent(turn: ChatTurn): TimelineEvent | null {
  if (turn.status === 'completed') return {id: 'terminal', status: 'success', title: '任务完成', detail: '结果已返回工作台'};
  if (turn.status === 'failed') return {id: 'terminal', status: 'error', title: '执行失败', detail: turn.error ?? 'Evo-Harness 执行失败'};
  if (turn.status === 'blocked') return {id: 'terminal', status: 'error', title: '任务已阻止', detail: turn.review?.summary ?? '安全审查未通过'};
  if (turn.status === 'cancelled') return {id: 'terminal', status: 'warning', title: '任务已取消', detail: '本轮执行已经停止'};
  if (turn.status === 'cancel_requested') return {id: 'terminal', status: 'warning', title: '正在停止', detail: '等待当前步骤响应取消请求'};
  return null;
}

function TimelineItem({event}: {event: TimelineEvent}) {
  const styles: Record<TimelineStatus, string> = {running: 'border-blue-200 bg-blue-50 text-blue-700', success: 'border-emerald-200 bg-emerald-50 text-emerald-700', error: 'border-red-200 bg-red-50 text-red-700', warning: 'border-amber-200 bg-amber-50 text-amber-800', neutral: 'border-slate-200 bg-white text-slate-500', artifact: 'border-cyan-200 bg-cyan-50 text-cyan-700'};
  return <div className={cn('grid grid-cols-[22px_minmax(0,1fr)] gap-2 rounded-md border p-2.5', styles[event.status])}><span className="mt-0.5 grid size-5 place-items-center rounded-full bg-white/80">{event.icon ? <ToolIcon name={event.icon} size={13} /> : event.status === 'running' ? <StatusSpinner size={13} /> : event.status === 'error' ? <X size={13} /> : event.status === 'neutral' ? <CircleDot size={12} /> : <Check size={13} />}</span><div className="min-w-0"><strong className="block truncate text-[11px] text-slate-900">{event.title}</strong><p className="mt-0.5 line-clamp-3 break-words text-[10px] leading-4 text-slate-600">{event.detail}</p></div></div>;
}
