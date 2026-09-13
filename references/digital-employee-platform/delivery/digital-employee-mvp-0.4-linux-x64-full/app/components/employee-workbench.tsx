'use client';

import {ArrowLeft, FileUp, PanelRight, Send, Square, Trash2, Wifi} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';
import {useEvoRun} from '../hooks/use-evo-run';
import type {Employee} from '../lib/agents';
import type {Classification, InputAttachment} from '../lib/chat-types';
import {ExecutionCockpit} from './execution-cockpit';
import {MessageThread} from './message-thread';
import {Avatar, AvatarFallback, AvatarImage} from './ui/avatar';
import {Button} from './ui/button';
import {ScrollArea} from './ui/scroll-area';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {Textarea} from './ui/textarea';
import {StatusSpinner} from './ui/status-spinner';

type DraftAttachment = {id: string; file: File; classification?: Classification};

export function EmployeeWorkbench({employee, initialDraft = '', onBack}: {employee: Employee; initialDraft?: string; onBack: () => void}) {
  const [draft, setDraft] = useState(initialDraft);
  const [draftAttachments, setDraftAttachments] = useState<DraftAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [mobilePanel, setMobilePanel] = useState<'none' | 'prompts' | 'cockpit'>('none');
  const {turns, activeRequestId, sessionId, send, cancel, confirmReview, cancelReview, classifyArtifact} = useEvoRun(employee);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRunning = Boolean(activeRequestId) || uploading;

  useEffect(() => { const node = scrollRef.current; if (node) node.scrollTo({top: node.scrollHeight, behavior: 'smooth'}); }, [turns]);

  async function submit(value = draft) {
    const message = value.trim();
    if (!message || isRunning) return;
    if (draftAttachments.some((attachment) => !attachment.classification)) { setUploadError('请先为每个附件选择公开、受控或内部'); return; }
    setUploading(true); setUploadError('');
    try {
      const attachments = await Promise.all(draftAttachments.map(async (attachment): Promise<InputAttachment> => {
        const form = new FormData(); form.set('file', attachment.file); form.set('classification', attachment.classification!); form.set('sessionId', sessionId); form.set('employeeId', employee.id);
        const response = await fetch('/api/cow/upload', {method: 'POST', body: form});
        const payload = await response.json() as {attachment?: InputAttachment; error?: string};
        if (!response.ok || !payload.attachment) throw new Error(payload.error ?? `${attachment.file.name} 上传失败`);
        return payload.attachment;
      }));
      setDraft(''); setDraftAttachments([]); await send(message, attachments);
    } catch (error) { setUploadError(error instanceof Error ? error.message : '附件上传失败'); } finally { setUploading(false); }
  }

  return <main className="flex h-screen min-h-[580px] flex-col bg-background" style={{'--employee-accent': employee.accent, '--employee-soft': employee.accentSoft} as React.CSSProperties}>
    <header className="flex h-[58px] shrink-0 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur sm:px-5"><Button variant="outline" size="icon" onClick={onBack} disabled={isRunning} aria-label="返回员工广场"><ArrowLeft size={18} /></Button><div className="flex min-w-0 items-center gap-2.5"><Avatar className="size-9" style={{backgroundColor: employee.accentSoft}}><AvatarImage src={employee.avatar} alt="" /><AvatarFallback>{employee.title.slice(0, 1)}</AvatarFallback></Avatar><div className="grid min-w-0"><strong className="truncate text-sm">{employee.title}</strong><span className="truncate text-[10px] text-muted-foreground">{employee.category} · {employee.version}</span></div></div><div className="ml-auto hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><Wifi size={14} />Evo-Harness<i className="size-2 rounded-full bg-emerald-600" /></div><Button className="lg:hidden" variant="ghost" size="icon" onClick={() => setMobilePanel(mobilePanel === 'cockpit' ? 'none' : 'cockpit')} aria-label="打开实时执行中心"><PanelRight size={18} /></Button></header>

    <div className="grid min-h-0 flex-1 lg:grid-cols-[190px_minmax(0,1fr)_300px]">
      <aside className="hidden border-r bg-card/60 p-3 lg:block"><p className="mb-3 px-2 pt-2 text-[10px] font-bold uppercase text-muted-foreground">快捷问题</p><PromptList prompts={employee.quickQuestions} onSelect={setDraft} /></aside>
      <section className="flex min-h-0 min-w-0 flex-col">
        {mobilePanel !== 'none' && <div className="max-h-72 overflow-auto border-b bg-card p-4 lg:hidden">{mobilePanel === 'prompts' ? <PromptList prompts={employee.quickQuestions} onSelect={(prompt) => {setDraft(prompt); setMobilePanel('none');}} /> : <ExecutionCockpit employee={employee} turns={turns} compact />}</div>}
        <ScrollArea className="min-h-0 flex-1" viewportRef={scrollRef}><div className="px-3 py-6 sm:px-6 sm:py-8"><MessageThread employee={employee} turns={turns} onRetry={(message) => void submit(message)} onConfirmReview={(turnId) => void confirmReview(turnId)} onCancelReview={cancelReview} onClassify={classifyArtifact} /></div></ScrollArea>
        <footer className="shrink-0 bg-background px-3 pb-3 pt-2 sm:px-6 sm:pb-5"><form className="mx-auto w-full max-w-[820px] rounded-lg border bg-card p-3 shadow-[0_12px_28px_rgba(35,42,55,0.09)]" onSubmit={(event) => {event.preventDefault(); void submit();}}><div className="mb-2 flex gap-2 lg:hidden"><Button type="button" variant="ghost" size="sm" onClick={() => setMobilePanel(mobilePanel === 'prompts' ? 'none' : 'prompts')}>快捷问题</Button></div><Textarea className="min-h-[52px] max-h-40 resize-y border-0 px-1 py-0 text-sm leading-6 shadow-none focus-visible:ring-0" value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => {if (event.key === 'Enter' && !event.shiftKey) {event.preventDefault(); void submit();}}} placeholder={`给${employee.title}安排一个具体任务...`} rows={2} disabled={isRunning} />
          {draftAttachments.length > 0 && <div className="grid gap-2 border-t py-2">{draftAttachments.map((attachment) => <div className="grid grid-cols-[minmax(0,1fr)_130px_32px] items-center gap-2" key={attachment.id}><span className="truncate text-xs text-muted-foreground">{attachment.file.name}</span><Select value={attachment.classification} onValueChange={(classification) => setDraftAttachments((current) => current.map((item) => item.id === attachment.id ? {...item, classification: classification as Classification} : item))}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="选择密级" /></SelectTrigger><SelectContent><SelectItem value="public">公开</SelectItem><SelectItem value="controlled">受控</SelectItem><SelectItem value="internal">内部</SelectItem></SelectContent></Select><Button variant="ghost" size="icon" className="size-8" type="button" aria-label={`移除 ${attachment.file.name}`} onClick={() => setDraftAttachments((current) => current.filter((item) => item.id !== attachment.id))}><Trash2 size={14} /></Button></div>)}</div>}
          {uploadError && <p className="pt-1 text-xs text-destructive">{uploadError}</p>}<div className="flex items-center justify-between gap-3 pt-2"><div className="flex min-w-0 items-center gap-2"><label className="cursor-pointer"><input className="sr-only" type="file" multiple onChange={(event) => {const files = Array.from(event.target.files ?? []); setDraftAttachments((current) => [...current, ...files.map((file) => ({id: `${file.name}-${file.size}-${crypto.randomUUID()}`, file}))].slice(0, 8)); event.target.value = '';}} /><span className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" title="添加附件"><FileUp size={16} /></span></label><span className="truncate text-[10px] text-muted-foreground">附件必须选择公开、受控或内部密级</span></div>{isRunning ? uploading ? <Button size="sm" type="button" disabled><StatusSpinner size={14} />上传中</Button> : <Button variant="destructive" size="sm" type="button" onClick={() => void cancel()}><Square size={13} fill="currentColor" />停止</Button> : <Button size="icon" type="submit" disabled={!draft.trim()} aria-label="发送任务"><Send size={16} /></Button>}</div>
        </form></footer>
      </section>
      <div className="hidden min-h-0 lg:block"><ExecutionCockpit employee={employee} turns={turns} /></div>
    </div>
  </main>;
}

function PromptList({prompts, onSelect}: {prompts: string[]; onSelect: (prompt: string) => void}) {
  if (!prompts.length) return <p className="px-2 text-xs text-muted-foreground">暂未配置快捷问题</p>;
  return <div className="grid gap-2">{prompts.slice(0, 6).map((prompt) => <button key={prompt} className="rounded-md border bg-background p-3 text-left text-[11px] leading-5 text-muted-foreground transition hover:border-[var(--employee-accent)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => onSelect(prompt)}>{prompt}</button>)}</div>;
}
