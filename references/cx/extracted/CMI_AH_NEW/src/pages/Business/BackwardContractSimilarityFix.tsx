import { useState } from 'react'
import { clsx } from 'clsx'
import {
  ArrowLeft,
  Check,
  RotateCcw,
  AlertTriangle
} from 'lucide-react'
import { getContractInfo } from '@/data/mock'
import { ProjectInfoCard } from '@/components/ContractInfoCard'
import FileUpload from '@/components/FileUpload'

// 合同相似度 mock 数据
const mockSimilarityData = [
  {
    id: 'sim-1',
    forwardContractCode: 'CTR2026000001',
    forwardContractName: '芜湖智慧教育云平台服务合同',
    backwardContractName: '蚌埠数据中心网络设备采购合同',
    similarity: '85%',
    compareResult: '不通过'
  },
  {
    id: 'sim-2',
    forwardContractCode: 'CTR2026000003',
    forwardContractName: '合肥政务云平台服务合同',
    backwardContractName: '蚌埠数据中心网络设备采购合同',
    similarity: '78%',
    compareResult: '不通过'
  },
  {
    id: 'sim-3',
    forwardContractCode: 'CTR2026000005',
    forwardContractName: '安徽省公安厅智慧城市项目合同',
    backwardContractName: '蚌埠数据中心网络设备采购合同',
    similarity: '65%',
    compareResult: '通过'
  }
]

// 区块标题
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-5 first:mt-0">
      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
      <h3 className="text-sm font-semibold text-gray-800">{children}</h3>
    </div>
  )
}

// 字段行
function FieldRow({
  label,
  required,
  error,
  colSpan,
  fullWidth,
  children
}: {
  label: string
  required?: boolean
  error?: string
  colSpan?: 1 | 2
  fullWidth?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <div className="flex items-start gap-3 min-h-[36px]">
        <label className="w-24 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
          {required && <span className="text-red-500 mr-0.5">*</span>}
          {label}
        </label>
        <div className={clsx('flex-1 min-w-0', !fullWidth && 'max-w-md')}>
          {children}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}

interface FormData {
  contractType: 'income' | 'income-expense' | 'expense'
  contractName: string
  isFramework: 'yes' | 'no'
  frameworkRelationType: 'order' | 'contract'
}

interface BackwardContractSimilarityFixProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

export default function BackwardContractSimilarityFix({ onNavigate, contractId }: BackwardContractSimilarityFixProps) {
  const contractInfo = getContractInfo(contractId || 'CT2026060007')

  // 合同信息表单（复制自合同起草页面，独立维护，合同类型不可变更）
  const [form, setForm] = useState<FormData>({
    contractType: contractInfo.typeKey,
    contractName: contractInfo.name,
    isFramework: contractInfo.isFramework === '是' ? 'yes' : 'no',
    frameworkRelationType: contractInfo.frameworkRelationType === '关联结算合同' ? 'contract' : 'order'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contractFiles, setContractFiles] = useState<string[]>(['合同草稿_2026060007.docx'])

  const handleChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  // 合同草稿文件上传
  const handleAddContractFile = () => {
    const fileName = `合同草稿_${Date.now()}.docx`
    setContractFiles(prev => [...prev, fileName])
  }

  const handleRemoveContractFile = (index: number) => {
    setContractFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleCancel = () => {
    onNavigate?.('/finance/contract/backward-parse/' + (contractId || 'CT2026060007'))
  }

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    if (!form.contractName.trim()) {
      newErrors.contractName = '请输入合同名称'
    }
    if (form.contractType !== 'income' && contractFiles.length === 0) {
      newErrors.contractFiles = '请上传合同草稿文件'
    }
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    alert('后向合同内容修改提交成功！')
    onNavigate?.('/finance/contract/backward-parse/' + (contractId || 'CT2026060007'))
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部标题栏 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">后向合同内容相似度过高修改</h2>
          </div>
        </div>

        {/* 1. 项目信息（使用后向合同解析页面公共组件） */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 合同信息（复制自合同起草页面，合同类型不可变更） */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <SectionTitle>合同信息</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">

            {/* 合同类型 - 不可变更，只读展示 */}
            <FieldRow label="合同类型" required>
              <div className="flex items-center gap-6 whitespace-nowrap pt-2">
                {[
                  { value: 'income', label: '收入类' },
                  { value: 'income-expense', label: '有收有支类' },
                  { value: 'expense', label: '支出类' }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-not-allowed opacity-60">
                    <input
                      type="radio"
                      name="contractType"
                      value={opt.value}
                      checked={form.contractType === opt.value}
                      disabled
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </FieldRow>

            <FieldRow label="合同名称" required error={errors.contractName} fullWidth>
              <input
                type="text"
                value={form.contractName}
                onChange={(e) => handleChange('contractName', e.target.value)}
                placeholder="请输入合同名称"
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                  errors.contractName ? 'border-red-500' : 'border-gray-300'
                )}
              />
            </FieldRow>

            <FieldRow label="是否框架合同" required>
              <div className="flex items-center gap-6 whitespace-nowrap pt-2">
                {[
                  { value: 'yes', label: '是' },
                  { value: 'no', label: '否' }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isFramework"
                      value={opt.value}
                      checked={form.isFramework === opt.value}
                      onChange={() => {
                        const val = opt.value as FormData['isFramework']
                        setForm(prev => ({
                          ...prev,
                          isFramework: val,
                          frameworkRelationType: val === 'yes' ? 'order' : prev.frameworkRelationType
                        }))
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </FieldRow>

            {form.isFramework === 'yes' && (
              <FieldRow label="关联类型" required>
                <div className="flex items-center gap-6 whitespace-nowrap pt-2">
                  {[
                    { value: 'order', label: '关联订单' },
                    { value: 'contract', label: '关联结算合同' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="frameworkRelationType"
                        value={opt.value}
                        checked={form.frameworkRelationType === opt.value}
                        onChange={() => handleChange('frameworkRelationType', opt.value as FormData['frameworkRelationType'])}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </FieldRow>
            )}

            {/* 合同草稿：收入类合同不展示 */}
            {form.contractType !== 'income' && (
              <FieldRow label="合同草稿" required error={errors.contractFiles} colSpan={2} fullWidth>
                <FileUpload
                  hideLabel
                  files={contractFiles}
                  onAdd={handleAddContractFile}
                  onRemove={handleRemoveContractFile}
                  uploadText={contractFiles.length > 0 ? '继续添加合同草稿文件' : '点击或拖拽上传合同草稿文件'}
                />
              </FieldRow>
            )}

          </div>
        </div>

        {/* 3. 合同相似度信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">合同相似度信息</h3>
            <span className="text-xs text-gray-400 ml-1">共 {mockSimilarityData.length} 条</span>
          </div>
          <div className="p-4 space-y-4">
            {/* 温馨提示 */}
            <div className="flex items-start gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-md">
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-sm text-orange-700">
                根据集团审计规则，前后向合同内容相似度高于70%，则该项目会判定为过单项目，请修改后向合同内容降低相似度！
              </p>
            </div>

            {/* 相似度表格 */}
            <div className="overflow-x-auto border border-gray-100 rounded-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-xs">
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">前向合同编码</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">前向合同名称</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">后向合同名称</th>
                    <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">相似度</th>
                    <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">对比结果</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSimilarityData.map((item) => (
                    <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.forwardContractCode}</td>
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.forwardContractName}</td>
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.backwardContractName}</td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={clsx(
                          'inline-flex px-2 py-0.5 text-xs rounded-full font-medium',
                          parseFloat(item.similarity) > 70
                            ? 'text-red-600 bg-red-50'
                            : 'text-green-600 bg-green-50'
                        )}>{item.similarity}</span>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <span className={clsx(
                          'inline-flex px-2 py-0.5 text-xs rounded-full',
                          item.compareResult === '不通过'
                            ? 'text-red-600 bg-red-50'
                            : 'text-green-600 bg-green-50'
                        )}>{item.compareResult}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
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
