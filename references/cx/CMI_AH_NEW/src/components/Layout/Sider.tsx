import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FolderKanban,
  TrendingUp,
  FileText,
  Wallet,
  Settings,
  ChevronDown,
  Search,
  X,
  User,
  Network,
  BarChart3,
  Gift,
  Shield,
  Users,
  BookOpen,
  Bot
} from 'lucide-react'
import { menuItems } from '@/data/mock'
import { clsx } from 'clsx'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  FolderKanban,
  TrendingUp,
  FileText,
  Wallet,
  Settings,
  User,
  Network,
  BarChart: BarChart3,
  Gift,
  Shield,
  Users,
  Book: BookOpen,
  Bot
}

interface MenuItemProps {
  item: any
  level: number
  collapsed: boolean
  activeKeys: Set<string>
  expandedKeys: Set<string>
  onToggleExpand: (key: string) => void
  onSelect: (key: string, path?: string) => void
}

function MenuItem({
  item,
  level,
  collapsed,
  activeKeys,
  expandedKeys,
  onToggleExpand,
  onSelect
}: MenuItemProps) {
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expandedKeys.has(item.id)
  const isActive = activeKeys.has(item.id)
  const Icon = iconMap[item.icon]

  const handleClick = () => {
    if (hasChildren) {
      onToggleExpand(item.id)
    } else {
      onSelect(item.id, item.path)
    }
  }

  if (collapsed && level === 0) {
    return (
      <div
        onClick={handleClick}
        className={clsx(
          'w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-200',
          'hover:bg-blue-50',
          isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
        )}
        title={item.title}
      >
        {Icon && <Icon className="w-5 h-5" />}
      </div>
    )
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className={clsx(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200',
          'hover:bg-blue-50',
          level === 0 ? 'text-sm font-medium' : 'text-sm',
          isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
        )}
        style={{ paddingLeft: level === 0 ? '12px' : `${level * 16 + 12}px` }}
      >
        {Icon && level === 0 && <Icon className="w-5 h-5 flex-shrink-0" />}
        {!Icon && level === 1 && (
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
        )}
        {!Icon && level >= 2 && (
          <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0 border border-gray-400" />
        )}
        <span className="flex-1 truncate">{item.title}</span>
        {hasChildren && (
          <ChevronDown
            className={clsx(
              'w-4 h-4 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="overflow-hidden">
          {item.children.map((child: any) => (
            <MenuItem
              key={child.id}
              item={child}
              level={level + 1}
              collapsed={collapsed}
              activeKeys={activeKeys}
              expandedKeys={expandedKeys}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// 模糊搜索函数
function fuzzyMatch(text: string, keyword: string): boolean {
  if (!keyword) return true
  const lowerText = text.toLowerCase()
  const lowerKeyword = keyword.toLowerCase()

  let textIndex = 0
  let keywordIndex = 0

  while (textIndex < lowerText.length && keywordIndex < lowerKeyword.length) {
    if (lowerText[textIndex] === lowerKeyword[keywordIndex]) {
      keywordIndex++
    }
    textIndex++
  }

  return keywordIndex === lowerKeyword.length
}

// 递归收集所有菜单项及其父级
function collectMenuItems(items: any[], parentPath: string[] = []): any[] {
  const result: any[] = []

  items.forEach(item => {
    result.push({
      ...item,
      parentPath: [...parentPath]
    })

    if (item.children && item.children.length > 0) {
      result.push(...collectMenuItems(item.children, [...parentPath, item.title]))
    }
  })

  return result
}

export default function Sider({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
    new Set(['0'])
  )
  const [activeKeys] = useState<Set<string>>(new Set())
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  const allMenuItems = useMemo(() => collectMenuItems(menuItems), [])

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword)

    if (!keyword.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    const results = allMenuItems.filter(item =>
      fuzzyMatch(item.title, keyword)
    )
    setSearchResults(results)
    setShowSearchResults(true)
  }

  const handleClearSearch = () => {
    setSearchKeyword('')
    setSearchResults([])
    setShowSearchResults(false)
  }

  const handleSelectFromSearch = (item: any) => {
    console.log('选择菜单:', item.title, item.path)
    setSearchKeyword('')
    setShowSearchResults(false)
  }

  const handleToggleExpand = (key: string) => {
    const newExpanded = new Set(expandedKeys)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedKeys(newExpanded)
  }

  const handleSelect = (key: string) => {
    // 查找对应菜单项并触发跳转
    const allItems = collectMenuItems(menuItems)
    const target = allItems.find(item => item.id === key)
    if (target?.path) {
      onNavigate(target.path)
    }
  }

  const siderWidth = collapsed ? 64 : 240

  return (
    <>
      <aside
        className={clsx(
          'bg-white border-r border-gray-200 flex flex-col transition-all duration-300 h-full overflow-hidden flex-shrink-0',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* 搜索框 */}
        {!collapsed && (
          <div className="px-3 py-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="搜索菜单..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
              />
              {searchKeyword && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>

            {/* 搜索结果下拉 */}
            {showSearchResults && (
              <div className="absolute left-3 right-3 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500 text-center">
                    未找到匹配的菜单
                  </div>
                ) : (
                  searchResults.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      onClick={() => handleSelectFromSearch(item)}
                      className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-800">
                        {item.title}
                      </div>
                      {item.parentPath.length > 0 && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {item.parentPath.join(' > ')}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* 菜单区域 */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1 px-2">
            {menuItems.map((item) => (
              <MenuItem
                key={item.id}
                item={item}
                level={0}
                collapsed={collapsed}
                activeKeys={activeKeys}
                expandedKeys={expandedKeys}
                onToggleExpand={handleToggleExpand}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </nav>
      </aside>

      {/* 折叠按钮 - 固定在屏幕垂直居中 */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-1/2 -translate-y-1/2 z-50 flex items-center justify-center w-5 h-10 bg-white border border-gray-200 rounded-r-lg shadow-md transition-all duration-300 hover:bg-gray-50 text-gray-500 hover:text-gray-700"
        style={{ left: `${siderWidth}px` }}
        title={collapsed ? '展开菜单' : '收起菜单'}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </>
  )
}
