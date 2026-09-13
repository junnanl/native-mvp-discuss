import { useState, useMemo } from 'react'
import { Check, RotateCcw, Save, ChevronDown, ChevronRight } from 'lucide-react'
import ProjectFlowNav from '@/components/ProjectFlowNav'
import FileUpload from '@/components/FileUpload'
import PersonPicker from '@/components/PersonPicker'
import { useModal } from '@/components/Modal'

interface ProjectKickoffProps {
  onNavigate?: (path: string) => void
  todoId?: string
}

// 客户信息（与 PreSaleSupport 保持一致）
const customerInfo = {
  name: '昆明市工商银行',
  industry: '金融',
  contact: '李明',
  phone: '13987123456'
}

// 商机信息
const opportunityInfo = {
  name: '昆明市工商银行智能监控系统',
  projectCode: 'OPP-2026-KM-001',
  level: 'A',
  estimatedAmount: '3200.00',
  owner: '周程',
  createTime: '2026-05-10 10:00',
  // 计划开工时间（用于自动计算延期天数）
  plannedKickoffDate: '2026-06-15'
}

// 流程信息
const nextNode = '项目实施'
const defaultNextHandler = '周程'

// 人员库（下一步处理人可选）
const handlerOptions = [
  { name: '周程', dept: '项目交付中心 / 昆明' },
  { name: '张凯', dept: '医卫BU / 省公司' },
  { name: '李华', dept: '政企客户部 / 昆明' },
  { name: '王强', dept: '省政企客户部' },
  { name: '陈静', dept: '项目交付中心 / 审核' }
]

// 流程子节点 key 与中文标签
const flowNodeLabels: Record<string, string> = {
  biz: '商机',
  'pre-support': '售前支撑',
  'pre-decision': '预决策',
  tender: '招投标',
  'project-init': '项目立项',
  'contract-sign': '合同签订',
  'contract-brief': '合同交底',
  kickoff: '项目启动规划',
  start: '项目开工',
  implement: '项目实施',
  'self-check': '项目自检',
  acceptance: '项目验收',
  'project-handover': '项目交维'
}

// 压缩收起式信息卡（§10.1）
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
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

// 只读字段（§10.2 无边框）
function ReadOnlyField({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`flex items-center min-h-[36px] ${full ? 'col-span-2' : ''}`}>
      <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">{label}</label>
      <div className="flex-1 min-w-0 text-sm text-gray-700">{value}</div>
    </div>
  )
}

// 流程子节点对应内容（其他阶段展示）
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

// 项目开工表单主体
function ProjectKickoffForm() {
  const [kickoffReportFiles, setKickoffReportFiles] = useState<string[]>([
    '昆明市工商银行智能监控系统开工报告.doc'
  ])
  const [kickoffDate, setKickoffDate] = useState('')
  const [delayReason, setDelayReason] = useState('')
  const [delaySolutionFiles, setDelaySolutionFiles] = useState<string[]>([
    '昆明市工商银行智能监控系统延期解决方案.doc'
  ])

  // 延期天数 = 实际开工时间 - 计划开工时间
  const delayDays = useMemo(() => {
    if (!kickoffDate) return 0
    const planned = new Date(opportunityInfo.plannedKickoffDate)
    const actual = new Date(kickoffDate)
    const diff = actual.getTime() - planned.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }, [kickoffDate])

  const handleAddReport = () => {
    setKickoffReportFiles(prev => [...prev, `开工报告附件${prev.length + 1}.doc`])
  }
  const handleRemoveReport = (idx: number) => {
    setKickoffReportFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleAddSolution = () => {
    setDelaySolutionFiles(prev => [...prev, `延期解决方案附件${prev.length + 1}.doc`])
  }
  const handleRemoveSolution = (idx: number) => {
    setDelaySolutionFiles(prev => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-5">
      {/* 项目开工小标题 */}
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h4 className="text-sm font-semibold text-gray-800">项目开工</h4>
      </div>

      {/* 开工报告 */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-start">
          <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2 pt-2">
            <span className="text-red-500 mr-0.5">*</span>开工报告
          </label>
          <div className="flex-1 min-w-0">
            <FileUpload
              hideLabel
              files={kickoffReportFiles}
              onAdd={handleAddReport}
              onRemove={handleRemoveReport}
            />
          </div>
        </div>
      </div>

      {/* 开工时间 / 延期天数 */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <div className="flex items-center min-h-[36px]">
          <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
            <span className="text-red-500 mr-0.5">*</span>开工时间
          </label>
          <div className="flex-1 min-w-0">
            <input
              type="date"
              value={kickoffDate}
              onChange={(e) => setKickoffDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
        </div>
        <div className="flex items-center min-h-[36px]">
          <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">延期天数（天）</label>
          <div className="flex-1 min-w-0">
            <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              {delayDays}
            </div>
          </div>
        </div>
      </div>

      {/* 延期原因 */}
      <div className="flex items-start">
        <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2 pt-2">延期原因</label>
        <div className="flex-1 min-w-0">
          <textarea
            value={delayReason}
            onChange={(e) => {
              if (e.target.value.length <= 250) {
                setDelayReason(e.target.value)
              }
            }}
            placeholder="请输入，最多250字"
            rows={4}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
          />
          <div className="text-xs text-gray-400 text-right mt-1">{delayReason.length}/250</div>
        </div>
      </div>

      {/* 延期解决方案 */}
      <div className="flex items-start">
        <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2 pt-2">延期解决方案</label>
        <div className="flex-1 min-w-0">
          <FileUpload
            hideLabel
            files={delaySolutionFiles}
            onAdd={handleAddSolution}
            onRemove={handleRemoveSolution}
          />
        </div>
      </div>
    </div>
  )
}

export default function ProjectKickoff({ onNavigate, todoId }: ProjectKickoffProps) {
  const [selectedNextHandler, setSelectedNextHandler] = useState(defaultNextHandler)

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: false,
    business: false
  })
  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const [activeFlowNode, setActiveFlowNode] = useState('start')

  const handleCancel = () => onNavigate?.('/dashboard')
  const handleSave = async () => { await alert('草稿已保存（演示）') }
  const handleSubmit = async () => {
    const ok = await confirm('确认提交项目开工？')
    if (ok) {
      onNavigate?.('/dashboard')
    }
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 客户信息（默认收起，§10.1 压缩样式） */}
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

        {/* 商机信息（默认收起，§10.1 压缩样式） */}
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
            <ReadOnlyField label="计划开工时间" value={opportunityInfo.plannedKickoffDate} />
          </div>
        </InfoCard>

        {/* 商机进展（流程导航 + 项目开工表单，§10.3 嵌入模式） */}
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
          {activeFlowNode === 'start' ? (
            <ProjectKickoffForm />
          ) : (
            <FlowNodeContent
              nodeKey={activeFlowNode}
              onExpandBusiness={() => toggleSection('business')}
            />
          )}
        </div>

        {/* 流程信息（§一） */}
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

        {/* 按钮区（项目开工特有：保存草稿 + 提交） */}
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
