import { useState } from 'react'
import { FileText, Download, Eye, ChevronDown, ChevronRight } from 'lucide-react'
import type { ContractAttachment } from '@/data/mock'

interface ContractAttachmentsProps {
  attachments: ContractAttachment[]
  defaultExpanded?: boolean
}

export default function ContractAttachments({ attachments, defaultExpanded = false }: ContractAttachmentsProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">项目附件</h3>
        <span className="ml-2 text-sm text-gray-400">共 {attachments.length} 个</span>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
          : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
        }
      </div>
      {expanded && (
        <div className="px-4 pb-3 pt-3">
          {attachments.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">暂无附件</div>
          ) : (
            <div className="space-y-0">
              {attachments.map(attach => (
                <div
                  key={attach.id}
                  className="flex items-center justify-between py-2.5"
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <FileText className="w-4 h-4 text-[#1677FF] shrink-0" />
                    <span className="text-sm text-gray-800 truncate ml-2.5">{attach.name}</span>
                    {attach.tag && (
                      <span className="inline-flex items-center px-1.5 py-0.5 text-xs text-gray-600 bg-gray-100 rounded shrink-0 ml-2">{attach.tag}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span className="text-xs text-gray-500 whitespace-nowrap">{attach.size}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{attach.uploadTime}</span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-blue-700 whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      预览
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-blue-700 whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      下载
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
