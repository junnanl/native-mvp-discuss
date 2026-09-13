import { useState } from 'react'
import { Plus, Edit, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react'
import { useModal } from '@/components/Modal'
import type { CTIncomeRow } from './types'
import SectionBlock from './common/SectionBlock'
import DataTable from './common/DataTable'
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
  ctTariffTaxMap,
  ctTariffMgmtNameMap,
  ctTariffCoaMap,
  ctTariffCoaNameMap,
  ctProductOptions,
  ctProductTariffMap,
  ctProductTypeProductNameMap,
  ctProductNameTariffMap,
  parseCtProductName,
  isCtBandwidthRequired
} from './constants'

interface IncomeCTSectionProps {
  value: CTIncomeRow[]
  onChange: (list: CTIncomeRow[]) => void
  readOnly?: boolean
  showTotal?: boolean
  allowedProductNames?: string[]
  undeletableIds?: string[]
  useBudgetLabels?: boolean
  showBothTotals?: boolean
  canAdd?: boolean
  canDelete?: boolean
}

function CTIncomeModal({
  onClose,
  onSubmit,
  initialData,
  allowedProductNames,
  useBudgetLabels = false
}: {
  onClose: () => void
  onSubmit: (row: CTIncomeRow) => void
  initialData?: CTIncomeRow
  allowedProductNames?: string[]
  useBudgetLabels?: boolean
}) {
  const isEdit = !!initialData
  // 产品名称展示字符串（【编码】名称），用于表单回显和选择
  const initialProductDisplay = initialData && initialData.productFullName
    ? `【${initialData.productCode}】${initialData.productFullName}`
    : ''
  const [form, setForm] = useState<CTIncomeRow>(
    initialData || {
      id: '',
      productName: '',
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
      mgmtProductCode: 'P' + Math.floor(Math.random() * 9000 + 1000),
      mgmtProductName: '',
      thirdLevelSubject: '',
      coaSubject: 'C' + Math.floor(Math.random() * 9000 + 1000),
      coaSubjectName: ''
    }
  )
  const [productDisplay, setProductDisplay] = useState<string>(initialProductDisplay)

  const handleProductTypeChange = (v: string) => {
    // 切换产品类型时，清空产品名称和资费，重置税率/管会/COA
    setForm(prev => ({
      ...prev,
      productName: v,
      productCode: '',
      productFullName: '',
      tariffName: '',
      taxRate: '',
      mgmtProductName: '',
      coaSubject: prev.coaSubject,
      coaSubjectName: ''
    }))
    setProductDisplay('')
  }

  const handleProductNameChange = (v: string) => {
    const { code, name } = parseCtProductName(v)
    // 产品名称改变后：清空资费和税率/管会/COA，等待选资费后自动带出
    const tariffOptions = ctProductNameTariffMap[v] || []
    const firstTariff = tariffOptions.length === 1 ? tariffOptions[0] : ''
    setForm(prev => ({
      ...prev,
      productCode: code,
      productFullName: name,
      tariffName: firstTariff,
      taxRate: firstTariff ? (ctTariffTaxMap[firstTariff] || '') : '',
      mgmtProductName: firstTariff ? (ctTariffMgmtNameMap[firstTariff] || '') : '',
      coaSubject: firstTariff ? (ctTariffCoaMap[firstTariff] || prev.coaSubject) : prev.coaSubject,
      coaSubjectName: firstTariff ? (ctTariffCoaNameMap[firstTariff] || '') : ''
    }))
    setProductDisplay(v)
  }

  const handleTariffChange = (v: string) => {
    setForm(prev => ({
      ...prev,
      tariffName: v,
      taxRate: ctTariffTaxMap[v] || '',
      mgmtProductName: ctTariffMgmtNameMap[v] || '',
      coaSubject: ctTariffCoaMap[v] || prev.coaSubject,
      coaSubjectName: ctTariffCoaNameMap[v] || ''
    }))
  }

  const handleShareTypeChange = (v: string) => {
    setForm(prev => ({
      ...prev,
      billingShareType: v,
      billingSharePeriod: v === '一次性' ? '1' : '12'
    }))
  }

  // 资费选项：选中产品名称后按产品名称过滤，否则按产品类型兼容
  const currentTariffOptions = productDisplay
    ? (ctProductNameTariffMap[productDisplay] || [])
    : (form.productName ? (ctProductTariffMap[form.productName] || []) : [])

  // 带宽字段是否显示：产品类型含专线/宽带
  const showBandwidth = isCtBandwidthRequired(form.productName)

  const productNameOptions = form.productName ? (ctProductTypeProductNameMap[form.productName] || []) : []

  return (
    <ModalShell title={isEdit ? 'CT收入计划修改' : 'CT收入计划新增'} onClose={onClose}>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <FormRow label="产品类型" required>
          {isEdit ? (
            <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              {form.productName}
            </div>
          ) : (
            <SearchableSelect
              value={form.productName}
              onChange={handleProductTypeChange}
              options={allowedProductNames && allowedProductNames.length > 0 ? allowedProductNames : ctProductOptions}
            />
          )}
        </FormRow>
        <FormRow label="税率" required>
          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {form.taxRate || '请先选择资费名称'}
          </div>
        </FormRow>
        <FormRow label="产品名称" required>
          <SearchableSelect
            value={productDisplay}
            onChange={handleProductNameChange}
            options={productNameOptions}
            placeholder={form.productName ? '请选择产品名称' : '请先选择产品类型'}
          />
        </FormRow>
        <FormRow label="资费名称" required>
          <SearchableSelect
            value={form.tariffName}
            onChange={handleTariffChange}
            options={currentTariffOptions}
            placeholder={productDisplay ? '请选择资费名称' : (form.productName ? '请先选择产品名称' : '请先选择产品类型')}
            disabled={!productDisplay && !form.productName}
          />
        </FormRow>
        {showBandwidth && (
          <FormRow label="带宽">
            <div className="relative">
              <NumberInput
                value={form.bandwidth}
                onChange={(v) => {
                  const num = parseInt(v, 10)
                  if (v === '' || (!isNaN(num) && num > 0)) {
                    setForm({ ...form, bandwidth: v })
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
            value={form.orderQuantity}
            onChange={(v) => {
              const num = parseInt(v, 10)
              if (v === '' || (!isNaN(num) && num > 0)) {
                setForm({ ...form, orderQuantity: v })
              }
            }}
            placeholder="请输入订购数量"
            decimals={0}
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
              onChange={(v) => setForm({ ...form, plannedTariffAmount: v })}
              placeholder="请输入金额"
            />
          )}
        </FormRow>
        <FormRow label="计费分摊类型" required>
          <SegmentedSelect
            value={form.billingShareType}
            onChange={handleShareTypeChange}
            options={['一次性', '月']}
          />
        </FormRow>
        <FormRow label="计费周期" required>
          <NumberInput
            value={form.billingSharePeriod}
            onChange={(v) => {
              if (form.billingShareType !== '一次性') {
                const num = parseInt(v, 10)
                if (v === '' || (!isNaN(num) && num > 0)) {
                  setForm({ ...form, billingSharePeriod: v })
                }
              }
            }}
            placeholder={form.billingShareType === '一次性' ? '固定为1' : '请输入月数'}
            disabled={form.billingShareType === '一次性'}
            decimals={0}
          />
        </FormRow>
        <FormRow label="计划订购时间" required>
          <MonthPicker
            value={form.plannedOrderDate}
            onChange={(v) => setForm({ ...form, plannedOrderDate: v })}
          />
        </FormRow>
        <FormRow label="计费起始时间" required>
          <DateInput
            value={form.billingStartDate}
            onChange={(v) => setForm({ ...form, billingStartDate: v })}
          />
        </FormRow>
        <FormRow label="管会产品">
          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {form.mgmtProductName ? `【${form.mgmtProductCode}】${form.mgmtProductName}` : '-'}
          </div>
        </FormRow>
        <FormRow label="COA科目">
          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
            {form.coaSubject ? `【${form.coaSubject}】${form.coaSubjectName || '-'}` : '-'}
          </div>
        </FormRow>
      </div>

      <ModalFooter
        onCancel={onClose}
        onSubmit={() => {
          if (!form.productName || !form.productFullName || !form.tariffName || !form.orderQuantity || !form.taxRate || !form.plannedTariffAmount || !form.billingShareType || !form.billingSharePeriod || !form.plannedOrderDate || !form.billingStartDate) {
            alert('请填写必填项')
            return
          }
          onSubmit({
            ...form,
            plannedIncome: form.plannedTariffAmount || form.plannedIncome,
            id: isEdit ? form.id : 'ct-' + Date.now()
          })
        }}
      />
    </ModalShell>
  )
}

export default function IncomeCTSection({
  value,
  onChange,
  readOnly = false,
  showTotal = true,
  allowedProductNames,
  undeletableIds,
  useBudgetLabels = false,
  showBothTotals = false,
  canAdd = true,
  canDelete = true
}: IncomeCTSectionProps) {
  const modal = useModal()
  const [showModal, setShowModal] = useState(false)
  const [editingRow, setEditingRow] = useState<CTIncomeRow | null>(null)

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

  const handleEdit = (row: CTIncomeRow) => {
    setEditingRow(row)
    setShowModal(true)
  }

  const handleDelete = (row: CTIncomeRow) => {
    if (value.length === 0) return
    if (undeletableIds && undeletableIds.includes(row.id)) {
      alert('该记录为效益预评估已带出的计划，不允许删除')
      return
    }
    modal.confirm('确定要删除该CT收入计划吗？', '确认删除').then(ok => {
      if (ok) {
        onChange(value.filter(r => r.id !== row.id))
      }
    })
  }

  const handleSubmit = (row: CTIncomeRow) => {
    if (editingRow) {
      onChange(value.map(r => r.id === editingRow.id ? row : r).sort((a, b) => a.productName.localeCompare(b.productName)))
    } else {
      onChange([...value, row].sort((a, b) => a.productName.localeCompare(b.productName)))
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
        title="CT收入计划"
        count={value.length}
        onAdd={readOnly || !canAdd ? undefined : handleAdd}
      >
        <DataTable
          columns={[
            { key: 'productName', label: '产品类型' },
            { key: 'plannedIncome', label: '概算收入金额', mergeBy: 'productName' },
            { key: 'taxRate', label: '税率', mergeBy: 'productName' },
            { key: 'productFullName', label: '产品名称', render: (row: CTIncomeRow) => (row.productFullName ? `【${row.productCode || '-'}】${row.productFullName}` : '-') },
            { key: 'tariffName', label: '资费名称' },
            { key: 'bandwidth', label: '带宽(M)' },
            { key: 'orderQuantity', label: '订购数量' },
            { key: 'plannedTariffAmount', label: '计划订购金额' },
            { key: 'billingShareType', label: '分摊类型' },
            { key: 'billingSharePeriod', label: '分摊周期' },
            { key: 'plannedOrderDate', label: '计划订购时间' },
            { key: 'billingStartDate', label: '计费起始时间' },
            { key: 'mgmtProductName', label: '管会产品', render: (row: CTIncomeRow) => row.mgmtProductName ? `【${row.mgmtProductCode}】${row.mgmtProductName}` : '-' },
            { key: 'coaSubject', label: 'COA科目', render: (row: CTIncomeRow) => row.coaSubject ? `【${row.coaSubject}】${row.coaSubjectName || '-'}` : '-' }
          ]}
          data={value}
          onEdit={readOnly ? undefined : handleEdit}
          onDelete={readOnly || !canDelete ? undefined : handleDelete}
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
        <CTIncomeModal
          initialData={editingRow || undefined}
          onClose={handleClose}
          onSubmit={handleSubmit}
          allowedProductNames={allowedProductNames}
          useBudgetLabels={useBudgetLabels}
        />
      )}
    </>
  )
}
