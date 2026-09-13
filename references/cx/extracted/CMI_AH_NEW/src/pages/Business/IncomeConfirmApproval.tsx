import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  FileText,
  Download,
  Eye,
  Plus,
  X,
  Bell
} from 'lucide-react'
import { clsx } from 'clsx'
import ContractAttachments from '@/components/ContractAttachments'
import ApprovalInfo from '@/components/ApprovalInfo'
import { getContractInfo } from '@/data/mock'
import { ProjectInfoCard } from '@/components/ContractInfoCard'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import PaymentPlansDisplay from '@/components/plan-modules/common/PaymentPlansDisplay'
import ModalShell from '@/components/plan-modules/common/ModalShell'
import type { ITIncomeRow } from '@/components/plan-modules/types'
import type { ContractAttachment } from '@/data/mock'
import { calculateExcludingTax } from '@/lib/utils'

// 审批人选项（复制自前向合同解析审批页面，独立维护）
const approverOptions = [
  '张三（解决方案经理）',
  '李四（解决方案经理）',
  '王五（解决方案经理）',
  '赵六（解决方案经理）',
  '钱七（解决方案经理）',
  '孙八（解决方案经理）',
  '周九（解决方案经理）',
  '吴十（解决方案经理）',
  '郑一（解决方案经理）',
  '冯二（解决方案经理）'
]

// 审批任务分派 - 角色列表（分派弹框用）
const assignRoles = [
  { key: 'finance-income', label: '财务部收入会计' },
  { key: 'finance-general', label: '财务部税务会计' }
]

// 审批任务分派 - 处理人选项（每个角色对应的人员）
const financeHandlerOptions: Record<string, string[]> = {
  'finance-income': ['李娜', '孙晓', '周华'],
  'finance-general': ['王强', '吴涛', '郑磊']
}

// 审批任务分派行数据
interface AuditAssignRow {
  id: string
  roleLabel: string        // 处理人角色
  handlerName: string      // 处理人
  handlerPhone: string     // 处理人联系方式
  dept: string             // 处理部门
  createdAt: string        // 生成时间
  handledAt: string        // 处理时间（待处理为空）
  result: '通过' | '待处理' | '驳回'  // 处理结果
  opinion: string          // 处理意见
}

const initialAssignList: AuditAssignRow[] = [
  {
    id: 'assign-2',
    roleLabel: '财务部收入会计',
    handlerName: '李娜',
    handlerPhone: '13900139002',
    dept: '财务部',
    createdAt: '2026-07-15 10:35:00',
    handledAt: '',
    result: '待处理',
    opinion: ''
  },
  {
    id: 'assign-3',
    roleLabel: '财务部税务会计',
    handlerName: '王强',
    handlerPhone: '13700137003',
    dept: '财务部',
    createdAt: '2026-07-15 10:35:00',
    handledAt: '2026-07-15 15:10:00',
    result: '驳回',
    opinion: '税率与合同约定不符，请核实后重新提交。'
  }
]

// IT收入计划确认 mock 数据（复制自收入计划确认发起页面，独立维护）
const mockProgressFiles = [
  { id: 'pf-1', name: '项目进度证明_1.pdf', size: '2.5 MB', uploadTime: '2026-07-10 10:30:00' },
  { id: 'pf-2', name: '项目进度证明_2.pdf', size: '3.8 MB', uploadTime: '2026-07-10 11:00:00' }
]

const mockITIncome: ITIncomeRow[] = [
  {
    id: 'it-1',
    productName: '维保费',
    tariffName: '[849]ICT维保服务费',
    mgmtProductCode: 'P1234',
    mgmtProductName: 'ICT维保服务',
    thirdLevelSubject: 'S123',
    coaSubject: 'C5678',
    taxRate: '6%',
    isFixedRate: '是',
    plannedIncome: '500,000',
    plannedTariffAmount: '480,000',
    budgetTariffAmount: '480,000',
    contractStage: '初验',
    billingShareType: '月',
    billingSharePeriod: '12',
    isContractAsset: '是',
    plannedOrderDate: '2026-07-01',
    milestoneName: '初验',
    orderStatus: '待订购',
    billingStartDate: '2026-07',
    paymentPlans: [
      { id: 'pp-1', milestone: '初验', amount: '250,000', paymentDate: '2026-08-01', transferDate: '' },
      { id: 'pp-2', milestone: '终验', amount: '250,000', paymentDate: '2026-12-01', transferDate: '' }
    ]
  },
  {
    id: 'it-2',
    productName: '设备费',
    tariffName: '[956]软件开发服务',
    mgmtProductCode: 'P2345',
    mgmtProductName: '软件开发服务',
    thirdLevelSubject: 'S234',
    coaSubject: 'C956-01',
    taxRate: '13%',
    isFixedRate: '是',
    plannedIncome: '2,000,000',
    plannedTariffAmount: '1,900,000',
    budgetTariffAmount: '1,900,000',
    contractStage: '到货',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '否',
    plannedOrderDate: '2026-08-01',
    milestoneName: '到货',
    orderStatus: '待订购',
    billingStartDate: '2026-08',
    paymentPlans: [
      { id: 'pp-3', milestone: '到货', amount: '1,000,000', paymentDate: '2026-09-01', transferDate: '' },
      { id: 'pp-4', milestone: '初验', amount: '1,000,000', paymentDate: '2026-11-01', transferDate: '' }
    ]
  },
  {
    id: 'it-3',
    productName: '平台使用费',
    tariffName: '[780]平台服务费',
    mgmtProductCode: 'P3456',
    mgmtProductName: '平台服务',
    thirdLevelSubject: 'S345',
    coaSubject: 'C3456',
    taxRate: '6%',
    isFixedRate: '是',
    plannedIncome: '300,000',
    plannedTariffAmount: '280,000',
    budgetTariffAmount: '280,000',
    contractStage: '项目上线',
    billingShareType: '月',
    billingSharePeriod: '24',
    isContractAsset: '是',
    plannedOrderDate: '2026-06-01',
    milestoneName: '项目上线',
    orderStatus: '订购中',
    billingStartDate: '2026-06',
    paymentPlans: [
      { id: 'pp-5', milestone: '项目上线', amount: '140,000', paymentDate: '2026-07-01', transferDate: '' },
      { id: 'pp-6', milestone: '终验', amount: '140,000', paymentDate: '2027-01-01', transferDate: '' }
    ]
  },
  {
    id: 'it-4',
    productName: '系统集成费',
    tariffName: '[1205]系统集成服务',
    mgmtProductCode: 'P4567',
    mgmtProductName: '系统集成服务',
    thirdLevelSubject: 'S456',
    coaSubject: 'C4567',
    taxRate: '9%',
    isFixedRate: '否',
    plannedIncome: '800,000',
    plannedTariffAmount: '750,000',
    budgetTariffAmount: '750,000',
    contractStage: '初验',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '否',
    plannedOrderDate: '2026-05-01',
    milestoneName: '初验',
    orderStatus: '已订购',
    billingStartDate: '2026-05',
    paymentPlans: [
      { id: 'pp-7', milestone: '初验', amount: '375,000', paymentDate: '2026-06-01', transferDate: '' },
      { id: 'pp-8', milestone: '终验', amount: '375,000', paymentDate: '2026-10-01', transferDate: '' }
    ]
  }
]

// 附件 mock 数据（独立维护）—— 统一使用芜湖智慧教育云平台4个标准附件
const mockAttachments: ContractAttachment[] = [
  {
    id: 'attach-1',
    name: '芜湖智慧教育云平台服务合同.pdf',
    size: '4.8 MB',
    uploadTime: '2026-06-06 14:45:00',
    tag: '前向合同'
  },
  {
    id: 'attach-2',
    name: '芜湖智慧教育云平台效益评估表',
    size: '2.3 MB',
    uploadTime: '2026-06-06 15:00:00',
    tag: '效益评估表'
  },
  {
    id: 'attach-3',
    name: '芜湖智慧教育云平台上会PPT',
    size: '15.6 MB',
    uploadTime: '2026-06-06 15:30:00',
    tag: '上会PPT文件'
  },
  {
    id: 'attach-4',
    name: '芜湖智慧教育云平台签报文件',
    size: '1.8 MB',
    uploadTime: '2026-06-06 16:00:00',
    tag: '签报文件'
  }
]

function groupByProductName<T extends { productName: string }>(list: T[]): { productName: string; rows: T[] }[] {
  const groups: Record<string, T[]> = {}
  list.forEach(row => {
    if (!groups[row.productName]) {
      groups[row.productName] = []
    }
    groups[row.productName].push(row)
  })
  return Object.entries(groups).map(([productName, rows]) => ({ productName, rows }))
}

// 客户信息选项数据（mock）
const bossAccountOptions = ['BOSS账号-A001', 'BOSS账号-B002', 'BOSS账号-C003']
const groupCustomerOptions = ['安徽智教科技有限公司', '芜湖教育信息服务中心', '合肥智慧城市运营公司', '蚌埠数字教育研究院']
const bossCustomerOptions = ['BOSS客户-教育云平台', 'BOSS客户-智慧校园', 'BOSS客户-政务云', 'BOSS客户-数字城市']
const accountOptions = ['账户-ZJ001', '账户-ZJ002', '账户-ZJ003', '账户-ZJ004', '账户-ZJ005']

// 可搜索输入选择组件
function SearchSelectInput({
  value,
  onChange,
  options,
  disabled = false,
  placeholder = '请输入搜索'
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  disabled?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

  if (disabled) {
    return (
      <div className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-400 cursor-not-allowed flex items-center justify-between">
        <span>{value || placeholder}</span>
        <ChevronDown className="w-4 h-4 text-gray-300" />
      </div>
    )
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={open ? search : value}
        onChange={(e) => {
          setSearch(e.target.value)
          if (!open) setOpen(true)
        }}
        onFocus={() => {
          setOpen(true)
          setSearch('')
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
      />
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">无匹配项</div>
            ) : (
              filtered.map(opt => (
                <div
                  key={opt}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer"
                  onClick={() => {
                    onChange(opt)
                    setOpen(false)
                    setSearch('')
                  }}
                >
                  {opt}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

interface IncomeConfirmApprovalProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

export default function IncomeConfirmApproval({ onNavigate, contractId }: IncomeConfirmApprovalProps) {
  const contractInfo = getContractInfo(contractId || 'CT2026060006')

  // 流程轨迹相关状态（复制自前向合同解析审批页面，独立维护）
  const [trailExpanded, setTrailExpanded] = useState(false)
  const trailData = [
    { time: '2026-07-15 10:30:00', actor: '张三', action: '提交合同解析申请' },
    { time: '2026-07-15 14:20:00', actor: '李四', action: '审批通过，流转至计划变更环节' }
  ]

  // 审批信息相关状态
  const [approvalResult, setApprovalResult] = useState<'approved' | 'rejected' | 'transferred'>('approved')

  // 流程信息相关状态（独立维护）
  const [solutionManager, setSolutionManager] = useState('')
  // 审批通过时的下一步处理人（4 类产品线管理员）
  const [provinceIncomeAdmin, setProvinceIncomeAdmin] = useState('')
  const [cloudProductAdmin, setCloudProductAdmin] = useState('')
  const [iotProductAdmin, setIotProductAdmin] = useState('')
  const [g5ProductAdmin, setG5ProductAdmin] = useState('')

  // ========== 审批任务分派 状态 ==========
  const [assignList, setAssignList] = useState<AuditAssignRow[]>(initialAssignList)
  const [assignModalVisible, setAssignModalVisible] = useState(false)
  const [assignForm, setAssignForm] = useState<Record<string, string>>({
    'finance-income': '',
    'finance-general': ''
  })

  const openAssignModal = () => {
    setAssignForm({
      'finance-income': '',
      'finance-general': ''
    })
    setAssignModalVisible(true)
  }

  const closeAssignModal = () => {
    setAssignModalVisible(false)
  }

  // 根据姓名反查手机号（mock）
  const getPhoneByName = (name: string): string => {
    const map: Record<string, string> = {
      '李娜': '13900139002', '孙晓': '13900139003', '周华': '13900139004',
      '王强': '13700137003', '吴涛': '13700137004', '郑磊': '13700137005'
    }
    return map[name] || '13800000000'
  }

  const submitAssignModal = () => {
    const selected = Object.entries(assignForm).filter(([_, v]) => v.trim() !== '')
    if (selected.length === 0) {
      alert('请至少选择一位下一步处理人')
      return
    }
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19)
    const newRows: AuditAssignRow[] = selected.map(([key, name]) => {
      const role = assignRoles.find(r => r.key === key)!
      return {
        id: 'assign-' + Date.now() + '-' + key,
        roleLabel: role.label,
        handlerName: name,
        handlerPhone: getPhoneByName(name),
        dept: '财务部',
        createdAt: nowStr,
        handledAt: '',
        result: '待处理',
        opinion: ''
      }
    })
    setAssignList(prev => [...prev, ...newRows])
    alert('分派成功，共 ' + newRows.length + ' 条任务')
    closeAssignModal()
  }

  // IT收入计划确认相关状态（独立维护）
  const [incomeExpanded, setIncomeExpanded] = useState(true)
  const [itIncomeViewingPlans, setItIncomeViewingPlans] = useState<ITIncomeRow | null>(null)

  // 客户信息（纯展示数据，独立维护）
  const customerInfo = {
    bossAccount: 'BOSS账号-A001',
    groupCustomer: '安徽智教科技有限公司',
    bossCustomer: 'BOSS客户-教育云平台',
    account: '账户-ZJ001'
  }
  const certificateFiles = [
    { name: '营业执照.pdf', size: '1.2 MB', uploadTime: '2026-07-10 10:30:00' },
    { name: '组织机构代码证.pdf', size: '0.8 MB', uploadTime: '2026-07-10 10:31:00' },
    { name: '税务登记证.pdf', size: '0.6 MB', uploadTime: '2026-07-10 10:32:00' },
    { name: '授权委托书.pdf', size: '1.5 MB', uploadTime: '2026-07-10 10:33:00' }
  ]

  const handleCancel = () => {
    onNavigate?.('/finance/contract/query')
  }

  const handleSubmit = () => {
    alert('收入计划确认审批提交成功！')
    if (onNavigate) {
      onNavigate('/finance/contract/query')
    }
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部标题栏 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">收入计划确认审批</h2>
          </div>
        </div>

        {/* 1. 项目信息 */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 附件 */}
        <ContractAttachments attachments={mockAttachments} />

        {/* 4. 流程轨迹 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
            onClick={() => setTrailExpanded(v => !v)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
            <span className="text-xs text-gray-400 ml-1">共 {trailData.length} 步</span>
            {trailExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
              : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
            }
          </div>
          {trailExpanded && (
            <div className="p-4">
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
                <ol className="space-y-4">
                  {trailData.map((item, idx) => (
                    <li key={idx} className="relative">
                      <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 ${
                        idx === trailData.length - 1
                          ? 'bg-[#1677FF] border-[#1677FF]'
                          : 'bg-white border-gray-300'
                      }`} />
                      <div className="text-xs text-gray-400 mb-0.5">{item.time}</div>
                      <div className="text-sm text-gray-800">
                        <span className="font-medium">{item.actor}</span>
                        <span className="text-gray-500 ml-1.5">{item.action}</span>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* 5. IT收入计划确认 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
            onClick={() => setIncomeExpanded(v => !v)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">IT收入计划确认</h3>
            <span className="text-xs text-gray-400 ml-1">共 {mockITIncome.length} 条</span>
            {incomeExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
              : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
            }
          </div>
          {incomeExpanded && (
            <div className="p-4 space-y-4">
              <div className="overflow-x-auto border border-gray-100 rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                      <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额（不含税）</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">是否合同资产</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">里程碑名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupByProductName(mockITIncome).map((group) => {
                      const rowCount = group.rows.length
                      return (
                        <>
                          {group.rows.map((row, idx) => (
                            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                              {idx === 0 && (
                                <>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.productName}</td>
                                  <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].plannedIncome}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].taxRate}</td>
                                </>
                              )}
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffAmount || '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                                {row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, row.taxRate) : '-'}
                              </td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                <span className={clsx(
                                  'inline-flex px-2 py-0.5 text-xs rounded-full',
                                  row.isContractAsset === '是'
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'bg-gray-50 text-gray-500'
                                )}>{row.isContractAsset}</span>
                              </td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.milestoneName || '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                <button onClick={() => setItIncomeViewingPlans(row)} className="px-2 py-1 text-xs text-[#1677FF] hover:underline">回款计划</button>
                              </td>
                            </tr>
                          ))}
                        </>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* IT收入计划合计 */}
              <div className="mt-4 flex justify-end items-center gap-6">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{mockITIncome.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{mockITIncome.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || r.plannedTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{mockITIncome.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                </div>
              </div>

              {/* 订购信息 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                  <span className="text-sm font-semibold text-gray-800">订购信息</span>
                </div>
                <div className="flex items-start gap-3">
                  <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    订购说明
                  </label>
                  <div className="flex-1 min-w-0 text-sm text-gray-700 pt-2">
                    本项目按照合同约定进度进行产品开通，已完成初步验收，各项指标均达到合同要求。
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    项目进度证明
                  </label>
                  <div className="flex-1 min-w-0 space-y-2">
                    {mockProgressFiles.map(file => (
                      <div
                        key={file.id}
                        className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md"
                      >
                        <FileText className="w-4 h-4 text-[#1677FF] shrink-0" />
                        <div className="flex items-center flex-1 min-w-0 ml-3">
                          <span className="text-sm text-gray-800 truncate">{file.name}</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 text-xs text-gray-600 bg-gray-100 rounded shrink-0 ml-3">项目进度证明</span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{file.size}</span>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{file.uploadTime}</span>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-blue-700 shrink-0 ml-2"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          预览
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-blue-700 shrink-0 ml-2"
                        >
                          <Download className="w-3.5 h-3.5" />
                          下载
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 客户信息 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                  <span className="text-sm font-semibold text-gray-800">客户信息</span>
                </div>
                <div className="grid grid-cols-[176px_1fr_176px_1fr] gap-x-3 gap-y-4">
                  {/* 集团客户信息 */}
                  <label className="text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    集团客户信息
                  </label>
                  <div>
                    <input
                      type="text"
                      value="【511XXXX】安徽测试公司"
                      readOnly
                      className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md cursor-default"
                    />
                  </div>

                  {/* 账户信息 */}
                  <label className="text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    账户信息
                  </label>
                  <div>
                    <input
                      type="text"
                      value="【AXXXXX】安徽测试账户"
                      readOnly
                      className="w-full px-3 py-2 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md cursor-default"
                    />
                  </div>

                </div>
              </div>
            </div>
          )}
        </div>

        {/* 审批任务分派 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">审批任务分派</h3>
              <span className="text-xs text-gray-400">共 {assignList.length} 条</span>
            </div>
            <button
              type="button"
              onClick={() => openAssignModal()}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              分派
            </button>
          </div>
          <div className="overflow-x-auto px-4 py-3">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">处理人角色</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">处理人</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">处理人联系方式</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">处理部门</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">生成时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">处理时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">处理结果</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">处理意见</th>
                  <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap w-28">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignList.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-3 py-8 text-center text-gray-400 text-xs">
                      暂无分派记录，点击右上角"分派"新增
                    </td>
                  </tr>
                )}
                {assignList.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.roleLabel}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.handlerName}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.handlerPhone}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.dept}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.createdAt}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.handledAt || '-'}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {row.result === '通过' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />通过
                        </span>
                      )}
                      {row.result === '待处理' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />待处理
                        </span>
                      )}
                      {row.result === '驳回' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />驳回
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap max-w-[280px] truncate" title={row.opinion}>
                      {row.opinion || '-'}
                    </td>
                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                      {row.result === '待处理' ? (
                        <button
                          type="button"
                          onClick={() => alert(`已向 ${row.handlerName}（${row.roleLabel}）发送催单通知`)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 transition-colors"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          催单
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 审批信息 */}
        <ApprovalInfo onResultChange={setApprovalResult} />

        {/* 审批任务分派弹框 */}
        {assignModalVisible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={closeAssignModal}>
            <div
              className="bg-white rounded-lg shadow-xl w-[640px] max-w-[92vw] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h3 className="text-sm font-semibold text-gray-800">审批任务分派</h3>
                </div>
                <button
                  type="button"
                  onClick={closeAssignModal}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center">
                  <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-2">
                    下一步环节
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      收入计划确认审批
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <label className="w-28 text-right text-sm text-gray-700 shrink-0 pr-2 pt-2">
                    <span className="text-red-500 mr-0.5">*</span>
                    下一步处理人
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2">
                      {assignRoles.map(role => (
                        <div key={role.key} className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0 w-[120px]">
                            {role.label}
                          </span>
                          <div className="flex-1 min-w-0">
                            <select
                              value={assignForm[role.key] || ''}
                              onChange={e => setAssignForm(prev => ({ ...prev, [role.key]: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                            >
                              <option value="">请选择下一步处理人</option>
                              {financeHandlerOptions[role.key]?.map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeAssignModal}
                  className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  取消
                </button>
                <button
                  type="button"
                  onClick={submitAssignModal}
                  className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  确定
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 流程信息（驳回时展示） */}
        {approvalResult === 'rejected' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">流程信息</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步环节</label>
                    <div className="flex-1 min-w-0">
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                        收入计划确认
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步处理人</label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                          解决方案经理
                        </span>
                        <div className="flex-1 min-w-0">
                          <SearchableSelect
                            value={solutionManager}
                            onChange={setSolutionManager}
                            options={approverOptions}
                            placeholder="请选择下一步处理人"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* 流程信息（审批通过 / 转派时展示，内容一致） */}
        {(approvalResult === 'transferred' || approvalResult === 'approved') && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">流程信息</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步环节</label>
                    <div className="flex-1 min-w-0">
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                        收入计划确认审批
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 mt-1">下一步处理人</label>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                            省公司收入管理员
                          </span>
                          <div className="flex-1 min-w-0">
                            <SearchableSelect
                              value={provinceIncomeAdmin}
                              onChange={setProvinceIncomeAdmin}
                              options={approverOptions}
                              placeholder="请选择下一步处理人"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                            云产品管理员
                          </span>
                          <div className="flex-1 min-w-0">
                            <SearchableSelect
                              value={cloudProductAdmin}
                              onChange={setCloudProductAdmin}
                              options={approverOptions}
                              placeholder="请选择下一步处理人"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                            物联网产品管理员
                          </span>
                          <div className="flex-1 min-w-0">
                            <SearchableSelect
                              value={iotProductAdmin}
                              onChange={setIotProductAdmin}
                              options={approverOptions}
                              placeholder="请选择下一步处理人"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                            5G产品管理员
                          </span>
                          <div className="flex-1 min-w-0">
                            <SearchableSelect
                              value={g5ProductAdmin}
                              onChange={setG5ProductAdmin}
                              options={approverOptions}
                              placeholder="请选择下一步处理人"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 按钮区域 */}
        <div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
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

      {/* IT收入计划回款计划查看弹框 */}
      {itIncomeViewingPlans && (
        <ModalShell title="回款计划明细" onClose={() => setItIncomeViewingPlans(null)}>
          <PaymentPlansDisplay plans={itIncomeViewingPlans.paymentPlans || []} plannedIncome={itIncomeViewingPlans.plannedIncome} hideTransferDate hideMilestoneName hideHeader />
          <div className="flex justify-center mt-5">
            <button type="button" onClick={() => setItIncomeViewingPlans(null)} className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors">关闭</button>
          </div>
        </ModalShell>
      )}
    </div>
  )
}
