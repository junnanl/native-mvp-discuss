import { useState, useMemo, useEffect } from 'react'
import { ArrowLeft, Search, ChevronDown, RotateCcw, Check, FilePlus } from 'lucide-react'

interface ExpenseSupplementProps {
  onNavigate?: (path: string) => void
}

interface ProjectInfo {
  code: string
  name: string
}

interface ContractInfo {
  id: string
  code: string
  name: string
  type: string
  amountNoTax: string
  counterpartName: string
  status: string
  statusKey: string
  signTime: string
  accountingObject: string
}

interface ExpenseBillRow {
  id: string
  rowId: string
  networkProjectCode: string
  contractCode: string
  managementProductCode: string
  supplierCode: string
  businessCategory: string
  costCenterCode: string
  businessSubcategory: string
  businessActivityCode: string
  recordedAmount: string
  amountNoTax: string
  taxRate: string
  submitDate: string
  checked: boolean
}

interface ExpensePlanRow {
  id: string
  projectCode: string
  projectName: string
  expenseProductName: string
  expenseType: string
  budgetCode: string
  planDate: string
  plannedExpenseNoTax: string
  correspondingTariff: string
  contractStage: string
  checked: boolean
}

const projectOptions: ProjectInfo[] = [
  { code: 'PRJ20260001', name: '安徽移动IDC数据中心建设项目' },
  { code: 'PRJ20260002', name: '合肥政务云平台服务项目' },
  { code: 'PRJ20260003', name: '企业专线接入服务项目' },
  { code: 'PRJ20260004', name: '淮南IDC机房运维服务项目' },
  { code: 'PRJ20260005', name: '马鞍山智慧城市云平台建设运营项目' }
]

const mockContracts: ContractInfo[] = [
  {
    id: 'ct-1',
    code: 'CTR20260001',
    name: '安徽移动IDC数据中心建设项目合同',
    type: '支出类',
    amountNoTax: '8,849,557.52',
    counterpartName: '安徽省政务信息中心',
    status: '履行中',
    statusKey: 'executing',
    signTime: '2026-06-15',
    accountingObject: '项目成本'
  },
  {
    id: 'ct-2',
    code: 'CTR20260002',
    name: '合肥政务云平台服务合同',
    type: '有收有支类',
    amountNoTax: '5,309,734.51',
    counterpartName: '合肥市大数据局',
    status: '履行中',
    statusKey: 'executing',
    signTime: '2026-06-18',
    accountingObject: '项目成本'
  },
  {
    id: 'ct-3',
    code: 'CTR20260003',
    name: '企业专线接入服务协议',
    type: '支出类',
    amountNoTax: '2,654,867.26',
    counterpartName: '安徽电信股份有限公司',
    status: '草稿',
    statusKey: 'draft',
    signTime: '2026-06-20',
    accountingObject: '部门成本'
  },
  {
    id: 'ct-4',
    code: 'CTR20260004',
    name: '淮南IDC机房运维服务采购合同',
    type: '支出类',
    amountNoTax: '1,769,911.50',
    counterpartName: '淮南市信息技术服务中心',
    status: '履行中',
    statusKey: 'executing',
    signTime: '2026-05-10',
    accountingObject: '公司成本'
  },
  {
    id: 'ct-5',
    code: 'CTR20260005',
    name: '马鞍山智慧城市云平台建设运营合同',
    type: '有收有支类',
    amountNoTax: '6,194,690.27',
    counterpartName: '马鞍山市政务服务中心',
    status: '履行中',
    statusKey: 'executing',
    signTime: '2026-04-25',
    accountingObject: '项目成本'
  }
]

const mockBillRows: ExpenseBillRow[] = [
  {
    id: 'br-1',
    rowId: 'ROW001',
    networkProjectCode: 'PRJ20260001',
    contractCode: 'CTR20260001',
    managementProductCode: 'MP-001',
    supplierCode: 'SUP-001',
    businessCategory: 'ICT业务',
    costCenterCode: 'CC-1001',
    businessSubcategory: '系统集成',
    businessActivityCode: 'ACT-001',
    recordedAmount: '500,000.00',
    amountNoTax: '442,477.88',
    taxRate: '13',
    submitDate: '2026-06-10',
    checked: false
  },
  {
    id: 'br-2',
    rowId: 'ROW002',
    networkProjectCode: 'PRJ20260001',
    contractCode: 'CTR20260001',
    managementProductCode: 'MP-002',
    supplierCode: 'SUP-002',
    businessCategory: 'ICT业务',
    costCenterCode: 'CC-1001',
    businessSubcategory: '软件开发',
    businessActivityCode: 'ACT-002',
    recordedAmount: '300,000.00',
    amountNoTax: '265,486.73',
    taxRate: '13',
    submitDate: '2026-06-12',
    checked: false
  },
  {
    id: 'br-3',
    rowId: 'ROW003',
    networkProjectCode: 'PRJ20260001',
    contractCode: 'CTR20260001',
    managementProductCode: 'MP-003',
    supplierCode: 'SUP-003',
    businessCategory: 'ICT业务',
    costCenterCode: 'CC-1002',
    businessSubcategory: '运维服务',
    businessActivityCode: 'ACT-003',
    recordedAmount: '200,000.00',
    amountNoTax: '188,679.25',
    taxRate: '6',
    submitDate: '2026-06-15',
    checked: false
  },
  {
    id: 'br-4',
    rowId: 'ROW004',
    networkProjectCode: 'PRJ20260002',
    contractCode: 'CTR20260002',
    managementProductCode: 'MP-004',
    supplierCode: 'SUP-004',
    businessCategory: '云服务',
    costCenterCode: 'CC-2001',
    businessSubcategory: '云计算',
    businessActivityCode: 'ACT-004',
    recordedAmount: '450,000.00',
    amountNoTax: '424,528.30',
    taxRate: '6',
    submitDate: '2026-06-08',
    checked: false
  }
]

const mockExpensePlans: ExpensePlanRow[] = [
  {
    id: 'ep-1',
    projectCode: 'PRJ20260001',
    projectName: '安徽移动IDC数据中心建设项目',
    expenseProductName: '服务器设备采购',
    expenseType: '设备采购',
    budgetCode: 'BUD-2026-002',
    planDate: '2026-07-01',
    plannedExpenseNoTax: '2,500,000.00',
    correspondingTariff: 'IDC主机托管',
    contractStage: '项目实施',
    checked: false
  },
  {
    id: 'ep-2',
    projectCode: 'PRJ20260001',
    projectName: '安徽移动IDC数据中心建设项目',
    expenseProductName: '网络设备采购',
    expenseType: '设备采购',
    budgetCode: 'BUD-2026-002',
    planDate: '2026-07-15',
    plannedExpenseNoTax: '1,800,000.00',
    correspondingTariff: 'IDC主机托管',
    contractStage: '项目实施',
    checked: false
  },
  {
    id: 'ep-3',
    projectCode: 'PRJ20260001',
    projectName: '安徽移动IDC数据中心建设项目',
    expenseProductName: '系统集成服务',
    expenseType: '技术服务',
    budgetCode: 'BUD-2026-001',
    planDate: '2026-08-01',
    plannedExpenseNoTax: '800,000.00',
    correspondingTariff: '系统集成服务',
    contractStage: '项目实施',
    checked: false
  },
  {
    id: 'ep-4',
    projectCode: 'PRJ20260002',
    projectName: '合肥政务云平台服务项目',
    expenseProductName: '云资源租赁',
    expenseType: '云服务',
    budgetCode: 'BUD-2026-003',
    planDate: '2026-07-01',
    plannedExpenseNoTax: '1,200,000.00',
    correspondingTariff: '云计算服务',
    contractStage: '项目实施',
    checked: false
  },
  {
    id: 'ep-5',
    projectCode: 'PRJ20260002',
    projectName: '合肥政务云平台服务项目',
    expenseProductName: '软件开发服务',
    expenseType: '软件开发',
    budgetCode: 'BUD-2026-003',
    planDate: '2026-09-01',
    plannedExpenseNoTax: '600,000.00',
    correspondingTariff: '软件开发服务',
    contractStage: '项目实施',
    checked: false
  }
]

export default function ExpenseSupplement({ onNavigate }: ExpenseSupplementProps) {
  const [selectedProject, setSelectedProject] = useState('')
  const [projectSearchKeyword, setProjectSearchKeyword] = useState('')
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [checkedContractIds, setCheckedContractIds] = useState<string[]>([])

  const [billNo, setBillNo] = useState('')
  const [billNoInput, setBillNoInput] = useState('')
  const [billRows, setBillRows] = useState<ExpenseBillRow[]>([])
  const [billLoaded, setBillLoaded] = useState(false)

  const [expensePlanList, setExpensePlanList] = useState<ExpensePlanRow[]>([])

  const projectContracts = useMemo(() => {
    if (!selectedProject) return []
    return mockContracts
  }, [selectedProject])

  const filteredProjectOptions = useMemo(() => {
    if (!projectSearchKeyword.trim()) return projectOptions
    const kw = projectSearchKeyword.toLowerCase()
    return projectOptions.filter(p =>
      p.name.toLowerCase().includes(kw) || p.code.toLowerCase().includes(kw)
    )
  }, [projectSearchKeyword])

  const selectedContract = useMemo(() => {
    if (checkedContractIds.length === 0) return null
    return projectContracts.find(c => c.id === checkedContractIds[0]) || null
  }, [checkedContractIds, projectContracts])

  const totalContractAmount = useMemo(() => {
    if (!selectedContract) return '0.00'
    return selectedContract.amountNoTax
  }, [selectedContract])

  const billTotalAmount = useMemo(() => {
    const total = billRows
      .filter(r => r.checked)
      .reduce((sum, r) => sum + parseFloat(r.recordedAmount.replace(/,/g, '')), 0)
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [billRows])

  const billRemainingAmount = useMemo(() => {
    const totalAll = billRows.reduce((sum, r) => sum + parseFloat(r.recordedAmount.replace(/,/g, '')), 0)
    const checkedTotal = billRows
      .filter(r => r.checked)
      .reduce((sum, r) => sum + parseFloat(r.recordedAmount.replace(/,/g, '')), 0)
    const remaining = totalAll - checkedTotal
    return remaining.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [billRows])

  const billPerson = '张三'
  const billDept = '政企客户部'

  const billAccountingObject = useMemo(() => {
    if (selectedContract) return selectedContract.accountingObject
    return ''
  }, [selectedContract])

  const reimbursedAmount = useMemo(() => {
    const total = expensePlanList
      .filter(p => p.checked)
      .reduce((sum, p) => sum + parseFloat(p.plannedExpenseNoTax.replace(/,/g, '')), 0)
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [expensePlanList])

  useEffect(() => {
    if (selectedContract) {
      const plans = mockExpensePlans.filter(p => p.contractStage && selectedProject)
      setExpensePlanList(plans.map(p => ({ ...p, checked: false })))
    } else {
      setExpensePlanList([])
    }
  }, [selectedContract, selectedProject])

  const handleProjectSelect = (code: string) => {
    setSelectedProject(code)
    setProjectDropdownOpen(false)
    setProjectSearchKeyword(projectOptions.find(p => p.code === code)?.name || '')
    setCheckedContractIds([])
  }

  const handleContractCheck = (contractId: string) => {
    const contract = projectContracts.find(c => c.id === contractId)
    if (!contract || contract.statusKey !== 'executing') return

    setCheckedContractIds(prev => {
      if (prev.includes(contractId)) {
        return prev.filter(id => id !== contractId)
      }
      return [contractId]
    })
  }

  const handleSelectAllContracts = () => {
    const executableIds = projectContracts
      .filter(c => c.statusKey === 'executing')
      .map(c => c.id)
    const allChecked = executableIds.every(id => checkedContractIds.includes(id))
    if (allChecked) {
      setCheckedContractIds([])
    } else {
      setCheckedContractIds([executableIds[0]])
    }
  }

  const handleBillQuery = () => {
    if (!billNoInput.trim()) return
    setBillNo(billNoInput.trim())
    setBillRows(mockBillRows.map(r => ({ ...r, checked: false })))
    setBillLoaded(true)
  }

  const handleBillRowCheck = (rowId: string) => {
    setBillRows(prev => prev.map(r =>
      r.id === rowId ? { ...r, checked: !r.checked } : r
    ))
  }

  const handleSelectAllBillRows = () => {
    const allChecked = billRows.length > 0 && billRows.every(r => r.checked)
    setBillRows(prev => prev.map(r => ({ ...r, checked: !allChecked })))
  }

  const handlePlanCheck = (planId: string) => {
    setExpensePlanList(prev => prev.map(p =>
      p.id === planId ? { ...p, checked: !p.checked } : p
    ))
  }

  const handleSelectAllPlans = () => {
    const allChecked = expensePlanList.length > 0 && expensePlanList.every(p => p.checked)
    setExpensePlanList(prev => prev.map(p => ({ ...p, checked: !allChecked })))
  }

  const handleBack = () => {
    onNavigate?.('/finance/expense/expense')
  }

  const handleCancel = () => {
    onNavigate?.('/finance/expense/expense')
  }

  const handleConfirm = () => {
    alert('确认补录成功')
    onNavigate?.('/finance/expense/expense')
  }

  const executableContractCount = projectContracts.filter(c => c.statusKey === 'executing').length
  const allContractsChecked = executableContractCount > 0 &&
    projectContracts.filter(c => c.statusKey === 'executing').every(c => checkedContractIds.includes(c.id))

  const allBillRowsChecked = billRows.length > 0 && billRows.every(r => r.checked)
  const allPlansChecked = expensePlanList.length > 0 && expensePlanList.every(p => p.checked)

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">

        {/* 顶部返回条 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={handleBack} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">报账单补录</h2>
          </div>
        </div>

        {/* 1. 项目信息 + 合同信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">项目信息</h3>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">
                  <span className="text-red-500 mr-0.5">*</span>
                  项目名称
                </label>
                <div className="flex-1 min-w-0 relative">
                  <div
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md cursor-pointer flex items-center justify-between bg-white"
                    onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
                  >
                    <span className={selectedProject ? 'text-gray-800' : 'text-gray-400'}>
                      {selectedProject
                        ? projectOptions.find(p => p.code === selectedProject)?.name
                        : '请选择项目'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                  {projectDropdownOpen && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            value={projectSearchKeyword}
                            onChange={(e) => setProjectSearchKeyword(e.target.value)}
                            placeholder="搜索项目名称/编码"
                            className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      {filteredProjectOptions.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-gray-400 text-center">暂无匹配项目</div>
                      ) : (
                        filteredProjectOptions.map(p => (
                          <div
                            key={p.code}
                            className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                              selectedProject === p.code ? 'bg-blue-50 text-[#1677FF]' : 'text-gray-700'
                            }`}
                            onClick={() => handleProjectSelect(p.code)}
                          >
                            <div className="font-medium">{p.name}</div>
                            <div className="text-xs text-gray-400">{p.code}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 合同信息 */}
          {selectedProject && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h3 className="text-sm font-semibold text-gray-800">合同信息</h3>
                  <span className="text-xs text-gray-400">共 {projectContracts.length} 份</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={allContractsChecked}
                    onChange={handleSelectAllContracts}
                    className="w-3.5 h-3.5 accent-[#1677FF]"
                  />
                  <span>全选（仅履行中合同可选）</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-500">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap w-10">选择</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同类型</th>
                      <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">合同金额（元，不含税）</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">相对方名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">签订日期</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectContracts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center text-gray-400 text-sm">
                          暂无合同数据
                        </td>
                      </tr>
                    ) : (
                      projectContracts.map(contract => (
                        <tr key={contract.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                          <td className="px-3 py-2.5">
                            <input
                              type="checkbox"
                              checked={checkedContractIds.includes(contract.id)}
                              onChange={() => handleContractCheck(contract.id)}
                              disabled={contract.statusKey !== 'executing'}
                              className="w-3.5 h-3.5 accent-[#1677FF] disabled:opacity-40"
                            />
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{contract.code}</td>
                          <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{contract.name}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                              contract.type === '支出类'
                                ? 'bg-orange-50 text-orange-600'
                                : contract.type === '收入类'
                                  ? 'bg-green-50 text-green-600'
                                  : 'bg-blue-50 text-blue-600'
                            }`}>
                              {contract.type}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap text-right font-medium">{contract.amountNoTax}</td>
                          <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{contract.counterpartName}</td>
                          <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{contract.signTime}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${
                              contract.statusKey === 'executing'
                                ? 'bg-green-50 text-green-600'
                                : contract.statusKey === 'draft'
                                  ? 'bg-gray-100 text-gray-500'
                                  : 'bg-blue-50 text-blue-600'
                            }`}>
                              {contract.status}
                            </span>
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

        {/* 2. 报账单信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">报账单信息</h3>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">
                  <span className="text-red-500 mr-0.5">*</span>
                  报账单编号
                </label>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <input
                    type="text"
                    value={billNoInput}
                    onChange={(e) => setBillNoInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBillQuery()}
                    placeholder="请输入报账单编号"
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleBillQuery}
                    className="px-4 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors inline-flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    查询
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">报账总金额（元）</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-800 font-semibold">
                    {billLoaded ? billTotalAmount : '-'}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">剩余可补录金额（元）</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-orange-600 font-semibold">
                    {billLoaded ? billRemainingAmount : '-'}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">报账人</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {billLoaded ? billPerson : '-'}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">报账部门</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {billLoaded ? billDept : '-'}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">记账对象</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {billLoaded ? (billAccountingObject || '-') : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 报账单行列表 */}
          {billLoaded && (
            <div className="border border-gray-100 rounded-lg">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-b border-gray-100 rounded-t-lg">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-semibold text-gray-800">报账单行列表</span>
                  <span className="text-gray-400">【{billRows.length}】</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={allBillRowsChecked}
                    onChange={handleSelectAllBillRows}
                    className="w-3.5 h-3.5 accent-[#1677FF]"
                  />
                  <span>全选</span>
                </div>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap w-10">选择</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">行ID</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">全网项目编码</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">合同编码</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">管会产品编码</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">供应商编码</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务大类</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">成本中心代码</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务小类代码</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务活动代码</th>
                      <th className="px-2 py-2 text-right font-medium whitespace-nowrap">列账金额</th>
                      <th className="px-2 py-2 text-right font-medium whitespace-nowrap">不含税金额</th>
                      <th className="px-2 py-2 text-center font-medium whitespace-nowrap">税率（%）</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">提交日期</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billRows.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="px-2 py-8 text-center text-gray-400">
                          暂无报账单行数据
                        </td>
                      </tr>
                    ) : (
                      billRows.map(row => (
                        <tr key={row.id} className={`border-t border-gray-100 ${row.checked ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                          <td className="px-2 py-2">
                            <input
                              type="checkbox"
                              checked={row.checked}
                              onChange={() => handleBillRowCheck(row.id)}
                              className="w-3.5 h-3.5 accent-[#1677FF]"
                            />
                          </td>
                          <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{row.rowId}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{row.networkProjectCode}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{row.contractCode}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{row.managementProductCode}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{row.supplierCode}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{row.businessCategory}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{row.costCenterCode}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{row.businessSubcategory}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{row.businessActivityCode}</td>
                          <td className="px-2 py-2 text-gray-800 whitespace-nowrap text-right font-medium">{row.recordedAmount}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap text-right">{row.amountNoTax}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap text-center">{row.taxRate}</td>
                          <td className="px-2 py-2 text-gray-500 whitespace-nowrap">{row.submitDate}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 3. 支出计划 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">支出计划</h3>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">合同金额（元）</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-800 font-semibold">
                    {selectedContract ? totalContractAmount : '-'}
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-3">已报账金额（元）</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-[#1677FF] font-semibold">
                    {expensePlanList.length > 0 ? reimbursedAmount : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 支出计划明细列表 */}
          {selectedContract && (
            <div className="border border-gray-100 rounded-lg">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-b border-gray-100 rounded-t-lg">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-semibold text-gray-800">支出计划明细</span>
                  <span className="text-gray-400">【{expensePlanList.length}】</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <input
                    type="checkbox"
                    checked={allPlansChecked}
                    onChange={handleSelectAllPlans}
                    className="w-3.5 h-3.5 accent-[#1677FF]"
                  />
                  <span>全选</span>
                </div>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap w-10">选择</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">项目编码</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">项目名称</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">支出产品名称</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">支出内容</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">预算编码</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">计划支出时间</th>
                      <th className="px-2 py-2 text-right font-medium whitespace-nowrap">计划支出（元，不含税）</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">对应IT收入资费</th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">合同阶段</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expensePlanList.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-2 py-8 text-center text-gray-400">
                          暂无支出计划数据
                        </td>
                      </tr>
                    ) : (
                      expensePlanList.map(plan => (
                        <tr key={plan.id} className={`border-t border-gray-100 ${plan.checked ? 'bg-blue-50/30' : 'hover:bg-gray-50/50'}`}>
                          <td className="px-2 py-2">
                            <input
                              type="checkbox"
                              checked={plan.checked}
                              onChange={() => handlePlanCheck(plan.id)}
                              className="w-3.5 h-3.5 accent-[#1677FF]"
                            />
                          </td>
                          <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{plan.projectCode}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{plan.projectName}</td>
                          <td className="px-2 py-2 text-gray-800 whitespace-nowrap">{plan.expenseProductName}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{plan.expenseType}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{plan.budgetCode}</td>
                          <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{plan.planDate}</td>
                          <td className="px-2 py-2 text-gray-800 whitespace-nowrap text-right font-medium">{plan.plannedExpenseNoTax}</td>
                          <td className="px-2 py-2 text-gray-700 whitespace-nowrap">{plan.correspondingTariff}</td>
                          <td className="px-2 py-2 text-gray-600 whitespace-nowrap">{plan.contractStage}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!selectedContract && (
            <div className="border border-dashed border-gray-200 rounded-lg py-12 text-center text-gray-400 text-sm">
              请先选择项目和合同
            </div>
          )}
        </div>

        {/* 4. 按钮区 */}
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
            onClick={handleConfirm}
            className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            确认
          </button>
        </div>

      </div>
    </div>
  )
}
