import { useState } from 'react'
import { clsx } from 'clsx'
import { ArrowLeft, Search, RotateCcw, Check, HelpCircle, X, Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { ProjectInfoCard } from '@/components/ContractInfoCard'
import { getContractInfo } from '@/data/mock'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'

interface PaymentProofProvideProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

// 回款记录 mock 数据
interface PaymentRecord {
  id: string
  accountId: string
  amount: string
  payTime: string
  groupCustomerCode: string
  remark: string
}

const mockPaymentRecords: PaymentRecord[] = [
  {
    id: 'pr-1',
    accountId: '6222020200001234567',
    amount: '100,000.00',
    payTime: '2026-07-15',
    groupCustomerCode: 'GC001',
    remark: '首期回款'
  },
  {
    id: 'pr-2',
    accountId: '6217002020012345678',
    amount: '80,000.00',
    payTime: '2026-08-20',
    groupCustomerCode: 'GC001',
    remark: '第二期回款'
  }
]

// BOSS 缴费记录池（关联弹框数据源，独立维护）
const mockBossPaymentRecords: PaymentRecord[] = [
  {
    id: 'boss-1',
    accountId: '6222020200001234567',
    amount: '100,000.00',
    payTime: '2026-07-15',
    groupCustomerCode: 'GC001',
    remark: '首期回款'
  },
  {
    id: 'boss-2',
    accountId: '6217002020012345678',
    amount: '80,000.00',
    payTime: '2026-08-20',
    groupCustomerCode: 'GC001',
    remark: '第二期回款'
  },
  {
    id: 'boss-3',
    accountId: '6217856000012345678',
    amount: '50,000.00',
    payTime: '2026-09-10',
    groupCustomerCode: 'GC002',
    remark: '预存款'
  },
  {
    id: 'boss-4',
    accountId: '6228480402564890018',
    amount: '120,000.00',
    payTime: '2026-10-05',
    groupCustomerCode: 'GC003',
    remark: '销账回款'
  },
  {
    id: 'boss-5',
    accountId: '6214835800012345678',
    amount: '60,000.00',
    payTime: '2026-11-01',
    groupCustomerCode: 'GC004',
    remark: '预存款'
  },
  {
    id: 'boss-6',
    accountId: '6228480402564890018',
    amount: '90,000.00',
    payTime: '2026-12-01',
    groupCustomerCode: 'GC003',
    remark: '销账回款'
  },
  {
    id: 'boss-7',
    accountId: '6214835800012345678',
    amount: '75,000.00',
    payTime: '2026-12-15',
    groupCustomerCode: 'GC004',
    remark: '回款'
  }
]

// 流程轨迹 mock 数据（按时间正序，最后一步为最新）
const mockProcessTrail = [
  { time: '2026-08-05 10:00', actor: '王强', action: '发起报账（普通项目）提交申请' },
  { time: '2026-08-06 14:30', actor: '王强', action: '提供回款证明材料' },
  { time: '2026-08-08 09:15', actor: '系统', action: '流转至下一环节：项目类费用报账单提交' }
]

// 集团客户 mock 数据（复制自产品开通页面，独立维护）
interface PaymentProofGroupCustomer {
  id: string
  code: string
  name: string
  nationalCode: string
  level: string
  industry: string
}

const paymentProofGroupCustomers: PaymentProofGroupCustomer[] = [
  { id: 'GC001', code: 'GC001', name: '安徽智教科技有限公司', nationalCode: 'NAT001', level: 'A级', industry: '教育' },
  { id: 'GC002', code: 'GC002', name: '芜湖教育信息服务中心', nationalCode: 'NAT002', level: 'B级', industry: '教育' },
  { id: 'GC003', code: 'GC003', name: '合肥智慧城市运营公司', nationalCode: 'NAT003', level: 'A级', industry: '政务' },
  { id: 'GC004', code: 'GC004', name: '蚌埠数字教育研究院', nationalCode: 'NAT004', level: 'B级', industry: '教育' }
]

// 账户 mock 数据（复制自产品开通页面，独立维护）
interface PaymentProofAccount {
  id: string
  name: string
  type: string
}

const paymentProofAccounts: PaymentProofAccount[] = [
  { id: 'ACC-001', name: '合肥市第一人民医院基本户', type: '基本存款账户' },
  { id: 'ACC-002', name: '合肥市第一人民医院专户', type: '专用存款账户' },
  { id: 'ACC-003', name: '合肥市第一人民医院一般户', type: '一般存款账户' }
]

// 报账单信息 mock 数据
const mockBillInfo = {
  billType: '项目类费用报账单',
  reimburser: '张三',
  reimburseDept: '政企客户部',
  costCenter: 'CC001-政企客户部',
  totalAmountWithTax: '113,000.00',
  totalPaymentWithTax: '80,000.00',
  summary: '2026年6月IDC数据中心项目设备采购及软件开发支出报账',
  remark: '本次报账支付方式与合同约定付款计划不一致，需人工核验。'
}

// 交付经理选项（复制自合同附件上传页面，独立维护）
const deliveryManagerOptions = [
  '张三（交付经理）',
  '李四（交付经理）',
  '王五（交付经理）',
  '赵六（交付经理）',
  '钱七（交付经理）'
]

export default function PaymentProofProvide({ onNavigate, contractId }: PaymentProofProvideProps) {
  const contractInfo = getContractInfo(contractId || 'CT2026060001')

  // 回款证明信息状态
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(mockPaymentRecords)
  const [itTotalReturn, setItTotalReturn] = useState('180,000.00')
  const [ctTotalReturn, setCtTotalReturn] = useState('90,000.00')
  // 项目总回款金额（只读，不可编辑）= IT总回款金额 + CT总回款金额
  const projectTotalReturn = (() => {
    const it = parseFloat(itTotalReturn.replace(/,/g, '')) || 0
    const ct = parseFloat(ctTotalReturn.replace(/,/g, '')) || 0
    return (it + ct).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  })()
  const [currentPaymentNode, setCurrentPaymentNode] = useState('2026-06-30')
  const [returnRemark, setReturnRemark] = useState('项目首期回款已到账，后续回款按合同约定时间节点执行。')

  // 集团客户信息状态（复制自产品开通页面，独立维护，用于关联弹框查询条件）
  const [groupCustomer, setGroupCustomer] = useState('')
  const [account, setAccount] = useState('')
  const [groupCustomerModalOpen, setGroupCustomerModalOpen] = useState(false)
  const [groupCustomerFilterCode, setGroupCustomerFilterCode] = useState('')
  const [groupCustomerFilterName, setGroupCustomerFilterName] = useState('')
  const [selectedGroupCustomer, setSelectedGroupCustomer] = useState<PaymentProofGroupCustomer | null>(null)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [accountModalSearchId, setAccountModalSearchId] = useState('')
  const [accountModalSearchName, setAccountModalSearchName] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<PaymentProofAccount | null>(null)
  const [payTimeStart, setPayTimeStart] = useState('')
  const [payTimeEnd, setPayTimeEnd] = useState('')

  // 关联BOSS缴费记录弹框状态
  const [bossModalOpen, setBossModalOpen] = useState(false)
  const [bossSelectedIds, setBossSelectedIds] = useState<string[]>([])
  // 弹框表格数据：初始化空，点击查询后加载mock数据
  const [bossTableData, setBossTableData] = useState<PaymentRecord[]>([])

  // 打开关联BOSS缴费记录弹框
  const handleOpenBossModal = () => {
    setGroupCustomer('')
    setAccount('')
    setSelectedGroupCustomer(null)
    setSelectedAccount(null)
    setPayTimeStart('')
    setPayTimeEnd('')
    setBossSelectedIds([])
    setBossTableData([])
    setBossModalOpen(true)
  }

  // 弹框内查询：必填字段校验通过后加载BOSS缴费记录
  const handleBossSearch = () => {
    if (!groupCustomer || !account || !payTimeStart || !payTimeEnd) {
      alert('请选择集团客户信息、账户信息、缴费时间再点击查询！')
      return
    }
    setBossTableData(mockBossPaymentRecords)
  }

  // 弹框内重置：清空查询条件与表格数据
  const handleBossReset = () => {
    setGroupCustomer('')
    setAccount('')
    setSelectedGroupCustomer(null)
    setSelectedAccount(null)
    setPayTimeStart('')
    setPayTimeEnd('')
    setBossSelectedIds([])
    setBossTableData([])
  }

  // 弹框内复选
  const handleBossCheck = (id: string) => {
    setBossSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  // 确定：勾选的记录带入页面表格（按 账户标识+缴费时间 去重）
  const handleBossConfirm = () => {
    const selected = mockBossPaymentRecords.filter(r => bossSelectedIds.includes(r.id))
    setPaymentRecords(prev => {
      const existing = new Set(prev.map(p => `${p.accountId}-${p.payTime}`))
      const newRecords = selected.filter(r => !existing.has(`${r.accountId}-${r.payTime}`))
      return [...prev, ...newRecords]
    })
    setBossModalOpen(false)
  }

  // 删除二次确认弹框状态
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false)
  const [recordIdToDelete, setRecordIdToDelete] = useState<string | null>(null)

  // 删除BOSS缴费记录：打开二次确认弹框
  const handleDeleteRecord = (id: string) => {
    setRecordIdToDelete(id)
    setDeleteConfirmVisible(true)
  }

  // 确认删除
  const confirmDeleteRecord = () => {
    if (recordIdToDelete) {
      setPaymentRecords(prev => prev.filter(r => r.id !== recordIdToDelete))
    }
    setDeleteConfirmVisible(false)
    setRecordIdToDelete(null)
  }

  // 流程信息状态（复制自合同附件上传页面，独立维护）
  const [deliveryManager, setDeliveryManager] = useState('')
  const [deliveryManagerError, setDeliveryManagerError] = useState('')

  // 流程轨迹模块 - 默认折叠
  const [trailExpanded, setTrailExpanded] = useState(false)

  // 返回
  const handleBack = () => {
    onNavigate?.('/finance/expense/expense')
  }

  // 取消
  const handleCancel = () => {
    onNavigate?.('/finance/expense/expense')
  }

  // 提交
  const handleSubmit = () => {
    onNavigate?.('/finance/expense/expense')
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-3 space-y-3">
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
            <h2 className="text-sm font-semibold text-gray-800">回款证明提供</h2>
          </div>
        </div>

        {/* 1. 项目信息 */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 报账单信息（只读展示） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">报账单信息</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-x-6 gap-y-0">
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">报账单类型：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {mockBillInfo.billType}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">报账人：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {mockBillInfo.reimburser}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">报账部门：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {mockBillInfo.reimburseDept}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">成本中心：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {mockBillInfo.costCenter}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">报账总额（含税，元）：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 font-semibold">
                  {mockBillInfo.totalAmountWithTax}
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">支付总额（含税，元）：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 font-semibold">
                  {mockBillInfo.totalPaymentWithTax}
                </div>
              </div>

              {/* 报账单摘要：独占一行 */}
              <div className="col-span-3 flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">报账单摘要：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {mockBillInfo.summary}
                </div>
              </div>

              {/* 备注：独占一行 */}
              <div className="col-span-3 flex items-center min-h-[36px]">
                <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">备注：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  {mockBillInfo.remark}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 回款证明信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">回款证明信息</h3>
          </div>
          <div className="p-4">
            {/* 温馨提示 */}
            <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-3">
              <span className="shrink-0">⚠</span>
              <span>温馨提示：请根据项目实际回款情况填写项目回款金额等数据，若项目总回款金额 &gt; 0，需提供客户回款证明（包含销账和预存款）</span>
            </div>

            {/* BOSS缴费记录 子模块 */}
            <div className="border border-gray-100 rounded-lg bg-white mb-4">
              <div className="flex items-center justify-between px-3 py-3 bg-gray-50/50 border-b border-gray-100 rounded-t-lg">
                <div className="flex items-center gap-1.5 text-sm">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <span className="font-semibold text-gray-800">BOSS缴费记录</span>
                </div>
                <button
                  type="button"
                  onClick={handleOpenBossModal}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  关联BOSS缴费记录
                </button>
              </div>
              {/* 回款记录表格 */}
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-600">
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">账户标识</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">缴费金额</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">缴费时间</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">集团客户编码</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">备注</th>
                    <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap w-20">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    paymentRecords.map(record => (
                      <tr key={record.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{record.accountId}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{record.amount}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{record.payTime}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{record.groupCustomerCode}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{record.remark}</td>
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-red-500 hover:text-red-700 hover:underline text-xs"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            </div>

            {/* 金额统计信息 */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
              <div className="flex items-center min-h-[36px]">
                <label className="w-48 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">
                  <span className="inline-flex items-center gap-1 justify-end">
                    <span className="text-red-500 mr-0.5">*</span>
                    IT总回款金额（元）
                    <div className="relative group">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-max max-w-xs px-3 py-2 text-xs text-white bg-gray-700 rounded-md shadow-lg whitespace-normal">
                        请填写当前付款节点，该项目IT总回款金额，包含销账和预存款
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700" />
                      </div>
                    </div>
                  </span>
                </label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={itTotalReturn}
                    onChange={(e) => setItTotalReturn(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-48 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">
                  <span className="inline-flex items-center gap-1 justify-end">
                    <span className="text-red-500 mr-0.5">*</span>
                    CT总回款金额（元）
                    <div className="relative group">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-max max-w-xs px-3 py-2 text-xs text-white bg-gray-700 rounded-md shadow-lg whitespace-normal">
                        请填写当前付款节点，该项目CT总回款金额，包含销账和预存款
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700" />
                      </div>
                    </div>
                  </span>
                </label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={ctTotalReturn}
                    onChange={(e) => setCtTotalReturn(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-48 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">
                  <span className="inline-flex items-center gap-1 justify-end">
                    项目总回款金额（元）
                    <div className="relative group">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-10 w-max max-w-xs px-3 py-2 text-xs text-white bg-gray-700 rounded-md shadow-lg whitespace-normal">
                        项目总回款金额=IT总回款金额+CT总回款金额
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-700" />
                      </div>
                    </div>
                  </span>
                </label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-800 font-semibold">
                    {projectTotalReturn}
                  </div>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-48 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">
                  <span className="text-red-500 mr-0.5">*</span>
                  当前付款节点
                </label>
                <div className="flex-1 min-w-0">
                  <input
                    type="date"
                    value={currentPaymentNode}
                    onChange={(e) => setCurrentPaymentNode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 回款说明 */}
            <div className="flex items-start">
              <label className="w-48 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2 pr-3">
                <span className="text-red-500 mr-0.5">*</span>
                回款说明
              </label>
              <div className="flex-1 min-w-0">
                <textarea
                  value={returnRemark}
                  onChange={(e) => setReturnRemark(e.target.value)}
                  placeholder="请输入回款说明"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-y"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 流程信息（复制自合同附件上传页面，独立维护） */}
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
                      项目类费用报账单提交
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
                      <div className="flex-1 min-w-0">
                        <SearchableSelect
                          value={deliveryManager}
                          onChange={(v) => { setDeliveryManager(v); setDeliveryManagerError('') }}
                          options={deliveryManagerOptions}
                          placeholder="请选择下一步处理人"
                        />
                      </div>
                    </div>
                    {deliveryManagerError && (
                      <p className="text-xs text-red-500 mt-1">{deliveryManagerError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 流程轨迹 - 默认折叠 */}
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

        {/* 底部按钮区 */}
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
            <Check className="w-4 h-4" />
            提交
          </button>
        </div>
      </div>

      {/* 删除二次确认弹框 */}
      {deleteConfirmVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirmVisible(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-[420px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">删除确认</h3>
              <button type="button" onClick={() => setDeleteConfirmVisible(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 text-sm text-gray-700 text-center">
              确定要删除该BOSS缴费记录吗？
            </div>
            <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmVisible(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmDeleteRecord}
                className="px-6 py-2 text-sm text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 关联BOSS缴费记录弹框 */}
      {bossModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setBossModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-[1300px] max-w-[95vw] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">关联BOSS缴费记录</h3>
              <button type="button" onClick={() => setBossModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* 查询条件：集团客户信息、账户信息、缴费时间 */}
              <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                <div className="flex items-center min-h-[36px]">
                  <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>
                    集团客户信息
                  </label>
                  <div className="flex-1 min-w-0">
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
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>
                    账户信息
                  </label>
                  <div className="flex-1 min-w-0">
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
                </div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-3">
                    <span className="text-red-500 mr-0.5">*</span>
                    缴费时间
                  </label>
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <input
                      type="date"
                      value={payTimeStart}
                      onChange={(e) => setPayTimeStart(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    />
                    <span className="text-sm text-gray-400">至</span>
                    <input
                      type="date"
                      value={payTimeEnd}
                      onChange={(e) => setPayTimeEnd(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
              {/* 查询条件按钮：重置 + 查询 */}
              <div className="flex justify-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBossReset}
                  className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>
                <button
                  type="button"
                  onClick={handleBossSearch}
                  className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  查询
                </button>
              </div>
              {/* 表格 */}
              <div className="overflow-auto max-h-[360px] border border-gray-200 rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap w-10"></th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">账户标识</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">缴费金额</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">缴费时间</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">集团客户编码</th>
                      <th className="px-3 py-2 text-left font-medium whitespace-nowrap">备注</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bossTableData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-400">暂无数据</td>
                      </tr>
                    ) : (
                      bossTableData.map(record => (
                        <tr key={record.id} className="hover:bg-gray-50/50 cursor-pointer" onClick={() => handleBossCheck(record.id)}>
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={bossSelectedIds.includes(record.id)}
                              onChange={() => handleBossCheck(record.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-[#1677FF] rounded"
                            />
                          </td>
                          <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{record.accountId}</td>
                          <td className="px-3 py-2 text-gray-800 whitespace-nowrap">{record.amount}</td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{record.payTime}</td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{record.groupCustomerCode}</td>
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{record.remark}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setBossModalOpen(false)}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleBossConfirm}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 集团客户选择弹框（复制自产品开通页面，独立维护） */}
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
                    {paymentProofGroupCustomers
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
                              name="paymentProofGroupCustomer"
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
                    {paymentProofGroupCustomers.filter(gc => {
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

      {/* 账户选择弹框（复制自产品开通页面，独立维护） */}
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
                    {paymentProofAccounts
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
                              name="paymentProofAccount"
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
                    {paymentProofAccounts.filter(acc => {
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
