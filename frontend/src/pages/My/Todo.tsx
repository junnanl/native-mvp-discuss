import { useState, useMemo } from 'react'
import { Search, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react'
import { todoList, todoTypeMap } from '@/data/mock'

interface FilterForm {
  title: string
  todoType: string
  status: string
  startDate: string
  endDate: string
}

const defaultFilter: FilterForm = {
  title: '',
  todoType: '',
  status: '',
  startDate: '',
  endDate: ''
}

const todoTypeOptions = [
  { value: '', label: '全部' },
  ...Object.entries(todoTypeMap).map(([v, l]) => ({ value: v, label: l }))
]

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'completed', label: '已完成' }
]

interface MyTodoProps {
  onNavigate?: (path: string) => void
}

export default function MyTodo({ onNavigate }: MyTodoProps) {
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [filterExpanded, setFilterExpanded] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const handleChange = <K extends keyof FilterForm>(key: K, value: FilterForm[K]) => {
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

  const filteredList = useMemo(() => {
    return todoList.filter(item => {
      if (item.type !== 'todo') return false
      if (submittedFilter.title && !item.title.includes(submittedFilter.title)) return false
      if (submittedFilter.todoType && item.category !== submittedFilter.todoType) return false
      if (submittedFilter.status === 'pending' && item.completed) return false
      if (submittedFilter.status === 'completed' && !item.completed) return false
      if (submittedFilter.startDate && item.receiveTime < submittedFilter.startDate) return false
      if (submittedFilter.endDate && item.receiveTime > `${submittedFilter.endDate} 23:59:59`) return false
      return true
    })
  }, [submittedFilter])

  const total = filteredList.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pagedList = filteredList.slice((page - 1) * pageSize, page * pageSize)

  // 售前支撑 → 跳转售前支撑处理页
  const handleProcess = (item: typeof todoList[number]) => {
    if (item.title === '回款证明提供') {
      onNavigate?.(`/finance/expense/payment-proof/${item.contractId || 'CT2026060001'}`)
    } else if (item.title === '项目类费用报账单提交') {
      onNavigate?.(`/finance/expense/bill-submit`)
    } else if (item.title === '项目类费用报账单审批') {
      onNavigate?.(`/finance/expense/bill-approval`)
    } else if (item.title === '预付款报账单提交') {
      onNavigate?.(`/finance/expense/cost-prepayment-bill-submit`)
    } else if (item.title === '预付款报账单审批') {
      onNavigate?.(`/finance/expense/cost-prepayment-bill-approval`)
    } else if (item.title === '付款报账单提交') {
      onNavigate?.(`/finance/payment/bill-submit`)
    } else if (item.title === '付款报账单审批') {
      onNavigate?.(`/finance/payment/bill-approval`)
    } else if (item.todoType === '售前支撑') {
      onNavigate?.(`/my/todo/presale-support/${item.id}`)
    } else if (item.todoType === '合同交底') {
      onNavigate?.(`/my/todo/contract-handover/${item.id}`)
    } else if (item.todoType === '项目开工') {
      onNavigate?.(`/my/todo/project-kickoff/${item.id}`)
    } else if (item.todoType === '项目启动与规划') {
      onNavigate?.(`/my/todo/project-plan/${item.id}`)
    } else if (item.todoType === '项目实施') {
      onNavigate?.(`/my/todo/project-implement/${item.id}`)
    } else if (item.todoType === '资金管理') {
      // 根据 fundAction 决定跳转目标
      if (item.fundAction === 'entry') {
        onNavigate?.(item.fundId ? `/finance/fund/approve-entry/${item.fundId}` : '/finance/fund/approve-entry')
      } else if (item.fundAction === 'approve') {
        onNavigate?.(item.fundId ? `/finance/fund/invest-approval/${item.fundId}` : '/finance/fund/invest-approval')
      } else if (item.fundAction === 'apply') {
        onNavigate?.('/finance/expense/fund-application')
      } else if (item.fundType === 'cost') {
        onNavigate?.(item.fundId ? `/finance/fund/cost-apply/${item.fundId}` : '/finance/fund/cost-apply')
      } else if (item.fundType === 'invest') {
        onNavigate?.(item.fundId ? `/finance/fund/invest-apply/${item.fundId}` : '/finance/fund/invest-apply')
      } else if (item.fundId) {
        onNavigate?.(`/finance/fund/detail/${item.fundId}`)
      } else {
        onNavigate?.('/finance/fund/ict-invest')
      }
    } else if (item.todoType === '合同管理') {
      if (item.title === '合同附件上传') {
        onNavigate?.(`/my/todo/contract-attachment/${item.id}`)
      } else if (item.title === '前向合同解析') {
        onNavigate?.(`/finance/contract/parse/${item.contractId}`)
      } else if (item.title === '前向合同解析审批') {
        onNavigate?.(`/finance/contract/parse-approval/${item.contractId}`)
      } else if (item.title === '后向合同解析') {
        onNavigate?.(`/finance/contract/backward-parse/${item.contractId}`)
      } else if (item.title === '后向合同解析审批') {
        onNavigate?.(`/finance/contract/backward-parse-approval/${item.contractId}`)
      } else if (item.title === '支出计划调整审批') {
        onNavigate?.(`/finance/contract/expense-plan-adjustment-approval/${item.contractId}`)
      } else if (item.title === '有收有支合同解析') {
        onNavigate?.(`/finance/contract/income-expense-parse/${item.contractId}`)
      } else if (item.title === '有收有支合同解析审批') {
        onNavigate?.(`/finance/contract/income-expense-parse-approval/${item.contractId}`)
      } else if (item.title === '收支计划调整审批') {
        onNavigate?.(`/finance/contract/income-expense-plan-adjustment-approval/${item.contractId}`)
      } else if (item.title === '后向合同内容相似度过高修改') {
        onNavigate?.(`/finance/contract/backward-similarity-fix/${item.contractId}`)
      } else if (item.title === '收入计划调整') {
        onNavigate?.(`/finance/contract/income-plan-change/${item.contractId}`)
      } else if (item.title === '收入计划调整确认与补充') {
        onNavigate?.(`/finance/contract/income-plan-change-confirm/${item.contractId}`)
      } else if (item.title === '收入计划调整审批') {
        onNavigate?.(`/finance/contract/order/forward/plan-change-approval/${item.contractId}`)
      } else if (item.title === '收入计划时间调整审批') {
        onNavigate?.(`/finance/contract/income-plan-time-adjust-approval/${item.contractId}`)
      } else if (item.title === '收入计划确认发起') {
        onNavigate?.(`/my/todo/income-confirm/create/${item.contractId}`)
      } else if (item.title === '结算金额变更') {
        onNavigate?.(`/finance/contract/settlement-amount-change/${item.contractId}`)
      } else {
        alert(`暂未实现「${item.title}」类型的处理页`)
      }
    } else {
      alert(`暂未实现「${item.todoType}」类型的处理页`)
    }
  }

  return (
    <div className="h-full p-3 overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto">
        {/* 筛选区 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <div
            className="flex items-center justify-between mb-3 cursor-pointer select-none"
            onClick={() => setFilterExpanded(v => !v)}
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">查询条件</h3>
              {filterExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFilterExpanded(v => !v) }}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              {filterExpanded ? '收起' : '展开'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">待办名称</label>
              <input
                type="text"
                value={filter.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="请输入"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">待办类型</label>
              <select
                value={filter.todoType}
                onChange={(e) => handleChange('todoType', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {todoTypeOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {filterExpanded && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">状态</label>
                  <select
                    value={filter.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {statusOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">接收开始时间</label>
                  <input
                    type="date"
                    value={filter.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">接收结束时间</label>
                  <input
                    type="date"
                    value={filter.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleReset}
              className="px-4 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              查询
            </button>
          </div>
        </div>

        {/* 表格区 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              待办列表
            </h3>
            <span className="text-xs text-gray-500">共 {total} 条</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">待办名称</th>
                <th className="px-4 py-2.5 text-left font-medium">所属项目</th>
                <th className="px-4 py-2.5 text-left font-medium">待办类型</th>
                <th className="px-4 py-2.5 text-left font-medium">接收时间</th>
                <th className="px-4 py-2.5 text-left font-medium">截止时间</th>
                <th className="px-4 py-2.5 text-left font-medium">状态</th>
                <th className="px-4 py-2.5 text-left font-medium w-24">操作</th>
              </tr>
            </thead>
            <tbody>
              {pagedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">暂无数据</td>
                </tr>
              ) : (
                pagedList.map(item => (
                  <tr key={item.id} className="border-t border-gray-100 hover:bg-blue-50/40">
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleProcess(item)}
                        className="text-blue-600 hover:underline text-left"
                      >
                        {item.title}
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">{item.project}</td>
                    <td className="px-4 py-2.5 text-gray-700">
                      <span className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
                        {item.todoType}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">{item.receiveTime}</td>
                    <td className="px-4 py-2.5 text-gray-700">{item.deadline}</td>
                    <td className="px-4 py-2.5">
                      {item.completed ? (
                        <span className="inline-block px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded">已完成</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 text-xs bg-orange-50 text-orange-600 rounded">待处理</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleProcess(item)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        处理
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {total > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-end gap-2 text-sm">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-2 py-1 text-gray-500 hover:text-blue-600 disabled:opacity-40"
              >
                上一页
              </button>
              <span className="text-gray-600">
                第 {page} / {totalPages} 页 · 共 {total} 条
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-2 py-1 text-gray-500 hover:text-blue-600 disabled:opacity-40"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
