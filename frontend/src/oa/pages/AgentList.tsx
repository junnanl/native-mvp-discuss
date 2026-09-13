import { useEffect, useState } from 'react'
import * as api from '../api'
import AgentCard from '../components/AgentCard'
import type { Agent } from '../types'

/** 数字员工列表（方案 §6.5）：内部应用市场形态。 */
export default function AgentList({ onOpen }: { onOpen: (agent: Agent) => void }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [error, setError] = useState('')
  const [category, setCategory] = useState('全部')

  useEffect(() => {
    api.get<Agent[]>('/agents?status=已上线').then(setAgents).catch(problem => setError((problem as Error).message))
  }, [])

  const categories = ['全部', ...Array.from(new Set(agents.map(agent => agent.category)))]
  const shown = category === '全部' ? agents : agents.filter(agent => agent.category === category)

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4">
      {error && <div className="bg-red-50 border border-red-100 text-red-700 rounded-lg px-4 py-3 text-sm mb-3">{error}</div>}

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {categories.map(item => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                item === category ? 'bg-[#1677FF] text-white' : 'bg-white text-gray-600 shadow-sm hover:text-[#1677FF]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
        {shown.map((agent, index) => (
          <AgentCard key={agent.id} agent={agent} index={index} onOpen={() => onOpen(agent)} />
        ))}
      </div>

      {shown.length === 0 && !error && (
        <div className="bg-white rounded-lg shadow-sm py-16 text-center text-sm text-gray-400">
          还没有已上线的数字员工。
        </div>
      )}
    </div>
  )
}
