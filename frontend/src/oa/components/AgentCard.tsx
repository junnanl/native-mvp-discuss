import { Bot, TrendingUp } from 'lucide-react'
import { clsx } from 'clsx'
import type { Agent } from '../types'

type Props = { agent: Agent & { creator_name?: string | null }; index?: number; onOpen: () => void }

/**
 * 数字员工卡片（方案 §6.8）。
 *
 * 不放版本号——对用户几乎无用，是内部信息。成熟度是后台配的装饰性标签，所以跟
 * 客观的使用次数并列展示，让人自己判断。
 */
export default function AgentCard({ agent, index = 0, onOpen }: Props) {
  const capabilities = (agent.capabilities ?? []).slice(0, 3)
  return (
    <button
      onClick={onOpen}
      className="group text-left bg-white rounded-lg shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
      style={{ animationDelay: `${index * 80}ms`, animation: 'fadeInUp 0.5s ease-out forwards' }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center overflow-hidden shrink-0">
          {agent.avatar
            ? <img src={agent.avatar} alt="" className="w-full h-full object-cover" />
            : <Bot className="w-5 h-5 text-[#1677FF]" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs text-[#1677FF] mb-0.5">{agent.category}</div>
          <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#1677FF]">{agent.name}</h3>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-5 line-clamp-2 mb-3 min-h-[2.5rem]">{agent.description || '—'}</p>

      {capabilities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {capabilities.map(capability => (
            <span key={capability.id} className="px-1.5 py-0.5 rounded bg-gray-50 text-[10px] text-gray-500">
              {capability.name}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-center gap-3 text-[11px] text-gray-400">
        {agent.maturity && (
          <span className={clsx('px-1.5 py-0.5 rounded',
            agent.maturity === '成熟' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600')}>
            {agent.maturity}
          </span>
        )}
        <span className="flex items-center gap-0.5">
          <TrendingUp className="w-3 h-3" />
          {agent.usage_count} 次
        </span>
        {agent.creator_name && <span className="ml-auto truncate">{agent.creator_name} 做的</span>}
      </div>
    </button>
  )
}
