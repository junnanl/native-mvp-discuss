import { useState, useMemo, useEffect } from 'react'
import { Plus, Trash2, Info } from 'lucide-react'
import { sanitizeAmountInput, formatToTwoDecimals } from '@/lib/utils'
import DateInput from '@/components/plan-modules/common/DateInput'

export interface PaymentPlanItem {
  id: string
  milestone: string
  amount: string
  paymentDate: string
  transferDate: string
}

export interface MilestoneOption {
  name: string
  date: string
}

export const defaultMilestones: MilestoneOption[] = [
  { name: '项目开工', date: '' },
  { name: '到货', date: '' },
  { name: '项目上线', date: '' },
  { name: '初验', date: '' },
  { name: '试运行', date: '' },
  { name: '终验', date: '' },
  { name: '维护', date: '' }
]

interface PaymentPlanSectionProps {
  value: PaymentPlanItem[]
  onChange: (plans: PaymentPlanItem[]) => void
  plannedIncome: string
  isContractAsset?: '是' | '否' | boolean
  milestones?: MilestoneOption[]
  readOnly?: boolean
  hideTransferDate?: boolean
  hideMilestoneName?: boolean
  hideActions?: boolean
  hideHeader?: boolean
  title?: string
  amountLabel?: string
  dateLabel?: string
  disableMilestoneEdit?: boolean
  disableAmountEdit?: boolean
  disablePaymentDateEdit?: boolean
  disableTransferDateEdit?: boolean
  disableAdd?: boolean
  disableDelete?: boolean
  /** 计划订购时间（ISO日期字符串）；用于控制计划回款时间的 min/max 边界 */
  plannedOrderDate?: string
}

/**
 * 在指定日期上加上 N 个月，返回 YYYY-MM-DD
 */
function addMonths(dateStr: string, months: number): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  d.setMonth(d.getMonth() + months)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * 生成一个空的 PaymentPlanItem
 */
function makeEmptyPlan(): PaymentPlanItem {
  return {
    id: 'plan-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    milestone: '',
    amount: '',
    paymentDate: '',
    transferDate: ''
  }
}

export default function PaymentPlanSection({
  value,
  onChange,
  plannedIncome,
  isContractAsset,
  milestones = [],
  readOnly = false,
  hideTransferDate = false,
  hideMilestoneName = false,
  hideActions = false,
  hideHeader = false,
  title = '回款计划明细',
  amountLabel = '计划回款金额',
  dateLabel = '计划回款时间',
  disableMilestoneEdit = false,
  disableAmountEdit = false,
  disablePaymentDateEdit = false,
  disableTransferDateEdit = false,
  disableAdd = false,
  disableDelete = false,
  plannedOrderDate = '',
  showDateTip
}: PaymentPlanSectionProps & { showDateTip?: boolean }) {
  const contractAssetEnabled = isContractAsset === '是' || isContractAsset === true
  // 付款计划不展示比例列，仅回款计划展示「计划回款比例」
  const isPayment = amountLabel.includes('付款')

  const [activeMilestonePlanId, setActiveMilestonePlanId] = useState<string | null>(null)
  const [milestoneDropdownRect, setMilestoneDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null)

  // 任务（1）：当组件接收空数组时（新增弹框），自动初始化一条空回款计划明细
  // 使用 useEffect 在渲染后同步回写到 onChange（稳定、无竞态）
  useEffect(() => {
    if (value.length === 0 && !readOnly && !disableAdd) {
      onChange([makeEmptyPlan()])
    }
    // 仅在首次挂载/这些关键依赖变化时触发（不监听 onChange 以避免循环）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.length, readOnly, disableAdd])

  // displayValue 仅用于受控显示（与 value 保持一致）
  const displayValue: PaymentPlanItem[] = value

  const totalPaymentAmount = useMemo(() => {
    return displayValue.reduce((sum, item) => {
      const val = parseFloat(item.amount)
      return sum + (isNaN(val) ? 0 : val)
    }, 0)
  }, [displayValue])

  const incomeAmount = useMemo(() => {
    const v = parseFloat(plannedIncome.replace(/,/g, ''))
    return isNaN(v) ? 0 : v
  }, [plannedIncome])

  // 时间边界（任务3）
  const minPaymentDate = plannedOrderDate
  const maxPaymentDate = plannedOrderDate ? addMonths(plannedOrderDate, 60) : ''

  const handleAdd = () => {
    if (disableAdd) return
    const newPlan = makeEmptyPlan()
    onChange([...displayValue, newPlan])
  }

  const handleRemove = (id: string) => {
    if (disableDelete) return
    const next = displayValue.filter(p => p.id !== id)
    onChange(next)
  }

  const handleChange = (id: string, key: keyof PaymentPlanItem, val: string) => {
    onChange(displayValue.map(p => {
      if (p.id !== id) return p
      const updated = { ...p, [key]: val }
      if (key === 'milestone') {
        const milestone = milestones.find(m => m.name === val)
        if (milestone) {
          updated.paymentDate = milestone.date
          if (contractAssetEnabled) {
            updated.transferDate = milestone.date
          }
        }
      }
      if (key === 'paymentDate' && contractAssetEnabled) {
        updated.transferDate = val
      }
      return updated
    }))
  }

  const displayDateTip = showDateTip !== undefined ? showDateTip : !readOnly

  return (
    <>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
            {displayDateTip && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700 ml-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span className="leading-4">
                  计划回款时间需满足「计划订购时间 ＜ 计划回款时间 ≤ 计划订购时间 + 60个月」
                </span>
              </div>
            )}
          </div>
          {!readOnly && !disableAdd && (
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
            >
              <Plus className="w-4 h-4" />
              {title.includes('付款') ? '付款计划新增' : '回款计划新增'}
            </button>
          )}
        </div>
      )}

      <div className="border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-gray-500">
              {!hideMilestoneName && (
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">里程碑名称</th>
              )}
              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">{amountLabel}</th>
              {!isPayment && (
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划回款比例</th>
              )}
              <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">{dateLabel}</th>
              {!hideTransferDate && (
                <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同资产计划转出时间</th>
              )}
              {!readOnly && !hideActions && !disableDelete && <th className="w-16 px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayValue.map((plan) => {
              // 金额校验（单项）- 仅保留输入框视觉限制，不展示文字提示
              const planAmount = parseFloat(plan.amount) || 0
              const amountOver = planAmount > incomeAmount && incomeAmount > 0
              // 时间校验
              let dateInvalid = false
              if (plan.paymentDate && plannedOrderDate) {
                const tOrder = new Date(plannedOrderDate).getTime()
                const tPay = new Date(plan.paymentDate).getTime()
                const tMax = maxPaymentDate ? new Date(maxPaymentDate).getTime() : Infinity
                if (!(tPay > tOrder && tPay <= tMax)) {
                  dateInvalid = true
                }
              }
              return (
                <tr key={plan.id} className="hover:bg-gray-50/50">
                  {!hideMilestoneName && (
                    <td className="px-3 py-2">
                      {readOnly || disableMilestoneEdit ? (
                        <span className="text-gray-700">{plan.milestone || '-'}</span>
                      ) : (
                        <input
                          type="text"
                          value={plan.milestone}
                          onChange={(e) => handleChange(plan.id, 'milestone', e.target.value)}
                          onFocus={(e) => {
                            const rect = e.target.getBoundingClientRect()
                            setMilestoneDropdownRect({ top: rect.bottom + 4, left: rect.left, width: rect.width })
                            setActiveMilestonePlanId(plan.id)
                          }}
                          onBlur={() => setTimeout(() => {
                            setActiveMilestonePlanId(null)
                            setMilestoneDropdownRect(null)
                          }, 150)}
                          placeholder="请选择或输入里程碑名称"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                      )}
                    </td>
                  )}
                  <td className="px-3 py-2">
                    {readOnly || disableAmountEdit ? (
                      <span className="text-gray-700">{plan.amount || '-'}</span>
                    ) : (
                      <input
                        type="text"
                        inputMode="decimal"
                        value={plan.amount}
                        onBlur={(e) => {
                          const formatted = formatToTwoDecimals(sanitizeAmountInput(e.target.value))
                          handleChange(plan.id, 'amount', formatted)
                        }}
                        onInput={(e) => {
                          e.currentTarget.value = sanitizeAmountInput(e.currentTarget.value)
                        }}
                        onChange={(e) => handleChange(plan.id, 'amount', e.target.value)}
                        placeholder="请输入金额"
                        className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:border-blue-500 text-left ${amountOver ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                      />
                    )}
                  </td>
                  {!isPayment && (
                    <td className="px-3 py-2">
                      <span className="text-gray-700">
                        {plan.amount && incomeAmount > 0
                          ? `${((parseFloat(plan.amount) / incomeAmount) * 100).toFixed(2)}%`
                          : '-'}
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-2">
                    {readOnly || disablePaymentDateEdit ? (
                      <span className="text-gray-700">{plan.paymentDate || '-'}</span>
                    ) : (
                      <div className="flex flex-col gap-0.5">
                        <DateInput
                          value={plan.paymentDate}
                          onChange={(v) => handleChange(plan.id, 'paymentDate', v)}
                          min={minPaymentDate}
                          max={maxPaymentDate}
                          className={dateInvalid ? '!border-red-400 !bg-red-50' : ''}
                        />
                        {dateInvalid && (
                          <span className="text-xs text-red-500">
                            需满足「{plannedOrderDate}」 ＜ 计划回款时间 ≤ 「{maxPaymentDate}」
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  {!hideTransferDate && (
                    <td className="px-3 py-2">
                      {readOnly || disableTransferDateEdit || !contractAssetEnabled ? (
                        <span className="text-gray-700">{plan.transferDate || '-'}</span>
                      ) : (
                        <DateInput
                          value={plan.transferDate}
                          onChange={(v) => handleChange(plan.id, 'transferDate', v)}
                        />
                      )}
                    </td>
                  )}
                  {!readOnly && !hideActions && !disableDelete && (
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemove(plan.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* 合计区域（参考图一：放在右下角） */}
      <div className="mt-3 flex justify-end items-baseline gap-2">
        <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">合计：</span>
        <span className="text-lg font-semibold text-[#1677FF] whitespace-nowrap tabular-nums">
          {totalPaymentAmount.toFixed(2)}
        </span>
        <span className="text-sm font-medium text-gray-500 whitespace-nowrap tabular-nums">
          / {plannedIncome || '0'}
        </span>
      </div>

      {/* 里程碑下拉 */}
      {milestoneDropdownRect && activeMilestonePlanId && milestones.length > 0 && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{
            top: milestoneDropdownRect.top,
            left: milestoneDropdownRect.left,
            width: milestoneDropdownRect.width
          }}
        >
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50"
              onMouseDown={() => {
                handleChange(activeMilestonePlanId, 'milestone', m.name)
                setActiveMilestonePlanId(null)
                setMilestoneDropdownRect(null)
              }}
            >
              <div className="font-medium text-gray-800">{m.name}</div>
              <div className="text-xs text-gray-400">{m.date}</div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export function validatePaymentPlans(
  plans: PaymentPlanItem[],
  plannedIncome: string,
  isContractAsset: '是' | '否' | boolean,
  hideTransferDate = false,
  hideMilestoneName = false,
  plannedOrderDate?: string
): string | null {
  if (plans.length === 0) {
    return '请至少添加一条回款计划'
  }
  const contractAssetEnabled = isContractAsset === '是' || isContractAsset === true
  const incomeAmount = parseFloat(String(plannedIncome).replace(/,/g, '')) || 0

  let total = 0
  for (let i = 0; i < plans.length; i++) {
    const plan = plans[i]
    if (!hideMilestoneName && !plan.milestone.trim()) {
      return `第 ${i + 1} 条回款计划的里程碑名称不能为空`
    }
    if (!plan.amount.trim() || isNaN(parseFloat(plan.amount)) || parseFloat(plan.amount) <= 0) {
      return `第 ${i + 1} 条回款计划的计划回款金额不能为空且必须大于0`
    }
    const planAmount = parseFloat(plan.amount) || 0
    // 单条不超过计划订购金额
    if (incomeAmount > 0 && planAmount > incomeAmount + 0.001) {
      return `第 ${i + 1} 条回款计划的计划回款金额不能大于计划订购金额（${plannedIncome}）`
    }
    total += planAmount
    if (!plan.paymentDate) {
      return `第 ${i + 1} 条回款计划的计划回款时间不能为空`
    }
    // 时间范围校验
    if (plannedOrderDate) {
      const tOrder = new Date(plannedOrderDate).getTime()
      const tPay = new Date(plan.paymentDate).getTime()
      const maxD = new Date(plannedOrderDate)
      maxD.setMonth(maxD.getMonth() + 60)
      const tMax = maxD.getTime()
      if (!(tPay > tOrder && tPay <= tMax)) {
        const y = maxD.getFullYear()
        const m = String(maxD.getMonth() + 1).padStart(2, '0')
        const d = String(maxD.getDate()).padStart(2, '0')
        return `第 ${i + 1} 条回款计划的计划回款时间需满足「${plannedOrderDate} ＜ 计划回款时间 ≤ ${y}-${m}-${d}」`
      }
    }
    if (!hideTransferDate && contractAssetEnabled && !plan.transferDate) {
      return `第 ${i + 1} 条回款计划的合同资产计划转出时间不能为空`
    }
    if (!hideTransferDate && contractAssetEnabled && plan.transferDate && new Date(plan.transferDate) > new Date(plan.paymentDate)) {
      return `第 ${i + 1} 条回款计划的合同资产计划转出时间不得晚于计划回款时间`
    }
  }
  if (incomeAmount > 0 && Math.abs(total - incomeAmount) > 0.01) {
    return `所有回款计划的金额合计（${total.toFixed(2)}）必须等于计划订购资费金额（${plannedIncome}）`
  }
  return null
}
