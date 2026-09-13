import { TodoList, StatsCards, QuickActions, Announcements } from '@/components/Dashboard'

interface SolutionManagerDashboardProps {
  onNavigate: (path: string) => void
}

/**
 * 解决方案经理工作台
 * - 左侧：待办区（10条/页）+ 3 栏指标卡（方案支撑/应标支撑/甄选支撑）
 * - 右侧：常用功能 + 系统公告
 */
export default function SolutionManagerDashboard({ onNavigate }: SolutionManagerDashboardProps) {
  return (
    <div className="h-full p-3 overflow-auto">
      <div className="flex gap-3 h-full">
        {/* 左侧：待办 + 3 栏指标卡 */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 h-full">
          <div className="flex-1 min-h-0">
            <TodoList onNavigate={onNavigate} />
          </div>
          <StatsCards />
        </div>
        {/* 右侧：常用功能 + 系统公告 */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-3 h-full">
          <div className="flex-1 min-h-0">
            <QuickActions onNavigate={onNavigate} />
          </div>
          <div className="flex-1 min-h-0">
            <Announcements />
          </div>
        </div>
      </div>
    </div>
  )
}
