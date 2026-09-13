import { useEffect, useState } from 'react'
import { Bot, LogIn } from 'lucide-react'
import * as api from '../api'
import type { User } from '../types'

/** 登录：账号 + 角色（方案 §6.5）。角色来自 user 表，不是页面上的下拉切换。 */
export default function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [known, setKnown] = useState<User[]>([])

  useEffect(() => { api.get<User[]>('/users').then(setKnown).catch(() => setKnown([])) }, [])

  async function submit(value: string) {
    if (!value.trim()) return
    setBusy(true)
    setError('')
    try {
      const body = await api.post<{ user: User }>('/auth/login', { name: value.trim() })
      api.setCurrentUser(body.user)
      onLogin(body.user)
    } catch (problem) {
      setError((problem as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="h-full bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-lg bg-[#1677FF] flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-800">AI-native OA</h1>
            <p className="text-xs text-gray-400">数字员工与流程工作台</p>
          </div>
        </div>

        <form onSubmit={event => { event.preventDefault(); void submit(name) }} className="mt-6">
          <label className="block">
            <span className="block text-xs text-gray-500 mb-1.5">姓名</span>
            <input
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="输入姓名"
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1677FF] focus:ring-1 focus:ring-[#1677FF]/30"
            />
          </label>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          <button
            disabled={busy || !name.trim()}
            className="w-full mt-4 flex items-center justify-center gap-1.5 rounded bg-[#1677FF] py-2 text-sm text-white hover:bg-[#0e5fd8] transition-colors disabled:opacity-40"
          >
            <LogIn className="w-4 h-4" />
            {busy ? '登录中…' : '登录'}
          </button>
        </form>

        {known.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-2">开发环境账号（角色是 user 表里的数据）</p>
            <div className="flex flex-wrap gap-1.5">
              {known.map(user => (
                <button
                  key={user.id}
                  onClick={() => { setName(user.name); void submit(user.name) }}
                  className="px-2 py-1 rounded bg-gray-50 text-xs text-gray-600 hover:bg-blue-50 hover:text-[#1677FF] transition-colors"
                >
                  {user.name}·{user.role}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
