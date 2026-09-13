import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ViewData } from '../types'

type Props = Extract<ViewData, { component: 'table' }> & {
  onPage: (page: number) => void
  onOpen?: (id: number) => void
}

/** 翻页是确定的事，直接调业务接口（方案 §3），不过模型。 */
export default function Table({ columns, rows, page, page_size, total, onPage, onOpen }: Props) {
  const pages = Math.max(1, Math.ceil(total / page_size))
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-100">
              {columns.map(column => (
                <th key={column.key} className="text-left py-2 font-medium whitespace-nowrap">{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={columns.length} className="py-8 text-center text-sm text-gray-400">没有符合条件的数据</td></tr>
            )}
            {rows.map((row, index) => (
              <tr key={String(row._id ?? index)} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                {columns.map((column, columnIndex) => (
                  <td key={column.key} className="py-2.5 pr-3 text-sm text-gray-700 align-top">
                    {columnIndex === 0 && onOpen && row._id != null ? (
                      <button
                        type="button"
                        onClick={() => onOpen(Number(row._id))}
                        className="text-sm text-[#1677FF] hover:underline text-left"
                      >
                        {String(row[column.key] ?? '')}
                      </button>
                    ) : (
                      <span className="line-clamp-2">{String(row[column.key] ?? '')}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-3 text-xs text-gray-500">
          <span>共 {total} 条</span>
          <button
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>{page} / {pages}</span>
          <button
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
