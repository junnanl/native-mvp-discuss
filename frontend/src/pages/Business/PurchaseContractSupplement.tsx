import { useState, useMemo } from 'react'
import { Search, Check, RotateCcw, ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { useModal } from '@/components/Modal'

// ============================================================
// 类型定义
// ============================================================
interface ProjectInfo {
  id: string
  name: string
  code: string
  type: string
  initMethod: string
  customerName: string
  customerCode: string
  creator: string
  draftedCount: number
}

interface PurchaseContract {
  contractCode: string
  contractName: string
  draftType: string
  contractNature: string
  contractStatus: string
  amountNoTax: string
  amountWithTax: string
  applicant: string
  supplierCode: string
  supplierName: string
  createTime: string
}

interface PurchaseOrder {
  orderNo: string
  reqNo: string
  docType: string
  reqName: string
  applicant: string
  orderStatus: string
  amountNoTax: string
  amountWithTax: string
  supplierCode: string
  supplierName: string
}

// ============================================================
// 模拟项目列表
// ============================================================
const projectList: ProjectInfo[] = [
  { id: 'PRJ001', code: 'PRJ20260001', name: '安徽移动IDC数据中心建设项目', type: 'ICT项目', initMethod: '普通立项', customerName: '安徽省政务信息中心', customerCode: 'CUS000001', creator: '王芳', draftedCount: 1 },
  { id: 'PRJ002', code: 'PRJ20260002', name: '合肥政务云平台服务项目', type: 'DICT项目', initMethod: '统谈分签', customerName: '合肥市大数据局', customerCode: 'CUS000002', creator: '李明', draftedCount: 1 },
  { id: 'PRJ003', code: 'PRJ20260003', name: '企业专线接入服务项目', type: 'ICT项目', initMethod: '普通立项', customerName: '中国移动通信集团安徽有限公司', customerCode: 'CUS000003', creator: '张凯', draftedCount: 1 },
  { id: 'PRJ004', code: 'PRJ20260004', name: '淮南IDC机房运维服务项目', type: 'ICT项目', initMethod: '普通立项', customerName: '淮南市信息技术服务有限公司', customerCode: 'CUS000004', creator: '赵静', draftedCount: 0 },
  { id: 'PRJ005', code: 'PRJ20260005', name: '马鞍山智慧城市云平台建设运营项目', type: 'DICT项目', initMethod: '统谈分签', customerName: '马鞍山市大数据资源管理局', customerCode: 'CUS000005', creator: '陈强', draftedCount: 0 }
]

// ============================================================
// 通用组件
// ============================================================
function SectionTitle({
  children,
  sectionKey,
  expanded,
  extra,
  onToggle
}: {
  children: React.ReactNode
  sectionKey?: string
  expanded?: boolean
  extra?: React.ReactNode
  onToggle?: () => void
}) {
  return (
    <div
      className={
        'flex items-center gap-2 mb-3 mt-5 first:mt-0 cursor-pointer select-none hover:bg-gray-50 -mx-2 px-2 py-1 rounded ' +
        (!sectionKey ? 'cursor-default hover:bg-transparent' : '')
      }
      onClick={() => sectionKey && onToggle && onToggle()}
    >
      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
      <h3 className="text-sm font-semibold text-gray-800">{children}</h3>
      {sectionKey && (
        expanded
          ? <ChevronDown className="w-4 h-4 text-gray-500 ml-1" />
          : <ChevronRight className="w-4 h-4 text-gray-500 ml-1" />
      )}
      {extra && (
        <div className="ml-auto flex items-center" onClick={(e) => e.stopPropagation()}>{extra}</div>
      )}
    </div>
  )
}

function FieldRow({
  label,
  required,
  error,
  colSpan,
  children
}: {
  label: string
  required?: boolean
  error?: string
  colSpan?: 1 | 2
  children: React.ReactNode
}) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <div className="flex items-start gap-3 min-h-[36px]">
        <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
          {required && <span className="text-red-500 mr-0.5">*</span>}
          {label}
        </label>
        <div className="flex-1 min-w-0 max-w-xs">
          {children}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}

function ReadOnlyField({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <div className="flex items-center min-h-[36px]">
        <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">{label}</label>
        <div className="flex-1 min-w-0 max-w-xs text-sm text-gray-700 truncate" title={value}>{value}</div>
      </div>
    </div>
  )
}

// 项目选择弹窗
function ProjectPickerModal({
  visible,
  onClose,
  onSelect
}: {
  visible: boolean
  onClose: () => void
  onSelect: (project: ProjectInfo) => void
}) {
  const [keyword, setKeyword] = useState('')

  const filtered = projectList.filter(p =>
    p.name.includes(keyword) || p.code.includes(keyword)
  )

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">选择项目</h3>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <ChevronDown className="w-4 h-4 rotate-45" />
          </button>
        </div>
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索项目名称/编码"
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs sticky top-0">
              <tr>
                <th className="px-4 py-2.5 text-left font-medium">项目编码</th>
                <th className="px-4 py-2.5 text-left font-medium">项目名称</th>
                <th className="px-4 py-2.5 text-left font-medium">项目类型</th>
                <th className="px-4 py-2.5 text-left font-medium">客户名称</th>
                <th className="px-4 py-2.5 text-center font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                    暂无匹配项目
                  </td>
                </tr>
              ) : (
                filtered.map(p => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-gray-700">{p.code}</td>
                    <td className="px-4 py-2.5 text-gray-800">{p.name}</td>
                    <td className="px-4 py-2.5 text-gray-700">{p.type}</td>
                    <td className="px-4 py-2.5 text-gray-700">{p.customerName}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => { onSelect(p); onClose() }}
                        className="px-3 py-1 text-xs text-[#1677FF] hover:bg-blue-50 rounded"
                      >
                        选择
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 采购合同补录页面主组件
// ============================================================
interface PurchaseContractSupplementProps {
  onNavigate?: (path: string) => void
}

export default function PurchaseContractSupplement({ onNavigate }: PurchaseContractSupplementProps) {
  const modal = useModal()

  // 项目信息
  const [projectExpanded, setProjectExpanded] = useState(true)
  const [project, setProject] = useState<ProjectInfo | null>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectError, setProjectError] = useState('')

  // 合同编码
  const [contractCode, setContractCode] = useState('')
  const [contractCodeError, setContractCodeError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  // 关联采购合同列表
  const [purchaseContracts, setPurchaseContracts] = useState<PurchaseContract[]>([])

  // 关联采购订单列表
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [selectedOrderNos, setSelectedOrderNos] = useState<string[]>([])

  // 计算本项目所占合同金额
  const projectAmountNoTax = useMemo(() => {
    const total = purchaseOrders
      .filter(o => selectedOrderNos.includes(o.orderNo))
      .reduce((sum, o) => sum + parseFloat(o.amountNoTax.replace(/,/g, '')), 0)
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [purchaseOrders, selectedOrderNos])

  const projectAmountWithTax = useMemo(() => {
    const total = purchaseOrders
      .filter(o => selectedOrderNos.includes(o.orderNo))
      .reduce((sum, o) => sum + parseFloat(o.amountWithTax.replace(/,/g, '')), 0)
    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }, [purchaseOrders, selectedOrderNos])

  // 根据合同编码查询
  const handleSearchByCode = (code: string) => {
    if (!code.trim()) {
      setPurchaseContracts([])
      setPurchaseOrders([])
      setSelectedOrderNos([])
      setHasSearched(false)
      return
    }

    setHasSearched(true)

    // 根据合同编码生成关联数据
    const codeHash = code.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const supplierNames = ['华为技术有限公司', '中兴通讯股份有限公司', '浪潮集团有限公司', '联想（北京）有限公司', '新华三技术有限公司']
    const productNames = ['服务器设备', '网络设备', '存储设备', '安全设备', '软件系统']
    const supplierName = supplierNames[codeHash % supplierNames.length]
    const productName = productNames[codeHash % productNames.length]
    const baseAmount = 500000 + (codeHash % 10) * 100000

    // 生成采购合同
    const contracts: PurchaseContract[] = [{
      contractCode: code,
      contractName: `${productName}采购合同`,
      draftType: '补录',
      contractNature: '单项合同',
      contractStatus: '履行中',
      amountNoTax: (baseAmount / 1.13).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      amountWithTax: baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      applicant: ['张经理', '李经理', '王经理', '赵经理', '陈经理'][codeHash % 5],
      supplierCode: `SUP${String((codeHash % 100) + 1).padStart(3, '0')}`,
      supplierName,
      createTime: `2026-0${String((codeHash % 5) + 1).padStart(2, '0')} ${String((codeHash * 7) % 24).padStart(2, '0')}:${String((codeHash * 13) % 60).padStart(2, '0')}:00`
    }]

    // 生成采购订单（2-3条）
    const orderCount = 2 + (codeHash % 2)
    const orders: PurchaseOrder[] = []
    for (let i = 0; i < orderCount; i++) {
      const orderBase = baseAmount / orderCount
      orders.push({
        orderNo: `PO${code.replace(/[^0-9]/g, '')}${String(i + 1).padStart(3, '0')}`,
        reqNo: `REQ${code.replace(/[^0-9]/g, '')}${String(i + 1).padStart(3, '0')}`,
        docType: '标准采购订单',
        reqName: `${productName}采购申请`,
        applicant: ['张经理', '李经理', '王经理', '赵经理', '陈经理'][(codeHash + i) % 5],
        orderStatus: '有效',
        amountNoTax: (orderBase / 1.13 / (1 + (codeHash % 3) * 0.02)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        amountWithTax: orderBase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        supplierCode: `SUP${String((codeHash % 100) + 1).padStart(3, '0')}`,
        supplierName
      })
    }

    setPurchaseContracts(contracts)
    setPurchaseOrders(orders)
    setSelectedOrderNos([])
  }

  // 合同编码输入变化
  const handleContractCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setContractCode(val)
    setContractCodeError('')
    handleSearchByCode(val)
  }

  // 订单勾选
  const handleOrderCheck = (orderNo: string) => {
    setSelectedOrderNos(prev =>
      prev.includes(orderNo)
        ? prev.filter(n => n !== orderNo)
        : [...prev, orderNo]
    )
  }

  // 全选/取消全选
  const handleCheckAll = () => {
    if (selectedOrderNos.length === purchaseOrders.length && purchaseOrders.length > 0) {
      setSelectedOrderNos([])
    } else {
      setSelectedOrderNos(purchaseOrders.map(o => o.orderNo))
    }
  }

  // 提交
  const handleSubmit = () => {
    const errors: string[] = []
    if (!project) {
      errors.push('请选择项目')
      setProjectError('请选择项目')
    }
    if (!contractCode.trim()) {
      errors.push('请输入合同编码')
      setContractCodeError('请输入合同编码')
    }
    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }

    modal.confirm('确定提交采购合同补录吗？', '提交确认').then(ok => {
      if (ok) {
        alert('提交成功')
        onNavigate?.('/finance/contract/query')
      }
    })
  }

  // 取消
  const handleCancel = () => {
    onNavigate?.('/finance/contract/query')
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full min-w-0">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* ========== 项目信息模块 ========== */}
          <SectionTitle sectionKey="project" expanded={projectExpanded} onToggle={() => setProjectExpanded(!projectExpanded)}>
            项目信息
          </SectionTitle>
          {projectExpanded && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <FieldRow label="项目名称" required error={projectError} colSpan={2}>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={project?.name || ''}
                    onClick={() => setShowProjectModal(true)}
                    placeholder="请选择项目"
                    className={
                      'w-full pl-3 pr-10 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 cursor-pointer bg-white ' +
                      (projectError ? 'border-red-500' : 'border-gray-300')
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="选择项目"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </FieldRow>

              {project && (
                <>
                  <ReadOnlyField label="项目编码" value={project.code} />
                  <ReadOnlyField label="项目类型" value={project.type} />
                  <ReadOnlyField label="立项方式" value={project.initMethod} />
                  <ReadOnlyField label="客户名称" value={project.customerName} />
                  <ReadOnlyField label="客户编码" value={project.customerCode} />
                  <ReadOnlyField label="项目创建人" value={project.creator} />
                </>
              )}
            </div>
          )}

          {/* ========== 采购信息补录模块 ========== */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <SectionTitle>采购信息补录</SectionTitle>

            {/* 合同编码输入 */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <FieldRow label="合同编码" required error={contractCodeError}>
                <input
                  type="text"
                  value={contractCode}
                  onChange={handleContractCodeChange}
                  placeholder="请输入合同编码，如：CG2026001"
                  className={
                    'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white ' +
                    (contractCodeError ? 'border-red-500' : 'border-gray-300')
                  }
                />
              </FieldRow>
            </div>

            {/* 关联采购合同 */}
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                <h4 className="text-xs font-semibold text-gray-800">关联采购合同</h4>
              </div>
              {!hasSearched ? (
                <div className="py-6 text-center text-sm text-gray-400 bg-gray-50/30 rounded-md border border-dashed border-gray-200">
                  <FileText className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                  <span className="text-xs">请输入合同编码查询关联采购合同</span>
                </div>
              ) : purchaseContracts.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400 bg-gray-50/30 rounded-md border border-dashed border-gray-200">
                  <FileText className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                  <span className="text-xs">未查询到关联采购合同</span>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-100 rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 text-xs">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同名称</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">起草类型</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同性质</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同状态</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">合同金额（元，不含税）</th>
                        <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">合同金额（元，含税）</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">申请人</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">供应商编号</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">供应商名称</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">创建时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseContracts.map((c, idx) => (
                        <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50/50">
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{c.contractCode}</td>
                          <td className="px-3 py-2.5 text-gray-800 whitespace-nowrap">{c.contractName}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{c.draftType}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{c.contractNature}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-600">
                              {c.contractStatus}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap">{c.amountNoTax}</td>
                          <td className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap">{c.amountWithTax}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{c.applicant}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{c.supplierCode}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{c.supplierName}</td>
                          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{c.createTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 关联采购订单 */}
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                <h4 className="text-xs font-semibold text-gray-800">关联采购订单</h4>
              </div>
              {!hasSearched ? (
                <div className="py-6 text-center text-sm text-gray-400 bg-gray-50/30 rounded-md border border-dashed border-gray-200">
                  <FileText className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                  <span className="text-xs">请输入合同编码查询关联采购订单</span>
                </div>
              ) : purchaseOrders.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400 bg-gray-50/30 rounded-md border border-dashed border-gray-200">
                  <FileText className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                  <span className="text-xs">未查询到关联采购订单</span>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto border border-gray-100 rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-600 text-xs">
                        <tr>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap w-10">
                            <input
                              type="checkbox"
                              checked={selectedOrderNos.length === purchaseOrders.length && purchaseOrders.length > 0}
                              onChange={handleCheckAll}
                              className="w-3.5 h-3.5"
                            />
                          </th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订单号</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">采购需求申请单号</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">单据类型</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">申请单名称</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">申请人</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订单状态</th>
                          <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">订单金额（元，不含税）</th>
                          <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">订单金额（元，含税）</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">供应商编号</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">供应商名称</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchaseOrders.map((o, idx) => (
                          <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50/50">
                            <td className="px-3 py-2.5">
                              <input
                                type="checkbox"
                                checked={selectedOrderNos.includes(o.orderNo)}
                                onChange={() => handleOrderCheck(o.orderNo)}
                                className="w-3.5 h-3.5"
                              />
                            </td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{o.orderNo}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{o.reqNo}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{o.docType}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{o.reqName}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{o.applicant}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-600">
                                {o.orderStatus}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap">{o.amountNoTax}</td>
                            <td className="px-3 py-2.5 text-right text-gray-700 whitespace-nowrap">{o.amountWithTax}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{o.supplierCode}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{o.supplierName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 本项目所占合同金额 */}
                  <div className="mt-4 p-4 bg-gray-50/50 rounded-md border border-gray-100">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-52 text-right text-sm text-gray-700 shrink-0 pr-3 break-words leading-tight">
                          本项目所占合同金额（元，不含税）
                        </label>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={projectAmountNoTax}
                            readOnly
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700"
                          />
                        </div>
                      </div>
                      <div className="flex items-center min-h-[36px]">
                        <label className="w-52 text-right text-sm text-gray-700 shrink-0 pr-3 break-words leading-tight">
                          本项目所占合同金额（元，含税）
                        </label>
                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={projectAmountWithTax}
                            readOnly
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ========== 底部按钮 ========== */}
          <div className="flex justify-center gap-3 mt-8 pt-4 border-t border-gray-100">
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
      </div>

      {/* 项目选择弹窗 */}
      <ProjectPickerModal
        visible={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSelect={(p) => {
          setProject(p)
          setProjectError('')
        }}
      />
    </div>
  )
}
