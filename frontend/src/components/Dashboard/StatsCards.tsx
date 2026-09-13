import { TrendingUp, TrendingDown, Wallet, Award, Briefcase } from 'lucide-react'
import { clsx } from 'clsx'

interface MetricGroup {
  id: string
  title: string
  mainValue: number | null
  mainUnit: string
  mainLabel: string
  mainChange?: number
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  subMetrics: { label: string; value: string; color?: string }[]
}

export default function StatsCards({ metricGroups }: { metricGroups: MetricGroup[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {metricGroups.map((group, index) => {
        const Icon = group.icon
        const isPositive = group.mainChange >= 0
        return (
          <div
            key={group.id}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-all duration-300"
            style={{
              animationDelay: `${index * 80}ms`,
              animation: 'fadeInUp 0.5s ease-out forwards'
            }}
          >
            {/* 卡片头部：标题 + 图标 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">{group.title}</h3>
              </div>
              <div className={clsx('w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center', group.iconColor)}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* 主体数据 */}
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">{group.mainLabel}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-gray-800 leading-none">
                    {group.mainValue === null ? '—' : group.mainValue.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">{group.mainUnit}</span>
                </div>
              </div>
              {group.mainChange !== undefined && <div
                className={clsx(
                  'flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium',
                  isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {isPositive ? '+' : ''}{group.mainChange}%
              </div>}
            </div>

            {/* 分割线 */}
            <div className="border-t border-gray-100 pt-2.5">
              {/* 子指标列表 */}
              <div className="grid grid-cols-3 gap-2">
                {group.subMetrics.map((m, i) => (
                  <div key={i} className="min-w-0">
                    <div className="text-xs text-gray-500 truncate">{m.label}</div>
                    <div className={clsx('text-sm font-semibold mt-0.5 truncate', m.color || 'text-gray-800')}>
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
