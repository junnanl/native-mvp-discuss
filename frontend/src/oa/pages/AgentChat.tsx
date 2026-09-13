import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, ChevronLeft, ChevronRight, Download, Loader2, Wrench, X } from 'lucide-react'
import { clsx } from 'clsx'
import * as api from '../api'
import ViewCard from '../components/ViewCard'
import type { Agent, HarnessEvent, ToolStep, ViewData } from '../types'

type Turn = {
  id: string
  question: string
  answer: string
  phases: string[]
  tools: ToolStep[]
  unknown: Record<string, unknown>[]
  status: 'running' | 'done' | 'error' | 'cancelled'
  error?: string
}

type CanvasItem =
  | { id: string; kind: 'view'; data: ViewData }
  | { id: string; kind: 'file'; name: string; url: string }

// 任何产出合法组件数据的工具都上画布，不只图表
const ARTIFACT_TOOLS = new Set(['show_chart', 'show_table', 'show_graph', 'show_metric', 'show_text'])

function sessionKey(agentId: number) {
  return `oa.session.${agentId}`
}

/**
 * 数字员工对话页（方案 §6.7）：过程 → 交流 → 结果，从左到右。
 *
 * 左栏是**投影**，真相始终在对话流里。执行进度全部来自 CowAgent 的真实事件——
 * 没有事件就说没有，不摆三个固定步骤转圈骗人。
 */
export default function AgentChat({ agent, seed }: { agent: Agent; seed?: string }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [canvas, setCanvas] = useState<CanvasItem[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const [session, setSession] = useState(
    () => localStorage.getItem(sessionKey(agent.id)) ?? `oa-agent-${agent.id}-${Date.now()}`)
  const bottom = useRef<HTMLDivElement>(null)
  const seeded = useRef(false)

  useEffect(() => { localStorage.setItem(sessionKey(agent.id), session) }, [agent.id, session])
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [turns])

  // 首页路由过来时，把用户原话直接带进来发掉（方案 §6.4）
  useEffect(() => {
    if (seed && !seeded.current) {
      seeded.current = true
      void ask(seed)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed])

  function patch(turnId: string, change: (turn: Turn) => Turn) {
    setTurns(current => current.map(turn => (turn.id === turnId ? change(turn) : turn)))
  }

  function applyEvent(turnId: string, event: HarnessEvent) {
    if (event.type === 'delta') {
      patch(turnId, turn => ({ ...turn, answer: turn.answer + (event.content ?? '') }))
    } else if (event.type === 'phase') {
      patch(turnId, turn => ({
        ...turn,
        phases: turn.phases.includes(event.content ?? '') ? turn.phases : [...turn.phases, event.content ?? ''],
      }))
    } else if (event.type === 'tool_start' || event.type === 'tool_progress' || event.type === 'tool_end') {
      const step: ToolStep = {
        callId: event.call_id,
        tool: event.tool,
        label: event.label,
        status: event.type === 'tool_end' ? (event.status === 'error' ? 'error' : 'done') : 'running',
        detail: event.detail ?? '',
      }
      patch(turnId, turn => ({
        ...turn,
        tools: turn.tools.some(item => item.callId === step.callId)
          ? turn.tools.map(item => (item.callId === step.callId
              ? { ...item, status: step.status, detail: step.detail || item.detail } : item))
          : [...turn.tools, step],
      }))
      if (event.type === 'tool_end' && ARTIFACT_TOOLS.has(event.tool) && event.detail) {
        try {
          const parsed = JSON.parse(event.detail) as ViewData
          if (parsed?.component) {
            setCanvas(current => [...current, { id: `${event.call_id}-${current.length}`, kind: 'view', data: parsed }])
            // 产物已经在右栏了，左栏没必要再贴一遍原始 JSON
            patch(turnId, turn => ({
              ...turn,
              tools: turn.tools.map(item => (item.callId === event.call_id
                ? { ...item, detail: `已生成：${parsed.title}` } : item)),
            }))
          }
        } catch {
          // 解析不了就不上画布——宁可没有，也不摆一张编出来的图
        }
      }
    } else if (event.type === 'file' || event.type === 'image') {
      setCanvas(current => [...current, {
        id: `file-${current.length}`,
        kind: 'file',
        name: event.file_name ?? '生成的文件',
        url: event.content ?? '',
      }])
    } else if (event.type === 'done') {
      patch(turnId, turn => ({ ...turn, status: 'done', answer: turn.answer || (event.content ?? '') }))
    } else if (event.type === 'cancelled') {
      patch(turnId, turn => ({ ...turn, status: 'cancelled' }))
    } else if (event.type === 'error') {
      patch(turnId, turn => ({ ...turn, status: 'error', error: event.content ?? '执行出错' }))
    } else if (event.type === 'unknown') {
      patch(turnId, turn => ({ ...turn, unknown: [...turn.unknown, event.raw] }))
    }
  }

  async function ask(question: string) {
    if (!question.trim() || busy) return
    const turnId = `turn-${Date.now()}`
    setTurns(current => [...current, {
      id: turnId, question, answer: '', phases: [], tools: [], unknown: [], status: 'running',
    }])
    setText('')
    setBusy(true)
    try {
      const started = await api.post<{ request_id: string }>(`/agent/${agent.id}/chat`, {
        message: question, session_id: session,
      })
      const response = await fetch(api.streamUrl(agent.id, started.request_id))
      if (!response.ok || !response.body) throw new Error(`读取执行流失败（${response.status}）`)
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const chunk = await reader.read()
        if (chunk.done) break
        buffer += decoder.decode(chunk.value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''
        for (const part of parts) {
          const line = part.split('\n').find(item => item.startsWith('data: '))
          if (!line) continue
          try {
            applyEvent(turnId, JSON.parse(line.slice(6)) as HarnessEvent)
          } catch {
            // 单条事件坏了不该中断整轮
          }
        }
      }
      patch(turnId, turn => (turn.status === 'running' ? { ...turn, status: 'done' } : turn))
    } catch (problem) {
      patch(turnId, turn => ({ ...turn, status: 'error', error: (problem as Error).message }))
    } finally {
      setBusy(false)
    }
  }

  const latest = turns[turns.length - 1]

  return (
    <div className="h-full flex bg-gray-50 min-h-0">
      {/* 过程 */}
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="w-7 shrink-0 border-r border-gray-200 bg-white text-gray-400 hover:text-[#1677FF]"
          title="展开左栏"
        >
          <ChevronRight className="w-4 h-4 mx-auto" />
        </button>
      ) : (
        <aside className="w-60 shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-3 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">过程</span>
            <button onClick={() => setCollapsed(true)} className="text-gray-300 hover:text-gray-500" title="收起">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {agent.quick_questions?.length > 0 && (
            <section>
              <h4 className="text-xs font-medium text-gray-500 mb-2">快捷问题</h4>
              <div className="space-y-1.5">
                {agent.quick_questions.map(question => (
                  <button
                    key={question}
                    onClick={() => void ask(question)}
                    disabled={busy}
                    className="w-full text-left px-2 py-1.5 rounded text-xs text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-[#1677FF] transition-colors disabled:opacity-40"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </section>
          )}

          {agent.capabilities?.length > 0 && (
            <section>
              <h4 className="text-xs font-medium text-gray-500 mb-2">能力配置</h4>
              <div className="space-y-1.5">
                {agent.capabilities.map(capability => (
                  <div key={capability.id} className="flex items-center gap-1.5 px-2 py-1.5 rounded bg-gray-50 text-xs text-gray-600">
                    <Wrench className="w-3 h-3 text-gray-400 shrink-0" />
                    <span className="truncate">{capability.name}</span>
                  </div>
                ))}
              </div>
              {/* 方案 §2 记在案的技术债：这里跟 CowAgent 实际挂载的工具不绑定 */}
              <p className="text-[10px] text-gray-400 mt-1.5 leading-4">
                此处为展示用，实际工具在 Evo-Harness 中配置。
              </p>
            </section>
          )}

          <section>
            <h4 className="text-xs font-medium text-gray-500 mb-2">本轮执行进度</h4>
            {!latest || (latest.phases.length === 0 && latest.tools.length === 0 && latest.unknown.length === 0) ? (
              <p className="text-[11px] text-gray-400 leading-4">
                {latest?.status === 'running' ? '已发出，还没收到执行事件' : '还没有执行事件'}
              </p>
            ) : (
              <div className="space-y-1.5">
                {latest.phases.map(phase => (
                  <div key={phase} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                    {phase}
                  </div>
                ))}
                {latest.tools.map(tool => (
                  <div key={tool.callId} className="flex items-start gap-1.5 text-[11px]">
                    {tool.status === 'running'
                      ? <Loader2 className="w-3 h-3 text-[#1677FF] animate-spin shrink-0 mt-0.5" />
                      : tool.status === 'error'
                        ? <AlertCircle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
                        : <Check className="w-3 h-3 text-green-600 shrink-0 mt-0.5" />}
                    <span className={clsx('min-w-0', tool.status === 'error' ? 'text-red-600' : 'text-gray-600')}>
                      {tool.label}
                      {tool.detail && <span className="block text-gray-400 truncate">{tool.detail}</span>}
                    </span>
                  </div>
                ))}
                {latest.unknown.map((event, index) => (
                  <details key={index} className="text-[11px] text-gray-400">
                    <summary className="cursor-pointer">兼容事件：{String(event.type ?? 'unknown')}</summary>
                    <pre className="mt-1 p-1.5 bg-gray-50 rounded overflow-x-auto text-[10px]">
                      {JSON.stringify(event, null, 2)}
                    </pre>
                  </details>
                ))}
              </div>
            )}
          </section>
        </aside>
      )}

      {/* 交流 */}
      <section className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-200">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-800 truncate">{agent.name}</h2>
            <p className="text-xs text-gray-400 truncate">{agent.description}</p>
          </div>
          <button
            onClick={() => {
              setSession(`oa-agent-${agent.id}-${Date.now()}`)
              setTurns([])
              setCanvas([])
            }}
            className="px-2.5 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded transition-colors shrink-0"
          >
            新对话
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {turns.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-10">问点什么吧。</p>
          )}
          {turns.map(turn => (
            <div key={turn.id} className="space-y-2">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-lg bg-[#1677FF] text-white px-3 py-2 text-sm whitespace-pre-wrap">
                  {turn.question}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg bg-white shadow-sm px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap">
                  {turn.answer || (turn.status === 'running' ? '…' : '')}
                  {turn.status === 'error' && (
                    <span className="block text-red-600 text-xs mt-1">{turn.error}</span>
                  )}
                  {turn.status === 'cancelled' && (
                    <span className="block text-gray-400 text-xs mt-1">本轮已取消</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={bottom} />
        </div>

        <form
          onSubmit={event => { event.preventDefault(); void ask(text) }}
          className="flex items-center gap-2 p-3 bg-white border-t border-gray-200"
        >
          <input
            aria-label="对话消息"
            value={text}
            onChange={event => setText(event.target.value)}
            placeholder="说点什么…"
            className="flex-1 min-w-0 rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF]/30"
          />
          <button
            disabled={busy || !text.trim()}
            className="px-4 py-2 rounded bg-[#1677FF] text-white text-sm hover:bg-[#0e5fd8] transition-colors disabled:opacity-40 shrink-0"
          >
            发送
          </button>
        </form>
      </section>

      {/* 结果：没产物时不占地方，对话区变宽（方案 §6.7） */}
      {canvas.length > 0 && (
        <aside className="w-[420px] xl:w-[520px] shrink-0 border-l border-gray-200 bg-gray-50 overflow-y-auto p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">结果</span>
            <span className="text-[11px] text-gray-400">{canvas.length} 张</span>
          </div>
          {canvas.map(item => item.kind === 'view' ? (
            <ViewCard
              key={item.id}
              title={item.data.title}
              data={item.data}
              onClose={() => setCanvas(current => current.filter(entry => entry.id !== item.id))}
            />
          ) : (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-3 flex items-center gap-2">
              <Download className="w-4 h-4 text-[#1677FF] shrink-0" />
              <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-[#1677FF] hover:underline truncate flex-1">
                {item.name}
              </a>
              <button
                onClick={() => setCanvas(current => current.filter(entry => entry.id !== item.id))}
                className="text-gray-300 hover:text-gray-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </aside>
      )}
    </div>
  )
}
