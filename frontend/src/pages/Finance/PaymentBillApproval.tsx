import { useState } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, RotateCcw, Send, X, ChevronDown, ChevronRight } from 'lucide-react'

interface PaymentBillApprovalProps {
  onNavigate?: (path: string) => void
}

// ============================================================
// 支付明细 mock 数据（复制自付款详情页面，独立维护）
// ============================================================
interface PaymentDetailRow {
  id: string
  aictBillCode: string
  erpCode: string
  netProjectCode: string
  projectName: string
  reimburser: string
  reimburseDept: string
  reimburseTime: string
  contractCode: string
  expensePlanCode: string
  businessCategory: string
  businessSubCategory: string
  businessActivity: string
  paymentType: string
  reportAmount: string
  paidAmount: string
  remainAmount: string
  currentPaymentAmount: string
  paymentAccount: string
  payeeName: string
  bankCode: string
}

const mockPaymentDetailRows: PaymentDetailRow[] = [
  {
    id: 'payd-1',
    aictBillCode: 'AICT2026060001',
    erpCode: 'ERP2026070100001',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    reimburser: '张三',
    reimburseDept: '政企客户部',
    reimburseTime: '2026-07-01',
    contractCode: 'HT-2026-0010',
    expensePlanCode: 'ZCJH-010',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '硬件设备',
    businessActivity: '设备采购',
    paymentType: '正常支付',
    reportAmount: '30,000.00',
    paidAmount: '0.00',
    remainAmount: '30,000.00',
    currentPaymentAmount: '16,666.67',
    paymentAccount: '6222020200001234567',
    payeeName: '科大讯飞信息科技有限公司',
    bankCode: '102361000123'
  },
  {
    id: 'payd-2',
    aictBillCode: 'AICT2026060001',
    erpCode: 'ERP2026070100001',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    reimburser: '张三',
    reimburseDept: '政企客户部',
    reimburseTime: '2026-07-01',
    contractCode: 'HT-2026-0010',
    expensePlanCode: 'ZCJH-011',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '运维服务',
    paymentType: '正常支付',
    reportAmount: '20,000.00',
    paidAmount: '0.00',
    remainAmount: '20,000.00',
    currentPaymentAmount: '10,000.00',
    paymentAccount: '6217002020012345678',
    payeeName: '华为软件技术有限公司',
    bankCode: '105361000456'
  },
  {
    id: 'payd-3',
    aictBillCode: 'AICT2026060002',
    erpCode: 'ERP2026070100002',
    netProjectCode: 'AH20260101',
    projectName: '合肥市第一人民医院智慧医疗项目',
    reimburser: '李四',
    reimburseDept: '政企客户部',
    reimburseTime: '2026-07-02',
    contractCode: 'HT-2026-0010',
    expensePlanCode: 'ZCJH-012',
    businessCategory: 'ICT项目成本',
    businessSubCategory: '技术服务',
    businessActivity: '系统集成',
    paymentType: '正常支付',
    reportAmount: '30,000.00',
    paidAmount: '0.00',
    remainAmount: '30,000.00',
    currentPaymentAmount: '15,000.00',
    paymentAccount: '6212262020012345678',
    payeeName: '中兴通讯股份有限公司',
    bankCode: '104361000789'
  }
]

// ============================================================
// 回款证明信息 mock 数据（复制自付款详情页面，独立维护）
// ============================================================
interface ReceiptProofRow {
  id: string
  netProjectCode: string
  customerManager: string
  currentPaymentAmount: string
  paidAmountSystem: string
  paidAmountManual: string
  itReceiptAmount: string
  ctReceiptAmount: string
  projectReceiptAmount: string
  receiptRemark: string
  proofs: {
    id: string
    accountIdentifier: string
    paymentAmount: string
    paymentTime: string
    groupCustomerCode: string
    remark: string
  }[]
}

const mockReceiptProofRows: ReceiptProofRow[] = [
  {
    id: 'rc-1',
    netProjectCode: 'AH20260101',
    customerManager: '张凯',
    currentPaymentAmount: '16,666.67',
    paidAmountSystem: '50,000.00',
    paidAmountManual: '45,000.00',
    itReceiptAmount: '20,000.00',
    ctReceiptAmount: '30,000.00',
    projectReceiptAmount: '50,000.00',
    receiptRemark: '本次付款已提供回款证明，待客户经理确认',
    proofs: [
      { id: 'p1', accountIdentifier: '6222020200001234567', paymentAmount: '30,000.00', paymentTime: '2026-07-10', groupCustomerCode: 'GCUS001', remark: '客户回款，系统自动核销' },
      { id: 'p2', accountIdentifier: '6222020200001234568', paymentAmount: '20,000.00', paymentTime: '2026-07-15', groupCustomerCode: 'GCUS001', remark: '客户回款，系统自动核销' }
    ]
  }
]

// ============================================================
// 流程轨迹 mock 数据（按时间正序，最后一步为最新）
// ============================================================
const mockProcessTrail = [
  { time: '2026-08-05 10:00', actor: '王强', action: '发起付款申请' },
  { time: '2026-08-06 14:30', actor: '王强', action: '提供回款证明材料' },
  { time: '2026-08-08 09:15', actor: '王强', action: '提交付款报账单' },
  { time: '2026-08-09 10:00', actor: '系统', action: '流转至下一环节：付款报账单审批' }
]

// ============================================================
// 主页面
// ============================================================
export default function PaymentBillApproval({ onNavigate }: PaymentBillApprovalProps) {
  // ========== 报账单信息状态（复制自付款详情页面，只读展示） ==========
  const [billType] = useState('成本费用批量支付申请报账单')
  const [reimburser] = useState('张三')
  const [reimburseDept] = useState('政企客户部')
  const [costCenter] = useState('CC001-政企客户部')
  const [summary] = useState('2026年6月合肥市第一人民医院智慧医疗项目设备采购支出付款申请，本次支付金额合计1.67万元。')
  const [remark] = useState('本次付款金额与合同约定付款计划不一致，需人工核验。')

  // ========== 支付明细数据 ==========
  const [paymentDetailRows] = useState(mockPaymentDetailRows)

  // 报账总额 = 支付明细报账金额合计
  const totalProvision = paymentDetailRows.reduce((s, r) => s + parseFloat(r.reportAmount.replace(/,/g, '')), 0)

  // 支付总额 = 支付明细本次支付金额合计
  const totalPayment = paymentDetailRows.reduce((s, r) => s + parseFloat(r.currentPaymentAmount.replace(/,/g, '')), 0)

  // ========== 回款证明信息（只读） ==========
  const [receiptProofRows] = useState(mockReceiptProofRows)
  const [proofModalVisible, setProofModalVisible] = useState(false)
  const [proofModalRow, setProofModalRow] = useState<ReceiptProofRow | null>(null)

  // ========== 流程信息状态（复制自项目类费用报账单审批页面） ==========
  const customerManagerOptions = [
    { value: '张三', label: '张三（政企客户部）' },
    { value: '李四', label: '李四（政企客户部）' },
    { value: '王五', label: '王五（政企客户部）' },
    { value: '赵六', label: '赵六（政企客户部）' }
  ]
  const [flowApprover, setFlowApprover] = useState('')

  // ========== 审批信息状态（复制自项目类费用报账单审批页面） ==========
  const [approvalResult, setApprovalResult] = useState<'approved' | 'rejected'>('approved')
  const [approvalComment, setApprovalComment] = useState('')

  // ========== 流程轨迹 - 默认折叠 ==========
  const [trailExpanded, setTrailExpanded] = useState(false)

  const handleBack = () => {
    onNavigate?.('/finance/payment')
  }

  const handleCancel = () => {
    onNavigate?.('/finance/payment')
  }

  const handleSubmit = () => {
    if (!flowApprover) {
      alert('请选择下一步处理人')
      return
    }
    alert('提交成功')
    onNavigate?.('/finance/payment')
  }

  // 打开回款证明弹框
  const handleOpenProofModal = (row: ReceiptProofRow) => {
    setProofModalRow(row)
    setProofModalVisible(true)
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部标题栏 */}
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
            <h2 className="text-sm font-semibold text-gray-800">付款报账单审批</h2>
          </div>
        </div>

        {/* 1. 报账单信息（复制自付款详情页面，只读） */}
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
                  {billType || '-'}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账人：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {reimburser}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账部门：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {reimburseDept}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">成本中心：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {costCenter}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账总额（含税，元）：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 font-semibold">
                  {totalProvision.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">支付总额（含税，元）：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 font-semibold">
                  {totalPayment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </div>
              </div>

              {/* 报账单摘要：独占一行，只读 */}
              <div className="col-span-3 flex items-start min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">报账单摘要：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700 whitespace-pre-wrap">
                  {summary || '-'}
                </div>
              </div>

              {/* 备注：独占一行，只读 */}
              <div className="col-span-3 flex items-start min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">备注：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700 whitespace-pre-wrap">
                  {remark || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. 支付明细信息（复制自付款详情页面，只读） */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">支付明细信息</h3>
            <span className="text-xs text-gray-400">【{paymentDetailRows.length}】</span>
          </div>
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">ERP报账单编号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">业务大类</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">已报账金额</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">已支付金额</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">本次支付金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">收款账号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">收款方名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">联行号</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paymentDetailRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  paymentDetailRows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.erpCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.contractCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.businessCategory}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-right">{row.reportAmount}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-right">{row.paidAmount}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap text-right font-medium">{row.currentPaymentAmount}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.paymentAccount}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.payeeName}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.bankCode}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 回款证明信息（复制自付款详情页面，只读） */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">回款证明信息</h3>
            <span className="text-xs text-gray-400">【{receiptProofRows.length}】</span>
          </div>
          <div className="overflow-x-auto overflow-y-hidden border border-gray-100 rounded-md">
            <table className="w-full text-sm min-w-[1200px]">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">客户经理</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">本次支付金额</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">后向已付款金额-系统计算</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">后向已付款金额-人工填写</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">IT总回款金额</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">CT总回款金额</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">项目总回款金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">回款说明</th>
                  <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {receiptProofRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  receiptProofRows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.netProjectCode}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{row.customerManager}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{row.currentPaymentAmount}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{row.paidAmountSystem}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{row.paidAmountManual}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{row.itReceiptAmount}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{row.ctReceiptAmount}</td>
                      <td className="px-3 py-3 text-gray-800 text-right font-medium whitespace-nowrap">{row.projectReceiptAmount}</td>
                      <td className="px-3 py-3 text-gray-600 truncate max-w-[200px]" title={row.receiptRemark}>{row.receiptRemark}</td>
                      <td className="px-3 py-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenProofModal(row)}
                          className="text-xs text-[#1677FF] hover:text-blue-600 hover:underline"
                        >
                          回款证明
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. 审批信息（复制自项目类费用报账单审批页面） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">审批信息</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3">
                  <span className="text-red-500 mr-0.5">*</span>
                  审批结果
                </label>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setApprovalResult('approved')}
                      className={`px-4 py-2 text-sm rounded-md border-2 transition-all ${
                        approvalResult === 'approved'
                          ? 'bg-green-50 border-green-400 text-green-600 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50/50'
                      }`}
                    >
                      通过
                    </button>
                    <button
                      type="button"
                      onClick={() => setApprovalResult('rejected')}
                      className={`px-4 py-2 text-sm rounded-md border-2 transition-all ${
                        approvalResult === 'rejected'
                          ? 'bg-red-50 border-red-400 text-red-600 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50/50'
                      }`}
                    >
                      驳回
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-start">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 pr-3 pt-2">
                  <span className="text-red-500 mr-0.5">*</span>
                  审批意见
                </label>
                <div className="flex-1 min-w-0">
                  <textarea
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    placeholder="请输入审批意见"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. 流程信息（复制自项目类费用报账单审批页面，仅审批驳回时展示） */}
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
                        付款报账单提交
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
                          交付经理
                        </span>
                        <select
                          value={flowApprover}
                          onChange={(e) => setFlowApprover(e.target.value)}
                          className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                        >
                          <option value="">请选择下一步处理人</option>
                          {customerManagerOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. 流程轨迹 - 默认折叠 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 cursor-pointer select-none hover:bg-gray-50"
            onClick={() => setTrailExpanded(!trailExpanded)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
            {trailExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500" />
              : <ChevronRight className="w-4 h-4 text-gray-500" />
            }
          </div>
          {trailExpanded && (
            <div className="p-4">
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
                <ol className="space-y-4">
                  {mockProcessTrail.map((item, idx) => (
                    <li key={idx} className="relative">
                      <div className={clsx(
                        'absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2',
                        idx === mockProcessTrail.length - 1
                          ? 'bg-[#1677FF] border-[#1677FF]'
                          : 'bg-white border-gray-300'
                      )} />
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

        {/* 7. 按钮区 */}
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
            <Send className="w-4 h-4" />
            提交
          </button>
        </div>
      </div>

      {/* ========== 回款证明弹框（只读） ========== */}
      {proofModalVisible && proofModalRow && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setProofModalVisible(false)}>
          <div
            className="bg-white rounded-lg shadow-xl w-[700px] max-w-[95vw] max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">回款证明</h3>
                <span className="text-xs text-gray-400">【{proofModalRow.proofs.length}】</span>
              </div>
              <button
                type="button"
                onClick={() => setProofModalVisible(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto px-5 py-4">
              <div className="overflow-x-auto border border-gray-100 rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">账户标识</th>
                      <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">缴费金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">缴费时间</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">集团客户编码</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {proofModalRow.proofs.map(proof => (
                      <tr key={proof.id} className="hover:bg-gray-50/50">
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{proof.accountIdentifier}</td>
                        <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap">{proof.paymentAmount}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{proof.paymentTime}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{proof.groupCustomerCode}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{proof.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-center gap-3 px-5 py-3 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setProofModalVisible(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
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
