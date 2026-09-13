import { useState } from 'react'
import { X, Search } from 'lucide-react'
import type { ITIncomeRow, CTIncomeRow } from '../types'

interface TariffPlanPickerProps {
  title: string
  visible: boolean
  onClose: () => void
  onSelect: (tariffName: string) => void
  data: ITIncomeRow[] | CTIncomeRow[]
  dataType: 'it' | 'ct'
}

export default function TariffPlanPicker({
  title,
  visible,
  onClose,
  onSelect,
  data,
  dataType
}: TariffPlanPickerProps) {
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
