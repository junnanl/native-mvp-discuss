import { useState, useMemo } from 'react'
import { X, Search, ChevronDown, ChevronUp, UserCheck } from 'lucide-react'

// 地市
const cities = [
  { value: 'province', label: '省公司' },
  { value: 'hefei', label: '合肥市' },
  { value: 'wuhu', label: '芜湖市' },
  { value: 'bangbu', label: '蚌埠市' },
  { value: 'huainan', label: '淮南市' },
  { value: 'maanshan', label: '马鞍山市' },
  { value: 'huaibei', label: '淮北市' },
  { value: 'tongling', label: '铜陵市' },
  { value: 'anqing', label: '安庆市' },
  { value: 'huangshan', label: '黄山市' },
  { value: 'chuzhou', label: '滁州市' },
  { value: 'fuyang', label: '阜阳市' },
  { value: 'suzhou', label: '宿州市' },
  { value: 'liuan', label: '六安市' },
  { value: 'haozhou', label: '亳州市' },
  { value: 'chizhou', label: '池州市' },
  { value: 'xuancheng', label: '宣城市' }
]

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

// 模拟摸排工单数据
const mockWorkOrders = [
  {
    id: 'WO202605001',
    name: '客户需求摸排工单',
    type: '省级工单',
    city: '合肥市',
    district: '蜀山区',
    manager: '张凯',
    status: '处理中',
    creator: '王芳',
    createTime: '2026-05-15 09:30'
  },
  {
    id: 'WO202605002',
    name: '现场踏勘工单',
    type: '市级工单',
    city: '合肥市',
    district: '包河区',
    manager: '李明',
    status: '已完成',
    creator: '王芳',
    createTime: '2026-05-16 14:20'
  },
  {
    id: 'WO202605003',
    name: '客户需求摸排工单',
    type: '区县级工单',
    city: '芜湖市',
    district: '镜湖区',
    manager: '王芳',
    status: '已完成',
    creator: '李明',
    createTime: '2026-05-17 10:00'
  }
]

// 模拟关联商机
const mockRelatedBusiness = [
  { id: 'BO2026001', name: '合肥市智慧政务项目' }
]

// 模拟流程轨迹数据
const mockFlowTrails = [
  { time: '2026-05-10 09:00', action: '线索创建', operator: '张凯', remark: '创建共享线索' },
  { time: '2026-05-10 10:30', action: '线索提交', operator: '张凯', remark: '提交至审核环节' },
  { time: '2026-05-11 09:15', action: '审核通过', operator: '王芳', remark: '审核通过并分配处理人' },
  { time: '2026-05-12 14:00', action: '创建摸排工单', operator: '李明', remark: '创建客户需求摸排工单' },
  { time: '2026-05-15 16:30', action: '工单完成', operator: '李明', remark: '完成现场踏勘' }
]

interface SharedClueItem {
  id: string
  name: string
  clueType: string
  city: string
  district: string
  industry: string
  field: string
  customer: string
  contact?: string
  phone?: string
  budget: string
  cities: string[]
  description: string
  secrecyLevel: string
  isPlatform: string
  status: string
  creator: string
  currentHandler: string
  createTime: string
  provBu: string
  cityBu: string
}

interface Props {
  item: SharedClueItem
  onClose: () => void
  onNavigate?: (path: string) => void
}

type ModalType = 'reject' | 'relateBusiness' | 'newBusiness' | 'abandon' | 'cityAdjust' | 'completeConfirm' | 'workOrderDetail' | 'businessDetail' | null

export default function SharedClueProcess({ item, onClose, onNavigate }: Props) {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [showFlow, setShowFlow] = useState(false)
  const [rejectType] = useState('线索归属行业错误')
  const [rejectReason, setRejectReason] = useState('')
  const [abandonReason, setAbandonReason] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState('')
  const [businessSearch, setBusinessSearch] = useState('')
  const [selectedCities, setSelectedCities] = useState<string[]>(item.cities)
  const [citySearch, setCitySearch] = useState('')
  const [selectedHandler, setSelectedHandler] = useState('')
  const [handlerSearch, setHandlerSearch] = useState('')
  const [showCityPicker, setShowCityPicker] = useState(false)
  const [workOrderDetail, setWorkOrderDetail] = useState<typeof mockWorkOrders[0] | null>(null)
  const [businessDetail, setBusinessDetail] = useState<typeof mockBusinessList[0] | null>(null)

  // 已经分派工单的地市（不可选择）
  const assignedCities = useMemo(() => {
    return Array.from(new Set(mockWorkOrders.map(wo => wo.city)))
  }, [])

  // 已经分派工单的区县（不可选择）
  const assignedDistricts = useMemo(() => {
    return Array.from(new Set(mockWorkOrders.map(wo => wo.district)))
  }, [])

  // 过滤商机
  const filteredBusiness = useMemo(() => {
    if (!businessSearch.trim()) return mockBusinessList
    return mockBusinessList.filter(b => b.name.includes(businessSearch) || b.id.includes(businessSearch))
  }, [businessSearch])

  // 过滤处理人
  const filteredHandlers = useMemo(() => {
    if (!handlerSearch.trim()) return employeeList
    return employeeList.filter(e => e.name.includes(handlerSearch))
  }, [handlerSearch])

  const closeModal = () => {
    setActiveModal(null)
    setRejectReason('')
    setAbandonReason('')
    setSelectedBusiness('')
    setBusinessSearch('')
    setSelectedHandler('')
    setHandlerSearch('')
  }

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      alert('请输入驳回原因')
      return
    }
    alert(`驳回提交成功\n驳回类型：${rejectType}\n驳回原因：${rejectReason}\n下一步处理人：${item.creator}`)
    closeModal()
    onClose()
  }

  const handleAbandonSubmit = () => {
    if (!abandonReason.trim()) {
      alert('请输入废弃原因')
      return
    }
    alert(`废弃提交成功\n废弃原因：${abandonReason}\n下一步处理人：${item.creator}`)
    closeModal()
    onClose()
  }

  const handleRelateBusinessSubmit = () => {
    if (!selectedBusiness) {
      alert('请选择商机')
      return
    }
    const business = mockBusinessList.find(b => b.id === selectedBusiness)
    alert(`关联成功：${business?.name}`)
    closeModal()
  }

  const handleNewBusinessSubmit = () => {
    alert('新建商机成功，跳转至商机录入页面')
    closeModal()
  }

  const handleCityAdjustSubmit = () => {
    if (selectedCities.length === 0) {
      alert('请至少选择一个地市')
      return
    }
    alert(`地市调整成功：${selectedCities.join('、')}`)
    closeModal()
  }

  const handleCompleteClick = () => {
    // 判断是否所有摸排工单都已完成
    const allCompleted = mockWorkOrders.every(wo => wo.status === '已完成')
    if (allCompleted) {
      setActiveModal('completeConfirm')
    } else {
      alert('还有摸排工单未完成，无法摸排完结')
    }
  }

  const handleCompleteConfirm = () => {
    alert('摸排完结成功')
    closeModal()
    onClose()
  }

  const toggleCity = (city: string) => {
    // 已分派工单的地市不可取消
    if (assignedCities.includes(city) && selectedCities.includes(city)) {
      return
    }
    setSelectedCities(prev =>
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    )
  }

  // 创建摸排工单（改到多开窗口）
  const handleCreateWorkOrder = () => {
    // 将线索上下文写入 localStorage，供多开窗口页面读取
    const context = {
      id: item.id,
      name: item.name,
      customer: item.customer,
      currentHandler: item.currentHandler
    }
    localStorage.setItem('pendingWorkOrderContext', JSON.stringify(context))
    onNavigate?.('/business/work-order/create')
  }

  // 区块标题
  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
      <h3 className="text-sm font-semibold text-gray-800">{children}</h3>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/30 z-50 overflow-y-auto">
      <div className="min-h-full p-4 flex items-start justify-center">
        <div className="bg-white rounded-lg shadow-lg w-[960px] max-w-full my-4">
          {/* 顶部标题栏 */}
          <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-base font-medium text-gray-800">共享线索处理 - {item.name}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* 客户信息 */}
            <div>
              <SectionTitle>客户信息</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm bg-gray-50 p-4 rounded-md">
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">客户名称：</span>
                  <span className="text-gray-800">{item.customer}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">客户联系人：</span>
                  <span className="text-gray-800">{item.contact}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">客户联系电话：</span>
                  <span className="text-gray-800">{item.phone}</span>
                </div>
              </div>
            </div>

            {/* 线索信息 */}
            <div>
              <SectionTitle>线索信息</SectionTitle>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm bg-gray-50 p-4 rounded-md">
                <div className="flex col-span-2">
                  <span className="text-gray-500 w-24 shrink-0">线索名称：</span>
                  <span className="text-gray-800">{item.name}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">线索编码：</span>
                  <span className="text-gray-800">{item.id}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">线索类型：</span>
                  <span className="text-gray-800">{item.clueType}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">归属地市：</span>
                  <span className="text-gray-800">{item.cities.join('、')}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">归属区县：</span>
                  <span className="text-gray-800">{item.district}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">行业类型：</span>
                  <span className="text-gray-800">{item.industry}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">所属领域：</span>
                  <span className="text-gray-800">{item.field}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">省公司BU：</span>
                  <span className="text-gray-800">{item.provBu}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">市公司BU：</span>
                  <span className="text-gray-800">{item.cityBu}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">保密级别：</span>
                  <span className="text-gray-800">{item.secrecyLevel === 'secret' ? '保密' : '普通'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32 shrink-0">是否平台卡位：</span>
                  <span className="text-gray-800">{item.isPlatform === 'yes' ? '是' : '否'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">预算金额：</span>
                  <span className="text-gray-800">{item.budget} 万元</span>
                </div>
                <div className="flex col-span-2">
                  <span className="text-gray-500 w-24 shrink-0">线索描述：</span>
                  <span className="text-gray-800">{item.description}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">线索创建人：</span>
                  <span className="text-gray-800">{item.creator}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">创建时间：</span>
                  <span className="text-gray-800">{item.createTime}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">线索状态：</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-600">
                    {item.status === 'pending' ? '待处理' :
                      item.status === 'processing' ? '处理中' :
                      item.status === 'abandoned' ? '废弃' : '完结'}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-24 shrink-0">当前处理人：</span>
                  <span className="text-gray-800">{item.currentHandler}</span>
                </div>
              </div>
            </div>

            {/* 摸排工单信息 */}
            <div>
              <SectionTitle>摸排工单信息</SectionTitle>
              <div className="bg-gray-50 rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 bg-white border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">工单编码</th>
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">工单名称</th>
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">工单类型</th>
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">地市</th>
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">区县</th>
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">负责人</th>
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">工单状态</th>
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">创建人</th>
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">创建时间</th>
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockWorkOrders.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center py-4 text-gray-400 text-sm">暂无工单数据</td>
                      </tr>
                    ) : (
                      mockWorkOrders.map(wo => (
                        <tr key={wo.id} className="border-b border-gray-100 last:border-b-0 hover:bg-white">
                          <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.id}</td>
                          <td className="py-2 px-3 text-gray-800 whitespace-nowrap">{wo.name}</td>
                          <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.type}</td>
                          <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.city}</td>
                          <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.district}</td>
                          <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.manager}</td>
                          <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.status}</td>
                          <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{wo.creator}</td>
                          <td className="py-2 px-3 text-gray-500 whitespace-nowrap">{wo.createTime}</td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setWorkOrderDetail(wo)
                                setActiveModal('workOrderDetail')
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              详情
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 关联商机信息 */}
            <div>
              <SectionTitle>关联商机信息</SectionTitle>
              <div className="bg-gray-50 rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-500 bg-white border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">商机编码</th>
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">商机名称</th>
                      <th className="text-left py-2 px-3 font-medium whitespace-nowrap">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRelatedBusiness.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-gray-400 text-sm">暂无关联商机</td>
                      </tr>
                    ) : (
                      mockRelatedBusiness.map(b => (
                        <tr key={b.id} className="border-b border-gray-100 last:border-b-0 hover:bg-white">
                          <td className="py-2 px-3 text-gray-700 whitespace-nowrap">{b.id}</td>
                          <td className="py-2 px-3 text-gray-800 whitespace-nowrap">{b.name}</td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setBusinessDetail(b)
                                setActiveModal('businessDetail')
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              详情
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 流程轨迹信息（默认收起） */}
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
            <button
              onClick={() => setActiveModal('reject')}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              驳回
            </button>
            <button
              onClick={() => setActiveModal('cityAdjust')}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              地市调整
            </button>
            <button
              onClick={handleCreateWorkOrder}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              分派工单
            </button>
            <button
              onClick={() => setActiveModal('abandon')}
              className="px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              废弃
            </button>
            <button
              onClick={handleCompleteClick}
              className="px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
            >
              摸排完结
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

      {/* 驳回弹窗 */}
      {activeModal === 'reject' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-lg shadow-lg w-[560px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">共享线索驳回</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">驳回信息</h4>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="text-gray-500 w-24 shrink-0 text-sm">驳回类型：</span>
                    <span className="text-gray-800 text-sm">{rejectType}</span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      驳回原因 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="请输入驳回原因"
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">流程信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-500 w-28 shrink-0">下一步环节：</span>
                    <span className="text-gray-800">共享线索修改</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-28 shrink-0">下一步处理人：</span>
                    <span className="text-gray-800">{item.creator}</span>
                  </div>
                </div>
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
                onClick={handleRejectSubmit}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}

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
                onClick={handleRelateBusinessSubmit}
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
              <div className="flex">
                <span className="text-gray-500 w-24 shrink-0">客户名称：</span>
                <span className="text-gray-800">{item.customer}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-24 shrink-0">线索名称：</span>
                <span className="text-gray-800">{item.name}</span>
              </div>
              <p className="text-gray-500 text-xs pt-2">点击"确定"将跳转至新建商机页面，并自动带入客户与线索信息。</p>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleNewBusinessSubmit}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 废弃弹窗 */}
      {activeModal === 'abandon' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-lg shadow-lg w-[560px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">共享线索废弃</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">废弃信息</h4>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">
                    废弃原因 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={abandonReason}
                    onChange={(e) => setAbandonReason(e.target.value)}
                    placeholder="请输入废弃原因"
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">流程信息</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="text-gray-500 w-28 shrink-0">下一步环节：</span>
                    <span className="text-gray-800">共享线索废弃审核</span>
                  </div>
                  <div className="flex">
                    <span className="text-gray-500 w-28 shrink-0">下一步处理人：</span>
                    <span className="text-gray-800">{item.creator}</span>
                  </div>
                </div>
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
                onClick={handleAbandonSubmit}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 地市调整弹窗 */}
      {activeModal === 'cityAdjust' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-lg shadow-lg w-[560px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">共享线索地市调整</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <label className="block text-sm text-gray-700 mb-2">
                归属地市 <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-md p-3 min-h-[100px]">
                <div className="flex flex-wrap gap-1.5">
                  {selectedCities.map(cv => {
                    const c = cities.find(item => item.value === cv)
                    const isAssigned = assignedCities.includes(c?.label || '')
                    return (
                      <span
                        key={cv}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs"
                      >
                        {c?.label || cv}
                        {!isAssigned && (
                          <button
                            type="button"
                            onClick={() => toggleCity(c?.label || '')}
                            className="hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        {isAssigned && (
                          <span className="text-gray-400 text-[10px]" title="已分派摸排工单，不可取消">🔒</span>
                        )}
                      </span>
                    )
                  })}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={citySearch}
                    onChange={(e) => {
                      setCitySearch(e.target.value)
                      setShowCityPicker(true)
                    }}
                    onFocus={() => setShowCityPicker(true)}
                    placeholder="搜索地市"
                    className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded"
                  />
                </div>
                {showCityPicker && (
                  <div className="mt-2 border border-gray-200 rounded max-h-40 overflow-y-auto">
                    {cities
                      .filter(c => !citySearch.trim() || c.label.includes(citySearch))
                      .filter(c => !selectedCities.includes(c.value))
                      .map(c => (
                        <div
                          key={c.value}
                          onClick={() => {
                            toggleCity(c.label)
                            setCitySearch('')
                            setShowCityPicker(false)
                          }}
                          className="px-3 py-1.5 hover:bg-blue-50 cursor-pointer text-sm text-gray-700"
                        >
                          {c.label}
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">注：已分派摸排工单的地市不可取消</p>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCityAdjustSubmit}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 摸排完结确认弹窗 */}
      {activeModal === 'completeConfirm' && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-lg shadow-lg w-[460px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">摸排完结确认</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700">摸排完结后将无法再创建摸排、关联商机，请确实是否继续？</p>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCompleteConfirm}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                继续
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 工单详情弹窗 */}
      {activeModal === 'workOrderDetail' && workOrderDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-lg shadow-lg w-[520px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">工单详情</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2 text-sm">
              <div className="flex"><span className="text-gray-500 w-24 shrink-0">工单编码：</span><span className="text-gray-800">{workOrderDetail.id}</span></div>
              <div className="flex"><span className="text-gray-500 w-24 shrink-0">工单名称：</span><span className="text-gray-800">{workOrderDetail.name}</span></div>
              <div className="flex"><span className="text-gray-500 w-24 shrink-0">工单类型：</span><span className="text-gray-800">{workOrderDetail.type}</span></div>
              <div className="flex"><span className="text-gray-500 w-24 shrink-0">地市：</span><span className="text-gray-800">{workOrderDetail.city}</span></div>
              <div className="flex"><span className="text-gray-500 w-24 shrink-0">区县：</span><span className="text-gray-800">{workOrderDetail.district}</span></div>
              <div className="flex"><span className="text-gray-500 w-24 shrink-0">负责人：</span><span className="text-gray-800">{workOrderDetail.manager}</span></div>
              <div className="flex"><span className="text-gray-500 w-24 shrink-0">工单状态：</span><span className="text-gray-800">{workOrderDetail.status}</span></div>
              <div className="flex"><span className="text-gray-500 w-24 shrink-0">创建人：</span><span className="text-gray-800">{workOrderDetail.creator}</span></div>
              <div className="flex"><span className="text-gray-500 w-24 shrink-0">创建时间：</span><span className="text-gray-800">{workOrderDetail.createTime}</span></div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 商机详情弹窗 */}
      {activeModal === 'businessDetail' && businessDetail && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="relative bg-white rounded-lg shadow-lg w-[460px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-medium text-gray-800">商机详情</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-2 text-sm">
              <div className="flex"><span className="text-gray-500 w-24 shrink-0">商机编码：</span><span className="text-gray-800">{businessDetail.id}</span></div>
              <div className="flex"><span className="text-gray-500 w-24 shrink-0">商机名称：</span><span className="text-gray-800">{businessDetail.name}</span></div>
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD]"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
