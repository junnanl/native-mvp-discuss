import { useCallback, useEffect, useState } from 'react'
import MultiWindowTabs from './components/Dashboard/MultiWindowTabs'
import * as api from './oa/api'
import TopBar from './oa/components/TopBar'
import AgentChat from './oa/pages/AgentChat'
import AgentList from './oa/pages/AgentList'
import Login from './oa/pages/Login'
import RequirementDetail from './oa/pages/RequirementDetail'
import Workbench from './oa/pages/Workbench'
import type { Agent, User } from './oa/types'

type Tab = { id: string; title: string; pinned?: boolean }

const HOME: Tab = { id: 'dashboard', title: '工作台', pinned: true }

/**
 * 外壳：顶栏 + 标签页 + 内容。
 *
 * 标签页就是全局导航（方案 §6.2），侧边栏取消。切标签时内容保持挂载——数字员工
 * 对话是长时程的，去看一眼待办回来对话不能丢（§6.2）。
 */
export default function App() {
  const [user, setUser] = useState<User | null>(() => api.currentUser())
  const [tabs, setTabs] = useState<Tab[]>([HOME])
  const [active, setActive] = useState(HOME.id)
  const [agents, setAgents] = useState<Record<number, Agent>>({})
  const [seeds, setSeeds] = useState<Record<number, string>>({})
  const [refreshToken, setRefreshToken] = useState(0)

  const open = useCallback((tab: Tab) => {
    setTabs(current => (current.some(item => item.id === tab.id) ? current : [...current, tab]))
    setActive(tab.id)
  }, [])

  useEffect(() => {
    if (!user) {
      setTabs([HOME])
      setActive(HOME.id)
    }
  }, [user])

  if (!user) return <Login onLogin={setUser} />

  const openAgent = (agent: Agent, question?: string) => {
    setAgents(current => ({ ...current, [agent.id]: agent }))
    if (question) setSeeds(current => ({ ...current, [agent.id]: question }))
    open({ id: `agent:${agent.id}`, title: agent.name })
  }

  const openInstance = (id: number) => open({ id: `instance:${id}`, title: `需求#${id}` })

  const close = (id: string) => {
    setTabs(current => current.filter(tab => tab.pinned || tab.id !== id))
    if (active === id) setActive(HOME.id)
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <TopBar user={user} onLogout={() => { api.setCurrentUser(null); setUser(null) }} />

      <MultiWindowTabs
        windowTabs={tabs}
        activeWindowId={active}
        onTabChange={setActive}
        onCloseWindow={close}
        onCloseAllWindows={() => { setTabs([HOME]); setActive(HOME.id) }}
        onCloseOtherWindows={id => setTabs(current => current.filter(tab => tab.pinned || tab.id === id))}
      />

      <main className="flex-1 min-h-0">
        <div className="h-full" hidden={active !== HOME.id}>
          <Workbench
            key={`${user.id}-${refreshToken}`}
            user={user}
            onOpenAgent={openAgent}
            onOpenInstance={openInstance}
            onOpenAgentList={() => open({ id: 'agents', title: '数字员工' })}
          />
        </div>

        <div className="h-full" hidden={active !== 'agents'}>
          {tabs.some(tab => tab.id === 'agents') && <AgentList onOpen={openAgent} />}
        </div>

        {tabs.filter(tab => tab.id.startsWith('instance:')).map(tab => (
          <div key={tab.id} className="h-full" hidden={active !== tab.id}>
            <RequirementDetail
              id={Number(tab.id.split(':')[1])}
              user={user}
              onChanged={() => setRefreshToken(value => value + 1)}
            />
          </div>
        ))}

        {tabs.filter(tab => tab.id.startsWith('agent:')).map(tab => {
          const agent = agents[Number(tab.id.split(':')[1])]
          return (
            <div key={tab.id} className="h-full" hidden={active !== tab.id}>
              {agent && <AgentChat agent={agent} seed={seeds[agent.id]} />}
            </div>
          )
        })}
      </main>
    </div>
  )
}
