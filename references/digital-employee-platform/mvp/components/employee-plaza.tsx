'use client';

import {ArrowRight, ArrowUpRight, BrainCircuit, Check, Circle, LocateFixed, RotateCcw, Search, Sparkles} from 'lucide-react';
import {useEffect, useMemo, useState} from 'react';
import type {Employee} from '../lib/agents';
import {cn} from '../lib/utils';
import {Avatar, AvatarFallback, AvatarImage} from './ui/avatar';
import {Badge} from './ui/badge';
import {Button} from './ui/button';
import {Card, CardContent, CardFooter} from './ui/card';
import {Input} from './ui/input';
import {Textarea} from './ui/textarea';
import {StatusSpinner} from './ui/status-spinner';

type Recommendation = {primaryEmployeeId: string; candidateEmployeeIds: string[]; reason: string};
type DispatchTrace = {requestId: string; durationMs: number; phases: string[]; tools: string[]};

const stages = ['理解需求', '匹配员工', '准备推荐'];
const categoryOrder = ['办公协作', '产品设计', '技术工程', '数据智能'];

export function EmployeePlaza({employees, dispatchQuestions, onSelect}: {
  employees: Employee[];
  dispatchQuestions: string[];
  onSelect: (employee: Employee, draft?: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('全部');
  const [task, setTask] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [stage, setStage] = useState(0);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [trace, setTrace] = useState<DispatchTrace | null>(null);
  const [dispatchError, setDispatchError] = useState('');

  useEffect(() => {
    if (!dispatching) return;
    const timer = window.setInterval(() => setStage((current) => Math.min(current + 1, stages.length - 1)), 1800);
    return () => window.clearInterval(timer);
  }, [dispatching]);

  const categories = useMemo(() => {
    const available = new Set(employees.map((employee) => employee.category));
    const ordered = categoryOrder.filter((item) => available.has(item));
    const custom = [...available].filter((item) => !categoryOrder.includes(item)).sort();
    return ['全部', ...ordered, ...custom];
  }, [employees]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return employees.filter((employee) => {
      if (category !== '全部' && employee.category !== category) return false;
      return !keyword || [employee.title, employee.category, employee.description, ...employee.tags].join(' ').toLowerCase().includes(keyword);
    });
  }, [category, employees, search]);

  async function dispatch() {
    const content = task.trim();
    if (!content || dispatching) return;
    setDispatching(true);
    setStage(0);
    setDispatchError('');
    setRecommendation(null);
    setTrace(null);
    try {
      const response = await fetch('/api/dispatch', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({task: content}),
      });
      const payload = await response.json() as {recommendation?: Recommendation; trace?: DispatchTrace; error?: string};
      if (!response.ok || !payload.recommendation) throw new Error(payload.error ?? '暂时无法自动推荐');
      setStage(stages.length - 1);
      setRecommendation(payload.recommendation);
      setTrace(payload.trace ?? null);
      const primary = employees.find((employee) => employee.id === payload.recommendation?.primaryEmployeeId);
      if (primary) setCategory(primary.category);
    } catch (error) {
      setDispatchError(error instanceof Error ? error.message : '暂时无法自动推荐');
    } finally {
      setDispatching(false);
    }
  }

  function resetDispatch() {
    setRecommendation(null);
    setDispatchError('');
    setTrace(null);
    setStage(0);
  }

  function focusRecommendation() {
    if (!recommendation) return;
    document.getElementById(`employee-${recommendation.primaryEmployeeId}`)?.scrollIntoView({behavior: 'smooth', block: 'center'});
  }

  return (
    <main className="min-h-screen pb-16">
      <header className="flex h-[58px] items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur sm:px-7">
        <div className="flex items-center gap-2.5 text-xs font-semibold uppercase text-muted-foreground"><span className="grid size-8 place-items-center rounded-md bg-foreground text-[11px] text-background">DE</span><span>Digital Employee</span></div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground"><span className="size-2 rounded-full bg-emerald-600" />Evo-Harness · 本地运行</div>
      </header>

      <section className="mx-auto grid max-w-[1180px] gap-7 px-4 pb-9 pt-10 sm:px-7 lg:grid-cols-[minmax(0,1.18fr)_minmax(350px,.82fr)] lg:items-center lg:pt-14">
        <div><p className="mb-3 flex items-center gap-2 text-xs font-bold text-blue-700"><Sparkles size={14} />任务调度台</p><h1 className="max-w-2xl font-serif text-[clamp(2.35rem,5vw,3.7rem)] font-semibold leading-[1.08]">说清目标，合适的员工来接手。</h1><p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">描述你要完成的事情，任务经理会理解需求并从当前数字员工中给出推荐。</p></div>
        <Card className="min-h-[350px] overflow-hidden border-slate-300 shadow-[0_18px_44px_rgba(32,42,58,.12)]">
          <CardContent className="grid gap-3 p-4">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground"><BrainCircuit size={15} />一句话指派</div>
            <Textarea className="min-h-20 resize-none border-0 bg-muted/70 p-3 text-sm shadow-none focus-visible:ring-1" value={task} onChange={(event) => setTask(event.target.value)} placeholder="例如：比较两套方案，整理关键差异并给出选择建议" disabled={dispatching} />
            <div className="h-[174px] overflow-hidden">
              {dispatching ? <DispatchProgress stage={stage} /> : recommendation ? <DispatchSuccess recommendation={recommendation} trace={trace} onFocus={focusRecommendation} onReset={resetDispatch} /> : dispatchError ? <DispatchFailure error={dispatchError} onReset={resetDispatch} /> : <DispatchIdle questions={dispatchQuestions} task={task} onQuestion={setTask} onDispatch={() => void dispatch()} />}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto mb-5 flex max-w-[1180px] flex-col gap-4 px-4 sm:px-7 md:flex-row md:items-center md:justify-between" aria-label="员工筛选">
        <div className="flex flex-wrap gap-1.5">{categories.map((item) => <Button key={item} size="sm" variant={category === item ? 'default' : 'outline'} onClick={() => setCategory(item)}>{item}</Button>)}</div>
        <label className="relative block w-full md:w-72"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><span className="sr-only">搜索数字员工</span><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索岗位或能力" /></label>
      </section>

      {filtered.length === 0 ? <div className="mx-auto mt-5 grid max-w-[1124px] justify-items-center gap-2 border border-dashed p-14 text-sm text-muted-foreground"><Search size={20} /><strong className="text-foreground">没有找到匹配的数字员工</strong></div> : <section className="mx-auto grid max-w-[1180px] grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-7 lg:grid-cols-4" aria-label="数字员工列表">{filtered.map((employee, index) => <EmployeeCard key={employee.id} employee={employee} index={index} primary={recommendation?.primaryEmployeeId === employee.id} candidate={recommendation?.candidateEmployeeIds.includes(employee.id) ?? false} reason={recommendation?.primaryEmployeeId === employee.id ? recommendation.reason : ''} onSelect={() => onSelect(employee, task.trim())} />)}</section>}
    </main>
  );
}

function DispatchIdle({questions, task, onQuestion, onDispatch}: {questions: string[]; task: string; onQuestion: (question: string) => void; onDispatch: () => void}) {
  return <div className="grid h-full grid-rows-[1fr_1fr_auto] gap-2">{questions.slice(0, 2).map((question) => <button key={question} className="flex min-w-0 items-center rounded-md border bg-background px-3 text-left text-[11px] text-muted-foreground transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => onQuestion(question)}><span className="truncate">{question}</span><ArrowRight className="ml-auto shrink-0" size={13} /></button>)}<Button className="w-full" onClick={onDispatch} disabled={!task.trim()}>帮我指派<ArrowRight size={15} /></Button></div>;
}

function DispatchProgress({stage}: {stage: number}) {
  const nodeStyles = ['border-blue-500 bg-blue-500 text-white', 'border-fuchsia-500 bg-fuchsia-500 text-white', 'border-emerald-500 bg-emerald-500 text-white'];
  const textStyles = ['text-blue-700', 'text-fuchsia-700', 'text-emerald-700'];
  return <div className="grid h-full grid-cols-[42px_minmax(0,1fr)] gap-3 rounded-md border border-blue-200 bg-blue-50/60 p-4" role="status">
    <span className="relative mt-1 grid size-10 place-items-center rounded-full border border-blue-300 bg-white text-blue-700"><span className="absolute inset-0 rounded-full border border-blue-400 motion-safe:animate-ping" /><BrainCircuit className="motion-safe:animate-pulse" size={19} /></span>
    <div><strong className="block text-xs">任务经理正在调度</strong><ol className="mt-2 grid">{stages.map((label, index) => {
      const completed = index < stage;
      const active = index === stage;
      return <li className="relative flex h-10 items-start gap-3" key={label}>{index < stages.length - 1 && <span className={cn('absolute left-[11px] top-6 h-5 w-0.5 bg-slate-200', completed && 'bg-blue-400')} />}<span className={cn('relative z-10 grid size-6 shrink-0 place-items-center rounded-full border bg-white text-slate-400 transition duration-500', (completed || active) && nodeStyles[index], active && 'shadow-[0_0_0_4px_rgba(59,130,246,.12)]')}>{completed ? <Check size={13} /> : active ? <StatusSpinner size={13} /> : <Circle size={9} />}</span><span className={cn('pt-1 text-[11px] text-muted-foreground', (completed || active) && textStyles[index], active && 'font-bold')}>{label}</span></li>;
    })}</ol></div>
  </div>;
}

function DispatchSuccess({recommendation, trace, onFocus, onReset}: {recommendation: Recommendation; trace: DispatchTrace | null; onFocus: () => void; onReset: () => void}) {
  return <div className="grid h-full content-between rounded-md border border-emerald-200 bg-emerald-50 p-4"><div><div className="flex items-center justify-between text-emerald-800"><strong className="flex items-center gap-2 text-xs"><span className="grid size-6 place-items-center rounded-full bg-emerald-500 text-white"><Check size={14} /></span>已完成员工匹配</strong>{trace && <span className="text-[10px]">{(trace.durationMs / 1000).toFixed(1)}s</span>}</div><p className="mt-3 line-clamp-3 text-xs leading-5 text-emerald-950">{recommendation.reason}</p></div><div className="grid grid-cols-[1fr_auto] gap-2"><Button size="sm" onClick={onFocus}><LocateFixed size={14} />查看推荐员工</Button><Button size="sm" variant="outline" onClick={onReset}><RotateCcw size={14} />重新指派</Button></div></div>;
}

function DispatchFailure({error, onReset}: {error: string; onReset: () => void}) {
  return <div className="grid h-full content-between rounded-md border border-red-200 bg-red-50 p-4"><div><strong className="text-xs text-red-800">自动指派暂时不可用</strong><p className="mt-2 line-clamp-3 text-xs leading-5 text-red-700">{error}。你可以重新尝试，或直接从员工广场选择。</p></div><Button size="sm" variant="outline" className="border-red-200 bg-white text-red-700 hover:bg-red-100" onClick={onReset}><RotateCcw size={14} />重新指派</Button></div>;
}

function EmployeeCard({employee, index, primary, candidate, reason, onSelect}: {employee: Employee; index: number; primary: boolean; candidate: boolean; reason: string; onSelect: () => void}) {
  return <Card id={`employee-${employee.id}`} className={cn('group min-w-0 overflow-hidden shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg', candidate && 'border-blue-300 shadow-md', primary && 'ring-2 ring-blue-600 ring-offset-2')} style={{'--accent': employee.accent, '--accent-soft': employee.accentSoft, animationDelay: `${index * 70}ms`} as React.CSSProperties}><button className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={onSelect} aria-label={`进入${employee.title}工作台`}><div className="relative m-2.5 h-[116px] rounded-md bg-[var(--accent-soft)]"><Avatar className="absolute bottom-0 left-2 h-[138px] w-[108px] rounded-none bg-transparent"><AvatarImage className="object-contain object-bottom" src={employee.avatar} alt="" /><AvatarFallback className="rounded-md bg-background/60 text-2xl">{employee.title.slice(0, 1)}</AvatarFallback></Avatar><Badge className="absolute right-2.5 top-2.5 gap-1.5 bg-background/90 text-[10px] text-muted-foreground">{primary ? '首选推荐' : employee.category}</Badge><ArrowUpRight className="absolute bottom-3 right-3 text-[var(--accent)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" size={18} /></div><CardContent className="min-h-[172px] px-4 pb-3 pt-2"><p className="mb-1 text-[11px] font-bold text-[var(--accent)]">{employee.category}</p><h2 className="font-serif text-2xl font-semibold">{employee.title}</h2><p className="mb-3 mt-2 min-h-12 text-xs leading-5 text-muted-foreground">{reason || employee.description}</p><div className="flex flex-wrap gap-1.5">{employee.tags.slice(0, 3).map((tag) => <Badge key={tag}>{tag}</Badge>)}</div></CardContent><CardFooter className="min-h-12 gap-4 border-t px-4 py-3 text-[10px] text-muted-foreground"><span className="grid gap-0.5"><small>成熟度</small><b className="text-xs text-foreground">{employee.maturity}</b></span><span className="grid gap-0.5"><small>版本</small><b className="text-xs text-foreground">{employee.version}</b></span><span className="ml-auto font-semibold text-[var(--accent)]">进入工作台</span></CardFooter></button></Card>;
}
