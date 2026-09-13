import { useState, useMemo } from 'react'
import { ArrowLeft, Check, RotateCcw, X, Plus, Eye } from 'lucide-react'
import { useModal } from '@/components/Modal'
import clsx from 'clsx'
import { ProjectInfoCard } from '@/components/ContractInfoCard'
import type { ContractInfoData } from '@/components/ContractInfoCard'
import { fundApplyList, investmentTypeMap, getInvestFundStatusText, getCostFundStatusText, getFundStatusClass } from '@/data/mock'
import type { FundApplyItem } from '@/data/mock'

interface ProjectInfo {
  id: string
  name: string
  code: string
  type: string
  initMethod: string
  customerName: string
  customerCode: string
  creator: string
}

const projectList: ProjectInfo[] = [
  {
    id: 'p1',
    code: 'PRJ-2026-HF-001',
    name: '合肥市第一人民医院智慧医疗项目',
    type: 'ICT项目',
    initMethod: '普通立项',
    customerName: '合肥市第一人民医院',
    customerCode: 'CUS-HF-001',
    creator: '张凯'
  },
  {
    id: 'p2',
    code: 'PRJ-2026-WH-001',
    name: '芜湖市政务服务中心数字政府项目',
    type: 'DICT项目',
    initMethod: '统谈分签',
    customerName: '芜湖市政务服务中心',
    customerCode: 'CUS-WH-001',
    creator: '李华'
  },
  {
    id: 'p3',
    code: 'PRJ-2026-BB-001',
    name: '蚌埠市教育局智慧教育项目',
    type: 'ICT项目',
    initMethod: '普通立项',
    customerName: '蚌埠市教育局',
    customerCode: 'CUS-BB-001',
    creator: '王强'
  },
  {
    id: 'p4',
    code: 'PRJ-2026-HF-002',
    name: '合肥市轨道交通集团智慧交通项目',
    type: '双计项目',
    initMethod: '统谈分签',
    customerName: '合肥市轨道交通集团有限公司',
    customerCode: 'CUS-HF-002',
    creator: '赵明'
  },
  {
    id: 'p5',
    code: 'PRJ-2026-AH-001',
    name: '安徽省公安厅智慧城市项目',
    type: 'ICT项目',
    initMethod: '普通立项',
    customerName: '安徽省公安厅',
    customerCode: 'CUS-AH-001',
    creator: '杨海波'
  },
  {
    id: 'p6',
    code: 'PRJ-2026-KM-001',
    name: '昆明市工商银行智能监控系统',
    type: 'ICT项目',
    initMethod: '普通立项',
    customerName: '昆明市工商银行',
    customerCode: 'CUS-KM-001',
    creator: '张伟'
  }
]

interface FundApplicationProps {
  onNavigate: (path: string) => void
  id?: string
}

const emptyContractInfo = (): ContractInfoData => ({
  name: '',
  projectCode: '',
  projectName: '',
  code: '',
  serialNo: '',
  type: '',
  typeKey: 'income',
  isFramework: '',
  frameworkRelationType: '',
  secondCategory: '',
  thirdCategory: '',
  organizer: '',
  handler: '',
  dept: '',
  signSubject: '',
  draftTime: '',
  status: '',
  statusChangeTime: '',
  nature: '',
  projectAmountWithTax: '',
  projectAmountNoTax: '',
  effectiveTime: '',
  terminationTime: '',
  contractPeriodMonths: '',
  signTime: '',
  counterpartName: '',
  collectedCustomer: '',
  amountWithTax: '',
  amountNoTax: '',
  adjustedAmountWithTax: '',
  adjustedAmountNoTax: '',
  performanceStartTime: '',
  performanceEndTime: '',
  isSupplement: '',
  supplementType: ''
})

export default function FundApplication({ onNavigate, id }: FundApplicationProps) {
  const modal = useModal()
  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectSearch, setProjectSearch] = useState({ name: '', code: '' })
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  const [investmentApply, setInvestmentApply] = useState(false)
  const [costApply, setCostApply] = useState(false)

  const filteredProjects = useMemo(() => {
    return projectList.filter(p => {
      const nameMatch = !projectSearch.name.trim() || p.name.includes(projectSearch.name.trim())
      const codeMatch = !projectSearch.code.trim() || p.code.includes(projectSearch.code.trim())
      return nameMatch && codeMatch
    })
  }, [projectSearch])

  const projectContractInfo: ContractInfoData = {
    ...emptyContractInfo(),
    projectName: selectedProject?.name || '',
    type: selectedProject?.type || '',
    projectCode: selectedProject?.code || ''
  }

  const investmentList = useMemo(() => fundApplyList.filter(i => i.type === 'invest'), [])
  const costList = useMemo(() => fundApplyList.filter(i => i.type === 'cost'), [])

  const handleOpenProjectModal = () => {
    setSelectedProjectId(selectedProject?.id || '')
    setProjectSearch({ name: '', code: '' })
    setShowProjectModal(true)
  }

  const handleConfirmProject = () => {
    if (!selectedProjectId) {
      alert('请选择一个项目')
      return
    }
    const project = projectList.find(p => p.id === selectedProjectId)
    if (project) {
      setSelectedProject(project)
    }
    setShowProjectModal(false)
  }

  const handleCancel = () => {
    onNavigate?.('/my/todo')
  }

  const handleAddInvestment = () => {
    if (!selectedProject) {
      alert('请先选择项目')
      return
    }
    onNavigate?.(`/finance/fund/invest-apply/preset/${encodeURIComponent(selectedProject.name)}`)
  }

  const handleAddCost = () => {
    if (!selectedProject) {
      alert('请先选择项目')
      return
    }
    onNavigate?.(`/finance/fund/cost-apply/preset/${encodeURIComponent(selectedProject.name)}`)
  }

  const handleDetail = (item: FundApplyItem) => {
    onNavigate?.(`/finance/fund/detail/${item.id}`)
  }

  const handleSubmit = () => {
    modal.confirm('确定提交资金申请吗？', '提交申请').then(ok => {
      if (ok) {
        alert('提交成功')
        onNavigate?.('/my/todo')
      }
    })
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-3 space-y-3">
        {/* 返回条 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={handleCancel} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">资金申请</h2>
          </div>
          <button
            type="button"
            onClick={handleOpenProjectModal}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            选择项目
          </button>
        </div>

        {/* ========== 项目信息 ========== */}
        <ProjectInfoCard contractInfo={projectContractInfo} defaultExpanded={false} />

        {/* ========== 投资类资金申请 ========== */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">投资类资金申请</h3>
          </div>
          <div className="px-4 py-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-center min-h-[36px]">
                <label className="w-48 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                  <span className="text-red-500 mr-0.5">*</span>是否涉及投资类资金申请
                </label>
                <div className="flex-1 min-w-0 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setInvestmentApply(false)}
                    className={clsx(
                      'w-20 px-4 py-2 text-sm rounded-md transition-colors',
                      !investmentApply
                        ? 'bg-[#1677FF] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    否
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvestmentApply(true)}
                    className={clsx(
                      'w-20 px-4 py-2 text-sm rounded-md transition-colors',
                      investmentApply
                        ? 'bg-[#1677FF] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    是
                  </button>
                </div>
              </div>
            </div>

            {investmentApply && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">已关联 {investmentList.length} 条投资类资金申请工单</span>
                  <button
                    type="button"
                    onClick={handleAddInvestment}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新增
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-gray-500">
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">工单编码</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">省内项目编码</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">投资类型</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">申请金额（元）</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">工单状态</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">创建人</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">创建时间</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {investmentList.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                            暂无数据
                          </td>
                        </tr>
                      ) : (
                        investmentList.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="px-3 py-3 text-[#1677FF] hover:underline cursor-pointer whitespace-nowrap font-medium" onClick={() => handleDetail(item)}>{item.code}</td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.projectCode}</td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.globalCode}</td>
                            <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.projectName}</td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">
                              {item.investmentType ? investmentTypeMap[item.investmentType] || item.investmentType : '-'}
                            </td>
                            <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{item.applyAmount}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${getFundStatusClass(item.status, item.type)}`}>
                                {getInvestFundStatusText(item.status)}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.applyUser}</td>
                            <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{item.createTime}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleDetail(item)}
                                className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-[#1668DD] hover:underline"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                详情
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========== 成本类资金申请 ========== */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">成本类资金申请</h3>
          </div>
          <div className="px-4 py-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-center min-h-[36px]">
                <label className="w-48 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                  <span className="text-red-500 mr-0.5">*</span>是否涉及成本类资金申请
                </label>
                <div className="flex-1 min-w-0 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCostApply(false)}
                    className={clsx(
                      'w-20 px-4 py-2 text-sm rounded-md transition-colors',
                      !costApply
                        ? 'bg-[#1677FF] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    否
                  </button>
                  <button
                    type="button"
                    onClick={() => setCostApply(true)}
                    className={clsx(
                      'w-20 px-4 py-2 text-sm rounded-md transition-colors',
                      costApply
                        ? 'bg-[#1677FF] text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    是
                  </button>
                </div>
              </div>
            </div>

            {costApply && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">已关联 {costList.length} 条成本类资金申请工单</span>
                  <button
                    type="button"
                    onClick={handleAddCost}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新增
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-gray-500">
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">工单编码</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">省内项目编码</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">申请金额（元）</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目状态</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">创建人</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">创建时间</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {costList.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                            暂无数据
                          </td>
                        </tr>
                      ) : (
                        costList.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="px-3 py-3 text-[#1677FF] hover:underline cursor-pointer whitespace-nowrap font-medium" onClick={() => handleDetail(item)}>{item.code}</td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.projectCode}</td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.globalCode}</td>
                            <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.projectName}</td>
                            <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{item.applyAmount}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${getFundStatusClass(item.status, item.type)}`}>
                                {getCostFundStatusText(item.status)}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.applyUser}</td>
                            <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{item.createTime}</td>
                            <td className="px-3 py-3 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleDetail(item)}
                                className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-[#1668DD] hover:underline"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                详情
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 按钮区 */}
        <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
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

      {/* ========== 选择项目弹窗 ========== */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setShowProjectModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[900px] max-w-[90vw] overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">选择项目</h3>
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-20 text-right">项目名称</label>
                  <input
                    type="text"
                    value={projectSearch.name}
                    onChange={(e) => setProjectSearch(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入项目名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-20 text-right">项目编码</label>
                  <input
                    type="text"
                    value={projectSearch.code}
                    onChange={(e) => setProjectSearch(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="请输入项目编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-gray-500">
                    <th className="w-10 px-4 py-2.5 text-left">
                      <span className="sr-only">选择</span>
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">项目名称</th>
                    <th className="px-3 py-2.5 text-left font-medium">项目编码</th>
                    <th className="px-3 py-2.5 text-left font-medium">项目类型</th>
                    <th className="px-3 py-2.5 text-left font-medium">立项方式</th>
                    <th className="px-3 py-2.5 text-left font-medium">客户名称</th>
                    <th className="px-3 py-2.5 text-left font-medium">客户编码</th>
                    <th className="px-3 py-2.5 text-left font-medium">项目创建人</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map(project => (
                      <tr
                        key={project.id}
                        className={clsx(
                          'cursor-pointer hover:bg-blue-50/50 transition-colors',
                          selectedProjectId === project.id && 'bg-blue-50'
                        )}
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="radio"
                            name="project"
                            checked={selectedProjectId === project.id}
                            onChange={() => setSelectedProjectId(project.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                        </td>
                        <td className="px-3 py-3 text-gray-800">{project.name}</td>
                        <td className="px-3 py-3 text-gray-600">{project.code}</td>
                        <td className="px-3 py-3 text-gray-600">{project.type}</td>
                        <td className="px-3 py-3 text-gray-600">{project.initMethod}</td>
                        <td className="px-3 py-3 text-gray-600">{project.customerName}</td>
                        <td className="px-3 py-3 text-gray-600">{project.customerCode}</td>
                        <td className="px-3 py-3 text-gray-600">{project.creator}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmProject}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
