import { useState } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Download,
  Eye,
  RotateCcw
} from 'lucide-react'
import { clsx } from 'clsx'
import ContractAttachments from '@/components/ContractAttachments'
import { getContractInfo } from '@/data/mock'
import { ProjectInfoCard } from '@/components/ContractInfoCard'
import PaymentPlansDisplay from '@/components/plan-modules/common/PaymentPlansDisplay'
import ModalShell from '@/components/plan-modules/common/ModalShell'
import type { ITIncomeRow } from '@/components/plan-modules/types'
import type { ContractAttachment } from '@/data/mock'

// IT收入计划确认 mock 数据（复制自收入计划确认审批页面，独立维护）
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

interface IncomeConfirmDetailProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

export default function IncomeConfirmDetail({ onNavigate, contractId }: IncomeConfirmDetailProps) {
  const contractInfo = getContractInfo(contractId || 'CT2026060006')

  // 流程轨迹相关状态（独立维护）
  const [trailExpanded, setTrailExpanded] = useState(false)
  const trailData = [
    { time: '2026-07-15 10:30:00', actor: '张三', action: '提交合同解析申请' },
    { time: '2026-07-15 14:20:00', actor: '李四', action: '审批通过，流转至计划变更环节' }
  ]

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
    onNavigate?.('/finance/income/confirm')
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
            <h2 className="text-sm font-semibold text-gray-800">收入计划确认详情</h2>
          </div>
        </div>

        {/* 1. 项目信息 */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 附件 */}
        <ContractAttachments attachments={mockAttachments} />

        {/* 3. IT收入计划确认 */}
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
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">是否合同资产</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">里程碑名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">订购状态</th>
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
                                <span className={clsx(
                                  'inline-flex px-2 py-0.5 text-xs rounded-full',
                                  row.orderStatus === '待订购'
                                    ? 'bg-orange-50 text-orange-600'
                                    : row.orderStatus === '订购中'
                                      ? 'bg-blue-50 text-blue-600'
                                      : 'bg-green-50 text-green-600'
                                )}>{row.orderStatus || '待订购'}</span>
                              </td>
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

                  {/* 三证一书 */}
                  <label className="text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
                    三证一书
                  </label>
                  <div className="col-span-3 space-y-2">
                    {certificateFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md">
                        <FileText className="w-4 h-4 text-[#1677FF] shrink-0" />
                        <div className="flex items-center flex-1 min-w-0 ml-3">
                          <span className="text-sm text-gray-800 truncate">{file.name}</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 text-xs text-gray-600 bg-gray-100 rounded shrink-0 ml-3">三证一书</span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{file.size}</span>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{file.uploadTime}</span>
                        <button type="button" className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-blue-700 shrink-0 ml-2">
                          <Eye className="w-3.5 h-3.5" />
                          预览
                        </button>
                        <button type="button" className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-blue-700 shrink-0 ml-2">
                          <Download className="w-3.5 h-3.5" />
                          下载
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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

        {/* 按钮区域 */}
        <div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            返回
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