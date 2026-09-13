import { useState, useMemo } from 'react'
import { Search, RotateCcw, Plus, Eye, PenLine } from 'lucide-react'
import { fundApplyList, getCostFundStatusText, getInvestFundStatusText, getFundStatusClass } from '@/data/mock'
import type { FundApplyItem } from '@/data/mock'

interface FundApplyListProps {
  onNavigate: (path: string) => void
}

type ListTab = 'invest' | 'cost'

interface FilterForm {
  projectCode: string
  globalCode: string
  projectName: string
  status: string
  applyUser: string
  createTimeStart: string
  createTimeEnd: string
}

const defaultFilter: FilterForm = {
  projectCode: '',
  globalCode: '',
  projectName: '',
  status: '',
  applyUser: '',
  createTimeStart: '',
  createTimeEnd: ''
}

const statusOptionsByType: Record<ListTab, { value: string; label: string }[]> = {
  invest: [
    { value: '', label: '全部状态' },
    { value: '01', label: '草稿' },
    { value: '02', label: '审批中' },
    { value: '03', label: '审批' },
    { value: '04', label: '审批完成' },
    { value: '05', label: '批复录入中' },
    { value: '06', label: '完成' },
    { value: '07', label: '作废' }
  ],
  cost: [
    { value: '', label: '全部状态' },
    { value: '01', label: '草稿' },
    { value: '02', label: '审批中' },
    { value: '03', label: '待生效' },
    { value: '04', label: '生效' },
    { value: '05', label: '调整中' },
    { value: '06', label: '失效' }
  ]
}

export default function ICTCostFundManage({ onNavigate }: FundApplyListProps) {
  const activeTab: ListTab = 'cost'
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filteredList = useMemo(() => {
    return fundApplyList.filter(item => {
      if (item.type !== activeTab) return false
      const projectCodeMatch = !submittedFilter.projectCode.trim() || item.projectCode.includes(submittedFilter.projectCode.trim())
      const globalCodeMatch = !submittedFilter.globalCode.trim() || item.globalCode.includes(submittedFilter.globalCode.trim())
      const projectNameMatch = !submittedFilter.projectName.trim() || item.projectName.includes(submittedFilter.projectName.trim())
      const statusMatch = !submittedFilter.status || item.status === submittedFilter.status
      const userMatch = !submittedFilter.applyUser.trim() || item.applyUser.includes(submittedFilter.applyUser.trim())
      const timeMatch = (!submittedFilter.createTimeStart || item.createTime >= submittedFilter.createTimeStart)
        && (!submittedFilter.createTimeEnd || item.createTime <= submittedFilter.createTimeEnd + ' 23:59:59')
      return projectCodeMatch && globalCodeMatch && projectNameMatch && statusMatch && userMatch && timeMatch
    })
  }, [submittedFilter, activeTab])

  const totalPages = Math.ceil(filteredList.length / pageSize)
  const pagedList = filteredList.slice((page - 1) * pageSize, page * pageSize)

  const handleChange = <K extends keyof FilterForm>(key: K, value: FilterForm[K]) => {
    setFilter(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    setSubmittedFilter(filter)
    setPage(1)
  }

  const handleReset = () => {
    setFilter(defaultFilter)
    setSubmittedFilter(defaultFilter)
    setPage(1)
  }

  const handleCreateCost = () => {
    onNavigate?.('/finance/fund/cost-apply')
  }

  const handleDetail = (item: FundApplyItem) => {
    onNavigate?.(`/finance/fund/cost-detail/${item.id}`)
  }

  const handleApproveEntry = (item: FundApplyItem) => {
    onNavigate?.(`/finance/fund/approve-entry/${item.id}`)
  }

  const canEnterApprove = (item: FundApplyItem) => {
    return item.type === 'invest' && (item.status === '04' || item.status === '05')
  }

  const getStatusText = (item: FundApplyItem) => {
    return item.type === 'cost' ? getCostFundStatusText(item.status) : getInvestFundStatusText(item.status)
  }

  return (
    <div className="flex-1 overflow-auto min-h-0 bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 查询条件 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">省内项目编码</label>
              <input
                type="text"
                value={filter.projectCode}
                onChange={(e) => handleChange('projectCode', e.target.value)}
                placeholder="请输入省内项目编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">全网项目编码</label>
              <input
                type="text"
                value={filter.globalCode}
                onChange={(e) => handleChange('globalCode', e.target.value)}
                placeholder="请输入全网项目编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">项目名称</label>
              <input
                type="text"
                value={filter.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                placeholder="请输入项目名称"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">项目状态</label>
              <select
                value={filter.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                {statusOptionsByType[activeTab].map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">创建人</label>
              <input
                type="text"
                value={filter.applyUser}
                onChange={(e) => handleChange('applyUser', e.target.value)}
                placeholder="请输入创建人"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">创建时间</label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="date"
                  value={filter.createTimeStart}
                  onChange={(e) => handleChange('createTimeStart', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                <span className="text-sm text-gray-400">至</span>
                <input
                  type="date"
                  value={filter.createTimeEnd}
                  onChange={(e) => handleChange('createTimeEnd', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              查询
            </button>
          </div>
        </div>

        {/* 列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">ICT项目成本立项工单列表</h3>
              <span className="text-xs text-gray-400">共 {filteredList.length} 条</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreateCost}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                成本类资金申请
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">工单编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">省内项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">申请金额（元）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目状态</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">创建人</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">创建时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  pagedList.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td
                        className="px-3 py-3 text-[#1677FF] hover:underline cursor-pointer whitespace-nowrap font-medium"
                        onClick={() => handleDetail(item)}
                      >
                        {item.code}
                      </td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.projectCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.globalCode}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.projectName}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{item.applyAmount}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${getFundStatusClass(item.status, item.type)}`}>
                          {getStatusText(item)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.applyUser}</td>
                      <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{item.createTime}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDetail(item)}
                            className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-[#1668DD] hover:underline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            详情
                          </button>
                          {canEnterApprove(item) && (
                            <button
                              type="button"
                              onClick={() => handleApproveEntry(item)}
                              className="inline-flex items-center gap-1 text-xs text-orange-600 hover:text-orange-700 hover:underline"
                            >
                              <PenLine className="w-3.5 h-3.5" />
                              批复录入
                            </button>
                          )}
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
                共 {filteredList.length} 条记录，第 {page}/{totalPages || 1} 页
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  首页
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">{page} / {totalPages || 1}</span>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages}
                  className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  末页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
