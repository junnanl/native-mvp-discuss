import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import * as api from '../api'

type Props = {
  pageKey: string
  placeholder: string
  busy?: boolean
  onSubmit: (text: string) => void
}

/**
 * 输入框 + 提示词建议（方案 §6.3）。建议是配置，不是代码——改内容改数据库。
 *
 * 只有一个提交按钮：用户不需要知道自己这句话该走填表还是查数据，那是 dispatch
 * 的活（方案 §6.4）。
 */
export default function PromptBox({ pageKey, placeholder, busy, onSubmit }: Props) {
  const [text, setText] = useState('')
  const [suggestions, setSuggestions] = useState<{ id: number; text: string }[]>([])

  useEffect(() => {
    api.get<{ id: number; text: string }[]>(`/prompt-suggestions?page_key=${encodeURIComponent(pageKey)}`)
      .then(setSuggestions)
      .catch(() => setSuggestions([]))
  }, [pageKey])

  const send = (value: string) => {
    if (!value.trim() || busy) return
    onSubmit(value.trim())
  }

  return (
    <div>
      <form
        onSubmit={event => { event.preventDefault(); send(text) }}
        className="flex items-center gap-2 bg-white rounded-lg shadow-sm p-2"
      >
        <Sparkles className="w-4 h-4 text-[#1677FF] ml-2 shrink-0" />
        <input
          aria-label="说一句话"
          value={text}
          onChange={event => setText(event.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 px-1 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="px-4 py-2 rounded bg-[#1677FF] text-white text-sm hover:bg-[#0e5fd8] transition-colors disabled:opacity-40"
        >
          {busy ? '处理中…' : '发送'}
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2 px-1">
          <span className="text-xs text-gray-400">试试：</span>
          {suggestions.map(suggestion => (
            <button
              key={suggestion.id}
              onClick={() => { setText(suggestion.text); send(suggestion.text) }}
              disabled={busy}
              className="px-2.5 py-1 rounded-full bg-white text-xs text-gray-600 shadow-sm hover:text-[#1677FF] hover:shadow transition-all disabled:opacity-40"
            >
              {suggestion.text}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
