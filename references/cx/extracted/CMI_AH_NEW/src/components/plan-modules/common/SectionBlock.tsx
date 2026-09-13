import { Plus } from 'lucide-react'

interface SectionBlockProps {
  title: string
  count: number
  onAdd?: () => void
  addLabel?: string
  extraHeader?: React.ReactNode
  rightHeader?: React.ReactNode
  children: React.ReactNode
}

export default function SectionBlock({
  title,
  count,
  onAdd,
  addLabel = '新增',
  extraHeader,
  rightHeader,
  children
}: SectionBlockProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <span className="text-xs text-gray-400">【{count}】</span>
          {extraHeader}
        </div>
        <div className="flex items-center gap-3">
          {rightHeader}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#1677FF] hover:bg-blue-50 rounded-md border border-blue-200 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {addLabel}
            </button>
          )}
        </div>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}
