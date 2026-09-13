import { useState, useMemo } from 'react'
import { ArrowLeft, Search, Check, RotateCcw, Plus, Trash2, Upload, FileText, X } from 'lucide-react'
import { useModal } from '@/components/Modal'
import { getFundApplyDetail } from '@/data/mock'
import ProjectSelectModal from '@/components/ProjectSelectModal'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'

interface CostFundApplyProps {
  onNavigate: (path: string) => void
  editId?: string
  readOnly?: boolean
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
  initMethod: string
  customerName: string
  customerCode: string
  creator: string
}

const projectList: ProjectInfo[] = [
  { id: 'p1', code: 'PRJ-2026-HF-001', globalCode: 'NET-2026-HF-001', type: 'ICT项目', signMode: '普通项目', customerManager: '张凯', solutionManager: '刘伟', initMethod: '普通立项', customerName: '合肥市第一人民医院', customerCode: 'CUS-HF-001', creator: '张凯', name: '合肥市第一人民医院智慧医疗项目' },
  { id: 'p2', code: 'PRJ-2026-WH-001', globalCode: 'NET-2026-WH-001', type: 'DICT项目', signMode: '统谈分签项目', customerManager: '李华', solutionManager: '陈晨', initMethod: '统谈分签', customerName: '芜湖市政务服务中心', customerCode: 'CUS-WH-001', creator: '李华', name: '芜湖市政务服务中心数字政府项目' },
  { id: 'p3', code: 'PRJ-2026-BB-001', globalCode: 'NET-2026-BB-001', type: 'ICT项目', signMode: '框架订单项目', customerManager: '王强', solutionManager: '赵磊', initMethod: '普通立项', customerName: '蚌埠市教育局', customerCode: 'CUS-BB-001', creator: '王强', name: '蚌埠市教育局智慧教育项目' },
  { id: 'p4', code: 'PRJ-2026-HF-002', globalCode: 'NET-2026-HF-002', type: '双计项目', signMode: '框架合同项目', customerManager: '赵明', solutionManager: '孙杰', initMethod: '统谈分签', customerName: '合肥市轨道交通集团有限公司', customerCode: 'CUS-HF-002', creator: '赵明', name: '合肥市轨道交通集团智慧交通项目' },
  { id: 'p5', code: 'PRJ-2026-AH-001', globalCode: 'NET-2026-AH-001', type: 'ICT项目', signMode: '普通项目', customerManager: '杨海波', solutionManager: '周涛', initMethod: '普通立项', customerName: '安徽省公安厅', customerCode: 'CUS-AH-001', creator: '杨海波', name: '安徽省公安厅智慧城市项目' },
  { id: 'p6', code: 'PRJ-2026-KM-001', globalCode: 'NET-2026-KM-001', type: 'ICT项目', signMode: '普通项目', customerManager: '张伟', solutionManager: '王涛', initMethod: '普通立项', customerName: '昆明市工商银行', customerCode: 'CUS-KM-001', creator: '张伟', name: '昆明市工商银行智能监控系统' }
]

const projectTypeOptions = [
  { value: '', label: '请选择项目类别' },
  { value: '01', label: '自结项目' },
  { value: '02', label: '支付类预算项目' },
  { value: '03', label: '虚拟预算项目' },
  { value: '04', label: '统签统结-总项目' },
  { value: '05', label: '统签分结-总项目' },
  { value: '06', label: '跨组织-总项目' }
]

const expensesTypeOptions = [
  { value: '', label: '请选择开支类别' },
  { value: '01', label: '物资-摊销' },
  { value: '02', label: '物资-非摊销' },
  { value: '03', label: '服务-摊销' },
  { value: '04', label: '服务-非摊销' }
]

const projectClassOptions = [
  { value: '', label: '请选择项目分类' },
  { value: '01', label: '其他项目' },
  { value: '02', label: 'ICT项目（正净现值）' },
  { value: '03', label: '已经总办会决策项目' }
]

const strategyLabelOptions = [
  { value: '', label: '请选择战略标签' },
  { value: '01', label: '智慧中台' },
  { value: '02', label: '算力网络' },
  { value: '03', label: '科技研发投入' },
  { value: '04', label: '5G运营' },
  { value: '05', label: '无' }
]

// 申请人SMAP账号选项（选择后自动填充申请公司，不可修改）
const applicantOptions = [
  { account: 'zhangkai001', name: '张凯', companyCode: 'AH-HF', companyName: '安徽移动合肥分公司' },
  { account: 'liming001', name: '李明', companyCode: 'AH-WH', companyName: '安徽移动芜湖分公司' },
  { account: 'zhoumin001', name: '周敏', companyCode: 'AH-BB', companyName: '安徽移动蚌埠分公司' }
]

const budgetYearOptions = [
  { value: '2026', label: '2026年' },
  { value: '2027', label: '2027年' },
  { value: '2028', label: '2028年' }
]

const businessClassOptions = [
  { value: 'IT001', label: 'IT设备-01' },
  { value: 'IT002', label: 'IT设备-02' },
  { value: 'SW001', label: '软件服务-01' },
  { value: 'SW002', label: '软件服务-02' },
  { value: 'FW001', label: '技术服务-01' },
  { value: 'FW002', label: '技术服务-02' }
]

const businessSmClassOptions: Record<string, { value: string; label: string }[]> = {
  'IT001': [{ value: 'IT00101', label: '服务器' }, { value: 'IT00102', label: '存储设备' }],
  'IT002': [{ value: 'IT00201', label: '网络设备' }, { value: 'IT00202', label: '安全设备' }],
  'SW001': [{ value: 'SW00101', label: '操作系统' }, { value: 'SW00102', label: '数据库' }],
  'SW002': [{ value: 'SW00201', label: '应用软件' }, { value: 'SW00202', label: '中间件' }],
  'FW001': [{ value: 'FW00101', label: '实施服务' }, { value: 'FW00102', label: '咨询服务' }],
  'FW002': [{ value: 'FW00201', label: '运维服务' }, { value: 'FW00202', label: '培训服务' }]
}

const activityTypeOptions = [
  { value: 'ACT01', label: '新建项目' },
  { value: 'ACT02', label: '扩容项目' },
  { value: 'ACT03', label: '改造项目' },
  { value: 'ACT04', label: '维保项目' }
]

// ============================================================
// 业务大类选择弹框 mock 数据（复制自发起预付款页面）
// ============================================================
interface BusinessCategoryOption {
  id: string
  bizCategoryCode: string
  bizCategoryName: string
  bizSubCategoryCode: string
  bizSubCategoryName: string
  bizActivityCode: string
  bizActivityName: string
  taxRate: string
}

const mockBusinessCategoryList: BusinessCategoryOption[] = [
  { id: 'bc-1', bizCategoryCode: 'DK001', bizCategoryName: 'ICT项目成本', bizSubCategoryCode: 'DK00101', bizSubCategoryName: '硬件设备', bizActivityCode: 'HD001', bizActivityName: '设备采购', taxRate: '13%' },
  { id: 'bc-2', bizCategoryCode: 'DK001', bizCategoryName: 'ICT项目成本', bizSubCategoryCode: 'DK00102', bizSubCategoryName: '技术服务', bizActivityCode: 'JS001', bizActivityName: '系统集成', taxRate: '6%' },
  { id: 'bc-3', bizCategoryCode: 'DK001', bizCategoryName: 'ICT项目成本', bizSubCategoryCode: 'DK00102', bizSubCategoryName: '技术服务', bizActivityCode: 'JS002', bizActivityName: '软件开发', taxRate: '6%' },
  { id: 'bc-4', bizCategoryCode: 'DK001', bizCategoryName: 'ICT项目成本', bizSubCategoryCode: 'DK00102', bizSubCategoryName: '技术服务', bizActivityCode: 'JS003', bizActivityName: '运维服务', taxRate: '6%' },
  { id: 'bc-5', bizCategoryCode: 'DK001', bizCategoryName: 'ICT项目成本', bizSubCategoryCode: 'DK00101', bizSubCategoryName: '硬件设备', bizActivityCode: 'HD002', bizActivityName: '商品销售', taxRate: '13%' }
]

// 业务明细行
interface BusinessTypeRow {
  key: string
  budgetYear: string
  classCode: string
  className: string
  classSmCode: string
  classSmName: string
  activityCode: string
  activityName: string
  declareAmount: string
  remark: string
}

let rowKeyCounter = 0
const newRowKey = () => `biz-${Date.now()}-${++rowKeyCounter}`

// 金额解析（去掉千分位逗号）与格式化（千分位分隔，最多两位小数）
const parseAmount = (v: string): number => {
  const num = parseFloat(v.replace(/,/g, '').trim())
  return isNaN(num) ? 0 : num
}
const formatAmount = (n: number): string => {
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const createEmptyBusinessRow = (): BusinessTypeRow => ({
  key: newRowKey(),
  budgetYear: '2026',
  classCode: '',
  className: '',
  classSmCode: '',
  classSmName: '',
  activityCode: '',
  activityName: '',
  declareAmount: '',
  remark: ''
})

interface CostForm {
  budgetProjectName: string
  managerCode: string
  companyCode: string
  companyName: string
  budgetDeptName: string
  totalAmount: string
  projectStartTime: string
  projectEndTime: string
  projectType: string
  expensesType: string
  projectClass: string
  strategyLabel: string
}

export default function CostFundApply({ onNavigate, editId, readOnly, presetProjectName }: CostFundApplyProps) {
  const modal = useModal()
  const editingItem = editId ? getFundApplyDetail(editId) : undefined
  const editingApplicant = editingItem?.applyUser
    ? applicantOptions.find(o => o.name === editingItem.applyUser)
    : undefined

  const [selectedProject, setSelectedProject] = useState<ProjectInfo | null>(() => {
    if (presetProjectName) return projectList.find(p => p.name === presetProjectName) || null
    if (!editingItem) return null
    return projectList.find(p => p.code === editingItem.projectCode) || null
  })
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('')

  const [form, setForm] = useState<CostForm>({
    budgetProjectName: presetProjectName || editingItem?.projectName || '',
    managerCode: editingApplicant?.account || 'zhangkai001',
    companyCode: editingApplicant?.companyCode || 'AH-HF',
    companyName: editingApplicant?.companyName || '安徽移动合肥分公司',
    budgetDeptName: '政企客户部',
    totalAmount: editingItem?.applyAmount || '',
    projectStartTime: editingItem?.createTime?.split(' ')[0] || '',
    projectEndTime: '',
    projectType: '',
    expensesType: '',
    projectClass: '',
    strategyLabel: ''
  })

  // 业务明细行
  const [businessRows, setBusinessRows] = useState<BusinessTypeRow[]>([createEmptyBusinessRow()])

  // ========== 业务大类选择弹框状态（复制自发起预付款页面） ==========
  const [bizCategoryModalVisible, setBizCategoryModalVisible] = useState(false)
  const [bizCategoryTargetRowKey, setBizCategoryTargetRowKey] = useState<string>('')
  const [bizModalSelectedId, setBizModalSelectedId] = useState<string>('')
  const [bizSearchCategoryCode, setBizSearchCategoryCode] = useState('')
  const [bizSearchCategoryName, setBizSearchCategoryName] = useState('')
  const [bizSearchSubCategoryCode, setBizSearchSubCategoryCode] = useState('')
  const [bizSearchSubCategoryName, setBizSearchSubCategoryName] = useState('')
  const [bizSearchActivityCode, setBizSearchActivityCode] = useState('')
  const [bizSearchActivityName, setBizSearchActivityName] = useState('')
  const [bizSubmittedFilter, setBizSubmittedFilter] = useState({
    categoryCode: '',
    categoryName: '',
    subCategoryCode: '',
    subCategoryName: '',
    activityCode: '',
    activityName: ''
  })

  const bizFilteredList = useMemo(() => {
    return mockBusinessCategoryList.filter(b =>
      (!bizSubmittedFilter.categoryCode || b.bizCategoryCode.includes(bizSubmittedFilter.categoryCode)) &&
      (!bizSubmittedFilter.categoryName || b.bizCategoryName.includes(bizSubmittedFilter.categoryName)) &&
      (!bizSubmittedFilter.subCategoryCode || b.bizSubCategoryCode.includes(bizSubmittedFilter.subCategoryCode)) &&
      (!bizSubmittedFilter.subCategoryName || b.bizSubCategoryName.includes(bizSubmittedFilter.subCategoryName)) &&
      (!bizSubmittedFilter.activityCode || b.bizActivityCode.includes(bizSubmittedFilter.activityCode)) &&
      (!bizSubmittedFilter.activityName || b.bizActivityName.includes(bizSubmittedFilter.activityName))
    )
  }, [bizSubmittedFilter])

  // 打开业务大类选择弹框
  const handleOpenBizCategoryModal = (rowKey: string) => {
    setBizCategoryTargetRowKey(rowKey)
    const currentRow = businessRows.find(r => r.key === rowKey)
    setBizModalSelectedId(currentRow?.classCode ? (mockBusinessCategoryList.find(b => b.bizCategoryCode === currentRow.classCode && b.bizSubCategoryCode === currentRow.classSmCode && b.bizActivityCode === currentRow.activityCode)?.id || '') : '')
    setBizSearchCategoryCode('')
    setBizSearchCategoryName('')
    setBizSearchSubCategoryCode('')
    setBizSearchSubCategoryName('')
    setBizSearchActivityCode('')
    setBizSearchActivityName('')
    setBizSubmittedFilter({
      categoryCode: '',
      categoryName: '',
      subCategoryCode: '',
      subCategoryName: '',
      activityCode: '',
      activityName: ''
    })
    setBizCategoryModalVisible(true)
  }

  const handleBizSearch = () => {
    setBizSubmittedFilter({
      categoryCode: bizSearchCategoryCode,
      categoryName: bizSearchCategoryName,
      subCategoryCode: bizSearchSubCategoryCode,
      subCategoryName: bizSearchSubCategoryName,
      activityCode: bizSearchActivityCode,
      activityName: bizSearchActivityName
    })
  }

  const handleBizReset = () => {
    setBizSearchCategoryCode('')
    setBizSearchCategoryName('')
    setBizSearchSubCategoryCode('')
    setBizSearchSubCategoryName('')
    setBizSearchActivityCode('')
    setBizSearchActivityName('')
    setBizSubmittedFilter({
      categoryCode: '',
      categoryName: '',
      subCategoryCode: '',
      subCategoryName: '',
      activityCode: '',
      activityName: ''
    })
  }

  // 确认选择业务大类 — 自动补充业务大类名称、业务小类编码/名称、业务活动编码/名称，且不可修改
  const handleConfirmBizCategory = () => {
    if (!bizModalSelectedId) {
      alert('请选择业务大类')
      return
    }
    const selected = mockBusinessCategoryList.find(b => b.id === bizModalSelectedId)
    if (selected) {
      setBusinessRows(prev => prev.map(r => {
        if (r.key !== bizCategoryTargetRowKey) return r
        return {
          ...r,
          classCode: selected.bizCategoryCode,
          className: selected.bizCategoryName,
          classSmCode: selected.bizSubCategoryCode,
          classSmName: selected.bizSubCategoryName,
          activityCode: selected.bizActivityCode,
          activityName: selected.bizActivityName
        }
      }))
    }
    setBizCategoryModalVisible(false)
  }

  // 附件
  const [attachFiles, setAttachFiles] = useState<File[]>([])

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
      // 选择项目后自动带出预算项目名称
      setForm(prev => ({ ...prev, budgetProjectName: project.name }))
    }
    setShowProjectModal(false)
  }

  const handleChange = (key: keyof CostForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleBusinessRowChange = (rowKey: string, field: keyof BusinessTypeRow, value: string) => {
    setBusinessRows(prev => prev.map(r => {
      if (r.key !== rowKey) return r
      const updated = { ...r, [field]: value }
      if (field === 'classCode') {
        const cls = businessClassOptions.find(o => o.value === value)
        updated.className = cls?.label || ''
        updated.classSmCode = ''
        updated.classSmName = ''
      }
      if (field === 'classSmCode') {
        const smOpts = businessSmClassOptions[r.classCode] || []
        const sm = smOpts.find(o => o.value === value)
        updated.classSmName = sm?.label || ''
      }
      if (field === 'activityCode') {
        const act = activityTypeOptions.find(o => o.value === value)
        updated.activityName = act?.label || ''
      }
      return updated
    }))
    // 申报行金额变化时，自动累加申报金额（不可手动修改）
    if (field === 'declareAmount') {
      const nextRows = businessRows.map(r => r.key === rowKey ? { ...r, declareAmount: value } : r)
      const total = nextRows.reduce((sum, r) => sum + parseAmount(r.declareAmount), 0)
      setForm(prev => ({ ...prev, totalAmount: total > 0 ? formatAmount(total) : '' }))
    }
  }

  const addBusinessRow = () => {
    setBusinessRows(prev => [...prev, createEmptyBusinessRow()])
  }

  const removeBusinessRow = (rowKey: string) => {
    if (businessRows.length <= 1) return
    const nextRows = businessRows.filter(r => r.key !== rowKey)
    setBusinessRows(nextRows)
    const total = nextRows.reduce((sum, r) => sum + parseAmount(r.declareAmount), 0)
    setForm(prev => ({ ...prev, totalAmount: total > 0 ? formatAmount(total) : '' }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setAttachFiles(prev => [...prev, ...Array.from(files)])
    }
  }

  const removeAttachFile = (idx: number) => {
    setAttachFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleCancel = () => onNavigate?.('/finance/fund/ict-cost')

  const validate = (): string[] => {
    const errors: string[] = []
    if (!selectedProject) errors.push('请选择项目')
    if (!form.budgetProjectName.trim()) errors.push('请输入预算项目名称')
    if (!form.totalAmount.trim()) errors.push('请输入申报金额')
    if (!form.projectStartTime) errors.push('请选择项目开始时间')
    if (!form.projectEndTime) errors.push('请选择项目结束时间')
    if (!form.projectType) errors.push('请选择项目类别')
    if (!form.expensesType) errors.push('请选择开支类别')
    if (!form.projectClass) errors.push('请选择项目分类')
    if (!form.strategyLabel) errors.push('请选择战略标签')
    businessRows.forEach((row, idx) => {
      const line = businessRows.length > 1 ? `申报明细第${idx + 1}行：` : ''
      if (!row.classCode) errors.push(`${line}请选择业务大类`)
      if (!row.declareAmount.trim()) errors.push(`${line}请输入申报行金额`)
    })
    return errors
  }

  const buildSubmitData = () => {
    return {
      projectId: selectedProject?.code,
      projectName: selectedProject?.name,
      budgetProjectName: form.budgetProjectName,
      totalAmount: form.totalAmount,
      managerCode: form.managerCode,
      companyName: form.companyName,
      budgetDeptName: form.budgetDeptName,
      projectStartTime: form.projectStartTime,
      projectEndTime: form.projectEndTime,
      projectType: form.projectType,
      expensesType: form.expensesType,
      projectClass: form.projectClass,
      strategyLabel: form.strategyLabel,
      businessTypeList: businessRows,
      fileCount: attachFiles.length
    }
  }

  const handleSaveDraft = () => {
    const errors = validate()
    if (errors.length > 0) { alert(errors.join('\n')); return }
    modal.confirm('确定保存草稿吗？', '保存草稿').then(ok => {
      if (ok) {
        console.log('Saving draft:', buildSubmitData())
        alert('草稿保存成功（状态：存稿）')
        onNavigate?.('/finance/fund/ict-cost')
      }
    })
  }

  const handleSubmit = () => {
    const errors = validate()
    if (errors.length > 0) { alert(errors.join('\n')); return }
    if (businessRows.length === 0) { alert('请至少添加一条业务明细'); return }

    const data = buildSubmitData()
    modal.confirm(
      `确定提交成本类资金申请吗？提交后将推送至BAM预算系统。\n\n申请总金额：${data.totalAmount} 元`,
      '提交（推送BAM）'
    ).then(ok => {
      if (ok) {
        console.log('Submitting to BAM:', data)
        alert('提交成功，已推送至BAM预算系统')
        onNavigate?.('/finance/fund/ict-cost')
      }
    })
  }

  // ========== 只读模式 ==========
  if (readOnly) {
    return (
      <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50 p-4">
        <div className="w-full space-y-3">
          <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
            <button onClick={handleCancel} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <h2 className="text-sm font-semibold text-gray-800">成本类资金申请详情</h2>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">成本类资金申请信息</h3>
            </div>
            <div className="px-4 py-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <ReadField label="项目名称" value={selectedProject?.name} />
                <ReadField label="项目编码" value={selectedProject?.code} />
                <ReadField label="预算项目名称" value={form.budgetProjectName} />
                <ReadField label="申请人SMAP账号" value={form.managerCode} />
                <ReadField label="申请公司" value={form.companyName} />
                <ReadField label="预算责任部门" value={form.budgetDeptName} />
                <ReadField label="申报金额(不含税，元)" value={editingItem?.applyAmount} />
                <ReadField label="项目开始时间" value={form.projectStartTime} />
                <ReadField label="项目结束时间" value={form.projectEndTime} />
                <ReadField label="项目类别" value={projectTypeOptions.find(o => o.value === form.projectType)?.label} />
                <ReadField label="开支类别" value={expensesTypeOptions.find(o => o.value === form.expensesType)?.label} />
                <ReadField label="项目分类" value={projectClassOptions.find(o => o.value === form.projectClass)?.label} />
                <ReadField label="战略标签" value={strategyLabelOptions.find(o => o.value === form.strategyLabel)?.label} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">申报明细信息</h3>
            </div>
            <div className="px-4 py-4">
              <ReadonlyBusinessTable rows={businessRows} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========== 编辑/新建模式 ==========
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
              {editId ? '编辑成本类资金申请' : '成本类资金申请'}
            </h2>
          </div>
        </div>

        {/* Panel 1: 资金申请工单 — 字段顺序严格匹配参考系统 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">资金申请工单</h3>
          </div>
          <div className="px-4 py-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {/* 选择项目 — merge=2 整行 */}
              <div className="col-span-2 flex items-center min-h-[36px]">
                <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">
                  <span className="text-red-500 mr-0.5">*</span>选择项目
                </label>
                <div className="flex-1 min-w-0" onClick={presetProjectName ? undefined : handleOpenProjectModal}>
                  {presetProjectName ? (
                    <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                      {selectedProject?.name || form.budgetProjectName || '-'}
                    </div>
                  ) : (
                    <div className="relative">
                      <input type="text" value={selectedProject?.name || ''} placeholder="请选择项目" readOnly
                        className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white cursor-pointer focus:outline-none focus:border-blue-500" />
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 cursor-pointer" />
                    </div>
                  )}
                </div>
              </div>

              {/* 预算项目名称 — merge=2 整行 */}
              <div className="col-span-2 flex items-center min-h-[36px]">
                <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">
                  <span className="text-red-500 mr-0.5">*</span>预算项目名称
                </label>
                <div className="flex-1 min-w-0">
                  <input type="text" value={form.budgetProjectName} onChange={e => handleChange('budgetProjectName', e.target.value)}
                    placeholder="请输入预算项目名称"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* 申请人SMAP账号 | 申请公司 */}
              <div className="flex items-center min-h-[36px]">
                <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">
                  <span className="text-red-500 mr-0.5">*</span>申请人SMAP账号
                </label>
                <div className="flex-1 min-w-0">
                  <SearchableSelect
                    value={form.managerCode}
                    onChange={(v) => {
                      const opt = applicantOptions.find(o => o.account === v)
                      setForm(prev => ({
                        ...prev,
                        managerCode: v,
                        companyCode: opt?.companyCode || prev.companyCode,
                        companyName: opt?.companyName || prev.companyName
                      }))
                    }}
                    options={applicantOptions.map(o => o.account)}
                    placeholder="请选择申请人SMAP账号"
                  />
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">
                  <span className="text-red-500 mr-0.5">*</span>申请公司
                </label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {form.companyName || '-'}
                  </div>
                </div>
              </div>

              {/* 预算责任部门 | 申报金额 */}
              <FieldReadonly label="预算责任部门" value={form.budgetDeptName} />
              <div className="flex items-center min-h-[36px]">
                <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">
                  <span className="text-red-500 mr-0.5">*</span>申报金额(不含税，元)
                </label>
                <div className="flex-1 min-w-0">
                  <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                    {form.totalAmount || '-'}
                  </div>
                </div>
              </div>

              {/* 项目开始时间 | 项目结束时间 */}
              <div className="flex items-center min-h-[36px]">
                <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">
                  <span className="text-red-500 mr-0.5">*</span>项目开始时间
                </label>
                <div className="flex-1 min-w-0">
                  <input type="date" value={form.projectStartTime} onChange={e => handleChange('projectStartTime', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">
                  <span className="text-red-500 mr-0.5">*</span>项目结束时间
                </label>
                <div className="flex-1 min-w-0">
                  <input type="date" value={form.projectEndTime} onChange={e => handleChange('projectEndTime', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* 项目类别 | 开支类别 */}
              <div className="flex items-center min-h-[36px]">
                <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">
                  <span className="text-red-500 mr-0.5">*</span>项目类别
                </label>
                <div className="flex-1 min-w-0">
                  <select value={form.projectType} onChange={e => handleChange('projectType', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500">
                    {projectTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">
                  <span className="text-red-500 mr-0.5">*</span>开支类别
                </label>
                <div className="flex-1 min-w-0">
                  <select value={form.expensesType} onChange={e => handleChange('expensesType', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500">
                    {expensesTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* 项目分类 | 战略标签 */}
              <div className="flex items-center min-h-[36px]">
                <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">
                  <span className="text-red-500 mr-0.5">*</span>项目分类
                </label>
                <div className="flex-1 min-w-0">
                  <select value={form.projectClass} onChange={e => handleChange('projectClass', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500">
                    {projectClassOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">
                  <span className="text-red-500 mr-0.5">*</span>战略标签
                </label>
                <div className="flex-1 min-w-0">
                  <select value={form.strategyLabel} onChange={e => handleChange('strategyLabel', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500">
                    {strategyLabelOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: 申报明细信息（可编辑表格） */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">申报明细信息</h3>
              <span className="text-xs text-gray-400">共 {businessRows.length} 行</span>
            </div>
            <button type="button" onClick={addBusinessRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#1677FF] bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
              <Plus className="w-3.5 h-3.5" />添加预算行
            </button>
          </div>
          <div className="px-4 py-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500">
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                      <span className="text-red-500 mr-0.5">*</span>预算年度
                    </th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                      <span className="text-red-500 mr-0.5">*</span>业务大类编码
                    </th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务大类名称</th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务小类编码</th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务小类名称</th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务活动编码</th>
                    <th className="px-2 py-2 text-left font-medium whitespace-nowrap">业务活动名称</th>
                    <th className="px-2 py-2 text-right font-medium whitespace-nowrap w-32">
                      <span className="text-red-500 mr-0.5">*</span>申报行金额(不含税，元)
                    </th>
                    <th className="px-2 py-2 text-center font-medium w-14">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {businessRows.map((row) => (
                    <tr key={row.key} className="hover:bg-gray-50/50">
                      <td className="px-2 py-2">
                        <select value={row.budgetYear} onChange={e => handleBusinessRowChange(row.key, 'budgetYear', e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500">
                          {budgetYearOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <div className="relative cursor-pointer" onClick={() => handleOpenBizCategoryModal(row.key)}>
                          <input type="text" value={row.classCode} readOnly placeholder="请选择"
                            className="w-full pl-2 pr-8 py-1.5 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:outline-none focus:border-blue-500" />
                          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500" />
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={row.className} readOnly
                          className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded text-gray-500 cursor-default" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={row.classSmCode} readOnly
                          className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded text-gray-500 cursor-default" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={row.classSmName} readOnly
                          className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded text-gray-500 cursor-default" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={row.activityCode} readOnly
                          className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded text-gray-500 cursor-default" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={row.activityName} readOnly
                          className="w-full px-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded text-gray-500 cursor-default" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="text" value={row.declareAmount} onChange={e => handleBusinessRowChange(row.key, 'declareAmount', e.target.value)}
                          placeholder="金额"
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:outline-none focus:border-blue-500" />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button type="button" onClick={() => removeBusinessRow(row.key)} disabled={businessRows.length <= 1}
                          className="inline-flex items-center justify-center w-7 h-7 text-red-500 hover:bg-red-50 rounded transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                          title={businessRows.length <= 1 ? '至少保留一行' : '删除此行'}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-4">
          <div className="flex justify-center gap-3">
            <button type="button" onClick={handleCancel}
              className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />取消
            </button>
            <button type="button" onClick={handleSubmit}
              className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5">
              <Check className="w-4 h-4" />提交
            </button>
          </div>
        </div>
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

      {/* ========== 选择业务大类弹框（复制自发起预付款页面） ========== */}
      {bizCategoryModalVisible && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/40" onClick={() => setBizCategoryModalVisible(false)}>
          <div
            className="bg-white rounded-lg shadow-2xl w-[1100px] max-w-[95vw] overflow-hidden flex flex-col"
            style={{ maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">选择业务大类</h3>
              <button
                type="button"
                onClick={() => setBizCategoryModalVisible(false)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 查询条件 */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务大类编码</label>
                  <input
                    type="text"
                    value={bizSearchCategoryCode}
                    onChange={(e) => setBizSearchCategoryCode(e.target.value)}
                    placeholder="请输入业务大类编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务大类名称</label>
                  <input
                    type="text"
                    value={bizSearchCategoryName}
                    onChange={(e) => setBizSearchCategoryName(e.target.value)}
                    placeholder="请输入业务大类名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务小类编码</label>
                  <input
                    type="text"
                    value={bizSearchSubCategoryCode}
                    onChange={(e) => setBizSearchSubCategoryCode(e.target.value)}
                    placeholder="请输入业务小类编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务小类名称</label>
                  <input
                    type="text"
                    value={bizSearchSubCategoryName}
                    onChange={(e) => setBizSearchSubCategoryName(e.target.value)}
                    placeholder="请输入业务小类名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务活动编码</label>
                  <input
                    type="text"
                    value={bizSearchActivityCode}
                    onChange={(e) => setBizSearchActivityCode(e.target.value)}
                    placeholder="请输入业务活动编码"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 shrink-0 w-24 text-right whitespace-nowrap">业务活动名称</label>
                  <input
                    type="text"
                    value={bizSearchActivityName}
                    onChange={(e) => setBizSearchActivityName(e.target.value)}
                    placeholder="请输入业务活动名称"
                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleBizReset}
                  className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  重置
                </button>
                <button
                  type="button"
                  onClick={handleBizSearch}
                  className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
                >
                  <Search className="w-4 h-4" />
                  查询
                </button>
              </div>
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-auto">
              <div className="min-w-full overflow-x-auto">
                <table className="w-full text-sm min-w-[1000px]">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="w-10 px-4 py-2.5 text-left">
                        <span className="sr-only">选择</span>
                      </th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务大类编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务大类名称</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务小类编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务小类名称</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务活动编码</th>
                      <th className="px-3 py-2.5 text-left font-medium min-w-[120px]">业务活动名称</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bizFilteredList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      bizFilteredList.map(item => (
                        <tr
                          key={item.id}
                          className={bizModalSelectedId === item.id ? 'cursor-pointer bg-blue-50 hover:bg-blue-50/50 transition-colors' : 'cursor-pointer hover:bg-blue-50/50 transition-colors'}
                          onClick={() => setBizModalSelectedId(item.id)}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="radio"
                              name="biz-category-modal"
                              checked={bizModalSelectedId === item.id}
                              onChange={() => setBizModalSelectedId(item.id)}
                              className="w-4 h-4 text-blue-600"
                            />
                          </td>
                          <td className="px-3 py-3 text-gray-800">{item.bizCategoryCode}</td>
                          <td className="px-3 py-3 text-gray-800">{item.bizCategoryName}</td>
                          <td className="px-3 py-3 text-gray-600">{item.bizSubCategoryCode}</td>
                          <td className="px-3 py-3 text-gray-600">{item.bizSubCategoryName}</td>
                          <td className="px-3 py-3 text-gray-600">{item.bizActivityCode}</td>
                          <td className="px-3 py-3 text-gray-600">{item.bizActivityName}</td>
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
                onClick={() => setBizCategoryModalVisible(false)}
                className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmBizCategory}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ========== 可复用组件 ==========

function FieldReadonly({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center min-h-[36px]">
      <label className="w-36 text-right text-sm text-gray-700 shrink-0 pr-2">{label}</label>
      <div className="flex-1 min-w-0 text-sm text-gray-700 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
        {value || '-'}
      </div>
    </div>
  )
}

function ReadField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center min-h-[36px]">
      <label className="w-36 text-right text-sm text-gray-500 shrink-0 pr-2">{label}</label>
      <div className="flex-1 min-w-0 text-sm text-gray-800">{value || '-'}</div>
    </div>
  )
}

function ReadonlyBusinessTable({ rows }: { rows: BusinessTypeRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="text-gray-500">
            <th className="px-2 py-2 text-left font-medium">预算年度</th>
            <th className="px-2 py-2 text-left font-medium">业务大类编码</th>
            <th className="px-2 py-2 text-left font-medium">业务大类名称</th>
            <th className="px-2 py-2 text-left font-medium">业务小类编码</th>
            <th className="px-2 py-2 text-left font-medium">业务小类名称</th>
            <th className="px-2 py-2 text-left font-medium">业务活动编码</th>
            <th className="px-2 py-2 text-left font-medium">业务活动名称</th>
            <th className="px-2 py-2 text-right font-medium">申报行金额(不含税，元)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.length === 0 ? (
            <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-400">暂无申报明细</td></tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key}>
                <td className="px-2 py-2 text-gray-600">{budgetYearOptions.find(o => o.value === row.budgetYear)?.label || row.budgetYear}</td>
                <td className="px-2 py-2 text-gray-800">{row.classCode || '-'}</td>
                <td className="px-2 py-2 text-gray-800">{row.className || '-'}</td>
                <td className="px-2 py-2 text-gray-800">{row.classSmCode || '-'}</td>
                <td className="px-2 py-2 text-gray-800">{row.classSmName || '-'}</td>
                <td className="px-2 py-2 text-gray-800">{row.activityCode || '-'}</td>
                <td className="px-2 py-2 text-gray-800">{row.activityName || '-'}</td>
                <td className="px-2 py-2 text-right text-gray-800 font-medium">{row.declareAmount || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
