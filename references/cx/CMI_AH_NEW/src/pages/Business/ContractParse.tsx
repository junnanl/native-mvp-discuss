import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Check,
  RotateCcw,
  X,
  Plus,
  Edit,
  Trash2,
  FileText,
  Download,
  Upload,
  HelpCircle
} from 'lucide-react'
import { useModal } from '@/components/Modal'
import { getContractInfo } from '@/data/mock'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import ContractAttachments from '@/components/ContractAttachments'
import ProcessInfo from '@/components/ProcessInfo'
import ProcessTrail, { type ProcessTrailItem } from '@/components/ProcessTrail'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import DataTable from '@/components/plan-modules/common/DataTable'
import SectionBlock from '@/components/plan-modules/common/SectionBlock'
import PaymentPlansDisplay from '@/components/plan-modules/common/PaymentPlansDisplay'
import ModalShell from '@/components/plan-modules/common/ModalShell'
import ModalFooter from '@/components/plan-modules/common/ModalFooter'
import FormRow from '@/components/plan-modules/common/FormRow'
import SegmentedSelect from '@/components/plan-modules/common/SegmentedSelect'
import NumberInput from '@/components/plan-modules/common/NumberInput'
import DateInput from '@/components/plan-modules/common/DateInput'
import MonthPicker from '@/components/plan-modules/common/MonthPicker'
import PaymentPlanSection, { validatePaymentPlans, defaultMilestones } from '@/components/PaymentPlanSection'

import PaymentPlanCostDisplay from '@/components/plan-modules/common/PaymentPlanCostDisplay'
import type { ITIncomeRow, CTIncomeRow, CostRow, InvestmentRow, StageReimburseRow } from '@/components/plan-modules/types'
import { expenseContentITOptions, expenseContentCTOptions, budgetTypeOptions, getBusinessSubject, contractStages, itTariffTaxMap, itTariffMgmtNameMap, itTariffCoaMap, itProductOptions, itTariffOptions, ctTariffTaxMap, ctTariffMgmtNameMap, ctTariffCoaMap, ctTariffOptions, yesNoOptions, ctProductOptions, ctProductTariffMap, ctProductTypeProductNameMap, ctProductNameTariffMap, parseCtProductName, isCtBandwidthRequired } from '@/components/plan-modules/constants'
import { calculateExcludingTax } from '@/lib/utils'

// 审批人选项
const approverOptions = [
  '张三（解决方案经理）',
  '李四（解决方案经理）',
  '王五（解决方案经理）',
  '赵六（解决方案经理）',
  '钱七（解决方案经理）',
  '孙八（解决方案经理）',
  '周九（解决方案经理）',
  '吴十（解决方案经理）',
  '郑一（解决方案经理）',
  '冯二（解决方案经理）'
]

// ============================================================
// 主页面
// ============================================================
interface ContractParseProps {
  onNavigate?: (path: string) => void
  contractId?: string
  readOnly?: boolean
  parseType?: 'forward' | 'backward'
}

const typeKeyMap: Record<string, string> = {
  income: '收入类',
  'income-expense': '有收有支类',
  expense: '支出类'
}

// 付款计划项
interface PaymentPlanItem {
  id: string
  milestone: string
  amount: string
  paymentDate: string
  transferDate: string
}

// IT 成本计划行
interface ITCostPlanRow {
  id: string
  productName: string
  plannedExpense: string
  budgetTariffExpense?: string
  taxRate: string
  tariffName: string
  plannedTariffExpense: string
  maxTariffAmount: string
  shareType: string
  sharePeriod: string
  costPaymentDate: string
  mgmtProduct: string
  coaSubject: string
  paymentPlans?: PaymentPlanItem[]
}

const statusMap: Record<string, string> = {
  executing: '履行中',
  revoked: '撤销',
  signed: '已签订',
  changing: '变更中',
  draft: '草稿',
  releasing: '解除中',
  released: '已解除',
  completed: '履行完毕',
  voiding: '作废中',
  voided: '已作废',
  reviewing: '审核中',
  reviewFailed: '审核不通过',
  reviewPassed: '审核通过'
}

// 订单信息 - 归属地市枚举
const cityOptions = [
  '省公司',
  '合肥分公司',
  '芜湖分公司',
  '蚌埠分公司',
  '阜阳分公司',
  '淮南分公司',
  '马鞍山分公司',
  '安庆分公司',
  '滁州分公司',
  '六安分公司',
  '宣城分公司',
  '阜南分公司',
  '巢湖分公司',
  '淮北分公司',
  '铜陵分公司',
  '池州分公司',
  '黄山分公司'
]

// 订单信息 - 客户经理枚举
const customerManagerOptions = ['王芳', '李明', '张凯', '赵静', '陈强']

// 订单信息 - 订单负责人枚举
const orderOwnerOptions = ['刘伟', '孙磊', '周杰', '吴敏', '郑昊']

// 订单信息 - 表头
const orderTableHeaders = [
  '订单编码',
  '订单名称',
  '归属地市',
  '客户经理',
  '订单负责人',
  '集团客户编码',
  '集团客户名称',
  '订单金额（元，含税）',
  '订单金额（元，不含税）',
  '订单描述',
  '订单状态',
  '创建时间',
  '操作'
]

// 订单信息 - 表单初始值
const initialOrderForm = {
  orderCode: '',
  orderName: '',
  city: '',
  customerManager: '',
  orderOwner: '',
  groupCustomerCode: 'CUS000001',
  groupCustomerName: '',
  amountWithTax: '',
  amountNoTax: '',
  description: ''
}

// 订单信息 - 列表行
interface OrderRow {
  id: string
  orderCode: string
  orderName: string
  city: string
  customerManager: string
  orderOwner: string
  groupCustomerCode: string
  groupCustomerName: string
  amountWithTax: string
  amountNoTax: string
  description: string
  status: string
  createTime: string
}

// 收入类 mock 数据
const mockITIncome: ITIncomeRow[] = [
  {
    id: 'it-demo-1',
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
    isContractAsset: '否',
    plannedOrderDate: '2026-07-01',
    billingStartDate: '2026-07',
    paymentPlans: [
      { id: 'pp-1-1', milestone: '初验', amount: '240,000', paymentDate: '2026-07', transferDate: '2026-07-15' },
      { id: 'pp-1-2', milestone: '初验', amount: '240,000', paymentDate: '2027-01', transferDate: '2027-01-15' }
    ]
  },
  {
    id: 'it-demo-2',
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
    isContractAsset: '是',
    plannedOrderDate: '2026-08-01',
    billingStartDate: '2026-08',
    paymentPlans: [
      { id: 'pp-2-1', milestone: '到货', amount: '1,000,000', paymentDate: '2026-08', transferDate: '2026-08-20' },
      { id: 'pp-2-2', milestone: '到货', amount: '900,000', paymentDate: '2026-09', transferDate: '2026-09-20' }
    ]
  }
]

const mockCTIncome: CTIncomeRow[] = [
  {
    id: 'ct-demo-1',
    productName: '企业宽带',
    productCode: 'CT-B003',
    productFullName: '企业宽带1000M',
    packageName: '企业套餐',
    bandwidth: '1000',
    orderQuantity: '50',
    tariffName: '[1372]宽带费',
    plannedIncome: '1,200,000',
    plannedTariffAmount: '1,200,000',
    budgetTariffAmount: '1,100,000',
    taxRate: '6%',
    discount: '85',
    billingShareType: '月',
    billingSharePeriod: '36',
    isContractAsset: '否',
    plannedOrderDate: '2026-07',
    billingStartDate: '2026-07-01',
    mgmtProductCode: 'P-CT-B',
    mgmtProductName: '宽带服务',
    thirdLevelSubject: 'S1372',
    coaSubject: 'C-1372-02',
    coaSubjectName: '宽带接入服务收入',
    orderStatus: '已订购'
  },
  {
    id: 'ct-demo-2',
    productName: '数据专线',
    productCode: 'CT-D002',
    productFullName: '数据专线尊享版',
    packageName: '尊享套餐',
    bandwidth: '500',
    orderQuantity: '20',
    tariffName: '[1205]专线费',
    plannedIncome: '2,880,000',
    plannedTariffAmount: '2,880,000',
    budgetTariffAmount: '2,600,000',
    taxRate: '9%',
    discount: '90',
    billingShareType: '月',
    billingSharePeriod: '36',
    isContractAsset: '否',
    plannedOrderDate: '2026-08',
    billingStartDate: '2026-08-01',
    mgmtProductCode: 'P-CT-D',
    mgmtProductName: '专线服务',
    thirdLevelSubject: 'S1205',
    coaSubject: 'C-1205-02',
    coaSubjectName: '专线接入服务收入',
    orderStatus: '已订购'
  },
  {
    id: 'ct-demo-3',
    productName: '语音',
    productCode: 'CT-V001',
    productFullName: '语音基础服务',
    packageName: '基础套餐',
    bandwidth: '',
    orderQuantity: '300',
    tariffName: '[849]融合通信费',
    plannedIncome: '360,000',
    plannedTariffAmount: '360,000',
    budgetTariffAmount: '320,000',
    taxRate: '6%',
    discount: '80',
    billingShareType: '月',
    billingSharePeriod: '12',
    isContractAsset: '否',
    plannedOrderDate: '2026-07',
    billingStartDate: '2026-07-01',
    mgmtProductCode: 'P-CT-V',
    mgmtProductName: '融合通信服务',
    thirdLevelSubject: 'S849',
    coaSubject: 'C-849-02',
    coaSubjectName: '融合通信服务收入',
    orderStatus: '待订购'
  },
  {
    id: 'ct-demo-4',
    productName: '云计算',
    productCode: 'CT-C001',
    productFullName: '云主机基础型',
    packageName: '云服务套餐',
    bandwidth: '',
    orderQuantity: '10',
    tariffName: '[956]云服务费用',
    plannedIncome: '480,000',
    plannedTariffAmount: '480,000',
    budgetTariffAmount: '450,000',
    taxRate: '6%',
    discount: '88',
    billingShareType: '月',
    billingSharePeriod: '24',
    isContractAsset: '否',
    plannedOrderDate: '2026-09',
    billingStartDate: '2026-09-01',
    mgmtProductCode: 'P-CT-C',
    mgmtProductName: '云服务',
    thirdLevelSubject: 'S956',
    coaSubject: 'C-956-02',
    coaSubjectName: '云服务收入',
    orderStatus: '待订购'
  },
  {
    id: 'ct-demo-5',
    productName: '互联网专线',
    productCode: 'CT-INT001',
    productFullName: '互联网专线标准版',
    packageName: '互联网套餐',
    bandwidth: '200',
    orderQuantity: '5',
    tariffName: '[1205]专线费',
    plannedIncome: '900,000',
    plannedTariffAmount: '900,000',
    budgetTariffAmount: '800,000',
    taxRate: '9%',
    discount: '92',
    billingShareType: '月',
    billingSharePeriod: '36',
    isContractAsset: '否',
    plannedOrderDate: '2026-07',
    billingStartDate: '2026-07-15',
    mgmtProductCode: 'P-CT-INT',
    mgmtProductName: '专线服务',
    thirdLevelSubject: 'S1205',
    coaSubject: 'C-1205-02',
    coaSubjectName: '专线接入服务收入',
    orderStatus: '已订购'
  }
]

export default function ContractParse({ onNavigate, contractId, readOnly = false, parseType = 'forward' }: ContractParseProps) {
  const modal = useModal()
  const rawContractInfo = getContractInfo(contractId || 'CT2026060001')
  // 后向合同解析页：附件标签"前向合同"改为"后向合同"，其他页面不受影响
  const contractInfo = parseType === 'backward'
    ? {
        ...rawContractInfo,
        attachments: (rawContractInfo.attachments || []).map(a =>
          a.tag === '前向合同' ? { ...a, tag: '后向合同' } : a
        )
      }
    : rawContractInfo
  const contractType = contractInfo.typeKey

  const [itIncomeList, setItIncomeList] = useState<ITIncomeRow[]>(mockITIncome)
  const [ctIncomeList, setCtIncomeList] = useState<CTIncomeRow[]>(mockCTIncome)

  const initialITCost = (contractType === 'income-expense' || contractType === 'expense') && mockITIncome.length > 0
    ? (() => {
        const coefficient = 0.8
        const result: CostRow[] = []
        mockITIncome.forEach((income, idx) => {
          const plannedIncome = parseFloat(income.plannedIncome?.replace(/,/g, '') || '0')
          const totalExpense = (plannedIncome * coefficient).toFixed(2)
          const budgetIncome = parseFloat((income.budgetTariffAmount || income.plannedIncome || '0').replace(/,/g, ''))
          const budgetExpense = (budgetIncome * coefficient).toFixed(2)
          const expenseContent = income.productName?.includes('维保')
            ? '维保费-信息服务'
            : income.productName?.includes('设备') || income.productName?.includes('商品')
              ? '商品销售成本'
              : expenseContentITOptions[idx % expenseContentITOptions.length]

          let method = '一次性'
          let period = '1'
          let startDate = income.billingStartDate || ''
          let rows: StageReimburseRow[] = []

          if (income.billingShareType === '月') {
            const months = parseInt(income.billingSharePeriod || '12', 10)
            method = '月'
            period = String(months)
            if (months > 0 && startDate) {
              const perMonth = Math.floor((plannedIncome * coefficient / months) * 100) / 100
              const dateStr = startDate.length === 7 ? startDate : startDate.slice(0, 7)
              const [year, month] = dateStr.split('-').map(Number)
              for (let i = 0; i < months; i++) {
                const m = (month - 1 + i) % 12 + 1
                const y = year + Math.floor((month - 1 + i) / 12)
                const monthStr = `${y}-${String(m).padStart(2, '0')}`
                let amount: number
                if (i === months - 1) {
                  amount = Math.floor((plannedIncome * coefficient - perMonth * (months - 1)) * 100) / 100
                } else {
                  amount = perMonth
                }
                rows.push({ date: monthStr, amount: amount.toFixed(2) })
              }
            }
          } else if (income.paymentPlans && income.paymentPlans.length > 0) {
            method = '阶段'
            period = String(income.paymentPlans.length)
            startDate = income.paymentPlans[0]?.paymentDate || ''
            let accumulated = 0
            income.paymentPlans.forEach((plan, idx2) => {
              const planAmount = parseFloat(plan.amount?.replace(/,/g, '') || '0')
              const expenseAmount = planAmount * coefficient
              let finalAmount: number
              if (idx2 === income.paymentPlans!.length - 1) {
                finalAmount = Math.floor((plannedIncome * coefficient - accumulated) * 100) / 100
              } else {
                finalAmount = Math.floor(expenseAmount * 100) / 100
                accumulated += finalAmount
              }
              rows.push({ date: plan.paymentDate || '', amount: finalAmount.toFixed(2) })
            })
          }

          result.push({
            id: `cost-auto-it-${idx}-${Date.now()}`,
            expenseContent,
            budgetType: budgetTypeOptions[idx % budgetTypeOptions.length],
            plannedExpense: totalExpense,
            budgetExpenseAmount: budgetExpense,
            reimbursementMethod: method,
            reimbursementPeriod: period,
            reimbursementStartDate: startDate.length === 7 ? startDate : startDate.slice(0, 7),
            taxRate: income.taxRate || '',
            correspondingTariff: income.tariffName || '',
            contractStage: income.contractStage || contractStages[idx % contractStages.length],
            businessSubject: getBusinessSubject(expenseContent),
            stageReimburseRows: rows.length > 0 ? rows : undefined
          })
        })
        return result
      })()
    : []

  const initialCTCost = (contractType === 'income-expense' || contractType === 'expense') && mockCTIncome.length > 0
    ? (() => {
        const coefficient = 0.8
        const result: CostRow[] = []
        mockCTIncome.forEach((income, idx) => {
          const plannedIncome = parseFloat(income.plannedIncome?.replace(/,/g, '') || '0')
          const totalExpense = (plannedIncome * coefficient).toFixed(2)
          const expenseContent = expenseContentCTOptions[idx % expenseContentCTOptions.length]

          let method = '一次性'
          let period = '1'
          let startDate = income.billingStartDate || ''
          let rows: StageReimburseRow[] = []

          if (income.billingShareType === '月') {
            const months = parseInt(income.billingSharePeriod || '12', 10)
            method = '月'
            period = String(months)
            if (months > 0 && startDate) {
              const perMonth = Math.floor((plannedIncome * coefficient / months) * 100) / 100
              const dateStr = startDate.length === 7 ? startDate : startDate.slice(0, 7)
              const [year, month] = dateStr.split('-').map(Number)
              for (let i = 0; i < months; i++) {
                const m = (month - 1 + i) % 12 + 1
                const y = year + Math.floor((month - 1 + i) / 12)
                const monthStr = `${y}-${String(m).padStart(2, '0')}`
                let amount: number
                if (i === months - 1) {
                  amount = Math.floor((plannedIncome * coefficient - perMonth * (months - 1)) * 100) / 100
                } else {
                  amount = perMonth
                }
                rows.push({ date: monthStr, amount: amount.toFixed(2) })
              }
            }
          }

          result.push({
            id: `cost-auto-ct-${idx}-${Date.now()}`,
            expenseContent,
            budgetType: budgetTypeOptions[idx % budgetTypeOptions.length],
            plannedExpense: totalExpense,
            reimbursementMethod: method,
            reimbursementPeriod: period,
            reimbursementStartDate: startDate.length === 7 ? startDate : startDate.slice(0, 7),
            taxRate: income.taxRate || '',
            correspondingTariff: income.tariffName || '',
            contractStage: contractStages[idx % contractStages.length],
            businessSubject: getBusinessSubject(expenseContent),
            stageReimburseRows: rows.length > 0 ? rows : undefined
          })
        })
        return result
      })()
    : []

  const [itCostList, setItCostList] = useState<CostRow[]>(initialITCost)
  const [ctCostList, setCtCostList] = useState<CostRow[]>(initialCTCost)
  const [itInvestmentList, setItInvestmentList] = useState<InvestmentRow[]>([])
  const [ctInvestmentList, setCtInvestmentList] = useState<InvestmentRow[]>([])

  // IT成本计划（仅后向合同使用）
  const [costPlans, setCostPlans] = useState<ITCostPlanRow[]>([
    {
      id: 'cost-init-1',
      productName: '集成费',
      plannedExpense: '150,000',
      budgetTariffExpense: '135,000',
      taxRate: '6%',
      tariffName: '[1372]集成费',
      plannedTariffExpense: '150,000',
      maxTariffAmount: '150,000',
      shareType: '月',
      sharePeriod: '12',
      costPaymentDate: '2026-02',
      mgmtProduct: '【P7060】集成费',
      coaSubject: 'C-1372-01',
      paymentPlans: []
    },
    {
      id: 'cost-init-2',
      productName: '集成费',
      plannedExpense: '150,000',
      budgetTariffExpense: '135,000',
      taxRate: '6%',
      tariffName: '[849]集成费安装服务',
      plannedTariffExpense: '100,000',
      maxTariffAmount: '100,000',
      shareType: '月',
      sharePeriod: '12',
      costPaymentDate: '2026-02',
      mgmtProduct: '【P7060】集成费安装服务',
      coaSubject: 'C-849-01',
      paymentPlans: []
    },
    {
      id: 'cost-init-3',
      productName: '商品销售成本',
      plannedExpense: '80,000',
      budgetTariffExpense: '72,000',
      taxRate: '13%',
      tariffName: '[956]商品销售成本',
      plannedTariffExpense: '80,000',
      maxTariffAmount: '80,000',
      shareType: '一次性',
      sharePeriod: '1',
      costPaymentDate: '2026-03',
      mgmtProduct: '【P7061】商品销售成本',
      coaSubject: 'C-956-01',
      paymentPlans: []
    }
  ])

  // 付款计划弹框状态
  const [paymentPlanModalState, setPaymentPlanModalState] = useState<{
    visible: boolean
    costRowId: string
    paymentPlans: PaymentPlanItem[]
    plannedExpense: string
  }>({ visible: false, costRowId: '', paymentPlans: [], plannedExpense: '' })

  // IT收入计划弹框状态
  const [itIncomeModalState, setItIncomeModalState] = useState<{
    visible: boolean
    editingRow: ITIncomeRow | null
    productName?: string
    isNew: boolean
  }>({ visible: false, editingRow: null, isNew: false })
  const [itIncomeViewingPlans, setItIncomeViewingPlans] = useState<ITIncomeRow | null>(null)
  const [itIncomePaymentPlans, setItIncomePaymentPlans] = useState<{ id: string; milestone: string; amount: string; paymentDate: string; transferDate: string }[]>([])

  const openItIncomeModal = (row?: ITIncomeRow, productName?: string) => {
    if (row) {
      setItIncomePaymentPlans(row.paymentPlans || [])
      setItIncomeModalState({ visible: true, editingRow: row, productName, isNew: false })
    } else {
      setItIncomePaymentPlans([])
      const existingProduct = itIncomeList.find(r => r.productName === productName)
      setItIncomeModalState({
        visible: true,
        editingRow: {
          id: '',
          productName: productName || '',
          tariffName: '',
          mgmtProductCode: '',
          mgmtProductName: '',
          thirdLevelSubject: '',
          coaSubject: '',
          taxRate: existingProduct?.taxRate || '',
          plannedIncome: existingProduct?.plannedIncome || '',
          plannedTariffAmount: '',
          contractStage: '初验',
          billingShareType: '月',
          billingSharePeriod: '12',
          isContractAsset: '否',
          plannedOrderDate: '',
          billingStartDate: '',
          paymentPlans: []
        },
        productName,
        isNew: true
      })
    }
  }

  const closeItIncomeModal = () => {
    setItIncomeModalState({ visible: false, editingRow: null, isNew: false })
    setItIncomePaymentPlans([])
  }

  const handleItIncomeSubmit = (row: ITIncomeRow) => {
    if (itIncomeModalState.isNew) {
      const productName = itIncomeModalState.productName || row.productName
      setItIncomeList(prev => [...prev, { ...row, id: 'it-' + Date.now(), productName, paymentPlans: itIncomePaymentPlans }].sort((a, b) => a.productName.localeCompare(b.productName)))
    } else {
      setItIncomeList(prev => prev.map(r => r.id === itIncomeModalState.editingRow!.id ? { ...row, paymentPlans: itIncomePaymentPlans } : r).sort((a, b) => a.productName.localeCompare(b.productName)))
    }
    closeItIncomeModal()
  }

  // CT收入计划弹框状态
  const [ctIncomeModalState, setCtIncomeModalState] = useState<{
    visible: boolean
    editingRow: CTIncomeRow | null
    productName?: string
    isNew: boolean
  }>({ visible: false, editingRow: null, isNew: false })
  const [ctProductDisplay, setCtProductDisplay] = useState<string>('')

  const openCtIncomeModal = (row?: CTIncomeRow, productName?: string) => {
    if (row) {
      const initialProductDisplay = row.productFullName
        ? `【${row.productCode || '-'}】${row.productFullName}`
        : ''
      setCtProductDisplay(initialProductDisplay)
      setCtIncomeModalState({ visible: true, editingRow: row, productName, isNew: false })
    } else {
      setCtProductDisplay('')
      setCtIncomeModalState({
        visible: true,
        editingRow: {
          id: '',
          productName: productName || '',
          packageName: '',
          productCode: '',
          productFullName: '',
          bandwidth: '',
          orderQuantity: '',
          tariffName: '',
          plannedIncome: '',
          plannedTariffAmount: '',
          budgetTariffAmount: '',
          taxRate: '',
          discount: '',
          billingShareType: '月',
          billingSharePeriod: '12',
          plannedOrderDate: '',
          billingStartDate: '',
          mgmtProductCode: '',
          mgmtProductName: '',
          thirdLevelSubject: '',
          coaSubject: ''
        },
        productName,
        isNew: true
      })
    }
  }

  const closeCtIncomeModal = () => {
    setCtIncomeModalState({ visible: false, editingRow: null, isNew: false })
    setCtProductDisplay('')
  }

  const handleCtProductChange = (v: string) => {
    setCtIncomeModalState(prev => ({
      ...prev,
      editingRow: prev.editingRow ? {
        ...prev.editingRow,
        productName: v,
        productCode: '',
        productFullName: '',
        tariffName: '',
        taxRate: '',
        mgmtProductName: '',
        coaSubject: ''
      } : null
    }))
    setCtProductDisplay('')
  }

  const handleCtProductNameChange = (v: string) => {
    const { code, name } = parseCtProductName(v)
    const tariffOptions = ctProductNameTariffMap[v] || []
    const firstTariff = tariffOptions.length === 1 ? tariffOptions[0] : ''
    setCtIncomeModalState(prev => ({
      ...prev,
      editingRow: prev.editingRow ? {
        ...prev.editingRow,
        productCode: code,
        productFullName: name,
        tariffName: firstTariff,
        taxRate: firstTariff ? (ctTariffTaxMap[firstTariff] || '') : '',
        mgmtProductName: firstTariff ? (ctTariffMgmtNameMap[firstTariff] || '') : '',
        coaSubject: firstTariff ? (ctTariffCoaMap[firstTariff] || prev.editingRow.coaSubject) : prev.editingRow.coaSubject
      } : null
    }))
    setCtProductDisplay(v)
  }

  const handleCtIncomeSubmit = (row: CTIncomeRow) => {
    if (ctIncomeModalState.isNew) {
      const productName = ctIncomeModalState.productName || row.productName
      setCtIncomeList(prev => [...prev, { ...row, id: 'ct-' + Date.now(), productName }].sort((a, b) => a.productName.localeCompare(b.productName)))
    } else {
      setCtIncomeList(prev => prev.map(r => r.id === ctIncomeModalState.editingRow!.id ? row : r).sort((a, b) => a.productName.localeCompare(b.productName)))
    }
    closeCtIncomeModal()
  }

  const extractProductNames = <T extends { productName?: string }>(list: T[]): string[] => {
    return [...new Set(list.map(r => r.productName).filter((v): v is string => !!v))]
  }

  const extractExpenseNames = <T extends { expenseContent?: string }>(list: T[]): string[] => {
    return [...new Set(list.map(r => r.expenseContent).filter((v): v is string => !!v))]
  }

  const extractIds = <T extends { id: string }>(list: T[]): string[] => {
    return list.map(r => r.id)
  }

  const groupByProductName = <T extends { productName: string }>(list: T[]): { productName: string; rows: T[] }[] => {
    const groups: Record<string, T[]> = {}
    list.forEach(row => {
      if (!groups[row.productName]) {
        groups[row.productName] = []
      }
      groups[row.productName].push(row)
    })
    return Object.entries(groups).map(([productName, rows]) => ({ productName, rows }))
  }

  // 生成阶段报销明细
  const generateStageReimburseRows = (
    incomeRow: ITIncomeRow | CTIncomeRow,
    coefficient: number
  ): { rows: StageReimburseRow[]; method: string; period: string; startDate: string } => {
    const plannedIncome = parseFloat(incomeRow.plannedIncome?.replace(/,/g, '') || '0')
    const totalExpense = plannedIncome * coefficient

    // 按月模式
    if (incomeRow.billingShareType === '月') {
      const months = parseInt(incomeRow.billingSharePeriod || '12', 10)
      const startDate = incomeRow.billingStartDate || ''
      const rows: StageReimburseRow[] = []

      if (months > 0 && startDate) {
        const perMonth = Math.floor((totalExpense / months) * 100) / 100
        const dateStr = startDate.length === 7 ? startDate : startDate.slice(0, 7)
        const [year, month] = dateStr.split('-').map(Number)

        for (let i = 0; i < months; i++) {
          const m = (month - 1 + i) % 12 + 1
          const y = year + Math.floor((month - 1 + i) / 12)
          const monthStr = `${y}-${String(m).padStart(2, '0')}`

          let amount: number
          if (i === months - 1) {
            amount = Math.floor((totalExpense - perMonth * (months - 1)) * 100) / 100
          } else {
            amount = perMonth
          }

          rows.push({
            date: monthStr,
            amount: amount.toFixed(2)
          })
        }
      }

      return {
        rows,
        method: '月',
        period: String(months),
        startDate
      }
    }

    // 一次性+支付计划模式（仅IT）
    if (
      'paymentPlans' in incomeRow &&
      incomeRow.paymentPlans &&
      incomeRow.paymentPlans.length > 0
    ) {
      const plans = incomeRow.paymentPlans
      const rows: StageReimburseRow[] = []
      let accumulated = 0

      plans.forEach((plan, idx) => {
        const planAmount = parseFloat(plan.amount?.replace(/,/g, '') || '0')
        const expenseAmount = planAmount * coefficient
        let finalAmount: number

        if (idx === plans.length - 1) {
          finalAmount = Math.floor((totalExpense - accumulated) * 100) / 100
        } else {
          finalAmount = Math.floor(expenseAmount * 100) / 100
          accumulated += finalAmount
        }

        rows.push({
          date: plan.paymentDate || '',
          amount: finalAmount.toFixed(2)
        })
      })

      return {
        rows,
        method: '阶段',
        period: String(plans.length),
        startDate: plans[0]?.paymentDate || ''
      }
    }

    // 一次性无支付计划
    return {
      rows: [],
      method: '一次性',
      period: '1',
      startDate: incomeRow.billingStartDate || ''
    }
  }

  // 根据IT收入计划生成IT成本计划
  const generateITCostFromIncome = (incomeList: ITIncomeRow[]): CostRow[] => {
    const coefficient = 0.8
    const result: CostRow[] = []

    incomeList.forEach((income, idx) => {
      const plannedIncome = parseFloat(income.plannedIncome?.replace(/,/g, '') || '0')
      const totalExpense = (plannedIncome * coefficient).toFixed(2)
      const budgetIncome = parseFloat((income.budgetTariffAmount || income.plannedIncome || '0').replace(/,/g, ''))
      const budgetExpense = (budgetIncome * coefficient).toFixed(2)
      const { rows, method, period, startDate } = generateStageReimburseRows(income, coefficient)

      const expenseContent = income.productName?.includes('维保')
        ? '维保费-信息服务'
        : income.productName?.includes('设备') || income.productName?.includes('商品')
          ? '商品销售成本'
          : expenseContentITOptions[idx % expenseContentITOptions.length]

      result.push({
        id: `cost-auto-it-${idx}-${Date.now()}`,
        expenseContent,
        budgetType: budgetTypeOptions[idx % budgetTypeOptions.length],
        plannedExpense: totalExpense,
        budgetExpenseAmount: budgetExpense,
        reimbursementMethod: method,
        reimbursementPeriod: period,
        reimbursementStartDate: startDate.length === 7 ? startDate : startDate.slice(0, 7),
        taxRate: income.taxRate || '',
        correspondingTariff: income.tariffName || '',
        contractStage: income.contractStage || contractStages[idx % contractStages.length],
        businessSubject: getBusinessSubject(expenseContent),
        stageReimburseRows: rows.length > 0 ? rows : undefined
      })
    })

    return result
  }

  // 根据CT收入计划生成CT成本计划
  const generateCTCostFromIncome = (incomeList: CTIncomeRow[]): CostRow[] => {
    const coefficient = 0.8
    const result: CostRow[] = []

    incomeList.forEach((income, idx) => {
      const plannedIncome = parseFloat(income.plannedIncome?.replace(/,/g, '') || '0')
      const totalExpense = (plannedIncome * coefficient).toFixed(2)
      const { rows, method, period, startDate } = generateStageReimburseRows(income, coefficient)

      const expenseContent = expenseContentCTOptions[idx % expenseContentCTOptions.length]

      result.push({
        id: `cost-auto-ct-${idx}-${Date.now()}`,
        expenseContent,
        budgetType: budgetTypeOptions[idx % budgetTypeOptions.length],
        plannedExpense: totalExpense,
        reimbursementMethod: method,
        reimbursementPeriod: period,
        reimbursementStartDate: startDate.length === 7 ? startDate : startDate.slice(0, 7),
        taxRate: income.taxRate || '',
        correspondingTariff: income.tariffName || '',
        contractStage: contractStages[idx % contractStages.length],
        businessSubject: getBusinessSubject(expenseContent),
        stageReimburseRows: rows.length > 0 ? rows : undefined
      })
    })

    return result
  }

  const [allowedITProductNames, setAllowedITProductNames] = useState<string[]>(extractProductNames(mockITIncome))
  const [allowedCTProductNames, setAllowedCTProductNames] = useState<string[]>(extractProductNames(mockCTIncome))
  const [allowedITExpenseNames, setAllowedITExpenseNames] = useState<string[]>(extractExpenseNames(initialITCost))
  const [allowedCTExpenseNames, setAllowedCTExpenseNames] = useState<string[]>(extractExpenseNames(initialCTCost))
  const [allowedITInvestNames, setAllowedITInvestNames] = useState<string[]>([])
  const [allowedCTInvestNames, setAllowedCTInvestNames] = useState<string[]>([])

  const [undeletableITIncomeIds, setUndeletableITIncomeIds] = useState<string[]>(extractIds(mockITIncome))
  const [undeletableCTIncomeIds, setUndeletableCTIncomeIds] = useState<string[]>(extractIds(mockCTIncome))
  const [undeletableITCostIds, setUndeletableITCostIds] = useState<string[]>([])
  const [undeletableCTCostIds, setUndeletableCTCostIds] = useState<string[]>([])
  const [undeletableITInvestIds, setUndeletableITInvestIds] = useState<string[]>([])
  const [undeletableCTInvestIds, setUndeletableCTInvestIds] = useState<string[]>([])

  // 从 sessionStorage 读取效益预评估数据
  useEffect(() => {
    const storedData = sessionStorage.getItem('benefitEvaluationData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        let itIncome = mockITIncome
        let ctIncome = mockCTIncome
        let itCost: CostRow[] = []
        let ctCost: CostRow[] = []

        if (data.itIncomeList && data.itIncomeList.length > 0) {
          itIncome = data.itIncomeList
          setItIncomeList(data.itIncomeList)
          setAllowedITProductNames([...new Set(data.itIncomeList.map((r: ITIncomeRow) => r.productName).filter((v): v is string => !!v))] as string[])
          setUndeletableITIncomeIds(data.itIncomeList.map((r: ITIncomeRow) => r.id))
        }
        if (data.ctIncomeList && data.ctIncomeList.length > 0) {
          ctIncome = data.ctIncomeList
          setCtIncomeList(data.ctIncomeList)
          setAllowedCTProductNames([...new Set(data.ctIncomeList.map((r: CTIncomeRow) => r.productName).filter((v): v is string => !!v))] as string[])
          setUndeletableCTIncomeIds(data.ctIncomeList.map((r: CTIncomeRow) => r.id))
        }
        if (data.itCostList && data.itCostList.length > 0) {
          itCost = data.itCostList
          setItCostList(data.itCostList)
          setAllowedITExpenseNames([...new Set(data.itCostList.map((r: CostRow) => r.expenseContent).filter((v): v is string => !!v))] as string[])
          setUndeletableITCostIds(data.itCostList.map((r: CostRow) => r.id))
        } else if (contractType === 'income-expense' && itIncome.length > 0) {
          const generated = generateITCostFromIncome(itIncome)
          setItCostList(generated)
          setAllowedITExpenseNames([...new Set(generated.map(r => r.expenseContent).filter(Boolean))] as string[])
        }
        if (data.ctCostList && data.ctCostList.length > 0) {
          ctCost = data.ctCostList
          setCtCostList(data.ctCostList)
          setAllowedCTExpenseNames([...new Set(data.ctCostList.map((r: CostRow) => r.expenseContent).filter((v): v is string => !!v))] as string[])
          setUndeletableCTCostIds(data.ctCostList.map((r: CostRow) => r.id))
        } else if ((contractType === 'income-expense' || contractType === 'expense') && ctIncome.length > 0) {
          const generated = generateCTCostFromIncome(ctIncome)
          setCtCostList(generated)
          setAllowedCTExpenseNames([...new Set(generated.map(r => r.expenseContent).filter(Boolean))] as string[])
        }
        if (data.itInvestmentList && data.itInvestmentList.length > 0) {
          setItInvestmentList(data.itInvestmentList)
          setAllowedITInvestNames([...new Set(data.itInvestmentList.map((r: InvestmentRow) => r.expenseContent).filter((v): v is string => !!v))] as string[])
          setUndeletableITInvestIds(data.itInvestmentList.map((r: InvestmentRow) => r.id))
        }
        if (data.ctInvestmentList && data.ctInvestmentList.length > 0) {
          setCtInvestmentList(data.ctInvestmentList)
          setAllowedCTInvestNames([...new Set(data.ctInvestmentList.map((r: InvestmentRow) => r.expenseContent).filter((v): v is string => !!v))] as string[])
          setUndeletableCTInvestIds(data.ctInvestmentList.map((r: InvestmentRow) => r.id))
        }
        sessionStorage.removeItem('benefitEvaluationData')
      } catch (e) {
        console.error('效益预评估数据读取失败', e)
      }
    }
  }, [])

  const [approver, setApprover] = useState('')
  const [processResult, setProcessResult] = useState<'completed' | 'transferred'>('completed')

  // 后向合同解析 - 流程信息处理人
  const [backwardApprover1, setBackwardApprover1] = useState('')
  const [backwardApprover2, setBackwardApprover2] = useState('')
  const deptManagerOptions = ['张科（科室经理）', '李科（科室经理）', '王科（科室经理）']
  const financeManagerOptions = ['赵财务（财务管理员）', '孙财务（财务管理员）', '周财务（财务管理员）']

  // 订单信息相关状态
  const isFrameworkOrder =
    contractInfo.isFramework === '是' && contractInfo.frameworkRelationType === '关联订单'
  const [orderList, setOrderList] = useState<OrderRow[]>([])
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderForm, setOrderForm] = useState({
    ...initialOrderForm,
    groupCustomerName: contractInfo.collectedCustomer
  })

  const openOrderModal = () => {
    setOrderForm({
      ...initialOrderForm,
      groupCustomerName: contractInfo.collectedCustomer
    })
    setShowOrderModal(true)
  }

  const closeOrderModal = () => {
    setShowOrderModal(false)
  }

  // 仅允许数字，小数点后最多六位
  const handleAmountChange = (field: 'amountWithTax' | 'amountNoTax', v: string) => {
    const trimmed = v.replace(/[^\d.]/g, '')
    // 不允许两个小数点
    const parts = trimmed.split('.')
    let normalized = parts[0]
    if (parts.length > 1) {
      const decimal = parts.slice(1).join('').slice(0, 6)
      normalized = `${parts[0]}.${decimal}`
    }
    setOrderForm(prev => ({ ...prev, [field]: normalized }))
  }

  const handleOrderSubmit = () => {
    if (!orderForm.orderCode.trim()) {
      alert('请输入订单编码')
      return
    }
    if (!orderForm.orderName.trim()) {
      alert('请输入订单名称')
      return
    }
    if (!orderForm.city) {
      alert('请选择归属地市')
      return
    }
    if (!orderForm.customerManager) {
      alert('请选择客户经理')
      return
    }
    if (!orderForm.orderOwner) {
      alert('请选择订单负责人')
      return
    }
    if (!orderForm.amountWithTax) {
      alert('请输入订单金额（元，含税）')
      return
    }
    if (!orderForm.amountNoTax) {
      alert('请输入订单金额（元，不含税）')
      return
    }
    if (!orderForm.description.trim()) {
      alert('请输入订单描述')
      return
    }
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const createTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    const newRow: OrderRow = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orderCode: orderForm.orderCode.trim(),
      orderName: orderForm.orderName.trim(),
      city: orderForm.city,
      customerManager: orderForm.customerManager,
      orderOwner: orderForm.orderOwner,
      groupCustomerCode: orderForm.groupCustomerCode || 'CUS000001',
      groupCustomerName: orderForm.groupCustomerName || contractInfo.collectedCustomer,
      amountWithTax: orderForm.amountWithTax,
      amountNoTax: orderForm.amountNoTax,
      description: orderForm.description.trim(),
      status: '待确认',
      createTime
    }
    setOrderList(prev => [...prev, newRow])
    setShowOrderModal(false)
  }

  const handleDeleteOrder = (id: string) => {
    setOrderList(prev => prev.filter(order => order.id !== id))
  }

  const handleSubmit = () => {
    if (parseType !== 'backward') {
      if (processResult === 'transferred' && !approver) {
        alert('请选择合同解析人员')
        return
      }
      if (processResult === 'completed' && !approver) {
        alert('请选择解决方案经理')
        return
      }
    }
    modal.confirm('确定提交吗？', '提交').then(ok => {
      if (ok) {
        if (parseType === 'backward') {
          onNavigate?.(`/finance/contract/backward-parse-approval/${contractId || 'CT2026060007'}`)
        } else {
          alert('提交成功')
          onNavigate?.(`/finance/contract/parse-confirm/${contractId || 'CT2026060001'}`)
        }
      }
    })
  }

  const handleCancel = () => {
    onNavigate?.('/finance/contract/query')
  }

  // IT成本计划 - 付款计划处理
  const handlePaymentPlan = (row: ITCostPlanRow) => {
    setPaymentPlanModalState({
      visible: true,
      costRowId: row.id,
      paymentPlans: row.paymentPlans || [],
      plannedExpense: row.plannedTariffExpense
    })
  }

  const handlePaymentPlanChange = (plans: PaymentPlanItem[]) => {
    setPaymentPlanModalState(prev => ({ ...prev, paymentPlans: plans }))
  }

  const handlePaymentPlanConfirm = () => {
    setCostPlans(prev => prev.map(row =>
      row.id === paymentPlanModalState.costRowId
        ? { ...row, paymentPlans: paymentPlanModalState.paymentPlans }
        : row
    ))
    setPaymentPlanModalState(prev => ({ ...prev, visible: false }))
  }

  // IT成本计划合计
  const totalPlannedExpense = costPlans.reduce((acc, curr) => {
    const n = parseFloat(curr.plannedExpense.replace(/,/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)

  const totalBudgetExpense = costPlans.reduce((acc, curr) => {
    const n = parseFloat((curr.budgetTariffExpense || '').replace(/,/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)

  const trailData: ProcessTrailItem[] = [
    { time: '2026-07-15 10:30:00', actor: '张三', action: '提交合同解析申请' },
    { time: '2026-07-15 14:20:00', actor: '李四', action: '审批通过，流转至计划变更环节' }
  ]

  // ========== 合同附件上传（复制自合同附件上传页面，独立维护） ==========
  const [uploadedFile, setUploadedFile] = useState<{ id: string; name: string; size: string; time: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [attachError, setAttachError] = useState('')

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const allFiles = Array.from(e.dataTransfer.files || [])
    const pdfFiles = allFiles.filter(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf')
    if (allFiles.length !== pdfFiles.length) {
      alert('仅支持上传 PDF 格式文件')
    }
    if (pdfFiles.length === 0) return
    setAttachError('')
    const file = pdfFiles[0]
    setUploadedFile({
      id: `file-${Date.now()}`,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      time: new Date().toLocaleString()
    })
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部标题栏 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">{readOnly ? '合同详情' : parseType === 'backward' ? '后向合同解析' : '前向合同解析'}</h2>
          </div>
        </div>

        {/* 1. 项目信息 */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 合同信息 */}
        <ContractInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 附件 */}
        <ContractAttachments attachments={contractInfo.attachments} />

        {/* 流程轨迹：非合同详情页（非readOnly）放在计划/订单信息上面 */}
        {!readOnly && (
          <ProcessTrail trail={trailData} defaultExpanded={false} />
        )}

        {/* 合同附件上传（仅后向合同解析展示，复制自合同附件上传页面） */}
        {parseType === 'backward' && !readOnly && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">合同附件上传</h3>
              <span className="text-red-500 text-xs">*</span>
            </div>
            <div className="p-4">
              {!uploadedFile ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver ? 'border-[#1677FF] bg-blue-50/50' : 'border-gray-200'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    将文件拖拽到此处，或
                    <button
                      type="button"
                      onClick={() => {
                        setAttachError('')
                        setUploadedFile({
                          id: `file-${Date.now()}`,
                          name: '后向合同附件.pdf',
                          size: '5,242.9 KB',
                          time: new Date().toLocaleString()
                        })
                      }}
                      className="text-[#1677FF] cursor-pointer hover:underline"
                    >
                      点击上传
                    </button>
                  </p>
                  <p className="text-xs text-gray-400">仅支持 PDF 格式文件，仅可上传一个文件</p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-md p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-[#1677FF]" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm text-gray-800 truncate">{uploadedFile.name}</div>
                      <div className="text-xs text-gray-400">{uploadedFile.size} · {uploadedFile.time}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              {attachError && (
                <p className="text-xs text-red-500 mt-2">{attachError}</p>
              )}
            </div>
          </div>
        )}

        {/* 2. 订单信息（框架合同 + 关联订单时展示） */}
        {isFrameworkOrder && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">订单信息</h3>
              {!readOnly && (
                <button
                  type="button"
                  onClick={openOrderModal}
                  className="ml-auto inline-flex items-center gap-1 px-3 py-1 text-xs text-[#1677FF] border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  新增订单
                </button>
              )}
            </div>
            <div className="p-4">
              {orderList.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">暂无订单数据</div>
              ) : (
                <div className="border border-gray-100 rounded-md overflow-x-auto">
                  <table className="w-full text-sm whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-xs">
                        {orderTableHeaders.map((h, idx) => (
                          <th key={idx} className="px-3 py-2.5 text-left font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orderList.map((row, idx) => (
                        <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                          <td className="px-3 py-2.5 text-gray-700">{row.orderCode}</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.orderName}</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.city}</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.customerManager}</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.orderOwner}</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.groupCustomerCode}</td>
                          <td className="px-3 py-2.5 text-gray-700">{row.groupCustomerName}</td>
                          <td className="px-3 py-2.5 text-gray-700 text-right">{row.amountWithTax}</td>
                          <td className="px-3 py-2.5 text-gray-700 text-right">{row.amountNoTax}</td>
                          <td className="px-3 py-2.5 text-gray-700 max-w-[200px] truncate" title={row.description}>
                            {row.description}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-orange-50 text-orange-600">
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-gray-700">{row.createTime}</td>
                          <td className="px-3 py-2.5">
                            {!readOnly && (
                              <button
                                type="button"
                                onClick={() => handleDeleteOrder(row.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                删除
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. 计划信息（非框架订单时展示） */}
        {!isFrameworkOrder && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">计划信息</h3>
            </div>
            <div className="p-4 space-y-4">
              {!readOnly && parseType !== 'backward' && (
                <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2">
                  <span className="shrink-0">⚠</span>
                  <span>温馨提示：请补充IT收入计划和CT收入的产品的资费名称和计划订购金额等信息</span>
                </div>
              )}
              {/* 收入类 展示收入-IT + 收入-CT */}
              {contractType === 'income' && (
                <>
                  <SectionBlock
                    title="IT收入计划"
                    count={itIncomeList.length}
                  >
                    <div className="overflow-x-auto border border-gray-100 rounded-md">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-gray-600 text-xs">
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                            <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                            <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购金额</th>
                            <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购金额（不含税）</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                            <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">是否合同资产</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                            <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupByProductName(itIncomeList).map((group) => {
                            const rowCount = group.rows.length + (!readOnly ? 1 : 0)
                            return (
                              <>
                                {group.rows.map((row, idx) => (
                                  <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                                    {idx === 0 && (
                                      <>
                                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.productName}</td>
                                        <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].plannedIncome}</td>
                                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].taxRate}</td>
                                      </>
                                    )}
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                                    <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.plannedTariffAmount || '-'}</td>
                                    <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, group.rows[0].taxRate) : '-'}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                                    <td className="px-3 py-2.5 text-center whitespace-nowrap text-gray-700">
                                      {row.billingShareType === '一次性' ? row.isContractAsset : '-'}
                                    </td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                      <div className="flex items-center justify-center gap-2">
                                        {!readOnly && (
                                          <>
                                            <button onClick={() => openItIncomeModal(row)} className="text-gray-500 hover:text-[#1677FF]" title="编辑">
                                              <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button onClick={() => {
                                              if (undeletableITIncomeIds && undeletableITIncomeIds.includes(row.id)) {
                                                alert('该记录为效益预评估已带出的计划，不允许删除')
                                                return
                                              }
                                              modal.confirm('确定要删除该IT收入计划吗？', '确认删除').then(ok => {
                                                if (ok) setItIncomeList(prev => prev.filter(r => r.id !== row.id))
                                              })
                                            }} className="text-gray-500 hover:text-red-500" title="删除">
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </>
                                        )}
                                        <button onClick={() => setItIncomeViewingPlans(row)} className="px-2 py-1 text-xs text-[#1677FF] hover:underline">回款计划</button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                                {!readOnly && (
                                  <tr key={`add-it-${group.productName}`} className="border-t border-gray-100 hover:bg-gray-50/50">
                                    <td className="px-3 py-2.5 text-center whitespace-nowrap" colSpan={11}>
                                      <button onClick={() => openItIncomeModal(undefined, group.productName)} className="inline-flex items-center gap-1 px-4 py-1.5 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 hover:border-blue-200 transition-colors">
                                        <Plus className="w-3 h-3" />补充资费
                                      </button>
                                    </td>
                                  </tr>
                                )}
                              </>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex justify-end items-center gap-6">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                        <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                        <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                        <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                      </div>
                    </div>
                  </SectionBlock>

                  <SectionBlock
                    title="CT收入计划"
                    count={ctIncomeList.length}
                  >
                    <div className="overflow-x-auto border border-gray-100 rounded-md">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-gray-600 text-xs">
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品类型</th>
                            <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">带宽（M）</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购数量</th>
                            <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购金额</th>
                            <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购金额（不含税）</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                            <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupByProductName(ctIncomeList).map((group) => {
                            const rowCount = group.rows.length + (!readOnly ? 1 : 0)
                            return (
                              <>
                                {group.rows.map((row, idx) => (
                                  <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                                    {idx === 0 && (
                                      <>
                                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.productName}</td>
                                        <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].plannedIncome}</td>
                                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].taxRate}</td>
                                      </>
                                    )}
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.productFullName ? `【${row.productCode || '-'}】${row.productFullName}` : '-'}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.bandwidth}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.orderQuantity}</td>
                                    <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.plannedTariffAmount || '-'}</td>
                                    <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, group.rows[0].taxRate) : '-'}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                      {!readOnly && (
                                        <div className="flex items-center justify-center gap-2">
                                          <button onClick={() => openCtIncomeModal(row)} className="text-gray-500 hover:text-[#1677FF]" title="编辑">
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => {
                                            if (undeletableCTIncomeIds && undeletableCTIncomeIds.includes(row.id)) {
                                              alert('该记录为效益预评估已带出的计划，不允许删除')
                                              return
                                            }
                                            modal.confirm('确定要删除该CT收入计划吗？', '确认删除').then(ok => {
                                              if (ok) setCtIncomeList(prev => prev.filter(r => r.id !== row.id))
                                            })
                                          }} className="text-gray-500 hover:text-red-500" title="删除">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      )}
                                      {readOnly && <span className="text-gray-400">-</span>}
                                    </td>
                                  </tr>
                                ))}
                                {!readOnly && (
                                  <tr key={`add-ct-${group.productName}`} className="border-t border-gray-100 hover:bg-gray-50/50">
                                    <td className="px-3 py-2.5 text-center whitespace-nowrap" colSpan={16}>
                                      <button onClick={() => openCtIncomeModal(undefined, group.productName)} className="inline-flex items-center gap-1 px-4 py-1.5 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 hover:border-blue-200 transition-colors">
                                        <Plus className="w-3 h-3" />补充资费
                                      </button>
                                    </td>
                                  </tr>
                                )}
                              </>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex justify-end items-center gap-6">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                        <span className="text-base font-semibold text-[#1677FF]">¥{ctIncomeList.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                        <span className="text-base font-semibold text-[#1677FF]">¥{ctIncomeList.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                        <span className="text-base font-semibold text-[#1677FF]">¥{ctIncomeList.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                      </div>
                    </div>
                  </SectionBlock>
                </>
              )}

              {/* 有收有支类 展示收入-IT + 投入部分 */}
              {contractType === 'income-expense' && (
                <SectionBlock
                  title="IT收入计划"
                  count={itIncomeList.length}
                >
                  <div className="overflow-x-auto border border-gray-100 rounded-md">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs">
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                          <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                          <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购金额</th>
                          <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购金额（不含税）</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                          <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">是否合同资产</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                          <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupByProductName(itIncomeList).map((group) => {
                          const rowCount = group.rows.length + (!readOnly ? 1 : 0)
                          return (
                            <>
                              {group.rows.map((row, idx) => (
                                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                                  {idx === 0 && (
                                    <>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.productName}</td>
                                      <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].plannedIncome}</td>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].taxRate}</td>
                                    </>
                                  )}
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                                  <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.plannedTariffAmount || '-'}</td>
                                  <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, group.rows[0].taxRate) : '-'}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                                  <td className="px-3 py-2.5 text-center whitespace-nowrap text-gray-700">
                                    {row.billingShareType === '一次性' ? row.isContractAsset : '-'}
                                  </td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                                  <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                      {!readOnly && (
                                        <>
                                          <button onClick={() => openItIncomeModal(row)} className="text-gray-500 hover:text-[#1677FF]" title="编辑">
                                            <Edit className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => {
                                            if (undeletableITIncomeIds && undeletableITIncomeIds.includes(row.id)) {
                                              alert('该记录为效益预评估已带出的计划，不允许删除')
                                              return
                                            }
                                            modal.confirm('确定要删除该IT收入计划吗？', '确认删除').then(ok => {
                                              if (ok) setItIncomeList(prev => prev.filter(r => r.id !== row.id))
                                            })
                                          }} className="text-gray-500 hover:text-red-500" title="删除">
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </>
                                      )}
                                      <button onClick={() => setItIncomeViewingPlans(row)} className="px-2 py-1 text-xs text-[#1677FF] hover:underline">回款计划</button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {!readOnly && (
                                <tr key={`add-it-expense-${group.productName}`} className="border-t border-gray-100 hover:bg-gray-50/50">
                                  <td className="px-3 py-2.5 text-center whitespace-nowrap" colSpan={11}>
                                    <button onClick={() => openItIncomeModal(undefined, group.productName)} className="inline-flex items-center gap-1 px-4 py-1.5 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 hover:border-blue-200 transition-colors">
                                      <Plus className="w-3 h-3" />补充资费
                                    </button>
                                  </td>
                                </tr>
                              )}
                            </>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex justify-end items-center gap-6">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                      <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                      <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                      <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                    </div>
                  </div>
                </SectionBlock>
              )}

              {/* 后向合同：新增IT成本计划 */}
              {parseType === 'backward' && (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                      <h3 className="text-sm font-semibold text-gray-800">IT成本计划</h3>
                      <span className="text-xs text-gray-400">【{costPlans.length}】</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-3">
                      <span className="shrink-0">⚠</span>
                      <span>温馨提示：按照收支科目匹配要求，支出科目必须在收入科目范围内，如无对应支出科目，请将计划支出金额调整为 0</span>
                    </div>
                    <div className="overflow-x-auto border border-gray-100 rounded-md">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-gray-600 text-xs">
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">概算支出金额</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划支出金额</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">
                              <div className="relative inline-flex items-center gap-1 group">
                                <span>计划成本列支时间</span>
                                <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1.5 z-20 px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none whitespace-nowrap">
                                  包含通过计提方式和报账方式入账的成本列支时间
                                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
                                </div>
                              </div>
                            </th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                            <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                            <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap sticky right-0 bg-gray-50">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const mergeInfo: { productName: { rowSpan: number; show: boolean }[]; plannedExpense: { rowSpan: number; show: boolean }[]; taxRate: { rowSpan: number; show: boolean }[] } = {
                              productName: [],
                              plannedExpense: [],
                              taxRate: []
                            }

                            let i = 0
                            while (i < costPlans.length) {
                              const currentProductName = costPlans[i].productName
                              let count = 1
                              while (i + count < costPlans.length && costPlans[i + count].productName === currentProductName) {
                                count++
                              }
                              for (let j = 0; j < count; j++) {
                                mergeInfo.productName.push({ rowSpan: count, show: j === 0 })
                                mergeInfo.plannedExpense.push({ rowSpan: count, show: j === 0 })
                                mergeInfo.taxRate.push({ rowSpan: count, show: j === 0 })
                              }
                              i += count
                            }

                            return costPlans.map((row, idx) => (
                              <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                                {mergeInfo.productName[idx].show && (
                                  <td rowSpan={mergeInfo.productName[idx].rowSpan} className="px-3 py-2.5 text-gray-700 whitespace-nowrap border-r border-gray-100">
                                    {row.productName}
                                  </td>
                                )}
                                {mergeInfo.plannedExpense[idx].show && (
                                  <td rowSpan={mergeInfo.plannedExpense[idx].rowSpan} className="px-3 py-2.5 text-gray-700 whitespace-nowrap border-r border-gray-100">
                                    {row.plannedExpense}
                                  </td>
                                )}
                                {mergeInfo.taxRate[idx].show && (
                                  <td rowSpan={mergeInfo.taxRate[idx].rowSpan} className="px-3 py-2.5 text-gray-700 whitespace-nowrap border-r border-gray-100">
                                    {row.taxRate}
                                  </td>
                                )}
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                  <input
                                    type="number"
                                    value={row.plannedTariffExpense}
                                    onChange={e => {
                                      const val = e.target.value
                                      setCostPlans(prev => prev.map(r => r.id === row.id ? { ...r, plannedTariffExpense: val } : r))
                                    }}
                                    className="w-full px-2 py-1 text-sm text-gray-700 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                  />
                                </td>
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                  <select
                                    value={row.shareType}
                                    onChange={e => {
                                      const val = e.target.value
                                      setCostPlans(prev => prev.map(r => r.id === row.id ? {
                                        ...r,
                                        shareType: val,
                                        sharePeriod: val === '一次性' ? '1' : r.sharePeriod
                                      } : r))
                                    }}
                                    className="w-full px-2 py-1 text-sm text-gray-700 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                                  >
                                    <option value="一次性">一次性</option>
                                    <option value="月">月</option>
                                  </select>
                                </td>
                                <td className="px-3 py-2.5 whitespace-nowrap">
                                  {row.shareType === '一次性' ? (
                                    <div className="px-2 py-1 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded text-center">
                                      {row.sharePeriod}
                                    </div>
                                  ) : (
                                    <input
                                      type="number"
                                      min={1}
                                      value={row.sharePeriod}
                                      onChange={e => {
                                        const val = e.target.value
                                        setCostPlans(prev => prev.map(r => r.id === row.id ? { ...r, sharePeriod: val } : r))
                                      }}
                                      className="w-full px-2 py-1 text-sm text-gray-700 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    />
                                  )}
                                </td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.costPaymentDate}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProduct}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                                <td className="px-3 py-2.5 text-center whitespace-nowrap sticky right-0 bg-white">
                                  {parseFloat(row.plannedTariffExpense.replace(/,/g, '')) > 0 && (
                                    <button type="button" onClick={() => handlePaymentPlan(row)} className="text-xs text-[#1677FF] hover:underline">
                                      付款计划
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))
                          })()}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex justify-end items-center gap-6">
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">概算支出合计（含税）：</span>
                        <span className="text-base font-semibold text-[#1677FF]">¥{costPlans.reduce((sum, r) => sum + parseFloat(r.plannedExpense.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                        <span className="text-base font-semibold text-[#1677FF]">¥{costPlans.reduce((sum, r) => sum + parseFloat((r.budgetTariffExpense || r.plannedTariffExpense || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                        <span className="text-base font-semibold text-[#1677FF]">¥{costPlans.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffExpense || r.plannedTariffExpense || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* 流程轨迹：合同详情页（readOnly）放在计划信息下面 */}
        {readOnly && (
          <ProcessTrail trail={trailData} defaultExpanded={false} />
        )}

        {/* 处理信息（仅解析页显示，后向合同解析页不展示） */}
        {!readOnly && parseType !== 'backward' && (
          <ProcessInfo onResultChange={setProcessResult} />
        )}

        {/* 3. 流程信息（仅解析页显示，后向合同解析页不展示前向流程信息） */}
        {!readOnly && parseType !== 'backward' && processResult === 'completed' && (
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
                        前向合同解析确认与补充
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
                          解决方案经理
                        </span>
                        <div className="flex-1 min-w-0">
                          <SearchableSelect
                            value={approver}
                            onChange={setApprover}
                            options={approverOptions}
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
        )}
        {!readOnly && parseType !== 'backward' && processResult === 'transferred' && (
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
                        前向合同解析
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
                          合同解析人员
                        </span>
                        <div className="flex-1 min-w-0">
                          <SearchableSelect
                            value={approver}
                            onChange={setApprover}
                            options={approverOptions}
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
        )}

        {/* 后向合同解析页：流程信息 */}
        {!readOnly && parseType === 'backward' && (
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
                        后向合同解析审批
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步处理人</label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                          科室经理
                        </span>
                        <div className="flex-1 min-w-0">
                          <SearchableSelect
                            value={backwardApprover1}
                            onChange={setBackwardApprover1}
                            options={deptManagerOptions}
                            placeholder="请选择下一步处理人"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                          财务管理员
                        </span>
                        <div className="flex-1 min-w-0">
                          <SearchableSelect
                            value={backwardApprover2}
                            onChange={setBackwardApprover2}
                            options={financeManagerOptions}
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
        )}

        {/* IT收入计划新增/修改弹框 */}
        {itIncomeModalState.visible && (
          <ModalShell
            title={itIncomeModalState.isNew ? 'IT收入计划新增' : 'IT收入计划修改'}
            onClose={closeItIncomeModal}
          >
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <FormRow label="产品名称" required>
                {itIncomeModalState.editingRow ? (
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {itIncomeModalState.editingRow.productName}
                  </div>
                ) : (
                  <SearchableSelect
                    value={''}
                    onChange={(v) => {}}
                    options={itProductOptions}
                  />
                )}
              </FormRow>
              <FormRow label="税率" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.taxRate || '-'}
                </div>
              </FormRow>
              <FormRow label="资费名称" required>
                <SearchableSelect
                  value={itIncomeModalState.editingRow?.tariffName || ''}
                  onChange={(v) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, tariffName: v } : null
                    }))
                  }}
                  options={itTariffOptions}
                />
              </FormRow>
              <FormRow label="计划订购金额" required>
                <NumberInput
                  value={itIncomeModalState.editingRow?.plannedTariffAmount || itIncomeModalState.editingRow?.budgetTariffAmount || ''}
                  onChange={(v) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, plannedTariffAmount: v, budgetTariffAmount: v } : null
                    }))
                  }}
                  placeholder="请输入金额"
                />
              </FormRow>
              <FormRow label="分摊类型" required>
                <SegmentedSelect
                  value={itIncomeModalState.editingRow?.billingShareType || '月'}
                  onChange={(v) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, billingShareType: v } : null
                    }))
                  }}
                  options={['一次性', '月']}
                />
              </FormRow>
              <FormRow label="分摊周期" required>
                <input
                  type="text"
                  value={itIncomeModalState.editingRow?.billingSharePeriod || '12'}
                  onChange={(e) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, billingSharePeriod: e.target.value } : null
                    }))
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  placeholder="请输入周期"
                />
              </FormRow>
              {(itIncomeModalState.editingRow?.billingShareType || '月') === '一次性' && (
                <FormRow label="是否合同资产" required>
                  <SegmentedSelect
                    value={itIncomeModalState.editingRow?.isContractAsset || '否'}
                    onChange={(v) => {
                      setItIncomeModalState(prev => ({
                        ...prev,
                        editingRow: prev.editingRow ? { ...prev.editingRow, isContractAsset: v } : null
                      }))
                    }}
                    options={['是', '否']}
                  />
                </FormRow>
              )}
              <FormRow label="计划订购时间" required>
                <DateInput
                  value={itIncomeModalState.editingRow?.plannedOrderDate || ''}
                  onChange={(v) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, plannedOrderDate: v } : null
                    }))
                  }}
                />
              </FormRow>
              <FormRow label="里程碑名称" required>
                <SearchableSelect
                  value={itIncomeModalState.editingRow?.contractStage || '初验'}
                  onChange={(v) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, contractStage: v } : null
                    }))
                  }}
                  options={defaultMilestones.map(m => m.name)}
                />
              </FormRow>
              <FormRow label="管会产品">
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.mgmtProductName ? `${itIncomeModalState.editingRow.mgmtProductCode || ''} ${itIncomeModalState.editingRow.mgmtProductName}` : '-'}
                </div>
              </FormRow>
              <FormRow label="COA科目">
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.coaSubject || '-'}
                </div>
              </FormRow>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <PaymentPlanSection
                value={itIncomePaymentPlans}
                onChange={setItIncomePaymentPlans}
                plannedIncome={itIncomeModalState.editingRow?.plannedTariffAmount || itIncomeModalState.editingRow?.plannedIncome || ''}
                isContractAsset={(itIncomeModalState.editingRow?.isContractAsset || '否') as '是' | '否'}
                milestones={defaultMilestones}
                plannedOrderDate={itIncomeModalState.editingRow?.plannedOrderDate || ''}
              />
            </div>

            <ModalFooter
              onCancel={closeItIncomeModal}
              onSubmit={() => {
                if (!itIncomeModalState.editingRow) {
                  alert('请填写完整数据')
                  return
                }
                handleItIncomeSubmit(itIncomeModalState.editingRow)
              }}
            />
          </ModalShell>
        )}

        {/* IT收入计划回款计划查看弹框 */}
        {itIncomeViewingPlans && (
          <ModalShell title="回款计划明细" onClose={() => setItIncomeViewingPlans(null)}>
            <PaymentPlansDisplay plans={itIncomeViewingPlans.paymentPlans || []} plannedIncome={itIncomeViewingPlans.plannedIncome} hideMilestoneName hideHeader />
            <div className="flex justify-center mt-5">
              <button type="button" onClick={() => setItIncomeViewingPlans(null)} className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors">关闭</button>
            </div>
          </ModalShell>
        )}

        {/* CT收入计划新增/修改弹框 */}
        {ctIncomeModalState.visible && (
          <ModalShell
            title={ctIncomeModalState.isNew ? 'CT收入计划新增' : 'CT收入计划修改'}
            onClose={closeCtIncomeModal}
          >
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <FormRow label="产品类型" required>
                {ctIncomeModalState.isNew ? (
                  <SearchableSelect
                    value={ctIncomeModalState.editingRow?.productName || ''}
                    onChange={handleCtProductChange}
                    options={allowedCTProductNames && allowedCTProductNames.length > 0 ? allowedCTProductNames : ctProductOptions}
                  />
                ) : (
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {ctIncomeModalState.editingRow?.productName}
                  </div>
                )}
              </FormRow>
              <FormRow label="税率" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {ctIncomeModalState.editingRow?.taxRate || '请先选择资费名称'}
                </div>
              </FormRow>
              <FormRow label="产品名称" required>
                <SearchableSelect
                  value={ctProductDisplay}
                  onChange={handleCtProductNameChange}
                  options={ctIncomeModalState.editingRow?.productName ? (ctProductTypeProductNameMap[ctIncomeModalState.editingRow.productName] || []) : []}
                  placeholder={ctIncomeModalState.editingRow?.productName ? '请选择产品名称' : '请先选择产品类型'}
                />
              </FormRow>
              <FormRow label="资费名称" required>
                <SearchableSelect
                  value={ctIncomeModalState.editingRow?.tariffName || ''}
                  onChange={(v) => {
                    setCtIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? {
                        ...prev.editingRow,
                        tariffName: v,
                        taxRate: ctTariffTaxMap[v] || '',
                        mgmtProductName: ctTariffMgmtNameMap[v] || '',
                        coaSubject: ctTariffCoaMap[v] || prev.editingRow.coaSubject
                      } : null
                    }))
                  }}
                  options={ctProductDisplay
                    ? (ctProductNameTariffMap[ctProductDisplay] || [])
                    : (ctIncomeModalState.editingRow?.productName ? (ctProductTariffMap[ctIncomeModalState.editingRow.productName] || []) : [])}
                  placeholder={ctProductDisplay ? '请选择资费名称' : (ctIncomeModalState.editingRow?.productName ? '请先选择产品名称' : '请先选择产品类型')}
                  disabled={!ctProductDisplay && !ctIncomeModalState.editingRow?.productName}
                />
              </FormRow>
              {isCtBandwidthRequired(ctIncomeModalState.editingRow?.productName || '') && (
                <FormRow label="带宽（M）">
                  <div className="relative">
                    <NumberInput
                      value={ctIncomeModalState.editingRow?.bandwidth || ''}
                      onChange={(v) => {
                        const num = parseInt(v, 10)
                        if (v === '' || (!isNaN(num) && num > 0)) {
                          setCtIncomeModalState(prev => ({
                            ...prev,
                            editingRow: prev.editingRow ? { ...prev.editingRow, bandwidth: v } : null
                          }))
                        }
                      }}
                      placeholder="请输入带宽"
                      decimals={0}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">M</span>
                  </div>
                </FormRow>
              )}
              <FormRow label="订购数量" required>
                <NumberInput
                  value={ctIncomeModalState.editingRow?.orderQuantity || ''}
                  onChange={(v) => {
                    const num = parseInt(v, 10)
                    if (v === '' || (!isNaN(num) && num > 0)) {
                      setCtIncomeModalState(prev => ({
                        ...prev,
                        editingRow: prev.editingRow ? { ...prev.editingRow, orderQuantity: v } : null
                      }))
                    }
                  }}
                  placeholder="请输入订购数量"
                  decimals={0}
                />
              </FormRow>
              <FormRow label="计划订购金额" required>
                <NumberInput
                  value={ctIncomeModalState.editingRow?.plannedTariffAmount || ctIncomeModalState.editingRow?.plannedIncome || ''}
                  onChange={(v) => {
                    setCtIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, plannedTariffAmount: v } : null
                    }))
                  }}
                  placeholder="请输入金额"
                />
              </FormRow>
              <FormRow label="分摊类型" required>
                <SegmentedSelect
                  value={ctIncomeModalState.editingRow?.billingShareType || '月'}
                  onChange={(v) => {
                    setCtIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? {
                        ...prev.editingRow,
                        billingShareType: v,
                        billingSharePeriod: v === '一次性' ? '1' : '12'
                      } : null
                    }))
                  }}
                  options={['一次性', '月']}
                />
              </FormRow>
              <FormRow label="分摊周期" required>
                <NumberInput
                  value={ctIncomeModalState.editingRow?.billingSharePeriod || '12'}
                  onChange={(v) => {
                    if ((ctIncomeModalState.editingRow?.billingShareType || '月') !== '一次性') {
                      const num = parseInt(v, 10)
                      if (v === '' || (!isNaN(num) && num > 0)) {
                        setCtIncomeModalState(prev => ({
                          ...prev,
                          editingRow: prev.editingRow ? { ...prev.editingRow, billingSharePeriod: v } : null
                        }))
                      }
                    }
                  }}
                  placeholder={(ctIncomeModalState.editingRow?.billingShareType || '月') === '一次性' ? '固定为1' : '请输入月数'}
                  disabled={(ctIncomeModalState.editingRow?.billingShareType || '月') === '一次性'}
                  decimals={0}
                />
              </FormRow>
              <FormRow label="计划订购时间" required>
                <MonthPicker
                  value={ctIncomeModalState.editingRow?.plannedOrderDate || ''}
                  onChange={(v) => setCtIncomeModalState(prev => ({ ...prev, editingRow: prev.editingRow ? { ...prev.editingRow, plannedOrderDate: v } : null }))}
                />
              </FormRow>
              <FormRow label="计费起始时间" required>
                <DateInput
                  value={ctIncomeModalState.editingRow?.billingStartDate || ''}
                  onChange={(v) => setCtIncomeModalState(prev => ({ ...prev, editingRow: prev.editingRow ? { ...prev.editingRow, billingStartDate: v } : null }))}
                />
              </FormRow>
              <FormRow label="管会产品">
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {ctIncomeModalState.editingRow?.mgmtProductName ? `【${ctIncomeModalState.editingRow.mgmtProductCode}】${ctIncomeModalState.editingRow.mgmtProductName}` : '-'}
                </div>
              </FormRow>
              <FormRow label="COA科目">
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {ctIncomeModalState.editingRow?.coaSubject || '-'}
                </div>
              </FormRow>
            </div>

            <ModalFooter
              onCancel={closeCtIncomeModal}
              onSubmit={() => {
                const row = ctIncomeModalState.editingRow
                if (!row) {
                  alert('请填写完整数据')
                  return
                }
                if (!row.productName || !row.productFullName || !row.tariffName) {
                  alert('请选择产品类型、产品名称和资费名称')
                  return
                }
                if (!row.orderQuantity || !row.taxRate || !row.plannedTariffAmount || !row.billingShareType || !row.billingSharePeriod || !row.plannedOrderDate || !row.billingStartDate) {
                  alert('请填写必填项')
                  return
                }
                handleCtIncomeSubmit({
                  ...row,
                  plannedIncome: row.plannedTariffAmount || row.plannedIncome
                })
              }}
            />
          </ModalShell>
        )}

        {/* 底部操作区 */}
        <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100 bg-white rounded-lg shadow-sm p-4">
          {readOnly ? (
            <button
              type="button"
              onClick={handleCancel}
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

      {/* 付款计划明细弹框（后向合同IT成本计划用） */}
      {paymentPlanModalState.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">付款计划明细</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const newPlan = {
                      id: 'pp-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
                      milestone: '',
                      amount: '',
                      paymentDate: '',
                      transferDate: ''
                    }
                    setPaymentPlanModalState(prev => ({
                      ...prev,
                      paymentPlans: [...prev.paymentPlans, newPlan]
                    }))
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  付款计划新增
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentPlanModalState(prev => ({ ...prev, visible: false }))}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              <PaymentPlanSection
                value={paymentPlanModalState.paymentPlans}
                onChange={handlePaymentPlanChange}
                plannedIncome={paymentPlanModalState.plannedExpense}
                milestones={defaultMilestones}
                hideTransferDate
                hideMilestoneName
                hideActions
                hideHeader
                amountLabel="计划付款金额"
                dateLabel="计划付款时间"
              />
            </div>
            <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100 px-4 pb-4">
              <button
                type="button"
                onClick={() => setPaymentPlanModalState(prev => ({ ...prev, visible: false }))}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />取消
              </button>
              <button
                type="button"
                onClick={handlePaymentPlanConfirm}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增订单弹窗 */}
      {showOrderModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={closeOrderModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-[800px] max-w-[92vw] max-h-[90vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">新增订单</h3>
              <button
                type="button"
                onClick={closeOrderModal}
                className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                title="关闭"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 表单内容 */}
            <div className="px-5 py-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {/* 订单编码 */}
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-2">
                      <span className="text-red-500 mr-0.5">*</span>
                      订单编码
                    </label>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={orderForm.orderCode}
                        onChange={e => setOrderForm(prev => ({ ...prev, orderCode: e.target.value }))}
                        placeholder="请输入订单编码"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 订单名称 */}
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-2">
                      <span className="text-red-500 mr-0.5">*</span>
                      订单名称
                    </label>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={orderForm.orderName}
                        onChange={e => setOrderForm(prev => ({ ...prev, orderName: e.target.value }))}
                        placeholder="请输入订单名称"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 归属地市 */}
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-2">
                      <span className="text-red-500 mr-0.5">*</span>
                      归属地市
                    </label>
                    <div className="flex-1 min-w-0">
                      <select
                        value={orderForm.city}
                        onChange={e => setOrderForm(prev => ({ ...prev, city: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="">请选择归属地市</option>
                        {cityOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 客户经理 */}
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-2">
                      <span className="text-red-500 mr-0.5">*</span>
                      客户经理
                    </label>
                    <div className="flex-1 min-w-0">
                      <SearchableSelect
                        value={orderForm.customerManager}
                        onChange={v => setOrderForm(prev => ({ ...prev, customerManager: v }))}
                        options={customerManagerOptions}
                        placeholder="请选择客户经理"
                      />
                    </div>
                  </div>
                </div>

                {/* 订单负责人 */}
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-2">
                      <span className="text-red-500 mr-0.5">*</span>
                      订单负责人
                    </label>
                    <div className="flex-1 min-w-0">
                      <SearchableSelect
                        value={orderForm.orderOwner}
                        onChange={v => setOrderForm(prev => ({ ...prev, orderOwner: v }))}
                        options={orderOwnerOptions}
                        placeholder="请选择订单负责人"
                      />
                    </div>
                  </div>
                </div>

                {/* 集团客户编码 */}
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-2">
                      集团客户编码
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                        {orderForm.groupCustomerCode || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 集团客户名称 */}
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-2">
                      集团客户名称
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                        {orderForm.groupCustomerName || '-'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 订单金额（元，含税） */}
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-2">
                      <span className="text-red-500 mr-0.5">*</span>
                      订单金额（元，含税）
                    </label>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={orderForm.amountWithTax}
                        onChange={e => handleAmountChange('amountWithTax', e.target.value)}
                        placeholder="请输入订单金额（含税）"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 订单金额（元，不含税） */}
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-2">
                      <span className="text-red-500 mr-0.5">*</span>
                      订单金额（元，不含税）
                    </label>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={orderForm.amountNoTax}
                        onChange={e => handleAmountChange('amountNoTax', e.target.value)}
                        placeholder="请输入订单金额（不含税）"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 订单描述（占两列） */}
                <div className="col-span-2">
                  <div className="flex items-start min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-2 pt-2">
                      <span className="text-red-500 mr-0.5">*</span>
                      订单描述
                    </label>
                    <div className="flex-1 min-w-0">
                      <textarea
                        value={orderForm.description}
                        onChange={e => {
                          const v = e.target.value.slice(0, 250)
                          setOrderForm(prev => ({ ...prev, description: v }))
                        }}
                        placeholder="请输入订单描述（最多250字）"
                        rows={3}
                        maxLength={250}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
                      />
                      <div className="text-xs text-gray-400 mt-1 text-right">
                        {orderForm.description.length}/250
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex justify-center gap-3 px-5 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={closeOrderModal}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
              <button
                type="button"
                onClick={handleOrderSubmit}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
