import { useEffect, useRef } from 'react'
import * as echarts from 'echarts/core'
import { BarChart, GraphChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsOption } from 'echarts'

// 按需注册：内网离线部署，包体越小越省事。
echarts.use([BarChart, LineChart, PieChart, ScatterChart, GraphChart,
             GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

/** 一个库同时覆盖 chart 和 graph（方案 §7），所以只有这一处图表依赖。 */
export function useECharts(option: EChartsOption, deps: unknown[]) {
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!box.current) return
    const chart = echarts.init(box.current)
    chart.setOption(option)
    const resize = () => chart.resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      chart.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return box
}

export const AXIS_STYLE = {
  axisLine: { lineStyle: { color: '#e5e7eb' } },
  axisLabel: { color: '#6b7280', fontSize: 11 },
  axisTick: { show: false },
}

export const PALETTE = ['#1677FF', '#13C2C2', '#FA8C16', '#52C41A', '#722ED1', '#EB2F96']
