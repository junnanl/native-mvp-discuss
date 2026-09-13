import { useState } from 'react'
import {
  ArrowLeft,
  Upload,
  X,
  RotateCcw,
  Check,
  FileText,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { getContractInfo } from '@/data/mock'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'

interface ContractAttachmentUploadProps {
  onNavigate?: (path: string) => void
  todoId?: string
  contractId?: string
}

const contractParserOptions = [
  '张三（合同解析组）',
  '李四（合同解析组）',
  '王五（合同解析组）',
  '赵六（合同解析组）',
  '钱七（合同解析组）'
]

const approverOptions = [
  '张三（合同解析人员）',
  '李四（合同解析人员）',
  '王五（合同解析人员）',
  '赵六（合同解析人员）',
  '钱七（合同解析人员）'
]

export default function ContractAttachmentUpload({ onNavigate, todoId, contractId }: ContractAttachmentUploadProps) {
  const contractInfo = getContractInfo(contractId || 'CT2026060001')

  const [uploadedFile, setUploadedFile] = useState<{ id: string; name: string; size: string; time: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [approver, setApprover] = useState('')
  const [approverError, setApproverError] = useState('')
  const [attachError, setAttachError] = useState('')

  const [trailExpanded, setTrailExpanded] = useState(false)
  const trailData = [
    { time: '2026-07-15 10:30:00', actor: '张三', action: '提交合同附件上传申请' },
    { time: '2026-07-15 14:20:00', actor: '李四', action: '审批通过，流转至合同解析环节' }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allFiles = Array.from(e.target.files || [])
    const pdfFiles = allFiles.filter(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf')
    if (allFiles.length !== pdfFiles.length) {
      alert('仅支持上传 PDF 格式文件')
    }
    if (pdfFiles.length === 0) return
    setAttachError('')
    const file = pdfFiles[0]
    setUploadedFile({
      id: `file-${Date.now()}`,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      time: new Date().toLocaleString()
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const allFiles = Array.from(e.dataTransfer.files || [])
    const pdfFiles = allFiles.filter(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf')
    if (allFiles.length !== pdfFiles.length) {
      alert('仅支持上传 PDF 格式文件')
    }
    if (pdfFiles.length === 0) return
    setAttachError('')
    const file = pdfFiles[0]
    setUploadedFile({
      id: `file-${Date.now()}`,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      time: new Date().toLocaleString()
    })
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
  }

  const handleCancel = () => {
    onNavigate?.('/my/todo')
  }

  const handleSubmit = () => {
    let valid = true
    if (!uploadedFile) {
      setAttachError('请上传合同附件')
      valid = false
    }
    if (!approver) {
      setApproverError('请选择下一步处理人')
      valid = false
    }
    if (!valid) return
    alert('附件上传成功，已提交给合同解析人员')
    onNavigate?.(`/finance/contract/parse/${contractId || 'CT2026060001'}`)
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-3 space-y-3">
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]"
          >
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">合同附件上传</h2>
          </div>
        </div>

        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        <ContractInfoCard contractInfo={contractInfo} defaultExpanded={true} />

        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">合同附件上传</h3>
            <span className="text-red-500 text-xs">*</span>
          </div>
          <div className="p-4">
            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver ? 'border-[#1677FF] bg-blue-50/50' : 'border-gray-200'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  将文件拖拽到此处，或
                  <button
                    type="button"
                    onClick={() => {
                      setAttachError('')
                      setUploadedFile({
                        id: `file-${Date.now()}`,
                        name: '芜湖智慧教育云平台服务合同.pdf',
                        size: '5,242.9 KB',
                        time: new Date().toLocaleString()
                      })
                    }}
                    className="text-[#1677FF] cursor-pointer hover:underline"
                  >
                    点击上传
                  </button>
                </p>
                <p className="text-xs text-gray-400">仅支持 PDF 格式文件，仅可上传一个文件</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#1677FF]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-gray-800 truncate">{uploadedFile.name}</div>
                    <div className="text-xs text-gray-400">{uploadedFile.size} · {uploadedFile.time}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
            {attachError && (
              <p className="text-xs text-red-500 mt-2">{attachError}</p>
            )}
          </div>
        </div>

        {/* 流程轨迹 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
            onClick={() => setTrailExpanded(v => !v)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
            <span className="text-xs text-gray-400 ml-1">共 {trailData.length} 步</span>
            {trailExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
              : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
            }
          </div>
          {trailExpanded && (
            <div className="p-4">
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
                <ol className="space-y-4">
                  {trailData.map((item, idx) => (
                    <li key={idx} className="relative">
                      <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 ${
                        idx === trailData.length - 1
                          ? 'bg-[#1677FF] border-[#1677FF]'
                          : 'bg-white border-gray-300'
                      }`} />
                      <div className="text-xs text-gray-400 mb-0.5">{item.time}</div>
                      <div className="text-sm text-gray-800">
                        <span className="font-medium">{item.actor}</span>
                        <span className="text-gray-500 ml-1.5">{item.action}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">流程信息</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步环节</label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      合同解析
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步处理人</label>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                        合同解析人员
                      </span>
                      <div className="flex-1 min-w-0">
                        <SearchableSelect
                          value={approver}
                          onChange={(v) => { setApprover(v); setApproverError('') }}
                          options={approverOptions}
                          placeholder="请选择下一步处理人"
                        />
                      </div>
                    </div>
                    {approverError && (
                      <p className="text-xs text-red-500 mt-1">{approverError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100 bg-white rounded-lg shadow-sm p-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            取消
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            提交
          </button>
        </div>
      </div>
    </div>
  )
}
