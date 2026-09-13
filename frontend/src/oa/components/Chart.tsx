import type { ViewData } from '../types'
import { AXIS_STYLE, PALETTE, useECharts } from './echarts'

type Props = Extract<ViewData, { component: 'chart' }>

/** 丰富度靠参数化：type 是个参数，不是四个组件（方案 §6.6）。 */
export default function Chart({ type, categories, series }: Props) {
  const box = useECharts(
    type === 'pie'
      ? {
          color: PALETTE,
          tooltip: { trigger: 'item' },
          series: [{
            type: 'pie', radius: ['45%', '70%'],
            label: { fontSize: 11, color: '#6b7280' },
            data: categories.map((name, index) => ({ name, value: series[0]?.data[index] ?? 0 })),
          }],
        }
      : {
          color: PALETTE,
          tooltip: { trigger: 'axis' },
          grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
          xAxis: { type: 'category', data: categories, ...AXIS_STYLE },
          yAxis: { type: 'value', splitLine: { lineStyle: { color: '#f3f4f6' } }, ...AXIS_STYLE },
          series: series.map(item => ({
            name: item.name,
            type: type === 'scatter' ? 'scatter' : type,
            data: item.data,
            smooth: type === 'line',
            barMaxWidth: 28,
            itemStyle: { borderRadius: type === 'bar' ? [4, 4, 0, 0] : 0 },
          })),
        },
    [type, JSON.stringify(categories), JSON.stringify(series)],
  )
  return <div ref={box} className="h-56 w-full" />
}
