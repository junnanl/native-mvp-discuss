import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import {
  Search,
  Check,
  RotateCcw,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useModal } from '@/components/Modal'
import FileUpload from '@/components/FileUpload'

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

interface FormData {
  project: ProjectInfo | null
  contractType: 'income' | 'income-expense' | 'expense'
  contractName: string
  isFramework: 'yes' | 'no'
  frameworkRelationType: 'order' | 'contract'
}

const defaultForm: FormData = {
  project: null,
  contractType: 'income',
  contractName: '',
  isFramework: 'no',
  frameworkRelationType: 'order'
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
        <label className="w-24 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pt-2">
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

export default function ContractDrafting({ onNavigate, editId }: { onNavigate?: (path: string) => void; editId?: string }) {
  const modal = useModal()
  const [form, setForm] = useState<FormData>(defaultForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [contractFiles, setContractFiles] = useState<string[]>(editId ? ['合同草稿_2026060001.docx'] : [])

  // 编辑模式：根据 editId 回填数据
  useEffect(() => {
    if (!editId) return

    const contractNames = [
      '安徽移动IDC数据中心建设项目合同',
      '合肥政务云平台服务合同',
      '企业专线接入服务协议',
      '物联网平台建设合同',
      '5G网络优化服务项目'
    ]
    const projectTypes = ['ICT项目', 'DICT项目', 'ICT项目', '双计项目', 'ICT项目']
    const signModes = ['普通项目', '统谈分签项目', '框架订单项目', '框架合同项目', '普通项目']
    const customerManagers = ['张凯', '李华', '王强', '赵明', '杨海波']
    const solutionManagers = ['刘伟', '陈晨', '赵磊', '孙杰', '周涛']

    const match = editId.match(/CT202606(\d{4})/)
    let idx = match ? parseInt(match[1], 10) - 1 : 0

    let typeKey = ['income', 'income-expense', 'expense'][idx % 3] as 'income' | 'income-expense' | 'expense'
    let nameIdx = idx % 5
    let overrideName = ''

    const specialContracts: Record<string, { typeKey: 'income' | 'income-expense' | 'expense'; nameIdx: number; overrideName: string }> = {
      'CT2026060001': { typeKey: 'income', nameIdx: 0, overrideName: '安徽移动IDC数据中心建设项目合同' },
      'CT2026060002': { typeKey: 'income-expense', nameIdx: 1, overrideName: '合肥政务云平台服务合同' },
      'CT2026060003': { typeKey: 'expense', nameIdx: 2, overrideName: '企业专线接入服务协议' }
    }

    if (specialContracts[editId]) {
      typeKey = specialContracts[editId].typeKey
      nameIdx = specialContracts[editId].nameIdx
      overrideName = specialContracts[editId].overrideName
    }

    const project = projectList[idx % projectList.length]

    setForm({
      project: {
        id: project.id,
        code: project.code,
        globalCode: project.globalCode,
        name: project.name,
        type: projectTypes[nameIdx],
        signMode: signModes[nameIdx],
        customerManager: customerManagers[nameIdx],
        solutionManager: solutionManagers[nameIdx],
        draftedCount: project.draftedCount
      },
      contractType: typeKey,
      contractName: overrideName || contractNames[nameIdx],
      isFramework: idx % 2 === 0 ? 'yes' : 'no',
      frameworkRelationType: 'order'
    })
    setContractFiles([`合同草稿_${editId}.docx`])
  }, [editId])

  // 选择项目弹窗
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [searchProvinceCode, setSearchProvinceCode] = useState('')
  const [searchGlobalCode, setSearchGlobalCode] = useState('')
  const [appliedSearchName, setAppliedSearchName] = useState('')
  const [appliedSearchProvinceCode, setAppliedSearchProvinceCode] = useState('')
  const [appliedSearchGlobalCode, setAppliedSearchGlobalCode] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  // 项目信息展开/收起
  const [projectExpanded, setProjectExpanded] = useState(true)

  const filteredProjects = projectList.filter(p =>
    (!appliedSearchName.trim() || p.name.includes(appliedSearchName.trim())) &&
    (!appliedSearchProvinceCode.trim() || p.code.includes(appliedSearchProvinceCode.trim())) &&
    (!appliedSearchGlobalCode.trim() || p.globalCode.includes(appliedSearchGlobalCode.trim()))
  )

  const handleChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (errors[key as string]) {
      setErrors(prev => ({ ...prev, [key as string]: '' }))
    }
  }

  // 打开选择项目弹窗
  const handleOpenProjectModal = () => {
    setSelectedProjectId(form.project?.id || '')
    setSearchName('')
    setSearchProvinceCode('')
    setSearchGlobalCode('')
    setAppliedSearchName('')
    setAppliedSearchProvinceCode('')
    setAppliedSearchGlobalCode('')
    setShowProjectModal(true)
  }

  // 项目查询
  const handleProjectSearch = () => {
    setAppliedSearchName(searchName)
    setAppliedSearchProvinceCode(searchProvinceCode)
    setAppliedSearchGlobalCode(searchGlobalCode)
  }

  // 项目重置
  const handleProjectReset = () => {
    setSearchName('')
    setSearchProvinceCode('')
    setSearchGlobalCode('')
    setAppliedSearchName('')
    setAppliedSearchProvinceCode('')
    setAppliedSearchGlobalCode('')
  }

  // 确认选择项目
  const handleConfirmProject = () => {
    if (!selectedProjectId) {
      alert('请选择一个项目')
      return
    }
    const project = projectList.find(p => p.id === selectedProjectId)
    if (project) {
      setForm(prev => ({
        ...prev,
        project
      }))
    }
    setShowProjectModal(false)
  }

  // 合同类型切换
  const handleContractTypeChange = (type: FormData['contractType']) => {
    setForm(prev => ({
      ...prev,
      contractType: type
    }))
  }

  // 合同草稿文件上传
  const handleAddContractFile = () => {
    const fileName = `合同草稿_${Date.now()}.docx`
    setContractFiles(prev => [...prev, fileName])
  }

  const handleRemoveContractFile = (index: number) => {
    setContractFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 重置
  const handleReset = () => {
    setForm(defaultForm)
    setErrors({})
  }

  // 提交
  const handleSubmit = () => {
    const newErrors: Record<string, string> = {}

    if (!form.project) newErrors.project = '请选择项目'
    if (!form.contractName.trim()) newErrors.contractName = '请输入合同名称'
    // 收入类合同不强制上传合同草稿
    if (form.contractType !== 'income' && contractFiles.length === 0) newErrors.contractFiles = '请上传合同草稿'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      modal.alert('请完善必填项')
      return
    }

    modal.alert('提交成功！')
    console.log('合同起草表单数据:', form)
    onNavigate && onNavigate('/finance/contract/query')
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-3 space-y-3">

        {/* ========== 1. 项目信息区块（独立卡片） ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <SectionTitle sectionKey="project" expanded={projectExpanded} onToggle={() => setProjectExpanded(!projectExpanded)}>项目信息</SectionTitle>
          {projectExpanded && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <FieldRow label="项目名称" required error={errors.project} colSpan={2} fullWidth>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={form.project?.name || ''}
                    onClick={handleOpenProjectModal}
                    placeholder="请选择项目"
                    className={clsx(
                      'w-full pl-3 pr-10 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500 cursor-pointer bg-white',
                      errors.project ? 'border-red-500' : 'border-gray-300'
                    )}
                  />
                  <button
                    type="button"
                    onClick={handleOpenProjectModal}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="选择项目"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </FieldRow>
            </div>
          )}
        </div>

        {/* ========== 2. 合同起草区块（独立卡片） ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <SectionTitle>合同起草</SectionTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">

            <FieldRow label="合同类型" required>
              <div className="flex items-center gap-6 whitespace-nowrap pt-2">
                {[
                  { value: 'income', label: '收入类' },
                  { value: 'income-expense', label: '有收有支类' },
                  { value: 'expense', label: '支出类' }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="contractType"
                      value={opt.value}
                      checked={form.contractType === opt.value}
                      onChange={() => handleContractTypeChange(opt.value as FormData['contractType'])}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </FieldRow>

            <FieldRow label="合同名称" required error={errors.contractName} fullWidth>
              <input
                type="text"
                value={form.contractName}
                onChange={(e) => handleChange('contractName', e.target.value)}
                placeholder="请输入合同名称"
                className={clsx(
                  'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:border-blue-500',
                  errors.contractName ? 'border-red-500' : 'border-gray-300'
                )}
              />
            </FieldRow>

            <FieldRow label="是否框架合同" required>
              <div className="flex items-center gap-6 whitespace-nowrap pt-2">
                {[
                  { value: 'yes', label: '是' },
                  { value: 'no', label: '否' }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="isFramework"
                      value={opt.value}
                      checked={form.isFramework === opt.value}
                      onChange={() => {
                        const val = opt.value as FormData['isFramework']
                        setForm(prev => ({
                          ...prev,
                          isFramework: val,
                          frameworkRelationType: val === 'yes' ? 'order' : prev.frameworkRelationType
                        }))
                      }}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>
            </FieldRow>

            {form.isFramework === 'yes' && (
              <FieldRow label="关联类型" required>
                <div className="flex items-center gap-6 whitespace-nowrap pt-2">
                  {[
                    { value: 'order', label: '关联订单' },
                    { value: 'contract', label: '关联结算合同' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="frameworkRelationType"
                        value={opt.value}
                        checked={form.frameworkRelationType === opt.value}
                        onChange={() => handleChange('frameworkRelationType', opt.value as FormData['frameworkRelationType'])}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </FieldRow>
            )}

            {/* 合同草稿：收入类合同不展示 */}
            {form.contractType !== 'income' && (
              <FieldRow label="合同草稿" required error={errors.contractFiles} colSpan={2} fullWidth>
                <FileUpload
                  hideLabel
                  files={contractFiles}
                  onAdd={handleAddContractFile}
                  onRemove={handleRemoveContractFile}
                  uploadText={contractFiles.length > 0 ? '继续添加合同草稿文件' : '点击或拖拽上传合同草稿文件'}
                />
              </FieldRow>
            )}

          </div>
        </div>

        {/* ========== 3. 按钮区域（独立卡片） ========== */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={handleReset}
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

            {/* 中间内容区：筛选条件 + 列表，两模块独立分隔 */}
            <div className="flex-1 flex flex-col gap-3 bg-gray-50 p-3 overflow-hidden">
              {/* 1. 查询条件模块（独立白卡） */}
              <div className="bg-white rounded-lg shadow-sm p-4 space-y-3 shrink-0">
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
                <div className="flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleProjectReset}
                    className="px-5 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    重置
                  </button>
                  <button
                    type="button"
                    onClick={handleProjectSearch}
                    className="px-5 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    查询
                  </button>
                </div>
              </div>

              {/* 2. 项目列表模块（独立白卡，占剩余高度） */}
              <div className="bg-white rounded-lg shadow-sm flex-1 flex flex-col overflow-hidden">
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
              </div>
            </div>

            {/* 底部按钮（独立白卡） */}
            <div className="bg-white rounded-lg shadow-sm mx-3 mb-3 p-4 flex justify-center gap-3 shrink-0">
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
    </div>
  )
}
