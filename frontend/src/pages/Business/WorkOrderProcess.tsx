import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Search } from 'lucide-react'

// 员工库
const employeeList = [
  { id: 'e1', name: '张凯' },
  { id: 'e2', name: '李明' },
  { id: 'e3', name: '王芳' },
  { id: 'e4', name: '赵静' },
  { id: 'e5', name: '陈强' },
  { id: 'e6', name: '刘洋' },
  { id: 'e7', name: '周晓敏' },
  { id: 'e8', name: '孙建华' }
]

// 模拟商机列表
const mockBusinessList = [
  { id: 'BO2026001', name: '合肥市智慧政务项目' },
  { id: 'BO2026002', name: '芜湖市教育云平台项目' },
  { id: 'BO2026003', name: '蚌埠市智慧医疗项目' },
  { id: 'BO2026004', name: '滁州市智慧城市运营项目' },
  { id: 'BO2026005', name: '阜阳市智慧警务项目' }
]

// 模拟流程轨迹数据
const mockFlowTrails = [
  { time: '2026-05-15 09:30', action: '工单创建', operator: '王芳', remark: '创建摸排工单' },
  { time: '2026-05-15 10:00', action: '工单分派', operator: '王芳', remark: '分派给张凯' },
  { time: '2026-05-16 14:20', action: '工单处理', operator: '张凯', remark: '开始现场踏勘' },
  { time: '2026-05-17 16:00', action: '工单完成', operator: '张凯', remark: '完成摸排任务' }
]

interface WorkOrderItem {
  id: string
  name: string
  type: string
  city: string
  district: string
  manager: string
  status: string
  creator: string
  createTime: string
}

interface Props {
  item: WorkOrderItem
  onClose: () => void
}

type ModalType = 'relateBusiness' | 'newBusiness' | 'assignWorkOrder' | 'complete' | null

export default function WorkOrderProcess({ item, onClose }: Props) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [showFlow, setShowFlow] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [businessSearch, setBusinessSearch] = useState('')
  const [assignForm, setAssignForm] = useState({
    name: '',
    manager: '',
    remark: ''
  })
  const [showManagerPicker, setShowManagerPicker] = useState(false)
  const [managerSearch, setManagerSearch] = useState('')

  // 过滤商机
  const filteredBusiness = mockBusinessList.filter(b => {
    if (!businessSearch.trim()) return true
    return b.name.includes(businessSearch) || b.id.includes(businessSearch)
  })

  // 过滤处理人
  const filteredManagers = employeeList.filter(e => {
    if (!managerSearch.trim()) return true
    return e.name.includes(managerSearch)
  })

  const closeModal = () => {
    setActiveModal(null)
    setSelectedBusiness('')
    setBusinessSearch('')
    setAssignForm({ name: '', manager: '', remark: '' })
    setManagerSearch('')
  }

  const handleRelateBusiness = () => {
    if (!selectedBusiness) {
      alert('请选择商机')
      return
    }
    const business = mockBusinessList.find(b => b.id === selectedBusiness)
    alert(`关联成功：${business?.name}`)
    closeModal()
  }

  const handleNewBusiness = () => {
    alert('新建商机成功，跳转至商机录入页面')
    closeModal()
  }

  const handleAssign = () => {
    if (!assignForm.name.trim()) {
      alert('请输入工单名称')
      return
    }
    if (!assignForm.manager) {
      alert('请选择处理人')
      return
    }
    alert('分派工单成功')
    closeModal()
  }

  const handleComplete = () => {
    alert('完成摸排成功')
    closeModal()
    onClose()
  }

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
      <h3 className="text-sm font-semibold text-gray-800">{children}</h3>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/30 z-50 overflow-y-auto">
      <div className="min-h-full p-4 flex items-start justify-center">
        <div className="bg-white rounded-lg shadow-lg w-[860px] max-w-full my-4">
          {/* 顶部标题栏 */}
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-medium text-gray-800">摸排工单处理 - {item.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* 工单信息 */}
            <div>
              <SectionTitle>工单信息</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm bg-gray-50 p-4 rounded-md">
                <div className="flex col-span-2">
                  <span className="text-gray-500 w-24 shrink-0">工单名称：</span>
                  <span className="text-gray-800">{item.name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">工单编码：</span>
                  <span className="text-gray-800">{item.id}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">工单类型：</span>
                  <span className="text-gray-800">
                    {item.type === 'province' ? '省级工单' : item.type === 'city' ? '市级工单' : '区县级工单'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">地市：</span>
                  <span className="text-gray-800">{item.city}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">区县：</span>
                  <span className="text-gray-800">{item.district}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">负责人：</span>
                  <span className="text-gray-800">{item.manager}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">工单状态：</span>
                  <span className="text-gray-800">
                    {item.status === 'processing' ? '进行中' : item.status === 'abandoned' ? '废弃' : '已完成'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">创建人：</span>
                  <span className="text-gray-800">{item.creator}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">创建时间：</span>
                  <span className="text-gray-800">{item.createTime}</span>
                </div>
              </div>
            </div>

            {/* 流程轨迹（默认收起） */}
            <div>
              <button
                onClick={() => setShowFlow(!showFlow)}
                className="flex items-center gap-2 mb-3 hover:text-blue-600"
              >
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
                {showFlow ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {showFlow && (
                <div className="bg-gray-50 p-4 rounded-md">
                  <ul className="space-y-3">
                    {mockFlowTrails.map((trail, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-2 h-2 rounded-full bg-[#1677FF]" />
                          {idx !== mockFlowTrails.length - 1 && (
                            <div className="w-px flex-1 bg-gray-300 mt-1" style={{ minHeight: '20px' }} />
                          )}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{trail.action}</span>
                            <span className="text-xs text-gray-400">{trail.time}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            操作人：{trail.operator} · {trail.remark}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 底部操作按钮 */}
          <div className="px-5 py-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 mr-1">操作信息：</span>
            <button
              onClick={() => setActiveModal('relateBusiness')}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              关联已有商机
            </button>
            <button
              onClick={() => setActiveModal('newBusiness')}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              新建商机
            </button>
            <button
              onClick={() => setActiveModal('assignWorkOrder')}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              分派工单
            </button>
            <button
              onClick={() => setActiveModal('complete')}
              className="px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
            >
              完成摸排
            </button>
            <button
              onClick={onClose}
              className="ml-auto px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              关闭
            </button>
          </div>
        </div>
      </div>

      {/* 关联已有商机弹窗 */}
      {activeModal === 'relateBusiness' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-lg shadow-lg w-[560px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">关联商机</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-sm text-gray-700 mb-2">
                选择商机 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={selectedBusiness ? mockBusinessList.find(b => b.id === selectedBusiness)?.name || '' : businessSearch}
                  onChange={(e) => {
                    setBusinessSearch(e.target.value)
                    if (selectedBusiness) setSelectedBusiness('')
                  }}
                  placeholder="搜索商机名称或编码"
                  className="w-full pl-3 pr-9 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => {}}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600"
                >
                  <Search className="w-4 h-4" />
                </button>
                {!selectedBusiness && businessSearch !== '' && (
                  <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {filteredBusiness.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-400 text-center">未找到商机</div>
                    ) : (
                      filteredBusiness.map(b => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setSelectedBusiness(b.id)
                            setBusinessSearch('')
                          }}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                        >
                          <div className="text-gray-800">{b.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{b.id}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              {selectedBusiness && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="text-gray-500">已选：</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                    {mockBusinessList.find(b => b.id === selectedBusiness)?.name}
                    <button onClick={() => setSelectedBusiness('')}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleRelateBusiness}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新建商机弹窗 */}
      {activeModal === 'newBusiness' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-lg shadow-lg w-[560px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">新建商机</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <p className="text-gray-700">点击"确定"将跳转至新建商机页面，并自动带入工单与客户信息。</p>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleNewBusiness}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分派工单弹窗 */}
      {activeModal === 'assignWorkOrder' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-lg shadow-lg w-[560px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">分派工单</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-20 shrink-0 text-right">工单名称 <span className="text-red-500">*</span></span>
                <input
                  type="text"
                  value={assignForm.name}
                  onChange={(e) => setAssignForm({ ...assignForm, name: e.target.value })}
                  placeholder="请输入"
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 w-20 shrink-0 text-right">处理人 <span className="text-red-500">*</span></span>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={assignForm.manager}
                    onChange={(e) => setAssignForm({ ...assignForm, manager: e.target.value })}
                    onFocus={() => setShowManagerPicker(true)}
                    placeholder="请选择"
                    className="w-full pl-3 pr-9 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowManagerPicker(!showManagerPicker)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  {showManagerPicker && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      <div className="p-2 border-b border-gray-100">
                        <input
                          type="text"
                          value={managerSearch}
                          onChange={(e) => setManagerSearch(e.target.value)}
                          placeholder="搜索员工"
                          className="w-full px-2 py-1 text-sm border border-gray-200 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {filteredManagers.map(emp => (
                        <div
                          key={emp.id}
                          onClick={() => {
                            setAssignForm({ ...assignForm, manager: emp.name })
                            setShowManagerPicker(false)
                            setManagerSearch('')
                          }}
                          className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-800"
                        >
                          {emp.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-500 w-20 shrink-0 text-right pt-1.5">备注</span>
                <textarea
                  value={assignForm.remark}
                  onChange={(e) => setAssignForm({ ...assignForm, remark: e.target.value })}
                  placeholder="请输入"
                  rows={3}
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleAssign}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 完成摸排确认弹窗 */}
      {activeModal === 'complete' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-lg shadow-lg w-[460px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">完成摸排确认</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700">确认要完成本次摸排任务吗？</p>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleComplete}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
