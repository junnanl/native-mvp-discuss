import { useState, useEffect, useRef } from 'react'
import { Check, RotateCcw, Save, ChevronDown, ChevronRight, Plus, X as XIcon } from 'lucide-react'
import ProjectFlowNav from '@/components/ProjectFlowNav'
import FileUpload from '@/components/FileUpload'
import PersonPicker from '@/components/PersonPicker'
import {
  customerInfo,
  opportunityInfo,
  handlerOptions,
  flowNodeLabels,
  milestoneNodeOptions,
  initialMilestones,
  teamRoleOptions,
  teamMemberLibrary,
  initialTeam,
  initialStdProducts,
  initialItTasks,
  initialContracts,
  itTaskTypeOptions,
  InfoCard,
  ReadOnlyField,
  SubSectionHeader,
  HeaderAction,
  RowAction,
  DataTable,
  SimplePager
} from '@/components/PlanShared'
import type { MilestoneRow, TeamMember, ItTaskRow, StandardProductRow } from '@/components/PlanShared'
import { useModal } from '@/components/Modal'

interface ProjectPlanProps {
  onNavigate?: (path: string) => void
  todoId?: string
}

// 流程信息
const nextNode = '项目启动与规划审核'
const defaultNextHandler = '张大伟'

// ============== 各子区块 ==============

// 里程碑计划
// 交互：
// 1. 点击"新增里程碑"按钮 → 下拉展示未选的枚举值
// 2. 点击枚举项 → 自动追加到列表（名称只读、时间可编辑）
// 3. 必选项（开工/终验）不允许删除
// 4. 已选的枚举值在下拉中不再出现
function MilestonePlan() {
  const [rows, setRows] = useState<MilestoneRow[]>(initialMilestones)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉
  useEffect(() => {
    if (!dropdownOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownOpen])

  const updateRow = (id: string, field: 'start' | 'end', value: string) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }
  const removeRow = (id: string) => {
    setRows(prev => prev.filter(r => r.id !== id))
  }
  const addMilestone = (opt: { value: string; label: string; required?: boolean }) => {
    setRows(prev => {
      const newRow: MilestoneRow = {
        id: `m-${opt.value}-${Date.now()}`,
        value: opt.value,
        label: opt.label,
        start: '',
        end: '',
        required: !!opt.required
      }
      // 按 milestoneNodeOptions 数组顺序插入到正确位置（无视添加顺序）
      const optIdx = milestoneNodeOptions.findIndex(o => o.value === opt.value)
      let insertIdx = prev.length
      for (let i = 0; i < prev.length; i++) {
        const ri = milestoneNodeOptions.findIndex(o => o.value === prev[i].value)
        if (ri > optIdx) {
          insertIdx = i
          break
        }
      }
      return [...prev.slice(0, insertIdx), newRow, ...prev.slice(insertIdx)]
    })
    setDropdownOpen(false)
  }

  // 可选的枚举值：当前 rows 中没有出现过的 value
  const availableOptions = milestoneNodeOptions.filter(o => !rows.some(r => r.value === o.value))

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
          <h3 className="text-sm font-semibold text-gray-800">里程碑计划</h3>
        </div>
        {/* 新增里程碑（蓝底白字 + 下拉箭头 + 下拉面板） */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(o => !o)}
            disabled={availableOptions.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-white bg-[#1677FF] border border-[#1677FF] rounded hover:bg-[#1668DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
            新增里程碑
            <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && availableOptions.length > 0 && (
            <div className="absolute z-20 top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1">
              {availableOptions.map(o => (
                <div
                  key={o.value}
                  onClick={() => addMilestone(o)}
                  className="px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-[#1677FF] cursor-pointer"
                >
                  {o.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <DataTable
        columns={[
          { key: 'label', title: '里程碑节点', width: '20%' },
          { key: 'start', title: '计划开始时间', width: '20%' },
          { key: 'end', title: '计划结束时间', width: '20%' },
          { key: 'op', title: '操作', width: '10%', align: 'center' }
        ]}
        rows={rows.map(r => [
          // 里程碑名称只读（不允许修改）
          <span key="label" className="text-sm text-gray-800">{r.label}</span>,
          <input
            key="start"
            type="date"
            value={r.start}
            onChange={(e) => updateRow(r.id, 'start', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
          />,
          <input
            key="end"
            type="date"
            value={r.end}
            onChange={(e) => updateRow(r.id, 'end', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
          />,
          <div key="op" className="text-center">
            {r.required ? (
              <span className="text-xs text-gray-400">必选</span>
            ) : (
              <RowAction onClick={() => removeRow(r.id)}>删除</RowAction>
            )}
          </div>
        ])}
      />
    </div>
  )
}

// 售中团队组建
// 交互：
// - 展示态：所有字段只读，操作 = [编辑] [删除]
// - 编辑态（点击编辑/新增触发）：成员姓名 PersonPicker 自动带出其他字段；操作 = [取消] [保存]
// - 删除：自定义 confirm 弹窗二次确认
function TeamBuilding() {
  const { confirm, alert } = useModal()
  const [team, setTeam] = useState<TeamMember[]>(initialTeam)
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)   // 某个 m.id 表示编辑该行；'new' 表示新增
  const [draft, setDraft] = useState<TeamMember | null>(null)
  const total = 14
  const pageSize = 5

  // 可选人员：人员库中未被其他（非当前编辑行）team 成员占用的人员
  const getAvailableOptions = (currentName?: string): { name: string; dept: string }[] => {
    return teamMemberLibrary
      .filter(p => p.name === currentName || !team.some(m => m.name === p.name))
      .map(p => ({ name: p.name, dept: p.dept }))
  }

  const handleAdd = () => {
    setEditingId('new')
    setDraft({
      id: `t-new-${Date.now()}`,
      name: '',
      account: '',
      dept: '',
      role: '交付人员',
      phone: ''
    })
  }

  const handleEdit = (m: TeamMember) => {
    setEditingId(m.id)
    setDraft({ ...m })
  }

  const handleCancel = () => {
    setEditingId(null)
    setDraft(null)
  }

  const handleSave = async () => {
    if (!draft) return
    if (!draft.name) {
      await alert('请选择成员姓名')
      return
    }
    if (editingId === 'new') {
      setTeam(prev => [...prev, draft])
    } else {
      setTeam(prev => prev.map(m => m.id === editingId ? draft : m))
    }
    setEditingId(null)
    setDraft(null)
  }

  // 姓名变化：自动从人员库带出账号/部门/电话
  const handleNameChange = (name: string) => {
    if (!draft) return
    const lib = teamMemberLibrary.find(t => t.name === name)
    if (lib) {
      setDraft({ ...draft, name, account: lib.account, dept: lib.dept, phone: lib.phone })
    } else {
      setDraft({ ...draft, name, account: '', dept: '', phone: '' })
    }
  }

  const handleDelete = async (m: TeamMember) => {
    const ok = await confirm(`你确定要删除团队成员【${m.name}】吗？`, '删除确认')
    if (ok) {
      setTeam(prev => prev.filter(t => t.id !== m.id))
    }
  }

  // 渲染单行（展示态 / 编辑态）
  // 注意：账号 / 归属部门 / 联系电话 始终只读，只能通过 PersonPicker 选择姓名后自动带出
  // 展示态（editing=false）下，账号 / 归属部门 / 联系电话 / 团队角色 直接展示文字，无边框
  const renderRow = (m: TeamMember, forceEditing = false) => {
    const editing = forceEditing || editingId === m.id
    return [
      editing ? (
        <PersonPicker
          key="name"
          value={m.name}
          onChange={handleNameChange}
          options={getAvailableOptions(m.name)}
          placeholder="--请选择--"
          size="sm"
        />
      ) : (
        <span key="n" className="text-[#1677FF] cursor-pointer hover:underline">{m.name}</span>
      ),
      // 账号：编辑态只读 input；展示态直接展示文字
      editing ? (
        <input
          key="account"
          type="text"
          value={m.account}
          readOnly
          className="w-full px-2 py-1 text-sm border border-gray-200 bg-gray-50 text-gray-700 rounded cursor-not-allowed"
        />
      ) : (
        <span key="account-d" className="text-sm text-gray-700">{m.account || '—'}</span>
      ),
      // 归属部门：编辑态只读 input；展示态直接展示文字
      editing ? (
        <input
          key="dept"
          type="text"
          value={m.dept}
          readOnly
          className="w-full px-2 py-1 text-sm border border-gray-200 bg-gray-50 text-gray-700 rounded cursor-not-allowed"
        />
      ) : (
        <span key="dept-d" className="text-sm text-gray-700">{m.dept || '—'}</span>
      ),
      // 联系电话：编辑态只读 input；展示态直接展示文字
      editing ? (
        <input
          key="phone"
          type="text"
          value={m.phone}
          readOnly
          className="w-full px-2 py-1 text-sm border border-gray-200 bg-gray-50 text-gray-700 rounded cursor-not-allowed"
        />
      ) : (
        <span key="phone-d" className="text-sm text-gray-700">{m.phone || '—'}</span>
      ),
      // 团队角色：编辑态 select；展示态直接展示文字
      editing ? (
        <select
          key="role"
          value={m.role}
          onChange={(e) => setDraft(prev => prev ? { ...prev, role: e.target.value as typeof teamRoleOptions[number] } : prev)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
        >
          {teamRoleOptions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      ) : (
        <span key="role-d" className="text-sm text-gray-700">{m.role}</span>
      ),
      <div key="op" className="flex items-center justify-center gap-1.5">
        {editing ? (
          <>
            <RowAction onClick={handleCancel}>取消</RowAction>
            <RowAction onClick={handleSave}>保存</RowAction>
          </>
        ) : (
          <>
            <RowAction onClick={() => handleEdit(m)}>编辑</RowAction>
            <RowAction onClick={() => handleDelete(m)}>删除</RowAction>
          </>
        )}
      </div>
    ]
  }

  // 新增态临时行
  const isNew = editingId === 'new' && draft
  const displayRows = isNew
    ? [...team.map(m => renderRow(m)), renderRow(draft!, true)]
    : team.map(m => renderRow(m))

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <SubSectionHeader
        title="售中团队组建"
        actions={
          <HeaderAction icon={<Plus className="w-3 h-3" />} onClick={handleAdd} disabled={editingId !== null}>
            新增成员
          </HeaderAction>
        }
      />
      <DataTable
        columns={[
          { key: 'name', title: '成员姓名' },
          { key: 'account', title: '账号' },
          { key: 'dept', title: '归属部门' },
          { key: 'phone', title: '联系电话' },
          { key: 'role', title: '团队角色' },
          { key: 'op', title: '操作', width: '140px', align: 'center' }
        ]}
        rows={displayRows}
      />
      <SimplePager total={total} pageSize={pageSize} page={page} onChange={setPage} />
    </div>
  )
}

// 项目计划子区块
function ProjectPlanBlock() {
  // IT 任务列表（可新增）
  const [itTasks, setItTasks] = useState<ItTaskRow[]>(initialItTasks)
  const [itTaskModalOpen, setItTaskModalOpen] = useState(false)

  const handleAddItTask = (task: Omit<ItTaskRow, 'id'>) => {
    setItTasks(prev => [...prev, { ...task, id: `it-${Date.now()}` }])
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
      <SubSectionHeader title="项目计划" />

      {/* CT 任务 */}
      <div>
        <SubSectionHeader
          title="CT任务"
          variant="sub"
          actions={
            <HeaderAction icon={<Plus className="w-3 h-3" />} onClick={() => alert('演示：新增CT任务')}>
              新增
            </HeaderAction>
          }
        />
        <DataTable
          columns={[
            { key: 'name', title: '产品名称' },
            { key: 'code', title: '产品编码' },
            { key: 'qty', title: '产品数量' },
            { key: 'start', title: '交付开始时间' },
            { key: 'end', title: '交付结束时间' },
            { key: 'addr', title: '任务处理地址' },
            { key: 'owner', title: '负责人' },
            { key: 'op', title: '操作', width: '120px', align: 'center' }
          ]}
          rows={initialStdProducts.map(p => [
            <span key="n" className="text-[#1677FF] cursor-pointer hover:underline">{p.name}</span>,
            p.code, p.qty, p.start, p.end, p.addr, p.owner,
            <div key="op" className="flex items-center justify-center gap-1.5">
              <RowAction onClick={() => alert('演示：编辑')}>编辑</RowAction>
              <RowAction onClick={() => alert('演示：删除')}>删除</RowAction>
            </div>
          ])}
        />
      </div>

      {/* IT 任务 */}
      <div>
        <SubSectionHeader
          title="IT任务"
          variant="sub"
          actions={
            <HeaderAction
              icon={<Plus className="w-3 h-3" />}
              onClick={() => setItTaskModalOpen(true)}
            >
              新增
            </HeaderAction>
          }
        />
        <DataTable
          columns={[
            { key: 'name', title: '任务名称' },
            { key: 'type', title: '任务类型' },
            { key: 'start', title: '交付开始时间' },
            { key: 'end', title: '交付结束时间' },
            { key: 'desc', title: '任务描述' },
            { key: 'owner', title: '负责人' },
            { key: 'op', title: '操作', width: '120px', align: 'center' }
          ]}
          rows={itTasks.map(t => [
            <span key="n" className="text-[#1677FF] cursor-pointer hover:underline">{t.name}</span>,
            t.type, t.start, t.end, t.desc, t.owner,
            <div key="op" className="flex items-center justify-center gap-1.5">
              <RowAction onClick={() => alert('演示：编辑')}>编辑</RowAction>
              <RowAction onClick={() => alert('演示：删除')}>删除</RowAction>
            </div>
          ])}
        />
      </div>

      {/* 新增 IT 任务 弹窗 */}
      <ItTaskCreateModal
        open={itTaskModalOpen}
        onClose={() => setItTaskModalOpen(false)}
        onSubmit={handleAddItTask}
      />
    </div>
  )
}

// IT 任务负责人可选人员（与团队成员库共享）
const itTaskOwnerOptions = teamMemberLibrary.map(p => ({ name: p.name, dept: p.dept }))

// 新增 IT 任务 弹窗
function ItTaskCreateModal({
  open,
  onClose,
  onSubmit
}: {
  open: boolean
  onClose: () => void
  onSubmit: (task: Omit<ItTaskRow, 'id'>) => void
}) {
  const { alert } = useModal()
  const [type, setType] = useState('')
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [owner, setOwner] = useState('')

  // 关闭时重置
  useEffect(() => {
    if (!open) {
      setType('')
      setName('')
      setDesc('')
      setStart('')
      setEnd('')
      setOwner('')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async () => {
    if (!type) { await alert('请选择任务类型'); return }
    if (!name.trim()) { await alert('请输入任务名称'); return }
    if (!desc.trim()) { await alert('请输入任务描述'); return }
    if (!start) { await alert('请选择交付开始时间'); return }
    if (!end) { await alert('请选择交付结束时间'); return }
    if (!owner) { await alert('请选择负责人'); return }
    onSubmit({ type, name: name.trim(), desc: desc.trim(), start, end, owner })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-md shadow-xl w-[760px] max-w-[95vw] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#1677FF] text-white rounded-t-md shrink-0">
          <h3 className="text-sm font-semibold">新增IT任务</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-white/90 hover:text-white"
            aria-label="关闭"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="flex items-start">
            <label className="w-28 text-right pr-3 pt-1.5 text-sm text-gray-700 shrink-0">
              <span className="text-red-500 mr-0.5">*</span>任务类型：
            </label>
            <div className="flex-1">
              <select
                value={type}
                onChange={(e) => {
                  const v = e.target.value
                  setType(v)
                  // 选择任务类型后，自动把类型名称带入任务名称
                  if (v) setName(v)
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">--请选择--</option>
                {itTaskTypeOptions.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-28 text-right pr-3 pt-1.5 text-sm text-gray-700 shrink-0">
              <span className="text-red-500 mr-0.5">*</span>任务名称：
            </label>
            <div className="flex-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入任务名称"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-28 text-right pr-3 pt-1.5 text-sm text-gray-700 shrink-0">
              <span className="text-red-500 mr-0.5">*</span>任务描述：
            </label>
            <div className="flex-1">
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="请输入任务描述"
                rows={4}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-y"
              />
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-28 text-right pr-3 pt-1.5 text-sm text-gray-700 shrink-0">
              <span className="text-red-500 mr-0.5">*</span>交付起止时间：
            </label>
            <div className="flex-1 flex items-center gap-2">
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
              <span className="text-sm text-gray-500 shrink-0">至</span>
              <input
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-28 text-right pr-3 pt-1.5 text-sm text-gray-700 shrink-0">
              <span className="text-red-500 mr-0.5">*</span>负责人：
            </label>
            <div className="flex-1">
              <PersonPicker
                value={owner}
                onChange={setOwner}
                options={itTaskOwnerOptions}
                placeholder="请选择负责人"
              />
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-center gap-3 px-5 py-3 border-t border-gray-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-8 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}

// 支出合同（只读列表）
function ExpenseContracts() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <SubSectionHeader title="支出合同" />
      <DataTable
        columns={[
          { key: 'name', title: '合同名称' },
          { key: 'flowNo', title: '合同流水号' },
          { key: 'code', title: '合同编码' },
          { key: 'type', title: '收支类型' },
          { key: 'nature', title: '合同性质' },
          { key: 'amount', title: '合同金额（元，含税）' },
          { key: 'period', title: '合同期数（月）' },
          { key: 'status', title: '状态' },
          { key: 'create', title: '创建时间' },
          { key: 'sign', title: '签约时间' },
          { key: 'op', title: '操作', width: '80px', align: 'center' }
        ]}
        rows={initialContracts.map(c => [
          <span key="n" className="text-[#1677FF] cursor-pointer hover:underline">{c.name}</span>,
          c.flowNo, c.code, c.type, c.nature, c.amount, c.period, c.status, c.createTime, c.signTime,
          <div key="op" className="text-center">
            <RowAction onClick={() => alert('演示：合同详情')}>详情</RowAction>
          </div>
        ])}
      />
    </div>
  )
}

// 实施方案
function ImplementationFiles() {
  const [files, setFiles] = useState<string[]>([
    '昆明市工商银行智能监控系统实施方案.doc'
  ])
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <SubSectionHeader title="实施方案" />
      <div className="flex items-start">
        <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2 pt-2">
          <span className="text-red-500 mr-0.5">*</span>项目实施方案
        </label>
        <div className="flex-1 min-w-0">
          <FileUpload
            hideLabel
            files={files}
            onAdd={() => setFiles(prev => [...prev, `实施方案附件${prev.length + 1}.doc`])}
            onRemove={(idx) => setFiles(prev => prev.filter((_, i) => i !== idx))}
          />
        </div>
      </div>
    </div>
  )
}

// 其他流程节点内容（占位）
function FlowNodeContent({ nodeKey, onExpandBusiness }: { nodeKey: string; onExpandBusiness: () => void }) {
  const label = flowNodeLabels[nodeKey] || '当前阶段'
  if (nodeKey === 'biz') {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
          <h3 className="text-sm font-semibold text-gray-800">商机信息</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <ReadOnlyField label="商机名称" value={opportunityInfo.name} full />
          <ReadOnlyField label="商机编号" value={opportunityInfo.projectCode} />
          <ReadOnlyField label="商机等级" value={`${opportunityInfo.level} 级`} />
          <ReadOnlyField label="预估金额" value={`${opportunityInfo.estimatedAmount} 万元`} />
          <ReadOnlyField label="商机负责人" value={opportunityInfo.owner} />
          <ReadOnlyField label="创建时间" value={opportunityInfo.createTime} />
        </div>
        <div className="mt-3 text-center">
          <button type="button" onClick={onExpandBusiness} className="text-xs text-[#1677FF] hover:underline">
            查看完整商机信息 ↑
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">{label}信息</h3>
      </div>
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-sm text-gray-500 mb-1">{label}阶段信息展示区域</div>
        <div className="text-xs text-gray-400">该阶段相关业务数据将在此处展示</div>
      </div>
    </div>
  )
}

// ============== 主页面 ==============
export default function ProjectPlan({ onNavigate, todoId }: ProjectPlanProps) {
  const { confirm, alert } = useModal()
  const [selectedNextHandler, setSelectedNextHandler] = useState(defaultNextHandler)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: false,
    business: false
  })
  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }
  const [activeFlowNode, setActiveFlowNode] = useState('kickoff')

  const handleCancel = () => onNavigate?.('/dashboard')
  const handleSave = async () => { await alert('草稿已保存（演示）') }
  const handleSubmit = async () => {
    const ok = await confirm('确认提交项目启动与规划？')
    if (ok) {
      onNavigate?.(`/my/todo/project-plan-review/${todoId ?? 'new'}`)
    }
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 1. 客户信息 */}
        <InfoCard
          title="客户信息"
          expanded={expandedSections.customer}
          onToggle={() => toggleSection('customer')}
          summary={`${customerInfo.name} · ${customerInfo.contact} · ${customerInfo.phone}`}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-gray-100">
            <ReadOnlyField label="客户名称" value={customerInfo.name} />
            <ReadOnlyField label="所属行业" value={customerInfo.industry} />
            <ReadOnlyField label="联系人" value={customerInfo.contact} />
            <ReadOnlyField label="联系电话" value={customerInfo.phone} />
          </div>
        </InfoCard>

        {/* 2. 商机信息 */}
        <InfoCard
          title="商机信息"
          expanded={expandedSections.business}
          onToggle={() => toggleSection('business')}
          summary={`${opportunityInfo.name} · ${opportunityInfo.level}级 · ${opportunityInfo.estimatedAmount}万元 · 负责人：${opportunityInfo.owner}`}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-gray-100">
            <ReadOnlyField label="商机名称" value={opportunityInfo.name} full />
            <ReadOnlyField label="商机编号" value={opportunityInfo.projectCode} />
            <ReadOnlyField label="商机等级" value={`${opportunityInfo.level} 级`} />
            <ReadOnlyField label="预估金额" value={`${opportunityInfo.estimatedAmount} 万元`} />
            <ReadOnlyField label="商机负责人" value={opportunityInfo.owner} />
            <ReadOnlyField label="创建时间" value={opportunityInfo.createTime} />
          </div>
        </InfoCard>

        {/* 3. 商机进展 - 项目启动与规划表单（点击 kickoff 节点时展示） */}
        {activeFlowNode === 'kickoff' ? (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">商机进展</h3>
            </div>
            <ProjectFlowNav
              onNavigate={onNavigate}
              onNodeChange={setActiveFlowNode}
              currentNodeKey={activeFlowNode}
              embedded
            />
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
              <MilestonePlan />
              <TeamBuilding />
              <ProjectPlanBlock />
              <ExpenseContracts />
              <ImplementationFiles />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">商机进展</h3>
            </div>
            <ProjectFlowNav
              onNavigate={onNavigate}
              onNodeChange={setActiveFlowNode}
              currentNodeKey={activeFlowNode}
              embedded
            />
            <FlowNodeContent
              nodeKey={activeFlowNode}
              onExpandBusiness={() => toggleSection('business')}
            />
          </div>
        )}

        {/* 4. 流程信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">流程信息</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步环节</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {nextNode}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步处理人</label>
                <div className="flex-1 min-w-0">
                  <PersonPicker
                    value={selectedNextHandler}
                    onChange={setSelectedNextHandler}
                    options={handlerOptions}
                    placeholder="请选择下一步处理人"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. 按钮区（项目启动与规划：保存 + 提交 双按钮） */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            提交
          </button>
        </div>
      </div>
    </div>
  )
}
