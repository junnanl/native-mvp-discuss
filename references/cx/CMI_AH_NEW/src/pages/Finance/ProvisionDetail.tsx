import { useState, Fragment } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, RotateCcw, ChevronDown, ChevronRight, HelpCircle } from 'lucide-react'

interface ProvisionDetailProps {
  onNavigate?: (path: string) => void
  id?: string
}

// ============================================================
// 计提明细信息 mock 数据（复制自发起计提页面，独立维护）
// ============================================================
const mockProvisionDetailRows = [
  {
    id: 'pwc-pd-1',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800052',
    poolOrderLineNo: '001',
    expensePlanCode: 'ZCJH-010',
    productName: '受托代销往来款',
    taxRate: '6%',
    tariffName: '[1372]受托代销往来款',
    plannedExpense: '200,000',
    allocationType: '一次性',
    allocationPeriod: '1个月',
    plannedCostDate: '2026-07-01',
    incomeConfirmProgress: '20%',
    cumulativeReimbursedAmount: '23,333.33',
    provisionableAmount: '16,666.67',
    currentProvisionAmount: '16,666.67',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    expenseType: '硬件采购支出',
    productSegment: 'ICT基础资源',
    marketSegment: '政企市场',
    supplierCode: 'SUP-001',
    supplierName: '安徽科大讯飞信息科技有限公司'
  },
  {
    id: 'pwc-pd-2',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800053',
    poolOrderLineNo: '001',
    expensePlanCode: 'ZCJH-011',
    productName: '受托代销手续费',
    taxRate: '6%',
    tariffName: '[849]受托代销手续费',
    plannedExpense: '120,000',
    allocationType: '分月分摊',
    allocationPeriod: '12个月',
    plannedCostDate: '2026-07-15',
    incomeConfirmProgress: '25%',
    cumulativeReimbursedAmount: '20,000.00',
    provisionableAmount: '10,000.00',
    currentProvisionAmount: '10,000.00',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场',
    supplierCode: 'SUP-003',
    supplierName: '华为软件技术有限公司'
  },
  {
    id: 'pwc-pd-3',
    netProjectCode: 'AH20260102',
    contractCode: 'HT-2026-0011',
    poolOrderNo: 'APO303489260800054',
    poolOrderLineNo: '002',
    expensePlanCode: 'ZCJH-012',
    productName: '系统集成服务',
    taxRate: '6%',
    tariffName: '[1205]系统集成服务',
    plannedExpense: '360,000',
    allocationType: '分月分摊',
    allocationPeriod: '6个月',
    plannedCostDate: '2026-07-01',
    incomeConfirmProgress: '15%',
    cumulativeReimbursedAmount: '39,000.00',
    provisionableAmount: '15,000.00',
    currentProvisionAmount: '15,000.00',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场',
    supplierCode: 'SUP-005',
    supplierName: '安徽中兴继远信息技术股份有限公司'
  },
  {
    id: 'pwc-pd-4',
    netProjectCode: 'AH20260103',
    contractCode: 'HT-2026-0012',
    poolOrderNo: 'APO303489260800055',
    poolOrderLineNo: '001',
    expensePlanCode: 'ZCJH-013',
    productName: '商品销售成本',
    taxRate: '13%',
    tariffName: '[956]商品销售成本',
    plannedExpense: '90,000',
    allocationType: '一次性',
    allocationPeriod: '1个月',
    plannedCostDate: '2026-06-01',
    incomeConfirmProgress: '100%',
    cumulativeReimbursedAmount: '0.00',
    provisionableAmount: '90,000.00',
    currentProvisionAmount: '60,000.00',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '商品销售',
    expenseType: '商品销售成本支出',
    productSegment: 'ICT基础资源',
    marketSegment: '政企市场',
    supplierCode: 'SUP-002',
    supplierName: '中国电信股份有限公司'
  },
  {
    id: 'pwc-pd-5',
    netProjectCode: 'AH20260104',
    contractCode: 'HT-2026-0013',
    poolOrderNo: 'APO303489260800056',
    poolOrderLineNo: '003',
    expensePlanCode: 'ZCJH-014',
    productName: '软件开发服务',
    taxRate: '6%',
    tariffName: '[1206]软件开发服务',
    plannedExpense: '600,000',
    allocationType: '分月分摊',
    allocationPeriod: '12个月',
    plannedCostDate: '2026-06-15',
    incomeConfirmProgress: '60%',
    cumulativeReimbursedAmount: '110,000.00',
    provisionableAmount: '600,000.00',
    currentProvisionAmount: '250,000.00',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '软件开发',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场',
    supplierCode: 'SUP-006',
    supplierName: '合肥讯飞软件技术有限公司'
  }
]

// 含税金额 → 不含税金额（含税 ÷ (1 + 税率)，税率形如 '6%'）
const calcExTaxAmount = (amount: string, taxRate: string): string => {
  const amt = parseFloat((amount || '0').replace(/,/g, ''))
  const rateStr = taxRate || ''
  if (!amt || !rateStr) return '0.00'
  const rate = parseFloat(rateStr.replace('%', '')) / 100
  return (amt / (1 + rate)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// ============================================================
// 主页面
// ============================================================
export default function ProvisionDetail({ onNavigate, id }: ProvisionDetailProps) {
  const provisionDetailRows = mockProvisionDetailRows

  // 展开/收起
  const [expandedDetailIds, setExpandedDetailIds] = useState<string[]>([])
  const toggleDetailRow = (rowId: string) => {
    setExpandedDetailIds(prev =>
      prev.includes(rowId) ? prev.filter(item => item !== rowId) : [...prev, rowId]
    )
  }

  // 本次计提金额合计（不含税，元）= 各行含税金额 ÷ (1+税率) 之和
  const totalProvisionExTax = provisionDetailRows.reduce((s, r) => {
    const amt = parseFloat((r.currentProvisionAmount || '0').replace(/,/g, ''))
    const rateStr = r.taxRate
    if (!amt || !rateStr) return s
    const rate = parseFloat(rateStr.replace('%', '')) / 100
    return s + amt / (1 + rate)
  }, 0)
  const totalProvision = provisionDetailRows.reduce((s, r) => s + parseFloat(r.currentProvisionAmount.replace(/,/g, '')), 0)

  const handleBack = () => {
    onNavigate?.('/finance/expense/provision')
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50">
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
            <h2 className="text-sm font-semibold text-gray-800">计提详情</h2>
          </div>
        </div>

        {/* ========== 报账单信息（复制自发起计提页面，只读展示） ========== */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">报账单信息</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-x-6 gap-y-2">
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账单类型：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  项目类费用计提报账单
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账人：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  张三
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账部门：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  政企客户部
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">成本中心：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  CC001-政企客户部
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账总额（含税，元）：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 font-semibold">
                  {totalProvision.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
              </div>

              {/* 报账单摘要：独占一行 */}
              <div className="col-span-3 flex items-start min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账单摘要：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700 whitespace-pre-wrap">
                  2026年6月IDC数据中心项目设备采购及软件开发支出计提，本期计提金额合计35.17万元。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== 计提明细信息（复制自发起计提页面，只读展示） ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">计提明细信息</h3>
            <span className="text-xs text-gray-400">【{provisionDetailRows.length}】</span>
          </div>
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="w-10 px-2 py-2.5 text-center font-medium">
                    <span className="sr-only">展开</span>
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务大类</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务小类</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务活动</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">本次计提金额（不含税，元）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">本次计提金额（含税，元）</th>
                </tr>
              </thead>
              <tbody>
                {provisionDetailRows.map(row => (
                  <Fragment key={row.id}>
                    <tr className="border-t border-gray-100 hover:bg-gray-50/50">
                      <td className="px-2 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleDetailRow(row.id)}
                          className="text-gray-400 hover:text-[#1677FF] p-1 rounded hover:bg-blue-50 transition-colors"
                          title={expandedDetailIds.includes(row.id) ? '收起' : '展开'}
                        >
                          {expandedDetailIds.includes(row.id)
                            ? <ChevronDown className="w-4 h-4" />
                            : <ChevronRight className="w-4 h-4" />
                          }
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.contractCode}</td>
                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.productName}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.businessCategory}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.businessSubCategory}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.businessActivity}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{row.taxRate}</td>
                      <td className="px-3 py-2.5 text-gray-800 font-medium whitespace-nowrap">
                        {calcExTaxAmount(row.currentProvisionAmount, row.taxRate)}
                      </td>
                      <td className="px-3 py-2.5 text-gray-800 font-medium whitespace-nowrap">
                        {row.currentProvisionAmount}
                      </td>
                    </tr>
                    {expandedDetailIds.includes(row.id) && (
                      <tr className="bg-gray-50/50 border-t border-gray-100">
                        <td colSpan={10} className="px-4 py-3 pl-10">
                          <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">费用池订单号：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.poolOrderNo}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">费用池订单行号：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.poolOrderLineNo}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">供应商编码：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.supplierCode}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">供应商名称：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.supplierName}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">支出计划编码：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.expensePlanCode}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">资费名称：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.tariffName}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">计划支出金额：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.plannedExpense}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">分摊类型：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.allocationType}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">分摊周期：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.allocationPeriod}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <div className="flex items-center justify-end shrink-0 pr-2 whitespace-nowrap">
                                <span className="text-sm text-gray-500">计划成本列支时间</span>
                                <div className="relative group mx-0.5">
                                  <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                  <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-max max-w-xs px-3 py-2 text-xs text-white bg-gray-700 rounded-md shadow-lg whitespace-normal">
                                    包含通过计提方式和报账方式入账的成本列支时间
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700" />
                                  </div>
                                </div>
                                <span className="text-sm text-gray-500">：</span>
                              </div>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.plannedCostDate}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">支出类型：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.expenseType}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">产品段：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.productSegment}</div>
                            </div>
                            <div className="flex items-center min-h-[28px]">
                              <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">市场段：</label>
                              <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.marketSegment}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex justify-end items-center gap-6">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">本次计提总额（不含税，元）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{totalProvisionExTax.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">本次计提总额（含税，元）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{totalProvision.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
            </div>
          </div>
        </div>

        {/* 底部按钮区 */}
        <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
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
    </div>
  )
}
