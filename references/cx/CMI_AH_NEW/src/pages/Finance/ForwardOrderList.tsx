import { useState, useMemo } from 'react'
import { Search, RotateCcw } from 'lucide-react'

interface ForwardOrderListProps {
  onNavigate?: (path: string) => void
}

interface ForwardOrderItem {
  id: string
  orderCode: string
  projectCode: string
  projectName: string
  contractCode: string
  contractName: string
  amountExcludingTax: string
  amountIncludingTax: string
  status: string
  customerManager: string
  orderOwner: string
  createTime: string
}

const orderStatusOptions = [
  { value: '', label: '全部' },
  { value: 'pending-parse', label: '待解析' },
  { value: 'pending-approval', label: '待审批' },
  { value: 'approving', label: '审批中' },
  { value: 'approval-rejected', label: '审批不通过' },
  { value: 'approval-passed', label: '审批通过' }
]

const mockForwardOrders: ForwardOrderItem[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `FO-${String(i + 1).padStart(6, '0')}`,
  orderCode: `FO-2026-${String(i + 1).padStart(6, '0')}`,
  projectCode: `PRJ-2026-${String(i + 1).padStart(4, '0')}`,
  projectName: ['合肥市第一人民医院智慧医疗项目', '芜湖市政务服务中心数字政府项目', '蚌埠市教育局智慧教育项目', '合肥市轨道交通集团智慧交通项目', '安徽省公安厅智慧城市项目'][i % 5],
  contractCode: `CTR-2026-${String(i + 1).padStart(6, '0')}`,
  contractName: ['智慧医疗系统服务合同', '数字政府平台运营合同', '智慧教育云平台合同', '智慧交通运维合同', '智慧城市服务合同'][i % 5],
  amountExcludingTax: ((i + 1) * 125000).toFixed(2),
  amountIncludingTax: ((i + 1) * 125000 * 1.06).toFixed(2),
  status: ['pending-parse', 'pending-approval', 'approving', 'approval-rejected', 'approval-passed'][i % 5],
  customerManager: ['王芳', '李明', '张凯', '赵静', '陈强'][i % 5],
  orderOwner: ['刘伟', '孙磊', '周杰', '吴敏', '郑昊'][i % 5],
  createTime: `2026-06-${String((i % 28) + 1).padStart(2, '0')} ${String((i * 5) % 24).padStart(2, '0')}:${String((i * 11) % 60).padStart(2, '0')}:00`
}))

interface FilterForm {
  orderCode: string
  projectCode: string
  projectName: string
  contractCode: string
  contractName: string
  status: string
}

const defaultFilter: FilterForm = {
  orderCode: '',
  projectCode: '',
  projectName: '',
  contractCode: '',
  contractName: '',
  status: ''
}

export default function ForwardOrderList({ onNavigate }: ForwardOrderListProps) {
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filteredOrders = useMemo(() => {
    return mockForwardOrders.filter(item => {
      const orderCodeMatch = !submittedFilter.orderCode.trim() || item.orderCode.includes(submittedFilter.orderCode.trim())
      const projectCodeMatch = !submittedFilter.projectCode.trim() || item.projectCode.includes(submittedFilter.projectCode.trim())
      const projectNameMatch = !submittedFilter.projectName.trim() || item.projectName.includes(submittedFilter.projectName.trim())
      const contractCodeMatch = !submittedFilter.contractCode.trim() || item.contractCode.includes(submittedFilter.contractCode.trim())
      const contractNameMatch = !submittedFilter.contractName.trim() || item.contractName.includes(submittedFilter.contractName.trim())
      const statusMatch = !submittedFilter.status || item.status === submittedFilter.status
      return orderCodeMatch && projectCodeMatch && projectNameMatch && contractCodeMatch && contractNameMatch && statusMatch
    })
  }, [submittedFilter])

  const totalPages = Math.ceil(filteredOrders.length / pageSize)
  const pagedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize)

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

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      'pending-parse': '待解析',
      'pending-approval': '待审批',
      'approving': '审批中',
      'approval-rejected': '审批不通过',
      'approval-passed': '审批通过'
    }
    return map[status] || status
  }

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      'pending-parse': 'text-orange-600 bg-orange-50',
      'pending-approval': 'text-yellow-600 bg-yellow-50',
      'approving': 'text-blue-600 bg-blue-50',
      'approval-rejected': 'text-red-600 bg-red-50',
      'approval-passed': 'text-green-600 bg-green-50'
    }
    return map[status] || 'text-gray-500 bg-gray-100'
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 查询条件 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">订单编号</label>
              <input
                type="text"
                value={filter.orderCode}
                onChange={(e) => handleChange('orderCode', e.target.value)}
                placeholder="请输入订单编号"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">项目编码</label>
              <input
                type="text"
                value={filter.projectCode}
                onChange={(e) => handleChange('projectCode', e.target.value)}
                placeholder="请输入项目编码"
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
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">合同编码</label>
              <input
                type="text"
                value={filter.contractCode}
                onChange={(e) => handleChange('contractCode', e.target.value)}
                placeholder="请输入合同编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">合同名称</label>
              <input
                type="text"
                value={filter.contractName}
                onChange={(e) => handleChange('contractName', e.target.value)}
                placeholder="请输入合同名称"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">订单状态</label>
              <select
                value={filter.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                {orderStatusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
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

        {/* 前向订单列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">前向订单列表</h3>
              <span className="text-xs text-gray-400">共 {filteredOrders.length} 条</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订单编号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同名称</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">订单金额（元，不含税）</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">订单金额（元，含税）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订单状态</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">客户经理</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订单负责人</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">创建时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap sticky right-0 bg-gray-50 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.05)]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  pagedOrders.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap font-medium">{item.orderCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.projectCode}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.projectName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.contractCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.contractName}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{item.amountExcludingTax}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{item.amountIncludingTax}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${getStatusClass(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.customerManager}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.orderOwner}</td>
                      <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{item.createTime}</td>
                      <td className="px-3 py-3 whitespace-nowrap sticky right-0 bg-white hover:bg-gray-50 shadow-[-4px_0_4px_-2px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3">
                          <button className="text-[#1677FF] hover:underline text-xs">详情</button>
                          {item.status === 'approval-passed' && (
                            <button
                              className="text-[#1677FF] hover:underline text-xs"
                              onClick={() => onNavigate?.(`/finance/contract/order/forward/plan-change/${item.id}`)}
                            >
                              计划变更
                            </button>
                          )}
                          {item.status === 'pending-parse' && (
                            <button
                              className="text-[#1677FF] hover:underline text-xs"
                              onClick={() => onNavigate?.(`/finance/contract/order/forward/parse/${item.id}`)}
                            >
                              订单解析
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
          {filteredOrders.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-500">
                共 {filteredOrders.length} 条记录，第 {page}/{totalPages || 1} 页
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
