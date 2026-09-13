import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  RotateCcw,
  Upload,
  X,
  Paperclip
} from 'lucide-react'
import { useModal } from '@/components/Modal'
import { getContractInfo } from '@/data/mock'
import IncomeITSection from '@/components/plan-modules/IncomeITSection'
import IncomeCTSection from '@/components/plan-modules/IncomeCTSection'
import type { ITIncomeRow, CTIncomeRow, CostRow, InvestmentRow } from '@/components/plan-modules/types'

// 审批人选项
const approverOptions = [
  '张三（省公司财务部）',
  '李四（合肥市分公司财务部）',
  '王五（芜湖市分公司财务部）',
  '赵六（蚌埠市分公司财务部）',
  '钱七（阜阳市分公司财务部）',
  '孙八（淮南市分公司财务部）',
  '周九（马鞍山市分公司财务部）',
  '吴十（安庆市分公司财务部）',
  '郑一（滁州市分公司财务部）',
  '冯二（六安市分公司财务部）'
]

// ============================================================
// 合同信息字段组件
// ============================================================
function InfoField({ label, value, span = 1 }: { label: string; value: string; span?: number }) {
  return (
    <div
      className="flex items-start min-h-[32px] py-0.5"
      style={span === 2 ? { gridColumn: 'span 3' } : undefined}
    >
      <label className="w-44 text-right text-sm text-gray-700 shrink-0 pr-2 break-all">
        {label}：
      </label>
      <div className="flex-1 min-w-0 text-sm text-gray-700 break-all">
        {value || '-'}
      </div>
    </div>
  )
}

// ============================================================
// 合同信息卡片组件（可复用）
// ============================================================
interface ContractInfoCardProps {
  contractInfo: ReturnType<typeof getContractInfo>
}

export function ContractInfoCard({ contractInfo }: ContractInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">合同信息</h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-x-6 gap-y-3">
          <InfoField label="合同名称" value={contractInfo.name} />
          <InfoField label="合同编码" value={contractInfo.code} />
          <InfoField label="合同流水号" value={contractInfo.serialNo} />
          <InfoField label="合同类型" value={contractInfo.type} />
          <InfoField label="是否框架合同" value={contractInfo.isFramework} />
          <InfoField label="关联类型" value={contractInfo.frameworkRelationType} />
          <InfoField label="合同二级分类" value={contractInfo.secondCategory} />
          <InfoField label="合同三级分类" value={contractInfo.thirdCategory} />
          <InfoField label="承办单位" value={contractInfo.organizer} />
          <InfoField label="承办人" value={contractInfo.handler} />
          <InfoField label="承办部门" value={contractInfo.dept} />
          <InfoField label="合同签约主体" value={contractInfo.signSubject} />
          <InfoField label="合同起草时间" value={contractInfo.draftTime} />
          <InfoField label="合同状态" value={contractInfo.status} />
          <InfoField label="状态变更时间" value={contractInfo.statusChangeTime} />
          <InfoField label="合同性质" value={contractInfo.nature} />
          <InfoField label="本项目所占合同金额（含税）" value={`${contractInfo.projectAmountWithTax} 元`} />
          <InfoField label="本项目所占合同金额（不含税）" value={`${contractInfo.projectAmountNoTax} 元`} />
          <InfoField label="合同生效时间" value={contractInfo.effectiveTime} />
          <InfoField label="合同终止时间" value={contractInfo.terminationTime} />
          <InfoField label="合同期数（月）" value={contractInfo.contractPeriodMonths} />
          <InfoField label="合同签约时间" value={contractInfo.signTime} />
          <InfoField label="相对方名称" value={contractInfo.counterpartName} />
          <InfoField label="征收客户" value={contractInfo.collectedCustomer} />
          <InfoField label="合同金额（含税）" value={`${contractInfo.amountWithTax} 元`} />
          <InfoField label="合同金额（不含税）" value={`${contractInfo.amountNoTax} 元`} />
          <InfoField label="调整后合同金额（含税）" value={`${contractInfo.adjustedAmountWithTax} 元`} />
          <InfoField label="调整后合同金额（不含税）" value={`${contractInfo.adjustedAmountNoTax} 元`} />
          <InfoField label="履约开始时间" value={contractInfo.performanceStartTime} />
          <InfoField label="履约结束时间" value={contractInfo.performanceEndTime} />
          <InfoField label="是否补充协议" value={contractInfo.isSupplement} />
          <InfoField label="补充协议类型" value={contractInfo.supplementType} />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 计划信息卡片组件（可复用）
// ============================================================
interface PlanInfoCardProps {
  contractType: 'income' | 'income-expense' | 'expense'
  itIncomeList: ITIncomeRow[]
  ctIncomeList: CTIncomeRow[]
  itCostList: CostRow[]
  ctCostList: CostRow[]
  itInvestmentList: InvestmentRow[]
  ctInvestmentList: InvestmentRow[]
  onItIncomeChange: (list: ITIncomeRow[]) => void
  onCtIncomeChange: (list: CTIncomeRow[]) => void
  onItCostChange: (list: CostRow[]) => void
  onCtCostChange: (list: CostRow[]) => void
  onItInvestmentChange: (list: InvestmentRow[]) => void
  onCtInvestmentChange: (list: InvestmentRow[]) => void
  readOnly?: boolean
}

export function PlanInfoCard({
  contractType,
  itIncomeList,
  ctIncomeList,
  itCostList,
  ctCostList,
  itInvestmentList,
  ctInvestmentList,
  onItIncomeChange,
  onCtIncomeChange,
  onItCostChange,
  onCtCostChange,
  onItInvestmentChange,
  onCtInvestmentChange,
  readOnly = false
}: PlanInfoCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
        <h3 className="text-sm font-semibold text-gray-800">计划信息</h3>
      </div>
      <div className="p-4 space-y-4">
        {/* 收入类 展示收入-IT + 收入-CT */}
        {contractType === 'income' && (
          <>
            <IncomeITSection
              value={itIncomeList}
              onChange={onItIncomeChange}
              readOnly={readOnly}
            />
            <IncomeCTSection
              value={ctIncomeList}
              onChange={onCtIncomeChange}
              readOnly={readOnly}
            />
          </>
        )}

        {/* 有收有支类 展示收入-IT + 投入部分 */}
        {contractType === 'income-expense' && (
          <IncomeITSection
            value={itIncomeList}
            onChange={onItIncomeChange}
            readOnly={readOnly}
          />
        )}

      </div>
    </div>
  )
}

// mock 数据（复用合同解析页面的）
const mockITIncome: ITIncomeRow[] = [
  {
    id: 'it-demo-1',
    productName: '集成收入-信息服务',
    tariffName: '[849]ICT维保服务费',
    mgmtProductCode: 'P1234',
    mgmtProductName: 'ICT维保服务',
    thirdLevelSubject: 'S123',
    coaSubject: 'C5678',
    taxRate: '6%',
    isFixedRate: '是',
    plannedIncome: '500,000',
    contractStage: '初验',
    billingShareType: '月',
    billingSharePeriod: '12',
    isContractAsset: '否',
    plannedOrderDate: '2026-07-01',
    billingStartDate: '2026-07'
  },
  {
    id: 'it-demo-2',
    productName: '商品销售收入',
    tariffName: '[956]软件开发服务',
    mgmtProductCode: 'P2345',
    mgmtProductName: '软件开发服务',
    thirdLevelSubject: 'S234',
    coaSubject: 'C956-01',
    taxRate: '13%',
    isFixedRate: '是',
    plannedIncome: '2,000,000',
    contractStage: '到货',
    billingShareType: '一次性',
    billingSharePeriod: '1',
    isContractAsset: '否',
    plannedOrderDate: '2026-08-01',
    billingStartDate: '2026-08'
  }
]

const mockCTIncome: CTIncomeRow[] = [
  {
    id: 'ct-demo-1',
    productName: '企业宽带',
    productCode: 'CT-B003',
    productFullName: '企业宽带1000M',
    packageName: '企业套餐',
    bandwidth: '1000',
    orderQuantity: '50',
    tariffName: '[1372]宽带费',
    plannedIncome: '1,200,000',
    plannedTariffAmount: '1,200,000',
    budgetTariffAmount: '1,100,000',
    taxRate: '6%',
    discount: '85',
    billingShareType: '月',
    billingSharePeriod: '36',
    isContractAsset: '否',
    plannedOrderDate: '2026-07',
    billingStartDate: '2026-07-01',
    mgmtProductCode: 'P-CT-B',
    mgmtProductName: '宽带服务',
    thirdLevelSubject: 'S1372',
    coaSubject: 'C-1372-02',
    coaSubjectName: '宽带接入服务收入',
    orderStatus: '已订购'
  },
  {
    id: 'ct-demo-2',
    productName: '数据专线',
    productCode: 'CT-D002',
    productFullName: '数据专线尊享版',
    packageName: '尊享套餐',
    bandwidth: '500',
    orderQuantity: '20',
    tariffName: '[1205]专线费',
    plannedIncome: '2,880,000',
    plannedTariffAmount: '2,880,000',
    budgetTariffAmount: '2,600,000',
    taxRate: '9%',
    discount: '90',
    billingShareType: '月',
    billingSharePeriod: '36',
    isContractAsset: '否',
    plannedOrderDate: '2026-08',
    billingStartDate: '2026-08-01',
    mgmtProductCode: 'P-CT-D',
    mgmtProductName: '专线服务',
    thirdLevelSubject: 'S1205',
    coaSubject: 'C-1205-02',
    coaSubjectName: '专线接入服务收入',
    orderStatus: '已订购'
  },
  {
    id: 'ct-demo-3',
    productName: '语音',
    productCode: 'CT-V001',
    productFullName: '语音基础服务',
    packageName: '基础套餐',
    bandwidth: '',
    orderQuantity: '300',
    tariffName: '[849]融合通信费',
    plannedIncome: '360,000',
    plannedTariffAmount: '360,000',
    budgetTariffAmount: '320,000',
    taxRate: '6%',
    discount: '80',
    billingShareType: '月',
    billingSharePeriod: '12',
    isContractAsset: '否',
    plannedOrderDate: '2026-07',
    billingStartDate: '2026-07-01',
    mgmtProductCode: 'P-CT-V',
    mgmtProductName: '融合通信服务',
    thirdLevelSubject: 'S849',
    coaSubject: 'C-849-02',
    coaSubjectName: '融合通信服务收入',
    orderStatus: '待订购'
  },
  {
    id: 'ct-demo-4',
    productName: '云计算',
    productCode: 'CT-C001',
    productFullName: '云主机基础型',
    packageName: '云服务套餐',
    bandwidth: '',
    orderQuantity: '10',
    tariffName: '[956]云服务费用',
    plannedIncome: '480,000',
    plannedTariffAmount: '480,000',
    budgetTariffAmount: '450,000',
    taxRate: '6%',
    discount: '88',
    billingShareType: '月',
    billingSharePeriod: '24',
    isContractAsset: '否',
    plannedOrderDate: '2026-09',
    billingStartDate: '2026-09-01',
    mgmtProductCode: 'P-CT-C',
    mgmtProductName: '云服务',
    thirdLevelSubject: 'S956',
    coaSubject: 'C-956-02',
    coaSubjectName: '云服务收入',
    orderStatus: '待订购'
  },
  {
    id: 'ct-demo-5',
    productName: '互联网专线',
    productCode: 'CT-INT001',
    productFullName: '互联网专线标准版',
    packageName: '互联网套餐',
    bandwidth: '200',
    orderQuantity: '5',
    tariffName: '[1205]专线费',
    plannedIncome: '900,000',
    plannedTariffAmount: '900,000',
    budgetTariffAmount: '800,000',
    taxRate: '9%',
    discount: '92',
    billingShareType: '月',
    billingSharePeriod: '36',
    isContractAsset: '否',
    plannedOrderDate: '2026-07',
    billingStartDate: '2026-07-15',
    mgmtProductCode: 'P-CT-INT',
    mgmtProductName: '专线服务',
    thirdLevelSubject: 'S1205',
    coaSubject: 'C-1205-02',
    coaSubjectName: '专线接入服务收入',
    orderStatus: '已订购'
  }
]

// ============================================================
// 主页面
// ============================================================
interface SettlementAmountChangeProps {
  onNavigate?: (path: string) => void
  contractId?: string
}

export default function SettlementAmountChange({ onNavigate, contractId }: SettlementAmountChangeProps) {
  const modal = useModal()

  const contractInfo = getContractInfo(contractId || 'CT2026060001')
  const contractType = contractInfo.typeKey

  const [itIncomeList, setItIncomeList] = useState<ITIncomeRow[]>(mockITIncome)
  const [ctIncomeList, setCtIncomeList] = useState<CTIncomeRow[]>(mockCTIncome)
  const [itCostList, setItCostList] = useState<CostRow[]>([])
  const [ctCostList, setCtCostList] = useState<CostRow[]>([])
  const [itInvestmentList, setItInvestmentList] = useState<InvestmentRow[]>([])
  const [ctInvestmentList, setCtInvestmentList] = useState<InvestmentRow[]>([])

  // 结算金额变更表单状态
  const [amountAfterChange, setAmountAfterChange] = useState('')
  const [changeDescription, setChangeDescription] = useState('')
  const [uploadFiles, setUploadFiles] = useState<{ id: string; name: string; size: string; time: string }[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [approver, setApprover] = useState('')

  // 文件上传处理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    const newFiles = files.map(f => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      time: new Date().toLocaleString()
    }))
    setUploadFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    const newFiles = files.map(f => ({
      id: `file-${Date.now()}-${Math.random()}`,
      name: f.name,
      size: (f.size / 1024).toFixed(1) + ' KB',
      time: new Date().toLocaleString()
    }))
    setUploadFiles(prev => [...prev, ...newFiles])
  }

  const handleRemoveFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleSubmit = () => {
    // 校验必填项
    if (!amountAfterChange) {
      alert('请填写变更后结算金额')
      return
    }
    if (!changeDescription) {
      alert('请填写变更说明')
      return
    }
    if (uploadFiles.length === 0) {
      alert('请上传结算金额变更证明文件')
      return
    }
    if (!approver) {
      alert('请选择下一步环节审批人')
      return
    }

    modal.confirm('确定提交吗？', '提交').then(ok => {
      if (ok) {
        alert('提交成功')
        onNavigate?.('/finance/contract/query')
      }
    })
  }

  const handleCancel = () => {
    onNavigate?.('/finance/contract/query')
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部标题栏 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">结算金额变更</h2>
          </div>
        </div>

        {/* 1. 合同信息 */}
        <ContractInfoCard contractInfo={contractInfo} />

        {/* 2. 结算金额变更信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">结算金额变更信息</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center min-h-[36px]">
              <label className="w-44 text-right text-sm text-gray-700 shrink-0 pr-2">
                <span className="text-red-500 mr-0.5">*</span>
                变更后结算金额（含税）
              </label>
              <div className="flex items-center gap-2 w-1/4">
                <input
                  type="text"
                  value={amountAfterChange}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d.]/g, '')
                    const parts = val.split('.')
                    if (parts.length > 2) {
                      setAmountAfterChange(parts[0] + '.' + parts.slice(1).join(''))
                    } else if (parts[1] && parts[1].length > 2) {
                      setAmountAfterChange(parts[0] + '.' + parts[1].slice(0, 2))
                    } else {
                      setAmountAfterChange(val)
                    }
                  }}
                  placeholder="请输入金额"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                />
                <span className="text-sm text-gray-500 shrink-0">元</span>
              </div>
            </div>

            <div className="flex items-start min-h-[36px]">
              <label className="w-44 text-right text-sm text-gray-700 shrink-0 pr-2 pt-2">
                <span className="text-red-500 mr-0.5">*</span>
                变更说明
              </label>
              <div className="flex-1 min-w-0">
                <textarea
                  value={changeDescription}
                  onChange={(e) => {
                    if (e.target.value.length <= 250) {
                      setChangeDescription(e.target.value)
                    }
                  }}
                  placeholder="请输入变更说明"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
                />
                <div className="text-xs text-gray-400 text-right mt-1">
                  {changeDescription.length}/250
                </div>
              </div>
            </div>

            <div className="flex items-start min-h-[36px]">
              <label className="w-44 text-right text-sm text-gray-700 shrink-0 pr-2 pt-2">
                <span className="text-red-500 mr-0.5">*</span>
                结算金额变更证明文件
              </label>
              <div className="flex-1 min-w-0">
                <div
                  className={
                    'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ' +
                    (dragOver
                      ? 'border-[#1677FF] bg-blue-50'
                      : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50')
                  }
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('settlement-file-input')?.click()}
                >
                  <Upload className={'w-8 h-8 mx-auto mb-2 ' + (dragOver ? 'text-[#1677FF]' : 'text-gray-400')} />
                  <p className="text-sm text-gray-600 mb-1">
                    点击或拖拽文件到此处上传
                  </p>
                  <p className="text-xs text-gray-400">
                    支持 PDF、Word、Excel、图片等格式，单个文件不超过 20MB
                  </p>
                  <input
                    id="settlement-file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {uploadFiles.length > 0 && (
                  <div className="mt-3 border border-gray-100 rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-600 text-xs">
                          <th className="px-3 py-2 text-left font-medium">文件名称</th>
                          <th className="px-3 py-2 text-left font-medium">大小</th>
                          <th className="px-3 py-2 text-left font-medium">上传时间</th>
                          <th className="px-3 py-2 text-center font-medium w-20">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadFiles.map(file => (
                          <tr key={file.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                            <td className="px-3 py-2 text-gray-700">
                              <div className="flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-gray-400 shrink-0" />
                                <span className="truncate">{file.name}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-gray-700">{file.size}</td>
                            <td className="px-3 py-2 text-gray-700">{file.time}</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                                title="删除"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. 计划信息 */}
        <PlanInfoCard
          contractType={contractType}
          itIncomeList={itIncomeList}
          ctIncomeList={ctIncomeList}
          itCostList={itCostList}
          ctCostList={ctCostList}
          itInvestmentList={itInvestmentList}
          ctInvestmentList={ctInvestmentList}
          onItIncomeChange={setItIncomeList}
          onCtIncomeChange={setCtIncomeList}
          onItCostChange={setItCostList}
          onCtCostChange={setCtCostList}
          onItInvestmentChange={setItInvestmentList}
          onCtInvestmentChange={setCtInvestmentList}
        />

        {/* 4. 下一步 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">下一步</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="flex items-center min-h-[36px]">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0">
                  <span className="text-red-500 mr-0.5">*</span>
                  下一步环节审批人
                </label>
                <div className="flex-1 min-w-0">
                  <select
                    value={approver}
                    onChange={(e) => setApprover(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">请选择审批人</option>
                    {approverOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部操作区 */}
        <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100 bg-white rounded-lg shadow-sm p-4">
          <button
            type="button"
            onClick={handleCancel}
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
  )
}
