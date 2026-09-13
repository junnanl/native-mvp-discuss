import { useState } from 'react'
import SectionBlock from './common/SectionBlock'
import DataTable from './common/DataTable'
import CostModal from './common/CostModal'
import type { CostRow, ITIncomeRow, CTIncomeRow } from './types'
import { expenseContentAgentOptions } from './constants'

interface AgentPayableSectionProps {
  value: CostRow[]
  onChange: (list: CostRow[]) => void
  readOnly?: boolean
  itIncomeList?: ITIncomeRow[]
  ctIncomeList?: CTIncomeRow[]
}

export default function AgentPayableSection({
  value,
  onChange,
  readOnly = false,
  itIncomeList = [],
  ctIncomeList = []
}: AgentPayableSectionProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingRow, setEditingRow] = useState<CostRow | null>(null)

  const handleEdit = (row: CostRow) => {
    setEditingRow(row)
    setShowModal(true)
  }

  const handleDelete = (row: CostRow) => {
    if (value.length === 0) return
    if (window.confirm('确定要删除该代理人应付记录吗？')) {
      onChange(value.filter(r => r.id !== row.id))
    }
  }

  const handleSubmit = (row: CostRow) => {
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
        title="代理人应付部分"
        count={value.length}
        onAdd={readOnly ? undefined : () => setShowModal(true)}
      >
        <DataTable
          columns={[
            { key: 'expenseContent', label: '支出产品名称' },
            { key: 'budgetType', label: '支出类型' },
            { key: 'plannedExpense', label: '计划支出(元,含税)' },
            { key: 'reimbursementMethod', label: '报账方式' },
            { key: 'reimbursementPeriod', label: '报账周期' },
            { key: 'reimbursementStartDate', label: '报账开始时间' },
            { key: 'taxRate', label: '税率' },
            { key: 'correspondingTariff', label: '对应IT收入资费' },
            { key: 'contractStage', label: '合同阶段' },
            { key: 'businessSubject', label: '业务科目' }
          ]}
          data={value}
          onEdit={readOnly ? undefined : handleEdit}
          onDelete={readOnly ? undefined : handleDelete}
        />
      </SectionBlock>

      {showModal && (
        <CostModal
          title={editingRow ? '代理人应付修改' : '代理人应付新增'}
          initialData={editingRow || undefined}
          onClose={handleClose}
          onSubmit={handleSubmit}
          expenseContentOptions={expenseContentAgentOptions}
          expenseContentLabel="支出产品名称"
          tariffType="it"
          correspondingTariffLabel="对应IT收入资费"
          itIncomeList={itIncomeList}
          ctIncomeList={ctIncomeList}
          showContractStage={true}
        />
      )}
    </>
  )
}
