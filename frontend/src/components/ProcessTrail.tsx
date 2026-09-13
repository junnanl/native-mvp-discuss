import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

export interface ProcessTrailItem {
  time: string
  actor: string
  action: string
}

interface ProcessTrailProps {
  trail: ProcessTrailItem[]
  defaultExpanded?: boolean
}

export default function ProcessTrail({
  trail,
  defaultExpanded = true
}: ProcessTrailProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
        <span className="text-xs text-gray-400 ml-1">共 {trail.length} 步</span>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
          : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
        }
      </div>
      {expanded && (
        <div className="p-4">
          <div className="relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
            <ol className="space-y-4">
              {trail.map((item, idx) => (
                <li key={idx} className="relative">
                  <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 ${
                    idx === trail.length - 1
                      ? 'bg-[#1677FF] border-[#1677FF]'
                      : 'bg-white border-gray-300'
                  }`} />
                  <div className="text-xs text-gray-400 mb-0.5">{item.time}</div>
                  <div className="text-sm text-gray-800">
                    <span className="font-medium">{item.actor}</span>
                    <span className="text-gray-500 ml-1.5">{item.action}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
