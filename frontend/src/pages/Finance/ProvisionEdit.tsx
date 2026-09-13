import { useState, Fragment } from 'react'
import { RotateCcw, Check, ArrowLeft, Trash2, Plus, X, Search, ChevronRight, ChevronDown, HelpCircle, Save } from 'lucide-react'

interface ProvisionEditProps {
  onNavigate?: (path: string) => void
  id?: string
}

// 计提明细信息 mock 数据（独立，不与计提单发起页面共享）
const mockProvisionDetailRows = [
  {
    id: 'pwc-pd-1',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800052',
    poolOrderLineNo: '001',
    expensePlanCode: 'ZCJH-010',
    productName: '受托代销往来款',
    taxRate: '6%',
    tariffName: '[1372]受托代销往来款',
    plannedExpense: '200,000',
    allocationType: '一次性',
    allocationPeriod: '1个月',
    plannedCostDate: '2026-07-01',
    incomeConfirmProgress: '20%',
    cumulativeReimbursedAmount: '23,333.33',
    provisionableAmount: '16,666.67',
    currentProvisionAmount: '16,666.67',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    expenseType: '硬件采购支出',
    productSegment: 'ICT基础资源',
    marketSegment: '政企市场',
    supplierCode: 'SUP-001',
    supplierName: '安徽科大讯飞信息科技有限公司'
  },
  {
    id: 'pwc-pd-2',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800053',
    poolOrderLineNo: '001',
    expensePlanCode: 'ZCJH-011',
    productName: '受托代销手续费',
    taxRate: '6%',
    tariffName: '[849]受托代销手续费',
    plannedExpense: '120,000',
    allocationType: '分月分摊',
    allocationPeriod: '12个月',
    plannedCostDate: '2026-07-15',
    incomeConfirmProgress: '25%',
    cumulativeReimbursedAmount: '20,000.00',
    provisionableAmount: '10,000.00',
    currentProvisionAmount: '10,000.00',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场',
    supplierCode: 'SUP-003',
    supplierName: '华为软件技术有限公司'
  },
  {
    id: 'pwc-pd-3',
    netProjectCode: 'AH20260102',
    contractCode: 'HT-2026-0011',
    poolOrderNo: 'APO303489260800054',
    poolOrderLineNo: '002',
    expensePlanCode: 'ZCJH-012',
    productName: '系统集成服务',
    taxRate: '6%',
    tariffName: '[1205]系统集成服务',
    plannedExpense: '360,000',
    allocationType: '分月分摊',
    allocationPeriod: '6个月',
    plannedCostDate: '2026-07-01',
    incomeConfirmProgress: '15%',
    cumulativeReimbursedAmount: '39,000.00',
    provisionableAmount: '15,000.00',
    currentProvisionAmount: '15,000.00',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场',
    supplierCode: 'SUP-005',
    supplierName: '安徽中兴继远信息技术股份有限公司'
  },
  {
    id: 'pwc-pd-4',
    netProjectCode: 'AH20260103',
    contractCode: 'HT-2026-0012',
    poolOrderNo: 'APO303489260800055',
    poolOrderLineNo: '001',
    expensePlanCode: 'ZCJH-013',
    productName: '商品销售成本',
    taxRate: '13%',
    tariffName: '[956]商品销售成本',
    plannedExpense: '90,000',
    allocationType: '一次性',
    allocationPeriod: '1个月',
    plannedCostDate: '2026-06-01',
    incomeConfirmProgress: '100%',
    cumulativeReimbursedAmount: '0.00',
    provisionableAmount: '90,000.00',
    currentProvisionAmount: '60,000.00',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '商品销售',
    expenseType: '商品销售成本支出',
    productSegment: 'ICT基础资源',
    marketSegment: '政企市场',
    supplierCode: 'SUP-002',
    supplierName: '中国电信股份有限公司'
  },
  {
    id: 'pwc-pd-5',
    netProjectCode: 'AH20260104',
    contractCode: 'HT-2026-0013',
    poolOrderNo: 'APO303489260800056',
    poolOrderLineNo: '003',
    expensePlanCode: 'ZCJH-014',
    productName: '软件开发服务',
    taxRate: '6%',
    tariffName: '[1206]软件开发服务',
    plannedExpense: '600,000',
    allocationType: '分月分摊',
    allocationPeriod: '12个月',
    plannedCostDate: '2026-06-15',
    incomeConfirmProgress: '60%',
    cumulativeReimbursedAmount: '110,000.00',
    provisionableAmount: '600,000.00',
    currentProvisionAmount: '250,000.00',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '软件开发',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场',
    supplierCode: 'SUP-006',
    supplierName: '合肥讯飞软件技术有限公司'
  }
]

// 本次计提项目汇总 mock 数据
const mockSummaryProjects = [
  {
    id: 'pwc-sum-1',
    projectCode: 'PRJ-2026-0010',
    projectName: '合肥市政数局智慧政务平台',
    orgName: '合肥市分公司',
    netProjectCode: 'AH20260101',
    provisionAmount: '26,666.67',
    cumulativePaid: '150,000.00'
  },
  {
    id: 'pwc-sum-2',
    projectCode: 'PRJ-2026-0011',
    projectName: '芜湖市智慧交通管理系统',
    orgName: '芜湖市分公司',
    netProjectCode: 'AH20260102',
    provisionAmount: '15,000.00',
    cumulativePaid: '80,000.00'
  },
  {
    id: 'pwc-sum-3',
    projectCode: 'PRJ-2026-0012',
    projectName: '蚌埠市教育局智慧校园项目',
    orgName: '蚌埠市分公司',
    netProjectCode: 'AH20260103',
    provisionAmount: '60,000.00',
    cumulativePaid: '30,000.00'
  },
  {
    id: 'pwc-sum-4',
    projectCode: 'PRJ-2026-0013',
    projectName: '合肥市轨道交通智慧运维平台',
    orgName: '省公司',
    netProjectCode: 'AH20260104',
    provisionAmount: '250,000.00',
    cumulativePaid: '200,000.00'
  }
]

export default function ProvisionEdit({ onNavigate, id }: ProvisionEditProps) {
  // 计提明细数据（stateful，支持编辑/删除）
  const [provisionDetailRows, setProvisionDetailRows] = useState(mockProvisionDetailRows)

  // 计提明细新增弹框
  const [provisionDetailModalVisible, setProvisionDetailModalVisible] = useState(false)

  // 计提明细编辑弹框
  const [editProvisionDetailModalVisible, setEditProvisionDetailModalVisible] = useState(false)
  const [currentEditRow, setCurrentEditRow] = useState<typeof mockProvisionDetailRows[0] | null>(null)
  // 编辑弹框表单状态
  const [editProvisionAmount, setEditProvisionAmount] = useState('')

  // 删除二次确认弹框
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false)
  const [idToDelete, setIdToDelete] = useState<string | null>(null)

  // 计提明细行展开/收起状态
  const [expandedDetailIds, setExpandedDetailIds] = useState<string[]>([])
  const toggleDetailRow = (id: string) => {
    setExpandedDetailIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // 项目名称查找（根据全网项目编码）
  const getProjectNameByCode = (code: string) => {
    return mockSummaryProjects.find(p => p.netProjectCode === code)?.projectName || ''
  }

  // 删除处理
  const handleDelete = (id: string) => {
    setIdToDelete(id)
    setDeleteConfirmVisible(true)
  }

  // 确认删除
  const confirmDelete = () => {
    if (idToDelete) {
      setProvisionDetailRows(prev => prev.filter(r => r.id !== idToDelete))
    }
    setDeleteConfirmVisible(false)
    setIdToDelete(null)
  }

  // 确认编辑
  const confirmEdit = () => {
    if (currentEditRow && editProvisionAmount) {
      setProvisionDetailRows(prev =>
        prev.map(r => r.id === currentEditRow.id ? { ...r, currentProvisionAmount: editProvisionAmount } : r)
      )
    }
    setEditProvisionDetailModalVisible(false)
    setCurrentEditRow(null)
  }

  // ========== 报账单信息状态（复制自发起报账（有合同）页面，独立维护） ==========
  const [billType, setBillType] = useState('项目类费用计提报账单')
  const [billTypeError, setBillTypeError] = useState('')
  const [reimburser] = useState('张三')
  const [reimburseDept] = useState('政企客户部')
  const [costCenter] = useState('CC001-政企客户部')
  // 报账总额（含税，元）= 本次计提金额合计
  const [accountingObject, setAccountingObject] = useState('')
  const [isAllocate, setIsAllocate] = useState('否')
  const [allocateCity, setAllocateCity] = useState('')
  const [allocateAmount, setAllocateAmount] = useState('')
  const [userName, setUserName] = useState('')
  const [summary, setSummary] = useState('2026年6月IDC数据中心项目设备采购及软件开发支出计提，本期计提金额合计35.17万元。')

  const billTypeOptions = ['项目类费用计提报账单', '成本费用批量计提报账单']
  const accountingObjectOptions = [
    { value: '项目成本', label: '项目成本' },
    { value: '部门成本', label: '部门成本' },
    { value: '公司成本', label: '公司成本' }
  ]
  const allocateCityOptions = [
    { value: '', label: '请选择' },
    { value: '省公司', label: '省公司' },
    { value: '合肥分公司', label: '合肥分公司' },
    { value: '芜湖分公司', label: '芜湖分公司' },
    { value: '蚌埠分公司', label: '蚌埠分公司' },
    { value: '阜阳分公司', label: '阜阳分公司' },
    { value: '淮南分公司', label: '淮南分公司' },
    { value: '马鞍山分公司', label: '马鞍山分公司' },
    { value: '安庆分公司', label: '安庆分公司' },
    { value: '滁州分公司', label: '滁州分公司' },
    { value: '六安分公司', label: '六安分公司' },
    { value: '宣城分公司', label: '宣城分公司' },
    { value: '阜南分公司', label: '阜南分公司' },
    { value: '巢湖分公司', label: '巢湖分公司' },
    { value: '淮北分公司', label: '淮北分公司' },
    { value: '铜陵分公司', label: '铜陵分公司' },
    { value: '池州分公司', label: '池州分公司' },
    { value: '黄山分公司', label: '黄山分公司' }
  ]
  const mockTeamMembers = [
    { name: '张三', dept: '政企客户部' },
    { name: '李四', dept: '技术支持部' },
    { name: '王五', dept: '政企客户部' },
    { name: '赵六', dept: '运维服务部' },
    { name: '钱七', dept: '解决方案部' },
    { name: '孙八', dept: '财务部' }
  ]

  // ========== 项目选择弹窗状态 ==========
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [projectSearchName, setProjectSearchName] = useState('')
  const [projectSearchProvinceCode, setProjectSearchProvinceCode] = useState('')
  const [projectSearchGlobalCode, setProjectSearchGlobalCode] = useState('')
  const [tempSelectedProjectId, setTempSelectedProjectId] = useState<string>('')

  const mockProjectList = [
    {
      id: 'p1',
      name: '合肥市第一人民医院智慧医疗项目',
      code: 'PRJ-2026-HF-001',
      globalCode: 'NET-2026-HF-001',
      type: 'ICT项目',
      signMode: '普通项目',
      customerManager: '张凯',
      solutionManager: '刘伟'
    },
    {
      id: 'p2',
      name: '芜湖市政务服务中心数字政府项目',
      code: 'PRJ-2026-WH-001',
      globalCode: 'NET-2026-WH-001',
      type: 'DICT项目',
      signMode: '统谈分签项目',
      customerManager: '李华',
      solutionManager: '陈晨'
    },
    {
      id: 'p3',
      name: '蚌埠市教育局智慧教育项目',
      code: 'PRJ-2026-BB-001',
      globalCode: 'NET-2026-BB-001',
      type: 'ICT项目',
      signMode: '框架订单项目',
      customerManager: '王强',
      solutionManager: '赵磊'
    },
    {
      id: 'p4',
      name: '合肥市轨道交通集团智慧交通项目',
      code: 'PRJ-2026-HF-002',
      globalCode: 'NET-2026-HF-002',
      type: '双计项目',
      signMode: '框架合同项目',
      customerManager: '赵明',
      solutionManager: '孙杰'
    },
    {
      id: 'p5',
      name: '安徽省公安厅智慧城市项目',
      code: 'PRJ-2026-AH-001',
      globalCode: 'NET-2026-AH-001',
      type: 'ICT项目',
      signMode: '普通项目',
      customerManager: '杨海波',
      solutionManager: '周涛'
    }
  ]

  const filteredProjectList = mockProjectList.filter(p => {
    if (projectSearchName && !p.name.includes(projectSearchName)) return false
    if (projectSearchProvinceCode && !p.code.includes(projectSearchProvinceCode)) return false
    if (projectSearchGlobalCode && !p.globalCode.includes(projectSearchGlobalCode)) return false
    return true
  })

  const selectedProject = mockProjectList.find(p => p.id === selectedProjectId)

  const handleOpenProjectModal = () => {
    setTempSelectedProjectId(selectedProjectId)
    setProjectSearchName('')
    setProjectSearchProvinceCode('')
    setProjectSearchGlobalCode('')
    setShowProjectModal(true)
  }

  const handleConfirmProjectModal = () => {
    if (!tempSelectedProjectId) return
    setSelectedProjectId(tempSelectedProjectId)
    setShowProjectModal(false)
    // 选择项目后默认选中第一个合同，并重置费用池/支出计划选择状态
    const firstContract = (mockContractList[tempSelectedProjectId] || [])[0]
    setSelectedContractId(firstContract ? firstContract.id : '')
    setSelectedPoolId('')
    setSelectedPlanId('')
    setSelectedPlanIds([])
    setSelectedPlanAmounts({})
  }

  // ========== 合同选择状态 ==========
  const [selectedContractId, setSelectedContractId] = useState('')
  const [selectedBudgetLineId, setSelectedBudgetLineId] = useState('')

  interface ContractInfo {
    id: string
    code: string
    name: string
    supplierCode: string
    supplierName: string
    budgetLines: { id: string; code: string }[]
  }

  const mockContractList: Record<string, ContractInfo[]> = {
    p1: [
      {
        id: 'c1-1', code: 'CTR20260001', name: '合肥市一院智慧医疗系统建设合同',
        supplierCode: 'SUP-001', supplierName: '安徽科大讯飞信息科技有限公司',
        budgetLines: [{ id: 'bl-1-1', code: 'BL-001' }, { id: 'bl-1-2', code: 'BL-002' }]
      },
      {
        id: 'c1-2', code: 'CTR20260002', name: '合肥市一院医疗设备采购合同',
        supplierCode: 'SUP-002', supplierName: '合肥美亚光电技术股份有限公司',
        budgetLines: [{ id: 'bl-1-3', code: 'BL-003' }]
      }
    ],
    p2: [
      {
        id: 'c2-1', code: 'CTR20260003', name: '芜湖政务云平台服务合同',
        supplierCode: 'SUP-003', supplierName: '华为软件技术有限公司',
        budgetLines: [{ id: 'bl-2-1', code: 'BL-004' }, { id: 'bl-2-2', code: 'BL-005' }]
      },
      {
        id: 'c2-2', code: 'CTR20260004', name: '芜湖政务数据中心运维合同',
        supplierCode: 'SUP-004', supplierName: '中国电信股份有限公司芜湖分公司',
        budgetLines: [{ id: 'bl-2-3', code: 'BL-006' }]
      }
    ],
    p3: [
      {
        id: 'c3-1', code: 'CTR20260005', name: '蚌埠教育云平台建设合同',
        supplierCode: 'SUP-005', supplierName: '安徽中兴继远信息技术股份有限公司',
        budgetLines: [{ id: 'bl-3-1', code: 'BL-007' }]
      }
    ],
    p4: [
      {
        id: 'c4-1', code: 'CTR20260006', name: '合肥轨道交通信号系统合同',
        supplierCode: 'SUP-006', supplierName: '卡斯柯信号有限公司',
        budgetLines: [{ id: 'bl-4-1', code: 'BL-008' }, { id: 'bl-4-2', code: 'BL-009' }]
      },
      {
        id: 'c4-2', code: 'CTR20260007', name: '合肥轨道交通通信工程合同',
        supplierCode: 'SUP-007', supplierName: '中国铁通集团有限公司安徽分公司',
        budgetLines: [{ id: 'bl-4-3', code: 'BL-010' }]
      }
    ],
    p5: [
      {
        id: 'c5-1', code: 'CTR20260008', name: '安徽省公安厅视频监控项目合同',
        supplierCode: 'SUP-008', supplierName: '安徽四创电子股份有限公司',
        budgetLines: [{ id: 'bl-5-1', code: 'BL-011' }, { id: 'bl-5-2', code: 'BL-012' }]
      }
    ]
  }

  const projectContracts = selectedProjectId ? mockContractList[selectedProjectId] || [] : []
  const selectedContract = projectContracts.find(c => c.id === selectedContractId)
  // 是否为第一个合同（框架合同，存在费用池订单）
  const isFirstContract = projectContracts.length > 0 && selectedContractId === projectContracts[0]?.id

  // ========== 支出计划明细表格状态 ==========
  interface ExpensePlanItem {
    id: string
    expensePlanCode: string
    productName: string
    taxRate: string
    tariffName: string
    plannedExpenseAmount: string
    allocationType: string
    allocationPeriod: string
    plannedCostDate: string
    incomeConfirmProgress: string
    cumulativeReimbursedAmount: string
    availableProvisionAmount: string
    // 自动填充字段
    businessCategory: string    // 业务大类
    businessSubCategory: string // 业务小类
    businessActivity: string    // 业务活动
    expenseType: string         // 支出类型
    productSegment: string       // 产品段
    marketSegment: string        // 市场段
  }

  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  // 新增计提明细弹框：支出计划明细多选状态（复选框）
  const [selectedPlanIds, setSelectedPlanIds] = useState<string[]>([])
  // 新增计提明细弹框：每行本次计提金额（含税，元）
  const [selectedPlanAmounts, setSelectedPlanAmounts] = useState<Record<string, string>>({})

  const mockExpensePlanList: ExpensePlanItem[] = [
    {
      id: 'ep-1',
      expensePlanCode: 'EIP-20260701-001',
      productName: '服务器硬件',
      taxRate: '13%',
      tariffName: '[956]软件开发服务',
      plannedExpenseAmount: '1,130,000.00',
      allocationType: '一次性',
      allocationPeriod: '1个月',
      plannedCostDate: '2026-07-01',
      incomeConfirmProgress: '20%',
      cumulativeReimbursedAmount: '23,333.33',
      availableProvisionAmount: '1,130,000.00',
      businessCategory: 'ICT项目成本',
      businessSubCategory: '硬件设备',
      businessActivity: '设备采购',
      expenseType: '硬件采购支出',
      productSegment: 'ICT基础资源',
      marketSegment: '政企市场'
    },
    {
      id: 'ep-2',
      expensePlanCode: 'EIP-20260701-002',
      productName: '网络设备',
      taxRate: '13%',
      tariffName: '[1372]业务集成费',
      plannedExpenseAmount: '565,000.00',
      allocationType: '一次性',
      allocationPeriod: '1个月',
      plannedCostDate: '2026-07-15',
      incomeConfirmProgress: '25%',
      cumulativeReimbursedAmount: '20,000.00',
      availableProvisionAmount: '565,000.00',
      businessCategory: 'ICT项目成本',
      businessSubCategory: '硬件设备',
      businessActivity: '设备采购',
      expenseType: '硬件采购支出',
      productSegment: 'ICT基础资源',
      marketSegment: '政企市场'
    },
    {
      id: 'ep-3',
      expensePlanCode: 'EIP-20260701-003',
      productName: '系统集成服务',
      taxRate: '6%',
      tariffName: '[1205]系统集成服务',
      plannedExpenseAmount: '339,000.00',
      allocationType: '分月分摊',
      allocationPeriod: '6个月',
      plannedCostDate: '2026-07-01',
      incomeConfirmProgress: '15%',
      cumulativeReimbursedAmount: '39,000.00',
      availableProvisionAmount: '56,500.00',
      businessCategory: 'ICT项目成本',
      businessSubCategory: '技术服务',
      businessActivity: '系统集成',
      expenseType: '服务采购支出',
      productSegment: 'ICT服务资源',
      marketSegment: '政企市场'
    }
  ]

  // 费用池订单明细 mock 数据
  interface ExpensePoolItem {
    id: string
    poolOrderNo: string
    poolOrderLineNo: string
    productName: string
    materialQuantity: string
    amountWithoutTax: string
    taxAmount: string
  }

  const [selectedPoolId, setSelectedPoolId] = useState<string>('')

  const mockExpensePoolList: ExpensePoolItem[] = [
    {
      id: 'epool-1',
      poolOrderNo: 'APO303489260800052',
      poolOrderLineNo: '10',
      productName: '服务器硬件',
      materialQuantity: '10',
      amountWithoutTax: '113,000.00',
      taxAmount: '14,690.00'
    },
    {
      id: 'epool-2',
      poolOrderNo: 'APO303489260800052',
      poolOrderLineNo: '20',
      productName: '网络设备',
      materialQuantity: '5',
      amountWithoutTax: '56,500.00',
      taxAmount: '7,345.00'
    },
    {
      id: 'epool-3',
      poolOrderNo: 'APO303489260800053',
      poolOrderLineNo: '10',
      productName: '系统集成服务',
      materialQuantity: '1',
      amountWithoutTax: '33,900.00',
      taxAmount: '2,034.00'
    }
  ]

  const selectedPlan = mockExpensePlanList.find(p => p.id === selectedPlanId)

  // 本次计提金额合计（不含税，元）= 各行含税金额 ÷ (1+税率) 之和
  const totalProvisionExTax = provisionDetailRows.reduce((s, r) => {
    const amt = parseFloat((r.currentProvisionAmount || '0').replace(/,/g, ''))
    const rateStr = r.taxRate
    if (!amt || !rateStr) return s
    const rate = parseFloat(rateStr.replace('%', '')) / 100
    return s + amt / (1 + rate)
  }, 0)
  const totalProvision = provisionDetailRows.reduce((s, r) => s + parseFloat(r.currentProvisionAmount.replace(/,/g, '')), 0)

  const handleBack = () => {
    onNavigate && onNavigate('/finance/expense/provision')
  }

  const handleSubmit = () => {
    alert(`提交成功！本次计提金额 ${totalProvision.toFixed(2)} 元`)
    onNavigate && onNavigate('/finance/expense/provision')
  }

  const handleCancel = () => {
    if (!confirm('确定取消本次修改计提吗？')) return
    onNavigate && onNavigate('/finance/expense/provision')
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 顶部返回条 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={handleBack} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">修改计提</h2>
          </div>
        </div>

        {/* ========== 报账单信息（复制自发起报账（有合同）页面，独立维护） ========== */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">报账单信息</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-3">
                  <span className="text-red-500 mr-0.5">*</span>
                  报账单类型
                </label>
                <div className="flex-1 min-w-0">
                  <select
                    value={billType}
                    onChange={(e) => { setBillType(e.target.value); setBillTypeError('') }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">请选择报账单类型</option>
                    {billTypeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {billTypeError && (
                    <p className="text-xs text-red-500 mt-1">{billTypeError}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-3">报账人</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {reimburser}
                  </div>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-3">报账部门</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {reimburseDept}
                  </div>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-3">成本中心</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {costCenter}
                  </div>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-3 whitespace-nowrap">报账总额（含税，元）</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-800 font-semibold">
                    {totalProvision.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </div>
                </div>
              </div>
              {/* 报账单摘要：独占一行 */}
              <div className="col-span-3 flex items-start min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pt-2 pr-3">
                  <span className="text-red-500 mr-0.5">*</span>
                  报账单摘要
                </label>
                <div className="flex-1 min-w-0">
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="请输入报账单摘要，最多80字符"
                    maxLength={80}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== 计提明细信息 ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">计提明细信息</h3>
              <span className="text-xs text-gray-400">【{provisionDetailRows.length}】</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedPlanIds([])
                setSelectedPlanAmounts({})
                setProvisionDetailModalVisible(true)
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              新增
            </button>
          </div>
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="w-10 px-2 py-2.5 text-center font-medium">
                    <span className="sr-only">展开</span>
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务大类</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务小类</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务活动</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap sticky right-[56px] bg-gray-50 z-10 border-l border-gray-200">本次计提金额（不含税，元）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">本次计提金额（含税，元）</th>
                  <th className="w-[56px] px-3 py-2.5 text-center font-medium whitespace-nowrap sticky right-0 bg-gray-50 z-10 border-l border-gray-200">操作</th>
                </tr>
              </thead>
              <tbody>
                {provisionDetailRows.map(row => (
                  <Fragment key={row.id}>
                    <tr className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="px-2 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleDetailRow(row.id)}
                          className="text-gray-400 hover:text-[#1677FF] p-1 rounded hover:bg-blue-50 transition-colors"
                          title={expandedDetailIds.includes(row.id) ? '收起' : '展开'}
                        >
                          {expandedDetailIds.includes(row.id)
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />
                          }
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.contractCode}</td>
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.productName}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.businessCategory}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.businessSubCategory}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.businessActivity}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.taxRate}</td>
                      <td className="px-3 py-2.5 text-gray-800 font-medium whitespace-nowrap sticky right-[56px] z-10 border-l border-gray-200 bg-white">
                        {(() => {
                          const amt = parseFloat((row.currentProvisionAmount || '0').replace(/,/g, ''))
                          const rateStr = row.taxRate
                          if (!amt || !rateStr) return '0.00'
                          const rate = parseFloat(rateStr.replace('%', '')) / 100
                          return (amt / (1 + rate)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                        })()}
                      </td>
                      <td className="px-3 py-2.5 text-gray-800 font-medium whitespace-nowrap">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={row.currentProvisionAmount.replace(/,/g, '')}
                          onChange={(e) => {
                            const v = e.target.value
                            if (/^\d*(\.\d{0,2})?$/.test(v)) {
                              setProvisionDetailRows(prev => prev.map(r => r.id === row.id ? { ...r, currentProvisionAmount: v } : r))
                            }
                          }}
                          placeholder="请输入"
                          className="w-full px-2 py-1.5 text-sm text-left border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap sticky right-0 z-10 border-l border-gray-200 bg-white">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                            title="删除"
                            onClick={() => handleDelete(row.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedDetailIds.includes(row.id) && (
                      <tr className="bg-gray-50/50 border-t border-gray-100">
                        <td colSpan={11} className="px-4 py-3 pl-10">
                          <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">费用池订单号：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.poolOrderNo}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">费用池订单行号：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.poolOrderLineNo}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">供应商编码：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.supplierCode}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">供应商名称：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.supplierName}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">支出计划编码：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.expensePlanCode}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">资费名称：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.tariffName}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">计划支出金额：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.plannedExpense}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">分摊类型：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.allocationType}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">分摊周期：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.allocationPeriod}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <div className="flex items-center justify-end shrink-0 pr-2 whitespace-nowrap">
                                <span className="text-sm text-gray-500">计划成本列支时间</span>
                                <div className="relative group mx-0.5">
                                  <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                  <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-max max-w-xs px-3 py-2 text-xs text-white bg-gray-700 rounded-md shadow-lg whitespace-normal">
                                    包含通过计提方式和报账方式入账的成本列支时间
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700" />
                                  </div>
                                </div>
                                <span className="text-sm text-gray-500">：</span>
                              </div>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.plannedCostDate}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">支出类型：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.expenseType}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">产品段：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.productSegment}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">市场段：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.marketSegment}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end items-center gap-6">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">本次计提总额（不含税，元）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{totalProvisionExTax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">本次计提总额（含税，元）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{totalProvision.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100 bg-white -mx-4 -mb-4 px-4 pb-4">
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
            className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            保存为草稿
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            提交报账系统
          </button>
        </div>

        {/* 计提明细新增弹框 */}
        {provisionDetailModalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-[1200px] max-w-[95vw] max-h-[85vh] overflow-hidden">
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
                {/* 顶部表单：项目名称、合同名称、供应商编码、供应商名称、合同预算行号 */}
                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>项目名称
                    </label>
                    <div className="flex-1 min-w-0 relative">
                      <input
                        type="text"
                        readOnly
                        value={selectedProject?.name || ''}
                        onClick={handleOpenProjectModal}
                        placeholder="请选择项目"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white cursor-pointer hover:bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={handleOpenProjectModal}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#1677FF]"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>合同名称
                    </label>
                    <div className="flex-1 min-w-0">
                      {selectedProjectId && projectContracts.length > 0 ? (
                        <select
                          value={selectedContractId}
                          onChange={(e) => { setSelectedContractId(e.target.value); setSelectedBudgetLineId(''); setSelectedPlanId('') }}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="">请选择合同</option>
                          {projectContracts.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          placeholder={selectedProjectId ? '暂无合同数据' : '请先选择项目'}
                          disabled
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-400"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">供应商编码</label>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        readOnly
                        value={selectedContract?.supplierCode || ''}
                        placeholder="选择合同后自动带出"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">供应商名称</label>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        readOnly
                        value={selectedContract?.supplierName || ''}
                        placeholder="选择合同后自动带出"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-700"
                      />
                    </div>
                  </div>
                </div>

                {/* 费用池订单明细表格 - 仅选择第一个合同时展示 */}
                {projectContracts.length > 0 && selectedContractId === projectContracts[0]?.id && (
                <div className="mt-4 p-4 bg-[#f9fafb] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                    <h4 className="text-sm font-semibold text-gray-800">费用池订单明细</h4>
                  </div>
                  <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-2">
                    <span className="shrink-0">⚠</span>
                    <span>温馨提示：当前框架合同下存在采购订单，请选择费用池订单报账</span>
                  </div>
                  <div className="border border-gray-100 rounded-md overflow-auto max-h-[200px]">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-gray-500">
                          <th className="w-10 px-3 py-2 text-left">
                            <span className="sr-only">选择</span>
                          </th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">费用池订单号</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">费用池订单行号</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">产品名称</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">物料数量</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">金额（不含税，元）</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">税额（元）</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">金额（含税，元）</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedContract ? (mockExpensePoolList.map(item => (
                          <tr
                            key={item.id}
                            className={`cursor-pointer transition-colors ${
                              selectedPoolId === item.id
                                ? 'bg-blue-50'
                                : 'hover:bg-blue-50/50'
                            }`}
                            onClick={() => setSelectedPoolId(item.id)}
                          >
                            <td className="px-3 py-2.5">
                              <input
                                type="radio"
                                name="expense-pool"
                                checked={selectedPoolId === item.id}
                                onChange={() => setSelectedPoolId(item.id)}
                                className="w-4 h-4 text-blue-600"
                              />
                            </td>
                            <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.poolOrderNo}</td>
                            <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.poolOrderLineNo}</td>
                            <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.productName}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.materialQuantity}</td>
                            <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{item.amountWithoutTax}</td>
                            <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{item.taxAmount}</td>
                            <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">
                              {(() => {
                                const amt = parseFloat(item.amountWithoutTax.replace(/,/g, ''))
                                const tax = parseFloat(item.taxAmount.replace(/,/g, ''))
                                return (amt + tax).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              })()}
                            </td>
                          </tr>
                        ))) : (
                          <tr>
                            <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-400">请先选择合同编码</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

                {/* 支出计划明细表格 - 始终展示；未选合同或第一个合同未勾选费用池时展示空数据 */}
                {(
                <div className="mt-4 p-4 bg-[#f9fafb] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                    <h4 className="text-sm font-semibold text-gray-800">支出计划明细</h4>
                  </div>
                  <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-2">
                    <span className="shrink-0">⚠</span>
                    <span>温馨提示：可计提金额 = 计划支出金额 × 收入确认进度 - 累计已报账金额；收入确认进度 = 实际出账总金额（已出账+本月发起出账成功） / 计划出账总金额；所有金额都为含税金额，单位元</span>
                  </div>
                    <div className="border border-gray-100 rounded-md overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr className="text-gray-500">
                            <th className="w-10 px-3 py-2 text-left">
                              <span className="sr-only">选择</span>
                            </th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">产品名称</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">业务大类</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">业务小类</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">业务活动</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">税率</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">收入确认进度</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">累计已报账金额</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">可计提金额</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">本次计提金额（不含税，元）</th>
                            <th className="w-[160px] px-3 py-2 text-left font-medium whitespace-nowrap sticky right-0 bg-gray-50 z-10 border-l border-gray-200">本次计提金额（含税，元）</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(!selectedContract || (isFirstContract && !selectedPoolId)) ? (
                            <tr>
                              <td colSpan={11} className="px-3 py-8 text-center text-sm text-gray-400">暂无数据</td>
                            </tr>
                          ) : (
                            mockExpensePlanList.map(item => (
                            <Fragment key={item.id}>
                            <tr
                              className={`cursor-pointer transition-colors ${
                                selectedPlanIds.includes(item.id)
                                  ? 'bg-blue-50'
                                  : 'hover:bg-blue-50/50'
                              }`}
                              onClick={() => setSelectedPlanIds(prev =>
                                prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                              )}
                            >
                              <td className="px-3 py-2.5">
                                <input
                                  type="checkbox"
                                  checked={selectedPlanIds.includes(item.id)}
                                  onChange={() => setSelectedPlanIds(prev =>
                                    prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                              </td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.productName}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.businessCategory}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.businessSubCategory}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.businessActivity}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.taxRate}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.incomeConfirmProgress}</td>
                              <td className="px-3 py-2.5 text-gray-700 text-left whitespace-nowrap">{item.cumulativeReimbursedAmount}</td>
                              <td className={`px-3 py-2.5 text-gray-800 text-left whitespace-nowrap ${selectedPlanIds.includes(item.id) ? 'bg-blue-50' : 'bg-white'}`}>{item.availableProvisionAmount}</td>
                              <td className={`px-3 py-2.5 text-gray-800 text-left whitespace-nowrap ${selectedPlanIds.includes(item.id) ? 'bg-blue-50' : 'bg-white'}`}>
                                {(() => {
                                  const amt = parseFloat(selectedPlanAmounts[item.id] || '0')
                                  const rateStr = item.taxRate
                                  if (!amt || !rateStr) return '0.00'
                                  const rate = parseFloat(rateStr.replace('%', '')) / 100
                                  return (amt / (1 + rate)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                })()}
                              </td>
                              <td className={`px-3 py-2.5 text-left whitespace-nowrap sticky right-0 z-10 border-l border-gray-200 ${selectedPlanIds.includes(item.id) ? 'bg-blue-50' : 'bg-white'}`}>
                                <input
                                  type="number"
                                  min={0}
                                  value={selectedPlanAmounts[item.id] || ''}
                                  onChange={(e) => setSelectedPlanAmounts(prev => ({ ...prev, [item.id]: e.target.value }))}
                                  onClick={(e) => e.stopPropagation()}
                                  placeholder="请输入"
                                  className="w-full px-2 py-1.5 text-sm text-left border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                                />
                              </td>
                            </tr>
                            {selectedPlanIds.includes(item.id) && (
                              <tr className="bg-gray-50/50 border-t border-gray-100">
                                <td colSpan={11} className="px-4 py-3 pl-10">
                                  <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                                    <div className="flex items-center min-h-[28px]">
                                      <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">支出计划编码：</label>
                                      <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{item.expensePlanCode}</div>
                                    </div>
                                    <div className="flex items-center min-h-[28px]">
                                      <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">资费名称：</label>
                                      <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{item.tariffName}</div>
                                    </div>
                                    <div className="flex items-center min-h-[28px]">
                                      <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">计划支出金额：</label>
                                      <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{item.plannedExpenseAmount}</div>
                                    </div>
                                    <div className="flex items-center min-h-[28px]">
                                      <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">分摊类型：</label>
                                      <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{item.allocationType}</div>
                                    </div>
                                    <div className="flex items-center min-h-[28px]">
                                      <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">分摊周期：</label>
                                      <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{item.allocationPeriod}</div>
                                    </div>
                                    <div className="flex items-center min-h-[28px]">
                                      <div className="flex items-center justify-end shrink-0 pr-2 whitespace-nowrap">
                                        <span className="text-sm text-gray-500">计划成本列支时间</span>
                                        <div className="relative group mx-0.5">
                                          <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                          <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-max max-w-xs px-3 py-2 text-xs text-white bg-gray-700 rounded-md shadow-lg whitespace-normal">
                                            包含通过计提方式和报账方式入账的成本列支时间
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700" />
                                          </div>
                                        </div>
                                        <span className="text-sm text-gray-500">：</span>
                                      </div>
                                      <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{item.plannedCostDate}</div>
                                    </div>
                                    <div className="flex items-center min-h-[28px]">
                                      <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">支出类型：</label>
                                      <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{item.expenseType}</div>
                                    </div>
                                    <div className="flex items-center min-h-[28px]">
                                      <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">产品段：</label>
                                      <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{item.productSegment}</div>
                                    </div>
                                    <div className="flex items-center min-h-[28px]">
                                      <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">市场段：</label>
                                      <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{item.marketSegment}</div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                            </Fragment>
                          ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  )}

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

        {/* 计提明细编辑弹框（复制自新增弹框，项目名称/合同编码不可编辑） */}
        {editProvisionDetailModalVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-[1200px] max-w-[95vw] max-h-[85vh] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h3 className="text-sm font-semibold text-gray-800">编辑计提明细</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditProvisionDetailModalVisible(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)]">
                {/* 顶部表单：项目名称、合同编码（只读）、供应商编码、供应商名称、本次计提金额 */}
                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>项目名称
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                        {currentEditRow ? getProjectNameByCode(currentEditRow.netProjectCode) : ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>合同编码
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                        {currentEditRow?.contractCode || ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">供应商编码</label>
                    <div className="flex-1 min-w-0">
                      <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                        {currentEditRow?.supplierCode || ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">供应商名称</label>
                    <div className="flex-1 min-w-0">
                      <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                        {currentEditRow?.supplierName || ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>本次计提金额（含税，元）
                    </label>
                    <div className="flex-1 min-w-0">
                      <input
                        type="number"
                        value={editProvisionAmount}
                        onChange={(e) => setEditProvisionAmount(e.target.value)}
                        placeholder="请输入本次计提金额"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 费用池订单明细表格 */}
                {projectContracts.length > 0 && selectedContractId === projectContracts[0]?.id && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                    <h4 className="text-sm font-semibold text-gray-800">费用池订单明细</h4>
                  </div>
                  <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-2">
                    <span className="shrink-0">⚠</span>
                    <span>温馨提示：当前框架合同下存在采购订单，请选择费用池订单报账</span>
                  </div>
                  <div className="border border-gray-100 rounded-md overflow-auto max-h-[200px]">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-gray-500">
                          <th className="w-10 px-3 py-2 text-left">
                            <span className="sr-only">选择</span>
                          </th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">费用池订单号</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">费用池订单行号</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">产品名称</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">物料数量</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">金额（不含税，元）</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">税额（元）</th>
                          <th className="px-3 py-2 text-left font-medium whitespace-nowrap">金额（含税，元）</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedContract ? (mockExpensePoolList.map(item => (
                          <tr
                            key={item.id}
                            className={`cursor-pointer transition-colors ${
                              selectedPoolId === item.id
                                ? 'bg-blue-50'
                                : 'hover:bg-blue-50/50'
                            }`}
                            onClick={() => setSelectedPoolId(item.id)}
                          >
                            <td className="px-3 py-2.5">
                              <input
                                type="radio"
                                name="expense-pool-edit"
                                checked={selectedPoolId === item.id}
                                onChange={() => setSelectedPoolId(item.id)}
                                className="w-4 h-4 text-blue-600"
                              />
                            </td>
                            <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.poolOrderNo}</td>
                            <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.poolOrderLineNo}</td>
                            <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.productName}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.materialQuantity}</td>
                            <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{item.amountWithoutTax}</td>
                            <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{item.taxAmount}</td>
                            <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">
                              {(() => {
                                const amt = parseFloat(item.amountWithoutTax.replace(/,/g, ''))
                                const tax = parseFloat(item.taxAmount.replace(/,/g, ''))
                                return (amt + tax).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                              })()}
                            </td>
                          </tr>
                        ))) : (
                          <tr>
                            <td colSpan={8} className="px-3 py-8 text-center text-sm text-gray-400">请先选择合同编码</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

                {/* 支出计划明细表格 - 有费用池时需先选中费用池才展示，无费用池时直接展示 */}
                {(!(projectContracts.length > 0 && selectedContractId === projectContracts[0]?.id) || selectedPoolId) && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                    <h4 className="text-sm font-semibold text-gray-800">支出计划明细</h4>
                  </div>
                  <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-2">
                    <span className="shrink-0">⚠</span>
                    <span>温馨提示：可计提金额 = 计划支出金额 × 收入确认进度 - 累计已报账金额；收入确认进度 = 实际出账总金额（已出账+本月发起出账成功） / 计划出账总金额；所有金额都为含税金额，单位元</span>
                  </div>
                    <div className="border border-gray-100 rounded-md overflow-auto max-h-[240px]">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr className="text-gray-500">
                            <th className="w-10 px-3 py-2 text-left">
                              <span className="sr-only">选择</span>
                            </th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">支出计划编码</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">产品名称</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">税率</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">资费名称</th>
                            <th className="px-3 py-2 text-right font-medium whitespace-nowrap">计划支出金额</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">分摊类型</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">分摊周期</th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <span>计划成本列支时间</span>
                                <div className="relative group">
                                  <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                  <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-max max-w-xs px-3 py-2 text-xs text-white bg-gray-700 rounded-md shadow-lg whitespace-normal">
                                    包含通过计提方式和报账方式入账的成本列支时间
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700" />
                                  </div>
                                </div>
                              </div>
                            </th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">收入确认进度</th>
                            <th className="px-3 py-2 text-right font-medium whitespace-nowrap">累计已报账金额</th>
                            <th className="px-3 py-2 text-right font-medium whitespace-nowrap sticky right-0 bg-gray-50 z-10 border-l border-gray-200">可计提金额</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedContract ? (mockExpensePlanList.map(item => (
                            <tr
                              key={item.id}
                              className={`cursor-pointer transition-colors ${
                                selectedPlanId === item.id
                                  ? 'bg-blue-50'
                                  : 'hover:bg-blue-50/50'
                              }`}
                              onClick={() => setSelectedPlanId(item.id)}
                            >
                              <td className="px-3 py-2.5">
                                <input
                                  type="radio"
                                  name="expense-plan-edit"
                                  checked={selectedPlanId === item.id}
                                  onChange={() => setSelectedPlanId(item.id)}
                                  className="w-4 h-4 text-blue-600"
                                />
                              </td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.expensePlanCode}</td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.productName}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.taxRate}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.tariffName}</td>
                              <td className="px-3 py-2.5 text-gray-800 text-right whitespace-nowrap">{item.plannedExpenseAmount}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.allocationType}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.allocationPeriod}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.plannedCostDate}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.incomeConfirmProgress}</td>
                              <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{item.cumulativeReimbursedAmount}</td>
                              <td className={`px-3 py-2.5 text-gray-800 text-right whitespace-nowrap sticky right-0 z-10 border-l border-gray-200 ${selectedPlanId === item.id ? 'bg-blue-50' : 'bg-white'}`}>{item.availableProvisionAmount}</td>
                            </tr>
                          ))) : (
                            <tr>
                              <td colSpan={12} className="px-3 py-8 text-center text-sm text-gray-400">请先选择合同编码</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  )}

                {/* 自动填充的表单字段（只读）- 使用 currentEditRow 数据 */}
                <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4">
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">业务大类</label>
                      <div className="flex-1 min-w-0">
                        <div className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                          {currentEditRow?.businessCategory || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">业务小类</label>
                      <div className="flex-1 min-w-0">
                        <div className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                          {currentEditRow?.businessSubCategory || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">业务活动</label>
                      <div className="flex-1 min-w-0">
                        <div className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                          {currentEditRow?.businessActivity || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">支出类型</label>
                      <div className="flex-1 min-w-0">
                        <div className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                          {currentEditRow?.expenseType || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">产品段</label>
                      <div className="flex-1 min-w-0">
                        <div className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                          {currentEditRow?.productSegment || '-'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">市场段</label>
                      <div className="flex-1 min-w-0">
                        <div className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                          {currentEditRow?.marketSegment || '-'}
                        </div>
                      </div>
                    </div>
                  </div>

              </div>
              <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditProvisionDetailModalVisible(false)}
                  className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmEdit}
                  className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  确认
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 删除二次确认弹框 */}
        {deleteConfirmVisible && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-[420px]">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">提示</h3>
              </div>
              <div className="px-6 py-8">
                <p className="text-sm text-gray-700 text-center">确定要删除该计提明细信息吗？</p>
              </div>
              <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmVisible(false)}
                  className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  取消
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========== 选择项目弹窗 ========== */}
        {showProjectModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" onClick={() => setShowProjectModal(false)}>
            <div
              className="bg-white rounded-lg shadow-xl w-[950px] max-w-[95vw] max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">选择项目</h3>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* 查询条件 */}
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">项目名称</label>
                    <input
                      type="text"
                      value={projectSearchName}
                      onChange={(e) => setProjectSearchName(e.target.value)}
                      placeholder="请输入项目名称"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">省内项目编码</label>
                    <input
                      type="text"
                      value={projectSearchProvinceCode}
                      onChange={(e) => setProjectSearchProvinceCode(e.target.value)}
                      placeholder="请输入省内项目编码"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">全网项目编码</label>
                    <input
                      type="text"
                      value={projectSearchGlobalCode}
                      onChange={(e) => setProjectSearchGlobalCode(e.target.value)}
                      placeholder="请输入全网项目编码"
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
              {/* 项目列表 */}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="w-10 px-4 py-2.5 text-left">
                        <span className="sr-only">选择</span>
                      </th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[200px]">项目名称</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[140px]">省内项目编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[140px]">全网项目编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[90px]">项目类型</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[90px]">签约模式</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[80px]">客户经理</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[100px]">解决方案经理</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProjectList.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                          暂无匹配项目
                        </td>
                      </tr>
                    ) : (
                      filteredProjectList.map(project => (
                        <tr
                          key={project.id}
                          className={`cursor-pointer transition-colors ${
                            tempSelectedProjectId === project.id
                              ? 'bg-blue-50'
                              : 'hover:bg-blue-50/50'
                          }`}
                          onClick={() => setTempSelectedProjectId(project.id)}
                        >
                          <td className="px-4 py-2.5">
                            <input
                              type="radio"
                              name="project-selection"
                              checked={tempSelectedProjectId === project.id}
                              onChange={() => setTempSelectedProjectId(project.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-gray-800">{project.name}</td>
                          <td className="px-3 py-2.5 text-gray-600">{project.code}</td>
                          <td className="px-3 py-2.5 text-gray-600">{project.globalCode}</td>
                          <td className="px-3 py-2.5 text-gray-600">{project.type}</td>
                          <td className="px-3 py-2.5 text-gray-600">{project.signMode}</td>
                          <td className="px-3 py-2.5 text-gray-600">{project.customerManager}</td>
                          <td className="px-3 py-2.5 text-gray-600">{project.solutionManager}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* 底部按钮 */}
              <div className="flex justify-center gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmProjectModal}
                  disabled={!tempSelectedProjectId}
                  className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
