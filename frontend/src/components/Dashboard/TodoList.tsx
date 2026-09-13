import { useState, useMemo, useEffect } from 'react'
import {
  Clock,
  FileCheck,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Mail,
  AlarmClock,
  CheckCheck,
  Search
} from 'lucide-react'
const primaryTabs = [{key:'todo',label:'待办'}, {key:'read',label:'待阅'}, {key:'reminder',label:'提醒'}, {key:'done',label:'已办'}]
const reminderTabs = [{key:'all',label:'全部'}]
const readSubTabs = [{key:'all',label:'全部'}]

import { clsx } from 'clsx'

// 一级 Tab 图标
const primaryTabIcons: Record<string, { Icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string; activeBg: string; activeText: string }> = {
  todo: { Icon: ListTodo, iconBg: 'bg-blue-100', iconColor: 'text-blue-600', activeBg: 'bg-blue-50', activeText: 'text-blue-600' },
  read: { Icon: Mail, iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', activeBg: 'bg-cyan-50', activeText: 'text-cyan-600' },
  reminder: { Icon: AlarmClock, iconBg: 'bg-orange-100', iconColor: 'text-orange-600', activeBg: 'bg-orange-50', activeText: 'text-orange-600' },
  done: { Icon: CheckCheck, iconBg: 'bg-green-100', iconColor: 'text-green-600', activeBg: 'bg-green-50', activeText: 'text-green-600' }
}

const readTypeConfig = {
  task: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  approval: { icon: FileCheck, color: 'text-orange-600', bg: 'bg-orange-100' },
  contract: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' }
}

const PAGE_SIZE = 10

interface TodoListProps {
  items: { id: number; title: string; kind: string; status: string; owner: string; content?: string; time?: string }[]
  onNavigate: (path: string) => void
  compact?: boolean
}

export default function TodoList({ items, onNavigate, compact = false }: TodoListProps) {
  const todoList = useMemo(() => items.map(item => ({ ...item, completed: false, category: item.kind, todoType: item.kind })), [items])
  const readList: any[] = []
  const doneList: any[] = []
  const reminders: any[] = []
  const secondaryTabs = [{key:'all',label:'全部'}, ...Array.from(new Set(items.map(item => item.kind))).map(kind => ({key:kind,label:kind}))]
  const [activePrimaryTab, setActivePrimaryTab] = useState('todo')
  const [activeSecondaryTab, setActiveSecondaryTab] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [tabSearch, setTabSearch] = useState('')

  // 根据一级tab获取数据
  const currentData = useMemo(() => {
    switch (activePrimaryTab) {
      case 'todo':
        return todoList.filter(item => !item.completed)
      case 'read':
        return readList
      case 'reminder':
        return reminders
      case 'done':
        return doneList
      default:
        return []
    }
  }, [activePrimaryTab, todoList])

  // 根据二级tab筛选数据
  const filteredData = useMemo(() => {
    if (activeSecondaryTab === 'all') {
      return currentData
    }

    if (activePrimaryTab === 'read') {
      // 待阅分类筛选
      return currentData.filter((item: any) => item.readCategory === activeSecondaryTab)
    }

    if (activePrimaryTab === 'reminder') {
      // 提醒分类筛选
      if (activeSecondaryTab === 'expiring') {
        return currentData.filter((item: any) => item.urgent === true)
      }
      if (activeSecondaryTab === 'overdue') {
        return currentData.filter((item: any) => item.urgent === false)
      }
      return currentData
    }

    return currentData.filter((item: any) => item.category === activeSecondaryTab)
  }, [currentData, activeSecondaryTab, activePrimaryTab])

  // 分页计算
  const pageSize = compact ? 5 : PAGE_SIZE
  const totalCount = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  useEffect(() => setCurrentPage(p => Math.min(p, totalPages)), [totalPages])
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // 切换tab时重置页码
  const handleTabChange = (tabKey: string) => {
    setActivePrimaryTab(tabKey)
    setActiveSecondaryTab('all')
    setCurrentPage(1)
  }

  const handleSecondaryTabChange = (tabKey: string) => {
    setActiveSecondaryTab(tabKey)
    setCurrentPage(1)
  }

  // 计算各tab数量
  const tabCounts = useMemo(() => {
    const todoCount = todoList.filter(item => !item.completed).length
    const readCount = readList.length
    const reminderCount = reminders.length
    const doneCount = doneList.length

    // 待办/已办二级分类计数
    const secondaryCounts: Record<string, number> = {
      all: todoCount
    }

    secondaryTabs.forEach(tab => {
      if (tab.key !== 'all') {
        secondaryCounts[tab.key] = todoList.filter(
          item => !item.completed && item.category === tab.key
        ).length
      }
    })

    // 已办二级分类计数
    const doneSecondaryCounts: Record<string, number> = {
      all: doneCount
    }

    secondaryTabs.forEach(tab => {
      if (tab.key !== 'all') {
        doneSecondaryCounts[tab.key] = doneList.filter(
          item => item.category === tab.key
        ).length
      }
    })

    // 提醒二级分类计数
    const reminderSecondaryCounts: Record<string, number> = {
      all: reminderCount,
      expiring: reminders.filter(item => item.urgent === true).length,
      overdue: reminders.filter(item => item.urgent === false).length,
      other: 0
    }

    // 待阅二级分类计数
    const readSecondaryCounts: Record<string, number> = {
      all: readCount,
      approval: readList.filter((item: any) => item.readCategory === 'approval').length,
      change: readList.filter((item: any) => item.readCategory === 'change').length,
      progress: readList.filter((item: any) => item.readCategory === 'progress').length,
      other: readList.filter((item: any) => item.readCategory === 'other').length
    }

    return {
      todo: todoCount,
      read: readCount,
      reminder: reminderCount,
      done: doneCount,
      secondary: secondaryCounts,
      doneSecondary: doneSecondaryCounts,
      reminderSecondary: reminderSecondaryCounts,
      readSecondary: readSecondaryCounts
    }
  }, [todoList])

  const handleProcess = (item: {id: number}) => onNavigate(`/flow-instances/${item.id}`)
  const handleView = handleProcess

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 h-full flex flex-col">
      {/* 一级Tab + 更多链接 */}
      <div className="flex items-center justify-between mb-2 border-b border-gray-200 pb-2">
        <div className="flex items-center gap-1">
          {primaryTabs.map(tab => {
            const cfg = primaryTabIcons[tab.key]
            const Icon = cfg.Icon
            const isActive = activePrimaryTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={clsx(
                  'flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium transition-colors whitespace-nowrap rounded-md',
                  isActive
                    ? `${cfg.activeText} ${cfg.activeBg}`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <span className={clsx('flex items-center justify-center w-5 h-5 rounded', cfg.iconBg, cfg.iconColor)}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <span>{tab.label}</span>
                <span className={clsx(
                  'text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-medium',
                  isActive
                    ? `${cfg.iconBg} ${cfg.iconColor}`
                    : 'bg-gray-100 text-gray-500'
                )}>
                  {(() => {
                    const v = tabCounts[tab.key as keyof typeof tabCounts]
                    return typeof v === 'number' ? v : (v[tab.key] ?? 0)
                  })()}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={tabSearch}
              onChange={(e) => {
                const v = e.target.value
                setTabSearch(v)
                const kw = v.trim()
                if (kw) {
                  const hit = primaryTabs.find(t => t.label.includes(kw))
                  if (hit && hit.key !== activePrimaryTab) {
                    handleTabChange(hit.key)
                  }
                }
              }}
              onBlur={() => setTabSearch('')}
              placeholder="搜索 待办/待阅/提醒/已办"
              className="w-56 pl-7 pr-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>
          
        </div>
      </div>

      {/* 二级Tab - 待办/已办/提醒显示 */}
      {activePrimaryTab === 'todo' && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {secondaryTabs.map(tab => {
            const count = tab.key === 'all'
              ? tabCounts.todo
              : tabCounts.secondary[tab.key] || 0

            return (
              <button
                key={tab.key}
                onClick={() => handleSecondaryTabChange(tab.key)}
                className={clsx(
                  'px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap',
                  activeSecondaryTab === tab.key
                    ? 'bg-blue-100 text-blue-600 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {tab.label}
                <span className="ml-1">({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {activePrimaryTab === 'done' && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {secondaryTabs.map(tab => {
            const count = tab.key === 'all'
              ? tabCounts.done
              : tabCounts.doneSecondary[tab.key] || 0

            return (
              <button
                key={tab.key}
                onClick={() => handleSecondaryTabChange(tab.key)}
                className={clsx(
                  'px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap',
                  activeSecondaryTab === tab.key
                    ? 'bg-blue-100 text-blue-600 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {tab.label}
                <span className="ml-1">({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {activePrimaryTab === 'reminder' && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {reminderTabs.map(tab => {
            const count = tab.key === 'all'
              ? tabCounts.reminder
              : tabCounts.reminderSecondary[tab.key] || 0

            return (
              <button
                key={tab.key}
                onClick={() => handleSecondaryTabChange(tab.key)}
                className={clsx(
                  'px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap',
                  activeSecondaryTab === tab.key
                    ? 'bg-blue-100 text-blue-600 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {tab.label}
                <span className="ml-1">({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {activePrimaryTab === 'read' && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {readSubTabs.map(tab => {
            const count = tab.key === 'all'
              ? tabCounts.read
              : tabCounts.readSecondary[tab.key] || 0

            return (
              <button
                key={tab.key}
                onClick={() => handleSecondaryTabChange(tab.key)}
                className={clsx(
                  'px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap',
                  activeSecondaryTab === tab.key
                    ? 'bg-blue-100 text-blue-600 font-medium'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {tab.label}
                <span className="ml-1">({count})</span>
              </button>
            )
          })}
        </div>
      )}

      {/* 列表内容 */}
      <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar">
        {paginatedData.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            暂无数据
          </div>
        ) : activePrimaryTab === 'read' ? (
          // 待阅列表
          paginatedData.map((item: any) => {
            const config = readTypeConfig[item.type] || readTypeConfig.task
            const Icon = config.icon

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    config.bg,
                    config.color
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => handleProcess(item)}
                      className="font-medium text-sm text-[#1677FF] hover:underline cursor-pointer text-left truncate"
                      title="点击查看详情"
                    >
                      {item.title}
                    </button>
                    {item.urgent && (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {item.content}
                  </p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
                <button
                  onClick={() => handleProcess(item)}
                  className="px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
                >
                  查阅
                </button>
              </div>
            )
          })
        ) : activePrimaryTab === 'reminder' ? (
          // 提醒列表
          paginatedData.map((item: any) => {
            const config = readTypeConfig[item.type] || readTypeConfig.task
            const Icon = config.icon

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    config.bg,
                    config.color
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <button
                      type="button"
                      onClick={() => handleProcess(item)}
                      className="font-medium text-sm text-[#1677FF] hover:underline cursor-pointer text-left truncate"
                      title="点击查看详情"
                    >
                      {item.title}
                    </button>
                    {item.urgent && (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {item.content}
                  </p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
                <button
                  onClick={() => handleProcess(item)}
                  className="px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors whitespace-nowrap"
                >
                  查阅
                </button>
              </div>
            )
          })
        ) : activePrimaryTab === 'done' ? (
          // 已办列表 - 表格形式
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left py-2 font-medium">待办名称</th>
                  <th className="text-left py-2 font-medium">待办类型</th>
                  <th className="text-left py-2 font-medium">期望完成时间</th>
                  <th className="text-left py-2 font-medium">实际完成时间</th>
                  <th className="text-left py-2 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item: any) => {
                  const isOverdue = item.completedTime && item.deadline && 
                    new Date(item.completedTime.split(' ')[0]) > new Date(item.deadline)
                  
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => handleView(item)}
                          className="text-sm text-[#1677FF] hover:underline cursor-pointer text-left"
                          title="点击查看详情"
                        >
                          {item.title}
                        </button>
                      </td>
                      <td className="py-2.5">
                        <span className="text-xs text-gray-600">
                          {item.todoType || item.category}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="text-xs text-gray-500">
                          {item.deadline}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="text-xs text-gray-500">
                          {item.completedTime || '-'}
                        </span>
                      </td>
                      <td className="py-2.5">
                        {isOverdue ? (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600">
                            延期
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600">
                            正常
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // 待办列表 - 完整字段展示
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left py-2 font-medium">待办名称</th>
                  <th className="text-left py-2 font-medium">待办类型</th>
                  <th className="text-left py-2 font-medium">接收时间</th>
                  <th className="text-left py-2 font-medium">期望完成时间</th>
                  <th className="text-right py-2 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => handleProcess(item)}
                        className="text-sm text-[#1677FF] hover:underline cursor-pointer text-left"
                        title="点击进入处理"
                      >
                        {item.title}
                      </button>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-gray-600">
                        {item.todoType || item.category}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-gray-500">
                        {item.receiveTime || '-'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs text-gray-500">
                        {item.deadline}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleProcess(item)}
                        className="px-3 py-1.5 text-xs text-white bg-blue-500 hover:bg-blue-600 rounded transition-colors whitespace-nowrap"
                      >
                        处理
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 分页 */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="text-sm text-gray-500">
            共 {totalCount} 条，第 {currentPage}/{totalPages} 页
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                currentPage === 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <ChevronLeft aria-label="上一页" className="w-4 h-4" />
            </button>

            {/* 页码 */}
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={clsx(
                    'w-8 h-8 rounded-lg text-sm transition-colors',
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                currentPage === totalPages
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <ChevronRight aria-label="下一页" className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
