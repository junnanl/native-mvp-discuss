import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  RotateCcw,
  ChevronRight,
  ChevronDown,
  FileText,
  Download,
  Search,
  X
} from 'lucide-react'
import { clsx } from 'clsx'
import FileUpload from '@/components/FileUpload'
import ContractAttachments from '@/components/ContractAttachments'
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

// 集团客户 mock 数据
interface GroupCustomer {
  id: string
  code: string
  name: string
  nationalCode: string
  level: string
  industry: string
}

const mockGroupCustomers: GroupCustomer[] = [
  { id: 'GC001', code: 'GC001', name: '安徽智教科技有限公司', nationalCode: 'NAT001', level: 'A级', industry: '教育' },
  { id: 'GC002', code: 'GC002', name: '芜湖教育信息服务中心', nationalCode: 'NAT002', level: 'B级', industry: '教育' },
  { id: 'GC003', code: 'GC003', name: '合肥智慧城市运营公司', nationalCode: 'NAT003', level: 'A级', industry: '政务' },
  { id: 'GC004', code: 'GC004', name: '蚌埠数字教育研究院', nationalCode: 'NAT004', level: 'B级', industry: '教育' }
]

// 账户 mock 数据
interface Account {
  id: string
  name: string
  type: string
}

const mockAccounts: Account[] = [
  { id: 'ACC-001', name: '合肥市第一人民医院基本户', type: '基本存款账户' },
  { id: 'ACC-002', name: '合肥市第一人民医院专户', type: '专用存款账户' },
  { id: 'ACC-003', name: '合肥市第一人民医院一般户', type: '一般存款账户' }
]

interface ProductActivationProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

export default function ProductActivation({ onNavigate, contractId }: ProductActivationProps) {
  const contractInfo = getContractInfo(contractId || 'CT2026060006')

  // 流程轨迹相关状态（复制自前向合同解析审批页面，独立维护）
  const [trailExpanded, setTrailExpanded] = useState(false)
  const trailData = [
    { time: '2026-07-15 10:30:00', actor: '张三', action: '提交合同解析申请' },
    { time: '2026-07-15 14:20:00', actor: '李四', action: '审批通过，流转至计划变更环节' }
  ]

  // 流程信息相关状态（复制自前向合同解析确认页面，独立维护）
  const [approver, setApprover] = useState('')
  const [approver2, setApprover2] = useState('')

  // IT收入计划确认相关状态（独立维护）
  const [incomeExpanded, setIncomeExpanded] = useState(true)
  const [itIncomeViewingPlans, setItIncomeViewingPlans] = useState<ITIncomeRow | null>(null)

  // 客户信息相关状态
  const [groupCustomer, setGroupCustomer] = useState('')
  const [account, setAccount] = useState('')

  // 集团客户选择弹框状态
  const [groupCustomerModalOpen, setGroupCustomerModalOpen] = useState(false)
  const [groupCustomerFilterCode, setGroupCustomerFilterCode] = useState('')
  const [groupCustomerFilterName, setGroupCustomerFilterName] = useState('')
  const [selectedGroupCustomer, setSelectedGroupCustomer] = useState<GroupCustomer | null>(null)

  // 账户选择弹框状态
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [accountModalSearchId, setAccountModalSearchId] = useState('')
  const [accountModalSearchName, setAccountModalSearchName] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  // 三证一书附件
  const [certificateFiles, setCertificateFiles] = useState<string[]>([])
  const handleAddCertificateFile = () => {
    const fileName = `三证一书_${certificateFiles.length + 1}.pdf`
    setCertificateFiles(prev => [...prev, fileName])
  }
  const handleRemoveCertificateFile = (index: number) => {
    setCertificateFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleCancel = () => {
    onNavigate?.('/finance/contract/query')
  }

  const handleSubmit = () => {
    alert('产品开通提交成功！')
    if (onNavigate) {
      onNavigate('/finance/certificate/audit')
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
            <h2 className="text-sm font-semibold text-gray-800">产品开通</h2>
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
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品类型</th>
                      <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">带宽（M）</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购数量</th>
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
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{(row as any).productFullName ? `【${(row as any).productCode || '-'}】${(row as any).productFullName}` : '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{(row as any).bandwidth || '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{(row as any).orderQuantity || '-'}</td>
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
                        <div className="flex items-center flex-1 min-w-0">
                          <span className="text-sm text-gray-800 truncate">{file.name}</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 text-xs text-gray-600 bg-gray-100 rounded shrink-0 ml-3">项目进度证明</span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{file.size}</span>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{file.uploadTime}</span>
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
                  {/* 集团客户选择 */}
                  <label className="text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    <span className="text-red-500 mr-0.5">*</span>
                    集团客户信息
                  </label>
                  <div>
                    <div
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        setGroupCustomerModalOpen(true)
                        setGroupCustomerFilterCode('')
                        setGroupCustomerFilterName('')
                        setSelectedGroupCustomer(null)
                      }}
                    >
                      <span className={groupCustomer ? 'text-gray-800' : 'text-gray-400'}>
                        {groupCustomer || '请选择集团客户'}
                      </span>
                      <Search className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* 账户选择 */}
                  <label className="text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    <span className="text-red-500 mr-0.5">*</span>
                    账户信息
                  </label>
                  <div>
                    <div
                      className={`w-full px-3 py-2 text-sm border rounded-md flex items-center justify-between ${
                        groupCustomer
                          ? 'border-gray-300 focus:outline-none focus:border-blue-500 bg-white cursor-pointer'
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      onClick={() => {
                        if (groupCustomer) {
                          setAccountModalOpen(true)
                          setAccountModalSearchId('')
                          setAccountModalSearchName('')
                          setSelectedAccount(null)
                        }
                      }}
                    >
                      <span className={groupCustomer ? (account ? 'text-gray-800' : 'text-gray-400') : 'text-gray-400'}>
                        {groupCustomer ? (account || '请选择账户') : '请先选择集团客户信息'}
                      </span>
                      <Search className={`w-4 h-4 ${groupCustomer ? 'text-gray-400' : 'text-gray-300'}`} />
                    </div>
                  </div>

                  {/* 三证一书 */}
                  <label className="text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    <span className="text-red-500 mr-0.5">*</span>
                    三证一书
                  </label>
                  <div className="col-span-3">
                    <FileUpload
                      hideLabel
                      files={certificateFiles}
                      onAdd={handleAddCertificateFile}
                      onRemove={handleRemoveCertificateFile}
                      uploadText={certificateFiles.length > 0 ? '继续添加三证一书文件' : '点击或拖拽上传三证一书文件'}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 流程信息（复制自前向合同解析确认页面，独立维护） */}
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
                      三证一书稽核
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
                        三证一书稽核人员
                      </span>
                      <div className="flex-1 min-w-0">
                        <SearchableSelect
                          value={approver}
                          onChange={setApprover}
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
            完成产品开通
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

      {/* 集团客户选择弹框 */}
      {groupCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setGroupCustomerModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-[800px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">选择集团客户</h3>
              <button type="button" onClick={() => setGroupCustomerModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* 筛选条件 */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0">集团客户编码</label>
                  <input
                    type="text"
                    value={groupCustomerFilterCode}
                    onChange={(e) => setGroupCustomerFilterCode(e.target.value)}
                    placeholder="请输入集团客户编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0">集团客户名称</label>
                  <input
                    type="text"
                    value={groupCustomerFilterName}
                    onChange={(e) => setGroupCustomerFilterName(e.target.value)}
                    placeholder="请输入集团客户名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              {/* 表格 */}
              <div className="overflow-auto max-h-[320px] border border-gray-200 rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap w-10"></th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">集团客户编码</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">集团客户名称</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">全网集团编码</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">集团客户等级</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">行业类别</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockGroupCustomers
                      .filter(gc => {
                        const codeMatch = !groupCustomerFilterCode.trim() || gc.code.includes(groupCustomerFilterCode.trim())
                        const nameMatch = !groupCustomerFilterName.trim() || gc.name.includes(groupCustomerFilterName.trim())
                        return codeMatch && nameMatch
                      })
                      .map(gc => (
                        <tr key={gc.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelectedGroupCustomer(gc)}>
                          <td className="px-3 py-2">
                            <input
                              type="radio"
                              name="groupCustomer"
                              checked={selectedGroupCustomer?.id === gc.id}
                              onChange={() => setSelectedGroupCustomer(gc)}
                              className="w-4 h-4 text-[#1677FF]"
                            />
                          </td>
                          <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{gc.code}</td>
                          <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{gc.name}</td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{gc.nationalCode}</td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{gc.level}</td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{gc.industry}</td>
                        </tr>
                      ))}
                    {mockGroupCustomers.filter(gc => {
                      const codeMatch = !groupCustomerFilterCode.trim() || gc.code.includes(groupCustomerFilterCode.trim())
                      const nameMatch = !groupCustomerFilterName.trim() || gc.name.includes(groupCustomerFilterName.trim())
                      return codeMatch && nameMatch
                    }).length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">暂无数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setGroupCustomerModalOpen(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedGroupCustomer) {
                    setGroupCustomer(selectedGroupCustomer.name)
                    setAccount('')
                  }
                  setGroupCustomerModalOpen(false)
                }}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 账户选择弹框 */}
      {accountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAccountModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">选择账户</h3>
              <button type="button" onClick={() => setAccountModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* 搜索 */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-20 text-right">账户ID</label>
                  <input
                    type="text"
                    value={accountModalSearchId}
                    onChange={(e) => setAccountModalSearchId(e.target.value)}
                    placeholder="请输入账户ID"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-20 text-right">账户名称</label>
                  <input
                    type="text"
                    value={accountModalSearchName}
                    onChange={(e) => setAccountModalSearchName(e.target.value)}
                    placeholder="请输入账户名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              {/* 表格 */}
              <div className="overflow-auto max-h-[320px] border border-gray-200 rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap w-10"></th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">账户ID</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">账户名称</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">账户类型</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockAccounts
                      .filter(acc => {
                        const sid = accountModalSearchId.trim().toLowerCase()
                        const sname = accountModalSearchName.trim().toLowerCase()
                        return (!sid || acc.id.toLowerCase().includes(sid)) && (!sname || acc.name.toLowerCase().includes(sname))
                      })
                      .map(acc => (
                        <tr key={acc.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => setSelectedAccount(acc)}>
                          <td className="px-3 py-2">
                            <input
                              type="radio"
                              name="account"
                              checked={selectedAccount?.id === acc.id}
                              onChange={() => setSelectedAccount(acc)}
                              className="w-4 h-4 text-[#1677FF]"
                            />
                          </td>
                          <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{acc.id}</td>
                          <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{acc.name}</td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{acc.type}</td>
                        </tr>
                      ))}
                    {mockAccounts.filter(acc => {
                      const sid = accountModalSearchId.trim().toLowerCase()
                      const sname = accountModalSearchName.trim().toLowerCase()
                      return (!sid || acc.id.toLowerCase().includes(sid)) && (!sname || acc.name.toLowerCase().includes(sname))
                    }).length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-400">暂无数据</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setAccountModalOpen(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedAccount) {
                    setAccount(selectedAccount.name)
                  }
                  setAccountModalOpen(false)
                }}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
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
