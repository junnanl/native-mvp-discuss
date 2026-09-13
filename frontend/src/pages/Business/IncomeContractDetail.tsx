import { useState, Fragment } from 'react'
import { ArrowLeft, ChevronDown, ChevronRight, RotateCcw, X } from 'lucide-react'
import { getContractInfo } from '@/data/mock'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import ContractAttachments from '@/components/ContractAttachments'
import SectionBlock from '@/components/plan-modules/common/SectionBlock'
import PaymentPlansDisplay from '@/components/plan-modules/common/PaymentPlansDisplay'
import { calculateExcludingTax } from '@/lib/utils'
import type { ITIncomeRow, CTIncomeRow } from '@/components/plan-modules/types'

interface IncomeContractDetailProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

// ============================================================
// 收入计划 mock 数据（复制自前向合同解析审批页面，独立维护）
// ============================================================
const mockITIncome: ITIncomeRow[] = [
  {
    id: 'it-demo-1',
    productName: '维保费',
    tariffName: '[849]ICT维保服务费',
    mgmtProductCode: 'P1234',
    mgmtProductName: 'ICT维保服务',
    thirdLevelSubject: 'S123',
    coaSubject: 'C5678',
    taxRate: '6%',
    plannedIncome: '500,000',
    plannedTariffAmount: '480,000',
    budgetTariffAmount: '480,000',
    contractStage: '初验',
    billingShareType: '月',
    billingSharePeriod: '12',
    isContractAsset: '否',
    plannedOrderDate: '2026-07-01',
    billingStartDate: '2026-07',
    paymentPlans: [
      { id: 'it-p1', milestone: '初验', amount: '240,000', paymentDate: '2026-07-01', transferDate: '2026-07-01' },
      { id: 'it-p2', milestone: '终验', amount: '240,000', paymentDate: '2026-12-31', transferDate: '2026-12-31' }
    ]
  },
  {
    id: 'it-demo-2',
    productName: '设备费',
    tariffName: '[956]软件开发服务',
    mgmtProductCode: 'P2345',
    mgmtProductName: '软件开发服务',
    thirdLevelSubject: 'S234',
    coaSubject: 'C956-01',
    taxRate: '13%',
    plannedIncome: '2,000,000',
    plannedTariffAmount: '1,900,000',
    budgetTariffAmount: '1,900,000',
    contractStage: '到货',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '是',
    plannedOrderDate: '2026-08-01',
    billingStartDate: '2026-08',
    paymentPlans: [
      { id: 'it-p3', milestone: '到货', amount: '1,900,000', paymentDate: '2026-08-01', transferDate: '2026-08-01' }
    ]
  }
]

const mockCTIncome: CTIncomeRow[] = [
  {
    id: 'ct-demo-1',
    productName: '企业宽带',
    productCode: 'CT-B003',
    productFullName: '企业宽带1000M',
    packageName: '企业套餐',
    bandwidth: '1000',
    orderQuantity: '50',
    tariffName: '[1372]宽带费',
    plannedIncome: '1,200,000',
    plannedTariffAmount: '1,200,000',
    budgetTariffAmount: '1,100,000',
    taxRate: '6%',
    discount: '85',
    billingShareType: '月',
    billingSharePeriod: '36',
    isContractAsset: '否',
    plannedOrderDate: '2026-07',
    billingStartDate: '2026-07-01',
    mgmtProductCode: 'P-CT-B',
    mgmtProductName: '宽带服务',
    thirdLevelSubject: 'S1372',
    coaSubject: 'C-1372-02',
    coaSubjectName: '宽带接入服务收入',
    orderStatus: '已订购'
  },
  {
    id: 'ct-demo-2',
    productName: '数据专线',
    productCode: 'CT-D002',
    productFullName: '数据专线尊享版',
    packageName: '尊享套餐',
    bandwidth: '500',
    orderQuantity: '20',
    tariffName: '[1205]专线费',
    plannedIncome: '2,880,000',
    plannedTariffAmount: '2,880,000',
    budgetTariffAmount: '2,600,000',
    taxRate: '9%',
    discount: '90',
    billingShareType: '月',
    billingSharePeriod: '36',
    isContractAsset: '否',
    plannedOrderDate: '2026-08',
    billingStartDate: '2026-08-01',
    mgmtProductCode: 'P-CT-D',
    mgmtProductName: '专线服务',
    thirdLevelSubject: 'S1205',
    coaSubject: 'C-1205-02',
    coaSubjectName: '专线接入服务收入',
    orderStatus: '已订购'
  }
]

// ============================================================
// 流程轨迹 mock 数据（按时间正序，最后一步为最新）
// ============================================================
const mockProcessTrail = [
  { time: '2026-07-15 10:30:00', actor: '张三', action: '提交合同解析申请' },
  { time: '2026-07-15 14:20:00', actor: '李四', action: '审批通过，流转至计划变更环节' }
]

// ============================================================
// 主页面
// ============================================================
export default function IncomeContractDetail({ onNavigate, contractId }: IncomeContractDetailProps) {
  const contractInfo = getContractInfo(contractId || 'CT2026060001')

  const [itIncomeList] = useState<ITIncomeRow[]>(mockITIncome)
  const [ctIncomeList] = useState<CTIncomeRow[]>(mockCTIncome)

  // 计划信息 - 默认展开
  const [planExpanded, setPlanExpanded] = useState(true)
  // 流程轨迹 - 默认折叠
  const [trailExpanded, setTrailExpanded] = useState(false)
  // 回款计划查看弹框
  const [viewingPlans, setViewingPlans] = useState<ITIncomeRow | null>(null)

  const groupByProductName = <T extends { productName: string }>(list: T[]): { productName: string; rows: T[] }[] => {
    const groups: Record<string, T[]> = {}
    list.forEach(row => {
      if (!groups[row.productName]) {
        groups[row.productName] = []
      }
      groups[row.productName].push(row)
    })
    return Object.entries(groups).map(([productName, rows]) => ({ productName, rows }))
  }

  const handleBack = () => {
    onNavigate?.('/finance/contract')
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部返回条 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">收入合同详情</h2>
          </div>
        </div>

        {/* 1. 项目信息（默认折叠） */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 合同信息（默认折叠） */}
        <ContractInfoCard contractInfo={contractInfo} />

        {/* 3. 项目附件（默认折叠） */}
        <ContractAttachments attachments={contractInfo.attachments} defaultExpanded={false} />

        {/* 4. 计划信息（默认展开） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
            onClick={() => setPlanExpanded(v => !v)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">计划信息</h3>
            {planExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
              : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
            }
          </div>
          {planExpanded && (
            <div className="p-4 space-y-4">
              {/* IT收入计划 */}
              <SectionBlock title="IT收入计划" count={itIncomeList.length}>
                <div className="overflow-x-auto border border-gray-100 rounded-md">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 text-xs">
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购金额</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购金额（不含税）</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">是否合同资产</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupByProductName(itIncomeList).map((group) => {
                        const rowCount = group.rows.length
                        return (
                          <Fragment key={group.productName}>
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
                                <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.plannedTariffAmount || '-'}</td>
                                <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, group.rows[0].taxRate) : '-'}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                                <td className="px-3 py-2.5 text-center whitespace-nowrap text-gray-700">
                                  {row.billingShareType === '一次性' ? row.isContractAsset : '-'}
                                </td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                                <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => setViewingPlans(row)}
                                    className="px-2 py-1 text-xs text-[#1677FF] hover:underline"
                                  >
                                    回款计划
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end items-center gap-6">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                </div>
              </SectionBlock>

              {/* CT收入计划 */}
              <SectionBlock title="CT收入计划" count={ctIncomeList.length}>
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
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购金额</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">计划订购金额（不含税）</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupByProductName(ctIncomeList).map((group) => {
                        const rowCount = group.rows.length
                        return (
                          <Fragment key={group.productName}>
                            {group.rows.map((row, idx) => (
                              <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                                {idx === 0 && (
                                  <>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.productName}</td>
                                    <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].plannedIncome}</td>
                                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].taxRate}</td>
                                  </>
                                )}
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.productFullName ? `【${row.productCode || '-'}】${row.productFullName}` : '-'}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.bandwidth}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.orderQuantity}</td>
                                <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.plannedTariffAmount || '-'}</td>
                                <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, group.rows[0].taxRate) : '-'}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                              </tr>
                            ))}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end items-center gap-6">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{ctIncomeList.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{ctIncomeList.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{ctIncomeList.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                </div>
              </SectionBlock>
            </div>
          )}
        </div>

        {/* 5. 流程轨迹（默认折叠） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
            onClick={() => setTrailExpanded(v => !v)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
            <span className="text-xs text-gray-400 ml-1">共 {mockProcessTrail.length} 步</span>
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
                  {mockProcessTrail.map((item, idx) => (
                    <li key={idx} className="relative">
                      <div className={`absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 ${
                        idx === mockProcessTrail.length - 1
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

        {/* 底部按钮区 */}
        <div className="flex justify-center pt-4 pb-2">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            返回
          </button>
        </div>
      </div>

      {/* IT收入计划回款计划查看弹框 */}
      {viewingPlans && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setViewingPlans(null)}>
          <div
            className="bg-white rounded-lg shadow-xl w-[700px] max-w-[95vw] max-h-[85vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">回款计划明细</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingPlans(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto px-5 py-4">
              <PaymentPlansDisplay plans={viewingPlans.paymentPlans || []} plannedIncome={viewingPlans.plannedIncome} hideTransferDate hideMilestoneName hideHeader />
            </div>
            <div className="flex justify-center px-5 py-3 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setViewingPlans(null)}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
