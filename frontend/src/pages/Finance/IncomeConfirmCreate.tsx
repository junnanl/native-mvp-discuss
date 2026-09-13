import { useState, useMemo } from 'react'
import { Search, X, ChevronDown, ChevronRight, RotateCcw, Check, ArrowLeft, FileText, Download, AlertTriangle } from 'lucide-react'
import { clsx } from 'clsx'
import FileUpload from '@/components/FileUpload'
import SectionBlock from '@/components/plan-modules/common/SectionBlock'
import PaymentPlansDisplay from '@/components/plan-modules/common/PaymentPlansDisplay'
import ModalShell from '@/components/plan-modules/common/ModalShell'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import { ProjectInfoCard } from '@/components/ContractInfoCard'
import { getContractInfo } from '@/data/mock'
import type { ITIncomeRow } from '@/components/plan-modules/types'
import { calculateExcludingTax } from '@/lib/utils'

interface IncomeConfirmCreateProps {
  onNavigate?: (path: string) => void
  readOnly?: boolean
  detailId?: string
  // 从工作台待办进入时传入的合同ID（携带项目信息，不需要选择项目）
  todoContractId?: string
}

interface ApprovalTrailItem {
  step: string
  actor: string
  action: string
  time: string
  status: 'approved' | 'rejected' | 'pending' | 'current'
  remark?: string
}

interface ProjectInfo {
  id: string
  name: string
  code: string
  globalCode: string
  type: string
  signMode: string
  customerManager: string
  solutionManager: string
  draftedCount: number
}

const mockITIncome: ITIncomeRow[] = [
  {
    id: 'it-1',
    productName: '维保费',
    tariffName: '[849]ICT维保服务费',
    mgmtProductCode: 'P1234',
    mgmtProductName: 'ICT维保服务',
    thirdLevelSubject: 'S123',
    coaSubject: 'C5678',
    taxRate: '6%',
    isFixedRate: '是',
    plannedIncome: '500,000',
    plannedTariffAmount: '480,000',
    budgetTariffAmount: '480,000',
    contractStage: '初验',
    billingShareType: '月',
    billingSharePeriod: '12',
    isContractAsset: '是',
    plannedOrderDate: '2026-07-01',
    milestoneName: '初验',
    orderStatus: '待订购',
    billingStartDate: '2026-07',
    paymentPlans: [
      { id: 'pp-1', milestone: '初验', amount: '250,000', paymentDate: '2026-08-01', transferDate: '' },
      { id: 'pp-2', milestone: '终验', amount: '250,000', paymentDate: '2026-12-01', transferDate: '' }
    ]
  },
  {
    id: 'it-2',
    productName: '设备费',
    tariffName: '[956]软件开发服务',
    mgmtProductCode: 'P2345',
    mgmtProductName: '软件开发服务',
    thirdLevelSubject: 'S234',
    coaSubject: 'C956-01',
    taxRate: '13%',
    isFixedRate: '是',
    plannedIncome: '2,000,000',
    plannedTariffAmount: '1,900,000',
    budgetTariffAmount: '1,900,000',
    contractStage: '到货',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '否',
    plannedOrderDate: '2026-08-01',
    milestoneName: '到货',
    orderStatus: '待订购',
    billingStartDate: '2026-08',
    paymentPlans: [
      { id: 'pp-3', milestone: '到货', amount: '1,000,000', paymentDate: '2026-09-01', transferDate: '' },
      { id: 'pp-4', milestone: '初验', amount: '1,000,000', paymentDate: '2026-11-01', transferDate: '' }
    ]
  },
  {
    id: 'it-3',
    productName: '平台使用费',
    tariffName: '[780]平台服务费',
    mgmtProductCode: 'P3456',
    mgmtProductName: '平台服务',
    thirdLevelSubject: 'S345',
    coaSubject: 'C3456',
    taxRate: '6%',
    isFixedRate: '是',
    plannedIncome: '300,000',
    plannedTariffAmount: '280,000',
    budgetTariffAmount: '280,000',
    contractStage: '项目上线',
    billingShareType: '月',
    billingSharePeriod: '24',
    isContractAsset: '是',
    plannedOrderDate: '2026-06-01',
    milestoneName: '项目上线',
    orderStatus: '订购中',
    billingStartDate: '2026-06',
    paymentPlans: [
      { id: 'pp-5', milestone: '项目上线', amount: '140,000', paymentDate: '2026-07-01', transferDate: '' },
      { id: 'pp-6', milestone: '终验', amount: '140,000', paymentDate: '2027-01-01', transferDate: '' }
    ]
  },
  {
    id: 'it-4',
    productName: '系统集成费',
    tariffName: '[1205]系统集成服务',
    mgmtProductCode: 'P4567',
    mgmtProductName: '系统集成服务',
    thirdLevelSubject: 'S456',
    coaSubject: 'C4567',
    taxRate: '9%',
    isFixedRate: '否',
    plannedIncome: '800,000',
    plannedTariffAmount: '750,000',
    budgetTariffAmount: '750,000',
    contractStage: '初验',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '否',
    plannedOrderDate: '2026-05-01',
    milestoneName: '初验',
    orderStatus: '已订购',
    billingStartDate: '2026-05',
    paymentPlans: [
      { id: 'pp-7', milestone: '初验', amount: '375,000', paymentDate: '2026-06-01', transferDate: '' },
      { id: 'pp-8', milestone: '终验', amount: '375,000', paymentDate: '2026-10-01', transferDate: '' }
    ]
  },
  {
    id: 'it-5',
    productName: '长周期维保费',
    tariffName: '[849]长周期ICT维保服务费',
    mgmtProductCode: 'P5678',
    mgmtProductName: 'ICT维保服务',
    thirdLevelSubject: 'S567',
    coaSubject: 'C5678',
    taxRate: '6%',
    isFixedRate: '是',
    plannedIncome: '1,200,000',
    plannedTariffAmount: '1,100,000',
    budgetTariffAmount: '1,100,000',
    contractStage: '初验',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '是',
    plannedOrderDate: '2026-08-01',
    milestoneName: '初验',
    orderStatus: '待订购',
    billingStartDate: '2026-08',
    paymentPlans: [
      { id: 'pp-9', milestone: '初验', amount: '550,000', paymentDate: '2026-09-01', transferDate: '' },
      { id: 'pp-10', milestone: '终验', amount: '550,000', paymentDate: '2027-02-01', transferDate: '' }
    ]
  }
]

function groupByProductName<T extends { productName: string }>(list: T[]): { productName: string; rows: T[] }[] {
  const groups: Record<string, T[]> = {}
  list.forEach(row => {
    if (!groups[row.productName]) {
      groups[row.productName] = []
    }
    groups[row.productName].push(row)
  })
  return Object.entries(groups).map(([productName, rows]) => ({ productName, rows }))
}

const projectList = [
  {
    id: 'p1',
    name: '合肥市第一人民医院智慧医疗项目',
    code: 'PRJ-2026-HF-001',
    globalCode: 'NET-2026-HF-001',
    type: 'ICT项目',
    signMode: '普通项目',
    customerManager: '张凯',
    solutionManager: '刘伟',
    draftedCount: 2
  },
  {
    id: 'p2',
    name: '芜湖市政务服务中心数字政府项目',
    code: 'PRJ-2026-WH-001',
    globalCode: 'NET-2026-WH-001',
    type: 'DICT项目',
    signMode: '统谈分签项目',
    customerManager: '李华',
    solutionManager: '陈晨',
    draftedCount: 0
  },
  {
    id: 'p3',
    name: '蚌埠市教育局智慧教育项目',
    code: 'PRJ-2026-BB-001',
    globalCode: 'NET-2026-BB-001',
    type: 'ICT项目',
    signMode: '框架订单项目',
    customerManager: '王强',
    solutionManager: '赵磊',
    draftedCount: 1
  },
  {
    id: 'p4',
    name: '合肥市轨道交通集团智慧交通项目',
    code: 'PRJ-2026-HF-002',
    globalCode: 'NET-2026-HF-002',
    type: '双计项目',
    signMode: '框架合同项目',
    customerManager: '赵明',
    solutionManager: '孙杰',
    draftedCount: 3
  },
  {
    id: 'p5',
    name: '安徽省公安厅智慧城市项目',
    code: 'PRJ-2026-AH-001',
    globalCode: 'NET-2026-AH-001',
    type: 'ICT项目',
    signMode: '普通项目',
    customerManager: '杨海波',
    solutionManager: '周涛',
    draftedCount: 0
  }
]

interface ProgressFile {
  id: string
  name: string
  size: string
  uploadTime: string
}

const mockProgressFiles: ProgressFile[] = [
  { id: 'pf-1', name: '项目进度证明_1.pdf', size: '2.5 MB', uploadTime: '2026-07-10 10:30:00' },
  { id: 'pf-2', name: '项目进度证明_2.pdf', size: '3.8 MB', uploadTime: '2026-07-10 11:00:00' }
]

function SectionTitle({
  children,
  sectionKey,
  expanded,
  extra,
  onToggle
}: {
  children: React.ReactNode
  sectionKey?: string
  expanded?: boolean
  extra?: React.ReactNode
  onToggle?: () => void
}) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 mb-3 mt-5 first:mt-0 cursor-pointer select-none hover:bg-gray-50 -mx-2 px-2 py-1 rounded',
        !sectionKey && 'cursor-default hover:bg-transparent'
      )}
      onClick={() => sectionKey && onToggle && onToggle()}
    >
      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
      <h3 className="text-sm font-semibold text-gray-800">{children}</h3>
      {sectionKey && (
        expanded
          ? <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
          : <ChevronRight className="w-4 h-4 text-gray-500 ml-1" />
      )}
      {extra && (
        <div className="ml-auto flex items-center" onClick={(e) => e.stopPropagation()}>{extra}</div>
      )}
    </div>
  )
}

export default function IncomeConfirmCreate({ onNavigate, readOnly = false, detailId, todoContractId }: IncomeConfirmCreateProps) {
  const contractInfo = getContractInfo(todoContractId || 'CT2026060006')
  // 模式判断：
  // - todoContractId 存在（工作台待办入口）：使用 contractInfo.projectName 直接匹配，不需要选择项目，直接展示完整表单
  // - readOnly 或 detailId 存在（详情/只读页）：默认加载第一个项目
  // - 否则（列表页面收入计划确认按钮入口）：默认不选项目，仅展示项目名称选择框+底部按钮
  const initialProject: ProjectInfo | null = (() => {
    if (todoContractId) {
      // 工作台待办入口：优先从 contractInfo 取真实项目名构造（与图一「芜湖智慧教育云平台服务 · 收入类」一致）
      const matched = projectList.find(p => contractInfo.projectName.includes(p.name))
      if (matched) return matched
      // 不在 mock projectList 中则以 contractInfo 为准构造（name 用真实项目名，其余字段兜底）
      return {
        id: `todo-${contractInfo.projectCode}`,
        name: contractInfo.projectName,
        code: contractInfo.projectCode,
        globalCode: contractInfo.projectCode || '',
        type: 'ICT项目',
        signMode: '普通项目',
        customerManager: '张凯',
        solutionManager: '刘伟',
        draftedCount: 0
      }
    }
    if (readOnly) return projectList[0] || null
    return null
  })()
  const [project, setProject] = useState<ProjectInfo | null>(initialProject)
  const [projectExpanded, setProjectExpanded] = useState(true)
  const [incomeExpanded, setIncomeExpanded] = useState(true)

  const [showProjectModal, setShowProjectModal] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [searchProvinceCode, setSearchProvinceCode] = useState('')
  const [searchGlobalCode, setSearchGlobalCode] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  const [itIncomeViewingPlans, setItIncomeViewingPlans] = useState<ITIncomeRow | null>(null)
  const [selectedIncomeIds, setSelectedIncomeIds] = useState<Set<string>>(new Set())
  const [progressFiles, setProgressFiles] = useState<string[]>(readOnly ? ['项目进度证明_1.pdf', '项目进度证明_2.pdf'] : [])
  // 长周期维保费相关附件（专项签报必传 / 客户侧承诺书非必传）
  const [longCycleSignFiles, setLongCycleSignFiles] = useState<string[]>([])
  const [longCyclePromiseFiles, setLongCyclePromiseFiles] = useState<string[]>([])

  // 长周期维保费勾选判断（勾选后订购信息模块展示温馨提示）
  const longCycleIncomeIds = new Set(
    mockITIncome.filter(r => r.productName?.includes('长周期维保')).map(r => r.id)
  )
  const hasLongCycleSelected = [...selectedIncomeIds].some(id => longCycleIncomeIds.has(id))

  // 流程信息 - 下一步处理人（复制自产品开通页面，独立维护）
  const nextHandlerOptions = [
    '张三（解决方案经理）',
    '李四（解决方案经理）',
    '王五（解决方案经理）',
    '赵六（解决方案经理）',
    '钱七（解决方案经理）',
    '孙八（解决方案经理）',
    '周九（解决方案经理）',
    '吴十（解决方案经理）',
  ]
  const [nextHandler, setNextHandler] = useState<string>('')

  const generateApprovalTrail = (id: string): ApprovalTrailItem[] => {
    const baseTrail: ApprovalTrailItem[] = [
      { step: '1', actor: '张明', action: '发起收入确认申请', time: '2026-06-15 09:30:00', status: 'approved' },
      { step: '2', actor: '系统校验', action: '校验通过：非小微项目 / 非省管项目 / 合同金额 150,000 元 ≥ 50 万', time: '2026-06-15 09:30:05', status: 'approved' },
      { step: '3', actor: '王芳（行拓室经理）', action: '审批通过', time: '2026-06-15 14:20:00', status: 'approved', remark: '情况属实，同意确认收入' },
      { step: '4', actor: '李娜（财务管理员）', action: '审批通过', time: '2026-06-15 15:45:00', status: 'approved', remark: '金额核对无误' },
      { step: '5', actor: '陈磊（财务一级审批）', action: '审批通过', time: '2026-06-16 10:00:00', status: 'approved' },
      { step: '6', actor: '刘伟（财务二级审批）', action: '审批通过', time: '2026-06-16 14:30:00', status: 'approved' },
      { step: '7', actor: '赵强（财务三级审批）', action: '审批通过', time: '2026-06-17 09:15:00', status: 'approved', remark: '同意出账' },
      { step: '8', actor: '周杰（省公司管理员）', action: '审批通过', time: '2026-06-17 16:00:00', status: 'approved' },
      { step: '9', actor: '系统判断', action: '需要向外派发', time: '2026-06-17 16:00:05', status: 'approved' },
      { step: '10', actor: '孙宇（物联网室审批）', action: '审批通过', time: '2026-06-18 10:30:00', status: 'approved' },
      { step: '11', actor: '吴涛（产业拓展室审批）', action: '审批通过', time: '2026-06-18 11:20:00', status: 'approved' },
      { step: '12', actor: '郑凯（云和大数据审批）', action: '审批通过', time: '2026-06-18 14:00:00', status: 'approved' }
    ]

    const idNum = parseInt(id.replace(/\D/g, ''), 10) || 1
    const mod = idNum % 15

    if (mod <= 2) {
      return [
        { step: '1', actor: '张明', action: '发起收入确认申请', time: '', status: 'pending' },
        { step: '2', actor: '系统校验', action: '待校验', time: '', status: 'pending' },
        { step: '3', actor: '王芳（行拓室经理）', action: '待审批', time: '', status: 'pending' },
        { step: '4', actor: '李娜（财务管理员）', action: '待审批', time: '', status: 'pending' },
        { step: '5', actor: '陈磊（财务一级审批）', action: '待审批', time: '', status: 'pending' },
        { step: '6', actor: '刘伟（财务二级审批）', action: '待审批', time: '', status: 'pending' },
        { step: '7', actor: '赵强（财务三级审批）', action: '待审批', time: '', status: 'pending' },
        { step: '8', actor: '周杰（省公司管理员）', action: '待审批', time: '', status: 'pending' },
        { step: '9', actor: '系统判断', action: '待判断', time: '', status: 'pending' },
        { step: '10', actor: '孙宇（物联网室审批）', action: '待审批', time: '', status: 'pending' },
        { step: '11', actor: '吴涛（产业拓展室审批）', action: '待审批', time: '', status: 'pending' },
        { step: '12', actor: '郑凯（云和大数据审批）', action: '待审批', time: '', status: 'pending' }
      ]
    } else if (mod <= 8) {
      const currentStep = 3 + (mod % 6)
      return baseTrail.map((item) => {
        const stepNum = parseInt(item.step, 10)
        if (stepNum < currentStep) {
          return { ...item, status: 'approved' as const }
        } else if (stepNum === currentStep) {
          return { ...item, status: 'current' as const, remark: '正在处理中...' }
        } else {
          return { ...item, status: 'pending' as const, time: '', action: item.action.replace('审批通过', '待审批') }
        }
      })
    } else if (mod === 14) {
      return [
        { step: '1', actor: '张明', action: '发起收入确认申请', time: '2026-06-15 09:30:00', status: 'approved' },
        { step: '2', actor: '系统校验', action: '校验通过：非小微项目 / 非省管项目 / 合同金额 150,000 元 ≥ 50 万', time: '2026-06-15 09:30:05', status: 'approved' },
        { step: '3', actor: '王芳（行拓室经理）', action: '审批通过', time: '2026-06-15 14:20:00', status: 'approved' },
        { step: '4', actor: '李娜（财务管理员）', action: '审批不通过', time: '2026-06-15 15:45:00', status: 'rejected', remark: '回款计划与合同金额不符，请核对后重新提交' }
      ]
    } else {
      return baseTrail
    }
  }

  const approvalTrail = readOnly && detailId ? generateApprovalTrail(detailId) : []

  const getApprovalStatusText = () => {
    if (!readOnly || !detailId) return { text: '', color: '' }
    const idNum = parseInt(detailId.replace(/\D/g, ''), 10) || 1
    const mod = idNum % 15
    if (mod <= 2) return { text: '待审批', color: 'bg-yellow-50 text-yellow-600' }
    if (mod <= 8) return { text: '审批中', color: 'bg-blue-50 text-blue-600' }
    if (mod === 14) return { text: '审批不通过', color: 'bg-red-50 text-red-600' }
    return { text: '审批通过', color: 'bg-green-50 text-green-600' }
  }

  const approvalStatus = getApprovalStatusText()

  const filteredProjects = useMemo(() => {
    return projectList.filter(p =>
      (!searchName.trim() || p.name.includes(searchName.trim())) &&
      (!searchProvinceCode.trim() || p.code.includes(searchProvinceCode.trim())) &&
      (!searchGlobalCode.trim() || p.globalCode.includes(searchGlobalCode.trim()))
    )
  }, [searchName, searchProvinceCode, searchGlobalCode])

  const handleOpenProjectModal = () => {
    setSelectedProjectId(project?.id || '')
    setSearchName('')
    setSearchProvinceCode('')
    setSearchGlobalCode('')
    setShowProjectModal(true)
  }

  const handleConfirmProject = () => {
    if (!selectedProjectId) {
      alert('请选择一个项目')
      return
    }
    const selected = projectList.find(p => p.id === selectedProjectId)
    if (selected) {
      setProject(selected)
    }
    setShowProjectModal(false)
  }

  const handleAddFile = () => {
    const fileName = `项目进度证明_${progressFiles.length + 1}.pdf`
    setProgressFiles(prev => [...prev, fileName])
  }

  const handleRemoveFile = (index: number) => {
    setProgressFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 长周期维保费附件：专项签报（必传）
  const handleAddSignFile = () => {
    const fileName = `专项签报_${longCycleSignFiles.length + 1}.pdf`
    setLongCycleSignFiles(prev => [...prev, fileName])
  }
  const handleRemoveSignFile = (index: number) => {
    setLongCycleSignFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 长周期维保费附件：客户侧承诺书（非必传）
  const handleAddPromiseFile = () => {
    const fileName = `客户侧承诺书_${longCyclePromiseFiles.length + 1}.pdf`
    setLongCyclePromiseFiles(prev => [...prev, fileName])
  }
  const handleRemovePromiseFile = (index: number) => {
    setLongCyclePromiseFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleCancel = () => {
    if (onNavigate) {
      onNavigate('/finance/income/confirm')
    }
  }

  // 关闭：校验本月是否存在待订购的IT收入计划，存在则阻断提示
  const handleClose = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-based
    const hasPendingThisMonth = mockITIncome.some(row => {
      if (row.orderStatus !== '待订购') return false
      if (!row.plannedOrderDate) return false
      const d = new Date(row.plannedOrderDate)
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth
    })
    if (hasPendingThisMonth) {
      alert('存在本月待订购的IT收入计划，请提交订购或调整计划订购时间，再进行关闭！')
      return
    }
    if (onNavigate) {
      onNavigate('/finance/income/confirm')
    }
  }

  const handleSubmit = () => {
    if (!project) {
      alert('请选择项目')
      return
    }
    if (progressFiles.length === 0) {
      alert('请上传项目进度证明文件')
      return
    }
    if (hasLongCycleSelected && longCycleSignFiles.length === 0) {
      alert('勾选长周期维保费时，请上传专项签报文件')
      return
    }
    alert('IT收入计划确认发起成功！')
    if (onNavigate) {
      onNavigate('/finance/contract/product-activation/CT2026060006')
    }
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 顶部返回条 */}
        {readOnly ? (
          <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
            <button onClick={handleCancel} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h2 className="text-sm font-semibold text-gray-800">收入确认单详情</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${approvalStatus.color}`}>
                {approvalStatus.text}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
            <button onClick={handleCancel} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h2 className="text-sm font-semibold text-gray-800">收入计划确认发起</h2>
            </div>
          </div>
        )}

        {/* ========== 项目信息模块 ========== */}
        {!readOnly && !project ? (
          // ========== 图一：发起初始化空态（仅项目信息折叠模块 + 选择项目输入框） ==========
          <div className="bg-white rounded-lg shadow-sm">
            <div
              className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
              onClick={() => setProjectExpanded(v => !v)}
            >
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">项目信息</h3>
              {projectExpanded
                ? <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
                : <ChevronRight className="w-4 h-4 text-gray-500 ml-1" />
              }
            </div>
            {projectExpanded && (
              <div className="p-4">
                <div className="flex items-start min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 mt-1 pr-2 whitespace-nowrap">
                    <span className="text-red-500 mr-0.5">*</span>项目名称
                  </label>
                  <div className="flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={handleOpenProjectModal}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-blue-400 hover:bg-blue-50/30 transition-colors bg-white"
                    >
                      <span className="text-gray-400">请选择项目</span>
                      <Search className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* ========== 已选项目（详情页 / 发起选完项目后）：原完整表单 ========== */}
        {(readOnly || project) && (
          <>
            {/* 待办入口（todoContractId存在）：直接展示项目名称条，不展开合同信息 */}
            {todoContractId && project ? (
              <div className="bg-white rounded-lg shadow-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h3 className="text-sm font-semibold text-gray-800">项目信息</h3>
                  <span className="text-sm text-gray-600">{project.name} · 收入类</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                </div>
              </div>
            ) : readOnly ? (
              <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />
            ) : (
              /* 列表入口选择项目后：只展示项目名称输入框，将选中项目带入 */
              <div className="bg-white rounded-lg shadow-sm">
                <div
                  className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
                  onClick={() => setProjectExpanded(v => !v)}
                >
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h3 className="text-sm font-semibold text-gray-800">项目信息</h3>
                  {projectExpanded
                    ? <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
                    : <ChevronRight className="w-4 h-4 text-gray-500 ml-1" />
                  }
                </div>
                {projectExpanded && project && (
                  <div className="p-4">
                    <div className="flex items-start min-h-[36px]">
                      <label className="w-32 text-right text-sm text-gray-700 shrink-0 mt-1 pr-2 whitespace-nowrap">
                        <span className="text-red-500 mr-0.5">*</span>项目名称
                      </label>
                      <div className="flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={handleOpenProjectModal}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-blue-400 hover:bg-blue-50/30 transition-colors bg-white"
                        >
                          <span className="text-gray-800 truncate">{project.name}</span>
                          <Search className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========== IT收入计划确认模块 ========== */}
            {project && (
              <>
                <div className="bg-white rounded-lg shadow-sm">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
                    onClick={() => setIncomeExpanded(!incomeExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                      <h3 className="text-sm font-semibold text-gray-800">IT收入计划确认</h3>
                      <span className="text-xs text-gray-400">【{mockITIncome.length}】</span>
                    </div>
                    {incomeExpanded
                      ? <ChevronDown className="w-4 h-4 text-gray-500 ml-4" />
                      : <ChevronRight className="w-4 h-4 text-gray-500 ml-4" />
                    }
                  </div>
                  {incomeExpanded && (
                    <div className="p-4 space-y-4">
                      <div className="flex items-start gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-md">
                        <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span className="text-xs text-gray-700 leading-relaxed">
                          只能发起计划订购时间在本月的IT收入计划，如要延迟或提前订购请进行
                          <span
                            className="text-[#1677FF] cursor-pointer hover:underline font-medium"
                            onClick={() => onNavigate?.('/finance/contract/income-plan-time-adjust-init/CT2026060006')}
                          >
                            收入计划时间调整
                          </span>
                          ！
                        </span>
                      </div>
                      <div className="overflow-x-auto border border-gray-100 rounded-md">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50 text-gray-600 text-xs">
                              <th className="w-10 px-3 py-2.5 text-center font-medium whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedIncomeIds.size === mockITIncome.filter(r => r.orderStatus === '待订购').length && mockITIncome.filter(r => r.orderStatus === '待订购').length > 0}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedIncomeIds(new Set(mockITIncome.filter(r => r.orderStatus === '待订购').map(r => r.id)))
                                    } else {
                                      setSelectedIncomeIds(new Set())
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                              </th>
                              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额</th>
                              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额（不含税）</th>
                              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                              <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">是否合同资产</th>
                              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">里程碑名称</th>
                              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                              <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">订购状态</th>
                              <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupByProductName(mockITIncome).map((group) => {
                              const rowCount = group.rows.length
                              return (
                                <>
                                  {group.rows.map((row, idx) => (
                                    <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                                      <td className="px-3 py-2.5 text-center">
                                        <input
                                          type="checkbox"
                                          checked={selectedIncomeIds.has(row.id)}
                                          onChange={(e) => {
                                            setSelectedIncomeIds(prev => {
                                              const next = new Set(prev)
                                              if (e.target.checked) {
                                                next.add(row.id)
                                              } else {
                                                next.delete(row.id)
                                              }
                                              return next
                                            })
                                          }}
                                          disabled={row.orderStatus !== '待订购'}
                                          className={clsx(
                                            'w-4 h-4 text-blue-600 rounded',
                                            row.orderStatus !== '待订购' && 'opacity-50 cursor-not-allowed'
                                          )}
                                        />
                                      </td>
                                      {idx === 0 && (
                                        <>
                                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.productName}</td>
                                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].taxRate}</td>
                                        </>
                                      )}
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffAmount || '-'}</td>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                                        {row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, row.taxRate) : '-'}
                                      </td>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                        <span className={clsx(
                                          'inline-flex px-2 py-0.5 text-xs rounded-full',
                                          row.isContractAsset === '是'
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'bg-gray-50 text-gray-500'
                                        )}>{row.isContractAsset}</span>
                                      </td>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.milestoneName || '-'}</td>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                        <span className={clsx(
                                          'inline-flex px-2 py-0.5 text-xs rounded-full',
                                          row.orderStatus === '待订购'
                                            ? 'bg-orange-50 text-orange-600'
                                            : row.orderStatus === '订购中'
                                              ? 'bg-blue-50 text-blue-600'
                                              : 'bg-green-50 text-green-600'
                                        )}>{row.orderStatus || '待订购'}</span>
                                      </td>
                                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                        <button onClick={() => setItIncomeViewingPlans(row)} className="px-2 py-1 text-xs text-[#1677FF] hover:underline">回款计划</button>
                                      </td>
                                    </tr>
                                  ))}
                                </>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* IT收入计划合计 */}
                      <div className="mt-4 flex justify-end items-center gap-6">
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                          <span className="text-base font-semibold text-[#1677FF]">¥{mockITIncome.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                          <span className="text-base font-semibold text-[#1677FF]">¥{mockITIncome.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || r.plannedTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                          <span className="text-base font-semibold text-[#1677FF]">¥{mockITIncome.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                        </div>
                      </div>

                      {/* 订购信息 */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                          <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                          <span className="text-sm font-semibold text-gray-800">订购信息</span>
                        </div>
                        {hasLongCycleSelected && (
                          <div className="flex items-start gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-md">
                            <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-700 leading-relaxed">
                              （1）专项签报（必传）：经办人需在专项业务签报明确申请长周期套餐一次性开票的开票单位、合同、专项签报需经分管业务的二级经理审批，且抄送财务部。
                              <br />
                              （2）客户侧承诺书（非必传）：如以下内容合同未规定，应补充相应客户单位加盖公章的承诺书，具体内容如下：甲方在收到发票后1个月内应按发票金额全额支付款项；如确定无法支付款项，应及时退回增值税专用发票或开具红字通知单给乙方（增值税电子发票红冲）；达到收款条件后，乙方可按要求提供增值税发票。
                            </span>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                            订购说明
                          </label>
                          <div className="flex-1 min-w-0">
                            <textarea
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
                              rows={3}
                              placeholder="请输入订购说明"
                            />
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                            {!readOnly && <span className="text-red-500 mr-0.5">*</span>}
                            项目进度证明
                          </label>
                          <div className="flex-1 min-w-0">
                            {readOnly ? (
                              <div className="space-y-2">
                                {mockProgressFiles.length === 0 ? (
                                  <div className="text-sm text-gray-400">无附件</div>
                                ) : (
                                  mockProgressFiles.map(file => (
                                    <div
                                      key={file.id}
                                      className="flex items-center justify-between px-3 py-2.5 border border-gray-200 rounded-md bg-white hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                                    >
                                      <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center shrink-0">
                                          <FileText className="w-5 h-5 text-[#1677FF]" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-800 truncate">{file.name}</span>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 shrink-0">项目进度证明</span>
                                          </div>
                                          <div className="text-xs text-gray-400">{file.size} · 上传时间：{file.uploadTime}</div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1677FF] border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors shrink-0"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        下载
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            ) : (
                              <FileUpload
                                hideLabel
                                files={progressFiles}
                                onAdd={handleAddFile}
                                onRemove={handleRemoveFile}
                                uploadText={progressFiles.length > 0 ? '继续添加进度证明文件' : '点击或拖拽上传项目进度证明文件'}
                              />
                            )}
                          </div>
                        </div>
                        {/* 长周期维保费附件（勾选长周期维保费后展示） */}
                        {hasLongCycleSelected && (
                          <>
                            <div className="flex items-start gap-3">
                              <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                                <span className="text-red-500 mr-0.5">*</span>
                                专项签报
                              </label>
                              <div className="flex-1 min-w-0">
                                <FileUpload
                                  hideLabel
                                  files={longCycleSignFiles}
                                  onAdd={handleAddSignFile}
                                  onRemove={handleRemoveSignFile}
                                  uploadText={longCycleSignFiles.length > 0 ? '继续添加专项签报文件' : '点击或拖拽上传专项签报文件'}
                                />
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                                客户侧承诺书
                              </label>
                              <div className="flex-1 min-w-0">
                                <FileUpload
                                  hideLabel
                                  files={longCyclePromiseFiles}
                                  onAdd={handleAddPromiseFile}
                                  onRemove={handleRemovePromiseFile}
                                  uploadText={longCyclePromiseFiles.length > 0 ? '继续添加客户侧承诺书文件' : '点击或拖拽上传客户侧承诺书文件'}
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 流程信息（复制自产品开通页面，独立维护） */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                    <h3 className="text-sm font-semibold text-gray-800">流程信息</h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div>
                        <div className="flex items-center min-h-[36px]">
                          <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步环节</label>
                          <div className="flex-1 min-w-0">
                            <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                              产品开通
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-start min-h-[36px]">
                          <label className="w-32 text-right text-sm text-gray-700 shrink-0 mt-1">下一步处理人</label>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                                客户经理
                              </span>
                              <div className="flex-1 min-w-0">
                                <SearchableSelect
                                  value={nextHandler}
                                  onChange={setNextHandler}
                                  options={nextHandlerOptions}
                                  placeholder="请选择下一步处理人"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ========== 审批轨迹 ========== */}
            {(readOnly || project) && readOnly && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-3">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                    <h3 className="text-sm font-semibold text-gray-800">审批轨迹</h3>
                    <span className="text-xs text-gray-400 ml-1">共 {approvalTrail.filter(i => i.status !== 'pending').length} 步</span>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
                    <ol className="space-y-4">
                      {approvalTrail
                        .filter(item => item.status !== 'pending')
                        .map((item, idx) => (
                          <li key={idx} className="relative">
                            <div className={clsx(
                              'absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2',
                              item.status === 'approved' && 'bg-green-500 border-green-500',
                              item.status === 'rejected' && 'bg-red-500 border-red-500',
                              item.status === 'current' && 'bg-[#1677FF] border-[#1677FF]'
                            )} />
                            <div className="text-xs text-gray-400 mb-0.5">{item.time}</div>
                            <div className="text-sm text-gray-800">
                              <span className="font-medium">{item.actor}</span>
                              <span className="text-gray-500 ml-1.5">{item.action}</span>
                              {item.remark && (
                                <div className="text-xs text-gray-500 mt-1 bg-gray-50 px-2 py-1 rounded">
                                  {item.remark}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ========== 按钮区域（无论是否选择项目都展示） ========== */}
        {!readOnly ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
              {/* 待办入口展示「关闭」按钮，列表入口仅保留取消+提交 */}
              {todoContractId && (
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2 text-sm text-red-600 bg-white border border-red-500 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    关闭
                  </button>
                </>
              )}
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
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                返回
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========== IT收入计划回款计划查看弹框 ========== */}
      {itIncomeViewingPlans && (
        <ModalShell title="回款计划明细" onClose={() => setItIncomeViewingPlans(null)}>
          <PaymentPlansDisplay plans={itIncomeViewingPlans.paymentPlans || []} plannedIncome={itIncomeViewingPlans.plannedIncome} hideTransferDate hideMilestoneName hideHeader />
          <div className="flex justify-center mt-5">
            <button type="button" onClick={() => setItIncomeViewingPlans(null)} className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors">关闭</button>
          </div>
        </ModalShell>
      )}

      {/* ========== 选择项目弹窗 ========== */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setShowProjectModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[1100px] max-w-[95vw] overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
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

            {/* 查询条件 */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-20 text-right">项目名称</label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="请输入项目名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right">省内项目编码</label>
                  <input
                    type="text"
                    value={searchProvinceCode}
                    onChange={(e) => setSearchProvinceCode(e.target.value)}
                    placeholder="请输入省内项目编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right">全网项目编码</label>
                  <input
                    type="text"
                    value={searchGlobalCode}
                    onChange={(e) => setSearchGlobalCode(e.target.value)}
                    placeholder="请输入全网项目编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 项目列表 */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-full overflow-x-auto">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="w-10 px-4 py-2.5 text-left">
                        <span className="sr-only">选择</span>
                      </th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[180px]">项目名称</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[150px]">省内项目编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[150px]">全网项目编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[100px]">项目类型</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[100px]">签约模式</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[100px]">客户经理</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">解决方案经理</th>
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
                      filteredProjects.map(p => (
                        <tr
                          key={p.id}
                          className={clsx(
                            'cursor-pointer hover:bg-blue-50/50 transition-colors',
                            selectedProjectId === p.id && 'bg-blue-50'
                          )}
                          onClick={() => setSelectedProjectId(p.id)}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="radio"
                              name="project"
                              checked={selectedProjectId === p.id}
                              onChange={() => setSelectedProjectId(p.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </td>
                          <td className="px-3 py-3 text-gray-800">{p.name}</td>
                          <td className="px-3 py-3 text-gray-600">{p.code}</td>
                          <td className="px-3 py-3 text-gray-600">{p.globalCode}</td>
                          <td className="px-3 py-3 text-gray-600">{p.type}</td>
                          <td className="px-3 py-3 text-gray-600">{p.signMode}</td>
                          <td className="px-3 py-3 text-gray-600">{p.customerManager}</td>
                          <td className="px-3 py-3 text-gray-600">{p.solutionManager}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
