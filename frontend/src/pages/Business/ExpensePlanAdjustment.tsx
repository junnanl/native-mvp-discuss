import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  RotateCcw,
  X,
  HelpCircle
} from 'lucide-react'
import { useModal } from '@/components/Modal'
import { getContractInfo } from '@/data/mock'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import ContractAttachments from '@/components/ContractAttachments'
import ProcessTrail, { type ProcessTrailItem } from '@/components/ProcessTrail'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import { calculateExcludingTax } from '@/lib/utils'
import PaymentPlanSection, { defaultMilestones } from '@/components/PaymentPlanSection'

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

interface ExpensePlanAdjustmentProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

// 支出计划调整发起 - 独立 mock 数据（与后向合同解析页面互不影响）
const initialCostPlans: ITCostPlanRow[] = [
  {
    id: 'cost-adjust-1',
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
    id: 'cost-adjust-2',
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
    id: 'cost-adjust-3',
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
]

export default function ExpensePlanAdjustment({ onNavigate, contractId }: ExpensePlanAdjustmentProps) {
  const modal = useModal()
  const rawContractInfo = getContractInfo(contractId || 'CT2026060004')
  // 附件标签"前向合同"改为"后向合同"
  const contractInfo = {
    ...rawContractInfo,
    attachments: (rawContractInfo.attachments || []).map(a =>
      a.tag === '前向合同' ? { ...a, tag: '后向合同' } : a
    )
  }

  const [costPlans, setCostPlans] = useState<ITCostPlanRow[]>(initialCostPlans)
  const [paymentPlanModalState, setPaymentPlanModalState] = useState<{
    visible: boolean
    costRowId: string
    paymentPlans: PaymentPlanItem[]
    plannedExpense: string
  }>({ visible: false, costRowId: '', paymentPlans: [], plannedExpense: '' })

  // 流程信息处理人
  const [backwardApprover1, setBackwardApprover1] = useState('')
  const [backwardApprover2, setBackwardApprover2] = useState('')

  const deptManagerOptions = ['张科（科室经理）', '李科（科室经理）', '王科（科室经理）']
  const financeManagerOptions = ['赵财务（财务管理员）', '孙财务（财务管理员）', '周财务（财务管理员）']

  const trailData: ProcessTrailItem[] = [
    { time: '2026-07-15 10:30:00', actor: '张三', action: '提交支出计划调整申请' },
    { time: '2026-07-15 14:20:00', actor: '李四', action: '审批通过，流转至计划变更环节' }
  ]

  const handleSubmit = () => {
    modal.confirm('确定提交吗？', '提交').then(ok => {
      if (ok) {
        onNavigate?.(`/finance/contract/expense-plan-adjustment-approval/${contractId || 'CT2026060004'}`)
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
            <h2 className="text-sm font-semibold text-gray-800">支出计划调整发起</h2>
          </div>
        </div>

        {/* 1. 项目信息 */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 合同信息 */}
        <ContractInfoCard contractInfo={contractInfo} defaultExpanded={true} />

        {/* 附件 */}
        <ContractAttachments attachments={contractInfo.attachments} />

        {/* 流程轨迹 */}
        <ProcessTrail trail={trailData} defaultExpanded={false} />

        {/* 计划信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">计划信息</h3>
          </div>
          <div className="p-4">
            {/* IT成本计划 */}
            <div className="bg-white rounded-lg">
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
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步环节</label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      支出计划调整审批
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

        {/* 底部操作区 */}
        <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100 bg-white rounded-lg shadow-sm p-4">
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
        </div>
      </div>

      {/* 付款计划明细弹框 */}
      {paymentPlanModalState.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">付款计划明细</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  合计：<span className="text-[#1677FF] font-medium">{paymentPlanModalState.paymentPlans.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)}</span> / {paymentPlanModalState.plannedExpense}
                </span>
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
    </div>
  )
}
