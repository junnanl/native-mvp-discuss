import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthPickerProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function MonthPicker({ value, onChange, placeholder = '请选择年月', disabled = false }: MonthPickerProps) {
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(() => {
    if (value) {
      return parseInt(value.split('-')[0], 10)
    }
    return new Date().getFullYear()
  })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

  const handleSelectMonth = (month: string) => {
    onChange(`${viewYear}-${month}`)
    setOpen(false)
  }

  const handlePrevYear = () => {
    setViewYear(prev => prev - 1)
  }

  const handleNextYear = () => {
    setViewYear(prev => prev + 1)
  }

  const displayText = value || ''

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={
          'flex items-center w-full px-3 py-2 text-sm border rounded-md bg-white ' +
          (disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-500'
            : 'border-gray-300 cursor-pointer hover:border-blue-400')
        }
        onClick={() => {
          if (disabled) return
          setOpen(!open)
          if (value) {
            setViewYear(parseInt(value.split('-')[0], 10))
          }
        }}
      >
        <span className={value ? 'text-gray-800 flex-1' : 'text-gray-400 flex-1'}>
          {displayText || placeholder}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </div>
      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <button
              type="button"
              onClick={handlePrevYear}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-800">{viewYear}年</span>
            <button
              type="button"
              onClick={handleNextYear}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1 p-2">
            {months.map(month => {
              const selected = value === `${viewYear}-${month}`
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleSelectMonth(month)}
                  className={
                    'py-2 text-sm rounded transition-colors ' +
                    (selected
                      ? 'bg-[#1677FF] text-white font-medium'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-[#1677FF]')
                  }
                >
                  {parseInt(month, 10)}月
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
