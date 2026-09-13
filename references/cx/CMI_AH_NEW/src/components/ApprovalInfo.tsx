import { useState } from 'react'

type ApprovalResult = 'approved' | 'rejected' | 'transferred'

interface ApprovalInfoProps {
  defaultResult?: ApprovalResult
  defaultComment?: string
  onResultChange?: (value: ApprovalResult) => void
  onCommentChange?: (value: string) => void
  showTransferButton?: boolean
}

export default function ApprovalInfo({
  defaultResult = 'approved',
  defaultComment = '通过',
  onResultChange,
  onCommentChange,
  showTransferButton = false
}: ApprovalInfoProps) {
  const [approvalResult, setApprovalResult] = useState<ApprovalResult>(defaultResult)
  const [approvalComment, setApprovalComment] = useState(defaultComment)

  const handleResultChange = (value: ApprovalResult) => {
    setApprovalResult(value)
    const comment = value === 'approved' ? '通过' : ''
    setApprovalComment(comment)
    onResultChange?.(value)
    onCommentChange?.(comment)
  }

  const handleCommentChange = (value: string) => {
    setApprovalComment(value)
    onCommentChange?.(value)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">审批信息</h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          <div className="flex items-center min-h-[36px]">
            <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
              <span className="text-red-500 mr-0.5">*</span>
              审批结果
            </label>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleResultChange('approved')}
                  className={`px-4 py-2 text-sm rounded-md border-2 transition-all ${
                    approvalResult === 'approved'
                      ? 'bg-green-50 border-green-400 text-green-600 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  通过
                </button>
                <button
                  type="button"
                  onClick={() => handleResultChange('rejected')}
                  className={`px-4 py-2 text-sm rounded-md border-2 transition-all ${
                    approvalResult === 'rejected'
                      ? 'bg-red-50 border-red-400 text-red-600 shadow-sm'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50/50'
                  }`}
                >
                  驳回
                </button>
                {showTransferButton && (
                  <button
                    type="button"
                    onClick={() => handleResultChange('transferred')}
                    className={`px-4 py-2 text-sm rounded-md border-2 transition-all ${
                      approvalResult === 'transferred'
                        ? 'bg-blue-50 border-blue-400 text-blue-600 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    转派
                  </button>
                )}
              </div>
            </div>
          </div>
          {approvalResult === 'transferred' ? (
            <div className="flex items-start">
              <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3 pt-2">
                <span className="text-red-500 mr-0.5">*</span>
                转派意见
              </label>
              <div className="flex-1 min-w-0">
                <textarea
                  value={approvalComment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  placeholder="请输入转派意见"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-start">
              <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3 pt-2">
                <span className="text-red-500 mr-0.5">*</span>
                审批意见
              </label>
              <div className="flex-1 min-w-0">
                <textarea
                  value={approvalComment}
                  onChange={(e) => handleCommentChange(e.target.value)}
                  placeholder="请输入审批意见"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
