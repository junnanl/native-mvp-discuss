import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, Search, ChevronDown, ChevronRight, RotateCcw, Check, Plus, X, Save } from 'lucide-react'

interface PaymentDetailProps {
  onNavigate?: (path: string) => void
  id?: string
}

// ============================================================
// 枚举定义
// ============================================================
const billTypeOptions = [
  '成本费用批量支付申请报账单'
]

// ============================================================
// 支付明细 mock 数据（独立维护）
// ============================================================
interface PaymentDetailRow {
  id: string
  aictBillCode: string
  erpCode: string
  netProjectCode: string
  projectName: string
  reimburser: string
  reimburseDept: string
  reimburseTime: string
  contractCode: string
  expensePlanCode: string
  businessCategory: string
  businessSubCategory: string
  businessActivity: string
  paymentType: string
  reportAmount: string
  paidAmount: string
  remainAmount: string
  currentPaymentAmount: string
  paymentAccount: string
  payeeName: string
  bankCode: string
}

const mockPaymentDetailRows: PaymentDetailRow[] = [
  {
    id: 'payd-1',
    aictBillCode: 'AICT2026060001',
    erpCode: 'ERP2026070100001',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    reimburser: '张三',
    reimburseDept: '政企客户部',
    reimburseTime: '2026-07-01',
    contractCode: 'HT-2026-0010',
    expensePlanCode: 'ZCJH-010',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    paymentType: '正常支付',
    reportAmount: '30,000.00',
    paidAmount: '0.00',
    remainAmount: '30,000.00',
    currentPaymentAmount: '16,666.67',
    paymentAccount: '6222020200001234567',
    payeeName: '科大讯飞信息科技有限公司',
    bankCode: '102361000123'
  },
  {
    id: 'payd-2',
    aictBillCode: 'AICT2026060001',
    erpCode: 'ERP2026070100001',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    reimburser: '张三',
    reimburseDept: '政企客户部',
    reimburseTime: '2026-07-01',
    contractCode: 'HT-2026-0010',
    expensePlanCode: 'ZCJH-011',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    paymentType: '正常支付',
    reportAmount: '20,000.00',
    paidAmount: '0.00',
    remainAmount: '20,000.00',
    currentPaymentAmount: '10,000.00',
    paymentAccount: '6217002020012345678',
    payeeName: '华为软件技术有限公司',
    bankCode: '105361000456'
  },
  {
    id: 'payd-3',
    aictBillCode: 'AICT2026060002',
    erpCode: 'ERP2026070100002',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    reimburser: '李四',
    reimburseDept: '政企客户部',
    reimburseTime: '2026-07-02',
    contractCode: 'HT-2026-0010',
    expensePlanCode: 'ZCJH-012',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    paymentType: '正常支付',
    reportAmount: '30,000.00',
    paidAmount: '0.00',
    remainAmount: '30,000.00',
    currentPaymentAmount: '15,000.00',
    paymentAccount: '6212262020012345678',
    payeeName: '中兴通讯股份有限公司',
    bankCode: '104361000789'
  }
]

// ============================================================
// 新增弹框 - 报账单信息 mock 数据（独立维护）
// ============================================================
interface AictBillRow {
  id: string
  aictBillCode: string
  erpCode: string
  netProjectCode: string
  projectName: string
  amount: string
  paymentAmount: string
  reimburser: string
  reimburseDept: string
  reimburseTime: string
}

const mockAictBillList: AictBillRow[] = [
  {
    id: 'ab-1',
    aictBillCode: 'AICT2026060001',
    erpCode: 'ERP2026070100001',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    amount: '50,000.00',
    paymentAmount: '16,666.67',
    reimburser: '张三',
    reimburseDept: '政企客户部',
    reimburseTime: '2026-07-01'
  },
  {
    id: 'ab-2',
    aictBillCode: 'AICT2026060002',
    erpCode: 'ERP2026070100002',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    amount: '30,000.00',
    paymentAmount: '10,000.00',
    reimburser: '李四',
    reimburseDept: '政企客户部',
    reimburseTime: '2026-07-02'
  },
  {
    id: 'ab-3',
    aictBillCode: 'AICT2026060003',
    erpCode: 'ERP2026070100003',
    netProjectCode: 'AH20260102',
    projectName: '芜湖市政务服务中心数字政府项目',
    amount: '45,000.00',
    paymentAmount: '15,000.00',
    reimburser: '王五',
    reimburseDept: '政企客户部',
    reimburseTime: '2026-07-03'
  },
  {
    id: 'ab-4',
    aictBillCode: 'AICT2026060004',
    erpCode: 'ERP2026060100004',
    netProjectCode: 'AH20260103',
    projectName: '蚌埠市教育局智慧教育项目',
    amount: '90,000.00',
    paymentAmount: '0.00',
    reimburser: '赵六',
    reimburseDept: '政企客户部',
    reimburseTime: '2026-06-04'
  },
  {
    id: 'ab-5',
    aictBillCode: 'AICT2026060005',
    erpCode: 'ERP2026060100005',
    netProjectCode: 'AH20260104',
    projectName: '合肥市轨道交通集团智慧交通项目',
    amount: '250,000.00',
    paymentAmount: '0.00',
    reimburser: '钱七',
    reimburseDept: '政企客户部',
    reimburseTime: '2026-06-05'
  }
]

// ============================================================
// 新增弹框 - 支付信息 mock 数据（关联报账单，独立维护）
// ============================================================
interface BillPaymentRow {
  id: string
  billId: string
  contractCode: string
  expensePlanCode: string
  businessCategory: string
  businessSubCategory: string
  businessActivity: string
  paymentType: string
  reportAmount: string
  paidAmount: string
  remainAmount: string
  paymentAccount: string
  payeeName: string
  bankCode: string
}

const mockBillPaymentList: BillPaymentRow[] = [
  {
    id: 'bp-1',
    billId: 'ab-1',
    contractCode: 'HT-2026-0010',
    expensePlanCode: 'ZCJH-010',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    paymentType: '正常支付',
    reportAmount: '30,000.00',
    paidAmount: '0.00',
    remainAmount: '30,000.00',
    paymentAccount: '6222020200001234567',
    payeeName: '科大讯飞信息科技有限公司',
    bankCode: '102361000123'
  },
  {
    id: 'bp-2',
    billId: 'ab-1',
    contractCode: 'HT-2026-0010',
    expensePlanCode: 'ZCJH-011',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    paymentType: '正常支付',
    reportAmount: '20,000.00',
    paidAmount: '0.00',
    remainAmount: '20,000.00',
    paymentAccount: '6217002020012345678',
    payeeName: '华为软件技术有限公司',
    bankCode: '105361000456'
  },
  {
    id: 'bp-3',
    billId: 'ab-2',
    contractCode: 'HT-2026-0010',
    expensePlanCode: 'ZCJH-012',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    paymentType: '正常支付',
    reportAmount: '30,000.00',
    paidAmount: '0.00',
    remainAmount: '30,000.00',
    paymentAccount: '6212262020012345678',
    payeeName: '中兴通讯股份有限公司',
    bankCode: '104361000789'
  },
  {
    id: 'bp-4',
    billId: 'ab-3',
    contractCode: 'HT-2026-0011',
    expensePlanCode: 'ZCJH-013',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '软件开发',
    paymentType: '正常支付',
    reportAmount: '45,000.00',
    paidAmount: '10,000.00',
    remainAmount: '35,000.00',
    paymentAccount: '6222020200001234567',
    payeeName: '科大讯飞信息科技有限公司',
    bankCode: '102361000123'
  },
  {
    id: 'bp-5',
    billId: 'ab-4',
    contractCode: 'HT-2026-0012',
    expensePlanCode: 'ZCJH-014',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '商品销售',
    paymentType: '正常支付',
    reportAmount: '90,000.00',
    paidAmount: '0.00',
    remainAmount: '90,000.00',
    paymentAccount: '6217002020012345678',
    payeeName: '华为软件技术有限公司',
    bankCode: '105361000456'
  },
  {
    id: 'bp-6',
    billId: 'ab-5',
    contractCode: 'HT-2026-0013',
    expensePlanCode: 'ZCJH-015',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    paymentType: '正常支付',
    reportAmount: '250,000.00',
    paidAmount: '50,000.00',
    remainAmount: '200,000.00',
    paymentAccount: '6212262020012345678',
    payeeName: '中兴通讯股份有限公司',
    bankCode: '104361000789'
  }
]

// ============================================================
// 通用组件
// ============================================================
function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = '请选择',
  disabled = false,
  renderOption
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; subLabel?: string }[]
  placeholder?: string
  disabled?: boolean
  renderOption?: (opt: { value: string; label: string; subLabel?: string }) => React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(keyword.toLowerCase()) ||
    o.value.toLowerCase().includes(keyword.toLowerCase()) ||
    (o.subLabel || '').toLowerCase().includes(keyword.toLowerCase())
  )

  const selected = options.find(o => o.value === value)

  return (
    <div className="relative">
      <div
        className={
          'flex items-center w-full px-3 py-2 text-sm border rounded-md bg-white ' +
          (disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-500'
            : 'border-gray-300 cursor-pointer hover:border-blue-400')
        }
        onClick={() => {
          if (disabled) return
          setOpen(!open)
        }}
      >
        <span className={selected ? 'text-gray-800 flex-1' : 'text-gray-400 flex-1'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </div>
      {open && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setOpen(false)
              setKeyword('')
            }}
          />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索..."
                className="flex-1 text-sm outline-none bg-transparent"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-44">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-center text-gray-400">
                  无匹配项
                </div>
              ) : (
                filtered.map((opt) => (
                  <div
                    key={opt.value}
                    className={
                      'px-3 py-2 text-sm cursor-pointer ' +
                      (opt.value === value
                        ? 'bg-blue-50 text-[#1677FF]'
                        : 'hover:bg-gray-50 text-gray-700')
                    }
                    onClick={() => {
                      onChange(opt.value)
                      setOpen(false)
                      setKeyword('')
                    }}
                  >
                    {renderOption ? renderOption(opt) : (
                      <div className="flex flex-col">
                        <span>{opt.label}</span>
                        {opt.subLabel && (
                          <span className="text-xs text-gray-400">{opt.subLabel}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function NumberInput({
  value,
  onChange,
  placeholder,
  decimals = 2
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  decimals?: number
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    const regex = decimals > 0
      ? new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`)
      : /^\d*$/
    if (regex.test(v) || v === '') {
      onChange(v)
    }
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-28 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white text-right"
    />
  )
}

// ============================================================
// 回款证明信息 mock 数据（复制自项目类费用报账单审批页面，独立维护）
// ============================================================
interface ReceiptProofRow {
  id: string
  netProjectCode: string
  customerManager: string
  currentPaymentAmount: string
  paidAmountSystem: string
  paidAmountManual: string
  itReceiptAmount: string
  ctReceiptAmount: string
  projectReceiptAmount: string
  receiptRemark: string
  proofs: {
    id: string
    accountIdentifier: string
    paymentAmount: string
    paymentTime: string
    groupCustomerCode: string
    remark: string
  }[]
}

const mockReceiptProofRows: ReceiptProofRow[] = [
  {
    id: 'rc-1',
    netProjectCode: 'AH20260101',
    customerManager: '张凯',
    currentPaymentAmount: '16,666.67',
    paidAmountSystem: '50,000.00',
    paidAmountManual: '45,000.00',
    itReceiptAmount: '20,000.00',
    ctReceiptAmount: '30,000.00',
    projectReceiptAmount: '50,000.00',
    receiptRemark: '本次付款已提供回款证明，待客户经理确认',
    proofs: [
      { id: 'p1', accountIdentifier: '6222020200001234567', paymentAmount: '30,000.00', paymentTime: '2026-07-10', groupCustomerCode: 'GCUS001', remark: '客户回款，系统自动核销' },
      { id: 'p2', accountIdentifier: '6222020200001234568', paymentAmount: '20,000.00', paymentTime: '2026-07-15', groupCustomerCode: 'GCUS001', remark: '客户回款，系统自动核销' }
    ]
  }
]

// ============================================================
// 流程轨迹 mock 数据（按时间正序，最后一步为最新）
// ============================================================
const mockProcessTrail = [
  { time: '2026-08-05 10:00', actor: '王强', action: '发起付款申请' },
  { time: '2026-08-06 14:30', actor: '王强', action: '提供回款证明材料' },
  { time: '2026-08-08 09:15', actor: '系统', action: '流转至下一环节：回款证明提供' }
]

// ============================================================
// 主页面
// ============================================================
export default function PaymentDetail({ onNavigate, id }: PaymentDetailProps) {
  // 详情页固定为只读模式（不可编辑，隐藏新增/删除按钮）
  const readOnly = true
  // ========== 报账单信息状态 ==========
  const [billType, setBillType] = useState('成本费用批量支付申请报账单')
  const [billTypeError, setBillTypeError] = useState('')
  const [reimburser] = useState('张三')
  const [reimburseDept] = useState('政企客户部')
  const [costCenter] = useState('CC001-政企客户部')
  const [summary, setSummary] = useState('2026年6月合肥市第一人民医院智慧医疗项目设备采购支出付款申请，本次支付金额合计1.67万元。')
  const [remark, setRemark] = useState('本次付款金额与合同约定付款计划不一致，需人工核验。')

  // ========== 支付明细数据 ==========
  const [paymentDetailRows, setPaymentDetailRows] = useState(mockPaymentDetailRows)

  // ========== 新增支付明细弹框状态 ==========
  const [addModalVisible, setAddModalVisible] = useState(false)
  // 删除确认弹框状态
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteTargetRow, setDeleteTargetRow] = useState<PaymentDetailRow | null>(null)
  // 报账单信息：单选
  const [selectedBillId, setSelectedBillId] = useState<string>('')
  // 支付信息：多选 + 本次支付金额
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([])
  const [paymentInputAmounts, setPaymentInputAmounts] = useState<Record<string, string>>({})

  // 当前选中的报账单
  const selectedBill = useMemo(() => {
    return mockAictBillList.find(b => b.id === selectedBillId) || null
  }, [selectedBillId])

  // 选中报账单下的支付信息
  const billPayments = useMemo(() => {
    if (!selectedBillId) return []
    return mockBillPaymentList.filter(p => p.billId === selectedBillId)
  }, [selectedBillId])

  // 报账总额 = 支付明细报账金额合计
  const totalProvision = paymentDetailRows.reduce((s, r) => s + parseFloat(r.reportAmount.replace(/,/g, '')), 0)

  // 支付总额 = 支付明细本次支付金额合计
  const totalPayment = paymentDetailRows.reduce((s, r) => s + parseFloat(r.currentPaymentAmount.replace(/,/g, '')), 0)

  // ========== 回款证明信息（只读详情） ==========
  const [receiptProofRows] = useState(mockReceiptProofRows)
  const [proofModalVisible, setProofModalVisible] = useState(false)
  const [proofModalRow, setProofModalRow] = useState<ReceiptProofRow | null>(null)

  // 流程轨迹模块 - 默认折叠
  const [trailExpanded, setTrailExpanded] = useState(false)

  // 打开回款证明弹框
  const handleOpenProofModal = (row: ReceiptProofRow) => {
    setProofModalRow(row)
    setProofModalVisible(true)
  }

  // ========== 流程信息状态 ==========
  const customerManagerOptions = [
    { value: '张三', label: '张三（政企客户部）' },
    { value: '李四', label: '李四（政企客户部）' },
    { value: '王五', label: '王五（政企客户部）' },
    { value: '赵六', label: '赵六（政企客户部）' },
    { value: '钱七', label: '钱七（政企客户部）' }
  ]
  const [flowApprover, setFlowApprover] = useState('')
  const [flowApproverError, setFlowApproverError] = useState('')

  const handleBack = () => {
    onNavigate?.('/finance/payment')
  }

  const handleCancel = () => {
    onNavigate?.('/finance/payment')
  }

  const handleSubmit = () => {
    if (!billType) {
      setBillTypeError('请选择报账单类型')
      return
    }
    if (paymentDetailRows.length === 0) {
      alert('请至少添加一条支付明细')
      return
    }
    if (!summary.trim()) {
      alert('请填写报账单摘要')
      return
    }
    if (summary.length > 80) {
      alert('报账单摘要不能超过80字符')
      return
    }
    alert('提交成功')
    onNavigate?.('/finance/payment')
  }

  // 保存为草稿
  const handleSaveDraft = () => {
    alert('保存草稿成功')
  }

  // 打开新增支付明细弹框
  const handleOpenAddModal = () => {
    setAddModalVisible(true)
    setSelectedBillId('')
    setSelectedPaymentIds([])
    setPaymentInputAmounts({})
  }

  // 单选报账单，切换后清空支付信息选中与金额
  const handleSelectBill = (billId: string) => {
    setSelectedBillId(billId)
    setSelectedPaymentIds([])
    setPaymentInputAmounts({})
  }

  // 支付信息行选择/取消
  const handleToggleSelect = (id: string) => {
    setSelectedPaymentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // 支付信息全选/取消全选
  const handleToggleSelectAll = () => {
    if (billPayments.length > 0 && billPayments.every(p => selectedPaymentIds.includes(p.id))) {
      setSelectedPaymentIds(prev => prev.filter(id => !billPayments.find(p => p.id === id)))
    } else {
      const newIds = billPayments.map(p => p.id).filter(id => !selectedPaymentIds.includes(id))
      setSelectedPaymentIds(prev => [...prev, ...newIds])
    }
  }

  // 本次支付金额输入
  const handlePaymentAmountChange = (rowId: string, value: string) => {
    setPaymentInputAmounts(prev => ({ ...prev, [rowId]: value }))
  }

  // 打开删除确认弹框
  const handleDeleteClick = (row: PaymentDetailRow) => {
    setDeleteTargetRow(row)
    setDeleteModalVisible(true)
  }

  // 确认删除支付明细行
  const confirmDelete = () => {
    if (!deleteTargetRow) return
    setPaymentDetailRows(prev => prev.filter(r => r.id !== deleteTargetRow.id))
    setDeleteModalVisible(false)
    setDeleteTargetRow(null)
  }

  // 确认新增/编辑：将选中的支付信息写入支付明细表格
  const handleConfirmAdd = () => {
    if (!selectedBillId) {
      alert('请选择报账单')
      return
    }
    if (selectedPaymentIds.length === 0) {
      alert('请至少选择一条支付信息')
      return
    }
    const selectedRows = mockBillPaymentList.filter(p => selectedPaymentIds.includes(p.id))
    for (const p of selectedRows) {
      if (!(paymentInputAmounts[p.id] || '').trim()) {
        alert('请填写本次支付金额')
        return
      }
    }
    if (!selectedBill) return
    const fmt = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    const newRows = selectedRows.map(p => ({
      id: `payd-new-${p.id}-${Date.now()}`,
      aictBillCode: selectedBill.aictBillCode,
      erpCode: selectedBill.erpCode,
      netProjectCode: selectedBill.netProjectCode,
      projectName: selectedBill.projectName,
      reimburser: selectedBill.reimburser,
      reimburseDept: selectedBill.reimburseDept,
      reimburseTime: selectedBill.reimburseTime,
      contractCode: p.contractCode,
      expensePlanCode: p.expensePlanCode,
      businessCategory: p.businessCategory,
      businessSubCategory: p.businessSubCategory,
      businessActivity: p.businessActivity,
      paymentType: p.paymentType,
      reportAmount: p.reportAmount,
      paidAmount: p.paidAmount,
      remainAmount: p.remainAmount,
      currentPaymentAmount: fmt(parseFloat(paymentInputAmounts[p.id])),
      paymentAccount: p.paymentAccount,
      payeeName: p.payeeName,
      bankCode: p.bankCode
    }))
    setPaymentDetailRows(prev => [...prev, ...newRows])
    setAddModalVisible(false)
    setSelectedBillId('')
    setSelectedPaymentIds([])
    setPaymentInputAmounts({})
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部标题栏 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">付款详情</h2>
          </div>
        </div>

        {/* 1. 报账单信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">报账单信息</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">
                  {!readOnly && <span className="text-red-500 mr-0.5">*</span>}
                  报账单类型：
                </label>
                <div className="flex-1 min-w-0">
                  {readOnly ? (
                    <div className="text-sm text-gray-700">
                      {billType || '-'}
                    </div>
                  ) : (
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
                  )}
                  {billTypeError && (
                    <p className="text-xs text-red-500 mt-1">{billTypeError}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账人：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {reimburser}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账部门：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {reimburseDept}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">成本中心：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {costCenter}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账总额（含税，元）：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 font-semibold">
                  {totalProvision.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">支付总额（含税，元）：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 font-semibold">
                  {totalPayment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
              </div>

              {/* 报账单摘要：独占一行 */}
              <div className="col-span-3 flex items-start min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">
                  {!readOnly && <span className="text-red-500 mr-0.5">*</span>}
                  报账单摘要：
                </label>
                <div className="flex-1 min-w-0">
                  {readOnly ? (
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {summary || '-'}
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="请输入报账单摘要，最多80字符"
                        maxLength={80}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
                    />
                    </>
                  )}
                </div>
              </div>

              {/* 备注：独占一行，只读 */}
              <div className="col-span-3 flex items-start min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">备注：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700 whitespace-pre-wrap">
                  {remark || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 支付明细信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">支付明细信息</h3>
              <span className="text-xs text-gray-400">【{paymentDetailRows.length}】</span>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                新增
              </button>
            )}
          </div>
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">ERP报账单编号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务大类</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">已报账金额</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">已支付金额</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">本次支付金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">收款账号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">收款方名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">联行号</th>
                  {!readOnly && (
                    <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paymentDetailRows.length === 0 ? (
                  <tr>
                    <td colSpan={readOnly ? 10 : 11} className="px-4 py-12 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  paymentDetailRows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.erpCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.contractCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.businessCategory}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-right">{row.reportAmount}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-right">{row.paidAmount}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-right font-medium">{row.currentPaymentAmount}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.paymentAccount}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.payeeName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.bankCode}</td>
                      {!readOnly && (
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(row)}
                            className="text-xs text-red-500 hover:text-red-600 hover:underline"
                          >
                            删除
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. 回款证明信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">回款证明信息</h3>
            <span className="text-xs text-gray-400">【{receiptProofRows.length}】</span>
          </div>
          <div className="overflow-x-auto overflow-y-hidden border border-gray-100 rounded-md">
            <table className="w-full text-sm min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">客户经理</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">本次支付金额</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">后向已付款金额-系统计算</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">后向已付款金额-人工填写</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">IT总回款金额</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">CT总回款金额</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">项目总回款金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">回款说明</th>
                  <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {receiptProofRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  receiptProofRows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.customerManager}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{row.currentPaymentAmount}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{row.paidAmountSystem}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{row.paidAmountManual}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{row.itReceiptAmount}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{row.ctReceiptAmount}</td>
                      <td className="px-3 py-3 text-gray-800 text-right font-medium whitespace-nowrap">{row.projectReceiptAmount}</td>
                      <td className="px-3 py-3 text-gray-600 truncate max-w-[200px]" title={row.receiptRemark}>{row.receiptRemark}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenProofModal(row)}
                          className="text-xs text-[#1677FF] hover:text-blue-600 hover:underline"
                        >
                          回款证明
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. 流程轨迹 - 默认折叠 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 cursor-pointer select-none hover:bg-gray-50"
            onClick={() => setTrailExpanded(!trailExpanded)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
            {trailExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500" />
              : <ChevronRight className="w-4 h-4 text-gray-500" />
            }
          </div>
          {trailExpanded && (
            <div className="p-4">
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
                <ol className="space-y-4">
                  {mockProcessTrail.map((item, idx) => (
                    <li key={idx} className="relative">
                      <div className={clsx(
                        'absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2',
                        idx === mockProcessTrail.length - 1
                          ? 'bg-[#1677FF] border-[#1677FF]'
                          : 'bg-white border-gray-300'
                      )} />
                      <div className="text-xs text-gray-400 mb-0.5">{item.time}</div>
                      <div className="text-sm text-gray-800">
                        <span className="font-medium">{item.actor}</span>
                        <span className="text-gray-500 ml-1.5">{item.action}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* 6. 流程信息 */}
        {!readOnly && (
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
                        回款证明提供
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步处理人</label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                          客户经理
                        </span>
                        <div className="flex-1 min-w-0">
                          <SearchableSelect
                            value={flowApprover}
                            onChange={(v) => { setFlowApprover(v); setFlowApproverError('') }}
                            options={customerManagerOptions}
                            placeholder="请选择下一步处理人"
                          />
                        </div>
                      </div>
                      {flowApproverError && (
                        <p className="text-xs text-red-500 mt-1">{flowApproverError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. 按钮区 */}
        <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
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
                onClick={handleSaveDraft}
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
                提交
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========== 新增支付明细弹框 ========== */}
      {addModalVisible && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[1400px] max-w-[95vw] max-h-[90vh] flex flex-col">
            {/* 弹框标题 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">新增支付明细</h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 内容区 */}
            <div className="flex-1 overflow-auto px-5 py-4">
              {/* 报账单信息模块 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">报账单信息</h3>
              </div>
              <div className="overflow-x-auto border border-gray-100 rounded-md">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs">
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap w-10">
                        <span className="sr-only">选择</span>
                      </th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">AICT报账单编号</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">ERP报账单编号</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账单类型</th>
                      <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">报账金额（元）</th>
                      <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">支付金额（元）</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账人</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账部门</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockAictBillList.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      mockAictBillList.map(bill => (
                        <tr
                          key={bill.id}
                          className={`cursor-pointer hover:bg-blue-50/50 transition-colors ${selectedBillId === bill.id ? 'bg-blue-50' : ''}`}
                          onClick={() => handleSelectBill(bill.id)}
                        >
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <input
                              type="radio"
                              name="aict-bill-radio"
                              checked={selectedBillId === bill.id}
                              onChange={() => handleSelectBill(bill.id)}
                              className="w-4 h-4 accent-[#1677FF] cursor-pointer"
                            />
                          </td>
                          <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{bill.aictBillCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{bill.erpCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">项目类费用报账单</td>
                          <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-right">{bill.amount}</td>
                          <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-right">{bill.paymentAmount}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{bill.reimburser}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{bill.reimburseDept}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{bill.reimburseTime}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* 支付信息模块：选中报账单后展示 */}
              {selectedBillId && (
                <div className="mt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                    <h3 className="text-sm font-semibold text-gray-800">支付明细信息</h3>
                    <span className="text-xs text-gray-400">【{billPayments.length}】</span>
                  </div>
                  <div className="overflow-x-auto border border-gray-100 rounded-md">
                    <table className="w-full text-sm min-w-[1400px]">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs">
                          <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap w-10">
                            <input
                              type="checkbox"
                              checked={billPayments.length > 0 && billPayments.every(p => selectedPaymentIds.includes(p.id))}
                              onChange={handleToggleSelectAll}
                              className="w-4 h-4 accent-[#1677FF] cursor-pointer"
                            />
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">支出计划编码</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务大类</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务小类</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务活动</th>
                          <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">已报账金额</th>
                          <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">已支付金额</th>
                          <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">剩余可支付金额</th>
                          <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">本次支付金额</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">收款账号</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">收款方名称</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">联行号</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {billPayments.length === 0 ? (
                          <tr>
                            <td colSpan={12} className="px-4 py-12 text-center text-gray-400">
                              暂无数据
                            </td>
                          </tr>
                        ) : (
                          billPayments.map(pay => {
                            const checked = selectedPaymentIds.includes(pay.id)
                            return (
                              <tr key={pay.id} className={checked ? 'bg-blue-50' : 'hover:bg-gray-50/50'}>
                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleToggleSelect(pay.id)}
                                    className="w-4 h-4 accent-[#1677FF] cursor-pointer"
                                  />
                                </td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{pay.expensePlanCode}</td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{pay.businessCategory}</td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{pay.businessSubCategory}</td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{pay.businessActivity}</td>
                                <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-right">{pay.reportAmount}</td>
                                <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-right">{pay.paidAmount}</td>
                                <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-right">{pay.remainAmount}</td>
                                <td className="px-3 py-3 text-center whitespace-nowrap">
                                  <NumberInput
                                    value={paymentInputAmounts[pay.id] || ''}
                                    onChange={(v) => handlePaymentAmountChange(pay.id, v)}
                                    placeholder="请输入"
                                  />
                                </td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{pay.paymentAccount}</td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{pay.payeeName}</td>
                                <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{pay.bankCode}</td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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

      {/* ========== 删除支付明细确认弹框 ========== */}
      {deleteModalVisible && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40" onClick={() => setDeleteModalVisible(false)}>
          <div
            className="bg-white rounded-lg shadow-xl w-[420px] max-w-[90vw] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">删除确认</h3>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-8 text-sm text-gray-700 text-center">
              确定要删除该支付明细信息吗？
            </div>
            <div className="flex justify-center gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setDeleteModalVisible(false)}
                className="px-6 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-6 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 回款证明弹框（只读详情） ========== */}
      {proofModalVisible && proofModalRow && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setProofModalVisible(false)}>
          <div
            className="bg-white rounded-lg shadow-xl w-[700px] max-w-[95vw] max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">回款证明</h3>
                <span className="text-xs text-gray-400">【{proofModalRow.proofs.length}】</span>
              </div>
              <button
                type="button"
                onClick={() => setProofModalVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto px-5 py-4">
              <div className="overflow-x-auto border border-gray-100 rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">账户标识</th>
                      <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">缴费金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">缴费时间</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">集团客户编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {proofModalRow.proofs.map(proof => (
                      <tr key={proof.id} className="hover:bg-gray-50/50">
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{proof.accountIdentifier}</td>
                        <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{proof.paymentAmount}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{proof.paymentTime}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{proof.groupCustomerCode}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{proof.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-center gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setProofModalVisible(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
