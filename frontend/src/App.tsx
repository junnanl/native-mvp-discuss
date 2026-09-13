import { useCallback, useEffect, useState, useRef } from 'react'
import TodoList from './components/Dashboard/TodoList'
import StatsCards from './components/Dashboard/StatsCards'
import Announcements from './components/Dashboard/Announcements'
import { Users, CheckCircle, PlusCircle } from 'lucide-react'
import MultiWindowTabs from './components/Dashboard/MultiWindowTabs'

type Agent = { id: number; name: string; description: string; category: string; usage_count: number; avatar?: string; demo?: boolean }
type Todo = { id: number; title: string; kind: string; owner: string; status: string }
type Node = { key: string; name: string; type: string; role?: string }
type Flow = { id: number; name: string; nodes: Node[] }
type Instance = { id: number; flow_def_id: number; current_node: string; status: string; data: Record<string, unknown> }
type Tab = { id: string; title: string; pinned?: boolean }

async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, body === undefined ? undefined : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(typeof error.detail === 'string' ? error.detail : `请求失败（${response.status}）`)
  }
  return response.json()
}

const home: Tab = { id: 'dashboard', title: '工作台', pinned: true }

function RequirementDetail({ id, flows, role, onChange }: { id: number; flows: Flow[]; role: string; onChange: () => void }) {
  const [instance, setInstance] = useState<Instance | null>(null)
  const [error, setError] = useState('')
  const [views, setViews] = useState<{ component: string; query: Record<string, string>; data?: any }[]>([])
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    let active = true
    api<Instance>(`/flow-instances/${id}`).then(value => { if (active) setInstance(value) }).catch(e => { if (active) setError(e.message) })
    return () => { active = false }
  }, [id])
  const flow = flows.find(value => value.id === instance?.flow_def_id)
  const node = flow?.nodes.find(value => value.key === instance?.current_node)
  async function advance() {
    setBusy(true); setError('')
    try { setInstance(await api<Instance>(`/flow-instances/${id}/advance`, { actor_role: role })); onChange() }
    catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }
  return <section className="bg-white rounded-lg shadow-sm p-6">
    <h1 className="text-xl font-semibold">需求 #{id}</h1>
    {error && <p role="alert" className="text-red-700 my-3">{error}</p>}
    {instance && <>
      <h2 className="my-4">{flow?.name}</h2>
      <ol className="flex flex-wrap gap-3 my-4">{flow?.nodes.map(n => <li key={n.key} className={`rounded px-3 py-2 ${n.key === instance.current_node ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>{n.name}</li>)}</ol>
      <p>当前节点：{node?.name} · {instance.status}</p>
      <dl className="my-4">{Object.entries(instance.data).map(([key, value]) => <div key={key} className="py-2 border-b"><dt className="text-gray-500">{key}</dt><dd>{String(value)}</dd></div>)}</dl>
      {node?.role === role && instance.status !== '已完成' && <button disabled={busy} onClick={advance} className="handle">{busy ? '处理中…' : `完成${node.name}`}</button>}
    </>}
  </section>
}

function AgentChat({ agent }: { agent: Agent }) {
  const [text, setText] = useState('')
  const [sessionId, setSessionId] = useState(() => `oa-${agent.id}-${Date.now()}`)
  const [status, setStatus] = useState('')
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  async function send() {
    if (!text.trim()) return
    setBusy(true); setAnswer(''); setStatus('正在执行…')
    try {
      const response = await api<{ request_id: string }>(`/agent/${agent.id}/chat`, { message: text, session_id: sessionId })
      const stream = await fetch(`/api/agent/${agent.id}/stream/${response.request_id}`)
      if (!stream.ok || !stream.body) throw new Error(`读取执行流失败（${stream.status}）`)
      const reader = stream.body.getReader(); const decoder = new TextDecoder(); let buffer = ''
      while (true) {
        const chunk = await reader.read(); if (chunk.done) break
        buffer += decoder.decode(chunk.value, { stream: true })
        const events = buffer.split('\n\n'); buffer = events.pop() ?? ''
        for (const event of events) {
          const line = event.split('\n').find(value => value.startsWith('data: '))
          if (!line) continue
          const payload = JSON.parse(line.slice(6)) as { type: string; content?: string }
          if (payload.type === 'delta') setAnswer(current => current + (payload.content ?? ''))
          if (payload.type === 'done') setStatus('执行完成')
        }
      }
    } catch (e) { setStatus((e as Error).message) }
    finally { setBusy(false) }
  }
  return <section className="chat-layout"><aside className="chat-side"><h2>过程</h2><p>快捷问题</p><p>能力配置</p><p>{busy ? '● 正在执行' : '○ 等待执行'}</p></aside><section className="chat-panel"><div className="chat-heading"><h1>{agent.name}</h1><button className="link" onClick={() => { setSessionId(`oa-${agent.id}-${Date.now()}`); setAnswer(''); setStatus('新对话') }}>新对话</button></div><p>{agent.description}</p>
    <form onSubmit={e => { e.preventDefault(); void send() }} className="prompt"><input aria-label="对话消息" value={text} onChange={e => setText(e.target.value)} placeholder="说点什么…" /><button disabled={busy || !text.trim()}>发送</button></form>
    <p className="answer">{answer}</p><p role="status">{status}</p>
  </section><aside className="chat-result"><h2>结果</h2><p>本轮产物将在这里累积</p></aside></section>
}

export default function App() {
  const [tabs, setTabs] = useState<Tab[]>([home])
  const [active, setActive] = useState(home.id)
  const [role, setRole] = useState('使用者')
  const [agents, setAgents] = useState<Agent[]>([])
  const [stats, setStats] = useState({ online_agents: 0, completed_today: 0, new_this_month: 0 })
  const [todos, setTodos] = useState<Todo[]>([])
  const [flows, setFlows] = useState<Flow[]>([])
  const loadSequence = useRef(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [form, setForm] = useState<Record<string, unknown> | null>(null)
  const [selectedFlow, setSelectedFlow] = useState(1)
  const [busy, setBusy] = useState(false)
  const [adminName, setAdminName] = useState('')
  const [adminDescription, setAdminDescription] = useState('')
  const [adminSkill, setAdminSkill] = useState('')
  const [views, setViews] = useState<{ component: string; query: Record<string, string>; data?: any }[]>([])
  const refresh = useCallback(async () => {
    const sequence = ++loadSequence.current
    setLoading(true); setError('')
    try {
      const [nextAgents, nextStats, nextTodos, nextFlows] = await Promise.all([
        api<Agent[]>('/agents'), api<{ online_agents: number; completed_today: number; new_this_month: number }>('/stats'), api<Todo[]>(`/todos?role=${encodeURIComponent(role)}`), api<Flow[]>('/flows'),
      ])
      if (sequence !== loadSequence.current) return
      setAgents(nextAgents); setStats(nextStats); setTodos(nextTodos); setFlows(nextFlows)
    } catch (e) { if (sequence === loadSequence.current) { setError(`无法加载业务数据：${(e as Error).message}`); setTodos([]) } }
    finally { if (sequence === loadSequence.current) setLoading(false) }
  }, [role])
  useEffect(() => { void refresh(); return () => { loadSequence.current++ } }, [refresh])
  function open(tab: Tab) { setTabs(old => old.some(t => t.id === tab.id) ? old : [...old, tab]); setActive(tab.id) }
  function close(id: string) {
    setTabs(old => old.filter(t => t.pinned || t.id !== id))
    if (active === id) setActive(home.id)
  }
  async function fill() {
    if (!prompt.trim()) return
    setBusy(true); setError('')
    try {
      const route = await api<{ route: string; agent_id?: number }>('/ai/dispatch', { text: prompt })
      if (route.route === 'agent' && route.agent_id) { open({ id: `agent:${route.agent_id}`, title: agents.find(agent => agent.id === route.agent_id)?.name ?? '数字员工' }); return }
      if (route.route === 'view') { await resolveView(); return }
      const result = await api<{ form: Record<string, unknown> }>('/ai/fill-form', { text: prompt }); setForm(result.form)
    }
    catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }
  async function resolveView() {
    if (!prompt.trim()) return
    setBusy(true); setError('')
    try { const result = await api<{ component: string; query: Record<string, string> }>('/ai/resolve-view', { text: prompt }); setViews(current => [...current, result]) }
    catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }
  async function createAgent() {
    if (!adminName.trim()) return
    setBusy(true); setError('')
    try { const agent = await api<Agent>('/agents', { name: adminName, description: adminDescription, skill_md: adminSkill }); await api(`/agents/${agent.id}/skill`, { skill_md: adminSkill, status: '待评审' }); await api(`/agents/${agent.id}/publish`, {}); setAdminName(''); setAdminDescription(''); setAdminSkill(''); await refresh(); open({ id: `agent:${agent.id}`, title: agent.name }) }
    catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }
  async function create() {
    if (!form) return
    setBusy(true); setError('')
    try {
      const instance = await api<Instance>('/flow-instances', { flow_def_id: selectedFlow, data: form })
      setForm(null); open({ id: `requirement:${instance.id}`, title: `需求#${instance.id}` }); await refresh()
    } catch (e) { setError((e as Error).message) }
    finally { setBusy(false) }
  }
  return <div className="app-shell">
    <header className="topbar"><strong>AI-native OA</strong><label className="user">角色 <select value={role} onChange={e => setRole(e.target.value)}>{['使用者', '提需求', '评审', '开发'].map(r => <option key={r}>{r}</option>)}</select></label></header>
    <MultiWindowTabs windowTabs={tabs} activeWindowId={active} onTabChange={setActive} onCloseWindow={close}
      onCloseAllWindows={() => { setTabs([home]); setActive(home.id) }}
      onCloseOtherWindows={id => setTabs(old => old.filter(t => t.pinned || t.id === id))} />
    <main className="content">
      {error && <div role="alert" className="bg-red-50 text-red-700 rounded p-3 mb-4">{error} <button onClick={refresh}>重新加载</button></div>}
      <div hidden={active !== home.id}>
        <section className="hero"><h1>有什么可以帮你？</h1><p>问一句话，或者挑一个数字员工帮你干活</p>
          <form className="prompt" onSubmit={e => { e.preventDefault(); void fill() }}><input aria-label="需求描述" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="描述你的需求" /><button disabled={busy || !prompt.trim()}>{busy ? '处理中…' : '填需求单'}</button><button type="button" disabled={busy || !prompt.trim()} onClick={resolveView}>查数据</button></form>
        </section>
        {views.map((view, viewIndex) => <section className="view-result" key={viewIndex}><h2>{view.component}</h2><p>查询条件：{JSON.stringify(view.query)}</p>{view.component === 'metric' && <div className="metric-result"><strong>{view.data?.value ?? '—'}</strong><span>{view.data?.title}</span></div>}{view.component === 'table' && <table><thead><tr>{(view.data?.columns ?? []).map((column: string) => <th key={column}>{column}</th>)}</tr></thead><tbody>{(view.data?.rows ?? []).map((row: Record<string,string>, index: number) => <tr key={index}>{(view.data?.columns ?? []).map((column: string) => <td key={column}>{row[column]}</td>)}</tr>)}</tbody></table>}{view.component === 'chart' && <div className="bar-chart">{(view.data?.series?.[0]?.data ?? []).map((value: number, index: number) => <i key={index} style={{ height: `${value * 12}px` }} title={String(value)} />)}</div>}{view.component === 'graph' && <div className="graph-result"><span>需求流程</span><b>→</b><span>数字员工</span></div>}{view.component === 'text' && <p>{view.data?.markdown}</p>}<button className="link" onClick={() => setViews(current => current.filter((_, index) => index !== viewIndex))}>删除</button></section>)}
        {form && <section className="form-card"><h2>需求单（请确认）</h2><label>流程<select value={selectedFlow} onChange={e => setSelectedFlow(Number(e.target.value))}>{flows.map(flow => <option key={flow.id} value={flow.id}>{flow.name}</option>)}</select></label>
          {Object.entries(form).map(([key, value]) => <label key={key}>{key}<input value={String(value ?? '')} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}
          <button disabled={busy || role !== '提需求'} className="handle" onClick={create}>保存需求</button>
          {role !== '提需求' && <p>请切换到提需求角色后保存。</p>}
        </section>}
        <section><div className="section-title"><h2>我的数字员工</h2><button className="link" onClick={() => open({ id: 'agents', title: '数字员工' })}>查看全部 →</button></div>
          <div className="agent-grid">{agents.slice(0, 3).map(agent => <button className="agent-card" key={agent.id} onClick={() => open({ id: `agent:${agent.id}`, title: agent.name })}>
            <span className="agent-name">{agent.name}</span><span className="agent-description">{agent.description}</span><span className="agent-meta">{agent.category} · {agent.demo ? '演示配置' : `使用 ${agent.usage_count} 次`}</span>
          </button>)}<button className="agent-card add" onClick={() => { setPrompt('我要一个新的数字员工'); document.querySelector<HTMLInputElement>('[aria-label="需求描述"]')?.focus() }}><span className="plus">＋</span>我要一个新的</button></div>
        </section>
        <div className="lower"><section>
          {loading && <p role="status">正在加载…</p>}
          <TodoList key={role} compact items={todos} onNavigate={path => { const id = Number(path.split('/').pop()); open({ id: `requirement:${id}`, title: `需求#${id}` }) }} />
        </section><Announcements /></div>
        <div className="mt-5"><StatsCards metricGroups={[
          { id: 'online', title: '已上岗数字员工', mainLabel: '已上岗', mainValue: stats.online_agents, mainUnit: '个', icon: Users, iconColor: 'text-blue-600', subMetrics: [] },
          { id: 'completed', title: '今日完成任务', mainLabel: '今日完成', mainValue: stats.completed_today, mainUnit: '次', icon: CheckCircle, iconColor: 'text-cyan-600', subMetrics: [] },
          { id: 'new', title: '本月新增', mainLabel: '本月新增', mainValue: stats.new_this_month, mainUnit: '个', icon: PlusCircle, iconColor: 'text-orange-600', subMetrics: [] },
        ]} /></div>
      </div>
      {tabs.filter(tab => tab.id.startsWith('requirement:')).map(tab => <div key={tab.id} hidden={active !== tab.id}><RequirementDetail id={Number(tab.id.split(':')[1])} flows={flows} role={role} onChange={refresh} /></div>)}
      {tabs.filter(tab => tab.id.startsWith('agent:')).map(tab => {
        const agent = agents.find(a => `agent:${a.id}` === tab.id)
        return agent && <div key={tab.id} hidden={active !== tab.id}><AgentChat agent={agent} /></div>
      })}
      {active === 'agents' && <section><div className="agent-grid">{agents.map(agent => <button className="agent-card" key={agent.id} onClick={() => open({ id: `agent:${agent.id}`, title: agent.name })}><strong>{agent.name}</strong><p>{agent.description}</p></button>)}</div><section className="form-card"><h2>创建数字员工</h2><input aria-label="员工名称" placeholder="员工名称" value={adminName} onChange={e => setAdminName(e.target.value)} /><input aria-label="员工说明" placeholder="一句话说明" value={adminDescription} onChange={e => setAdminDescription(e.target.value)} /><textarea aria-label="Skill 内容" placeholder="SKILL.md 内容" value={adminSkill} onChange={e => setAdminSkill(e.target.value)} /><button className="handle" disabled={busy || !adminName.trim()} onClick={createAgent}>保存并上线</button></section></section>}
    </main>
  </div>
}
