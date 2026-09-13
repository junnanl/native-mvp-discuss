import { ArrowLeft, RotateCcw, Check } from 'lucide-react'
import { useModal } from '@/components/Modal'
import BenefitEvaluationModules from '@/components/BenefitEvaluationModules'

interface Props {
  onNavigate?: (path: string) => void
}

export default function BenefitEvaluationOnline({ onNavigate }: Props) {
  const modal = useModal()

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部标题栏 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.('/project/pre-sale/benefit')}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="w-1 h-5 bg-[#1677FF] rounded-sm" />
          <h2 className="text-base font-semibold text-gray-800">在线填写效益预评估</h2>
        </div>

        {/* 9 个业务模块 */}
        <BenefitEvaluationModules />

        {/* 底部操作区 */}
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
              modal.alert('效益预评估保存成功！')
            }}
            className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            保存提交
          </button>
        </div>
      </div>
    </div>
  )
}
