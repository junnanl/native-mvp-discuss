import { useMemo } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { getFundApplyDetail, getCostFundStatusText, getFundStatusClass } from '@/data/mock'

interface CostFundDetailProps {
  onNavigate: (path: string) => void
  id: string
}

const accountMap: Record<string, string> = {
  '张凯': 'zhangkai001',
  '李明': 'liming001',
  '周敏': 'zhoumin001'
}

// 申报明细 mock 数据
interface DetailRow {
  budgetYear: string
  classCode: string
  className: string
  classSmCode: string
  classSmName: string
  activityCode: string
  activityName: string
  declareAmount: string
}

export default function CostFundDetail({ onNavigate, id }: CostFundDetailProps) {
  const item = useMemo(() => getFundApplyDetail(id), [id])

  if (!item) {
    return (
      <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50 p-4">
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-sm px-4 py-12 text-center text-gray-400">未找到该资金申请记录</div>
        </div>
      </div>
    )
  }

  const statusText = getCostFundStatusText(item.status)

  // 申报明细信息（不可编辑表格）
  const detailRows: DetailRow[] = [
    { budgetYear: '2026', classCode: 'DK001', className: 'ICT项目成本', classSmCode: 'DK00101', classSmName: '硬件设备', activityCode: 'HD001', activityName: '设备采购', declareAmount: item.applyAmount },
    { budgetYear: '2026', classCode: 'DK001', className: 'ICT项目成本', classSmCode: 'DK00102', classSmName: '技术服务', activityCode: 'JS001', activityName: '系统集成', declareAmount: '250,000.00' }
  ]

  const handleBack = () => onNavigate?.('/finance/fund/ict-cost')

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 返回条 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={handleBack} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">成本立项工单详情</h2>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs rounded-full font-medium ${getFundStatusClass(item.status, item.type)}`}>{statusText}</span>
          </div>
        </div>

        {/* 资金申请工单（一行三列，纯展示） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">资金申请工单</h3>
          </div>
          <div className="px-4 py-4">
            <div className="grid grid-cols-3 gap-x-6 gap-y-0">
              <DetailField label="省内项目编码" value={item.projectCode} />
              <DetailField label="全网项目编码" value={item.globalCode} />
              <DetailField label="项目名称" value={item.projectName} />
              <DetailField label="预算项目编码" value="-" />
              <DetailField label="预算项目名称" value={item.projectName} />
              <DetailField label="申请人SMAP账号" value={accountMap[item.applyUser] || 'zhangkai001'} />
              <DetailField label="申请公司" value="安徽移动合肥分公司" />
              <DetailField label="预算责任部门" value={item.applyDept} />
              <DetailField label="申报金额(不含税，元)" value={item.applyAmount} />
              <DetailField label="项目开始时间" value={item.createTime?.split(' ')[0]} />
              <DetailField label="项目结束时间" value="2026-12-31" />
              <DetailField label="项目类别" value="自结项目" />
              <DetailField label="开支类别" value="物资-摊销" />
              <DetailField label="项目分类" value="ICT项目（正净现值）" />
              <DetailField label="战略标签" value="智慧中台" />
            </div>
          </div>
        </div>

        {/* 申报明细信息（不可编辑表格，无操作列） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">申报明细信息</h3>
            <span className="text-xs text-gray-400">共 {detailRows.length} 行</span>
          </div>
          <div className="px-4 py-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500">
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">预算年度</th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务大类编码</th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务大类名称</th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务小类编码</th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务小类名称</th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务活动编码</th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务活动名称</th>
                    <th className="px-2 py-2 text-right font-medium whitespace-nowrap">申报行金额(不含税，元)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detailRows.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">暂无申报明细</td></tr>
                  ) : (
                    detailRows.map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-2 text-gray-600">{row.budgetYear}年</td>
                        <td className="px-2 py-2 text-gray-800">{row.classCode || '-'}</td>
                        <td className="px-2 py-2 text-gray-800">{row.className || '-'}</td>
                        <td className="px-2 py-2 text-gray-800">{row.classSmCode || '-'}</td>
                        <td className="px-2 py-2 text-gray-800">{row.classSmName || '-'}</td>
                        <td className="px-2 py-2 text-gray-800">{row.activityCode || '-'}</td>
                        <td className="px-2 py-2 text-gray-800">{row.activityName || '-'}</td>
                        <td className="px-2 py-2 text-right text-gray-800 font-medium">{row.declareAmount || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 底部返回按钮 */}
        <div className="flex justify-center pt-2">
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

function DetailField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center min-h-[36px]">
      <label className="w-36 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">{label}：</label>
      <div className="flex-1 min-w-0 text-sm text-gray-800">{value || '-'}</div>
    </div>
  )
}
