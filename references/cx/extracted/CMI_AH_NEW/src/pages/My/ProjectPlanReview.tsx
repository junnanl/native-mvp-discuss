import { useState } from 'react'
import { Check, RotateCcw, ChevronRight, Clock, User } from 'lucide-react'
import ProjectFlowNav from '@/components/ProjectFlowNav'
import { useModal } from '@/components/Modal'
import {
  customerInfo,
  opportunityInfo,
  initialMilestones,
  initialTeam,
  initialStdProducts,
  initialItTasks,
  initialContracts,
  InfoCard,
  ReadOnlyField,
  SubSectionHeader,
  DataTable
} from '@/components/PlanShared'

interface ProjectPlanReviewProps {
  onNavigate?: (path: string) => void
  todoId?: string
}

// 子流程轨迹数据
const flowTrace = [
  {
    stage: '项目启动与规划',
    operator: '张大伟（交付经理）',
    action: '提交了项目启动与规划',
    time: '2026-05-12 14:30',
    completed: true
  },
  {
    stage: '项目启动与规划审核',
    operator: '陈静（项目交付中心 / 审核）',
    action: '正在审核',
    time: '2026-05-13 09:15',
    completed: false,
    current: true
  }
]

// 审批结果选项
const approvalResultOptions = ['通过', '驳回']

export default function ProjectPlanReview({ onNavigate, todoId }: ProjectPlanReviewProps) {
  const { confirm, alert } = useModal()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: false,
    business: false
  })
  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }
  const [activeFlowNode] = useState('kickoff')

  // 审批状态
  const [approvalResult, setApprovalResult] = useState('通过')
  const [approvalOpinion, setApprovalOpinion] = useState('同意')

  // 选择审批结果时自动联动审批意见
  const handleApprovalResultChange = (v: string) => {
    setApprovalResult(v)
    if (v === '通过') {
      setApprovalOpinion('同意')
    } else if (approvalOpinion === '同意') {
      // 切换到驳回且当前是默认值时清空
      setApprovalOpinion('')
    }
  }

  const handleCancel = () => onNavigate?.('/dashboard')
  const handleSubmit = async () => {
    if (!approvalResult) {
      await alert('请选择审批结果')
      return
    }
    if (approvalResult === '驳回' && !approvalOpinion.trim()) {
      await alert('驳回时审批意见必填')
      return
    }
    const tip = approvalResult === '通过'
      ? `确认审核通过【${opportunityInfo.name}】的项目启动与规划？`
      : `确认驳回【${opportunityInfo.name}】的项目启动与规划？`
    const ok = await confirm(tip)
    if (ok) {
      // 审核通过 → 跳转到项目开工处理；驳回 → 回到发起人（演示：均跳到 project-kickoff 占位）
      onNavigate?.(`/my/todo/project-kickoff/${todoId ?? 'new'}`)
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

        {/* 3. 商机进展（流程导航 + 启动与规划只读内容） */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">商机进展</h3>
          </div>
          <ProjectFlowNav
            currentNodeKey={activeFlowNode}
            embedded
          />
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
            {/* 里程碑计划（只读） */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <SubSectionHeader title="里程碑计划" />
              <DataTable
                columns={[
                  { key: 'label', title: '里程碑节点', width: '20%' },
                  { key: 'start', title: '计划开始时间', width: '20%' },
                  { key: 'end', title: '计划结束时间', width: '20%' }
                ]}
                rows={initialMilestones.map(r => [
                  <span key="label" className="text-sm text-gray-800">{r.label}</span>,
                  <span key="start" className="text-sm text-gray-700">{r.start || '—'}</span>,
                  <span key="end" className="text-sm text-gray-700">{r.end || '—'}</span>
                ])}
              />
            </div>

            {/* 售中团队组建（只读） */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <SubSectionHeader title="售中团队组建" />
              <DataTable
                columns={[
                  { key: 'name', title: '成员姓名' },
                  { key: 'account', title: '账号' },
                  { key: 'dept', title: '归属部门' },
                  { key: 'phone', title: '联系电话' },
                  { key: 'role', title: '团队角色' }
                ]}
                rows={initialTeam.map(m => [
                  m.name, m.account, m.dept, m.phone, m.role
                ])}
              />
            </div>

            {/* 项目计划（只读） */}
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
              <SubSectionHeader title="项目计划" />

              {/* CT 任务（三级标题） */}
              <div>
                <SubSectionHeader title="CT任务" variant="sub" />
                <DataTable
                  columns={[
                    { key: 'name', title: '产品名称' },
                    { key: 'code', title: '产品编码' },
                    { key: 'qty', title: '产品数量' },
                    { key: 'start', title: '交付开始时间' },
                    { key: 'end', title: '交付结束时间' },
                    { key: 'addr', title: '任务处理地址' },
                    { key: 'owner', title: '负责人' }
                  ]}
                  rows={initialStdProducts.map(p => [
                    p.name, p.code, p.qty, p.start, p.end, p.addr, p.owner
                  ])}
                />
              </div>

              {/* IT 任务（三级标题） */}
              <div>
                <SubSectionHeader title="IT任务" variant="sub" />
                <DataTable
                  columns={[
                    { key: 'name', title: '任务名称' },
                    { key: 'type', title: '任务类型' },
                    { key: 'start', title: '交付开始时间' },
                    { key: 'end', title: '交付结束时间' },
                    { key: 'desc', title: '任务描述' },
                    { key: 'owner', title: '负责人' }
                  ]}
                  rows={initialItTasks.map(t => [
                    t.name, t.type, t.start, t.end, t.desc, t.owner
                  ])}
                />
              </div>
            </div>

            {/* 支出合同（只读） */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <SubSectionHeader title="支出合同" />
              <DataTable
                columns={[
                  { key: 'name', title: '合同名称' },
                  { key: 'flowNo', title: '合同流水号' },
                  { key: 'type', title: '收支类型' },
                  { key: 'nature', title: '合同性质' },
                  { key: 'amount', title: '合同金额（元，含税）' },
                  { key: 'period', title: '合同期数（月）' },
                  { key: 'status', title: '状态' }
                ]}
                rows={initialContracts.map(c => [
                  c.name, c.flowNo, c.type, c.nature, c.amount, c.period, c.status
                ])}
              />
            </div>

            {/* 实施方案（只读） */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <SubSectionHeader title="实施方案" />
              <div className="flex items-center">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">项目实施方案</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  昆明市工商银行智能监控系统实施方案.doc
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. 子流程轨迹（新增） */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">子流程轨迹</h3>
          </div>
          <div className="space-y-3">
            {flowTrace.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                {/* 时间线节点 */}
                <div className="flex flex-col items-center pt-1">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      step.current ? 'bg-[#1677FF] ring-4 ring-blue-100' :
                      step.completed ? 'bg-[#1677FF]' : 'bg-gray-300'
                    }`}
                  />
                  {idx < flowTrace.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 mt-1" style={{ minHeight: '32px' }} />
                  )}
                </div>
                {/* 内容 */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${step.current ? 'text-[#1677FF]' : 'text-gray-800'}`}>
                      {step.stage}
                    </span>
                    {step.current && (
                      <span className="px-1.5 py-0.5 text-[11px] bg-blue-50 text-[#1677FF] rounded">进行中</span>
                    )}
                    {step.completed && !step.current && (
                      <span className="px-1.5 py-0.5 text-[11px] bg-gray-100 text-gray-500 rounded">已完成</span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {step.operator}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.time}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-gray-600 flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-gray-400" />
                    {step.action}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. 审批信息（一级标题） */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-[#1677FF] rounded-sm" />
            <h2 className="text-base font-semibold text-gray-900">审批信息</h2>
          </div>
          <div className="space-y-4">
            {/* 审批结果 */}
            <div className="flex items-start">
              <label className="w-28 text-right pr-3 pt-1.5 text-sm text-gray-700 shrink-0">
                <span className="text-red-500 mr-0.5">*</span>审批结果：
              </label>
              <div className="flex-1 flex items-center gap-6 pt-1.5">
                {approvalResultOptions.map(opt => (
                  <label key={opt} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-700">
                    <input
                      type="radio"
                      name="approvalResult"
                      value={opt}
                      checked={approvalResult === opt}
                      onChange={() => handleApprovalResultChange(opt)}
                      className="accent-[#1677FF]"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            {/* 审批意见 */}
            <div className="flex items-start">
              <label className="w-28 text-right pr-3 pt-1.5 text-sm text-gray-700 shrink-0">
                {approvalResult === '驳回' && <span className="text-red-500 mr-0.5">*</span>}
                审批意见：
              </label>
              <div className="flex-1">
                <textarea
                  value={approvalOpinion}
                  onChange={(e) => setApprovalOpinion(e.target.value)}
                  placeholder={approvalResult === '驳回' ? '请输入驳回意见（必填）' : '请输入审批意见'}
                  rows={4}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-y"
                />
                <div className="text-xs text-gray-400 text-right mt-1">{approvalOpinion.length}/500</div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. 流程信息（下一步环节=结束，不展示下一步处理人） */}
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
                    结束
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7. 按钮区（取消 + 提交） */}
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
            提交
          </button>
        </div>
      </div>
    </div>
  )
}
