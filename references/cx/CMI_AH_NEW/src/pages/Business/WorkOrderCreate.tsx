import { useState, useEffect, useMemo } from 'react'
import { clsx } from 'clsx'

// 区县选项
const allDistricts = [
  '蜀山区', '包河区', '瑶海区', '庐阳区',
  '镜湖区', '弋江区', '鸠江区', '三山区',
  '禹会区', '淮上区', '龙子湖区', '蚌山区',
  '大通区', '田家庵区', '谢家集区', '八公山区',
  '琅琊区', '南谯区', '天长市', '明光市',
  '颍州区', '颍东区', '颍泉区', '界首市'
]

// 用于在多开窗口之间传递线索上下文
const PENDING_KEY = 'pendingWorkOrderContext'

// 已分派工单的区县（不可选择，置灰）
const assignedDistricts = ['蜀山区', '包河区']

interface ClueContext {
  id: string
  name: string
  customer: string
  currentHandler: string
}

export default function WorkOrderCreate() {
  const [context, setContext] = useState<ClueContext | null>(null)
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([])
  const [workOrderList, setWorkOrderList] = useState<Array<{
    id: string; name: string; district: string; manager: string
  }>>([])

  // 读取待处理的线索上下文
  useEffect(() => {
    const raw = localStorage.getItem(PENDING_KEY)
    if (raw) {
      try {
        setContext(JSON.parse(raw))
      } catch {
        // ignore
      }
    }
  }, [])

  // 默认负责人：上下文中的当前处理人，若为 '-' 或空则使用「系统分配」
  const defaultManager = useMemo(() => {
    if (!context) return '系统分配'
    return context.currentHandler && context.currentHandler !== '-' ? context.currentHandler : '系统分配'
  }, [context])

  // 切换区县选择
  const toggleDistrict = (district: string) => {
    if (assignedDistricts.includes(district)) return
    setSelectedDistricts(prev => {
      const isRemoving = prev.includes(district)
      const newDistricts = isRemoving ? prev.filter(d => d !== district) : [...prev, district]

      setWorkOrderList(currentList => {
        const newList = newDistricts.map((d, i) => {
          const existing = currentList.find(wo => wo.district === d)
          return {
            id: existing?.id || `wo_${Date.now()}_${i}`,
            name: existing?.name || `${context?.name || '摸排工单'}-${d}`,
            district: d,
            manager: existing?.manager || defaultManager
          }
        })
        return newList
      })
      return newDistricts
    })
  }

  // 更新工单名称
  const updateWorkOrderName = (id: string, name: string) => {
    setWorkOrderList(prev => prev.map(wo => wo.id === id ? { ...wo, name } : wo))
  }

  // 关闭当前 tab
  const closeCurrentTab = () => {
    localStorage.removeItem(PENDING_KEY)
    window.dispatchEvent(new CustomEvent('close-tab-by-path', {
      detail: { path: '/business/work-order/create' }
    }))
  }

  // 提交
  const handleSubmit = () => {
    if (workOrderList.length === 0) {
      alert('请至少选择一个区县')
      return
    }
    // 简单校验工单名称
    const emptyName = workOrderList.find(wo => !wo.name.trim())
    if (emptyName) {
      alert(`工单名称不能为空：${emptyName.district}`)
      return
    }
    alert(`成功创建 ${workOrderList.length} 个摸排工单`)
    closeCurrentTab()
  }

  if (!context) {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-gray-400 text-sm">正在加载线索上下文...</div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 页面标题 + 线索信息摘要 */}
        <div className="bg-white rounded-lg shadow-sm px-5 py-4">
          <h2 className="text-base font-medium text-gray-800">摸排工单处理</h2>
          <div className="mt-2 grid grid-cols-3 gap-x-6 gap-y-1 text-sm text-gray-600">
            <div className="flex">
              <span className="w-24 shrink-0 text-gray-500">线索编码：</span>
              <span className="text-gray-800">{context.id}</span>
            </div>
            <div className="flex">
              <span className="w-24 shrink-0 text-gray-500">线索名称：</span>
              <span className="text-gray-800">{context.name}</span>
            </div>
            <div className="flex">
              <span className="w-24 shrink-0 text-gray-500">客户名称：</span>
              <span className="text-gray-800">{context.customer}</span>
            </div>
          </div>
        </div>

        {/* 区县选择区 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">选择区县（多选）</h3>
            <span className="text-xs text-red-500">*</span>
            <span className="ml-auto text-xs text-gray-500">已选 {selectedDistricts.length} 个区县</span>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {allDistricts.map(d => {
              const isAssigned = assignedDistricts.includes(d)
              const isSelected = selectedDistricts.includes(d)
              return (
                <label
                  key={d}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 border rounded text-sm select-none',
                    isAssigned
                      ? 'border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed'
                      : isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-600 cursor-pointer'
                        : 'border-gray-300 text-gray-700 hover:border-blue-300 cursor-pointer'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isAssigned}
                    onChange={() => toggleDistrict(d)}
                    className="rounded"
                  />
                  <span>{d}</span>
                </label>
              )
            })}
          </div>
          <p className="text-xs text-gray-400 mt-2">注：已创建工单的区县不可选择（置灰）</p>
        </div>

        {/* 工单列表 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800 ml-2">工单列表</h3>
            <span className="ml-3 text-xs text-gray-500">共 {workOrderList.length} 条</span>
          </div>
          {workOrderList.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              请先在上方选择区县，系统将自动生成工单列表
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">序号</th>
                    <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">工单名称</th>
                    <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">区县名称</th>
                    <th className="text-left py-2.5 px-3 font-medium whitespace-nowrap">负责人</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrderList.map((wo, idx) => (
                    <tr key={wo.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <td className="py-2.5 px-3 text-gray-500 whitespace-nowrap">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={wo.name}
                          onChange={(e) => updateWorkOrderName(wo.id, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{wo.district}</td>
                      <td className="py-2.5 px-3 text-gray-700 whitespace-nowrap">{wo.manager}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex justify-end gap-2">
          <button
            onClick={closeCurrentTab}
            className="px-5 py-1.5 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={workOrderList.length === 0}
            className="px-5 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            提交
          </button>
        </div>
      </div>
    </div>
  )
}
