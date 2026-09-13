'use client';

import {ArrowLeft, ImageUp, LogOut, Plus, Save, UsersRound} from 'lucide-react';
import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import type {CapabilityKind, Employee} from '@/lib/agents';
import {cn} from '@/lib/utils';
import {Avatar, AvatarFallback, AvatarImage} from './ui/avatar';
import {Badge} from './ui/badge';
import {Button} from './ui/button';
import {Card, CardContent} from './ui/card';
import {Input} from './ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from './ui/select';
import {Textarea} from './ui/textarea';

const blankEmployee: Employee = {
  id: '', title: '', category: '办公协作', avatar: '/avatars/researcher.png', accent: '#315a91', accentSoft: '#dfe9f7',
  status: 'enabled', description: '', tags: [], maturity: '成长中', version: 'V1.0', capabilities: [], quickQuestions: [], systemPrompt: '', sortOrder: 100, harnessUrl: '', harnessPassword: '',
};

export function EmployeeAdmin() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState<Employee>(blankEmployee);
  const [message, setMessage] = useState('正在读取员工配置...');
  const [saving, setSaving] = useState(false);

  useEffect(() => { void loadEmployees(); }, []);

  async function loadEmployees() {
    try {
      const response = await fetch('/api/admin/employees', {cache: 'no-store'});
      const payload = await response.json() as {employees?: Employee[]; error?: string};
      if (!response.ok || !payload.employees) throw new Error(payload.error ?? '员工配置读取失败');
      setEmployees(payload.employees);
      if (payload.employees[0]) select(payload.employees[0]);
      setMessage('');
    } catch (error) { setMessage(error instanceof Error ? error.message : '员工配置读取失败'); }
  }

  const idConflict = useMemo(() => employees.some((item) => item.id === draft.id && item.id !== selectedId), [draft.id, employees, selectedId]);

  function select(employee: Employee) {
    setSelectedId(employee.id);
    setDraft({...employee, tags: [...employee.tags], quickQuestions: [...employee.quickQuestions], capabilities: employee.capabilities.map((item) => ({...item}))});
  }

  function createEmployee() {
    setSelectedId('');
    setDraft({...blankEmployee, sortOrder: Math.max(0, ...employees.map((item) => item.sortOrder)) + 10});
    setMessage('正在新增员工');
  }

  async function save() {
    if (!draft.id || !draft.title || !draft.category || !draft.description || !draft.systemPrompt || idConflict) {
      setMessage(idConflict ? '员工 ID 已存在' : '请填写 ID、岗位名称、业务大类、简介和员工 Prompt');
      return;
    }
    setSaving(true);
    const normalized = {...draft, tags: draft.tags.filter(Boolean), quickQuestions: draft.quickQuestions.filter(Boolean), capabilities: draft.capabilities.filter((item) => item.id && item.name)};
    const next = selectedId ? employees.map((item) => item.id === selectedId ? normalized : item) : [...employees, normalized];
    try {
      const response = await fetch('/api/admin/employees', {method: 'PUT', headers: {'content-type': 'application/json'}, body: JSON.stringify({employees: next})});
      const payload = await response.json() as {employees?: Employee[]; error?: string};
      if (!response.ok || !payload.employees) throw new Error(payload.error ?? '保存失败');
      setEmployees(payload.employees); setSelectedId(normalized.id); setDraft(normalized); setMessage('已保存到服务器 JSON');
    } catch (error) { setMessage(error instanceof Error ? error.message : '保存失败'); } finally { setSaving(false); }
  }

  async function uploadAvatar(file?: File) {
    if (!file) return;
    setMessage('正在上传头像...');
    const form = new FormData(); form.set('file', file);
    const response = await fetch('/api/admin/avatar', {method: 'POST', body: form});
    const payload = await response.json() as {avatar?: string; error?: string};
    if (!response.ok || !payload.avatar) setMessage(payload.error ?? '头像上传失败');
    else { setDraft((current) => ({...current, avatar: payload.avatar!})); setMessage('头像已上传，保存员工后生效'); }
  }

  async function logout() { await fetch('/api/admin/logout', {method: 'POST'}); window.location.reload(); }

  return <main className="min-h-screen bg-background">
    <header className="flex h-[58px] items-center gap-3 border-b bg-background px-4 sm:px-7"><Button asChild variant="outline" size="icon"><Link href="/" aria-label="返回员工广场"><ArrowLeft size={18} /></Link></Button><div><strong className="text-sm">员工配置</strong><p className="text-[10px] text-muted-foreground">服务器 JSON / 原型管理页</p></div><Badge className="ml-auto gap-1.5"><UsersRound size={13} />{employees.length} 位员工</Badge><Button variant="ghost" size="sm" onClick={() => void logout()}><LogOut size={14} />退出</Button></header>
    <div className="mx-auto grid max-w-[1240px] gap-6 px-4 py-8 sm:px-7 lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside><div className="mb-3 flex items-center justify-between"><h1 className="font-serif text-xl font-semibold">员工列表</h1><Button variant="outline" size="icon" onClick={createEmployee} aria-label="新增员工"><Plus size={16} /></Button></div><div className="grid gap-1">{employees.map((employee) => <button key={employee.id} className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring', selectedId === employee.id && 'bg-muted')} onClick={() => select(employee)}><Avatar className="size-9" style={{backgroundColor: employee.accentSoft}}><AvatarImage src={employee.avatar} alt="" /><AvatarFallback>{employee.title.slice(0, 1)}</AvatarFallback></Avatar><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{employee.title}</strong><span className="block truncate text-[10px] text-muted-foreground">{employee.category}</span></span><span className={cn('size-2 rounded-full', employee.status === 'enabled' ? 'bg-emerald-600' : 'bg-slate-300')} /></button>)}</div></aside>
      <Card><CardContent className="grid gap-6 p-5 sm:p-7">
        <div className="flex items-center gap-4 border-b pb-5"><Avatar className="size-16" style={{backgroundColor: draft.accentSoft}}><AvatarImage src={draft.avatar} alt="" /><AvatarFallback>{draft.title.slice(0, 1) || '新'}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><h2 className="font-serif text-2xl font-semibold">{draft.title || '新数字员工'}</h2><p className="text-xs text-muted-foreground">{draft.category || '配置岗位资料和隐藏 Prompt'}</p></div><label className="cursor-pointer"><input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadAvatar(event.target.files?.[0])} /><span className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium hover:bg-muted"><ImageUp size={15} />上传头像</span></label></div>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="员工 ID"><Input value={draft.id} disabled={Boolean(selectedId)} onChange={(event) => setDraft({...draft, id: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})} /></Field><Field label="状态"><Select value={draft.status} onValueChange={(status) => setDraft({...draft, status: status as Employee['status']})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="enabled">启用</SelectItem><SelectItem value="disabled">停用（前台不可见）</SelectItem></SelectContent></Select></Field><Field label="岗位名称"><Input value={draft.title} onChange={(event) => setDraft({...draft, title: event.target.value})} /></Field><Field label="业务大类"><Input list="employee-categories" value={draft.category} onChange={(event) => setDraft({...draft, category: event.target.value})} /><datalist id="employee-categories"><option value="办公协作" /><option value="产品设计" /><option value="技术工程" /><option value="数据智能" /></datalist></Field><Field label="员工成熟度"><Input value={draft.maturity} onChange={(event) => setDraft({...draft, maturity: event.target.value})} /></Field><Field label="版本号"><Input value={draft.version} onChange={(event) => setDraft({...draft, version: event.target.value.toUpperCase()})} placeholder="V1.0" /></Field><Field label="头像路径"><Input value={draft.avatar} onChange={(event) => setDraft({...draft, avatar: event.target.value})} /></Field><Field label="排序"><Input type="number" value={draft.sortOrder} onChange={(event) => setDraft({...draft, sortOrder: Number(event.target.value)})} /></Field><Field label="Evo-Harness 地址（留空使用默认实例）"><Input type="url" value={draft.harnessUrl ?? ''} onChange={(event) => setDraft({...draft, harnessUrl: event.target.value})} placeholder="http://127.0.0.1:19989" /></Field><Field label="Evo-Harness 访问密码"><Input type="password" value={draft.harnessPassword ?? ''} onChange={(event) => setDraft({...draft, harnessPassword: event.target.value})} placeholder="留空表示无密码" /></Field></div>
        <Field label="简介"><Textarea value={draft.description} onChange={(event) => setDraft({...draft, description: event.target.value})} /></Field><Field label="标签（逗号分隔）"><Input value={draft.tags.join(', ')} onChange={(event) => setDraft({...draft, tags: event.target.value.split(/[,，]/).map((item) => item.trim())})} /></Field><div><Field label="快捷问题（每行一个）"><Textarea rows={4} value={draft.quickQuestions.join('\n')} onChange={(event) => setDraft({...draft, quickQuestions: event.target.value.split('\n')})} /></Field>{draft.id === 'manager' && <p className="mt-2 rounded-md border border-blue-200 bg-blue-50 p-2.5 text-[11px] leading-5 text-blue-800">任务经理快捷问题会展示在首页任务调度台，首页只取前两条，点击后填入一句话指派输入框。</p>}</div><Field label="能力配置（每行：ID | 名称 | tool/skill/knowledge | Lucide 图标）"><Textarea rows={5} value={serializeCapabilities(draft)} onChange={(event) => setDraft({...draft, capabilities: parseCapabilities(event.target.value)})} /></Field><Field label="员工 Prompt"><Textarea className="min-h-44 font-mono text-xs leading-6" value={draft.systemPrompt} onChange={(event) => setDraft({...draft, systemPrompt: event.target.value})} /></Field><div className="flex items-center justify-between gap-4 border-t pt-5"><p className="text-xs text-muted-foreground" role="status">{message}</p><Button onClick={() => void save()} disabled={saving}><Save size={15} />{saving ? '保存中' : '保存员工'}</Button></div>
      </CardContent></Card>
    </div>
  </main>;
}

function serializeCapabilities(employee: Employee) { return employee.capabilities.map((item) => `${item.id} | ${item.name} | ${item.kind} | ${item.icon}`).join('\n'); }
function parseCapabilities(value: string) { return value.split('\n').filter(Boolean).map((line) => { const [id = '', name = '', rawKind = 'tool', icon = 'Wrench'] = line.split('|').map((item) => item.trim()); const kind: CapabilityKind = ['tool', 'skill', 'knowledge'].includes(rawKind) ? rawKind as CapabilityKind : 'tool'; return {id, name, kind, icon}; }); }
function Field({label, children}: {label: string; children: React.ReactNode}) { return <label className="grid gap-2 text-xs font-medium text-muted-foreground"><span>{label}</span>{children}</label>; }
