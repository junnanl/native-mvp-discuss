import { useState, useMemo } from 'react'
import { ArrowLeft, Check, RotateCcw } from 'lucide-react'
import { useModal } from '@/components/Modal'
import FileUpload from '@/components/FileUpload'
import { ProjectInfoCard } from '@/components/ContractInfoCard'
import ContractAttachments from '@/components/ContractAttachments'
import ProcessTrail, { type ProcessTrailItem } from '@/components/ProcessTrail'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import { getContractInfo } from '@/data/mock'
import type { ITIncomeRow } from '@/components/plan-modules/types'

interface AssetTransferCreateProps {
  onNavigate?: (path: string) => void
  readOnly?: boolean
  id?: string
}

interface TransferPlanRow {
  id: string
  milestone: string
  plannedPaymentAmount: string
  plannedPaymentDate: string
  plannedTransferDate: string
  billingUser: string
  transferredAssetAmount: string
  remainingAssetAmount: string
  checked: boolean
  actualTransferDate: string
  transferStatus: string
}

// 审批人选项（同合同解析/收入计划确认审批页面口径，独立维护）
const approverOptions = [
  '张三（解决方案经理）',
  '李四（解决方案经理）',
  '王五（解决方案经理）',
  '赵六（解决方案经理）',
  '钱七（解决方案经理）',
  '孙八（解决方案经理）',
  '周九（解决方案经理）',
  '吴十（解决方案经理）',
  '郑一（解决方案经理）',
  '冯二（解决方案经理）'
]

// IT产品收入计划 mock（只读展示，单组数据补充完整）
const mockITIncomeRows: ITIncomeRow[] = [
  {
    id: 'it-001',
    productName: '业务集成服务',
    tariffName: '[1372]业务集成费',
    mgmtProductCode: 'P1001',
    mgmtProductName: '业务集成服务-移动云资源类',
    thirdLevelSubject: 'S101',
    coaSubject: '6030102000 - 业务集成服务收入',
    taxRate: '13%',
    plannedIncome: '1,200,000.00',
    contractStage: '初验',
    billingShareType: '一次性',
    billingSharePeriod: '1个月',
    isContractAsset: '是',
    plannedOrderDate: '2026-07-01',
    billingStartDate: '2026-07',
    paymentPlans: [
      { id: 'p1', milestone: '初验', amount: '400,000.00', paymentDate: '2026-07-15', transferDate: '2026-07-20' }
    ]
  }
]

// 合同资产转出计划明细 mock
const mockTransferPlanRows: TransferPlanRow[] = [
  {
    id: 'tp-1',
    milestone: '合同签订',
    plannedPaymentAmount: '200,000.00',
    plannedPaymentDate: '2026-06',
    plannedTransferDate: '2026-07',
    billingUser: '34020000000001',
    transferredAssetAmount: '200,000.00',
    remainingAssetAmount: '0.00',
    checked: false,
    actualTransferDate: '2026-07-20',
    transferStatus: '全部转出'
  },
  {
    id: 'tp-2',
    milestone: '初验',
    plannedPaymentAmount: '400,000.00',
    plannedPaymentDate: '2026-07',
    plannedTransferDate: '2026-07',
    billingUser: '34020000000002',
    transferredAssetAmount: '80,000.00',
    remainingAssetAmount: '320,000.00',
    checked: false,
    actualTransferDate: '2026-07-25',
    transferStatus: '部分转出'
  },
  {
    id: 'tp-3',
    milestone: '终验',
    plannedPaymentAmount: '500,000.00',
    plannedPaymentDate: '2026-09',
    plannedTransferDate: '2026-09',
    billingUser: '34020000000003',
    transferredAssetAmount: '0.00',
    remainingAssetAmount: '500,000.00',
    checked: false,
    actualTransferDate: '',
    transferStatus: '转出中'
  },
  {
    id: 'tp-4',
    milestone: '质保期满',
    plannedPaymentAmount: '100,000.00',
    plannedPaymentDate: '2027-09',
    plannedTransferDate: '2027-09',
    billingUser: '34020000000004',
    transferredAssetAmount: '0.00',
    remainingAssetAmount: '100,000.00',
    checked: false,
    actualTransferDate: '',
    transferStatus: '待转出'
  }
]

export default function AssetTransferCreate({ onNavigate, readOnly = false, id }: AssetTransferCreateProps) {
  const modal = useModal()
  const contractInfo = useMemo(() => getContractInfo(id), [id])
  const [itIncomeRows, setItIncomeRows] = useState<ITIncomeRow[]>(mockITIncomeRows)
  const [transferPlanRows, setTransferPlanRows] = useState<TransferPlanRow[]>(mockTransferPlanRows)
  const [progressFiles, setProgressFiles] = useState<string[]>(readOnly ? ['项目进度证明_20260615.pdf'] : [])
  // 下一步处理人（3组审批人）
  const [deptManager, setDeptManager] = useState('')
  const [bizManager, setBizManager] = useState('')
  const [financeManager, setFinanceManager] = useState('')

  // 合同资产转出计划勾选（仅剩余合同资产金额 > 0 的行可勾选）
  const handleTransferPlanCheck = (rowId: string, checked: boolean) => {
    setTransferPlanRows(prev => prev.map(r => {
      if (r.id !== rowId) return r
      if (parseFloat(r.remainingAssetAmount.replace(/,/g, '')) <= 0) return r
      return { ...r, checked }
    }))
  }

  // 计划明细全选（仅剩余合同资产金额 > 0 的行参与）
  const enableCheckRows = transferPlanRows.filter(r => parseFloat(r.remainingAssetAmount.replace(/,/g, '')) > 0)
  const tpAllChecked = enableCheckRows.length > 0 && enableCheckRows.every(r => r.checked)
  const tpIndeterminate = enableCheckRows.some(r => r.checked) && !tpAllChecked

  const handleTransferPlanCheckAll = (checked: boolean) => {
    setTransferPlanRows(prev => prev.map(r => {
      if (parseFloat(r.remainingAssetAmount.replace(/,/g, '')) <= 0) return r
      return { ...r, checked }
    }))
  }

  const handleSubmit = () => {
    if (!id) {
      modal.alert('请从合同资产列表点击"合同资产转出"进入')
      return
    }
    if (progressFiles.length === 0) {
      modal.alert('请上传项目进度证明')
      return
    }
    if (!deptManager) {
      modal.alert('请选择【科室经理】审批人')
      return
    }
    if (!bizManager) {
      modal.alert('请选择【行拓室经理】审批人')
      return
    }
    if (!financeManager) {
      modal.alert('请选择【财务管理员】审批人')
      return
    }

    modal.confirm('确定提交合同资产转出发起吗？', '提交申请').then(ok => {
      if (ok) {
        modal.alert('提交成功，已流转至合同资产转出审批', '提示').then(() => {
          onNavigate?.(`/finance/contract/asset-transfer/approval/${id}`)
        })
      }
    })
  }

  const handleCancel = () => {
    onNavigate?.('/finance/contract/asset-transfer')
  }

  // 文件上传占位（mock）
  const handleAddFile = () => {
    const fileName = `项目进度证明_${Date.now()}.pdf`
    setProgressFiles(prev => [...prev, fileName])
  }

  const handleRemoveFile = (index: number) => {
    setProgressFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 流程轨迹 mock 数据（详情页只读模式用）
  const assetTransferTrail: ProcessTrailItem[] = [
    { time: '2026-06-20 09:10:00', actor: '赵敏', action: '提交合同资产转出发起' },
    { time: '2026-06-20 11:30:00', actor: '科室经理', action: '审批通过' },
    { time: '2026-06-20 15:45:00', actor: '行拓室经理', action: '审批通过，流转至财务管理员' },
    { time: '2026-06-21 10:20:00', actor: '财务管理员', action: '审批通过，合同资产转出完成' }
  ]

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-[1600px] mx-auto p-3 space-y-3">
        {/* ========== 顶部返回条 ========== */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]"
          >
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">{readOnly ? '合同资产详情' : '合同资产转出发起'}</h2>
          </div>
        </div>

        {/* ========== 模块1：项目信息 ========== */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* ========== 模块2：项目附件 ========== */}
        <ContractAttachments attachments={contractInfo.attachments} defaultExpanded />

        {/* ========== 模块3：IT收入计划明细信息 ========== */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">IT收入计划明细信息</h3>
          </div>
          <div className="p-4">
            {mockITIncomeRows.map((row, idx) => (
              <div key={row.id}>
                {idx > 0 && <div className="border-t border-dashed border-gray-200 my-3" />}
                <div className="grid grid-cols-3 gap-x-6 gap-y-2">
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">合同编码：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700">{contractInfo.code}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">合同名称：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700 truncate" title={contractInfo.name}>{contractInfo.name}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">收入计划编码：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700">ITPLAN-{row.id.toUpperCase()}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">产品名称：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700">{row.productName}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">税率：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700">{row.taxRate}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">资费名称：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700 truncate" title={row.tariffName}>{row.tariffName}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-44 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">计划订购金额（含税，元）：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700">{row.plannedIncome}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">分摊类型：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700">{row.billingShareType}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">分摊周期：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700">{row.billingSharePeriod}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">是否合同资产：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700">{row.isContractAsset}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">计划订购时间：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700">{row.plannedOrderDate}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">里程碑名称：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700">{row.contractStage || '-'}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">管会产品：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700 truncate" title={row.mgmtProductName}>{row.mgmtProductName}</div>
                  </div>
                  <div className="flex items-center min-h-[32px]">
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">COA科目：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-700">{row.coaSubject}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========== 模块4：合同资产转出计划明细 ========== */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">合同资产转出计划明细</h3>
            <span className="text-xs text-gray-400">【{transferPlanRows.length}】</span>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto border border-gray-100 rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600 text-xs">
                  <tr>
                    {!readOnly && (
                      <th className="px-3 py-2.5 text-center font-medium w-12">
                        <input
                          type="checkbox"
                          checked={tpAllChecked}
                          ref={el => {
                            if (el) el.indeterminate = tpIndeterminate
                          }}
                          onChange={(e) => handleTransferPlanCheckAll(e.target.checked)}
                          className="w-3.5 h-3.5 accent-[#1677FF]"
                        />
                      </th>
                    )}
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">里程碑名称</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划回款金额（元）</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划回款时间</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同资产计划转出时间</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计费号码</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">已转出合同资产金额（元）</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">剩余合同资产金额（元）</th>
                    {!readOnly && (
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">本次计划转出合同资产金额（元）</th>
                    )}
                    {readOnly && (
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">实际转出日期</th>
                    )}
                    {readOnly && (
                      <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">转出状态</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transferPlanRows.length === 0 ? (
                    <tr>
                      <td colSpan={readOnly ? 10 : 9} className="px-4 py-8 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                      transferPlanRows.map(row => {
                        const remaining = parseFloat(row.remainingAssetAmount.replace(/,/g, ''))
                        const canCheck = remaining > 0
                        const statusColor = row.transferStatus === '全部转出' ? 'text-green-600' : row.transferStatus === '部分转出' ? 'text-[#1677FF]' : row.transferStatus === '转出中' ? 'text-orange-600' : 'text-gray-500'
                        return (
                          <tr key={row.id} className={canCheck ? 'hover:bg-gray-50/50' : 'bg-gray-50/30'}>
                            {!readOnly && (
                              <td className="px-3 py-2.5 text-center align-middle">
                                <input
                                  type="checkbox"
                                  disabled={!canCheck}
                                  checked={canCheck && row.checked}
                                  onChange={(e) => handleTransferPlanCheck(row.id, e.target.checked)}
                                  className={
                                    'w-3.5 h-3.5 accent-[#1677FF] ' +
                                    (canCheck ? '' : 'cursor-not-allowed opacity-50')
                                  }
                                />
                              </td>
                            )}
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.milestone}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedPaymentAmount}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedPaymentDate}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.plannedTransferDate}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.billingUser}</td>
                            <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.transferredAssetAmount}</td>
                            <td className={
                              'px-3 py-2.5 whitespace-nowrap font-medium ' +
                              (canCheck ? 'text-gray-800' : 'text-gray-400')
                            }>
                              {row.remainingAssetAmount}
                            </td>
                            {!readOnly && (
                              <td className={
                                'px-3 py-2.5 whitespace-nowrap ' +
                                (canCheck ? 'text-[#1677FF] font-medium' : 'text-gray-400')
                              }>
                                {row.remainingAssetAmount}
                              </td>
                            )}
                            {readOnly && (
                              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                                {row.actualTransferDate || '—'}
                              </td>
                            )}
                            {readOnly && (
                              <td className={'px-3 py-2.5 whitespace-nowrap font-medium ' + statusColor}>
                                {row.transferStatus}
                              </td>
                            )}
                          </tr>
                        )
                      })
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========== 模块5：项目进度证明 ========== */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">项目进度证明</h3>
            <span className="text-xs text-red-500">*</span>
          </div>
          <div className="p-4">
            <FileUpload
              hideLabel
              required
              files={progressFiles}
              onAdd={handleAddFile}
              onRemove={handleRemoveFile}
              readOnly={readOnly}
            />
          </div>
        </div>

        {/* ========== 流程信息（仅非详情编辑态展示） / 流程轨迹（仅详情页展示） ========== */}
        {!readOnly ? (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">流程信息</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0">下一步环节</label>
                    <div className="flex-1 min-w-0">
                      <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                        合同资产转出审批
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 mt-1">下一步处理人</label>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                            科室经理
                          </span>
                          <div className="flex-1 min-w-0">
                            <SearchableSelect
                              value={deptManager}
                              onChange={setDeptManager}
                              options={approverOptions}
                              placeholder="请选择下一步处理人"
                              disabled={readOnly}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                            行拓室经理
                          </span>
                          <div className="flex-1 min-w-0">
                            <SearchableSelect
                              value={bizManager}
                              onChange={setBizManager}
                              options={approverOptions}
                              placeholder="请选择下一步处理人"
                              disabled={readOnly}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                            财务管理员
                          </span>
                          <div className="flex-1 min-w-0">
                            <SearchableSelect
                              value={financeManager}
                              onChange={setFinanceManager}
                              options={approverOptions}
                              placeholder="请选择下一步处理人"
                              disabled={readOnly}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ========== 流程轨迹（仅详情页展示，放在最后） ========== */}
        {readOnly && <ProcessTrail trail={assetTransferTrail} />}

        {/* ========== 按钮区 ========== */}
        <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
          {readOnly ? (
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              返回
            </button>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}
