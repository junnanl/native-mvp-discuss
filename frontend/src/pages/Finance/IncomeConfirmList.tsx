import { useState, useMemo } from 'react'
import { Search, RotateCcw, Plus, Eye } from 'lucide-react'

interface IncomeConfirmListProps {
  onNavigate?: (path: string) => void
}

interface ConfirmItem {
  id: string
  projectName: string
  provinceProjectCode: string
  nationalProjectCode: string
  contractCode: string
  customerManager: string
  solutionManager: string
  productName: string
  taxRate: string
  tariffName: string
  planOrderAmount: string
  planOrderDate: string
  orderStatus: string
}

const orderStatusOptions = [
  { value: '', label: '全部' },
  { value: 'pending_order', label: '待订购' },
  { value: 'ordering', label: '订购中' },
  { value: 'ordered', label: '已订购' }
]

const projectNames = [
  '合肥市第一人民医院智慧医疗项目',
  '芜湖市政务服务中心数字政府项目',
  '蚌埠市教育局智慧教育项目',
  '合肥市轨道交通集团智慧交通项目',
  '安徽省公安厅智慧城市项目',
  '安庆市智慧园区建设项目',
  '黄山市文旅数字化项目'
]

const productNames = ['维保费', '设备费', '平台使用费', '系统集成费', '带宽费']
const tariffNames = ['[849]ICT维保服务费', '[956]软件开发服务', '[780]平台服务费', '[1205]系统集成服务', '[1372]宽带费']
const taxRates = ['6%', '13%', '6%', '9%', '6%']
const customerManagers = ['王芳', '李明', '张凯', '赵静', '陈强', '刘洋', '周杰']
const solutionManagers = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九']

const mockConfirmList: ConfirmItem[] = Array.from({ length: 24 }).map((_, i) => {
  const statusList = ['pending_order', 'pending_order', 'ordering', 'ordering', 'ordered', 'ordered']
  const orderStatus = statusList[i % statusList.length]

  return {
    id: `confirm-${i + 1}`,
    projectName: projectNames[i % projectNames.length],
    provinceProjectCode: `PRJ-SD-${String(i + 1).padStart(4, '0')}`,
    nationalProjectCode: `PRJ-QW-${String(i + 1001).padStart(4, '0')}`,
    contractCode: `CT2026${String(i + 1).padStart(4, '0')}`,
    customerManager: customerManagers[i % customerManagers.length],
    solutionManager: solutionManagers[i % solutionManagers.length],
    productName: productNames[i % productNames.length],
    taxRate: taxRates[i % taxRates.length],
    tariffName: tariffNames[i % tariffNames.length],
    planOrderAmount: ((i + 1) * 35000).toFixed(2),
    planOrderDate: `2026-07-${String((i % 28) + 1).padStart(2, '0')}`,
    orderStatus
  }
})

interface FilterForm {
  projectName: string
  provinceProjectCode: string
  nationalProjectCode: string
  contractCode: string
  planOrderStartDate: string
  planOrderEndDate: string
  orderStatus: string
}

const defaultFilter: FilterForm = {
  projectName: '',
  provinceProjectCode: '',
  nationalProjectCode: '',
  contractCode: '',
  planOrderStartDate: '',
  planOrderEndDate: '',
  orderStatus: ''
}

export default function IncomeConfirmList({ onNavigate }: IncomeConfirmListProps) {
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filteredList = useMemo(() => {
    return mockConfirmList.filter(item => {
      const projectNameMatch = !submittedFilter.projectName.trim() || item.projectName.includes(submittedFilter.projectName.trim())
      const provinceCodeMatch = !submittedFilter.provinceProjectCode.trim() || item.provinceProjectCode.includes(submittedFilter.provinceProjectCode.trim())
      const nationalCodeMatch = !submittedFilter.nationalProjectCode.trim() || item.nationalProjectCode.includes(submittedFilter.nationalProjectCode.trim())
      const contractCodeMatch = !submittedFilter.contractCode.trim() || item.contractCode.includes(submittedFilter.contractCode.trim())
      const statusMatch = !submittedFilter.orderStatus || item.orderStatus === submittedFilter.orderStatus

      let dateMatch = true
      if (submittedFilter.planOrderStartDate) {
        dateMatch = dateMatch && item.planOrderDate >= submittedFilter.planOrderStartDate
      }
      if (submittedFilter.planOrderEndDate) {
        dateMatch = dateMatch && item.planOrderDate <= submittedFilter.planOrderEndDate
      }

      return projectNameMatch && provinceCodeMatch && nationalCodeMatch && contractCodeMatch && statusMatch && dateMatch
    })
  }, [submittedFilter])

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

  const handleCreate = () => {
    if (onNavigate) {
      onNavigate('/finance/income/confirm/create')
    }
  }

  const handleViewDetail = (item: ConfirmItem) => {
    if (onNavigate) {
      onNavigate(`/finance/income/confirm/detail/${item.id}`)
    }
  }

  const getOrderStatusText = (status: string) => {
    const map: Record<string, string> = {
      pending_order: '待订购',
      ordering: '订购中',
      ordered: '已订购'
    }
    return map[status] || status
  }

  const getOrderStatusClass = (status: string) => {
    const map: Record<string, string> = {
      pending_order: 'text-orange-600 bg-orange-50',
      ordering: 'text-blue-600 bg-blue-50',
      ordered: 'text-green-600 bg-green-50'
    }
    return map[status] || 'text-gray-500 bg-gray-100'
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 查询条件 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
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
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">省内项目编码</label>
              <input
                type="text"
                value={filter.provinceProjectCode}
                onChange={(e) => handleChange('provinceProjectCode', e.target.value)}
                placeholder="请输入省内项目编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">全网项目编码</label>
              <input
                type="text"
                value={filter.nationalProjectCode}
                onChange={(e) => handleChange('nationalProjectCode', e.target.value)}
                placeholder="请输入全网项目编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">合同编码</label>
              <input
                type="text"
                value={filter.contractCode}
                onChange={(e) => handleChange('contractCode', e.target.value)}
                placeholder="请输入合同编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">订购状态</label>
              <select
                value={filter.orderStatus}
                onChange={(e) => handleChange('orderStatus', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                {orderStatusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">计划订购时间</label>
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="date"
                  value={filter.planOrderStartDate}
                  onChange={(e) => handleChange('planOrderStartDate', e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                <span className="text-sm text-gray-500">至</span>
                <input
                  type="date"
                  value={filter.planOrderEndDate}
                  onChange={(e) => handleChange('planOrderEndDate', e.target.value)}
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

        {/* IT收入计划确认列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">IT收入计划确认列表</h3>
              <span className="text-xs text-gray-400">共 {filteredList.length} 条</span>
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
            >
              <Plus className="w-4 h-4" />
              收入计划确认
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">省内项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">客户经理</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">解决方案经理</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购状态</th>
                  <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedList.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-12 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  pagedList.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.projectName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.provinceProjectCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.nationalProjectCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.contractCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.customerManager}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.solutionManager}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.productName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.taxRate}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.tariffName}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{item.planOrderAmount}</td>
                      <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{item.planOrderDate}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getOrderStatusClass(item.orderStatus)}`}>
                          {getOrderStatusText(item.orderStatus)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        {(item.orderStatus === 'ordering' || item.orderStatus === 'ordered') ? (
                          <button
                            type="button"
                            onClick={() => handleViewDetail(item)}
                            className="inline-flex items-center gap-1 text-[#1677FF] hover:text-[#1668DD] text-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            详情
                          </button>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
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
