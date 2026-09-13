import { useCallback, useEffect, useState } from 'react'
import { Check, ExternalLink, Network, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'
import * as api from '../api'
import ViewCard from '../components/ViewCard'
import type { Agent, FlowDef, Instance, User, ViewData } from '../types'

type Props = { id: number; user: User; onChanged: () => void }

const HARNESS_CONSOLE = import.meta.env.VITE_COWAGENT_URL ?? 'http://127.0.0.1:19989'

/**
 * 需求详情（方案 §6.5）：表单值 + 流程进度 + 按当前节点和角色显示的操作按钮。
 *
 * 走到「开发」节点时，这里同时就是开发任务详情——一个跳去 CowAgent 的入口 +
 * 一个 skill 提交框 → 标记上线。**不做编辑器。**
 */
export default function RequirementDetail({ id, user, onChanged }: Props) {
  const [instance, setInstance] = useState<Instance | null>(null)
  const [flow, setFlow] = useState<FlowDef | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [skill, setSkill] = useState('')
  const [drafting, setDrafting] = useState(false)
  const [duplicates, setDuplicates] = useState<(ViewData & { note?: string }) | null>(null)
  const [checking, setChecking] = useState(false)
  // 上线是「建员工 → 存 skill → 走完流程 → 上线」四步，中间失败重试不能再建一个
  const [createdAgentId, setCreatedAgentId] = useState<number | null>(null)

  const load = useCallback(async () => {
    setError('')
    try {
      const found = await api.get<Instance>(`/flow-instances/${id}`)
      setInstance(found)
      setFlow(await api.get<FlowDef>(`/flows/${found.flow_def_id}`))
    } catch (problem) {
      setError((problem as Error).message)
    }
  }, [id])

  useEffect(() => { void load() }, [load])

  const nodes = flow?.nodes ?? []
  const index = nodes.findIndex(node => node.key === instance?.current_node)
  const node = index >= 0 ? nodes[index] : null
  const mine = node?.role === user.role && instance?.status !== '已完成'
  const isDevelopment = node?.type === '开发'
  const isApproval = node?.type === '审批'

  async function advance() {
    setBusy(true)
    setError('')
    try {
      setInstance(await api.post<Instance>(`/flow-instances/${id}/advance`, { data: {} }))
      onChanged()
    } catch (problem) {
      setError((problem as Error).message)
    } finally {
      setBusy(false)
    }
  }

  /** 重复建设检测（方案 §6.6）：相似度由模型判断，结果是给人看的，人自己拿主意。 */
  async function checkDuplicates() {
    setChecking(true)
    setError('')
    try {
      setDuplicates(await api.post<ViewData & { note?: string }>('/ai/duplicate-check', { flow_instance_id: id }))
    } catch (problem) {
      setError((problem as Error).message)
    } finally {
      setChecking(false)
    }
  }

  async function draftSkill() {
    setDrafting(true)
    setError('')
    try {
      const body = await api.post<{ skill_md: string }>('/ai/skill-draft', { flow_instance_id: id })
      setSkill(body.skill_md)
    } catch (problem) {
      setError((problem as Error).message)
    } finally {
      setDrafting(false)
    }
  }

  /** 开发完成 = 固化 skill → 走完流程 → 员工上线。上线必须挂在这条流程上。 */
  async function finishDevelopment() {
    if (!instance || !flow) return
    setBusy(true)
    setError('')
    try {
      const label = String(instance.data[flow.form?.fields[0]?.key ?? 'name'] ?? `数字员工 #${id}`)
      const description = String(
        instance.data[flow.form?.fields.find(field => field.type === 'textarea')?.key ?? ''] ?? '')
      let agentId = createdAgentId
      if (agentId === null) {
        agentId = (await api.post<Agent>('/agents', { name: label, description, skill_md: skill })).id
        setCreatedAgentId(agentId)
      }
      await api.put(`/agents/${agentId}/skill`, { skill_md: skill })
      if (instance.status !== '已完成') {
        await api.post<Instance>(`/flow-instances/${id}/advance`, { data: {} })
      }
      await api.post(`/agents/${agentId}/publish`, { flow_instance_id: id })
      await load()
      onChanged()
    } catch (problem) {
      setError((problem as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4 space-y-3">
      {error && <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
          <h2 className="text-sm font-semibold text-gray-800">{flow?.name ?? '流程'} #{id}</h2>
          <span className={clsx('px-2 py-0.5 rounded text-xs',
            instance?.status === '已完成' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600')}>
            {instance?.status ?? '加载中'}
          </span>
        </div>

        {/* 流程进度：节点来自 flow_def，一个都没写死 */}
        <ol className="flex flex-wrap items-center gap-1.5 mb-5">
          {nodes.map((item, position) => {
            const passed = index < 0 ? instance?.status === '已完成' : position < index
            const active = position === index && instance?.status !== '已完成'
            return (
              <li key={item.key} className="flex items-center gap-1.5">
                <span className={clsx('flex items-center gap-1.5 px-2.5 py-1 rounded text-xs',
                  active ? 'bg-[#1677FF] text-white'
                    : passed || instance?.status === '已完成' ? 'bg-green-50 text-green-600'
                    : 'bg-gray-50 text-gray-400')}>
                  {(passed || instance?.status === '已完成') && <Check className="w-3 h-3" />}
                  {item.name}
                  {item.role && <span className="opacity-60">·{item.role}</span>}
                </span>
                {position < nodes.length - 1 && <span className="text-gray-300 text-xs">→</span>}
              </li>
            )
          })}
        </ol>

        {/* 表单值按 form_def 的 label 显示，不显示 key */}
        <dl className="grid gap-3 sm:grid-cols-2">
          {(flow?.form?.fields ?? []).map(field => (
            <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
              <dt className="text-xs text-gray-500 mb-0.5">{field.label}</dt>
              <dd className="text-sm text-gray-800 whitespace-pre-wrap">
                {String(instance?.data[field.key] ?? '—')}
              </dd>
            </div>
          ))}
        </dl>

        {mine && isApproval && (
          <button
            onClick={checkDuplicates}
            disabled={checking}
            className="mt-5 mr-2 inline-flex items-center gap-1.5 px-3 py-2 rounded border border-gray-200 text-sm text-gray-600 hover:border-[#1677FF] hover:text-[#1677FF] transition-colors disabled:opacity-40"
          >
            <Network className="w-4 h-4" />
            {checking ? '比对中…' : '看看跟已有员工重不重'}
          </button>
        )}
        {mine && !isDevelopment && (
          <button
            onClick={advance}
            disabled={busy}
            className="mt-5 px-4 py-2 rounded bg-[#1677FF] text-white text-sm hover:bg-[#0e5fd8] transition-colors disabled:opacity-40"
          >
            {busy ? '处理中…' : `完成${node?.name}`}
          </button>
        )}
        {!mine && instance?.status !== '已完成' && node && (
          <p className="mt-5 text-xs text-gray-400">当前在「{node.name}」，等{node.role}处理。</p>
        )}
      </div>

      {duplicates && (
        <div className="bg-white rounded-lg shadow-sm">
          <ViewCard title={duplicates.title} data={duplicates} onClose={() => setDuplicates(null)} />
          {duplicates.note && (
            <p className="text-xs text-gray-500 px-4 pb-4 -mt-1 leading-5">
              模型判断：{duplicates.note}　结论由你来下。
            </p>
          )}
        </div>
      )}

      {mine && isDevelopment && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">开发任务</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4 ml-3">
            去 CowAgent 里把流程试通，然后把 skill 内容固化到这里。不用做编辑器。
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <a
              href={HARNESS_CONSOLE}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 text-xs text-gray-600 hover:border-[#1677FF] hover:text-[#1677FF] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              打开 CowAgent 控制台
            </a>
            <button
              onClick={draftSkill}
              disabled={drafting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-200 text-xs text-gray-600 hover:border-[#1677FF] hover:text-[#1677FF] transition-colors disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {drafting ? '生成中…' : '让 AI 出个草稿'}
            </button>
          </div>

          <textarea
            aria-label="SKILL.md 内容"
            value={skill}
            onChange={event => setSkill(event.target.value)}
            placeholder="粘贴或编写 SKILL.md 内容"
            className="w-full min-h-[200px] rounded border border-gray-200 px-3 py-2 text-sm font-mono text-gray-800 outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF]/30"
          />

          <button
            onClick={finishDevelopment}
            disabled={busy || skill.trim().length < 40}
            className="mt-3 px-4 py-2 rounded bg-[#1677FF] text-white text-sm hover:bg-[#0e5fd8] transition-colors disabled:opacity-40"
            title={skill.trim().length < 40 ? 'skill 内容太短' : undefined}
          >
            {busy ? '上线中…' : '完成开发并让员工上岗'}
          </button>
        </div>
      )}
    </div>
  )
}
