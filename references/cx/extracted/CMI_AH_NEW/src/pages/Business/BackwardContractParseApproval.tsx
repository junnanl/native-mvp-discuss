import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  RotateCcw,
  HelpCircle
} from 'lucide-react'
import ContractAttachments from '@/components/ContractAttachments'
import { getContractInfo } from '@/data/mock'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import SectionBlock from '@/components/plan-modules/common/SectionBlock'
import PaymentPlanSection from '@/components/PaymentPlanSection'
import { calculateExcludingTax } from '@/lib/utils'

interface BackwardContractParseApprovalProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

const deliveryManagerOptions = ['张交付（交付经理）', '李交付（交付经理）', '王交付（交付经理）']

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

export default function BackwardContractParseApproval({
  onNavigate,
  contractId
}: BackwardContractParseApprovalProps) {
  const contractInfo = getContractInfo(contractId || 'CT2026060007')

  const [approvalResult, setApprovalResult] = useState<'approved' | 'rejected'>('approved')
  const [approvalComment, setApprovalComment] = useState('通过')
  const [deliveryApprover, setDeliveryApprover] = useState('')
  const [paymentPlanModalRow, setPaymentPlanModalRow] = useState<typeof mockCostPlans[0] | null>(null)

  const handleApprovalResultChange = (value: 'approved' | 'rejected') => {
    setApprovalResult(value)
    setApprovalComment(value === 'approved' ? '通过' : '')
  }

  const costPlans = mockCostPlans

  const handleCancel = () => {
    onNavigate?.('/workbench')
  }

  const handleApprove = () => {
    onNavigate?.('/workbench')
  }

  const totalPlannedExpense = costPlans.reduce((sum, r) => sum + parseFloat(r.plannedExpense.replace(/,/g, '')) || 0, 0)
  const totalBudgetExpense = costPlans.reduce((sum, r) => sum + parseFloat((r.budgetTariffExpense || r.plannedTariffExpense || '0').replace(/,/g, '')) || 0, 0)
  const totalExcludingTax = costPlans.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffExpense || r.plannedTariffExpense || '0', r.taxRate)) || 0, 0)

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

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full mx-auto p-3 space-y-3">
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
            <h2 className="text-sm font-semibold text-gray-800">后向合同解析审批</h2>
          </div>
          <div className="ml-auto">
            <span className="inline-flex items-center px-2 py-1 text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded">
              待审批
            </span>
          </div>
        </div>

        {/* 1. 项目信息（默认收起） */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 合同信息（默认展开） */}
        <ContractInfoCard contractInfo={contractInfo} defaultExpanded={true} />

        {/* 3. 项目附件 */}
        <ContractAttachments attachments={contractInfo.attachments.map(a =>
          a.tag === '前向合同' ? { ...a, tag: '后向合同' } : a
        )} />

        {/* 4. 计划信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">计划信息</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* IT成本计划 */}
            <SectionBlock
              title="IT成本计划"
              count={costPlans.length}
            >
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
        </div>

        {/* 5. 审批信息 */}
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
                      onClick={() => handleApprovalResultChange('approved')}
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
                      onClick={() => handleApprovalResultChange('rejected')}
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

        {/* 6. 流程信息（仅驳回时展示） */}
        {approvalResult === 'rejected' && (
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
                      后向合同解析
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
                        交付经理
                      </span>
                      <div className="flex-1 min-w-0">
                        <SearchableSelect
                          value={deliveryApprover}
                          onChange={setDeliveryApprover}
                          options={deliveryManagerOptions}
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

        {/* 7. 按钮区 */}
        <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            取消
          </button>
          <button
            type="button"
            onClick={handleApprove}
            className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            提交
          </button>
        </div>

        {/* 付款计划弹框（只读） */}
        {paymentPlanModalRow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h3 className="text-sm font-semibold text-gray-800">付款计划明细</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPaymentPlanModalRow(null)}
                  className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                >
                  ×
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
                  className="px-6 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
