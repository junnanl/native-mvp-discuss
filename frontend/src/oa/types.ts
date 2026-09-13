export type User = { id: number; name: string; role: string }

export type Field = {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'date'
  options?: string[]
  required?: boolean
}

export type FormDef = { id: number; name: string; fields: Field[] }

export type Node = { key: string; name: string; type: string; role?: string; form_id?: number }

export type FlowDef = { id: number; name: string; nodes: Node[]; form?: FormDef | null }

export type Instance = {
  id: number
  flow_def_id: number
  current_node: string
  status: string
  creator_id: number
  data: Record<string, unknown>
  created_at: string
  finished_at: string | null
}

export type Todo = {
  id: number
  title: string
  kind: string
  flow_name: string
  status: string
  created_at: string
}

export type Agent = {
  id: number
  name: string
  description: string
  avatar: string | null
  category: string
  maturity: string | null
  tags: string[]
  quick_questions: string[]
  capabilities: { id: string; name: string; type: string; icon?: string }[]
  skill_md: string | null
  status: string
  usage_count: number
  flow_instance_id: number | null
}

export type ViewSpec = {
  key: string
  component: 'metric' | 'chart' | 'table' | 'graph' | 'text'
  title: string
  answers: string
  filters: string[]
}

/** 五类固定组件的数据契约（方案 §6.6）。组件不关心数据从哪来。 */
export type ViewData =
  | { component: 'metric'; title: string; value: number; unit?: string; change_label?: string; change_value?: number }
  | { component: 'chart'; title: string; type: 'line' | 'bar' | 'pie' | 'scatter'; categories: string[]; series: { name: string; data: number[] }[] }
  | { component: 'table'; title: string; columns: { key: string; label: string }[]; rows: Record<string, unknown>[]; page: number; page_size: number; total: number }
  | { component: 'graph'; title: string; nodes: { id: string; label: string; type?: string }[]; edges: { source: string; target: string; label?: string; weight?: number }[] }
  | { component: 'text'; title: string; markdown: string }

/** 画布上的一张产物：视图 key + 当前查询条件，数据由组件自己去取。 */
export type Artifact = { id: string; view: string; title: string; component: ViewSpec['component']; query: Record<string, string> }

/** 对话页左栏「本轮执行进度」的一行，来自 CowAgent 的真实工具事件。 */
export type ToolStep = {
  callId: string
  tool: string
  label: string
  status: 'running' | 'done' | 'error'
  detail: string
}

export type HarnessEvent =
  | { type: 'delta' | 'reasoning' | 'phase' | 'message_end' | 'done' | 'cancelled' | 'error'; content?: string }
  | { type: 'file' | 'image'; content?: string; file_name?: string }
  | { type: 'tool_start' | 'tool_progress' | 'tool_end'; tool: string; label: string; call_id: string; detail?: string; status?: string }
  | { type: 'unknown'; raw: Record<string, unknown> }
