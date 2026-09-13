import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, Search, ChevronDown, ChevronRight, RotateCcw, Check, Plus, X, Pencil, Trash2 } from 'lucide-react'

interface CostPrepaymentBillSubmitProps {
  onNavigate?: (path: string) => void
  readOnly?: boolean
  id?: string
}

// ============================================================
// 枚举定义
// ============================================================

// ============================================================
// 流程轨迹 mock 数据（按时间正序，最后一步为最新）
// ============================================================
const mockProcessTrail = [
  { time: '2026-08-05 10:00', actor: '王强', action: '发起预付款提交申请' },
  { time: '2026-08-06 14:30', actor: '王强', action: '提供回款证明材料' },
  { time: '2026-08-08 09:15', actor: '系统', action: '流转至下一环节：预付款报账单提交' }
]

// ============================================================
// 回款证明信息 mock 数据（复制自预付款详情页面，独立维护）
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
// 合同信息 mock 数据（复制自发起预付款页面，独立维护）
// ============================================================
const expenseProjectList = [
  {
    id: 'ep1',
    name: '合肥市第一人民医院智慧医疗项目',
    code: 'PRJ-2026-HF-001',
    globalCode: 'NET-2026-HF-001',
    type: 'ICT项目',
    signMode: '普通项目',
    customerManager: '张凯',
    solutionManager: '刘伟'
  },
  {
    id: 'ep2',
    name: '芜湖市政务服务中心数字政府项目',
    code: 'PRJ-2026-WH-001',
    globalCode: 'NET-2026-WH-001',
    type: 'DICT项目',
    signMode: '统谈分签项目',
    customerManager: '李华',
    solutionManager: '陈晨'
  },
  {
    id: 'ep3',
    name: '蚌埠市教育局智慧教育项目',
    code: 'PRJ-2026-BB-001',
    globalCode: 'NET-2026-BB-001',
    type: 'ICT项目',
    signMode: '框架订单项目',
    customerManager: '王强',
    solutionManager: '赵磊'
  },
  {
    id: 'ep4',
    name: '合肥市轨道交通集团智慧交通项目',
    code: 'PRJ-2026-HF-002',
    globalCode: 'NET-2026-HF-002',
    type: '双计项目',
    signMode: '框架合同项目',
    customerManager: '赵明',
    solutionManager: '孙杰'
  },
  {
    id: 'ep5',
    name: '安徽省公安厅智慧城市项目',
    code: 'PRJ-2026-AH-001',
    globalCode: 'NET-2026-AH-001',
    type: 'ICT项目',
    signMode: '普通项目',
    customerManager: '杨海波',
    solutionManager: '周涛'
  }
]

const expenseContractList = [
  {
    id: 'ec1',
    code: 'CTR2026000001',
    name: '安徽移动IDC数据中心建设项目合同',
    type: '支出类',
    amountWithTax: '1,200,000.00',
    amountWithoutTax: '1,061,946.90',
    groupCustomerName: '安徽省政务信息中心',
    groupCustomerCode: 'GCUS001',
    status: '履行中',
    statusKey: 'executing',
    performanceStartTime: '2026-07-01',
    performanceEndTime: '2027-06-30',
    projectCode: 'PRJ-2026-HF-001',
    accountingObject: '项目成本',
    signTime: '2026-06-15',
    supplierCode: 'SUP-001',
    supplierName: '安徽科大讯飞信息科技有限公司'
  },
  {
    id: 'ec2',
    code: 'CTR2026000002',
    name: '合肥政务云平台服务合同',
    type: '支出类',
    amountWithTax: '3,500,000.00',
    amountWithoutTax: '3,097,345.13',
    groupCustomerName: '合肥市大数据局',
    groupCustomerCode: 'GCUS002',
    status: '履行中',
    statusKey: 'executing',
    performanceStartTime: '2026-06-15',
    performanceEndTime: '2027-06-14',
    projectCode: 'PRJ-2026-HF-001',
    accountingObject: '项目成本',
    signTime: '2026-06-18',
    supplierCode: 'SUP-003',
    supplierName: '华为软件技术有限公司'
  },
  {
    id: 'ec3',
    code: 'CTR2026000003',
    name: '企业专线接入服务协议',
    type: '支出类',
    amountWithTax: '850,000.00',
    amountWithoutTax: '752,212.39',
    groupCustomerName: '安徽电信股份有限公司',
    groupCustomerCode: 'GCUS003',
    status: '草稿',
    statusKey: 'draft',
    performanceStartTime: '2026-07-01',
    performanceEndTime: '2028-06-30',
    projectCode: 'PRJ-2026-WH-001',
    accountingObject: '部门成本',
    signTime: '2026-06-20',
    supplierCode: 'SUP-002',
    supplierName: '中国电信股份有限公司'
  },
  {
    id: 'ec4',
    code: 'CTR2026000004',
    name: '淮南IDC机房运维服务采购合同',
    type: '支出类',
    amountWithTax: '2,000,000.00',
    amountWithoutTax: '1,769,911.50',
    groupCustomerName: '淮南市信息技术服务中心',
    groupCustomerCode: 'GCUS004',
    status: '履行中',
    statusKey: 'executing',
    performanceStartTime: '2026-06-10',
    performanceEndTime: '2027-06-09',
    projectCode: 'PRJ-2026-BB-001',
    accountingObject: '公司成本',
    signTime: '2026-05-10',
    supplierCode: 'SUP-005',
    supplierName: '安徽中兴继远信息技术股份有限公司'
  },
  {
    id: 'ec5',
    code: 'CTR2026000005',
    name: '马鞍山智慧城市云平台建设运营合同',
    type: '有收有支类',
    amountWithTax: '5,800,000.00',
    amountWithoutTax: '5,132,743.36',
    groupCustomerName: '马鞍山市政务服务中心',
    groupCustomerCode: 'GCUS005',
    status: '履行中',
    statusKey: 'executing',
    performanceStartTime: '2026-06-20',
    performanceEndTime: '2028-06-19',
    projectCode: 'PRJ-2026-HF-002',
    accountingObject: '项目成本',
    signTime: '2026-04-25',
    supplierCode: 'SUP-006',
    supplierName: '合肥讯飞软件技术有限公司'
  }
]

interface ExpenseProjectInfo {
  id: string
  name: string
  code: string
  globalCode: string
  type: string
  signMode: string
  customerManager: string
  solutionManager: string
}

interface ExpenseContractInfo {
  id: string
  code: string
  name: string
  type: string
  amountWithTax: string
  amountWithoutTax: string
  groupCustomerName: string
  groupCustomerCode: string
  status: string
  statusKey: string
  performanceStartTime: string
  performanceEndTime: string
  projectCode: string
  accountingObject: string
  signTime: string
  supplierCode: string
  supplierName: string
}

// ============================================================
// 支付明细信息 mock 数据（复制自发起预付款页面，独立维护）
// ============================================================
// 收款账号 mock 数据（选择收款账号后自动带出开户行、收款方名称、联行号）
interface PayeeAccountOption {
  account: string
  bankName: string
  payeeName: string
  bankCode: string
}

const mockPayeeAccountList: PayeeAccountOption[] = [
  {
    account: '6222020200001234567',
    bankName: '中国工商银行合肥市分行营业部',
    payeeName: '科大讯飞信息科技有限公司',
    bankCode: '102361000123'
  },
  {
    account: '6217002020012345678',
    bankName: '中国建设银行合肥政务区支行',
    payeeName: '华为软件技术有限公司',
    bankCode: '105361000456'
  },
  {
    account: '6212262020012345678',
    bankName: '中国银行合肥长江路支行',
    payeeName: '中兴通讯股份有限公司',
    bankCode: '104361000789'
  }
]

interface PaymentDetailRow {
  id: string
  expenseDetailId: string
  businessCategory: string
  businessSubCategory: string
  businessActivity: string
  paymentType: string
  taxRate: string
  currentReportAmount: string
  currentPaymentAmount: string
  currentWriteoffAmount: string
  paymentAccount: string
  payeeName: string
  bankCode: string
}

const mockPaymentDetailRows: PaymentDetailRow[] = [
  {
    id: 'pay-1',
    expenseDetailId: 'exp-pd-1',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    paymentType: '一次性付款',
    taxRate: '6%',
    currentReportAmount: '16,666.67',
    currentPaymentAmount: '16,666.67',
    currentWriteoffAmount: '0.00',
    paymentAccount: '6222020200001234567',
    payeeName: '科大讯飞信息科技有限公司',
    bankCode: '102361000123'
  },
  {
    id: 'pay-2',
    expenseDetailId: 'exp-pd-2',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    paymentType: '一次性付款',
    taxRate: '6%',
    currentReportAmount: '10,000.00',
    currentPaymentAmount: '10,000.00',
    currentWriteoffAmount: '0.00',
    paymentAccount: '6217002020012345678',
    payeeName: '华为软件技术有限公司',
    bankCode: '105361000456'
  },
  {
    id: 'pay-3',
    expenseDetailId: 'exp-pd-3',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    paymentType: '一次性付款',
    taxRate: '6%',
    currentReportAmount: '15,000.00',
    currentPaymentAmount: '15,000.00',
    currentWriteoffAmount: '0.00',
    paymentAccount: '6222020200001234567',
    payeeName: '科大讯飞信息科技有限公司',
    bankCode: '102361000123'
  },
  {
    id: 'pay-4',
    expenseDetailId: 'exp-pd-4',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '商品销售',
    paymentType: '一次性付款',
    taxRate: '13%',
    currentReportAmount: '60,000.00',
    currentPaymentAmount: '60,000.00',
    currentWriteoffAmount: '0.00',
    paymentAccount: '6217002020012345678',
    payeeName: '华为软件技术有限公司',
    bankCode: '105361000456'
  },
  {
    id: 'pay-5',
    expenseDetailId: 'exp-pd-5',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '软件开发',
    paymentType: '一次性付款',
    taxRate: '6%',
    currentReportAmount: '250,000.00',
    currentPaymentAmount: '250,000.00',
    currentWriteoffAmount: '0.00',
    paymentAccount: '6212262020012345678',
    payeeName: '中兴通讯股份有限公司',
    bankCode: '104361000789'
  }
]

// ============================================================
// 业务大类选择弹框 mock 数据（业务大类编码/名称、业务小类编码/名称、业务活动编码/名称）
// ============================================================
interface BusinessCategoryOption {
  id: string
  bizCategoryCode: string
  bizCategoryName: string
  bizSubCategoryCode: string
  bizSubCategoryName: string
  bizActivityCode: string
  bizActivityName: string
  taxRate: string
}

const mockBusinessCategoryList: BusinessCategoryOption[] = [
  { id: 'bc-1', bizCategoryCode: 'DK001', bizCategoryName: 'ICT项目成本', bizSubCategoryCode: 'DK00101', bizSubCategoryName: '硬件设备', bizActivityCode: 'HD001', bizActivityName: '设备采购', taxRate: '13%' },
  { id: 'bc-2', bizCategoryCode: 'DK001', bizCategoryName: 'ICT项目成本', bizSubCategoryCode: 'DK00102', bizSubCategoryName: '技术服务', bizActivityCode: 'JS001', bizActivityName: '系统集成', taxRate: '6%' },
  { id: 'bc-3', bizCategoryCode: 'DK001', bizCategoryName: 'ICT项目成本', bizSubCategoryCode: 'DK00102', bizSubCategoryName: '技术服务', bizActivityCode: 'JS002', bizActivityName: '软件开发', taxRate: '6%' },
  { id: 'bc-4', bizCategoryCode: 'DK001', bizCategoryName: 'ICT项目成本', bizSubCategoryCode: 'DK00102', bizSubCategoryName: '技术服务', bizActivityCode: 'JS003', bizActivityName: '运维服务', taxRate: '6%' },
  { id: 'bc-5', bizCategoryCode: 'DK001', bizCategoryName: 'ICT项目成本', bizSubCategoryCode: 'DK00101', bizSubCategoryName: '硬件设备', bizActivityCode: 'HD002', bizActivityName: '商品销售', taxRate: '13%' }
]

// ============================================================
// 通用组件
// ============================================================
// 区块标题（复制自CT产品订购工单发起页面）
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

// 字段行（复制自CT产品订购工单发起页面）
function FieldRow({
  label,
  required,
  error,
  colSpan,
  fullWidth,
  children
}: {
  label: string
  required?: boolean
  error?: string
  colSpan?: 1 | 2
  fullWidth?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <div className="flex items-start gap-3 min-h-[36px]">
        <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
          {required && <span className="text-red-500 mr-0.5">*</span>}
          {label}
        </label>
        <div className={clsx('flex-1 min-w-0', !fullWidth && 'max-w-md')}>
          {children}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}

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
// 主页面
// ============================================================
export default function CostPrepaymentBillSubmit({ onNavigate, readOnly = false, id }: CostPrepaymentBillSubmitProps) {
  // ========== 报账单信息状态 ==========
  const [billType] = useState('成本费用批量预付款报账单')
  const [billTypeError, setBillTypeError] = useState('')
  const [reimburser] = useState('张三')
  const [reimburseDept] = useState('政企客户部')
  const [costCenter] = useState('CC001-政企客户部')
  const [summary, setSummary] = useState('')
  const [remark, setRemark] = useState('')

  // ========== 合同信息状态（复制自发起预付款页面，独立维护） ==========
  const [expenseProjectExpanded, setExpenseProjectExpanded] = useState(true)
  const [expenseProject, setExpenseProject] = useState<ExpenseProjectInfo | null>(expenseProjectList[0])
  const [expenseSelectedContractId, setExpenseSelectedContractId] = useState<string>('ec1')
  const [expensePaymentMethod, setExpensePaymentMethod] = useState('')

  // 根据项目筛选合同
  const expenseProjectContracts = useMemo(() => {
    if (!expenseProject) return []
    return expenseContractList.filter(c => c.projectCode === expenseProject.code)
  }, [expenseProject])

  // ========== 支付明细数据 ==========
  const [paymentDetailRows, setPaymentDetailRows] = useState(mockPaymentDetailRows)
  // 删除支付明细确认弹框状态
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteTargetRow, setDeleteTargetRow] = useState<PaymentDetailRow | null>(null)

  // ========== 支付明细编辑弹框状态（复制自发起预付款页面） ==========
  const [paymentEditModalVisible, setPaymentEditModalVisible] = useState(false)
  const [paymentEditMode, setPaymentEditMode] = useState<'add' | 'edit'>('edit')
  const [paymentEditRow, setPaymentEditRow] = useState<PaymentDetailRow | null>(null)
  const [paymentEditHasInvoice, setPaymentEditHasInvoice] = useState<'是' | '否'>('否')
  const [paymentEditTaxRate, setPaymentEditTaxRate] = useState('')
  const [paymentAddBusinessId, setPaymentAddBusinessId] = useState<string>('')
  const [paymentAddReportAmount, setPaymentAddReportAmount] = useState('')
  const [paymentEditReportAmount, setPaymentEditReportAmount] = useState('')
  const [paymentEditPayeeName, setPaymentEditPayeeName] = useState('')
  const [paymentEditPayeeAccount, setPaymentEditPayeeAccount] = useState('')
  const [paymentEditBankName, setPaymentEditBankName] = useState('')
  const [paymentEditBankCode, setPaymentEditBankCode] = useState('')
  // 支付明细弹框：支付类型 / 待摊信息
  const [paymentEditType, setPaymentEditType] = useState('正常支付')
  const [paymentEditNeedAmortization, setPaymentEditNeedAmortization] = useState<'是' | '否'>('否')
  const [paymentEditAmortizationStartDate, setPaymentEditAmortizationStartDate] = useState('')
  const [paymentEditAmortizationEndDate, setPaymentEditAmortizationEndDate] = useState('')
  const [paymentEditAmortizationMonths, setPaymentEditAmortizationMonths] = useState('')

  // 新增支付明细：选中的业务类别
  const paymentAddBusiness = useMemo(() => {
    return mockBusinessCategoryList.find(b => b.id === paymentAddBusinessId) || null
  }, [paymentAddBusinessId])

  // 支付明细：打开编辑弹框
  const handlePaymentEdit = (row: PaymentDetailRow) => {
    setPaymentEditMode('edit')
    setPaymentEditRow(row)
    setPaymentEditHasInvoice('否')
    setPaymentEditTaxRate(row.taxRate || '')
    setPaymentEditReportAmount(row.currentReportAmount)
    setPaymentEditPayeeName('')
    setPaymentEditPayeeAccount('')
    setPaymentEditBankName('')
    setPaymentEditBankCode('')
    setPaymentEditType(row.paymentType || '正常支付')
    setPaymentEditNeedAmortization('否')
    setPaymentEditAmortizationStartDate('')
    setPaymentEditAmortizationEndDate('')
    setPaymentEditAmortizationMonths('')
    setPaymentEditModalVisible(true)
  }

  // 支付明细：打开新增弹框（字段与修改弹框一致）
  const handlePaymentAdd = () => {
    setPaymentEditMode('add')
    setPaymentEditRow(null)
    setPaymentAddBusinessId('')
    setPaymentAddReportAmount('')
    setPaymentEditReportAmount('')
    setPaymentEditHasInvoice('否')
    setPaymentEditTaxRate('')
    setPaymentEditPayeeName('')
    setPaymentEditPayeeAccount('')
    setPaymentEditBankName('')
    setPaymentEditBankCode('')
    setPaymentEditType('正常支付')
    setPaymentEditNeedAmortization('否')
    setPaymentEditAmortizationStartDate('')
    setPaymentEditAmortizationEndDate('')
    setPaymentEditAmortizationMonths('')
    setPaymentEditModalVisible(true)
  }

  // 支付明细：选择收款账号后自动带出开户行、收款方名称、联行号（不可修改）
  const handlePayeeAccountChange = (account: string) => {
    setPaymentEditPayeeAccount(account)
    const acc = mockPayeeAccountList.find(a => a.account === account)
    if (acc) {
      setPaymentEditBankName(acc.bankName)
      setPaymentEditPayeeName(acc.payeeName)
      setPaymentEditBankCode(acc.bankCode)
    } else {
      setPaymentEditBankName('')
      setPaymentEditPayeeName('')
      setPaymentEditBankCode('')
    }
  }

  // 支付明细：确认编辑 / 确认新增
  const confirmPaymentEdit = () => {
    if (paymentEditMode === 'add') {
      if (!paymentAddBusinessId) { alert('请选择业务大类'); return }
      if (!paymentAddReportAmount) { alert('请输入本次报账金额'); return }
    } else if (!paymentEditRow) {
      return
    }
    if (!paymentEditTaxRate) { alert('请选择税率'); return }
    if (paymentEditNeedAmortization === '是') {
      if (!paymentEditAmortizationStartDate || !paymentEditAmortizationEndDate) {
        alert('请填写待摊日期')
        return
      }
    }
    // 本次支付金额（含税，元）与本次报账金额（含税，元）一致
    const reportAmount = paymentEditMode === 'add' ? paymentAddReportAmount : paymentEditReportAmount
    if (reportAmount && parseFloat(reportAmount.replace(/,/g, '')) !== 0) {
      if (!paymentEditPayeeAccount) { alert('请选择收款账号'); return }
      if (!paymentEditPayeeName) { alert('请填写收款方名称'); return }
      if (!paymentEditBankCode) { alert('请填写联行号'); return }
    }
    const fmt = (n: number) => n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    if (paymentEditMode === 'add') {
      const biz = paymentAddBusiness
      if (!biz) return
      const newRow: PaymentDetailRow = {
        id: `pay-${Date.now()}`,
        expenseDetailId: '',
        businessCategory: biz.bizCategoryName,
        businessSubCategory: biz.bizSubCategoryName,
        businessActivity: biz.bizActivityName,
        paymentType: paymentEditType,
        taxRate: paymentEditTaxRate,
        currentReportAmount: paymentAddReportAmount,
        currentPaymentAmount: fmt(parseFloat(reportAmount || '0')),
        currentWriteoffAmount: '0.00',
        paymentAccount: paymentEditPayeeAccount,
        payeeName: paymentEditPayeeName,
        bankCode: paymentEditBankCode
      }
      setPaymentDetailRows(prev => [...prev, newRow])
    } else if (paymentEditRow) {
      setPaymentDetailRows(prev => prev.map(r => r.id === paymentEditRow.id ? {
        ...r,
        paymentType: paymentEditType,
        taxRate: paymentEditTaxRate,
        currentReportAmount: paymentEditReportAmount,
        currentPaymentAmount: fmt(parseFloat(reportAmount || '0')),
        paymentAccount: paymentEditPayeeAccount,
        payeeName: paymentEditPayeeName,
        bankCode: paymentEditBankCode
      } : r))
    }
    setPaymentEditModalVisible(false)
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

  // ========== 业务大类选择弹框状态 ==========
  const [expenseModalBusinessModalVisible, setExpenseModalBusinessModalVisible] = useState(false)
  const [expenseBizModalSelectedId, setExpenseBizModalSelectedId] = useState<string>('')
  const [expenseBizSearchCategoryCode, setExpenseBizSearchCategoryCode] = useState('')
  const [expenseBizSearchCategoryName, setExpenseBizSearchCategoryName] = useState('')
  const [expenseBizSearchSubCategoryCode, setExpenseBizSearchSubCategoryCode] = useState('')
  const [expenseBizSearchSubCategoryName, setExpenseBizSearchSubCategoryName] = useState('')
  const [expenseBizSearchActivityCode, setExpenseBizSearchActivityCode] = useState('')
  const [expenseBizSearchActivityName, setExpenseBizSearchActivityName] = useState('')
  // 业务大类弹框：已提交查询条件
  const [expenseBizSubmittedFilter, setExpenseBizSubmittedFilter] = useState({
    categoryCode: '',
    categoryName: '',
    subCategoryCode: '',
    subCategoryName: '',
    activityCode: '',
    activityName: ''
  })

  // 业务类别弹框：过滤（按已提交查询条件）
  const expenseBizFilteredList = useMemo(() => {
    return mockBusinessCategoryList.filter(b =>
      (!expenseBizSubmittedFilter.categoryCode || b.bizCategoryCode.includes(expenseBizSubmittedFilter.categoryCode)) &&
      (!expenseBizSubmittedFilter.categoryName || b.bizCategoryName.includes(expenseBizSubmittedFilter.categoryName)) &&
      (!expenseBizSubmittedFilter.subCategoryCode || b.bizSubCategoryCode.includes(expenseBizSubmittedFilter.subCategoryCode)) &&
      (!expenseBizSubmittedFilter.subCategoryName || b.bizSubCategoryName.includes(expenseBizSubmittedFilter.subCategoryName)) &&
      (!expenseBizSubmittedFilter.activityCode || b.bizActivityCode.includes(expenseBizSubmittedFilter.activityCode)) &&
      (!expenseBizSubmittedFilter.activityName || b.bizActivityName.includes(expenseBizSubmittedFilter.activityName))
    )
  }, [expenseBizSubmittedFilter])

  // 打开业务大类选择弹框（支付明细新增模式）
  const handleOpenExpenseBizModal = () => {
    setExpenseBizModalSelectedId(paymentAddBusinessId)
    setExpenseBizSearchCategoryCode('')
    setExpenseBizSearchCategoryName('')
    setExpenseBizSearchSubCategoryCode('')
    setExpenseBizSearchSubCategoryName('')
    setExpenseBizSearchActivityCode('')
    setExpenseBizSearchActivityName('')
    setExpenseBizSubmittedFilter({
      categoryCode: '',
      categoryName: '',
      subCategoryCode: '',
      subCategoryName: '',
      activityCode: '',
      activityName: ''
    })
    setExpenseModalBusinessModalVisible(true)
  }

  // 业务大类弹框：查询
  const handleExpenseBizSearch = () => {
    setExpenseBizSubmittedFilter({
      categoryCode: expenseBizSearchCategoryCode,
      categoryName: expenseBizSearchCategoryName,
      subCategoryCode: expenseBizSearchSubCategoryCode,
      subCategoryName: expenseBizSearchSubCategoryName,
      activityCode: expenseBizSearchActivityCode,
      activityName: expenseBizSearchActivityName
    })
  }

  // 业务大类弹框：重置
  const handleExpenseBizReset = () => {
    setExpenseBizSearchCategoryCode('')
    setExpenseBizSearchCategoryName('')
    setExpenseBizSearchSubCategoryCode('')
    setExpenseBizSearchSubCategoryName('')
    setExpenseBizSearchActivityCode('')
    setExpenseBizSearchActivityName('')
    setExpenseBizSubmittedFilter({
      categoryCode: '',
      categoryName: '',
      subCategoryCode: '',
      subCategoryName: '',
      activityCode: '',
      activityName: ''
    })
  }

  // 确认选择业务大类（写入支付明细新增弹框）
  const handleConfirmExpenseBizModal = () => {
    if (!expenseBizModalSelectedId) {
      alert('请选择业务大类')
      return
    }
    setPaymentAddBusinessId(expenseBizModalSelectedId)
    setExpenseModalBusinessModalVisible(false)
  }

  // 报账总额 = 支付明细本次报账金额合计
  const totalProvision = paymentDetailRows.reduce((s, r) => s + parseFloat(r.currentReportAmount.replace(/,/g, '')), 0)

  // 支付总额 = 支付明细本次支付金额合计
  const totalPayment = paymentDetailRows.reduce((s, r) => s + parseFloat(r.currentPaymentAmount.replace(/,/g, '')), 0)

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

  // ========== 审批信息状态 ==========
  const [approvalResult, setApprovalResult] = useState<'approved' | 'rejected'>('approved')
  const [approvalComment, setApprovalComment] = useState('')

  // 流程轨迹模块 - 默认折叠
  const [trailExpanded, setTrailExpanded] = useState(false)

  // ========== 回款证明信息数据（可编辑） ==========
  const [receiptProofRows, setReceiptProofRows] = useState<ReceiptProofRow[]>(mockReceiptProofRows)

  // 修改后向已付款金额-人工填写
  const handlePaidAmountManualChange = (rowId: string, value: string) => {
    setReceiptProofRows(prev => prev.map(r =>
      r.id === rowId ? { ...r, paidAmountManual: value } : r
    ))
  }

  // ========== 回款证明弹框状态 ==========
  const [proofModalVisible, setProofModalVisible] = useState(false)
  const [proofModalRow, setProofModalRow] = useState<ReceiptProofRow | null>(null)

  // 打开回款证明弹框
  const handleOpenProofModal = (row: ReceiptProofRow) => {
    setProofModalRow(row)
    setProofModalVisible(true)
  }

  const handleBack = () => {
    onNavigate?.('/dashboard')
  }

  const handleCancel = () => {
    onNavigate?.('/dashboard')
  }

  const handleSubmit = () => {
    if (!billType) {
      setBillTypeError('请选择报账单类型')
      return
    }
    if (!expenseProject) {
      alert('请选择项目')
      return
    }
    if (!expenseSelectedContractId) {
      alert('请选择合同编码')
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
    if (!approvalComment.trim()) {
      alert('请填写审批意见')
      return
    }
    if (!flowApprover) {
      setFlowApproverError('请选择下一步处理人')
      return
    }
    alert('提交成功')
    onNavigate?.('/dashboard')
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
            <h2 className="text-sm font-semibold text-gray-800">{readOnly ? '预付款报账单详情' : '预付款报账单提交'}</h2>
          </div>
        </div>

        {/* 1. 报账单信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">报账单信息</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">报账单类型</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {billType || '-'}
                  </div>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">报账人</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {reimburser}
                  </div>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">报账部门</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {reimburseDept}
                  </div>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">成本中心</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {costCenter}
                  </div>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3 whitespace-nowrap">报账总额（含税，元）</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-800 font-semibold">
                    {totalProvision.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </div>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3 whitespace-nowrap">支付总额（含税，元）</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-800 font-semibold">
                    {totalPayment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </div>
                </div>
              </div>

              {/* 报账单摘要：独占一行 */}
              <div className="col-span-3 flex items-start min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pt-2 pr-3">
                  {!readOnly && <span className="text-red-500 mr-0.5">*</span>}
                  报账单摘要
                </label>
                <div className="flex-1 min-w-0">
                  {readOnly ? (
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 min-h-[80px] whitespace-pre-wrap">
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

              {/* 备注：独占一行，非必填 */}
              <div className="col-span-3 flex items-start min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pt-2 pr-3">备注</label>
                <div className="flex-1 min-w-0">
                  {readOnly ? (
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 min-h-[80px] whitespace-pre-wrap">
                      {remark || '-'}
                    </div>
                  ) : (
                    <textarea
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      placeholder="请填写与合同付款不一致原因"
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 合同信息 - 复制自发起预付款页面，独立维护 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <SectionTitle sectionKey="expense-project" expanded={expenseProjectExpanded} onToggle={() => setExpenseProjectExpanded(!expenseProjectExpanded)}>合同信息</SectionTitle>
          {expenseProjectExpanded && (
            <>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
              <FieldRow label="项目名称" required fullWidth>
                <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                  {expenseProject?.name || '-'}
                </div>
              </FieldRow>
              <FieldRow label="合同编码" required fullWidth>
                <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                  {expenseProjectContracts.find(c => c.id === expenseSelectedContractId)?.code || '-'}
                </div>
              </FieldRow>
              <FieldRow label="供应商编码" required fullWidth>
                <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                  {expenseProjectContracts.find(c => c.id === expenseSelectedContractId)?.supplierCode || ''}
                </div>
              </FieldRow>
              <FieldRow label="供应商名称" required fullWidth>
                <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                  {expenseProjectContracts.find(c => c.id === expenseSelectedContractId)?.supplierName || ''}
                </div>
              </FieldRow>
              <FieldRow label="合同约定付款方式" required colSpan={2} fullWidth>
                <div className="relative w-full">
                  <textarea
                    value={expensePaymentMethod}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) setExpensePaymentMethod(e.target.value)
                    }}
                    placeholder="请输入合同约定付款方式"
                    rows={3}
                    disabled={readOnly}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-y disabled:bg-gray-50 disabled:text-gray-600 disabled:cursor-not-allowed"
                  />
                  <div className="text-right text-xs text-gray-400 mt-0.5">
                    {expensePaymentMethod.length}/500
                  </div>
                </div>
              </FieldRow>
            </div>
            </>
          )}
        </div>

        {/* 3. 支付明细信息（复制自发起预付款页面，独立维护） */}
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
                onClick={handlePaymentAdd}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                新增
              </button>
            )}
          </div>
          <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-2">
            <span className="shrink-0">⚠</span>
            <span>温馨提示：网格小微DICT项目支付金额大于等于5万或普通DICT项目支付金额大于 0 时，需由客户经理提供回款证明材料</span>
          </div>
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务大类</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务小类</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务活动</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">本次报账金额（含税，元）</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">本次支付金额（含税，元）</th>
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
                    <td colSpan={readOnly ? 9 : 10} className="px-3 py-8 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  paymentDetailRows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.businessCategory}</td>
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.businessSubCategory}</td>
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.businessActivity}</td>
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.taxRate}</td>
                      <td className="px-3 py-2.5 text-gray-800 text-right whitespace-nowrap">{row.currentReportAmount}</td>
                      <td className="px-3 py-2.5 text-gray-800 text-right whitespace-nowrap">{row.currentPaymentAmount}</td>
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.paymentAccount}</td>
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.payeeName}</td>
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.bankCode}</td>
                      {!readOnly && (
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handlePaymentEdit(row)}
                              className="inline-flex items-center justify-center p-1 text-[#1677FF] hover:bg-blue-50 rounded transition-colors"
                              title="修改"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(row)}
                              className="inline-flex items-center justify-center p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. 回款证明信息（复制自预付款详情页面） */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">回款证明信息</h3>
            <span className="text-xs text-gray-400">【{receiptProofRows.length}】</span>
          </div>
          <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-2">
            <span className="shrink-0">⚠</span>
            <span>温馨提示：请根据项目实际付款情况填写后向已付款金额，若本次支付金额+后向已付款金额 &gt; 项目总回款金额即为垫资项目，点击提交将触发项目垫资风控；所有金额都为含税金额，单位为元</span>
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
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        {readOnly ? (
                          <span className="text-gray-800 whitespace-nowrap">{row.paidAmountManual}</span>
                        ) : (
                          <NumberInput
                            value={row.paidAmountManual.replace(/,/g, '')}
                            onChange={(v) => handlePaidAmountManualChange(row.id, v)}
                            decimals={2}
                            placeholder="请输入"
                          />
                        )}
                      </td>
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

        {/* 5. 审批信息（复制自项目类费用报账单提交页面） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">审批信息</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                  <span className="text-red-500 mr-0.5">*</span>
                  审批结果
                </label>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setApprovalResult('approved')}
                      className={`px-4 py-2 text-sm rounded-md border-2 transition-all ${
                        approvalResult === 'approved'
                          ? 'bg-green-50 border-green-400 text-green-600 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50/50'
                      }`}
                    >
                      通过
                    </button>
                    <button
                      type="button"
                      onClick={() => setApprovalResult('rejected')}
                      className={`px-4 py-2 text-sm rounded-md border-2 transition-all ${
                        approvalResult === 'rejected'
                          ? 'bg-red-50 border-red-400 text-red-600 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50/50'
                      }`}
                    >
                      驳回
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3 pt-2">
                  <span className="text-red-500 mr-0.5">*</span>
                  审批意见
                </label>
                <div className="flex-1 min-w-0">
                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    placeholder="请输入审批意见"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. 流程信息（复制自项目类费用报账单提交页面） */}
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
                      {approvalResult === 'approved' ? '预付款报账单审批' : '回款证明提供'}
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
                        {approvalResult === 'approved' ? '科室经理' : '客户经理'}
                      </span>
                      <select
                        value={flowApprover}
                        onChange={(e) => { setFlowApprover(e.target.value); setFlowApproverError('') }}
                        className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="">请选择下一步处理人</option>
                        {customerManagerOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
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

        {/* 7. 流程轨迹 - 默认折叠（复制自项目类费用报账单提交页面） */}
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

      {/* ========== 业务大类选择弹框 ========== */}
      {expenseModalBusinessModalVisible && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40" onClick={() => setExpenseModalBusinessModalVisible(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[1100px] max-w-[95vw] overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">选择业务大类</h3>
              <button
                type="button"
                onClick={() => setExpenseModalBusinessModalVisible(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 查询条件 */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务大类编码</label>
                  <input
                    type="text"
                    value={expenseBizSearchCategoryCode}
                    onChange={(e) => setExpenseBizSearchCategoryCode(e.target.value)}
                    placeholder="请输入业务大类编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务大类名称</label>
                  <input
                    type="text"
                    value={expenseBizSearchCategoryName}
                    onChange={(e) => setExpenseBizSearchCategoryName(e.target.value)}
                    placeholder="请输入业务大类名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务小类编码</label>
                  <input
                    type="text"
                    value={expenseBizSearchSubCategoryCode}
                    onChange={(e) => setExpenseBizSearchSubCategoryCode(e.target.value)}
                    placeholder="请输入业务小类编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务小类名称</label>
                  <input
                    type="text"
                    value={expenseBizSearchSubCategoryName}
                    onChange={(e) => setExpenseBizSearchSubCategoryName(e.target.value)}
                    placeholder="请输入业务小类名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务活动编码</label>
                  <input
                    type="text"
                    value={expenseBizSearchActivityCode}
                    onChange={(e) => setExpenseBizSearchActivityCode(e.target.value)}
                    placeholder="请输入业务活动编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务活动名称</label>
                  <input
                    type="text"
                    value={expenseBizSearchActivityName}
                    onChange={(e) => setExpenseBizSearchActivityName(e.target.value)}
                    placeholder="请输入业务活动名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleExpenseBizReset}
                  className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>
                <button
                  type="button"
                  onClick={handleExpenseBizSearch}
                  className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  查询
                </button>
              </div>
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-full overflow-x-auto">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="w-10 px-4 py-2.5 text-left">
                        <span className="sr-only">选择</span>
                      </th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务大类编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务大类名称</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务小类编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务小类名称</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务活动编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务活动名称</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expenseBizFilteredList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      expenseBizFilteredList.map(item => (
                        <tr
                          key={item.id}
                          className={clsx(
                            'cursor-pointer hover:bg-blue-50/50 transition-colors',
                            expenseBizModalSelectedId === item.id && 'bg-blue-50'
                          )}
                          onClick={() => setExpenseBizModalSelectedId(item.id)}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="radio"
                              name="expense-biz-modal"
                              checked={expenseBizModalSelectedId === item.id}
                              onChange={() => setExpenseBizModalSelectedId(item.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </td>
                          <td className="px-3 py-3 text-gray-800">{item.bizCategoryCode}</td>
                          <td className="px-3 py-3 text-gray-800">{item.bizCategoryName}</td>
                          <td className="px-3 py-3 text-gray-600">{item.bizSubCategoryCode}</td>
                          <td className="px-3 py-3 text-gray-600">{item.bizSubCategoryName}</td>
                          <td className="px-3 py-3 text-gray-600">{item.bizActivityCode}</td>
                          <td className="px-3 py-3 text-gray-600">{item.bizActivityName}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setExpenseModalBusinessModalVisible(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmExpenseBizModal}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 支付明细 - 新增 / 编辑弹框（复制自发起预付款页面） ========== */}
      {paymentEditModalVisible && (paymentEditRow || paymentEditMode === 'add') && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setPaymentEditModalVisible(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[1200px] max-w-[95vw] max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">{paymentEditMode === 'add' ? '新增支付明细' : '修改支付明细'}</h3>
              <button
                type="button"
                onClick={() => setPaymentEditModalVisible(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {/* 业务大类 - 新增模式可点击选择，编辑模式只读 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>业务大类
                  </label>
                  <div className="flex-1 min-w-0">
                    {paymentEditMode === 'add' ? (
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={paymentAddBusiness?.bizCategoryName || ''}
                          onClick={() => handleOpenExpenseBizModal()}
                          placeholder="请选择业务大类"
                          className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                        />
                        <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                        {paymentEditRow?.businessCategory}
                      </div>
                    )}
                  </div>
                </div>
                {/* 业务小类 - 只读 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>业务小类
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {paymentEditMode === 'add' ? (paymentAddBusiness?.bizSubCategoryName || '') : (paymentEditRow?.businessSubCategory || '')}
                    </div>
                  </div>
                </div>
                {/* 业务活动 - 只读 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>业务活动
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {paymentEditMode === 'add' ? (paymentAddBusiness?.bizActivityName || '') : (paymentEditRow?.businessActivity || '')}
                    </div>
                  </div>
                </div>
                {/* 支付类型 - 下拉 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>支付类型
                  </label>
                  <div className="flex-1 min-w-0">
                    <select
                      value={paymentEditType}
                      onChange={(e) => setPaymentEditType(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="正常支付">正常支付</option>
                      <option value="代缴代扣">代缴代扣</option>
                      <option value="员工垫支">员工垫支</option>
                    </select>
                  </div>
                </div>
                {/* 本次报账金额（含税，元）- 新增/编辑模式均可输入 */}
                <div className="flex items-start min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3 pt-2 leading-snug">
                    <span className="text-red-500 mr-0.5">*</span>本次报账金额（含税，元）
                  </label>
                  <div className="flex-1 min-w-0">
                    <NumberInput
                      value={paymentEditMode === 'add' ? paymentAddReportAmount : paymentEditReportAmount}
                      onChange={paymentEditMode === 'add' ? setPaymentAddReportAmount : setPaymentEditReportAmount}
                      decimals={2}
                      placeholder="请输入本次报账金额"
                    />
                  </div>
                </div>
                {/* 本次报账金额（不含税，元）- 自动计算，不可编辑 */}
                <div className="flex items-start min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3 pt-2 leading-snug">
                    <span className="text-red-500 mr-0.5">*</span>本次报账金额（不含税，元）
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {(() => {
                        const amt = parseFloat((paymentEditMode === 'add' ? paymentAddReportAmount : paymentEditReportAmount).replace(/,/g, ''))
                        const rateStr = paymentEditTaxRate
                        if (!amt || !rateStr) return ''
                        const rate = parseFloat(rateStr.replace('%', '')) / 100
                        return (amt / (1 + rate)).toFixed(2)
                      })()}
                    </div>
                  </div>
                </div>
                {/* 税率 - 下拉 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>税率
                  </label>
                  <div className="flex-1 min-w-0">
                    <select
                      value={paymentEditTaxRate}
                      onChange={(e) => setPaymentEditTaxRate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="">请选择税率</option>
                      {['6%', '9%', '13%'].map(rate => (
                        <option key={rate} value={rate}>{rate}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* 税额 - 自动计算，不可编辑 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>税额
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {(() => {
                        const amt = parseFloat((paymentEditMode === 'add' ? paymentAddReportAmount : paymentEditReportAmount).replace(/,/g, ''))
                        const rateStr = paymentEditTaxRate
                        if (!amt || !rateStr) return ''
                        const rate = parseFloat(rateStr.replace('%', '')) / 100
                        const noTax = amt / (1 + rate)
                        return (amt - noTax).toFixed(2)
                      })()}
                    </div>
                  </div>
                </div>
                {/* 是否取得发票 - 左右是/否，默认否 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>是否取得发票
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <label className={`inline-flex items-center gap-1 cursor-pointer px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        paymentEditHasInvoice === '是'
                          ? 'bg-[#1677FF] text-white border-[#1677FF]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}>
                        <input
                          type="radio"
                          name="payment-edit-has-invoice"
                          value="是"
                          checked={paymentEditHasInvoice === '是'}
                          onChange={() => setPaymentEditHasInvoice('是')}
                          className="sr-only"
                        />
                        是
                      </label>
                      <label className={`inline-flex items-center gap-1 cursor-pointer px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        paymentEditHasInvoice === '否'
                          ? 'bg-[#1677FF] text-white border-[#1677FF]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}>
                        <input
                          type="radio"
                          name="payment-edit-has-invoice"
                          value="否"
                          checked={paymentEditHasInvoice === '否'}
                          onChange={() => {
                            setPaymentEditHasInvoice('否')
                            setPaymentEditTaxRate('')
                          }}
                          className="sr-only"
                        />
                        否
                      </label>
                    </div>
                  </div>
                </div>
                {/* 是否需要待摊 - 左右是/否，默认否 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>是否需要待摊
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <label className={`inline-flex items-center gap-1 cursor-pointer px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        paymentEditNeedAmortization === '是'
                          ? 'bg-[#1677FF] text-white border-[#1677FF]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}>
                        <input
                          type="radio"
                          name="payment-edit-amortization"
                          value="是"
                          checked={paymentEditNeedAmortization === '是'}
                          onChange={() => setPaymentEditNeedAmortization('是')}
                          className="sr-only"
                        />
                        是
                      </label>
                      <label className={`inline-flex items-center gap-1 cursor-pointer px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        paymentEditNeedAmortization === '否'
                          ? 'bg-[#1677FF] text-white border-[#1677FF]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                      }`}>
                        <input
                          type="radio"
                          name="payment-edit-amortization"
                          value="否"
                          checked={paymentEditNeedAmortization === '否'}
                          onChange={() => setPaymentEditNeedAmortization('否')}
                          className="sr-only"
                        />
                        否
                      </label>
                    </div>
                  </div>
                </div>
                {/* 待摊日期 - 仅"是"时展示，必填 */}
                {paymentEditNeedAmortization === '是' && (
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>待摊日期
                    </label>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <input
                        type="date"
                        value={paymentEditAmortizationStartDate}
                        onChange={(e) => setPaymentEditAmortizationStartDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      />
                      <span className="text-gray-400 shrink-0">～</span>
                      <input
                        type="date"
                        value={paymentEditAmortizationEndDate}
                        onChange={(e) => setPaymentEditAmortizationEndDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                )}
                {/* 摊销月数 - 仅"是"时展示，非必填 */}
                {paymentEditNeedAmortization === '是' && (
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">摊销月数</label>
                    <div className="flex-1 min-w-0">
                      <input
                        type="number"
                        value={paymentEditAmortizationMonths}
                        onChange={(e) => setPaymentEditAmortizationMonths(e.target.value)}
                        placeholder="请输入摊销月数"
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                )}
                {/* 本次支付金额（含税，元）- 与本次报账金额（含税，元）一致，不可修改 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>本次支付金额（含税，元）
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-right">
                      {paymentEditMode === 'add' ? paymentAddReportAmount : paymentEditReportAmount}
                    </div>
                  </div>
                </div>
                {/* 收款账号 - 下拉选择 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>收款账号
                  </label>
                  <div className="flex-1 min-w-0">
                    <select
                      value={paymentEditPayeeAccount}
                      onChange={(e) => handlePayeeAccountChange(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="">请选择收款账号</option>
                      {mockPayeeAccountList.map(acc => (
                        <option key={acc.account} value={acc.account}>{acc.account}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {/* 开户行 - 自动带出，不可修改 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>开户行
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                      {paymentEditBankName || <span className="text-gray-400">选择收款账号后自动带出</span>}
                    </div>
                  </div>
                </div>
                {/* 收款方名称 - 自动带出，不可修改 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>收款方名称
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                      {paymentEditPayeeName || <span className="text-gray-400">选择收款账号后自动带出</span>}
                    </div>
                  </div>
                </div>
                {/* 联行号 - 自动带出，不可修改 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>联行号
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                      {paymentEditBankCode || <span className="text-gray-400">选择收款账号后自动带出</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex justify-center gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setPaymentEditModalVisible(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmPaymentEdit}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
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

      {/* ========== 回款证明弹框 ========== */}
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
