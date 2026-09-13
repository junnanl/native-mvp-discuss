import { useState } from 'react'
import { clsx } from 'clsx'
import { Check, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react'
import ProjectFlowNav from '@/components/ProjectFlowNav'
import HandoverForm from '@/components/HandoverForm'
import { useModal } from '@/components/Modal'
import PersonPicker from '@/components/PersonPicker'

interface ContractHandoverProps {
  onNavigate?: (path: string) => void
  todoId?: string
}

// 客户信息（压缩收起用）
const customerInfo = {
  name: '合肥市第一人民医院',
  industry: '医疗卫生',
  contact: '王建国',
  phone: '13955112345'
}

// 商机信息
const opportunityInfo = {
  name: '合肥第一人民医院数智化项目',
  projectCode: 'OPP-2026-HF-001',
  level: 'S',
  estimatedAmount: '8500.00',
  owner: '张凯',
  createTime: '2026-06-01 10:30'
}

// 流程信息
const nextNode = '合同交底审核'
const defaultNextHandler = '张凯'

const handlerOptions = [
  { name: '张凯', dept: '医卫BU / 省公司' },
  { name: '李华', dept: '政企客户部 / 合肥' },
  { name: '王强', dept: '省政企客户部' },
  { name: '陈静', dept: '医卫BU / 省公司' },
  { name: '杨海波', dept: '省政企客户部 / 审核' }
]

// 流程子节点 key 与中文标签
const flowNodeLabels: Record<string, string> = {
  biz: '商机',
  'pre-support': '售前支撑',
  'pre-decision': '预决策',
  tender: '招投标',
  'project-init': '项目立项',
  'contract-sign': '合同签订',
  'contract-brief': '合同交底'
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
    <div className={clsx('flex items-center min-h-[36px]', full && 'col-span-2')}>
      <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">{label}</label>
      <div className="flex-1 min-w-0 text-sm text-gray-700">{value}</div>
    </div>
  )
}

// 流程子节点对应内容（其他阶段展示）
// 合同交底处理页的主入口（contract-brief）由 <HandoverForm /> 提供
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

export default function ContractHandover({ onNavigate, todoId }: ContractHandoverProps) {
  const { confirm } = useModal()
  const [selectedNextHandler, setSelectedNextHandler] = useState(defaultNextHandler)

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: false,
    business: false
  })
  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const [activeFlowNode, setActiveFlowNode] = useState('contract-brief')

  const handleCancel = () => onNavigate?.('/dashboard')
  const handleSubmit = async () => {
    const ok = await confirm('确认提交合同交底申请？')
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
          </div>
        </InfoCard>

        {/* 商机进展（流程导航 + 合同交底表单，§10.3 嵌入模式） */}
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
          {activeFlowNode === 'contract-brief' ? (
            <HandoverForm />
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

        {/* 按钮区（§四 + §10.4 完成合同交底） */}
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
            完成合同交底
          </button>
        </div>
      </div>
    </div>
  )
}
