import { useState } from 'react'
import {
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Search,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  Upload,
  X
} from 'lucide-react'
import ContractAttachments from '@/components/ContractAttachments'
import { useModal } from '@/components/Modal'
import { getContractInfo } from '@/data/mock'
import IncomeCTSection from '@/components/plan-modules/IncomeCTSection'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import SectionBlock from '@/components/plan-modules/common/SectionBlock'
import PaymentPlansDisplay from '@/components/plan-modules/common/PaymentPlansDisplay'
import ModalShell from '@/components/plan-modules/common/ModalShell'
import ModalFooter from '@/components/plan-modules/common/ModalFooter'
import FormRow from '@/components/plan-modules/common/FormRow'
import DateInput from '@/components/plan-modules/common/DateInput'
import MonthPicker from '@/components/plan-modules/common/MonthPicker'
import PaymentPlanSection, { validatePaymentPlans, defaultMilestones } from '@/components/PaymentPlanSection'
import type { ITIncomeRow, CTIncomeRow } from '@/components/plan-modules/types'
import { calculateExcludingTax } from '@/lib/utils'
import {
  ctProductTypeProductNameMap,
  ctProductNameTariffMap,
  parseCtProductName,
  isCtBandwidthRequired
} from '@/components/plan-modules/constants'


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




// ============================================================
// 通用表格组件
// ============================================================
function DataTable({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  readOnly = false,
  expandedRowRender
}: {
  columns: { key: string; label: string; width?: string; suffix?: string }[]
  data: any[]
  onEdit?: (row: any) => void
  onDelete?: (row: any) => void
  onView?: (row: any) => void
  readOnly?: boolean
  expandedRowRender?: (row: any) => React.ReactNode
}) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleExpand = (idx: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(idx.toString())) {
        next.delete(idx.toString())
      } else {
        next.add(idx.toString())
      }
      return next
    })
  }

  if (data.length === 0) {
    return (
      <div className="py-6 text-center text-sm text-gray-400 bg-gray-50/30 rounded-md border border-dashed border-gray-200">
        {readOnly ? '暂无数据' : '暂无数据，点击右上方"新增"按钮添加'}
      </div>
    )
  }

  const hasActions = !readOnly && (onEdit || onDelete || onView)
  const hasExpand = !!expandedRowRender

  return (
    <div className="overflow-x-auto border border-gray-100 rounded-md">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs">
            {hasExpand && <th className="px-2 py-2.5 w-8"></th>}
            {columns.map(col => (
              <th
                key={col.key}
                className="px-3 py-2.5 text-left font-medium whitespace-nowrap"
                style={col.width ? { minWidth: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
            {hasActions && (
              <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap sticky right-0 bg-gray-50">
                操作
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <>
              <tr key={idx} className="border-t border-gray-100 hover:bg-gray-50/50">
                {hasExpand && (
                  <td className="px-2 py-2.5">
                    {expandedRowRender(row) && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(idx)}
                        className="p-1 text-gray-400 hover:text-[#1677FF]"
                      >
                        {expandedRows.has(idx.toString()) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                    {row[col.key] ? `${row[col.key]}${col.suffix || ''}` : '-'}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-3 py-2.5 text-center whitespace-nowrap sticky right-0 bg-white">
                    <div className="inline-flex items-center gap-1">
                      {onView && (
                        <button
                          type="button"
                          onClick={() => onView(row)}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-[#1677FF]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(row)}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-[#1677FF]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(row)}
                          className="px-2 py-1 text-xs text-gray-600 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
              {hasExpand && expandedRows.has(idx.toString()) && expandedRowRender(row) && (
                <tr key={`${idx}-expanded`}>
                  <td colSpan={columns.length + (hasExpand ? 1 : 0) + (hasActions ? 1 : 0)} className="px-8 py-3 bg-gray-50/50">
                    {expandedRowRender(row)}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}

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

interface IncomePlanTimeAdjustInitProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

const extractProductNames = <T extends { productName?: string }>(list: T[]): string[] => {
  return [...new Set(list.map(r => r.productName).filter((v): v is string => !!v))]
}

const extractIds = <T extends { id: string }>(list: T[]): string[] => {
  return list.map(r => r.id)
}

export default function IncomePlanTimeAdjustInit({ onNavigate, contractId }: IncomePlanTimeAdjustInitProps) {
  const modal = useModal()

  const contractInfo = getContractInfo(contractId || 'CT2026060006')

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
      budgetTariffAmount: '480,000',
      contractStage: '初验',
      billingShareType: '月',
      billingSharePeriod: '12',
      isContractAsset: '否',
      plannedOrderDate: '2026-07-01',
      billingStartDate: '2026-07',
      paymentPlans: [
        { id: 'pp-it-1-1', milestone: '项目开工', amount: '40,000', paymentDate: '2026-07-25', transferDate: '2026-08-10' },
        { id: 'pp-it-1-2', milestone: '到货', amount: '40,000', paymentDate: '2026-08-25', transferDate: '2026-09-10' }
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
      budgetTariffAmount: '1,900,000',
      contractStage: '到货',
      billingShareType: '一次性',
      billingSharePeriod: '1',
      isContractAsset: '是',
      plannedOrderDate: '2026-08-01',
      billingStartDate: '2026-08',
      paymentPlans: [
        { id: 'pp-it-2-1', milestone: '到货', amount: '1,900,000', paymentDate: '2026-09-15', transferDate: '2026-10-30' }
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

  const [allowedITProductNames, setAllowedITProductNames] = useState<string[]>(extractProductNames(itIncomeList))
  const [allowedCTProductNames, setAllowedCTProductNames] = useState<string[]>(extractProductNames(ctIncomeList))

  const [undeletableITIncomeIds, setUndeletableITIncomeIds] = useState<string[]>(extractIds(itIncomeList))
  const [undeletableCTIncomeIds, setUndeletableCTIncomeIds] = useState<string[]>(extractIds(ctIncomeList))

  const [afterPlanExpanded, setAfterPlanExpanded] = useState(true)

  const [itIncomeModalState, setItIncomeModalState] = useState<{
    visible: boolean
    editingRow: ITIncomeRow | null
    productName?: string
    isNew: boolean
  }>({ visible: false, editingRow: null, isNew: false })
  const [approver, setApprover] = useState('')
  const [changeRemark, setChangeRemark] = useState('')
  const [remarkError, setRemarkError] = useState('')
  const [proofFiles, setProofFiles] = useState<string[]>([])
  const approverOptions = [
    '张三（解决方案经理）',
    '李四（解决方案经理）',
    '王五（解决方案经理）',
    '赵六（解决方案经理）',
    '钱七（解决方案经理）',
    '孙八（解决方案经理）',
    '周九（解决方案经理）',
    '吴十（解决方案经理）',
    '郑一（解决方案经理）',
    '冯二（解决方案经理）'
  ]
  const [itIncomeViewingPlans, setItIncomeViewingPlans] = useState<ITIncomeRow | null>(null)
  const [itIncomePaymentPlans, setItIncomePaymentPlans] = useState<{ id: string; milestone: string; amount: string; paymentDate: string; transferDate: string }[]>([])

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

  const openItIncomeModal = (row?: ITIncomeRow, productName?: string) => {
    if (row) {
      setItIncomePaymentPlans(row.paymentPlans || [])
      setItIncomeModalState({ visible: true, editingRow: row, productName, isNew: false })
    } else {
      setItIncomePaymentPlans([])
      const existingProduct = itIncomeList.find(r => r.productName === productName)
      setItIncomeModalState({
        visible: true,
        editingRow: {
          id: '',
          productName: productName || '',
          tariffName: '',
          mgmtProductCode: '',
          mgmtProductName: '',
          thirdLevelSubject: '',
          coaSubject: '',
          taxRate: existingProduct?.taxRate || '',
          plannedIncome: existingProduct?.plannedIncome || '',
          plannedTariffAmount: '',
          budgetTariffAmount: '',
          contractStage: '初验',
          billingShareType: '月',
          billingSharePeriod: '12',
          isContractAsset: '否',
          plannedOrderDate: '',
          billingStartDate: '',
          paymentPlans: []
        },
        productName,
        isNew: true
      })
    }
  }

  const closeItIncomeModal = () => {
    setItIncomeModalState({ visible: false, editingRow: null, isNew: false })
    setItIncomePaymentPlans([])
  }

  const handleItIncomeSubmit = (row: ITIncomeRow) => {
    if (itIncomeModalState.isNew) {
      const productName = itIncomeModalState.productName || row.productName
      setItIncomeList(prev => [...prev, { ...row, id: 'it-' + Date.now(), productName, paymentPlans: itIncomePaymentPlans }].sort((a, b) => a.productName.localeCompare(b.productName)))
    } else {
      setItIncomeList(prev => prev.map(r => r.id === itIncomeModalState.editingRow!.id ? { ...row, paymentPlans: itIncomePaymentPlans } : r).sort((a, b) => a.productName.localeCompare(b.productName)))
    }
    closeItIncomeModal()
  }

  const [ctIncomeModalState, setCtIncomeModalState] = useState<{
    visible: boolean
    editingRow: CTIncomeRow | null
    productName?: string
    isNew: boolean
  }>({ visible: false, editingRow: null, isNew: false })
  const [ctProductDisplay, setCtProductDisplay] = useState<string>('')

  const openCtIncomeModal = (row?: CTIncomeRow, productName?: string) => {
    if (row) {
      const initialProductDisplay = row && row.productFullName
        ? `【${row.productCode}】${row.productFullName}`
        : ''
      setCtProductDisplay(initialProductDisplay)
      setCtIncomeModalState({ visible: true, editingRow: row, productName, isNew: false })
    } else {
      setCtProductDisplay('')
      setCtIncomeModalState({
        visible: true,
        editingRow: {
          id: '',
          productName: productName || '',
          packageName: '',
          productCode: '',
          productFullName: '',
          bandwidth: '',
          orderQuantity: '',
          tariffName: '',
          plannedIncome: '',
          plannedTariffAmount: '',
          budgetTariffAmount: '',
          taxRate: '',
          discount: '',
          billingShareType: '月',
          billingSharePeriod: '12',
          isContractAsset: '否',
          plannedOrderDate: '',
          billingStartDate: '',
          mgmtProductCode: '',
          mgmtProductName: '',
          thirdLevelSubject: '',
          coaSubject: ''
        },
        productName,
        isNew: true
      })
    }
  }

  const closeCtIncomeModal = () => {
    setCtIncomeModalState({ visible: false, editingRow: null, isNew: false })
    setCtProductDisplay('')
  }

  const handleCtIncomeSubmit = (row: CTIncomeRow) => {
    if (ctIncomeModalState.isNew) {
      const productName = ctIncomeModalState.productName || row.productName
      setCtIncomeList(prev => [...prev, { ...row, id: 'ct-' + Date.now(), productName }].sort((a, b) => a.productName.localeCompare(b.productName)))
    } else {
      setCtIncomeList(prev => prev.map(r => r.id === ctIncomeModalState.editingRow!.id ? row : r).sort((a, b) => a.productName.localeCompare(b.productName)))
    }
    closeCtIncomeModal()
  }

  const handleRemarkChange = (value: string) => {
    setChangeRemark(value)
    if (!value.trim()) {
      setRemarkError('请填写变更说明')
    } else if (value.length > 500) {
      setRemarkError('变更说明不能超过500字')
    } else {
      setRemarkError('')
    }
  }

  const handleSubmit = () => {
    modal.confirm('确定提交吗？', '提交').then(ok => {
      if (ok) {
        alert('提交成功')
        onNavigate?.(`/finance/contract/income-plan-time-adjust-approval/${contractId || 'CT2026060001'}`)
      }
    })
  }

  const handleCancel = () => {
    onNavigate?.('/finance/contract/query')
  }

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
            <h2 className="text-sm font-semibold text-gray-800">收入计划时间调整发起</h2>
          </div>
        </div>

        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        <ContractInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        <ContractAttachments attachments={getContractInfo('CT2026060006').attachments} />

        <div className="bg-white rounded-lg shadow-sm">
          <div
            className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 cursor-pointer select-none hover:bg-gray-50"
            onClick={() => setAfterPlanExpanded(!afterPlanExpanded)}
          >
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">计划信息</h3>
            {afterPlanExpanded
              ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
              : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />}
          </div>
          {afterPlanExpanded && (
            <div className="p-4 space-y-4">
              <SectionBlock
                title="IT收入计划"
                count={itIncomeList.length}
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
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额（不含税）</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">是否合同资产</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购状态</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupByProductName(itIncomeList).map((group) => {
                        const rowCount = group.rows.length
                        return (
                          <>
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
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.budgetTariffAmount || '-'}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, group.rows[0].taxRate) : '-'}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                                <td className="px-3 py-2.5 text-center whitespace-nowrap text-gray-700">
                                  {row.billingShareType === '一次性' ? row.isContractAsset : '-'}
                                </td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                                  <span className="inline-block px-2 py-0.5 text-xs bg-orange-50 text-orange-600 rounded">待订购</span>
                                </td>
                                <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => openItIncomeModal(row)} className="text-gray-500 hover:text-[#1677FF]" title="编辑">
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setItIncomeViewingPlans(row)} className="px-2 py-1 text-xs text-[#1677FF] hover:underline">回款计划</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end items-center gap-6">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{itIncomeList.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                </div>
              </SectionBlock>

              <SectionBlock
                title="CT收入计划"
                count={ctIncomeList.length}
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
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">是否合同资产</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购状态</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupByProductName(ctIncomeList).map((group) => {
                        const rowCount = group.rows.length
                        return (
                          <>
                            {group.rows.map((row, idx) => {
                              const { code, name } = parseCtProductName(row.productFullName || '')
                              return (
                                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                                  {idx === 0 && (
                                    <>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.productName}</td>
                                      <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].plannedIncome}</td>
                                      <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{group.rows[0].taxRate}</td>
                                    </>
                                  )}
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{(code && name) ? `【${code}】${name}` : '-'}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.bandwidth}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.orderQuantity}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.budgetTariffAmount || '-'}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, group.rows[0].taxRate) : '-'}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                                  <td className="px-3 py-2.5 text-center whitespace-nowrap text-gray-700">
                                    {row.billingShareType === '一次性' ? (row.isContractAsset || '-') : '-'}
                                  </td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                                    <span className="inline-block px-2 py-0.5 text-xs bg-orange-50 text-orange-600 rounded">待订购</span>
                                  </td>
                                  <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-2">
                                      <button onClick={() => openCtIncomeModal(row)} className="text-gray-500 hover:text-[#1677FF]" title="编辑">
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end items-center gap-6">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{ctIncomeList.reduce((sum, r) => sum + parseFloat(r.plannedIncome.replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{ctIncomeList.reduce((sum, r) => sum + parseFloat((r.budgetTariffAmount || '0').replace(/,/g, '')) || 0, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-800">合计（不含税）：</span>
                    <span className="text-base font-semibold text-[#1677FF]">¥{ctIncomeList.reduce((sum, r) => sum + parseFloat(calculateExcludingTax(r.budgetTariffAmount || r.plannedTariffAmount || '0', r.taxRate)) || 0, 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</span>
                  </div>
                </div>
              </SectionBlock>
            </div>
          )}
        </div>

        {/* 变更信息 */}
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
                <textarea
                  value={changeRemark}
                  onChange={(e) => handleRemarkChange(e.target.value)}
                  placeholder="请输入变更说明，最多500字"
                  rows={4}
                  maxLength={500}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none ${
                    remarkError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {remarkError && <span className="text-xs text-red-500">{remarkError}</span>}
                  <span className="text-xs text-gray-400 ml-auto">{changeRemark.length}/500</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <label className="w-40 text-right text-sm text-gray-700 shrink-0 pt-2 whitespace-nowrap pr-2">
                证明材料
              </label>
              <div className="flex-1 min-w-0">
                <div className="space-y-2">
                  {proofFiles.length > 0 && (
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
                            <button
                              type="button"
                              onClick={() => setProofFiles(prev => prev.filter((_, i) => i !== idx))}
                              className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                            >
                              <X className="w-3.5 h-3.5" />
                              删除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      const name = `证明材料${proofFiles.length + 1}.doc`
                      setProofFiles(prev => [...prev, name])
                    }}
                    className="w-full flex flex-col items-center justify-center gap-2 py-6 border-2 border-dashed border-gray-300 rounded-md bg-white hover:border-[#1677FF] hover:bg-blue-50/30 transition-colors group"
                  >
                    <Upload className="w-6 h-6 text-[#1677FF] group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-gray-600 group-hover:text-[#1677FF]">继续添加文件</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                      收入计划时间调整审批
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
                        科室经理
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

        {itIncomeModalState.visible && (
          <ModalShell
            title={itIncomeModalState.isNew ? 'IT收入计划新增' : 'IT收入计划修改'}
            onClose={closeItIncomeModal}
          >
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <FormRow label="产品名称" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.productName || '-'}
                </div>
              </FormRow>
              <FormRow label="税率" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.taxRate || '-'}
                </div>
              </FormRow>
              <FormRow label="资费名称" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.tariffName || '-'}
                </div>
              </FormRow>
              <FormRow label="计划订购金额" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.budgetTariffAmount || '-'}
                </div>
              </FormRow>
              <FormRow label="分摊类型" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.billingShareType || '-'}
                </div>
              </FormRow>
              <FormRow label="分摊周期" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.billingSharePeriod || '-'}
                </div>
              </FormRow>
              {(itIncomeModalState.editingRow?.billingShareType || '月') === '一次性' && (
                <FormRow label="是否合同资产" required>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {itIncomeModalState.editingRow?.isContractAsset || '-'}
                  </div>
                </FormRow>
              )}
              <FormRow label="计划订购时间" required>
                <DateInput
                  value={itIncomeModalState.editingRow?.plannedOrderDate || ''}
                  onChange={(v) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, plannedOrderDate: v } : null
                    }))
                  }}
                />
              </FormRow>
              <FormRow label="里程碑名称" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.contractStage || '-'}
                </div>
              </FormRow>
              <FormRow label="管会产品">
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.mgmtProductName ? `${itIncomeModalState.editingRow.mgmtProductCode || ''} ${itIncomeModalState.editingRow.mgmtProductName}` : '-'}
                </div>
              </FormRow>
              <FormRow label="COA科目">
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.coaSubject || '-'}
                </div>
              </FormRow>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <PaymentPlanSection
                value={itIncomePaymentPlans}
                onChange={setItIncomePaymentPlans}
                plannedIncome={itIncomeModalState.editingRow?.plannedTariffAmount || itIncomeModalState.editingRow?.plannedIncome || ''}
                isContractAsset={(itIncomeModalState.editingRow?.isContractAsset || '否') as '是' | '否'}
                milestones={defaultMilestones}
                disableMilestoneEdit
                disableAmountEdit
                disableAdd
                disableDelete
                plannedOrderDate={itIncomeModalState.editingRow?.plannedOrderDate || ''}
              />
            </div>

            <ModalFooter
              onCancel={closeItIncomeModal}
              onSubmit={() => {
                if (!itIncomeModalState.editingRow) {
                  alert('请填写完整数据')
                  return
                }
                handleItIncomeSubmit(itIncomeModalState.editingRow)
              }}
            />
          </ModalShell>
        )}

        {itIncomeViewingPlans && (
          <ModalShell title="回款计划明细" onClose={() => setItIncomeViewingPlans(null)}>
            <PaymentPlansDisplay plans={itIncomeViewingPlans.paymentPlans || []} plannedIncome={itIncomeViewingPlans.plannedIncome} hideTransferDate hideMilestoneName hideHeader />
            <div className="flex justify-center mt-5">
              <button type="button" onClick={() => setItIncomeViewingPlans(null)} className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors">关闭</button>
            </div>
          </ModalShell>
        )}

        {ctIncomeModalState.visible && ctIncomeModalState.editingRow && (() => {
          const editingRow = ctIncomeModalState.editingRow
          const isEdit = !ctIncomeModalState.isNew
          const productNameOptions = editingRow.productName ? (ctProductTypeProductNameMap[editingRow.productName] || []) : []
          const currentTariffOptions = ctProductDisplay
            ? (ctProductNameTariffMap[ctProductDisplay] || [])
            : []
          const showBandwidth = isCtBandwidthRequired(editingRow.productName)
          const { code: productCode, name: productFullName } = parseCtProductName(ctProductDisplay)

          const handleProductTypeChange = (v: string) => {
            setCtIncomeModalState(prev => ({
              ...prev,
              editingRow: prev.editingRow ? {
                ...prev.editingRow,
                productName: v,
                productCode: '',
                productFullName: '',
                tariffName: '',
                taxRate: ''
              } : null
            }))
            setCtProductDisplay('')
          }

          const handleProductNameChange = (v: string) => {
            const { code, name } = parseCtProductName(v)
            const tariffOptions = ctProductNameTariffMap[v] || []
            const firstTariff = tariffOptions.length === 1 ? tariffOptions[0] : ''
            setCtIncomeModalState(prev => ({
              ...prev,
              editingRow: prev.editingRow ? {
                ...prev.editingRow,
                productCode: code,
                productFullName: name,
                tariffName: firstTariff,
                taxRate: firstTariff ? (ctProductNameTariffMap[v]?.length ? prev.editingRow.taxRate : '') : ''
              } : null
            }))
            setCtProductDisplay(v)
          }

          const handleTariffChange = (v: string) => {
            setCtIncomeModalState(prev => ({
              ...prev,
              editingRow: prev.editingRow ? {
                ...prev.editingRow,
                tariffName: v
              } : null
            }))
          }

          return (
            <ModalShell
              title={ctIncomeModalState.isNew ? 'CT收入计划新增' : 'CT收入计划修改'}
              onClose={closeCtIncomeModal}
            >
              <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                <FormRow label="产品类型" required>
                  {isEdit ? (
                    <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {editingRow.productName || '-'}
                    </div>
                  ) : (
                    <SearchableSelect
                      value={editingRow.productName}
                      onChange={handleProductTypeChange}
                      options={allowedCTProductNames && allowedCTProductNames.length > 0 ? allowedCTProductNames : Object.keys(ctProductTypeProductNameMap)}
                    />
                  )}
                </FormRow>
                <FormRow label="税率" required>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {editingRow.taxRate || (ctProductDisplay ? '请先选择资费名称' : '请先选择产品名称')}
                  </div>
                </FormRow>
                <FormRow label="产品名称" required>
                  {isEdit ? (
                    <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {ctProductDisplay || editingRow.productName || '-'}
                    </div>
                  ) : (
                    <SearchableSelect
                      value={ctProductDisplay}
                      onChange={handleProductNameChange}
                      options={productNameOptions}
                      placeholder={editingRow.productName ? '请选择产品名称' : '请先选择产品类型'}
                      disabled={!editingRow.productName}
                    />
                  )}
                </FormRow>
                <FormRow label="资费名称" required>
                  {isEdit ? (
                    <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {editingRow.tariffName || '-'}
                    </div>
                  ) : (
                    <SearchableSelect
                      value={editingRow.tariffName}
                      onChange={handleTariffChange}
                      options={currentTariffOptions}
                      placeholder={ctProductDisplay ? '请选择资费名称' : (editingRow.productName ? '请先选择产品名称' : '请先选择产品类型')}
                      disabled={!ctProductDisplay}
                    />
                  )}
                </FormRow>
                {showBandwidth && (
                  <FormRow label="带宽（M）">
                    <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {editingRow.bandwidth || '-'}
                    </div>
                  </FormRow>
                )}
                <FormRow label="订购数量" required>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {editingRow.orderQuantity || '-'}
                  </div>
                </FormRow>
                <FormRow label="计划订购金额" required>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {editingRow.plannedTariffAmount || editingRow.plannedIncome || '-'}
                  </div>
                </FormRow>
                <FormRow label="分摊类型" required>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {editingRow.billingShareType || '-'}
                  </div>
                </FormRow>
                <FormRow label="分摊周期" required>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {editingRow.billingSharePeriod || '-'}
                  </div>
                </FormRow>
                <FormRow label="是否合同资产" required>
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {editingRow.isContractAsset || '-'}
                  </div>
                </FormRow>
                <FormRow label="计划订购时间" required>
                  <MonthPicker
                    value={editingRow.plannedOrderDate || ''}
                    onChange={(v) => {
                      setCtIncomeModalState(prev => ({
                        ...prev,
                        editingRow: prev.editingRow ? { ...prev.editingRow, plannedOrderDate: v } : null
                      }))
                    }}
                  />
                </FormRow>
                <FormRow label="管会产品">
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {editingRow.mgmtProductName ? `${editingRow.mgmtProductCode || ''} ${editingRow.mgmtProductName}` : '-'}
                  </div>
                </FormRow>
                <FormRow label="COA科目">
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {editingRow.coaSubject || '-'}
                  </div>
                </FormRow>
              </div>

              <ModalFooter
                onCancel={closeCtIncomeModal}
                onSubmit={() => {
                  if (!editingRow) {
                    alert('请填写完整数据')
                    return
                  }
                  handleCtIncomeSubmit(editingRow)
                }}
              />
            </ModalShell>
          )
        })()}
      </div>
    </div>
  )
}