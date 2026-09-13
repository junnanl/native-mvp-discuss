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

interface AssetTransferApprovalProps {
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
}

// 审批人选项（与转出申请页面独立维护，互不影响）
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

// IT产品收入计划 mock（独立维护，只读展示）
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

// 合同资产转出计划明细 mock（独立维护）
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
    checked: false
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
    checked: false
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
    checked: false
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
    checked: false
  }
]

export default function AssetTransferApproval({ onNavigate, readOnly = false, id }: AssetTransferApprovalProps) {
  const modal = useModal()
  const contractInfo = useMemo(() => getContractInfo(id), [id])
  const [itIncomeRows] = useState<ITIncomeRow[]>(mockITIncomeRows)
  const [transferPlanRows] = useState<TransferPlanRow[]>(mockTransferPlanRows)
  const [progressFiles] = useState<string[]>(['项目进度证明_20260615.pdf'])
  // 审批结果（通过=pass / 驳回=reject）默认通过，通过时审批意见默认填"通过"
  const [approvalResult, setApprovalResult] = useState<'pass' | 'reject'>('pass')
  const [approvalOpinion, setApprovalOpinion] = useState('通过')
  // 流程信息中"解决方案经理"角色的处理人选择（仅驳回场景显示）
  const [solutionManager, setSolutionManager] = useState<string>('')
  // 下一步处理人（审批页场景：驳回时使用 解决方案经理 角色1组）
  const [deptManager] = useState('张三（解决方案经理）')
  const [bizManager] = useState('李四（解决方案经理）')
  const [financeManager] = useState('王五（解决方案经理）')

  // 审批场景：全部明细默认勾选（表示审批此单下的所有转出项）
  const handleTransferPlanCheck = (_rowId: string, _checked: boolean) => { /* noop：审批页移除勾选 */ }
  const enableCheckRows = transferPlanRows.filter(r => parseFloat(r.remainingAssetAmount.replace(/,/g, '')) > 0)
  const tpAllChecked = enableCheckRows.length > 0 && enableCheckRows.every(r => r.checked)
  const tpIndeterminate = enableCheckRows.some(r => r.checked) && !tpAllChecked
  const handleTransferPlanCheckAll = (_checked: boolean) => { /* noop：审批页移除勾选 */ }

  const handleApprove = () => {
    if (!id) {
      modal.alert('请从工作台待办点击【合同资产转出审批】进入')
      return
    }
    // 审批通过不需要勾选校验（已去掉复选框，按整张审批单通过）
    if (approvalResult === 'pass') {
      if (!approvalOpinion.trim()) {
        modal.alert('请填写审批意见')
        return
      }
      modal.confirm('确定审批通过合同资产转出发起吗？', '审批通过').then(ok => {
        if (ok) {
          modal.alert('审批通过，已流转至财务管理员', '提示').then(() => {
            onNavigate?.('/dashboard')
          })
        }
      })
      return
    }
    // 驳回 = 按"退回"逻辑处理
    if (!approvalOpinion.trim()) {
      modal.alert('请填写退回/不通过意见')
      return
    }
    if (!solutionManager.trim()) {
      modal.alert('请选择下一步处理人（解决方案经理）')
      return
    }
    modal.confirm('确定退回此合同资产转出发起吗？', '退回申请').then(ok => {
      if (ok) {
        modal.alert('申请已退回至发起人', '提示').then(() => {
          onNavigate?.('/dashboard')
        })
      }
    })
  }

  const handleReject = () => {
    // 退回按钮：快捷切换审批结果为"驳回"
    setApprovalResult('reject')
  }

  const handleCancel = () => {
    onNavigate?.('/dashboard')
  }

  // 流程轨迹 mock（审批页场景的历史轨迹+当前步）
  const assetTransferApprovalTrail: ProcessTrailItem[] = [
    { time: '2026-06-20 09:10:00', actor: '赵敏', action: '提交合同资产转出发起' },
    { time: '2026-06-20 11:30:00', actor: '科室经理', action: '审批通过' },
    { time: '2026-06-20 15:45:00', actor: '行拓室经理', action: '审批通过，流转至财务管理员' },
    { time: '2026-06-20 16:00:00', actor: '当前用户', action: '待审批（合同资产转出审批）' }
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
            <h2 className="text-sm font-semibold text-gray-800">合同资产转出审批</h2>
          </div>
          {!readOnly && (
            <span className="ml-auto inline-flex items-center px-2.5 py-1 text-xs font-medium text-orange-600 bg-orange-50 border border-orange-100 rounded-full">
              审批中
            </span>
          )}
        </div>

        {/* ========== 模块1：项目信息 ========== */}
        <ProjectInfoCard contractInfo={contractInfo} defaultExpanded={false} />

        {/* ========== 模块2：项目附件 ========== */}
        <ContractAttachments attachments={contractInfo.attachments} defaultExpanded={false} />

        {/* ========== 模块3：流程轨迹（默认折叠） ========== */}
        <ProcessTrail trail={assetTransferApprovalTrail} defaultExpanded={false} />

        {/* ========== 模块4：IT收入计划明细信息 ========== */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">IT收入计划明细信息</h3>
          </div>
          <div className="p-4">
            {itIncomeRows.map((row, idx) => (
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
                    <label className="w-32 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">计划订购金额：</label>
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
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">里程碑名称</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划回款金额（元）</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划回款时间</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">合同资产计划转出时间</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计费号码</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">已转出合同资产金额（元）</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">剩余合同资产金额（元）</th>
                    <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">本次计划转出合同资产金额（元）</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transferPlanRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                      transferPlanRows.map(row => {
                        const remaining = parseFloat(row.remainingAssetAmount.replace(/,/g, ''))
                        const canCheck = remaining > 0
                        return (
                          <tr key={row.id} className={canCheck ? 'hover:bg-gray-50/50' : 'bg-gray-50/30'}>
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
                            <td className={
                              'px-3 py-2.5 whitespace-nowrap ' +
                              (canCheck ? 'text-[#1677FF] font-medium' : 'text-gray-400')
                            }>
                              {row.remainingAssetAmount}
                            </td>
                          </tr>
                        )
                      })
                    )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ========== 模块5：项目进度证明（只读） ========== */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">项目进度证明</h3>
          </div>
          <div className="p-4">
            <FileUpload
              hideLabel
              readOnly
              files={progressFiles}
              onAdd={() => {}}
              onRemove={() => {}}
            />
          </div>
        </div>

        {/* ========== 审批信息模块（插入流程信息上方，图一结构） ========== */}
        {!readOnly && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">审批信息</h3>
            </div>
            <div className="p-4 space-y-4">
              {/* 审批结果（单选按钮组：通过 / 驳回） */}
              <div className="flex items-start">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 mt-1 pr-2 whitespace-nowrap">
                  <span className="text-red-500 mr-0.5">*</span>审批结果
                </label>
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalResult('pass')
                      if (!approvalOpinion.trim() || approvalOpinion.trim() === '') {
                        setApprovalOpinion('通过')
                      }
                    }}
                    className={
                      'px-5 py-1.5 text-sm rounded-md border transition-colors ' +
                      (approvalResult === 'pass'
                        ? 'text-green-600 border-green-500 bg-green-50 font-medium'
                        : 'text-gray-600 border-gray-200 bg-white hover:bg-gray-50')
                    }
                  >
                    通过
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalResult('reject')
                      // 从"通过"切到"驳回"：清空意见，避免误带默认值
                      if (approvalOpinion === '通过') {
                        setApprovalOpinion('')
                      }
                    }}
                    className={
                      'px-5 py-1.5 text-sm rounded-md border transition-colors ' +
                      (approvalResult === 'reject'
                        ? 'text-red-600 border-red-500 bg-red-50 font-medium'
                        : 'text-gray-600 border-gray-200 bg-white hover:bg-gray-50')
                    }
                  >
                    驳回
                  </button>
                </div>
              </div>

              {/* 审批意见（大文本框，全屏宽度） */}
              <div className="flex items-start">
                <label className="w-32 text-right text-sm text-gray-700 shrink-0 mt-1 pr-2 whitespace-nowrap">
                  <span className="text-red-500 mr-0.5">*</span>审批意见
                </label>
                <div className="flex-1 min-w-0">
                  <textarea
                    value={approvalOpinion}
                    onChange={(e) => setApprovalOpinion(e.target.value)}
                    rows={4}
                    placeholder="请填写审批意见，如：通过/驳回及原因"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== 流程信息（仅驳回场景显示） ========== */}
        {!readOnly && approvalResult === 'reject' && (
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
                        合同资产转出
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start min-h-[36px]">
                    <label className="w-32 text-right text-sm text-gray-700 shrink-0 mt-1">下一步处理人</label>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded shrink-0">
                          解决方案经理
                        </span>
                        <div className="flex-1 min-w-0">
                          <SearchableSelect
                            value={solutionManager}
                            onChange={setSolutionManager}
                            options={approverOptions}
                            placeholder="请选择下一步处理人（解决方案经理）"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========== 按钮区：readOnly显示返回，否则显示取消+提交 ========== */}
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
                onClick={handleReject}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                取消
              </button>
              <button
                type="button"
                onClick={handleApprove}
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
