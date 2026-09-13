import { useState } from 'react'

type ProcessResult = 'completed' | 'transferred'

interface ProcessInfoProps {
  defaultResult?: ProcessResult
  defaultComment?: string
  onResultChange?: (value: ProcessResult) => void
  onCommentChange?: (value: string) => void
}

export default function ProcessInfo({
  defaultResult = 'completed',
  defaultComment = '完成',
  onResultChange,
  onCommentChange
}: ProcessInfoProps) {
  const [processResult, setProcessResult] = useState<ProcessResult>(defaultResult)
  const [processComment, setProcessComment] = useState(defaultComment)

  const handleResultChange = (value: ProcessResult) => {
    setProcessResult(value)
    const comment = value === 'completed' ? '完成' : ''
    setProcessComment(comment)
    onResultChange?.(value)
    onCommentChange?.(comment)
  }

  const handleCommentChange = (value: string) => {
    setProcessComment(value)
    onCommentChange?.(value)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">处理信息</h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          <div className="flex items-center min-h-[36px]">
            <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
              <span className="text-red-500 mr-0.5">*</span>
              处理结果
            </label>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleResultChange('completed')}
                  className={`px-4 py-2 text-sm rounded-md border-2 transition-all ${
                    processResult === 'completed'
                      ? 'bg-green-50 border-green-400 text-green-600 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  完成
                </button>
                <button
                  type="button"
                  onClick={() => handleResultChange('transferred')}
                  className={`px-4 py-2 text-sm rounded-md border-2 transition-all ${
                    processResult === 'transferred'
                      ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  转派
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-start">
            <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3 pt-2">
              <span className="text-red-500 mr-0.5">*</span>
              处理意见
            </label>
            <div className="flex-1 min-w-0">
              <textarea
                value={processComment}
                onChange={(e) => handleCommentChange(e.target.value)}
                placeholder="请输入处理意见"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
