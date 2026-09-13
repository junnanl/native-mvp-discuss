import type { User } from './types'

const USER_KEY = 'oa.user'

export function currentUser(): User | null {
  const stored = localStorage.getItem(USER_KEY)
  return stored ? (JSON.parse(stored) as User) : null
}

export function setCurrentUser(user: User | null) {
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_KEY)
}

function headers(): HeadersInit {
  const user = currentUser()
  return {
    'Content-Type': 'application/json',
    ...(user ? { 'X-User-Id': String(user.id) } : {}),
  }
}

async function unwrap<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(typeof body.detail === 'string' ? body.detail : `请求失败（${response.status}）`)
  }
  return response.json() as Promise<T>
}

export function get<T>(path: string): Promise<T> {
  return fetch(`/api${path}`, { headers: headers() }).then(unwrap<T>)
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return fetch(`/api${path}`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(unwrap<T>)
}

export function put<T>(path: string, body: unknown): Promise<T> {
  return fetch(`/api${path}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(unwrap<T>)
}

/** 组件自己取数用：把筛选条件拼成 query string，不经过模型。 */
export function viewUrl(key: string, query: Record<string, string>, page: number) {
  const params = new URLSearchParams({ ...query, page: String(page) })
  return `/views/${key}?${params.toString()}`
}

export function streamUrl(agentId: number, requestId: string) {
  return `/api/agent/${agentId}/stream/${encodeURIComponent(requestId)}`
}
