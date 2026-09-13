import { Clock, FileCheck, FileText, AlertCircle } from 'lucide-react'
import { reminders } from '@/data/mock'
import { clsx } from 'clsx'

const typeConfig = {
  task: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  approval: { icon: FileCheck, color: 'text-orange-600', bg: 'bg-orange-100' },
  contract: { icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' }
}

export default function Reminders() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">我的提醒</h3>
      <div className="space-y-4">
        {reminders.map((reminder, index) => {
          const config = typeConfig[reminder.type]
          const Icon = config.icon

          return (
            <div
              key={reminder.id}
              className={clsx(
                'relative pl-6 pb-4 border-l-2 border-gray-200 last:pb-0',
                reminder.urgent && 'border-l-red-400'
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={clsx(
                  'absolute left-0 top-0 w-3 h-3 rounded-full -translate-x-[7px]',
                  config.bg,
                  reminder.urgent && 'bg-red-400 animate-pulse'
                )}
              />
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                    config.bg,
                    config.color
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={clsx(
                        'font-medium text-sm',
                        reminder.urgent ? 'text-red-600' : 'text-gray-800'
                      )}
                    >
                      {reminder.title}
                    </span>
                    {reminder.urgent && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    {reminder.content}
                  </p>
                  <p className="text-xs text-gray-400">{reminder.time}</p>
                </div>
                <button className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  处理
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
        查看全部提醒
      </button>
    </div>
  )
}
