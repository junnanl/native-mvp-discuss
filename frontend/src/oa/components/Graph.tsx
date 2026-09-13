import type { ViewData } from '../types'
import { PALETTE, useECharts } from './echarts'

type Props = Extract<ViewData, { component: 'graph' }>

/**
 * 只要给它 {nodes, edges} 就能画——数据来自自己的表、Neo4j 还是别的，
 * 组件一行都不用改（方案 §6.6）。
 */
export default function Graph({ nodes, edges }: Props) {
  const kinds = Array.from(new Set(nodes.map(node => node.type ?? 'node')))
  const box = useECharts({
    tooltip: {},
    legend: [{ data: kinds, bottom: 0, textStyle: { fontSize: 11, color: '#6b7280' } }],
    series: [{
      type: 'graph',
      layout: 'force',
      roam: true,
      draggable: true,
      // layoutAnimation:false 直接算到稳定态，省得节点先挤成一团再慢慢散开
      force: { repulsion: 600, edgeLength: 170, gravity: 0.08, layoutAnimation: false },
      categories: kinds.map((name, index) => ({ name, itemStyle: { color: PALETTE[index % PALETTE.length] } })),
      label: { show: true, position: 'bottom', fontSize: 11, color: '#374151' },
      lineStyle: { color: '#9ca3af', width: 1.5, curveness: 0 },
      emphasis: { focus: 'adjacency' },
      data: nodes.map(node => ({
        id: node.id,
        name: node.label,
        category: kinds.indexOf(node.type ?? 'node'),
        symbolSize: (node.type ?? 'node') === 'agent' ? 42 : 28,
      })),
      links: edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        // ECharts 的 link.label 是样式对象，文本放它的 formatter 里
        label: { show: Boolean(edge.label), formatter: edge.label ?? '', fontSize: 10, color: '#9ca3af' },
        lineStyle: edge.weight ? { width: 1 + edge.weight * 3 } : undefined,
      })),
    }],
  }, [JSON.stringify(nodes), JSON.stringify(edges)])
  return <div ref={box} className="h-72 w-full" />
}
