import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, ChevronDown, ChevronRight, X, RotateCcw, ClipboardList } from 'lucide-react'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import { getContractInfo } from '@/data/mock'
import { calculateExcludingTax } from '@/lib/utils'

// CT订购计划数据类型（与ProductAssociation一致，独立维护）
interface CTOrderPlan {
  id: string
  planCode: string
  productName: string
  taxRate: string
  bandwidth: string
  quantity: string
  actualQuantity: string
  tariffName: string
  plannedAmount: string
  shareType: string
  sharePeriod: string
  plannedOrderDate: string
  orderStatus: string
  contractCode: string
  mgmtProduct: string
  coaSubject: string
  actualOrderDate: string
}

// 计费号码信息（弹框展示，独立维护）
interface BillingUserInfo {
  id: string
  billingUser: string
  bindTime: string
  unbindTime: string
}

// 计费号码信息 mock 数据（3组）
const mockBillingInfoList: BillingUserInfo[] = [
  { id: 'bi1', billingUser: '13800138001', bindTime: '2026-07-20 10:23:15', unbindTime: '' },
  { id: 'bi2', billingUser: '13800138002', bindTime: '2026-07-21 09:12:40', unbindTime: '' },
  { id: 'bi3', billingUser: '13800138003', bindTime: '2026-07-25 14:05:08', unbindTime: '2026-08-01 16:30:00' }
]

// CT订购计划 mock 数据（独立维护，不影响其他页面）
const ctOrderPlanList: CTOrderPlan[] = [
  {
    id: 'ct1',
    planCode: 'CT-PLAN-202607001',
    productName: '[J910]宽带',
    taxRate: '6%',
    bandwidth: '100',
    quantity: '50',
    actualQuantity: '30',
    tariffName: '企业宽带标准套餐',
    plannedAmount: '250,000.00',
    shareType: '月',
    sharePeriod: '36',
    plannedOrderDate: '2026-07-20',
    orderStatus: '已订购',
    contractCode: 'CTR2026000007',
    mgmtProduct: 'ICT宽带服务',
    coaSubject: 'C6001-宽带服务收入',
    actualOrderDate: '2026-07-22'
  },
  {
    id: 'ct2',
    planCode: 'CT-PLAN-202607002',
    productName: '[J920]专线',
    taxRate: '9%',
    bandwidth: '1000',
    quantity: '10',
    actualQuantity: '6',
    tariffName: '政企专线精品套餐',
    plannedAmount: '480,000.00',
    shareType: '一次性',
    sharePeriod: '1',
    plannedOrderDate: '2026-07-15',
    orderStatus: '部分订购',
    contractCode: 'CTR2026000007',
    mgmtProduct: 'ICT专线服务',
    coaSubject: 'C6002-专线服务收入',
    actualOrderDate: '2026-07-18'
  },
  {
    id: 'ct3',
    planCode: 'CT-PLAN-202607003',
    productName: '[J925]MPLS VPN',
    taxRate: '9%',
    bandwidth: '500',
    quantity: '8',
    actualQuantity: '8',
    tariffName: 'MPLS VPN 省级节点套餐',
    plannedAmount: '180,000.00',
    shareType: '月',
    sharePeriod: '36',
    plannedOrderDate: '2026-07-10',
    orderStatus: '已订购',
    contractCode: 'CTR2026000007',
    mgmtProduct: 'ICT专线服务',
    coaSubject: 'C6002-专线服务收入',
    actualOrderDate: '2026-07-12'
  },
  {
    id: 'ct4',
    planCode: 'CT-PLAN-202607004',
    productName: '[J930]云专线',
    taxRate: '6%',
    bandwidth: '2000',
    quantity: '5',
    actualQuantity: '0',
    tariffName: '云专线尊享套餐',
    plannedAmount: '360,000.00',
    shareType: '月',
    sharePeriod: '24',
    plannedOrderDate: '2026-08-01',
    orderStatus: '待订购',
    contractCode: 'CTR2026000007',
    mgmtProduct: 'ICT云专线服务',
    coaSubject: 'C6003-云专线服务收入',
    actualOrderDate: ''
  },
  {
    id: 'ct5',
    planCode: 'CT-PLAN-202607005',
    productName: '[J915]互联网专线',
    taxRate: '9%',
    bandwidth: '500',
    quantity: '20',
    actualQuantity: '12',
    tariffName: '互联网专线企业套餐',
    plannedAmount: '300,000.00',
    shareType: '一次性',
    sharePeriod: '1',
    plannedOrderDate: '2026-07-25',
    orderStatus: '订购中',
    contractCode: 'CTR2026000007',
    mgmtProduct: 'ICT专线服务',
    coaSubject: 'C6002-专线服务收入',
    actualOrderDate: ''
  }
]

interface WorkOrderDetailProps {
  onNavigate?: (path: string) => void
  workOrderId?: string
}

export default function WorkOrderDetail({ onNavigate, workOrderId }: WorkOrderDetailProps) {
  const contractInfo = getContractInfo('CT2026060007')
  const [ctExpanded, setCtExpanded] = useState(true)
  const [showBillingModal, setShowBillingModal] = useState(false)

  // CT订购计划数据（根据合同编码筛选）
  const filteredCTOrderPlan = useMemo(() => {
    return ctOrderPlanList.filter(item => item.contractCode === contractInfo.code)
  }, [contractInfo.code])

  // 合计
  const ctPlanTotals = useMemo(() => {
    const totalWithTax = filteredCTOrderPlan.reduce((sum, item) => sum + parseFloat(item.plannedAmount.replace(/,/g, '')), 0)
    const totalWithoutTax = filteredCTOrderPlan.reduce((sum, item) => {
      const num = parseFloat(item.plannedAmount.replace(/,/g, ''))
      const rate = parseFloat(item.taxRate) / 100
      return sum + num / (1 + rate)
    }, 0)
    return {
      budgetIncome: totalWithTax.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalWithTax: totalWithTax.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalWithoutTax: totalWithoutTax.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  }, [filteredCTOrderPlan])

  const handleBack = () => {
    onNavigate?.('/finance/income/product-association')
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-3 space-y-3">
        {/* 顶部返回条 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={handleBack} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">CT产品订购工单详情</h2>
          </div>
        </div>

        {/* 1. 项目信息（使用前向合同解析页面公共组件） */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 合同信息（使用前向合同解析页面公共组件） */}
        <ContractInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 3. CT产品甩单确认（只读，无温馨提示，无复选框） */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* 折叠标题栏 */}
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-gray-50 border-b border-gray-100"
            onClick={() => setCtExpanded(!ctExpanded)}
          >
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">CT产品甩单确认</h3>
              <span className="text-xs text-gray-400">【{filteredCTOrderPlan.length}】</span>
            </div>
            {ctExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500" />
              : <ChevronRight className="w-4 h-4 text-gray-500" />
            }
          </div>

          {ctExpanded && (
            <div className="p-4 space-y-4">
              {/* CT订购计划表格（无复选框，13列） */}
              <div className="overflow-x-auto">
                <div className="border border-gray-100 rounded-lg overflow-hidden inline-block min-w-full">
                  <table className="w-full text-sm whitespace-nowrap">
                    <thead className="bg-gray-50">
                      <tr className="text-gray-500">
                        <th className="px-3 py-2 text-left font-medium">计划编码</th>
                        <th className="px-3 py-2 text-left font-medium">产品名称</th>
                        <th className="px-3 py-2 text-left font-medium">税率</th>
                        <th className="px-3 py-2 text-left font-medium">资费名称</th>
                        <th className="px-3 py-2 text-left font-medium">带宽（M）</th>
                        <th className="px-3 py-2 text-right font-medium">计划订购数量</th>
                        <th className="px-3 py-2 text-right font-medium">实际订购数量</th>
                        <th className="px-3 py-2 text-right font-medium">计划订购金额</th>
                        <th className="px-3 py-2 text-right font-medium">计划订购金额（不含税）</th>
                        <th className="px-3 py-2 text-left font-medium">分摊类型</th>
                        <th className="px-3 py-2 text-left font-medium">分摊周期</th>
                        <th className="px-3 py-2 text-left font-medium">计划订购时间</th>
                        <th className="px-3 py-2 text-left font-medium">订购状态</th>
                        <th className="px-3 py-2 text-left font-medium">实际订购时间</th>
                        <th className="px-3 py-2 text-center font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCTOrderPlan.length === 0 ? (
                        <tr>
                          <td colSpan={15} className="px-4 py-8 text-center text-gray-400">暂无数据</td>
                        </tr>
                      ) : (
                        filteredCTOrderPlan.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50/50">
                            <td className="px-3 py-2.5 text-gray-700">{item.planCode}</td>
                            <td className="px-3 py-2.5 text-gray-700">{item.productName}</td>
                            <td className="px-3 py-2.5 text-gray-700">{item.taxRate}</td>
                            <td className="px-3 py-2.5 text-gray-700">{item.tariffName}</td>
                            <td className="px-3 py-2.5 text-gray-700">{item.bandwidth}</td>
                            <td className="px-3 py-2.5 text-gray-700 text-right tabular-nums">{item.quantity}</td>
                            <td className="px-3 py-2.5 text-gray-700 text-right tabular-nums">{item.actualQuantity}</td>
                            <td className="px-3 py-2.5 text-gray-700 text-right tabular-nums">{item.plannedAmount}</td>
                            <td className="px-3 py-2.5 text-gray-700 text-right tabular-nums">{calculateExcludingTax(item.plannedAmount, item.taxRate)}</td>
                            <td className="px-3 py-2.5 text-gray-700">{item.shareType}</td>
                            <td className="px-3 py-2.5 text-gray-700">{item.sharePeriod}</td>
                            <td className="px-3 py-2.5 text-gray-700">{item.plannedOrderDate}</td>
                            <td className="px-3 py-2.5">
                              <span className={clsx(
                                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                                item.orderStatus === '待订购' && 'bg-orange-50 text-orange-600 border border-orange-100',
                                item.orderStatus === '订购中' && 'bg-blue-50 text-blue-600 border border-blue-100',
                                item.orderStatus === '部分订购' && 'bg-yellow-50 text-yellow-700 border border-yellow-100',
                                item.orderStatus === '已订购' && 'bg-green-50 text-green-600 border border-green-100'
                              )}>
                                {item.orderStatus}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                              {item.actualOrderDate || '—'}
                            </td>
                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                              {(item.orderStatus === '已订购' || item.orderStatus === '部分订购') ? (
                                <button
                                  type="button"
                                  onClick={() => setShowBillingModal(true)}
                                  className="text-[#1677FF] hover:text-[#1668DD] text-sm"
                                >
                                  计费信息
                                </button>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ========== 订购信息（只读展示） ========== */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                  <span className="text-sm font-semibold text-gray-800">订购信息</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div className="col-span-2">
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-44 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">订单编号</label>
                      <div className="flex-1 min-w-0 text-sm text-gray-700">ORD-20260815-001</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-44 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">要求完成时间</label>
                      <div className="flex-1 min-w-0 text-sm text-gray-700">2026-08-15</div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-start min-h-[36px]">
                      <label className="w-44 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2 pt-0.5">订购说明</label>
                      <div className="flex-1 min-w-0 text-sm text-gray-700">请按照合同约定时间完成CT产品订购和开通，确保带宽和数量满足客户需求。</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ========== 客户信息（只读展示） ========== */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                  <span className="text-sm font-semibold text-gray-800">客户信息</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <div className="flex items-center min-h-[36px]">
                      <label className="w-44 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">集团客户信息</label>
                      <div className="flex-1 min-w-0 text-sm text-gray-700">{contractInfo.counterpartName}（{contractInfo.code}）</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮区 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              返回
            </button>
            <button
              type="button"
              onClick={() => alert('订单进度功能开发中')}
              className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
            >
              <ClipboardList className="w-4 h-4" />
              订单进度
            </button>
          </div>
        </div>
      </div>

      {/* 计费号码信息弹框 */}
      {showBillingModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setShowBillingModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[700px] max-w-[90vw] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">计费号码信息</h3>
              <button
                type="button"
                onClick={() => setShowBillingModal(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-500">
                      <th className="px-4 py-2.5 text-left font-medium">计费号码</th>
                      <th className="px-4 py-2.5 text-left font-medium">绑定时间</th>
                      <th className="px-4 py-2.5 text-left font-medium">解绑时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockBillingInfoList.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800 tabular-nums">{item.billingUser}</td>
                        <td className="px-4 py-3 text-gray-600">{item.bindTime}</td>
                        <td className="px-4 py-3 text-gray-600">{item.unbindTime || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  onClick={() => setShowBillingModal(false)}
                  className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
