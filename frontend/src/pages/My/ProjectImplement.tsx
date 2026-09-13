import { useState } from 'react'
import { clsx } from 'clsx'
import { Check, RotateCcw, ChevronDown, ChevronRight, Download, Plus, Filter, ChevronUp } from 'lucide-react'
import ProjectFlowNav from '@/components/ProjectFlowNav'
import FileUpload from '@/components/FileUpload'
import { useModal } from '@/components/Modal'
import PersonPicker from '@/components/PersonPicker'

interface ProjectImplementProps {
  onNavigate?: (path: string) => void
  todoId?: string
}

// ============== Mock 数据 ==============
const customerInfo = {
  name: '昆明市工商银行',
  industry: '金融',
  contact: '李明',
  phone: '13987123456'
}

const opportunityInfo = {
  name: '昆明市工商银行智能监控系统',
  projectCode: 'OPP-2026-KM-001',
  level: 'A',
  estimatedAmount: '3200.00',
  owner: '周程',
  createTime: '2026-05-10 10:00'
}

const nextNode = '项目自检'
const defaultNextHandler = '张大伟'

const handlerOptions = [
  { name: '张大伟', dept: '项目交付中心 / 昆明' },
  { name: '周程', dept: '项目交付中心 / 昆明' },
  { name: '张凯', dept: '医卫BU / 省公司' },
  { name: '李华', dept: '政企客户部 / 昆明' },
  { name: '陈静', dept: '项目交付中心 / 审核' }
]

const flowNodeLabels: Record<string, string> = {
  biz: '商机',
  'pre-support': '售前支撑',
  'pre-decision': '预决策',
  tender: '招投标',
  'project-init': '项目立项',
  'contract-sign': '合同签订',
  'contract-brief': '合同交底',
  kickoff: '项目启动与规划',
  start: '项目开工',
  implement: '项目实施',
  'self-check': '项目自检',
  acceptance: '项目验收',
  'project-handover': '项目交维'
}

// CT 任务数据
type CtTask = {
  id: string
  name: string
  qty: string
  start: string
  end: string
  addr: string
  owner: string
  status: '未开始' | '进行中' | '已完成' | '已中止'
  progress: number
  actualEnd: string
}
const initialCtTasks: CtTask[] = [
  { id: 'ct-1', name: '互联网专线', qty: '2', start: '2025-09-10', end: '2025-11-10', addr: 'XXXXX', owner: 'XXXXX', status: '未开始', progress: 0, actualEnd: '' },
  { id: 'ct-2', name: '移动云', qty: '1', start: '2025-09-09', end: '2025-11-09', addr: 'XXXXX', owner: 'XXXXX', status: '进行中', progress: 30, actualEnd: '' }
]

// IT 任务数据
type ItTask = {
  id: string
  name: string
  type: string
  start: string
  end: string
  desc: string
  owner: string
  status: '未开始' | '进行中' | '已完成' | '已中止'
  progress: number
  actualEnd: string
}
const initialItTasks: ItTask[] = [
  { id: 'it-1', name: 'XXX硬件安装调试', type: '硬件安装调试', start: '2025-09-10', end: '2025-11-10', desc: 'XXXXX', owner: 'XXXXX', status: '已完成', progress: 100, actualEnd: '2025-11-08' },
  { id: 'it-2', name: 'XXXXX系统软件研发', type: '软件研发', start: '2025-09-09', end: '2025-11-09', desc: 'XXXXX', owner: 'XXXXX', status: '已完成', progress: 100, actualEnd: '2025-11-09' }
]

// 状态颜色配置
const statusColorMap: Record<string, string> = {
  '未开始': 'text-gray-500',
  '进行中': 'text-blue-600',
  '已完成': 'text-green-600',
  '已中止': 'text-orange-600'
}

// ============== 通用子组件 ==============

function InfoCard({
  title,
  expanded,
  onToggle,
  summary,
  children
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  summary: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div
        className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-50 px-4 py-2 rounded-lg"
        onClick={onToggle}
      >
        <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
        <h3 className="text-xs font-semibold text-gray-800">{title}</h3>
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        }
        {!expanded && (
          <span className="ml-2 text-xs text-gray-400 truncate">{summary}</span>
        )}
      </div>
      {expanded && (
        <div className="px-4 pb-4">{children}</div>
      )}
    </div>
  )
}

function ReadOnlyField({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`flex items-center min-h-[36px] ${full ? 'col-span-2' : ''}`}>
      <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">{label}</label>
      <div className="flex-1 min-w-0 text-sm text-gray-700">{value}</div>
    </div>
  )
}

function SubSectionHeader({
  title,
  actions
}: {
  title: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

function HeaderAction({ icon, children, onClick }: { icon?: React.ReactNode; children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded hover:bg-blue-50 transition-colors"
    >
      {icon}
      {children}
    </button>
  )
}

function RowAction({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center px-2 py-0.5 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded hover:bg-blue-50 transition-colors"
    >
      {children}
    </button>
  )
}

// 进度条
function ProgressBar({ percent = 0 }: { percent: number }) {
  return (
    <div className="flex items-center gap-2 w-full max-w-[200px]">
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1677FF] rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 shrink-0">{percent}%</span>
    </div>
  )
}

// 通用表格
function DataTable({ columns, rows }: { columns: { key: string; title: string; width?: string; align?: 'left' | 'center' | 'right'; sortable?: boolean }[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-3 py-2 text-xs font-medium text-gray-700 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                style={col.width ? { width: col.width } : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.title}
                  {col.sortable && <Filter className="w-3 h-3 text-[#1677FF]" />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, rIdx) => (
            <tr key={rIdx} className="border-t border-gray-100 hover:bg-gray-50/50">
              {cells.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-sm text-gray-700 align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ============== 各子区块 ==============

// 任务进度管理
function TaskProgress() {
  const [ctTasks, setCtTasks] = useState<CtTask[]>(initialCtTasks)
  const [itTasks, setItTasks] = useState<ItTask[]>(initialItTasks)

  // 整体进度：CT 与 IT 任务平均
  const overallProgress = Math.round(
    (ctTasks.reduce((s, t) => s + t.progress, 0) + itTasks.reduce((s, t) => s + t.progress, 0)) /
    (ctTasks.length + itTasks.length)
  )

  return (
    <div className="space-y-3">
      {/* Tab + 进度条 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-6 border-b border-gray-200 -mx-1 px-1 mb-4">
          <button type="button" className="relative pb-2 text-sm font-semibold text-[#1677FF]">
            任务进度管理
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677FF]" />
          </button>
          <button type="button" className="pb-2 text-sm text-gray-500 hover:text-gray-700">
            周报管理
          </button>
        </div>

        <div className="flex items-center gap-3">
          <ProgressBar percent={overallProgress} />
          <button
            type="button"
            onClick={() => alert('演示：查看甘特图')}
            className="px-3 py-1 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded hover:bg-blue-50"
          >
            查看甘特图
          </button>
        </div>
      </div>

      {/* CT 任务 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <SubSectionHeader
          title="CT任务"
          actions={
            <>
              <HeaderAction icon={<Download className="w-3 h-3" />} onClick={() => alert('演示：导出')}>导出</HeaderAction>
              <HeaderAction icon={<Plus className="w-3 h-3" />} onClick={() => alert('演示：新增CT任务')}>新增</HeaderAction>
            </>
          }
        />
        <DataTable
          columns={[
            { key: 'name', title: '产品名称' },
            { key: 'qty', title: '产品数量' },
            { key: 'start', title: '交付开始时间' },
            { key: 'end', title: '交付结束时间' },
            { key: 'addr', title: '任务处理地址' },
            { key: 'owner', title: '负责人' },
            { key: 'status', title: '当前状态', sortable: true },
            { key: 'progress', title: '当前进度' },
            { key: 'actual', title: '实际完成时间' },
            { key: 'op', title: '操作', width: '150px', align: 'center' }
          ]}
          rows={ctTasks.map(t => [
            <span key="n" className="text-[#1677FF] cursor-pointer hover:underline">{t.name}</span>,
            t.qty, t.start, t.end, t.addr, t.owner,
            <span key="s" className={clsx(statusColorMap[t.status])}>{t.status}</span>,
            <ProgressBar key="p" percent={t.progress} />,
            t.actualEnd || '-',
            <div key="op" className="flex items-center justify-center gap-1.5">
              <RowAction onClick={() => alert('演示：更新进度')}>更新进度</RowAction>
              {t.status === '未开始' || t.status === '进行中' ? (
                <RowAction onClick={() => setCtTasks(prev => prev.map(x => x.id === t.id ? { ...x, status: '已中止' } : x))}>删除</RowAction>
              ) : (
                <RowAction onClick={() => setCtTasks(prev => prev.filter(x => x.id !== t.id))}>删除</RowAction>
              )}
            </div>
          ])}
        />
      </div>

      {/* IT 任务 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <SubSectionHeader
          title="IT任务"
          actions={
            <>
              <HeaderAction icon={<Download className="w-3 h-3" />} onClick={() => alert('演示：导出')}>导出</HeaderAction>
              <HeaderAction icon={<Plus className="w-3 h-3" />} onClick={() => alert('演示：新增IT任务')}>新增</HeaderAction>
            </>
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
            { key: 'status', title: '当前状态', sortable: true },
            { key: 'progress', title: '当前进度' },
            { key: 'actual', title: '实际完成时间' },
            { key: 'op', title: '操作', width: '90px', align: 'center' }
          ]}
          rows={itTasks.map(t => [
            <span key="n" className="text-[#1677FF] cursor-pointer hover:underline">{t.name}</span>,
            t.type, t.start, t.end, t.desc, t.owner,
            <span key="s" className={clsx(statusColorMap[t.status])}>{t.status}</span>,
            <ProgressBar key="p" percent={t.progress} />,
            t.actualEnd,
            <div key="op" className="text-center">
              <RowAction onClick={() => alert('演示：查看')}>查看</RowAction>
            </div>
          ])}
        />
      </div>
    </div>
  )
}

// 实施报告附件
function ImplementReport() {
  const [files, setFiles] = useState<string[]>([
    '昆明市工商银行智能监控系统实施报告.docx'
  ])
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <SubSectionHeader title="实施报告" />
      <div className="flex items-start">
        <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2 pt-2">
          <span className="text-red-500 mr-0.5">*</span>项目实施报告
        </label>
        <div className="flex-1 min-w-0">
          <FileUpload
            hideLabel
            files={files}
            onAdd={() => setFiles(prev => [...prev, `实施报告附件${prev.length + 1}.docx`])}
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
export default function ProjectImplement({ onNavigate, todoId }: ProjectImplementProps) {
  const [selectedNextHandler, setSelectedNextHandler] = useState(defaultNextHandler)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: false,
    business: false
  })
  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }
  const [activeFlowNode, setActiveFlowNode] = useState('implement')

  const handleCancel = () => onNavigate?.('/dashboard')
  const handleSubmit = async () => {
    const ok = await confirm('确认完成项目实施？')
    if (ok) {
      onNavigate?.('/dashboard')
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

        {/* 3. 商机进展 - 项目实施表单 */}
        {activeFlowNode === 'implement' ? (
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
              <TaskProgress />
              <ImplementReport />
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

        {/* 5. 按钮区（§10.4 完成项目实施） */}
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
            onClick={handleSubmit}
            className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            完成项目实施
          </button>
        </div>
      </div>
    </div>
  )
}
