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

// 行业BU选项
const industryBUOptions = [
  '政府BU',
  '金融BU',
  '教育BU',
  '医疗BU',
  '交通BU',
  '能源BU',
  '企业BU'
]

// 产品类型选项
const productTypeOptions = [
  'ICT产品',
  'CT产品',
  '融合产品'
]

// 项目类型选项
const projectTypeOptions = [
  '新建项目',
  '续签项目',
  '扩容项目',
  '变更项目'
]

// 是否逾期欠费选项
const overdueOptions = [
  { value: '', label: '全部' },
  { value: '是', label: '是' },
  { value: '否', label: '否' }
]

// Mock 数据
const mockProjectArrearsList = [
  {
    id: '1',
    city: '合肥分公司',
    district: '蜀山区',
    opportunityCode: 'OPP202601001',
    networkProjectCode: 'NET202601001',
    projectCode: 'PRJ202601001',
    projectName: '合肥市第一人民医院智慧医疗系统',
    projectType: '新建项目',
    customerCode: 'CUS000001',
    customerName: '合肥市第一人民医院',
    industryCode: 'IND001',
    industryName: '医疗卫生',
    contractCode: 'CT2026060001',
    contractName: '合肥市第一人民医院智慧医疗系统合同',
    productType: 'ICT产品',
    isOverdue: '是',
    tariffCode: 'TF001',
    billingNo: 'BJ2026010001',
    mgmtSubjectCode: 'MS001',
    mgmtSubjectName: 'ICT服务费',
    incomePrepaidCode: 'YP001',
    coaSubjectCode: 'COA001',
    coaSubjectName: '系统集成服务',
    billingPeriod: '2026-06',
    billedAmountWithTax: '500,000.00',
    billedAmountNoTax: '471,698.11',
    writtenOffAmountWithTax: '300,000.00',
    writtenOffAmountNoTax: '283,018.87',
    remainingContractAssetWithTax: '100,000.00',
    remainingContractAssetNoTax: '94,339.62',
    arrearsAmountWithTax: '100,000.00',
    arrearsAmountNoTax: '94,339.62'
  },
  {
    id: '2',
    city: '芜湖分公司',
    district: '镜湖区',
    opportunityCode: 'OPP202601002',
    networkProjectCode: 'NET202601002',
    projectCode: 'PRJ202601002',
    projectName: '芜湖市第二中学智慧校园项目',
    projectType: '新建项目',
    customerCode: 'CUS000002',
    customerName: '芜湖市第二中学',
    industryCode: 'IND002',
    industryName: '教育',
    contractCode: 'CT2026060002',
    contractName: '芜湖市第二中学智慧校园项目合同',
    productType: 'CT产品',
    isOverdue: '否',
    tariffCode: 'TF002',
    billingNo: 'BJ2026010002',
    mgmtSubjectCode: 'MS002',
    mgmtSubjectName: '宽带服务费',
    incomePrepaidCode: 'YP002',
    coaSubjectCode: 'COA002',
    coaSubjectName: '通信服务',
    billingPeriod: '2026-06',
    billedAmountWithTax: '200,000.00',
    billedAmountNoTax: '188,679.25',
    writtenOffAmountWithTax: '150,000.00',
    writtenOffAmountNoTax: '141,509.43',
    remainingContractAssetWithTax: '30,000.00',
    remainingContractAssetNoTax: '28,301.89',
    arrearsAmountWithTax: '20,000.00',
    arrearsAmountNoTax: '18,867.92'
  }
]

export default function ProjectArrears() {
  const [city, setCity] = useState('')
  const [industryBU, setIndustryBU] = useState('')
  const [networkProjectCode, setNetworkProjectCode] = useState('')
  const [projectCode, setProjectCode] = useState('')
  const [projectName, setProjectName] = useState('')
  const [productType, setProductType] = useState('')
  const [projectType, setProjectType] = useState('')
  const [customerCode, setCustomerCode] = useState('')
  const [isOverdue, setIsOverdue] = useState('')
  const [list, setList] = useState(mockProjectArrearsList)

  const handleSearch = () => {
    // 模拟查询
    setList(mockProjectArrearsList)
  }

  const handleReset = () => {
    setCity('')
    setIndustryBU('')
    setNetworkProjectCode('')
    setProjectCode('')
    setProjectName('')
    setProductType('')
    setProjectType('')
    setCustomerCode('')
    setIsOverdue('')
    setList(mockProjectArrearsList)
  }

  const handleExport = () => {
    // 模拟导出
    const headers = [
      '地市', '区县', '商机编码', '全网项目编码', '项目编码', '项目名称', '项目类型',
      '集团客户编码', '集团客户名称', '行业属性编码', '行业属性名称',
      '前向合同编码', '前向合同名称', '产品类型', '是否逾期欠费',
      '资费编码', '计费号', '管会科目编码', '管会科目名称',
      '收入预存编码', 'COA科目编码', 'COA科目名称', '账期',
      '出账含税金额（元）', '出账不含税金额（元）',
      '销账含税金额（元）', '销账不含税金额（元）',
      '剩余合同资产含税金额（元）', '剩余合同资产不含税金额（元）',
      '欠费含税金额（元）', '欠费不含税金额（元）'
    ]
    const csvContent = [
      headers.join(','),
      ...list.map(row => [
        row.city, row.district, row.opportunityCode, row.networkProjectCode, row.projectCode,
        row.projectName, row.projectType, row.customerCode, row.customerName,
        row.industryCode, row.industryName, row.contractCode, row.contractName,
        row.productType, row.isOverdue, row.tariffCode, row.billingNo,
        row.mgmtSubjectCode, row.mgmtSubjectName, row.incomePrepaidCode,
        row.coaSubjectCode, row.coaSubjectName, row.billingPeriod,
        row.billedAmountWithTax, row.billedAmountNoTax,
        row.writtenOffAmountWithTax, row.writtenOffAmountNoTax,
        row.remainingContractAssetWithTax, row.remainingContractAssetNoTax,
        row.arrearsAmountWithTax, row.arrearsAmountNoTax
      ].join(','))
    ].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = '项目欠费明细.csv'
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
          <div className="grid grid-cols-5 gap-x-6 gap-y-3">
            {/* 地市 */}
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-20 text-right text-sm text-gray-700 shrink-0 pr-2">地市</label>
                <div className="flex-1 min-w-0">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">请选择</option>
                    {cityOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 行业BU */}
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-20 text-right text-sm text-gray-700 shrink-0 pr-2">行业BU</label>
                <div className="flex-1 min-w-0">
                  <select
                    value={industryBU}
                    onChange={(e) => setIndustryBU(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">请选择</option>
                    {industryBUOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 全网项目编码 */}
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-2">全网项目编码</label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={networkProjectCode}
                    onChange={(e) => setNetworkProjectCode(e.target.value)}
                    placeholder="请输入"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 项目编码 */}
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-20 text-right text-sm text-gray-700 shrink-0 pr-2">项目编码</label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    placeholder="请输入"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 项目名称 */}
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-20 text-right text-sm text-gray-700 shrink-0 pr-2">项目名称</label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="请输入"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 产品类型 */}
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-20 text-right text-sm text-gray-700 shrink-0 pr-2">产品类型</label>
                <div className="flex-1 min-w-0">
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">请选择</option>
                    {productTypeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 项目类型 */}
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-20 text-right text-sm text-gray-700 shrink-0 pr-2">项目类型</label>
                <div className="flex-1 min-w-0">
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">请选择</option>
                    {projectTypeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 集团客户编码 */}
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-2">集团客户编码</label>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                    placeholder="请输入"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 是否逾期欠费 */}
            <div>
              <div className="flex items-center min-h-[36px]">
                <label className="w-24 text-right text-sm text-gray-700 shrink-0 pr-2">是否逾期欠费</label>
                <div className="flex-1 min-w-0">
                  <select
                    value={isOverdue}
                    onChange={(e) => setIsOverdue(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                    {overdueOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

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

        {/* 项目欠费明细列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">项目欠费明细列表</h3>
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
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">地市</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">区县</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">商机编码</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">全网项目编码</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">项目编码</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">项目类型</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">集团客户编码</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">集团客户名称</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">行业属性编码</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">行业属性名称</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">前向合同编码</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">前向合同名称</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">产品类型</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">是否逾期欠费</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">资费编码</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">计费号</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">管会科目编码</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">管会科目名称</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">收入预存编码</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">COA科目编码</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">COA科目名称</th>
                  <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">账期</th>
                  <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">出账含税金额（元）</th>
                  <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">出账不含税金额（元）</th>
                  <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">销账含税金额（元）</th>
                  <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">销账不含税金额（元）</th>
                  <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">剩余合同资产含税金额（元）</th>
                  <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">剩余合同资产不含税金额（元）</th>
                  <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">欠费含税金额（元）</th>
                  <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">欠费不含税金额（元）</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={31} className="px-3 py-8 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  list.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50/50">
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.city}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.district}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.opportunityCode}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.networkProjectCode}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.projectCode}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.projectName}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.projectType}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.customerCode}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.customerName}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.industryCode}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.industryName}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.contractCode}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.contractName}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.productType}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.isOverdue}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffCode}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.billingNo}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtSubjectCode}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtSubjectName}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.incomePrepaidCode}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubjectCode}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubjectName}</td>
                      <td className="px-2 py-2.5 text-gray-700 whitespace-nowrap">{row.billingPeriod}</td>
                      <td className="px-2 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.billedAmountWithTax}</td>
                      <td className="px-2 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.billedAmountNoTax}</td>
                      <td className="px-2 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.writtenOffAmountWithTax}</td>
                      <td className="px-2 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.writtenOffAmountNoTax}</td>
                      <td className="px-2 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.remainingContractAssetWithTax}</td>
                      <td className="px-2 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.remainingContractAssetNoTax}</td>
                      <td className="px-2 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.arrearsAmountWithTax}</td>
                      <td className="px-2 py-2.5 text-gray-700 text-right whitespace-nowrap">{row.arrearsAmountNoTax}</td>
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