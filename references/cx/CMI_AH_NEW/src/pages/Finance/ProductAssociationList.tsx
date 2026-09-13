import { useState, useMemo } from 'react'
import { Search, RotateCcw, Plus, Eye, Edit } from 'lucide-react'

interface ProductAssociationListProps {
  onNavigate?: (path: string) => void
}

interface AssociationItem {
  id: string
  projectCode: string           // 省内项目编码（PRJ-*）
  nationwideProjectCode: string // 全网项目编码（NET-*）
  projectName: string
  contractCode: string
  customerManager: string       // 客户经理
  solutionManager: string       // 解决方案经理
  productName: string           // 产品名称
  taxRate: string               // 税率
  tariffName: string            // 资费名称
  plannedOrderAmount: string    // 计划订购金额
  plannedOrderTime: string      // 计划订购时间
  plannedQuantity: string       // 计划订购数量
  orderedQuantity: string       // 已订购数量
  orderStatus: string           // 订购状态：待订购/订购中/已订购
  dispatchWorkOrderNo: string   // 甩单工单号
  applyTime: string             // 计划订购时间（筛选兼容，YYYY-MM-DD）
  status: string                // 审批状态（保留给详情/修改按钮逻辑）
}

const statusOptions = [
  { value: '', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待审批' },
  { value: 'approving', label: '审批中' },
  { value: 'approved', label: '审批通过' },
  { value: 'rejected', label: '审批不通过' }
]

const cityOptions = [
  { value: '', label: '全部' },
  { value: '合肥', label: '合肥' },
  { value: '芜湖', label: '芜湖' },
  { value: '蚌埠', label: '蚌埠' },
  { value: '淮南', label: '淮南' },
  { value: '马鞍山', label: '马鞍山' },
  { value: '安庆', label: '安庆' }
]

const orderStatusOptions = [
  { value: '', label: '全部' },
  { value: '待订购', label: '待订购' },
  { value: '订购中', label: '订购中' },
  { value: '部分订购', label: '部分订购' },
  { value: '已订购', label: '已订购' }
]

const mockList: AssociationItem[] = [
  {
    id: 'pa-1',
    projectCode: 'PRJ-2026-HF-001',
    nationwideProjectCode: 'NET-2026-HF-001',
    projectName: '合肥市第一人民医院智慧医疗项目',
    contractCode: 'CTR2026000001',
    customerManager: '张凯',
    solutionManager: '刘伟',
    productName: '云计算-云主机',
    taxRate: '13%',
    tariffName: '标准型云主机套餐-年付',
    plannedOrderAmount: '1,200,000.00',
    plannedOrderTime: '2026-06-15',
    plannedQuantity: '100',
    orderedQuantity: '0',
    orderStatus: '待订购',
    dispatchWorkOrderNo: '-',
    applyTime: '2026-06-15',
    status: 'approved'
  },
  {
    id: 'pa-2',
    projectCode: 'PRJ-2026-HF-001',
    nationwideProjectCode: 'NET-2026-HF-001',
    projectName: '合肥市第一人民医院智慧医疗项目',
    contractCode: 'CTR2026000002',
    customerManager: '张凯',
    solutionManager: '刘伟',
    productName: '数据专线',
    taxRate: '9%',
    tariffName: '100M数据专线裸光纤-3年',
    plannedOrderAmount: '360,000.00',
    plannedOrderTime: '2026-06-20',
    plannedQuantity: '50',
    orderedQuantity: '30',
    orderStatus: '订购中',
    dispatchWorkOrderNo: 'SD-2026-000123',
    applyTime: '2026-06-20',
    status: 'approving'
  },
  {
    id: 'pa-3',
    projectCode: 'PRJ-2026-WH-001',
    nationwideProjectCode: 'NET-2026-WH-001',
    projectName: '芜湖市政务服务中心数字政府项目',
    contractCode: 'CTR2026000003',
    customerManager: '李华',
    solutionManager: '陈晨',
    productName: '云计算-对象存储',
    taxRate: '13%',
    tariffName: '标准存储-100TB包年',
    plannedOrderAmount: '96,000.00',
    plannedOrderTime: '2026-06-22',
    plannedQuantity: '200',
    orderedQuantity: '200',
    orderStatus: '已订购',
    dispatchWorkOrderNo: 'SD-2026-000098',
    applyTime: '2026-06-22',
    status: 'pending'
  },
  {
    id: 'pa-4',
    projectCode: 'PRJ-2026-BB-001',
    nationwideProjectCode: 'NET-2026-BB-001',
    projectName: '蚌埠市教育局智慧教育项目',
    contractCode: 'CTR2026000004',
    customerManager: '王强',
    solutionManager: '赵磊',
    productName: '互联网宽带',
    taxRate: '9%',
    tariffName: '千兆商务宽带-预付费年付',
    plannedOrderAmount: '48,000.00',
    plannedOrderTime: '2026-06-25',
    plannedQuantity: '80',
    orderedQuantity: '40',
    orderStatus: '部分订购',
    dispatchWorkOrderNo: '-',
    applyTime: '2026-06-25',
    status: 'rejected'
  },
  {
    id: 'pa-5',
    projectCode: 'PRJ-2026-HF-002',
    nationwideProjectCode: 'NET-2026-HF-002',
    projectName: '合肥市轨道交通集团智慧交通项目',
    contractCode: 'CTR2026000005',
    customerManager: '赵明',
    solutionManager: '孙杰',
    productName: '物联网卡',
    taxRate: '13%',
    tariffName: '工业级NB-IoT套餐-5000张',
    plannedOrderAmount: '240,000.00',
    plannedOrderTime: '2026-06-28',
    plannedQuantity: '5000',
    orderedQuantity: '3000',
    orderStatus: '订购中',
    dispatchWorkOrderNo: 'SD-2026-000201',
    applyTime: '2026-06-28',
    status: 'draft'
  },
  {
    id: 'pa-6',
    projectCode: 'PRJ-2026-AH-001',
    nationwideProjectCode: 'NET-2026-AH-001',
    projectName: '安徽省公安厅智慧城市项目',
    contractCode: 'CTR2026000001',
    customerManager: '杨海波',
    solutionManager: '周涛',
    productName: '视频云存储',
    taxRate: '13%',
    tariffName: '视频监控云存储-500路-3年',
    plannedOrderAmount: '1,800,000.00',
    plannedOrderTime: '2026-06-30',
    plannedQuantity: '500',
    orderedQuantity: '500',
    orderStatus: '已订购',
    dispatchWorkOrderNo: 'SD-2026-000187',
    applyTime: '2026-06-30',
    status: 'approving'
  },
  {
    id: 'pa-7',
    projectCode: 'PRJ-2026-WH-001',
    nationwideProjectCode: 'NET-2026-WH-001',
    projectName: '芜湖市政务服务中心数字政府项目',
    contractCode: 'CTR2026000003',
    customerManager: '李华',
    solutionManager: '陈晨',
    productName: '安全服务',
    taxRate: '6%',
    tariffName: '等保三级测评服务',
    plannedOrderAmount: '80,000.00',
    plannedOrderTime: '2026-06-23',
    plannedQuantity: '20',
    orderedQuantity: '0',
    orderStatus: '待订购',
    dispatchWorkOrderNo: '-',
    applyTime: '2026-06-23',
    status: 'pending'
  }
]

// CT产品订购工单 mock 数据
interface WorkOrderItem {
  id: string
  dispatchWorkOrderNo: string  // 甩单工单号
  projectName: string
  provincialProjectCode: string  // 省内项目编码
  nationwideProjectCode: string  // 全网项目编码
  contractCode: string          // 合同编码
  orderCode: string             // 订单编码
  dispatchStatus: string        // 工单状态
  createTime: string            // 创建时间
  creator: string               // 创建人
  operationTime: string         // 操作时间
}

const workOrderStatusOptions = [
  { value: '', label: '全部' },
  { value: '处理中', label: '处理中' },
  { value: '已完成', label: '已完成' },
  { value: '关单', label: '关单' }
]

const mockWorkOrderList: WorkOrderItem[] = [
  {
    id: 'wo-1',
    dispatchWorkOrderNo: 'SD-2026-000123',
    projectName: '合肥市第一人民医院智慧医疗项目',
    provincialProjectCode: 'PRJ-2026-HF-001',
    nationwideProjectCode: 'NET-2026-HF-001',
    contractCode: 'CTR2026000002',
    orderCode: 'ORD-2026-000051',
    dispatchStatus: '已完成',
    createTime: '2026-06-20 10:30:00',
    creator: '张凯',
    operationTime: '2026-06-20 14:20:00'
  },
  {
    id: 'wo-2',
    dispatchWorkOrderNo: 'SD-2026-000098',
    projectName: '芜湖市政务服务中心数字政府项目',
    provincialProjectCode: 'PRJ-2026-WH-001',
    nationwideProjectCode: 'NET-2026-WH-001',
    contractCode: 'CTR2026000003',
    orderCode: 'ORD-2026-000072',
    dispatchStatus: '已完成',
    createTime: '2026-06-22 09:15:00',
    creator: '李华',
    operationTime: '2026-06-22 11:45:00'
  },
  {
    id: 'wo-3',
    dispatchWorkOrderNo: 'SD-2026-000201',
    projectName: '合肥市轨道交通集团智慧交通项目',
    provincialProjectCode: 'PRJ-2026-HF-002',
    nationwideProjectCode: 'NET-2026-HF-002',
    contractCode: 'CTR2026000005',
    orderCode: 'ORD-2026-000103',
    dispatchStatus: '处理中',
    createTime: '2026-06-28 16:00:00',
    creator: '赵明',
    operationTime: '2026-06-28 16:00:00'
  },
  {
    id: 'wo-4',
    dispatchWorkOrderNo: 'SD-2026-000187',
    projectName: '安徽省公安厅智慧城市项目',
    provincialProjectCode: 'PRJ-2026-AH-001',
    nationwideProjectCode: 'NET-2026-AH-001',
    contractCode: 'CTR2026000001',
    orderCode: 'ORD-2026-000089',
    dispatchStatus: '关单',
    createTime: '2026-06-30 14:20:00',
    creator: '杨海波',
    operationTime: '2026-06-30 18:30:00'
  }
]

interface FilterForm {
  projectName: string
  provincialProjectCode: string
  nationwideProjectCode: string
  contractCode: string
  orderStatus: string
  plannedOrderStart: string
  plannedOrderEnd: string
}

const defaultFilter: FilterForm = {
  projectName: '',
  provincialProjectCode: '',
  nationwideProjectCode: '',
  contractCode: '',
  orderStatus: '',
  plannedOrderStart: '',
  plannedOrderEnd: ''
}

export default function ProductAssociationList({ onNavigate }: ProductAssociationListProps) {
  const [activeTab, setActiveTab] = useState<'plan' | 'workorder'>('plan')
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filteredList = useMemo(() => {
    return mockList.filter(item => {
      const projectNameMatch = !submittedFilter.projectName.trim() || item.projectName.includes(submittedFilter.projectName.trim())
      // 项目编码：省内项目编码走本地 projectCode（PRJ-* 样式），全网项目编码固定 NET 前缀匹配
      const provincialCodeMatch = !submittedFilter.provincialProjectCode.trim() ||
        item.projectCode.includes(submittedFilter.provincialProjectCode.trim())
      const nationwideCodeMatch = !submittedFilter.nationwideProjectCode.trim() ||
        item.projectCode.replace(/^PRJ-/, 'NET-').includes(submittedFilter.nationwideProjectCode.trim())
      const contractCodeMatch = !submittedFilter.contractCode.trim() || item.contractCode.includes(submittedFilter.contractCode.trim())
      const orderStatusMatch = !submittedFilter.orderStatus || item.orderStatus === submittedFilter.orderStatus
      let dateMatch = true
      if (submittedFilter.plannedOrderStart) {
        dateMatch = dateMatch && item.applyTime >= submittedFilter.plannedOrderStart
      }
      if (submittedFilter.plannedOrderEnd) {
        dateMatch = dateMatch && item.applyTime <= submittedFilter.plannedOrderEnd
      }
      return projectNameMatch && provincialCodeMatch && nationwideCodeMatch && contractCodeMatch && orderStatusMatch && dateMatch
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

  // ========== CT产品订购工单相关状态 ==========
  interface WorkOrderFilter {
    dispatchWorkOrderNo: string
    projectName: string
    provincialProjectCode: string
    nationwideProjectCode: string
    contractCode: string
    orderCode: string
    dispatchStatus: string
  }
  const defaultWoFilter: WorkOrderFilter = {
    dispatchWorkOrderNo: '',
    projectName: '',
    provincialProjectCode: '',
    nationwideProjectCode: '',
    contractCode: '',
    orderCode: '',
    dispatchStatus: ''
  }
  const [woFilter, setWoFilter] = useState<WorkOrderFilter>(defaultWoFilter)
  const [submittedWoFilter, setSubmittedWoFilter] = useState<WorkOrderFilter>(defaultWoFilter)
  const [woPage, setWoPage] = useState(1)

  const filteredWoList = useMemo(() => {
    return mockWorkOrderList.filter(item => {
      const workOrderNoMatch = !submittedWoFilter.dispatchWorkOrderNo.trim() || item.dispatchWorkOrderNo.includes(submittedWoFilter.dispatchWorkOrderNo.trim())
      const projectNameMatch = !submittedWoFilter.projectName.trim() || item.projectName.includes(submittedWoFilter.projectName.trim())
      const provincialMatch = !submittedWoFilter.provincialProjectCode.trim() || item.provincialProjectCode.includes(submittedWoFilter.provincialProjectCode.trim())
      const nationwideMatch = !submittedWoFilter.nationwideProjectCode.trim() || item.nationwideProjectCode.includes(submittedWoFilter.nationwideProjectCode.trim())
      const contractMatch = !submittedWoFilter.contractCode.trim() || item.contractCode.includes(submittedWoFilter.contractCode.trim())
      const orderCodeMatch = !submittedWoFilter.orderCode.trim() || item.orderCode.includes(submittedWoFilter.orderCode.trim())
      const statusMatch = !submittedWoFilter.dispatchStatus || item.dispatchStatus === submittedWoFilter.dispatchStatus
      return workOrderNoMatch && projectNameMatch && provincialMatch && nationwideMatch && contractMatch && orderCodeMatch && statusMatch
    })
  }, [submittedWoFilter])

  const woTotalPages = Math.ceil(filteredWoList.length / pageSize)
  const pagedWoList = filteredWoList.slice((woPage - 1) * pageSize, woPage * pageSize)

  const handleWoChange = <K extends keyof WorkOrderFilter>(key: K, value: WorkOrderFilter[K]) => {
    setWoFilter(prev => ({ ...prev, [key]: value }))
  }
  const handleWoSearch = () => {
    setSubmittedWoFilter(woFilter)
    setWoPage(1)
  }
  const handleWoReset = () => {
    setWoFilter(defaultWoFilter)
    setSubmittedWoFilter(defaultWoFilter)
    setWoPage(1)
  }

  const getDispatchStatusClass = (status: string) => {
    const map: Record<string, string> = {
      '处理中': 'text-blue-600 bg-blue-50',
      '已完成': 'text-green-600 bg-green-50',
      '关单': 'text-gray-500 bg-gray-100'
    }
    return map[status] || 'text-gray-500 bg-gray-100'
  }

  const handleCreate = () => {
    if (onNavigate) {
      onNavigate('/finance/income/product-association/create')
    }
  }

  const handleViewDetail = (item: AssociationItem) => {
    if (onNavigate) {
      onNavigate(`/finance/income/product-association/detail/${item.id}`)
    }
  }

  const handleEdit = (item: AssociationItem) => {
    if (onNavigate) {
      onNavigate(`/finance/income/product-association/edit/${item.id}`)
    }
  }

  const getStatusText = (status: string) => {
    const map: Record<string, string> = {
      draft: '草稿',
      pending: '待审批',
      approving: '审批中',
      approved: '审批通过',
      rejected: '审批不通过'
    }
    return map[status] || status
  }

  const getStatusClass = (status: string) => {
    const map: Record<string, string> = {
      draft: 'text-gray-600 bg-gray-100',
      pending: 'text-orange-600 bg-orange-50',
      approving: 'text-yellow-600 bg-yellow-50',
      approved: 'text-green-600 bg-green-50',
      rejected: 'text-red-600 bg-red-50'
    }
    return map[status] || 'text-gray-500 bg-gray-100'
  }

  const getOrderStatusClass = (orderStatus: string) => {
    const map: Record<string, string> = {
      '待订购': 'text-orange-600 bg-orange-50',
      '订购中': 'text-blue-600 bg-blue-50',
      '部分订购': 'text-[#1677FF] bg-blue-50',
      '已订购': 'text-green-600 bg-green-50'
    }
    return map[orderStatus] || 'text-gray-500 bg-gray-100'
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 标签页 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => setActiveTab('plan')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'plan'
                  ? 'text-[#1677FF]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              CT产品订购计划
              {activeTab === 'plan' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677FF]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('workorder')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'workorder'
                  ? 'text-[#1677FF]'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              CT产品订购工单
              {activeTab === 'workorder' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1677FF]" />
              )}
            </button>
          </div>
        </div>

        {/* ========== CT产品订购计划 ========== */}
        {activeTab === 'plan' && (
          <>
        {/* 查询条件 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            <div className="flex items-center gap-2">
              <label className="w-20 text-right text-sm text-gray-700 shrink-0">项目名称</label>
              <input
                type="text"
                value={filter.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                placeholder="请输入项目名称"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap">省内项目编码</label>
              <input
                type="text"
                value={filter.provincialProjectCode}
                onChange={(e) => handleChange('provincialProjectCode', e.target.value)}
                placeholder="请输入省内项目编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap">全网项目编码</label>
              <input
                type="text"
                value={filter.nationwideProjectCode}
                onChange={(e) => handleChange('nationwideProjectCode', e.target.value)}
                placeholder="请输入全网项目编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-20 text-right text-sm text-gray-700 shrink-0">合同编码</label>
              <input
                type="text"
                value={filter.contractCode}
                onChange={(e) => handleChange('contractCode', e.target.value)}
                placeholder="请输入合同编码"
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-20 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap">订购状态</label>
              <select
                value={filter.orderStatus}
                onChange={(e) => handleChange('orderStatus', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                {orderStatusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap">计划订购时间</label>
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <input
                  type="date"
                  value={filter.plannedOrderStart}
                  onChange={(e) => handleChange('plannedOrderStart', e.target.value)}
                  className="w-1/2 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                />
                <span className="text-sm text-gray-400 shrink-0">至</span>
                <input
                  type="date"
                  value={filter.plannedOrderEnd}
                  onChange={(e) => handleChange('plannedOrderEnd', e.target.value)}
                  className="w-1/2 min-w-0 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 text-sm text-[#1677FF] bg-white border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="px-8 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              查询
            </button>
          </div>
        </div>

        {/* CT产品订购列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">CT产品订购列表</h3>
              <span className="text-xs text-gray-400">共 {filteredList.length} 条</span>
            </div>
            <button
              type="button"
              onClick={handleCreate}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
            >
              <Plus className="w-4 h-4" />
              CT产品订购
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
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额（元）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购数量</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">已订购数量</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购状态</th>
                  <th className="sticky right-0 bg-gray-50 px-3 py-2.5 text-center font-medium whitespace-nowrap w-[200px] z-10 shadow-[-2px_0_0_0_#f3f4f6]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedList.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-12 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  pagedList.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.projectName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.projectCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.nationwideProjectCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.contractCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.customerManager}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.solutionManager}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.productName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.taxRate}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.tariffName}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-left">{item.plannedOrderAmount}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.plannedOrderTime}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-left tabular-nums">{item.plannedQuantity}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap text-left tabular-nums">{item.orderedQuantity}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getOrderStatusClass(item.orderStatus)}`}>
                          {item.orderStatus}
                        </span>
                      </td>
                      <td className="sticky right-0 bg-white px-3 py-3 text-center whitespace-nowrap w-[200px] z-10 shadow-[-2px_0_0_0_#f3f4f6]">
                        <div className="flex items-center justify-center gap-3">
                          {item.orderStatus !== '待订购' && (
                            <button
                              type="button"
                              onClick={() => handleViewDetail(item)}
                              className="inline-flex items-center gap-1 text-[#1677FF] hover:text-[#1668DD] text-sm"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              详情
                            </button>
                          )}
                          {item.orderStatus !== '已订购' && (
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-1 text-[#1677FF] hover:text-[#1668DD] text-sm"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              补录
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
          </>
        )}

        {/* ========== CT产品订购工单 ========== */}
        {activeTab === 'workorder' && (
          <>
            {/* 查询条件 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap">甩单工单号</label>
                  <input
                    type="text"
                    value={woFilter.dispatchWorkOrderNo}
                    onChange={(e) => handleWoChange('dispatchWorkOrderNo', e.target.value)}
                    placeholder="请输入甩单工单号"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-20 text-right text-sm text-gray-700 shrink-0">项目名称</label>
                  <input
                    type="text"
                    value={woFilter.projectName}
                    onChange={(e) => handleWoChange('projectName', e.target.value)}
                    placeholder="请输入项目名称"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap">省内项目编码</label>
                  <input
                    type="text"
                    value={woFilter.provincialProjectCode}
                    onChange={(e) => handleWoChange('provincialProjectCode', e.target.value)}
                    placeholder="请输入省内项目编码"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap">全网项目编码</label>
                  <input
                    type="text"
                    value={woFilter.nationwideProjectCode}
                    onChange={(e) => handleWoChange('nationwideProjectCode', e.target.value)}
                    placeholder="请输入全网项目编码"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-20 text-right text-sm text-gray-700 shrink-0">合同编码</label>
                  <input
                    type="text"
                    value={woFilter.contractCode}
                    onChange={(e) => handleWoChange('contractCode', e.target.value)}
                    placeholder="请输入合同编码"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-20 text-right text-sm text-gray-700 shrink-0">订单编码</label>
                  <input
                    type="text"
                    value={woFilter.orderCode}
                    onChange={(e) => handleWoChange('orderCode', e.target.value)}
                    placeholder="请输入订单编码"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-20 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap">工单状态</label>
                  <select
                    value={woFilter.dispatchStatus}
                    onChange={(e) => handleWoChange('dispatchStatus', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {workOrderStatusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleWoReset}
                  className="px-6 py-2 text-sm text-[#1677FF] bg-white border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>
                <button
                  type="button"
                  onClick={handleWoSearch}
                  className="px-8 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  查询
                </button>
              </div>
            </div>

            {/* 工单列表 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">CT产品订购工单列表</h3>
                <span className="text-xs text-gray-400">共 {filteredWoList.length} 条</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-500">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">甩单工单号</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">省内项目编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订单编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">工单状态</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">创建时间</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">创建人</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">操作时间</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap w-[100px]">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pagedWoList.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-12 text-center text-gray-400">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      pagedWoList.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.dispatchWorkOrderNo}</td>
                          <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.projectName}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.provincialProjectCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.nationwideProjectCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.contractCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.orderCode}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getDispatchStatusClass(item.dispatchStatus)}`}>
                              {item.dispatchStatus}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.createTime}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.creator}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.operationTime}</td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                type="button"
                                onClick={() => onNavigate?.(`/finance/income/product-association/workorder-detail/${item.id}`)}
                                className="inline-flex items-center gap-1 text-[#1677FF] hover:text-[#1668DD] text-sm"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                详情
                              </button>
                              {item.dispatchStatus === '处理中' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm('确定要关闭该工单吗？')) {
                                      alert('工单已关闭')
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 text-red-500 hover:text-red-600 text-sm"
                                >
                                  关闭
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
              {filteredWoList.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    共 {filteredWoList.length} 条记录，第 {woPage}/{woTotalPages || 1} 页
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={woPage <= 1}
                      onClick={() => setWoPage(p => Math.max(1, p - 1))}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <button
                      type="button"
                      disabled={woPage >= woTotalPages}
                      onClick={() => setWoPage(p => Math.min(woTotalPages, p + 1))}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
