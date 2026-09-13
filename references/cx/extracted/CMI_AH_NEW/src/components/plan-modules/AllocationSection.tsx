import { useState } from 'react'
import SectionBlock from './common/SectionBlock'
import DataTable from './common/DataTable'
import AllocationModal from './common/AllocationModal'
import type { AllocationRow } from './types'
import { calculateTotal } from './utils'

interface AllocationSectionProps {
  value: AllocationRow[]
  onChange: (list: AllocationRow[]) => void
  readOnly?: boolean
  showExtraHeader?: boolean
}

export default function AllocationSection({
  value,
  onChange,
  readOnly = false,
  showExtraHeader = true
}: AllocationSectionProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingRow, setEditingRow] = useState<AllocationRow | null>(null)

  const totalAllocation = calculateTotal(value, 'allocationAmount')

  const handleEdit = (row: AllocationRow) => {
    setEditingRow(row)
    setShowModal(true)
  }

  const handleDelete = (row: AllocationRow) => {
    if (value.length === 0) return
    if (window.confirm('确定要删除该分摊记录吗？')) {
      onChange(value.filter(r => r.id !== row.id))
    }
  }

  const handleSubmit = (row: AllocationRow) => {
    if (editingRow) {
      onChange(value.map(r => r.id === editingRow.id ? row : r))
    } else {
      onChange([...value, row])
    }
    setShowModal(false)
    setEditingRow(null)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditingRow(null)
  }

  return (
    <>
      <SectionBlock
        title="投入-其他分摊"
        count={value.length}
        onAdd={readOnly ? undefined : () => setShowModal(true)}
        extraHeader={
          showExtraHeader ? (
            <div className="ml-4 flex items-center gap-4 text-xs text-gray-500">
              <span>计划分摊总额: <span className="text-gray-800 font-medium">¥{totalAllocation.toLocaleString()}</span></span>
            </div>
          ) : undefined
        }
      >
        <DataTable
          columns={[
            { key: 'allocationContent', label: '分摊内容' },
            { key: 'allocationType', label: '分摊类型' },
            { key: 'allocationDesc', label: '分摊描述' },
            { key: 'allocationAmount', label: '分摊金额(元,含税)' },
            { key: 'allocationMethod', label: '分摊方式' },
            { key: 'allocationPeriod', label: '分摊周期' },
            { key: 'allocationStartDate', label: '分摊开始时间' }
          ]}
          data={value}
          onEdit={readOnly ? undefined : handleEdit}
          onDelete={readOnly ? undefined : handleDelete}
        />
      </SectionBlock>

      {showModal && (
        <AllocationModal
          initialData={editingRow || undefined}
          onClose={handleClose}
          onSubmit={handleSubmit}
        />
      )}
    </>
  )
}
