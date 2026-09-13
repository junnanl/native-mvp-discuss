import { useState } from 'react'
import { TrendingUp, FileText, CreditCard, Briefcase, Plus, Star, Clock, X, FileSignature } from 'lucide-react'
import { clsx } from 'clsx'

interface QuickAction {
  id: string
  title: string
  icon: string
  color: string
  bgColor: string
  isCustom?: boolean
  isFavorite?: boolean
  lastUsed?: string
  path?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingUp,
  FileText,
  CreditCard,
  Briefcase,
  Plus,
  FileSignature
}

const defaultActions: QuickAction[] = [
  { id: '0', title: '共享线索录入', icon: 'FileSignature', color: 'text-blue-600', bgColor: 'bg-blue-100', isFavorite: true, path: '/business/clue/share-input' },
  { id: '1', title: '商机录入', icon: 'TrendingUp', color: 'text-blue-600', bgColor: 'bg-blue-100', isFavorite: true, path: '/business/opportunity/input' },
  { id: '2', title: '合同起草', icon: 'FileText', color: 'text-green-600', bgColor: 'bg-green-100', isFavorite: true },
  { id: '3', title: 'IT收入计划确认', icon: 'CreditCard', color: 'text-orange-600', bgColor: 'bg-orange-100', isFavorite: false, lastUsed: '2026-06-05' },
  { id: '4', title: '我的商机', icon: 'Briefcase', color: 'text-purple-600', bgColor: 'bg-purple-100', isFavorite: false, lastUsed: '2026-06-04' },
  { id: '5', title: '支出登记', icon: 'CreditCard', color: 'text-pink-600', bgColor: 'bg-pink-100', isFavorite: true },
  { id: '6', title: '项目审批', icon: 'FileText', color: 'text-cyan-600', bgColor: 'bg-cyan-100', isFavorite: false, lastUsed: '2026-06-03' }
]

const colorOptions = [
  { color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { color: 'text-green-600', bgColor: 'bg-green-100' },
  { color: 'text-orange-600', bgColor: 'bg-orange-100' },
  { color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { color: 'text-pink-600', bgColor: 'bg-pink-100' },
  { color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  { color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
  { color: 'text-teal-600', bgColor: 'bg-teal-100' }
]

interface QuickActionsProps {
  onNavigate?: (path: string) => void
}

export default function QuickActions({ onNavigate }: QuickActionsProps) {
  const [actions, setActions] = useState<QuickAction[]>(defaultActions)
  const [activeTab, setActiveTab] = useState<'favorite' | 'recent'>('favorite')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newActionTitle, setNewActionTitle] = useState('')
  const [selectedColorIndex, setSelectedColorIndex] = useState(0)

  const favoriteActions = actions.filter(a => a.isFavorite)
  const recentActions = [...actions].filter(a => !a.isFavorite).sort((a, b) => {
    if (!a.lastUsed || !b.lastUsed) return 0
    return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
  })

  const displayedActions = activeTab === 'favorite' ? favoriteActions : recentActions

  const handleClick = (action: QuickAction) => {
    console.log('快捷操作:', action.title)
    // 更新最近使用时间
    setActions(prev => prev.map(a =>
      a.id === action.id ? { ...a, lastUsed: new Date().toISOString().split('T')[0] } : a
    ))
    // 如果有path，触发跳转
    if (action.path && onNavigate) {
      onNavigate(action.path)
    }
  }

  const handleAdd = () => {
    if (!newActionTitle.trim()) return

    const color = colorOptions[selectedColorIndex]
    const newAction: QuickAction = {
      id: `custom-${Date.now()}`,
      title: newActionTitle.trim(),
      icon: 'Plus',
      color: color.color,
      bgColor: color.bgColor,
      isCustom: true,
      isFavorite: true
    }

    setActions([...actions, newAction])
    setNewActionTitle('')
    setSelectedColorIndex(0)
    setShowAddModal(false)
  }

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActions(actions.filter(a => a.id !== id))
  }

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setActions(prev => prev.map(a =>
      a.id === id ? { ...a, isFavorite: !a.isFavorite } : a
    ))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-500">常用功能</div>
      </div>

      {/* 收藏/最近使用切换 */}
      <div className="flex items-center gap-4 mb-2 border-b border-gray-100 pb-2">
        <button
          onClick={() => setActiveTab('favorite')}
          className={clsx(
            'flex items-center gap-1 text-sm pb-1 transition-colors relative',
            activeTab === 'favorite' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Star className="w-3.5 h-3.5" />
          收藏
          {activeTab === 'favorite' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={clsx(
            'flex items-center gap-1 text-sm pb-1 transition-colors relative',
            activeTab === 'recent' ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          最近使用
          {activeTab === 'recent' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
        {activeTab === 'favorite' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="ml-auto p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="添加收藏"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-start gap-x-3 gap-y-1.5 flex-wrap flex-1 content-start">
        {displayedActions.length === 0 ? (
          <div className="text-sm text-gray-400 py-4">
            {activeTab === 'favorite' ? '暂无收藏' : '暂无最近使用'}
          </div>
        ) : (
          displayedActions.map((action) => {
            const Icon = iconMap[action.icon]
            return (
              <div key={action.id} className="relative group">
                <button
                  onClick={() => handleClick(action)}
                  className="flex flex-col items-center gap-1 p-1.5 rounded-lg hover:bg-gray-50 transition-colors min-w-[56px]"
                >
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      action.bgColor
                    )}
                  >
                    {Icon && <Icon className={clsx('w-5 h-5', action.color)} />}
                  </div>
                  <span className="text-xs text-gray-600">{action.title}</span>
                </button>
                {action.isCustom && (
                  <button
                    onClick={(e) => handleDelete(action.id, e)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                {activeTab === 'recent' && (
                  <button
                    onClick={(e) => handleToggleFavorite(action.id, e)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-white rounded-full items-center justify-center hidden group-hover:flex hover:bg-yellow-500"
                    title="添加到收藏"
                  >
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                )}
                {activeTab === 'favorite' && !action.isCustom && (
                  <button
                    onClick={(e) => handleToggleFavorite(action.id, e)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 text-white rounded-full items-center justify-center hidden group-hover:flex hover:bg-yellow-500"
                    title="取消收藏"
                  >
                    <Star className="w-3 h-3 fill-current" />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 添加自定义功能弹窗 */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-50"
            onClick={() => setShowAddModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-6 z-50 w-80">
            <h3 className="text-base font-medium text-gray-800 mb-4">添加收藏</h3>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">功能名称</label>
              <input
                type="text"
                value={newActionTitle}
                onChange={(e) => setNewActionTitle(e.target.value)}
                placeholder="请输入功能名称"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">选择颜色</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColorIndex(index)}
                    className={clsx(
                      'w-8 h-8 rounded-lg',
                      option.bgColor,
                      selectedColorIndex === index && 'ring-2 ring-blue-500 ring-offset-2'
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
              >
                添加
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
