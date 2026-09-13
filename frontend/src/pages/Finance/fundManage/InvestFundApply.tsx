import { useState, useMemo } from 'react'
import { ArrowLeft, Search, Check, RotateCcw, Upload, X, FileText, Eye, Download } from 'lucide-react'
import { useModal } from '@/components/Modal'
import { getFundApplyDetail, investmentTypeMap, decisionLevelMap } from '@/data/mock'
import type { ContractAttachment } from '@/data/mock'
import ContractAttachments from '@/components/ContractAttachments'
import PersonPicker from '@/components/PersonPicker'
import ProjectSelectModal from '@/components/ProjectSelectModal'

interface InvestFundApplyProps {
  onNavigate: (path: string) => void
  editId?: string
  readOnly?: boolean
  source?: 'ict' | 'gov'
  presetProjectName?: string
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
  city: string
}

const projectList: ProjectInfo[] = [
  { id: 'p1', code: 'PRJ-2026-HF-001', globalCode: 'NET-2026-HF-001', type: 'ICT项目', signMode: '普通项目', customerManager: '张凯', solutionManager: '刘伟', name: '合肥市第一人民医院智慧医疗项目', city: '合肥' },
  { id: 'p2', code: 'PRJ-2026-WH-001', globalCode: 'NET-2026-WH-001', type: 'DICT项目', signMode: '统谈分签项目', customerManager: '李华', solutionManager: '陈晨', name: '芜湖市政务服务中心数字政府项目', city: '芜湖' },
  { id: 'p3', code: 'PRJ-2026-BB-001', globalCode: 'NET-2026-BB-001', type: 'ICT项目', signMode: '框架订单项目', customerManager: '王强', solutionManager: '赵磊', name: '蚌埠市教育局智慧教育项目', city: '蚌埠' },
  { id: 'p4', code: 'PRJ-2026-HF-002', globalCode: 'NET-2026-HF-002', type: '双计项目', signMode: '框架合同项目', customerManager: '赵明', solutionManager: '孙杰', name: '合肥市轨道交通集团智慧交通项目', city: '合肥' },
  { id: 'p5', code: 'PRJ-2026-AH-001', globalCode: 'NET-2026-AH-001', type: 'ICT项目', signMode: '普通项目', customerManager: '杨海波', solutionManager: '周涛', name: '安徽省公安厅智慧城市项目', city: '省公司' },
  { id: 'p6', code: 'PRJ-2026-KM-001', globalCode: 'NET-2026-KM-001', type: 'ICT项目', signMode: '普通项目', customerManager: '张伟', solutionManager: '王涛', name: '昆明市工商银行智能监控系统', city: '昆明' }
]

// 投资类型: 1-纯IT投资 / 2-纯CT投资 / 3-IT+CT投资 / 4-5GToB投资 / 5-IT投资 / 6-CT投资
const investmentTypeOptions = [
  { value: '', label: '请选择投资类型' },
  { value: '1', label: '纯IT投资' },
  { value: '2', label: '纯CT投资' },
  { value: '3', label: 'IT+CT投资' },
  { value: '4', label: '5GToB投资' },
  { value: '5', label: 'IT投资' },
  { value: '6', label: 'CT投资' }
]

// 决策层级: 0-省公司总经理办公会决策 / 1-省公司分管领导专题办公会决策 / 2-省公司分管领导OA签报决策 / 3-省公司各部门评审会议纪要决策
const decisionLevelOptions = [
  { value: '', label: '请选择决策层级' },
  { value: '0', label: '省公司总经理办公会决策' },
  { value: '1', label: '省公司分管领导专题办公会决策' },
  { value: '2', label: '省公司分管领导OA签报决策' },
  { value: '3', label: '省公司各部门评审会议纪要决策' }
]

// 政企项目投资类型（固定枚举）：纯IT投资 / 纯CT投资 / IT+CT投资 / 5GToB投资
const govInvestmentTypeOptions = [
  { value: '', label: '请选择投资类型' },
  { value: '1', label: '纯IT投资' },
  { value: '2', label: '纯CT投资' },
  { value: '3', label: 'IT+CT投资' },
  { value: '4', label: '5GToB投资' }
]

// 归属地市：省公司 + 安徽16个地市
const cityOptions = [
  { value: '', label: '请选择归属地市' },
  { value: '省公司', label: '省公司' },
  { value: '合肥', label: '合肥' },
  { value: '芜湖', label: '芜湖' },
  { value: '蚌埠', label: '蚌埠' },
  { value: '淮南', label: '淮南' },
  { value: '马鞍山', label: '马鞍山' },
  { value: '淮北', label: '淮北' },
  { value: '铜陵', label: '铜陵' },
  { value: '安庆', label: '安庆' },
  { value: '黄山', label: '黄山' },
  { value: '滁州', label: '滁州' },
  { value: '阜阳', label: '阜阳' },
  { value: '宿州', label: '宿州' },
  { value: '六安', label: '六安' },
  { value: '亳州', label: '亳州' },
  { value: '池州', label: '池州' },
  { value: '宣城', label: '宣城' }
]

// 省管交付经理列表（旧系统从配置角色获取: 管华、包善琴、周文明、尤虓虓）
const provinceManagerOptions = [
  { value: '', label: '请选择省管交付经理' },
  { value: 'guanhua', label: '管华' },
  { value: 'baoshanqin', label: '包善琴' },
  { value: 'zhouwenming', label: '周文明' },
  { value: 'youxiaoxiao', label: '尤虓虓' }
]

interface FormData {
  projectName: string
  city: string
  decisionLevel: string
  investType: string
  itInvestAmount: string
  transferNetInvestAmount: string
  transferGeInvestAmount: string
  coreNetInvestAmount: string
  wirelessNetInvestAmount: string
  idcInvestAmount: string
  agreementTime: string
  totalInvestAmount: string
  estimateInvestAmount: string
  totalInvestIncomeAmount: string
  dynamicPayback: string
  netPresentValue: string
  netPresentValueRate: string
  investProjectIrr: string
  processRequire: string
  establishDesc: string
  provinceManager: string
}

// 根据投资类型自动计算总金额（匹配旧系统 computeInvestTotal 逻辑）
function computeTotal(form: FormData): string {
  const toNum = (s: string) => (s && s.length > 0 ? Number(s) : 0)
  const investType = form.investType

  // 纯IT投资 / IT投资
  if (investType === '1' || investType === '5') {
    return String(toNum(form.itInvestAmount))
  }
  // 纯CT投资：传输大网 + 传输政企（传输政企投资固定为0）
  if (investType === '2') {
    return String(toNum(form.transferNetInvestAmount) + toNum(form.transferGeInvestAmount))
  }
  // IT+CT投资：IT + 传输大网 + 传输政企（传输政企投资固定为0）
  if (investType === '3') {
    return String(toNum(form.itInvestAmount) + toNum(form.transferNetInvestAmount) + toNum(form.transferGeInvestAmount))
  }
  // 5GToB投资：IT + 传输大网 + 传输政企 + 核心网 + 无线网
  if (investType === '4') {
    return String(
      toNum(form.itInvestAmount) +
      toNum(form.transferNetInvestAmount) +
      toNum(form.transferGeInvestAmount) +
      toNum(form.coreNetInvestAmount) +
      toNum(form.wirelessNetInvestAmount)
    )
  }
  // CT投资：传输大网 + 传输政企 + 核心网 + 无线网 + IDC
  if (investType === '6') {
    return String(
      toNum(form.transferNetInvestAmount) +
      toNum(form.transferGeInvestAmount) +
      toNum(form.coreNetInvestAmount) +
      toNum(form.wirelessNetInvestAmount) +
      toNum(form.idcInvestAmount)
    )
  }
  return form.totalInvestAmount
}

export default function InvestFundApply({ onNavigate, editId, readOnly, source = 'ict', presetProjectName }: InvestFundApplyProps) {
  const modal = useModal()
  const editingItem = editId ? getFundApplyDetail(editId) : undefined

  const titlePrefix = source === 'gov' ? '政企项目投资类资金申请' : 'ICT项目投资类资金申请'

  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(() => {
    if (presetProjectName) return projectList.find(p => p.name === presetProjectName) || null
    if (!editingItem) return null
    return projectList.find(p => p.code === editingItem.projectCode) || null
  })
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('')

  const [form, setForm] = useState<FormData>(() => ({
    projectName: presetProjectName || editingItem?.projectName || '',
    city: '',
    decisionLevel: editingItem?.decisionLevel || '',
    investType: editingItem?.investmentType || '',
    itInvestAmount: '',
    transferNetInvestAmount: '',
    transferGeInvestAmount: '',
    coreNetInvestAmount: '',
    wirelessNetInvestAmount: '',
    idcInvestAmount: '',
    agreementTime: editingItem?.agreementPeriod || '',
    totalInvestAmount: editingItem?.applyAmount || '',
    estimateInvestAmount: '',
    totalInvestIncomeAmount: '',
    dynamicPayback: editingItem?.paybackPeriod || '',
    netPresentValue: '',
    netPresentValueRate: '',
    investProjectIrr: '',
    processRequire: editingItem?.constructionSchedule || '',
    establishDesc: editingItem?.applyContent || '',
    provinceManager: ''
  }))

  // ========== 附件（自动带入，仅展示，不可上传）==========
  // 转换为 ContractAttachment[] 格式，复用前向合同解析页面的项目附件组件
  const mockProjectAttachments: Record<string, ContractAttachment[]> = {
    'p1': [
      { id: 'p1-d1', name: '合肥市第一人民医院_签报文件.pdf', size: '1,245.6 KB', uploadTime: '2026-05-10 09:30', tag: '签报文件' },
      { id: 'p1-f1', name: '合肥市第一人民医院_前向合同.pdf', size: '3,512.2 KB', uploadTime: '2026-05-12 14:20', tag: '前向合同' },
      { id: 'p1-b1', name: '合肥市第一人民医院_中标通知书.pdf', size: '856.4 KB', uploadTime: '2026-05-08 16:45', tag: '中标通知书' }
    ],
    'p2': [
      { id: 'p2-d1', name: '芜湖市政务服务中心_签报文件.pdf', size: '1,102.3 KB', uploadTime: '2026-05-15 10:15', tag: '签报文件' },
      { id: 'p2-b1', name: '芜湖市政务服务中心_中标通知书.pdf', size: '724.1 KB', uploadTime: '2026-05-13 11:30', tag: '中标通知书' }
    ],
    'p3': [
      { id: 'p3-d1', name: '蚌埠市教育局_签报文件.pdf', size: '985.7 KB', uploadTime: '2026-05-18 09:00', tag: '签报文件' },
      { id: 'p3-f1', name: '蚌埠市教育局_前向合同.pdf', size: '2,876.9 KB', uploadTime: '2026-05-20 15:45', tag: '前向合同' }
    ],
    'p4': [
      { id: 'p4-d1', name: '合肥市轨道交通_签报文件.pdf', size: '1,532.4 KB', uploadTime: '2026-05-22 13:20', tag: '签报文件' },
      { id: 'p4-f1', name: '合肥市轨道交通_前向合同.pdf', size: '4,210.6 KB', uploadTime: '2026-05-24 10:10', tag: '前向合同' }
    ],
    'p5': [
      { id: 'p5-d1', name: '安徽省公安厅_签报文件.pdf', size: '1,378.2 KB', uploadTime: '2026-05-25 14:30', tag: '签报文件' },
      { id: 'p5-b1', name: '安徽省公安厅_中标通知书.pdf', size: '912.8 KB', uploadTime: '2026-05-23 16:00', tag: '中标通知书' }
    ],
    'p6': [
      { id: 'p6-d1', name: '昆明市工商银行_签报文件.pdf', size: '1,156.5 KB', uploadTime: '2026-05-28 11:45', tag: '签报文件' },
      { id: 'p6-f1', name: '昆明市工商银行_前向合同.pdf', size: '3,024.1 KB', uploadTime: '2026-05-30 09:15', tag: '前向合同' }
    ]
  }

  const projectAttachments: ContractAttachment[] = selectedProject
    ? mockProjectAttachments[selectedProject.id] || []
    : []

  // ========== 流程信息 ==========
  // 下一步环节（只读，系统按流程自动流转）
  const nextNode = '投资类资金申请审批'
  // 下一步处理人（三级经理（正））— 人员选项
  const handlerOptions = [
    { name: '刘建国', dept: '省公司 / 三级经理（正）' },
    { name: '陈志强', dept: '省公司 / 三级经理（正）' },
    { name: '赵明辉', dept: '省公司 / 三级经理（正）' },
    { name: '孙伟东', dept: '省公司 / 三级经理（正）' },
    { name: '李建华', dept: '省公司 / 三级经理（正）' }
  ]
  const [selectedNextHandler, setSelectedNextHandler] = useState('')

  // ========== 投资类型联动逻辑（匹配旧系统 v-if 条件）==========
  // IT投资: 纯IT投资(1)、IT投资(5)、IT+CT投资(3)、5GToB投资(4)时展示
  const showItInvest = ['1', '3', '4', '5'].includes(form.investType)
  // 传输大网/政企: 纯CT投资(2)、IT+CT投资(3)、5GToB投资(4)、CT投资(6)时展示
  const showTransferFields = ['2', '3', '4', '6'].includes(form.investType)
  // 核心网/无线网: 5GToB(4)、CT投资(6)时展示
  const showCoreWireless = ['4', '6'].includes(form.investType)
  // IDC投资: 仅 CT投资(6)时展示
  const showIdc = form.investType === '6'
  // 除CT投资(6)外，都展示以下字段：协议期、预计总投入、总收入等
  const showNonCtFields = form.investType !== '6' && form.investType !== ''
  // 投资申请总金额：任一投资类型选中即展示（自动计算，不可编辑）
  const showTotalAmount = form.investType !== ''
  // 省管交付经理：仅纯IT投资(1)、纯CT投资(2)、IT+CT投资(3)、5GToB投资(4)时展示
  const showProvinceManager = ['1', '2', '3', '4'].includes(form.investType)

  const handleOpenProjectModal = () => {
    if (readOnly || presetProjectName) return
    setSelectedProjectId(selectedProject?.id || '')
    setShowProjectModal(true)
  }

  const handleConfirmProject = () => {
    if (!selectedProjectId) { alert('请选择一个项目'); return }
    const project = projectList.find(p => p.id === selectedProjectId)
    if (project) {
      setSelectedProject(project)
      setForm(prev => {
        // 根据归属地市确定可选投资类型：省公司 → IT投资/CT投资；其他地市 → 纯IT/纯CT/IT+CT/5GToB
        const allowed = project.city === '省公司' ? ['5', '6'] : ['1', '2', '3', '4']
        const investType = allowed.includes(prev.investType) ? prev.investType : ''
        const updated = { ...prev, projectName: project.name, investType }
        if (investType !== prev.investType) {
          updated.totalInvestAmount = computeTotal(updated)
        }
        return updated
      })
    }
    setShowProjectModal(false)
  }

  // 根据归属地市动态过滤投资类型选项
  // 省公司 → 仅 IT投资(5)、CT投资(6)；其他地市 → 纯IT投资(1)、纯CT投资(2)、IT+CT投资(3)、5GToB投资(4)
  const availableInvestmentTypeOptions = useMemo(() => {
    const allowed = selectedProject?.city === '省公司' ? ['5', '6'] : ['1', '2', '3', '4']
    return investmentTypeOptions.filter(o => o.value === '' || allowed.includes(o.value))
  }, [selectedProject?.city])

  const handleChange = (key: keyof FormData, value: string) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value }
      // 切换投资类型时，根据规则设置默认值并重新计算总金额
      if (key === 'investType') {
        // 纯CT(2)、IT+CT(3)、5GToB(4) → 传输政企投资默认为0
        if (value === '2' || value === '3' || value === '4') {
          updated.transferGeInvestAmount = '0'
        }
      }
      // 切换投资类型或修改任一子金额字段 → 重新计算投资申请总金额
      if (
        key === 'investType' ||
        key === 'itInvestAmount' ||
        key === 'transferNetInvestAmount' ||
        key === 'transferGeInvestAmount' ||
        key === 'coreNetInvestAmount' ||
        key === 'wirelessNetInvestAmount' ||
        key === 'idcInvestAmount'
      ) {
        updated.totalInvestAmount = computeTotal(updated)
      }
      return updated
    })
  }

  // 子金额失焦时兜底再计算一次（避免 onChange 与状态不同步）
  const handleSubAmountBlur = () => {
    setForm(prev => ({ ...prev, totalInvestAmount: computeTotal(prev) }))
  }

  // 传输政企投资变更时重新计算总金额
  const handleTransferGeChange = (value: string) => {
    setForm(prev => {
      const updated = {
        ...prev,
        transferGeInvestAmount: value
      }
      updated.totalInvestAmount = computeTotal(updated)
      return updated
    })
  }

  const validate = (): string[] => {
    const errors: string[] = []
    if (!selectedProject && !form.projectName) errors.push(source === 'gov' ? '请输入项目名称' : '请选择项目')
    if (source === 'gov' && !form.city) errors.push('请选择归属地市')
    if (source === 'gov' && !govAttachments.decision) errors.push('请上传签报文件')
    if (source === 'gov' && !govAttachments.forward && !govAttachments.notice) errors.push('请上传前向合同或中标通知书（至少一种）')
    if (form.investType !== '6' && !form.decisionLevel) errors.push('请选择决策层级')
    if (!form.investType) errors.push('请选择投资类型')
    if (showItInvest && !form.itInvestAmount.trim()) errors.push('请输入IT投资金额')
    if (showTransferFields) {
      if (!form.transferNetInvestAmount.trim()) errors.push('请输入传输大网投资金额')
      if (!form.transferGeInvestAmount.trim()) errors.push('请输入传输政企投资金额')
    }
    if (showCoreWireless) {
      if (!form.coreNetInvestAmount.trim()) errors.push('请输入核心网投资金额')
      if (!form.wirelessNetInvestAmount.trim()) errors.push('请输入无线网投资金额')
    }
    if (showIdc && !form.idcInvestAmount.trim()) {
      errors.push('请输入IDC投资金额')
    }
    if (showProvinceManager && !form.provinceManager) errors.push('请选择省管交付经理')
    if (!readOnly && !selectedNextHandler) errors.push('请选择下一步处理人')
    if (showNonCtFields) {
      if (!form.agreementTime.trim()) errors.push('请输入协议期')
      if (!form.totalInvestAmount.trim()) errors.push('请输入投资申请总金额')
      if (!form.estimateInvestAmount.trim()) errors.push('请输入预计总投入')
      if (!form.totalInvestIncomeAmount.trim()) errors.push('请输入总收入')
      if (!form.processRequire) errors.push('请选择工程进度要求')
      if (!form.establishDesc.trim()) errors.push('请输入建设内容')
    }
    return errors
  }

  const handleSubmit = () => {
    const errors = validate()
    if (errors.length > 0) { alert(errors.join('\n')); return }

    const action = editId ? '修改' : '提交'
    modal.confirm(`确定${action}${titlePrefix}吗？`, `${action}申请`).then(ok => {
      if (ok) {
        alert(`${action}成功`)
        onNavigate?.('/finance/fund/ict-invest')
      }
    })
  }

  // ========== 附件处理 ==========
  const handleCancel = () => onNavigate?.('/finance/fund/ict-invest')

  // ========== 政企附件上传（签报文件/前向合同/中标通知书，初始化为空，可上传）==========
  const govAttachmentTags = [
    { key: 'decision', label: '签报文件' },
    { key: 'forward', label: '前向合同' },
    { key: 'notice', label: '中标通知书' }
  ] as const
  type GovAttachmentKey = typeof govAttachmentTags[number]['key']
  const [govAttachments, setGovAttachments] = useState<Record<GovAttachmentKey, { name: string; size: string } | null>>({
    decision: null,
    forward: null,
    notice: null
  })

  const handleGovUploadClick = (key: GovAttachmentKey) => {
    if (readOnly) return
    const label = govAttachmentTags.find(t => t.key === key)?.label || '附件'
    setGovAttachments(prev => ({
      ...prev,
      [key]: { name: `${label}.pdf`, size: '1,024.5 KB' }
    }))
  }

  const handleGovRemoveFile = (key: GovAttachmentKey) => {
    setGovAttachments(prev => ({ ...prev, [key]: null }))
  }

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 返回条 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button onClick={handleCancel} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">
              {readOnly ? `${titlePrefix}详情` : editId ? `编辑${titlePrefix}` : titlePrefix}
            </h2>
          </div>
        </div>

        {/* Panel 1: 项目信息 — 严格匹配旧系统 projectInvestAmountApplyEdit.vue */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">{source === 'gov' ? '项目信息' : '资金申请信息'}</h3>
          </div>
          <div className="px-4 py-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {/* 1. 项目名称 */}
              <div className="flex items-center min-h-[36px]">
                <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                  <span className="text-red-500 mr-0.5">*</span>项目名称
                </label>
                <div className="flex-1 min-w-0">
                  {source === 'gov' ? (
                    readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.projectName || '-'}</div>
                    ) : (
                      <input type="text" value={form.projectName} onChange={e => handleChange('projectName', e.target.value)}
                        placeholder="请输入项目名称"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )
                  ) : presetProjectName ? (
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {selectedProject?.name || form.projectName || '-'}
                    </div>
                  ) : (
                    <div className="relative" onClick={handleOpenProjectModal}>
                      <input type="text" value={selectedProject?.name || form.projectName} placeholder="请选择项目" readOnly
                        className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:border-blue-500" />
                      {!readOnly && <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 cursor-pointer" />}
                    </div>
                  )}
                </div>
              </div>

              {/* 1.5 归属地市 */}
              <div className="flex items-center min-h-[36px]">
                <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                  {source === 'gov' && <span className="text-red-500 mr-0.5">*</span>}归属地市
                </label>
                <div className="flex-1 min-w-0">
                  {source === 'gov' ? (
                    readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.city || '-'}</div>
                    ) : (
                      <select value={form.city} onChange={e => handleChange('city', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500">
                        {cityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    )
                  ) : (
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {selectedProject?.city || '-'}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. 投资类型 */}
              <div className="flex items-center min-h-[36px]">
                <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                  <span className="text-red-500 mr-0.5">*</span>投资类型
                </label>
                <div className="flex-1 min-w-0">
                  {readOnly ? (
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {investmentTypeMap[form.investType] || '-'}
                    </div>
                  ) : (
                    <select value={form.investType} onChange={e => handleChange('investType', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500">
                      {(source === 'gov' ? govInvestmentTypeOptions : availableInvestmentTypeOptions).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {/* 3. 决策层级 — CT投资(6)时不展示 */}
              {form.investType !== '6' && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>决策层级
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                        {decisionLevelMap[form.decisionLevel] || '-'}
                      </div>
                    ) : (
                      <select value={form.decisionLevel} onChange={e => handleChange('decisionLevel', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500">
                        {decisionLevelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* 4. IT投资(不含税，元) — v-if investType !== "2" */}
              {showItInvest && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>IT投资(不含税，元)
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.itInvestAmount || '-'}</div>
                    ) : (
                      <input type="number" value={form.itInvestAmount} onChange={e => handleChange('itInvestAmount', e.target.value)}
                        onBlur={handleSubAmountBlur}
                        placeholder="请输入IT投资金额"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 5. 传输大网投资(不含税，元) — v-if investType !== "1" */}
              {showTransferFields && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>传输大网投资(不含税，元)
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.transferNetInvestAmount || '-'}</div>
                    ) : (
                      <input type="number" value={form.transferNetInvestAmount} onChange={e => handleChange('transferNetInvestAmount', e.target.value)}
                        onBlur={handleSubAmountBlur}
                        placeholder="请输入传输大网投资金额"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 6. 传输政企投资(不含税，元) — v-if investType !== "1" */}
              {showTransferFields && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>传输政企投资(不含税，元)
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.transferGeInvestAmount || '-'}</div>
                    ) : (
                      <input type="number" value={form.transferGeInvestAmount} onChange={e => handleTransferGeChange(e.target.value)}
                        onBlur={handleSubAmountBlur}
                        placeholder="请输入传输政企投资金额"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 8. 核心网投资（不含税，元）— 5GToB / CT投资 时展示 */}
              {showCoreWireless && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>核心网投资（不含税，元）
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.coreNetInvestAmount || '-'}</div>
                    ) : (
                      <input type="number" value={form.coreNetInvestAmount} onChange={e => handleChange('coreNetInvestAmount', e.target.value)}
                        onBlur={handleSubAmountBlur}
                        placeholder="请输入核心网投资金额"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 9. 无线网投资（不含税，元）— 5GToB / CT投资 时展示 */}
              {showCoreWireless && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>无线网投资（不含税，元）
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.wirelessNetInvestAmount || '-'}</div>
                    ) : (
                      <input type="number" value={form.wirelessNetInvestAmount} onChange={e => handleChange('wirelessNetInvestAmount', e.target.value)}
                        onBlur={handleSubAmountBlur}
                        placeholder="请输入无线网投资金额"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 9.5 IDC投资（不含税，元）— 仅 CT投资 时展示 */}
              {showIdc && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>IDC投资（不含税，元）
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.idcInvestAmount || '-'}</div>
                    ) : (
                      <input type="number" value={form.idcInvestAmount} onChange={e => handleChange('idcInvestAmount', e.target.value)}
                        onBlur={handleSubAmountBlur}
                        placeholder="请输入IDC投资金额"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 11. 投资申请总金额（不含税，元） — 不可编辑，自动计算 */}
              {showTotalAmount && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>投资申请总金额（不含税，元）
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.totalInvestAmount || '-'}</div>
                  </div>
                </div>
              )}

              {/* 10. 协议期（年） — 除CT投资外展示 */}
              {showNonCtFields && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>协议期（年）
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.agreementTime || '-'}</div>
                    ) : (
                      <input type="number" value={form.agreementTime} onChange={e => handleChange('agreementTime', e.target.value)}
                        placeholder="请输入协议期"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 12. 预计总投入（不含税，元） — 除CT投资外展示 */}
              {showNonCtFields && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>预计总投入（不含税，元）
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.estimateInvestAmount || '-'}</div>
                    ) : (
                      <input type="number" value={form.estimateInvestAmount} onChange={e => handleChange('estimateInvestAmount', e.target.value)}
                        placeholder="请输入预计总投入"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 13. 总收入（不含税，元） — 除CT投资外展示 */}
              {showNonCtFields && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>总收入（不含税，元）
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.totalInvestIncomeAmount || '-'}</div>
                    ) : (
                      <input type="number" value={form.totalInvestIncomeAmount} onChange={e => handleChange('totalInvestIncomeAmount', e.target.value)}
                        placeholder="请输入总收入"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 14. 动态回收期（年） — 除CT投资外展示 */}
              {showNonCtFields && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    动态回收期（年）
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.dynamicPayback || '-'}</div>
                    ) : (
                      <input type="number" value={form.dynamicPayback} onChange={e => handleChange('dynamicPayback', e.target.value)}
                        placeholder="请输入动态回收期"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 15. 项目净现值（元） — 除CT投资外展示 */}
              {showNonCtFields && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    项目净现值（元）
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.netPresentValue || '-'}</div>
                    ) : (
                      <input type="number" value={form.netPresentValue} onChange={e => handleChange('netPresentValue', e.target.value)}
                        placeholder="请输入项目净现值"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 16. 项目净现值率（%） — 除CT投资外展示 */}
              {showNonCtFields && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    项目净现值率（%）
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.netPresentValueRate || '-'}</div>
                    ) : (
                      <input type="number" value={form.netPresentValueRate} onChange={e => handleChange('netPresentValueRate', e.target.value)}
                        placeholder="请输入项目净现值率"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 17. 项目内部收益率（%） — 除CT投资外展示 */}
              {showNonCtFields && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    项目内部收益率（%）
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.investProjectIrr || '-'}</div>
                    ) : (
                      <input type="number" value={form.investProjectIrr} onChange={e => handleChange('investProjectIrr', e.target.value)}
                        placeholder="请输入项目内部收益率"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 18. 工程进度要求 — 除CT投资外展示 */}
              {showNonCtFields && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>工程进度要求
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">{form.processRequire || '-'}</div>
                    ) : (
                      <input type="date" value={form.processRequire} onChange={e => handleChange('processRequire', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                    )}
                  </div>
                </div>
              )}

              {/* 20. 省管交付经理 — 仅纯IT/纯CT/IT+CT/5GToB投资展示，与工程进度要求并排 */}
              {showProvinceManager && (
                <div className="flex items-center min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">
                    <span className="text-red-500 mr-0.5">*</span>省管交付经理
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                        {provinceManagerOptions.find(o => o.value === form.provinceManager)?.label || '-'}
                      </div>
                    ) : (
                      <select value={form.provinceManager} onChange={e => handleChange('provinceManager', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500">
                        {provinceManagerOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 19. 建设内容 — 除CT投资外展示，merge=3 整行 textarea */}
            {showNonCtFields && (
              <div className="mt-3">
                <div className="flex items-start min-h-[36px]">
                  <label className="w-52 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2 pt-2">
                    <span className="text-red-500 mr-0.5">*</span>建设内容
                  </label>
                  <div className="flex-1 min-w-0">
                    {readOnly ? (
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 whitespace-pre-wrap">{form.establishDesc || '-'}</div>
                    ) : (
                      <textarea value={form.establishDesc} onChange={e => handleChange('establishDesc', e.target.value)}
                        placeholder="请输入建设内容" rows={4}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: 附件 */}
        {source === 'gov' ? (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">项目附件</h3>
            </div>
            <div className="px-4 py-4">
              <div className="px-3 py-2 text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2 mb-3">
                <span className="shrink-0">⚠</span>
                <span>温馨提示：请上传签报文件、前向合同、中标通知书，其中前向合同或中标通知书至少上传一种</span>
              </div>
              <div className="space-y-3">
                {govAttachmentTags.map(tag => {
                  const file = govAttachments[tag.key]
                  return (
                    <div key={tag.key} className="flex items-center gap-3">
                      <label className="w-24 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap">
                        {tag.key === 'decision' && <span className="text-red-500 mr-0.5">*</span>}
                        {tag.label}
                      </label>
                      <div className="flex-1 min-w-0">
                        {file ? (
                          <div className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md">
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-[#1677FF] shrink-0" />
                              <span className="text-sm text-gray-800 truncate">{file.name}</span>
                              <span className="text-xs text-gray-400 shrink-0">{file.size}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-3">
                              <button type="button" className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-blue-700 whitespace-nowrap">
                                <Eye className="w-3.5 h-3.5" />
                                预览
                              </button>
                              <button type="button" className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-blue-700 whitespace-nowrap">
                                <Download className="w-3.5 h-3.5" />
                                下载
                              </button>
                              {!readOnly && (
                                <button type="button" onClick={() => handleGovRemoveFile(tag.key)}
                                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0">
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <button type="button" onClick={() => handleGovUploadClick(tag.key)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-md hover:border-[#1677FF] hover:text-[#1677FF] transition-colors">
                            <Upload className="w-4 h-4" />
                            上传{tag.label}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <ContractAttachments attachments={projectAttachments} defaultExpanded={false} />
        )}

        {/* Panel 3: 流程信息 */}
        {!readOnly && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">流程信息</h3>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步环节</label>
                  <div className="flex-1 min-w-0">
                    <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {nextNode}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap">
                    <span className="text-red-500 mr-0.5">*</span>下一步处理人
                  </label>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0 whitespace-nowrap">
                        提单人三级领导正
                      </span>
                      <div className="flex-1 min-w-0">
                        <PersonPicker
                          value={selectedNextHandler}
                          onChange={setSelectedNextHandler}
                          options={handlerOptions}
                          placeholder="请选择下一步处理人"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 底部操作栏 */}
        {!readOnly && (
          <div className="bg-white rounded-lg shadow-sm px-4 py-4">
            <div className="flex justify-center gap-3">
              <button type="button" onClick={handleCancel}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" />取消
              </button>
              <button type="button" onClick={handleSubmit}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5">
                <Check className="w-4 h-4" />{editId ? '保存' : '提交'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 项目选择弹窗（复用合同起草页面的选择项目组件） */}
      <ProjectSelectModal
        open={showProjectModal}
        projects={projectList}
        selectedId={selectedProjectId}
        onSelect={setSelectedProjectId}
        onClose={() => setShowProjectModal(false)}
        onConfirm={handleConfirmProject}
      />
    </div>
  )
}
