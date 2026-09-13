import { X } from 'lucide-react'

interface ModalShellProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: string
}

export default function ModalShell({
  title,
  onClose,
  children,
  width = 'max-w-3xl'
}: ModalShellProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={'bg-white rounded-lg shadow-2xl w-full ' + width + ' max-h-[90vh] overflow-hidden flex flex-col'}
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
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
