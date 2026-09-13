import { useState, useMemo } from 'react'
import { Search, RotateCcw, Plus } from 'lucide-react'

interface ProductOrderListProps {
  onNavigate?: (path: string) => void
}

interface OrderItem {
  id: string
  projectCode: string
  projectName: string
  customerName: string
  contractCode: string
  orderCode: string
  productCode: string
  productName: string
  tariffName: string
  plannedIncome: string
  orderTime: string
  orderQuantity?: number
  orderedQuantity?: number
  remainingQuantity?: number
  status: string
}

const orderStatusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待订购' },
  { value: 'ordered', label: '已订购' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
]

// CT 产品订购状态枚举（独立于 IT）
const ctOrderStatusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待订购' },
  { value: 'ordering', label: '订购中' },
  { value: 'partial', label: '部分订购' },
  { value: 'ordered', label: '已订购' }
]

const mockITOrders: OrderItem[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `IT-ORD-${String(i + 1).padStart(6, '0')}`,
  projectCode: `PRJ-2026-${String(i + 1).padStart(4, '0')}`,
  projectName: ['合肥市第一人民医院智慧医疗项目', '芜湖市政务服务中心数字政府项目', '蚌埠市教育局智慧教育项目', '合肥市轨道交通集团智慧交通项目', '安徽省公安厅智慧城市项目'][i % 5],
  customerName: ['合肥市第一人民医院', '芜湖市政务服务中心', '蚌埠市教育局', '合肥市轨道交通集团有限公司', '安徽省公安厅'][i % 5],
  contractCode: `CTR-2026-${String(i + 1).padStart(6, '0')}`,
  orderCode: `IT-ORD-${String(i + 1).padStart(6, '0')}`,
  productCode: `IT-PROD-${String(i + 1).padStart(4, '0')}`,
  productName: ['云服务器', '云数据库', '云存储', '云安全', '云网络'][i % 5],
  tariffName: ['标准型', '企业型', '旗舰型', '定制型', '基础型'][i % 5],
  plannedIncome: ((i + 1) * 12500).toFixed(2),
  orderTime: `2026-06-${String((i % 28) + 1).padStart(2, '0')} ${String((i * 3) % 24).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00`,
  status: ['pending', 'ordered', 'completed', 'cancelled', 'ordered'][i % 5]
}))

const mockCTOrders: OrderItem[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `CT-ORD-${String(i + 1).padStart(6, '0')}`,
  projectCode: `PRJ-2026-${String(i + 10).padStart(4, '0')}`,
  projectName: ['安徽移动IDC数据中心建设项目', '合肥政务云平台服务项目', '企业专线接入服务项目', '物联网平台建设项目', '5G网络优化服务项目'][i % 5],
  customerName: ['安徽省政务信息中心', '合肥市大数据局', '中国移动通信集团安徽有限公司', '安徽电信股份有限公司', '芜湖市教育局'][i % 5],
  contractCode: `CTR-2026-${String(i + 100).padStart(6, '0')}`,
  orderCode: `CT-ORD-${String(i + 1).padStart(6, '0')}`,
  productCode: `CT-PROD-${String(i + 1).padStart(4, '0')}`,
  productName: ['专线接入', 'IDC机柜', '带宽服务', '物联网卡', '5G专网'][i % 5],
  tariffName: ['标准型', '企业型', '旗舰型', '定制型', '基础型'][i % 5],
  plannedIncome: ((i + 1) * 8500).toFixed(2),
  orderTime: `2026-06-${String((i % 28) + 1).padStart(2, '0')} ${String((i * 5) % 24).padStart(2, '0')}:${String((i * 11) % 60).padStart(2, '0')}:00`,
  orderQuantity: (i + 1) * 10,
  orderedQuantity: Math.floor((i + 1) * 5),
  remainingQuantity: Math.floor((i + 1) * 5),
  status: ['pending', 'ordering', 'partial', 'ordered', 'ordered'][i % 5]
}))

interface FilterForm {
  projectCode: string
  projectName: string
  status: string
  contractCode: string
  productType: 'it' | 'ct'
}

const defaultFilter: FilterForm = {
  projectCode: '',
  projectName: '',
  status: '',
  contractCode: '',
  productType: 'it'
}

export default function ProductOrderList({ onNavigate }: ProductOrderListProps) {
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filteredOrders = useMemo(() => {
    const source = submittedFilter.productType === 'it' ? mockITOrders : mockCTOrders
    return source.filter(item => {
      const projectCodeMatch = !submittedFilter.projectCode.trim() || item.projectCode.includes(submittedFilter.projectCode.trim())
      const projectNameMatch = !submittedFilter.projectName.trim() || item.projectName.includes(submittedFilter.projectName.trim())
      const statusMatch = !submittedFilter.status || item.status === submittedFilter.status
      const contractCodeMatch = !submittedFilter.contractCode.trim() || item.contractCode.includes(submittedFilter.contractCode.trim())
      return projectCodeMatch && projectNameMatch && statusMatch && contractCodeMatch
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

  const handleProductTypeChange = (type: 'it' | 'ct') => {
    setFilter(prev => ({ ...prev, productType: type, status: '' }))
    setSubmittedFilter(prev => ({ ...prev, productType: type, status: '' }))
    setPage(1)
  }

  const handleCreateOrder = () => {
    if (onNavigate) {
      onNavigate('/finance/income/product-order/create')
    }
  }

  const getStatusText = (status: string) => {
    if (submittedFilter.productType === 'ct') {
      const map: Record<string, string> = {
        pending: '待订购',
        ordering: '订购中',
        partial: '部分订购',
        ordered: '已订购'
      }
      return map[status] || status
    }
    const map: Record<string, string> = {
      pending: '待订购',
      ordered: '已订购',
      completed: '已完成',
      cancelled: '已取消'
    }
    return map[status] || status
  }

  const getStatusClass = (status: string) => {
    if (submittedFilter.productType === 'ct') {
      const map: Record<string, string> = {
        pending: 'text-orange-600 bg-orange-50',
        ordering: 'text-blue-600 bg-blue-50',
        partial: 'text-[#1677FF] bg-blue-50',
        ordered: 'text-green-600 bg-green-50'
      }
      return map[status] || 'text-gray-500 bg-gray-100'
    }
    const map: Record<string, string> = {
      pending: 'text-orange-600 bg-orange-50',
      ordered: 'text-blue-600 bg-blue-50',
      completed: 'text-green-600 bg-green-50',
      cancelled: 'text-gray-500 bg-gray-100'
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
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">项目编码</label>
              <input
                type="text"
                value={filter.projectCode}
                onChange={(e) => handleChange('projectCode', e.target.value)}
                placeholder="请输入项目编码"
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
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">订购状态</label>
              <select
                value={filter.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                {(filter.productType === 'ct' ? ctOrderStatusOptions : orderStatusOptions).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">收入合同编码</label>
              <input
                type="text"
                value={filter.contractCode}
                onChange={(e) => handleChange('contractCode', e.target.value)}
                placeholder="请输入收入合同编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">产品类型</label>
              <div className="flex items-center">
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleProductTypeChange('it')}
                    className={`px-4 py-1.5 text-sm transition-colors ${
                      filter.productType === 'it'
                        ? 'bg-[#1677FF] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    IT产品
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProductTypeChange('ct')}
                    className={`px-4 py-1.5 text-sm transition-colors border-l border-gray-300 ${
                      filter.productType === 'ct'
                        ? 'bg-[#1677FF] text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    CT产品
                  </button>
                </div>
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

        {/* 产品订购单列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">产品订购单列表</h3>
              <span className="text-xs text-gray-400">共 {filteredOrders.length} 条</span>
            </div>
            <button
              type="button"
              onClick={handleCreateOrder}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
            >
              <Plus className="w-4 h-4" />
              产品订购
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">集团客户名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  {submittedFilter.productType === 'it' ? (
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购订单编码</th>
                  ) : (
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">甩单订单编码</th>
                  )}
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划收入金额（元，含税）</th>
                  {submittedFilter.productType === 'ct' && (
                    <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">订购数量</th>
                  )}
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={submittedFilter.productType === 'it' ? 10 : 11} className="px-4 py-12 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  pagedOrders.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.projectCode}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.projectName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.customerName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.contractCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.orderCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.productCode}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.productName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.tariffName}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{item.plannedIncome}</td>
                      {submittedFilter.productType === 'ct' && (
                        <td className="px-3 py-3 text-gray-600 text-right whitespace-nowrap">{item.orderQuantity}</td>
                      )}
                      <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{item.orderTime}</td>
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
