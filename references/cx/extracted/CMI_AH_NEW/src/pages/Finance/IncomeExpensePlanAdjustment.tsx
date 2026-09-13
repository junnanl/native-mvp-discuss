import { useState } from 'react'
import { ArrowLeft, Check, RotateCcw, ChevronRight, ChevronDown, X, Plus, HelpCircle } from 'lucide-react'
import ContractAttachments from '@/components/ContractAttachments'
import { useModal } from '@/components/Modal'
import { getContractInfo } from '@/data/mock'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import DataTable from '@/components/plan-modules/common/DataTable'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import PaymentPlanSection, { defaultMilestones } from '@/components/PaymentPlanSection'
import SegmentedSelect from '@/components/plan-modules/common/SegmentedSelect'
import NumberInput from '@/components/plan-modules/common/NumberInput'
import DateInput from '@/components/plan-modules/common/DateInput'
import PaymentPlansDisplay from '@/components/plan-modules/common/PaymentPlansDisplay'
import { calculateExcludingTax } from '@/lib/utils'

const approverOptions = [
  '张三（省公司财务部）',
  '李四（合肥市分公司财务部）',
  '王五（芜湖市分公司财务部）',
  '赵六（蚌埠市分公司财务部）',
  '钱七（阜阳市分公司财务部）',
  '孙八（淮南市分公司财务部）',
  '周九（马鞍山市分公司财务部）',
  '吴十（安庆市分公司财务部）',
  '郑一（滁州市分公司财务部）',
  '冯二（六安市分公司财务部）'
]

interface IncomeExpensePlanAdjustmentProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

// IT 收入计划行
interface ITIncomePlanRow {
  id: string
  productName: string
  plannedIncome: string
  budgetTariffAmount?: string
  tariffName: string
  plannedTariffAmount: string
  billingShareType: string
  billingSharePeriod: string
  plannedOrderDate: string
  taxRate: string
  mgmtProductName: string
  mgmtProductCode?: string
  coaSubject: string
  contractStage?: string
  isContractAsset?: string
  paymentPlans?: PaymentPlanItem[]
}

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

// 收支计划调整发起 - 独立 mock 数据（与有收有支合同解析页面互不影响）
const mockITIncomePlans: ITIncomePlanRow[] = [
  {
    id: 'iepa-income-1',
    productName: '受托代销手续费',
    plannedIncome: '200,000',
    budgetTariffAmount: '180,000',
    tariffName: '[1372]受托代销手续费',
    plannedTariffAmount: '200,000',
    billingShareType: '月',
    billingSharePeriod: '12',
    plannedOrderDate: '2026-02',
    taxRate: '6%',
    mgmtProductName: '受托代销手续费',
    mgmtProductCode: 'P7060',
    coaSubject: 'C-1372-01',
    contractStage: '初验',
    isContractAsset: '否',
    paymentPlans: [
      { id: 'income-pp-1', milestone: '项目开工', amount: '100,000', paymentDate: '2026-03', transferDate: '2026-03' },
      { id: 'income-pp-2', milestone: '终验', amount: '100,000', paymentDate: '2026-12', transferDate: '2026-12' }
    ]
  }
]

const incomeColumns = [
  { key: 'productName', label: '产品名称' },
  { key: 'plannedIncome', label: '概算收入金额', mergeBy: 'productName' },
  { key: 'taxRate', label: '税率', mergeBy: 'productName' },
  { key: 'tariffName', label: '资费名称' },
  { key: 'plannedTariffAmount', label: '计划订购金额' },
  { key: 'billingShareType', label: '分摊类型' },
  { key: 'billingSharePeriod', label: '分摊周期' },
  {
    key: 'isContractAsset',
    label: '是否合同资产',
    render: (row: ITIncomePlanRow) => {
      if (row.billingShareType !== '一次性') return '-'
      return row.isContractAsset || '否'
    }
  },
  { key: 'plannedOrderDate', label: '计划订购时间' },
  { key: 'mgmtProductName', label: '管会产品' },
  { key: 'coaSubject', label: 'COA科目' }
]

export default function IncomeExpensePlanAdjustment({ onNavigate, contractId }: IncomeExpensePlanAdjustmentProps) {
  const modal = useModal()
  const contractInfo = getContractInfo(contractId || 'CT2026060002')

  // 项目附件标签统一为「后向合同」
  const contractAttachments = contractInfo.attachments.map(a =>
    a.tag === '前向合同' ? { ...a, tag: '后向合同' } : a
  )

  const [sectionManagerApprover, setSectionManagerApprover] = useState('')
  const [financeAdminApprover, setFinanceAdminApprover] = useState('')
  const [incomePlans, setIncomePlans] = useState<ITIncomePlanRow[]>(mockITIncomePlans)
  const [trailExpanded, setTrailExpanded] = useState(false)
  const trailData = [
    { time: '2026-07-15 10:30:00', actor: '张三', action: '提交收支计划调整申请' },
    { time: '2026-07-15 14:20:00', actor: '李四', action: '审批通过，流转至计划变更环节' }
  ]
  const [costPlans, setCostPlans] = useState<ITCostPlanRow[]>([
    {
      id: 'iepa-cost-1',
      productName: '受托代销往来款',
      plannedExpense: '150,000',
      budgetTariffExpense: '135,000',
      taxRate: '6%',
      tariffName: '[1372]受托代销往来款',
      plannedTariffExpense: '150,000',
      maxTariffAmount: '150,000',
      shareType: '月',
      sharePeriod: '12',
      costPaymentDate: '2026-02',
      mgmtProduct: '【P7060】受托代销往来款',
      coaSubject: 'C-1372-01',
      paymentPlans: [
        { id: 'iepa-cost-pp-1', milestone: '项目开工', amount: '50,000', paymentDate: '2026-03', transferDate: '2026-03' },
        { id: 'iepa-cost-pp-2', milestone: '项目上线', amount: '50,000', paymentDate: '2026-06', transferDate: '2026-06' },
        { id: 'iepa-cost-pp-3', milestone: '终验', amount: '50,000', paymentDate: '2026-12', transferDate: '2026-12' }
      ]
    },
    {
      id: 'iepa-cost-2',
      productName: '受托代销往来款',
      plannedExpense: '150,000',
      budgetTariffExpense: '135,000',
      taxRate: '6%',
      tariffName: '[849]受托代销手续费',
      plannedTariffExpense: '100,000',
      maxTariffAmount: '100,000',
      shareType: '月',
      sharePeriod: '12',
      costPaymentDate: '2026-02',
      mgmtProduct: '【P7060】受托代销手续费',
      coaSubject: 'C-849-01',
      paymentPlans: [
        { id: 'iepa-cost-pp-4', milestone: '项目开工', amount: '30,000', paymentDate: '2026-03', transferDate: '2026-03' },
        { id: 'iepa-cost-pp-5', milestone: '项目上线', amount: '70,000', paymentDate: '2026-06', transferDate: '2026-06' }
      ]
    },
    {
      id: 'iepa-cost-3',
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
      paymentPlans: [
        { id: 'iepa-cost-pp-6', milestone: '到货', amount: '80,000', paymentDate: '2026-03', transferDate: '2026-03' }
      ]
    }
  ])

  const totalPlannedIncome = incomePlans.reduce((acc, curr) => {
    const n = parseFloat(curr.plannedIncome.replace(/,/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)

  const totalBudgetIncome = incomePlans.reduce((acc, curr) => {
    const n = parseFloat((curr.budgetTariffAmount || '').replace(/,/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)

  const totalPlannedExpense = costPlans.reduce((acc, curr) => {
    const n = parseFloat(curr.plannedExpense.replace(/,/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)

  const totalBudgetExpense = costPlans.reduce((acc, curr) => {
    const n = parseFloat((curr.budgetTariffExpense || '').replace(/,/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)

  const handleSubmit = () => {
    if (!sectionManagerApprover) {
      alert('请选择科室经理审批')
      return
    }
    if (!financeAdminApprover) {
      alert('请选择财务管理员审批')
      return
    }
    modal.confirm('确定提交吗？', '提交').then(ok => {
      if (ok) {
        onNavigate?.(`/finance/contract/income-expense-plan-adjustment-approval/${contractId || 'CT2026060002'}`)
      }
    })
  }

  const handleCancel = () => onNavigate?.('/finance/contract/query')

  const [paymentPlanModalState, setPaymentPlanModalState] = useState<{
    visible: boolean
    costRowId: string
    paymentPlans: PaymentPlanItem[]
    plannedExpense: string
  }>({ visible: false, costRowId: '', paymentPlans: [], plannedExpense: '' })

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

  // IT收入计划编辑弹框状态
  const [itIncomeModalState, setItIncomeModalState] = useState<{
    visible: boolean
    editingRow: ITIncomePlanRow | null
  }>({ visible: false, editingRow: null })
  const [itIncomePaymentPlans, setItIncomePaymentPlans] = useState<PaymentPlanItem[]>([])

  const openItIncomeEditModal = (row: ITIncomePlanRow) => {
    setItIncomePaymentPlans(row.paymentPlans || [])
    setItIncomeModalState({ visible: true, editingRow: row })
  }

  const closeItIncomeModal = () => {
    setItIncomeModalState({ visible: false, editingRow: null })
    setItIncomePaymentPlans([])
  }

  const handleItIncomeSubmit = () => {
    if (!itIncomeModalState.editingRow) return
    // 选择"是否合同资产"为"是"时，必须填写合同资产转出计划（回款计划明细）
    if (itIncomeModalState.editingRow.billingShareType === '一次性'
      && itIncomeModalState.editingRow.isContractAsset === '是') {
      if (!itIncomePaymentPlans || itIncomePaymentPlans.length === 0) {
        alert('请填写合同资产转出计划（回款计划明细）')
        return
      }
      const missing = itIncomePaymentPlans.find(p =>
        !p.milestone || !p.amount || !p.paymentDate || !p.transferDate
      )
      if (missing) {
        alert('合同资产转出计划中里程碑名称、计划回款金额、计划回款时间、合同资产计划转出时间均不能为空')
        return
      }
    }
    setIncomePlans(prev => prev.map(r =>
      r.id === itIncomeModalState.editingRow!.id
        ? { ...itIncomeModalState.editingRow!, paymentPlans: itIncomePaymentPlans }
        : r
    ))
    closeItIncomeModal()
  }

  // IT收入计划回款计划查看弹框
  const [itIncomeViewingPlans, setItIncomeViewingPlans] = useState<ITIncomePlanRow | null>(null)

  const handleUpdateCostPlan = (id: string, key: keyof ITCostPlanRow, value: string) => {
    setCostPlans(prev => prev.map(row => row.id === id ? { ...row, [key]: value } : row))
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部标题栏 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button type="button" onClick={handleCancel} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
            <ArrowLeft className="w-4 h-4" />返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">收支计划调整发起</h2>
          </div>
        </div>

        {/* 项目信息 */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 合同信息 */}
        <ContractInfoCard contractInfo={contractInfo} defaultExpanded={true} />

        {/* 合同附件 */}
        <ContractAttachments attachments={contractAttachments} />

        {/* 流程轨迹 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
            onClick={() => setTrailExpanded(v => !v)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
            <span className="text-xs text-gray-400 ml-1">共 {trailData.length} 步</span>
            {trailExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
              : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
            }
          </div>
          {trailExpanded && (
            <div className="p-4">
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
                <ol className="space-y-4">
                  {trailData.map((item, idx) => (
                    <li key={idx} className="relative">
                      <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 ${
                        idx === trailData.length - 1
                          ? 'bg-[#1677FF] border-[#1677FF]'
                          : 'bg-white border-gray-300'
                      }`} />
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

        {/* 计划信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">计划信息</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* IT 收入计划 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h3 className="text-sm font-semibold text-gray-800">IT收入计划</h3>
                  <span className="text-xs text-gray-400">【{incomePlans.length}】</span>
                </div>
              </div>
              <div className="p-4">
                <DataTable 
                  columns={incomeColumns} 
                  data={incomePlans} 
                  mergeColumns={['productName', 'plannedIncome', 'taxRate']}
                  onEdit={(row) => openItIncomeEditModal(row)}
                  extraActions={(row) => (
                    <button
                      type="button"
                      onClick={() => setItIncomeViewingPlans(row)}
                      className="px-2 py-1 text-xs text-[#1677FF] hover:underline"
                    >
                      回款计划
                    </button>
                  )}
                />
                <div className="mt-4 flex justify-end items-center gap-6">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{incomePlans.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{incomePlans.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || r.plannedTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{incomePlans.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* IT 成本计划 */}
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
          </div>
        </div>

        {/* 流程信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">流程信息</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步环节</label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    收支计划调整审批
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步处理人</label>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs text-blue-600 bg-blue-50 rounded shrink-0">科室经理</span>
                      <div className="flex-1 min-w-0">
                        <SearchableSelect value={sectionManagerApprover} onChange={setSectionManagerApprover} options={approverOptions} placeholder="请选择处理人" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs text-blue-600 bg-blue-50 rounded shrink-0">财务管理员</span>
                      <div className="flex-1 min-w-0">
                        <SearchableSelect value={financeAdminApprover} onChange={setFinanceAdminApprover} options={approverOptions} placeholder="请选择处理人" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100 bg-white rounded-lg shadow-sm p-4">
          <button type="button" onClick={handleCancel} className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5">
            <RotateCcw className="w-4 h-4" />取消
          </button>
          <button type="button" onClick={handleSubmit} className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5">
            <Check className="w-4 h-4" />提交
          </button>
        </div>
      </div>

      {/* IT收入计划新增/修改弹框 */}
      {itIncomeModalState.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-[900px] max-h-[85vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">IT收入计划修改</h3>
              </div>
              <button
                type="button"
                onClick={closeItIncomeModal}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(85vh-120px)]">
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>产品名称
                  </label>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {itIncomeModalState.editingRow?.productName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>资费名称
                  </label>
                  <SearchableSelect
                    value={itIncomeModalState.editingRow?.tariffName || ''}
                    onChange={(v) => {
                      setItIncomeModalState(prev => ({
                        ...prev,
                        editingRow: prev.editingRow ? { ...prev.editingRow, tariffName: v } : null
                      }))
                    }}
                    options={['[1372]受托代销手续费', '[849]受托代销手续费', '[1205]系统集成服务', '[956]软件开发服务']}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>税率
                  </label>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {itIncomeModalState.editingRow?.taxRate || '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>计划订购金额
                  </label>
                  <NumberInput
                    value={itIncomeModalState.editingRow?.plannedTariffAmount || ''}
                    onChange={(v) => {
                      setItIncomeModalState(prev => ({
                        ...prev,
                        editingRow: prev.editingRow ? { ...prev.editingRow, plannedTariffAmount: v } : null
                      }))
                    }}
                    placeholder="请输入金额"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>分摊类型
                  </label>
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
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>分摊周期
                  </label>
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
                </div>
                {itIncomeModalState.editingRow?.billingShareType === '一次性' && (
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      <span className="text-red-500 mr-0.5">*</span>是否合同资产
                    </label>
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
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>计划订购时间
                  </label>
                  <DateInput
                    value={itIncomeModalState.editingRow?.plannedOrderDate || ''}
                    onChange={(v) => {
                      setItIncomeModalState(prev => ({
                        ...prev,
                        editingRow: prev.editingRow ? { ...prev.editingRow, plannedOrderDate: v } : null
                      }))
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    <span className="text-red-500 mr-0.5">*</span>里程碑名称
                  </label>
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
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">管会产品</label>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {itIncomeModalState.editingRow?.mgmtProductCode ? `${itIncomeModalState.editingRow.mgmtProductCode} ${itIncomeModalState.editingRow.mgmtProductName}` : (itIncomeModalState.editingRow?.mgmtProductName || '-')}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">COA科目</label>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {itIncomeModalState.editingRow?.coaSubject || '-'}
                  </div>
                </div>
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

              <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeItIncomeModal}
                  className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />取消
                </button>
                <button
                  type="button"
                  onClick={handleItIncomeSubmit}
                  className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* IT收入计划回款计划查看弹框 */}
      {itIncomeViewingPlans && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[70vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">回款计划明细</h3>
              </div>
              <button
                type="button"
                onClick={() => setItIncomeViewingPlans(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(70vh-120px)]">
              <PaymentPlanSection
                value={itIncomeViewingPlans.paymentPlans || []}
                onChange={() => {}}
                plannedIncome={itIncomeViewingPlans.plannedTariffAmount || itIncomeViewingPlans.plannedIncome}
                readOnly
                hideMilestoneName
                hideTransferDate
                hideActions
                hideHeader
                title="回款计划明细"
                amountLabel="计划回款金额"
                dateLabel="计划回款时间"
              />
            </div>
            <div className="flex justify-center pt-4 pb-4 border-t border-gray-100 px-4">
              <button
                type="button"
                onClick={() => setItIncomeViewingPlans(null)}
                className="px-6 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 付款计划明细弹框 */}
      {paymentPlanModalState.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">付款计划明细</h3>
              </div>
              <button
                type="button"
                onClick={() => setPaymentPlanModalState(prev => ({ ...prev, visible: false }))}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[50vh] overflow-y-auto">
              <PaymentPlanSection
                value={paymentPlanModalState.paymentPlans}
                onChange={handlePaymentPlanChange}
                plannedIncome={paymentPlanModalState.plannedExpense}
                milestones={defaultMilestones}
                hideTransferDate
                hideMilestoneName
                hideHeader
                amountLabel="计划付款金额"
                dateLabel="计划付款时间"
              />
            </div>
            <div className="flex justify-center pt-4 pb-4 border-t border-gray-100 px-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentPlanModalState(prev => ({ ...prev, visible: false }))}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
              <button
                type="button"
                onClick={handlePaymentPlanConfirm}
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
  )
}
