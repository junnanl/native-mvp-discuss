import { useEffect, useState } from 'react'
import { Search, RotateCcw, X } from 'lucide-react'
import { clsx } from 'clsx'

// 选择项目弹窗中的项目数据项
export interface ProjectSelectItem {
  id: string
  name: string
  code: string
  globalCode: string
  type: string
  signMode: string
  customerManager: string
  solutionManager: string
}

interface ProjectSelectModalProps {
  open: boolean
  projects: ProjectSelectItem[]
  selectedId: string
  onSelect: (id: string) => void
  onClose: () => void
  onConfirm: () => void
}

// 选择项目弹窗（复用合同起草页面的选择项目组件）
export default function ProjectSelectModal({
  open,
  projects,
  selectedId,
  onSelect,
  onClose,
  onConfirm
}: ProjectSelectModalProps) {
  const [searchName, setSearchName] = useState('')
  const [searchProvinceCode, setSearchProvinceCode] = useState('')
  const [searchGlobalCode, setSearchGlobalCode] = useState('')
  const [appliedSearchName, setAppliedSearchName] = useState('')
  const [appliedSearchProvinceCode, setAppliedSearchProvinceCode] = useState('')
  const [appliedSearchGlobalCode, setAppliedSearchGlobalCode] = useState('')

  // 每次打开时重置搜索条件
  useEffect(() => {
    if (open) {
      setSearchName('')
      setSearchProvinceCode('')
      setSearchGlobalCode('')
      setAppliedSearchName('')
      setAppliedSearchProvinceCode('')
      setAppliedSearchGlobalCode('')
    }
  }, [open])

  const filteredProjects = projects.filter(p =>
    (!appliedSearchName.trim() || p.name.includes(appliedSearchName.trim())) &&
    (!appliedSearchProvinceCode.trim() || p.code.includes(appliedSearchProvinceCode.trim())) &&
    (!appliedSearchGlobalCode.trim() || p.globalCode.includes(appliedSearchGlobalCode.trim()))
  )

  const handleSearch = () => {
    setAppliedSearchName(searchName)
    setAppliedSearchProvinceCode(searchProvinceCode)
    setAppliedSearchGlobalCode(searchGlobalCode)
  }

  const handleReset = () => {
    setSearchName('')
    setSearchProvinceCode('')
    setSearchGlobalCode('')
    setAppliedSearchName('')
    setAppliedSearchProvinceCode('')
    setAppliedSearchGlobalCode('')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={onClose}>
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
            onClick={onClose}
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
                onClick={handleReset}
                className="px-5 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
              <button
                type="button"
                onClick={handleSearch}
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
                            selectedId === project.id && 'bg-blue-50'
                          )}
                          onClick={() => onSelect(project.id)}
                        >
                          <td className="px-4 py-3">
                            <input
                              type="radio"
                              name="project"
                              checked={selectedId === project.id}
                              onChange={() => onSelect(project.id)}
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
            onClick={onClose}
            className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}
