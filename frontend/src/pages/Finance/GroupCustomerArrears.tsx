import { useState } from 'react'
import { Download, Search, RotateCcw } from 'lucide-react'

// 地市选项
const cityOptions = [
  '省公司',
  '合肥分公司',
  '芜湖分公司',
  '蚌埠分公司',
  '阜阳分公司',
  '淮南分公司',
  '马鞍山分公司',
  '安庆分公司',
  '滁州分公司',
  '六安分公司',
  '宣城分公司',
  '阜南分公司',
  '巢湖分公司',
  '淮北分公司',
  '铜陵分公司',
  '池州分公司',
  '黄山分公司'
]

// 查询类型枚举
const queryTypeOptions = [
  { value: 'customerCode', label: '集团客户编码' },
  { value: 'customerName', label: '集团客户名称' },
  { value: 'partner', label: '合作伙伴' }
]

// Mock 数据
const mockArrearsList = [
  { id: '1', customerCode: 'CUS000001', customerName: '合肥市第一人民医院', arrearsAmount: '125,680.00' },
  { id: '2', customerCode: 'CUS000002', customerName: '芜湖市第二中学', arrearsAmount: '89,450.00' },
  { id: '3', customerCode: 'CUS000003', customerName: '蚌埠市交通局', arrearsAmount: '256,300.00' },
  { id: '4', customerCode: 'CUS000004', customerName: '阜阳市人民医院', arrearsAmount: '178,900.00' },
  { id: '5', customerCode: 'CUS000005', customerName: '淮南市教育局', arrearsAmount: '67,500.00' }
]

export default function GroupCustomerArrears() {
  const [queryType, setQueryType] = useState<'customerCode' | 'customerName' | 'partner'>('customerCode')
  const [customerCode, setCustomerCode] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [partnerCode, setPartnerCode] = useState('')
  const [list, setList] = useState(mockArrearsList)

  const handleSearch = () => {
    // 模拟查询
    setList(mockArrearsList)
  }

  const handleReset = () => {
    setQueryType('customerCode')
    setCustomerCode('')
    setCustomerName('')
    setPartnerCode('')
    setList(mockArrearsList)
  }

  const handleExport = () => {
    // 模拟导出
    const headers = ['集团客户编码', '集团客户名称', '客户欠费金额（元）']
    const csvContent = [
      headers.join(','),
      ...list.map(row => `${row.customerCode},${row.customerName},${row.arrearsAmount}`)
    ].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '集团客户欠费明细.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-3 space-y-3">
        {/* 查询条件 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">查询条件</h3>
          </div>
          <div className="grid grid-cols-4 gap-x-6 gap-y-3">
            {/* 查询类型 */}
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-2">查询类型</label>
                <div className="flex-1 min-w-0">
                  <select
                    value={queryType}
                    onChange={(e) => setQueryType(e.target.value as typeof queryType)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {queryTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 动态字段 */}
            {queryType === 'customerCode' && (
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-2">集团客户编码</label>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={customerCode}
                      onChange={(e) => setCustomerCode(e.target.value)}
                      placeholder="请输入集团客户编码"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {queryType === 'customerName' && (
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-2">集团客户名称</label>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="请输入集团客户名称"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {queryType === 'partner' && (
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-2">统一社会信用代码</label>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={partnerCode}
                      onChange={(e) => setPartnerCode(e.target.value)}
                      placeholder="请输入统一社会信用代码"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSearch}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
              >
                <Search className="w-4 h-4" />
                查询
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重置
              </button>
            </div>
          </div>
        </div>

        {/* 集团客户欠费明细列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">集团客户欠费明细列表</h3>
              <span className="text-xs text-gray-400">共 {list.length} 条</span>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-[#1677FF] border border-[#1677FF] rounded-md hover:bg-blue-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              导出
            </button>
          </div>
          <div className="border border-gray-200 rounded-md overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">集团客户编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">集团客户名称</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">客户欠费金额（元）</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  list.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-2.5 text-gray-700">{row.customerCode}</td>
                      <td className="px-3 py-2.5 text-gray-700">{row.customerName}</td>
                      <td className="px-3 py-2.5 text-gray-700 text-right">{row.arrearsAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}