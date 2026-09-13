import { useState, useEffect, useRef } from 'react'
import { clsx } from 'clsx'
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ArrowRight, MapPin, Briefcase, FileSignature, Wallet } from 'lucide-react'
import { TodoList, Announcements } from '@/components/Dashboard'
import {
  stageProjectCount,
  signOverview,
  incomeOverview,
  cityRankings,
  industryRankings,
  topProjects
} from '@/data/mock'

interface LeaderDashboardProps {
  onNavigate: (path: string) => void
}

type Period = 'year' | 'quarter' | 'month'

const periodLabels: Record<Period, string> = {
  year: '年',
  quarter: '季度',
  month: '月'
}

const stageConfig = [
  { key: 'scheme', label: '方案', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
  { key: 'selection', label: '甄选', color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  { key: 'bid', label: '投标', color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  { key: 'contract', label: '合同', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600' },
  { key: 'implement', label: '实施', color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600' },
  { key: 'acceptance', label: '验收', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { key: 'warranty', label: '维保', color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-600' }
]

// 单个指标卡片
function MetricCard({
  label,
  value,
  unit,
  color = 'blue'
}: {
  label: string
  value: number | string
  unit?: string
  color?: 'blue' | 'cyan' | 'green' | 'orange' | 'red' | 'purple' | 'emerald' | 'indigo' | 'pink'
}) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    cyan: 'from-cyan-500 to-cyan-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    emerald: 'from-emerald-500 to-emerald-600',
    indigo: 'from-indigo-500 to-indigo-600',
    pink: 'from-pink-500 to-pink-600'
  }
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow">
      <div className="text-xs text-gray-500 mb-1 truncate">{label}</div>
      <div className="inline-flex items-end gap-0.5 leading-none">
        <span className={clsx('text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent leading-none', colorMap[color])}>
          {value}
        </span>
        {unit && <span className="text-[10px] text-gray-500 leading-none mb-0.5">{unit}</span>}
      </div>
    </div>
  )
}

// 排行条
function RankBar({
  rank,
  name,
  value,
  unit = '',
  maxValue
}: {
  rank: number
  name: string
  value: number
  unit?: string
  maxValue: number
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0
  const rankColors = [
    'bg-gradient-to-r from-yellow-400 to-amber-500 text-white',
    'bg-gradient-to-r from-slate-300 to-slate-400 text-white',
    'bg-gradient-to-r from-orange-300 to-orange-400 text-white'
  ]
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span
        className={clsx(
          'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
          rank <= 3 ? rankColors[rank - 1] : 'bg-gray-100 text-gray-500'
        )}
      >
        {rank}
      </span>
      <span className="w-16 text-sm text-gray-700 truncate shrink-0">{name}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#1677FF] to-[#4096FF] rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-800 shrink-0 w-20 text-right">
        {value}{unit}
      </span>
    </div>
  )
}

// Top5 项目滚动列表
function TopProjectsScroll() {
  const [paused, setPaused] = useState(false)
  const list = [...topProjects, ...topProjects]
  return (
    <div
      className="relative h-48 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={clsx(
          'absolute left-0 right-0 space-y-1',
          !paused && 'animate-scroll-up'
        )}
        style={{ animationDuration: `${list.length * 1.5}s` }}
      >
        {list.map((p, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-1.5 hover:bg-gray-50 rounded text-sm"
          >
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#1677FF] to-[#4096FF] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {((i % topProjects.length) + 1)}
            </span>
            <span className="flex-1 min-w-0 truncate text-gray-800" title={p.name}>{p.name}</span>
            <span className="flex items-center gap-1 text-xs text-gray-500 shrink-0 w-16">
              <MapPin className="w-3 h-3" />
              {p.city}
            </span>
            <span className="text-sm font-semibold text-[#1677FF] shrink-0 w-20 text-right">
              {p.signAmount} 万
            </span>
            <span className="px-1.5 py-0.5 rounded text-xs bg-blue-50 text-blue-600 shrink-0 w-16 text-center">
              {p.stage}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />
    </div>
  )
}

// 地市/区县排行 - 内部小标签切换
type CityRankKey = keyof typeof cityRankings
const cityRankTabs: { key: CityRankKey; label: string; unit: string }[] = [
  { key: 'projectCount', label: '项目数排行', unit: '个' },
  { key: 'bigDeal', label: '大单排行', unit: '个' },
  { key: 'signAmount', label: '签约排行', unit: '万' },
  { key: 'receivedAmount', label: '回款排行', unit: '万' },
  { key: 'schemeTimely', label: '方案支撑及时率', unit: '%' },
  { key: 'deliveryTimely', label: '交付及时率', unit: '%' },
  { key: 'faultTimely', label: '故障处理及时率', unit: '%' },
  { key: 'selfSupport', label: '自主率', unit: '%' }
]

function CityRankPanel() {
  const [activeTab, setActiveTab] = useState<CityRankKey>('projectCount')
  const [expanded, setExpanded] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const data = cityRankings[activeTab]
  const maxValue = data[0]?.value ?? 1
  const visibleData = expanded ? data : data.slice(0, 3)
  const hiddenCount = data.length - visibleData.length

  const scrollTabs = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -160 : 160, behavior: 'smooth' })
    }
  }

  const handleTabClick = (key: CityRankKey) => {
    setActiveTab(key)
    setExpanded(false)
    setTimeout(() => {
      const btn = tabRefs.current[key]
      if (btn && scrollRef.current) {
        const c = scrollRef.current
        const bLeft = btn.offsetLeft
        const bRight = bLeft + btn.offsetWidth
        const sLeft = c.scrollLeft
        const sRight = sLeft + c.clientWidth
        if (bLeft < sLeft) c.scrollTo({ left: bLeft - 8, behavior: 'smooth' })
        else if (bRight > sRight) c.scrollTo({ left: bRight - c.clientWidth + 8, behavior: 'smooth' })
      }
    }, 0)
  }

  return (
    <div className="space-y-2">
      {/* 小标签横向滚动 */}
      <div className="relative flex items-center gap-1">
        <button
          type="button"
          onClick={() => scrollTabs('left')}
          className="shrink-0 w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#1677FF] hover:border-[#1677FF]"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className="inline-flex gap-1.5 px-1">
            {cityRankTabs.map(tab => (
              <button
                key={tab.key}
                ref={el => { tabRefs.current[tab.key] = el }}
                onClick={() => handleTabClick(tab.key)}
                className={clsx(
                  'shrink-0 px-3 py-1 text-xs rounded-full transition-colors whitespace-nowrap',
                  activeTab === tab.key
                    ? 'bg-[#1677FF] text-white shadow-sm'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => scrollTabs('right')}
          className="shrink-0 w-6 h-6 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-[#1677FF] hover:border-[#1677FF]"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 当前小类的排行列表（默认前 3 条，可展开） */}
      <div>
        {visibleData.map((item, i) => (
          <RankBar
            key={i}
            rank={i + 1}
            name={item.name}
            value={item.value}
            unit={cityRankTabs.find(t => t.key === activeTab)?.unit}
            maxValue={maxValue}
          />
        ))}
        {hiddenCount > 0 && (
          <div className="text-center mt-2">
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-[#1677FF] hover:underline inline-flex items-center gap-1"
            >
              展开查看所有 {data.length} 个地市/区县
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        )}
        {expanded && data.length > 3 && (
          <div className="text-center mt-2">
            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-gray-500 hover:text-[#1677FF] hover:underline inline-flex items-center gap-1"
            >
              收起
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// 行业统计 - 柱状图（美化版）
const industryChartColors: Array<{ key: string; color: string; label: string; unit: string; data: { name: string; value: number }[] }> = [
  { key: 'projectCount', color: '#1677FF', label: '项目数', unit: '个', data: industryRankings.projectCount },
  { key: 'signAmount', color: '#7C3AED', label: '签约金额', unit: '万元', data: industryRankings.signAmount },
  { key: 'receivedAmount', color: '#10B981', label: '回款金额', unit: '万元', data: industryRankings.receivedAmount }
]

// 渐变色与背景色配置
const industryColorExt: Record<string, { from: string; to: string; tint: string }> = {
  projectCount: { from: '#1677FF', to: '#69B1FF', tint: 'rgba(22,119,255,0.08)' },
  signAmount: { from: '#7C3AED', to: '#A78BFA', tint: 'rgba(124,58,237,0.08)' },
  receivedAmount: { from: '#10B981', to: '#34D399', tint: 'rgba(16,185,129,0.08)' }
}

const yAxisLabels = ['100%', '75%', '50%', '25%', '0%']

function IndustryStatistics() {
  const industries = industryRankings.projectCount.map(item => item.name)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  // 每个指标独立求 max（用于柱高比例）
  const maxValues: Record<string, number> = {}
  industryChartColors.forEach(item => {
    maxValues[item.key] = Math.max(...item.data.map(d => d.value)) * 1.15 || 1
  })

  return (
    <div className="rounded-lg border border-gray-100 p-4 bg-white shadow-sm">
      {/* 图例（胶囊 + 浅色背景） */}
      <div className="flex items-center flex-wrap gap-2 mb-3">
        {industryChartColors.map(item => (
          <div
            key={item.key}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border"
            style={{ backgroundColor: industryColorExt[item.key].tint, borderColor: 'transparent' }}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm shadow-sm"
              style={{ background: `linear-gradient(to top, ${industryColorExt[item.key].from}, ${industryColorExt[item.key].to})` }}
            />
            <span className="text-gray-700 font-medium">{item.label}</span>
            <span className="text-gray-400">（{item.unit}）</span>
          </div>
        ))}
      </div>

      {/* 图表区：Y 轴 + 柱状图主体 */}
      <div className="flex gap-2">
        {/* Y 轴标签 */}
        <div
          className="flex flex-col justify-between text-[10px] text-gray-400 font-medium text-right pr-2 shrink-0"
          style={{ height: '212px', width: '40px' }}
        >
          {yAxisLabels.map(label => (
            <span key={label}>{label}</span>
          ))}
        </div>

        {/* 图表主体 */}
        <div className="flex-1 min-w-0">
          {/* 网格 + 柱状图叠加层 */}
          <div className="relative" style={{ height: '212px' }}>
            {/* 网格线（虚线 4 条 + 实线 1 条） */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="border-t border-dashed border-gray-200 w-full" />
              ))}
              <div className="border-t border-gray-300 w-full" />
            </div>

            {/* 柱状图 */}
            <div className="absolute inset-0 grid grid-cols-9 gap-0.5">
              {industries.map((name, i) => {
                const isHovered = hoveredIdx === i
                const isDim = hoveredIdx !== null && hoveredIdx !== i
                return (
                  <div
                    key={i}
                    className={clsx(
                      'flex flex-col min-w-0 h-full relative rounded-md transition-colors duration-200',
                      isHovered ? 'bg-gray-50' : 'bg-transparent'
                    )}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    {/* 柱组容器 */}
                    <div className="flex-1 flex items-end justify-center gap-1 min-h-0 px-1.5 pb-1.5">
                      {industryChartColors.map(item => {
                        const value = item.data[i].value
                        const heightPct = (value / maxValues[item.key]) * 100
                        return (
                          <div
                            key={item.key}
                            className="flex-1 h-full flex flex-col justify-end relative"
                            style={{ maxWidth: '16px', minWidth: '4px' }}
                          >
                            {/* 柱顶数值标签 */}
                            <div
                              className={clsx(
                                'absolute left-0 right-0 text-center text-[10px] font-semibold whitespace-nowrap transition-all duration-700',
                                isDim ? 'opacity-30' : 'opacity-100'
                              )}
                              style={{
                                bottom: `calc(${heightPct}% + 3px)`,
                                color: industryColorExt[item.key].from
                              }}
                            >
                              {value.toLocaleString()}
                            </div>
                            {/* 柱体（顶亮底深渐变） */}
                            <div
                              className="w-full rounded-t-sm transition-all duration-700 ease-out"
                              style={{
                                height: mounted ? `${heightPct}%` : '0%',
                                minHeight: mounted ? '3px' : '0px',
                                background: `linear-gradient(to top, ${industryColorExt[item.key].from} 0%, ${industryColorExt[item.key].to} 100%)`,
                                boxShadow: isHovered
                                  ? `0 2px 8px -2px ${industryColorExt[item.key].from}80`
                                  : 'none',
                                opacity: isDim ? 0.35 : 1,
                                transitionDelay: `${i * 30}ms`
                              }}
                              title={`${item.label}：${value.toLocaleString()} ${item.unit}`}
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* X 轴标签（与柱图 9 列对齐） */}
          <div className="grid grid-cols-9 gap-0.5 mt-2">
            {industries.map((name, i) => (
              <div
                key={i}
                className={clsx(
                  'text-[11px] text-center truncate h-6 leading-6 transition-colors',
                  hoveredIdx === i ? 'text-[#1677FF] font-semibold' : 'text-gray-600 font-medium'
                )}
                title={name}
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部汇总卡片 */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
        {industryChartColors.map(item => {
          const total = item.data.reduce((sum, d) => sum + d.value, 0)
          const Icon = item.key === 'projectCount' ? Briefcase : item.key === 'signAmount' ? FileSignature : Wallet
          return (
            <div
              key={item.key}
              className="rounded-lg p-2.5 flex items-center gap-3 transition-shadow hover:shadow-sm"
              style={{ backgroundColor: industryColorExt[item.key].tint }}
            >
              <div
                className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 shadow-sm"
                style={{ background: `linear-gradient(135deg, ${industryColorExt[item.key].from} 0%, ${industryColorExt[item.key].to} 100%)` }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-gray-500 mb-0.5">行业{item.label}合计</div>
                <div className="flex items-baseline gap-0.5">
                  <span
                    className="text-lg font-bold leading-none"
                    style={{ color: industryColorExt[item.key].from }}
                  >
                    {total.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-gray-400 leading-none">{item.unit}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 关键阶段项目数（带箭头，紧凑布局）
function StageProjects({ data }: { data: any }) {
  return (
    <div className="flex items-stretch">
      {stageConfig.map((s, idx) => (
        <div key={s.key} className="flex items-stretch flex-1 min-w-0">
          <div className={clsx('rounded-lg px-3 py-1.5 flex-1 min-w-0 hover:shadow-md transition-shadow flex items-center gap-2', s.bg)}>
            <div className={clsx('text-xs shrink-0', s.text)}>{s.label}</div>
            <div className="text-lg font-bold text-gray-800 leading-none ml-auto">{(data as any)[s.key]}</div>
          </div>
          {idx < stageConfig.length - 1 && (
            <div className="flex items-center justify-center px-1 shrink-0">
              <ArrowRight className="w-3.5 h-3.5 text-gray-300" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function LeaderDashboard({ onNavigate }: LeaderDashboardProps) {
  const [period, setPeriod] = useState<Period>('month')

  const stageData = stageProjectCount[period]
  const signData = signOverview[period]
  const incomeData = incomeOverview[period]

  useEffect(() => {
    const id = 'leader-dashboard-animations'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      @keyframes scroll-up {
        0% { transform: translateY(0); }
        100% { transform: translateY(-50%); }
      }
      .animate-scroll-up {
        animation-name: scroll-up;
        animation-timing-function: linear;
        animation-iteration-count: infinite;
      }
      .scrollbar-none::-webkit-scrollbar { display: none; }
    `
    document.head.appendChild(style)
  }, [])

  return (
    <div className="h-full p-3 overflow-auto bg-gray-50 space-y-3">
      {/* 第一行：待办（5行） + 系统公告 */}
      <div className="flex gap-3" style={{ height: '320px' }}>
        <div className="flex-1 min-w-0 h-full">
          <TodoList onNavigate={onNavigate} compact />
        </div>
        <div className="w-96 flex-shrink-0 h-full">
          <Announcements />
        </div>
      </div>

      {/* 下方：领导驾驶舱区域 */}
      <div className="bg-white rounded-lg shadow-sm p-4 space-y-3">
        {/* 领导驾驶舱标题（与"系统公告"同级的小标题） */}
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-[#1677FF] rounded-sm" />
          <h2 className="text-base font-semibold text-gray-800">领导驾驶舱</h2>
          <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {(Object.keys(periodLabels) as Period[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={clsx(
                  'px-3 py-1 text-xs rounded-md transition-colors',
                  period === p
                    ? 'bg-white text-[#1677FF] shadow-sm font-medium'
                    : 'text-gray-600 hover:text-gray-800'
                )}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
        </div>

        {/* ① 项目阶段：关键阶段项目数 */}
        <section className="border border-gray-100 rounded-lg p-3 bg-gradient-to-r from-blue-50/30 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">项目阶段</h3>
          </div>
          <StageProjects data={stageData} />
        </section>

        {/* ② 经营指标：签约情况 + 收入情况 */}
        <section className="border border-gray-100 rounded-lg p-3 bg-gradient-to-r from-emerald-50/30 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-emerald-500 rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">经营指标</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-emerald-500" />
                签约情况
              </div>
              <div className="grid grid-cols-6 gap-2">
                <MetricCard label="大单数量" value={signData.bigDealCount} unit="个" color="red" />
                <MetricCard label="优单数量" value={signData.excellentDealCount} unit="个" color="orange" />
                <MetricCard label="中标项目数" value={signData.winBidCount} unit="个" color="blue" />
                <MetricCard label="中标金额" value={signData.winBidAmount.toLocaleString()} unit="万元" color="purple" />
                <MetricCard label="直签项目数" value={signData.directSignCount} unit="个" color="cyan" />
                <MetricCard label="直签金额" value={signData.directSignAmount.toLocaleString()} unit="万元" color="emerald" />
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-emerald-500" />
                收入情况
              </div>
              <div className="grid grid-cols-4 gap-2">
                <MetricCard label="计划出账金额" value={incomeData.planAmount.toLocaleString()} unit="万元" color="blue" />
                <MetricCard label="实际出账金额" value={incomeData.actualAmount.toLocaleString()} unit="万元" color="cyan" />
                <MetricCard label="回款金额" value={incomeData.receivedAmount.toLocaleString()} unit="万元" color="emerald" />
                <MetricCard label="欠费金额" value={incomeData.owedAmount.toLocaleString()} unit="万元" color="red" />
              </div>
            </div>
          </div>
        </section>

        {/* ③ 排行分析：地市/区县 + 行业统计（各占一行） */}
        <section className="border border-gray-100 rounded-lg p-3 bg-gradient-to-r from-purple-50/30 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-purple-500 rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">排行分析</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-purple-500" />
                地市/区县排行
              </div>
              <CityRankPanel />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1.5 flex items-center gap-1.5">
                <span className="inline-block w-1 h-1 rounded-full bg-purple-500" />
                行业统计
              </div>
              <IndustryStatistics />
            </div>
          </div>
        </section>

        {/* ④ 项目榜：TOP 5 项目 */}
        <section className="border border-gray-100 rounded-lg p-3 bg-gradient-to-r from-orange-50/30 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 bg-orange-500 rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">项目榜</h3>
          </div>
          <div className="border border-gray-100 rounded-lg p-2 bg-white">
            <TopProjectsScroll />
          </div>
        </section>
      </div>
    </div>
  )
}
