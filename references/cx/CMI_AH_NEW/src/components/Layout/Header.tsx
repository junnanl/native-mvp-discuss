import { LogOut, ChevronDown, User, BookOpen, Users } from 'lucide-react'
import { currentUser, roles, type RoleKey } from '@/data/mock'
import { useState, useRef, useEffect } from 'react'
import { clsx } from 'clsx'

interface HeaderProps {
  currentRole: RoleKey
  onRoleChange: (key: RoleKey) => void
}

export default function Header({ currentRole, onRoleChange }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const roleMenuRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false)
      }
    }
    if (showUserMenu || showRoleMenu) {
      document.addEventListener('mousedown', handler)
    }
    return () => document.removeEventListener('mousedown', handler)
  }, [showUserMenu, showRoleMenu])

  const handleLogout = () => {
    console.log('退出登录')
    setShowUserMenu(false)
  }

  const handleProfile = () => {
    console.log('个人中心')
    setShowUserMenu(false)
  }

  const handleRoleSwitch = (key: RoleKey) => {
    if (key !== currentRole) {
      onRoleChange(key)
    }
    setShowRoleMenu(false)
  }

  const currentRoleInfo = roles.find(r => r.key === currentRole) ?? roles[0]

  return (
    <header className="h-[60px] bg-[#519AFF] border-b border-[#3d87eb] flex items-center justify-between px-6 text-white">
      {/* 左侧 Logo 区域 */}
      <div className="flex items-center gap-3">
        <img
          src="/china-mobile-logo.png"
          alt="系统logo"
          className="h-20 w-auto object-contain brightness-0 invert"
        />
        <div className="h-6 w-px bg-white/30" />
        <span className="text-lg font-semibold text-white">
          安徽移动AICT项目管理系统
        </span>
      </div>

      {/* 右侧操作按钮 */}
      <div className="flex items-center gap-2">
        {/* 操作手册 */}
        <button
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="操作手册"
        >
          <BookOpen className="w-4 h-4" />
          <span>操作手册</span>
        </button>

        {/* 切换角色 */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu)
              setShowUserMenu(false)
            }}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg transition-colors text-white',
              showRoleMenu ? 'bg-white/15' : 'hover:bg-white/10'
            )}
            title="切换角色"
          >
            <Users className="w-4 h-4" />
            <span>切换角色</span>
            <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', showRoleMenu && 'rotate-180')} />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
              <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-100">
                当前角色：<span className="text-[#1677FF] font-medium">{currentRoleInfo.label}</span>
              </div>
              {roles.map(role => {
                const isCurrent = role.key === currentRole
                return (
                  <button
                    key={role.key}
                    onClick={() => handleRoleSwitch(role.key)}
                    className={clsx(
                      'w-full flex items-start gap-2 px-3 py-2 text-left transition-colors',
                      isCurrent ? 'bg-blue-50/60' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className={clsx(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      isCurrent ? 'bg-[#1677FF] text-white' : 'bg-gray-100 text-gray-500'
                    )}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={clsx(
                        'text-sm font-medium',
                        isCurrent ? 'text-[#1677FF]' : 'text-gray-800'
                      )}>
                        {role.label}
                        {isCurrent && <span className="ml-1.5 text-[10px] text-[#1677FF]">·当前</span>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 个人中心 + 退出登录（用户下拉） */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowRoleMenu(false)
            }}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-white">
                {currentUser.name}
              </div>
              <div className="text-xs text-white/70">{currentRoleInfo.label}</div>
            </div>
            <ChevronDown className={clsx('w-4 h-4 text-white/70 transition-transform', showUserMenu && 'rotate-180')} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
              <button
                onClick={handleProfile}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                个人中心
              </button>
              <div className="h-px bg-gray-100 my-1" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
