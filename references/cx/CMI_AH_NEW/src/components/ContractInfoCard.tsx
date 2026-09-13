import { useState } from 'react'
import { ChevronRight, ChevronDown, FileText } from 'lucide-react'

/* ========== Tag ========== */
function Tag({ children, color = 'default' }: { children: React.ReactNode; color?: 'default' | 'success' | 'warning' | 'error' }) {
  const colorMap = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-orange-50 text-orange-600',
    error: 'bg-red-50 text-red-600'
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colorMap[color]}`}>
      {children}
    </span>
  )
}

/* ========== InfoField ========== */
function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start min-h-[32px] py-0.5">
      <label className="w-44 text-right text-sm text-gray-500 shrink-0 pr-2 break-all">{label}：</label>
      <div className="flex-1 min-w-0 text-sm text-gray-700 break-all">{value || '-'}</div>
    </div>
  )
}

/* ========== 合同信息数据类型 ========== */
export interface ContractInfoData {
  name: string
  projectCode: string
  projectName: string
  code: string
  serialNo: string
  type: string
  typeKey: 'income' | 'income-expense' | 'expense'
  isFramework: string
  frameworkRelationType: string
  secondCategory: string
  thirdCategory: string
  organizer: string
  handler: string
  dept: string
  signSubject: string
  draftTime: string
  status: string
  statusChangeTime: string
  nature: string
  projectAmountWithTax: string
  projectAmountNoTax: string
  effectiveTime: string
  terminationTime: string
  contractPeriodMonths: string
  signTime: string
  counterpartName: string
  collectedCustomer: string
  amountWithTax: string
  amountNoTax: string
  adjustedAmountWithTax: string
  adjustedAmountNoTax: string
  performanceStartTime: string
  performanceEndTime: string
  isSupplement: string
  supplementType: string
}

/* ========== 项目信息 ========== */
interface ProjectInfoCardProps {
  contractInfo: ContractInfoData
  defaultExpanded?: boolean
}

export function ProjectInfoCard({ contractInfo, defaultExpanded = false }: ProjectInfoCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">项目信息</h3>
        {!expanded && (
          <span className="ml-2 text-sm text-gray-400 truncate flex-1 min-w-0">
            {contractInfo.projectName || '-'} · {contractInfo.type}
          </span>
        )}
        {expanded
          ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
          : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
        }
      </div>
      {expanded && (
        <div className="px-4 py-10 text-center text-sm text-gray-400">
          — 项目信息 —
        </div>
      )}
    </div>
  )
}

/* ========== 合同信息 ========== */
interface ContractInfoCardProps {
  contractInfo: ContractInfoData
  defaultExpanded?: boolean
}

const statusTagColor = (status: string): 'default' | 'success' | 'warning' | 'error' => {
  if (status === '已生效') return 'success'
  if (status === '待审批') return 'warning'
  if (status === '已终止' || status === '已作废') return 'error'
  return 'default'
}

export function ContractInfoCard({ contractInfo }: ContractInfoCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer select-none hover:bg-gray-50 rounded-lg border-b border-gray-100"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">合同信息</h3>
        {!expanded && (
          <div className="ml-2 text-sm text-gray-400 truncate flex items-center flex-1 min-w-0">
            <span className="truncate text-gray-400">{contractInfo.name}</span>
            <span className="whitespace-nowrap mx-2 text-gray-400">·</span>
            <span className="whitespace-nowrap text-gray-400">{contractInfo.code}</span>
            <span className="whitespace-nowrap mx-2 text-gray-400">·</span>
            <span className="whitespace-nowrap">
              <Tag color={statusTagColor(contractInfo.status)}>{contractInfo.status}</Tag>
            </span>
            <span className="whitespace-nowrap mx-2 text-gray-400">·</span>
            <span className="whitespace-nowrap">{contractInfo.signTime}</span>
            <span className="whitespace-nowrap mx-2 text-gray-400">·</span>
            <span className="whitespace-nowrap text-[#1677FF] font-medium">¥{contractInfo.adjustedAmountWithTax}</span>
          </div>
        )}
        {expanded
          ? <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
          : <ChevronRight className="w-4 h-4 text-gray-500 ml-auto" />
        }
      </div>
      {expanded && (
        <div className="p-4">
          <div className="grid grid-cols-3 gap-x-6 gap-y-2">
            {/* 基本标识 */}
            <InfoField label="合同名称" value={contractInfo.name} />
            <InfoField label="合同编码" value={contractInfo.code} />
            <InfoField label="合同流水号" value={contractInfo.serialNo} />
            {/* 分类与性质 */}
            <InfoField label="合同类型" value={contractInfo.type} />
            <InfoField label="合同性质" value="单项合同" />
            <InfoField label="关联类型" value={contractInfo.frameworkRelationType} />
            <InfoField label="合同二级分类" value={contractInfo.secondCategory} />
            <InfoField label="合同三级分类" value={contractInfo.thirdCategory} />
            {/* 承办信息 */}
            <InfoField label="承办单位" value={contractInfo.organizer} />
            <InfoField label="承办部门" value={contractInfo.dept} />
            <InfoField label="承办人" value={contractInfo.handler} />
            {/* 签约与状态 */}
            <InfoField label="合同签约主体" value={contractInfo.signSubject} />
            <InfoField label="相对方名称" value={contractInfo.counterpartName} />
            <InfoField label="合同签约时间" value={contractInfo.signTime} />
            <InfoField label="合同状态" value={contractInfo.status} />
            <InfoField label="合同起草时间" value={contractInfo.draftTime} />
            <InfoField label="状态变更时间" value={contractInfo.statusChangeTime} />
            {/* 金额 */}
            <InfoField label="合同金额（含税，元）" value={contractInfo.amountWithTax} />
            <InfoField label="合同金额（不含税，元）" value={contractInfo.amountNoTax} />
            <InfoField label="调整后合同金额（含税，元）" value={contractInfo.adjustedAmountWithTax} />
            <InfoField label="调整后合同金额（不含税，元）" value={contractInfo.adjustedAmountNoTax} />
            {/* 履约与补充 */}
            <InfoField label="履约开始时间" value={contractInfo.performanceStartTime} />
            <InfoField label="履约结束时间" value={contractInfo.performanceEndTime} />
            <InfoField label="是否补充协议" value={contractInfo.isSupplement} />
            <InfoField label="补充协议类型" value={contractInfo.supplementType} />
          </div>
        </div>
      )}
    </div>
  )
}
