import { useState, useMemo } from 'react'
import {
  Search,
  RotateCcw,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Info
} from 'lucide-react'
import { clsx } from 'clsx'

// 安徽省地市
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

const districts = [
  { value: '', label: '全部' },
  { value: 'yaohai', label: '瑶海区' },
  { value: 'luyang', label: '庐阳区' },
  { value: 'shushan', label: '蜀山区' },
  { value: 'baohe', label: '包河区' },
  { value: 'shibanshi', label: '市本部' }
]

// 商机状态
const businessStatus = [
  { value: '', label: '全部' },
  { value: 'auditing', label: '审核中' },
  { value: 'processing', label: '处理中' },
  { value: 'approved', label: '已立项' },
  { value: 'abandoned', label: '已废弃' },
  { value: 'closed', label: '已关闭' }
]

// 商机阶段
const businessStage = [
  { value: '', label: '全部' },
  { value: 'discovery', label: '商机发现' },
  { value: 'verification', label: '商机验证' },
  { value: 'negotiation', label: '商务谈判' },
  { value: 'delivery', label: '交付中' }
]

// 商机等级
const businessLevel = [
  { value: '', label: '全部' },
  { value: 'S', label: 'S' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' }
]

// 行业类别
const subIndustries = [
  '', '公安', '政府', '教育', '医疗', '金融', '能源', '交通',
  '旅游', '商业', '制造', '农业', '水利', '媒体', '运营商', '其他'
]

// 细分领域
const subFields = [
  '', '人工智能', '大数据', '云计算', '物联网', '区块链',
  '5G通信', '智慧城市', '工业互联网', '网络安全', '信创',
  '数字政府', '智慧医疗', '智慧教育', '智慧交通', '智慧园区',
  '智慧能源', '智慧金融', '智慧农业', '其他'
]

// 省/市公司BU
const buOptions = [
  '', '政企客户部', '网络部', '市场部', '客户服务部',
  '信息化部', '系统集成部', '产品中心', '创新业务部', '其他'
]

const customers = [
  '合肥市第一人民医院', '芜湖市政务服务中心', '蚌埠市教育局',
  '安徽医科大学附属医院', '合肥市轨道交通集团', '安徽省公安厅',
  '滁州市智慧城市运营中心', '阜阳市公安局'
]

const creators = ['张凯', '李华', '王强', '赵明', '陈静', '刘洋']

// 模拟商机数据
const mockOpportunityList = Array.from({ length: 38 }).map((_, i) => {
  const statusOptions = ['审核中', '处理中', '已立项', '已废弃', '已关闭']
  const status = statusOptions[i % statusOptions.length]
  const amount = Math.floor(Math.random() * 5000) + 50
  let level = 'D'
  if (amount >= 3000) level = 'S'
  else if (amount >= 1000) level = 'A'
  else if (amount >= 100) level = 'B'
  else if (amount >= 50) level = 'C'
  return {
    id: `BO${(2026000 + i + 1).toString()}`,
    netId: `NW${(20260000 + i + 1).toString()}`,
    name: `${customers[i % customers.length]}商机${i + 1}`,
    amount,
    city: cities[1 + (i % 16)].label,
    district: districts[1 + (i % 5)].label,
    customer: customers[i % customers.length],
    status,
    stage: businessStage[1 + (i % 4)].label,
    level,
    subIndustry: subIndustries[1 + (i % (subIndustries.length - 1))],
    subField: subFields[1 + (i % (subFields.length - 1))],
    bu: buOptions[1 + (i % (buOptions.length - 1))],
    creator: creators[i % creators.length],
    createTime: `2026-${String((i % 6) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')} ${String((i % 24)).padStart(2, '0')}:00`
  }
})

interface FilterForm {
  businessCode: string
  netBusinessCode: string
  businessName: string
  city: string
  district: string
  customer: string
  status: string
  stage: string
  level: string
  subIndustry: string
  subField: string
  bu: string
  creator: string
  amountMin: string
  amountMax: string
  createTimeStart: string
  createTimeEnd: string
}

const defaultFilter: FilterForm = {
  businessCode: '',
  netBusinessCode: '',
  businessName: '',
  city: '',
  district: '',
  customer: '',
  status: '',
  stage: '',
  level: '',
  subIndustry: '',
  subField: '',
  bu: '',
  creator: '',
  amountMin: '',
  amountMax: '',
  createTimeStart: '',
  createTimeEnd: ''
}

interface OpportunityItem {
  id: string
  netId: string
  name: string
  amount: number
  city: string
  district: string
  customer: string
  status: string
  stage: string
  level: string
  subIndustry: string
  subField: string
  bu: string
  creator: string
  createTime: string
}

interface TeamMember {
  id: string
  role: string
  name: string
  account: string
  dept: string
  personType: string
  contributionRate: string
  phone: string
  joinTime: string
}

type ChangeType = 'basic' | 'handler' | 'team' | ''

// 模拟拓展团队数据
const mockTeam: TeamMember[] = [
  { id: '1', role: '客户经理', name: '张凯', account: 'zhangkai', dept: '合肥政企客户部', personType: '自有人员', contributionRate: '30', phone: '13800000001', joinTime: '2026-01-15' },
  { id: '2', role: '解决方案经理', name: '李华', account: 'lihua', dept: '合肥政企客户部', personType: '自有人员', contributionRate: '25', phone: '13800000002', joinTime: '2026-01-20' },
  { id: '3', role: '交付经理', name: '王强', account: 'wangqiang', dept: '合肥网络部', personType: '自有人员', contributionRate: '20', phone: '13800000003', joinTime: '2026-02-01' },
  { id: '4', role: '商务经理', name: '赵明', account: 'zhaoming', dept: '省政企客户部', personType: '自有人员', contributionRate: '25', phone: '13800000004', joinTime: '2026-02-10' }
]

// 角色选项
const teamRoles = ['客户经理', '技术经理', '产品经理', '商务经理', '拓展经理', '方案经理']

// 商机来源
const businessSources = [
  '客户经理走访', '客户主动咨询', '合作伙伴推荐', '展会/推介会',
  '老客户介绍', '公开招投标', '线上营销', '其他'
]

// 业务跨域类型
const crossDomainTypes = ['本地', '跨地市', '跨省']

// 客情关系
const customerStatuses = ['关系好', '关系一般']

// 项目紧急程度
const projectTaboos = ['长期培育', '短期攻关', '临时项目', '其他']

// 项目类型
const projectTypes = ['ICT项目', '网格DICT项目']

// 人员类型
const personTypes = ['自有人员', '三方人员', '合作伙伴', '其他']

// 第一责任人候选
const handlerCandidates = [
  { id: 'h1', name: '张凯', dept: '合肥政企客户部', role: '客户经理', remark: '负责医疗行业' },
  { id: 'h2', name: '李华', dept: '芜湖政企客户部', role: '客户经理', remark: '负责教育行业' },
  { id: 'h3', name: '王强', dept: '省政企客户部', role: '高级客户经理', remark: '负责大型政企项目' },
  { id: 'h4', name: '赵明', dept: '合肥政企客户部', role: '解决方案经理', remark: '智慧城市专家' },
  { id: 'h5', name: '陈静', dept: '省政企客户部', role: '二级经理', remark: '医疗BU负责人' },
  { id: 'h6', name: '刘洋', dept: '蚌埠政企客户部', role: '客户经理', remark: '负责政企项目' }
]

// 商机等级说明
const businessLevelDesc: Record<string, string> = {
  S: '预估金额≥3000万元\n需及时上报省公司战客中心\n省公司BU二级经理、市公司分管二级经理作为第一责任人进行看管',
  A: '预估金额介于1000万元-3000万元(不含)区间\n需及时上报地市公司\n省公司BU二级经理、市公司分管二级经理作为第一责任人进行看管',
  B: '预估金额介于100万元-1000万元(不含)区间\n省公司BU三级经理/市公司BU三级经理/区县（营销中心）三级经理作为第一责任人进行看管',
  C: '预估金额介于50万元-100万元(不含)区间\n省公司BU客户经理/市公司BU总监/区县政企业务负责人作为第一责任人进行看管',
  D: '预估金额小于50万元\n由客户经理担任第一责任人进行看管'
}

// 根据预估金额计算商机等级
function getBusinessLevel(amount: number): string {
  if (amount >= 3000) return 'S'
  if (amount >= 1000) return 'A'
  if (amount >= 100) return 'B'
  if (amount >= 50) return 'C'
  return 'D'
}

interface OpportunityManageProps {
  onNavigate?: (path: string) => void
}

export default function OpportunityManage({ onNavigate }: OpportunityManageProps) {
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [filterExpanded, setFilterExpanded] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // 变更弹窗
  const [changeModalOpen, setChangeModalOpen] = useState(false)
  const [changeType, setChangeType] = useState<ChangeType>('')
  const [changeItem, setChangeItem] = useState<OpportunityItem | null>(null)

  // 商机基本信息变更表单
  const [basicForm, setBasicForm] = useState({
    businessName: '',
    city: '',
    district: '',
    businessSource: '',
    crossDomainType: '',
    customerStatus: '',
    projectTaboo: '',
    estimatedAmount: '',
    businessLevel: 'D',
    projectType: 'ICT项目'
  })

  // 第一负责人变更表单
  const [handlerForm, setHandlerForm] = useState({
    primaryHandler: '',
    handlerLevel: 'D',
    reason: ''
  })

  // 拓展团队变更表单
  const [teamForm, setTeamForm] = useState<TeamMember[]>(mockTeam)
  const [teamChangeReason, setTeamChangeReason] = useState('')

  // 团队成员详情/编辑弹窗
  const [teamMemberModal, setTeamMemberModal] = useState(false)
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null)
  const [isEditingTeam, setIsEditingTeam] = useState(false)

  // 第一责任人选择弹窗
  const [handlerPickerOpen, setHandlerPickerOpen] = useState(false)
  const [handlerSearch, setHandlerSearch] = useState('')

  // 商机等级提示
  const [levelTipOpen, setLevelTipOpen] = useState<string | null>(null)

  // 标签名到标签值的映射（用于弹窗显示当前商机名称/编码）
  const filteredHandlers = useMemo(() => {
    if (!handlerSearch.trim()) return handlerCandidates
    return handlerCandidates.filter(h =>
      h.name.includes(handlerSearch) || h.dept.includes(handlerSearch)
    )
  }, [handlerSearch])

  const openChangeModal = (item: OpportunityItem) => {
    setChangeItem(item)
    setChangeType('')
    // 根据 label 找 value
    const cityEntry = cities.find(c => c.label === item.city)
    const districtEntry = districts.find(d => d.label === item.district)
    setBasicForm({
      businessName: item.name,
      city: cityEntry?.value || '',
      district: districtEntry?.value || '',
      businessSource: '',
      crossDomainType: '本地',
      customerStatus: '关系好',
      projectTaboo: '长期培育',
      estimatedAmount: item.amount.toString(),
      businessLevel: item.level,
      projectType: 'ICT项目'
    })
    setHandlerForm({ primaryHandler: item.creator, handlerLevel: item.level, reason: '' })
    setTeamForm(mockTeam.map(t => ({ ...t })))
    setTeamChangeReason('')
    setChangeModalOpen(true)
  }

  const closeChangeModal = () => {
    setChangeModalOpen(false)
    setChangeType('')
    setChangeItem(null)
  }

  const handleBasicSubmit = () => {
    if (!basicForm.businessName.trim()) {
      alert('请输入商机名称')
      return
    }
    alert('商机基本信息变更已提交')
    closeChangeModal()
  }

  const handleHandlerSubmit = () => {
    if (!handlerForm.primaryHandler) {
      alert('请选择第一责任人')
      return
    }
    if (!handlerForm.reason.trim()) {
      alert('请输入变更原因')
      return
    }
    alert('第一责任人变更已提交')
    closeChangeModal()
  }

  const handleTeamSubmit = () => {
    if (!teamChangeReason.trim()) {
      alert('请输入变更原因')
      return
    }
    if (teamForm.length === 0) {
      alert('请至少保留一位团队成员')
      return
    }
    alert('拓展团队变更已提交')
    closeChangeModal()
  }

  // 添加团队成员
  const handleAddTeamMember = () => {
    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      role: '客户经理',
      name: '',
      account: '',
      dept: '',
      personType: '自有人员',
      contributionRate: '',
      phone: '',
      joinTime: new Date().toISOString().split('T')[0]
    }
    setEditingTeamMember(newMember)
    setIsEditingTeam(true)
    setTeamMemberModal(true)
  }

  // 编辑团队成员
  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember({ ...member })
    setIsEditingTeam(true)
    setTeamMemberModal(true)
  }

  // 查看团队成员
  const handleViewTeamMember = (member: TeamMember) => {
    setEditingTeamMember({ ...member })
    setIsEditingTeam(false)
    setTeamMemberModal(true)
  }

  // 保存团队成员
  const handleSaveTeamMember = () => {
    if (!editingTeamMember) return
    if (!editingTeamMember.name.trim()) {
      alert('请输入成员姓名')
      return
    }
    const exists = teamForm.some(m => m.id === editingTeamMember.id)
    if (exists) {
      setTeamForm(prev => prev.map(m => m.id === editingTeamMember.id ? editingTeamMember : m))
    } else {
      setTeamForm(prev => [...prev, editingTeamMember])
    }
    setTeamMemberModal(false)
    setEditingTeamMember(null)
  }

  // 删除团队成员
  const handleDeleteTeamMember = (id: string) => {
    if (!confirm('确定删除该团队成员？')) return
    setTeamForm(prev => prev.filter(m => m.id !== id))
  }

  // 选择第一责任人
  const handleSelectHandler = (name: string) => {
    setHandlerForm(prev => ({ ...prev, primaryHandler: name }))
    setHandlerPickerOpen(false)
    setHandlerSearch('')
  }

  const handleFilterChange = <K extends keyof FilterForm>(key: K, value: FilterForm[K]) => {
    setFilter(prev => ({ ...prev, [key]: value }))
  }

  const handleReset = () => {
    setFilter(defaultFilter)
    setPage(1)
  }

  const handleSearch = () => {
    setPage(1)
  }

  // 过滤
  const filteredList = useMemo(() => {
    return mockOpportunityList.filter(item => {
      if (filter.businessCode && !item.id.includes(filter.businessCode)) return false
      if (filter.netBusinessCode && !item.netId.includes(filter.netBusinessCode)) return false
      if (filter.businessName && !item.name.includes(filter.businessName)) return false
      if (filter.city && item.city !== cities.find(c => c.value === filter.city)?.label) return false
      if (filter.district && item.district !== districts.find(d => d.value === filter.district)?.label) return false
      if (filter.customer && !item.customer.includes(filter.customer)) return false
      if (filter.status && item.status !== businessStatus.find(s => s.value === filter.status)?.label) return false
      if (filter.stage && item.stage !== businessStage.find(s => s.value === filter.stage)?.label) return false
      if (filter.level && item.level !== filter.level) return false
      if (filter.subIndustry && item.subIndustry !== filter.subIndustry) return false
      if (filter.subField && item.subField !== filter.subField) return false
      if (filter.bu && item.bu !== filter.bu) return false
      if (filter.creator && item.creator !== filter.creator) return false
      if (filter.amountMin && item.amount < parseFloat(filter.amountMin)) return false
      if (filter.amountMax && item.amount > parseFloat(filter.amountMax)) return false
      if (filter.createTimeStart && item.createTime < filter.createTimeStart) return false
      if (filter.createTimeEnd && item.createTime > filter.createTimeEnd + ' 23:59') return false
      return true
    })
  }, [filter])

  // 分页
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize))
  const pagedList = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredList.slice(start, start + pageSize)
  }, [filteredList, page])

  // 操作按钮
  const handleNewOpportunity = () => {
    if (onNavigate) onNavigate('/business/opportunity/input')
    else window.open('/business/opportunity/input', '_blank')
  }

  const handleExport = () => {
    alert(`导出 ${filteredList.length} 条商机数据`)
  }

  // 根据状态显示操作按钮
  const renderRowActions = (item: OpportunityItem) => {
    const status = item.status
    const actions: { key: string; label: string }[] = []

    if (status === '审核中') {
      actions.push(
        { key: 'detail', label: '详情' },
        { key: 'abandon', label: '废弃' }
      )
    } else if (status === '处理中') {
      actions.push(
        { key: 'follow', label: '跟进' },
        { key: 'upgrade', label: '提级' },
        { key: 'change', label: '变更' },
        { key: 'close', label: '关闭' }
      )
    } else if (status === '已废弃' || status === '已关闭') {
      actions.push(
        { key: 'recover', label: '恢复' },
        { key: 'rebuild', label: '重建' }
      )
    } else {
      actions.push({ key: 'detail', label: '详情' })
    }

    return (
      <div className="flex items-center gap-3 text-blue-600">
        {actions.map(a => (
          <button
            key={a.key}
            type="button"
            onClick={() => {
              if (a.key === 'change') {
                openChangeModal(item)
                return
              }
              alert(`${a.label}：${status}`)
            }}
            className="hover:text-blue-800 hover:underline"
          >
            {a.label}
          </button>
        ))}
      </div>
    )
  }

  // 状态颜色
  const statusColor = (status: string) => {
    if (status === '审核中') return 'bg-blue-100 text-blue-700'
    if (status === '处理中') return 'bg-orange-100 text-orange-700'
    if (status === '已立项') return 'bg-green-100 text-green-700'
    if (status === '已废弃') return 'bg-gray-100 text-gray-600'
    if (status === '已关闭') return 'bg-red-100 text-red-600'
    return 'bg-gray-100 text-gray-700'
  }

  const levelColor = (level: string) => {
    if (level === 'S') return 'bg-red-100 text-red-700'
    if (level === 'A') return 'bg-orange-100 text-orange-700'
    if (level === 'B') return 'bg-blue-100 text-blue-700'
    if (level === 'C') return 'bg-cyan-100 text-cyan-700'
    return 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="max-w-full">
        {/* 查询区域 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-3">
          <div className="flex items-center justify-between mb-3 cursor-pointer select-none" onClick={() => setFilterExpanded(v => !v)}>
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
          <div className="grid grid-cols-4 gap-x-6 gap-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">商机编码</label>
              <input
                type="text"
                value={filter.businessCode}
                onChange={(e) => handleFilterChange('businessCode', e.target.value)}
                placeholder="请输入商机编码"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">全网商机编码</label>
              <input
                type="text"
                value={filter.netBusinessCode}
                onChange={(e) => handleFilterChange('netBusinessCode', e.target.value)}
                placeholder="请输入全网商机编码"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">商机名称</label>
              <input
                type="text"
                value={filter.businessName}
                onChange={(e) => handleFilterChange('businessName', e.target.value)}
                placeholder="请输入商机名称"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">归属地市</label>
              <select
                value={filter.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {cities.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">归属区县</label>
              <select
                value={filter.district}
                onChange={(e) => handleFilterChange('district', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {districts.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">客户</label>
              <input
                type="text"
                value={filter.customer}
                onChange={(e) => handleFilterChange('customer', e.target.value)}
                placeholder="请输入客户名称"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">商机状态</label>
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {businessStatus.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">商机阶段</label>
              <select
                value={filter.stage}
                onChange={(e) => handleFilterChange('stage', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {businessStage.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {filterExpanded && (
              <>
            <div>
              <label className="block text-sm text-gray-700 mb-1">商机等级</label>
              <select
                value={filter.level}
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {businessLevel.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">行业类别</label>
              <select
                value={filter.subIndustry}
                onChange={(e) => handleFilterChange('subIndustry', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {subIndustries.map(i => <option key={i} value={i}>{i || '全部'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">细分领域</label>
              <select
                value={filter.subField}
                onChange={(e) => handleFilterChange('subField', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {subFields.map(f => <option key={f} value={f}>{f || '全部'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">省/市公司BU</label>
              <select
                value={filter.bu}
                onChange={(e) => handleFilterChange('bu', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                {buOptions.map(b => <option key={b} value={b}>{b || '全部'}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">创建人</label>
              <select
                value={filter.creator}
                onChange={(e) => handleFilterChange('creator', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="">全部</option>
                {creators.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">预估金额(万)起</label>
              <input
                type="number"
                value={filter.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                placeholder="最低金额"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">预估金额(万)止</label>
              <input
                type="number"
                value={filter.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                placeholder="最高金额"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">创建时间起</label>
              <input
                type="date"
                value={filter.createTimeStart}
                onChange={(e) => handleFilterChange('createTimeStart', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">创建时间止</label>
              <input
                type="date"
                value={filter.createTimeEnd}
                onChange={(e) => handleFilterChange('createTimeEnd', e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              查询
            </button>
          </div>
        </div>

        {/* 列表区域 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          {/* 操作按钮 */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">
              共 <span className="font-semibold text-blue-600">{filteredList.length}</span> 条
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNewOpportunity}
                className="px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                新建商机
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="px-3 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                导出
              </button>
            </div>
          </div>

          {/* 列表 */}
          <div className="border border-gray-200 rounded overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">商机编码</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">全网商机编码</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap min-w-[180px]">商机名称</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">预估金额(万元)</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">归属地市</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">归属区县</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap min-w-[180px]">客户</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">商机状态</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">商机阶段</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">商机等级</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">行业类别</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">细分领域</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">省/市公司BU</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">创建人</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap">创建时间</th>
                  <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 whitespace-nowrap sticky right-0 bg-gray-50 z-10 min-w-[180px]">操作</th>
                </tr>
              </thead>
              <tbody>
                {pagedList.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="text-center py-8 text-gray-400 text-sm">暂无数据</td>
                  </tr>
                ) : (
                  pagedList.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-800 whitespace-nowrap">{item.id}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700 whitespace-nowrap">{item.netId}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-800 min-w-[180px]">
                        <div className="truncate max-w-[240px]" title={item.name}>{item.name}</div>
                      </td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-800 whitespace-nowrap font-medium">
                        {item.amount.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700 whitespace-nowrap">{item.city}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700 whitespace-nowrap">{item.district}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700 min-w-[180px]">
                        <div className="truncate max-w-[200px]" title={item.customer}>{item.customer}</div>
                      </td>
                      <td className="px-3 py-2.5 border-b border-gray-100 whitespace-nowrap">
                        <span className={clsx('px-2 py-0.5 text-xs rounded', statusColor(item.status))}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700 whitespace-nowrap">{item.stage}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 whitespace-nowrap">
                        <span className={clsx('px-2 py-0.5 text-xs rounded font-medium', levelColor(item.level))}>
                          {item.level}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700 whitespace-nowrap">{item.subIndustry}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700 whitespace-nowrap">{item.subField}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700 whitespace-nowrap">{item.bu}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700 whitespace-nowrap">{item.creator}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700 whitespace-nowrap">{item.createTime}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 whitespace-nowrap sticky right-0 bg-white z-10">{renderRowActions(item)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {filteredList.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                第 <span className="font-medium">{(page - 1) * pageSize + 1}</span>-<span className="font-medium">{Math.min(page * pageSize, filteredList.length)}</span> 条 / 共 <span className="font-medium">{filteredList.length}</span> 条
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) => p === 'ellipsis' ? (
                    <span key={`e-${i}`} className="px-2 text-gray-400">...</span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p as number)}
                      className={clsx(
                        'min-w-[32px] px-2 py-1 text-sm border rounded',
                        page === p ? 'bg-[#1677FF] text-white border-[#1677FF]' : 'border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 ml-2">每页 {pageSize} 条</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== 变更弹窗 ========== */}
      {changeModalOpen && changeItem && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" onClick={closeChangeModal} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl w-[920px] max-h-[88vh] flex flex-col z-50">
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-800">
                {changeType === '' && '商机变更'}
                {changeType === 'basic' && '商机基本信息变更'}
                {changeType === 'handler' && '第一负责人变更'}
                {changeType === 'team' && '拓展团队变更'}
              </h3>
              <button onClick={closeChangeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {/* 步骤1：选择变更类型 */}
              {changeType === '' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">请选择本次变更的类型：</p>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: 'basic' as const, title: '商机基本信息变更', desc: '变更商机名称、归属地、预估金额、商机等级、客情关系等基本信息', icon: '📋' },
                      { key: 'handler' as const, title: '第一负责人变更', desc: '变更商机第一责任人，变更后会影响看管责任人', icon: '👤' },
                      { key: 'team' as const, title: '拓展团队变更', desc: '调整拓展团队成员（新增/编辑/删除）', icon: '👥' }
                    ].map(opt => (
                      <div
                        key={opt.key}
                        onClick={() => setChangeType(opt.key)}
                        className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-[#1677FF] hover:shadow-md transition-all"
                      >
                        <div className="text-3xl mb-2">{opt.icon}</div>
                        <div className="text-sm font-medium text-gray-800 mb-1.5">{opt.title}</div>
                        <div className="text-xs text-gray-500 leading-relaxed">{opt.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 步骤2：商机基本信息变更 */}
              {changeType === 'basic' && (
                <div>
                  {/* 只读编码信息 */}
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">商机编码</div>
                      <div className="text-sm font-medium text-gray-800">{changeItem.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">全网商机编码</div>
                      <div className="text-sm font-medium text-gray-800">{changeItem.netId}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div className="col-span-2">
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          <span className="text-red-500 mr-0.5">*</span>商机名称
                        </label>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={basicForm.businessName}
                            onChange={(e) => setBasicForm({ ...basicForm, businessName: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          <span className="text-red-500 mr-0.5">*</span>归属地市
                        </label>
                        <div className="flex-1 min-w-0">
                          <select
                            value={basicForm.city}
                            onChange={(e) => setBasicForm({ ...basicForm, city: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">请选择</option>
                            {cities.filter(c => c.value).map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          <span className="text-red-500 mr-0.5">*</span>归属区县
                        </label>
                        <div className="flex-1 min-w-0">
                          <select
                            value={basicForm.district}
                            onChange={(e) => setBasicForm({ ...basicForm, district: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">请选择</option>
                            {districts.filter(d => d.value).map(d => (
                              <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          <span className="text-red-500 mr-0.5">*</span>商机来源
                        </label>
                        <div className="flex-1 min-w-0">
                          <select
                            value={basicForm.businessSource}
                            onChange={(e) => setBasicForm({ ...basicForm, businessSource: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">请选择</option>
                            {businessSources.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          <span className="text-red-500 mr-0.5">*</span>业务跨域类型
                        </label>
                        <div className="flex-1 min-w-0">
                          <select
                            value={basicForm.crossDomainType}
                            onChange={(e) => setBasicForm({ ...basicForm, crossDomainType: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                          >
                            {crossDomainTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          <span className="text-red-500 mr-0.5">*</span>客情关系
                        </label>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 pt-2">
                            {customerStatuses.map(s => (
                              <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="basicCustomerStatus"
                                  value={s}
                                  checked={basicForm.customerStatus === s}
                                  onChange={() => setBasicForm({ ...basicForm, customerStatus: s })}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{s}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          <span className="text-red-500 mr-0.5">*</span>项目紧急程度
                        </label>
                        <div className="flex-1 min-w-0">
                          <select
                            value={basicForm.projectTaboo}
                            onChange={(e) => setBasicForm({ ...basicForm, projectTaboo: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="">请选择</option>
                            {projectTaboos.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          <span className="text-red-500 mr-0.5">*</span>预估金额
                        </label>
                        <div className="flex-1 min-w-0">
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={basicForm.estimatedAmount}
                              onChange={(e) => {
                                const cleaned = e.target.value.replace(/[^\d.]/g, '')
                                const firstDot = cleaned.indexOf('.')
                                const finalValue = firstDot !== -1
                                  ? cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
                                  : cleaned
                                setBasicForm(prev => {
                                  const num = parseFloat(finalValue)
                                  const newLevel = (!isNaN(num) && num > 0) ? getBusinessLevel(num) : prev.businessLevel
                                  return { ...prev, estimatedAmount: finalValue, businessLevel: newLevel }
                                })
                              }}
                              onBlur={() => {
                                const num = parseFloat(basicForm.estimatedAmount)
                                if (!isNaN(num)) {
                                  setBasicForm(prev => ({ ...prev, estimatedAmount: num.toFixed(2) }))
                                }
                              }}
                              className="w-full pl-3 pr-12 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">万元</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          <span className="text-red-500 mr-0.5">*</span>商机等级
                        </label>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 pt-1.5">
                            {(['S', 'A', 'B', 'C', 'D'] as const).map(lv => (
                              <label key={lv} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="basicBusinessLevel"
                                  value={lv}
                                  checked={basicForm.businessLevel === lv}
                                  onChange={() => setBasicForm({ ...basicForm, businessLevel: lv })}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{lv}</span>
                                <span
                                  className="relative inline-block"
                                  onMouseEnter={() => setLevelTipOpen(lv)}
                                  onMouseLeave={() => setLevelTipOpen(null)}
                                >
                                  <Info className="w-3.5 h-3.5 text-gray-400 hover:text-blue-500" />
                                  {levelTipOpen === lv && (
                                    <div className="absolute z-10 left-1/2 -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2.5 w-72 text-xs text-gray-700 whitespace-pre-line leading-relaxed">
                                      {businessLevelDesc[lv]}
                                    </div>
                                  )}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          <span className="text-red-500 mr-0.5">*</span>项目类型
                        </label>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4 pt-2">
                            {projectTypes.map(t => (
                              <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="radio"
                                  name="basicProjectType"
                                  value={t}
                                  checked={basicForm.projectType === t}
                                  onChange={() => setBasicForm({ ...basicForm, projectType: t })}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{t}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 步骤2：第一负责人变更 */}
              {changeType === 'handler' && (
                <div>
                  {/* 只读编码信息 */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">商机编码</div>
                      <div className="text-sm font-medium text-gray-800">{changeItem.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">全网商机编码</div>
                      <div className="text-sm font-medium text-gray-800">{changeItem.netId}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">商机名称</div>
                      <div className="text-sm font-medium text-gray-800 truncate" title={changeItem.name}>{changeItem.name}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          <span className="text-red-500 mr-0.5">*</span>第一责任人
                        </label>
                        <div className="flex-1 min-w-0">
                          <div className="relative">
                            <input
                              type="text"
                              value={handlerForm.primaryHandler}
                              onFocus={() => setHandlerPickerOpen(true)}
                              readOnly
                              placeholder="请选择第一责任人"
                              className="w-full pl-3 pr-9 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={() => setHandlerPickerOpen(true)}
                              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                          </div>
                          {handlerForm.primaryHandler && (
                            <p className="text-xs text-gray-500 mt-1">
                              {handlerCandidates.find(h => h.name === handlerForm.primaryHandler)?.remark || ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                          商机等级
                        </label>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 pt-1.5">
                            {(['S', 'A', 'B', 'C', 'D'] as const).map(lv => (
                              <label key={lv} className="flex items-center gap-1.5">
                                <input
                                  type="radio"
                                  name="handlerLevel"
                                  value={lv}
                                  checked={handlerForm.handlerLevel === lv}
                                  onChange={() => setHandlerForm({ ...handlerForm, handlerLevel: lv })}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span className="text-sm text-gray-700">{lv}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="flex items-start min-h-[36px]">
                        <label className="w-32 text-right text-sm text-gray-700 shrink-0 pt-2">
                          <span className="text-red-500 mr-0.5">*</span>变更原因
                        </label>
                        <div className="flex-1 min-w-0">
                          <textarea
                            value={handlerForm.reason}
                            onChange={(e) => setHandlerForm({ ...handlerForm, reason: e.target.value })}
                            rows={4}
                            placeholder="请输入变更原因（不少于10字）"
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 步骤2：拓展团队变更 */}
              {changeType === 'team' && (
                <div>
                  {/* 只读编码信息 */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">商机编码</div>
                      <div className="text-sm font-medium text-gray-800">{changeItem.id}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">全网商机编码</div>
                      <div className="text-sm font-medium text-gray-800">{changeItem.netId}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-0.5">商机名称</div>
                      <div className="text-sm font-medium text-gray-800 truncate" title={changeItem.name}>{changeItem.name}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-800">拓展团队成员</h4>
                    <button
                      type="button"
                      onClick={handleAddTeamMember}
                      className="px-3 py-1 text-xs text-white bg-[#1677FF] rounded hover:bg-[#1668DD] flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      添加成员
                    </button>
                  </div>

                  {teamForm.length === 0 ? (
                    <div className="border border-dashed border-gray-300 rounded-md py-8 text-center text-sm text-gray-400">
                      暂无团队成员，点击右上角"添加成员"按钮添加
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-gray-700">
                            <th className="px-3 py-2 text-left font-medium border-b border-gray-200 w-10">序号</th>
                            <th className="px-3 py-2 text-left font-medium border-b border-gray-200">团队角色</th>
                            <th className="px-3 py-2 text-left font-medium border-b border-gray-200">成员姓名</th>
                            <th className="px-3 py-2 text-left font-medium border-b border-gray-200">归属部门</th>
                            <th className="px-3 py-2 text-left font-medium border-b border-gray-200">人员类型</th>
                            <th className="px-3 py-2 text-left font-medium border-b border-gray-200">拓客贡献比(%)</th>
                            <th className="px-3 py-2 text-left font-medium border-b border-gray-200">联系电话</th>
                            <th className="px-3 py-2 text-left font-medium border-b border-gray-200 w-32">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamForm.map((m, index) => (
                            <tr key={m.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 border-b border-gray-100 text-gray-600">{index + 1}</td>
                              <td className="px-3 py-2 border-b border-gray-100 text-gray-800">{m.role}</td>
                              <td className="px-3 py-2 border-b border-gray-100 text-gray-800">{m.name || '-'}</td>
                              <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{m.dept || '-'}</td>
                              <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{m.personType}</td>
                              <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{m.contributionRate || '-'}</td>
                              <td className="px-3 py-2 border-b border-gray-100 text-gray-700">{m.phone || '-'}</td>
                              <td className="px-3 py-2 border-b border-gray-100">
                                <div className="flex items-center gap-2 text-blue-600">
                                  <button
                                    type="button"
                                    onClick={() => handleViewTeamMember(m)}
                                    className="hover:text-blue-800 hover:underline"
                                    title="详情"
                                  >
                                    详情
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleEditTeamMember(m)}
                                    className="hover:text-blue-800 hover:underline"
                                    title="编辑"
                                  >
                                    编辑
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTeamMember(m.id)}
                                    className="text-red-500 hover:text-red-700 hover:underline"
                                    title="删除"
                                  >
                                    删除
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex items-start min-h-[36px]">
                      <label className="w-32 text-right text-sm text-gray-700 shrink-0 pt-2">
                        <span className="text-red-500 mr-0.5">*</span>变更原因
                      </label>
                      <div className="flex-1 min-w-0">
                        <textarea
                          value={teamChangeReason}
                          onChange={(e) => setTeamChangeReason(e.target.value)}
                          rows={3}
                          placeholder="请输入变更原因（不少于10字）"
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2 bg-gray-50">
              {changeType !== '' && (
                <button
                  type="button"
                  onClick={() => setChangeType('')}
                  className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  返回上一步
                </button>
              )}
              <button
                type="button"
                onClick={closeChangeModal}
                className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              {changeType === 'basic' && (
                <button
                  type="button"
                  onClick={handleBasicSubmit}
                  className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
                >
                  提交变更
                </button>
              )}
              {changeType === 'handler' && (
                <button
                  type="button"
                  onClick={handleHandlerSubmit}
                  className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
                >
                  提交变更
                </button>
              )}
              {changeType === 'team' && (
                <button
                  type="button"
                  onClick={handleTeamSubmit}
                  className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
                >
                  提交变更
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* 第一责任人选择弹窗 */}
      {handlerPickerOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[60]" onClick={() => setHandlerPickerOpen(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[500px] max-h-[70vh] flex flex-col z-[60]">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">选择第一责任人</h3>
              <button onClick={() => setHandlerPickerOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                value={handlerSearch}
                onChange={(e) => setHandlerSearch(e.target.value)}
                placeholder="搜索姓名或部门"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredHandlers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">未找到人员</div>
              ) : (
                filteredHandlers.map(h => (
                  <div
                    key={h.id}
                    onClick={() => handleSelectHandler(h.name)}
                    className={clsx(
                      'px-5 py-3 cursor-pointer border-b border-gray-100 text-sm hover:bg-blue-50',
                      handlerForm.primaryHandler === h.name ? 'bg-blue-50' : ''
                    )}
                  >
                    <div className="font-medium text-gray-800">
                      {h.name} <span className="text-xs text-gray-500 ml-1">({h.role})</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{h.dept} · {h.remark}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 团队成员详情/编辑弹窗 */}
      {teamMemberModal && editingTeamMember && (
        <>
          <div className="fixed inset-0 bg-black/30 z-[60]" onClick={() => setTeamMemberModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[640px] max-h-[80vh] flex flex-col z-[60]">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">
                {isEditingTeam ? (editingTeamMember.name ? '编辑团队成员' : '新增团队成员') : '团队成员详情'}
              </h3>
              <button onClick={() => setTeamMemberModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    团队角色 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editingTeamMember.role}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, role: e.target.value })}
                    disabled={!isEditingTeam}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white disabled:bg-gray-50"
                  >
                    {teamRoles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    成员姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingTeamMember.name}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, name: e.target.value })}
                    disabled={!isEditingTeam}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">成员账号</label>
                  <input
                    type="text"
                    value={editingTeamMember.account}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, account: e.target.value })}
                    disabled={!isEditingTeam}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">归属部门</label>
                  <input
                    type="text"
                    value={editingTeamMember.dept}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, dept: e.target.value })}
                    disabled={!isEditingTeam}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">人员类型</label>
                  <select
                    value={editingTeamMember.personType}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, personType: e.target.value })}
                    disabled={!isEditingTeam}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white disabled:bg-gray-50"
                  >
                    {personTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">拓客贡献比(%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editingTeamMember.contributionRate}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/[^\d.]/g, '')
                      setEditingTeamMember({ ...editingTeamMember, contributionRate: cleaned })
                    }}
                    disabled={!isEditingTeam}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">联系电话</label>
                  <input
                    type="text"
                    value={editingTeamMember.phone}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, phone: e.target.value })}
                    disabled={!isEditingTeam}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">加入团队时间</label>
                  <input
                    type="date"
                    value={editingTeamMember.joinTime}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, joinTime: e.target.value })}
                    disabled={!isEditingTeam}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setTeamMemberModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                {isEditingTeam ? '取消' : '关闭'}
              </button>
              {isEditingTeam && (
                <button
                  type="button"
                  onClick={handleSaveTeamMember}
                  className="px-4 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
                >
                  保存
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
