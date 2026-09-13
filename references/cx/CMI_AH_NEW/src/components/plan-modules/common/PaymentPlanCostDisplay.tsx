import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import NumberInput from './NumberInput'
import MonthPicker from './MonthPicker'

export interface CostPaymentPlanItem {
  id: string
  amount: string
  paymentDate: string
}

interface PaymentPlanCostDisplayProps {
  value: CostPaymentPlanItem[]
  onChange: (list: CostPaymentPlanItem[]) => void
  totalAmount: string
  readOnly?: boolean
  hideHeader?: boolean
  hideTotal?: boolean
  plannedIncome?: string
}

export default function PaymentPlanCostDisplay({ value, onChange, totalAmount, readOnly = false, hideHeader = false, hideTotal = true, plannedIncome = '' }: PaymentPlanCostDisplayProps) {
  const total = value.reduce((acc, curr) => {
    const n = parseFloat(curr.amount.replace(/,/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)

  const handleAdd = () => {
    onChange([
      ...value,
      {
        id: 'plan-' + Date.now(),
        amount: '',
        paymentDate: ''
      }
    ])
  }

  const handleDelete = (id: string) => {
    onChange(value.filter(item => item.id !== id))
  }

  const handleChange = (id: string, field: keyof CostPaymentPlanItem, val: string) => {
    onChange(value.map(item => item.id === id ? { ...item, [field]: val } : item))
  }

  const targetAmount = parseFloat(totalAmount.replace(/,/g, '')) || 0
  const orderAmount = parseFloat(plannedIncome.replace(/,/g, '')) || 0

  return (
    <div className="border border-gray-200 rounded-lg">
      {!hideHeader && (
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-3.5 bg-[#1677FF] rounded-sm" />
            <span className="text-sm font-medium text-gray-800">付款计划明细</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              合计：<span className="text-[#1677FF] font-medium">{total.toLocaleString()}</span> / {targetAmount.toLocaleString()}
            </span>
            {!readOnly && (
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-1 px-3 py-1 text-xs text-white bg-[#1677FF] hover:bg-[#1668DD] rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                付款计划新增
              </button>
            )}
          </div>
        </div>
      )}
      <div className={hideHeader ? '' : 'p-3'}>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs">
              <th className="px-2 py-2 text-center font-medium w-16">序号</th>
              <th className="px-2 py-2 text-left font-medium">计划付款金额</th>
              {plannedIncome && <th className="px-2 py-2 text-left font-medium">计划回款比例</th>}
              <th className="px-2 py-2 text-left font-medium">计划付款时间</th>
              {!readOnly && <th className="px-2 py-2 text-center font-medium w-20">操作</th>}
            </tr>
          </thead>
          <tbody>
            {(value.length === 0 && !readOnly ? [{ id: 'plan-' + Date.now(), amount: '', paymentDate: '' }] : value).map((plan, idx) => (
              <tr key={plan.id} className="border-t border-gray-100">
                <td className="px-2 py-2 text-center text-gray-600">{idx + 1}</td>
                <td className="px-2 py-2">
                  {readOnly ? (
                    <span className="text-gray-700">{plan.amount || '-'}</span>
                  ) : (
                    <NumberInput
                      value={plan.amount}
                      onChange={(v) => handleChange(plan.id, 'amount', v)}
                      placeholder="请输入金额"
                    />
                  )}
                </td>
                {plannedIncome && (
                  <td className="px-2 py-2 text-gray-700 whitespace-nowrap">
                    {plan.amount && orderAmount > 0
                      ? `${((parseFloat(plan.amount.replace(/,/g, '')) / orderAmount) * 100).toFixed(2)}%`
                      : '-'}
                  </td>
                )}
                <td className="px-2 py-2">
                  {readOnly ? (
                    <span className="text-gray-700">{plan.paymentDate || '-'}</span>
                  ) : (
                    <MonthPicker
                      value={plan.paymentDate}
                      onChange={(v) => handleChange(plan.id, 'paymentDate', v)}
                      placeholder="请选择时间"
                    />
                  )}
                </td>
                {!readOnly && (
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleDelete(plan.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {/* 合计：右下角（仅在未由调用方在标题栏展示合计时显示） */}
        {!hideTotal && (
          <div className="mt-3 flex justify-end items-baseline gap-2">
            <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">合计：</span>
            <span className="text-lg font-semibold text-[#1677FF] whitespace-nowrap tabular-nums">
              {total.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-gray-500 whitespace-nowrap tabular-nums">
              / {targetAmount.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
