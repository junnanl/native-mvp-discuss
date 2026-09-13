import { useCallback, useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'
import * as api from '../api'
import type { ViewData } from '../types'
import Chart from './Chart'
import Graph from './Graph'
import Metric from './Metric'
import Table from './Table'
import TextBlock from './TextBlock'

type Props = {
  title: string
  onClose?: () => void
  onOpenInstance?: (id: number) => void
} & (
  /** 查库的产物：自己去取数，翻页也自己去取。 */
  | { viewKey: string; query: Record<string, string>; data?: undefined }
  /** 数字员工直接给出的产物：数据随工具事件一起来的，不用再查一次。 */
  | { viewKey?: undefined; query?: undefined; data: ViewData }
)

/**
 * 一张产物卡：组件写死，数据自己去取。
 *
 * 取数失败就说失败——不拿占位数据糊过去，否则用户会对着编出来的图表做决定。
 */
export default function ViewCard({ viewKey, title, query, data: given, onClose, onOpenInstance }: Props) {
  const [fetched, setFetched] = useState<ViewData | null>(null)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(Boolean(viewKey))
  const data = given ?? fetched

  const load = useCallback(async (target: number) => {
    if (!viewKey) return
    setLoading(true)
    setError('')
    try {
      setFetched(await api.get<ViewData>(api.viewUrl(viewKey, query ?? {}, target)))
    } catch (problem) {
      setFetched(null)
      setError((problem as Error).message)
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey, JSON.stringify(query ?? {})])

  useEffect(() => { void load(page) }, [load, page])

  const filters = Object.entries(query ?? {}).filter(([, value]) => value !== '')

  return (
    <div className="bg-white rounded-lg shadow-sm p-4" style={{ animation: 'fadeInUp 0.4s ease-out forwards' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1 h-4 bg-[#1677FF] rounded-sm shrink-0" />
          <h3 className="text-sm font-semibold text-gray-800 truncate">{title}</h3>
          {filters.map(([key, value]) => (
            <span key={key} className="px-1.5 py-0.5 rounded bg-blue-50 text-[10px] text-blue-600 whitespace-nowrap">
              {key}={value}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {viewKey && (
            <button onClick={() => void load(page)} className="p-1 rounded hover:bg-gray-100 text-gray-400" title="刷新">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-400" title="删除这张">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600 py-4">{error}</p>}
      {!error && !data && loading && <p className="text-sm text-gray-400 py-4">正在取数…</p>}
      {data?.component === 'metric' && <Metric {...data} />}
      {data?.component === 'chart' && <Chart {...data} />}
      {data?.component === 'graph' && <Graph {...data} />}
      {data?.component === 'text' && <TextBlock {...data} />}
      {data?.component === 'table' && (
        // 数据是员工一次性给的时候没法翻页，就别显示翻页控件——显示了点不动就是骗人
        <Table {...data} onPage={viewKey ? setPage : undefined} onOpen={onOpenInstance} />
      )}
    </div>
  )
}
