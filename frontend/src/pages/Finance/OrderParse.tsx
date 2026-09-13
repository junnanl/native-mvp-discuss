import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  RotateCcw,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import { useModal } from '@/components/Modal'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import IncomeITSection from '@/components/plan-modules/IncomeITSection'
import IncomeCTSection from '@/components/plan-modules/IncomeCTSection'
import type { ITIncomeRow, CTIncomeRow, CostRow, InvestmentRow } from '@/components/plan-modules/types'

const approverOptions = [
  '张三（省公司财务部）',
  '李四（合肥市分公司财务部）',
  '王五（芜湖市分公司财务部）',
  '赵六（蚌埠市分公司财务部）',
  '钱七（阜阳市分公司财务部）',
  '孙八（淮南市分公司财务部）',
  '周九（马鞍山市分公司财务部）',
  '吴十（安庆市分公司财务部）',
  '郑一（滁州市分公司财务部）',
  '冯二（六安市分公司财务部）'
]

function InfoField({ label, value, span = 1 }: { label: string; value: string; span?: number }) {
  return (
    <div
      className="flex items-start min-h-[32px] py-0.5"
      style={span === 2 ? { gridColumn: 'span 3' } : undefined}
    >
      <label className="w-44 text-right text-sm text-gray-700 shrink-0 pr-2 break-all">
        {label}：
      </label>
      <div className="flex-1 min-w-0 text-sm text-gray-700 break-all">
        {value || '-'}
      </div>
    </div>
  )
}

interface OrderParseProps {
  onNavigate?: (path: string) => void
  orderId?: string
  orderType?: 'forward' | 'purchase'
}

const typeKeyMap: Record<string, string> = {
  income: '收入类',
  'income-expense': '有收有支类',
  expense: '支出类'
}

const statusMap: Record<string, string> = {
  executing: '履行中',
  revoked: '撤销',
  signed: '已签订',
  changing: '变更中',
  draft: '草稿',
  releasing: '解除中',
  released: '已解除',
  completed: '履行完毕',
  voiding: '作废中',
  voided: '已作废',
  reviewing: '审核中',
  reviewFailed: '审核不通过',
  reviewPassed: '审核通过'
}

const orderStatusMap: Record<string, string> = {
  'pending-parse': '待解析',
  'pending-approval': '待审批',
  'approving': '审批中',
  'approval-rejected': '审批不通过',
  'approval-passed': '审批通过'
}

const mockContracts = [
  {
    id: 'CT2026060001',
    code: 'CTR2026000001',
    name: '安徽移动IDC数据中心建设项目合同',
    projectCode: 'PRJ20260001',
    projectName: '安徽移动IDC数据中心建设项目',
    type: 'income',
    secondCategory: 'IDC服务类',
    thirdCategory: '数据中心服务',
    isFramework: false,
    frameworkRelationType: '-',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '1,200,000.00',
    amountWithoutTax: '1,061,946.90',
    customer: '安徽省政务信息中心',
    status: 'draft',
    draftTime: '2026-06-01 10:00:00',
    effectiveDate: '2026-07-01',
    terminationDate: '2027-06-30',
    counterpartName: '安徽省政务信息中心',
    inputMethod: '起草',
    isSupplement: false,
    creator: '王芳',
    createTime: '2026-06-01 10:00:00',
    hasAttachment: true,
    branch: 'hq'
  },
  {
    id: 'CT2026060002',
    code: 'CTR2026000002',
    name: '合肥政务云平台服务合同',
    projectCode: 'PRJ20260002',
    projectName: '合肥政务云平台服务',
    type: 'income-expense',
    secondCategory: '云服务类',
    thirdCategory: '云计算服务',
    isFramework: true,
    frameworkRelationType: '关联订单',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '3,500,000.00',
    amountWithoutTax: '3,097,345.13',
    customer: '合肥市大数据局',
    status: 'draft',
    draftTime: '2026-06-02 09:30:00',
    effectiveDate: '2026-06-15',
    terminationDate: '2027-06-14',
    counterpartName: '合肥市大数据局',
    inputMethod: '起草',
    isSupplement: false,
    creator: '李明',
    createTime: '2026-06-02 09:30:00',
    hasAttachment: true,
    branch: 'hf'
  },
  {
    id: 'CT2026060003',
    code: 'CTR2026000003',
    name: '企业专线接入服务协议',
    projectCode: 'PRJ20260003',
    projectName: '企业专线接入服务',
    type: 'expense',
    secondCategory: '专线服务类',
    thirdCategory: '专线接入服务',
    isFramework: false,
    frameworkRelationType: '-',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '850,000.00',
    amountWithoutTax: '752,212.39',
    customer: '中国移动通信集团安徽有限公司',
    status: 'draft',
    draftTime: '2026-06-03 09:15:00',
    effectiveDate: '2026-07-01',
    terminationDate: '2028-06-30',
    counterpartName: '中国移动通信集团安徽有限公司',
    inputMethod: '起草',
    isSupplement: false,
    creator: '张凯',
    createTime: '2026-06-03 09:15:00',
    hasAttachment: false,
    branch: 'wuhu'
  }
]

const mockForwardOrders = [
  {
    id: 'FO-000001',
    orderCode: 'FO-2026-000001',
    projectCode: 'PRJ-2026-0001',
    projectName: '合肥市第一人民医院智慧医疗项目',
    contractCode: 'CTR-2026-000001',
    contractName: '智慧医疗系统服务合同',
    contractId: 'CT2026060001',
    contractType: 'income',
    amountExcludingTax: '125000.00',
    amountIncludingTax: '132500.00',
    status: 'pending-parse',
    customerManager: '王芳',
    orderOwner: '刘伟',
    createTime: '2026-06-01 09:00:00'
  },
  {
    id: 'FO-000002',
    orderCode: 'FO-2026-000002',
    projectCode: 'PRJ-2026-0002',
    projectName: '芜湖市政务服务中心数字政府项目',
    contractCode: 'CTR-2026-000002',
    contractName: '数字政府平台运营合同',
    contractId: 'CT2026060002',
    contractType: 'income-expense',
    amountExcludingTax: '250000.00',
    amountIncludingTax: '265000.00',
    status: 'pending-parse',
    customerManager: '李明',
    orderOwner: '孙磊',
    createTime: '2026-06-02 10:00:00'
  }
]

const mockPurchaseOrders = [
  {
    id: 'PO-000001',
    orderCode: 'PO-2026-000001',
    projectCode: 'PRJ-2026-0001',
    projectName: '合肥市第一人民医院智慧医疗项目',
    contractCode: 'CTR-2026-000101',
    contractName: '智慧医疗系统采购合同',
    contractId: 'CT2026060003',
    contractType: 'expense',
    purchaseRequestCode: 'PR-2026-000001',
    documentType: '设备采购',
    amountExcludingTax: '85000.00',
    amountIncludingTax: '96050.00',
    status: 'pending-parse',
    createTime: '2026-06-01 09:00:00',
    creator: '张三',
    supplierCode: 'SUP-0001',
    supplierName: '合肥科技有限公司'
  },
  {
    id: 'PO-000002',
    orderCode: 'PO-2026-000002',
    projectCode: 'PRJ-2026-0002',
    projectName: '芜湖市政务服务中心数字政府项目',
    contractCode: 'CTR-2026-000102',
    contractName: '数字政府平台建设合同',
    contractId: 'CT2026060003',
    contractType: 'expense',
    purchaseRequestCode: 'PR-2026-000002',
    documentType: '软件开发',
    amountExcludingTax: '170000.00',
    amountIncludingTax: '192100.00',
    status: 'pending-parse',
    createTime: '2026-06-02 10:00:00',
    creator: '李四',
    supplierCode: 'SUP-0002',
    supplierName: '芜湖信息技术公司'
  }
]

function getContractInfo(id: string) {
  const contract = mockContracts.find(c => c.id === id) || mockContracts[0]

  const amountWithTaxNum = parseFloat(contract.amountWithTax.replace(/,/g, ''))
  const projectAmountWithTax = (amountWithTaxNum * 0.68).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const projectAmountNoTax = (amountWithTaxNum * 0.68 / 1.13).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return {
    name: contract.name,
    projectCode: contract.projectCode,
    projectName: contract.projectName,
    code: contract.code,
    serialNo: contract.id,
    type: typeKeyMap[contract.type] || '收入类',
    typeKey: contract.type as 'income' | 'income-expense' | 'expense',
    isFramework: contract.isFramework ? '是' : '否',
    frameworkRelationType: contract.frameworkRelationType,
    secondCategory: contract.secondCategory,
    thirdCategory: contract.thirdCategory,
    organizer: '安徽移动合肥分公司',
    handler: contract.creator,
    dept: '政企客户部',
    signSubject: contract.signSubject,
    draftTime: contract.draftTime,
    status: statusMap[contract.status] || '草稿',
    statusChangeTime: '2026-06-15 14:20:00',
    nature: '业务合同',
    projectAmountWithTax,
    projectAmountNoTax,
    effectiveTime: contract.effectiveDate,
    terminationTime: contract.terminationDate,
    contractPeriodMonths: '36',
    signTime: '2026-06-15',
    counterpartName: contract.counterpartName,
    collectedCustomer: contract.customer,
    amountWithTax: contract.amountWithTax,
    amountNoTax: contract.amountWithoutTax,
    adjustedAmountWithTax: contract.amountWithTax,
    adjustedAmountNoTax: contract.amountWithoutTax,
    performanceStartTime: contract.effectiveDate,
    performanceEndTime: contract.terminationDate,
    isSupplement: contract.isSupplement ? '是' : '否',
    supplementType: contract.isSupplement ? '金额变更' : '-'
  }
}

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
    isFixedRate: '是',
    plannedIncome: '500,000',
    contractStage: '初验',
    billingShareType: '月',
    billingSharePeriod: '12',
    isContractAsset: '否',
    plannedOrderDate: '2026-07-01',
    billingStartDate: '2026-07'
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
    isFixedRate: '是',
    plannedIncome: '2,000,000',
    contractStage: '到货',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '否',
    plannedOrderDate: '2026-08-01',
    billingStartDate: '2026-08'
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
  },
  {
    id: 'ct-demo-3',
    productName: '语音',
    productCode: 'CT-V001',
    productFullName: '语音基础服务',
    packageName: '基础套餐',
    bandwidth: '',
    orderQuantity: '300',
    tariffName: '[849]融合通信费',
    plannedIncome: '360,000',
    plannedTariffAmount: '360,000',
    budgetTariffAmount: '320,000',
    taxRate: '6%',
    discount: '80',
    billingShareType: '月',
    billingSharePeriod: '12',
    isContractAsset: '否',
    plannedOrderDate: '2026-07',
    billingStartDate: '2026-07-01',
    mgmtProductCode: 'P-CT-V',
    mgmtProductName: '融合通信服务',
    thirdLevelSubject: 'S849',
    coaSubject: 'C-849-02',
    coaSubjectName: '融合通信服务收入',
    orderStatus: '待订购'
  },
  {
    id: 'ct-demo-4',
    productName: '云计算',
    productCode: 'CT-C001',
    productFullName: '云主机基础型',
    packageName: '云服务套餐',
    bandwidth: '',
    orderQuantity: '10',
    tariffName: '[956]云服务费用',
    plannedIncome: '480,000',
    plannedTariffAmount: '480,000',
    budgetTariffAmount: '450,000',
    taxRate: '6%',
    discount: '88',
    billingShareType: '月',
    billingSharePeriod: '24',
    isContractAsset: '否',
    plannedOrderDate: '2026-09',
    billingStartDate: '2026-09-01',
    mgmtProductCode: 'P-CT-C',
    mgmtProductName: '云服务',
    thirdLevelSubject: 'S956',
    coaSubject: 'C-956-02',
    coaSubjectName: '云服务收入',
    orderStatus: '待订购'
  },
  {
    id: 'ct-demo-5',
    productName: '互联网专线',
    productCode: 'CT-INT001',
    productFullName: '互联网专线标准版',
    packageName: '互联网套餐',
    bandwidth: '200',
    orderQuantity: '5',
    tariffName: '[1205]专线费',
    plannedIncome: '900,000',
    plannedTariffAmount: '900,000',
    budgetTariffAmount: '800,000',
    taxRate: '9%',
    discount: '92',
    billingShareType: '月',
    billingSharePeriod: '36',
    isContractAsset: '否',
    plannedOrderDate: '2026-07',
    billingStartDate: '2026-07-15',
    mgmtProductCode: 'P-CT-INT',
    mgmtProductName: '专线服务',
    thirdLevelSubject: 'S1205',
    coaSubject: 'C-1205-02',
    coaSubjectName: '专线接入服务收入',
    orderStatus: '已订购'
  }
]

export default function OrderParse({ onNavigate, orderId, orderType = 'forward' }: OrderParseProps) {
  const modal = useModal()

  const order = orderType === 'forward'
    ? (mockForwardOrders.find(o => o.id === orderId) || mockForwardOrders[0])
    : (mockPurchaseOrders.find(o => o.id === orderId) || mockPurchaseOrders[0])
  const contractInfo = getContractInfo(order.contractId)
  const contractType = contractInfo.typeKey

  const [itIncomeList, setItIncomeList] = useState<ITIncomeRow[]>(mockITIncome)
  const [ctIncomeList, setCtIncomeList] = useState<CTIncomeRow[]>(mockCTIncome)
  const [itCostList, setItCostList] = useState<CostRow[]>([])
  const [ctCostList, setCtCostList] = useState<CostRow[]>([])
  const [itInvestmentList, setItInvestmentList] = useState<InvestmentRow[]>([])
  const [ctInvestmentList, setCtInvestmentList] = useState<InvestmentRow[]>([])

  const [approver, setApprover] = useState('')
  const [trailExpanded, setTrailExpanded] = useState(false)

  const trailData = [
    { time: '2026-07-15 10:30:00', actor: '张三', action: '提交合同解析申请' },
    { time: '2026-07-15 14:20:00', actor: '李四', action: '审批通过，流转至计划变更环节' }
  ]

  const calcTotalIncome = () => {
    const itTotal = itIncomeList.reduce((sum, item) => sum + (parseFloat(item.plannedIncome) || 0), 0)
    const ctTotal = ctIncomeList.reduce((sum, item) => sum + (parseFloat(item.plannedIncome) || 0), 0)
    return itTotal + ctTotal
  }

  const handleSubmit = () => {
    if (!approver) {
      alert('请选择下一步环节审批人')
      return
    }

    if (orderType === 'forward' && (contractType === 'income' || contractType === 'income-expense')) {
      const totalIncome = calcTotalIncome()
      const orderAmountWithTax = parseFloat(order.amountIncludingTax) || 0
      if (Math.abs(totalIncome - orderAmountWithTax) > 0.01) {
        alert(`计划信息收入总额（${totalIncome.toFixed(2)} 元）与订单金额（含税，${orderAmountWithTax.toFixed(2)} 元）不一致，请调整后再提交审批`)
        return
      }
    }

    modal.confirm('确定提交吗？', '提交').then(ok => {
      if (ok) {
        alert('提交成功')
        onNavigate?.(orderType === 'forward' ? '/finance/contract/order/forward' : '/finance/contract/order/purchase')
      }
    })
  }

  const handleCancel = () => {
    onNavigate?.(orderType === 'forward' ? '/finance/contract/order/forward' : '/finance/contract/order/purchase')
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
            <h2 className="text-sm font-semibold text-gray-800">订单解析</h2>
          </div>
        </div>

        {/* 1. 合同信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">合同信息</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              <InfoField label="合同名称" value={contractInfo.name} />
              <InfoField label="合同编码" value={contractInfo.code} />
              <InfoField label="合同流水号" value={contractInfo.serialNo} />
              <InfoField label="合同类型" value={contractInfo.type} />
              <InfoField label="是否框架合同" value={contractInfo.isFramework} />
              <InfoField label="关联类型" value={contractInfo.frameworkRelationType} />
              <InfoField label="合同二级分类" value={contractInfo.secondCategory} />
              <InfoField label="合同三级分类" value={contractInfo.thirdCategory} />
              <InfoField label="承办单位" value={contractInfo.organizer} />
              <InfoField label="承办人" value={contractInfo.handler} />
              <InfoField label="承办部门" value={contractInfo.dept} />
              <InfoField label="合同签约主体" value={contractInfo.signSubject} />
              <InfoField label="合同起草时间" value={contractInfo.draftTime} />
              <InfoField label="合同状态" value={contractInfo.status} />
              <InfoField label="状态变更时间" value={contractInfo.statusChangeTime} />
              <InfoField label="合同性质" value={contractInfo.nature} />
              <InfoField label="本项目所占合同金额（含税）" value={`${contractInfo.projectAmountWithTax} 元`} />
              <InfoField label="本项目所占合同金额（不含税）" value={`${contractInfo.projectAmountNoTax} 元`} />
              <InfoField label="合同生效时间" value={contractInfo.effectiveTime} />
              <InfoField label="合同终止时间" value={contractInfo.terminationTime} />
              <InfoField label="合同期数（月）" value={contractInfo.contractPeriodMonths} />
              <InfoField label="合同签约时间" value={contractInfo.signTime} />
              <InfoField label="相对方名称" value={contractInfo.counterpartName} />
              <InfoField label="征收客户" value={contractInfo.collectedCustomer} />
              <InfoField label="合同金额（含税）" value={`${contractInfo.amountWithTax} 元`} />
              <InfoField label="合同金额（不含税）" value={`${contractInfo.amountNoTax} 元`} />
              <InfoField label="调整后合同金额（含税）" value={`${contractInfo.adjustedAmountWithTax} 元`} />
              <InfoField label="调整后合同金额（不含税）" value={`${contractInfo.adjustedAmountNoTax} 元`} />
              <InfoField label="履约开始时间" value={contractInfo.performanceStartTime} />
              <InfoField label="履约结束时间" value={contractInfo.performanceEndTime} />
              <InfoField label="是否补充协议" value={contractInfo.isSupplement} />
              <InfoField label="补充协议类型" value={contractInfo.supplementType} />
            </div>
          </div>
        </div>

        {/* 2. 订单信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">订单信息</h3>
          </div>
          <div className="p-4">
            {orderType === 'forward' ? (
              <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                <InfoField label="订单编号" value={order.orderCode} />
                <InfoField label="合同编码" value={order.contractCode} />
                <InfoField label="合同名称" value={order.contractName} />
                <InfoField label="订单金额（元，不含税）" value={order.amountExcludingTax} />
                <InfoField label="订单金额（元，含税）" value={order.amountIncludingTax} />
                <InfoField label="订单状态" value={orderStatusMap[order.status] || order.status} />
                <InfoField label="客户经理" value={(order as any).customerManager} />
                <InfoField label="订单负责人" value={(order as any).orderOwner} />
                <InfoField label="创建时间" value={order.createTime} />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                <InfoField label="采购订单编号" value={order.orderCode} />
                <InfoField label="合同编码" value={order.contractCode} />
                <InfoField label="合同名称" value={order.contractName} />
                <InfoField label="采购需求申请单号" value={(order as any).purchaseRequestCode} />
                <InfoField label="单据类型" value={(order as any).documentType} />
                <InfoField label="订单金额（元，不含税）" value={order.amountExcludingTax} />
                <InfoField label="订单金额（元，含税）" value={order.amountIncludingTax} />
                <InfoField label="订单状态" value={orderStatusMap[order.status] || order.status} />
                <InfoField label="创建时间" value={order.createTime} />
                <InfoField label="创建人" value={(order as any).creator} />
                <InfoField label="供应商编号" value={(order as any).supplierCode} />
                <InfoField label="供应商名称" value={(order as any).supplierName} />
              </div>
            )}
          </div>
        </div>

        {/* 流程轨迹 */}
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

        {/* 3. 计划信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">计划信息</h3>
          </div>
          <div className="p-4 space-y-4">
            {orderType === 'purchase' ? (
              <>
              </>
            ) : (
              <>
                {contractType === 'income' && (
                  <>
                    <IncomeITSection
                      value={itIncomeList}
                      onChange={setItIncomeList}
                    />
                    <IncomeCTSection
                      value={ctIncomeList}
                      onChange={setCtIncomeList}
                    />
                  </>
                )}

                {contractType === 'income-expense' && (
                  <IncomeITSection
                    value={itIncomeList}
                    onChange={setItIncomeList}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* 4. 下一步 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">下一步</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                  <span className="text-red-500 mr-0.5">*</span>
                  下一步环节审批人
                </label>
                <div className="flex-1 min-w-0">
                  <SearchableSelect
                    value={approver}
                    onChange={setApprover}
                    options={approverOptions}
                    placeholder="请选择审批人"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100 bg-white rounded-lg shadow-sm p-4">
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
  )
}
