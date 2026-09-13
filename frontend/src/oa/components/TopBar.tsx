import { useEffect, useRef, useState } from 'react'
import { Bot, ChevronDown, LogOut, User as UserIcon } from 'lucide-react'
import { clsx } from 'clsx'
import type { User } from '../types'

/**
 * 顶栏。取消侧边导航栏（方案 §6.2）——导航由内容本身承担，系统管理走头像下拉。
 */
export default function TopBar({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (box.current && !box.current.contains(event.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <header className="h-[60px] bg-[#519AFF] border-b border-[#3d87eb] flex items-center justify-between px-6 text-white shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
          <Bot className="w-4.5 h-4.5 text-white" />
        </div>
        <div className="h-6 w-px bg-white/30" />
        <span className="text-lg font-semibold">AI-native OA 工作台</span>
      </div>

      <div className="relative" ref={box}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-xs text-white/70">{user.role}</div>
          </div>
          <ChevronDown className={clsx('w-4 h-4 text-white/70 transition-transform', open && 'rotate-180')} />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出登录
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
