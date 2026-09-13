import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Search,
  RotateCcw,
  Check,
  X,
  Info,
  Plus,
  Trash2,
  Eye,
  Edit,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { clsx } from 'clsx'
import { formatToTwoDecimals } from '@/lib/utils'

// 安徽省地市
const cities = [
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

// 区县（以合肥为例）
const districts = [
  { value: 'yaohai', label: '瑶海区' },
  { value: 'luyang', label: '庐阳区' },
  { value: 'shushan', label: '蜀山区' },
  { value: 'baohe', label: '包河区' },
  { value: 'shibanshi', label: '市本部' }
]

// 模拟客户库
const customerList = [
  { id: 'c1', name: '合肥市第一人民医院', level: 'A', groupIndustry: '医疗卫生', subIndustry: '医院', field: '智慧医疗', bu: '政企客户部', contact: '张主任', phone: '13800138001', address: '合肥市庐阳区淮河路128号' },
  { id: 'c2', name: '芜湖市政务服务中心', level: 'S', groupIndustry: '政府机关', subIndustry: '政务', field: '数字政府', bu: '政企客户部', contact: '李处长', phone: '13800138002', address: '芜湖市镜湖区政务中心' },
  { id: 'c3', name: '蚌埠市教育局', level: 'A', groupIndustry: '教育行业', subIndustry: '教育', field: '智慧教育', bu: '政企客户部', contact: '王科长', phone: '13800138003', address: '蚌埠市蚌山区东海大道' },
  { id: 'c4', name: '安徽医科大学附属医院', level: 'B', groupIndustry: '医疗卫生', subIndustry: '医院', field: '智慧医疗', bu: '政企客户部', contact: '陈主任', phone: '13800138004', address: '合肥市蜀山区梅山路81号' },
  { id: 'c5', name: '合肥市轨道交通集团', level: 'S', groupIndustry: '交通运输', subIndustry: '公安', field: '智慧交通', bu: '政企客户部', contact: '赵总', phone: '13800138005', address: '合肥市包河区马鞍山路' },
  { id: 'c6', name: '安徽省公安厅', level: 'S', groupIndustry: '公检法司', subIndustry: '公安', field: '智慧城市', bu: '政企客户部', contact: '钱厅长', phone: '13800138006', address: '合肥市庐阳区长江中路' }
]

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
const projectTypes = ['ICT项目', '网格DICT项目', '双计项目', 'CT项目']

// 网格选项
const grids = [
  '肥东磨店网格',
  '包河竹西西网格',
  '滨湖烟墩网格',
  '瑶海城东网格',
  '高新蜀麓网格',
  '肥东新城网格',
  '经开南艳网格',
  '肥东龙岗网格',
  '瑶海社区网格',
  '瑶海七里塘网格'
]

// 行业类别（细分）
const subIndustries = [
  '公安', '政府', '教育', '医疗', '金融', '能源', '交通',
  '旅游', '商业', '制造', '农业', '水利', '媒体', '运营商', '其他'
]

// 集团行业
const groupIndustries = [
  '政府机关', '教育行业', '医疗卫生', '金融行业', '能源化工',
  '交通运输', '文化旅游', '商贸服务', '制造业', '农业水利',
  '公检法司', '新闻媒体', '电信运营商', '其他'
]

// 细分领域
const subFields = [
  '人工智能', '大数据', '云计算', '物联网', '区块链',
  '5G通信', '智慧城市', '工业互联网', '网络安全', '信创',
  '数字政府', '智慧医疗', '智慧教育', '智慧交通', '智慧园区',
  '智慧能源', '智慧金融', '智慧农业', '其他'
]

// 省/市公司BU
const buOptions = [
  '政企客户部', '网络部', '市场部', '客户服务部',
  '信息化部', '系统集成部', '产品中心', '创新业务部', '其他'
]

// 人员库
const handlerList = [
  { id: 'h1', name: '张凯', dept: '合肥政企客户部', role: '客户经理', remark: '负责医疗行业' },
  { id: 'h2', name: '李华', dept: '芜湖政企客户部', role: '客户经理', remark: '负责教育行业' },
  { id: 'h3', name: '王强', dept: '省政企客户部', role: '高级客户经理', remark: '负责大型政企项目' },
  { id: 'h4', name: '赵明', dept: '合肥政企客户部', role: '解决方案经理', remark: '智慧城市专家' },
  { id: 'h5', name: '陈静', dept: '省政企客户部', role: '二级经理', remark: '医疗BU负责人' },
  { id: 'h6', name: '杨海波', dept: '省政企客户部', role: '审核专员', remark: '负责商机审核' }
]

// 团队角色
const teamRoles = [
  '客户经理', '解决方案经理', '交付经理', '运维经理',
  '项目经理', '商务经理', '技术经理', '其他'
]

// 人员类型
const personTypes = ['自有人员', '三方人员', '合作伙伴', '其他']

// 商机等级说明
const businessLevelInfo: Record<string, { label: string; desc: string; min: number; max: number }> = {
  S: { label: 'S', desc: '预估金额≥3000万元\n需及时上报省公司战客中心\n省公司BU二级经理、市公司分管二级经理作为第一责任人进行看管', min: 3000, max: Infinity },
  A: { label: 'A', desc: '预估金额介于1000万元-3000万元(不含)区间\n需及时上报地市公司\n省公司BU二级经理、市公司分管二级经理作为第一责任人进行看管', min: 1000, max: 3000 },
  B: { label: 'B', desc: '预估金额介于100万元-1000万元(不含)区间\n省公司BU三级经理/市公司BU三级经理/区县（营销中心）三级经理作为第一责任人进行看管', min: 100, max: 1000 },
  C: { label: 'C', desc: '预估金额介于50万元-100万元(不含)区间\n省公司BU客户经理/市公司BU总监/区县政企业务负责人作为第一责任人进行看管', min: 50, max: 100 },
  D: { label: 'D', desc: '预估金额小于50万元\n由客户经理担任第一责任人进行看管', min: 0, max: 50 }
}

// 商机评估项
const evaluationItems = [
  { id: 'e1', name: '技术方案', weight: 25, standard: '方案完整、架构合理、技术先进', rule: '优(90-100)/良(75-89)/中(60-74)/差(<60)', score: 85 },
  { id: 'e2', name: '商务报价', weight: 20, standard: '价格合理、利润空间充足', rule: '优(90-100)/良(75-89)/中(60-74)/差(<60)', score: 80 },
  { id: 'e3', name: '交付能力', weight: 20, standard: '交付团队完整、经验丰富', rule: '优(90-100)/良(75-89)/中(60-74)/差(<60)', score: 78 },
  { id: 'e4', name: '客户关系', weight: 15, standard: '客户关系良好、决策人支持', rule: '优(90-100)/良(75-89)/中(60-74)/差(<60)', score: 88 },
  { id: 'e5', name: '风险控制', weight: 10, standard: '无重大风险、合同条款可控', rule: '优(90-100)/良(75-89)/中(60-74)/差(<60)', score: 75 },
  { id: 'e6', name: '竞争态势', weight: 10, standard: '竞争优势明显', rule: '优(90-100)/良(75-89)/中(60-74)/差(<60)', score: 70 }
]

// 标签字段类型
type FieldType = 'number' | 'readonly' | 'radio' | 'auto'

interface TagField {
  name: string
  required: boolean
  type: FieldType
  placeholder?: string
  example?: string
  options?: string[]
}

interface TagConfig {
  key: string
  label: string
  group: 'specialHot' | 'productCapacity' | 'other'
  fields: TagField[]
}

const tagGroups: { key: 'specialHot' | 'productCapacity' | 'other'; label: string }[] = [
  { key: 'specialHot', label: '专项热门' },
  { key: 'productCapacity', label: '融产融能' },
  { key: 'other', label: '其他' }
]

const tagConfigs: TagConfig[] = [
  // 专项热门分组
  {
    key: 'specialBond',
    label: '专项债',
    group: 'specialHot',
    fields: [
      { name: '专项债金额（元/含税）', required: true, type: 'number', placeholder: '请输入内容' },
      { name: '专项债项目名称', required: true, type: 'number', placeholder: '请输入内容' },
      { name: '是否核心专项债', required: false, type: 'radio', options: ['是', '否'] }
    ]
  },
  {
    key: 'twoNew',
    label: '两新',
    group: 'specialHot',
    fields: [
      { name: '两新项目类型', required: true, type: 'radio', options: ['设备更新', '消费品以旧换新'] },
      { name: '两新收入金额（元/含税）', required: true, type: 'number', placeholder: '请输入内容' }
    ]
  },
  // 融产融能分组
  {
    key: 'keyProduct',
    label: '重点产品',
    group: 'productCapacity',
    fields: [
      { name: '重点产品收入金额（元/含税）', required: true, type: 'number', placeholder: '请输入内容' },
      { name: '重点产品名称', required: true, type: 'number', placeholder: '请输入内容' }
    ]
  },
  {
    key: 'segment5g',
    label: '5G细分领域',
    group: 'productCapacity',
    fields: [
      { name: '5G细分领域收入金额（元/含税）', required: true, type: 'number', placeholder: '请输入内容' },
      { name: '5G能力连接数', required: true, type: 'number', placeholder: '请输入内容' }
    ]
  },
  {
    key: 'videoNetwork',
    label: '视联网',
    group: 'productCapacity',
    fields: [
      { name: '视联网收入（元/含税）', required: true, type: 'number', placeholder: '请输入内容' },
      { name: '视联网收入占比（%）', required: false, type: 'auto' },
      { name: '视联网能力连接数', required: true, type: 'number', placeholder: '请输入内容' },
      { name: '是否包含视联网自有产品', required: true, type: 'radio', options: ['是', '否'] }
    ]
  },
  {
    key: 'iot',
    label: '物联网',
    group: 'productCapacity',
    fields: [
      { name: '物联网收入金额（元/含税）', required: true, type: 'number', placeholder: '请输入内容' },
      { name: '物联网能力连接数', required: true, type: 'number', placeholder: '请输入内容' },
      { name: '是否包含物联网自有产品', required: true, type: 'radio', options: ['是', '否'] }
    ]
  },
  {
    key: 'ai',
    label: 'AI',
    group: 'productCapacity',
    fields: [
      { name: 'AI收入金额（元/含税）', required: true, type: 'number', placeholder: '请输入内容' },
      { name: 'AI能力连接数', required: false, type: 'number', placeholder: '请输入内容' },
      { name: '是否包含AI自有产品', required: true, type: 'radio', options: ['是', '否'] }
    ]
  },
  {
    key: 'security',
    label: '安全产品',
    group: 'productCapacity',
    fields: [
      { name: '安全产品收入金额（元/含税）', required: true, type: 'number', placeholder: '请输入内容' },
      { name: '安全产品类型', required: true, type: 'radio', options: ['等保', '密评', '数据安全', '其他'] }
    ]
  },
  {
    key: 'quantum',
    label: '量子能力',
    group: 'productCapacity',
    fields: [
      { name: '量子收入金额（元/含税）', required: true, type: 'number', placeholder: '请输入内容' },
      { name: '量子能力类型', required: true, type: 'radio', options: ['量子通信', '量子计算', '量子精密测量'] }
    ]
  },
  // 其他分组
  {
    key: 'solution',
    label: '涉及解决方案',
    group: 'other',
    fields: [
      { name: '解决方案名称', required: true, type: 'number', placeholder: '请输入内容' },
      { name: '解决方案收入金额（元/含税）', required: true, type: 'number', placeholder: '请输入内容' }
    ]
  },
  {
    key: 'international',
    label: '政企国际业务',
    group: 'other',
    fields: [
      { name: '国际业务收入金额（元/含税）', required: true, type: 'number', placeholder: '请输入内容' }
    ]
  },
  {
    key: 'platformPosition',
    label: '平台卡位类',
    group: 'other',
    fields: [
      { name: '卡位范围', required: true, type: 'radio', options: ['全省', '本市'] }
    ]
  },
  {
    key: 'lowAltitude',
    label: '低空经济',
    group: 'other',
    fields: [
      { name: '低空经济收入金额（元/含税）', required: true, type: 'number', placeholder: '请输入内容' }
    ]
  }
]

// 数字转中文大写 - 输入单位为"元"，返回含标记的数组，渲染时根据标记对"万"/"亿"加红加粗
function numberToChinese(num: number): { text: string; segments: { text: string; highlight: boolean }[] } {
  if (!num || isNaN(num) || num <= 0) return { text: '', segments: [] }
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const smallUnits = ['', '拾', '佰', '仟']
  const bigUnits = ['', '万', '亿', '兆']

  // 处理小数部分（角分），保留两位小数
  const fixed = Math.round(num * 100) / 100
  const integerPart = Math.floor(fixed)
  const decimalPart = Math.round((fixed - integerPart) * 100)

  if (integerPart === 0 && decimalPart === 0) {
    return { text: '零元整', segments: [{ text: '零元整', highlight: false }] }
  }

  // 4 位段内转换（从高位到低位）
  const convertSection = (sec: string): string => {
    let r = ''
    let lastZero = false
    for (let i = 0; i < sec.length; i++) {
      const d = parseInt(sec[i])
      const u = smallUnits[sec.length - 1 - i]
      if (d === 0) {
        lastZero = true
      } else {
        if (lastZero && r) r += '零'
        lastZero = false
        r += digits[d] + u
      }
    }
    return r
  }

  // 整数部分：按 4 位一段拆开，从高段到低段处理，每段后追加大单位
  let intText = ''
  if (integerPart > 0) {
    const numStr = integerPart.toString()
    const padded = numStr.padStart(Math.ceil(numStr.length / 4) * 4, '0')
    const sections: string[] = []
    for (let i = 0; i < padded.length; i += 4) {
      sections.push(padded.substring(i, i + 4))
    }
    for (let i = sections.length - 1; i >= 0; i--) {
      const secText = convertSection(sections[i])
      const bigUnit = bigUnits[i]
      if (secText) {
        if (intText) intText += '零'
        intText += secText + bigUnit
      }
    }
  }

  let result = intText ? intText + '元' : ''

  // 小数部分（角分）
  if (decimalPart > 0) {
    const jiao = Math.floor(decimalPart / 10)
    const fen = decimalPart % 10
    if (jiao > 0) {
      result += digits[jiao] + '角'
      if (fen > 0) result += digits[fen] + '分'
      else result += '整'
    } else {
      result += '零' + digits[fen] + '分'
    }
  } else {
    result += '整'
  }

  // 将 result 拆分成片段，"万"和"亿"高亮
  const segments: { text: string; highlight: boolean }[] = []
  let buf = ''
  for (const ch of result) {
    if (ch === '万' || ch === '亿') {
      if (buf) {
        segments.push({ text: buf, highlight: false })
        buf = ''
      }
      segments.push({ text: ch, highlight: true })
    } else {
      buf += ch
    }
  }
  if (buf) segments.push({ text: buf, highlight: false })

  return { text: result, segments }
}

// 根据预估金额计算商机等级
function getBusinessLevel(amount: number): string {
  if (amount >= 3000) return 'S'
  if (amount >= 1000) return 'A'
  if (amount >= 100) return 'B'
  if (amount >= 50) return 'C'
  return 'D'
}

interface FormData {
  // 客户信息
  customerName: string
  customerId: string
  customerLevel: string
  groupIndustry: string
  subIndustry: string
  subField: string
  bu: string
  contact: string
  phone: string
  address: string

  // 商机基本信息
  businessName: string
  city: string
  district: string
  businessSource: string
  crossDomainType: string
  customerStatus: string
  projectTaboo: string
  estimatedAmount: string
  businessLevel: string
  projectType: string[]
  grid: string

  // 标签
  tags: Record<string, boolean>
  tagValues: Record<string, Record<string, string>>

  // 评估
  evaluationScores: Record<string, number>

  // 解决方案经理
  solutionManager: string

  // 第一责任人
  primaryHandler: string

  // 团队
  team: TeamMember[]

  // 流程信息
  nextStep: string
  nextHandler: string
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

const defaultForm: FormData = {
  customerName: '',
  customerId: '',
  customerLevel: '',
  groupIndustry: '',
  subIndustry: '',
  subField: '',
  bu: '',
  contact: '',
  phone: '',
  address: '',

  businessName: '',
  city: 'hefei',
  district: 'shushan',
  businessSource: '',
  crossDomainType: '本地',
  customerStatus: '',
  projectTaboo: '',
  estimatedAmount: '',
  businessLevel: 'D',
  projectType: [],
  grid: '',

  tags: {
    specialBond: false,
    twoNew: false,
    keyProduct: false,
    segment5g: false,
    solution: false,
    videoNetwork: false,
    iot: false,
    ai: false,
    security: false,
    quantum: false,
    international: false,
    platformPosition: false,
    lowAltitude: false
  },
  tagValues: {},

  evaluationScores: evaluationItems.reduce((acc, item) => ({ ...acc, [item.id]: item.score }), {}),

  solutionManager: '',
  primaryHandler: '张凯',
  team: [],

  nextStep: '商机审核',
  nextHandler: '杨海波'
}

export default function OpportunityInput() {
  const [form, setForm] = useState<FormData>(defaultForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 弹窗状态
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')

  const [showSubIndustryModal, setShowSubIndustryModal] = useState(false)
  const [subIndustrySearch, setSubIndustrySearch] = useState('')

  const [showGroupIndustryModal, setShowGroupIndustryModal] = useState(false)
  const [groupIndustrySearch, setGroupIndustrySearch] = useState('')

  const [showSubFieldModal, setShowSubFieldModal] = useState(false)
  const [subFieldSearch, setSubFieldSearch] = useState('')

  const [showBuModal, setShowBuModal] = useState(false)
  const [buSearch, setBuSearch] = useState('')

  const [showHandlerModal, setShowHandlerModal] = useState(false)
  const [handlerSearch, setHandlerSearch] = useState('')

  const [showPrimaryHandlerModal, setShowPrimaryHandlerModal] = useState(false)

  const [showSolutionManagerModal, setShowSolutionManagerModal] = useState(false)
  const [solutionManagerSearch, setSolutionManagerSearch] = useState('')

  // Tooltip 显示状态
  const [openTooltip, setOpenTooltip] = useState<string | null>(null)

  // 区块展开/收起
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: true,
    business: true,
    evaluation: false,
    tags: true
  })
  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // 团队成员详情弹窗
  const [showTeamDetailModal, setShowTeamDetailModal] = useState(false)
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null)
  const [isEditingTeam, setIsEditingTeam] = useState(false)

  // 标签卡片展开/收起
  const [expandedTagCards, setExpandedTagCards] = useState<Record<string, boolean>>({})
  const toggleTagCard = (key: string) => {
    setExpandedTagCards(prev => ({ ...prev, [key]: prev[key] === undefined ? false : !prev[key] }))
  }

  // ============ 过滤逻辑 ============
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customerList
    return customerList.filter(c => c.name.includes(customerSearch))
  }, [customerSearch])

  const filteredSubIndustries = useMemo(() => {
    if (!subIndustrySearch.trim()) return subIndustries
    return subIndustries.filter(i => i.includes(subIndustrySearch))
  }, [subIndustrySearch])

  const filteredGroupIndustries = useMemo(() => {
    if (!groupIndustrySearch.trim()) return groupIndustries
    return groupIndustries.filter(i => i.includes(groupIndustrySearch))
  }, [groupIndustrySearch])

  const filteredSubFields = useMemo(() => {
    if (!subFieldSearch.trim()) return subFields
    return subFields.filter(i => i.includes(subFieldSearch))
  }, [subFieldSearch])

  const filteredBu = useMemo(() => {
    if (!buSearch.trim()) return buOptions
    return buOptions.filter(i => i.includes(buSearch))
  }, [buSearch])

  const filteredHandlers = useMemo(() => {
    if (!handlerSearch.trim()) return handlerList
    return handlerList.filter(h => h.name.includes(handlerSearch) || h.dept.includes(handlerSearch))
  }, [handlerSearch])

  // 中文大写金额（仅在 onBlur 时更新，避免输入时频繁重渲染导致失焦）
  const [chineseAmount, setChineseAmount] = useState<{ text: string; segments: { text: string; highlight: boolean }[] }>({ text: '', segments: [] })

  // 商机等级提示信息（仅在 onBlur 时更新，避免抢焦点）
  const [levelTip, setLevelTip] = useState<string>('')

  // 商机等级确认弹窗：onBlur 时弹出，用户点确定后再更新商机等级和第一责任人
  const [levelModal, setLevelModal] = useState<{
    level: string
    label: string
    desc: string
    num: number
    formatted: string
  } | null>(null)

  // 预估金额 input DOM 引用（采用非受控模式，input 不绑 value/onChange，避免边输边触发）
  const amountInputRef = useRef<HTMLInputElement>(null)

  // 评估项得分 input DOM 引用（按评估项 id 索引，非受控）
  const evalScoreRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // 标签字段 input DOM 引用（按 "tagKey-fieldName" 索引，非受控）
  const tagValueRefs = useRef<Record<string, HTMLInputElement | null>>({})

  // 统一管理所有表单控件的 DOM 引用（非受控模式，按字段名索引）
  const formRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>>({})
  const setFieldRef = (key: string) => (el: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) => {
    formRefs.current[key] = el
  }

  // 同步单个表单控件的值到 form state（onBlur 时调用）
  const syncField = <K extends keyof FormData>(key: K) =>
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = e.target.value
      if (form[key] !== value) {
        handleChange(key, value as FormData[K])
      }
    }

  // 当 form.estimatedAmount 被外部重置/恢复时，同步到 input DOM
  useEffect(() => {
    if (amountInputRef.current && amountInputRef.current.value !== (form.estimatedAmount || '')) {
      amountInputRef.current.value = form.estimatedAmount || ''
    }
  }, [form.estimatedAmount])

  // 当 chineseAmount / levelModal / levelTip 等变化时（即 onBlur 触发后），同步中文大写展示
  // 这里保留 chineseAmount 和 levelModal state 以供 UI 展示用

  // 当前预估金额对应的等级
  const currentLevel = useMemo(() => {
    const num = parseFloat(form.estimatedAmount)
    if (isNaN(num)) return 'D'
    return getBusinessLevel(num)
  }, [form.estimatedAmount])

  // 评估总分
  const totalScore = useMemo(() => {
    return evaluationItems.reduce((sum, item) => {
      const score = form.evaluationScores[item.id] || 0
      return sum + (score * item.weight) / 100
    }, 0)
  }, [form.evaluationScores])

  // 选中的标签列表
  const selectedTags = useMemo(() => {
    return tagConfigs.filter(t => form.tags[t.key])
  }, [form.tags])

  // ============ 通用变更 ============
  const handleChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  // ============ 商机等级弹窗：用户点确定后更新商机等级、第一责任人、大写金额 ============
  const handleLevelModalConfirm = () => {
    if (!levelModal) return
    const { level, num } = levelModal
    setLevelModal(null)
    // 1) 大写金额展示
    setChineseAmount(numberToChinese(num * 10000))
    // 2) 默认更新商机等级
    if (form.businessLevel !== level) {
      handleChange('businessLevel', level)
    }
    // 3) 若第一责任人为空，则自动带出默认第一责任人
    if (!form.primaryHandler) {
      handleChange('primaryHandler', '张凯')
    }
    // 4) 保留页面底部的简短提示
    const info = businessLevelInfo[level]
    if (info) {
      setLevelTip(info.desc)
    }
  }

  // 选择客户后自动带出
  const handleSelectCustomer = (customer: typeof customerList[0]) => {
    setForm(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerLevel: customer.level,
      groupIndustry: customer.groupIndustry,
      subIndustry: customer.subIndustry,
      subField: customer.field,
      bu: customer.bu,
      contact: customer.contact,
      phone: customer.phone,
      address: customer.address,
      businessName: `${customer.name}商机`
    }))
    setShowCustomerModal(false)
    setCustomerSearch('')
    setErrors(prev => ({ ...prev, customerName: '' }))
  }

  // 切换标签
  const handleToggleTag = (key: string) => {
    setForm(prev => {
      const willSelect = !prev.tags[key]
      // 选中时，初始化单选字段的默认值（第一项）
      if (willSelect && !prev.tagValues[key]) {
        const config = tagConfigs.find(c => c.key === key)
        const initialValues: Record<string, string> = {}
        if (config) {
          config.fields.forEach(f => {
            if (f.type === 'radio' && f.options && f.options.length > 0) {
              initialValues[f.name] = f.options[0]
            }
          })
        }
        return {
          ...prev,
          tags: { ...prev.tags, [key]: willSelect },
          tagValues: { ...prev.tagValues, [key]: initialValues }
        }
      }
      return {
        ...prev,
        tags: { ...prev.tags, [key]: willSelect }
      }
    })
  }

  // 更新标签字段值
  const handleTagValueChange = (tagKey: string, fieldName: string, value: string) => {
    setForm(prev => ({
      ...prev,
      tagValues: {
        ...prev.tagValues,
        [tagKey]: {
          ...(prev.tagValues[tagKey] || {}),
          [fieldName]: value
        }
      }
    }))
  }

  // 更新评估分数
  const handleScoreChange = (itemId: string, value: string) => {
    const num = parseFloat(value)
    if (isNaN(num)) return
    setForm(prev => ({
      ...prev,
      evaluationScores: { ...prev.evaluationScores, [itemId]: num }
    }))
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
    setForm(prev => ({ ...prev, team: [...prev.team, newMember] }))
    setEditingTeamMember(newMember)
    setIsEditingTeam(true)
    setShowTeamDetailModal(true)
  }

  // 编辑团队成员
  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember({ ...member })
    setIsEditingTeam(true)
    setShowTeamDetailModal(true)
  }

  // 查看团队成员
  const handleViewTeamMember = (member: TeamMember) => {
    setEditingTeamMember({ ...member })
    setIsEditingTeam(false)
    setShowTeamDetailModal(true)
  }

  // 保存团队成员
  const handleSaveTeamMember = () => {
    if (!editingTeamMember) return
    if (!editingTeamMember.name.trim()) {
      alert('请输入成员姓名')
      return
    }
    setForm(prev => ({
      ...prev,
      team: prev.team.map(m => m.id === editingTeamMember.id ? editingTeamMember : m)
    }))
    setShowTeamDetailModal(false)
    setEditingTeamMember(null)
  }

  // 删除团队成员
  const handleDeleteTeamMember = (id: string) => {
    if (!confirm('确定删除该团队成员？')) return
    setForm(prev => ({ ...prev, team: prev.team.filter(m => m.id !== id) }))
  }

  // 选择第一责任人
  const handleSelectPrimaryHandler = (name: string) => {
    handleChange('primaryHandler', name)
    setShowPrimaryHandlerModal(false)
    setHandlerSearch('')
  }

  // 选择解决方案经理
  const handleSelectSolutionManager = (name: string) => {
    handleChange('solutionManager', name)
    setShowSolutionManagerModal(false)
    setSolutionManagerSearch('')
  }

  // 重置
  const handleReset = () => {
    if (!confirm('确定要重置所有内容吗？')) return
    setForm(defaultForm)
    setErrors({})
  }

  // 提交
  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}
    // 客户信息校验
    if (!form.customerName.trim()) newErrors.customerName = '请选择客户'
    if (!form.subIndustry.trim()) newErrors.subIndustry = '请选择行业类别'
    if (!form.subField.trim()) newErrors.subField = '请选择细分领域'
    if (!form.contact.trim()) newErrors.contact = '请输入客户联系人'
    if (!form.phone.trim()) newErrors.phone = '请输入客户联系电话'
    if (!form.address.trim()) newErrors.address = '请输入客户地址'
    // 商机基本信息校验
    if (!form.businessName.trim()) newErrors.businessName = '请输入商机名称'
    if (!form.city) newErrors.city = '请选择归属地市'
    if (!form.district) newErrors.district = '请选择归属区县'
    if (!form.businessSource) newErrors.businessSource = '请选择商机来源'
    if (!form.crossDomainType) newErrors.crossDomainType = '请选择业务跨域类型'
    if (!form.customerStatus) newErrors.customerStatus = '请选择客情关系'
    if (!form.projectTaboo) newErrors.projectTaboo = '请选择项目紧急程度'
    if (!form.estimatedAmount.trim()) {
      newErrors.estimatedAmount = '请输入预估金额'
    } else if (isNaN(parseFloat(form.estimatedAmount)) || parseFloat(form.estimatedAmount) <= 0) {
      newErrors.estimatedAmount = '请输入大于0的金额'
    }
    if (form.projectType.length === 0) newErrors.projectType = '请选择项目类型'
    if (form.projectType.includes('网格DICT项目') && !form.grid) {
      newErrors.grid = '请选择网格'
    }
    if (!form.primaryHandler) newErrors.primaryHandler = '请选择第一责任人'
    if (!form.solutionManager) newErrors.solutionManager = '请选择解决方案经理'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      alert('请完善必填项')
      return
    }

    alert('提交成功！')
    console.log('商机表单数据:', form)
  }

  // ============ 通用组件 ============
  const SectionTitle = ({
    children,
    sectionKey,
    expanded,
    extra
  }: {
    children: React.ReactNode
    sectionKey?: string
    expanded?: boolean
    extra?: React.ReactNode
  }) => (
    <div
      className="flex items-center gap-2 mb-3 mt-5 first:mt-0 cursor-pointer select-none hover:bg-gray-50 -mx-2 px-2 py-1 rounded"
      onClick={() => sectionKey && toggleSection(sectionKey)}
    >
      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
      <h3 className="text-sm font-semibold text-gray-800">{children}</h3>
      {sectionKey && (
        expanded
          ? <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
          : <ChevronRight className="w-4 h-4 text-gray-500 ml-1" />
      )}
      {extra && (
        <div className="ml-auto flex items-center" onClick={(e) => e.stopPropagation()}>{extra}</div>
      )}
    </div>
  )

  const FieldRow = ({
    label,
    required,
    error,
    colSpan,
    children
  }: {
    label: string
    required?: boolean
    error?: string
    colSpan?: 1 | 2
    children: React.ReactNode
  }) => (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <div className="flex items-start gap-3 min-h-[36px]">
        <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
          {required && <span className="text-red-500 mr-0.5">*</span>}
          {label}
        </label>
        <div className="flex-1 min-w-0">
          {children}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )

  // 提示图标 + 弹层说明
  const InfoTip = ({
    id,
    content,
    rich,
    align = 'center'
  }: {
    id: string
    content: React.ReactNode
    rich?: boolean
    align?: 'center' | 'left' | 'right'
  }) => (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        onMouseEnter={() => setOpenTooltip(id)}
        onMouseLeave={() => setOpenTooltip(null)}
        onClick={() => setOpenTooltip(openTooltip === id ? null : id)}
        className="text-gray-400 hover:text-blue-500 transition-colors"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {openTooltip === id && (
        <div
          className={clsx(
            'absolute z-10 mt-1 bg-white border border-gray-200 rounded-md shadow-lg text-xs text-gray-700 whitespace-pre-line',
            rich ? 'p-0 w-[640px] left-0' : 'p-3 w-80 leading-relaxed',
            align === 'center' && 'left-1/2 -translate-x-1/2',
            align === 'left' && 'left-0',
            align === 'right' && 'right-0'
          )}
        >
          {content}
        </div>
      )}
    </span>
  )

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm p-6">

          {/* ========== 客户信息 ========== */}
          <SectionTitle sectionKey="customer" expanded={expandedSections.customer}>客户信息</SectionTitle>
          {expandedSections.customer && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <FieldRow label="客户名称" required error={errors.customerName} colSpan={2}>
              <div className="relative">
                <input
                  ref={setFieldRef('customerName')}
                  type="text"
                  defaultValue={form.customerName}
                  onBlur={syncField('customerName')}
                  placeholder="请选择客户"
                  className={clsx(
                    'w-full pl-3 pr-10 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                    errors.customerName ? 'border-red-500' : 'border-gray-300'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="选择客户"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </FieldRow>

            <FieldRow label="客户等级">
              <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                {form.customerLevel || '请先选择客户'}
              </div>
            </FieldRow>

            <FieldRow label="集团行业">
              <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                {form.groupIndustry || '请先选择客户'}
              </div>
            </FieldRow>

            <FieldRow label="行业类别" required error={errors.subIndustry}>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={form.subIndustry}
                  onClick={() => setShowSubIndustryModal(true)}
                  placeholder="请选择行业类别"
                  className={clsx(
                    'w-full pl-3 pr-9 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 cursor-pointer bg-white',
                    errors.subIndustry ? 'border-red-500' : 'border-gray-300'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowSubIndustryModal(true)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="选择行业"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </FieldRow>

            <FieldRow label="细分领域" required error={errors.subField}>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={form.subField}
                  onClick={() => setShowSubFieldModal(true)}
                  placeholder="请选择细分领域"
                  className={clsx(
                    'w-full pl-3 pr-9 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 cursor-pointer bg-white',
                    errors.subField ? 'border-red-500' : 'border-gray-300'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowSubFieldModal(true)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                  title="选择细分领域"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </FieldRow>

            <FieldRow label="省/市公司BU">
              <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                {form.bu || '请先选择客户'}
              </div>
            </FieldRow>

            <FieldRow label="客户联系人" required error={errors.contact}>
              <input
                ref={setFieldRef('contact')}
                type="text"
                defaultValue={form.contact}
                onBlur={syncField('contact')}
                placeholder="请输入客户联系人"
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                  errors.contact ? 'border-red-500' : 'border-gray-300'
                )}
              />
            </FieldRow>

            <FieldRow label="客户联系电话" required error={errors.phone}>
              <input
                ref={setFieldRef('phone')}
                type="text"
                defaultValue={form.phone}
                onBlur={syncField('phone')}
                placeholder="请输入客户联系电话"
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                )}
              />
            </FieldRow>

            <FieldRow label="客户地址" required error={errors.address} colSpan={2}>
              <input
                ref={setFieldRef('address')}
                type="text"
                defaultValue={form.address}
                onBlur={syncField('address')}
                placeholder="请输入客户地址"
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                  errors.address ? 'border-red-500' : 'border-gray-300'
                )}
              />
            </FieldRow>
          </div>
          )}

          {/* ========== 商机基本信息 ========== */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <SectionTitle sectionKey="business" expanded={expandedSections.business}>商机基本信息</SectionTitle>
            {expandedSections.business && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <FieldRow label="商机名称" required error={errors.businessName} colSpan={2}>
                <input
                  ref={setFieldRef('businessName')}
                  type="text"
                  defaultValue={form.businessName}
                  onBlur={syncField('businessName')}
                  placeholder="选择客户后自动带出"
                  className={clsx(
                    'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                    errors.businessName ? 'border-red-500' : 'border-gray-300'
                  )}
                />
              </FieldRow>

              <FieldRow label="归属地市" required error={errors.city}>
                <select
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white',
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  {cities.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="归属区县" required error={errors.district}>
                <select
                  value={form.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white',
                    errors.district ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  {districts.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="商机来源" required error={errors.businessSource}>
                <select
                  value={form.businessSource}
                  onChange={(e) => handleChange('businessSource', e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white',
                    errors.businessSource ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  <option value="">请选择</option>
                  {businessSources.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="业务跨域类型" required error={errors.crossDomainType}>
                <select
                  value={form.crossDomainType}
                  onChange={(e) => handleChange('crossDomainType', e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white',
                    errors.crossDomainType ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  {crossDomainTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="客情关系" required error={errors.customerStatus}>
                <div className="flex items-center gap-4 whitespace-nowrap pt-2">
                  {customerStatuses.map(s => (
                    <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="customerStatus"
                        value={s}
                        checked={form.customerStatus === s}
                        onChange={() => handleChange('customerStatus', s)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{s}</span>
                    </label>
                  ))}
                </div>
              </FieldRow>

              <FieldRow label="项目紧急程度" required error={errors.projectTaboo}>
                <select
                  value={form.projectTaboo}
                  onChange={(e) => handleChange('projectTaboo', e.target.value)}
                  className={clsx(
                    'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white',
                    errors.projectTaboo ? 'border-red-500' : 'border-gray-300'
                  )}
                >
                  <option value="">请选择</option>
                  {projectTaboos.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </FieldRow>

              <FieldRow label="预估金额" required error={errors.estimatedAmount}>
                <div className="relative">
                  <input
                    ref={amountInputRef}
                    type="text"
                    inputMode="decimal"
                    defaultValue={form.estimatedAmount || ''}
                    // 不绑 value 和 onChange（采用非受控模式，避免边输边触发）
                    onBlur={(e) => {
                      // onBlur 时才从 input 读取值，格式化后同步到 form，并触发所有副作用
                      const rawValue = e.target.value
                      const formatted = formatToTwoDecimals(rawValue)
                      if (formatted !== rawValue && amountInputRef.current) {
                        amountInputRef.current.value = formatted
                      }
                      if (formatted !== form.estimatedAmount) {
                        handleChange('estimatedAmount', formatted)
                      }
                      // 离开控件时触发大写金额展示（输入金额万元 × 10000 = 实际金额元）
                      const num = parseFloat(formatted)
                      if (!isNaN(num) && num > 0) {
                        // 弹出对应商机等级的提示弹窗，用户点确定后才会更新商机等级和第一责任人
                        const newLevel = getBusinessLevel(num)
                        const info = businessLevelInfo[newLevel]
                        if (info) {
                          setLevelModal({
                            level: newLevel,
                            label: info.label,
                            desc: info.desc,
                            num,
                            formatted
                          })
                        } else {
                          setChineseAmount(numberToChinese(num * 10000))
                        }
                      } else {
                        setChineseAmount({ text: '', segments: [] })
                        setLevelTip('')
                      }
                    }}
                    placeholder="请输入大于0的数字，保留两位小数"
                    className={clsx(
                      'w-full pl-3 pr-14 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                      errors.estimatedAmount ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">万元</span>
                </div>
                {chineseAmount.text && (
                  <p className="text-sm text-[#1677FF] mt-1 font-medium">
                    {chineseAmount.segments.map((s, i) => (
                      <span key={i} className={s.highlight ? 'text-red-600 font-bold' : ''}>
                        {s.text}
                      </span>
                    ))}
                  </p>
                )}
                {levelTip && (
                  <p className="text-xs text-gray-600 mt-1 whitespace-pre-line bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                    {levelTip}
                  </p>
                )}
              </FieldRow>

              <FieldRow label="商机等级" required>
                <div className="flex items-center gap-3 whitespace-nowrap pt-2">
                  {(['S', 'A', 'B', 'C', 'D'] as const).map(lv => {
                    const info = businessLevelInfo[lv]
                    return (
                      <label key={lv} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="businessLevel"
                          value={lv}
                          checked={form.businessLevel === lv}
                          onChange={() => handleChange('businessLevel', lv)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{lv}</span>
                        <InfoTip id={`level-${lv}`} content={info.desc} />
                      </label>
                    )
                  })}
                </div>
                {form.estimatedAmount && (
                  <p className="text-xs text-gray-500 mt-1">
                    根据预估金额自动推荐等级: <span className="text-blue-600 font-medium">{currentLevel}</span>
                  </p>
                )}
              </FieldRow>

              <FieldRow label="第一责任人" required error={errors.primaryHandler}>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={form.primaryHandler}
                    onClick={() => setShowPrimaryHandlerModal(true)}
                    placeholder="请选择第一责任人"
                    className={clsx(
                      'w-full pl-3 pr-16 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 cursor-pointer bg-white',
                      errors.primaryHandler ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                  <span className="absolute right-8 top-1/2 -translate-y-1/2">
                    <InfoTip id="primary-handler-tip" align="right" rich content={
                      <div className="p-3">
                        <div className="font-semibold text-gray-800 mb-2 text-sm">第一责任人角色说明</div>
                        <table className="w-full border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-2 py-1.5 border border-gray-200 text-center font-medium w-12">等级</th>
                              <th className="px-2 py-1.5 border border-gray-200 text-left font-medium">等级说明</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="px-2 py-1.5 border border-gray-200 text-center font-bold text-red-600">S</td>
                              <td className="px-2 py-1.5 border border-gray-200">预估金额≥3000万元，需及时上报省公司战客中心，省公司BU二级经理、市公司分管二级经理作为第一责任人进行看管</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1.5 border border-gray-200 text-center font-bold text-orange-600">A</td>
                              <td className="px-2 py-1.5 border border-gray-200">预估金额介于1000万元-3000万元(不含)区间，需及时上报地市公司，省公司BU二级经理、市公司分管二级经理作为第一责任人进行看管</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1.5 border border-gray-200 text-center font-bold text-blue-600">B</td>
                              <td className="px-2 py-1.5 border border-gray-200">预估金额介于100万元-1000万元(不含)区间，省公司BU三级经理/市公司BU三级经理/区县（营销中心）三级经理作为第一责任人进行看管</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1.5 border border-gray-200 text-center font-bold text-cyan-600">C</td>
                              <td className="px-2 py-1.5 border border-gray-200">预估金额介于50万元-100万元(不含)区间，省公司BU客户经理/市公司BU总监/区县政企业务负责人作为第一责任人进行看管</td>
                            </tr>
                            <tr>
                              <td className="px-2 py-1.5 border border-gray-200 text-center font-bold text-gray-600">D</td>
                              <td className="px-2 py-1.5 border border-gray-200">预估金额小于50万元，由客户经理担任第一责任人进行看管</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    } />
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPrimaryHandlerModal(true)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="选择人员"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </FieldRow>

              <FieldRow label="解决方案经理" required error={errors.solutionManager}>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={form.solutionManager}
                    onClick={() => setShowSolutionManagerModal(true)}
                    placeholder="请选择解决方案经理"
                    className={clsx(
                      'w-full pl-3 pr-9 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 cursor-pointer bg-white',
                      errors.solutionManager ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSolutionManagerModal(true)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="选择人员"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </FieldRow>

              <FieldRow label="项目类型" required>
                <div className="flex items-center gap-4 whitespace-nowrap pt-2">
                  {projectTypes.map(t => (
                    <label key={t} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        value={t}
                        checked={form.projectType.includes(t)}
                        onChange={(e) => {
                          const current = [...form.projectType]
                          if (e.target.checked) {
                            current.push(t)
                          } else {
                            const idx = current.indexOf(t)
                            if (idx > -1) current.splice(idx, 1)
                          }
                          handleChange('projectType', current)
                          // 选中网格DICT项目时，清空网格字段
                          if (t === '网格DICT项目' && !e.target.checked) {
                            handleChange('grid', '')
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{t}</span>
                    </label>
                  ))}
                </div>
              </FieldRow>

              {form.projectType.includes('网格DICT项目') && (
                <FieldRow label="网格" required>
                  <select
                    value={form.grid}
                    onChange={(e) => handleChange('grid', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">请选择网格</option>
                    {grids.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </FieldRow>
              )}
            </div>
          )}
          </div>

          {/* ========== 商机标签 ========== */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <SectionTitle sectionKey="tags" expanded={expandedSections.tags}>商机标签</SectionTitle>
            {expandedSections.tags && (
            <div>
            {/* 标签复选框 - 按分组横排 */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3">
              {tagGroups.map(group => {
                const groupTags = tagConfigs.filter(t => t.group === group.key)
                return (
                  <div key={group.key} className="flex items-start gap-3">
                    <div className="w-20 shrink-0 pt-1.5 text-sm font-medium text-gray-700">{group.label}</div>
                    <div className="flex-1 flex items-center flex-wrap gap-x-6 gap-y-2">
                      {groupTags.map(tag => (
                        <label key={tag.key} className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={form.tags[tag.key] || false}
                            onChange={() => handleToggleTag(tag.key)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300"
                          />
                          <span className="text-sm text-gray-700">{tag.label}</span>
                          {tag.key === 'platformPosition' && (
                            <InfoTip
                              id="platform-position-tag-tip"
                              content="全省性卡位平台可带动地市接入类项目攻关，全市性平台可带动区县项目攻关"
                            />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 动态详情区：2 列卡片布局 */}
            {selectedTags.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {selectedTags.map(tag => {
                  const fieldValues = form.tagValues[tag.key] || {}
                  const isCardExpanded = expandedTagCards[tag.key] !== false
                  return (
                    <div key={tag.key} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                      {/* 卡片头部 - 可点击折叠/展开 */}
                      <div
                        className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 cursor-pointer select-none"
                        onClick={() => toggleTagCard(tag.key)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                          <h4 className="text-sm font-semibold text-gray-800">{tag.label}</h4>
                          {isCardExpanded
                            ? <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
                            : <ChevronRight className="w-4 h-4 text-gray-500 ml-1" />
                          }
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleToggleTag(tag.key) }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="移除该标签"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 卡片内容：1 列字段布局 */}
                      {isCardExpanded && (
                      <div className="space-y-3">
                        {tag.fields.map(field => {
                          const fieldValue = fieldValues[field.name] || ''
                          return (
                            <div key={field.name}>
                              <div className="flex items-center min-h-[36px]">
                                <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                                  {field.required && <span className="text-red-500 mr-0.5">*</span>}
                                  <span className="truncate">{field.name}</span>
                                </label>
                                <div className="flex-1 min-w-0">
                                  {field.type === 'auto' ? (
                                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 min-h-[36px] flex items-center">
                                      {(() => {
                                        if (tag.key === 'videoNetwork' && field.name === '视联网收入占比（%）') {
                                          const income = parseFloat(fieldValues['视联网收入（元/含税）'] || '0')
                                          const total = parseFloat(form.estimatedAmount || '0')
                                          if (!income || !total) {
                                            return <span className="text-gray-400">填写视联网收入和预估金额后自动计算</span>
                                          }
                                          const ratio = (income / total) * 10000
                                          return <span className="text-blue-600 font-medium">{ratio.toFixed(2)}%</span>
                                        }
                                        return <span className="text-gray-400">—</span>
                                      })()}
                                    </div>
                                  ) : field.type === 'radio' ? (
                                    <div className="flex items-center gap-3 pt-2">
                                      {field.options?.map((opt, oi) => (
                                        <label key={opt} className="flex items-center gap-1 cursor-pointer">
                                          <input
                                            type="radio"
                                            name={`card-${tag.key}-${field.name}`}
                                            value={opt}
                                            checked={fieldValue === opt || (!fieldValue && oi === 0)}
                                            onChange={(e) => handleTagValueChange(tag.key, field.name, e.target.value)}
                                            className="w-3.5 h-3.5 text-blue-600"
                                          />
                                          <span className="text-xs text-gray-700">{opt}</span>
                                        </label>
                                      ))}
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={fieldValue}
                                      onChange={(e) => {
                                        const cleaned = e.target.value.replace(/[^\d.]/g, '')
                                        const firstDot = cleaned.indexOf('.')
                                        const finalValue = firstDot !== -1
                                          ? cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '')
                                          : cleaned
                                        handleTagValueChange(tag.key, field.name, finalValue)
                                      }}
                                      onBlur={() => {
                                        const num = parseFloat(fieldValue)
                                        if (!isNaN(num) && fieldValue) {
                                          handleTagValueChange(tag.key, field.name, num.toFixed(2))
                                        }
                                      }}
                                      placeholder={field.placeholder || '请输入'}
                                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            </div>
            )}
          </div>

          {/* ========== 商机评估信息 ========== */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <SectionTitle
              sectionKey="evaluation"
              expanded={expandedSections.evaluation}
              extra={
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">商机评估总分：</span>
                  <span className="text-lg font-bold text-blue-600">{totalScore.toFixed(2)}</span>
                </div>
              }
            >
              商机评估信息
            </SectionTitle>
            {expandedSections.evaluation && (
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700">
                    <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 w-16">序号</th>
                    <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200">评估项</th>
                    <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 w-20">权重(%)</th>
                    <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200">评分标准</th>
                    <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200">评分规则</th>
                    <th className="px-3 py-2.5 text-left font-medium border-b border-gray-200 w-24">得分</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluationItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-600">{index + 1}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-800">{item.name}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700">{item.weight}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700">{item.standard}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100 text-gray-700">{item.rule}</td>
                      <td className="px-3 py-2.5 border-b border-gray-100">
                        <input
                          ref={el => { evalScoreRefs.current[item.id] = el }}
                          type="number"
                          min={0}
                          max={100}
                          defaultValue={form.evaluationScores[item.id] ?? ''}
                          onBlur={(e) => handleScoreChange(item.id, e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-medium">
                    <td colSpan={5} className="px-3 py-2.5 text-right text-gray-700">加权总分：</td>
                    <td className="px-3 py-2.5 text-blue-600">{totalScore.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
          </div>

          {/* ========== 流程信息 ========== */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">流程信息</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步环节</label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      商机审核
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步处理人</label>
                  <div className="flex-1 min-w-0">
                    <select
                      value={form.nextHandler}
                      onChange={(e) => handleChange('nextHandler', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    >
                      {handlerList.map(h => (
                        <option key={h.id} value={h.name}>{h.name}（{h.dept}）</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== 按钮区域 ========== */}
          <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              提交
            </button>
          </div>
        </div>
      </div>

      {/* ========== 商机等级确认弹窗（用户点确定后更新商机等级和第一责任人） ========== */}
      {levelModal && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50" />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl w-[460px] z-50 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-amber-50 border-b border-amber-200">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md',
                  levelModal.level === 'S' ? 'bg-red-500' :
                  levelModal.level === 'A' ? 'bg-orange-500' :
                  levelModal.level === 'B' ? 'bg-blue-500' :
                  levelModal.level === 'C' ? 'bg-green-500' : 'bg-gray-500'
                )}>
                  {levelModal.label}
                </div>
                <div>
                  <div className="text-base font-semibold text-gray-800">
                    商机等级 · {levelModal.label} 级
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    根据预估金额 {levelModal.formatted} 万元 自动推荐
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {levelModal.desc}
              </p>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={handleLevelModalConfirm}
                className="px-5 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors shadow-sm"
              >
                确定
              </button>
            </div>
          </div>
        </>
      )}

      {/* ========== 客户选择弹窗 ========== */}
      {showCustomerModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowCustomerModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[500px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">选择客户</h3>
              <button onClick={() => setShowCustomerModal(false)} className="text-gray-400 hover:text-gray-600">
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
                    onClick={() => handleSelectCustomer(customer)}
                    className="px-5 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-800">{customer.name}</div>
                      <span className={clsx(
                        'px-2 py-0.5 text-xs rounded',
                        customer.level === 'S' ? 'bg-red-100 text-red-700' :
                        customer.level === 'A' ? 'bg-orange-100 text-orange-700' :
                        customer.level === 'B' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      )}>
                        {customer.level}级
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {customer.contact} · {customer.phone} · {customer.subIndustry}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 行业类别弹窗 */}
      {showSubIndustryModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowSubIndustryModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[420px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">选择行业类别</h3>
              <button onClick={() => setShowSubIndustryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                value={subIndustrySearch}
                onChange={(e) => setSubIndustrySearch(e.target.value)}
                placeholder="搜索行业类别"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredSubIndustries.map(item => (
                <div
                  key={item}
                  onClick={() => {
                    handleChange('subIndustry', item)
                    setShowSubIndustryModal(false)
                    setSubIndustrySearch('')
                  }}
                  className={clsx(
                    'px-5 py-2.5 cursor-pointer border-b border-gray-100 text-sm hover:bg-blue-50',
                    form.subIndustry === item ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  )}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 细分领域弹窗 */}
      {showSubFieldModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowSubFieldModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[420px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">选择细分领域</h3>
              <button onClick={() => setShowSubFieldModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                value={subFieldSearch}
                onChange={(e) => setSubFieldSearch(e.target.value)}
                placeholder="搜索细分领域"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredSubFields.map(item => (
                <div
                  key={item}
                  onClick={() => {
                    handleChange('subField', item)
                    setShowSubFieldModal(false)
                    setSubFieldSearch('')
                  }}
                  className={clsx(
                    'px-5 py-2.5 cursor-pointer border-b border-gray-100 text-sm hover:bg-blue-50',
                    form.subField === item ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  )}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 第一责任人弹窗 */}
      {showPrimaryHandlerModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowPrimaryHandlerModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[500px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">选择第一责任人</h3>
              <button onClick={() => setShowPrimaryHandlerModal(false)} className="text-gray-400 hover:text-gray-600">
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
                filteredHandlers.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectPrimaryHandler(item.name)}
                    className={clsx(
                      'px-5 py-3 cursor-pointer border-b border-gray-100 text-sm hover:bg-blue-50',
                      form.primaryHandler === item.name ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    )}
                  >
                    <div className="font-medium">{item.name} <span className="text-xs text-gray-500 ml-1">({item.role})</span></div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.dept} · {item.remark}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 解决方案经理弹窗 */}
      {showSolutionManagerModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowSolutionManagerModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[500px] max-h-[70vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">选择解决方案经理</h3>
              <button onClick={() => setShowSolutionManagerModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                value={solutionManagerSearch}
                onChange={(e) => setSolutionManagerSearch(e.target.value)}
                placeholder="搜索姓名或部门"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredHandlers.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">未找到人员</div>
              ) : (
                filteredHandlers.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSolutionManager(item.name)}
                    className={clsx(
                      'px-5 py-3 cursor-pointer border-b border-gray-100 text-sm hover:bg-blue-50',
                      form.solutionManager === item.name ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                    )}
                  >
                    <div className="font-medium">{item.name} <span className="text-xs text-gray-500 ml-1">({item.role})</span></div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.dept} · {item.remark}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* 团队成员详情/编辑弹窗 */}
      {showTeamDetailModal && editingTeamMember && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50" onClick={() => setShowTeamDetailModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[640px] max-h-[80vh] flex flex-col z-50">
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">
                {isEditingTeam ? (editingTeamMember.name ? '编辑团队成员' : '新增团队成员') : '团队成员详情'}
              </h3>
              <button onClick={() => setShowTeamDetailModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm text-gray-700 mb-1">团队角色 <span className="text-red-500">*</span></label>
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
                  <label className="block text-sm text-gray-700 mb-1">成员姓名 <span className="text-red-500">*</span></label>
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
                    type="number"
                    value={editingTeamMember.contributionRate}
                    onChange={(e) => setEditingTeamMember({ ...editingTeamMember, contributionRate: e.target.value })}
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
                onClick={() => setShowTeamDetailModal(false)}
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
