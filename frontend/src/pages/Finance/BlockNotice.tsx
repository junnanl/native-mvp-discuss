import { useState } from 'react'
import { clsx } from 'clsx'
import { XCircle, X, RotateCcw, Check } from 'lucide-react'

interface BlockNoticeProps {
  onNavigate?: (path: string) => void
}

interface NoticeModal {
  open: boolean
  title: string
  lines: string[]
}

// ============================================================
// 计提确认 mock 数据（独立维护）
// ============================================================
interface ProvisionCheckRow {
  id: string
  netProjectCode: string
  contractCode: string
  productName: string
  expensePlanCode: string
  businessCategory: string
  businessSubCategory: string
  businessActivity: string
  provisionTime: string
}

const mockProvisionCheckRows: ProvisionCheckRow[] = [
  {
    id: 'pc-1',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    productName: '受托代销往来款',
    expensePlanCode: 'ZCJH-010',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    provisionTime: '2026-07-31'
  },
  {
    id: 'pc-2',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    productName: '受托代销手续费',
    expensePlanCode: 'ZCJH-011',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    provisionTime: '2026-07-31'
  },
  {
    id: 'pc-3',
    netProjectCode: 'AH20260102',
    contractCode: 'HT-2026-0011',
    productName: '系统集成服务',
    expensePlanCode: 'ZCJH-012',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    provisionTime: '2026-08-01'
  },
  {
    id: 'pc-4',
    netProjectCode: 'AH20260102',
    contractCode: 'HT-2026-0011',
    productName: '云资源租赁费',
    expensePlanCode: 'ZCJH-013',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '商品销售',
    provisionTime: '2026-07-31'
  },
  {
    id: 'pc-5',
    netProjectCode: 'AH20260103',
    contractCode: 'HT-2026-0012',
    productName: '专线接入服务',
    expensePlanCode: 'ZCJH-014',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '软件开发',
    provisionTime: '2026-08-02'
  }
]

// ============================================================
// 计提校验不通过 mock 数据（独立维护）
// ============================================================
interface ProvisionComplianceRow {
  id: string
  erpCode: string
  netProjectCode: string
  contractCode: string
  productName: string
  expensePlanCode: string
  businessCategory: string
  businessSubCategory: string
  businessActivity: string
  status: string
}

const mockProvisionComplianceRows: ProvisionComplianceRow[] = [
  {
    id: 'plc-1',
    erpCode: 'ERP2026080100001',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    productName: '受托代销往来款',
    expensePlanCode: 'ZCJH-010',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    status: '已提交'
  },
  {
    id: 'plc-2',
    erpCode: 'ERP2026080100001',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    productName: '受托代销手续费',
    expensePlanCode: 'ZCJH-011',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    status: '审核完成'
  },
  {
    id: 'plc-3',
    erpCode: 'ERP2026080100002',
    netProjectCode: 'AH20260102',
    contractCode: 'HT-2026-0011',
    productName: '系统集成服务',
    expensePlanCode: 'ZCJH-012',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    status: '已提交'
  },
  {
    id: 'plc-4',
    erpCode: 'ERP2026080100002',
    netProjectCode: 'AH20260102',
    contractCode: 'HT-2026-0011',
    productName: '云资源租赁费',
    expensePlanCode: 'ZCJH-013',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '商品销售',
    status: '审核完成'
  },
  {
    id: 'plc-5',
    erpCode: 'ERP2026080100003',
    netProjectCode: 'AH20260103',
    contractCode: 'HT-2026-0012',
    productName: '专线接入服务',
    expensePlanCode: 'ZCJH-014',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '软件开发',
    status: '已提交'
  }
]

// ============================================================
// 报账校验不通过 mock 数据（独立维护）
// ============================================================
interface ReportCheckRow {
  id: string
  erpCode: string
  netProjectCode: string
  contractCode: string
  productName: string
  expensePlanCode: string
  businessCategory: string
  businessSubCategory: string
  businessActivity: string
  status: string
}

const mockReportCheckRows: ReportCheckRow[] = [
  {
    id: 'rp-1',
    erpCode: 'ERP2026080200001',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    productName: '受托代销往来款',
    expensePlanCode: 'ZCJH-010',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    status: '已提交'
  },
  {
    id: 'rp-2',
    erpCode: 'ERP2026080200001',
    netProjectCode: 'AH20260101',
    contractCode: 'HT-2026-0010',
    productName: '受托代销手续费',
    expensePlanCode: 'ZCJH-011',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    status: '审核完成'
  },
  {
    id: 'rp-3',
    erpCode: 'ERP2026080200002',
    netProjectCode: 'AH20260102',
    contractCode: 'HT-2026-0011',
    productName: '系统集成服务',
    expensePlanCode: 'ZCJH-012',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    status: '已提交'
  },
  {
    id: 'rp-4',
    erpCode: 'ERP2026080200002',
    netProjectCode: 'AH20260102',
    contractCode: 'HT-2026-0011',
    productName: '云资源租赁费',
    expensePlanCode: 'ZCJH-013',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '商品销售',
    status: '审核完成'
  },
  {
    id: 'rp-5',
    erpCode: 'ERP2026080200003',
    netProjectCode: 'AH20260103',
    contractCode: 'HT-2026-0012',
    productName: '专线接入服务',
    expensePlanCode: 'ZCJH-014',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '软件开发',
    status: '已提交'
  }
]

export default function BlockNotice({ onNavigate }: BlockNoticeProps) {
  const [modal, setModal] = useState<NoticeModal>({ open: false, title: '', lines: [] })
  const [provisionCheckOpen, setProvisionCheckOpen] = useState(false)
  const [provisionComplianceOpen, setProvisionComplianceOpen] = useState(false)
  const [reportCheckOpen, setReportCheckOpen] = useState(false)

  const openSubjectMismatch = () => {
    setModal({
      open: true,
      title: '收入科目不匹配',
      lines: [
        '存在收支科目不匹配：IT类成本【1-1集成费-信息服务，XXX，XXXX】无对应的IT类收入，请修改后重新上传！'
      ]
    })
  }

  const openUpsideDown = () => {
    setModal({
      open: true,
      title: '收支倒挂',
      lines: [
        '存在收支倒挂：',
        '（1）IT类成本【1-1集成费-信息服务】计划支出金额10000元大于计划收入金额8000元',
        '（2）IT类成本【1-1集成费-安装服务】计划支出金额1000元大于计划收入金额800元',
        '请修改后重新上传！'
      ]
    })
  }

  const closeModal = () => setModal(prev => ({ ...prev, open: false }))

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部标题栏 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-2">
          <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
          <h2 className="text-sm font-semibold text-gray-800">阻断提示</h2>
        </div>

        {/* 两个按钮区 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={openSubjectMismatch}
              className="px-6 py-2.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors shadow-sm"
            >
              收支科目不匹配
            </button>
            <button
              type="button"
              onClick={openUpsideDown}
              className="px-6 py-2.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors shadow-sm"
            >
              收支倒挂
            </button>
            <button
              type="button"
              onClick={() => setProvisionCheckOpen(true)}
              className="px-6 py-2.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors shadow-sm"
            >
              计提确认
            </button>
            <button
              type="button"
              onClick={() => setProvisionComplianceOpen(true)}
              className="px-6 py-2.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors shadow-sm"
            >
              计提校验不通过
            </button>
            <button
              type="button"
              onClick={() => setReportCheckOpen(true)}
              className="px-6 py-2.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors shadow-sm"
            >
              报账校验不通过
            </button>
          </div>
        </div>
      </div>

      {/* 自定义弹框 - 参考图样式 */}
      {modal.open && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-[560px] max-w-[92vw] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-start justify-between px-6 pt-5 pb-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                  <X className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 leading-8">
                  {modal.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 shrink-0 mt-1"
                aria-label="关闭"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            {/* 内容区 */}
            <div className="px-6 py-4 text-sm text-gray-800 leading-7 pl-[76px]">
              {modal.lines.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
            {/* 按钮区 - 右下角单蓝色按钮 */}
            <div className="px-6 pb-5 pt-2 flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 计提确认弹框 */}
      {provisionCheckOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
          onClick={() => setProvisionCheckOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-[1200px] max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">计提确认</h3>
              </div>
              <button
                type="button"
                onClick={() => setProvisionCheckOpen(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            {/* 内容区 */}
            <div className="flex-1 overflow-auto px-5 py-4">
              {/* 温馨提示 */}
              <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-4">
                <span className="shrink-0">⚠</span>
                <span>温馨提示：以下计提项目存在上月已计提，本月尚未计提或报账的支出计划，请核查是否存在遗漏</span>
              </div>
              {/* 支出计划明细模块 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">支出计划明细</h3>
                <span className="text-xs text-gray-400">【{mockProvisionCheckRows.length}】</span>
              </div>
              <div className="overflow-x-auto overflow-y-hidden border border-gray-100 rounded-md">
                <table className="w-full text-sm min-w-[1100px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">支出计划编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务大类</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务小类</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务活动</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计提/报账时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockProvisionCheckRows.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                      </tr>
                    ) : (
                      mockProvisionCheckRows.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.contractCode}</td>
                          <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{row.productName}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.expensePlanCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.businessCategory}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.businessSubCategory}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.businessActivity}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.provisionTime}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* 按钮区 - 取消 + 继续提交报账系统 */}
            <div className="px-5 py-3 border-t border-gray-100 flex justify-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setProvisionCheckOpen(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
              <button
                type="button"
                onClick={() => setProvisionCheckOpen(false)}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                继续提交报账系统
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 计提校验不通过弹框 */}
      {provisionComplianceOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
          onClick={() => setProvisionComplianceOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-[1200px] max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                  <X className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">计提校验不通过</h3>
              </div>
              <button
                type="button"
                onClick={() => setProvisionComplianceOpen(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            {/* 内容区 */}
            <div className="flex-1 overflow-auto px-5 py-4">
              {/* 错误警告 */}
              <div className="px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 mb-4">
                <span className="shrink-0">⚠</span>
                <span>错误提示：以下计提项目的支出计划存在本月在途或已完成的计提 / 报账记录，禁止重复提交</span>
              </div>
              {/* 支出计划明细模块 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">支出计划明细</h3>
                <span className="text-xs text-gray-400">【{mockProvisionComplianceRows.length}】</span>
              </div>
              <div className="overflow-x-auto overflow-y-hidden border border-gray-100 rounded-md">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">ERP报账单编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">支出计划编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务大类</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务小类</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务活动</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账单状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockProvisionComplianceRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                      </tr>
                    ) : (
                      mockProvisionComplianceRows.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onNavigate?.(`/finance/expense/detail-with-contract/${row.erpCode}`)}
                              className="text-[#1677FF] hover:underline"
                            >
                              {row.erpCode}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.contractCode}</td>
                          <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{row.productName}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.expensePlanCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.businessCategory}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.businessSubCategory}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.businessActivity}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={clsx(
                              'inline-flex items-center px-2 py-0.5 text-xs rounded-full',
                              row.status === '已提交' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                            )}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* 按钮区 - 取消 + 确定 */}
            <div className="px-5 py-3 border-t border-gray-100 flex justify-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setProvisionComplianceOpen(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
              <button
                type="button"
                onClick={() => setProvisionComplianceOpen(false)}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 报账校验不通过弹框 */}
      {reportCheckOpen && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
          onClick={() => setReportCheckOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-[1200px] max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                  <X className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-800">报账校验不通过</h3>
              </div>
              <button
                type="button"
                onClick={() => setReportCheckOpen(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            {/* 内容区 */}
            <div className="flex-1 overflow-auto px-5 py-4">
              {/* 错误警告 */}
              <div className="px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 mb-4">
                <span className="shrink-0">⚠</span>
                <span>错误提示：以下报账项目的支出计划存在本月在途或已完成的计提 / 报账记录，禁止重复提交</span>
              </div>
              {/* 支出计划明细模块 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">支出计划明细</h3>
                <span className="text-xs text-gray-400">【{mockReportCheckRows.length}】</span>
              </div>
              <div className="overflow-x-auto overflow-y-hidden border border-gray-100 rounded-md">
                <table className="w-full text-sm min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">ERP报账单编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">支出计划编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务大类</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务小类</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务活动</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">报账单状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockReportCheckRows.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                      </tr>
                    ) : (
                      mockReportCheckRows.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-3 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onNavigate?.(`/finance/expense/detail-with-contract/${row.erpCode}`)}
                              className="text-[#1677FF] hover:underline"
                            >
                              {row.erpCode}
                            </button>
                          </td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.contractCode}</td>
                          <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{row.productName}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.expensePlanCode}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.businessCategory}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.businessSubCategory}</td>
                          <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.businessActivity}</td>
                          <td className="px-3 py-3 whitespace-nowrap">
                            <span className={clsx(
                              'inline-flex items-center px-2 py-0.5 text-xs rounded-full',
                              row.status === '已提交' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                            )}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* 按钮区 - 取消 + 确定 */}
            <div className="px-5 py-3 border-t border-gray-100 flex justify-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setReportCheckOpen(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
              <button
                type="button"
                onClick={() => setReportCheckOpen(false)}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
