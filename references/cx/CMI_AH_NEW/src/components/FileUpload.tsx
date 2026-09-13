import { Upload, X, FileText } from 'lucide-react'

// 通用多文件上传组件（系统统一附件样式）
// - 上传后文件以列表形式展示在上传区上方
// - 每个文件独立可删除
// - 下方固定一个上传区，hover 高亮主色

interface FileUploadProps {
  label?: string
  required?: boolean
  /** 外部已用 §三 label 风格时，传 true 不再渲染内部 label */
  hideLabel?: boolean
  files: string[]
  onAdd: () => void
  onRemove: (index: number) => void
  /** 上传区提示文字 */
  uploadText?: string
  /** 只读模式，只展示文件列表，不显示上传按钮和删除按钮 */
  readOnly?: boolean
}

export default function FileUpload({
  label,
  required,
  hideLabel = false,
  files,
  onAdd,
  onRemove,
  uploadText,
  readOnly = false
}: FileUploadProps) {
  const tip = uploadText || (files.length > 0 ? '继续添加文件' : '点击或拖拽文件在此区域可上传文件')
  return (
    <div>
      {!hideLabel && label && (
        <label className="block text-sm text-gray-700 mb-1.5">
          {required && <span className="text-red-500 mr-0.5">*</span>}
          {label}：
        </label>
      )}
      <div className="space-y-2">
        {files.length > 0 && (
          <div className="space-y-1.5">
            {files.map((fileName, idx) => (
              <div
                key={`${fileName}-${idx}`}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm"
              >
                <FileText className="w-4 h-4 text-[#1677FF] shrink-0" />
                <span className="flex-1 truncate text-gray-700" title={fileName}>{fileName}</span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    className="shrink-0 w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                    title="删除"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {!readOnly && (
          <button
            type="button"
            onClick={onAdd}
            className="w-full flex flex-col items-center justify-center gap-2 py-5 border-2 border-dashed border-gray-300 rounded-md bg-white hover:border-[#1677FF] hover:bg-blue-50/30 transition-colors group"
          >
            <Upload className="w-5 h-5 text-[#1677FF] group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-600 group-hover:text-[#1677FF]">{tip}</span>
          </button>
        )}
        {readOnly && files.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-400">无附件</div>
        )}
      </div>
    </div>
  )
}
