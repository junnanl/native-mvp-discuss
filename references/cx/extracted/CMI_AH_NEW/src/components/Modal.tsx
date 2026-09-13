import { createContext, useCallback, useContext, useState } from 'react'
import { AlertCircle, X as XIcon } from 'lucide-react'

type ModalType = 'confirm' | 'alert'

interface ModalState {
  open: boolean
  type: ModalType
  title: string
  message: string
  // confirm: true=确定, false=取消；alert: 始终 resolve(undefined)
  resolve?: (v: boolean | undefined) => void
}

interface ModalContextType {
  confirm: (message: string, title?: string) => Promise<boolean>
  alert: (message: string, title?: string) => Promise<void>
}

const ModalContext = createContext<ModalContextType | null>(null)

export function useModal() {
  const ctx = useContext(ModalContext)
  if (!ctx) throw new Error('useModal 必须在 ModalProvider 内部使用')
  return ctx
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ModalState>({
    open: false,
    type: 'alert',
    title: '',
    message: ''
  })

  const confirm = useCallback((message: string, title = '确认操作') => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, type: 'confirm', title, message, resolve: resolve as (v: boolean | undefined) => void })
    })
  }, [])

  const alert = useCallback((message: string, title = '提示') => {
    return new Promise<void>((resolve) => {
      setState({ open: true, type: 'alert', title, message, resolve: () => resolve(undefined) })
    })
  }, [])

  const close = (result: boolean | undefined) => {
    // 先取出 resolve 再清 state，避免 state 还没更新就 resolve
    const resolve = state.resolve
    setState({ open: false, type: 'alert', title: '', message: '' })
    resolve?.(result)
  }

  return (
    <ModalContext.Provider value={{ confirm, alert }}>
      {children}
      {state.open && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
          onClick={() => close(state.type === 'alert' ? undefined : false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-[420px] max-w-[90vw] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-[#1677FF] shrink-0" />
                {state.title}
              </h3>
              <button
                type="button"
                onClick={() => close(state.type === 'alert' ? undefined : false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            {/* 内容 */}
            <div className="px-5 py-3 text-sm text-gray-700 leading-6 whitespace-pre-line">
              {state.message}
            </div>
            {/* 按钮区 */}
            <div className="px-5 py-3 bg-gray-50 flex justify-center gap-3 border-t border-gray-100">
              {state.type === 'confirm' ? (
                <>
                  <button
                    type="button"
                    onClick={() => close(false)}
                    className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => close(true)}
                    className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
                  >
                    确定
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => close(undefined)}
                  className="px-8 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
                >
                  我知道了
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  )
}
