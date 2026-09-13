import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import {
  Edit,
  Trash2,
  Eye,
  ArrowLeft,
  Search,
  Check,
  RotateCcw,
  FileText,
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  Plus
} from 'lucide-react'
import ContractAttachments from '@/components/ContractAttachments'
import ProcessTrail from '@/components/ProcessTrail'
import { useModal } from '@/components/Modal'
import { getContractInfo } from '@/data/mock'
import IncomeCTSection from '@/components/plan-modules/IncomeCTSection'
import { ProjectInfoCard, ContractInfoCard } from '@/components/ContractInfoCard'
import CommonSearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import SectionBlock from '@/components/plan-modules/common/SectionBlock'
import PaymentPlansDisplay from '@/components/plan-modules/common/PaymentPlansDisplay'
import ModalShell from '@/components/plan-modules/common/ModalShell'
import ModalFooter from '@/components/plan-modules/common/ModalFooter'
import FormRow from '@/components/plan-modules/common/FormRow'
import SegmentedSelect from '@/components/plan-modules/common/SegmentedSelect'
import NumberInput from '@/components/plan-modules/common/NumberInput'
import DateInput from '@/components/plan-modules/common/DateInput'
import MonthPicker from '@/components/plan-modules/common/MonthPicker'
import PaymentPlanSection, { validatePaymentPlans, defaultMilestones } from '@/components/PaymentPlanSection'
import type { ITIncomeRow, CTIncomeRow } from '@/components/plan-modules/types'
import { itProductOptions, itTariffOptions, ctTariffOptions, ctProductTypeProductNameMap, ctProductNameTariffMap, parseCtProductName, isCtBandwidthRequired } from '@/components/plan-modules/constants'
import { calculateExcludingTax } from '@/lib/utils'


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

interface IncomePlanChangeConfirmProps {
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

const extractProductNames = <T extends { productName?: string }>(list: T[]): string[] => {
  return [...new Set(list.map(r => r.productName).filter((v): v is string => !!v))]
}

const extractIds = <T extends { id: string }>(list: T[]): string[] => {
  return list.map(r => r.id)
}

function calculateTotal(list: any[], field = 'plannedIncome'): number {
  return list.reduce((acc, curr) => {
    const n = parseFloat(String(curr[field]).replace(/,/g, ''))
    return acc + (isNaN(n) ? 0 : n)
  }, 0)
}

export default function IncomePlanChangeConfirm({ onNavigate, contractId }: IncomePlanChangeConfirmProps) {
  const modal = useModal()

  const contractInfo = getContractInfo(contractId || 'CT2026060001')

  const originalTotalIT = calculateTotal(originalITIncome, 'plannedIncome')
  const originalTotalCT = calculateTotal(originalCTIncome, 'plannedIncome')
  const originalTotal = originalTotalIT + originalTotalCT

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
      orderStatus: '已订购',
      paymentPlans: []
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
      orderStatus: '待订购',
      paymentPlans: []
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

  // 已带出的产品名称列表（用于限制选择范围）
  const [allowedITProductNames, setAllowedITProductNames] = useState<string[]>(extractProductNames(originalITIncome))
  const [allowedCTProductNames, setAllowedCTProductNames] = useState<string[]>(extractProductNames(originalCTIncome))

  // 已带出记录的 ID 列表（不允许删除）
  const [undeletableITIncomeIds, setUndeletableITIncomeIds] = useState<string[]>(extractIds(originalITIncome))
  const [undeletableCTIncomeIds, setUndeletableCTIncomeIds] = useState<string[]>(extractIds(originalCTIncome))

  // 从 sessionStorage 读取效益预评估数据
  useEffect(() => {
    const storedData = sessionStorage.getItem('benefitEvaluationData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData) as {
          itIncomeList?: ITIncomeRow[]
          ctIncomeList?: CTIncomeRow[]
        }
        if (data.itIncomeList && data.itIncomeList.length > 0) {
          setItIncomeList(data.itIncomeList)
          setAllowedITProductNames([...new Set(data.itIncomeList.map((r: ITIncomeRow) => r.productName).filter((v): v is string => !!v))] as string[])
          setUndeletableITIncomeIds(data.itIncomeList.map((r: ITIncomeRow) => r.id))
        }
        if (data.ctIncomeList && data.ctIncomeList.length > 0) {
          setCtIncomeList(data.ctIncomeList)
          setAllowedCTProductNames([...new Set(data.ctIncomeList.map((r: CTIncomeRow) => r.productName).filter((v): v is string => !!v))] as string[])
          setUndeletableCTIncomeIds(data.ctIncomeList.map((r: CTIncomeRow) => r.id))
        }
        sessionStorage.removeItem('benefitEvaluationData')
      } catch (e) {
        console.error('效益预评估数据读取失败', e)
      }
    }
  }, [])

  const [changeRemark, setChangeRemark] = useState('')
  const [proofFiles, setProofFiles] = useState<string[]>(['合肥市工商银行智能监控系统实施变更证明.doc'])

  const [remarkError, setRemarkError] = useState('')

  const [afterPlanExpanded, setAfterPlanExpanded] = useState(true)

  const trailData = [
    { time: '2026-07-20 09:00:00', actor: '张三', action: '提交收入计划调整申请' },
    { time: '2026-07-20 14:30:00', actor: '李四', action: '确认与补充中' }
  ]

  // IT收入计划弹框状态
  const [itIncomeModalState, setItIncomeModalState] = useState<{
    visible: boolean
    editingRow: ITIncomeRow | null
    productName?: string
    isNew: boolean
  }>({ visible: false, editingRow: null, isNew: false })
  const [approver, setApprover] = useState('')
  const [approver2, setApprover2] = useState('')
  const [approvalResult, setApprovalResult] = useState<'approved' | 'rejected'>('approved')
  const [approvalComment, setApprovalComment] = useState('通过')
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

  // CT收入计划弹框状态
  const [ctIncomeModalState, setCtIncomeModalState] = useState<{
    visible: boolean
    editingRow: CTIncomeRow | null
    productName?: string
    isNew: boolean
  }>({ visible: false, editingRow: null, isNew: false })
  const [ctProductDisplay, setCtProductDisplay] = useState('')

  const openCtIncomeModal = (row?: CTIncomeRow, productName?: string) => {
    if (row) {
      setCtProductDisplay(row.productFullName ? `【${row.productCode || '-'}】${row.productFullName}` : '')
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

  const handleSubmit = () => {
    const errors: string[] = []
    if (!changeRemark.trim()) {
      errors.push('请填写变更说明')
    } else if (changeRemark.length > 500) {
      errors.push('变更说明不能超过500字')
    }
    // 证明材料改为非必填，无需校验
    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }
    modal.confirm('确定提交吗？', '提交').then(ok => {
      if (ok) {
        alert('提交成功')
        if (approvalResult === 'approved') {
          onNavigate?.(`/finance/contract/order/forward/plan-change-approval/${contractId || 'CT2026060001'}`)
        } else {
          onNavigate?.(`/finance/contract/parse/${contractId || 'CT2026060001'}`)
        }
      }
    })
  }

  const handleCancel = () => {
    onNavigate?.('/finance/contract/query')
  }

  const handleRemarkChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    if (val.length <= 500) {
      setChangeRemark(val)
      setRemarkError('')
    }
  }

  const handleApprovalResultChange = (value: 'approved' | 'rejected') => {
    setApprovalResult(value)
    setApprovalComment(value === 'approved' ? '通过' : '')
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
            <h2 className="text-sm font-semibold text-gray-800">收入计划调整确认与补充</h2>
          </div>
        </div>

        {/* 1. 项目信息 */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* 2. 合同信息 */}
        <ContractInfoCard contractInfo={contractInfo} defaultExpanded={true} />

        {/* 3. 合同附件 */}
        <ContractAttachments attachments={contractInfo.attachments} />

        {/* 流程轨迹 */}
        <ProcessTrail trail={trailData} />

        {/* 4. 计划信息 */}
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
              <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2">
                <span className="shrink-0">⚠</span>
                <span>温馨提示：请补充IT收入计划的计划订购时间、是否合同资产、回款计划等信息，CT收入计划的计划订购时间</span>
              </div>
              {/* IT收入计划 */}
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
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">订购状态</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupByProductName(itIncomeList).map((group) => {
                        const rowCount = group.rows.length + 1
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
                                <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                  <span className={clsx(
                                    'inline-block px-2 py-0.5 text-xs rounded border',
                                    row.orderStatus === '待订购' && 'bg-orange-50 text-orange-600 border-orange-100',
                                    row.orderStatus === '订购中' && 'bg-blue-50 text-blue-600 border-blue-100',
                                    row.orderStatus === '部分订购' && 'bg-yellow-50 text-yellow-700 border-yellow-100',
                                    row.orderStatus === '已订购' && 'bg-green-50 text-green-600 border-green-100'
                                  )}>
                                    {row.orderStatus || '-'}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => openItIncomeModal(row)} className="text-gray-500 hover:text-[#1677FF]" title="编辑">
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => {
                                      if (undeletableITIncomeIds && undeletableITIncomeIds.includes(row.id)) {
                                        alert('该记录为效益预评估已带出的计划，不允许删除')
                                        return
                                      }
                                      modal.confirm('确定要删除该IT收入计划吗？', '确认删除').then(ok => {
                                        if (ok) setItIncomeList(prev => prev.filter(r => r.id !== row.id))
                                      })
                                    }} className="text-gray-500 hover:text-red-500" title="删除">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => setItIncomeViewingPlans(row)} className="px-2 py-1 text-xs text-[#1677FF] hover:underline">回款计划</button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            <tr key={`add-it-${group.productName}`} className="border-t border-gray-100 hover:bg-gray-50/50">
                                  <td className="px-3 py-2.5 text-center whitespace-nowrap" colSpan={14}>
                                    <button onClick={() => openItIncomeModal(undefined, group.productName)} className="inline-flex items-center gap-1 px-4 py-1.5 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 hover:border-blue-200 transition-colors">
                                      <Plus className="w-3 h-3" />补充资费
                                    </button>
                                  </td>
                                </tr>
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

              {/* CT收入计划 */}
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
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                        <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">订购状态</th>
                        <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupByProductName(ctIncomeList).map((group) => {
                        const rowCount = group.rows.length + 1
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
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.productFullName ? `【${row.productCode || '-'}】${row.productFullName}` : '-'}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.bandwidth}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.orderQuantity}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.budgetTariffAmount || '-'}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTariffAmount ? calculateExcludingTax(row.plannedTariffAmount, group.rows[0].taxRate) : '-'}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingShareType}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingSharePeriod}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedOrderDate}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProductName}</td>
                                <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                                <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                  <span className={clsx(
                                    'inline-block px-2 py-0.5 text-xs rounded border',
                                    row.orderStatus === '待订购' && 'bg-orange-50 text-orange-600 border-orange-100',
                                    row.orderStatus === '订购中' && 'bg-blue-50 text-blue-600 border-blue-100',
                                    row.orderStatus === '部分订购' && 'bg-yellow-50 text-yellow-700 border-yellow-100',
                                    row.orderStatus === '已订购' && 'bg-green-50 text-green-600 border-green-100'
                                  )}>
                                    {row.orderStatus || '-'}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => openCtIncomeModal(row)} className="text-gray-500 hover:text-[#1677FF]" title="编辑">
                                      <Edit className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => {
                                      if (undeletableCTIncomeIds && undeletableCTIncomeIds.includes(row.id)) {
                                        alert('该记录为效益预评估已带出的计划，不允许删除')
                                        return
                                      }
                                      modal.confirm('确定要删除该CT收入计划吗？', '确认删除').then(ok => {
                                        if (ok) setCtIncomeList(prev => prev.filter(r => r.id !== row.id))
                                      })
                                    }} className="text-gray-500 hover:text-red-500" title="删除">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            <tr key={`add-ct-${group.productName}`} className="border-t border-gray-100 hover:bg-gray-50/50">
                                  <td className="px-3 py-2.5 text-center whitespace-nowrap" colSpan={16}>
                                    <button onClick={() => openCtIncomeModal(undefined, group.productName)} className="inline-flex items-center gap-1 px-4 py-1.5 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 hover:border-blue-200 transition-colors">
                                      <Plus className="w-3 h-3" />补充资费
                                    </button>
                                  </td>
                                </tr>
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

{/* 6. 变更信息 */}
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
                  onChange={handleRemarkChange}
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

        {/* 审批信息 */}
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

        {/* 流程信息 */}
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
                      {approvalResult === 'approved' ? '前向合同解析确认与补充' : '收入计划调整'}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-start min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 mt-1">下一步处理人</label>
                  <div className="flex-1 min-w-0">
                    {approvalResult === 'approved' ? (
                      <div className="flex flex-col gap-2">
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
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                            财务管理员
                          </span>
                          <div className="flex-1 min-w-0">
                            <SearchableSelect
                              value={approver2}
                              onChange={setApprover2}
                              options={approverOptions}
                              placeholder="请选择下一步处理人"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
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
                    )}
                  </div>
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

        {/* IT收入计划新增/修改弹框 */}
        {itIncomeModalState.visible && (
          <ModalShell
            title={itIncomeModalState.isNew ? 'IT收入计划新增' : 'IT收入计划修改'}
            onClose={closeItIncomeModal}
          >
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <FormRow label="产品名称" required>
                {itIncomeModalState.editingRow ? (
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {itIncomeModalState.editingRow.productName}
                  </div>
                ) : (
                  <CommonSearchableSelect
                    value={''}
                    onChange={(v) => {}}
                    options={itProductOptions}
                  />
                )}
              </FormRow>
              <FormRow label="税率" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {itIncomeModalState.editingRow?.taxRate || '-'}
                </div>
              </FormRow>
              <FormRow label="资费名称" required>
                <CommonSearchableSelect
                  value={itIncomeModalState.editingRow?.tariffName || ''}
                  onChange={(v) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, tariffName: v } : null
                    }))
                  }}
                  options={itTariffOptions}
                />
              </FormRow>
              <FormRow label="计划订购金额" required>
                <NumberInput
                  value={itIncomeModalState.editingRow?.budgetTariffAmount || ''}
                  onChange={(v) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, budgetTariffAmount: v } : null
                    }))
                  }}
                  placeholder="请输入金额"
                />
              </FormRow>
              <FormRow label="分摊类型" required>
                <SegmentedSelect
                  value={itIncomeModalState.editingRow?.billingShareType || '月'}
                  onChange={(v) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, billingShareType: v } : null
                    }))
                  }}
                  options={['一次性', '月']}
                />
              </FormRow>
              <FormRow label="分摊周期" required>
                <input
                  type="text"
                  value={itIncomeModalState.editingRow?.billingSharePeriod || '12'}
                  onChange={(e) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, billingSharePeriod: e.target.value } : null
                    }))
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  placeholder="请输入周期"
                />
              </FormRow>
              {(itIncomeModalState.editingRow?.billingShareType || '月') === '一次性' && (
                <FormRow label="是否合同资产" required>
                  <SegmentedSelect
                    value={itIncomeModalState.editingRow?.isContractAsset || '否'}
                    onChange={(v) => {
                      setItIncomeModalState(prev => ({
                        ...prev,
                        editingRow: prev.editingRow ? { ...prev.editingRow, isContractAsset: v } : null
                      }))
                    }}
                    options={['是', '否']}
                  />
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
                <CommonSearchableSelect
                  value={itIncomeModalState.editingRow?.contractStage || '初验'}
                  onChange={(v) => {
                    setItIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, contractStage: v } : null
                    }))
                  }}
                  options={defaultMilestones.map(m => m.name)}
                />
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

        {/* IT收入计划回款计划查看弹框 */}
        {itIncomeViewingPlans && (
          <ModalShell title="回款计划明细" onClose={() => setItIncomeViewingPlans(null)}>
            <PaymentPlansDisplay plans={itIncomeViewingPlans.paymentPlans || []} plannedIncome={itIncomeViewingPlans.plannedIncome} hideTransferDate hideMilestoneName hideHeader />
            <div className="flex justify-center mt-5">
              <button type="button" onClick={() => setItIncomeViewingPlans(null)} className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors">关闭</button>
            </div>
          </ModalShell>
        )}

        {/* CT收入计划新增/修改弹框 */}
        {ctIncomeModalState.visible && (
          <ModalShell
            title={ctIncomeModalState.isNew ? 'CT收入计划新增' : 'CT收入计划修改'}
            onClose={closeCtIncomeModal}
          >
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <FormRow label="产品类型" required>
                {ctIncomeModalState.editingRow ? (
                  <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {ctIncomeModalState.editingRow.productName}
                  </div>
                ) : (
                  <CommonSearchableSelect
                    value={ctIncomeModalState.editingRow?.productName || ''}
                    onChange={(v) => {
                      setCtProductDisplay('')
                      setCtIncomeModalState(prev => ({
                        ...prev,
                        editingRow: prev.editingRow ? {
                          ...prev.editingRow,
                          productName: v,
                          productCode: '',
                          productFullName: '',
                          tariffName: '',
                          taxRate: '',
                          mgmtProductName: '',
                          coaSubject: ''
                        } : null
                      }))
                    }}
                    options={Object.keys(ctProductTypeProductNameMap)}
                  />
                )}
              </FormRow>
              <FormRow label="税率" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {ctIncomeModalState.editingRow?.taxRate || '-'}
                </div>
              </FormRow>
              <FormRow label="产品名称" required>
                <CommonSearchableSelect
                  value={ctProductDisplay}
                  onChange={(v) => {
                    const { code, name } = parseCtProductName(v)
                    setCtProductDisplay(v)
                    const tariffOptions = ctProductNameTariffMap[v] || []
                    let autoTariff = ''
                    let autoTaxRate = ''
                    let autoMgmt = ''
                    let autoCoa = ''
                    if (tariffOptions.length === 1) {
                      autoTariff = tariffOptions[0]
                    }
                    setCtIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? {
                        ...prev.editingRow,
                        productCode: code,
                        productFullName: name,
                        tariffName: autoTariff,
                        taxRate: autoTaxRate,
                        mgmtProductName: autoMgmt,
                        coaSubject: autoCoa
                      } : null
                    }))
                  }}
                  options={ctProductTypeProductNameMap[ctIncomeModalState.editingRow?.productName || ''] || []}
                  placeholder={ctIncomeModalState.editingRow?.productName ? '请选择产品名称' : '请先选择产品类型'}
                  disabled={!ctIncomeModalState.editingRow?.productName}
                />
              </FormRow>
              <FormRow label="资费名称" required>
                <CommonSearchableSelect
                  value={ctIncomeModalState.editingRow?.tariffName || ''}
                  onChange={(v) => {
                    setCtIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, tariffName: v } : null
                    }))
                  }}
                  options={
                    (ctProductDisplay && ctProductNameTariffMap[ctProductDisplay])
                      ? ctProductNameTariffMap[ctProductDisplay]
                      : (ctIncomeModalState.editingRow?.productName
                          ? (ctProductTariffMap[ctIncomeModalState.editingRow.productName] || ctTariffOptions)
                          : ctTariffOptions)
                  }
                  disabled={!ctProductDisplay && !ctIncomeModalState.editingRow?.productName}
                />
              </FormRow>
              {isCtBandwidthRequired(ctIncomeModalState.editingRow?.productName || '') && (
                <FormRow label="带宽（M）">
                  <input
                    type="text"
                    value={ctIncomeModalState.editingRow?.bandwidth || ''}
                    onChange={(e) => {
                      setCtIncomeModalState(prev => ({
                        ...prev,
                        editingRow: prev.editingRow ? { ...prev.editingRow, bandwidth: e.target.value } : null
                      }))
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    placeholder="请输入带宽"
                  />
                </FormRow>
              )}
              <FormRow label="订购数量" required>
                <NumberInput
                  value={ctIncomeModalState.editingRow?.orderQuantity || ''}
                  onChange={(v) => {
                    setCtIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, orderQuantity: v } : null
                    }))
                  }}
                  placeholder="请输入订购数量"
                />
              </FormRow>
              <FormRow label="计划订购金额" required>
                <NumberInput
                  value={ctIncomeModalState.editingRow?.plannedTariffAmount || ''}
                  onChange={(v) => {
                    setCtIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, plannedTariffAmount: v } : null
                    }))
                  }}
                  placeholder="请输入金额"
                />
              </FormRow>
              <FormRow label="分摊类型" required>
                <SegmentedSelect
                  value={ctIncomeModalState.editingRow?.billingShareType || '月'}
                  onChange={(v) => {
                    setCtIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, billingShareType: v } : null
                    }))
                  }}
                  options={['一次性', '月']}
                />
              </FormRow>
              <FormRow label="分摊周期" required>
                <input
                  type="text"
                  value={ctIncomeModalState.editingRow?.billingSharePeriod || '12'}
                  onChange={(e) => {
                    setCtIncomeModalState(prev => ({
                      ...prev,
                      editingRow: prev.editingRow ? { ...prev.editingRow, billingSharePeriod: e.target.value } : null
                    }))
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  placeholder="请输入周期"
                />
              </FormRow>
              <FormRow label="计划订购时间" required>
                <MonthPicker
                  value={ctIncomeModalState.editingRow?.plannedOrderDate || ''}
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
                  {ctIncomeModalState.editingRow?.mgmtProductName ? `${ctIncomeModalState.editingRow.mgmtProductCode || ''} ${ctIncomeModalState.editingRow.mgmtProductName}` : '-'}
                </div>
              </FormRow>
              <FormRow label="COA科目">
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {ctIncomeModalState.editingRow?.coaSubject || '-'}
                </div>
              </FormRow>
            </div>

            <ModalFooter
              onCancel={closeCtIncomeModal}
              onSubmit={() => {
                if (!ctIncomeModalState.editingRow) {
                  alert('请填写完整数据')
                  return
                }
                if (!ctIncomeModalState.editingRow.productName || !ctIncomeModalState.editingRow.productFullName || !ctIncomeModalState.editingRow.tariffName) {
                  alert('请完整填写产品类型、产品名称和资费名称')
                  return
                }
                handleCtIncomeSubmit(ctIncomeModalState.editingRow)
              }}
            />
          </ModalShell>
        )}


      </div>
    </div>
  )
}
