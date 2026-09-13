import { useState } from 'react'
import { clsx } from 'clsx'
import { Check, RotateCcw, ChevronDown, ChevronRight, Plus, Eye } from 'lucide-react'
import ProjectFlowNav from '@/components/ProjectFlowNav'
import HandoverForm from '@/components/HandoverForm'
import PersonPicker from '@/components/PersonPicker'
import {
  supportOrdersData,
  supportTypeLabels,
  supportStatusConfig,
  SupportType
} from '@/data/supportOrders'

interface PreSaleSupportProps {
  onNavigate?: (path: string) => void
  todoId?: string
}

// 客户信息
const customerInfo = {
  name: '合肥市第一人民医院',
  industry: '医疗卫生',
  level: 'A级客户',
  contact: '王建国',
  phone: '13955112345',
  address: '安徽省合肥市庐阳区淮河路 388 号'
}

// 商机信息
const opportunityInfo = {
  name: '合肥第一人民医院数智化项目',
  projectCode: 'OPP-2026-HF-001',
  level: 'S',
  estimatedAmount: '8500.00',  // 万元
  provBu: '医卫',
  cityBu: '医卫',
  secrecyLevel: 'secret',
  owner: '张凯',
  createTime: '2026-06-01 10:30'
}

// 流程信息（统一格式：与商机录入的流程信息一致）
const nextNode = '预决策'
const nextHandler = '张凯'

// 人员库（下一步处理人可选）
const handlerOptions = [
  { name: '张凯', dept: '医卫BU / 省公司' },
  { name: '李华', dept: '政企客户部 / 合肥' },
  { name: '王强', dept: '省政企客户部' },
  { name: '陈静', dept: '医卫BU / 省公司' },
  { name: '杨海波', dept: '省政企客户部 / 审核' }
]

const secrecyLabels: Record<string, { label: string; className: string }> = {
  public: { label: '公开', className: 'bg-gray-50 text-gray-600' },
  internal: { label: '内部', className: 'bg-blue-50 text-blue-600' },
  secret: { label: '保密', className: 'bg-red-50 text-red-600' }
}

// 6 大支撑类型顺序
const supportTypeOrder: SupportType[] = [
  'techSolution',
  'partnerSelect',
  'bidSupport',
  'planDesign',
  'visit',
  'other'
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

// 流程子节点对应内容（非 售前支撑 时展示）
function FlowNodeContent({ nodeKey, onExpandBusiness }: { nodeKey: string; onExpandBusiness: () => void }) {
  const label = flowNodeLabels[nodeKey] || '当前阶段'

  // 商机节点：显示商机概要 + 提示展开
  if (nodeKey === 'biz') {
    return (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
          <h3 className="text-sm font-semibold text-gray-800">商机信息</h3>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div className="flex items-center min-h-[36px]">
            <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">商机名称</label>
            <div className="flex-1 min-w-0 text-sm text-gray-700">
              {opportunityInfo.name}
            </div>
          </div>
          <div className="flex items-center min-h-[36px]">
            <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">商机编号</label>
            <div className="flex-1 min-w-0 text-sm text-gray-700">
              {opportunityInfo.projectCode}
            </div>
          </div>
          <div className="flex items-center min-h-[36px]">
            <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">商机等级</label>
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded font-medium">
                {opportunityInfo.level} 级
              </span>
            </div>
          </div>
          <div className="flex items-center min-h-[36px]">
            <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">预估金额</label>
            <div className="flex-1 min-w-0 text-sm text-gray-700">
              {opportunityInfo.estimatedAmount} 万元
            </div>
          </div>
          <div className="flex items-center min-h-[36px]">
            <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">商机负责人</label>
            <div className="flex-1 min-w-0 text-sm text-gray-700">
              {opportunityInfo.owner}
            </div>
          </div>
          <div className="flex items-center min-h-[36px]">
            <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">创建时间</label>
            <div className="flex-1 min-w-0 text-sm text-gray-700">
              {opportunityInfo.createTime}
            </div>
          </div>
        </div>
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={onExpandBusiness}
            className="text-xs text-[#1677FF] hover:underline"
          >
            查看完整商机信息 ↑
          </button>
        </div>
      </div>
    )
  }

  // 其他阶段：占位提示
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

// 售前受理信息 - 6 大支撑子区块
function SupportOrdersBlock({ onNavigate, presaleId }: { onNavigate?: (path: string) => void; presaleId?: string }) {
  const handleView = (supportId: string) => {
    onNavigate?.(`/my/todo/presale-support/${presaleId}/support-order/${supportId}`)
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">售前受理信息</h3>
      </div>

      <div className="space-y-3">
        {supportTypeOrder.map(type => {
          const data = supportOrdersData[type]
          return (
            <SupportSubSection
              key={type}
              type={type}
              data={data}
              onAdd={() => {
                // 实际项目应跳转到对应申请页；此处仅做提示
                alert(`新增${supportTypeLabels[type]}申请（演示）`)
              }}
              onView={handleView}
            />
          )
        })}
      </div>
    </div>
  )
}

function SupportSubSection({
  type,
  data,
  onAdd,
  onView
}: {
  type: SupportType
  data: typeof supportOrdersData[SupportType]
  onAdd: () => void
  onView: (id: string) => void
}) {
  const label = supportTypeLabels[type]
  return (
    <div className="border border-gray-100 rounded-lg bg-white">
      {/* 子标题 + 新增按钮 */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-b border-gray-100 rounded-t-lg">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="font-semibold text-gray-800">{label}</span>
          <span className="text-gray-400">【{data.length}】</span>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-[#1677FF] hover:bg-blue-50 rounded transition-colors"
        >
          <Plus className="w-3 h-3" />
          {label}申请
        </button>
      </div>

      {/* 列表 */}
      {data.length === 0 ? (
        <div className="text-xs text-gray-400 py-4 text-center">暂无支撑</div>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-100">
              <th className="px-3 py-2 text-left font-medium">支撑工单名称</th>
              <th className="px-3 py-2 text-left font-medium">类型</th>
              <th className="px-3 py-2 text-left font-medium">期望完成时间</th>
              <th className="px-3 py-2 text-left font-medium">当前处理人员</th>
              <th className="px-3 py-2 text-left font-medium">当前状态</th>
              <th className="px-3 py-2 text-right font-medium w-16">操作</th>
            </tr>
          </thead>
          <tbody>
            {data.map(order => {
              const statusCfg = supportStatusConfig[order.status] || { label: order.status, className: 'bg-gray-50 text-gray-600' }
              return (
                <tr key={order.id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50">
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => onView(order.id)}
                      className="text-[#1677FF] hover:underline text-left truncate inline-block max-w-[260px]"
                      title={order.name}
                    >
                      {order.name}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-gray-600">{order.type}</td>
                  <td className="px-3 py-2 text-gray-600">{order.expectedDate}</td>
                  <td className="px-3 py-2 text-gray-600">{order.handler}</td>
                  <td className="px-3 py-2">
                    <span className={clsx('inline-block px-1.5 py-0.5 rounded text-[11px]', statusCfg.className)}>
                      {statusCfg.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={() => onView(order.id)}
                      className="text-[#1677FF] hover:underline inline-flex items-center gap-0.5"
                    >
                      <Eye className="w-3 h-3" />
                      详情
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default function PreSaleSupport({ onNavigate, todoId }: PreSaleSupportProps) {
  const secrecyCfg = secrecyLabels[opportunityInfo.secrecyLevel] || secrecyLabels.internal
  const [selectedNextHandler, setSelectedNextHandler] = useState(nextHandler)

  // 客户信息、商机信息默认收起
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: false,
    business: false
  })
  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // 流程子节点当前选中项（用于下方内容切换）
  const [activeFlowNode, setActiveFlowNode] = useState('pre-support')

  const handleCancel = () => {
    if (onNavigate) {
      onNavigate('/dashboard')
    }
  }

  const handleSubmit = async () => {
    const ok = await confirm('确认完成售前支撑处理？')
    if (ok) {
      if (onNavigate) {
        onNavigate('/dashboard')
      }
    }
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 客户信息（默认收起，压缩高度） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-50 px-4 py-2 rounded-lg"
            onClick={() => toggleSection('customer')}
          >
            <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
            <h3 className="text-xs font-semibold text-gray-800">客户信息</h3>
            {expandedSections.customer
              ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            }
            {!expandedSections.customer && (
              <span className="ml-2 text-xs text-gray-400 truncate">
                {customerInfo.name} · {customerInfo.contact} · {customerInfo.phone}
              </span>
            )}
          </div>
          {expandedSections.customer && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">客户名称</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {customerInfo.name}
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">所属行业</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {customerInfo.industry}
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">客户级别</label>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 text-xs bg-orange-50 text-orange-600 rounded">
                      {customerInfo.level}
                    </span>
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">联系人</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {customerInfo.contact}
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">联系电话</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {customerInfo.phone}
                  </div>
                </div>
                <div className="flex items-center min-h-[36px] col-span-2">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">客户地址</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {customerInfo.address}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 商机信息（默认收起，压缩高度） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-50 px-4 py-2 rounded-lg"
            onClick={() => toggleSection('business')}
          >
            <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
            <h3 className="text-xs font-semibold text-gray-800">商机信息</h3>
            {expandedSections.business
              ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            }
            {!expandedSections.business && (
              <span className="ml-2 text-xs text-gray-400 truncate">
                {opportunityInfo.name} · {opportunityInfo.level}级 · {opportunityInfo.estimatedAmount}万元 · 负责人：{opportunityInfo.owner}
              </span>
            )}
          </div>
          {expandedSections.business && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-2 border-t border-gray-100">
                <div className="flex items-center min-h-[36px] col-span-2">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">商机名称</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {opportunityInfo.name}
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">商机编号</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {opportunityInfo.projectCode}
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">商机等级</label>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 text-xs bg-red-50 text-red-600 rounded font-medium">
                      {opportunityInfo.level} 级
                    </span>
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">预估金额</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {opportunityInfo.estimatedAmount} 万元
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">保密级别</label>
                  <div className="flex-1 min-w-0">
                    <span className={clsx('inline-block px-2 py-0.5 text-xs rounded', secrecyCfg.className)}>
                      {secrecyCfg.label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">省公司BU</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {opportunityInfo.provBu}
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">市公司BU</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {opportunityInfo.cityBu}
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">商机负责人</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {opportunityInfo.owner}
                  </div>
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">创建时间</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {opportunityInfo.createTime}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 商机进展（流程导航 + 售前受理信息） */}
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
          {activeFlowNode === 'pre-support' ? (
            <SupportOrdersBlock onNavigate={onNavigate} presaleId={todoId} />
          ) : activeFlowNode === 'contract-brief' ? (
            <HandoverForm />
          ) : (
            <FlowNodeContent nodeKey={activeFlowNode} onExpandBusiness={() => toggleSection('business')} />
          )}
        </div>

        {/* 流程信息（与商机录入的"流程信息"卡片完全一致） */}
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

        {/* 按钮区域（取消 / 完成售前支撑） */}
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
            完成售前支撑
          </button>
        </div>
      </div>
    </div>
  )
}
