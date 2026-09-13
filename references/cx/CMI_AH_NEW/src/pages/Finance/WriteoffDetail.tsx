import { useState, Fragment } from 'react'
import { ArrowLeft, RotateCcw, ChevronRight, ChevronDown } from 'lucide-react'

interface WriteoffDetailProps {
  onNavigate?: (path: string) => void
  id?: string
}

// ============================================================
// 冲销明细 mock 数据（复制自发起冲销页面，独立维护）
// ============================================================
const mockWriteoffDetailRows = [
  {
    id: 'wcd-1',
    erpCode: 'ERP2026070100001',
    lineNo: '001',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    reimburser: '张三',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800052',
    poolOrderLineNo: '001',
    supplierCode: 'SUP-001',
    supplierName: '安徽科大讯飞信息科技有限公司',
    expensePlanCode: 'ZCJH-010',
    productName: '受托代销往来款',
    taxRate: '6%',
    tariffName: '[1372]受托代销往来款',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    expenseType: '硬件采购支出',
    productSegment: 'ICT基础资源',
    marketSegment: '政企市场',
    amount: '16,666.67',
    createTime: '2026-07-01 10:30:00',
    writeoffAmount: '16,666.67'
  },
  {
    id: 'wcd-2',
    erpCode: 'ERP2026070100002',
    lineNo: '002',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    reimburser: '李四',
    contractCode: 'HT-2026-0010',
    poolOrderNo: 'APO303489260800053',
    poolOrderLineNo: '001',
    supplierCode: 'SUP-003',
    supplierName: '华为软件技术有限公司',
    expensePlanCode: 'ZCJH-011',
    productName: '受托代销手续费',
    taxRate: '6%',
    tariffName: '[849]受托代销手续费',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场',
    amount: '10,000.00',
    createTime: '2026-07-02 14:20:00',
    writeoffAmount: '10,000.00'
  },
  {
    id: 'wcd-3',
    erpCode: 'ERP2026070100003',
    lineNo: '003',
    netProjectCode: 'AH20260102',
    projectName: '芜湖市政务服务中心数字政府项目',
    reimburser: '王五',
    contractCode: 'HT-2026-0011',
    poolOrderNo: 'APO303489260800054',
    poolOrderLineNo: '002',
    supplierCode: 'SUP-005',
    supplierName: '安徽中兴继远信息技术股份有限公司',
    expensePlanCode: 'ZCJH-012',
    productName: '系统集成服务',
    taxRate: '6%',
    tariffName: '[1205]系统集成服务',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    expenseType: '服务采购支出',
    productSegment: 'ICT服务资源',
    marketSegment: '政企市场',
    amount: '15,000.00',
    createTime: '2026-07-03 09:15:00',
    writeoffAmount: '15,000.00'
  }
]

// ============================================================
// 主页面
// ============================================================
export default function WriteoffDetail({ onNavigate, id }: WriteoffDetailProps) {
  const writeoffDetailRows = mockWriteoffDetailRows

  // 冲销明细行展开/收起
  const [expandedDetailIds, setExpandedDetailIds] = useState<string[]>([])
  const toggleDetailRow = (rowId: string) => {
    setExpandedDetailIds(prev =>
      prev.includes(rowId) ? prev.filter(item => item !== rowId) : [...prev, rowId]
    )
  }

  // 报账总额 = 冲销明细金额合计
  const totalWriteoff = writeoffDetailRows.reduce((s, r) => s + parseFloat(r.writeoffAmount.replace(/,/g, '')), 0)

  const handleBack = () => {
    onNavigate?.('/finance/expense/writeoff')
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
            <h2 className="text-sm font-semibold text-gray-800">冲销详情</h2>
          </div>
        </div>

        {/* ========== 报账单信息（复制自发起冲销页面，只读展示） ========== */}
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
                  项目类费用计提冲销报账单
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
                  {totalWriteoff.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
              </div>

              {/* 报账单摘要：独占一行 */}
              <div className="col-span-3 flex items-start min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账单摘要：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700 whitespace-pre-wrap">
                  2026年6月IDC数据中心项目设备采购及软件开发支出冲销，本期冲销金额合计4.17万元。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========== 冲销明细信息（复制自发起冲销页面，只读展示） ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">冲销明细信息</h3>
            <span className="text-xs text-gray-400">【{writeoffDetailRows.length}】</span>
          </div>
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="px-2 py-2.5 text-center font-medium whitespace-nowrap w-10"></th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">ERP报账单编号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账单行号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账人</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计提金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计提时间</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">本次冲销金额</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {writeoffDetailRows.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-4 py-12 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  writeoffDetailRows.map(row => {
                    const expanded = expandedDetailIds.includes(row.id)
                    return (
                      <Fragment key={row.id}>
                        <tr className="hover:bg-gray-50/50">
                          <td className="px-2 py-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => toggleDetailRow(row.id)}
                              className="text-gray-400 hover:text-[#1677FF]"
                            >
                              {expanded
                                ? <ChevronDown className="w-4 h-4" />
                                : <ChevronRight className="w-4 h-4" />}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.erpCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.lineNo}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                          <td className="px-3 py-3 text-gray-600 truncate max-w-[200px]" title={row.projectName}>{row.projectName}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.contractCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.productName}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.taxRate}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.reimburser}</td>
                          <td className="px-3 py-3 text-gray-800 whitespace-nowrap font-medium">{row.amount}</td>
                          <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{row.createTime.split(' ')[0]}</td>
                          <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{row.writeoffAmount}</td>
                        </tr>
                        {expanded && (
                          <tr className="bg-gray-50/50 border-t border-gray-100">
                            <td colSpan={12} className="px-4 py-3 pl-10">
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
                                  <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">业务大类：</label>
                                  <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.businessCategory}</div>
                                </div>
                                <div className="flex items-center min-h-[28px]">
                                  <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">业务小类：</label>
                                  <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.businessSubCategory}</div>
                                </div>
                                <div className="flex items-center min-h-[28px]">
                                  <label className="w-32 text-right text-sm text-gray-500 shrink-0 pr-2">业务活动：</label>
                                  <div className="flex-1 min-w-0 text-sm text-gray-700 truncate">{row.businessActivity}</div>
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
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========== 底部按钮区 ========== */}
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
