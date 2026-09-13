import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'
import { Search, ChevronDown, Check } from 'lucide-react'

// 人员选项
export interface PersonOption {
  id?: string
  name: string
  dept: string
}

interface PersonPickerProps {
  value: string
  onChange: (name: string) => void
  options: PersonOption[]
  placeholder?: string
  className?: string
  /** 触发器尺寸；sm 用于表格行内等紧凑场景 */
  size?: 'default' | 'sm'
  /** 触发器右侧的额外按钮（用于清空等），不写则不展示 */
  onClear?: () => void
}

// 头像背景色池（按姓名 hash 取色）
const avatarColorPool = [
  'bg-blue-500', 'bg-orange-500', 'bg-green-500',
  'bg-purple-500', 'bg-pink-500', 'bg-cyan-500', 'bg-amber-500',
  'bg-indigo-500', 'bg-rose-500', 'bg-teal-500'
]

function colorOf(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0
  }
  return avatarColorPool[h % avatarColorPool.length]
}

function avatarTextOf(name: string) {
  // 中文取最后 1-2 个字符（姓 + 名首字）；英文取首字母大写
  if (!name) return '?'
  const isChinese = /[\u4e00-\u9fa5]/.test(name)
  if (isChinese) {
    return name.length > 1 ? name.slice(-2) : name
  }
  return name.charAt(0).toUpperCase()
}

// 通用人员选择器
// - 点击触发器展开下拉面板（inline，浮在下方不居中弹窗）
// - 顶部搜索框：按姓名 / 部门模糊匹配
// - 列表项：彩色圆形头像 + 姓名 + 部门
// - 点击列表项选中并关闭
// - 点击外部 / Esc 关闭
export default function PersonPicker({
  value,
  onChange,
  options,
  placeholder = '请选择人员',
  className,
  size = 'default',
  onClear
}: PersonPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // 点击外部关闭
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', escHandler)
    }
  }, [open])

  // 打开后聚焦搜索框
  useEffect(() => {
    if (open) {
      // 等待面板渲染完成
      const t = setTimeout(() => searchRef.current?.focus(), 0)
      return () => clearTimeout(t)
    }
  }, [open])

  const selected = options.find(o => o.name === value)

  const filtered = options.filter(o => {
    if (!search.trim()) return true
    const s = search.trim().toLowerCase()
    return (
      o.name.toLowerCase().includes(s) ||
      (o.dept || '').toLowerCase().includes(s)
    )
  })

  const handleSelect = (name: string) => {
    onChange(name)
    setOpen(false)
    setSearch('')
  }

  const handleToggle = () => {
    setOpen(o => !o)
    if (open) setSearch('')
  }

  return (
    <div className={clsx('relative', className)} ref={ref}>
      {/* 触发器（外观与原 select 一致：w-full px-3 py-2 text-sm border border-gray-300 rounded-md） */}
      <button
        type="button"
        onClick={handleToggle}
        className={clsx(
          'w-full border rounded-md focus:outline-none bg-white text-left flex items-center gap-2 transition-colors',
          size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm',
          open ? 'border-blue-500' : 'border-gray-300 hover:border-blue-400'
        )}
      >
        {selected ? (
          <>
            <span className={clsx(
              'shrink-0 w-6 h-6 rounded-full text-white text-[11px] flex items-center justify-center font-medium',
              colorOf(selected.name)
            )}>
              {avatarTextOf(selected.name)}
            </span>
            <span className="flex-1 min-w-0 truncate text-gray-800">
              {selected.name}
              <span className="text-gray-500">（{selected.dept}）</span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-gray-400">{placeholder}</span>
        )}
        <ChevronDown className={clsx(
          'w-4 h-4 text-gray-400 shrink-0 transition-transform',
          open && 'rotate-180 text-blue-500'
        )} />
      </button>

      {/* 下拉面板 */}
      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg flex flex-col max-h-72">
          {/* 搜索框 */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索姓名 / 部门"
                className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* 列表 */}
          <div className="flex-1 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">未找到匹配人员</div>
            ) : (
              filtered.map(o => {
                const active = o.name === value
                return (
                  <div
                    key={o.id || o.name}
                    onClick={() => handleSelect(o.name)}
                    className={clsx(
                      'px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 flex items-center gap-2 mx-1 rounded',
                      active && 'bg-blue-50 text-[#1677FF]'
                    )}
                  >
                    <span className={clsx(
                      'shrink-0 w-7 h-7 rounded-full text-white text-xs flex items-center justify-center font-medium',
                      colorOf(o.name)
                    )}>
                      {avatarTextOf(o.name)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{o.name}</div>
                      <div className="text-[11px] text-gray-400 truncate">{o.dept}</div>
                    </div>
                    {active && <Check className="w-4 h-4 text-[#1677FF] shrink-0" />}
                  </div>
                )
              })
            )}
          </div>

          {/* 底部统计 */}
          <div className="px-3 py-1.5 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
            <span>共 {filtered.length} 人</span>
            {onClear && value && (
              <button
                type="button"
                onClick={() => {
                  onClear()
                  setOpen(false)
                  setSearch('')
                }}
                className="text-gray-500 hover:text-red-500"
              >
                清空选择
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
