// ============== Mock 数据 ==============
export const customerInfo = {
  name: '昆明市工商银行',
  industry: '金融',
  contact: '李明',
  phone: '13987123456'
}

export const opportunityInfo = {
  name: '昆明市工商银行智能监控系统',
  projectCode: 'OPP-2026-KM-001',
  level: 'A',
  estimatedAmount: '3200.00',
  owner: '周程',
  createTime: '2026-05-10 10:00'
}

export const handlerOptions = [
  { name: '张大伟', dept: '项目交付中心 / 昆明' },
  { name: '周程', dept: '项目交付中心 / 昆明' },
  { name: '张凯', dept: '医卫BU / 省公司' },
  { name: '李华', dept: '政企客户部 / 昆明' },
  { name: '陈静', dept: '项目交付中心 / 审核' }
]

export const flowNodeLabels: Record<string, string> = {
  biz: '商机',
  'pre-support': '售前支撑',
  'pre-decision': '预决策',
  tender: '招投标',
  'project-init': '项目立项',
  'contract-sign': '合同签订',
  'contract-brief': '合同交底',
  kickoff: '项目启动与规划',
  start: '项目开工',
  implement: '项目实施',
  'self-check': '项目自检',
  acceptance: '项目验收',
  'project-handover': '项目交维'
}

// 里程碑节点可选值（必选项不可删除，列表展示顺序即 milestoneNodeOptions 数组顺序）
export const milestoneNodeOptions: { value: string; label: string; required?: boolean }[] = [
  { value: 'start', label: '项目开工', required: true },
  { value: 'arrive', label: '到货' },
  { value: 'online', label: '项目上线' },
  { value: 'pre-accept', label: '初验' },
  { value: 'trial', label: '试运行' },
  { value: 'final-accept', label: '终验', required: true },
  { value: 'maintain', label: '维护' }
]

// 里程碑计划数据
export type MilestoneRow = { id: string; value: string; label: string; start: string; end: string; required: boolean }
export const initialMilestones: MilestoneRow[] = [
  { id: 'm-start', value: 'start', label: '项目开工', start: '2025-09-01', end: '2025-09-30', required: true },
  { id: 'm-arrive', value: 'arrive', label: '到货', start: '2025-10-01', end: '2025-10-31', required: false },
  { id: 'm-online', value: 'online', label: '项目上线', start: '2025-11-01', end: '2025-11-30', required: false },
  { id: 'm-pre-accept', value: 'pre-accept', label: '初验', start: '', end: '', required: false },
  { id: 'm-final', value: 'final-accept', label: '终验', start: '', end: '', required: true }
]

// 团队角色枚举值（限定 7 项，不可自由输入）
export const teamRoleOptions = [
  '客户经理',
  '解决方案经理',
  '交付经理',
  '运维经理',
  '交付人员',
  '运维人员',
  '铁通人员'
] as const

// 团队成员人员库
export const teamMemberLibrary: { name: string; account: string; dept: string; phone: string }[] = [
  { name: '张伟', account: 'zhangw', dept: 'DICT中心', phone: '13712344322' },
  { name: '李飞晓', account: 'lifix', dept: 'DICT中心', phone: '13912344638' },
  { name: '张晓军', account: 'zhangxj', dept: '网操部', phone: '13712348724' },
  { name: '吴海明', account: 'wuhm', dept: '智益公司', phone: '18912347472' },
  { name: '程雨东', account: 'chengyd', dept: '智益公司', phone: '13912344281' },
  { name: '张大伟', account: 'zhangdw', dept: '项目交付中心 / 昆明', phone: '13800001111' },
  { name: '周程', account: 'zhouch', dept: '项目交付中心 / 昆明', phone: '13800002222' },
  { name: '王琳', account: 'wanglin', dept: '网络部', phone: '13800003333' },
  { name: '李华', account: 'lihua', dept: '政企客户部 / 昆明', phone: '13800004444' },
  { name: '陈静', account: 'chenjing', dept: '项目交付中心 / 审核', phone: '13800005555' }
]

// 团队成员数据
export type TeamMember = { id: string; name: string; account: string; dept: string; role: typeof teamRoleOptions[number]; phone: string }
export const initialTeam: TeamMember[] = [
  { id: 't-1', name: '张伟', account: 'zhangw', dept: 'DICT中心', role: '交付经理', phone: '13712344322' },
  { id: 't-2', name: '李飞晓', account: 'lifix', dept: 'DICT中心', role: '交付经理', phone: '13912344638' },
  { id: 't-3', name: '张晓军', account: 'zhangxj', dept: '网操部', role: '交付人员', phone: '13712348724' },
  { id: 't-4', name: '吴海明', account: 'wuhm', dept: '智益公司', role: '交付人员', phone: '18912347472' },
  { id: 't-5', name: '程雨东', account: 'chengyd', dept: '智益公司', role: '交付人员', phone: '13912344281' }
]

// 项目计划 - CT 任务
export type StandardProductRow = { id: string; name: string; code: string; qty: string; start: string; end: string; addr: string; owner: string }
export const initialStdProducts: StandardProductRow[] = [
  { id: 'sp-1', name: '互联网专线', code: 'XXXX', qty: '2', start: '2025-09-10', end: '2025-11-10', addr: 'XXXXX', owner: 'XXXXX' },
  { id: 'sp-2', name: '移动云', code: 'XXXX', qty: '1', start: '2025-09-09', end: '2025-11-09', addr: 'XXXXX', owner: 'XXXXX' }
]

// 项目计划 - IT 任务
export type ItTaskRow = { id: string; name: string; type: string; start: string; end: string; desc: string; owner: string }
export const initialItTasks: ItTaskRow[] = [
  { id: 'it-1', name: 'XXX硬件安装调试', type: '硬件安装调试', start: '2025-09-10', end: '2025-11-10', desc: 'XXXXXX', owner: 'XXXXX' },
  { id: 'it-2', name: 'XXXXX系统软件研发', type: '软件研发', start: '2025-09-09', end: '2025-11-09', desc: 'XXXXXX', owner: 'XXXXX' }
]

// 支出合同数据
export type ContractRow = {
  id: string
  name: string
  flowNo: string
  code: string
  type: '收入' | '支出'
  nature: string
  amount: string
  period: string
  status: string
  createTime: string
  signTime: string
}
export const initialContracts: ContractRow[] = [
  { id: 'c-1', name: '阳江乡村围栏XXX合同', flowNo: '10236989282819', code: '', type: '支出', nature: '单项合同', amount: '3,000.98', period: '36', status: '起草', createTime: '', signTime: '2021-09-10' },
  { id: 'c-2', name: '阳江乡村围栏XXX合同', flowNo: '10236989201264', code: 'CMGDSD002-01264', type: '支出', nature: '单项合同', amount: '90,000.00', period: '12', status: '已履约', createTime: '2021-09-09', signTime: '2021-09-09' }
]

// IT 任务类型可选项
export const itTaskTypeOptions = [
  '安全交底',
  '现场勘察',
  '需求确认',
  '设备到货',
  '设备安装',
  '安全检查',
  '设备上电',
  '设备调试',
  '软件开发',
  '部署测试',
  '等保密评',
  '项目上线',
  '现场管理'
]

// ============== 通用子组件 ==============

import { ChevronDown, ChevronRight } from 'lucide-react'

// 压缩收起式信息卡
export function InfoCard({
  title,
  expanded,
  onToggle,
  summary,
  children
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  summary: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div
        className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-50 px-4 py-2 rounded-lg"
        onClick={onToggle}
      >
        <div className="w-1 h-3.5 bg-[#1677FF] rounded-sm" />
        <h3 className="text-xs font-semibold text-gray-800">{title}</h3>
        {expanded
          ? <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
        }
        {!expanded && (
          <span className="ml-2 text-xs text-gray-400 truncate">{summary}</span>
        )}
      </div>
      {expanded && (
        <div className="px-4 pb-4">{children}</div>
      )}
    </div>
  )
}

// 只读字段
export function ReadOnlyField({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={`flex items-center min-h-[36px] ${full ? 'col-span-2' : ''}`}>
      <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">{label}</label>
      <div className="flex-1 min-w-0 text-sm text-gray-700">{value}</div>
    </div>
  )
}

// 子区块通用头部
// variant=default：一/二级标题，蓝色竖线图标
// variant=sub：三级标题（子分类，如 CT 任务/IT 任务），浅蓝圆 + 蓝色实心三角形
export function SubSectionHeader({
  title,
  actions,
  variant = 'default'
}: {
  title: string
  actions?: React.ReactNode
  variant?: 'default' | 'sub'
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {variant === 'sub' ? (
          <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <svg width="9" height="8" viewBox="0 0 9 8" className="shrink-0">
              <polygon points="0.5,0.5 8.5,4 0.5,7.5" fill="#1677FF" />
            </svg>
          </div>
        ) : (
          <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        )}
        <h3 className={`font-semibold text-gray-800 ${variant === 'sub' ? 'text-xs' : 'text-sm'}`}>{title}</h3>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

// 通用表格组件
export function DataTable({ columns, rows }: { columns: { key: string; title: string; width?: string; align?: 'left' | 'center' | 'right' }[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-3 py-2 text-xs font-medium text-gray-700 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, rIdx) => (
            <tr key={rIdx} className="border-t border-gray-100 hover:bg-gray-50/50">
              {cells.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-sm text-gray-700 align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// 通用表头按钮（白底蓝边蓝字 + 图标）
export function HeaderAction({ icon, children, onClick, disabled }: { icon?: React.ReactNode; children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
    >
      {icon}
      {children}
    </button>
  )
}

// 表格行内操作按钮（蓝边蓝字，无填充）
export function RowAction({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center px-2 py-0.5 text-xs text-[#1677FF] bg-white border border-[#1677FF] rounded hover:bg-blue-50 transition-colors"
    >
      {children}
    </button>
  )
}

// 分页器（极简）
export function SimplePager({ total, pageSize = 5, page, onChange }: { total: number; pageSize?: number; page: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="flex items-center justify-end gap-2 px-3 py-2 text-xs text-gray-600">
      <span>共 {total} 条</span>
      <select
        value={pageSize}
        onChange={() => {}}
        className="px-2 py-0.5 border border-gray-300 rounded text-xs bg-white"
      >
        <option value="5">5条/页</option>
        <option value="10">10条/页</option>
      </select>
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-1.5 py-0.5 disabled:opacity-30"
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`px-2 py-0.5 rounded ${p === page ? 'bg-[#1677FF] text-white' : 'hover:bg-gray-100'}`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-1.5 py-0.5 disabled:opacity-30"
      >
        ›
      </button>
      <span>跳至</span>
      <input
        type="text"
        defaultValue={page}
        className="w-10 px-1.5 py-0.5 border border-gray-300 rounded text-xs text-center"
      />
      <span>页</span>
    </div>
  )
}
