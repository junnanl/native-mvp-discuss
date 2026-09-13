import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  RotateCcw,
  FileText,
  ChevronRight,
  ChevronDown,
  Upload,
  X
} from 'lucide-react'
import { useModal } from '@/components/Modal'
import { getContractInfo } from '@/data/mock'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import IncomeITSection from '@/components/plan-modules/IncomeITSection'
import IncomeCTSection from '@/components/plan-modules/IncomeCTSection'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import type { ITIncomeRow, CTIncomeRow } from '@/components/plan-modules/types'

interface DeliverTaskRow {
  id: string
  taskType: string
  taskName: string
  deliverStartDate: string
  deliverEndDate: string
  address: string
  handler: string
}

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

interface ForwardOrderPlanChangeProps {
  onNavigate?: (path: string) => void
  orderId?: string
}

const orderStatusMap: Record<string, string> = {
  'pending-parse': '待解析',
  'pending-approval': '待审批',
  'approving': '审批中',
  'approval-rejected': '审批不通过',
  'approval-passed': '审批通过'
}

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
    status: 'approval-passed',
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
    status: 'approval-passed',
    customerManager: '李明',
    orderOwner: '孙磊',
    createTime: '2026-06-02 10:00:00'
  }
]

const originalITIncome: ITIncomeRow[] = [
  {
    id: 'it-orig-1',
    productName: '维保费',
    tariffName: '[849]ICT维保服务费',
    mgmtProductCode: 'P1234',
    mgmtProductName: 'ICT维保服务',
    thirdLevelSubject: 'S123',
    coaSubject: 'C5678',
    taxRate: '6%',
    isFixedRate: '是',
    plannedIncome: '500,000',
    plannedTariffAmount: '500,000',
    contractStage: '初验',
    billingShareType: '月',
    billingSharePeriod: '12',
    isContractAsset: '否',
    plannedOrderDate: '2026-07-01',
    billingStartDate: '2026-07'
  },
  {
    id: 'it-orig-2',
    productName: '设备费',
    tariffName: '[956]软件开发服务',
    mgmtProductCode: 'P2345',
    mgmtProductName: '软件开发服务',
    thirdLevelSubject: 'S234',
    coaSubject: 'C956-01',
    taxRate: '13%',
    isFixedRate: '是',
    plannedIncome: '2,000,000',
    plannedTariffAmount: '2,000,000',
    contractStage: '到货',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '否',
    plannedOrderDate: '2026-08-01',
    billingStartDate: '2026-08'
  }
]

const originalCTIncome: CTIncomeRow[] = [
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

function calculateTotal(list: any[], field = 'plannedIncome'): number {
  return list.reduce((acc, curr) => {
    const n = parseFloat(String(curr[field]).replace(/,/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)
}

export default function ForwardOrderPlanChange({ onNavigate, orderId }: ForwardOrderPlanChangeProps) {
  const modal = useModal()

  const order = mockForwardOrders.find(o => o.id === orderId) || mockForwardOrders[0]
  const contractInfo = getContractInfo(order.contractId)

  const originalTotalIT = calculateTotal(originalITIncome, 'plannedIncome')
  const originalTotalCT = calculateTotal(originalCTIncome, 'plannedIncome')
  const originalTotal = originalTotalIT + originalTotalCT

  const [trailExpanded, setTrailExpanded] = useState(false)

  const trailData = [
    { time: '2026-07-15 10:30:00', actor: '张三', action: '提交合同解析申请' },
    { time: '2026-07-15 14:20:00', actor: '李四', action: '审批通过，流转至计划变更环节' }
  ]

  const [uploadedFile, setUploadedFile] = useState<{ id: string; name: string; size: string; time: string } | null>({
    id: 'file-1',
    name: '合同附件.pdf',
    size: '256.5 KB',
    time: '2026-07-15 10:30:00'
  })
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allFiles = Array.from(e.target.files || [])
    const pdfFiles = allFiles.filter(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf')
    if (allFiles.length !== pdfFiles.length) {
      alert('仅支持上传 PDF 格式文件')
    }
    if (pdfFiles.length === 0) return
    const file = pdfFiles[0]
    setUploadedFile({
      id: `file-${Date.now()}`,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      time: new Date().toLocaleString()
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const allFiles = Array.from(e.dataTransfer.files || [])
    const pdfFiles = allFiles.filter(f => /\.pdf$/i.test(f.name) || f.type === 'application/pdf')
    if (allFiles.length !== pdfFiles.length) {
      alert('仅支持上传 PDF 格式文件')
    }
    if (pdfFiles.length === 0) return
    const file = pdfFiles[0]
    setUploadedFile({
      id: `file-${Date.now()}`,
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      time: new Date().toLocaleString()
    })
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
  }

  const [itIncomeList, setItIncomeList] = useState<ITIncomeRow[]>([
    {
      id: 'it-new-1',
      productName: '维保费',
      tariffName: '[849]ICT维保服务费',
      mgmtProductCode: 'P1234',
      mgmtProductName: 'ICT维保服务',
      thirdLevelSubject: 'S123',
      coaSubject: 'C5678',
      taxRate: '6%',
      isFixedRate: '是',
      plannedIncome: '500,000',
      plannedTariffAmount: '500,000',
      contractStage: '初验',
      billingShareType: '月',
      billingSharePeriod: '12',
      isContractAsset: '否',
      plannedOrderDate: '2026-07-01',
      billingStartDate: '2026-07',
      paymentPlans: [
        { id: 'plan-it-1', milestone: '初验', amount: '500,000.00', paymentDate: '2026-07-01', transferDate: '' }
      ]
    },
    {
      id: 'it-new-2',
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
      billingStartDate: '2026-08',
      paymentPlans: [
        { id: 'plan-it-2', milestone: '到货', amount: '2,000,000.00', paymentDate: '2026-08-01', transferDate: '' }
      ]
    }
  ])

  const [ctIncomeList, setCtIncomeList] = useState<CTIncomeRow[]>([
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
  ])

  const [changeRemark, setChangeRemark] = useState('')
  const [approver, setApprover] = useState('')
  const [remarkError, setRemarkError] = useState('')

  const totalITIncome = calculateTotal(itIncomeList, 'plannedIncome')
  const totalCTIncome = calculateTotal(ctIncomeList, 'plannedIncome')
  const newTotal = totalITIncome + totalCTIncome

  const ctTaskList: DeliverTaskRow[] = []
  const itTaskList: DeliverTaskRow[] = []

  const handleSubmit = () => {
    const errors: string[] = []
    if (!changeRemark.trim()) {
      errors.push('请填写变更说明')
    } else if (changeRemark.length > 250) {
      errors.push('变更说明不能超过250字')
    }
    if (!approver) {
      errors.push('请选择下一步环节审批人')
    }
    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }
    modal.confirm('确定提交审批吗？', '提交审批').then(ok => {
      if (ok) {
        alert('提交审批成功')
        onNavigate?.('/finance/contract/order/forward')
      }
    })
  }

  const handleCancel = () => {
    onNavigate?.('/finance/contract/order/forward')
  }

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length <= 250) {
      setChangeRemark(val)
      setRemarkError('')
    }
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
            <h2 className="text-sm font-semibold text-gray-800">前向订单计划变更</h2>
          </div>
        </div>

        {/* 1. 项目信息 */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 合同信息 */}
        <ContractInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 3. 合同附件 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">附件</h3>
          </div>
          <div className="p-4">
            {!uploadedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver ? 'border-[#1677FF] bg-blue-50/50' : 'border-gray-200'
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  将文件拖拽到此处，或
                  <label className="text-[#1677FF] cursor-pointer hover:underline">
                    点击上传
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-400">仅支持 PDF 格式文件，仅可上传一个文件</p>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-[#1677FF]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm text-gray-800 truncate">{uploadedFile.name}</div>
                    <div className="text-xs text-gray-400">{uploadedFile.size} · {uploadedFile.time}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="px-3 py-1 text-xs text-gray-600 hover:text-[#1677FF] hover:bg-blue-50 rounded transition-colors"
                  >
                    重新上传
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. 订单信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">订单信息</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              <InfoField label="订单编号" value={order.orderCode} />
              <InfoField label="合同编码" value={order.contractCode} />
              <InfoField label="合同名称" value={order.contractName} />
              <InfoField label="订单金额（元，不含税）" value={order.amountExcludingTax} />
              <InfoField label="订单金额（元，含税）" value={order.amountIncludingTax} />
              <InfoField label="订单状态" value={orderStatusMap[order.status] || order.status} />
              <InfoField label="客户经理" value={order.customerManager} />
              <InfoField label="订单负责人" value={order.orderOwner} />
              <InfoField label="创建时间" value={order.createTime} />
            </div>
          </div>
        </div>

        {/* 3. 原收入计划 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">原收入计划</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-2">合同总收入（元,含税）：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 font-medium">
                  {originalTotal.toLocaleString()} 元
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-2">IT收入（元,含税）：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 font-medium">
                  {originalTotalIT.toLocaleString()} 元
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-2">CT收入（元,含税）：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800 font-medium">
                  {originalTotalCT.toLocaleString()} 元
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-2">收入计划状态：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-800">
                  <span className="px-2 py-0.5 rounded text-xs bg-green-50 text-green-600">已生效</span>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-2">解析时间：</label>
                <div className="flex-1 min-w-0 text-sm text-gray-700">
                  2026-06-15 10:30:00
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. 新收入计划 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">新收入计划</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-2">合同总收入（元,含税）：</label>
                <div className="flex-1 min-w-0 text-sm text-[#1677FF] font-medium">
                  {newTotal.toLocaleString()} 元
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-2">IT收入（元,含税）：</label>
                <div className="flex-1 min-w-0 text-sm text-[#1677FF] font-medium">
                  {totalITIncome.toLocaleString()} 元
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pr-2">CT收入（元,含税）：</label>
                <div className="flex-1 min-w-0 text-sm text-[#1677FF] font-medium">
                  {totalCTIncome.toLocaleString()} 元
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-start gap-3">
                <label className="w-40 text-right text-sm text-gray-700 shrink-0 pt-2">
                  <span className="text-red-500 mr-0.5">*</span>
                  变更说明
                </label>
                <div className="flex-1 min-w-0">
                  <textarea
                    value={changeRemark}
                    onChange={handleRemarkChange}
                    placeholder="请输入变更说明，最多250字"
                    rows={3}
                    maxLength={250}
                    className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none ${
                      remarkError ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between mt-1">
                    {remarkError && <span className="text-xs text-red-500">{remarkError}</span>}
                    <span className="text-xs text-gray-400 ml-auto">{changeRemark.length}/250</span>
                  </div>
                </div>
              </div>
            </div>
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

        {/* 5. 计划信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">计划信息</h3>
          </div>
          <div className="p-4 space-y-4">
            <IncomeITSection
              value={itIncomeList}
              onChange={setItIncomeList}
            />
            <IncomeCTSection
              value={ctIncomeList}
              onChange={setCtIncomeList}
            />
          </div>
        </div>

        {/* 6. 项目任务交付计划 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">项目任务交付计划</h3>
          </div>
          <div className="p-4 space-y-4">
            {/* CT类 */}
            <div className="border border-gray-100 rounded-lg">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-b border-gray-100 rounded-t-lg">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-semibold text-gray-800">CT类</span>
                  <span className="text-gray-400">【{ctTaskList.length}】</span>
                </div>
              </div>
              <div className="p-3">
                {ctTaskList.length === 0 ? (
                  <div className="py-3 text-center text-sm text-gray-400 bg-gray-50/30 rounded-md border border-dashed border-gray-200">
                    <FileText className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                    <span className="text-xs">暂无数据，与项目实际交付任务关联</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-100 rounded-md">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs">
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">任务类型</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">任务名称</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">交付开始时间</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">交付结束时间</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划任务处理地址</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">负责人</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ctTaskList.map((row, idx) => (
                          <tr key={idx} className="border-t border-gray-100">
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.taskType || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.taskName || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.deliverStartDate || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.deliverEndDate || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.address || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.handler || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* IT类 */}
            <div className="border border-gray-100 rounded-lg">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-b border-gray-100 rounded-t-lg">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-semibold text-gray-800">IT类</span>
                  <span className="text-gray-400">【{itTaskList.length}】</span>
                </div>
              </div>
              <div className="p-3">
                {itTaskList.length === 0 ? (
                  <div className="py-3 text-center text-sm text-gray-400 bg-gray-50/30 rounded-md border border-dashed border-gray-200">
                    <FileText className="w-6 h-6 mx-auto mb-1 text-gray-300" />
                    <span className="text-xs">暂无数据，与项目实际交付任务关联</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-gray-100 rounded-md">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs">
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">任务类型</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">任务名称</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">交付开始时间</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">交付结束时间</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划任务处理地址</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">负责人</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itTaskList.map((row, idx) => (
                          <tr key={idx} className="border-t border-gray-100">
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.taskType || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.taskName || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.deliverStartDate || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.deliverEndDate || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.address || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.handler || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 7. 下一步 */}
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
