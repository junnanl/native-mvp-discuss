import { useState } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, ChevronDown, ChevronRight, RotateCcw, HelpCircle } from 'lucide-react'
import ContractAttachments from '@/components/ContractAttachments'
import { getContractInfo } from '@/data/mock'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import SectionBlock from '@/components/plan-modules/common/SectionBlock'
import PaymentPlanSection from '@/components/PaymentPlanSection'
import { calculateExcludingTax } from '@/lib/utils'

interface ExpenseContractDetailProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

// ============================================================
// 成本计划 mock 数据（复制自后向合同解析审批页面，独立维护）
// ============================================================
const mockCostPlans = [
  {
    id: 'cost-1',
    productName: '集成费',
    plannedExpense: '150,000',
    budgetTariffExpense: '135,000',
    taxRate: '6%',
    tariffName: '[1372]集成费',
    plannedTariffExpense: '150,000',
    shareType: '月',
    sharePeriod: '12',
    costPaymentDate: '2026-02',
    mgmtProduct: '【P7060】集成费',
    coaSubject: 'C-1372-01',
    paymentPlans: [
      { id: 'pp-1', milestone: '项目开工', amount: '50,000', paymentDate: '2026-03', transferDate: '2026-03' },
      { id: 'pp-2', milestone: '项目上线', amount: '50,000', paymentDate: '2026-06', transferDate: '2026-06' },
      { id: 'pp-3', milestone: '终验', amount: '50,000', paymentDate: '2026-12', transferDate: '2026-12' }
    ]
  },
  {
    id: 'cost-2',
    productName: '集成费',
    plannedExpense: '150,000',
    budgetTariffExpense: '135,000',
    taxRate: '6%',
    tariffName: '[849]集成费安装服务',
    plannedTariffExpense: '100,000',
    shareType: '月',
    sharePeriod: '12',
    costPaymentDate: '2026-02',
    mgmtProduct: '【P7060】集成费安装服务',
    coaSubject: 'C-849-01',
    paymentPlans: [
      { id: 'pp-4', milestone: '项目开工', amount: '30,000', paymentDate: '2026-03', transferDate: '2026-03' },
      { id: 'pp-5', milestone: '项目上线', amount: '70,000', paymentDate: '2026-06', transferDate: '2026-06' }
    ]
  },
  {
    id: 'cost-3',
    productName: '商品销售成本',
    plannedExpense: '80,000',
    budgetTariffExpense: '72,000',
    taxRate: '13%',
    tariffName: '[956]商品销售成本',
    plannedTariffExpense: '80,000',
    shareType: '一次性',
    sharePeriod: '1',
    costPaymentDate: '2026-03',
    mgmtProduct: '【P7061】商品销售成本',
    coaSubject: 'C-956-01',
    paymentPlans: [
      { id: 'pp-6', milestone: '到货', amount: '80,000', paymentDate: '2026-03', transferDate: '2026-03' }
    ]
  }
]

// ============================================================
// 流程轨迹 mock 数据（按时间正序，最后一步为最新）
// ============================================================
const mockProcessTrail = [
  { time: '2026-06-03 09:15', actor: '张凯', action: '起草合同' },
  { time: '2026-06-25 10:00', actor: '李明', action: '合同审核通过' },
  { time: '2026-07-01 09:00', actor: '系统', action: '合同生效，开始履行' }
]

// ============================================================
// 主页面
// ============================================================
export default function ExpenseContractDetail({ onNavigate, contractId }: ExpenseContractDetailProps) {
  const contractInfo = getContractInfo(contractId || 'CT2026060007')

  // 计划信息 - 默认展开
  const [planExpanded, setPlanExpanded] = useState(true)
  // 流程轨迹 - 默认折叠
  const [trailExpanded, setTrailExpanded] = useState(false)
  // 付款计划查看弹框
  const [paymentPlanModalRow, setPaymentPlanModalRow] = useState<typeof mockCostPlans[0] | null>(null)

  const costPlans = mockCostPlans

  const totalPlannedExpense = costPlans.reduce((sum, r) => sum + parseFloat(r.plannedExpense.replace(/,/g, '')) || 0, 0)
  const totalBudgetExpense = costPlans.reduce((sum, r) => sum + parseFloat((r.budgetTariffExpense || r.plannedTariffExpense || '0').replace(/,/g, '')) || 0, 0)
  const totalExcludingTax = costPlans.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffExpense || r.plannedTariffExpense || '0', r.taxRate)) || 0, 0)

  // 行合并信息（产品名称 / 概算支出金额 / 税率）
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

  const handleBack = () => {
    onNavigate?.('/finance/contract')
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部返回条 */}
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
            <h2 className="text-sm font-semibold text-gray-800">支出合同详情</h2>
          </div>
        </div>

        {/* 1. 项目信息（默认折叠） */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 合同信息（默认折叠） */}
        <ContractInfoCard contractInfo={contractInfo} />

        {/* 3. 项目附件（默认折叠） */}
        <ContractAttachments
          attachments={contractInfo.attachments.map(a =>
            a.tag === '前向合同' ? { ...a, tag: '后向合同' } : a
          )}
          defaultExpanded={false}
        />

        {/* 4. 计划信息（默认展开） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
            onClick={() => setPlanExpanded(v => !v)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">计划信息</h3>
            {planExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
              : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
            }
          </div>
          {planExpanded && (
            <div className="p-4 space-y-4">
              {/* IT成本计划 */}
              <SectionBlock title="IT成本计划" count={costPlans.length}>
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
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costPlans.map((row, idx) => (
                        <tr key={row.id} className="border-t border-gray-100">
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
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffExpense}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.shareType}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.sharePeriod}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.costPaymentDate}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProduct}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setPaymentPlanModalRow(row)}
                              className="text-[#1677FF] hover:underline text-xs"
                            >
                              付款计划
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end items-center gap-6">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">概算支出合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{totalPlannedExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{totalBudgetExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{totalExcludingTax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                </div>
              </SectionBlock>
            </div>
          )}
        </div>

        {/* 5. 流程轨迹（默认折叠） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
            onClick={() => setTrailExpanded(v => !v)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
            <span className="text-xs text-gray-400 ml-1">共 {mockProcessTrail.length} 步</span>
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

        {/* 底部按钮区 */}
        <div className="flex justify-center pt-4 pb-2">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            返回
          </button>
        </div>
      </div>

      {/* 付款计划弹框（只读） */}
      {paymentPlanModalRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setPaymentPlanModalRow(null)}>
          <div
            className="bg-white rounded-lg shadow-xl w-[800px] max-w-[92vw] max-h-[85vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">付款计划明细</h3>
              </div>
              <button
                type="button"
                onClick={() => setPaymentPlanModalRow(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <PaymentPlanSection
                value={paymentPlanModalRow.paymentPlans || []}
                onChange={() => {}}
                plannedIncome={paymentPlanModalRow.plannedTariffExpense}
                readOnly
                hideTransferDate
                hideMilestoneName
                hideActions
                hideHeader
                title="付款计划明细"
                amountLabel="计划付款金额"
                dateLabel="计划付款时间"
              />
            </div>
            <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPaymentPlanModalRow(null)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
