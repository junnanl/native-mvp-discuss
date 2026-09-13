import { useState, useMemo, useRef } from 'react'
import { Search, Calendar, X, RotateCcw, Upload, Download, UserCheck, ChevronDown, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import SharedClueProcess from './SharedClueProcess'

// 地市
const cities = [
  { value: '', label: '全部' },
  { value: 'province', label: '省公司' },
  { value: 'hefei', label: '合肥市' },
  { value: 'wuhu', label: '芜湖市' },
  { value: 'bangbu', label: '蚌埠市' },
  { value: 'huainan', label: '淮南市' },
  { value: 'maanshan', label: '马鞍山市' },
  { value: 'huaibei', label: '淮北市' },
  { value: 'tongling', label: '铜陵市' },
  { value: 'anqing', label: '安庆市' },
  { value: 'huangshan', label: '黄山市' },
  { value: 'chuzhou', label: '滁州市' },
  { value: 'fuyang', label: '阜阳市' },
  { value: 'suzhou', label: '宿州市' },
  { value: 'liuan', label: '六安市' },
  { value: 'haozhou', label: '亳州市' },
  { value: 'chizhou', label: '池州市' },
  { value: 'xuancheng', label: '宣城市' }
]

// 区县
const districts = [
  { value: '', label: '全部' },
  { value: 'yaohai', label: '瑶海区' },
  { value: 'luyang', label: '庐阳区' },
  { value: 'shushan', label: '蜀山区' },
  { value: 'baohe', label: '包河区' }
]

// 行业类别
const industries = ['政府', '金融', '医疗', '教育', '交通', '能源']

// 细分领域
const fields = ['信息化', '数字化', '智能化', '云服务', '大数据', '物联网', '人工智能']

// 客户库
const customerList = [
  { id: 'c1', name: '合肥市第一人民医院' },
  { id: 'c2', name: '芜湖市政务服务中心' },
  { id: 'c3', name: '蚌埠市教育局' },
  { id: 'c4', name: '安徽医科大学附属医院' },
  { id: 'c5', name: '合肥市轨道交通集团' },
  { id: 'c6', name: '滁州市智慧城市运营中心' },
  { id: 'c7', name: '阜阳市公安局' },
  { id: 'c8', name: '安庆市第一中学' }
]

// 员工库
const employeeList = [
  { id: 'e1', name: '张凯' },
  { id: 'e2', name: '李明' },
  { id: 'e3', name: '王芳' },
  { id: 'e4', name: '赵静' },
  { id: 'e5', name: '陈强' },
  { id: 'e6', name: '刘洋' },
  { id: 'e7', name: '周晓敏' },
  { id: 'e8', name: '孙建华' }
]

// 归属BU（省公司/市公司共用同一份行业清单）
const buOptions = [
  '党政', '融合执法', '金融', '农商', '工业能源', '互联网', '交通', '教育', '医卫'
]

// 状态选项
const statusOptions = [
  { value: '', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'abandoned', label: '废弃' },
  { value: 'finished', label: '完结' }
]

// 线索类型（父子类别）
const clueTypeOptions = [
  { value: '', label: '全部' },
  { value: '父线索', label: '父线索' },
  { value: '子线索', label: '子线索' }
]

// 模拟共享线索数据（包含父线索+子线索结构）
const generateMockSharedClueList = () => {
  const list: Array<{
    id: string
    name: string
    clueType: string
    city: string
    district: string
    industry: string
    field: string
    customer: string
    contact?: string
    phone?: string
    budget: string
    cities: string[]
    description: string
    secrecyLevel: string
    isPlatform: string
    status: string
    creator: string
    currentHandler: string
    createTime: string
    provBu: string
    cityBu: string
  }> = []

  // 生成10条父线索
  for (let p = 0; p < 10; p++) {
    const parentId = `SCL${(2026000 + p + 1).toString()}`
    list.push({
      id: parentId,
      name: `共享线索项目${p + 1}`,
      clueType: '父线索',
      city: cities[1 + (p % 16)].label,
      district: districts[1 + (p % 4)].label,
      industry: industries[p % industries.length],
      field: fields[p % fields.length],
      customer: customerList[p % customerList.length].name,
      budget: `${(Math.random() * 500 + 50).toFixed(2)}`,
      cities: [cities[1 + (p % 16)].label],
      description: `该项目是${customerList[p % customerList.length].name}在${fields[p % fields.length]}领域的重点项目，旨在通过${industries[p % industries.length]}的数字化升级，提升业务效率。`,
      secrecyLevel: p % 3 === 0 ? 'secret' : 'normal',
      isPlatform: p % 2 === 0 ? 'yes' : 'no',
      status: ['pending', 'processing', 'abandoned', 'finished'][p % 4],
      creator: employeeList[p % employeeList.length].name,
      currentHandler: p % 3 === 0 ? employeeList[(p + 1) % employeeList.length].name : '-',
      createTime: `2026-05-${String((p % 30) + 1).padStart(2, '0')} 10:${String((p * 7) % 60).padStart(2, '0')}`,
      provBu: buOptions[p % buOptions.length],
      cityBu: buOptions[(p + 3) % buOptions.length]
    })

    // 每条父线索下生成1-3条子线索
    const childCount = (p % 3) + 1
    for (let c = 0; c < childCount; c++) {
      const childId = `${parentId}${String(c + 1).padStart(3, '0')}`
      list.push({
        id: childId,
        name: `共享线索项目${p + 1}-子线索${c + 1}`,
        clueType: '子线索',
        city: cities[1 + ((p + c) % 16)].label,
        district: districts[1 + ((p + c) % 4)].label,
        industry: industries[(p + c) % industries.length],
        field: fields[(p + c) % fields.length],
        customer: customerList[(p + c) % customerList.length].name,
        budget: `${(Math.random() * 200 + 20).toFixed(2)}`,
        cities: [cities[1 + ((p + c) % 16)].label],
        description: `${customerList[(p + c) % customerList.length].name} - 子线索${c + 1}（父线索编码：${parentId}）`,
        secrecyLevel: (p + c) % 3 === 0 ? 'secret' : 'normal',
        isPlatform: (p + c) % 2 === 0 ? 'yes' : 'no',
        status: ['pending', 'processing', 'abandoned', 'finished'][(p + c) % 4],
        creator: employeeList[(p + c) % employeeList.length].name,
        currentHandler: (p + c) % 3 === 0 ? employeeList[(p + c + 1) % employeeList.length].name : '-',
        createTime: `2026-05-${String(((p + c) % 30) + 1).padStart(2, '0')} 11:${String(((p + c) * 11) % 60).padStart(2, '0')}`,
        provBu: buOptions[(p + c) % buOptions.length],
        cityBu: buOptions[(p + c + 3) % buOptions.length]
      })
    }
  }
  return list
}

const mockSharedClueList = generateMockSharedClueList()

// 模拟摸排工单数据
const mockWorkOrders = [
  {
    id: 'WO202605001',
    name: '客户需求摸排工单',
    type: '省级工单',
    city: '合肥市',
    district: '蜀山区',
    manager: '张凯',
    status: '处理中',
    creator: '王芳',
    createTime: '2026-05-15 09:30'
  },
  {
    id: 'WO202605002',
    name: '现场踏勘工单',
    type: '市级工单',
    city: '合肥市',
    district: '包河区',
    manager: '李明',
    status: '已完成',
    creator: '王芳',
    createTime: '2026-05-16 14:20'
  },
  {
    id: 'WO202605003',
    name: '客户需求摸排工单',
    type: '区县级工单',
    city: '芜湖市',
    district: '镜湖区',
    manager: '王芳',
    status: '已完成',
    creator: '李明',
    createTime: '2026-05-17 10:00'
  }
]

// 模拟流程轨迹数据
const mockFlowTrails = [
  { time: '2026-05-10 09:00', action: '线索创建', operator: '张凯', remark: '创建共享线索' },
  { time: '2026-05-10 10:30', action: '线索提交', operator: '张凯', remark: '提交至审核环节' },
  { time: '2026-05-11 09:15', action: '审核通过', operator: '王芳', remark: '审核通过并分配处理人' },
  { time: '2026-05-12 14:00', action: '创建摸排工单', operator: '李明', remark: '创建客户需求摸排工单' },
  { time: '2026-05-15 16:30', action: '工单完成', operator: '李明', remark: '完成现场踏勘' }
]

interface FilterForm {
  clueName: string
  customerName: string
  clueType: string
  city: string
  district: string
  provBu: string
  cityBu: string
  creator: string
  startDate: string
  endDate: string
  status: string
}

const defaultFilter: FilterForm = {
  clueName: '',
  customerName: '',
  clueType: '',
  city: '',
  district: '',
  provBu: '',
  cityBu: '',
  creator: '',
  startDate: '',
  endDate: '',
  status: ''
}

export default function SharedClueQuery({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [filterExpanded, setFilterExpanded] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [showEmployeeModal, setShowEmployeeModal] = useState(false)
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [detailItem, setDetailItem] = useState<typeof mockSharedClueList[0] | null>(null)
  const [showWorkOrderDetail, setShowWorkOrderDetail] = useState<typeof mockWorkOrders[0] | null>(null)
  const [processItem, setProcessItem] = useState<typeof mockSharedClueList[0] | null>(null)
  const [transferItem, setTransferItem] = useState<typeof mockSharedClueList[0] | null>(null)
  const [transferSearch, setTransferSearch] = useState('')
  const startDateRef = useRef<HTMLInputElement>(null)
  const endDateRef = useRef<HTMLInputElement>(null)

  // 客户搜索过滤
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customerList
    return customerList.filter(c => c.name.includes(customerSearch))
  }, [customerSearch])

  // 员工搜索过滤
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return employeeList
    return employeeList.filter(e => e.name.includes(employeeSearch))
  }, [employeeSearch])

  // 根据筛选条件过滤
  const filteredList = useMemo(() => {
    return mockSharedClueList.filter(item => {
      if (submittedFilter.clueName && !item.name.includes(submittedFilter.clueName)) return false
      if (submittedFilter.customerName && !item.customer.includes(submittedFilter.customerName)) return false
      if (submittedFilter.clueType && item.clueType !== submittedFilter.clueType) return false
      if (submittedFilter.city && item.city !== cities.find(c => c.value === submittedFilter.city)?.label) return false
      if (submittedFilter.district && item.district !== districts.find(d => d.value === submittedFilter.district)?.label) return false
      if (submittedFilter.provBu && item.provBu !== submittedFilter.provBu) return false
      if (submittedFilter.cityBu && item.cityBu !== submittedFilter.cityBu) return false
      if (submittedFilter.creator && !item.creator.includes(submittedFilter.creator)) return false
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

  const handleSelectCustomer = (name: string) => {
    handleChange('customerName', name)
    setShowCustomerModal(false)
    setCustomerSearch('')
  }

  const handleSelectEmployee = (name: string) => {
    handleChange('creator', name)
    setShowEmployeeModal(false)
    setEmployeeSearch('')
  }

  // 触发日期选择器
  const openDatePicker = (ref: React.RefObject<HTMLInputElement>) => {
    const input = ref.current
    if (!input) return
    if (typeof input.showPicker === 'function') {
      input.showPicker()
    } else {
      input.focus()
    }
  }

  const handleProcess = (item: typeof mockSharedClueList[0]) => {
    setProcessItem(item)
  }

  const openTransferOne = (item: typeof mockSharedClueList[0]) => {
    setTransferItem(item)
    setTransferSearch('')
  }

  const handleConfirmTransfer = (name: string) => {
    if (!transferItem) return
    alert(`已将共享线索 ${transferItem.id} 转派给：${name}`)
    setTransferItem(null)
    setTransferSearch('')
  }

  const handleImport = () => {
    alert('批量导入功能')
  }

  const handleExport = () => {
    alert('批量导出功能')
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-3">
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
            {/* 第1行 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">线索名称</label>
              <input
                type="text"
                value={filter.clueName}
                onChange={(e) => handleChange('clueName', e.target.value)}
                placeholder="请输入"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">客户名称</label>
              <div className="relative">
                <input
                  type="text"
                  value={filter.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  placeholder="请选择"
                  className="w-full pl-3 pr-9 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="选择客户"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">线索类型</label>
              <select
                value={filter.clueType}
                onChange={(e) => handleChange('clueType', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {clueTypeOptions.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* 第2行 */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">地市</label>
              <select
                value={filter.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {cities.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">区县</label>
              <select
                value={filter.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {districts.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">省公司BU</label>
              <select
                value={filter.provBu}
                onChange={(e) => handleChange('provBu', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">全部</option>
                {buOptions.map(bu => (
                  <option key={bu} value={bu}>{bu}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">市公司BU</label>
              <select
                value={filter.cityBu}
                onChange={(e) => handleChange('cityBu', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">全部</option>
                {buOptions.map(bu => (
                  <option key={bu} value={bu}>{bu}</option>
                ))}
              </select>
            </div>

            {/* 展开后展示 */}
            {filterExpanded && (
              <>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">线索创建人</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={filter.creator}
                      onChange={(e) => handleChange('creator', e.target.value)}
                      placeholder="请选择"
                      className="w-full pl-3 pr-9 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmployeeModal(true)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="选择员工"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">创建开始时间</label>
                  <div className="relative">
                    <input
                      ref={startDateRef}
                      type="date"
                      value={filter.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      className="w-full pl-3 pr-9 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
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
                  <label className="block text-sm text-gray-700 mb-1">创建结束时间</label>
                  <div className="relative">
                    <input
                      ref={endDateRef}
                      type="date"
                      value={filter.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      className="w-full pl-3 pr-9 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
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
                <div>
                  <label className="block text-sm text-gray-700 mb-1">状态</label>
                  <select
                    value={filter.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {statusOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* 查询按钮（右下角） */}
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

        {/* 表格上方操作栏（独立一行、无底框） */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={handleImport}
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-4 h-4" />
            批量导入
          </button>
          <button
            onClick={() => onNavigate?.('/business/clue/share-input')}
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            共享线索录入
          </button>
          <button
            onClick={handleExport}
            className="px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            导出
          </button>
        </div>

        {/* 表格区 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">线索编码</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">线索名称</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">线索类型</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">地市</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">区县</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">行业类别</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">细分领域</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">客户名称</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">预算金额（万元）</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">当前处理人</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">状态</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">线索填报人</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">创建时间</th>
                  <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap sticky right-0 bg-gray-50">操作</th>
                </tr>
              </thead>
              <tbody>
                {pagedList.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="text-center py-10 text-gray-400 text-sm">暂无数据</td>
                  </tr>
                ) : (
                  pagedList.map(item => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.id}</td>
                      <td className="py-2.5 px-3 text-gray-800 whitespace-nowrap">{item.name}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {item.clueType === '父线索' ? (
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-600">{item.clueType}</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-600">{item.clueType}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.city}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.district}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.industry}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.field}</td>
                      <td className="py-2.5 px-3 text-gray-800 whitespace-nowrap">{item.customer}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.budget}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.currentHandler}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={clsx(
                          'px-2 py-0.5 rounded text-xs',
                          item.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                          item.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                          item.status === 'abandoned' ? 'bg-gray-100 text-gray-500' :
                          'bg-green-50 text-green-600'
                        )}>
                          {item.status === 'pending' ? '待处理' :
                            item.status === 'processing' ? '处理中' :
                            item.status === 'abandoned' ? '废弃' : '完结'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{item.creator}</td>
                      <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{item.createTime}</td>
                      <td className="py-2.5 px-3 sticky right-0 bg-white whitespace-nowrap">
                        <div className="flex items-center gap-3 text-blue-600">
                          <button
                            onClick={() => setDetailItem(item)}
                            className="hover:text-blue-800 hover:underline"
                          >
                            详情
                          </button>
                          {item.status === 'processing' && (
                            <>
                              <button
                                onClick={() => setProcessItem(item)}
                                className="hover:text-blue-800 hover:underline"
                              >
                                处理
                              </button>
                              <button
                                onClick={() => openTransferOne(item)}
                                className="hover:text-blue-800 hover:underline"
                              >
                                转派
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

      {/* 客户选择弹窗 */}
      {showCustomerModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setShowCustomerModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[500px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">选择客户</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder="搜索客户名称"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">未找到客户</div>
              ) : (
                filteredCustomers.map(customer => (
                  <div
                    key={customer.id}
                    onClick={() => handleSelectCustomer(customer.name)}
                    className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                  >
                    <div className="text-sm text-gray-800">{customer.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 员工选择弹窗 */}
      {showEmployeeModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setShowEmployeeModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[500px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">选择员工</h3>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <input
                type="text"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
                placeholder="搜索员工姓名"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">未找到员工</div>
              ) : (
                filteredEmployees.map(employee => (
                  <div
                    key={employee.id}
                    onClick={() => handleSelectEmployee(employee.name)}
                    className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                  >
                    <div className="text-sm text-gray-800">{employee.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 共享线索详情弹窗 */}
      {detailItem && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setDetailItem(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[1100px] max-h-[85vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">共享线索详情</h3>
              <button
                onClick={() => setDetailItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* 客户信息 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">客户信息</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm bg-gray-50 p-4 rounded-md">
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">客户名称：</span>
                    <span className="text-gray-800">{detailItem.customer}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">客户联系人：</span>
                    <span className="text-gray-800">{detailItem.contact}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">客户联系电话：</span>
                    <span className="text-gray-800">{detailItem.phone}</span>
                  </div>
                </div>
              </div>

              {/* 线索信息 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">线索信息</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm bg-gray-50 p-4 rounded-md">
                  <div className="flex col-span-2">
                    <span className="text-gray-500 w-24 shrink-0">线索名称：</span>
                    <span className="text-gray-800">{detailItem.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">线索编码：</span>
                    <span className="text-gray-800">{detailItem.id}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">线索类型：</span>
                    <span className="text-gray-800">{detailItem.clueType}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">归属地市：</span>
                    <span className="text-gray-800">{detailItem.cities.join('、')}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">归属区县：</span>
                    <span className="text-gray-800">{detailItem.district}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">行业类型：</span>
                    <span className="text-gray-800">{detailItem.industry}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">所属领域：</span>
                    <span className="text-gray-800">{detailItem.field}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">省公司BU：</span>
                    <span className="text-gray-800">{detailItem.provBu}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">市公司BU：</span>
                    <span className="text-gray-800">{detailItem.cityBu}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">保密级别：</span>
                    <span className="text-gray-800">{detailItem.secrecyLevel === 'secret' ? '保密' : '普通'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-32 shrink-0">是否平台卡位：</span>
                    <span className="text-gray-800">{detailItem.isPlatform === 'yes' ? '是' : '否'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">预算金额：</span>
                    <span className="text-gray-800">{detailItem.budget} 万元</span>
                  </div>
                  <div className="flex col-span-2">
                    <span className="text-gray-500 w-24 shrink-0">线索描述：</span>
                    <span className="text-gray-800">{detailItem.description}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">线索创建人：</span>
                    <span className="text-gray-800">{detailItem.creator}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">创建时间：</span>
                    <span className="text-gray-800">{detailItem.createTime}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">线索状态：</span>
                    <span className="text-gray-800">{detailItem.status}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">线索填报人：</span>
                    <span className="text-gray-800">{detailItem.creator}</span>
                  </div>
                </div>
              </div>

              {/* 摸排工单信息 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">摸排工单信息</h4>
                </div>
                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 bg-white border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium whitespace-nowrap">工单编码</th>
                        <th className="text-left py-2 px-3 font-medium whitespace-nowrap">工单名称</th>
                        <th className="text-left py-2 px-3 font-medium whitespace-nowrap">工单类型</th>
                        <th className="text-left py-2 px-3 font-medium whitespace-nowrap">地市</th>
                        <th className="text-left py-2 px-3 font-medium whitespace-nowrap">区县</th>
                        <th className="text-left py-2 px-3 font-medium whitespace-nowrap">负责人</th>
                        <th className="text-left py-2 px-3 font-medium whitespace-nowrap">工单状态</th>
                        <th className="text-left py-2 px-3 font-medium whitespace-nowrap">创建人</th>
                        <th className="text-left py-2 px-3 font-medium whitespace-nowrap">创建时间</th>
                        <th className="text-left py-2 px-3 font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockWorkOrders.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="text-center py-4 text-gray-400 text-sm">暂无工单数据</td>
                        </tr>
                      ) : (
                        mockWorkOrders.map(wo => (
                          <tr key={wo.id} className="border-b border-gray-100 last:border-b-0 hover:bg-white">
                            <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.id}</td>
                            <td className="py-2 px-3 text-gray-800 whitespace-nowrap">{wo.name}</td>
                            <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.type}</td>
                            <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.city}</td>
                            <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.district}</td>
                            <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.manager}</td>
                            <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.status}</td>
                            <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.creator}</td>
                            <td className="py-2 px-3 text-gray-500 whitespace-nowrap">{wo.createTime}</td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <button
                                onClick={() => setShowWorkOrderDetail(wo)}
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                详情
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 流程轨迹信息 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">流程轨迹</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="space-y-3">
                    {mockFlowTrails.map((trail, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-2 h-2 rounded-full bg-[#1677FF]" />
                          {idx !== mockFlowTrails.length - 1 && (
                            <div className="w-px flex-1 bg-gray-300 mt-1" style={{ minHeight: '20px' }} />
                          )}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{trail.action}</span>
                            <span className="text-xs text-gray-400">{trail.time}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            操作人：{trail.operator} · {trail.remark}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setDetailItem(null)}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                关闭
              </button>
            </div>
          </div>
        </>
      )}

      {/* 工单详情弹窗 */}
      {showWorkOrderDetail && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-[60]"
            onClick={() => setShowWorkOrderDetail(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[560px] max-h-[85vh] flex flex-col z-[60]">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">工单详情</h3>
              <button
                onClick={() => setShowWorkOrderDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* 工单信息 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">工单信息</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm bg-gray-50 p-4 rounded-md">
                  <div className="flex col-span-2">
                    <span className="text-gray-500 w-24 shrink-0">工单名称：</span>
                    <span className="text-gray-800">{showWorkOrderDetail.name}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">工单编码：</span>
                    <span className="text-gray-800">{showWorkOrderDetail.id}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">工单类型：</span>
                    <span className="text-gray-800">{showWorkOrderDetail.type}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">地市：</span>
                    <span className="text-gray-800">{showWorkOrderDetail.city}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">区县：</span>
                    <span className="text-gray-800">{showWorkOrderDetail.district}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">负责人：</span>
                    <span className="text-gray-800">{showWorkOrderDetail.manager}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">工单状态：</span>
                    <span className="text-gray-800">{showWorkOrderDetail.status}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">创建人：</span>
                    <span className="text-gray-800">{showWorkOrderDetail.creator}</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0">创建时间：</span>
                    <span className="text-gray-800">{showWorkOrderDetail.createTime}</span>
                  </div>
                </div>
              </div>

              {/* 流程轨迹 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">流程轨迹</h4>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="space-y-3">
                    {mockFlowTrails.map((trail, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-2 h-2 rounded-full bg-[#1677FF]" />
                          {idx !== mockFlowTrails.length - 1 && (
                            <div className="w-px flex-1 bg-gray-300 mt-1" style={{ minHeight: '20px' }} />
                          )}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{trail.action}</span>
                            <span className="text-xs text-gray-400">{trail.time}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            操作人：{trail.operator} · {trail.remark}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowWorkOrderDetail(null)}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                关闭
              </button>
            </div>
          </div>
        </>
      )}

      {/* 转派选择人员弹窗 */}
      {transferItem && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-50"
            onClick={() => setTransferItem(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[500px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium text-gray-800">选择转派人员</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  线索编码：{transferItem.id}
                </p>
              </div>
              <button
                onClick={() => setTransferItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-100">
              <input
                type="text"
                value={transferSearch}
                onChange={(e) => setTransferSearch(e.target.value)}
                placeholder="搜索员工姓名"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {employeeList.filter(e => !transferSearch.trim() || e.name.includes(transferSearch)).length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">未找到员工</div>
              ) : (
                employeeList
                  .filter(e => !transferSearch.trim() || e.name.includes(transferSearch))
                  .map(employee => (
                    <div
                      key={employee.id}
                      onClick={() => handleConfirmTransfer(employee.name)}
                      className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-800">{employee.name}</span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 共享线索处理页面 */}
      {processItem && (
        <SharedClueProcess
          item={processItem}
          onClose={() => setProcessItem(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}
