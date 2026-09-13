import { useState } from 'react'
import { Plus, Trash2, Search, X } from 'lucide-react'
import ModalShell from './ModalShell'
import ModalFooter from './ModalFooter'
import FormRow from './FormRow'
import SearchableSelect from './SearchableSelect'
import SegmentedSelect from './SegmentedSelect'
import NumberInput from './NumberInput'
import DateInput from './DateInput'
import type { CostRow, StageReimburseRow, ITIncomeRow, CTIncomeRow } from '../types'
import {
  contractStages,
  reimburseMethodOptions,
  itTariffTaxMap,
  ctTariffTaxMap,
  budgetTypeOptions,
  getBusinessSubject
} from '../constants'

function StageReimburseRows({
  rows,
  onChange
}: {
  rows: StageReimburseRow[]
  onChange: (rows: StageReimburseRow[]) => void
}) {
  const handleAdd = () => {
    onChange([...rows, { date: '', amount: '' }])
  }
  const handleDelete = (idx: number) => {
    onChange(rows.filter((_, i) => i !== idx))
  }
  const handleUpdate = (idx: number, field: 'date' | 'amount', v: string) => {
    onChange(rows.map((r, i) => (i === idx ? { ...r, [field]: v } : r)))
  }

  return (
    <div className="col-span-2 flex flex-col gap-2">
      <label className="text-xs text-gray-600">
        <span className="text-red-500 mr-0.5">*</span>
        报账明细
      </label>
      <div className="flex flex-col gap-2">
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-end gap-2">
            <div className="flex-1 grid grid-cols-2 gap-3 p-3 bg-gray-50/50 rounded-md border border-gray-100">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  <span className="text-red-500 mr-0.5">*</span>
                  报账时间
                </label>
                <DateInput
                  value={row.date}
                  onChange={(v) => handleUpdate(idx, 'date', v)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  <span className="text-red-500 mr-0.5">*</span>
                  报账金额
                </label>
                <NumberInput
                  value={row.amount}
                  onChange={(v) => handleUpdate(idx, 'amount', v)}
                  placeholder="请输入金额"
                />
              </div>
            </div>
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => handleDelete(idx)}
                className="px-2 py-1 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors mb-1"
                title="删除该行"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="self-start inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1677FF] border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          增加报账行
        </button>
      </div>
    </div>
  )
}

function TariffPlanPicker({
  title,
  visible,
  onClose,
  onSelect,
  data,
  dataType
}: {
  title: string
  visible: boolean
  onClose: () => void
  onSelect: (tariffName: string) => void
  data: ITIncomeRow[] | CTIncomeRow[]
  dataType: 'it' | 'ct'
}) {
  const [keyword, setKeyword] = useState('')

  const filteredData = data.filter(item =>
    item.tariffName.toLowerCase().includes(keyword.toLowerCase())
  )

  const columns = [
    { key: 'productName', label: '产品名称' },
    { key: 'tariffName', label: '资费名称' },
    { key: 'plannedIncome', label: '计划收入(元,含税)' },
    { key: 'contractStage', label: '合同阶段' },
    { key: 'billingShareType', label: '计费分摊类型' },
    { key: 'billingSharePeriod', label: '计费周期' },
    { key: 'plannedOrderDate', label: '计划订购时间' }
  ]

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="按资费名称查询"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <span className="text-xs text-gray-400">
              共 {filteredData.length} 条记录
            </span>
          </div>
          <div className="overflow-x-auto border border-gray-100 rounded-md max-h-[50vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs sticky top-0">
                <tr>
                  {columns.map(col => (
                    <th
                      key={col.key}
                      className="px-3 py-2.5 text-left font-medium whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                  <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-3 py-4 text-center text-sm text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, idx) => (
                    <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50/50">
                      {columns.map(col => (
                        <td key={col.key} className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                          {row[col.key as keyof typeof row] || '-'}
                        </td>
                      ))}
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(row.tariffName)
                            onClose()
                          }}
                          className="px-3 py-1 text-xs text-[#1677FF] hover:bg-blue-50 rounded transition-colors"
                        >
                          选择
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export interface CostModalProps {
  title: string
  onClose: () => void
  onSubmit: (row: CostRow) => void
  expenseContentOptions: string[]
  expenseContentLabel?: string
  tariffType: 'it' | 'ct'
  correspondingTariffLabel: string
  itIncomeList: ITIncomeRow[]
  ctIncomeList: CTIncomeRow[]
  showContractStage?: boolean
  initialData?: CostRow
}

export default function CostModal({
  title,
  onClose,
  onSubmit,
  expenseContentOptions,
  expenseContentLabel = '支出内容',
  tariffType,
  correspondingTariffLabel,
  itIncomeList,
  ctIncomeList,
  showContractStage = true,
  initialData
}: CostModalProps) {
  const isEdit = !!initialData
  const [showTariffPicker, setShowTariffPicker] = useState(false)
  const [form, setForm] = useState<CostRow>(
    initialData || {
      id: '',
      expenseContent: '',
      budgetType: '',
      plannedExpense: '',
      reimbursementMethod: '一次性',
      reimbursementPeriod: '1',
      reimbursementStartDate: '',
      taxRate: '',
      correspondingTariff: '',
      contractStage: '初验',
      businessSubject: '',
      stageReimburseRows: [{ date: '', amount: '' }] as StageReimburseRow[]
    }
  )

  const handleMethodChange = (v: string) => {
    setForm(prev => ({
      ...prev,
      reimbursementMethod: v,
      reimbursementPeriod: v === '一次性' ? '1' : v === '月' ? '12' : prev.reimbursementPeriod
    }))
  }

  const handleTariffChange = (v: string) => {
    const taxMap = tariffType === 'it' ? itTariffTaxMap : ctTariffTaxMap
    const incomeList = tariffType === 'it' ? itIncomeList : ctIncomeList
    const matchedIncome = incomeList.find(item => item.tariffName === v)

    let newStageRows: StageReimburseRow[] = [{ date: '', amount: '' }]
    let newReimburseMethod = '一次性'
    let newReimbursePeriod = '1'
    let newReimburseStartDate = ''

    if (matchedIncome) {
      const plannedIncome = parseFloat(matchedIncome.plannedIncome?.replace(/,/g, '') || '0')
      const coefficient = 0.8
      const totalExpense = plannedIncome * coefficient

      if (matchedIncome.billingShareType === '月') {
        const months = parseInt(matchedIncome.billingSharePeriod || '12', 10)
        newReimburseMethod = '月'
        newReimbursePeriod = String(months)
        newReimburseStartDate = matchedIncome.billingStartDate || ''

        if (months > 0) {
          const perMonth = Math.floor((totalExpense / months) * 100) / 100
          const rows: StageReimburseRow[] = []
          const startDate = matchedIncome.billingStartDate || ''
          const [year, month] = startDate.split('-').map(Number)

          for (let i = 0; i < months; i++) {
            let m = (month - 1 + i) % 12 + 1
            let y = year + Math.floor((month - 1 + i) / 12)
            const dateStr = `${y}-${String(m).padStart(2, '0')}`

            let amount: number
            if (i === months - 1) {
              amount = Math.floor((totalExpense - perMonth * (months - 1)) * 100) / 100
            } else {
              amount = perMonth
            }

            rows.push({
              date: dateStr,
              amount: amount.toFixed(2)
            })
          }
          newStageRows = rows
        }
      } else if (
        tariffType === 'it' &&
        matchedIncome.billingShareType === '一次性' &&
        (matchedIncome as ITIncomeRow).paymentPlans &&
        (matchedIncome as ITIncomeRow).paymentPlans!.length > 0
      ) {
        newReimburseMethod = '阶段'
        const plans = (matchedIncome as ITIncomeRow).paymentPlans!
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
        newStageRows = rows
        newReimburseStartDate = plans[0]?.paymentDate || ''
        newReimbursePeriod = String(plans.length)
      } else {
        newReimburseMethod = '一次性'
        newReimbursePeriod = '1'
      }
    }

    setForm(prev => ({
      ...prev,
      correspondingTariff: v,
      taxRate: taxMap[v] || '',
      reimbursementMethod: matchedIncome ? newReimburseMethod : prev.reimbursementMethod,
      reimbursementPeriod: matchedIncome ? newReimbursePeriod : prev.reimbursementPeriod,
      reimbursementStartDate: matchedIncome ? newReimburseStartDate : prev.reimbursementStartDate,
      plannedExpense: matchedIncome && matchedIncome.plannedIncome
        ? (parseFloat(matchedIncome.plannedIncome.replace(/,/g, '')) * 0.8).toFixed(2)
        : prev.plannedExpense,
      stageReimburseRows: matchedIncome ? newStageRows : prev.stageReimburseRows
    }))
  }

  const handleExpenseContentChange = (v: string) => {
    setForm(prev => ({
      ...prev,
      expenseContent: v,
      businessSubject: getBusinessSubject(v)
    }))
  }

  return (
    <ModalShell title={isEdit ? title.replace('新增', '修改') : title} onClose={onClose}>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <FormRow label={expenseContentLabel} required>
          <SearchableSelect
            value={form.expenseContent}
            onChange={handleExpenseContentChange}
            options={expenseContentOptions}
          />
        </FormRow>
        <FormRow label="支出类型" required>
          <SearchableSelect
            value={form.budgetType}
            onChange={(v) => setForm({ ...form, budgetType: v })}
            options={budgetTypeOptions}
          />
        </FormRow>
        <FormRow label="计划支出(元,含税)" required>
          <NumberInput
            value={form.plannedExpense}
            onChange={(v) => setForm({ ...form, plannedExpense: v })}
            placeholder="请输入金额"
          />
        </FormRow>
        <FormRow label="报账方式" required>
          <SegmentedSelect
            value={form.reimbursementMethod}
            onChange={handleMethodChange}
            options={reimburseMethodOptions}
          />
        </FormRow>

        {form.reimbursementMethod === '阶段' ? (
          <StageReimburseRows
            rows={form.stageReimburseRows || []}
            onChange={(rows) => setForm({ ...form, stageReimburseRows: rows })}
          />
        ) : (
          <FormRow label="报账周期(月)" required>
            <NumberInput
              value={form.reimbursementPeriod}
              onChange={(v) => setForm({ ...form, reimbursementPeriod: v })}
              placeholder={
                form.reimbursementMethod === '一次性'
                  ? '固定为1'
                  : '请输入月数'
              }
              disabled={form.reimbursementMethod === '一次性'}
            />
          </FormRow>
        )}

        <FormRow label="报账开始时间" required>
          <DateInput
            value={form.reimbursementStartDate}
            onChange={(v) => setForm({ ...form, reimbursementStartDate: v })}
          />
        </FormRow>
        <FormRow label={correspondingTariffLabel} required>
          <div
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white cursor-pointer hover:border-blue-400"
            onClick={() => setShowTariffPicker(true)}
          >
            {form.correspondingTariff ? (
              <span className="text-gray-800">{form.correspondingTariff}</span>
            ) : (
              <span className="text-gray-400">请选择</span>
            )}
          </div>
        </FormRow>
        <FormRow label="税率" required>
          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {form.taxRate || '请先选择对应收入资费'}
          </div>
        </FormRow>
        {showContractStage && (
          <FormRow label="合同阶段" required>
            <SearchableSelect
              value={form.contractStage}
              onChange={(v) => setForm({ ...form, contractStage: v })}
              options={contractStages}
            />
          </FormRow>
        )}
        <FormRow label="业务科目">
          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {form.businessSubject || '-'}
          </div>
        </FormRow>
      </div>

      <TariffPlanPicker
        title={tariffType === 'it' ? '选择IT收入计划' : '选择CT收入计划'}
        visible={showTariffPicker}
        onClose={() => setShowTariffPicker(false)}
        onSelect={handleTariffChange}
        data={tariffType === 'it' ? itIncomeList : ctIncomeList}
        dataType={tariffType}
      />

      <ModalFooter
        onCancel={onClose}
        onSubmit={() => {
          if (!form.expenseContent || !form.budgetType || !form.plannedExpense) {
            alert('请填写必填项')
            return
          }
          if (!form.correspondingTariff) {
            alert('请选择对应收入资费')
            return
          }
          if (!form.reimbursementMethod) {
            alert('请选择报账方式')
            return
          }
          if (!form.reimbursementPeriod) {
            alert('请填写报账周期')
            return
          }
          if (!form.reimbursementStartDate) {
            alert('请填写报账开始时间')
            return
          }
          if (!form.taxRate) {
            alert('请先选择对应收入资费以自动带出税率')
            return
          }
          if (showContractStage && !form.contractStage) {
            alert('请选择合同阶段')
            return
          }
          if (form.reimbursementMethod === '阶段' && form.stageReimburseRows) {
            for (const row of form.stageReimburseRows) {
              if (!row.date || !row.amount) {
                alert('报账方式为阶段时，报账时间和报账金额不能为空')
                return
              }
            }
          }
          onSubmit({
            ...form,
            id: isEdit ? form.id : 'cost-' + Date.now()
          })
        }}
      />
    </ModalShell>
  )
}
