import { useState, useMemo, useRef } from 'react'
import { Search, Calendar, RotateCcw, Plus, X } from 'lucide-react'
import { useModal } from '@/components/Modal'
import { contractList } from '@/data/mock'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'

interface ContractQueryProps {
  onNavigate?: (path: string) => void
}

// 合同类型
const contractTypes = [
  { value: '', label: '全部' },
  { value: 'income', label: '收入类' },
  { value: 'income-expense', label: '有收有支类' },
  { value: 'expense', label: '支出类' }
]

// 合同状态
const contractStatusOptions = [
  { value: '', label: '全部' },
  { value: 'executing', label: '履行中' },
  { value: 'revoked', label: '撤销' },
  { value: 'signed', label: '已签订' },
  { value: 'changing', label: '变更中' },
  { value: 'draft', label: '草稿' },
  { value: 'terminating', label: '解除中' },
  { value: 'terminated', label: '已解除' },
  { value: 'completed', label: '履行完毕' },
  { value: 'voiding', label: '作废中' },
  { value: 'voided', label: '已作废' },
  { value: 'reviewing', label: '审核中' },
  { value: 'rejected', label: '审核不通过' },
  { value: 'approved', label: '审核通过' }
]

const planChangeHandlerOptions = [
  '张三（合同管理组）',
  '李四（合同管理组）',
  '王五（合同管理组）',
  '赵六（合同管理组）',
  '钱七（合同管理组）',
  '孙八（合同管理组）',
  '周九（合同管理组）',
  '吴十（合同管理组）'
]

interface FilterForm {
  projectCode: string
  networkProjectCode: string
  projectName: string
  code: string
  name: string
  type: string
  status: string
  signStartDate: string
  signEndDate: string
}

const defaultFilter: FilterForm = {
  projectCode: '',
  networkProjectCode: '',
  projectName: '',
  code: '',
  name: '',
  type: '',
  status: '',
  signStartDate: '',
  signEndDate: ''
}

export default function ContractQuery({ onNavigate }: ContractQueryProps) {
  const modal = useModal()
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const signStartDateRef = useRef<HTMLInputElement>(null)
  const signEndDateRef = useRef<HTMLInputElement>(null)

  const [showPlanChangeModal, setShowPlanChangeModal] = useState(false)
  const [planChangeHandler, setPlanChangeHandler] = useState('')
  const [planChangeError, setPlanChangeError] = useState('')
  const [currentContractForPlanChange, setCurrentContractForPlanChange] = useState<typeof contractList[0] | null>(null)

  // 根据筛选条件过滤
  const filteredList = useMemo(() => {
    return contractList.filter(item => {
      if (submittedFilter.projectCode && !item.projectCode.includes(submittedFilter.projectCode)) return false
      if (submittedFilter.networkProjectCode && !item.networkProjectCode.includes(submittedFilter.networkProjectCode)) return false
      if (submittedFilter.projectName && !item.projectName.includes(submittedFilter.projectName)) return false
      if (submittedFilter.code && !item.code.includes(submittedFilter.code)) return false
      if (submittedFilter.name && !item.name.includes(submittedFilter.name)) return false
      if (submittedFilter.type && item.type !== submittedFilter.type) return false
      if (submittedFilter.status && item.status !== submittedFilter.status) return false
      if (submittedFilter.signStartDate) {
        if (item.signTime < submittedFilter.signStartDate) return false
      }
      if (submittedFilter.signEndDate) {
        if (item.signTime > submittedFilter.signEndDate) return false
      }
      return true
    })
  }, [submittedFilter])

  // 分页
  const totalCount = filteredList.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleChange = (key: keyof FilterForm, value: string) => {
    setFilter(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    setSubmittedFilter({ ...filter })
    setPage(1)
  }

  const handleReset = () => {
    setFilter(defaultFilter)
    setSubmittedFilter(defaultFilter)
    setPage(1)
  }

  const openDatePicker = (ref: React.RefObject<HTMLInputElement>) => {
    const input = ref.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    } else {
      input.focus()
    }
  }

  // 状态颜色和文字
  const renderStatus = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      executing: { label: '履行中', className: 'bg-blue-50 text-blue-600' },
      revoked: { label: '撤销', className: 'bg-gray-100 text-gray-500' },
      signed: { label: '已签订', className: 'bg-green-50 text-green-600' },
      changing: { label: '变更中', className: 'bg-orange-50 text-orange-600' },
      draft: { label: '草稿', className: 'bg-gray-100 text-gray-600' },
      terminating: { label: '解除中', className: 'bg-red-50 text-red-600' },
      terminated: { label: '已解除', className: 'bg-gray-100 text-gray-500' },
      completed: { label: '履行完毕', className: 'bg-green-50 text-green-600' },
      voiding: { label: '作废中', className: 'bg-red-50 text-red-600' },
      voided: { label: '已作废', className: 'bg-gray-100 text-gray-500' },
      reviewing: { label: '审核中', className: 'bg-blue-50 text-blue-600' },
      rejected: { label: '审核不通过', className: 'bg-red-50 text-red-600' },
      approved: { label: '审核通过', className: 'bg-green-50 text-green-600' }
    }
    const config = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-600' }
    return <span className={`px-2 py-0.5 rounded text-xs ${config.className}`}>{config.label}</span>
  }

  // 合同类型文字
  const renderType = (type: string) => {
    const typeMap: Record<string, string> = {
      income: '收入类',
      'income-expense': '有收有支类',
      expense: '支出类'
    }
    return typeMap[type] || type
  }

  // 操作按钮渲染
  const renderActions = (item: typeof contractList[0]) => {
    const actions: { label: string; action: () => void; show: boolean }[] = [
      {
        label: '详情',
        action: () => {
          if (item.type === 'income') {
            onNavigate?.(`/finance/contract/detail/income/${item.id}`)
          } else if (item.type === 'expense') {
            onNavigate?.(`/finance/contract/detail/expense/${item.id}`)
          } else {
            onNavigate?.(`/finance/contract/detail/income-expense/${item.id}`)
          }
        },
        show: true
      },
      {
        label: '合同作废',
        action: () => {
          modal.confirm('请确认是否作废该合同。', '确认作废').then(ok => {
            if (ok) {
              alert('合同已作废')
            }
          })
        },
        show: item.status === 'draft'
      },
      {
        label: '合同修改',
        action: () => onNavigate?.(`/finance/contract/draft/${item.id}`),
        show: item.status === 'draft'
      },
      {
        label: '收入计划调整',
        action: () => {
          if (item.type === 'income') {
            onNavigate?.(`/finance/contract/income-plan-change-init/${item.id}`)
          } else {
            setCurrentContractForPlanChange(item)
            setPlanChangeHandler('')
            setPlanChangeError('')
            setShowPlanChangeModal(true)
          }
        },
        // 支出类合同不展示收入计划调整（支出类履行中合同仅展示详情、支出计划调整）
        show: (item.status === 'executing' || item.status === 'approved') && item.hasEffectivePlan && item.type !== 'expense'
      },
      {
        label: '收入计划时间调整',
        action: () => {
          onNavigate?.(`/finance/contract/income-plan-time-adjust-init/${item.id}`)
        },
        show: item.type === 'income' && (item.status === 'executing' || item.status === 'approved') && item.hasEffectivePlan
      },
      {
        label: '支出计划调整',
        action: () => {
          onNavigate?.(`/finance/contract/expense-plan-adjustment/${item.id}`)
        },
        show: item.type === 'expense' && item.status === 'executing'
      },
      {
        label: '收支计划调整',
        action: () => {
          onNavigate?.(`/finance/contract/income-expense-plan-adjustment/${item.id}`)
        },
        show: item.type === 'income-expense' && item.status === 'executing'
      }
    ]

    return actions.filter(a => a.show)
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 筛选区 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">省内项目编码</label>
              <input
                type="text"
                value={filter.projectCode}
                onChange={(e) => handleChange('projectCode', e.target.value)}
                placeholder="请输入省内项目编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">全网项目编码</label>
              <input
                type="text"
                value={filter.networkProjectCode}
                onChange={(e) => handleChange('networkProjectCode', e.target.value)}
                placeholder="请输入全网项目编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">项目名称</label>
              <input
                type="text"
                value={filter.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                placeholder="请输入项目名称"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">合同编码</label>
              <input
                type="text"
                value={filter.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="请输入合同编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">合同名称</label>
              <input
                type="text"
                value={filter.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="请输入合同名称"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">合同类型</label>
              <select
                value={filter.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                {contractTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">合同状态</label>
              <select
                value={filter.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                {contractStatusOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">合同签约时间</label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="date"
                  value={filter.signStartDate}
                  onChange={(e) => handleChange('signStartDate', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                <span className="text-sm text-gray-500">至</span>
                <input
                  type="date"
                  value={filter.signEndDate}
                  onChange={(e) => handleChange('signEndDate', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={handleReset}
              className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              查询
            </button>
          </div>
        </div>

        {/* 表格区 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">合同管理列表</h3>
              <span className="text-xs text-gray-400">共 {filteredList.length} 条</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate?.('/finance/contract/purchase-supplement')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
              >
                <Plus className="w-4 h-4" />
                采购合同补录
              </button>
              <button
                onClick={() => onNavigate?.('/finance/contract/draft')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
              >
                <Plus className="w-4 h-4" />
                合同起草
              </button>
              <button
                onClick={() => onNavigate?.('/finance/contract/supplement-draft')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
              >
                <Plus className="w-4 h-4" />
                补充协议起草
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同流水号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">省内项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同类型</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同状态</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同签约时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">相对方</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">承办人</th>
                  <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap sticky right-0 bg-gray-50 z-10">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedList.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  pagedList.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{item.id}</td>
                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{item.code}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap max-w-[200px] truncate" title={item.name}>{item.name}</td>
                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{item.projectCode}</td>
                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{item.networkProjectCode}</td>
                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap max-w-[160px] truncate" title={item.projectName}>{item.projectName}</td>
                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{renderType(item.type)}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{renderStatus(item.status)}</td>
                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{item.signTime}</td>
                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap max-w-[150px] truncate" title={item.counterpartName}>{item.counterpartName}</td>
                      <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{item.creator}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap sticky right-0 bg-white z-10">
                        <div className="flex items-center justify-center gap-3 text-blue-600">
                          {renderActions(item).map((action, idx) => (
                            <button
                              key={idx}
                              onClick={action.action}
                              className="hover:text-blue-800 hover:underline whitespace-nowrap text-sm"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {filteredList.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                共 {filteredList.length} 条记录，第 {currentPage}/{totalPages || 1} 页
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 收入计划调整处理人选择弹窗 */}
        {showPlanChangeModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowPlanChangeModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-[500px] max-w-[92vw] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">选择收入计划调整处理人</h3>
                <button
                  type="button"
                  onClick={() => setShowPlanChangeModal(false)}
                  className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                  title="关闭"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-4">
                <div className="grid grid-cols-1 gap-x-6 gap-y-3">
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                      <span className="text-red-500 mr-0.5">*</span>
                      收入计划调整处理人
                    </label>
                    <div className="flex-1 min-w-0">
                      <SearchableSelect
                        value={planChangeHandler}
                        onChange={(v) => { setPlanChangeHandler(v); setPlanChangeError('') }}
                        options={planChangeHandlerOptions}
                        placeholder="请选择收入计划调整处理人"
                        dropdownZIndex={60}
                      />
                      {planChangeError && (
                        <p className="text-xs text-red-500 mt-1">{planChangeError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                <button
                  type="button"
                  onClick={() => setShowPlanChangeModal(false)}
                  className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!planChangeHandler) {
                      setPlanChangeError('请选择收入计划调整处理人')
                      return
                    }
                    alert(`收入计划调整申请已提交，处理人为：${planChangeHandler}`)
                    setShowPlanChangeModal(false)
                  }}
                  className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
