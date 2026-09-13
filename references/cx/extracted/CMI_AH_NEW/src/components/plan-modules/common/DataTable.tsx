import { useState } from 'react'
import { Edit, Trash2, Eye, ChevronDown, ChevronRight } from 'lucide-react'

interface DataTableColumn {
  key: string
  label: string
  width?: string
  suffix?: string
  render?: (row: any) => React.ReactNode
  mergeBy?: string
}

interface DataTableProps {
  columns: DataTableColumn[]
  data: any[]
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onView?: (row: any) => void
  expandedRowRender?: (row: any) => React.ReactNode
  extraActions?: (row: any) => React.ReactNode
  mergeColumns?: string[]
}

export default function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  expandedRowRender,
  extraActions,
  mergeColumns = []
}: DataTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleExpand = (idx: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(idx.toString())) {
        next.delete(idx.toString())
      } else {
        next.add(idx.toString())
      }
      return next
    })
  }

  if (data.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-gray-400 bg-gray-50/30 rounded-md border border-dashed border-gray-200">
        暂无数据，点击右上方"新增"按钮添加
      </div>
    )
  }

  const hasActions = !!(onEdit || onDelete || onView || extraActions)
  const hasExpand = !!expandedRowRender

  return (
    <div className="overflow-x-auto border border-gray-100 rounded-md">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs">
            {hasExpand && <th className="px-2 py-2.5 w-8"></th>}
            {columns.map(col => (
              <th
                key={col.key}
                className="px-3 py-2.5 text-left font-medium whitespace-nowrap"
                style={col.width ? { minWidth: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap sticky right-0 bg-gray-50">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <>
              <tr key={row.id || idx} className="border-t border-gray-100 hover:bg-gray-50/50">
                {hasExpand && (
                  <td className="px-2 py-2.5">
                    {expandedRowRender(row) && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(idx)}
                        className="p-1 text-gray-400 hover:text-[#1677FF]"
                      >
                        {expandedRows.has(idx.toString()) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </td>
                )}
                {columns.map(col => {
                  const shouldMerge = mergeColumns.includes(col.key)
                  let rowspan = 1
                  let shouldRender = true
                  let displayValue: React.ReactNode

                  if (shouldMerge) {
                    const mergeKey = col.mergeBy || col.key
                    const currentVal = row[mergeKey]
                    for (let i = idx + 1; i < data.length; i++) {
                      if (data[i][mergeKey] === currentVal) {
                        rowspan++
                      } else {
                        break
                      }
                    }
                    if (idx > 0 && data[idx - 1][mergeKey] === currentVal) {
                      shouldRender = false
                    }

                    if (col.key === 'plannedIncome') {
                      let total = 0
                      for (let i = idx; i < idx + rowspan; i++) {
                        total += parseFloat(String(data[i][col.key]).replace(/,/g, '')) || 0
                      }
                      displayValue = total.toLocaleString()
                    } else {
                      displayValue = col.render ? col.render(row) : row[col.key] ? `${row[col.key]}${col.suffix || ''}` : '-'
                    }
                  } else {
                    displayValue = col.render ? col.render(row) : row[col.key] ? `${row[col.key]}${col.suffix || ''}` : '-'
                  }

                  return (
                    <td
                      key={col.key}
                      className={`px-3 py-2.5 text-gray-700 whitespace-nowrap ${shouldRender ? '' : 'hidden'}`}
                      rowSpan={rowspan}
                    >
                      {displayValue}
                    </td>
                  )
                })}
                {hasActions && (
                  <td className="px-3 py-2.5 text-center whitespace-nowrap sticky right-0 bg-white">
                    <div className="inline-flex items-center gap-1">
                      {onView && (
                        <button
                          type="button"
                          onClick={() => onView(row)}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-[#1677FF]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-[#1677FF]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {extraActions && extraActions(row)}
                    </div>
                  </td>
                )}
              </tr>
              {hasExpand && expandedRows.has(idx.toString()) && expandedRowRender(row) && (
                <tr key={`${idx}-expanded`}>
                  <td colSpan={columns.length + (hasExpand ? 1 : 0) + (hasActions ? 1 : 0)} className="px-8 py-3 bg-gray-50/50">
                    {expandedRowRender(row)}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
