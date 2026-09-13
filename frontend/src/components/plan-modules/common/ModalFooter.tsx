import { RotateCcw, Check } from 'lucide-react'

interface ModalFooterProps {
  onCancel: () => void
  onSubmit: () => void
  submitLabel?: string
}

export default function ModalFooter({
  onCancel,
  onSubmit,
  submitLabel = '确认'
}: ModalFooterProps) {
  return (
    <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
      <button
        type="button"
        onClick={onCancel}
        className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
      >
        <RotateCcw className="w-4 h-4" />
        取消
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
      >
        <Check className="w-4 h-4" />
        {submitLabel}
      </button>
    </div>
  )
}
