import { X, Home, LayoutDashboard } from 'lucide-react'
import { clsx } from 'clsx'

interface WindowTab {
  id: string
  title: string
  pinned?: boolean
}

interface MultiWindowTabsProps {
  windowTabs: WindowTab[]
  activeWindowId: string
  onTabChange: (tabId: string) => void
  onAddWindow?: (title: string) => void
  onCloseWindow?: (id: string) => void
  onCloseOtherWindows?: (keepId: string) => void
  onCloseAllWindows?: () => void
}

export default function MultiWindowTabs({
  windowTabs,
  activeWindowId,
  onTabChange,
  onAddWindow,
  onCloseWindow,
  onCloseOtherWindows,
  onCloseAllWindows
}: MultiWindowTabsProps) {
  const pinnedTabs = windowTabs.filter(t => t.pinned)
  const closableTabs = windowTabs.filter(t => !t.pinned)

  return (
    <div className="bg-gray-100 border-b border-gray-200 px-2">
      <div className="flex items-center gap-1">
        {/* 固定的标签（工作台） */}
        {pinnedTabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer transition-colors group',
              activeWindowId === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            )}
          >
            <Home className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.title}</span>
          </div>
        ))}

        {/* 可关闭的标签 */}
        {closableTabs.map(tab => (
          <div
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer transition-colors group',
              activeWindowId === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCloseWindow?.(tab.id)
              }}
              className="ml-1 p-0.5 rounded hover:bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {/* 窗口操作按钮 */}
        <div className="flex items-center gap-1 ml-auto">
          {/* 关闭其他 */}
          {activeWindowId !== 'dashboard' && onCloseOtherWindows && (
            <button
              onClick={() => onCloseOtherWindows(activeWindowId)}
              className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded transition-colors"
              title="关闭其他"
            >
              关闭其他
            </button>
          )}

          {/* 关闭全部 */}
          {closableTabs.length > 0 && onCloseAllWindows && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onCloseAllWindows()
              }}
              className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded transition-colors"
              title="关闭全部"
            >
              关闭全部
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
