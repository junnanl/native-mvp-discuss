import { useState, useMemo, Fragment } from 'react'
import { RotateCcw, Check, ArrowLeft, Plus, Search, X, ChevronRight, ChevronDown } from 'lucide-react'

interface WriteoffCreateProps {
  onNavigate?: (path: string) => void
}

// 冲销明细 mock 数据
const mockWriteoffDetailRows = [
  {
    id: 'wcd-1',
    erpCode: 'ERP2026070100001',
    lineNo: '001',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    reimburser: '张三',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800052',
    poolOrderLineNo: '001',
    supplierCode: 'SUP-001',
    supplierName: '安徽科大讯飞信息科技有限公司',
    expensePlanCode: 'ZCJH-010',
    productName: '受托代销往来款',
    taxRate: '6%',
    tariffName: '[1372]受托代销往来款',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    expenseType: '硬件采购支出',
    productSegment: 'ICT基础资源',
    marketSegment: '政企市场',
    amount: '16,666.67',
    createTime: '2026-07-01 10:30:00',
    writeoffAmount: '16,666.67'
  },
  {
    id: 'wcd-2',
    erpCode: 'ERP2026070100002',
    lineNo: '002',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    reimburser: '李四',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800053',
    poolOrderLineNo: '001',
    supplierCode: 'SUP-003',
    supplierName: '华为软件技术有限公司',
    expensePlanCode: 'ZCJH-011',
    productName: '受托代销手续费',
    taxRate: '6%',
    tariffName: '[849]受托代销手续费',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场',
    amount: '10,000.00',
    createTime: '2026-07-02 14:20:00',
    writeoffAmount: '10,000.00'
  },
  {
    id: 'wcd-3',
    erpCode: 'ERP2026070100003',
    lineNo: '003',
    netProjectCode: 'AH20260102',
    projectName: '芜湖市政务服务中心数字政府项目',
    reimburser: '王五',
    contractCode: 'HT-2026-0011',
    poolOrderNo: 'APO303489260800054',
    poolOrderLineNo: '002',
    supplierCode: 'SUP-005',
    supplierName: '安徽中兴继远信息技术股份有限公司',
    expensePlanCode: 'ZCJH-012',
    productName: '系统集成服务',
    taxRate: '6%',
    tariffName: '[1205]系统集成服务',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场',
    amount: '15,000.00',
    createTime: '2026-07-03 09:15:00',
    writeoffAmount: '15,000.00'
  }
]

// 新增弹框 - 可选明细 mock 数据
interface SelectableRow {
  id: string
  erpCode: string
  lineNo: string
  netProjectCode: string
  projectName: string
  contractCode: string
  poolOrderNo: string
  poolOrderLineNo: string
  supplierCode: string
  supplierName: string
  expensePlanCode: string
  productName: string
  taxRate: string
  tariffName: string
  businessCategory: string
  businessSubCategory: string
  businessActivity: string
  amount: string
  createTime: string
  reimburser: string
  expenseType: string
  productSegment: string
  marketSegment: string
}

const mockSelectableRows: SelectableRow[] = [
  {
    id: 'sel-1',
    erpCode: 'ERP2026060100001',
    lineNo: '001',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800052',
    poolOrderLineNo: '001',
    supplierCode: 'SUP-001',
    supplierName: '安徽科大讯飞信息科技有限公司',
    expensePlanCode: 'ZCJH-010',
    productName: '受托代销往来款',
    taxRate: '6%',
    tariffName: '[1372]受托代销往来款',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    amount: '50,000.00',
    createTime: '2026-06-01 10:30:00',
    reimburser: '张三',
    expenseType: '硬件采购支出',
    productSegment: 'ICT基础资源',
    marketSegment: '政企市场'
  },
  {
    id: 'sel-2',
    erpCode: 'ERP2026060100002',
    lineNo: '002',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800053',
    poolOrderLineNo: '001',
    supplierCode: 'SUP-003',
    supplierName: '华为软件技术有限公司',
    expensePlanCode: 'ZCJH-011',
    productName: '受托代销手续费',
    taxRate: '6%',
    tariffName: '[849]受托代销手续费',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    amount: '30,000.00',
    createTime: '2026-06-02 14:20:00',
    reimburser: '李四',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场'
  },
  {
    id: 'sel-3',
    erpCode: 'ERP2026060100003',
    lineNo: '003',
    netProjectCode: 'AH20260102',
    projectName: '芜湖市政务服务中心数字政府项目',
    contractCode: 'HT-2026-0011',
    poolOrderNo: 'APO303489260800054',
    poolOrderLineNo: '002',
    supplierCode: 'SUP-005',
    supplierName: '安徽中兴继远信息技术股份有限公司',
    expensePlanCode: 'ZCJH-012',
    productName: '系统集成服务',
    taxRate: '6%',
    tariffName: '[1205]系统集成服务',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    amount: '45,000.00',
    createTime: '2026-06-03 09:15:00',
    reimburser: '王五',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场'
  },
  {
    id: 'sel-4',
    erpCode: 'ERP2026060100004',
    lineNo: '004',
    netProjectCode: 'AH20260103',
    projectName: '蚌埠市教育局智慧教育项目',
    contractCode: 'HT-2026-0012',
    poolOrderNo: 'APO303489260800055',
    poolOrderLineNo: '001',
    supplierCode: 'SUP-002',
    supplierName: '中国电信股份有限公司',
    expensePlanCode: 'ZCJH-013',
    productName: '商品销售成本',
    taxRate: '13%',
    tariffName: '[956]商品销售成本',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '商品销售',
    amount: '90,000.00',
    createTime: '2026-06-04 11:00:00',
    reimburser: '赵六',
    expenseType: '商品销售成本支出',
    productSegment: 'ICT基础资源',
    marketSegment: '政企市场'
  },
  {
    id: 'sel-5',
    erpCode: 'ERP2026060100005',
    lineNo: '005',
    netProjectCode: 'AH20260104',
    projectName: '合肥市轨道交通集团智慧交通项目',
    contractCode: 'HT-2026-0013',
    poolOrderNo: 'APO303489260800056',
    poolOrderLineNo: '003',
    supplierCode: 'SUP-006',
    supplierName: '合肥讯飞软件技术有限公司',
    expensePlanCode: 'ZCJH-014',
    productName: '软件开发服务',
    taxRate: '6%',
    tariffName: '[1206]软件开发服务',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '软件开发',
    amount: '250,000.00',
    createTime: '2026-06-05 16:45:00',
    reimburser: '钱七',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场'
  },
  {
    id: 'sel-6',
    erpCode: 'ERP2026060100006',
    lineNo: '006',
    netProjectCode: 'AH20260105',
    projectName: '安徽省公安厅智慧城市项目',
    contractCode: 'HT-2026-0014',
    poolOrderNo: 'APO303489260800057',
    poolOrderLineNo: '001',
    supplierCode: 'SUP-004',
    supplierName: '安徽移动通信有限公司',
    expensePlanCode: 'ZCJH-015',
    productName: '系统集成服务',
    taxRate: '6%',
    tariffName: '[1205]系统集成服务',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    amount: '180,000.00',
    createTime: '2026-06-06 08:30:00',
    reimburser: '孙八',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场'
  },
  {
    id: 'sel-7',
    erpCode: 'ERP2026060100007',
    lineNo: '007',
    netProjectCode: 'AH20260106',
    projectName: '合肥市第一人民医院智慧医疗项目',
    contractCode: 'HT-2026-0015',
    poolOrderNo: 'APO303489260800058',
    poolOrderLineNo: '002',
    supplierCode: 'SUP-007',
    supplierName: '安徽合力股份有限公司',
    expensePlanCode: 'ZCJH-016',
    productName: '受托代销往来款',
    taxRate: '6%',
    tariffName: '[1372]受托代销往来款',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    amount: '75,000.00',
    createTime: '2026-06-07 13:10:00',
    reimburser: '周九',
    expenseType: '硬件采购支出',
    productSegment: 'ICT基础资源',
    marketSegment: '政企市场'
  },
  {
    id: 'sel-8',
    erpCode: 'ERP2026060100008',
    lineNo: '008',
    netProjectCode: 'AH20260107',
    projectName: '芜湖市政务服务中心数字政府项目',
    contractCode: 'HT-2026-0016',
    poolOrderNo: 'APO303489260800059',
    poolOrderLineNo: '001',
    supplierCode: 'SUP-008',
    supplierName: '安徽皖能集团有限公司',
    expensePlanCode: 'ZCJH-017',
    productName: '受托代销手续费',
    taxRate: '6%',
    tariffName: '[849]受托代销手续费',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    amount: '120,000.00',
    createTime: '2026-06-08 15:20:00',
    reimburser: '吴十',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场'
  }
]

export default function WriteoffCreate({ onNavigate }: WriteoffCreateProps) {
  // 报账单信息状态
  const [billType, setBillType] = useState('项目类费用计提冲销报账单')
  const [billTypeError, setBillTypeError] = useState('')
  const [reimburser] = useState('张三')
  const [reimburseDept] = useState('政企客户部')
  const [costCenter] = useState('CC001-政企客户部')
  const [summary, setSummary] = useState('')

  // 冲销明细数据
  const [writeoffDetailRows, setWriteoffDetailRows] = useState(mockWriteoffDetailRows)
  // 冲销明细行展开/收起
  const [expandedDetailIds, setExpandedDetailIds] = useState<string[]>([])
  const toggleDetailRow = (id: string) => {
    setExpandedDetailIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // 新增弹框状态
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [selectedAddIds, setSelectedAddIds] = useState<string[]>([])
  const [addSearchErpCode, setAddSearchErpCode] = useState('')
  const [addSearchNetProjectCode, setAddSearchNetProjectCode] = useState('')
  const [addSearchProjectName, setAddSearchProjectName] = useState('')
  const [addSearchContractCode, setAddSearchContractCode] = useState('')
  const [addSearchReimburser, setAddSearchReimburser] = useState('')
  const [addSearchTimeStart, setAddSearchTimeStart] = useState('')
  const [addSearchTimeEnd, setAddSearchTimeEnd] = useState('')
  // 弹框行展开/收起
  const [expandedAddIds, setExpandedAddIds] = useState<string[]>([])
  const toggleAddRow = (id: string) => {
    setExpandedAddIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // 弹框可选明细过滤
  const filteredSelectableRows = useMemo(() => {
    return mockSelectableRows.filter(r => {
      if (addSearchErpCode && !r.erpCode.includes(addSearchErpCode.trim())) return false
      if (addSearchNetProjectCode && !r.netProjectCode.includes(addSearchNetProjectCode.trim())) return false
      if (addSearchProjectName && !r.projectName.includes(addSearchProjectName.trim())) return false
      if (addSearchContractCode && !r.contractCode.includes(addSearchContractCode.trim())) return false
      if (addSearchReimburser && !r.reimburser.includes(addSearchReimburser.trim())) return false
      if (addSearchTimeStart && r.createTime < addSearchTimeStart) return false
      if (addSearchTimeEnd && r.createTime > addSearchTimeEnd + ' 23:59:59') return false
      return true
    })
  }, [addSearchErpCode, addSearchNetProjectCode, addSearchProjectName, addSearchContractCode, addSearchReimburser, addSearchTimeStart, addSearchTimeEnd])

  // 报账单类型枚举
  const billTypeOptions = [
    '项目类费用计提冲销报账单',
    '成本费用批量计提冲销报账单'
  ]

  // 报账总额 = 冲销明细金额合计
  const totalWriteoff = writeoffDetailRows.reduce((s, r) => s + parseFloat(r.writeoffAmount.replace(/,/g, '')), 0)

  const handleBack = () => {
    onNavigate && onNavigate('/finance/expense/writeoff')
  }

  const handleCancel = () => {
    if (!confirm('确定取消本次发起冲销吗？')) return
    onNavigate && onNavigate('/finance/expense/writeoff')
  }

  const handleSubmit = () => {
    if (!billType) {
      setBillTypeError('请选择报账单类型')
      return
    }
    alert(`提交成功！本次冲销金额 ${totalWriteoff.toFixed(2)} 元`)
    onNavigate && onNavigate('/finance/expense/writeoff')
  }

  // 删除冲销明细行
  const handleDelete = (id: string) => {
    if (!confirm('确定要删除该冲销明细信息吗？')) return
    setWriteoffDetailRows(prev => prev.filter(r => r.id !== id))
  }

  // 打开新增弹框
  const handleOpenAddModal = () => {
    setAddModalVisible(true)
    setSelectedAddIds([])
    setAddSearchErpCode('')
    setAddSearchNetProjectCode('')
    setAddSearchProjectName('')
    setAddSearchContractCode('')
    setAddSearchReimburser('')
    setAddSearchTimeStart('')
    setAddSearchTimeEnd('')
  }

  // 重置弹框查询条件
  const handleResetAddSearch = () => {
    setAddSearchErpCode('')
    setAddSearchNetProjectCode('')
    setAddSearchProjectName('')
    setAddSearchContractCode('')
    setAddSearchReimburser('')
    setAddSearchTimeStart('')
    setAddSearchTimeEnd('')
  }

  // 弹框行选择/取消
  const handleToggleSelect = (id: string) => {
    setSelectedAddIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // 弹框全选/取消全选
  const handleToggleSelectAll = () => {
    if (filteredSelectableRows.length > 0 && filteredSelectableRows.every(r => selectedAddIds.includes(r.id))) {
      setSelectedAddIds(prev => prev.filter(id => !filteredSelectableRows.find(r => r.id === id)))
    } else {
      const newIds = filteredSelectableRows.map(r => r.id).filter(id => !selectedAddIds.includes(id))
      setSelectedAddIds(prev => [...prev, ...newIds])
    }
  }

  // 确认新增：将选中记录写入冲销明细表格，本次冲销金额默认带入计提金额
  const handleConfirmAdd = () => {
    if (selectedAddIds.length === 0) {
      alert('请至少选择一条明细')
      return
    }
    const newRows = selectedAddIds
      .map(id => mockSelectableRows.find(r => r.id === id))
      .filter((r): r is SelectableRow => !!r)
      .map(r => ({
        id: `wcd-new-${r.id}-${Date.now()}`,
        erpCode: r.erpCode,
        lineNo: r.lineNo,
        netProjectCode: r.netProjectCode,
        projectName: r.projectName,
        reimburser: r.reimburser,
        contractCode: r.contractCode,
        poolOrderNo: r.poolOrderNo,
        poolOrderLineNo: r.poolOrderLineNo,
        supplierCode: r.supplierCode,
        supplierName: r.supplierName,
        expensePlanCode: r.expensePlanCode,
        productName: r.productName,
        taxRate: r.taxRate,
        tariffName: r.tariffName,
        businessCategory: r.businessCategory,
        businessSubCategory: r.businessSubCategory,
        businessActivity: r.businessActivity,
        expenseType: r.expenseType,
        productSegment: r.productSegment,
        marketSegment: r.marketSegment,
        amount: r.amount,
        createTime: r.createTime,
        writeoffAmount: r.amount
      }))
    setWriteoffDetailRows(prev => [...prev, ...newRows])
    setAddModalVisible(false)
    setSelectedAddIds([])
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
            <h2 className="text-sm font-semibold text-gray-800">发起冲销</h2>
          </div>
        </div>

        {/* ========== 报账单信息 ========== */}
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
                    {totalWriteoff.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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

        {/* ========== 冲销明细信息 ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">冲销明细信息</h3>
              <span className="text-xs text-gray-400">【{writeoffDetailRows.length}】</span>
            </div>
            <button
              type="button"
              onClick={handleOpenAddModal}
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
                  <th className="px-2 py-2.5 text-center font-medium whitespace-nowrap w-10"></th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">ERP报账单编号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账单行号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账人</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计提金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计提时间</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">本次冲销金额</th>
                  <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {writeoffDetailRows.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-12 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  writeoffDetailRows.map(row => {
                    const expanded = expandedDetailIds.includes(row.id)
                    return (
                      <Fragment key={row.id}>
                        <tr className="hover:bg-gray-50/50">
                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => toggleDetailRow(row.id)}
                              className="text-gray-400 hover:text-[#1677FF]"
                            >
                              {expanded
                                ? <ChevronDown className="w-4 h-4" />
                                : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.erpCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.lineNo}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                          <td className="px-3 py-3 text-gray-600 truncate max-w-[200px]" title={row.projectName}>{row.projectName}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.contractCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.productName}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.taxRate}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.reimburser}</td>
                          <td className="px-3 py-3 text-gray-800 whitespace-nowrap font-medium">{row.amount}</td>
                          <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{row.createTime.split(' ')[0]}</td>
                          <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{row.writeoffAmount}</td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDelete(row.id)}
                              className="text-xs text-red-500 hover:text-red-600 hover:underline"
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                        {expanded && (
                          <tr className="bg-gray-50/50 border-t border-gray-100">
                            <td colSpan={13} className="px-4 py-3 pl-10">
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
                                  <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">业务大类：</label>
                                  <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.businessCategory}</div>
                                </div>
                                <div className="flex items-center min-h-[28px]">
                                  <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">业务小类：</label>
                                  <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.businessSubCategory}</div>
                                </div>
                                <div className="flex items-center min-h-[28px]">
                                  <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">业务活动：</label>
                                  <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.businessActivity}</div>
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
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========== 按钮区域 ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-center gap-3">
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
              提交报账系统
            </button>
          </div>
        </div>

        {/* ========== 新增冲销明细弹框 ========== */}
        {addModalVisible && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-[1200px] max-w-[95vw] max-h-[90vh] flex flex-col">
              {/* 弹框标题 */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h3 className="text-sm font-semibold text-gray-800">新增冲销明细</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setAddModalVisible(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 查询条件 */}
              <div className="px-5 py-3 border-b border-gray-100">
                <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                  <div className="flex items-center gap-2">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">ERP报账单编号</label>
                    <input
                      type="text"
                      value={addSearchErpCode}
                      onChange={(e) => setAddSearchErpCode(e.target.value)}
                      placeholder="请输入ERP报账单编号"
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">全网项目编码</label>
                    <input
                      type="text"
                      value={addSearchNetProjectCode}
                      onChange={(e) => setAddSearchNetProjectCode(e.target.value)}
                      placeholder="请输入全网项目编码"
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">项目名称</label>
                    <input
                      type="text"
                      value={addSearchProjectName}
                      onChange={(e) => setAddSearchProjectName(e.target.value)}
                      placeholder="请输入项目名称"
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">合同编码</label>
                    <input
                      type="text"
                      value={addSearchContractCode}
                      onChange={(e) => setAddSearchContractCode(e.target.value)}
                      placeholder="请输入合同编码"
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">报账人</label>
                    <input
                      type="text"
                      value={addSearchReimburser}
                      onChange={(e) => setAddSearchReimburser(e.target.value)}
                      placeholder="请输入报账人"
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">计提时间</label>
                    <div className="flex-1 min-w-0 flex items-center gap-1">
                      <input
                        type="date"
                        value={addSearchTimeStart}
                        onChange={(e) => setAddSearchTimeStart(e.target.value)}
                        className="flex-1 min-w-0 px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-gray-400 shrink-0">~</span>
                      <input
                        type="date"
                        value={addSearchTimeEnd}
                        onChange={(e) => setAddSearchTimeEnd(e.target.value)}
                        className="flex-1 min-w-0 px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={handleResetAddSearch}
                    className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    重置
                  </button>
                  <button
                    type="button"
                    className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1"
                  >
                    <Search className="w-3.5 h-3.5" />
                    查询
                  </button>
                </div>
              </div>

              {/* 表格区域 */}
              <div className="flex-1 overflow-auto px-5 py-3">
                <div className="overflow-x-auto border border-gray-100 rounded-md">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-xs">
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap w-10">
                          <input
                            type="checkbox"
                            checked={filteredSelectableRows.length > 0 && filteredSelectableRows.every(r => selectedAddIds.includes(r.id))}
                            onChange={handleToggleSelectAll}
                            className="w-4 h-4 accent-[#1677FF] cursor-pointer"
                          />
                        </th>
                        <th className="px-2 py-2.5 text-center font-medium whitespace-nowrap w-10"></th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">ERP报账单编号</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账单行号</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账人</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计提金额</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计提时间</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap sticky right-0 z-10 bg-gray-50 border-l border-gray-200">本次冲销金额</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredSelectableRows.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="px-4 py-12 text-center text-gray-400">
                            暂无数据
                          </td>
                        </tr>
                      ) : (
                        filteredSelectableRows.map(row => {
                          const checked = selectedAddIds.includes(row.id)
                          const expanded = expandedAddIds.includes(row.id)
                          return (
                            <Fragment key={row.id}>
                              <tr className={checked ? 'bg-blue-50' : 'hover:bg-gray-50/50'}>
                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleToggleSelect(row.id)}
                                    className="w-4 h-4 accent-[#1677FF] cursor-pointer"
                                  />
                                </td>
                                <td className="px-2 py-3 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => toggleAddRow(row.id)}
                                    className="text-gray-400 hover:text-[#1677FF]"
                                  >
                                    {expanded
                                      ? <ChevronDown className="w-4 h-4" />
                                      : <ChevronRight className="w-4 h-4" />}
                                  </button>
                                </td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.erpCode}</td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.lineNo}</td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                                <td className="px-3 py-3 text-gray-600 truncate max-w-[200px]" title={row.projectName}>{row.projectName}</td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.contractCode}</td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.productName}</td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.taxRate}</td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.reimburser}</td>
                                <td className="px-3 py-3 text-gray-800 whitespace-nowrap font-medium">{row.amount}</td>
                                <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{row.createTime.split(' ')[0]}</td>
                                <td className={`px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium sticky right-0 z-10 border-l border-gray-200 ${checked ? 'bg-blue-50' : 'bg-white'}`}>
                                  {row.amount}
                                </td>
                              </tr>
                              {expanded && (
                                <tr className={checked ? 'bg-blue-50/40' : 'bg-gray-50/40'}>
                                  <td colSpan={13} className="px-6 py-3 pl-12">
                                    <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">费用池订单号：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.poolOrderNo}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">费用池订单行号：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.poolOrderLineNo}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">供应商编码：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.supplierCode}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">供应商名称：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.supplierName}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">业务大类：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.businessCategory}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">业务小类：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.businessSubCategory}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">业务活动：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.businessActivity}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">支出计划编码：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.expensePlanCode}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">资费名称：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.tariffName}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">支出类型：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.expenseType}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">产品段：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.productSegment}</span>
                                      </div>
                                      <div className="flex items-center text-sm">
                                        <span className="text-gray-500 shrink-0 w-32 text-right pr-2">市场段：</span>
                                        <span className="text-gray-700 flex-1 min-w-0">{row.marketSegment}</span>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 弹框底部按钮 */}
              <div className="flex justify-center gap-3 px-5 py-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddModalVisible(false)}
                  className="px-6 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAdd}
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
