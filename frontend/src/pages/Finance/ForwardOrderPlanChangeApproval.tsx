import { useState, Fragment } from 'react'
import {
  ArrowLeft,
  Check,
  RotateCcw,
  FileText,
  Search,
  Upload,
  Eye,
  ChevronRight,
  ChevronDown
} from 'lucide-react'
import ContractAttachments from '@/components/ContractAttachments'
import ProcessTrail from '@/components/ProcessTrail'
import { useModal } from '@/components/Modal'
import { getContractInfo } from '@/data/mock'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import SectionBlock from '@/components/plan-modules/common/SectionBlock'
import type { ITIncomeRow, CTIncomeRow } from '@/components/plan-modules/types'
import { calculateExcludingTax } from '@/lib/utils'

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

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = '请选择',
  disabled = false
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')

  const filtered = options.filter(o =>
    o.toLowerCase().includes(keyword.toLowerCase())
  )

  return (
    <div className="relative">
      <div
        className={
          'flex items-center w-full px-3 py-2 text-sm border rounded-md bg-white ' +
          (disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed text-gray-500'
            : 'border-gray-300 cursor-pointer hover:border-blue-400')
        }
        onClick={() => {
          if (disabled) return
          setOpen(!open)
        }}
      >
        <span className={value ? 'text-gray-800 flex-1' : 'text-gray-400 flex-1'}>
          {value || placeholder}
        </span>
        <Search className="w-3.5 h-3.5 text-gray-400" />
      </div>
      {open && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => { setOpen(false); setKeyword('') }} />
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="搜索..."
                className="flex-1 text-sm outline-none bg-transparent"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-44">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-center text-gray-400">无匹配项</div>
              ) : (
                filtered.map((opt, idx) => (
                  <div
                    key={idx}
                    className={
                      'px-3 py-2 text-sm cursor-pointer ' +
                      (opt === value
                        ? 'bg-blue-50 text-[#1677FF]'
                        : 'hover:bg-gray-50 text-gray-700')
                    }
                    onClick={() => {
                      onChange(opt)
                      setOpen(false)
                      setKeyword('')
                    }}
                  >
                    {opt}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

interface ForwardOrderPlanChangeApprovalProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

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
    budgetTariffAmount: '480,000',
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
    budgetTariffAmount: '1,900,000',
    contractStage: '到货',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '是',
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

const newITIncome: ITIncomeRow[] = [
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
    plannedIncome: '600,000',
    budgetTariffAmount: '580,000',
    contractStage: '初验',
    billingShareType: '月',
    billingSharePeriod: '12',
    isContractAsset: '否',
    plannedOrderDate: '2026-07-01',
    billingStartDate: '2026-07'
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
    plannedIncome: '2,200,000',
    budgetTariffAmount: '2,100,000',
    contractStage: '到货',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '是',
    plannedOrderDate: '2026-08-01',
    billingStartDate: '2026-08'
  },
  {
    id: 'it-new-3',
    productName: '平台使用费',
    tariffName: '[789]平台技术服务费',
    mgmtProductCode: 'P5678',
    mgmtProductName: '平台技术服务',
    thirdLevelSubject: 'S567',
    coaSubject: 'C789-01',
    taxRate: '6%',
    isFixedRate: '是',
    plannedIncome: '300,000',
    budgetTariffAmount: '280,000',
    contractStage: '项目上线',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '否',
    plannedOrderDate: '2026-09-01',
    billingStartDate: '2026-09'
  }
]

const newCTIncome: CTIncomeRow[] = [
  {
    id: 'ct-demo-1-new',
    productName: '企业宽带',
    productCode: 'CT-B003',
    productFullName: '企业宽带1000M',
    packageName: '企业套餐',
    bandwidth: '1000',
    orderQuantity: '50',
    tariffName: '[1372]宽带费',
    plannedIncome: '1,320,000',
    plannedTariffAmount: '1,320,000',
    budgetTariffAmount: '1,210,000',
    taxRate: '6%',
    discount: '86',
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
    id: 'ct-demo-2-new',
    productName: '数据专线',
    productCode: 'CT-D002',
    productFullName: '数据专线尊享版',
    packageName: '尊享套餐',
    bandwidth: '500',
    orderQuantity: '20',
    tariffName: '[1205]专线费',
    plannedIncome: '3,168,000',
    plannedTariffAmount: '3,168,000',
    budgetTariffAmount: '2,860,000',
    taxRate: '9%',
    discount: '91',
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
    id: 'ct-demo-3-new',
    productName: '语音',
    productCode: 'CT-V001',
    productFullName: '语音基础服务',
    packageName: '基础套餐',
    bandwidth: '',
    orderQuantity: '300',
    tariffName: '[849]融合通信费',
    plannedIncome: '396,000',
    plannedTariffAmount: '396,000',
    budgetTariffAmount: '352,000',
    taxRate: '6%',
    discount: '81',
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
    id: 'ct-demo-4-new',
    productName: '云计算',
    productCode: 'CT-C001',
    productFullName: '云主机基础型',
    packageName: '云服务套餐',
    bandwidth: '',
    orderQuantity: '10',
    tariffName: '[956]云服务费用',
    plannedIncome: '528,000',
    plannedTariffAmount: '528,000',
    budgetTariffAmount: '495,000',
    taxRate: '6%',
    discount: '89',
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
    id: 'ct-demo-5-new',
    productName: '互联网专线',
    productCode: 'CT-INT001',
    productFullName: '互联网专线标准版',
    packageName: '互联网套餐',
    bandwidth: '200',
    orderQuantity: '5',
    tariffName: '[1205]专线费',
    plannedIncome: '990,000',
    plannedTariffAmount: '990,000',
    budgetTariffAmount: '880,000',
    taxRate: '9%',
    discount: '93',
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

const groupByProductName = <T extends { productName: string }>(list: T[]): { productName: string; rows: T[] }[] => {
  const groups: Record<string, T[]> = {}
  list.forEach(row => {
    if (!groups[row.productName]) {
      groups[row.productName] = []
    }
    groups[row.productName].push(row)
  })
  return Object.entries(groups).map(([productName, rows]) => ({ productName, rows }))
}

export default function ForwardOrderPlanChangeApproval({ onNavigate, contractId }: ForwardOrderPlanChangeApprovalProps) {
  const modal = useModal()

  const contractInfo = getContractInfo(contractId || 'CT2026060001')

  const [originalItIncomeList] = useState<ITIncomeRow[]>(originalITIncome)
  const [originalCtIncomeList] = useState<CTIncomeRow[]>(originalCTIncome)
  const [newItIncomeList] = useState<ITIncomeRow[]>(newITIncome)
  const [newCtIncomeList] = useState<CTIncomeRow[]>(newCTIncome)

  const [itIncomeViewingPlans, setItIncomeViewingPlans] = useState<ITIncomeRow | null>(null)

  const [beforePlanExpanded, setBeforePlanExpanded] = useState(true)
  const [afterPlanExpanded, setAfterPlanExpanded] = useState(true)

  const [approver, setApprover] = useState('')
  const [approvalResult, setApprovalResult] = useState<'approved' | 'rejected'>('approved')
  const [approvalComment, setApprovalComment] = useState('通过')

  const trailData = [
    { time: '2026-07-20 09:00:00', actor: '张三', action: '提交收入计划调整申请' },
    { time: '2026-07-20 14:30:00', actor: '李四', action: '确认与补充完成' },
    { time: '2026-07-21 10:15:00', actor: '王五', action: '审批中' }
  ]

  const handleApprovalResultChange = (value: 'approved' | 'rejected') => {
    setApprovalResult(value)
    setApprovalComment(value === 'approved' ? '通过' : '')
  }

  const handleSubmit = () => {
    if (!approvalComment.trim()) {
      alert('请填写审批意见')
      return
    }
    if (approvalResult === 'rejected' && !approver) {
      alert('请选择下一步处理人')
      return
    }
    modal.confirm('确定提交吗？', '提交').then(ok => {
      if (ok) {
        alert('提交成功')
        onNavigate?.('/finance/contract/query')
      }
    })
  }

  const handleCancel = () => {
    onNavigate?.('/finance/contract/query')
  }

  const changeRemark = '因客户业务需求调整，原合同中IT收入计划的产品目录及金额需进行变更。其中维保费金额由原50万元调整为60万元，设备费由原200万元调整为220万元，同时新增一项平台使用费收入项。CT收入计划中宽带产品订购数量由50调整为80，相应概算收入金额同步调整。变更后总收入金额增加约30万元，已附相关证明材料，请审批。'
  const proofFiles = ['合肥市工商银行智能监控系统实施变更证明.doc']

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
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
            <h2 className="text-sm font-semibold text-gray-800">收入计划调整审批</h2>
          </div>
        </div>

        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        <ContractInfoCard contractInfo={contractInfo} defaultExpanded={true} />

        {/* 合同附件 */}
        <ContractAttachments attachments={contractInfo.attachments} />

        {/* 流程轨迹 */}
        <ProcessTrail trail={trailData} />

        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
            onClick={() => setBeforePlanExpanded(v => !v)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">变更前计划信息</h3>
            {beforePlanExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
              : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
            }
          </div>
          {beforePlanExpanded && (
            <div className="p-4 space-y-4">
              <SectionBlock
                title="IT收入计划"
                count={originalItIncomeList.length}
            >
              <div className="overflow-x-auto border border-gray-100 rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                      <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">是否合同资产</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">订购状态</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupByProductName(originalItIncomeList).map((group) => {
                      const rowCount = group.rows.length
                      return (
                        <Fragment key={group.productName}>
                          {group.rows.map((row, idx) => (
                            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                              {idx === 0 && (
                                <>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.productName}</td>
                                  <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].plannedIncome}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].taxRate}</td>
                                </>
                              )}
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffAmount || '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                {row.billingShareType === '一次性' ? (
                                  <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${row.isContractAsset === '是' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>{row.isContractAsset}</span>
                                ) : '-'}
                              </td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-orange-50 text-orange-600">待订购</span>
                              </td>
                              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                <button onClick={() => setItIncomeViewingPlans(row)} className="px-2 py-1 text-xs text-[#1677FF] hover:underline">回款计划</button>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end items-center gap-6">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{originalItIncomeList.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{originalItIncomeList.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || r.plannedTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{originalItIncomeList.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="CT收入计划"
              count={originalCtIncomeList.length}
            >
              <div className="overflow-x-auto border border-gray-100 rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品类型</th>
                      <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">带宽（M）</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购数量</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额（不含税）</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">订购状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupByProductName(originalCtIncomeList).map((group) => {
                      const rowCount = group.rows.length
                      return (
                        <Fragment key={group.productName}>
                          {group.rows.map((row, idx) => (
                            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                              {idx === 0 && (
                                <>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.productName}</td>
                                  <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].plannedIncome}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].taxRate}</td>
                                </>
                              )}
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.productFullName ? `【${row.productCode || '-'}】${row.productFullName}` : '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.bandwidth}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.orderQuantity}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffAmount || '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, row.taxRate) : '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-orange-50 text-orange-600">待订购</span>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end items-center gap-6">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{originalCtIncomeList.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{originalCtIncomeList.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || r.plannedTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{originalCtIncomeList.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                </div>
              </div>
            </SectionBlock>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
            onClick={() => setAfterPlanExpanded(v => !v)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">变更后计划信息</h3>
            {afterPlanExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
              : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
            }
          </div>
          {afterPlanExpanded && (
            <div className="p-4 space-y-4">
            <SectionBlock
              title="IT收入计划"
              count={newItIncomeList.length}
            >
              <div className="overflow-x-auto border border-gray-100 rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                      <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">是否合同资产</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">订购状态</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupByProductName(newItIncomeList).map((group) => {
                      const rowCount = group.rows.length
                      return (
                        <Fragment key={group.productName}>
                          {group.rows.map((row, idx) => (
                            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                              {idx === 0 && (
                                <>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.productName}</td>
                                  <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].plannedIncome}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].taxRate}</td>
                                </>
                              )}
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffAmount || '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                {row.billingShareType === '一次性' ? (
                                  <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${row.isContractAsset === '是' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-500'}`}>{row.isContractAsset}</span>
                                ) : '-'}
                              </td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-orange-50 text-orange-600">待订购</span>
                              </td>
                              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                <button onClick={() => setItIncomeViewingPlans(row)} className="px-2 py-1 text-xs text-[#1677FF] hover:underline">回款计划</button>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end items-center gap-6">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{newItIncomeList.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{newItIncomeList.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || r.plannedTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{newItIncomeList.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                </div>
              </div>
            </SectionBlock>

            <SectionBlock
              title="CT收入计划"
              count={newCtIncomeList.length}
            >
              <div className="overflow-x-auto border border-gray-100 rounded-md">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 text-xs">
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品类型</th>
                      <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">带宽（M）</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购数量</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额（不含税）</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                      <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">订购状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupByProductName(newCtIncomeList).map((group) => {
                      const rowCount = group.rows.length
                      return (
                        <Fragment key={group.productName}>
                          {group.rows.map((row, idx) => (
                            <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                              {idx === 0 && (
                                <>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.productName}</td>
                                  <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].plannedIncome}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].taxRate}</td>
                                </>
                              )}
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.productFullName ? `【${row.productCode || '-'}】${row.productFullName}` : '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.bandwidth}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.orderQuantity}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffAmount || '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, row.taxRate) : '-'}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                              <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                <span className="inline-flex px-2 py-0.5 text-xs rounded-full bg-orange-50 text-orange-600">待订购</span>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end items-center gap-6">
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{newCtIncomeList.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{newCtIncomeList.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || r.plannedTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 whitespace-nowrap">
                  <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                  <span className="text-base font-semibold text-[#1677FF]">¥{newCtIncomeList.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                </div>
              </div>
            </SectionBlock>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">变更信息</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <label className="w-40 text-right text-sm text-gray-700 shrink-0 pt-2 whitespace-nowrap pr-2">
                <span className="text-red-500 mr-0.5">*</span>
                变更说明
              </label>
              <div className="flex-1 min-w-0">
                <div className="px-3 py-2 text-sm text-gray-700 leading-relaxed">
                  {changeRemark}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <label className="w-40 text-right text-sm text-gray-700 shrink-0 pt-2 whitespace-nowrap pr-2">
                <span className="text-red-500 mr-0.5">*</span>
                证明材料
              </label>
              <div className="flex-1 min-w-0">
                <div className="space-y-1.5">
                  {proofFiles.map((fileName, idx) => (
                    <div
                      key={`${fileName}-${idx}`}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-md bg-white text-sm"
                    >
                      <FileText className="w-4 h-4 text-gray-500 shrink-0" />
                      <span className="flex-1 truncate text-gray-700" title={fileName}>{fileName}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-[#1668DD]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          预览
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-[#1668DD]"
                        >
                          <Upload className="w-3.5 h-3.5 rotate-180" />
                          下载
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

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
                      onClick={() => handleApprovalResultChange('approved')}
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
                      onClick={() => handleApprovalResultChange('rejected')}
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
                        收入计划调整
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 mt-1">下一步处理人</label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                          合同解析人员
                        </span>
                        <div className="flex-1 min-w-0">
                          <SearchableSelect
                            value={approver}
                            onChange={setApprover}
                            options={approverOptions}
                            placeholder="请选择下一步处理人"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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