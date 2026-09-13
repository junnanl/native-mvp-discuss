import { useState } from 'react'
import { Plus, Edit, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react'
import { useModal } from '@/components/Modal'
import PaymentPlanSection, { validatePaymentPlans, defaultMilestones } from '@/components/PaymentPlanSection'
import type { ITIncomeRow } from './types'
import SectionBlock from './common/SectionBlock'
import DataTable from './common/DataTable'
import PaymentPlansDisplay from './common/PaymentPlansDisplay'
import ModalShell from './common/ModalShell'
import ModalFooter from './common/ModalFooter'
import FormRow from './common/FormRow'
import SearchableSelect from './common/SearchableSelect'
import SegmentedSelect from './common/SegmentedSelect'
import NumberInput from './common/NumberInput'
import DateInput from './common/DateInput'
import MonthPicker from './common/MonthPicker'
import { calculateExcludingTax } from '@/lib/utils'
import {
  contractStages,
  yesNoOptions,
  itTariffTaxMap,
  itTariffMgmtNameMap,
  itTariffCoaMap,
  itProductOptions,
  itTariffOptions
} from './constants'

interface IncomeITSectionProps {
  value: ITIncomeRow[]
  onChange: (list: ITIncomeRow[]) => void
  readOnly?: boolean
  showTotal?: boolean
  hideTransferDate?: boolean
  showContractFields?: boolean
  hideMilestoneName?: boolean
  allowedProductNames?: string[]
  undeletableIds?: string[]
  useBudgetLabels?: boolean
  showBothTotals?: boolean
  canAdd?: boolean
  canDelete?: boolean
}

function ITIncomeModal({
  onClose,
  onSubmit,
  initialData,
  hideTransferDate = false,
  showContractFields = true,
  hideMilestoneName = false,
  allowedProductNames,
  useBudgetLabels = false
}: {
  onClose: () => void
  onSubmit: (row: ITIncomeRow) => void
  initialData?: ITIncomeRow
  hideTransferDate?: boolean
  showContractFields?: boolean
  hideMilestoneName?: boolean
  allowedProductNames?: string[]
  useBudgetLabels?: boolean
}) {
  const isEdit = !!initialData
  const [form, setForm] = useState<ITIncomeRow>(
    initialData || {
      id: '',
      productName: '',
      tariffName: '',
      mgmtProductCode: 'P' + Math.floor(Math.random() * 9000 + 1000),
      mgmtProductName: '',
      thirdLevelSubject: '',
      coaSubject: 'C' + Math.floor(Math.random() * 9000 + 1000),
      taxRate: '',
      plannedIncome: '',
      plannedTariffAmount: '',
      budgetTariffAmount: '',
      contractStage: '初验',
      billingShareType: '月',
      billingSharePeriod: '12',
      isContractAsset: '否',
      plannedOrderDate: '',
      billingStartDate: ''
    }
  )
  const [paymentPlans, setPaymentPlans] = useState<{ id: string; milestone: string; amount: string; paymentDate: string; transferDate: string }[]>(
    initialData?.paymentPlans || []
  )

  const handleTariffChange = (v: string) => {
    setForm(prev => ({
      ...prev,
      tariffName: v,
      taxRate: itTariffTaxMap[v] || '',
      mgmtProductName: itTariffMgmtNameMap[v] || '',
      coaSubject: itTariffCoaMap[v] || ''
    }))
  }

  const handleBillingShareTypeChange = (v: string) => {
    setForm(prev => ({
      ...prev,
      billingShareType: v,
      billingSharePeriod: v === '一次性' ? '1' : '12',
      isContractAsset: v === '一次性' ? prev.isContractAsset : '否'
    }))
  }

  return (
    <ModalShell title={isEdit ? 'IT收入计划修改' : 'IT收入计划新增'} width="max-w-5xl" onClose={onClose}>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <FormRow label="产品名称" required>
          {isEdit ? (
            <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              {form.productName}
            </div>
          ) : (
            <SearchableSelect
              value={form.productName}
              onChange={(v) => setForm({ ...form, productName: v })}
              options={allowedProductNames && allowedProductNames.length > 0 ? allowedProductNames : itProductOptions}
            />
          )}
        </FormRow>
        <FormRow label="税率" required>
          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {form.taxRate || '请先选择资费名称'}
          </div>
        </FormRow>
        <FormRow label="资费名称" required>
          <SearchableSelect
            value={form.tariffName}
            onChange={handleTariffChange}
            options={itTariffOptions}
          />
        </FormRow>
        <FormRow label={'计划订购金额'} required>
          {isEdit ? (
            <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              {form.plannedTariffAmount || form.plannedIncome || '-'}
            </div>
          ) : (
            <NumberInput
              value={form.plannedTariffAmount || form.plannedIncome}
              onChange={(v) => setForm({ ...form, plannedTariffAmount: v, plannedIncome: v })}
              placeholder="请输入金额"
            />
          )}
        </FormRow>
        <FormRow label="分摊类型" required>
          <SegmentedSelect
            value={form.billingShareType}
            onChange={handleBillingShareTypeChange}
            options={['一次性', '月']}
          />
        </FormRow>
        <FormRow label="分摊周期" required>
          <input
            type="text"
            value={form.billingSharePeriod}
            onChange={(e) => {
              if (form.billingShareType !== '一次性') {
                setForm({ ...form, billingSharePeriod: e.target.value })
              }
            }}
            disabled={form.billingShareType === '一次性'}
            className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 ${
              form.billingShareType === '一次性' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
            placeholder="请输入周期"
          />
        </FormRow>
        {form.billingShareType === '一次性' && (
          <FormRow label="是否合同资产" required>
            <SegmentedSelect
              value={form.isContractAsset}
              onChange={(v) => setForm({ ...form, isContractAsset: v })}
              options={yesNoOptions}
            />
          </FormRow>
        )}
        {showContractFields && (
          <FormRow label="计划订购时间" required>
            <DateInput
              value={form.plannedOrderDate}
              onChange={(v) => setForm({ ...form, plannedOrderDate: v })}
            />
          </FormRow>
        )}
        {showContractFields && (
          <FormRow label="合同阶段" required>
            <SearchableSelect
              value={form.contractStage}
              onChange={(v) => setForm({ ...form, contractStage: v })}
              options={contractStages}
            />
          </FormRow>
        )}
        <FormRow label="管会产品">
          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {form.mgmtProductName ? `${form.mgmtProductCode} ${form.mgmtProductName}` : '-'}
          </div>
        </FormRow>
        <FormRow label="COA科目">
          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {form.coaSubject || '-'}
          </div>
        </FormRow>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <PaymentPlanSection
          value={paymentPlans}
          onChange={setPaymentPlans}
          plannedIncome={form.plannedTariffAmount || form.plannedIncome}
          isContractAsset={form.isContractAsset as '是' | '否'}
          milestones={defaultMilestones}
          hideTransferDate={hideTransferDate}
          hideMilestoneName={hideMilestoneName}
          plannedOrderDate={form.plannedOrderDate}
        />
      </div>

      <ModalFooter
        onCancel={onClose}
        onSubmit={() => {
          const baseRequired = !form.productName || !form.tariffName || !form.plannedIncome || !form.billingShareType || !form.billingSharePeriod
          const contractRequired = showContractFields && (!form.contractStage || !form.plannedOrderDate)
          if (baseRequired || contractRequired) {
            alert('请填写必填项')
            return
          }
          const plannedAmount = form.plannedTariffAmount || form.plannedIncome
          const err = validatePaymentPlans(paymentPlans, plannedAmount, form.isContractAsset as '是' | '否', hideTransferDate, hideMilestoneName, form.plannedOrderDate)
          if (err) {
            alert(err)
            return
          }
          onSubmit({
            ...form,
            plannedTariffAmount: form.plannedTariffAmount || form.plannedIncome,
            plannedIncome: form.plannedIncome || form.plannedTariffAmount,
            id: isEdit ? form.id : 'it-' + Date.now(),
            paymentPlans
          })
        }}
      />
    </ModalShell>
  )
}

export default function IncomeITSection({
  value,
  onChange,
  readOnly = false,
  showTotal = true,
  hideTransferDate = false,
  showContractFields = true,
  hideMilestoneName = false,
  allowedProductNames,
  undeletableIds,
  useBudgetLabels = false,
  showBothTotals = false,
  canAdd = true,
  canDelete = true
}: IncomeITSectionProps) {
  const modal = useModal()
  const [showModal, setShowModal] = useState(false)
  const [editingRow, setEditingRow] = useState<ITIncomeRow | null>(null)
  const [viewingPlansRow, setViewingPlansRow] = useState<ITIncomeRow | null>(null)

  const totalPlannedIncome = value.reduce((acc, curr) => {
    const n = parseFloat(curr.plannedIncome.replace(/,/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)

  const totalBudgetAmount = value.reduce((acc, curr) => {
    const n = parseFloat((curr.budgetTariffAmount || '').replace(/,/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)

  const handleAdd = () => {
    setEditingRow(null)
    setShowModal(true)
  }

  const handleEdit = (row: ITIncomeRow) => {
    setEditingRow(row)
    setShowModal(true)
  }

  const handleDelete = (row: ITIncomeRow) => {
    if (value.length === 0) return
    if (undeletableIds && undeletableIds.includes(row.id)) {
      alert('该记录为效益预评估已带出的计划，不允许删除')
      return
    }
    modal.confirm('确定要删除该IT收入计划吗？', '确认删除').then(ok => {
      if (ok) {
        onChange(value.filter(r => r.id !== row.id))
      }
    })
  }

  const handleSubmit = (row: ITIncomeRow) => {
    if (editingRow) {
      onChange(value.map(r => r.id === editingRow.id ? row : r).sort((a, b) => a.productName.localeCompare(b.productName)))
    } else {
      // 查找同产品下资费名称为空的行
      const emptyTariffRow = value.find(r => r.productName === row.productName && !r.tariffName)
      if (emptyTariffRow) {
        // 替换该空资费行
        onChange(value.map(r => r.id === emptyTariffRow.id ? { ...row, id: emptyTariffRow.id } : r).sort((a, b) => a.productName.localeCompare(b.productName)))
      } else {
        // 追加到同产品最后一行后面（稳定排序保证同产品内顺序）
        onChange([...value, row].sort((a, b) => a.productName.localeCompare(b.productName)))
      }
    }
    setShowModal(false)
    setEditingRow(null)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditingRow(null)
  }

  const totalExcludingTax = value.reduce((acc, curr) => {
    const n = parseFloat(calculateExcludingTax(curr.budgetTariffAmount || curr.plannedTariffAmount || '0', curr.taxRate))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)

  return (
    <>
      <SectionBlock
        title="IT收入计划"
        count={value.length}
        onAdd={readOnly || !canAdd ? undefined : handleAdd}
      >
        <DataTable
          columns={[
            { key: 'productName', label: '产品名称' },
            { key: 'plannedIncome', label: '概算收入金额', mergeBy: 'productName' },
            { key: 'taxRate', label: '税率', mergeBy: 'productName' },
            { key: 'tariffName', label: '资费名称' },
            { key: 'plannedTariffAmount', label: '计划订购金额' },
            { key: 'plannedTariffAmountExclTax', label: '计划订购金额（不含税）', render: (row: any) => {
              const val = calculateExcludingTax(row.plannedTariffAmount || row.plannedIncome || '0', row.taxRate)
              return val.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
            }},
            { key: 'billingShareType', label: '分摊类型' },
            { key: 'billingSharePeriod', label: '分摊周期' },
            { key: 'plannedOrderDate', label: '计划订购时间' },
            { key: 'mgmtProductName', label: '管会产品' },
            { key: 'coaSubject', label: 'COA科目' }
          ].filter(Boolean)}
          data={value}
          onEdit={readOnly ? undefined : handleEdit}
          onDelete={readOnly || !canDelete ? undefined : handleDelete}
          extraActions={(row) => (
            <button
              type="button"
              onClick={() => setViewingPlansRow(row)}
              className="px-2 py-1 text-xs text-[#1677FF] hover:underline"
            >
              回款计划
            </button>
          )}
          mergeColumns={['productName', 'plannedIncome', 'taxRate']}
        />
        {showTotal && (
          <div className="mt-4 flex justify-end items-center gap-6">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{totalPlannedIncome.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{(showBothTotals ? totalBudgetAmount : totalPlannedIncome).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{totalExcludingTax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
          </div>
        )}
      </SectionBlock>

      {showModal && (
        <ITIncomeModal
          initialData={editingRow || undefined}
          onClose={handleClose}
          onSubmit={handleSubmit}
          hideTransferDate={hideTransferDate}
          showContractFields={showContractFields}
          hideMilestoneName={hideMilestoneName}
          allowedProductNames={allowedProductNames}
          useBudgetLabels={useBudgetLabels}
        />
      )}

      {viewingPlansRow && (
        <ModalShell title="回款计划明细" onClose={() => setViewingPlansRow(null)}>
          <PaymentPlansDisplay
            plans={viewingPlansRow.paymentPlans || []}
            plannedIncome={viewingPlansRow.plannedIncome}
            hideTransferDate={hideTransferDate}
            hideMilestoneName={hideMilestoneName}
            hideHeader
          />
          <div className="flex justify-center mt-5">
            <button
              type="button"
              onClick={() => setViewingPlansRow(null)}
              className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
            >
              关闭
            </button>
          </div>
        </ModalShell>
      )}
    </>
  )
}
