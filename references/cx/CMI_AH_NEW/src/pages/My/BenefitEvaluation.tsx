import { useState, useRef } from 'react'
import {
  Upload,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Check,
  FileCheck,
  X,
  ArrowLeft
} from 'lucide-react'
import { useModal } from '@/components/Modal'
import { parseBenefitEvaluationExcel, ParsedBenefitData } from '@/lib/benefitEvaluationParser'
import BenefitEvaluationModules from '@/components/BenefitEvaluationModules'

interface Props {
  onNavigate?: (path: string) => void
}

export default function BenefitEvaluation({ onNavigate }: Props) {
  const modal = useModal()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedBenefitData | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = () => {
    const templateUrl = '/效益评估模型.xlsx'
    const link = document.createElement('a')
    link.href = templateUrl
    link.download = '效益预评估模型.xlsx'
    link.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validExtensions = ['.xlsx', '.xls']
    const fileName = file.name.toLowerCase()
    const isValid = validExtensions.some(ext => fileName.endsWith(ext))
    if (!isValid) {
      setParseError('仅支持 .xlsx / .xls 格式文件')
      return
    }

    // 保存文件并立即解析
    setUploadedFile(file)
    setAnalyzed(false)
    setParsedData(null)
    setParseError(null)
    setIsAnalyzing(true)

    try {
      const data = await parseBenefitEvaluationExcel(file)
      // 同步到 sessionStorage，供 BenefitEvaluationModules 读取
      sessionStorage.setItem('benefitEvaluationParsedData', JSON.stringify(data))
      setParsedData(data)
      setAnalyzed(true)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : '文件解析失败，请检查文件格式是否正确')
      setAnalyzed(false)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearError = () => setParseError(null)

  const getParseStats = () => {
    if (!parsedData) return ''
    const stats = []
    if (parsedData.itIncome.length > 0) stats.push(`${parsedData.itIncome.length}条IT收入`)
    if (parsedData.ctIncome.length > 0) stats.push(`${parsedData.ctIncome.length}条CT收入`)
    if (parsedData.itCost.length > 0) stats.push(`${parsedData.itCost.length}条IT成本`)
    if (parsedData.ctCost.length > 0) stats.push(`${parsedData.ctCost.length}条CT成本`)
    if (parsedData.itInvestment.length > 0) stats.push(`${parsedData.itInvestment.length}条IT投资`)
    if (parsedData.ctInvestment.length > 0) stats.push(`${parsedData.ctInvestment.length}条CT投资`)
    if (parsedData.allocation.length > 0) stats.push(`${parsedData.allocation.length}条其他分摊`)
    return stats.length > 0 ? `已识别 ${stats.join('、')}数据` : '未识别到有效数据'
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部返回条 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('/my/todo')}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]"
          >
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">效益预评估</h2>
          </div>
        </div>

        {/* 附件上传解析区 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">附件解析</h3>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50/50">
            {parseError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <span className="text-sm text-red-600">{parseError}</span>
                <button onClick={clearError} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {!uploadedFile ? (
              <div
                className="flex flex-col items-center justify-center py-6 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-[#1677FF]" />
                </div>
                <div className="text-sm text-gray-700 mb-1">点击或拖拽文件到此处上传</div>
                <div className="text-xs text-gray-400">仅支持 .xlsx / .xls 格式（效益预评估模型）</div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{uploadedFile.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                        {analyzed && <span className="ml-2 text-green-600">✓ 已解析</span>}
                        {isAnalyzing && <span className="ml-2 text-blue-600">解析中...</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#1677FF] border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      下载模板
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null)
                        setAnalyzed(false)
                        setParsedData(null)
                        setParseError(null)
                        if (fileInputRef.current) fileInputRef.current.value = ''
                      }}
                      disabled={isAnalyzing}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      重新上传
                    </button>
                  </div>
                </div>

                {/* 解析中 Loading */}
                {isAnalyzing && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                    <span className="w-4 h-4 border-2 border-[#1677FF]/30 border-t-[#1677FF] rounded-full animate-spin" />
                    <div>
                      <div className="text-sm font-medium text-gray-800">正在解析附件...</div>
                      <div className="text-xs text-gray-500 mt-0.5">请稍候，系统正在识别文件中的收支计划数据</div>
                    </div>
                  </div>
                )}

                {/* 解析完成 */}
                {analyzed && parsedData && !isAnalyzing && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <FileCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">附件解析完成</div>
                        <div className="text-xs text-gray-500 mt-0.5">{getParseStats()}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!uploadedFile && (
              <div className="mt-4 flex items-center justify-center gap-3 pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-500">没有数据？先</span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#1677FF] border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  下载模板
                </button>
                <span className="text-xs text-gray-500">填写后上传解析</span>
              </div>
            )}
          </div>
        </div>

        {/* 9 个业务模块 - 解析完成后展示 */}
        {analyzed && (
          <>
            <BenefitEvaluationModules initialHasParsedData={analyzed} />

            {/* 底部按钮区 */}
            <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100 bg-white rounded-lg shadow-sm p-4">
              <button
                type="button"
                onClick={() => onNavigate?.('/project/pre-sale/benefit')}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  modal.alert('效益预评估提交成功！')
                }}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                提交
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
