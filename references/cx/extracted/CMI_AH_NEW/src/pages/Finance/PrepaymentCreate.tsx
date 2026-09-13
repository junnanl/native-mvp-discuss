import { useState, useMemo, useEffect } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, Search, ChevronDown, ChevronRight, RotateCcw, Check, Plus, X, Pencil, Trash2, Save } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import PersonPicker from '@/components/PersonPicker'

interface PrepaymentCreateProps {
  onNavigate?: (path: string) => void
  readOnly?: boolean
  id?: string
}

// ============================================================
// 枚举定义（与合同解析IT成本新增保持一致）
// ============================================================
const expenseContentITOptions = [
  'ICT安装服务',
  'ICT集成服务',
  '软件开发',
  '硬件采购',
  '运维服务'
]

const budgetTypeOptions = ['预算内', '预算外', '专项预算', '资本支出']

const contractStages = ['开工', '进场', '到货', '初验', '终验']

const itTariffOptions = [
  '[1372]业务集成费',
  '[849]ICT维保服务费',
  '[1205]系统集成服务',
  '[956]软件开发服务'
]

const taxRateOptions = ['6%', '9%', '13%']

const billTypeOptions = [
  '成本费用批量预付款报账单'
]

// ============================================================
// 发起报账（有合同）独立 mock 数据
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

// ============================================================
// 类型定义
// ============================================================
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

interface ExpensePlanRow {
  id: string
  contractCode: string
  productName: string
  expenseType: string
  budgetCode: string
  reimburseStartDate: string
  plannedExpenseWithTax: string
  plannedExpenseNoTax: string
  penaltyAmount: string
  correspondingTariff: string
  contractStage: string
  taxRate: string
  checked: boolean
}

interface BudgetOption {
  code: string
  name: string
  contractId: string
}

interface TeamMember {
  name: string
  dept: string
  role: string
}

// ============================================================
// Mock 数据
// ============================================================
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

const mockBudgetOptions: BudgetOption[] = [
  { code: 'BUD-2026-001', name: '年度运维预算', contractId: 'ct-1' },
  { code: 'BUD-2026-002', name: '设备采购预算', contractId: 'ct-1' },
  { code: 'BUD-2026-003', name: '软件开发预算', contractId: 'ct-1' },
  { code: 'BUD-2026-004', name: '云服务预算', contractId: 'ct-2' },
  { code: 'BUD-2026-005', name: '专线费用预算', contractId: 'ct-2' },
  { code: 'BUD-2026-006', name: '运维服务预算', contractId: 'ct-4' },
  { code: 'BUD-2026-007', name: '系统集成预算', contractId: 'ct-5' },
  { code: 'BUD-2026-008', name: '硬件采购预算', contractId: 'ct-5' }
]

const mockTeamMembers: TeamMember[] = [
  { name: '张三', dept: '政企客户部', role: '项目经理' },
  { name: '李四', dept: '技术支持部', role: '技术负责人' },
  { name: '王五', dept: '政企客户部', role: '客户经理' },
  { name: '赵六', dept: '运维服务部', role: '运维工程师' },
  { name: '钱七', dept: '解决方案部', role: '方案经理' },
  { name: '孙八', dept: '财务部', role: '财务对接人' }
]

const mockExpensePlans: ExpensePlanRow[] = [
  {
    id: 'ep-1',
    contractCode: 'CTR20260001',
    productName: '硬件采购',
    expenseType: '硬件采购',
    budgetCode: 'BUD-2026-002',
    reimburseStartDate: '2026-07-01',
    plannedExpenseWithTax: '1,130,000.00',
    plannedExpenseNoTax: '1,000,000.00',
    penaltyAmount: '',
    correspondingTariff: '[956]软件开发服务',
    contractStage: '到货',
    taxRate: '13%',
    checked: false
  },
  {
    id: 'ep-2',
    contractCode: 'CTR20260001',
    productName: '软件开发',
    expenseType: '软件开发',
    budgetCode: 'BUD-2026-003',
    reimburseStartDate: '2026-08-01',
    plannedExpenseWithTax: '530,000.00',
    plannedExpenseNoTax: '500,000.00',
    penaltyAmount: '',
    correspondingTariff: '[1205]系统集成服务',
    contractStage: '初验',
    taxRate: '6%',
    checked: false
  },
  {
    id: 'ep-3',
    contractCode: 'CTR20260002',
    productName: 'ICT集成服务',
    expenseType: 'ICT集成服务',
    budgetCode: 'BUD-2026-004',
    reimburseStartDate: '2026-07-15',
    plannedExpenseWithTax: '848,000.00',
    plannedExpenseNoTax: '800,000.00',
    penaltyAmount: '',
    correspondingTariff: '[1372]业务集成费',
    contractStage: '开工',
    taxRate: '6%',
    checked: false
  },
  {
    id: 'ep-4',
    contractCode: 'CTR20260004',
    productName: '运维服务',
    expenseType: '运维服务',
    budgetCode: 'BUD-2026-006',
    reimburseStartDate: '2026-06-01',
    plannedExpenseWithTax: '318,000.00',
    plannedExpenseNoTax: '300,000.00',
    penaltyAmount: '',
    correspondingTariff: '[849]ICT维保服务费',
    contractStage: '维护',
    taxRate: '6%',
    checked: false
  },
  {
    id: 'ep-5',
    contractCode: 'CTR20260005',
    productName: 'ICT安装服务',
    expenseType: 'ICT安装服务',
    budgetCode: 'BUD-2026-007',
    reimburseStartDate: '2026-05-20',
    plannedExpenseWithTax: '1,060,000.00',
    plannedExpenseNoTax: '1,000,000.00',
    penaltyAmount: '',
    correspondingTariff: '[1205]系统集成服务',
    contractStage: '初验',
    taxRate: '6%',
    checked: false
  }
]

// ============================================================
// 费用明细信息 mock 数据（独立维护）
// ============================================================
const mockExpenseProvisionDetailRows = [
  {
    id: 'exp-pd-1',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800052',
    poolOrderLineNo: '001',
    expensePlanCode: 'ZCJH-010',
    productName: '受托代销往来款',
    taxRate: '6%',
    tariffName: '[1372]受托代销往来款',
    plannedExpense: '200,000',
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
    id: 'exp-pd-2',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800053',
    poolOrderLineNo: '001',
    expensePlanCode: 'ZCJH-011',
    productName: '受托代销手续费',
    taxRate: '6%',
    tariffName: '[849]受托代销手续费',
    plannedExpense: '120,000',
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
    id: 'exp-pd-3',
    netProjectCode: 'AH20260102',
    contractCode: 'HT-2026-0011',
    poolOrderNo: 'APO303489260800054',
    poolOrderLineNo: '002',
    expensePlanCode: 'ZCJH-012',
    productName: '系统集成服务',
    taxRate: '6%',
    tariffName: '[1205]系统集成服务',
    plannedExpense: '360,000',
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
    id: 'exp-pd-4',
    netProjectCode: 'AH20260103',
    contractCode: 'HT-2026-0012',
    poolOrderNo: 'APO303489260800055',
    poolOrderLineNo: '001',
    expensePlanCode: 'ZCJH-013',
    productName: '商品销售成本',
    taxRate: '13%',
    tariffName: '[956]商品销售成本',
    plannedExpense: '90,000',
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
    id: 'exp-pd-5',
    netProjectCode: 'AH20260104',
    contractCode: 'HT-2026-0013',
    poolOrderNo: 'APO303489260800056',
    poolOrderLineNo: '003',
    expensePlanCode: 'ZCJH-014',
    productName: '软件开发服务',
    taxRate: '6%',
    tariffName: '[1206]软件开发服务',
    plannedExpense: '600,000',
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

// ============================================================
// 支付明细信息 mock 数据（与费用明细联动：业务大类/业务小类/业务活动一致，条数保持一致）
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

// 由费用明细行生成对应的支付明细行（联动）
const buildPaymentDetailRow = (expenseRow: typeof mockExpenseProvisionDetailRows[0], id: string): PaymentDetailRow => ({
  id,
  expenseDetailId: expenseRow.id,
  businessCategory: expenseRow.businessCategory,
  businessSubCategory: expenseRow.businessSubCategory,
  businessActivity: expenseRow.businessActivity,
  paymentType: '一次性付款',
  taxRate: expenseRow.taxRate,
  currentReportAmount: expenseRow.currentProvisionAmount,
  currentPaymentAmount: expenseRow.currentProvisionAmount,
  currentWriteoffAmount: '0.00',
  paymentAccount: mockPayeeAccountList[0].account,
  payeeName: mockPayeeAccountList[0].payeeName,
  bankCode: mockPayeeAccountList[0].bankCode
})

// 初始化支付明细条数与费用明细保持一致
const mockPaymentDetailRows: PaymentDetailRow[] = mockExpenseProvisionDetailRows.map((row, idx) =>
  buildPaymentDetailRow(row, `pay-${idx + 1}`)
)

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
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center min-h-[32px]">
      <label className="text-xs text-gray-500 shrink-0 whitespace-nowrap">{label}</label>
      <div className="flex-1 min-w-0 text-sm text-gray-800 truncate ml-2">
        {value || '-'}
      </div>
    </div>
  )
}

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
  decimals = 2,
  disabled = false,
  maxValue
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  decimals?: number
  disabled?: boolean
  maxValue?: string
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    const v = e.target.value
    const regex = decimals > 0
      ? new RegExp(`^\\d*(\\.\\d{0,${decimals}})?$`)
      : /^\d*$/
    if (regex.test(v) || v === '') {
      if (maxValue && v) {
        const numV = parseFloat(v)
        const numMax = parseFloat(maxValue.replace(/,/g, ''))
        if (!isNaN(numV) && !isNaN(numMax) && numV > numMax) {
          return
        }
      }
      onChange(v)
    }
  }

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={
        'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 ' +
        (disabled
          ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
          : 'border-gray-300 bg-white')
      }
    />
  )
}

// ============================================================
// 主页面
// ============================================================
export default function PrepaymentCreate({ onNavigate, readOnly = false, id }: PrepaymentCreateProps) {
  // ========== 发起预付款独立状态：项目信息 ==========
  const [expenseShowProjectModal, setExpenseShowProjectModal] = useState(false)
  const [expenseSearchName, setExpenseSearchName] = useState('')
  const [expenseSearchProvinceCode, setExpenseSearchProvinceCode] = useState('')
  const [expenseSearchGlobalCode, setExpenseSearchGlobalCode] = useState('')
  const [expenseSelectedProjectId, setExpenseSelectedProjectId] = useState<string>('')
  const [expenseProjectExpanded, setExpenseProjectExpanded] = useState(true)
  const [expenseProject, setExpenseProject] = useState<ExpenseProjectInfo | null>(readOnly ? expenseProjectList[0] : null)

  // ========== 发起报账（有合同）独立状态：合同信息 ==========
  const [expenseSelectedContractId, setExpenseSelectedContractId] = useState<string>(readOnly ? 'ec1' : '')
  const [expensePaymentMethod, setExpensePaymentMethod] = useState('')
  const [expenseContract, setExpenseContract] = useState<ExpenseContractInfo | null>(readOnly ? expenseContractList[0] : null)

  // 筛选项目
  const expenseFilteredProjects = useMemo(() => {
    return expenseProjectList.filter(p =>
      (!expenseSearchName.trim() || p.name.includes(expenseSearchName.trim())) &&
      (!expenseSearchProvinceCode.trim() || p.code.includes(expenseSearchProvinceCode.trim())) &&
      (!expenseSearchGlobalCode.trim() || p.globalCode.includes(expenseSearchGlobalCode.trim()))
    )
  }, [expenseSearchName, expenseSearchProvinceCode, expenseSearchGlobalCode])

  // 根据项目筛选合同
  const expenseProjectContracts = useMemo(() => {
    if (!expenseProject) return []
    return expenseContractList.filter(c => c.projectCode === expenseProject.code)
  }, [expenseProject])

  // 打开选择项目弹窗
  const handleOpenExpenseProjectModal = () => {
    if (readOnly) return
    setExpenseSelectedProjectId(expenseProject?.id || '')
    setExpenseSearchName('')
    setExpenseSearchProvinceCode('')
    setExpenseSearchGlobalCode('')
    setExpenseShowProjectModal(true)
  }

  // 确认选择项目
  const handleConfirmExpenseProject = () => {
    if (!expenseSelectedProjectId) {
      alert('请选择一个项目')
      return
    }
    const p = expenseProjectList.find(item => item.id === expenseSelectedProjectId)
    if (p) {
      setExpenseProject(p)
      // 同步原有项目选择（兼容支出计划模块的筛选逻辑）
      setSelectedProject(p.code)
      // 若该项目下只有一个合同，则初始化直接选中
      const contracts = expenseContractList.filter(c => c.projectCode === p.code)
      if (contracts.length === 1) {
        setExpenseContract(contracts[0])
        setExpenseSelectedContractId(contracts[0].id)
        // 同步原有合同选择（兼容支出计划模块的复选框筛选逻辑，且仅保留履行中合同）
        if (contracts[0].statusKey === 'executing') {
          setCheckedContractIds([contracts[0].id])
        } else {
          setCheckedContractIds([])
        }
      } else {
        setExpenseContract(null)
        setExpenseSelectedContractId('')
        setCheckedContractIds([])
      }
    }
    setExpenseShowProjectModal(false)
  }

  // 选择合同（单选）
  const handleSelectExpenseContract = (contractId: string) => {
    const c = expenseContractList.find(item => item.id === contractId)
    if (c) {
      setExpenseSelectedContractId(contractId)
      setExpenseContract(c)
      // 同步原有合同选择（兼容支出计划模块的复选框筛选逻辑，非履行中合同不展示支出计划）
      if (c.statusKey === 'executing') {
        setCheckedContractIds([contractId])
      } else {
        setCheckedContractIds([])
      }
    }
  }

  // 详情模式下预置数据（兼容原有逻辑）
  const [selectedProject, setSelectedProject] = useState(readOnly ? 'PRJ20260001' : '')
  const [checkedContractIds, setCheckedContractIds] = useState<string[]>(readOnly ? ['ct-1', 'ct-2'] : [])
  const [expensePlanList, setExpensePlanList] = useState<ExpensePlanRow[]>(
    readOnly
      ? mockExpensePlans.map(p => ({ ...p, checked: p.id === 'ep-1' || p.id === 'ep-2' }))
      : mockExpensePlans
  )
  const [penaltyFiles, setPenaltyFiles] = useState<string[]>(readOnly ? ['扣款凭证_20260601.pdf'] : [])
  const [reimburser] = useState('张三')
  const [reimburseDept] = useState('政企客户部')
  const [costCenter] = useState('CC001-政企客户部')
  const [billType, setBillType] = useState('成本费用批量预付款报账单')
  const [billTypeError, setBillTypeError] = useState('')
  const [accountingObject, setAccountingObject] = useState(readOnly ? '项目成本' : '')
  const [summary, setSummary] = useState(readOnly ? '2026年6月IDC数据中心项目设备采购及软件开发支出报账' : '')
  const [remark, setRemark] = useState(readOnly ? '本次预付款支付方式与合同约定付款方式不一致，需人工核验。' : '')

  // ========== 费用明细信息状态（数据源，用于支付明细初始化与报账总额计算） ==========
  const [expenseProvisionDetailRows, setExpenseProvisionDetailRows] = useState(mockExpenseProvisionDetailRows)

  // ========== 支付明细信息状态 ==========
  const [paymentDetailRows, setPaymentDetailRows] = useState(mockPaymentDetailRows)
  // 删除支付明细确认弹框状态
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteTargetRow, setDeleteTargetRow] = useState<PaymentDetailRow | null>(null)

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
  // 支付明细编辑弹框状态
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

  const expenseTotalProvision = expenseProvisionDetailRows.reduce((s, r) => s + parseFloat(r.currentProvisionAmount.replace(/,/g, '')), 0)

  // 支付总额（含税）= 支付明细信息中本次支付金额合计
  const expenseTotalPayment = paymentDetailRows.reduce((s, r) => s + parseFloat(r.currentPaymentAmount.replace(/,/g, '')), 0)

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

  // 项目选择后带出的合同数据（兼容原有逻辑）
  const projectContracts = useMemo(() => {
    if (!selectedProject) return []
    return mockContracts
  }, [selectedProject])

  // 过滤后的支出计划（按勾选的合同）
  const filteredExpensePlans = useMemo(() => {
    if (checkedContractIds.length === 0) return []
    const checkedCodes = projectContracts
      .filter(c => checkedContractIds.includes(c.id))
      .map(c => c.code)
    return expensePlanList.filter(ep => checkedCodes.includes(ep.contractCode))
  }, [checkedContractIds, expensePlanList, projectContracts])

  // 勾选的支出计划
  const checkedPlans = useMemo(() => {
    return filteredExpensePlans.filter(ep => ep.checked)
  }, [filteredExpensePlans])

  // 合同金额合计（勾选的合同）
  const totalContractAmount = useMemo(() => {
    const total = projectContracts
      .filter(c => checkedContractIds.includes(c.id))
      .reduce((sum, c) => sum + parseFloat(c.amountNoTax.replace(/,/g, '')), 0)
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [checkedContractIds, projectContracts])

  // 已报账金额（mock 数据）
  const totalReimbursedAmount = useMemo(() => {
    const base = parseFloat(totalContractAmount.replace(/,/g, '')) * 0.3
    return base.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [totalContractAmount])

  // 报账总额（含税）= 勾选的支出计划金额合计 - 扣罚金额合计
  const totalReimburseWithTax = useMemo(() => {
    const total = checkedPlans.reduce((sum, plan) => {
      const planned = parseFloat(plan.plannedExpenseWithTax.replace(/,/g, ''))
      const penalty = parseFloat(plan.penaltyAmount || '0')
      return sum + planned - penalty
    }, 0)
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [checkedPlans])

  // 报账总额（不含税）
  const totalReimburseNoTax = useMemo(() => {
    const total = checkedPlans.reduce((sum, plan) => {
      const planned = parseFloat(plan.plannedExpenseNoTax.replace(/,/g, ''))
      const plannedWithTax = parseFloat(plan.plannedExpenseWithTax.replace(/,/g, ''))
      const penalty = parseFloat(plan.penaltyAmount || '0')
      const ratio = planned / plannedWithTax
      const penaltyNoTax = penalty * ratio
      return sum + planned - penaltyNoTax
    }, 0)
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [checkedPlans])

  // 是否有扣罚金额
  const hasPenalty = useMemo(() => {
    return checkedPlans.some(plan => parseFloat(plan.penaltyAmount || '0') > 0)
  }, [checkedPlans])

  // 项目选择options
  const projectSelectOptions = projectOptions.map(p => ({
    value: p.code,
    label: p.name,
    subLabel: p.code
  }))

  // 记账对象options
  const accountingObjectOptions = [
    { value: '项目成本', label: '项目成本' },
    { value: '部门成本', label: '部门成本' },
    { value: '公司成本', label: '公司成本' }
  ]

  // 分摊地市options
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

  // 勾选/取消勾选合同
  const handleContractCheck = (contractId: string) => {
    const contract = projectContracts.find(c => c.id === contractId)
    if (!contract || contract.statusKey !== 'executing') return

    setCheckedContractIds(prev => {
      if (prev.includes(contractId)) {
        return prev.filter(id => id !== contractId)
      }
      return [...prev, contractId]
    })
  }

  // 全选/取消全选合同
  const handleSelectAllContracts = () => {
    const executableIds = projectContracts
      .filter(c => c.statusKey === 'executing')
      .map(c => c.id)
    const allChecked = executableIds.every(id => checkedContractIds.includes(id))
    if (allChecked) {
      setCheckedContractIds([])
    } else {
      setCheckedContractIds(executableIds)
    }
  }

  // 勾选合同变化时，自动带出记账对象（取第一个勾选合同的记账对象）
  useEffect(() => {
    if (readOnly) return
    if (checkedContractIds.length === 0) {
      setAccountingObject('')
      return
    }
    const firstContract = projectContracts.find(c => c.id === checkedContractIds[0])
    if (firstContract) {
      setAccountingObject(firstContract.accountingObject)
    }
  }, [checkedContractIds, projectContracts, readOnly])

  // 勾选/取消勾选支出计划
  const handlePlanCheck = (planId: string) => {
    setExpensePlanList(prev => prev.map(p =>
      p.id === planId ? { ...p, checked: !p.checked } : p
    ))
  }

  // 全选/取消全选支出计划
  const handleSelectAllPlans = () => {
    const visibleIds = filteredExpensePlans.map(p => p.id)
    const allChecked = visibleIds.every(id => expensePlanList.find(p => p.id === id)?.checked)
    setExpensePlanList(prev => prev.map(p => {
      if (visibleIds.includes(p.id)) {
        return { ...p, checked: !allChecked }
      }
      return p
    }))
  }

  // 更新支出计划字段
  const updatePlanField = (planId: string, field: keyof ExpensePlanRow, value: string) => {
    setExpensePlanList(prev => prev.map(p => {
      if (p.id !== planId) return p
      const updated = { ...p, [field]: value }
      if (field === 'plannedExpenseWithTax' || field === 'taxRate') {
        const withTax = parseFloat((field === 'plannedExpenseWithTax' ? value : p.plannedExpenseWithTax).replace(/,/g, ''))
        const rateStr = field === 'taxRate' ? value : p.taxRate
        const rate = parseFloat(rateStr) / 100
        if (!isNaN(withTax) && !isNaN(rate) && rate > 0) {
          updated.plannedExpenseNoTax = (withTax / (1 + rate)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        }
      }
      return updated
    }))
  }

  // 获取某合同的预算选项
  const getBudgetOptions = (contractId: string) => {
    return mockBudgetOptions
      .filter(b => b.contractId === contractId)
      .map(b => ({ value: b.code, label: `${b.code} - ${b.name}` }))
  }

  // 处理文件上传
  const handleAddFile = () => {
    const fileName = `扣款凭证_${Date.now()}.pdf`
    setPenaltyFiles(prev => [...prev, fileName])
  }

  const handleRemoveFile = (index: number) => {
    setPenaltyFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 返回
  const handleBack = () => {
    onNavigate?.('/finance/expense/prepayment')
  }

  // 取消
  const handleCancel = () => {
    onNavigate?.('/finance/expense/prepayment')
  }

  // 提交
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
      alert('请选择合同名称')
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
    onNavigate?.('/finance/expense/prepayment')
  }

  // 保存为草稿
  const handleSaveDraft = () => {
    alert('保存草稿成功')
  }

  const executableContractCount = projectContracts.filter(c => c.statusKey === 'executing').length
  const allContractsChecked = executableContractCount > 0 &&
    projectContracts.filter(c => c.statusKey === 'executing').every(c => checkedContractIds.includes(c.id))

  const allPlansChecked = filteredExpensePlans.length > 0 &&
    filteredExpensePlans.every(p => p.checked)

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
            <h2 className="text-sm font-semibold text-gray-800">发起预付款</h2>
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
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                  {!readOnly && <span className="text-red-500 mr-0.5">*</span>}
                  报账单类型
                </label>
                <div className="flex-1 min-w-0">
                  {readOnly ? (
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
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
                    {expenseTotalProvision.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </div>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3 whitespace-nowrap">支付总额（含税，元）</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-800 font-semibold">
                    {expenseTotalPayment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
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

        {/* 2. 合同信息 - 复制自CT产品订购工单发起页面，独立维护 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <SectionTitle sectionKey="expense-project" expanded={expenseProjectExpanded} onToggle={() => setExpenseProjectExpanded(!expenseProjectExpanded)}>合同信息</SectionTitle>
          {expenseProjectExpanded && (
            <>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3">
              <FieldRow label="项目名称" required fullWidth>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={expenseProject?.name || ''}
                    onClick={() => !readOnly && handleOpenExpenseProjectModal()}
                    placeholder="请选择项目"
                    className={clsx(
                      'w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white',
                      !readOnly && 'cursor-pointer hover:bg-gray-50',
                      readOnly && 'bg-gray-50 text-gray-600 cursor-not-allowed'
                    )}
                  />
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={handleOpenExpenseProjectModal}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="选择项目"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </FieldRow>
              <FieldRow label="合同名称" required fullWidth>
                <select
                  value={expenseSelectedContractId}
                  onChange={(e) => handleSelectExpenseContract(e.target.value)}
                  disabled={!expenseProject || readOnly}
                  className={clsx(
                    'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                    !expenseProject || readOnly
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 bg-white'
                  )}
                >
                  <option value="">请选择合同名称</option>
                  {expenseProjectContracts.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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

        {/* 3. 支付明细信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">支付明细信息</h3>
              <span className="text-xs text-gray-400">【{paymentDetailRows.length}】</span>
            </div>
            <button
              type="button"
              onClick={handlePaymentAdd}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              新增
            </button>
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
                  <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paymentDetailRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-3 py-8 text-center text-gray-400">暂无数据</td>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 删除支付明细确认弹框 */}
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

        {/* 4. 流程信息 */}
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

      {/* ========== 选择项目弹窗 - 复制自CT产品订购工单发起页面，独立维护 ========== */}
      {expenseShowProjectModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setExpenseShowProjectModal(false)}>
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
                onClick={() => setExpenseShowProjectModal(false)}
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
                    value={expenseSearchName}
                    onChange={(e) => setExpenseSearchName(e.target.value)}
                    placeholder="请输入项目名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right">省内项目编码</label>
                  <input
                    type="text"
                    value={expenseSearchProvinceCode}
                    onChange={(e) => setExpenseSearchProvinceCode(e.target.value)}
                    placeholder="请输入省内项目编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right">全网项目编码</label>
                  <input
                    type="text"
                    value={expenseSearchGlobalCode}
                    onChange={(e) => setExpenseSearchGlobalCode(e.target.value)}
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
                    {expenseFilteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      expenseFilteredProjects.map(project => (
                        <tr
                          key={project.id}
                          className={clsx(
                            'cursor-pointer hover:bg-blue-50/50 transition-colors',
                            expenseSelectedProjectId === project.id && 'bg-blue-50'
                          )}
                          onClick={() => setExpenseSelectedProjectId(project.id)}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="radio"
                              name="expense-project-modal"
                              checked={expenseSelectedProjectId === project.id}
                              onChange={() => setExpenseSelectedProjectId(project.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </td>
                          <td className="px-3 py-3 text-gray-800">{project.name}</td>
                          <td className="px-3 py-3 text-gray-600">{project.code}</td>
                          <td className="px-3 py-3 text-gray-600">{project.globalCode}</td>
                          <td className="px-3 py-3 text-gray-600">{project.type}</td>
                          <td className="px-3 py-3 text-gray-600">{project.signMode}</td>
                          <td className="px-3 py-3 text-gray-600">{project.customerManager}</td>
                          <td className="px-3 py-3 text-gray-600">{project.solutionManager}</td>
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
                onClick={() => setExpenseShowProjectModal(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmExpenseProject}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* ========== 支付明细 - 新增 / 编辑弹框 ========== */}
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
    </div>
  )
}
