import { useCallback, useEffect, useState } from 'react'
import { CheckCircle, Plus, Users } from 'lucide-react'
import TodoList from '../../components/Dashboard/TodoList'
import StatsCards from '../../components/Dashboard/StatsCards'
import Announcements from '../../components/Dashboard/Announcements'
import * as api from '../api'
import AgentCard from '../components/AgentCard'
import FormFields from '../components/FormFields'
import PromptBox from '../components/PromptBox'
import ViewCard from '../components/ViewCard'
import type { Agent, Artifact, FlowDef, FormDef, Todo, User } from '../types'

type Draft = {
  flowDefId: number
  flowName: string
  form: FormDef
  values: Record<string, unknown>
  note: string
}

type Props = {
  user: User
  onOpenAgent: (agent: Agent, question?: string) => void
  onOpenInstance: (id: number) => void
  onOpenAgentList: () => void
}

/**
 * 工作台首页（方案 §6.2）。
 *
 * 只有一个输入框：用户说什么都行，dispatch 负责找对人（§6.4）。这里不给
 * 「填表 / 查数据」两个按钮——那等于把设计者的分层强加给用户。
 */
export default function Workbench({ user, onOpenAgent, onOpenInstance, onOpenAgentList }: Props) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  const [flows, setFlows] = useState<FlowDef[]>([])
  const [stats, setStats] = useState({ online_agents: 0, completed_today: 0, new_this_month: 0 })
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [draft, setDraft] = useState<Draft | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    setError('')
    try {
      const [nextAgents, nextTodos, nextFlows, nextStats] = await Promise.all([
        api.get<Agent[]>('/agents?status=已上线'),
        api.get<Todo[]>('/todos'),
        api.get<FlowDef[]>('/flows'),
        api.get<typeof stats>('/stats'),
      ])
      setAgents(nextAgents)
      setTodos(nextTodos)
      setFlows(nextFlows)
      setStats(nextStats)
    } catch (problem) {
      setError(`无法加载业务数据：${(problem as Error).message}`)
    }
  }, [])

  useEffect(() => { void refresh() }, [refresh, user.id])

  /** 唯一入口：一句话进来，先路由，再决定自己处理还是转交。 */
  async function dispatch(text: string) {
    setBusy(true)
    setError('')
    try {
      const route = await api.post<{ route: string; agent_id?: number; flow_def_id?: number }>('/ai/dispatch', { text })
      if (route.route === 'agent' && route.agent_id) {
        const target = agents.find(agent => agent.id === route.agent_id)
        if (target) {
          onOpenAgent(target, text)   // 把这句话带过去（方案 §6.4）
          return
        }
      }
      if (route.route === 'fill_form' && route.flow_def_id) {
        await prefill(route.flow_def_id, text)
        return
      }
      const view = await api.post<{ view: string; component: Artifact['component']; title: string; query: Record<string, string> }>(
        '/ai/resolve-view', { text })
      setArtifacts(current => [
        { id: `${view.view}-${Date.now()}`, view: view.view, title: view.title, component: view.component, query: view.query },
        ...current,
      ])
    } catch (problem) {
      setError((problem as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function prefill(flowDefId: number, text: string) {
    const filled = await api.post<{ flow_def_id: number; form: FormDef; values: Record<string, unknown>; _model: { attempts: number; schema_enforced: boolean } }>(
      '/ai/fill-form', { text, flow_def_id: flowDefId })
    const flow = flows.find(item => item.id === flowDefId)
    setDraft({
      flowDefId,
      flowName: flow?.name ?? '',
      form: filled.form,
      values: filled.values,
      note: `AI 填了 ${Object.values(filled.values).filter(Boolean).length} 项，第 ${filled._model.attempts} 次通过校验。请核对后提交。`,
    })
  }

  async function startBlank(flowDefId: number) {
    setBusy(true)
    setError('')
    try {
      const flow = await api.get<FlowDef>(`/flows/${flowDefId}`)
      if (!flow.form) throw new Error(`流程「${flow.name}」没有配填单节点的表单`)
      setDraft({ flowDefId, flowName: flow.name, form: flow.form, values: {}, note: '' })
    } catch (problem) {
      setError((problem as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function submitDraft() {
    if (!draft) return
    setBusy(true)
    setError('')
    try {
      const instance = await api.post<{ id: number }>('/flow-instances', {
        flow_def_id: draft.flowDefId, data: draft.values,
      })
      setDraft(null)
      await refresh()
      onOpenInstance(instance.id)
    } catch (problem) {
      setError((problem as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const startable = flows.filter(flow => flow.nodes[0]?.role === user.role)

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={refresh} className="text-xs underline shrink-0 ml-3">重新加载</button>
        </div>
      )}

      <PromptBox
        pageKey="home"
        placeholder="问一句话，或者挑一个员工帮你干活…"
        busy={busy}
        onSubmit={dispatch}
      />

      {draft && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">{draft.form.name}</h3>
            <span className="text-xs text-gray-400">{draft.flowName}</span>
          </div>
          {/* 三层防线的第 3 层：人确认。前两层因此不需要做到完美（方案 §4）。 */}
          {draft.note && <p className="text-xs text-gray-500 mb-3 ml-3">{draft.note}</p>}
          <div className="mt-3">
            <FormFields
              fields={draft.form.fields}
              values={draft.values}
              onChange={values => setDraft({ ...draft, values })}
            />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={submitDraft}
              disabled={busy}
              className="px-4 py-2 rounded bg-[#1677FF] text-white text-sm hover:bg-[#0e5fd8] transition-colors disabled:opacity-40"
            >
              提交
            </button>
            <button onClick={() => setDraft(null)} className="px-4 py-2 rounded text-sm text-gray-500 hover:bg-gray-100">
              取消
            </button>
          </div>
        </div>
      )}

      {artifacts.map(artifact => (
        <ViewCard
          key={artifact.id}
          viewKey={artifact.view}
          title={artifact.title}
          query={artifact.query}
          onOpenInstance={onOpenInstance}
          onClose={() => setArtifacts(current => current.filter(item => item.id !== artifact.id))}
        />
      ))}

      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">我的数字员工</h2>
          </div>
          <button onClick={onOpenAgentList} className="text-xs text-[#1677FF] hover:underline">查看全部 →</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {agents.slice(0, 3).map((agent, index) => (
            <AgentCard key={agent.id} agent={agent} index={index} onOpen={() => onOpenAgent(agent)} />
          ))}

          {startable.length > 0 && (
            <button
              onClick={() => void startBlank(startable[0].id)}
              className="rounded-lg border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#1677FF] hover:text-[#1677FF] transition-colors min-h-[168px]"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm">
                {startable[0].id === 1 ? '我要一个新的' : `发起${startable[0].name}`}
              </span>
            </button>
          )}

          {agents.length === 0 && startable.length === 0 && (
            <div className="col-span-full bg-white rounded-lg shadow-sm py-10 text-center text-sm text-gray-400">
              还没有已上线的数字员工。走完一条「数字员工申请上线」流程就会出现在这里。
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,2.2fr)_minmax(260px,1fr)] gap-3 items-start">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <TodoList
            key={user.id}
            compact
            items={todos.map(todo => ({
              id: todo.id,
              title: todo.title,
              kind: todo.kind,
              status: todo.status,
              owner: '',
              content: `${todo.flow_name} · 等你${todo.kind}`,
              time: todo.created_at.slice(0, 16).replace('T', ' '),
            }))}
            onNavigate={path => onOpenInstance(Number(path.split('/').pop()))}
          />
        </div>
        <Announcements />
      </div>

      <StatsCards metricGroups={[
        { id: 'online', title: '数字员工', mainLabel: '已上岗', mainValue: stats.online_agents, mainUnit: '个', icon: Users, iconColor: 'text-blue-600', subMetrics: [] },
        { id: 'done', title: '任务完成', mainLabel: '今日完成', mainValue: stats.completed_today, mainUnit: '次', icon: CheckCircle, iconColor: 'text-cyan-600', subMetrics: [] },
        { id: 'new', title: '新增员工', mainLabel: '本月新增', mainValue: stats.new_this_month, mainUnit: '个', icon: Plus, iconColor: 'text-orange-600', subMetrics: [] },
      ]} />
    </div>
  )
}
