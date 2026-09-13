import { useState } from 'react'
import { clsx } from 'clsx'
import FileUpload from '@/components/FileUpload'

// 交接清单配置（key 保持稳定，label 可改）
export interface HandoverItem {
  key: string
  label: string
  required: boolean
  defaultChecked: boolean
  defaultFiles: string[]
}

export const handoverItems: HandoverItem[] = [
  { key: 'requirement', label: '需求/招标文件', required: true, defaultChecked: true, defaultFiles: ['智慧医院信息化需求文件v2.1.docx', '智慧医院信息化招标文件v1.0.pdf'] },
  { key: 'solution', label: '解决方案', required: true, defaultChecked: true, defaultFiles: ['智慧医院整体解决方案v1.0.docx'] },
  { key: 'decision', label: '决策文件', required: true, defaultChecked: true, defaultFiles: [] },
  { key: 'review', label: '甄选评审报告', required: false, defaultChecked: false, defaultFiles: [] },
  { key: 'tender', label: '投标文件', required: true, defaultChecked: true, defaultFiles: ['智慧医院信息化投标文件v1.0.pdf'] },
  { key: 'bid-notice', label: '中标通知书', required: true, defaultChecked: true, defaultFiles: ['合肥市第一人民医院中标通知书.pdf'] },
  { key: 'income-contract', label: '收入合同', required: true, defaultChecked: true, defaultFiles: [] },
  { key: 'risk', label: '交底风险评估', required: false, defaultChecked: false, defaultFiles: [] }
]

// 售中项目定级选项
const saleLevelOptions = [
  { value: 'Z_S', label: 'Z_S' },
  { value: 'Z_A', label: 'Z_A' },
  { value: 'Z_B', label: 'Z_B' },
  { value: 'Z_C', label: 'Z_C' },
  { value: 'Z_D', label: 'Z_D' }
]

// 小标题组件（蓝色短竖线 + text-sm font-semibold）
function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
      <h4 className="text-sm font-semibold text-gray-800">{children}</h4>
    </div>
  )
}

// 合同交底表单（合同交底处理页 + 售前支撑处理页的"合同交底"Tab 复用）
export default function HandoverForm() {
  const [deliveryDate, setDeliveryDate] = useState('')
  const [description, setDescription] = useState('')
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(
    Object.fromEntries(handoverItems.map(i => [i.key, i.defaultChecked]))
  )
  // 交接清单附件：每个 key 对应一个文件数组
  const [files, setFiles] = useState<Record<string, string[]>>(
    Object.fromEntries(handoverItems.map(i => [i.key, i.defaultFiles]))
  )
  // 售中定级
  const [saleLevel, setSaleLevel] = useState('Z_A')
  const [saleFiles, setSaleFiles] = useState<string[]>([])

  const toggleItem = (key: string) => {
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleAddFile = (key: string) => {
    // 演示：追加一个示例文件
    const label = handoverItems.find(i => i.key === key)?.label || '文件'
    setFiles(prev => ({
      ...prev,
      [key]: [...(prev[key] || []), `${label}附件${(prev[key]?.length || 0) + 1}.docx`]
    }))
  }

  const handleRemoveFile = (key: string, index: number) => {
    setFiles(prev => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index)
    }))
  }

  const handleAddSaleFile = () => {
    setSaleFiles(prev => [...prev, `售中定级附件${prev.length + 1}.pdf`])
  }

  const handleRemoveSaleFile = (index: number) => {
    setSaleFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 space-y-5">
      {/* ========== 交底信息 ========== */}
      <div className="space-y-4">
        <SubTitle>交底信息</SubTitle>

        {/* 交底类型 / 约定交付时间 */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div className="flex items-center min-h-[36px]">
            <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
              <span className="text-red-500 mr-0.5">*</span>交底类型
            </label>
            <div className="flex-1 min-w-0 text-sm text-gray-700">合同交底</div>
          </div>
          <div className="flex items-center min-h-[36px]">
            <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
              <span className="text-red-500 mr-0.5">*</span>约定交付时间
            </label>
            <div className="flex-1 min-w-0">
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* 交接描述 */}
        <div className="flex items-start">
          <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2 pt-2">
            <span className="text-red-500 mr-0.5">*</span>交接描述
          </label>
          <div className="flex-1 min-w-0">
            <textarea
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 250) {
                  setDescription(e.target.value)
                }
              }}
              placeholder="请输入，最多250字"
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
            />
            <div className="text-xs text-gray-400 text-right mt-1">{description.length}/250</div>
          </div>
        </div>

        {/* 交接清单 */}
        <div className="flex items-start">
          <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2 pt-2">
            <span className="text-red-500 mr-0.5">*</span>交接清单
          </label>
          <div className="flex-1 min-w-0 flex flex-wrap gap-x-5 gap-y-2 pt-1.5">
            {handoverItems.map(item => (
              <label
                key={item.key}
                title={item.required ? '必选附件，不可取消' : undefined}
                className={clsx(
                  'inline-flex items-center gap-1.5 text-sm select-none',
                  item.required ? 'cursor-not-allowed' : 'cursor-pointer'
                )}
              >
                <input
                  type="checkbox"
                  checked={!!checkedItems[item.key]}
                  disabled={item.required}
                  onChange={() => toggleItem(item.key)}
                  className={clsx(
                    'w-3.5 h-3.5 accent-[#1677FF]',
                    item.required ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
                  )}
                />
                <span className={clsx(
                  checkedItems[item.key] ? 'text-[#1677FF]' : 'text-gray-600',
                  item.required && 'after:content-["*"] after:text-red-500 after:ml-0.5'
                )}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* 勾选项的附件上传区（多文件） */}
        <div className="space-y-3">
          {handoverItems.filter(item => checkedItems[item.key]).map(item => (
            <div key={item.key} className="flex items-start">
              <div className="w-32 shrink-0" />
              <div className="flex-1 min-w-0">
                <FileUpload
                  label={item.label}
                  required={item.required}
                  files={files[item.key] || []}
                  onAdd={() => handleAddFile(item.key)}
                  onRemove={(idx) => handleRemoveFile(item.key, idx)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 下一步环节（只读） */}
        <div className="flex items-center min-h-[36px]">
          <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">下一步环节</label>
          <div className="flex-1 min-w-0">
            <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
              合同交底审核
            </div>
          </div>
        </div>
      </div>

      {/* ========== 售中定级信息 ========== */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <SubTitle>售中定级信息</SubTitle>

        {/* 售中项目定级（单选） */}
        <div className="flex items-center min-h-[36px]">
          <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
            <span className="text-red-500 mr-0.5">*</span>售中项目定级
          </label>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-5">
              {saleLevelOptions.map(opt => (
                <label
                  key={opt.value}
                  className="inline-flex items-center gap-1.5 cursor-pointer text-sm select-none"
                >
                  <input
                    type="radio"
                    name="saleLevel"
                    value={opt.value}
                    checked={saleLevel === opt.value}
                    onChange={() => setSaleLevel(opt.value)}
                    className="w-3.5 h-3.5 accent-[#1677FF] cursor-pointer"
                  />
                  <span className={clsx(saleLevel === opt.value ? 'text-[#1677FF]' : 'text-gray-600')}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 售中定级附件（多文件） */}
        <div className="flex items-start">
          <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2 pt-2">
            售中定级附件
          </label>
          <div className="flex-1 min-w-0">
            <FileUpload
              label="售中定级附件"
              hideLabel
              files={saleFiles}
              onAdd={handleAddSaleFile}
              onRemove={handleRemoveSaleFile}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
