import { useState, useMemo, useEffect, Fragment } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, ChevronDown, ChevronRight, RotateCcw, Check, Plus, X, Pencil, Trash2, HelpCircle, Save } from 'lucide-react'
import FileUpload from '@/components/FileUpload'

interface ExpenseCreateWithoutContractProps {
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
  '项目类费用报账单'
]

// ============================================================
// 发起报账（网格小微项目）独立 mock 数据
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
    code: 'CTR2026QKH-001',
    name: '轻量化项目框采协议',
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
    code: 'CTR2026QKH-002',
    name: '自主交付运维项目框采协议',
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
    code: 'CTR2026QKH-003',
    name: '驻场运维项目框采协议',
    type: '支出类',
    amountWithTax: '2,000,000.00',
    amountWithoutTax: '1,769,911.50',
    groupCustomerName: '安徽省政务信息中心',
    groupCustomerCode: 'GCUS003',
    status: '履行中',
    statusKey: 'executing',
    performanceStartTime: '2026-06-10',
    performanceEndTime: '2027-06-09',
    projectCode: 'PRJ-2026-HF-001',
    accountingObject: '项目成本',
    signTime: '2026-05-10',
    supplierCode: 'SUP-005',
    supplierName: '安徽中兴继远信息技术股份有限公司'
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
    allocationType: '一次性',
    allocationPeriod: '1个月',
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
    allocationType: '分月分摊',
    allocationPeriod: '12个月',
    plannedCostDate: '2026-07-15',
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
    allocationType: '分月分摊',
    allocationPeriod: '12个月',
    plannedCostDate: '2026-06-01',
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
  currentReportAmount: string
  currentPaymentAmount: string
  currentWriteoffAmount: string
  paymentAccount: string
  payeeName: string
  bankCode: string
}

// 计算含税金额对应的不含税金额（含税 ÷ (1 + 税率)），税率形如 '6%'
const calcExTaxAmount = (amount: string, taxRate: string): string => {
  const amt = parseFloat((amount || '0').replace(/,/g, ''))
  const rateStr = taxRate || ''
  if (!amt || !rateStr) return ''
  const rate = parseFloat(rateStr.replace('%', '')) / 100
  return (amt / (1 + rate)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 由费用明细行生成对应的支付明细行（联动）
const buildPaymentDetailRow = (expenseRow: typeof mockExpenseProvisionDetailRows[0], id: string): PaymentDetailRow => ({
  id,
  expenseDetailId: expenseRow.id,
  businessCategory: expenseRow.businessCategory,
  businessSubCategory: expenseRow.businessSubCategory,
  businessActivity: expenseRow.businessActivity,
  paymentType: '一次性付款',
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
// 支付明细编辑弹框 - 核销明细（预付款）mock 数据（3条）
// ============================================================
interface WriteoffDetailRow {
  id: string
  aictPrepayNo: string
  prepayLineNo: string
  erpPrepayNo: string
  prepayDate: string
  prepayAmount: string
  remainingWriteoffAmount: string
  writeoffAmount: string
  checked: boolean
}

const mockWriteoffDetailRows: WriteoffDetailRow[] = [
  {
    id: 'wo-1',
    aictPrepayNo: 'AICT20260601001',
    prepayLineNo: '10',
    erpPrepayNo: 'ERP20260601001',
    prepayDate: '2026-06-01',
    prepayAmount: '50,000.00',
    remainingWriteoffAmount: '50,000.00',
    writeoffAmount: '',
    checked: false
  },
  {
    id: 'wo-2',
    aictPrepayNo: 'AICT20260615002',
    prepayLineNo: '10',
    erpPrepayNo: 'ERP20260615002',
    prepayDate: '2026-06-15',
    prepayAmount: '30,000.00',
    remainingWriteoffAmount: '10,000.00',
    writeoffAmount: '',
    checked: false
  },
  {
    id: 'wo-3',
    aictPrepayNo: 'AICT20260701003',
    prepayLineNo: '10',
    erpPrepayNo: 'ERP20260701003',
    prepayDate: '2026-07-01',
    prepayAmount: '20,000.00',
    remainingWriteoffAmount: '0.00',
    writeoffAmount: '',
    checked: false
  }
]

// ============================================================
// 新增费用明细弹框 - 支出计划明细 mock 数据（5条）
// ============================================================
interface ExpensePlanDetailItem {
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
  businessCategory: string
  businessSubCategory: string
  businessActivity: string
  expenseType: string
  productSegment: string
  marketSegment: string
}

const mockExpensePlanDetailList: ExpensePlanDetailItem[] = [
  {
    id: 'epd-1',
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
    id: 'epd-2',
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
    id: 'epd-3',
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
  },
  {
    id: 'epd-4',
    expensePlanCode: 'EIP-20260715-001',
    productName: '云服务器租赁',
    taxRate: '6%',
    tariffName: '[849]ICT维保服务费',
    plannedExpenseAmount: '424,000.00',
    allocationType: '分月分摊',
    allocationPeriod: '12个月',
    plannedCostDate: '2026-07-15',
    incomeConfirmProgress: '30%',
    cumulativeReimbursedAmount: '35,333.33',
    availableProvisionAmount: '35,333.33',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '云服务租赁',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场'
  },
  {
    id: 'epd-5',
    expensePlanCode: 'EIP-20260601-001',
    productName: '机房运维服务',
    taxRate: '6%',
    tariffName: '[849]ICT维保服务费',
    plannedExpenseAmount: '159,000.00',
    allocationType: '分月分摊',
    allocationPeriod: '12个月',
    plannedCostDate: '2026-06-01',
    incomeConfirmProgress: '50%',
    cumulativeReimbursedAmount: '13,250.00',
    availableProvisionAmount: '13,250.00',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场'
  }
]

// 费用池订单明细 mock 数据
interface ExpensePoolItem {
  id: string
  netProjectCode: string
  poolOrderNo: string
  poolOrderLineNo: string
  productName: string
  materialQuantity: string
  amountWithoutTax: string
  taxAmount: string
}

const mockExpensePoolDetailList: ExpensePoolItem[] = [
  {
    id: 'epool-1',
    netProjectCode: 'AH20260101',
    poolOrderNo: 'APO303489260800052',
    poolOrderLineNo: '10',
    productName: '服务器硬件',
    materialQuantity: '10',
    amountWithoutTax: '113,000.00',
    taxAmount: '14,690.00'
  },
  {
    id: 'epool-2',
    netProjectCode: 'AH20260101',
    poolOrderNo: 'APO303489260800052',
    poolOrderLineNo: '20',
    productName: '网络设备',
    materialQuantity: '5',
    amountWithoutTax: '56,500.00',
    taxAmount: '7,345.00'
  },
  {
    id: 'epool-3',
    netProjectCode: 'AH20260102',
    poolOrderNo: 'APO303489260800053',
    poolOrderLineNo: '10',
    productName: '系统集成服务',
    materialQuantity: '1',
    amountWithoutTax: '33,900.00',
    taxAmount: '2,034.00'
  }
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
  { time: '2026-08-05 10:00', actor: '王强', action: '发起报账（网格小微项目）提交申请' },
  { time: '2026-08-06 14:30', actor: '王强', action: '提供回款证明材料' },
  { time: '2026-08-08 09:15', actor: '系统', action: '流转至下一环节：项目类费用报账单提交' }
]

// ============================================================
// 主页面
// ============================================================
export default function ExpenseCreateWithoutContract({ onNavigate, readOnly = false, id }: ExpenseCreateWithoutContractProps) {
  // ========== 发起报账（网格小微项目）独立状态：项目信息 ==========
  const [expenseProjectExpanded, setExpenseProjectExpanded] = useState(true)
  const [expenseProject, setExpenseProject] = useState<ExpenseProjectInfo | null>(expenseProjectList[0])

  // ========== 发起报账（网格小微项目）独立状态：合同信息 ==========
  const [expenseSelectedContractId, setExpenseSelectedContractId] = useState<string>(readOnly ? 'ec1' : '')
  const [expensePaymentMethod, setExpensePaymentMethod] = useState('')
  const [expenseContract, setExpenseContract] = useState<ExpenseContractInfo | null>(readOnly ? expenseContractList[0] : null)

  // 根据项目筛选合同
  const expenseProjectContracts = useMemo(() => {
    if (!expenseProject) return []
    return expenseContractList.filter(c => c.projectCode === expenseProject.code)
  }, [expenseProject])

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
  const [billType, setBillType] = useState('项目类费用报账单')
  const [billTypeError, setBillTypeError] = useState('')
  const [accountingObject, setAccountingObject] = useState(readOnly ? '项目成本' : '')
  const [summary, setSummary] = useState(readOnly ? '2026年6月IDC数据中心项目设备采购及软件开发支出报账' : '')
  const [remark, setRemark] = useState(readOnly ? '本次报账支付方式与合同约定付款方式不一致，需人工核验。' : '')

  // ========== 费用明细信息状态（从发起计提复制，独立维护） ==========
  const [expenseProvisionDetailRows, setExpenseProvisionDetailRows] = useState(mockExpenseProvisionDetailRows)
  const [expenseProvisionDetailModalVisible, setExpenseProvisionDetailModalVisible] = useState(false)
  const [expenseEditProvisionDetailModalVisible, setExpenseEditProvisionDetailModalVisible] = useState(false)
  const [expenseCurrentEditRow, setExpenseCurrentEditRow] = useState<typeof mockExpenseProvisionDetailRows[0] | null>(null)
  const [expenseDeleteConfirmVisible, setExpenseDeleteConfirmVisible] = useState(false)
  const [expenseIdToDelete, setExpenseIdToDelete] = useState<string | null>(null)

  // ========== 支付明细信息状态 ==========
  const [paymentDetailRows, setPaymentDetailRows] = useState(mockPaymentDetailRows)

  // 支付明细编辑弹框状态
  const [paymentEditModalVisible, setPaymentEditModalVisible] = useState(false)
  const [paymentEditRow, setPaymentEditRow] = useState<PaymentDetailRow | null>(null)
  const [paymentEditType, setPaymentEditType] = useState('正常支付')
  const [paymentEditAmount, setPaymentEditAmount] = useState('')
  const [paymentEditWriteoffAmount, setPaymentEditWriteoffAmount] = useState('')
  const [paymentEditPayeeName, setPaymentEditPayeeName] = useState('')
  const [paymentEditPayeeAccount, setPaymentEditPayeeAccount] = useState('')
  const [paymentEditBankName, setPaymentEditBankName] = useState('')
  const [paymentEditBankCode, setPaymentEditBankCode] = useState('')
  const [writeoffDetailRows, setWriteoffDetailRows] = useState<WriteoffDetailRow[]>(mockWriteoffDetailRows)
  const [expenseExpandedDetailIds, setExpenseExpandedDetailIds] = useState<string[]>([])

  const toggleExpenseDetailRow = (id: string) => {
    setExpenseExpandedDetailIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const handleExpenseEdit = (row: typeof mockExpenseProvisionDetailRows[0]) => {
    setExpenseCurrentEditRow(row)
    // 携带表格行数据初始化弹框（支付明细信息 + 核销明细信息，复制自新增费用明细弹框）
    const payRow = paymentDetailRows.find(p => p.expenseDetailId === row.id)
    setExpenseModalPaymentType(payRow?.paymentType || '正常支付')
    setExpenseModalProvisionAmount(row.currentProvisionAmount)
    setExpenseModalNeedAmortization('否')
    setExpenseModalAmortizationStartDate('')
    setExpenseModalAmortizationEndDate('')
    setExpenseModalAmortizationMonths('')
    setExpenseModalPaymentAmount(payRow?.currentPaymentAmount.replace(/,/g, '') || '')
    setExpenseModalPayeeAccount(payRow?.paymentAccount || '')
    setExpenseModalPayeeName(payRow?.payeeName || '')
    setExpenseModalBankCode(payRow?.bankCode || '')
    setExpenseModalBankName(mockPayeeAccountList.find(a => a.account === payRow?.paymentAccount)?.bankName || '')
    // 核销明细：按本次核销金额逐行分摊初始化勾选
    const totalWriteoff = parseFloat((payRow?.currentWriteoffAmount || '0').replace(/,/g, '')) || 0
    let remaining = totalWriteoff
    setExpenseModalWriteoffRows(mockWriteoffDetailRows.map(w => {
      const rem = parseFloat(w.remainingWriteoffAmount.replace(/,/g, '')) || 0
      if (remaining > 0 && rem > 0 && rem <= remaining) {
        remaining -= rem
        return { ...w, checked: true, writeoffAmount: w.remainingWriteoffAmount.replace(/,/g, '') }
      }
      return { ...w, checked: false, writeoffAmount: '' }
    }))
    setExpenseEditProvisionDetailModalVisible(true)
  }

  const handleExpenseDelete = (id: string) => {
    setExpenseIdToDelete(id)
    setExpenseDeleteConfirmVisible(true)
  }

  const confirmExpenseDelete = () => {
    if (expenseIdToDelete) {
      setExpenseProvisionDetailRows(prev => prev.filter(r => r.id !== expenseIdToDelete))
      // 同步删除对应支付明细行
      setPaymentDetailRows(prev => prev.filter(p => p.expenseDetailId !== expenseIdToDelete))
    }
    setExpenseDeleteConfirmVisible(false)
    setExpenseIdToDelete(null)
  }

  const confirmExpenseEdit = () => {
    if (!expenseCurrentEditRow) return
    if (!expenseModalProvisionAmount) {
      alert('请输入本次报账金额')
      return
    }
    // 支付信息校验：本次支付金额不为 0 时，需提供收款信息
    if (expenseModalPaymentAmount && parseFloat(expenseModalPaymentAmount) !== 0) {
      if (!expenseModalPayeeAccount) { alert('请选择收款账号'); return }
      if (!expenseModalPayeeName) { alert('请填写收款方名称'); return }
      if (!expenseModalBankCode) { alert('请填写联行号'); return }
    }
    const checkedWriteoffs = expenseModalWriteoffRows.filter(w => w.checked)
    const totalWriteoff = checkedWriteoffs.reduce((s, w) => s + (parseFloat(w.writeoffAmount) || 0), 0)
    setExpenseProvisionDetailRows(prev =>
      prev.map(r => r.id === expenseCurrentEditRow.id ? { ...r, currentProvisionAmount: expenseModalProvisionAmount } : r)
    )
    // 同步更新对应支付明细行
    setPaymentDetailRows(prev => prev.map(p =>
      p.expenseDetailId === expenseCurrentEditRow.id ? {
        ...p,
        paymentType: expenseModalPaymentType,
        currentReportAmount: expenseModalProvisionAmount,
        currentPaymentAmount: parseFloat(expenseModalPaymentAmount || '0').toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        currentWriteoffAmount: totalWriteoff.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        paymentAccount: expenseModalPayeeAccount,
        payeeName: expenseModalPayeeName,
        bankCode: expenseModalBankCode
      } : p
    ))
    setExpenseEditProvisionDetailModalVisible(false)
    setExpenseCurrentEditRow(null)
  }

  // 支付明细：打开编辑弹框
  const handlePaymentEdit = (row: PaymentDetailRow) => {
    setPaymentEditRow(row)
    setPaymentEditType(row.paymentType)
    setPaymentEditAmount(row.currentPaymentAmount.replace(/,/g, ''))
    setPaymentEditWriteoffAmount(row.currentWriteoffAmount.replace(/,/g, ''))
    setPaymentEditPayeeName('')
    setPaymentEditPayeeAccount('')
    setPaymentEditBankName('')
    setPaymentEditBankCode('')
    setWriteoffDetailRows(mockWriteoffDetailRows.map(w => ({ ...w, checked: false, writeoffAmount: '' })))
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

  // 支付明细：核销明细复选框（剩余核销金额为0时不可勾选）
  const handleWriteoffCheck = (id: string) => {
    setWriteoffDetailRows(prev => prev.map(w => {
      if (w.id !== id) return w
      const remaining = parseFloat(w.remainingWriteoffAmount.replace(/,/g, '')) || 0
      if (remaining <= 0) return w
      return { ...w, checked: !w.checked }
    }))
  }

  // 支付明细：核销金额修改（不可大于剩余核销金额）
  const handleWriteoffAmountChange = (id: string, value: string) => {
    setWriteoffDetailRows(prev => prev.map(w => {
      if (w.id !== id) return w
      const remaining = parseFloat(w.remainingWriteoffAmount.replace(/,/g, '')) || 0
      let newVal = value
      const numVal = parseFloat(value) || 0
      if (numVal > remaining) newVal = remaining.toFixed(2)
      return { ...w, writeoffAmount: newVal }
    }))
  }

  // 支付明细：确认编辑
  const confirmPaymentEdit = () => {
    if (!paymentEditRow) return
    if (paymentEditAmount && parseFloat(paymentEditAmount) !== 0) {
      if (!paymentEditPayeeAccount) { alert('请选择收款账号'); return }
      if (!paymentEditPayeeName) { alert('请填写收款方名称'); return }
      if (!paymentEditBankCode) { alert('请填写联行号'); return }
    }
    const checkedWriteoffs = writeoffDetailRows.filter(w => w.checked)
    const totalWriteoff = checkedWriteoffs.reduce((s, w) => s + (parseFloat(w.writeoffAmount) || 0), 0)
    setPaymentDetailRows(prev => prev.map(r => r.id === paymentEditRow.id ? {
      ...r,
      paymentType: paymentEditType,
      currentPaymentAmount: parseFloat(paymentEditAmount || '0').toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      currentWriteoffAmount: totalWriteoff.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      paymentAccount: paymentEditPayeeAccount,
      payeeName: paymentEditPayeeName,
      bankCode: paymentEditBankCode
    } : r))
    setPaymentEditModalVisible(false)
  }

  const expenseTotalProvisionExTax = expenseProvisionDetailRows.reduce((s, r) => {
    const exTax = calcExTaxAmount(r.currentProvisionAmount, r.taxRate).replace(/,/g, '')
    return s + (parseFloat(exTax) || 0)
  }, 0)
  const expenseTotalProvision = expenseProvisionDetailRows.reduce((s, r) => s + parseFloat(r.currentProvisionAmount.replace(/,/g, '')), 0)

  // 支付总额（含税）= 支付明细信息中本次支付金额合计
  const expenseTotalPayment = paymentDetailRows.reduce((s, r) => s + parseFloat(r.currentPaymentAmount.replace(/,/g, '')), 0)
  // 核销总额（含税）= 支付明细信息中本次核销金额合计
  const expenseTotalWriteoff = paymentDetailRows.reduce((s, r) => s + parseFloat(r.currentWriteoffAmount.replace(/,/g, '')), 0)

  // ========== 新增费用明细弹框状态（复制自新增报账明细弹框，独立维护） ==========
  const [showProvisionModal, setShowProvisionModal] = useState(false)
  const [expenseModalSelectedContractId, setExpenseModalSelectedContractId] = useState<string>('')
  const [expenseModalSelectedPlanId, setExpenseModalSelectedPlanId] = useState<string>('')
  const [expenseModalSelectedPoolId, setExpenseModalSelectedPoolId] = useState<string>('')
  const [expenseModalProvisionAmount, setExpenseModalProvisionAmount] = useState('')
  const [expenseModalNeedAmortization, setExpenseModalNeedAmortization] = useState<'是' | '否'>('否')
  const [expenseModalAmortizationStartDate, setExpenseModalAmortizationStartDate] = useState('')
  const [expenseModalAmortizationEndDate, setExpenseModalAmortizationEndDate] = useState('')
  const [expenseModalAmortizationMonths, setExpenseModalAmortizationMonths] = useState('')

  // ========== 新增费用明细弹框：支付明细 + 核销明细状态（复制自支付明细编辑弹框，独立维护） ==========
  const [expenseModalPaymentType, setExpenseModalPaymentType] = useState('正常支付')
  const [expenseModalPaymentAmount, setExpenseModalPaymentAmount] = useState('')
  const [expenseModalPayeeAccount, setExpenseModalPayeeAccount] = useState('')
  const [expenseModalPayeeName, setExpenseModalPayeeName] = useState('')
  const [expenseModalBankName, setExpenseModalBankName] = useState('')
  const [expenseModalBankCode, setExpenseModalBankCode] = useState('')
  const [expenseModalWriteoffRows, setExpenseModalWriteoffRows] = useState<WriteoffDetailRow[]>([])

  // 新增费用明细弹框：选择收款账号后自动带出开户行、收款方名称、联行号（不可修改）
  const handleExpenseModalPayeeAccountChange = (account: string) => {
    setExpenseModalPayeeAccount(account)
    const acc = mockPayeeAccountList.find(a => a.account === account)
    if (acc) {
      setExpenseModalBankName(acc.bankName)
      setExpenseModalPayeeName(acc.payeeName)
      setExpenseModalBankCode(acc.bankCode)
    } else {
      setExpenseModalBankName('')
      setExpenseModalPayeeName('')
      setExpenseModalBankCode('')
    }
  }

  // 新增费用明细弹框：核销明细复选框（剩余核销金额为0时不可勾选；勾选后本次核销金额=剩余核销金额）
  const handleExpenseModalWriteoffCheck = (id: string) => {
    setExpenseModalWriteoffRows(prev => prev.map(w => {
      if (w.id !== id) return w
      const remaining = parseFloat(w.remainingWriteoffAmount.replace(/,/g, '')) || 0
      if (remaining <= 0) return w
      const checked = !w.checked
      return { ...w, checked, writeoffAmount: checked ? w.remainingWriteoffAmount.replace(/,/g, '') : '' }
    }))
  }

  // 弹框：选中合同
  const expenseModalSelectedContract = useMemo(() => {
    if (!expenseProject) return null
    return expenseContractList.find(c => c.projectCode === expenseProject.code && c.id === expenseModalSelectedContractId) || null
  }, [expenseProject, expenseModalSelectedContractId])

  // 弹框：当前项目下的合同列表
  const expenseModalContractList = useMemo(() => {
    if (!expenseProject) return []
    return expenseContractList.filter(c => c.projectCode === expenseProject.code)
  }, [expenseProject])

  // 弹框：选中的支出计划
  const expenseModalSelectedPlan = useMemo(() => {
    return mockExpensePlanDetailList.find(p => p.id === expenseModalSelectedPlanId) || null
  }, [expenseModalSelectedPlanId])

  // 弹框：选中的费用池订单
  const expenseModalSelectedPool = useMemo(() => {
    return mockExpensePoolDetailList.find(p => p.id === expenseModalSelectedPoolId) || null
  }, [expenseModalSelectedPoolId])

  // 弹框：当前页面选中合同是否为该项目的第一个合同（决定是否展示费用池订单明细）
  const expenseModalIsFirstContract = useMemo(() => {
    return expenseProjectContracts.length > 0 && expenseSelectedContractId === expenseProjectContracts[0]?.id
  }, [expenseProjectContracts, expenseSelectedContractId])

  // 弹框：支出计划明细列表（第一个合同需先选择费用池订单后才加载）
  const expenseModalPlanList = useMemo(() => {
    if (expenseModalIsFirstContract && !expenseModalSelectedPoolId) return []
    return mockExpensePlanDetailList
  }, [expenseModalIsFirstContract, expenseModalSelectedPoolId])

  // 打开弹框
  const handleOpenProvisionModal = () => {
    if (!expenseSelectedContractId) {
      alert('请先选择合同名称！')
      return
    }
    setExpenseModalSelectedPoolId('')
    setExpenseModalSelectedPlanId('')
    setExpenseModalProvisionAmount('')
    setExpenseModalNeedAmortization('否')
    setExpenseModalAmortizationStartDate('')
    setExpenseModalAmortizationEndDate('')
    setExpenseModalAmortizationMonths('')
    // 重置支付明细/核销明细状态
    setExpenseModalPaymentType('正常支付')
    setExpenseModalPaymentAmount('')
    setExpenseModalPayeeAccount('')
    setExpenseModalPayeeName('')
    setExpenseModalBankName('')
    setExpenseModalBankCode('')
    setExpenseModalWriteoffRows(mockWriteoffDetailRows.map(w => ({ ...w, checked: false, writeoffAmount: '' })))
    setShowProvisionModal(true)
  }

  // 弹框：选择费用池订单（选中后加载支出计划明细）
  const handleExpenseModalSelectPool = (poolId: string) => {
    setExpenseModalSelectedPoolId(poolId)
    setExpenseModalSelectedPlanId('')
    setExpenseModalProvisionAmount('')
  }

  // 弹框：选择合同
  const handleExpenseModalSelectContract = (contractId: string) => {
    setExpenseModalSelectedContractId(contractId)
    setExpenseModalSelectedPlanId('')
    setExpenseModalSelectedPoolId('')
  }

  // 弹框：确认添加 → 将选中的支出计划添加到费用明细列表
  const handleProvisionConfirm = () => {
    if (!expenseModalSelectedPlanId) {
      alert('请选择一条支出计划')
      return
    }
    if (!expenseModalProvisionAmount) {
      alert('请输入本次报账金额')
      return
    }
    if (expenseModalNeedAmortization === '是') {
      if (!expenseModalAmortizationStartDate || !expenseModalAmortizationEndDate) {
        alert('请填写待摊日期')
        return
      }
    }
    // 支付信息校验：本次支付金额不为 0 时，需提供回款证明材料相关收款信息
    if (expenseModalPaymentAmount && parseFloat(expenseModalPaymentAmount) !== 0) {
      if (!expenseModalPayeeAccount) { alert('请选择收款账号'); return }
      if (!expenseModalPayeeName) { alert('请填写收款方名称'); return }
      if (!expenseModalBankCode) { alert('请填写联行号'); return }
    }
    const plan = expenseModalSelectedPlan
    if (!plan) return

    const newRow = {
      id: `exp-pd-new-${Date.now()}`,
      netProjectCode: expenseProject?.globalCode || '',
      contractCode: expenseSelectedContractId ? (expenseContractList.find(c => c.id === expenseSelectedContractId)?.code || '') : '',
      poolOrderNo: `APO${Math.random().toString().slice(2, 16)}`,
      poolOrderLineNo: '001',
      expensePlanCode: plan.expensePlanCode,
      productName: plan.productName,
      taxRate: plan.taxRate,
      tariffName: plan.tariffName,
      plannedExpense: plan.plannedExpenseAmount,
      allocationType: plan.allocationType,
      allocationPeriod: plan.allocationPeriod,
      plannedCostDate: plan.plannedCostDate,
      incomeConfirmProgress: plan.incomeConfirmProgress,
      cumulativeReimbursedAmount: plan.cumulativeReimbursedAmount,
      provisionableAmount: plan.availableProvisionAmount,
      currentProvisionAmount: expenseModalProvisionAmount,
      businessCategory: plan.businessCategory,
      businessSubCategory: plan.businessSubCategory,
      businessActivity: plan.businessActivity,
      expenseType: plan.expenseType,
      productSegment: plan.productSegment,
      marketSegment: plan.marketSegment,
      supplierCode: 'SUP-001',
      supplierName: '供应商（自动带出）'
    }
    setExpenseProvisionDetailRows(prev => [...prev, newRow])
    // 每新增一行费用明细，同步新增一行支付明细（业务大类/业务小类/业务活动一致，含弹框内填写的支付/核销信息）
    const checkedWriteoffs = expenseModalWriteoffRows.filter(w => w.checked)
    const totalWriteoff = checkedWriteoffs.reduce((s, w) => s + (parseFloat(w.writeoffAmount) || 0), 0)
    setPaymentDetailRows(prev => [...prev, {
      id: `pay-${Date.now()}`,
      expenseDetailId: newRow.id,
      businessCategory: plan.businessCategory,
      businessSubCategory: plan.businessSubCategory,
      businessActivity: plan.businessActivity,
      paymentType: expenseModalPaymentType,
      currentReportAmount: expenseModalProvisionAmount,
      currentPaymentAmount: parseFloat(expenseModalPaymentAmount || '0').toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      currentWriteoffAmount: totalWriteoff.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      paymentAccount: expenseModalPayeeAccount,
      payeeName: expenseModalPayeeName,
      bankCode: expenseModalBankCode
    }])
    setShowProvisionModal(false)
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

  // ========== 回款证明信息（只读详情，复制自项目类费用报账单审批页面） ==========
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

  // 返回
  const handleBack = () => {
    onNavigate?.('/finance/expense/expense')
  }

  // 取消
  const handleCancel = () => {
    onNavigate?.('/finance/expense/expense')
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
    if (expenseProvisionDetailRows.length === 0) {
      alert('请至少添加一条费用明细')
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
    onNavigate?.('/finance/expense/expense')
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
            <h2 className="text-sm font-semibold text-gray-800">{readOnly ? '报账详情（网格小微项目）' : '发起报账（网格小微项目）'}</h2>
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

        {/* 2. 合同信息 - 复制自CT产品订购工单发起页面，独立维护（详情页不展示） */}
        {!readOnly && (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <SectionTitle sectionKey="expense-project" expanded={expenseProjectExpanded} onToggle={() => setExpenseProjectExpanded(!expenseProjectExpanded)}>合同信息</SectionTitle>
          {expenseProjectExpanded && (
            <>
            <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mt-3 mb-3">
              <span className="shrink-0">⚠</span>
              <span>温馨提示：网格小微DICT项目可以使用费用池订单进行批量报账，若项目的本次支付金额小于5万，无需客户经理提供回款证明</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <FieldRow label="合同名称" required fullWidth>
                <select
                  value={expenseSelectedContractId}
                  onChange={(e) => handleSelectExpenseContract(e.target.value)}
                  disabled={readOnly}
                  className={clsx(
                    'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                    readOnly
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 bg-white'
                  )}
                >
                  <option value="">请选择合同名称</option>
                  {expenseContractList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="供应商编码" required fullWidth>
                <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                  {expenseContractList.find(c => c.id === expenseSelectedContractId)?.supplierCode || ''}
                </div>
              </FieldRow>
              <FieldRow label="供应商名称" required fullWidth>
                <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                  {expenseContractList.find(c => c.id === expenseSelectedContractId)?.supplierName || ''}
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
        )}

        {/* 3. 费用明细信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">费用明细信息</h3>
              <span className="text-xs text-gray-400">【{expenseProvisionDetailRows.length}】</span>
            </div>
            {!readOnly && (
            <button
              type="button"
              onClick={handleOpenProvisionModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              新增
            </button>
            )}
          </div>
          <div className="overflow-x-auto overflow-y-hidden border border-gray-100 rounded-md">
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
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">本次报账金额（不含税，元）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">本次报账金额（含税，元）</th>
                  {!readOnly && (
                    <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {expenseProvisionDetailRows.map(row => (
                  <Fragment key={row.id}>
                    <tr className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="px-2 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleExpenseDetailRow(row.id)}
                          className="text-gray-400 hover:text-[#1677FF] p-1 rounded hover:bg-blue-50 transition-colors"
                          title={expenseExpandedDetailIds.includes(row.id) ? '收起' : '展开'}
                        >
                          {expenseExpandedDetailIds.includes(row.id)
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
                      <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{calcExTaxAmount(row.currentProvisionAmount, row.taxRate)}</td>
                      <td className="px-3 py-2.5 text-gray-800 text-left font-medium whitespace-nowrap">
                        {row.currentProvisionAmount}
                      </td>
                      {!readOnly && (
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="text-[#1677FF] hover:bg-blue-50 p-1 rounded"
                            title="编辑"
                            onClick={() => handleExpenseEdit(row)}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            className="text-red-500 hover:bg-red-50 p-1 rounded"
                            title="删除"
                            onClick={() => handleExpenseDelete(row.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      )}
                    </tr>
                    {expenseExpandedDetailIds.includes(row.id) && (
                      <tr className="bg-gray-50/50 border-t border-gray-100">
                        <td colSpan={readOnly ? 10 : 11} className="px-4 py-3 pl-10">
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
              <span className="text-sm font-semibold text-gray-800">本次报账总额（不含税，元）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{expenseTotalProvisionExTax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">本次报账总额（含税，元）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{expenseTotalProvision.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
          </div>
        </div>

        {/* 4. 支付明细信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">支付明细信息</h3>
            <span className="text-xs text-gray-400">【{paymentDetailRows.length}】</span>
          </div>
          {!readOnly && (
          <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-2">
            <span className="shrink-0">⚠</span>
            <span>温馨提示：支付金额大于 0 时，需由客户经理提供回款证明材料</span>
          </div>
          )}
          <div className="overflow-x-auto overflow-y-hidden border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务大类</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务小类</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务活动</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">本次报账金额（含税，元）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">本次支付金额（含税，元）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">本次核销金额（含税，元）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">收款账号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">收款方名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">联行号</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paymentDetailRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  paymentDetailRows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.businessCategory}</td>
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.businessSubCategory}</td>
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.businessActivity}</td>
                      <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{row.currentReportAmount}</td>
                      <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{row.currentPaymentAmount}</td>
                      <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{row.currentWriteoffAmount}</td>
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.paymentAccount}</td>
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.payeeName}</td>
                      <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{row.bankCode}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end items-baseline gap-6">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">本次支付总额（含税，元）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{expenseTotalPayment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">本次核销总额（含税，元）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{expenseTotalWriteoff.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
          </div>
        </div>

        {/* 5. 回款证明信息（只读详情，复制自项目类费用报账单审批页面） */}
        {readOnly && (
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
        )}

        {/* 6. 流程轨迹 - 默认折叠（只读详情，复制自项目类费用报账单审批页面） */}
        {readOnly && (
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
        )}

        {/* 8. 按钮区 */}
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
                提交报账系统
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========== 新增费用明细弹框（复制自新增报账明细弹框） ========== */}
      {showProvisionModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50" onClick={() => setShowProvisionModal(false)}>
          <div className="bg-white rounded-lg shadow-xl w-[1200px] max-w-[95vw] max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">新增费用明细</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProvisionModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
              <div>
                {/* 第一个合同：费用池订单明细（先选择费用池订单，再加载支出计划明细） */}
                {expenseModalIsFirstContract && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                      <h4 className="text-sm font-semibold text-gray-800">费用池订单明细</h4>
                    </div>
                    <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-2">
                      <span className="shrink-0">⚠</span>
                      <span>温馨提示：当前框架合同下存在采购订单，请选择费用池订单报账</span>
                    </div>
                    <div className="border border-gray-100 rounded-md overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr className="text-gray-500">
                            <th className="w-10 px-3 py-2 text-left">
                              <span className="sr-only">选择</span>
                            </th>
                            <th className="px-3 py-2 text-left font-medium whitespace-nowrap">全网项目编码</th>
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
                          {mockExpensePoolDetailList.map(item => (
                            <tr
                              key={item.id}
                              className={clsx(
                                'cursor-pointer transition-colors',
                                expenseModalSelectedPoolId === item.id ? 'bg-blue-50' : 'hover:bg-blue-50/50'
                              )}
                              onClick={() => handleExpenseModalSelectPool(item.id)}
                            >
                              <td className="px-3 py-2.5">
                                <input
                                  type="radio"
                                  name="expense-modal-pool-order"
                                  checked={expenseModalSelectedPoolId === item.id}
                                  onChange={() => handleExpenseModalSelectPool(item.id)}
                                  className="w-4 h-4 text-blue-600"
                                />
                              </td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.netProjectCode}</td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.poolOrderNo}</td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.poolOrderLineNo}</td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.productName}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.materialQuantity}</td>
                              <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{item.amountWithoutTax}</td>
                              <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{item.taxAmount}</td>
                              <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">
                                {(parseFloat(item.amountWithoutTax.replace(/,/g, '')) + parseFloat(item.taxAmount.replace(/,/g, '')))
                                  .toFixed(2)
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {/* 支出计划明细模块 */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                    <h4 className="text-sm font-semibold text-gray-800">支出计划明细</h4>
                  </div>
                  <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-2">
                    <span className="shrink-0">⚠</span>
                    <span>温馨提示：可报账金额 = 计划支出金额 × 收入确认进度 - 累计已报账金额；收入确认进度 = 实际出账总金额（已出账+本月发起出账成功） / 计划出账总金额；所有金额都为含税金额，单位元</span>
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
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">可报账金额</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {expenseModalPlanList.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-3 py-8 text-center text-gray-400">
                            {expenseModalIsFirstContract ? '请先选择费用池订单' : '暂无数据'}
                          </td>
                        </tr>
                      ) : (
                      expenseModalPlanList.map(item => (
                        <Fragment key={item.id}>
                          <tr
                            className={clsx(
                              'cursor-pointer transition-colors',
                              expenseModalSelectedPlanId === item.id ? 'bg-blue-50' : 'hover:bg-blue-50/50'
                            )}
                            onClick={() => setExpenseModalSelectedPlanId(item.id)}
                          >
                            <td className="px-3 py-2.5">
                              <input
                                type="radio"
                                name="expense-modal-plan"
                                checked={expenseModalSelectedPlanId === item.id}
                                onChange={() => setExpenseModalSelectedPlanId(item.id)}
                                className="w-4 h-4 text-blue-600"
                              />
                            </td>
                            <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.productName}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.businessCategory}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.businessSubCategory}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.businessActivity}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.taxRate}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.incomeConfirmProgress}</td>
                            <td className="px-3 py-2.5 text-gray-700 text-left whitespace-nowrap">{item.cumulativeReimbursedAmount}</td>
                            <td className={clsx(
                              'px-3 py-2.5 text-gray-800 text-left whitespace-nowrap',
                              expenseModalSelectedPlanId === item.id ? 'bg-blue-50' : 'bg-white'
                            )}>{item.availableProvisionAmount}</td>
                          </tr>
                          {expenseModalSelectedPlanId === item.id && (
                            <tr className="bg-gray-50/50 border-t border-gray-100">
                              <td colSpan={9} className="px-4 py-3 pl-10">
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
              </div>

              {/* ========== 支付明细信息（复制自支付明细编辑弹框，独立维护） ========== */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">支付明细信息</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                  {/* 支付类型 */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>支付类型
                    </label>
                    <div className="flex-1 min-w-0">
                      <select
                        value={expenseModalPaymentType}
                        onChange={(e) => setExpenseModalPaymentType(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="正常支付">正常支付</option>
                        <option value="代缴代扣">代缴代扣</option>
                        <option value="员工垫支">员工垫支</option>
                      </select>
                    </div>
                  </div>
                  {/* 本次报账金额（含税，元） */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>本次报账金额（含税，元）
                    </label>
                    <div className="flex-1 min-w-0">
                      <NumberInput
                        value={expenseModalProvisionAmount}
                        onChange={setExpenseModalProvisionAmount}
                        decimals={2}
                        placeholder="请输入本次报账金额"
                      />
                    </div>
                  </div>
                  {/* 本次报账金额（不含税，元）- 自动计算，不可编辑 */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>本次报账金额（不含税，元）
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                        {(() => {
                          const amt = parseFloat((expenseModalProvisionAmount || '0').replace(/,/g, ''))
                          const rateStr = expenseModalSelectedPlan?.taxRate
                          if (!amt || !rateStr) return ''
                          const rate = parseFloat(rateStr.replace('%', '')) / 100
                          const noTax = amt / (1 + rate)
                          return noTax.toFixed(2)
                        })()}
                      </div>
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
                          const amt = parseFloat((expenseModalProvisionAmount || '0').replace(/,/g, ''))
                          const rateStr = expenseModalSelectedPlan?.taxRate
                          if (!amt || !rateStr) return ''
                          const rate = parseFloat(rateStr.replace('%', '')) / 100
                          const noTax = amt / (1 + rate)
                          const tax = amt - noTax
                          return tax.toFixed(2)
                        })()}
                      </div>
                    </div>
                  </div>
                  {/* 是否需要待摊 */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>是否需要待摊
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <label className={`inline-flex items-center gap-1 cursor-pointer px-3 py-1.5 text-sm rounded-md border transition-colors ${
                          expenseModalNeedAmortization === '是'
                            ? 'bg-[#1677FF] text-white border-[#1677FF]'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                        }`}>
                          <input
                            type="radio"
                            name="expense-modal-amortization"
                            value="是"
                            checked={expenseModalNeedAmortization === '是'}
                            onChange={() => setExpenseModalNeedAmortization('是')}
                            className="sr-only"
                          />
                          是
                        </label>
                        <label className={`inline-flex items-center gap-1 cursor-pointer px-3 py-1.5 text-sm rounded-md border transition-colors ${
                          expenseModalNeedAmortization === '否'
                            ? 'bg-[#1677FF] text-white border-[#1677FF]'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                        }`}>
                          <input
                            type="radio"
                            name="expense-modal-amortization"
                            value="否"
                            checked={expenseModalNeedAmortization === '否'}
                            onChange={() => setExpenseModalNeedAmortization('否')}
                            className="sr-only"
                          />
                          否
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* 待摊日期 - 仅"是"时展示 */}
                  {expenseModalNeedAmortization === '是' && (
                    <>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                          <span className="text-red-500 mr-0.5">*</span>待摊日期
                        </label>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <input
                            type="date"
                            value={expenseModalAmortizationStartDate}
                            onChange={(e) => setExpenseModalAmortizationStartDate(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                          />
                          <span className="text-gray-400 shrink-0">～</span>
                          <input
                            type="date"
                            value={expenseModalAmortizationEndDate}
                            onChange={(e) => setExpenseModalAmortizationEndDate(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">摊销月数</label>
                        <div className="flex-1 min-w-0">
                          <input
                            type="number"
                            value={expenseModalAmortizationMonths}
                            onChange={(e) => setExpenseModalAmortizationMonths(e.target.value)}
                            placeholder="请输入摊销月数"
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {/* 本次支付金额（含税，元） */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>本次支付金额（含税，元）
                    </label>
                    <div className="flex-1 min-w-0">
                      <NumberInput
                        value={expenseModalPaymentAmount}
                        onChange={setExpenseModalPaymentAmount}
                        decimals={2}
                        placeholder="请输入本次支付金额"
                      />
                    </div>
                  </div>
                  {/* 本次核销金额（含税，元）- 自动计算，不可编辑 */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>本次核销金额（含税，元）
                    </label>
                    <div className="flex-1 min-w-0">
                      <NumberInput
                        value={expenseModalWriteoffRows.filter(w => w.checked).reduce((s, w) => s + (parseFloat(w.writeoffAmount) || 0), 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        onChange={() => {}}
                        disabled
                        decimals={2}
                      />
                    </div>
                  </div>
                  {/* 收款账号 - 仅本次支付金额不为0时展示 */}
                  {expenseModalPaymentAmount && parseFloat(expenseModalPaymentAmount) !== 0 && (
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                        <span className="text-red-500 mr-0.5">*</span>收款账号
                      </label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={expenseModalPayeeAccount}
                          onChange={(e) => handleExpenseModalPayeeAccountChange(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="">请选择收款账号</option>
                          {mockPayeeAccountList.map(acc => (
                            <option key={acc.account} value={acc.account}>{acc.account}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 收款方信息 - 仅本次支付金额不为0时展示 */}
                {expenseModalPaymentAmount && parseFloat(expenseModalPaymentAmount) !== 0 && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                    {/* 开户行 - 自动带出，不可修改 */}
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                        <span className="text-red-500 mr-0.5">*</span>开户行
                      </label>
                      <div className="flex-1 min-w-0">
                        <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                          {expenseModalBankName || <span className="text-gray-400">选择收款账号后自动带出</span>}
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
                          {expenseModalPayeeName || <span className="text-gray-400">选择收款账号后自动带出</span>}
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
                          {expenseModalBankCode || <span className="text-gray-400">选择收款账号后自动带出</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ========== 核销明细信息（复制自支付明细编辑弹框，独立维护） ========== */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">核销明细信息</h4>
                </div>
                <div className="border border-gray-100 rounded-md overflow-auto max-h-[280px]">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="text-gray-500">
                        <th className="w-10 px-3 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={expenseModalWriteoffRows.length > 0 && expenseModalWriteoffRows.filter(w => (parseFloat(w.remainingWriteoffAmount.replace(/,/g, '')) || 0) > 0).every(w => w.checked)}
                            onChange={(e) => setExpenseModalWriteoffRows(prev => prev.map(w => {
                              const remaining = parseFloat(w.remainingWriteoffAmount.replace(/,/g, '')) || 0
                              if (remaining <= 0) return w
                              return { ...w, checked: e.target.checked, writeoffAmount: e.target.checked ? w.remainingWriteoffAmount.replace(/,/g, '') : '' }
                            }))}
                            className="w-3.5 h-3.5 accent-[#1677FF]"
                          />
                        </th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">AICT预付款单号</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">预付款单行号</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">ERP预付款单号</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">预付款时间</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">预付款金额（元）</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">剩余核销金额（元）</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">本次核销金额（元）</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {expenseModalWriteoffRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-8 text-center text-gray-400">暂无数据</td>
                        </tr>
                      ) : (
                        expenseModalWriteoffRows.map(item => {
                          const remaining = parseFloat(item.remainingWriteoffAmount.replace(/,/g, '')) || 0
                          const disabled = remaining <= 0
                          return (
                            <tr key={item.id} className={clsx(item.checked && 'bg-blue-50')}>
                              <td className="px-3 py-2.5">
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  disabled={disabled}
                                  onChange={() => handleExpenseModalWriteoffCheck(item.id)}
                                  className="w-3.5 h-3.5 accent-[#1677FF] disabled:cursor-not-allowed"
                                />
                              </td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.aictPrepayNo}</td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.prepayLineNo}</td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.erpPrepayNo}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.prepayDate}</td>
                              <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{item.prepayAmount}</td>
                              <td className={clsx('px-3 py-2.5 text-left whitespace-nowrap', remaining <= 0 ? 'text-gray-400' : 'text-gray-800')}>{item.remainingWriteoffAmount}</td>
                              <td className="px-3 py-2.5 text-left whitespace-nowrap">
                                <div className={clsx('px-2 py-1 text-sm', item.checked ? 'text-gray-800' : 'text-gray-400')}>
                                  {item.checked ? item.remainingWriteoffAmount : '0.00'}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowProvisionModal(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
              <button
                type="button"
                onClick={handleProvisionConfirm}
                disabled={!expenseModalSelectedPlanId || !expenseModalProvisionAmount}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 费用明细 - 修改弹框（复制自新增费用明细弹框，携带表格行数据初始化） ========== */}
      {expenseEditProvisionDetailModalVisible && expenseCurrentEditRow && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setExpenseEditProvisionDetailModalVisible(false)}>
          <div
            className="bg-white rounded-lg shadow-xl w-[1200px] max-w-[95vw] max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">修改费用明细</h3>
              </div>
              <button
                type="button"
                onClick={() => setExpenseEditProvisionDetailModalVisible(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 140px)' }}>
              {/* ========== 支付明细信息（复制自新增费用明细弹框） ========== */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">支付明细信息</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                  {/* 支付类型 */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>支付类型
                    </label>
                    <div className="flex-1 min-w-0">
                      <select
                        value={expenseModalPaymentType}
                        onChange={(e) => setExpenseModalPaymentType(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="正常支付">正常支付</option>
                        <option value="代缴代扣">代缴代扣</option>
                        <option value="员工垫支">员工垫支</option>
                      </select>
                    </div>
                  </div>
                  {/* 本次报账金额（含税，元） */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>本次报账金额（含税，元）
                    </label>
                    <div className="flex-1 min-w-0">
                      <NumberInput
                        value={expenseModalProvisionAmount}
                        onChange={setExpenseModalProvisionAmount}
                        decimals={2}
                        placeholder="请输入本次报账金额"
                      />
                    </div>
                  </div>
                  {/* 本次报账金额（不含税，元）- 自动计算，不可编辑 */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>本次报账金额（不含税，元）
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="px-3 py-2 min-h-[38px] flex items-center text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                        {(() => {
                          const amt = parseFloat((expenseModalProvisionAmount || '0').replace(/,/g, ''))
                          const rateStr = expenseCurrentEditRow?.taxRate
                          if (!amt || !rateStr) return ''
                          const rate = parseFloat(rateStr.replace('%', '')) / 100
                          const noTax = amt / (1 + rate)
                          return noTax.toFixed(2)
                        })()}
                      </div>
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
                          const amt = parseFloat((expenseModalProvisionAmount || '0').replace(/,/g, ''))
                          const rateStr = expenseCurrentEditRow?.taxRate
                          if (!amt || !rateStr) return ''
                          const rate = parseFloat(rateStr.replace('%', '')) / 100
                          const noTax = amt / (1 + rate)
                          const tax = amt - noTax
                          return tax.toFixed(2)
                        })()}
                      </div>
                    </div>
                  </div>
                  {/* 是否需要待摊 */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>是否需要待摊
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <label className={`inline-flex items-center gap-1 cursor-pointer px-3 py-1.5 text-sm rounded-md border transition-colors ${
                          expenseModalNeedAmortization === '是'
                            ? 'bg-[#1677FF] text-white border-[#1677FF]'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                        }`}>
                          <input
                            type="radio"
                            name="expense-edit-amortization"
                            value="是"
                            checked={expenseModalNeedAmortization === '是'}
                            onChange={() => setExpenseModalNeedAmortization('是')}
                            className="sr-only"
                          />
                          是
                        </label>
                        <label className={`inline-flex items-center gap-1 cursor-pointer px-3 py-1.5 text-sm rounded-md border transition-colors ${
                          expenseModalNeedAmortization === '否'
                            ? 'bg-[#1677FF] text-white border-[#1677FF]'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                        }`}>
                          <input
                            type="radio"
                            name="expense-edit-amortization"
                            value="否"
                            checked={expenseModalNeedAmortization === '否'}
                            onChange={() => setExpenseModalNeedAmortization('否')}
                            className="sr-only"
                          />
                          否
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* 待摊日期 - 仅"是"时展示 */}
                  {expenseModalNeedAmortization === '是' && (
                    <>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                          <span className="text-red-500 mr-0.5">*</span>待摊日期
                        </label>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <input
                            type="date"
                            value={expenseModalAmortizationStartDate}
                            onChange={(e) => setExpenseModalAmortizationStartDate(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                          />
                          <span className="text-gray-400 shrink-0">～</span>
                          <input
                            type="date"
                            value={expenseModalAmortizationEndDate}
                            onChange={(e) => setExpenseModalAmortizationEndDate(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </div>
                      </div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">摊销月数</label>
                        <div className="flex-1 min-w-0">
                          <input
                            type="number"
                            value={expenseModalAmortizationMonths}
                            onChange={(e) => setExpenseModalAmortizationMonths(e.target.value)}
                            placeholder="请输入摊销月数"
                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {/* 本次支付金额（含税，元） */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>本次支付金额（含税，元）
                    </label>
                    <div className="flex-1 min-w-0">
                      <NumberInput
                        value={expenseModalPaymentAmount}
                        onChange={setExpenseModalPaymentAmount}
                        decimals={2}
                        placeholder="请输入本次支付金额"
                      />
                    </div>
                  </div>
                  {/* 本次核销金额（含税，元）- 自动计算，不可编辑 */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                      <span className="text-red-500 mr-0.5">*</span>本次核销金额（含税，元）
                    </label>
                    <div className="flex-1 min-w-0">
                      <NumberInput
                        value={expenseModalWriteoffRows.filter(w => w.checked).reduce((s, w) => s + (parseFloat(w.writeoffAmount) || 0), 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        onChange={() => {}}
                        disabled
                        decimals={2}
                      />
                    </div>
                  </div>
                  {/* 收款账号 - 仅本次支付金额不为0时展示 */}
                  {expenseModalPaymentAmount && parseFloat(expenseModalPaymentAmount) !== 0 && (
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                        <span className="text-red-500 mr-0.5">*</span>收款账号
                      </label>
                      <div className="flex-1 min-w-0">
                        <select
                          value={expenseModalPayeeAccount}
                          onChange={(e) => handleExpenseModalPayeeAccountChange(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="">请选择收款账号</option>
                          {mockPayeeAccountList.map(acc => (
                            <option key={acc.account} value={acc.account}>{acc.account}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* 收款方信息 - 仅本次支付金额不为0时展示 */}
                {expenseModalPaymentAmount && parseFloat(expenseModalPaymentAmount) !== 0 && (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                    {/* 开户行 - 自动带出，不可修改 */}
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                        <span className="text-red-500 mr-0.5">*</span>开户行
                      </label>
                      <div className="flex-1 min-w-0">
                        <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 truncate">
                          {expenseModalBankName || <span className="text-gray-400">选择收款账号后自动带出</span>}
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
                          {expenseModalPayeeName || <span className="text-gray-400">选择收款账号后自动带出</span>}
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
                          {expenseModalBankCode || <span className="text-gray-400">选择收款账号后自动带出</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ========== 核销明细信息（复制自新增费用明细弹框） ========== */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">核销明细信息</h4>
                </div>
                <div className="border border-gray-100 rounded-md overflow-auto max-h-[280px]">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="text-gray-500">
                        <th className="w-10 px-3 py-2 text-left">
                          <input
                            type="checkbox"
                            checked={expenseModalWriteoffRows.length > 0 && expenseModalWriteoffRows.filter(w => (parseFloat(w.remainingWriteoffAmount.replace(/,/g, '')) || 0) > 0).every(w => w.checked)}
                            onChange={(e) => setExpenseModalWriteoffRows(prev => prev.map(w => {
                              const remaining = parseFloat(w.remainingWriteoffAmount.replace(/,/g, '')) || 0
                              if (remaining <= 0) return w
                              return { ...w, checked: e.target.checked, writeoffAmount: e.target.checked ? w.remainingWriteoffAmount.replace(/,/g, '') : '' }
                            }))}
                            className="w-3.5 h-3.5 accent-[#1677FF]"
                          />
                        </th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">AICT预付款单号</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">预付款单行号</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">ERP预付款单号</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">预付款时间</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">预付款金额（元）</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">剩余核销金额（元）</th>
                        <th className="px-3 py-2 text-left font-medium whitespace-nowrap">本次核销金额（元）</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {expenseModalWriteoffRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-3 py-8 text-center text-gray-400">暂无数据</td>
                        </tr>
                      ) : (
                        expenseModalWriteoffRows.map(item => {
                          const remaining = parseFloat(item.remainingWriteoffAmount.replace(/,/g, '')) || 0
                          const disabled = remaining <= 0
                          return (
                            <tr key={item.id} className={clsx(item.checked && 'bg-blue-50')}>
                              <td className="px-3 py-2.5">
                                <input
                                  type="checkbox"
                                  checked={item.checked}
                                  disabled={disabled}
                                  onChange={() => handleExpenseModalWriteoffCheck(item.id)}
                                  className="w-3.5 h-3.5 accent-[#1677FF] disabled:cursor-not-allowed"
                                />
                              </td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.aictPrepayNo}</td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.prepayLineNo}</td>
                              <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.erpPrepayNo}</td>
                              <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.prepayDate}</td>
                              <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{item.prepayAmount}</td>
                              <td className={clsx('px-3 py-2.5 text-left whitespace-nowrap', remaining <= 0 ? 'text-gray-400' : 'text-gray-800')}>{item.remainingWriteoffAmount}</td>
                              <td className="px-3 py-2.5 text-left whitespace-nowrap">
                                <div className={clsx('px-2 py-1 text-sm', item.checked ? 'text-gray-800' : 'text-gray-400')}>
                                  {item.checked ? item.remainingWriteoffAmount : '0.00'}
                                </div>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setExpenseEditProvisionDetailModalVisible(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
              <button
                type="button"
                onClick={confirmExpenseEdit}
                disabled={!expenseModalProvisionAmount || parseFloat(expenseModalProvisionAmount) <= 0}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4" />
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 费用明细 - 删除确认弹框 ========== */}
      {expenseDeleteConfirmVisible && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setExpenseDeleteConfirmVisible(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[420px] max-w-[95vw] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-red-500 text-lg font-bold">!</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-semibold text-gray-900 mb-1">温馨提示</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    确定要删除该报账明细信息吗？
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setExpenseDeleteConfirmVisible(false)}
                className="px-5 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmExpenseDelete}
                className="px-5 py-1.5 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 支付明细 - 编辑弹框 ========== */}
      {paymentEditModalVisible && paymentEditRow && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setPaymentEditModalVisible(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[1000px] max-w-[95vw] max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">修改支付明细</h3>
              <button
                type="button"
                onClick={() => setPaymentEditModalVisible(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto flex-1">
              {/* 模块一：支付信息 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h4 className="text-sm font-semibold text-gray-800">支付信息</h4>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                {/* 业务大类 - 只读 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">业务大类</label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {paymentEditRow.businessCategory}
                    </div>
                  </div>
                </div>
                {/* 业务小类 - 只读 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">业务小类</label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {paymentEditRow.businessSubCategory}
                    </div>
                  </div>
                </div>
                {/* 业务活动 - 只读 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">业务活动</label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {paymentEditRow.businessActivity}
                    </div>
                  </div>
                </div>
                {/* 支付类型 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">支付类型</label>
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
                {/* 本次报账金额 - 只读 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">本次报账金额</label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-right">
                      {paymentEditRow.currentReportAmount}
                    </div>
                  </div>
                </div>
                {/* 本次支付金额 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">本次支付金额</label>
                  <div className="flex-1 min-w-0">
                    <input
                      type="number"
                      value={paymentEditAmount}
                      onChange={(e) => setPaymentEditAmount(e.target.value)}
                      placeholder="请输入本次支付金额"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white text-right"
                    />
                  </div>
                </div>
                {/* 本次核销金额 - 自动计算 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">本次核销金额</label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-right">
                      {writeoffDetailRows.filter(w => w.checked).reduce((s, w) => s + (parseFloat(w.writeoffAmount) || 0), 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    </div>
                  </div>
                </div>
                {/* 收款账号 - 放在本次核销金额后面，仅本次支付金额不为0时展示 */}
                {paymentEditAmount && parseFloat(paymentEditAmount) !== 0 && (
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
                )}
              </div>

              {/* 收款方信息 - 仅本次支付金额不为0时展示 */}
              {paymentEditAmount && parseFloat(paymentEditAmount) !== 0 && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
                  {/* 开户行 - 自动带出，不可修改 */}
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">开户行</label>
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
              )}

              {/* 模块二：核销明细信息 */}
              <div className="flex items-center gap-2 mb-3 mt-4">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h4 className="text-sm font-semibold text-gray-800">核销明细信息</h4>
              </div>
              <div className="border border-gray-100 rounded-md overflow-auto max-h-[280px]">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="w-10 px-3 py-2 text-left">
                        <input
                          type="checkbox"
                          checked={writeoffDetailRows.length > 0 && writeoffDetailRows.filter(w => (parseFloat(w.remainingWriteoffAmount.replace(/,/g, '')) || 0) > 0).every(w => w.checked)}
                          onChange={(e) => setWriteoffDetailRows(prev => prev.map(w => {
                            const remaining = parseFloat(w.remainingWriteoffAmount.replace(/,/g, '')) || 0
                            if (remaining <= 0) return w
                            return { ...w, checked: e.target.checked }
                          }))}
                          className="w-3.5 h-3.5 accent-[#1677FF]"
                        />
                      </th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">AICT预付款单号</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">预付款单行号</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">ERP预付款单号</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">预付款时间</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">预付款金额（元）</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">剩余核销金额（元）</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">本次核销金额（元）</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {writeoffDetailRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center text-gray-400">暂无数据</td>
                      </tr>
                    ) : (
                      writeoffDetailRows.map(item => {
                        const remaining = parseFloat(item.remainingWriteoffAmount.replace(/,/g, '')) || 0
                        const disabled = remaining <= 0
                        return (
                          <tr key={item.id} className={clsx(item.checked && 'bg-blue-50')}>
                            <td className="px-3 py-2.5">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                disabled={disabled}
                                onChange={() => handleWriteoffCheck(item.id)}
                                className="w-3.5 h-3.5 accent-[#1677FF] disabled:cursor-not-allowed"
                              />
                            </td>
                            <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.aictPrepayNo}</td>
                            <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.prepayLineNo}</td>
                            <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{item.erpPrepayNo}</td>
                            <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{item.prepayDate}</td>
                            <td className="px-3 py-2.5 text-gray-800 text-left whitespace-nowrap">{item.prepayAmount}</td>
                            <td className={clsx('px-3 py-2.5 text-left whitespace-nowrap', remaining <= 0 ? 'text-gray-400' : 'text-gray-800')}>{item.remainingWriteoffAmount}</td>
                            <td className="px-3 py-2.5 text-left whitespace-nowrap">
                              <input
                                type="number"
                                value={disabled ? '0' : item.writeoffAmount}
                                onChange={(e) => handleWriteoffAmountChange(item.id, e.target.value)}
                                disabled={disabled || !item.checked}
                                placeholder="0.00"
                                className="w-28 px-2 py-1 text-sm text-left border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
                              />
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
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

      {/* ========== 回款证明弹框（只读详情，复制自项目类费用报账单审批页面） ========== */}
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
