import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { useModal } from '@/components/Modal'

interface AssetTransferListProps {
  onNavigate?: (path: string) => void
}

interface AssetItem {
  id: string
  billingNo: string
  billingUser: string
  projectName: string
  // 省内项目编码 / 全网项目编码（新增）
  projectLocalCode: string
  projectNationalCode: string
  contractCode: string
  contractName: string
  customerManager: string
  solutionManager: string
  productName: string
  taxRate: string
  tariffName: string
  contractAssetAmount: string
  orderTime: string
  remainingAssetAmount: string
  // boss 剩余合同资产查询用（保留兼容）
  bossBillingNo: string
  tariffCode: string
}

// 合同资产列表 mock 数据（补充完整新字段）
const assetList: AssetItem[] = [
  {
    id: 'CA2026070001',
    billingNo: 'BILL-2026-0001',
    billingUser: '34010000000001',
    projectName: '安徽移动IDC数据中心建设项目',
    projectLocalCode: 'PRJ-AH-2026-0001',
    projectNationalCode: 'PRJ-CMCC-2026-10001',
    contractCode: 'CTR2026000001',
    contractName: '安徽移动IDC数据中心建设项目合同',
    customerManager: '李明',
    solutionManager: '王五',
    productName: 'IDC资源服务',
    taxRate: '6%',
    tariffName: '[1204]IDC机柜租用费',
    contractAssetAmount: '500,000.00',
    orderTime: '2026-01-15',
    remainingAssetAmount: '320,000.00',
    bossBillingNo: 'BOSS-BILL-0001',
    tariffCode: 'T-1204'
  },
  {
    id: 'CA2026070002',
    billingNo: 'BILL-2026-0002',
    billingUser: '34020000000002',
    projectName: '芜湖智慧教育云平台服务',
    projectLocalCode: 'PRJ-AH-2026-0006',
    projectNationalCode: 'PRJ-CMCC-2026-10006',
    contractCode: 'CTR2026000006',
    contractName: '芜湖智慧教育云平台服务合同',
    customerManager: '赵敏',
    solutionManager: '张三',
    productName: '业务集成服务',
    taxRate: '13%',
    tariffName: '[1372]业务集成费',
    contractAssetAmount: '300,000.00',
    orderTime: '2026-02-20',
    remainingAssetAmount: '180,000.00',
    bossBillingNo: 'BOSS-BILL-0002',
    tariffCode: 'T-1372'
  },
  {
    id: 'CA2026070003',
    billingNo: 'BILL-2026-0003',
    billingUser: '34080000000003',
    projectName: '安庆云计算中心运维服务',
    projectLocalCode: 'PRJ-AH-2026-0009',
    projectNationalCode: 'PRJ-CMCC-2026-10009',
    contractCode: 'CTR2026000009',
    contractName: '安庆云计算中心运维服务合同',
    customerManager: '孙磊',
    solutionManager: '李四',
    productName: 'ICT维保服务',
    taxRate: '6%',
    tariffName: '[849]ICT维保服务费',
    contractAssetAmount: '800,000.00',
    orderTime: '2026-01-05',
    remainingAssetAmount: '650,000.00',
    bossBillingNo: 'BOSS-BILL-0003',
    tariffCode: 'T-849'
  },
  {
    id: 'CA2026070004',
    billingNo: 'BILL-2026-0004',
    billingUser: '34050000000004',
    projectName: '马鞍山智慧城市云平台建设运营',
    projectLocalCode: 'PRJ-AH-2026-0005',
    projectNationalCode: 'PRJ-CMCC-2026-10005',
    contractCode: 'CTR2026000005',
    contractName: '马鞍山智慧城市云平台建设运营合同',
    customerManager: '周杰',
    solutionManager: '赵六',
    productName: '软件开发服务',
    taxRate: '6%',
    tariffName: '[956]软件开发服务费',
    contractAssetAmount: '1,200,000.00',
    orderTime: '2026-03-10',
    remainingAssetAmount: '980,000.00',
    bossBillingNo: 'BOSS-BILL-0004',
    tariffCode: 'T-956'
  },
  {
    id: 'CA2026070005',
    billingNo: 'BILL-2026-0005',
    billingUser: '34010000000005',
    projectName: '合肥政务云平台服务',
    projectLocalCode: 'PRJ-AH-2026-0002',
    projectNationalCode: 'PRJ-CMCC-2026-10002',
    contractCode: 'CTR2026000002',
    contractName: '合肥政务云平台服务合同',
    customerManager: '陈芳',
    solutionManager: '钱七',
    productName: '业务集成服务',
    taxRate: '13%',
    tariffName: '[1372]业务集成费',
    contractAssetAmount: '600,000.00',
    orderTime: '2026-02-01',
    remainingAssetAmount: '420,000.00',
    bossBillingNo: 'BOSS-BILL-0005',
    tariffCode: 'T-1372'
  },
  {
    id: 'CA2026070006',
    billingNo: 'BILL-2026-0006',
    billingUser: '34010000000006',
    projectName: '企业专线接入服务',
    projectLocalCode: 'PRJ-AH-2026-0003',
    projectNationalCode: 'PRJ-CMCC-2026-10003',
    contractCode: 'CTR2026000003',
    contractName: '企业专线接入服务协议',
    customerManager: '吴强',
    solutionManager: '孙八',
    productName: '系统集成服务',
    taxRate: '9%',
    tariffName: '[1205]系统集成服务费',
    contractAssetAmount: '200,000.00',
    orderTime: '2025-12-20',
    remainingAssetAmount: '120,000.00',
    bossBillingNo: 'BOSS-BILL-0006',
    tariffCode: 'T-1205'
  },
  {
    id: 'CA2026070007',
    billingNo: 'BILL-2026-0007',
    billingUser: '34120000000007',
    projectName: '阜阳智慧医疗信息化建设',
    projectLocalCode: 'PRJ-AH-2026-0008',
    projectNationalCode: 'PRJ-CMCC-2026-10008',
    contractCode: 'CTR2026000008',
    contractName: '阜阳智慧医疗信息化建设项目合同',
    customerManager: '郑华',
    solutionManager: '周九',
    productName: '软件开发服务',
    taxRate: '6%',
    tariffName: '[956]软件开发服务费',
    contractAssetAmount: '900,000.00',
    orderTime: '2026-01-25',
    remainingAssetAmount: '760,000.00',
    bossBillingNo: 'BOSS-BILL-0007',
    tariffCode: 'T-956'
  },
  {
    id: 'CA2026070008',
    billingNo: 'BILL-2026-0008',
    billingUser: '34150000000008',
    projectName: '六安智慧城市综合服务平台',
    projectLocalCode: 'PRJ-AH-2026-0011',
    projectNationalCode: 'PRJ-CMCC-2026-10011',
    contractCode: 'CTR2026000011',
    contractName: '六安智慧城市综合服务平台合同',
    customerManager: '冯涛',
    solutionManager: '吴十',
    productName: 'ICT维保服务',
    taxRate: '6%',
    tariffName: '[849]ICT维保服务费',
    contractAssetAmount: '1,500,000.00',
    orderTime: '2026-03-05',
    remainingAssetAmount: '1,250,000.00',
    bossBillingNo: 'BOSS-BILL-0008',
    tariffCode: 'T-849'
  },
  {
    id: 'CA2026070009',
    billingNo: 'BILL-2026-0009',
    billingUser: '34040000000009',
    projectName: '淮南IDC机房运维服务采购',
    projectLocalCode: 'PRJ-AH-2026-0004',
    projectNationalCode: 'PRJ-CMCC-2026-10004',
    contractCode: 'CTR2026000004',
    contractName: '淮南IDC机房运维服务采购合同',
    customerManager: '马超',
    solutionManager: '郑一',
    productName: 'ICT维保服务',
    taxRate: '6%',
    tariffName: '[849]ICT维保服务费',
    contractAssetAmount: '450,000.00',
    orderTime: '2026-02-15',
    remainingAssetAmount: '0.00',
    bossBillingNo: 'BOSS-BILL-0009',
    tariffCode: 'T-849'
  },
  {
    id: 'CA2026070010',
    billingNo: 'BILL-2026-0010',
    billingUser: '34110000000010',
    projectName: '滁州5G基站建设设备采购',
    projectLocalCode: 'PRJ-AH-2026-0010',
    projectNationalCode: 'PRJ-CMCC-2026-10010',
    contractCode: 'CTR2026000010',
    contractName: '滁州5G基站建设设备采购合同',
    customerManager: '黄伟',
    solutionManager: '冯二',
    productName: '软件开发服务',
    taxRate: '13%',
    tariffName: '[956]软件开发服务费',
    contractAssetAmount: '700,000.00',
    orderTime: '2026-01-30',
    remainingAssetAmount: '0.00',
    bossBillingNo: 'BOSS-BILL-0010',
    tariffCode: 'T-956'
  }
]

interface FilterForm {
  projectName: string
  projectLocalCode: string
  projectNationalCode: string
  contractCode: string
}

const defaultFilter: FilterForm = {
  projectName: '',
  projectLocalCode: '',
  projectNationalCode: '',
  contractCode: ''
}

export default function AssetTransferList({ onNavigate }: AssetTransferListProps) {
  const modal = useModal()
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  // boss 查询弹窗
  const [bossQueryItem, setBossQueryItem] = useState<AssetItem | null>(null)
  // 强制转出确认弹窗
  const [forceTransferItem, setForceTransferItem] = useState<AssetItem | null>(null)

  const filteredList = useMemo(() => {
    return assetList.filter(item => {
      if (submittedFilter.projectName && !item.projectName.includes(submittedFilter.projectName)) return false
      if (submittedFilter.projectLocalCode && !item.projectLocalCode.includes(submittedFilter.projectLocalCode)) return false
      if (submittedFilter.projectNationalCode && !item.projectNationalCode.includes(submittedFilter.projectNationalCode)) return false
      if (submittedFilter.contractCode && !item.contractCode.includes(submittedFilter.contractCode)) return false
      return true
    })
  }, [submittedFilter])

  const totalCount = filteredList.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const startIndex = (page - 1) * pageSize
  const currentPageData = filteredList.slice(startIndex, startIndex + pageSize)

  const handleSearch = () => {
    setSubmittedFilter(filter)
    setPage(1)
  }

  const handleReset = () => {
    setFilter(defaultFilter)
    setSubmittedFilter(defaultFilter)
    setPage(1)
  }

  const handleDetail = (item: AssetItem) => {
    onNavigate?.(`/finance/contract/asset-transfer/detail/${item.id}`)
  }

  const handleBossQuery = (item: AssetItem) => {
    setBossQueryItem(item)
  }

  const handleForceTransfer = (item: AssetItem) => {
    setForceTransferItem(item)
  }

  const handleConfirmForceTransfer = () => {
    if (forceTransferItem) {
      setForceTransferItem(null)
      modal.alert('合同资产强制转出成功', '操作成功')
    }
  }

  const handleTransfer = (item: AssetItem) => {
    onNavigate?.(`/finance/contract/asset-transfer/create/${item.id}`)
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-[1800px] mx-auto p-3 space-y-3">
        {/* ========== 查询条件 ========== */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">查询条件</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              <div className="flex items-center min-h-[36px]">
                <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-3">项目名称</label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={filter.projectName}
                    onChange={(e) => setFilter(prev => ({ ...prev, projectName: e.target.value }))}
                    placeholder="请输入项目名称"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-3">省内项目编码</label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={filter.projectLocalCode}
                    onChange={(e) => setFilter(prev => ({ ...prev, projectLocalCode: e.target.value }))}
                    placeholder="请输入省内项目编码"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-3">全网项目编码</label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={filter.projectNationalCode}
                    onChange={(e) => setFilter(prev => ({ ...prev, projectNationalCode: e.target.value }))}
                    placeholder="请输入全网项目编码"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-3">合同编码</label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={filter.contractCode}
                    onChange={(e) => setFilter(prev => ({ ...prev, contractCode: e.target.value }))}
                    placeholder="请输入合同编码"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                重置
              </button>
              <button
                type="button"
                onClick={handleSearch}
                className="px-4 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                查询
              </button>
            </div>
          </div>
        </div>

        {/* ========== 合同资产列表 ========== */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">合同资产列表</h3>
              <span className="text-xs text-gray-400">共 {totalCount} 条</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 text-xs">
                <tr>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">省内项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">客户经理</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">解决方案经理</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购金额（元）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">剩余合同资产金额（元）</th>
                  <th className="sticky right-0 bg-gray-50 px-3 py-2.5 text-center font-medium whitespace-nowrap w-[280px] z-10 shadow-[-2px_0_0_0_#f3f4f6]">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-4 py-8 text-center text-gray-400">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  currentPageData.map(item => {
                    const remaining = parseFloat(item.remainingAssetAmount.replace(/,/g, ''))
                    // 剩余合同资产金额 > 0 → 展示"合同资产强制转出"和"合同资产转出"
                    const showTransferButtons = remaining > 0
                    return (
                      <tr key={item.id} className="hover:bg-gray-50/50">
                        <td className="px-3 py-2.5 text-gray-800 max-w-[220px] truncate" title={item.projectName}>{item.projectName}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.projectLocalCode}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.projectNationalCode}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.contractCode}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.customerManager}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.solutionManager}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.productName}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.taxRate}</td>
                        <td className="px-3 py-2.5 text-gray-700 max-w-[200px] truncate" title={item.tariffName}>{item.tariffName}</td>
                        <td className="px-3 py-2.5 text-gray-800 text-left font-medium whitespace-nowrap">{item.contractAssetAmount}</td>
                        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{item.orderTime}</td>
                        <td className="px-3 py-2.5 text-gray-800 text-left font-medium whitespace-nowrap">
                          {item.remainingAssetAmount}
                        </td>
                        <td className="sticky right-0 bg-white px-3 py-2.5 text-center whitespace-nowrap w-[280px] z-10 shadow-[-2px_0_0_0_#f3f4f6]">
                          <button
                            type="button"
                            onClick={() => handleDetail(item)}
                            className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] hover:bg-blue-50 rounded transition-colors"
                          >
                            详情
                          </button>
                          <span className="text-gray-300 mx-0.5">|</span>
                          <button
                            type="button"
                            onClick={() => handleBossQuery(item)}
                            className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] hover:bg-blue-50 rounded transition-colors"
                          >
                            boss剩余合同资产查询
                          </button>
                          {showTransferButtons && (
                            <>
                              <span className="text-gray-300 mx-0.5">|</span>
                              <button
                                type="button"
                                onClick={() => handleForceTransfer(item)}
                                className="inline-flex items-center px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 rounded transition-colors"
                              >
                                合同资产强制转出
                              </button>
                              <span className="text-gray-300 mx-0.5">|</span>
                              <button
                                type="button"
                                onClick={() => handleTransfer(item)}
                                className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] hover:bg-blue-50 rounded transition-colors"
                              >
                                合同资产转出
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-gray-600">
                第 {page} / {totalPages} 页
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========== boss 剩余合同资产查询弹窗（表格形式） ========== */}
      {bossQueryItem && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
          onClick={() => setBossQueryItem(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-[760px] max-w-[92vw] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">boss剩余合同资产查询</h3>
              <button
                type="button"
                onClick={() => setBossQueryItem(null)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-5">
              <div className="overflow-x-auto rounded-md border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">计费号码</th>
                      <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">资费编码</th>
                      <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                      <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">剩余合同资产金额（元）</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap font-medium">{bossQueryItem.billingUser}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{bossQueryItem.tariffCode}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{bossQueryItem.tariffName}</td>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap font-bold">{bossQueryItem.remainingAssetAmount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center">
              <button
                type="button"
                onClick={() => setBossQueryItem(null)}
                className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== 合同资产强制转出确认弹窗（文字+表格） ========== */}
      {forceTransferItem && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40"
          onClick={() => setForceTransferItem(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl w-[780px] max-w-[92vw] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">合同资产强制转出确认</h3>
              <button
                type="button"
                onClick={() => setForceTransferItem(null)}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="text-sm text-gray-800 leading-relaxed px-1">
                确认要对以下计费号码对应的合同资产进行强制转出吗？强制转出后该笔合同资产将一次性结转，且不可撤销！
              </div>
              <div className="overflow-x-auto rounded-md border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-600 text-xs">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">计费号码</th>
                      <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">资费编码</th>
                      <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                      <th className="px-4 py-2.5 text-left font-medium whitespace-nowrap">剩余合同资产金额（元）</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap font-medium">{forceTransferItem.billingUser}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{forceTransferItem.tariffCode}</td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{forceTransferItem.tariffName}</td>
                      <td className="px-4 py-3 text-gray-800 whitespace-nowrap font-bold">{forceTransferItem.remainingAssetAmount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setForceTransferItem(null)}
                className="px-6 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmForceTransfer}
                className="px-6 py-1.5 text-sm text-white bg-orange-500 rounded-md hover:bg-orange-600 transition-colors"
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
