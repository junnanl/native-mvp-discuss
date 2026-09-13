import { useState, useMemo, useRef } from 'react'
import { Search, Calendar, X, RotateCcw } from 'lucide-react'
import { clsx } from 'clsx'
import WorkOrderProcess from './WorkOrderProcess'

// 工单类型
const workOrderTypes = [
  { value: '', label: '全部' },
  { value: 'province', label: '省级工单' },
  { value: 'city', label: '市级工单' },
  { value: 'district', label: '区县级工单' }
]

// 工单状态
const workOrderStatusOptions = [
  { value: '', label: '全部' },
  { value: 'processing', label: '进行中' },
  { value: 'abandoned', label: '废弃' },
  { value: 'finished', label: '已完成' }
]

// 模拟工单数据
const mockWorkOrders = Array.from({ length: 16 }).map((_, i) => ({
  id: `WO202605${String(i + 1).padStart(3, '0')}`,
  clueId: `SCL${(2026000 + i + 1).toString()}`,
  clueName: `共享线索项目${i + 1}`,
  name: `客户需求摸排工单${i + 1}`,
  type: workOrderTypes[1 + (i % 3)].value,
  city: ['合肥市', '芜湖市', '蚌埠市', '滁州市', '阜阳市'][i % 5],
  district: ['蜀山区', '包河区', '瑶海区', '镜湖区', '禹会区'][i % 5],
  manager: ['张凯', '李明', '王芳', '赵静', '陈强'][i % 5],
  status: ['processing', 'abandoned', 'finished'][i % 3],
  creator: ['王芳', '李明', '张凯', '赵静', '陈强'][i % 5],
  createTime: `2026-05-${String((i % 30) + 1).padStart(2, '0')} 10:${String((i * 7) % 60).padStart(2, '0')}`
}))

interface FilterForm {
  clueId: string
  clueName: string
  id: string
  name: string
  type: string
  status: string
  startDate: string
  endDate: string
}

const defaultFilter: FilterForm = {
  clueId: '',
  clueName: '',
  id: '',
  name: '',
  type: '',
  status: '',
  startDate: '',
  endDate: ''
}

export default function WorkOrderQuery() {
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [processItem, setProcessItem] = useState<typeof mockWorkOrders[0] | null>(null)
  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)

  // 根据筛选条件过滤
  const filteredList = useMemo(() => {
    return mockWorkOrders.filter(item => {
      if (submittedFilter.clueId && !item.clueId.includes(submittedFilter.clueId)) return false
      if (submittedFilter.clueName && !item.clueName.includes(submittedFilter.clueName)) return false
      if (submittedFilter.id && !item.id.includes(submittedFilter.id)) return false
      if (submittedFilter.name && !item.name.includes(submittedFilter.name)) return false
      if (submittedFilter.type && item.type !== submittedFilter.type) return false
      if (submittedFilter.status && item.status !== submittedFilter.status) return false
      if (submittedFilter.startDate) {
        const itemDate = item.createTime.split(' ')[0]
        if (itemDate < submittedFilter.startDate) return false
      }
      if (submittedFilter.endDate) {
        const itemDate = item.createTime.split(' ')[0]
        if (itemDate > submittedFilter.endDate) return false
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
    if (status === 'processing') {
      return <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-600">进行中</span>
    }
    if (status === 'abandoned') {
      return <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-500">废弃</span>
    }
    return <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-600">已完成</span>
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 筛选区 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">线索编码</label>
              <input
                type="text"
                value={filter.clueId}
                onChange={(e) => handleChange('clueId', e.target.value)}
                placeholder="请输入"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">线索名称</label>
              <input
                type="text"
                value={filter.clueName}
                onChange={(e) => handleChange('clueName', e.target.value)}
                placeholder="请输入"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">工单编码</label>
              <input
                type="text"
                value={filter.id}
                onChange={(e) => handleChange('id', e.target.value)}
                placeholder="请输入"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">工单名称</label>
              <input
                type="text"
                value={filter.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="请输入"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">工单类型</label>
              <select
                value={filter.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                {workOrderTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">工单状态</label>
              <select
                value={filter.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                {workOrderStatusOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">创建开始时间</label>
              <div className="relative">
                <input
                  ref={startDateRef}
                  type="date"
                  value={filter.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full pl-3 pr-9 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => openDatePicker(startDateRef)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="选择开始时间"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">创建结束时间</label>
              <div className="relative">
                <input
                  ref={endDateRef}
                  type="date"
                  value={filter.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="w-full pl-3 pr-9 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => openDatePicker(endDateRef)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="选择结束时间"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 查询按钮（右下角） */}
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
            <button
              onClick={handleReset}
              className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              重置
            </button>
            <button
              onClick={handleSearch}
              className="px-5 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              查询
            </button>
          </div>
        </div>

        {/* 表格区 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">线索编码</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">线索名称</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">工单编码</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">工单名称</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">工单类型</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">地市</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">区县</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">负责人</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">工单状态</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">创建人</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">创建时间</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap sticky right-0 bg-gray-50">操作</th>
                </tr>
              </thead>
              <tbody>
                {pagedList.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-10 text-gray-400 text-sm">暂无数据</td>
                  </tr>
                ) : (
                  pagedList.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.clueId}</td>
                      <td className="py-2.5 px-3 text-gray-800 whitespace-nowrap">{item.clueName}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.id}</td>
                      <td className="py-2.5 px-3 text-gray-800 whitespace-nowrap">{item.name}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">
                        {item.type === 'province' ? '省级工单' : item.type === 'city' ? '市级工单' : '区县级工单'}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.city}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.district}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.manager}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">{renderStatus(item.status)}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.creator}</td>
                      <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{item.createTime}</td>
                      <td className="py-2.5 px-3 sticky right-0 bg-white whitespace-nowrap">
                        <div className="flex items-center gap-3 text-blue-600">
                          {(item.status === 'abandoned' || item.status === 'finished') && (
                            <button
                              onClick={() => alert(`查看工单详情：${item.id}`)}
                              className="hover:text-blue-800 hover:underline"
                            >
                              详情
                            </button>
                          )}
                          {item.status === 'processing' && (
                            <>
                              <button
                                onClick={() => setProcessItem(item)}
                                className="hover:text-blue-800 hover:underline"
                              >
                                处理
                              </button>
                              <button
                                onClick={() => alert(`查看工单详情：${item.id}`)}
                                className="hover:text-blue-800 hover:underline"
                              >
                                详情
                              </button>
                            </>
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
          {totalCount > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                共 {totalCount} 条，第 {currentPage} / {totalPages} 页
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  首页
                </button>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1
                  if (totalPages > 7 && (p < currentPage - 1 || p > currentPage + 1)) {
                    if (p === 1 || p === totalPages) {
                      return <span key={p} className="px-1 text-xs text-gray-400">·</span>
                    }
                    return null
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className="px-2.5 py-1 text-xs border rounded"
                      style={{
                        backgroundColor: currentPage === p ? '#1677FF' : 'transparent',
                        color: currentPage === p ? 'white' : 'inherit',
                        borderColor: currentPage === p ? '#1677FF' : '#d1d5db'
                      }}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  末页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 工单处理页面 */}
      {processItem && (
        <WorkOrderProcess
          item={processItem}
          onClose={() => setProcessItem(null)}
        />
      )}
    </div>
  )
}
