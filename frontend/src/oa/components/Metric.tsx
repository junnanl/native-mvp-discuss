import type { ViewData } from '../types'

type Props = Extract<ViewData, { component: 'metric' }>

export default function Metric({ value, unit, change_label, change_value }: Props) {
  return (
    <div className="flex items-end justify-between">
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-gray-800 leading-none">{value.toLocaleString()}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {change_label !== undefined && (
        <div className="text-right">
          <div className="text-xs text-gray-500">{change_label}</div>
          <div className="text-lg font-semibold text-[#1677FF]">{change_value ?? 0}</div>
        </div>
      )}
    </div>
  )
}
