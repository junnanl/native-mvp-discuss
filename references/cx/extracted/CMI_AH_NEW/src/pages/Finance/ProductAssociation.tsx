import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { Search, Check, RotateCcw, X, Plus, Upload, Trash2, Paperclip, ChevronDown, ChevronRight, UserRoundMinus, AlertTriangle } from 'lucide-react'
import FileUpload from '@/components/FileUpload'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import { calculateExcludingTax } from '@/lib/utils'
import { getContractInfo } from '@/data/mock'

// 审批人选项
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

// 项目列表 mock 数据
const projectList = [
  {
    id: 'p1',
    name: '合肥市第一人民医院智慧医疗项目',
    code: 'PRJ-2026-HF-001',
    globalCode: 'NET-2026-HF-001',
    type: 'ICT项目',
    signMode: '普通项目',
    customerManager: '张凯',
    solutionManager: '刘伟',
    draftedCount: 2
  },
  {
    id: 'p2',
    name: '芜湖市政务服务中心数字政府项目',
    code: 'PRJ-2026-WH-001',
    globalCode: 'NET-2026-WH-001',
    type: 'DICT项目',
    signMode: '统谈分签项目',
    customerManager: '李华',
    solutionManager: '陈晨',
    draftedCount: 0
  },
  {
    id: 'p3',
    name: '蚌埠市教育局智慧教育项目',
    code: 'PRJ-2026-BB-001',
    globalCode: 'NET-2026-BB-001',
    type: 'ICT项目',
    signMode: '框架订单项目',
    customerManager: '王强',
    solutionManager: '赵磊',
    draftedCount: 1
  },
  {
    id: 'p4',
    name: '合肥市轨道交通集团智慧交通项目',
    code: 'PRJ-2026-HF-002',
    globalCode: 'NET-2026-HF-002',
    type: '双计项目',
    signMode: '框架合同项目',
    customerManager: '赵明',
    solutionManager: '孙杰',
    draftedCount: 3
  },
  {
    id: 'p5',
    name: '安徽省公安厅智慧城市项目',
    code: 'PRJ-2026-AH-001',
    globalCode: 'NET-2026-AH-001',
    type: 'ICT项目',
    signMode: '普通项目',
    customerManager: '杨海波',
    solutionManager: '周涛',
    draftedCount: 0
  }
]

// 合同列表 mock 数据
const contractList = [
  {
    id: 'c1',
    code: 'CTR2026000001',
    name: '安徽移动IDC数据中心建设项目合同',
    type: '收入类',
    amountWithTax: '1,200,000.00',
    amountWithoutTax: '1,061,946.90',
    groupCustomerName: '安徽省政务信息中心',
    groupCustomerCode: 'GCUS001',
    status: '履行中',
    performanceStartTime: '2026-07-01',
    performanceEndTime: '2027-06-30',
    projectCode: 'PRJ-2026-HF-001'
  },
  {
    id: 'c2',
    code: 'CTR2026000002',
    name: '合肥政务云平台服务合同',
    type: '收入类',
    amountWithTax: '3,500,000.00',
    amountWithoutTax: '3,097,345.13',
    groupCustomerName: '合肥市大数据局',
    groupCustomerCode: 'GCUS002',
    status: '履行中',
    performanceStartTime: '2026-06-15',
    performanceEndTime: '2027-06-14',
    projectCode: 'PRJ-2026-HF-001'
  },
  {
    id: 'c3',
    code: 'CTR2026000003',
    name: '企业专线接入服务协议',
    type: '收入类',
    amountWithTax: '850,000.00',
    amountWithoutTax: '752,212.39',
    groupCustomerName: '中国移动通信集团安徽有限公司',
    groupCustomerCode: 'GCUS003',
    status: '已签订',
    performanceStartTime: '2026-07-01',
    performanceEndTime: '2028-06-30',
    projectCode: 'PRJ-2026-WH-001'
  },
  {
    id: 'c4',
    code: 'CTR2026000004',
    name: '淮南IDC机房运维服务采购合同',
    type: '收入类',
    amountWithTax: '2,000,000.00',
    amountWithoutTax: '1,769,911.50',
    groupCustomerName: '淮南市信息技术服务有限公司',
    groupCustomerCode: 'GCUS004',
    status: '履行中',
    performanceStartTime: '2026-06-10',
    performanceEndTime: '2027-06-09',
    projectCode: 'PRJ-2026-BB-001'
  },
  {
    id: 'c5',
    code: 'CTR2026000005',
    name: '马鞍山智慧城市云平台建设运营合同',
    type: '收入类',
    amountWithTax: '5,800,000.00',
    amountWithoutTax: '5,132,743.36',
    groupCustomerName: '马鞍山市大数据资源管理局',
    groupCustomerCode: 'GCUS005',
    status: '履行中',
    performanceStartTime: '2026-06-20',
    performanceEndTime: '2028-06-19',
    projectCode: 'PRJ-2026-HF-002'
  }
]

// 集团客户列表 mock 数据
const groupCustomerList = [
  { id: 'gc1', code: 'GC001', name: '安徽智教科技有限公司', globalCode: 'NAT001', level: 'A级', industry: '教育' },
  { id: 'gc2', code: 'GC002', name: '芜湖教育信息服务中心', globalCode: 'NAT002', level: 'B级', industry: '教育' },
  { id: 'gc3', code: 'GC003', name: '合肥智慧城市运营公司', globalCode: 'NAT003', level: 'A级', industry: '政务' },
  { id: 'gc4', code: 'GC004', name: '蚌埠数字教育研究院', globalCode: 'NAT004', level: 'B级', industry: '教育' }
]

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
  mgmtProduct: string
  coaSubject: string
  orderStatus: '待订购' | '订购中' | '部分订购' | '已订购'
  contractCode: string
}

// 计费号码信息
interface BillingUser {
  id: string
  billingUser: string
  bindType: '手动' | '自动'
  bindTime: string
  unbindTime: string
  actualGroupCustCode: string
  actualGroupCustName: string
  contractCode: string
  tariffName?: string
  tariffInstanceId?: string
  tariffEffectiveTime?: string
  tariffExpireTime?: string
}

// 计费号码 mock 数据
const billingUserList: BillingUser[] = [
  {
    id: 'bu1',
    billingUser: '13800138001',
    bindType: '手动',
    bindTime: '2026-06-20 10:23:15',
    unbindTime: '2027-06-20 10:23:15',
    actualGroupCustCode: 'GCUS001',
    actualGroupCustName: '中国移动通信集团安徽有限公司合肥分公司',
    contractCode: 'CTR2026000001'
  },
  {
    id: 'bu2',
    billingUser: '13800138002',
    bindType: '自动',
    bindTime: '2026-06-21 09:12:40',
    unbindTime: '2028-06-21 09:12:40',
    actualGroupCustCode: 'GCUS001',
    actualGroupCustName: '中国移动通信集团安徽有限公司合肥分公司',
    contractCode: 'CTR2026000001'
  },
  {
    id: 'bu3',
    billingUser: '13800138003',
    bindType: '手动',
    bindTime: '2026-06-25 14:05:08',
    unbindTime: '2026-07-02 16:30:00',
    actualGroupCustCode: 'GCUS003',
    actualGroupCustName: '芜湖市智慧城市运营有限公司',
    contractCode: 'CTR2026000002'
  },
  {
    id: 'bu4',
    billingUser: '13800138004',
    bindType: '手动',
    bindTime: '2026-06-28 11:48:22',
    unbindTime: '2027-06-28 11:48:22',
    actualGroupCustCode: 'GCUS001',
    actualGroupCustName: '中国移动通信集团安徽有限公司合肥分公司',
    contractCode: 'CTR2026000001'
  },
  {
    id: 'bu5',
    billingUser: '13800138005',
    bindType: '自动',
    bindTime: '2026-07-01 08:30:00',
    unbindTime: '2028-07-01 08:30:00',
    actualGroupCustCode: 'GCUS001',
    actualGroupCustName: '中国移动通信集团安徽有限公司合肥分公司',
    contractCode: 'CTR2026000001'
  },
  {
    id: 'bu6',
    billingUser: '13800138006',
    bindType: '手动',
    bindTime: '2026-07-03 09:45:22',
    unbindTime: '2029-07-03 09:45:22',
    actualGroupCustCode: 'GCUS002',
    actualGroupCustName: '合肥市大数据局',
    contractCode: 'CTR2026000001'
  },
  {
    id: 'bu7',
    billingUser: '13800138007',
    bindType: '自动',
    bindTime: '2026-07-05 11:20:08',
    unbindTime: '2027-07-05 11:20:08',
    actualGroupCustCode: 'GCUS001',
    actualGroupCustName: '中国移动通信集团安徽有限公司合肥分公司',
    contractCode: 'CTR2026000001'
  },
  {
    id: 'bu8',
    billingUser: '13800138008',
    bindType: '手动',
    bindTime: '2026-07-08 14:10:35',
    unbindTime: '2026-07-20 10:00:00',
    actualGroupCustCode: 'GCUS003',
    actualGroupCustName: '芜湖市智慧城市运营有限公司',
    contractCode: 'CTR2026000001'
  },
  {
    id: 'bu9',
    billingUser: '13800138009',
    bindType: '自动',
    bindTime: '2026-07-10 16:05:42',
    unbindTime: '2028-07-10 16:05:42',
    actualGroupCustCode: 'GCUS002',
    actualGroupCustName: '合肥市大数据局',
    contractCode: 'CTR2026000001'
  },
  {
    id: 'bu10',
    billingUser: '13800138010',
    bindType: '手动',
    bindTime: '2026-07-12 08:55:18',
    unbindTime: '2027-07-12 08:55:18',
    actualGroupCustCode: 'GCUS001',
    actualGroupCustName: '中国移动通信集团安徽有限公司合肥分公司',
    contractCode: 'CTR2026000001'
  }
]

// 手动绑定弹框 - 计费号码/资费实例候选数据
interface ManualBindOption {
  id: string
  billingUser: string
  actualGroupCustCode: string
  actualGroupCustName: string
  tariffName: string
  tariffInstanceId: string
  tariffEffectiveTime: string
  tariffExpireTime: string
  contractCode: string
  sharePeriod: string
  productName: string
}

const manualBindOptions: ManualBindOption[] = [
  {
    id: 'mbo1',
    billingUser: '13800138101',
    actualGroupCustCode: 'GCUS001',
    actualGroupCustName: '中国移动通信集团安徽有限公司合肥分公司',
    tariffName: '[J910]宽带-500M-专线资费',
    tariffInstanceId: 'INST-J910-2026062001',
    tariffEffectiveTime: '2026-06-25',
    tariffExpireTime: '2028-06-24',
    contractCode: 'CTR2026000001',
    sharePeriod: '12',
    productName: '[J910]宽带'
  },
  {
    id: 'mbo2',
    billingUser: '13800138102',
    actualGroupCustCode: 'GCUS001',
    actualGroupCustName: '中国移动通信集团安徽有限公司合肥分公司',
    tariffName: '[J920]专线-1G-本地接入',
    tariffInstanceId: 'INST-J920-2026062101',
    tariffEffectiveTime: '2026-06-28',
    tariffExpireTime: '2029-06-27',
    contractCode: 'CTR2026000001',
    sharePeriod: '24',
    productName: '[J920]专线'
  },
  {
    id: 'mbo3',
    billingUser: '0551-62223301',
    actualGroupCustCode: 'GCUS001',
    actualGroupCustName: '中国移动通信集团安徽有限公司合肥分公司',
    tariffName: '[J920]专线-2G-跨省MPLS',
    tariffInstanceId: 'INST-J920-2026062501',
    tariffEffectiveTime: '2026-07-02',
    tariffExpireTime: '2028-07-01',
    contractCode: 'CTR2026000001',
    sharePeriod: '36',
    productName: '[J920]专线'
  },
  {
    id: 'mbo4',
    billingUser: '13800138103',
    actualGroupCustCode: 'GCUS003',
    actualGroupCustName: '芜湖市智慧城市运营有限公司',
    tariffName: '[J930]云主机-通用型-8C16G',
    tariffInstanceId: 'INST-J930-2026062801',
    tariffEffectiveTime: '2026-06-30',
    tariffExpireTime: '2027-06-29',
    contractCode: 'CTR2026000002',
    sharePeriod: '12',
    productName: '[J930]云主机'
  },
  {
    id: 'mbo5',
    billingUser: '13800138104',
    actualGroupCustCode: 'GCUS001',
    actualGroupCustName: '中国移动通信集团安徽有限公司合肥分公司',
    tariffName: '[J910]宽带-1G-企业专线',
    tariffInstanceId: 'INST-J910-2026070101',
    tariffEffectiveTime: '2026-07-05',
    tariffExpireTime: '2031-07-04',
    contractCode: 'CTR2026000001',
    sharePeriod: '60',
    productName: '[J910]宽带'
  }
]

// CT订购计划 mock 数据
// 说明：当月(2026-07)且订购状态=待订购 的行复选框可用；其余行禁用
const ctOrderPlanList: CTOrderPlan[] = [
  // 当月 + 待订购 → 可勾选
  {
    id: 'ct1',
    planCode: 'CT-PLAN-202607001',
    productName: '[J910]宽带',
    taxRate: '6%',
    bandwidth: '100',
    quantity: '50',
    actualQuantity: '0',
    tariffName: '企业宽带标准套餐',
    plannedAmount: '250,000.00',
    shareType: '月',
    sharePeriod: '36',
    plannedOrderDate: '2026-07-20',
    mgmtProduct: 'ICT宽带服务',
    coaSubject: 'C6001-宽带服务收入',
    orderStatus: '待订购',
    contractCode: 'CTR2026000001'
  },
  {
    id: 'ct4',
    planCode: 'CT-PLAN-202607004',
    productName: '[J925]MPLS VPN',
    taxRate: '9%',
    bandwidth: '500',
    quantity: '8',
    actualQuantity: '0',
    tariffName: 'MPLS VPN 省级节点套餐',
    plannedAmount: '180,000.00',
    shareType: '月',
    sharePeriod: '36',
    plannedOrderDate: '2026-07-28',
    mgmtProduct: 'ICT专线服务',
    coaSubject: 'C6002-专线服务收入',
    orderStatus: '待订购',
    contractCode: 'CTR2026000001'
  },
  // 当月 + 订购中 / 部分订购 / 已订购 → 不可勾选
  {
    id: 'ct2',
    planCode: 'CT-PLAN-202607002',
    productName: '[J920]专线',
    taxRate: '9%',
    bandwidth: '1000',
    quantity: '10',
    actualQuantity: '4',
    tariffName: '政企专线精品套餐',
    plannedAmount: '480,000.00',
    shareType: '一次性',
    sharePeriod: '1',
    plannedOrderDate: '2026-07-25',
    mgmtProduct: 'ICT专线服务',
    coaSubject: 'C6002-专线服务收入',
    orderStatus: '订购中',
    contractCode: 'CTR2026000001'
  },
  {
    id: 'ct5',
    planCode: 'CT-PLAN-202607005',
    productName: '[J915]宽带商务版',
    taxRate: '6%',
    bandwidth: '300',
    quantity: '30',
    actualQuantity: '12',
    tariffName: '宽带商务版套餐',
    plannedAmount: '96,000.00',
    shareType: '月',
    sharePeriod: '24',
    plannedOrderDate: '2026-07-18',
    mgmtProduct: 'ICT宽带服务',
    coaSubject: 'C6001-宽带服务收入',
    orderStatus: '部分订购',
    contractCode: 'CTR2026000002'
  },
  {
    id: 'ct6',
    planCode: 'CT-PLAN-202607006',
    productName: '[J940]固话语音',
    taxRate: '9%',
    bandwidth: '-',
    quantity: '100',
    actualQuantity: '100',
    tariffName: '固话语音企业总机',
    plannedAmount: '48,000.00',
    shareType: '月',
    sharePeriod: '12',
    plannedOrderDate: '2026-07-10',
    mgmtProduct: '语音通信服务',
    coaSubject: 'C6021-语音服务收入',
    orderStatus: '已订购',
    contractCode: 'CTR2026000002'
  },
  // 非当月(2026-08/06) + 待订购 → 不可勾选（因非当月）
  {
    id: 'ct3',
    planCode: 'CT-PLAN-202607003',
    productName: '[J930]云主机',
    taxRate: '13%',
    bandwidth: '-',
    quantity: '20',
    actualQuantity: '0',
    tariffName: '云主机通用标准型',
    plannedAmount: '360,000.00',
    shareType: '月',
    sharePeriod: '24',
    plannedOrderDate: '2026-08-01',
    mgmtProduct: '云基础设施服务',
    coaSubject: 'C6011-云主机服务收入',
    orderStatus: '已订购',
    contractCode: 'CTR2026000002'
  },
  {
    id: 'ct7',
    planCode: 'CT-PLAN-202608001',
    productName: '[J935]云存储',
    taxRate: '13%',
    bandwidth: '-',
    quantity: '15',
    actualQuantity: '0',
    tariffName: '对象存储标准型',
    plannedAmount: '72,000.00',
    shareType: '月',
    sharePeriod: '24',
    plannedOrderDate: '2026-08-05',
    mgmtProduct: '云基础设施服务',
    coaSubject: 'C6012-云存储服务收入',
    orderStatus: '待订购',
    contractCode: 'CTR2026000002'
  },
  {
    id: 'ct8',
    planCode: 'CT-PLAN-202606001',
    productName: '[J950]短信平台',
    taxRate: '6%',
    bandwidth: '-',
    quantity: '500',
    actualQuantity: '0',
    tariffName: '短信平台企业版',
    plannedAmount: '30,000.00',
    shareType: '一次性',
    sharePeriod: '1',
    plannedOrderDate: '2026-06-25',
    mgmtProduct: 'ICT增值服务',
    coaSubject: 'C6031-增值服务收入',
    orderStatus: '待订购',
    contractCode: 'CTR2026000001'
  }
]

// 集团产品号码列表 mock 数据
const groupProductNumbers = [
  {
    id: 'gpn1',
    groupProductNumber: '0551-62221111',
    productCode: 'P-J910',
    productName: '[J910]宽带',
    workOrderAcceptTime: '2026-06-15 10:30:00'
  },
  {
    id: 'gpn2',
    groupProductNumber: '0551-62221112',
    productCode: 'P-J910',
    productName: '[J910]宽带',
    workOrderAcceptTime: '2026-06-15 11:00:00'
  },
  {
    id: 'gpn3',
    groupProductNumber: '0551-62221113',
    productCode: 'P-J920',
    productName: '[J920]专线',
    workOrderAcceptTime: '2026-06-16 09:00:00'
  },
  {
    id: 'gpn4',
    groupProductNumber: '0551-62221114',
    productCode: 'P-J920',
    productName: '[J920]专线',
    workOrderAcceptTime: '2026-06-16 14:30:00'
  },
  {
    id: 'gpn5',
    groupProductNumber: '0551-62221115',
    productCode: 'P-J930',
    productName: '[J930]云主机',
    workOrderAcceptTime: '2026-06-17 10:00:00'
  }
]

// 产品编码映射
const productCodeMap: Record<string, string> = {
  '[J910]宽带': 'P-J910',
  '[J920]专线': 'P-J920',
  '[J930]云主机': 'P-J930'
}

interface ProjectInfo {
  id: string
  name: string
  code: string
  globalCode: string
  type: string
  signMode: string
  customerManager: string
  solutionManager: string
  draftedCount: number
}

interface ContractInfo {
  id: string
  code: string
  name: string
  type: string
  amountWithTax: string
  amountWithoutTax: string
  groupCustomerName: string
  groupCustomerCode: string
  status: string
  performanceStartTime: string
  performanceEndTime: string
  projectCode: string
}

interface SupplementRow {
  id: string
  productName: string
  productCode: string
  groupProductNumber: string
  workOrderAcceptTime: string
  businessDevEmpNo: string
  businessDevEmpName: string
  associationStartTime: string
  associationEndTime: string
  projectCode: string
  operationType: '新增' | '修改'
}

interface GroupProductNumber {
  id: string
  groupProductNumber: string
  productCode: string
  productName: string
  workOrderAcceptTime: string
}

// 区块标题
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
      className={clsx(
        'flex items-center gap-2 mb-3 mt-5 first:mt-0 cursor-pointer select-none hover:bg-gray-50 -mx-2 px-2 py-1 rounded',
        !sectionKey && 'cursor-default hover:bg-transparent'
      )}
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

// 字段行
function FieldRow({
  label,
  required,
  error,
  colSpan,
  fullWidth,
  children
}: {
  label: string
  required?: boolean
  error?: string
  colSpan?: 1 | 2
  fullWidth?: boolean
  children: React.ReactNode
}) {
  return (
    <div className={colSpan === 2 ? 'col-span-2' : ''}>
      <div className="flex items-start gap-3 min-h-[36px]">
        <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
          {required && <span className="text-red-500 mr-0.5">*</span>}
          {label}
        </label>
        <div className={clsx('flex-1 min-w-0', !fullWidth && 'max-w-md')}>
          {children}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
      </div>
    </div>
  )
}

// 只读字段
function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center min-h-[36px]">
      <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">{label}</label>
      <div className="flex-1 min-w-0 text-sm text-gray-700 truncate" title={value}>{value}</div>
    </div>
  )
}

interface ProductAssociationProps {
  onNavigate?: (path: string) => void
  readOnly?: boolean
  editId?: string
  detailId?: string
}

export default function ProductAssociation({ onNavigate, readOnly = false, editId }: ProductAssociationProps) {
  // 编辑/详情模式下预填数据
  const isPrefilled = readOnly || !!editId
  // 补录模式（editId存在）：项目信息、合同信息不可编辑
  const isEditMode = !!editId

  // 项目信息相关状态
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [searchProvinceCode, setSearchProvinceCode] = useState('')
  const [searchGlobalCode, setSearchGlobalCode] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [projectExpanded, setProjectExpanded] = useState(true)
  const [project, setProject] = useState<ProjectInfo | null>(isPrefilled ? projectList[0] : null)

  // 合同信息相关状态
  const [selectedContractId, setSelectedContractId] = useState<string>(isPrefilled ? 'c1' : '')
  const [contract, setContract] = useState<ContractInfo | null>(isPrefilled ? contractList[0] : null)

  // 集团客户选择弹窗状态
  const [showGroupCustomerModal, setShowGroupCustomerModal] = useState(false)
  const [searchCustomerCode, setSearchCustomerCode] = useState('')
  const [searchCustomerName, setSearchCustomerName] = useState('')
  const [selectedGroupCustomerId, setSelectedGroupCustomerId] = useState<string>('')

  const filteredGroupCustomers = useMemo(() => {
    return groupCustomerList.filter(c =>
      (!searchCustomerCode.trim() || c.code.includes(searchCustomerCode.trim())) &&
      (!searchCustomerName.trim() || c.name.includes(searchCustomerName.trim()))
    )
  }, [searchCustomerCode, searchCustomerName])

  const handleOpenGroupCustomerModal = () => {
    if (readOnly) return
    setSelectedGroupCustomerId('')
    setSearchCustomerCode('')
    setSearchCustomerName('')
    setShowGroupCustomerModal(true)
  }

  const handleConfirmGroupCustomer = () => {
    if (!selectedGroupCustomerId) {
      alert('请选择一个集团客户')
      return
    }
    const customer = groupCustomerList.find(c => c.id === selectedGroupCustomerId)
    if (customer && contract) {
      setContract(prev => prev ? { ...prev, groupCustomerName: customer.name, groupCustomerCode: customer.code } : prev)
    }
    setShowGroupCustomerModal(false)
  }

  // 根据项目筛选收入类合同
  const projectContracts = useMemo(() => {
    if (!project) return []
    return contractList.filter(c => c.projectCode === project.code && c.type === '收入类')
  }, [project])

  // 补录页面：基于当前选中合同构造 ContractInfoCard 所需的 contractInfo 数据
  const contractInfoForCard = useMemo(() => {
    if (!contract) return null
    return getContractInfo(contract.id)
  }, [contract])

  // CT订购计划数据（根据选中合同筛选）
  const filteredCTOrderPlan = useMemo(() => {
    if (!contract) return []
    return ctOrderPlanList.filter(item => item.contractCode === contract.code)
  }, [contract])

  // 产品名称选项（从CT订购计划中提取）
  const productNameOptions = useMemo(() => {
    return [...new Set(filteredCTOrderPlan.map(item => item.productName))]
  }, [filteredCTOrderPlan])

  // CT产品甩单确认折叠状态
  const [ctExpanded, setCtExpanded] = useState(true)

  // 计费号码信息（补录页面/详情页使用）
  const [billingUsers, setBillingUsers] = useState<BillingUser[]>(
    isPrefilled ? [...billingUserList] : []
  )

  const [confirmUnbind, setConfirmUnbind] = useState<{ open: boolean; id: string }>({ open: false, id: '' })

  // 手动绑定弹窗：筛选区「计费号码 + 查询按钮 + 重置按钮」
  const [showManualBindModal, setShowManualBindModal] = useState(false)
  const [manualBindSearch, setManualBindSearch] = useState({ billingUser: '' })
  const [appliedManualBindSearch, setAppliedManualBindSearch] = useState<{ billingUser: string }>({ billingUser: '' })
  const [selectedManualBindId, setSelectedManualBindId] = useState<string>('')

  // 物联网手工绑定弹窗状态
  const [showIotBindModal, setShowIotBindModal] = useState(false)
  const [iotBillingUser, setIotBillingUser] = useState('')
  const [iotBillingUserError, setIotBillingUserError] = useState('')
  const [iotBindTime, setIotBindTime] = useState('')
  const [iotBindTimeError, setIotBindTimeError] = useState('')

  // 解绑时间 = 绑定时间 + 分摊周期（固定不可修改）
  const iotUnbindTime = useMemo(() => {
    if (!iotBindTime) return ''
    const d = new Date(iotBindTime)
    if (isNaN(d.getTime())) return ''
    const period = parseInt(filteredCTOrderPlan[0]?.sharePeriod || '1', 10) || 1
    const unbind = new Date(d)
    unbind.setMonth(unbind.getMonth() + period)
    const y = unbind.getFullYear()
    const m = String(unbind.getMonth() + 1).padStart(2, '0')
    const day = String(unbind.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }, [iotBindTime, filteredCTOrderPlan])

  // 确认物联网手工绑定
  const handleConfirmIotBind = () => {
    if (!iotBillingUser.trim()) {
      setIotBillingUserError('请输入计费号码')
      return
    }
    if (!iotBindTime) {
      setIotBindTimeError('请选择绑定时间')
      return
    }
    const newRecord: BillingUser = {
      id: `bu_iot_${Date.now()}`,
      billingUser: iotBillingUser.trim(),
      bindType: '手动',
      bindTime: `${iotBindTime} 00:00:00`,
      unbindTime: `${iotUnbindTime} 00:00:00`,
      actualGroupCustCode: '',
      actualGroupCustName: '',
      contractCode: contract?.code || ''
    }
    setBillingUsers(prev => [...prev, newRecord])
    setShowIotBindModal(false)
    setIotBillingUser('')
    setIotBillingUserError('')
    setIotBindTime('')
    setIotBindTimeError('')
  }

  // 打开物联网手工绑定弹框（重置表单）
  const handleOpenIotBindModal = () => {
    setIotBillingUser('')
    setIotBillingUserError('')
    setIotBindTime('')
    setIotBindTimeError('')
    setShowIotBindModal(true)
  }

  // 手动绑定弹窗：点击查询后按条件过滤数据
  const filteredManualBindOptions = useMemo(() => {
    const { billingUser } = appliedManualBindSearch
    if (!billingUser.trim()) return []
    return manualBindOptions.filter(o => o.billingUser.includes(billingUser.trim()))
  }, [appliedManualBindSearch])

  // 触发查询
  const handleApplyManualBindSearch = () => {
    setSelectedManualBindId('')
    setAppliedManualBindSearch({ ...manualBindSearch })
  }

  // 重置查询条件
  const handleResetManualBindSearch = () => {
    setManualBindSearch({ billingUser: '' })
    setAppliedManualBindSearch({ billingUser: '' })
    setSelectedManualBindId('')
  }

  // 根据选中的资费实例 + 计划订购时间计算 绑定时间 / 解绑时间
  const selectedManualBindRecord = useMemo(() => {
    if (!selectedManualBindId) return null
    const opt = manualBindOptions.find(o => o.id === selectedManualBindId) || null
    if (!opt) return null
    const plannedOrderDate = filteredCTOrderPlan[0]?.plannedOrderDate || opt.tariffEffectiveTime
    const effectiveTs = new Date(opt.tariffEffectiveTime).getTime()
    const plannedTs = new Date(plannedOrderDate).getTime()
    const bindTs = effectiveTs > plannedTs ? effectiveTs : plannedTs
    const bindDate = new Date(bindTs)
    const period = parseInt(opt.sharePeriod || '1', 10) || 1
    const unbindDate = new Date(bindDate)
    unbindDate.setMonth(unbindDate.getMonth() + period)
    const fmt = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day} 00:00:00`
    }
    return {
      option: opt,
      bindTime: fmt(bindDate),
      unbindTime: fmt(unbindDate)
    }
  }, [selectedManualBindId, filteredCTOrderPlan])

  // 确认手动绑定（按计费号码信息确认模块口径写入）
  const handleConfirmManualBind = () => {
    if (!selectedManualBindRecord) {
      alert('请先勾选一条计费号码，完成计费号码信息确认后再提交')
      return
    }
    const { option, bindTime, unbindTime } = selectedManualBindRecord
    const newRecord: BillingUser = {
      id: `bu_manual_${Date.now()}`,
      billingUser: option.billingUser,
      bindType: '手动',
      bindTime,
      unbindTime: '',
      actualGroupCustCode: option.actualGroupCustCode,
      actualGroupCustName: option.actualGroupCustName,
      contractCode: option.contractCode,
      tariffName: option.tariffName,
      tariffInstanceId: option.tariffInstanceId,
      tariffEffectiveTime: option.tariffEffectiveTime,
      tariffExpireTime: option.tariffExpireTime
    }
    setBillingUsers(prev => [newRecord, ...prev])
    setShowManualBindModal(false)
    setManualBindSearch({ billingUser: '' })
    setAppliedManualBindSearch({ billingUser: '' })
    setSelectedManualBindId('')
  }

  // 计费号码信息：按当前合同过滤
  const filteredBillingUsers = useMemo(() => {
    if (!contract) return []
    return billingUsers.filter(b => b.contractCode === contract.code)
  }, [billingUsers, contract])

  // 解绑计费号码（仅绑定类型=手动且未解绑可操作）
  const handleUnbindBillingUser = (id: string) => {
    setConfirmUnbind({ open: true, id })
  }

  const confirmUnbindAction = () => {
    setBillingUsers(prev =>
      prev.map(b =>
        b.id === confirmUnbind.id
          ? { ...b, unbindTime: new Date().toISOString().replace('T', ' ').slice(0, 19) }
          : b
      )
    )
    setConfirmUnbind({ open: false, id: '' })
  }

  // CT产品甩单确认 - 合计统计（参考IT收入计划确认）
  const ctPlanTotals = useMemo(() => {
    let budgetIncome = 0  // 概算收入合计（含税）：=计划订购金额（不含税）*分摊周期（月类型*周期，一次性类型直接=计划订购金额）
    let totalWithTax = 0  // 合计（含税）：计划订购金额累加
    let totalWithoutTax = 0  // 合计（不含税）：计划订购金额（不含税）累加
    filteredCTOrderPlan.forEach(item => {
      const withTax = parseFloat((item.plannedAmount || '0').replace(/,/g, '')) || 0
      const withoutTax = parseFloat(calculateExcludingTax(item.plannedAmount || '0', item.taxRate).replace(/,/g, '')) || 0
      const period = parseInt(item.sharePeriod || '1', 10) || 1
      const budget = item.shareType === '一次性' ? withTax : withoutTax * period
      budgetIncome += budget
      totalWithTax += withTax
      totalWithoutTax += withoutTax
    })
    return {
      budgetIncome: budgetIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalWithTax: totalWithTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalWithoutTax: totalWithoutTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  }, [filteredCTOrderPlan])

  // 补录信息列表
  const [supplementList, setSupplementList] = useState<SupplementRow[]>(isPrefilled ? [
    {
      id: 'supplement-1',
      productName: '[J910]宽带',
      productCode: 'P-J910',
      groupProductNumber: '0551-62221111',
      workOrderAcceptTime: '2026-06-15 10:30:00',
      businessDevEmpNo: 'EMP001',
      businessDevEmpName: '张三',
      associationStartTime: '2026-07-01',
      associationEndTime: '2027-06-30',
      projectCode: 'PRJ-2026-HF-001',
      operationType: '新增'
    },
    {
      id: 'supplement-2',
      productName: '[J920]专线',
      productCode: 'P-J920',
      groupProductNumber: '0551-62221113',
      workOrderAcceptTime: '2026-06-16 09:00:00',
      businessDevEmpNo: 'EMP002',
      businessDevEmpName: '李四',
      associationStartTime: '2026-07-01',
      associationEndTime: '2027-06-30',
      projectCode: 'PRJ-2026-HF-001',
      operationType: '新增'
    }
  ] : [])

  // 集团产品号码弹窗相关状态
  const [showProductNumberModal, setShowProductNumberModal] = useState(false)
  const [selectedSupplementRowId, setSelectedSupplementRowId] = useState<string | null>(null)
  const [productNumberSearch, setProductNumberSearch] = useState({ number: '', productName: '' })
  const [selectedProductNumberId, setSelectedProductNumberId] = useState<string>('')

  // 证明材料上传
  const [proofFiles, setProofFiles] = useState<string[]>(isPrefilled ? ['证明材料_1.pdf', '证明材料_2.pdf'] : [])

  // 审批通过后自动触发补录号码的历史账期同步
  const [syncHistoricalPeriod, setSyncHistoricalPeriod] = useState(isPrefilled ? true : false)

  // 下一步审批人
  const [approver, setApprover] = useState(isPrefilled ? approverOptions[0] : '')

  // ========== 订购信息模块状态 ==========
  const [orderRequiredDate, setOrderRequiredDate] = useState<string>('')
  const [orderDescription, setOrderDescription] = useState<string>('')
  const [orderRequiredDateError, setOrderRequiredDateError] = useState<string>('')
  const [orderDescriptionError, setOrderDescriptionError] = useState<string>('')
  // CT订购计划勾选：仅允许「订购状态=待订购」且「计划订购时间=当月」的行勾选
  const [selectedCTOrderIds, setSelectedCTOrderIds] = useState<Set<string>>(new Set())
  // 判定是否允许勾选：待订购 + 2026-07 月份
  const isCTOrderSelectable = (item: CTOrderPlan): boolean => {
    if (item.orderStatus !== '待订购') return false
    return item.plannedOrderDate.startsWith('2026-07')
  }
  const toggleCTOrderSelect = (id: string) => {
    setSelectedCTOrderIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const toggleCTOrderSelectAll = () => {
    const selectableIds = filteredCTOrderPlan.filter(isCTOrderSelectable).map(i => i.id)
    const allSelected = selectableIds.length > 0 && selectableIds.every(id => selectedCTOrderIds.has(id))
    setSelectedCTOrderIds(prev => {
      const next = new Set(prev)
      if (allSelected) selectableIds.forEach(id => next.delete(id))
      else selectableIds.forEach(id => next.add(id))
      return next
    })
  }

  // 筛选项目
  const filteredProjects = useMemo(() => {
    return projectList.filter(p =>
      (!searchName.trim() || p.name.includes(searchName.trim())) &&
      (!searchProvinceCode.trim() || p.code.includes(searchProvinceCode.trim())) &&
      (!searchGlobalCode.trim() || p.globalCode.includes(searchGlobalCode.trim()))
    )
  }, [searchName, searchProvinceCode, searchGlobalCode])

  // 选择合同（单选）
  const handleSelectContract = (contractId: string) => {
    const c = contractList.find(item => item.id === contractId)
    if (c) {
      setSelectedContractId(contractId)
      setContract(c)
      setSupplementList([])
    }
  }

  // 筛选集团产品号码
  const filteredProductNumbers = useMemo(() => {
    return groupProductNumbers.filter(gpn => {
      const numberMatch = !productNumberSearch.number.trim() || gpn.groupProductNumber.includes(productNumberSearch.number.trim())
      const productMatch = !productNumberSearch.productName || gpn.productName === productNumberSearch.productName
      return numberMatch && productMatch
    })
  }, [productNumberSearch])

  // 打开选择项目弹窗
  const handleOpenProjectModal = () => {
    setSelectedProjectId(project?.id || '')
    setSearchName('')
    setSearchProvinceCode('')
    setSearchGlobalCode('')
    setShowProjectModal(true)
  }

  // 确认选择项目
  const handleConfirmProject = () => {
    if (!selectedProjectId) {
      alert('请选择一个项目')
      return
    }
    const p = projectList.find(item => item.id === selectedProjectId)
    if (p) {
      setProject(p)
      // 若该项目下只有一个收入类合同，则初始化直接选中
      const contracts = contractList.filter(c => c.projectCode === p.code && c.type === '收入类')
      if (contracts.length === 1) {
        setContract(contracts[0])
        setSelectedContractId(contracts[0].id)
      } else {
        setContract(null)
        setSelectedContractId('')
      }
      setSupplementList([])
    }
    setShowProjectModal(false)
  }

  // 打开集团产品号码选择弹窗
  const handleOpenProductNumberModal = (rowId: string) => {
    setSelectedSupplementRowId(rowId)
    setSelectedProductNumberId('')
    setProductNumberSearch({ number: '', productName: '' })
    setShowProductNumberModal(true)
  }

  // 确认选择集团产品号码
  const handleConfirmProductNumber = () => {
    if (!selectedProductNumberId) {
      alert('请选择一个集团产品号码')
      return
    }
    const gpn = groupProductNumbers.find(item => item.id === selectedProductNumberId)
    if (gpn && selectedSupplementRowId) {
      setSupplementList(prev => prev.map(row => {
        if (row.id === selectedSupplementRowId) {
          return {
            ...row,
            groupProductNumber: gpn.groupProductNumber,
            productCode: gpn.productCode,
            workOrderAcceptTime: gpn.workOrderAcceptTime
          }
        }
        return row
      }))
    }
    setShowProductNumberModal(false)
    setSelectedSupplementRowId(null)
  }

  // 新增补录信息行
  const handleAddSupplementRow = () => {
    if (!contract) return
    const newRow: SupplementRow = {
      id: `supplement-${Date.now()}`,
      productName: '',
      productCode: '',
      groupProductNumber: '',
      workOrderAcceptTime: '',
      businessDevEmpNo: '',
      businessDevEmpName: '',
      associationStartTime: contract.performanceStartTime,
      associationEndTime: contract.performanceEndTime,
      projectCode: project?.code || '',
      operationType: '新增'
    }
    setSupplementList(prev => [...prev, newRow])
  }

  // 删除补录信息行
  const handleDeleteSupplementRow = (rowId: string) => {
    setSupplementList(prev => prev.filter(row => row.id !== rowId))
  }

  // 更新补录信息字段
  const handleUpdateSupplementField = (rowId: string, field: keyof SupplementRow, value: string) => {
    setSupplementList(prev => prev.map(row => {
      if (row.id === rowId) {
        const updatedRow = { ...row, [field]: value }
        // 如果产品名称变化，更新产品编码
        if (field === 'productName') {
          updatedRow.productCode = productCodeMap[value] || ''
        }
        return updatedRow
      }
      return row
    }))
  }

  // 证明材料上传
  const handleAddProofFile = () => {
    const fileName = `证明材料_${Date.now()}.pdf`
    setProofFiles(prev => [...prev, fileName])
  }

  const handleRemoveProofFile = (index: number) => {
    setProofFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 取消
  const handleCancel = () => {
    if (onNavigate) {
      onNavigate('/finance/income/product-association')
    }
  }

  // 提交
  const handleSubmit = () => {
    if (!project) {
      alert('请选择项目')
      return
    }
    if (!contract) {
      alert('请选择合同')
      return
    }
    // ========== 订购信息必填校验 ==========
    let orderValidatePass = true
    if (!orderRequiredDate.trim()) {
      setOrderRequiredDateError('请选择要求完成时间')
      orderValidatePass = false
    } else {
      setOrderRequiredDateError('')
    }
    if (!orderDescription.trim()) {
      setOrderDescriptionError('请输入订购说明')
      orderValidatePass = false
    } else {
      setOrderDescriptionError('')
    }
    if (!orderValidatePass) return
    if (onNavigate) {
      onNavigate('/finance/income/product-association')
    }
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-3 space-y-3">

        {/* ========== 项目信息模块（独立白色卡片）：补录/详情模式用公共组件，其他模式用原有样式 ========== */}
        {isPrefilled ? (
          contractInfoForCard && (
            <ProjectInfoCard contractInfo={contractInfoForCard} defaultExpanded={false} />
          )
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <SectionTitle sectionKey="project" expanded={projectExpanded} onToggle={() => setProjectExpanded(!projectExpanded)}>项目信息</SectionTitle>
            {projectExpanded && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <FieldRow label="项目名称" required colSpan={2} fullWidth>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={project?.name || ''}
                      onClick={() => !readOnly && handleOpenProjectModal()}
                      placeholder="请选择项目"
                      className={clsx(
                        'w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white',
                        !readOnly && 'cursor-pointer hover:bg-gray-50',
                        readOnly && 'bg-gray-50 text-gray-600 cursor-not-allowed'
                      )}
                    />
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={handleOpenProjectModal}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="选择项目"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </FieldRow>
              </div>
            )}
          </div>
        )}

        {/* ========== 合同信息模块（独立白色卡片）：详情/补录模式用公共组件，新建模式用原有表格 ========== */}
        {isPrefilled && contractInfoForCard ? (
          <ContractInfoCard contractInfo={contractInfoForCard} defaultExpanded={false} />
        ) : project && !isEditMode ? (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <SectionTitle>合同信息</SectionTitle>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500">
                    <th className="w-10 px-4 py-2.5 text-left">
                      <span className="sr-only">选择</span>
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">合同编码</th>
                    <th className="px-3 py-2.5 text-left font-medium">合同名称</th>
                    <th className="px-3 py-2.5 text-left font-medium">合同类型</th>
                    <th className="px-3 py-2.5 text-left font-medium">相对方</th>
                    <th className="px-3 py-2.5 text-left font-medium">合同金额（元，含税）</th>
                    <th className="px-3 py-2.5 text-left font-medium">合同金额（元，不含税）</th>
                    <th className="px-3 py-2.5 text-left font-medium">合同状态</th>
                    <th className="px-3 py-2.5 text-left font-medium">履约开始时间</th>
                    <th className="px-3 py-2.5 text-left font-medium">履约结束时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projectContracts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-4 py-8 text-center text-gray-400">暂无数据</td>
                    </tr>
                  ) : (
                    projectContracts.map(item => (
                      <tr
                        key={item.id}
                        className={clsx(
                          'transition-colors',
                          !readOnly && 'cursor-pointer hover:bg-blue-50/50',
                          selectedContractId === item.id && 'bg-blue-50'
                        )}
                        onClick={() => !readOnly && handleSelectContract(item.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="radio"
                            name="contract"
                            checked={selectedContractId === item.id}
                            onChange={() => !readOnly && handleSelectContract(item.id)}
                            disabled={readOnly}
                            className="w-4 h-4 text-blue-600"
                          />
                        </td>
                        <td className="px-3 py-3 text-gray-800">{item.code}</td>
                        <td className="px-3 py-3 text-gray-800">{item.name}</td>
                        <td className="px-3 py-3 text-gray-600">{item.type}</td>
                        <td className="px-3 py-3 text-gray-600">{item.groupCustomerName}</td>
                        <td className="px-3 py-3 text-gray-600 text-left">{item.amountWithTax}</td>
                        <td className="px-3 py-3 text-gray-600 text-left">{item.amountWithoutTax}</td>
                        <td className="px-3 py-3 text-gray-600">{item.status}</td>
                        <td className="px-3 py-3 text-gray-600">{item.performanceStartTime}</td>
                        <td className="px-3 py-3 text-gray-600">{item.performanceEndTime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* ========== CT收入计划明细信息模块（补录/详情页面显示） ========== */}
        {isPrefilled && contract && filteredCTOrderPlan[0] && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">CT收入计划明细信息</h3>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-x-10 gap-y-2">
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">合同编码：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800">{contract.code}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">合同名称：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 truncate" title={contract.name}>{contract.name}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">收入计划编码：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800">{filteredCTOrderPlan[0].planCode}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">产品名称：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800">{filteredCTOrderPlan[0].productName}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">税率：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800">{filteredCTOrderPlan[0].taxRate}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">资费名称：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800">{filteredCTOrderPlan[0].tariffName}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">带宽（M）：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800">{filteredCTOrderPlan[0].bandwidth}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">计划订购数量：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 tabular-nums">{filteredCTOrderPlan[0].quantity}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">实际订购数量：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 tabular-nums">{filteredCTOrderPlan[0].actualQuantity}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">计划订购金额：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 tabular-nums">{filteredCTOrderPlan[0].plannedAmount}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">分摊类型：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800">{filteredCTOrderPlan[0].shareType}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">分摊周期：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800">{filteredCTOrderPlan[0].sharePeriod}个月</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">计划订购时间：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800">{filteredCTOrderPlan[0].plannedOrderDate}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">管会产品：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 truncate" title={filteredCTOrderPlan[0].mgmtProduct}>{filteredCTOrderPlan[0].mgmtProduct}</div>
              </div>
              <div className="flex items-center min-h-[28px]">
                <label className="w-28 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">COA科目：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 truncate" title={filteredCTOrderPlan[0].coaSubject}>{filteredCTOrderPlan[0].coaSubject}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========== 计费号码信息模块（补录/详情页面显示） ========== */}
        {isPrefilled && contract && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">计费号码信息</h3>
              <span className="text-xs text-gray-400">【{filteredBillingUsers.length}】</span>
              {!readOnly && (
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowManualBindModal(true)
                      setManualBindSearch({ billingUser: '' })
                      setAppliedManualBindSearch({ billingUser: '' })
                      setSelectedManualBindId('')
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    手工绑定
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenIotBindModal}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    物联网手工绑定
                  </button>
                </div>
              )}
            </div>
            <div className="border border-gray-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500">
                    <th className="px-4 py-2.5 text-left font-medium">计费号码</th>
                    <th className="px-4 py-2.5 text-left font-medium">绑定类型</th>
                    <th className="px-4 py-2.5 text-left font-medium">绑定时间</th>
                    <th className="px-4 py-2.5 text-left font-medium">解绑时间</th>
                    <th className="px-4 py-2.5 text-left font-medium">集团客户编码（实际）</th>
                    <th className="px-4 py-2.5 text-left font-medium">集团客户名称（实际）</th>
                    {!readOnly && <th className="px-4 py-2.5 text-left font-medium w-[140px]">操作</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBillingUsers.length === 0 ? (
                    <tr>
                      <td colSpan={readOnly ? 6 : 7} className="px-4 py-8 text-center text-gray-400">暂无数据</td>
                    </tr>
                  ) : (
                    filteredBillingUsers.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-800 tabular-nums">{item.billingUser}</td>
                        <td className="px-4 py-3">
                          <span className={clsx(
                            'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                            item.bindType === '手动'
                              ? 'bg-orange-50 text-orange-600 border border-orange-200'
                              : 'bg-blue-50 text-blue-600 border border-blue-200'
                          )}>
                            {item.bindType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.bindTime}</td>
                        <td className="px-4 py-3 text-gray-600">{item.unbindTime || '-'}</td>
                        <td className="px-4 py-3 text-gray-600">{item.actualGroupCustCode}</td>
                        <td className="px-4 py-3 text-gray-600 truncate max-w-[240px]" title={item.actualGroupCustName}>{item.actualGroupCustName}</td>
                        {!readOnly && (
                          <td className="px-4 py-3">
                            {item.bindType === '手动' ? (
                              <button
                                type="button"
                                onClick={() => handleUnbindBillingUser(item.id)}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded border border-red-200"
                              >
                                <UserRoundMinus className="w-3 h-3" />
                                解绑
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========== CT产品甩单确认模块（独立白色卡片）：补录/详情模式不展示 ========== */}
        {contract && !isPrefilled && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* 折叠标题栏：蓝色短竖线 + 标题+数量 + Chevron */}
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
                {/* 温馨提示 */}
                <div className="flex items-start gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    只能发起计划订购时间在本月的CT收入计划，如要延迟或提前订购请进行
                    <span
                      className="text-[#1677FF] font-medium cursor-pointer hover:underline mx-0.5"
                      onClick={() => contract && onNavigate?.(`/finance/contract/income-plan-time-adjust-init/${contract.id}`)}
                    >
                      收入计划时间调整
                    </span>
                    ！
                  </p>
                </div>
                {/* CT订购计划表格（第一列复选框+16个业务字段） */}
                <div className="overflow-x-auto">
                  <div className="border border-gray-100 rounded-lg overflow-hidden inline-block min-w-full">
                    <table className="w-full text-sm whitespace-nowrap">
                      <thead className="bg-gray-50">
                        <tr className="text-gray-500">
                          <th className="w-10 px-3 py-2 text-center font-medium">
                            <input
                              type="checkbox"
                              checked={
                                filteredCTOrderPlan.filter(isCTOrderSelectable).length > 0 &&
                                filteredCTOrderPlan.filter(isCTOrderSelectable).every(i => selectedCTOrderIds.has(i.id))
                              }
                              disabled={filteredCTOrderPlan.filter(isCTOrderSelectable).length === 0}
                              onChange={toggleCTOrderSelectAll}
                              className="w-3.5 h-3.5 text-[#1677FF] rounded border-gray-300 focus:ring-[#1677FF] disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </th>
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredCTOrderPlan.length === 0 ? (
                          <tr>
                            <td colSpan={14} className="px-4 py-8 text-center text-gray-400">暂无数据</td>
                          </tr>
                        ) : (
                          filteredCTOrderPlan.map(item => {
                            const selectable = isCTOrderSelectable(item)
                            return (
                              <tr key={item.id} className={clsx(
                                'hover:bg-gray-50/50',
                                selectedCTOrderIds.has(item.id) && 'bg-blue-50/30'
                              )}>
                                <td className="w-10 px-3 py-2.5 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedCTOrderIds.has(item.id)}
                                    disabled={!selectable}
                                    onChange={() => selectable && toggleCTOrderSelect(item.id)}
                                    className="w-3.5 h-3.5 text-[#1677FF] rounded border-gray-300 focus:ring-[#1677FF] disabled:cursor-not-allowed disabled:opacity-40"
                                  />
                                </td>
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
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* ========== 订购信息子模块（内嵌样式） ========== */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                    <span className="text-sm font-semibold text-gray-800">订购信息</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <div className="flex items-start min-h-[36px]">
                        <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2 pr-2">
                          <span className="text-red-500 mr-0.5">*</span>要求完成时间
                        </label>
                        <div className="flex-1 min-w-0">
                          <input
                            type="date"
                            value={orderRequiredDate}
                            onChange={(e) => setOrderRequiredDate(e.target.value)}
                            disabled={readOnly}
                            className={clsx(
                              'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white',
                              orderRequiredDateError ? 'border-red-500' : 'border-gray-300',
                              readOnly && 'bg-gray-50 text-gray-500 cursor-not-allowed'
                            )}
                          />
                          {orderRequiredDateError && (
                            <p className="text-xs text-red-500 mt-1">{orderRequiredDateError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-start min-h-[36px]">
                        <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2 pr-2">
                          <span className="text-red-500 mr-0.5">*</span>订购说明
                        </label>
                        <div className="flex-1 min-w-0">
                          <textarea
                            value={orderDescription}
                            onChange={(e) => setOrderDescription(e.target.value)}
                            disabled={readOnly}
                            rows={4}
                            placeholder="请输入订购说明"
                            className={clsx(
                              'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none',
                              orderDescriptionError ? 'border-red-500' : 'border-gray-300',
                              readOnly && 'bg-gray-50 text-gray-500 cursor-not-allowed'
                            )}
                          />
                          {orderDescriptionError && (
                            <p className="text-xs text-red-500 mt-1">{orderDescriptionError}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ========== 客户信息子模块（内嵌样式，仅展示集团客户信息，不展示账户信息） ========== */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                    <span className="text-sm font-semibold text-gray-800">客户信息</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <div className="flex items-start min-h-[36px]">
                        <label className="w-44 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2 pr-2">
                          <span className="text-red-500 mr-0.5">*</span>集团客户信息
                        </label>
                        <div className="flex-1 min-w-0">
                          <div className="relative">
                            <input
                              type="text"
                              readOnly
                              value={contract ? `${contract.groupCustomerName}（${contract.groupCustomerCode}）` : ''}
                              onClick={handleOpenGroupCustomerModal}
                              placeholder="请选择集团客户信息"
                              className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white text-gray-700 cursor-pointer"
                            />
                            <button
                              type="button"
                              onClick={handleOpenGroupCustomerModal}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-[#1677FF]"
                              title="集团客户信息"
                            >
                              <Search className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}



        {/* ========== 按钮区域 ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              返回
            </button>
          </div>
        </div>

      </div>

      {/* ========== 选择项目弹窗 ========== */}
      {showProjectModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setShowProjectModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[1100px] max-w-[95vw] overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">选择项目</h3>
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 查询条件 */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-20 text-right">项目名称</label>
                  <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="请输入项目名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right">省内项目编码</label>
                  <input
                    type="text"
                    value={searchProvinceCode}
                    onChange={(e) => setSearchProvinceCode(e.target.value)}
                    placeholder="请输入省内项目编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right">全网项目编码</label>
                  <input
                    type="text"
                    value={searchGlobalCode}
                    onChange={(e) => setSearchGlobalCode(e.target.value)}
                    placeholder="请输入全网项目编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 项目列表 */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-full overflow-x-auto">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="w-10 px-4 py-2.5 text-left">
                        <span className="sr-only">选择</span>
                      </th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[180px]">项目名称</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[150px]">省内项目编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[150px]">全网项目编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[100px]">项目类型</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[100px]">签约模式</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[100px]">客户经理</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">解决方案经理</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map(project => (
                        <tr
                          key={project.id}
                          className={clsx(
                            'cursor-pointer hover:bg-blue-50/50 transition-colors',
                            selectedProjectId === project.id && 'bg-blue-50'
                          )}
                          onClick={() => setSelectedProjectId(project.id)}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="radio"
                              name="project"
                              checked={selectedProjectId === project.id}
                              onChange={() => setSelectedProjectId(project.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </td>
                          <td className="px-3 py-3 text-gray-800">{project.name}</td>
                          <td className="px-3 py-3 text-gray-600">{project.code}</td>
                          <td className="px-3 py-3 text-gray-600">{project.globalCode}</td>
                          <td className="px-3 py-3 text-gray-600">{project.type}</td>
                          <td className="px-3 py-3 text-gray-600">{project.signMode}</td>
                          <td className="px-3 py-3 text-gray-600">{project.customerManager}</td>
                          <td className="px-3 py-3 text-gray-600">{project.solutionManager}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowProjectModal(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmProject}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 选择集团客户弹窗 ========== */}
      {showGroupCustomerModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setShowGroupCustomerModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[800px] max-w-[95vw] overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">选择集团客户</h3>
              <button
                type="button"
                onClick={() => setShowGroupCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 查询条件 */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right">集团客户编码</label>
                  <input
                    type="text"
                    value={searchCustomerCode}
                    onChange={(e) => setSearchCustomerCode(e.target.value)}
                    placeholder="请输入集团客户编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right">集团客户名称</label>
                  <input
                    type="text"
                    value={searchCustomerName}
                    onChange={(e) => setSearchCustomerName(e.target.value)}
                    placeholder="请输入集团客户名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 集团客户列表 */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-gray-500">
                    <th className="w-10 px-4 py-2.5 text-left">
                      <span className="sr-only">选择</span>
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">集团客户编码</th>
                    <th className="px-3 py-2.5 text-left font-medium">集团客户名称</th>
                    <th className="px-3 py-2.5 text-left font-medium">全网集团编码</th>
                    <th className="px-3 py-2.5 text-left font-medium">集团客户等级</th>
                    <th className="px-3 py-2.5 text-left font-medium">行业类别</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredGroupCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    filteredGroupCustomers.map(customer => (
                      <tr
                        key={customer.id}
                        className={clsx(
                          'cursor-pointer hover:bg-blue-50/50 transition-colors',
                          selectedGroupCustomerId === customer.id && 'bg-blue-50'
                        )}
                        onClick={() => setSelectedGroupCustomerId(customer.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="radio"
                            name="groupCustomer"
                            checked={selectedGroupCustomerId === customer.id}
                            onChange={() => setSelectedGroupCustomerId(customer.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                        </td>
                        <td className="px-3 py-3 text-gray-800">{customer.code}</td>
                        <td className="px-3 py-3 text-gray-800">{customer.name}</td>
                        <td className="px-3 py-3 text-gray-600">{customer.globalCode}</td>
                        <td className="px-3 py-3 text-gray-600">{customer.level}</td>
                        <td className="px-3 py-3 text-gray-600">{customer.industry}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 底部按钮 */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowGroupCustomerModal(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmGroupCustomer}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 集团产品号码选择弹窗 ========== */}
      {showProductNumberModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setShowProductNumberModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[900px] max-w-[90vw] overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">选择集团产品号码</h3>
              <button
                type="button"
                onClick={() => setShowProductNumberModal(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-28 text-right">集团产品号码</label>
                  <input
                    type="text"
                    value={productNumberSearch.number}
                    onChange={(e) => setProductNumberSearch(prev => ({ ...prev, number: e.target.value }))}
                    placeholder="请输入集团产品号码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-28 text-right">产品名称</label>
                  <select
                    value={productNumberSearch.productName}
                    onChange={(e) => setProductNumberSearch(prev => ({ ...prev, productName: e.target.value }))}
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">全部</option>
                    {productNameOptions.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-gray-500">
                    <th className="w-10 px-4 py-2.5 text-left">
                      <span className="sr-only">选择</span>
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium">集团产品号码</th>
                    <th className="px-3 py-2.5 text-left font-medium">产品编码</th>
                    <th className="px-3 py-2.5 text-left font-medium">产品名称</th>
                    <th className="px-3 py-2.5 text-left font-medium">工单受理时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProductNumbers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                    </tr>
                  ) : (
                    filteredProductNumbers.map(item => (
                      <tr
                        key={item.id}
                        className={clsx(
                          'cursor-pointer hover:bg-blue-50/50 transition-colors',
                          selectedProductNumberId === item.id && 'bg-blue-50'
                        )}
                        onClick={() => setSelectedProductNumberId(item.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="radio"
                            name="productNumber"
                            checked={selectedProductNumberId === item.id}
                            onChange={() => setSelectedProductNumberId(item.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                        </td>
                        <td className="px-3 py-3 text-gray-800">{item.groupProductNumber}</td>
                        <td className="px-3 py-3 text-gray-600">{item.productCode}</td>
                        <td className="px-3 py-3 text-gray-600">{item.productName}</td>
                        <td className="px-3 py-3 text-gray-600">{item.workOrderAcceptTime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowProductNumberModal(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmProductNumber}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 手动绑定弹窗（CT产品订购补录页面使用） ========== */}
      {showManualBindModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setShowManualBindModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[1100px] max-w-[95vw] overflow-hidden flex flex-col"
            style={{ maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">手动绑定</h3>
              <button
                type="button"
                onClick={() => setShowManualBindModal(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 筛选区 */}
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right">计费号码</label>
                  <input
                    type="text"
                    value={manualBindSearch.billingUser}
                    onChange={(e) => setManualBindSearch(prev => ({ ...prev, billingUser: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyManualBindSearch()}
                    placeholder="请输入计费号码"
                    className="flex-1 h-9 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleApplyManualBindSearch}
                    className="inline-flex items-center gap-1.5 h-9 px-5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors shadow-sm"
                  >
                    <Search className="w-4 h-4" />
                    查询
                  </button>
                  <button
                    type="button"
                    onClick={handleResetManualBindSearch}
                    className="inline-flex items-center gap-1.5 h-9 px-5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重置
                  </button>
                </div>
              </div>
            </div>

            {/* 表格区：7列 + 第一列单选 */}
            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="text-gray-500">
                    <th className="w-12 px-4 py-2.5 text-left">
                      <span className="sr-only">选择</span>
                    </th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计费号码</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">集团客户编码（实际）</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">集团客户名称（实际）</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费实例ID</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费生效时间</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费失效时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredManualBindOptions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                        {!appliedManualBindSearch.billingUser
                          ? '请输入查询条件后点击查询'
                          : '未查询到匹配的数据'}
                      </td>
                    </tr>
                  ) : (
                    filteredManualBindOptions.map(item => (
                      <tr
                        key={item.id}
                        className={clsx(
                          'cursor-pointer hover:bg-blue-50/50 transition-colors',
                          selectedManualBindId === item.id && 'bg-blue-50'
                        )}
                        onClick={() => setSelectedManualBindId(item.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="radio"
                            name="manualBind"
                            checked={selectedManualBindId === item.id}
                            onChange={() => setSelectedManualBindId(item.id)}
                            className="w-4 h-4 text-blue-600"
                          />
                        </td>
                        <td className="px-3 py-3 text-gray-800 tabular-nums">{item.billingUser}</td>
                        <td className="px-3 py-3 text-gray-600">{item.actualGroupCustCode}</td>
                        <td className="px-3 py-3 text-gray-600 truncate max-w-[200px]" title={item.actualGroupCustName}>{item.actualGroupCustName}</td>
                        <td className="px-3 py-3 text-gray-600 truncate max-w-[260px]" title={item.tariffName}>{item.tariffName}</td>
                        <td className="px-3 py-3 text-gray-600 font-mono text-xs">{item.tariffInstanceId}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.tariffEffectiveTime}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.tariffExpireTime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 计费号码信息绑定确认模块：仅当勾选一条记录时展示 */}
            {selectedManualBindRecord && (
              <div className="px-5 pt-4 pb-2 border-t border-gray-100 bg-gray-50/50">
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
                    <h4 className="text-sm font-semibold text-gray-800">计费号码信息绑定确认</h4>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-md p-3">
                  <div className="grid grid-cols-3 gap-x-10 gap-y-2">
                    <div className="flex items-center min-h-[28px]">
                      <label className="w-40 text-right text-sm text-gray-600 shrink-0 whitespace-nowrap pr-2">计费号码：</label>
                      <div className="flex-1 min-w-0 text-sm text-gray-800 tabular-nums">{selectedManualBindRecord.option.billingUser}</div>
                    </div>
                    <div className="flex items-center min-h-[28px]">
                      <label className="w-40 text-right text-sm text-gray-600 shrink-0 whitespace-nowrap pr-2">集团客户编码（实际）：</label>
                      <div className="flex-1 min-w-0 text-sm text-gray-800">{selectedManualBindRecord.option.actualGroupCustCode}</div>
                    </div>
                    <div className="flex items-center min-h-[28px]">
                      <label className="w-40 text-right text-sm text-gray-600 shrink-0 whitespace-nowrap pr-2">集团客户名称（实际）：</label>
                      <div className="flex-1 min-w-0 text-sm text-gray-800 truncate" title={selectedManualBindRecord.option.actualGroupCustName}>{selectedManualBindRecord.option.actualGroupCustName}</div>
                    </div>
                    <div className="flex items-center min-h-[28px]">
                      <label className="w-40 text-right text-sm text-gray-600 shrink-0 whitespace-nowrap pr-2">绑定时间：</label>
                      <div className="flex-1 min-w-0 text-sm text-gray-800">{selectedManualBindRecord.bindTime}</div>
                    </div>
                    <div className="flex items-center min-h-[28px]">
                      <label className="w-40 text-right text-sm text-gray-600 shrink-0 whitespace-nowrap pr-2">解绑时间：</label>
                      <div className="flex-1 min-w-0 text-sm text-gray-800">{selectedManualBindRecord.unbindTime}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowManualBindModal(false)
                  setManualBindSearch({ billingUser: '' })
                  setAppliedManualBindSearch({ billingUser: '' })
                  setSelectedManualBindId('')
                }}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmManualBind}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 物联网手工绑定弹窗 ========== */}
      {showIotBindModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setShowIotBindModal(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[560px] max-w-[92vw] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">手工绑定</h3>
              <button
                type="button"
                onClick={() => setShowIotBindModal(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* 计费号码 */}
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">
                  <span className="text-red-500 mr-0.5">*</span>计费号码：
                </label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={iotBillingUser}
                    onChange={(e) => {
                      setIotBillingUser(e.target.value)
                      setIotBillingUserError('')
                    }}
                    placeholder="请输入计费号码"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                  {iotBillingUserError && (
                    <p className="text-xs text-red-500 mt-1">{iotBillingUserError}</p>
                  )}
                </div>
              </div>
              {/* 绑定时间 */}
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">
                  <span className="text-red-500 mr-0.5">*</span>绑定时间：
                </label>
                <div className="flex-1 min-w-0">
                  <input
                    type="date"
                    value={iotBindTime}
                    onChange={(e) => {
                      setIotBindTime(e.target.value)
                      setIotBindTimeError('')
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                  {iotBindTimeError && (
                    <p className="text-xs text-red-500 mt-1">{iotBindTimeError}</p>
                  )}
                </div>
              </div>
              {/* 解绑时间（自动计算，固定不可修改） */}
              <div className="flex items-center min-h-[36px]">
                <label className="w-28 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-3">
                  <span className="text-red-500 mr-0.5">*</span>解绑时间：
                </label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {iotUnbindTime || '-'}
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowIotBindModal(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmIotBind}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 解绑确认弹框 ========== */}
      {confirmUnbind.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[420px] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">解绑确认</h3>
              <button
                type="button"
                onClick={() => setConfirmUnbind({ open: false, id: '' })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  请确认要解绑计费号码与CT收入计划的关系吗？
                </p>
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmUnbind({ open: false, id: '' })}
                className="px-5 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={confirmUnbindAction}
                className="px-5 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
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