import { useState, useEffect } from 'react'
import { Check, Lightbulb, Hammer, ShieldCheck } from 'lucide-react'
import { clsx } from 'clsx'

type Stage = 'pre-sale' | 'in-sale' | 'after-sale'

interface FlowNode {
  key: string
  label: string
  path: string
}

interface StageConfig {
  key: Stage
  label: string
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  nodes: FlowNode[]
}

// 三个阶段的二级流程节点配置
const stageConfigs: StageConfig[] = [
  {
    key: 'pre-sale',
    label: '售前阶段',
    icon: Lightbulb,
    iconBg: 'bg-blue-100',
    nodes: [
      { key: 'biz', label: '商机', path: '/business/opportunity/query' },
      { key: 'pre-support', label: '售前支撑', path: '/business/opportunity/input' },
      { key: 'pre-decision', label: '预决策', path: '/my/todo' },
      { key: 'tender', label: '招投标', path: '/my/todo' },
      { key: 'project-init', label: '项目立项', path: '/my/project' },
      { key: 'contract-sign', label: '合同签订', path: '/my/contract' },
      { key: 'contract-brief', label: '合同交底', path: '/my/todo' }
    ]
  },
  {
    key: 'in-sale',
    label: '售中阶段',
    icon: Hammer,
    iconBg: 'bg-cyan-100',
    nodes: [
      { key: 'kickoff', label: '项目启动与规划', path: '/my/project' },
      { key: 'start', label: '项目开工', path: '/my/project' },
      { key: 'implement', label: '项目实施', path: '/my/project' },
      { key: 'self-check', label: '项目自检', path: '/my/project' },
      { key: 'acceptance', label: '项目验收', path: '/my/project' },
      { key: 'project-handover', label: '项目交维', path: '/my/project' }
    ]
  },
  {
    key: 'after-sale',
    label: '售后阶段',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-100',
    nodes: [
      { key: 'ops-plan', label: '运维方案制定', path: '/my/project' },
      { key: 'warranty', label: '项目维保', path: '/my/project' },
      { key: 'closure', label: '项目结项', path: '/my/project' }
    ]
  }
]

interface ProjectFlowNavProps {
  onNavigate?: (path: string) => void
  /** 节点选中回调（提供时，点击节点将走此回调而不触发 onNavigate） */
  onNodeChange?: (key: string) => void
  /** 当前正在进行的节点 key（自动定位对应阶段和进行中节点） */
  currentNodeKey?: string
  /** 嵌入式模式：不渲染外层白色卡片，便于嵌入到其他卡片中 */
  embedded?: boolean
  /** 需要隐藏的节点 key 列表（默认隐藏「商机」阶段，后续项目阶段处理页统一不展示商机） */
  hiddenNodes?: string[]
}

/**
 * 项目全流程导航组件
 * 顶部一级标签（售前/售中/售后）+ 下方二级分步流程条
 * 节点状态：已完成（置灰 + 对勾）、进行中（主色高亮 + 加粗）、未完成（浅灰）
 */
export default function ProjectFlowNav({ onNavigate, onNodeChange, currentNodeKey, embedded = false, hiddenNodes = ['biz'] }: ProjectFlowNavProps) {
  // 根据 currentNodeKey 自动定位到对应阶段
  const detectStage = (key?: string): Stage => {
    if (key) {
      for (const s of stageConfigs) {
        if (s.nodes.some(n => n.key === key)) return s.key
      }
    }
    return 'pre-sale'
  }

  const [activeStage, setActiveStage] = useState<Stage>(detectStage(currentNodeKey))

  // currentNodeKey 变化时同步阶段
  useEffect(() => {
    setActiveStage(detectStage(currentNodeKey))
  }, [currentNodeKey])

  const currentStage = stageConfigs.find(s => s.key === activeStage) ?? stageConfigs[0]

  // 当前阶段可见节点（按 hiddenNodes 过滤）
  const visibleNodes = currentStage.nodes.filter(n => !hiddenNodes.includes(n.key))

  // 当前进行中节点索引（基于可见节点重新计算）
  const activeIndex = (() => {
    if (currentNodeKey) {
      const i = visibleNodes.findIndex(n => n.key === currentNodeKey)
      if (i >= 0) return i
    }
    return 0
  })()

  return (
    <div className={clsx(embedded ? '' : 'bg-white rounded-lg shadow-sm p-4')}>
      {/* 一级标签栏：胶囊 pill 样式 + 图标 */}
      <div className="flex items-center gap-2 mb-3">
        {stageConfigs.map(stage => {
          const isActive = activeStage === stage.key
          const Icon = stage.icon
          return (
            <button
              key={stage.key}
              onClick={() => setActiveStage(stage.key)}
              className={clsx(
                'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 select-none',
                isActive
                  ? 'bg-gradient-to-r from-[#1677FF] to-[#4096FF] text-white shadow-sm shadow-blue-200 ring-1 ring-blue-200'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800 ring-1 ring-gray-100'
              )}
            >
              <span
                className={clsx(
                  'w-4 h-4 rounded-full flex items-center justify-center transition-colors',
                  isActive ? 'bg-white/25' : stage.iconBg
                )}
              >
                <Icon
                  className={clsx(
                    'w-3 h-3',
                    isActive ? 'text-white' : (
                      stage.key === 'pre-sale' ? 'text-blue-600' :
                      stage.key === 'in-sale' ? 'text-cyan-600' :
                      'text-emerald-600'
                    )
                  )}
                />
              </span>
              <span>{stage.label}</span>
            </button>
          )
        })}
      </div>

      {/* 二级流程条 */}
      <div className="flex items-start overflow-x-auto">
        {visibleNodes.map((node, idx) => {
          const isCompleted = idx < activeIndex
          const isCurrent = idx === activeIndex
          const isPending = idx > activeIndex
          const isLast = idx === visibleNodes.length - 1

          return (
            <div
              key={node.key}
              className={clsx('flex items-start', isLast ? 'flex-none' : 'flex-1 min-w-[100px]')}
            >
              {/* 节点 */}
              <button
                type="button"
                onClick={() => {
                  if (onNodeChange) {
                    onNodeChange(node.key)
                  } else {
                    onNavigate?.(node.path)
                  }
                }}
                className="flex flex-col items-center gap-1 group shrink-0"
              >
                <div
                  className={clsx(
                    'w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors',
                    isCurrent && 'bg-[#1677FF] border-[#1677FF] text-white',
                    isCompleted && 'bg-gray-100 border-gray-300 text-gray-500',
                    isPending && 'bg-white border-gray-300 text-gray-400 group-hover:border-[#1677FF] group-hover:text-[#1677FF]'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  ) : (
                    <span className="text-xs font-medium">{idx + 1}</span>
                  )}
                </div>
                <span
                  className={clsx(
                    'text-xs whitespace-nowrap transition-colors',
                    isCurrent && 'text-[#1677FF] font-semibold',
                    isCompleted && 'text-gray-500',
                    isPending && 'text-gray-400 group-hover:text-[#1677FF]'
                  )}
                >
                  {node.label}
                </span>
              </button>

              {/* 连接线 */}
              {!isLast && (
                <div
                  className={clsx(
                    'flex-1 h-0.5 mt-[14px] mx-2 rounded-full transition-colors',
                    idx < activeIndex ? 'bg-gray-300' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
