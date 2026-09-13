import type { PaymentPlanItem } from '../types'

interface PaymentPlansDisplayProps {
  plans: PaymentPlanItem[]
  /** 计划订购金额，用于计算计划回款比例（计划回款金额/计划订购金额） */
  plannedIncome?: string
  hideTransferDate?: boolean
  hideMilestoneName?: boolean
  hideHeader?: boolean
}

export default function PaymentPlansDisplay({ plans, plannedIncome = '', hideTransferDate = false, hideMilestoneName = false, hideHeader = false }: PaymentPlansDisplayProps) {
  if (!plans || plans.length === 0) return null
  const orderAmount = parseFloat(String(plannedIncome).replace(/,/g, '')) || 0
  return (
    <div className="mt-2">
      {!hideHeader && (
        <div className="text-xs font-medium text-gray-600 mb-2">回款计划明细</div>
      )}
      <div className="overflow-x-auto border border-gray-100 rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-600 text-xs">
              <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">序号</th>
              {!hideMilestoneName && (
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">里程碑名称</th>
              )}
              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划回款金额</th>
              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划回款比例</th>
              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划回款时间</th>
              {!hideTransferDate && (
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同资产计划转出时间</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {plans.map((plan, idx) => (
              <tr key={plan.id} className="hover:bg-gray-50/50">
                <td className="px-3 py-2.5 text-center text-gray-600">{idx + 1}</td>
                {!hideMilestoneName && (
                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{plan.milestone || '-'}</td>
                )}
                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{plan.amount || '-'}</td>
                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                  {plan.amount && orderAmount > 0
                    ? `${((parseFloat(plan.amount) / orderAmount) * 100).toFixed(2)}%`
                    : '-'}
                </td>
                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{plan.paymentDate || '-'}</td>
                {!hideTransferDate && (
                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{plan.transferDate || '-'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
