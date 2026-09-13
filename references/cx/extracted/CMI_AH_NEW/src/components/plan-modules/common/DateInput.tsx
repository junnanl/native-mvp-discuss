import { useState, useRef, useEffect } from 'react'
import { Calendar } from 'lucide-react'

interface DateInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  disabled?: boolean
  /** min 边界：YYYY-MM 或 YYYY-MM-DD，会取年月比较；选中年月必须 >= min 年月（严格大于时由调用方校验） */
  min?: string
  /** max 边界：YYYY-MM 或 YYYY-MM-DD，会取年月比较；选中年月必须 <= max 年月 */
  max?: string
  /** 外部 className 附加到外层输入框外壳（如错误态高亮边框） */
  className?: string
}

function toYYYYMM(s?: string): string | null {
  if (!s) return null
  const m = s.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/)
  if (!m) return null
  return `${m[1]}-${m[2].padStart(2, '0')}`
}

export default function DateInput({ value, onChange, placeholder = '请选择年月', disabled = false, min, max, className = '' }: DateInputProps) {
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
  const minYM = toYYYYMM(min)
  const maxYM = toYYYYMM(max)

  const isMonthDisabled = (year: number, month: string): boolean => {
    const ym = `${year}-${month}`
    if (minYM && ym < minYM) return true
    if (maxYM && ym > maxYM) return true
    return false
  }

  const handleSelectMonth = (month: string) => {
    if (isMonthDisabled(viewYear, month)) return
    onChange(`${viewYear}-${month}`)
    setOpen(false)
  }

  // 年导航边界
  const minYear = minYM ? parseInt(minYM.split('-')[0], 10) : -Infinity
  const maxYear = maxYM ? parseInt(maxYM.split('-')[0], 10) : Infinity

  const displayText = value || ''

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={
          'flex items-center w-full px-3 py-2 text-sm border rounded-md ' +
          (disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-500'
            : 'border-gray-300 bg-white cursor-pointer hover:border-blue-400')
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
        <Calendar className="w-3.5 h-3.5 text-gray-400" />
      </div>
      {open && !disabled && (
        <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg min-w-[240px]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setViewYear(prev => Math.max(minYear, prev - 1))
              }}
              disabled={viewYear <= minYear}
              className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {'<'}
            </button>
            <span className="text-sm font-medium text-gray-800">{viewYear}年</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setViewYear(prev => Math.min(maxYear, prev + 1))
              }}
              disabled={viewYear >= maxYear}
              className="p-1 hover:bg-gray-100 rounded text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {'>'}
            </button>
          </div>
          <div className="grid grid-cols-4 gap-1 p-2">
            {months.map(month => {
              const selected = value === `${viewYear}-${month}`
              const monthDisabled = isMonthDisabled(viewYear, month)
              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleSelectMonth(month)}
                  disabled={monthDisabled}
                  className={
                    'py-2 text-sm rounded transition-colors ' +
                    (monthDisabled
                      ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                      : selected
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
