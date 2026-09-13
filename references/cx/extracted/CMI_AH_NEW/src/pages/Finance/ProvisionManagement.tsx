import { useState, useMemo } from 'react'
import { Search, RotateCcw, RefreshCw, Edit, FileText, Plus, Copy } from 'lucide-react'

interface ProvisionManagementProps {
  onNavigate?: (path: string) => void
}

interface ProvisionItem {
  id: string
  uniqueId: string
  code: string
  erpCode: string
  projectCode: string
  projectName: string
  amount: string
  status: string
  approvalStatus: string
  initiator: string
  dept: string
  createTime: string
  provisionMonth: string
}

// 计提单状态枚举
const provisionStatusOptions = [
  { value: '', label: '全部' },
  { value: 'cancelled', label: '已作废' },
  { value: 'audited', label: '审核完成' },
  { value: 'submitted', label: '已提交' },
  { value: 'completed', label: '已完成' },
  { value: 'draft', label: '草稿' }
]

// 省内审批状态枚举
const approvalStatusOptions = [
  { value: '', label: '全部' },
  { value: 'draft', label: '草稿' },
  { value: 'pending', label: '待审批' },
  { value: 'approved', label: '审批通过' },
  { value: 'rejected', label: '审批不通过' },
  { value: 'exempt', label: '免审批' },
  { value: 'closed', label: '关单' }
]

// 计提单状态文字映射
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    cancelled: '已作废',
    audited: '审核完成',
    submitted: '已提交',
    completed: '已完成',
    draft: '草稿',
    '': ''
  }
  return map[status] || status
}

// 计提单状态样式映射
const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    cancelled: 'text-gray-500 bg-gray-100',
    audited: 'text-green-600 bg-green-50',
    submitted: 'text-blue-600 bg-blue-50',
    completed: 'text-green-600 bg-green-50',
    draft: 'text-orange-600 bg-orange-50',
    '': 'text-gray-500 bg-gray-100'
  }
  return map[status] || 'text-gray-500 bg-gray-100'
}

// 省内审批状态文字映射
const getApprovalText = (status: string) => {
  const map: Record<string, string> = {
    draft: '草稿',
    pending: '待审批',
    approved: '审批通过',
    rejected: '审批不通过',
    exempt: '免审批',
    closed: '关单'
  }
  return map[status] || status
}

// 省内审批状态样式映射
const getApprovalClass = (status: string) => {
  const map: Record<string, string> = {
    draft: 'text-gray-600 bg-gray-100',
    pending: 'text-orange-600 bg-orange-50',
    approved: 'text-green-600 bg-green-50',
    rejected: 'text-red-600 bg-red-50',
    exempt: 'text-blue-600 bg-blue-50',
    closed: 'text-gray-500 bg-gray-100'
  }
  return map[status] || 'text-gray-500 bg-gray-100'
}

const provisionProjectNames = [
  '合肥市第一人民医院智慧医疗项目',
  '芜湖市政务服务中心数字政府项目',
  '蚌埠市教育局智慧教育项目',
  '合肥市轨道交通集团智慧交通项目',
  '安徽省公安厅智慧城市项目'
]

const provisionProjectCodes = ['PRJ-2026-HF-001', 'PRJ-2026-WH-002', 'PRJ-2026-BB-003', 'PRJ-2026-HF-004', 'PRJ-2026-AH-005']

const mockProvisions: ProvisionItem[] = Array.from({ length: 23 }).map((_, i) => {
  const statusList = ['cancelled', 'audited', 'submitted', 'completed', 'draft', '', 'submitted', 'draft', 'audited', 'cancelled', 'completed', 'draft']
  const approvalList = ['closed', 'approved', 'exempt', 'closed', 'exempt', 'draft', 'pending', 'rejected', 'approved', 'closed', 'closed', 'approved']
  const status = statusList[i % statusList.length]
  const approval = approvalList[i % approvalList.length]
  const projectIdx = i % 5

  return {
    id: `prov-${i + 1}`,
    uniqueId: `UID-${String(i + 1).padStart(8, '0')}`,
    code: `JT${2026}${String((i % 12) + 1).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`,
    erpCode: `ERP${2026}${String((i % 12) + 1).padStart(2, '0')}${String(i + 1).padStart(5, '0')}`,
    projectCode: provisionProjectCodes[projectIdx],
    projectName: provisionProjectNames[projectIdx],
    amount: ((i + 1) * 15680.55).toFixed(2),
    status,
    approvalStatus: approval,
    initiator: ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'][i % 8],
    dept: ['财务部', '市场部', '技术部', '运营部', '人力资源部', '采购部'][i % 6],
    createTime: `2026-${String((i % 6) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')} ${String((i * 3) % 24).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00`,
    provisionMonth: `2026-${String((i % 12) + 1).padStart(2, '0')}`
  }
})

interface FilterForm {
  erpCode: string
  projectCode: string
  projectName: string
  initiator: string
  createTimeStart: string
  createTimeEnd: string
  status: string
}

const defaultFilter: FilterForm = {
  erpCode: '',
  projectCode: '',
  projectName: '',
  initiator: '',
  createTimeStart: '',
  createTimeEnd: '',
  status: ''
}

export default function ProvisionManagement({ onNavigate }: ProvisionManagementProps) {
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [list, setList] = useState<ProvisionItem[]>(mockProvisions)

  const filteredList = useMemo(() => {
    return list.filter(item => {
      const erpCodeMatch = !submittedFilter.erpCode.trim() || item.erpCode.includes(submittedFilter.erpCode.trim())
      const projectCodeMatch = !submittedFilter.projectCode.trim() || item.projectCode.includes(submittedFilter.projectCode.trim())
      const projectNameMatch = !submittedFilter.projectName.trim() || item.projectName.includes(submittedFilter.projectName.trim())
      const initiatorMatch = !submittedFilter.initiator.trim() || item.initiator.includes(submittedFilter.initiator.trim())
      const timeMatch = (!submittedFilter.createTimeStart || item.createTime >= submittedFilter.createTimeStart)
        && (!submittedFilter.createTimeEnd || item.createTime <= submittedFilter.createTimeEnd + ' 23:59:59')
      const statusMatch = !submittedFilter.status || item.status === submittedFilter.status
      return erpCodeMatch && projectCodeMatch && projectNameMatch && initiatorMatch && timeMatch && statusMatch
    })
  }, [submittedFilter, list])

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

  const handleRefreshStatus = (item: ProvisionItem) => {
    const statuses = ['draft', 'submitted', 'audited', 'completed']
    const approvals = ['draft', 'pending', 'approved', 'closed']
    const currentIdx = statuses.indexOf(item.status)
    const nextIdx = (currentIdx + 1) % statuses.length
    setList(prev => prev.map(p =>
      p.id === item.id
        ? { ...p, status: statuses[nextIdx], approvalStatus: approvals[nextIdx] }
        : p
    ))
  }

  const handleDetail = (item: ProvisionItem) => {
    onNavigate && onNavigate(`/finance/expense/provision/detail/${item.id}`)
  }

  const handleEdit = (item: ProvisionItem) => {
    onNavigate && onNavigate(`/finance/expense/provision/edit/${item.id}`)
  }

  // 复制：报账单状态不为草稿时展示
  const canCopy = (item: ProvisionItem) => {
    return item.status !== 'draft'
  }

  const handleCopy = (item: ProvisionItem) => {
    onNavigate && onNavigate(`/finance/expense/provision/copy/${item.id}`)
  }

  // 是否显示"刷新状态"按钮：计提单状态不为已作废、已完成
  const canRefreshStatus = (item: ProvisionItem) => {
    return item.status !== 'cancelled' && item.status !== 'completed'
  }

  // 是否显示"修改"按钮：仅报账单状态为草稿时展示
  const canEdit = (item: ProvisionItem) => {
    return item.status === 'draft'
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 查询条件 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">ERP报账单编号</label>
              <input
                type="text"
                value={filter.erpCode}
                onChange={(e) => handleChange('erpCode', e.target.value)}
                placeholder="请输入ERP报账单编号"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">全网项目编码</label>
              <input
                type="text"
                value={filter.projectCode}
                onChange={(e) => handleChange('projectCode', e.target.value)}
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
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">报账人</label>
              <input
                type="text"
                value={filter.initiator}
                onChange={(e) => handleChange('initiator', e.target.value)}
                placeholder="请输入报账人"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">报账时间</label>
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
            <div className="flex items-center gap-2">
              <label className="w-24 text-right text-sm text-gray-700 shrink-0">报账单状态</label>
              <select
                value={filter.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
              >
                {provisionStatusOptions.map(opt => (
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

        {/* 计提单列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">计提单列表</h3>
              <span className="text-xs text-gray-400">共 {filteredList.length} 条</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('/finance/expense/provision/create-with-contract')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#1677FF] bg-white border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                发起计提
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">AICT报账单编号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">ERP报账单编号</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">报账金额（元）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账人</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账部门</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账单状态</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  pagedList.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-[#1677FF] hover:underline cursor-pointer whitespace-nowrap font-medium" onClick={() => handleDetail(item)}>{item.code}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.erpCode}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{item.amount}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.initiator}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.dept}</td>
                      <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{item.createTime}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${getStatusClass(item.status)}`}>
                          {getStatusText(item.status) || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDetail(item)}
                            className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-[#1668DD] hover:underline"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            详情
                          </button>
                          {canEdit(item) && (
                            <button
                              type="button"
                              onClick={() => handleEdit(item)}
                              className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-[#1668DD] hover:underline"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              修改
                            </button>
                          )}
                          {canCopy(item) && (
                            <button
                              type="button"
                              onClick={() => handleCopy(item)}
                              className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-[#1668DD] hover:underline"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              复制
                            </button>
                          )}
                          {canRefreshStatus(item) && (
                            <button
                              type="button"
                              onClick={() => handleRefreshStatus(item)}
                              className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-[#1668DD] hover:underline"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              刷新状态
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
      </div>
    </div>
  )
}
