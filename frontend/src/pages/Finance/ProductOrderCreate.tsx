import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { Search, X, ChevronDown, ChevronRight, RotateCcw, Check } from 'lucide-react'

interface ProductOrderCreateProps {
  onNavigate?: (path: string) => void
}

interface ProjectInfo {
  id: string
  name: string
  code: string
  type: string
  initMethod: string
  customerName: string
  customerCode: string
  creator: string
  draftedCount: number
}

interface ITProductItem {
  id: string
  productCode: string
  productName: string
  tariffName: string
  plannedIncome: string
  taxRate: string
  contractStage: string
  billingAllocationType: string
  billingCycle: string
  contractAsset: string
  plannedOrderTime: string
}

interface CTProductItem {
  id: string
  productCode: string
  productName: string
  tariffName: string
  plannedOrderQuantity: number
  orderedQuantity: number
  remainingQuantity: number
  plannedIncome: string
  taxRate: string
  billingAllocationType: string
  billingCycle: string
  plannedOrderTime: string
}

interface PaymentPlanItem {
  id: string
  milestone: string
  amount: string
  paymentDate: string
  transferDate: string
}

interface AccountOption {
  id: string
  name: string
  type: string
}

const projectList = [
  {
    id: 'p1',
    name: '合肥市第一人民医院智慧医疗项目',
    code: 'PRJ-2026-HF-001',
    type: 'ICT项目',
    initMethod: '普通立项',
    customerName: '合肥市第一人民医院',
    customerCode: 'CUS-HF-001',
    creator: '张凯',
    draftedCount: 2
  },
  {
    id: 'p2',
    name: '芜湖市政务服务中心数字政府项目',
    code: 'PRJ-2026-WH-001',
    type: 'DICT项目',
    initMethod: '统谈分签',
    customerName: '芜湖市政务服务中心',
    customerCode: 'CUS-WH-001',
    creator: '李华',
    draftedCount: 0
  },
  {
    id: 'p3',
    name: '蚌埠市教育局智慧教育项目',
    code: 'PRJ-2026-BB-001',
    type: 'ICT项目',
    initMethod: '普通立项',
    customerName: '蚌埠市教育局',
    customerCode: 'CUS-BB-001',
    creator: '王强',
    draftedCount: 1
  },
  {
    id: 'p4',
    name: '合肥市轨道交通集团智慧交通项目',
    code: 'PRJ-2026-HF-002',
    type: '双计项目',
    initMethod: '统谈分签',
    customerName: '合肥市轨道交通集团有限公司',
    customerCode: 'CUS-HF-002',
    creator: '赵明',
    draftedCount: 3
  },
  {
    id: 'p5',
    name: '安徽省公安厅智慧城市项目',
    code: 'PRJ-2026-AH-001',
    type: 'ICT项目',
    initMethod: '普通立项',
    customerName: '安徽省公安厅',
    customerCode: 'CUS-AH-001',
    creator: '杨海波',
    draftedCount: 0
  }
]

const mockAccounts: Record<string, AccountOption[]> = {
  'p1': [
    { id: 'ACC-001', name: '合肥市第一人民医院基本户', type: '基本存款账户' },
    { id: 'ACC-002', name: '合肥市第一人民医院专户', type: '专用存款账户' },
    { id: 'ACC-003', name: '合肥市第一人民医院一般户', type: '一般存款账户' }
  ],
  'p2': [
    { id: 'ACC-004', name: '芜湖市政务服务中心基本户', type: '基本存款账户' },
    { id: 'ACC-005', name: '芜湖市政务服务中心零余额户', type: '零余额账户' }
  ],
  'p3': [
    { id: 'ACC-006', name: '蚌埠市教育局基本户', type: '基本存款账户' },
    { id: 'ACC-007', name: '蚌埠市教育局教育经费专户', type: '专用存款账户' },
    { id: 'ACC-008', name: '蚌埠市教育局一般户', type: '一般存款账户' }
  ],
  'p4': [
    { id: 'ACC-009', name: '合肥市轨道交通集团基本户', type: '基本存款账户' },
    { id: 'ACC-010', name: '合肥市轨道交通集团专户', type: '专用存款账户' }
  ],
  'p5': [
    { id: 'ACC-011', name: '安徽省公安厅基本户', type: '基本存款账户' },
    { id: 'ACC-012', name: '安徽省公安厅经费户', type: '专用存款账户' },
    { id: 'ACC-013', name: '安徽省公安厅一般户', type: '一般存款账户' }
  ]
}

const mockITProducts: ITProductItem[] = [
  {
    id: 'it-prod-1',
    productCode: 'IT-PROD-0001',
    productName: '维保费',
    tariffName: '[849]ICT维保服务费',
    plannedIncome: '15000.00',
    taxRate: '6%',
    contractStage: '初验',
    billingAllocationType: '一次性',
    billingCycle: '—',
    contractAsset: '否',
    plannedOrderTime: '2026-07-01'
  },
  {
    id: 'it-prod-2',
    productCode: 'IT-PROD-0002',
    productName: '设备费',
    tariffName: '[956]软件开发服务',
    plannedIncome: '30000.00',
    taxRate: '13%',
    contractStage: '终验',
    billingAllocationType: '月',
    billingCycle: '12',
    contractAsset: '是',
    plannedOrderTime: '2026-07-01'
  },
  {
    id: 'it-prod-3',
    productCode: 'IT-PROD-0003',
    productName: '维保费',
    tariffName: '[1205]系统集成服务',
    plannedIncome: '45000.00',
    taxRate: '9%',
    contractStage: '到货',
    billingAllocationType: '一次性',
    billingCycle: '—',
    contractAsset: '否',
    plannedOrderTime: '2026-08-01'
  },
  {
    id: 'it-prod-4',
    productCode: 'IT-PROD-0004',
    productName: '设备费',
    tariffName: '[1372]业务集成费',
    plannedIncome: '60000.00',
    taxRate: '6%',
    contractStage: '开工',
    billingAllocationType: '月',
    billingCycle: '24',
    contractAsset: '是',
    plannedOrderTime: '2026-09-01'
  },
  {
    id: 'it-prod-5',
    productCode: 'IT-PROD-0005',
    productName: '维保费',
    tariffName: '[956]软件开发服务',
    plannedIncome: '75000.00',
    taxRate: '13%',
    contractStage: '初验',
    billingAllocationType: '一次性',
    billingCycle: '—',
    contractAsset: '否',
    plannedOrderTime: '2026-10-01'
  },
  {
    id: 'it-prod-6',
    productCode: 'IT-PROD-0006',
    productName: '设备费',
    tariffName: '[849]ICT维保服务费',
    plannedIncome: '90000.00',
    taxRate: '6%',
    contractStage: '维护',
    billingAllocationType: '月',
    billingCycle: '36',
    contractAsset: '是',
    plannedOrderTime: '2026-11-01'
  }
]

const mockPaymentPlans: Record<string, PaymentPlanItem[]> = {
  'it-prod-1': [
    { id: 'pp-1-1', milestone: '初验', amount: '9000.00', paymentDate: '2026-12-01', transferDate: '-' },
    { id: 'pp-1-2', milestone: '终验', amount: '6000.00', paymentDate: '2027-03-01', transferDate: '-' }
  ],
  'it-prod-3': [
    { id: 'pp-3-1', milestone: '初验', amount: '27000.00', paymentDate: '2026-11-01', transferDate: '-' },
    { id: 'pp-3-2', milestone: '终验', amount: '18000.00', paymentDate: '2026-12-15', transferDate: '-' }
  ],
  'it-prod-5': [
    { id: 'pp-5-1', milestone: '初验', amount: '45000.00', paymentDate: '2026-12-15', transferDate: '-' },
    { id: 'pp-5-2', milestone: '终验', amount: '30000.00', paymentDate: '2027-02-01', transferDate: '-' }
  ]
}

const mockCTProducts: CTProductItem[] = Array.from({ length: 6 }).map((_, i) => ({
  id: `ct-prod-${i + 1}`,
  productCode: `CT-PROD-${String(i + 1).padStart(4, '0')}`,
  productName: ['专线接入', 'IDC机柜', '带宽服务', '物联网卡', '5G专网', '云专线'][i],
  tariffName: ['标准型', '企业型', '旗舰型', '定制型', '基础型', '标准型'][i],
  plannedOrderQuantity: (i + 1) * 20,
  orderedQuantity: Math.floor((i + 1) * 8),
  remainingQuantity: Math.floor((i + 1) * 12),
  plannedIncome: ((i + 1) * 12000).toFixed(2),
  taxRate: '9%',
  billingAllocationType: ['一次性', '按月', '按季', '按年'][i % 4],
  billingCycle: `${(i % 12) + 1}个月`,
  plannedOrderTime: '2026-07-01'
}))

function SectionTitle({
  children,
  sectionKey,
  expanded,
  extra,
  onToggle
}: {
  children: React.ReactNode
  sectionKey?: string
  expanded?: boolean
  extra?: React.ReactNode
  onToggle?: () => void
}) {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 mb-3 mt-5 first:mt-0 cursor-pointer select-none hover:bg-gray-50 -mx-2 px-2 py-1 rounded',
        !sectionKey && 'cursor-default hover:bg-transparent'
      )}
      onClick={() => sectionKey && onToggle && onToggle()}
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
}

function ReadOnlyField({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={clsx('flex items-center min-h-[36px]', full && 'col-span-2')}>
      <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">{label}</label>
      <div className="flex-1 min-w-0 max-w-xs text-sm text-gray-700 truncate" title={value}>{value}</div>
    </div>
  )
}

export default function ProductOrderCreate({ onNavigate }: ProductOrderCreateProps) {
  const [project, setProject] = useState<ProjectInfo | null>(null)
  const [projectExpanded, setProjectExpanded] = useState(true)
  const [itExpanded, setITExpanded] = useState(true)
  const [ctExpanded, setCTExpanded] = useState(true)

  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectSearch, setProjectSearch] = useState({ name: '', code: '' })
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  const [showITOrderModal, setShowITOrderModal] = useState(false)
  const [currentITProduct, setCurrentITProduct] = useState<ITProductItem | null>(null)
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlanItem[]>([])
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<AccountOption | null>(null)
  const [accountSearchId, setAccountSearchId] = useState('')
  const [accountSearchName, setAccountSearchName] = useState('')

  const filteredProjects = useMemo(() => {
    return projectList.filter(p => {
      const nameMatch = !projectSearch.name.trim() || p.name.includes(projectSearch.name.trim())
      const codeMatch = !projectSearch.code.trim() || p.code.includes(projectSearch.code.trim())
      return nameMatch && codeMatch
    })
  }, [projectSearch])

  const totalPaymentAmount = useMemo(() => {
    return paymentPlans.reduce((sum, item) => {
      const val = parseFloat(item.amount)
      return sum + (isNaN(val) ? 0 : val)
    }, 0)
  }, [paymentPlans])

  const accounts = useMemo(() => {
    if (!project) return []
    return mockAccounts[project.id] || []
  }, [project])

  const filteredAccounts = useMemo(() => {
    return accounts.filter(a =>
      (!accountSearchId.trim() || a.id.includes(accountSearchId.trim())) &&
      (!accountSearchName.trim() || a.name.includes(accountSearchName.trim()))
    )
  }, [accounts, accountSearchId, accountSearchName])

  const handleOpenProjectModal = () => {
    setSelectedProjectId(project?.id || '')
    setProjectSearch({ name: '', code: '' })
    setShowProjectModal(true)
  }

  const handleConfirmProject = () => {
    if (!selectedProjectId) {
      alert('请选择一个项目')
      return
    }
    const selected = projectList.find(p => p.id === selectedProjectId)
    if (selected) {
      setProject(selected)
    }
    setShowProjectModal(false)
  }

  const handleITOrder = (item: ITProductItem) => {
    setCurrentITProduct(item)
    setPaymentPlans(mockPaymentPlans[item.id] || [])
    setShowITOrderModal(true)
  }

  const handleCTThrow = (item: CTProductItem) => {
    alert(`一键甩单CT产品：${item.productName}`)
  }

  const handleITOrderSubmit = () => {
    alert('IT产品订购成功！')
    setShowITOrderModal(false)
  }

  const handleCancel = () => {
    if (onNavigate) {
      onNavigate('/finance/income/product-order')
    }
  }

  const handleSubmit = () => {
    alert('提交成功！')
    if (onNavigate) {
      onNavigate('/finance/income/product-order')
    }
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* ========== 项目信息模块 ========== */}
          <SectionTitle sectionKey="project" expanded={projectExpanded} onToggle={() => setProjectExpanded(!projectExpanded)}>项目信息</SectionTitle>
          {projectExpanded && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="col-span-2">
                <div className="flex items-start gap-3 min-h-[36px]">
                  <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    <span className="text-red-500 mr-0.5">*</span>
                    项目名称
                  </label>
                  <div className="flex-1 min-w-0 max-w-xs">
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        value={project?.name || ''}
                        onClick={handleOpenProjectModal}
                        placeholder="请选择项目"
                        className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 cursor-pointer bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleOpenProjectModal}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="选择项目"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {project && (
                <>
                  <ReadOnlyField label="项目编码" value={project.code} />
                  <ReadOnlyField label="项目类型" value={project.type} />
                  <ReadOnlyField label="立项方式" value={project.initMethod} />
                  <ReadOnlyField label="客户名称" value={project.customerName} />
                  <ReadOnlyField label="客户编码" value={project.customerCode} />
                  <ReadOnlyField label="项目创建人" value={project.creator} />
                </>
              )}
            </div>
          )}

          {/* ========== IT产品订购模块 ========== */}
          {project && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <SectionTitle sectionKey="it" expanded={itExpanded} onToggle={() => setITExpanded(!itExpanded)}>IT产品订购</SectionTitle>
              {itExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-gray-500">
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品编码</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划收入(元,含税)</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">税率</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同阶段</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计费分摊类型</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">计费周期</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">合同资产</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockITProducts.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.productCode}</td>
                          <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.productName}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.tariffName}</td>
                          <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{item.plannedIncome}</td>
                          <td className="px-3 py-3 text-gray-600 text-center whitespace-nowrap">{item.taxRate}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.contractStage}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.billingAllocationType}</td>
                          <td className="px-3 py-3 text-gray-600 text-center whitespace-nowrap">{item.billingCycle}</td>
                          <td className="px-3 py-3 text-gray-600 text-center whitespace-nowrap">{item.contractAsset}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.plannedOrderTime}</td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleITOrder(item)}
                              className="text-[#1677FF] hover:text-[#1668DD] text-sm"
                            >
                              订购
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========== CT产品订购模块 ========== */}
          {project && (
            <div className="mt-5 pt-4 border-t border-gray-100">
              <SectionTitle sectionKey="ct" expanded={ctExpanded} onToggle={() => setCTExpanded(!ctExpanded)}>CT产品订购</SectionTitle>
              {ctExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-gray-500">
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品编码</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购数量</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">已订购数量</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">剩余可订购数量</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划收入(元,含税)</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">税率</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计费分摊类型</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">计费周期</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockCTProducts.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.productCode}</td>
                          <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.productName}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.tariffName}</td>
                          <td className="px-3 py-3 text-gray-600 text-right whitespace-nowrap">{item.plannedOrderQuantity}</td>
                          <td className="px-3 py-3 text-gray-600 text-right whitespace-nowrap">{item.orderedQuantity}</td>
                          <td className="px-3 py-3 text-green-600 text-right whitespace-nowrap font-medium">{item.remainingQuantity}</td>
                          <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{item.plannedIncome}</td>
                          <td className="px-3 py-3 text-gray-600 text-center whitespace-nowrap">{item.taxRate}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.billingAllocationType}</td>
                          <td className="px-3 py-3 text-gray-600 text-center whitespace-nowrap">{item.billingCycle}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.plannedOrderTime}</td>
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleCTThrow(item)}
                              className="text-[#1677FF] hover:text-[#1668DD] text-sm"
                            >
                              一键甩单
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========== 按钮区域 ========== */}
          <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
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

      {/* ========== 选择项目弹窗 ========== */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setShowProjectModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[900px] max-w-[90vw] overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">选择项目</h3>
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-20 text-right">项目名称</label>
                  <input
                    type="text"
                    value={projectSearch.name}
                    onChange={(e) => setProjectSearch(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="请输入项目名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-20 text-right">项目编码</label>
                  <input
                    type="text"
                    value={projectSearch.code}
                    onChange={(e) => setProjectSearch(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="请输入项目编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-gray-500">
                    <th className="w-10 px-4 py-2.5 text-left">
                      <span className="sr-only">选择</span>
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">项目名称</th>
                    <th className="px-3 py-2.5 text-left font-medium">项目编码</th>
                    <th className="px-3 py-2.5 text-left font-medium">项目类型</th>
                    <th className="px-3 py-2.5 text-left font-medium">立项方式</th>
                    <th className="px-3 py-2.5 text-left font-medium">客户名称</th>
                    <th className="px-3 py-2.5 text-left font-medium">客户编码</th>
                    <th className="px-3 py-2.5 text-left font-medium">项目创建人</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map(p => (
                      <tr
                        key={p.id}
                        className={clsx(
                          'cursor-pointer hover:bg-blue-50/50 transition-colors',
                          selectedProjectId === p.id && 'bg-blue-50'
                        )}
                        onClick={() => setSelectedProjectId(p.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="radio"
                            name="project"
                            checked={selectedProjectId === p.id}
                            onChange={() => setSelectedProjectId(p.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                        </td>
                        <td className="px-3 py-3 text-gray-800">{p.name}</td>
                        <td className="px-3 py-3 text-gray-600">{p.code}</td>
                        <td className="px-3 py-3 text-gray-600">{p.type}</td>
                        <td className="px-3 py-3 text-gray-600">{p.initMethod}</td>
                        <td className="px-3 py-3 text-gray-600">{p.customerName}</td>
                        <td className="px-3 py-3 text-gray-600">{p.customerCode}</td>
                        <td className="px-3 py-3 text-gray-600">{p.creator}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmProject}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== IT产品订购弹窗 ========== */}
      {showITOrderModal && currentITProduct && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setShowITOrderModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[1000px] max-w-[90vw] overflow-hidden flex flex-col"
            style={{ maxHeight: '92vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">IT产品订购</h3>
              <button
                type="button"
                onClick={() => setShowITOrderModal(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-5 py-4">
              {/* 收入计划 */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">收入计划</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-gray-50 rounded-lg p-4">
                  <ReadOnlyField label="产品编码" value={currentITProduct.productCode} />
                  <ReadOnlyField label="产品名称" value={currentITProduct.productName} />
                  <ReadOnlyField label="资费名称" value={currentITProduct.tariffName} />
                  <ReadOnlyField label="税率" value={currentITProduct.taxRate} />
                  <ReadOnlyField label="计划收入(元,含税)" value={currentITProduct.plannedIncome} />
                  <ReadOnlyField label="合同阶段" value={currentITProduct.contractStage} />
                  <ReadOnlyField label="计费分摊类型" value={currentITProduct.billingAllocationType} />
                  <ReadOnlyField label="计费周期" value={currentITProduct.billingCycle} />
                  <ReadOnlyField label="合同资产" value={currentITProduct.contractAsset} />
                  <ReadOnlyField label="计划订购时间" value={currentITProduct.plannedOrderTime} />
                </div>
              </div>

              {/* 账户信息 */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">账户信息</h4>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start gap-3 min-h-[36px]">
                    <label className="w-28 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">客户信息</label>
                    <div className="flex-1 min-w-0">
                      <div className="px-3 py-2 text-sm bg-gray-100 border border-gray-200 rounded-md text-gray-700">
                        {project?.customerName || '-'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 min-h-[36px]">
                    <label className="w-28 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                      <span className="text-red-500 mr-0.5">*</span>
                      账户信息
                    </label>
                    <div className="flex-1 min-w-0">
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={selectedAccount ? `${selectedAccount.name}（${selectedAccount.id}）` : ''}
                          onClick={() => { setShowAccountModal(true); setAccountSearchId(''); setAccountSearchName('') }}
                          placeholder="请选择账户"
                          className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 cursor-pointer bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => { setShowAccountModal(true); setAccountSearchId(''); setAccountSearchName('') }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="选择账户"
                        >
                          <Search className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 回款计划明细 */}
              {currentITProduct.billingAllocationType === '一次性' && (
                <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h4 className="text-sm font-semibold text-gray-800">回款计划明细</h4>
                  <span className="text-xs text-gray-400">
                    合计：<span className="text-[#1677FF] font-medium">{totalPaymentAmount.toFixed(2)}</span> / {currentITProduct.plannedIncome}
                  </span>
                </div>

                <div className="border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-gray-500">
                        <th className="w-16 px-3 py-2.5 text-center font-medium whitespace-nowrap">序号</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">里程碑名称</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划回款金额</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划回款比例</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划回款时间</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同资产计划转出时间</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paymentPlans.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                            暂无回款计划
                          </td>
                        </tr>
                      ) : (
                        paymentPlans.map((plan, index) => (
                          <tr key={plan.id} className="hover:bg-gray-50/50">
                            <td className="px-3 py-2 text-center text-gray-600">{index + 1}</td>
                            <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{plan.milestone}</td>
                            <td className="px-3 py-2 text-gray-800 text-right whitespace-nowrap font-medium">{plan.amount}</td>
                            <td className="px-3 py-2 text-gray-800 whitespace-nowrap">
                              {(() => {
                                const orderAmt = parseFloat(currentITProduct.plannedIncome.replace(/,/g, '')) || 0
                                const planAmt = parseFloat(plan.amount) || 0
                                return orderAmt > 0 ? `${((planAmt / orderAmt) * 100).toFixed(2)}%` : '-'
                              })()}
                            </td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{plan.paymentDate}</td>
                            <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{plan.transferDate}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                </>
              )}
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowITOrderModal(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleITOrderSubmit}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确认订购
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 选择账户弹窗 ========== */}
      {showAccountModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40" onClick={() => setShowAccountModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[700px] max-w-[90vw] overflow-hidden flex flex-col"
            style={{ maxHeight: '70vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">选择账户</h3>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-20 text-right">账户ID</label>
                  <input
                    type="text"
                    value={accountSearchId}
                    onChange={(e) => setAccountSearchId(e.target.value)}
                    placeholder="请输入账户ID"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-20 text-right">账户名称</label>
                  <input
                    type="text"
                    value={accountSearchName}
                    onChange={(e) => setAccountSearchName(e.target.value)}
                    placeholder="请输入账户名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-gray-500">
                    <th className="w-10 px-4 py-2.5 text-left">
                      <span className="sr-only">选择</span>
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">账户ID</th>
                    <th className="px-3 py-2.5 text-left font-medium">账户名称</th>
                    <th className="px-3 py-2.5 text-left font-medium">账户类型</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map(a => (
                      <tr
                        key={a.id}
                        className={clsx(
                          'cursor-pointer hover:bg-blue-50/50 transition-colors',
                          selectedAccount?.id === a.id && 'bg-blue-50'
                        )}
                        onClick={() => {
                          setSelectedAccount(a)
                          setShowAccountModal(false)
                        }}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="radio"
                            name="account"
                            checked={selectedAccount?.id === a.id}
                            onChange={() => {
                              setSelectedAccount(a)
                              setShowAccountModal(false)
                            }}
                            className="w-4 h-4 text-blue-600"
                          />
                        </td>
                        <td className="px-3 py-3 text-gray-600">{a.id}</td>
                        <td className="px-3 py-3 text-gray-800">{a.name}</td>
                        <td className="px-3 py-3 text-gray-600">{a.type}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => setShowAccountModal(false)}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
