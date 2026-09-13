import { useState } from 'react'
import { Search, Check, RotateCcw, X, ChevronDown } from 'lucide-react'
import { useModal } from '@/components/Modal'

// ============================================================
// 类型定义
// ============================================================
interface ContractOption {
  id: string
  code: string
  name: string
  type: string
  projectCode: string
  secondCategory: string
  thirdCategory: string
  signSubject: string
  amountWithTax: string
  isFramework: string
}

// ============================================================
// 模拟合同列表数据
// ============================================================
const mockContractList: ContractOption[] = [
  { id: 'CT2026060001', code: 'CTR2026000001', name: '安徽移动IDC数据中心建设项目合同', type: '收入类', projectCode: 'PRJ20260001', secondCategory: 'IDC服务类', thirdCategory: '数据中心服务', signSubject: '中国移动通信集团安徽有限公司', amountWithTax: '5,000,000.00', isFramework: '否' },
  { id: 'CT2026060002', code: 'CTR2026000002', name: '合肥政务云平台服务合同', type: '有收有支类', projectCode: 'PRJ20260002', secondCategory: '云服务类', thirdCategory: '云计算服务', signSubject: '中国移动通信集团安徽有限公司', amountWithTax: '3,000,000.00', isFramework: '是' },
  { id: 'CT2026060003', code: 'CTR2026000003', name: '企业专线接入服务协议', type: '支出类', projectCode: 'PRJ20260003', secondCategory: '专线服务类', thirdCategory: '专线接入服务', signSubject: '中国移动通信集团安徽有限公司', amountWithTax: '1,500,000.00', isFramework: '否' },
  { id: 'CT2026060004', code: 'CTR2026000004', name: '淮南IDC机房运维服务采购合同', type: '支出类', projectCode: 'PRJ20260004', secondCategory: 'IDC服务类', thirdCategory: '数据中心服务', signSubject: '中国移动通信集团安徽有限公司', amountWithTax: '2,000,000.00', isFramework: '否' },
  { id: 'CT2026060005', code: 'CTR2026000005', name: '马鞍山智慧城市云平台建设运营合同', type: '有收有支类', projectCode: 'PRJ20260005', secondCategory: '云服务类', thirdCategory: '云计算服务', signSubject: '中国移动通信集团安徽有限公司', amountWithTax: '8,000,000.00', isFramework: '是' }
]

// ============================================================
// 选择合同弹窗
// ============================================================
function ContractPickerModal({
  visible,
  onClose,
  onSelect
}: {
  visible: boolean
  onClose: () => void
  onSelect: (contract: ContractOption) => void
}) {
  const [projectCode, setProjectCode] = useState('')
  const [contractName, setContractName] = useState('')
  const [contractCode, setContractCode] = useState('')
  const [selectedId, setSelectedId] = useState('')

  const filteredList = mockContractList.filter(c => {
    if (projectCode && !c.projectCode.toLowerCase().includes(projectCode.toLowerCase())) return false
    if (contractName && !c.name.toLowerCase().includes(contractName.toLowerCase())) return false
    if (contractCode && !c.code.toLowerCase().includes(contractCode.toLowerCase())) return false
    return true
  })

  if (!visible) return null

  const handleConfirm = () => {
    const selected = mockContractList.find(c => c.id === selectedId)
    if (selected) {
      onSelect(selected)
      onClose()
    } else {
      alert('请选择一个合同')
    }
  }

  const handleReset = () => {
    setProjectCode('')
    setContractName('')
    setContractCode('')
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full min-w-0 max-w-5xl max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">选择合同</h3>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 查询条件 */}
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="grid grid-cols-3 gap-x-4 gap-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 shrink-0 whitespace-nowrap">项目编码</label>
              <input
                type="text"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                placeholder="请输入项目编码"
                className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 shrink-0 whitespace-nowrap">合同名称</label>
              <input
                type="text"
                value={contractName}
                onChange={(e) => setContractName(e.target.value)}
                placeholder="请输入合同名称"
                className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 shrink-0 whitespace-nowrap">合同编码</label>
              <input
                type="text"
                value={contractCode}
                onChange={(e) => setContractCode(e.target.value)}
                placeholder="请输入合同编码"
                className="flex-1 min-w-0 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </button>
            <button
              type="button"
              className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              查询
            </button>
          </div>
        </div>

        {/* 合同列表 */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs sticky top-0">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium w-10">
                  <input
                    type="radio"
                    checked={false}
                    onChange={() => {}}
                    className="w-3.5 h-3.5"
                    disabled
                  />
                </th>
                <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">合同名称</th>
                <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">合同类型</th>
                <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">项目编码</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                    暂无匹配合同
                  </td>
                </tr>
              ) : (
                filteredList.map(c => (
                  <tr
                    key={c.id}
                    className={`border-t border-gray-100 cursor-pointer transition-colors ${
                      selectedId === c.id ? 'bg-blue-50/60' : 'hover:bg-gray-50/50'
                    }`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <td className="px-4 py-2.5">
                      <input
                        type="radio"
                        checked={selectedId === c.id}
                        onChange={() => setSelectedId(c.id)}
                        className="w-3.5 h-3.5"
                      />
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{c.code}</td>
                    <td className="px-4 py-2.5 text-gray-800 whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{c.type}</td>
                    <td className="px-4 py-2.5 text-gray-700 whitespace-nowrap">{c.projectCode}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-center gap-3 px-5 py-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            取消
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            确认
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 补充协议起草页面主组件
// ============================================================
interface SupplementAgreementDraftProps {
  onNavigate?: (path: string) => void
}

export default function SupplementAgreementDraft({ onNavigate }: SupplementAgreementDraftProps) {
  const modal = useModal()

  // 原合同信息
  const [selectedContract, setSelectedContract] = useState<ContractOption | null>(null)
  const [showContractPicker, setShowContractPicker] = useState(false)
  const [contractError, setContractError] = useState('')

  // 补充协议信息
  const [agreementName, setAgreementName] = useState('')
  const [agreementType, setAgreementType] = useState('') // 变更 / 解除
  const [isAdjustAmount, setIsAdjustAmount] = useState('') // 是 / 否
  const [adjustedAmount, setAdjustedAmount] = useState('')
  const [changeRemark, setChangeRemark] = useState('')

  const [agreementNameError, setAgreementNameError] = useState('')
  const [agreementTypeError, setAgreementTypeError] = useState('')
  const [isAdjustAmountError, setIsAdjustAmountError] = useState('')
  const [adjustedAmountError, setAdjustedAmountError] = useState('')
  const [changeRemarkError, setChangeRemarkError] = useState('')

  const handleAgreementNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.length <= 150) {
      setAgreementName(val)
      setAgreementNameError('')
    }
  }

  const handleAdjustedAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const regex = /^\d*(\.\d{0,2})?$/
    if (regex.test(val) || val === '') {
      setAdjustedAmount(val)
      setAdjustedAmountError('')
    }
  }

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length <= 250) {
      setChangeRemark(val)
      setChangeRemarkError('')
    }
  }

  const handleSubmit = () => {
    let valid = true

    if (!selectedContract) {
      setContractError('请选择合同')
      valid = false
    }
    if (!agreementName.trim()) {
      setAgreementNameError('请输入补充协议名称')
      valid = false
    }
    if (!agreementType) {
      setAgreementTypeError('请选择补充协议类型')
      valid = false
    }
    if (!isAdjustAmount) {
      setIsAdjustAmountError('请选择是否调整金额')
      valid = false
    }
    if (isAdjustAmount === '是' && !adjustedAmount.trim()) {
      setAdjustedAmountError('请输入调整后金额')
      valid = false
    }
    if (!changeRemark.trim()) {
      setChangeRemarkError('请输入变更说明')
      valid = false
    } else if (changeRemark.length > 250) {
      setChangeRemarkError('变更说明不能超过250字')
      valid = false
    }

    if (!valid) return

    modal.confirm('确定提交吗？', '提交').then(ok => {
      if (ok) {
        alert('提交成功')
        onNavigate?.('/finance/contract/query')
      }
    })
  }

  const handleCancel = () => {
    onNavigate?.('/finance/contract/query')
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full min-w-0">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* ========== 原合同信息模块 ========== */}
          <div className="mt-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">原合同信息</h3>
            </div>
            <div className="flex items-start gap-3 min-h-[36px]">
              <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                <span className="text-red-500 mr-0.5">*</span>
                合同名称
              </label>
              <div className="flex-1 min-w-0 max-w-lg">
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={selectedContract?.name || ''}
                    onClick={() => setShowContractPicker(true)}
                    placeholder="请选择合同"
                    className={
                      'w-full pl-3 pr-10 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 cursor-pointer bg-white ' +
                      (contractError ? 'border-red-500' : 'border-gray-300')
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowContractPicker(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="选择合同"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                {contractError && <p className="text-xs text-red-500 mt-1">{contractError}</p>}
              </div>
            </div>
          </div>

          {/* ========== 补充协议信息模块（选择合同后展示） ========== */}
          {selectedContract && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">补充协议信息</h3>
              </div>

              {/* 补充协议名称 - 单独一行 */}
              <div className="flex items-start gap-3 min-h-[36px] mb-3">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                  <span className="text-red-500 mr-0.5">*</span>
                  补充协议名称
                </label>
                <div className="flex-1 min-w-0 max-w-3xl">
                  <input
                    type="text"
                    value={agreementName}
                    onChange={handleAgreementNameChange}
                    placeholder="请输入补充协议名称，最多150字"
                    maxLength={150}
                    className={
                      'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white ' +
                      (agreementNameError ? 'border-red-500' : 'border-gray-300')
                    }
                  />
                  <div className="flex justify-between mt-1">
                    {agreementNameError && <span className="text-xs text-red-500">{agreementNameError}</span>}
                    <span className="text-xs text-gray-400 ml-auto">{agreementName.length}/150</span>
                  </div>
                </div>
              </div>

              {/* 两列字段 */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {/* 补充协议类型 */}
                <div className="flex items-start gap-3 min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    <span className="text-red-500 mr-0.5">*</span>
                    补充协议类型
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex rounded-md border border-gray-300 overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => { setAgreementType('变更'); setAgreementTypeError('') }}
                        className={
                          'px-8 py-2 text-sm transition-colors ' +
                          (agreementType === '变更' ? 'bg-[#1677FF] text-white' : 'bg-white text-gray-700 hover:bg-gray-50')
                        }
                      >
                        变更
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAgreementType('解除'); setAgreementTypeError('') }}
                        className={
                          'px-8 py-2 text-sm transition-colors border-l border-gray-300 ' +
                          (agreementType === '解除' ? 'bg-[#1677FF] text-white' : 'bg-white text-gray-700 hover:bg-gray-50')
                        }
                      >
                        解除
                      </button>
                    </div>
                    {agreementTypeError && <p className="text-xs text-red-500 mt-1">{agreementTypeError}</p>}
                  </div>
                </div>

                {/* 原合同编码 - 仅展示 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    原合同编码
                  </label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {selectedContract.code}
                  </div>
                </div>

                {/* 原合同金额（元，含税） - 仅展示 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    原合同金额（元，含税）
                  </label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {selectedContract.amountWithTax} 元
                  </div>
                </div>

                {/* 收支类型 - 仅展示 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    收支类型
                  </label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {selectedContract.type}
                  </div>
                </div>

                {/* 合同二级分类 - 仅展示 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    合同二级分类
                  </label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {selectedContract.secondCategory}
                  </div>
                </div>

                {/* 合同三级分类 - 仅展示 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    合同三级分类
                  </label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {selectedContract.thirdCategory}
                  </div>
                </div>

                {/* 签约主体 - 仅展示 */}
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    签约主体
                  </label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700">
                    {selectedContract.signSubject}
                  </div>
                </div>

                {/* 是否调整金额 */}
                <div className="flex items-start gap-3 min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    <span className="text-red-500 mr-0.5">*</span>
                    是否调整金额
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex rounded-md border border-gray-300 overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => { setIsAdjustAmount('是'); setIsAdjustAmountError('') }}
                        className={
                          'px-8 py-2 text-sm transition-colors ' +
                          (isAdjustAmount === '是' ? 'bg-[#1677FF] text-white' : 'bg-white text-gray-700 hover:bg-gray-50')
                        }
                      >
                        是
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsAdjustAmount('否'); setIsAdjustAmountError(''); setAdjustedAmount('') }}
                        className={
                          'px-8 py-2 text-sm transition-colors border-l border-gray-300 ' +
                          (isAdjustAmount === '否' ? 'bg-[#1677FF] text-white' : 'bg-white text-gray-700 hover:bg-gray-50')
                        }
                      >
                        否
                      </button>
                    </div>
                    {isAdjustAmountError && <p className="text-xs text-red-500 mt-1">{isAdjustAmountError}</p>}
                  </div>
                </div>

                {/* 调整后金额（含税）- 仅当"是"时展示 */}
                {isAdjustAmount === '是' && (
                  <div className="flex items-start gap-3 min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                      <span className="text-red-500 mr-0.5">*</span>
                      调整后金额（含税）
                    </label>
                    <div className="flex-1 min-w-0 max-w-xs">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={adjustedAmount}
                          onChange={handleAdjustedAmountChange}
                          placeholder="请输入金额"
                          className={
                            'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white ' +
                            (adjustedAmountError ? 'border-red-500' : 'border-gray-300')
                          }
                        />
                        <span className="text-sm text-gray-700 shrink-0">元</span>
                      </div>
                      {adjustedAmountError && <p className="text-xs text-red-500 mt-1">{adjustedAmountError}</p>}
                    </div>
                  </div>
                )}
              </div>

              {/* 变更说明 - 单独一行 */}
              <div className="mt-3">
                <div className="flex items-start gap-3">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    <span className="text-red-500 mr-0.5">*</span>
                    变更说明
                  </label>
                  <div className="flex-1 min-w-0 max-w-3xl">
                    <textarea
                      value={changeRemark}
                      onChange={handleRemarkChange}
                      placeholder="请输入变更说明，最多250字"
                      rows={3}
                      maxLength={250}
                      className={
                        'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none ' +
                        (changeRemarkError ? 'border-red-500' : 'border-gray-300')
                      }
                    />
                    <div className="flex justify-between mt-1">
                      {changeRemarkError && <span className="text-xs text-red-500">{changeRemarkError}</span>}
                      <span className="text-xs text-gray-400 ml-auto">{changeRemark.length}/250</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== 底部按钮 ========== */}
          <div className="flex justify-center gap-3 mt-8 pt-4 border-t border-gray-100">
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

      {/* 选择合同弹窗 */}
      <ContractPickerModal
        visible={showContractPicker}
        onClose={() => setShowContractPicker(false)}
        onSelect={(c) => {
          setSelectedContract(c)
          setContractError('')
        }}
      />
    </div>
  )
}
