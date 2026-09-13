import { Bell } from 'lucide-react'


export default function Announcements({ announcements = [] }: { announcements?: { id: number; title: string; content: string; publishTime: string }[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 h-full flex flex-col">
      <h3 className="text-sm font-medium text-gray-500 mb-2">系统公告</h3>
      <div className="flex-1 overflow-y-auto space-y-1">
        {announcements.length === 0 && <p className="text-xs text-gray-400">暂无公告</p>}
        {announcements.map((announcement, index) => {
          return (
            <div
              key={announcement.id}
              className="group cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex items-start gap-2">
                <Bell className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-800 hover:text-blue-600 mb-0.5 line-clamp-1">
                    {announcement.title}
                  </div>
                  <div className="text-xs text-gray-400 line-clamp-2">
                    {announcement.content}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {announcement.publishTime}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
