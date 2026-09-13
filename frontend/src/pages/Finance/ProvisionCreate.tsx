import { useState, useMemo, useEffect } from 'react'
import { Search, RotateCcw, ChevronDown, ChevronRight, Check, ArrowLeft, Pencil, Trash2, Plus, X } from 'lucide-react'
import clsx from 'clsx'

interface ProvisionCreateProps {
  onNavigate?: (path: string) => void
  readOnly?: boolean
  detailId?: string
}

// 全量项目数据
interface ProjectItem {
  id: string
  projectCode: string
  projectName: string
  orgName: string
  netProjectCode: string
  incomeContractName: string
  incomeFeeName: string
  businessSubject: string
  productSegment: string
  totalExpense: string
  incomeProgress: string
  cumulativePaid: string
  provisionableAmount: string
}

// 计提明细（下钻后的行）
interface ProvisionDetailItem {
  id: string
  projectId: string
  seq: number
  expensePlanCode: string
  expenseContractCode: string
  supplierName: string
  supplierCode: string
  budgetCode: string
  budgetOptions: { value: string; label: string }[]
  expenseProductName: string
  hasReimbursement: boolean
  contractAmount: string
  lastMonthPaid: string
  thisMonthNewPaid: string
  thisMonthNewPaidManual: string
  cumulativePaid: string
  lastMonthCompleted: string
  thisMonthCompleted: string
  thisMonthCompletedManual: string
  provisionAmount: string
  regressReason: string
  noContractProvision: boolean
  costCenterCode: string
  businessCategory: string
  businessSubcategory: string
  productSegment: string
  marketSegment: string
}

// 查询条件
interface FilterForm {
  projectCode: string
  projectName: string
  budgetCode: string
  forwardContractCode: string
  backwardContractCode: string
  expensePlanCode: string
  supplierCode: string
  supplierName: string
  district: string
}

const defaultFilter: FilterForm = {
  projectCode: '',
  projectName: '',
  budgetCode: '',
  forwardContractCode: '',
  backwardContractCode: '',
  expensePlanCode: '',
  supplierCode: '',
  supplierName: '',
  district: ''
}

// 区县选项
const districtOptions = [
  { value: '', label: '全部' },
  { value: 'hefei', label: '合肥市' },
  { value: 'wuhu', label: '芜湖市' },
  { value: 'bengbu', label: '蚌埠市' },
  { value: 'huainan', label: '淮南市' },
  { value: 'maanshan', label: '马鞍山市' },
  { value: 'huaibei', label: '淮北市' },
  { value: 'tongling', label: '铜陵市' },
  { value: 'anqing', label: '安庆市' },
  { value: 'huangshan', label: '黄山市' },
  { value: 'chuzhou', label: '滁州市' },
  { value: 'fuyang', label: '阜阳市' },
  { value: 'suzhou', label: '宿州市' },
  { value: 'liuan', label: '六安市' },
  { value: 'bozhou', label: '亳州市' },
  { value: 'chizhou', label: '池州市' },
  { value: 'xuancheng', label: '宣城市' }
]

// mock 全量项目数据
const mockProjects: ProjectItem[] = Array.from({ length: 20 }).map((_, i) => {
  const totalExpense = (i + 1) * 125680.88
  const incomeProgressPercent = Math.min(100, (i * 7) % 100) // 收入确认进度百分比数值
  const incomeProgress = `${incomeProgressPercent}%`
  const cumulativePaid = (i + 1) * 56800.55
  // 可计提金额 = 支出总金额 * 收入确认进度 - 累计已付款金额
  const provisionableAmount = totalExpense * (incomeProgressPercent / 100) - cumulativePaid

  return {
    id: `proj-${i + 1}`,
    projectCode: `PRJ-2026-${String(i + 1).padStart(4, '0')}`,
    projectName: [
      '合肥市第一人民医院智慧医疗项目',
      '芜湖市政务服务中心数字政府项目',
      '蚌埠市教育局智慧教育项目',
      '合肥市轨道交通集团智慧交通项目',
      '安徽省公安厅智慧城市项目'
    ][i % 5] + (i > 4 ? `-${i}` : ''),
    orgName: ['合肥市分公司', '芜湖市分公司', '蚌埠市分公司', '省公司', '合肥市分公司'][i % 5],
    netProjectCode: `NET-${String(i + 1).padStart(6, '0')}`,
    incomeContractName: `收入合同${String(i + 1).padStart(3, '0')}`,
    incomeFeeName: ['云服务收入', '专线收入', 'IDC收入', '物联网收入', '5G收入'][i % 5],
    businessSubject: ['ICT业务', 'DICT业务', '双计业务', 'ICT业务', 'DICT业务'][i % 5],
    productSegment: ['IT产品', 'CT产品', 'IT产品', 'CT产品', 'IT产品'][i % 5],
    totalExpense: totalExpense.toFixed(2),
    incomeProgress,
    cumulativePaid: cumulativePaid.toFixed(2),
    provisionableAmount: provisionableAmount.toFixed(2)
  }
})

// 生成每个项目的计提明细
const generateProvisionDetails = (projectId: string): ProvisionDetailItem[] => {
  const idx = parseInt(projectId.replace('proj-', '')) - 1
  const count = (idx % 3) + 2
  return Array.from({ length: count }).map((_, j) => {
    const lastMonthPaid = (idx + 1) * 12000 + j * 3000
    const thisMonthNewPaid = (idx + 1) * 3500 + j * 800
    const thisMonthNewPaidManual = 0
    const cumulativePaid = lastMonthPaid + thisMonthNewPaid + thisMonthNewPaidManual
    const lastMonthCompleted = (idx + 1) * 15000 + j * 3500
    const thisMonthCompleted = lastMonthCompleted + (idx + 1) * 4000 + j * 1000
    const thisMonthCompletedManual = 0
    const completedAmount = thisMonthCompletedManual > 0 ? thisMonthCompletedManual : thisMonthCompleted
    const provisionAmount = completedAmount - cumulativePaid

    return {
      id: `detail-${idx}-${j}`,
      projectId,
      seq: j + 1,
      expensePlanCode: `EP-${String(idx + 1).padStart(4, '0')}-${String(j + 1).padStart(2, '0')}`,
      expenseContractCode: `EC-${String(idx + 1).padStart(4, '0')}-${String(j + 1).padStart(2, '0')}`,
      supplierName: ['安徽XX科技有限公司', '合肥YY信息科技有限公司', '芜湖ZZ网络技术有限公司'][j % 3],
      supplierCode: `SUP-${String((idx * 3 + j) % 50 + 1).padStart(4, '0')}`,
      budgetCode: `BUD-${String(idx + 1).padStart(4, '0')}-01`,
      budgetOptions: [
        { value: `BUD-${String(idx + 1).padStart(4, '0')}-01`, label: `预算项01` },
        { value: `BUD-${String(idx + 1).padStart(4, '0')}-02`, label: `预算项02` },
        { value: `BUD-${String(idx + 1).padStart(4, '0')}-03`, label: `预算项03` }
      ],
      expenseProductName: ['云服务器', '专线接入', 'IDC机柜', '云存储', '安全服务'][j % 5],
      hasReimbursement: j % 2 === 0,
      contractAmount: ((idx + 1) * 50000 + j * 10000).toFixed(2),
      lastMonthPaid: lastMonthPaid.toFixed(2),
      thisMonthNewPaid: thisMonthNewPaid.toFixed(2),
      thisMonthNewPaidManual: thisMonthNewPaidManual.toFixed(2),
      cumulativePaid: cumulativePaid.toFixed(2),
      lastMonthCompleted: lastMonthCompleted.toFixed(2),
      thisMonthCompleted: thisMonthCompleted.toFixed(2),
      thisMonthCompletedManual: '',
      provisionAmount: provisionAmount.toFixed(2),
      regressReason: '',
      noContractProvision: false,
      costCenterCode: `CC-${String((idx * 3 + j) % 100 + 1).padStart(4, '0')}`,
      businessCategory: ['政企', '政要', '行业', '互联网', '金融'][j % 5],
      businessSubcategory: ['政务云', '医疗', '教育', '制造', '交通'][j % 5],
      productSegment: ['云服务', 'IDC服务', '专线服务', '5G应用', '物联网'][j % 5],
      marketSegment: ['政企市场', '个人市场', '家庭市场', '新兴市场', '政要市场'][j % 5]
    }
  })
}

// 计提信息 - 支出计划明细 mock 数据
const mockProvisionDetailRows = [
  {
    id: 'pd-1',
    netProjectCode: 'AH20260001',
    contractCode: 'HT-2026-0001',
    contractBudgetLineNo: 'YS-001',
    expensePlanCode: 'ZCJH-001',
    productName: '受托代销往来款',
    taxRate: '6%',
    tariffName: '[1372]受托代销往来款',
    plannedExpense: '150,000',
    shareType: '月',
    sharePeriod: '12',
    costPaymentDate: '2026-02',
    provisionableAmount: '12,500.00',
    currentProvisionAmount: '12,500.00'
  },
  {
    id: 'pd-2',
    netProjectCode: 'AH20260001',
    contractCode: 'HT-2026-0001',
    contractBudgetLineNo: 'YS-002',
    expensePlanCode: 'ZCJH-002',
    productName: '受托代销手续费',
    taxRate: '6%',
    tariffName: '[849]受托代销手续费',
    plannedExpense: '100,000',
    shareType: '月',
    sharePeriod: '12',
    costPaymentDate: '2026-02',
    provisionableAmount: '8,333.33',
    currentProvisionAmount: '8,333.33'
  },
  {
    id: 'pd-3',
    netProjectCode: 'AH20260002',
    contractCode: 'HT-2026-0002',
    contractBudgetLineNo: 'YS-003',
    expensePlanCode: 'ZCJH-003',
    productName: '商品销售成本',
    taxRate: '13%',
    tariffName: '[956]商品销售成本',
    plannedExpense: '80,000',
    shareType: '一次性',
    sharePeriod: '1',
    costPaymentDate: '2026-03',
    provisionableAmount: '80,000.00',
    currentProvisionAmount: '50,000.00'
  },
  {
    id: 'pd-4',
    netProjectCode: 'AH20260003',
    contractCode: 'HT-2026-0003',
    contractBudgetLineNo: 'YS-004',
    expensePlanCode: 'ZCJH-004',
    productName: '系统集成服务',
    taxRate: '6%',
    tariffName: '[1205]系统集成服务',
    plannedExpense: '300,000',
    shareType: '月',
    sharePeriod: '24',
    costPaymentDate: '2026-01',
    provisionableAmount: '12,500.00',
    currentProvisionAmount: '12,500.00'
  },
  {
    id: 'pd-5',
    netProjectCode: 'AH20260004',
    contractCode: 'HT-2026-0004',
    contractBudgetLineNo: 'YS-005',
    expensePlanCode: 'ZCJH-005',
    productName: '软件开发服务',
    taxRate: '6%',
    tariffName: '[1206]软件开发服务',
    plannedExpense: '500,000',
    shareType: '一次性',
    sharePeriod: '1',
    costPaymentDate: '2026-06',
    provisionableAmount: '500,000.00',
    currentProvisionAmount: '200,000.00'
  }
]

export default function ProvisionCreate({ onNavigate, readOnly = false, detailId }: ProvisionCreateProps) {
  // 全量项目筛选
  const [projectFilter, setProjectFilter] = useState<FilterForm>(defaultFilter)
  const [submittedProjectFilter, setSubmittedProjectFilter] = useState<FilterForm>(defaultFilter)
  const [projectPage, setProjectPage] = useState(1)
  const projectPageSize = 10

  // 选中的项目（id列表）
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])

  // 计提明细新增弹框
  const [provisionDetailModalVisible, setProvisionDetailModalVisible] = useState(false)

  // 展开的项目（查看计提明细）
  const [expandedProjectIds, setExpandedProjectIds] = useState<string[]>([])

  // 计提信息筛选
  const [detailFilter, setDetailFilter] = useState<FilterForm>(defaultFilter)
  const [submittedDetailFilter, setSubmittedDetailFilter] = useState<FilterForm>(defaultFilter)

  // 计提明细数据（按项目id存储）
  const [provisionDetailsMap, setProvisionDetailsMap] = useState<Record<string, ProvisionDetailItem[]>>({})

  // 计算全量项目筛选结果
  const filteredProjects = useMemo(() => {
    return mockProjects.filter(p => {
      const codeMatch = !submittedProjectFilter.projectCode.trim() || p.projectCode.includes(submittedProjectFilter.projectCode.trim())
      const nameMatch = !submittedProjectFilter.projectName.trim() || p.projectName.includes(submittedProjectFilter.projectName.trim())
      const budgetMatch = !submittedProjectFilter.budgetCode.trim()
      const forwardMatch = !submittedProjectFilter.forwardContractCode.trim() || p.incomeContractName.includes(submittedProjectFilter.forwardContractCode.trim())
      const backwardMatch = !submittedProjectFilter.backwardContractCode.trim()
      const planMatch = !submittedProjectFilter.expensePlanCode.trim()
      const supCodeMatch = !submittedProjectFilter.supplierCode.trim()
      const supNameMatch = !submittedProjectFilter.supplierName.trim()
      const districtMatch = !submittedProjectFilter.district
      return codeMatch && nameMatch && budgetMatch && forwardMatch && backwardMatch && planMatch && supCodeMatch && supNameMatch && districtMatch
    })
  }, [submittedProjectFilter])

  const totalProjectPages = Math.ceil(filteredProjects.length / projectPageSize)
  const pagedProjects = filteredProjects.slice((projectPage - 1) * projectPageSize, projectPage * projectPageSize)

  // 本页全选状态
  const currentPageAllSelected = pagedProjects.length > 0 && pagedProjects.every(p => selectedProjectIds.includes(p.id))
  const currentPageIndeterminate = pagedProjects.some(p => selectedProjectIds.includes(p.id)) && !currentPageAllSelected

  // 查询结果全选状态
  const allResultSelected = filteredProjects.length > 0 && filteredProjects.every(p => selectedProjectIds.includes(p.id))

  // 选中的项目数据
  const selectedProjects = mockProjects.filter(p => selectedProjectIds.includes(p.id))

  // 获取项目的计提明细（懒加载）
  const getProjectDetails = (projectId: string): ProvisionDetailItem[] => {
    if (!provisionDetailsMap[projectId]) {
      return generateProvisionDetails(projectId)
    }
    return provisionDetailsMap[projectId]
  }

  // 选中的计提明细（按项目存储选中的明细id）
  const [selectedDetailIdsMap, setSelectedDetailIdsMap] = useState<Record<string, string[]>>({})

  // 只读模式下默认加载数据
  useEffect(() => {
    if (readOnly) {
      // 默认选中前2个项目用于展示
      setSelectedProjectIds(mockProjects.slice(0, 2).map(p => p.id))
      // 默认展开第一个项目
      setExpandedProjectIds([mockProjects[0].id])
      // 默认选中所有明细
      const detailMap: Record<string, string[]> = {}
      mockProjects.slice(0, 2).forEach(p => {
        const details = generateProvisionDetails(p.id)
        detailMap[p.id] = details.map(d => d.id)
      })
      setSelectedDetailIdsMap(detailMap)
    }
  }, [readOnly, detailId])

  // 项目全选/取消全选
  const handleProjectSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjectIds(prev => {
        const newIds = [...prev]
        pagedProjects.forEach(p => {
          if (!newIds.includes(p.id)) newIds.push(p.id)
        })
        return newIds
      })
    } else {
      setSelectedProjectIds(prev => prev.filter(id => !pagedProjects.find(p => p.id === id)))
    }
  }

  // 查询条件下全选/取消全选
  const handleSelectAllResult = (checked: boolean) => {
    if (checked) {
      setSelectedProjectIds(filteredProjects.map(p => p.id))
    } else {
      setSelectedProjectIds([])
    }
  }

  // 单个项目勾选
  const handleProjectCheck = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjectIds(prev => [...prev, projectId])
    } else {
      setSelectedProjectIds(prev => prev.filter(id => id !== projectId))
    }
  }

  // 展开/收起项目明细
  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjectIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
    // 懒加载明细数据
    if (!provisionDetailsMap[projectId]) {
      setProvisionDetailsMap(prev => ({
        ...prev,
        [projectId]: generateProvisionDetails(projectId)
      }))
    }
  }

  // 计提明细勾选
  const handleDetailCheck = (projectId: string, detailId: string, checked: boolean) => {
    setSelectedDetailIdsMap(prev => {
      const current = prev[projectId] || []
      return {
        ...prev,
        [projectId]: checked
          ? [...current, detailId]
          : current.filter(id => id !== detailId)
      }
    })
  }

  // 项目下明细全选
  const handleDetailSelectAll = (projectId: string, checked: boolean) => {
    const details = getProjectDetails(projectId)
    setSelectedDetailIdsMap(prev => ({
      ...prev,
      [projectId]: checked ? details.map(d => d.id) : []
    }))
  }

  // 明细行全选状态
  const isDetailAllSelected = (projectId: string) => {
    const details = getProjectDetails(projectId)
    const selected = selectedDetailIdsMap[projectId] || []
    return details.length > 0 && details.every(d => selected.includes(d.id))
  }

  const isDetailIndeterminate = (projectId: string) => {
    const details = getProjectDetails(projectId)
    const selected = selectedDetailIdsMap[projectId] || []
    return selected.length > 0 && !isDetailAllSelected(projectId)
  }

  // 更新计提明细字段
  const updateDetailField = (projectId: string, detailId: string, field: keyof ProvisionDetailItem, value: any) => {
    setProvisionDetailsMap(prev => {
      const details = prev[projectId] || generateProvisionDetails(projectId)
      const newDetails = details.map(d => {
        if (d.id !== detailId) return d
        const updated = { ...d, [field]: value }

        // 重新计算累计已付款
        if (field === 'thisMonthNewPaidManual') {
          const manual = parseFloat(value) || 0
          const lastPaid = parseFloat(d.lastMonthPaid) || 0
          const thisPaid = parseFloat(d.thisMonthNewPaid) || 0
          updated.cumulativePaid = (lastPaid + thisPaid + manual).toFixed(2)
        }

        // 重新计算本次计提金额
        if (field === 'thisMonthCompletedManual' || field === 'thisMonthNewPaidManual') {
          const manualCompleted = parseFloat(updated.thisMonthCompletedManual)
          const autoCompleted = parseFloat(updated.thisMonthCompleted) || 0
          const completed = !isNaN(manualCompleted) && updated.thisMonthCompletedManual !== '' ? manualCompleted : autoCompleted
          const cumPaid = parseFloat(updated.cumulativePaid) || 0
          updated.provisionAmount = (completed - cumPaid).toFixed(2)
        }

        return updated
      })
      return { ...prev, [projectId]: newDetails }
    })
  }

  // 数字输入校验（两位小数）
  const handleDecimalInput = (e: React.ChangeEvent<HTMLInputElement>, projectId: string, detailId: string, field: keyof ProvisionDetailItem, minVal?: number) => {
    let val = e.target.value
    val = val.replace(/[^\d.]/g, '')
    const parts = val.split('.')
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('')
    }
    if (parts[1] && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].slice(0, 2)
    }
    if (val.startsWith('-')) val = val.slice(1)
    if (minVal !== undefined && val !== '' && parseFloat(val) < minVal) {
      val = minVal.toString()
    }
    updateDetailField(projectId, detailId, field, val)
  }

  // 计算汇总
  const summaryData = useMemo(() => {
    const projects: (ProjectItem & { provisionAmount: string; cumulativePaid: string })[] = []
    let totalProvision = 0

    selectedProjectIds.forEach(projId => {
      const project = mockProjects.find(p => p.id === projId)
      if (!project) return

      const details = provisionDetailsMap[projId] || generateProvisionDetails(projId)
      const selectedDetailIds = selectedDetailIdsMap[projId] || []

      // 仅按"勾选"的计提明细汇总；若未勾选任何明细，金额展示为空
      let projProvision = 0
      let projCumPaid = 0

      if (selectedDetailIds.length > 0) {
        details.forEach(d => {
          if (selectedDetailIds.includes(d.id)) {
            projProvision += parseFloat(d.provisionAmount) || 0
            projCumPaid += parseFloat(d.cumulativePaid) || 0
          }
        })
      }

      // 仅在有勾选明细时累加到总本次计提金额
      if (selectedDetailIds.length > 0) {
        totalProvision += projProvision
      }

      projects.push({
        ...project,
        // 未勾选明细时展示 "-"（空值）
        provisionAmount: selectedDetailIds.length > 0 ? projProvision.toFixed(2) : '-',
        cumulativePaid: selectedDetailIds.length > 0 ? projCumPaid.toFixed(2) : '-'
      })
    })

    return { projects, totalProvision: totalProvision.toFixed(2) }
  }, [selectedProjectIds, provisionDetailsMap, selectedDetailIdsMap])

  const handleProjectFilterChange = <K extends keyof FilterForm>(key: K, value: FilterForm[K]) => {
    setProjectFilter(prev => ({ ...prev, [key]: value }))
  }

  const handleProjectSearch = () => {
    setSubmittedProjectFilter(projectFilter)
    setProjectPage(1)
  }

  const handleProjectReset = () => {
    setProjectFilter(defaultFilter)
    setSubmittedProjectFilter(defaultFilter)
    setProjectPage(1)
  }

  const handleDetailFilterChange = <K extends keyof FilterForm>(key: K, value: FilterForm[K]) => {
    setDetailFilter(prev => ({ ...prev, [key]: value }))
  }

  const handleDetailSearch = () => {
    setSubmittedDetailFilter(detailFilter)
  }

  const handleDetailReset = () => {
    setDetailFilter(defaultFilter)
    setSubmittedDetailFilter(defaultFilter)
  }

  const handleBack = () => {
    onNavigate && onNavigate('/finance/expense/provision')
  }

  const handleSubmit = () => {
    if (selectedProjectIds.length === 0) {
      alert('请至少选择一个项目')
      return
    }
    alert(`提交成功！共 ${selectedProjectIds.length} 个项目，本次计提金额 ${summaryData.totalProvision} 元`)
    onNavigate && onNavigate('/finance/expense/provision')
  }

  const handleCancel = () => {
    if (!confirm('确定取消本次计提发起吗？')) return
    onNavigate && onNavigate('/finance/expense/provision')
  }

  // 筛选栏组件
  const FilterBar = ({
    filter,
    onChange,
    onSearch,
    onReset,
    showSelectAll,
    allSelected,
    onSelectAll
  }: {
    filter: FilterForm
    onChange: (key: keyof FilterForm, value: string) => void
    onSearch: () => void
    onReset: () => void
    showSelectAll?: boolean
    allSelected?: boolean
    onSelectAll?: (checked: boolean) => void
  }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
      <div className="grid grid-cols-3 gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <label className="w-24 text-right text-sm text-gray-700 shrink-0">省内项目编码</label>
          <input
            type="text"
            value={filter.projectCode}
            onChange={(e) => onChange('projectCode', e.target.value)}
            placeholder="请输入"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-right text-sm text-gray-700 shrink-0">项目名称</label>
          <input
            type="text"
            value={filter.projectName}
            onChange={(e) => onChange('projectName', e.target.value)}
            placeholder="请输入"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-right text-sm text-gray-700 shrink-0">预算编码</label>
          <input
            type="text"
            value={filter.budgetCode}
            onChange={(e) => onChange('budgetCode', e.target.value)}
            placeholder="请输入"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-right text-sm text-gray-700 shrink-0">前向合同编码</label>
          <input
            type="text"
            value={filter.forwardContractCode}
            onChange={(e) => onChange('forwardContractCode', e.target.value)}
            placeholder="请输入"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-right text-sm text-gray-700 shrink-0">后向合同编码</label>
          <input
            type="text"
            value={filter.backwardContractCode}
            onChange={(e) => onChange('backwardContractCode', e.target.value)}
            placeholder="请输入"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-right text-sm text-gray-700 shrink-0">支出计划编码</label>
          <input
            type="text"
            value={filter.expensePlanCode}
            onChange={(e) => onChange('expensePlanCode', e.target.value)}
            placeholder="请输入"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-right text-sm text-gray-700 shrink-0">供应商编码</label>
          <input
            type="text"
            value={filter.supplierCode}
            onChange={(e) => onChange('supplierCode', e.target.value)}
            placeholder="请输入"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-right text-sm text-gray-700 shrink-0">供应商名称</label>
          <input
            type="text"
            value={filter.supplierName}
            onChange={(e) => onChange('supplierName', e.target.value)}
            placeholder="请输入"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="w-24 text-right text-sm text-gray-700 shrink-0">项目归属区县</label>
          <select
            value={filter.district}
            onChange={(e) => onChange('district', e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
          >
            {districtOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        {showSelectAll && (
          <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => onSelectAll && onSelectAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#1677FF] focus:ring-[#1677FF]"
            />
            <span>查询条件下全选（共 {filteredProjects.length} 条）</span>
          </label>
        )}
        <div className={clsx('flex justify-center gap-3', showSelectAll && 'ml-auto')}>
          <button
            type="button"
            onClick={onReset}
            className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
          <button
            type="button"
            onClick={onSearch}
            className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            查询
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 顶部返回条 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={handleBack} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">{readOnly ? '计提单详情' : '计提单发起'}</h2>
          </div>
        </div>

        {/* ========== 全量项目模块 ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">{readOnly ? '项目信息' : '全量项目'}</h3>
            <span className="text-xs text-gray-400">
              {readOnly ? `共 ${selectedProjects.length} 条` : `共 ${filteredProjects.length} 条，已选 ${selectedProjectIds.length} 条`}
            </span>
          </div>

          {!readOnly && (
            <FilterBar
              filter={projectFilter}
              onChange={handleProjectFilterChange}
              onSearch={handleProjectSearch}
              onReset={handleProjectReset}
              showSelectAll
              allSelected={allResultSelected}
              onSelectAll={handleSelectAllResult}
            />
          )}

          {readOnly ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500">
                    <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">省内项目编码</th>
                    <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">项目名称</th>
                    <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">归属组织</th>
                    <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">全网项目编码</th>
                    <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">收入合同名称</th>
                    <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">收入费项名称</th>
                    <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">业务科目</th>
                    <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">产品段</th>
                    <th className="px-3 py-2.5 text-right font-medium align-top min-w-[130px]">支出总金额（元，不含税）</th>
                    <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">收入确认进度</th>
                    <th className="px-3 py-2.5 text-right font-medium align-top min-w-[140px]">累计已付款金额（元，不含税）</th>
                    <th className="px-3 py-2.5 text-right font-medium align-top min-w-[130px]">可计提金额（元，不含税）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedProjects.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                    </tr>
                  ) : (
                    selectedProjects.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.projectCode}</td>
                        <td className="px-3 py-3 text-gray-800 align-top max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">{item.projectName}</td>
                        <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.orgName}</td>
                        <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.netProjectCode}</td>
                        <td className="px-3 py-3 text-gray-600 align-top max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis">{item.incomeContractName}</td>
                        <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.incomeFeeName}</td>
                        <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.businessSubject}</td>
                        <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.productSegment}</td>
                        <td className="px-3 py-3 text-gray-800 text-right align-top whitespace-nowrap">{item.totalExpense}</td>
                        <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.incomeProgress}</td>
                        <td className="px-3 py-3 text-gray-800 text-right align-top whitespace-nowrap">{item.cumulativePaid}</td>
                        <td className="px-3 py-3 text-[#1677FF] text-right align-top font-medium whitespace-nowrap">{item.provisionableAmount}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="px-3 py-2.5 text-left font-medium w-10 align-top">
                    <input
                      type="checkbox"
                      checked={currentPageAllSelected}
                      ref={(el) => { if (el) el.indeterminate = currentPageIndeterminate }}
                      onChange={(e) => handleProjectSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#1677FF] focus:ring-[#1677FF]"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">省内项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">项目名称</th>
                  <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">归属组织</th>
                  <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">收入合同名称</th>
                  <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">收入费项名称</th>
                  <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">业务科目</th>
                  <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">产品段</th>
                  <th className="px-3 py-2.5 text-right font-medium align-top min-w-[130px]">支出总金额（元，不含税）</th>
                  <th className="px-3 py-2.5 text-left font-medium align-top whitespace-nowrap">收入确认进度</th>
                  <th className="px-3 py-2.5 text-right font-medium align-top min-w-[140px]">累计已付款金额（元，不含税）</th>
                  <th className="px-3 py-2.5 text-right font-medium align-top min-w-[130px]">可计提金额（元，不含税）</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedProjects.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  pagedProjects.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 align-top">
                        <input
                          type="checkbox"
                          checked={selectedProjectIds.includes(item.id)}
                          onChange={(e) => handleProjectCheck(item.id, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-[#1677FF] focus:ring-[#1677FF]"
                        />
                      </td>
                      <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.projectCode}</td>
                      <td className="px-3 py-3 text-gray-800 align-top max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">{item.projectName}</td>
                      <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.orgName}</td>
                      <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.netProjectCode}</td>
                      <td className="px-3 py-3 text-gray-600 align-top max-w-[180px] whitespace-nowrap overflow-hidden text-ellipsis">{item.incomeContractName}</td>
                      <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.incomeFeeName}</td>
                      <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.businessSubject}</td>
                      <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.productSegment}</td>
                      <td className="px-3 py-3 text-gray-800 text-right align-top whitespace-nowrap">{item.totalExpense}</td>
                      <td className="px-3 py-3 text-gray-600 align-top whitespace-nowrap">{item.incomeProgress}</td>
                      <td className="px-3 py-3 text-gray-800 text-right align-top whitespace-nowrap">{item.cumulativePaid}</td>
                      <td className="px-3 py-3 text-[#1677FF] text-right align-top font-medium whitespace-nowrap">{item.provisionableAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {filteredProjects.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                共 {filteredProjects.length} 条记录，第 {projectPage}/{totalProjectPages || 1} 页
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={projectPage <= 1}
                  onClick={() => setProjectPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  type="button"
                  disabled={projectPage >= totalProjectPages}
                  onClick={() => setProjectPage(p => Math.min(totalProjectPages, p + 1))}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* ========== 计提信息模块 ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">计提信息</h3>
            <span className="text-xs text-gray-400">已选 {selectedProjects.length} 个项目</span>
          </div>

          {selectedProjects.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-400">
              {readOnly ? '暂无项目数据' : '请先在上方全量项目中选择项目'}
            </div>
          ) : (
            <>
              <div className={clsx('space-y-4', !readOnly && 'mt-0')}>
                {selectedProjects.map(project => {
                  const details = getProjectDetails(project.id)
                  const isExpanded = expandedProjectIds.includes(project.id)
                  const allSelected = isDetailAllSelected(project.id)
                  const indeterminate = isDetailIndeterminate(project.id)

                  // 项目信息行的金额字段 = 计提明细各列之和
                  const sumContractAmount = details.reduce((sum, d) => sum + (parseFloat(d.contractAmount) || 0), 0)
                  const sumCumulativePaid = details.reduce((sum, d) => sum + (parseFloat(d.cumulativePaid) || 0), 0)
                  const sumProvisionAmount = details.reduce((sum, d) => sum + (parseFloat(d.provisionAmount) || 0), 0)
                  const totalExpense = sumContractAmount.toFixed(2)
                  const cumulativePaid = sumCumulativePaid.toFixed(2)
                  const provisionableAmount = sumProvisionAmount.toFixed(2)

                  return (
                    <div key={project.id} className="border border-gray-100 rounded-lg overflow-hidden">
                      {/* 项目信息行 - 与全量项目相同字段 */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm table-fixed">
                          <colgroup>
                            <col style={{ width: '40px' }} />
                            {!readOnly && <col style={{ width: '40px' }} />}
                            <col style={{ width: '120px' }} />
                            <col style={{ width: '200px' }} />
                            <col style={{ width: '100px' }} />
                            <col style={{ width: '120px' }} />
                            <col style={{ width: '180px' }} />
                            <col style={{ width: '100px' }} />
                            <col style={{ width: '100px' }} />
                            <col style={{ width: '80px' }} />
                            <col style={{ width: '140px' }} />
                            <col style={{ width: '90px' }} />
                            <col style={{ width: '140px' }} />
                            <col style={{ width: '140px' }} />
                          </colgroup>
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr className="text-gray-500 text-xs">
                              <th className="px-3 py-2 text-left font-medium align-top"></th>
                              {!readOnly && <th className="px-3 py-2 text-left font-medium align-top"></th>}
                              <th className="px-3 py-2 text-left font-medium align-top"><div className="line-clamp-2">省内项目编码</div></th>
                              <th className="px-3 py-2 text-left font-medium align-top"><div className="line-clamp-2">项目名称</div></th>
                              <th className="px-3 py-2 text-left font-medium align-top"><div className="line-clamp-2">归属组织</div></th>
                              <th className="px-3 py-2 text-left font-medium align-top"><div className="line-clamp-2">全网项目编码</div></th>
                              <th className="px-3 py-2 text-left font-medium align-top"><div className="line-clamp-2">收入合同名称</div></th>
                              <th className="px-3 py-2 text-left font-medium align-top"><div className="line-clamp-2">收入费项名称</div></th>
                              <th className="px-3 py-2 text-left font-medium align-top"><div className="line-clamp-2">业务科目</div></th>
                              <th className="px-3 py-2 text-left font-medium align-top"><div className="line-clamp-2">产品段</div></th>
                              <th className="px-3 py-2 text-right font-medium align-top"><div className="line-clamp-2">支出总金额（元，不含税）</div></th>
                              <th className="px-3 py-2 text-left font-medium align-top"><div className="line-clamp-2">收入确认进度</div></th>
                              <th className="px-3 py-2 text-right font-medium align-top"><div className="line-clamp-2">累计已付款金额（元，不含税）</div></th>
                              <th className="px-3 py-2 text-right font-medium align-top"><div className="line-clamp-2">可计提金额（元，不含税）</div></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => toggleProjectExpand(project.id)}
                            >
                              <td className="px-3 py-2.5 align-top">
                                {isExpanded
                                  ? <ChevronDown className="w-4 h-4 text-gray-500" />
                                  : <ChevronRight className="w-4 h-4 text-gray-500" />
                                }
                              </td>
                              {!readOnly && (
                                <td className="px-3 py-2.5 align-top" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={allSelected}
                                    ref={(el) => { if (el) el.indeterminate = indeterminate }}
                                    onChange={(e) => handleDetailSelectAll(project.id, e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-[#1677FF] focus:ring-[#1677FF]"
                                  />
                                </td>
                              )}
                              <td className="px-3 py-2.5 text-gray-600 align-top"><div className="line-clamp-2" title={project.projectCode}>{project.projectCode}</div></td>
                              <td className="px-3 py-2.5 text-gray-800 font-medium align-top"><div className="line-clamp-2" title={project.projectName}>{project.projectName}</div></td>
                              <td className="px-3 py-2.5 text-gray-600 align-top"><div className="line-clamp-2" title={project.orgName}>{project.orgName}</div></td>
                              <td className="px-3 py-2.5 text-gray-600 align-top"><div className="line-clamp-2" title={project.netProjectCode}>{project.netProjectCode}</div></td>
                              <td className="px-3 py-2.5 text-gray-600 align-top"><div className="line-clamp-2" title={project.incomeContractName}>{project.incomeContractName}</div></td>
                              <td className="px-3 py-2.5 text-gray-600 align-top"><div className="line-clamp-2" title={project.incomeFeeName}>{project.incomeFeeName}</div></td>
                              <td className="px-3 py-2.5 text-gray-600 align-top"><div className="line-clamp-2" title={project.businessSubject}>{project.businessSubject}</div></td>
                              <td className="px-3 py-2.5 text-gray-600 align-top"><div className="line-clamp-2" title={project.productSegment}>{project.productSegment}</div></td>
                              <td className="px-3 py-2.5 text-gray-800 text-right align-top whitespace-nowrap" title={totalExpense}>{totalExpense}</td>
                              <td className="px-3 py-2.5 text-gray-600 align-top whitespace-nowrap" title={project.incomeProgress}>{project.incomeProgress}</td>
                              <td className="px-3 py-2.5 text-gray-800 text-right align-top whitespace-nowrap" title={cumulativePaid}>{cumulativePaid}</td>
                              <td className="px-3 py-2.5 text-[#1677FF] text-right align-top font-medium whitespace-nowrap" title={provisionableAmount}>{provisionableAmount}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {/* 明细列表（下钻） */}
                      {isExpanded && (
                        <div className="overflow-x-auto border-t border-gray-100">
                          <table className="w-full text-sm table-fixed">
                            <colgroup>
                              {!readOnly && <col style={{ width: '40px' }} />}
                              <col style={{ width: '60px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '140px' }} />
                              <col style={{ width: '100px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '80px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '120px' }} />
                              <col style={{ width: '100px' }} />
                              <col style={{ width: '90px' }} />
                              <col style={{ width: '90px' }} />
                              <col style={{ width: '90px' }} />
                              <col style={{ width: '90px' }} />
                              <col style={{ width: '90px' }} />
                              {!readOnly && <col style={{ width: '100px' }} />}
                            </colgroup>
                            <thead className="bg-gray-50">
                              <tr className="text-gray-500 text-xs">
                                {!readOnly && <th className="px-2 py-2 text-left font-medium align-top"></th>}
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">序号</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">支出计划编码</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">支出合同编码</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">供应商名称</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">供应商编码</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">预算编码</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">支出产品名称</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">是否包含在途报账单</div></th>
                                <th className="px-2 py-2 text-right font-medium align-top"><div className="line-clamp-2">支出合同金额（元，不含税）</div></th>
                                <th className="px-2 py-2 text-right font-medium align-top"><div className="line-clamp-2">累计上月付款金额（元，不含税）</div></th>
                                <th className="px-2 py-2 text-right font-medium align-top"><div className="line-clamp-2">本月新增付款金额（元，不含税）</div></th>
                                <th className="px-2 py-2 text-right font-medium align-top"><div className="line-clamp-2">本月新增付款金额-手动（元，不含税）</div></th>
                                <th className="px-2 py-2 text-right font-medium align-top"><div className="line-clamp-2">累计已付款金额（元，不含税）</div></th>
                                <th className="px-2 py-2 text-right font-medium align-top"><div className="line-clamp-2">累计上月完成额（元，不含税）</div></th>
                                <th className="px-2 py-2 text-right font-medium align-top"><div className="line-clamp-2">累计本月完成额（元，不含税）</div></th>
                                <th className="px-2 py-2 text-right font-medium align-top"><div className="line-clamp-2">累计本月完成额-手动（元，不含税）</div></th>
                                <th className="px-2 py-2 text-right font-medium align-top"><div className="line-clamp-2">本次计提金额（元，不含税）</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">进度倒退原因</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">成本中心代码</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">业务大类</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">业务小类</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">产品段</div></th>
                                <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">市场段</div></th>
                                {!readOnly && <th className="px-2 py-2 text-left font-medium align-top"><div className="line-clamp-2">操作</div></th>}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {details.map(detail => {
                                const isSelected = (selectedDetailIdsMap[project.id] || []).includes(detail.id)
                                // 进度倒退原因必填校验：累计本月完成额（有手动取手动，没手动取自动）小于累计上月完成额
                                const manualCompleted = parseFloat(detail.thisMonthCompletedManual)
                                const autoCompleted = parseFloat(detail.thisMonthCompleted) || 0
                                const completedAmount = !isNaN(manualCompleted) && detail.thisMonthCompletedManual !== '' && detail.thisMonthCompletedManual.trim() !== ''
                                  ? manualCompleted
                                  : autoCompleted
                                const lastMonthCompletedAmount = parseFloat(detail.lastMonthCompleted) || 0
                                const showRegressRequired = completedAmount < lastMonthCompletedAmount
                                const budgetLabel = detail.budgetOptions.find(o => o.value === detail.budgetCode)?.label || detail.budgetCode
                                return (
                                  <tr key={detail.id} className="hover:bg-gray-50/30">
                                    {!readOnly && (
                                      <td className="px-2 py-2 align-top">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => handleDetailCheck(project.id, detail.id, e.target.checked)}
                                          className="w-4 h-4 rounded border-gray-300 text-[#1677FF] focus:ring-[#1677FF]"
                                        />
                                      </td>
                                    )}
                                    <td className="px-2 py-2 text-gray-600 align-top"><div className="line-clamp-2" title={String(detail.seq)}>{detail.seq}</div></td>
                                    <td className="px-2 py-2 text-gray-600 align-top"><div className="line-clamp-2" title={detail.expensePlanCode}>{detail.expensePlanCode}</div></td>
                                    <td className="px-2 py-2 text-gray-600 align-top"><div className="line-clamp-2" title={detail.expenseContractCode}>{detail.expenseContractCode}</div></td>
                                    <td className="px-2 py-2 text-gray-600 align-top"><div className="line-clamp-2" title={detail.supplierName}>{detail.supplierName}</div></td>
                                    <td className="px-2 py-2 text-gray-600 align-top"><div className="line-clamp-2" title={detail.supplierCode}>{detail.supplierCode}</div></td>
                                    <td className="px-2 py-2 align-top">
                                      {readOnly ? (
                                        <span className="text-gray-600 text-xs block line-clamp-2" title={budgetLabel}>{budgetLabel}</span>
                                      ) : (
                                        <select
                                          value={detail.budgetCode}
                                          onChange={(e) => updateDetailField(project.id, detail.id, 'budgetCode', e.target.value)}
                                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                                        >
                                          {detail.budgetOptions.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                          ))}
                                        </select>
                                      )}
                                    </td>
                                    <td className="px-2 py-2 text-gray-600 align-top"><div className="line-clamp-2" title={detail.expenseProductName}>{detail.expenseProductName}</div></td>
                                    <td className="px-2 py-2 text-gray-600 align-top">{detail.hasReimbursement ? '是' : '否'}</td>
                                    <td className="px-2 py-2 text-gray-800 text-right align-top whitespace-nowrap">{detail.contractAmount}</td>
                                    <td className="px-2 py-2 text-gray-600 text-right align-top whitespace-nowrap">{detail.lastMonthPaid}</td>
                                    <td className="px-2 py-2 text-gray-600 text-right align-top whitespace-nowrap">{detail.thisMonthNewPaid}</td>
                                    <td className="px-2 py-2 align-top text-right whitespace-nowrap">
                                      {readOnly ? (
                                        <span className="text-gray-600 text-xs">{detail.thisMonthNewPaidManual || '-'}</span>
                                      ) : (
                                        <input
                                          type="text"
                                          value={detail.thisMonthNewPaidManual}
                                          onChange={(e) => handleDecimalInput(e, project.id, detail.id, 'thisMonthNewPaidManual', -5)}
                                          placeholder="-5起"
                                          className="w-24 px-2 py-1 text-xs text-right border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        />
                                      )}
                                    </td>
                                    <td className="px-2 py-2 text-gray-800 text-right align-top font-medium whitespace-nowrap">{detail.cumulativePaid}</td>
                                    <td className="px-2 py-2 text-gray-600 text-right align-top whitespace-nowrap">{detail.lastMonthCompleted}</td>
                                    <td className="px-2 py-2 text-gray-600 text-right align-top whitespace-nowrap">{detail.thisMonthCompleted}</td>
                                    <td className="px-2 py-2 align-top text-right whitespace-nowrap">
                                      {readOnly ? (
                                        <span className="text-gray-600 text-xs">{detail.thisMonthCompletedManual || '-'}</span>
                                      ) : (
                                        <input
                                          type="text"
                                          value={detail.thisMonthCompletedManual}
                                          onChange={(e) => handleDecimalInput(e, project.id, detail.id, 'thisMonthCompletedManual')}
                                          placeholder="手动输入"
                                          className="w-24 px-2 py-1 text-xs text-right border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                        />
                                      )}
                                    </td>
                                    <td className="px-2 py-2 text-[#1677FF] text-right align-top font-medium whitespace-nowrap">{detail.provisionAmount}</td>
                                    <td className="px-2 py-2 align-top">
                                      {readOnly ? (
                                        <span className="text-gray-600 text-xs block line-clamp-2" title={detail.regressReason || ''}>{detail.regressReason || '-'}</span>
                                      ) : (
                                        <input
                                          type="text"
                                          value={detail.regressReason}
                                          onChange={(e) => updateDetailField(project.id, detail.id, 'regressReason', e.target.value)}
                                          placeholder={showRegressRequired ? '请输入' : ''}
                                          className={clsx(
                                            'w-28 px-2 py-1 text-xs border rounded focus:outline-none focus:border-blue-500',
                                            showRegressRequired && !detail.regressReason.trim()
                                              ? 'border-red-500'
                                              : 'border-gray-300'
                                          )}
                                        />
                                      )}
                                    </td>
                                    <td className="px-2 py-2 text-gray-600 align-top">
                                      <span className="text-xs block line-clamp-2" title={detail.costCenterCode}>{detail.costCenterCode}</span>
                                    </td>
                                    <td className="px-2 py-2 text-gray-600 align-top">
                                      <span className="text-xs block line-clamp-2" title={detail.businessCategory}>{detail.businessCategory}</span>
                                    </td>
                                    <td className="px-2 py-2 text-gray-600 align-top">
                                      <span className="text-xs block line-clamp-2" title={detail.businessSubcategory}>{detail.businessSubcategory}</span>
                                    </td>
                                    <td className="px-2 py-2 text-gray-600 align-top">
                                      <span className="text-xs block line-clamp-2" title={detail.productSegment}>{detail.productSegment}</span>
                                    </td>
                                    <td className="px-2 py-2 text-gray-600 align-top">
                                      <span className="text-xs block line-clamp-2" title={detail.marketSegment}>{detail.marketSegment}</span>
                                    </td>
                                    {!readOnly && (
                                      <td className="px-2 py-2 align-top whitespace-nowrap">
                                        <label className="inline-flex items-center gap-1 text-xs text-gray-600 cursor-pointer whitespace-nowrap">
                                          <input
                                            type="checkbox"
                                            checked={detail.noContractProvision}
                                            onChange={(e) => updateDetailField(project.id, detail.id, 'noContractProvision', e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-gray-300 text-[#1677FF] focus:ring-[#1677FF]"
                                          />
                                          <span className="whitespace-nowrap">发起计提（无合同）</span>
                                        </label>
                                      </td>
                                    )}
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* ========== 计提信息 - 支出计划明细表格 ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">计提明细信息</h3>
              <span className="text-xs text-gray-400">【{mockProvisionDetailRows.length}】</span>
            </div>
            <button
              type="button"
              onClick={() => setProvisionDetailModalVisible(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              新增
            </button>
          </div>
          <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-3">
            <span className="shrink-0">⚠</span>
            <span>温馨提示：可计提金额 = 计划支出金额 × 收入确认进度 - 累计已报账金额；收入确认进度 = 实际出账总金额（已出账+本月发起出账成功） / 计划出账总金额</span>
          </div>
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同预算行号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">支出计划编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划支出金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划成本列支时间</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">可计提金额</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">本次计提金额</th>
                  <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody>
                {mockProvisionDetailRows.map(row => (
                  <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.contractCode}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.contractBudgetLineNo}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.expensePlanCode}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.productName}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.taxRate}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.tariffName}</td>
                    <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.plannedExpense}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.shareType}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.sharePeriod}</td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.costPaymentDate}</td>
                    <td className="px-3 py-2.5 text-[#1677FF] text-right font-medium whitespace-nowrap">{row.provisionableAmount}</td>
                    <td className="px-3 py-2.5 text-gray-800 text-right font-medium whitespace-nowrap">
                      {row.currentProvisionAmount}
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          className="text-[#1677FF] hover:bg-blue-50 p-1 rounded"
                          title="编辑"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          className="text-red-500 hover:bg-red-50 p-1 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end items-center gap-6">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">可计提金额合计：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{mockProvisionDetailRows.reduce((s, r) => s + parseFloat(r.provisionableAmount.replace(/,/g, '')), 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">本次计提金额合计：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{mockProvisionDetailRows.reduce((s, r) => s + parseFloat(r.currentProvisionAmount.replace(/,/g, '')), 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
          </div>
        </div>

        {/* ========== 本次计提项目汇总模块 ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">本次计提项目汇总</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">本次计提金额：</span>
              <span className="text-lg font-bold text-[#1677FF]">¥ {summaryData.totalProvision}</span>
            </div>
          </div>

          {summaryData.projects.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">暂无汇总数据，请先选择项目</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500">
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">省内项目编码</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">归属组织</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                    <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">本次计提金额（元，不含税）</th>
                    <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">累计已付款金额（元，不含税）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {summaryData.projects.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.projectCode}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap max-w-[200px] truncate" title={item.projectName}>{item.projectName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.orgName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.netProjectCode}</td>
                      <td className="px-3 py-3 text-[#1677FF] text-right whitespace-nowrap font-medium">{item.provisionAmount}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{item.cumulativePaid}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100 bg-white -mx-4 -mb-4 px-4 pb-4">
          {readOnly ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              返回
            </button>
          ) : (
            <>
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
                提交计提
              </button>
            </>
          )}
        </div>

      {/* 计提明细新增弹框 */}
      {provisionDetailModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-[700px] max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">新增计提明细</h3>
              </div>
              <button
                type="button"
                onClick={() => setProvisionDetailModalVisible(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)]">
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>全网项目编码
                  </label>
                  <input
                    type="text"
                    placeholder="请输入全网项目编码"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>合同编码
                  </label>
                  <input
                    type="text"
                    placeholder="请输入合同编码"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>合同预算行号
                  </label>
                  <input
                    type="text"
                    placeholder="请输入合同预算行号"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>支出计划编码
                  </label>
                  <input
                    type="text"
                    placeholder="请输入支出计划编码"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>产品名称
                  </label>
                  <input
                    type="text"
                    placeholder="请输入产品名称"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>税率
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white">
                    <option value="">请选择税率</option>
                    <option value="6%">6%</option>
                    <option value="13%">13%</option>
                    <option value="9%">9%</option>
                    <option value="0%">0%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>资费名称
                  </label>
                  <input
                    type="text"
                    placeholder="请输入资费名称"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>计划支出金额
                  </label>
                  <input
                    type="number"
                    placeholder="请输入计划支出金额"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>分摊类型
                  </label>
                  <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white">
                    <option value="">请选择分摊类型</option>
                    <option value="月">月</option>
                    <option value="一次性">一次性</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>分摊周期
                  </label>
                  <input
                    type="text"
                    placeholder="请输入分摊周期"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>计划成本列支时间
                  </label>
                  <input
                    type="text"
                    placeholder="如：2026-02"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>本次计提金额
                  </label>
                  <input
                    type="number"
                    placeholder="请输入本次计提金额"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setProvisionDetailModalVisible(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
              <button
                type="button"
                onClick={() => setProvisionDetailModalVisible(false)}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                确认
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
