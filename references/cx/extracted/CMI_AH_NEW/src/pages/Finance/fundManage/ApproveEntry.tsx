import { useState, useMemo } from 'react'
import { ArrowLeft, Search, Check, RotateCcw, X, FileText, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { useModal } from '@/components/Modal'
import { approveEntryList, getApproveEntryByFundId, getFundApplyDetail, fundApplyList, investmentTypeMap, decisionLevelMap, getApprovalTrail } from '@/data/mock'
import type { ApproveEntryItem, FundApplyItem } from '@/data/mock'
import clsx from 'clsx'

interface ApproveEntryProps {
  onNavigate: (path: string) => void
  fundApplyId?: string
}

interface FilterForm {
  fundApplyCode: string
  projectName: string
  status: string
}

const defaultFilter: FilterForm = {
  fundApplyCode: '',
  projectName: '',
  status: ''
}

// 单条PMS批复记录
interface PmsEntryRow {
  key: string
  pmsNo: string
  pmsProjectCode: string
  approveAmount: string
  approveDate: string
}

// 生成唯一key
let rowKeyCounter = 0
const newRowKey = () => `row-${Date.now()}-${++rowKeyCounter}`

const createEmptyRow = (): PmsEntryRow => ({
  key: newRowKey(),
  pmsNo: '',
  pmsProjectCode: '',
  approveAmount: '',
  approveDate: ''
})

export default function ApproveEntry({ onNavigate, fundApplyId }: ApproveEntryProps) {
  const modal = useModal()
  const [filter, setFilter] = useState<FilterForm>(defaultFilter)
  const [submittedFilter, setSubmittedFilter] = useState<FilterForm>(defaultFilter)
  const [page, setPage] = useState(1)
  const pageSize = 10

  // 录入模式：通过URL参数或列表点击进入
  const [entryTarget, setEntryTarget] = useState<FundApplyItem | null>(() => {
    if (fundApplyId) return getFundApplyDetail(fundApplyId) || null
    return null
  })
  const [existingEntries, setExistingEntries] = useState<ApproveEntryItem[]>([])

  // 多条PMS批复记录
  const [rows, setRows] = useState<PmsEntryRow[]>([createEmptyRow()])
  const [trailExpanded, setTrailExpanded] = useState(false)

  // 新建录入：选择资金申请
  const [showFundSelectModal, setShowFundSelectModal] = useState(false)
  const [fundSearch, setFundSearch] = useState({ code: '', name: '' })
  const [selectedFundId, setSelectedFundId] = useState('')

  // 可录入的资金申请列表（投资类 + 审批完成/批复录入中状态）
  const availableFunds = useMemo(() => {
    return fundApplyList.filter(f =>
      f.type === 'invest' && (f.status === '04' || f.status === '05')
    )
  }, [])

  const filteredFunds = useMemo(() => {
    return availableFunds.filter(f => {
      const codeMatch = !fundSearch.code.trim() || f.code.includes(fundSearch.code.trim())
      const nameMatch = !fundSearch.name.trim() || f.projectName.includes(fundSearch.name.trim())
      return codeMatch && nameMatch
    })
  }, [availableFunds, fundSearch])

  const filteredList = useMemo(() => {
    return approveEntryList.filter(item => {
      const codeMatch = !submittedFilter.fundApplyCode.trim() || item.fundApplyCode.includes(submittedFilter.fundApplyCode.trim())
      const nameMatch = !submittedFilter.projectName.trim() || item.projectName.includes(submittedFilter.projectName.trim())
      const statusMatch = !submittedFilter.status || item.status === submittedFilter.status
      return codeMatch && nameMatch && statusMatch
    })
  }, [submittedFilter])

  const totalPages = Math.ceil(filteredList.length / pageSize)
  const pagedList = filteredList.slice((page - 1) * pageSize, page * pageSize)

  const handleChange = <K extends keyof FilterForm>(key: K, value: FilterForm[K]) => {
    setFilter(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    setSubmittedFilter(filter)
    setPage(1)
  }

  const handleReset = () => {
    setFilter(defaultFilter)
    setSubmittedFilter(defaultFilter)
    setPage(1)
  }

  const handleBack = () => {
    onNavigate?.('/finance/fund/ict-invest')
  }

  // 从列表点击「录入」进入
  const handleStartEntry = (item: ApproveEntryItem) => {
    const fundItem = getFundApplyDetail(item.fundApplyId)
    if (fundItem) {
      setEntryTarget(fundItem)
      setExistingEntries([item])
      // 预填已有数据
      setRows([{
        key: newRowKey(),
        pmsNo: item.pmsNo || '',
        pmsProjectCode: item.pmsProjectCode || '',
        approveAmount: item.approveAmount || '',
        approveDate: item.approveTime || ''
      }])
    }
  }

  // 新建录入：打开资金申请选择弹窗
  const handleNewEntry = () => {
    setSelectedFundId('')
    setFundSearch({ code: '', name: '' })
    setShowFundSelectModal(true)
  }

  // 选择资金申请后进入多行录入
  const handleConfirmFundSelect = () => {
    if (!selectedFundId) {
      alert('请选择一个资金申请')
      return
    }
    const fund = getFundApplyDetail(selectedFundId)
    if (fund) {
      const existing = approveEntryList.filter(e => e.fundApplyId === selectedFundId)
      setEntryTarget(fund)
      setExistingEntries(existing)
      if (existing.length > 0) {
        setRows(existing.map(e => ({
          key: newRowKey(),
          pmsNo: e.pmsNo || '',
          pmsProjectCode: e.pmsProjectCode || '',
          approveAmount: e.approveAmount || '',
          approveDate: e.approveTime || ''
        })))
      } else {
        setRows([createEmptyRow()])
      }
    }
    setShowFundSelectModal(false)
  }

  // 行编辑
  const handleRowChange = (rowKey: string, field: keyof PmsEntryRow, value: string) => {
    setRows(prev => prev.map(r => r.key === rowKey ? { ...r, [field]: value } : r))
  }

  const handleAddRow = () => {
    setRows(prev => [...prev, createEmptyRow()])
  }

  const handleDeleteRow = (rowKey: string) => {
    setRows(prev => {
      if (prev.length <= 1) return prev // 至少保留一行
      return prev.filter(r => r.key !== rowKey)
    })
  }

  const handleSubmitEntry = () => {
    const errors: string[] = []
    rows.forEach((row, idx) => {
      const line = rows.length > 1 ? `第${idx + 1}行：` : ''
      if (!row.pmsNo.trim()) errors.push(`${line}请输入PMS批复文号`)
      if (!row.pmsProjectCode.trim()) errors.push(`${line}请输入PMS项目编码`)
      if (!row.approveAmount.trim()) errors.push(`${line}请输入批复金额`)
      if (!row.approveDate) errors.push(`${line}请选择批复日期`)
    })

    if (errors.length > 0) {
      alert(errors.join('\n'))
      return
    }

    const hasExisting = existingEntries.length > 0
    const action = hasExisting ? '修改' : '录入'
    modal.confirm(
      `确定${action} ${rows.length} 条批复结果吗？`,
      `批复${action}`
    ).then(ok => {
      if (ok) {
        alert(`批复${action}成功（共 ${rows.length} 条）`)
        setEntryTarget(null)
        setExistingEntries([])
        setRows([createEmptyRow()])
        onNavigate?.('/finance/fund/ict-invest')
      }
    })
  }

  const getStatusLabel = (status: string) => {
    if (status === 'pending') return '待录入'
    if (status === 'entered') return '已录入'
    return status
  }

  const getStatusClass = (status: string) => {
    if (status === 'pending') return 'bg-orange-100 text-orange-600'
    if (status === 'entered') return 'bg-green-100 text-green-600'
    return 'bg-gray-100 text-gray-600'
  }

  // ========== 录入表单视图（支持多条） ==========
  if (entryTarget) {
    const hasExisting = existingEntries.length > 0 && existingEntries[0]?.status === 'entered'
    const isReadonly = hasExisting
    const approvalTrail = getApprovalTrail(entryTarget.id)

    return (
      <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50 p-4">
        <div className="w-full space-y-3">
          {/* 返回条 */}
          <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
            <button onClick={handleBack} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF]">
              <ArrowLeft className="w-4 h-4" /> 返回
            </button>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h2 className="text-sm font-semibold text-gray-800">投资类资金申请PMS批复录入</h2>
            </div>
          </div>

          {/* 资金申请工单（复制自投资类资金申请审批页面） */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">资金申请工单</h3>
            </div>
            <div className="px-4 py-4">
              <div className="grid grid-cols-3 gap-x-6 gap-y-0">
                <InvestField label="省内项目编码" value={entryTarget.projectCode} />
                <InvestField label="全省项目编码" value={entryTarget.globalCode} />
                <InvestField label="项目名称" value={entryTarget.projectName} />
                <InvestField label="归属地市" value={entryTarget.cityName} />
                <InvestField label="投资类型" value={entryTarget.investmentType ? investmentTypeMap[entryTarget.investmentType] : '-'} />
                <InvestField label="决策层级" value={entryTarget.decisionLevel ? decisionLevelMap[entryTarget.decisionLevel] : '-'} />
                <InvestField label="IT投资（不含税，元）" value={entryTarget.itInvestAmount} />
                <InvestField label="传输大网投资（不含税，元）" value={entryTarget.transmissionNetAmount} />
                <InvestField label="传输政企投资（不含税，元）" value={entryTarget.transmissionGeAmount} />
                <InvestField label="IDC投资（不含税，元）" value={entryTarget.idcInvestAmount} />
                <InvestField label="核心网投资（不含税，元）" value={entryTarget.coreNetAmount} />
                <InvestField label="无线网投资（不含税，元）" value={entryTarget.wirelessNetAmount} />
                <InvestField label="投资申请总金额（不含税，元）" value={entryTarget.applyAmount} />
                <InvestField label="协议期（年）" value={entryTarget.agreementPeriod} />
                <InvestField label="预计总投入（不含税，元）" value={entryTarget.estimateAmount} />
                <InvestField label="总收入（不含税，元）" value={entryTarget.totalIncomeAmount} />
                <InvestField label="动态回收期（年）" value={entryTarget.paybackPeriod} />
                <InvestField label="项目净现值（元）" value={entryTarget.netPresentValue} />
                <InvestField label="项目净现值率（%）" value={entryTarget.netPresentValueRate} />
                <InvestField label="项目内部收益率（%）" value={entryTarget.internalRateOfReturn} />
                <InvestField label="工程进度要求" value={entryTarget.constructionSchedule} />
              </div>
              <div>
                <div className="flex items-center min-h-[36px]">
                  <label className="w-56 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">建设内容：</label>
                  <div className="flex-1 min-w-0 text-sm text-gray-800 whitespace-pre-wrap">{entryTarget.applyContent || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* PMS批复信息录入（多条） */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">PMS批复录入信息</h3>
                <span className="text-xs text-gray-400">共 {rows.length} 条</span>
              </div>
              {!isReadonly && (
                <button type="button" onClick={handleAddRow}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#1677FF] bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  新增
                </button>
              )}
            </div>

            <div className="px-4 py-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-gray-500">
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                        <span className="text-red-500 mr-0.5">*</span>PMS批复文号
                      </th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap">
                        <span className="text-red-500 mr-0.5">*</span>PMS项目编码
                      </th>
                      <th className="px-2 py-2 text-right font-medium whitespace-nowrap w-32">
                        <span className="text-red-500 mr-0.5">*</span>批复金额（万元）
                      </th>
                      <th className="px-2 py-2 text-left font-medium whitespace-nowrap w-32">
                        <span className="text-red-500 mr-0.5">*</span>批复日期
                      </th>
                      {!isReadonly && (
                        <th className="px-2 py-2 text-center font-medium whitespace-nowrap w-14">操作</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row) => (
                      <tr key={row.key} className="hover:bg-gray-50/50">
                        <td className="px-2 py-2">
                          {isReadonly ? (
                            <span className="text-sm text-gray-800">{row.pmsNo || '-'}</span>
                          ) : (
                            <input type="text" value={row.pmsNo}
                              onChange={(e) => handleRowChange(row.key, 'pmsNo', e.target.value)}
                              placeholder="如：PMS-2026-AH-0012"
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {isReadonly ? (
                            <span className="text-sm text-gray-800">{row.pmsProjectCode || '-'}</span>
                          ) : (
                            <input type="text" value={row.pmsProjectCode}
                              onChange={(e) => handleRowChange(row.key, 'pmsProjectCode', e.target.value)}
                              placeholder="请输入PMS项目编码"
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {isReadonly ? (
                            <span className="text-sm text-gray-800 text-right block">{row.approveAmount || '-'}</span>
                          ) : (
                            <input type="text" value={row.approveAmount}
                              onChange={(e) => handleRowChange(row.key, 'approveAmount', e.target.value)}
                              placeholder="请输入金额"
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded text-right focus:outline-none focus:border-blue-500" />
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {isReadonly ? (
                            <span className="text-sm text-gray-800">{row.approveDate || '-'}</span>
                          ) : (
                            <input type="date" value={row.approveDate}
                              onChange={(e) => handleRowChange(row.key, 'approveDate', e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500" />
                          )}
                        </td>
                        {!isReadonly && (
                          <td className="px-2 py-2 text-center">
                            <button type="button" onClick={() => handleDeleteRow(row.key)}
                              disabled={rows.length <= 1}
                              className="inline-flex items-center justify-center w-7 h-7 text-red-500 hover:bg-red-50 rounded transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                              title={rows.length <= 1 ? '至少保留一行' : '删除此行'}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 已录入的录入信息 */}
              {isReadonly && existingEntries.length > 0 && existingEntries[0]?.entryUser && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                  录入人：{existingEntries[0].entryUser}　｜　录入时间：{existingEntries[0].entryTime}
                </div>
              )}
            </div>
          </div>

          {/* 流程轨迹（默认折叠） */}
          {approvalTrail && approvalTrail.steps.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm">
              <div
                className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-50 px-4 py-3 border-b border-gray-100"
                onClick={() => setTrailExpanded(v => !v)}
              >
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
                <span className="text-xs text-gray-400">共 {approvalTrail.steps.length} 步</span>
                <div className="ml-auto flex items-center">
                  {trailExpanded
                    ? <ChevronDown className="w-4 h-4 text-gray-500" />
                    : <ChevronRight className="w-4 h-4 text-gray-500" />
                  }
                </div>
              </div>
              {trailExpanded && (
                <div className="px-4 py-4">
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
                    <ol className="space-y-4">
                      {approvalTrail.steps.map((step, idx) => (
                        <li key={step.id} className="relative">
                          <div className={clsx(
                            'absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2',
                            idx === approvalTrail.steps.length - 1
                              ? 'bg-[#1677FF] border-[#1677FF]'
                              : 'bg-white border-gray-300'
                          )} />
                          <div className="text-xs text-gray-400 mb-0.5">{step.time || '-'}</div>
                          <div className="text-sm text-gray-800">
                            <span className="font-medium">{step.approver !== '-' ? step.approver : step.nodeName}</span>
                            {step.approverRole && step.approverRole !== '-' && (
                              <span className="text-gray-500 ml-1">（{step.approverRole}）</span>
                            )}
                            <span className="text-gray-500 ml-1.5">
                              {step.nodeName}
                              {step.action && step.action !== '-' && ` · ${step.action}`}
                            </span>
                            {step.comment && step.comment !== '-' && (
                              <div className="text-xs text-gray-500 mt-0.5 pl-1">审批意见：{step.comment}</div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 按钮区 */}
          {!isReadonly && (
            <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <button type="button" onClick={handleBack}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" />取消
              </button>
              <button type="button" onClick={handleSubmitEntry}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5">
                <Check className="w-4 h-4" />提交
              </button>
            </div>
          )}
        </div>

        {/* 选择资金申请弹窗（新建录入时使用） */}
        {showFundSelectModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40" onClick={() => setShowFundSelectModal(false)}>
            <div className="bg-white rounded-lg shadow-2xl w-[900px] max-w-[90vw] overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">选择待批复的资金申请</h3>
                <button type="button" onClick={() => setShowFundSelectModal(false)} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label="关闭">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 shrink-0 w-20 text-right">申请编码</label>
                    <input type="text" value={fundSearch.code} onChange={(e) => setFundSearch(prev => ({ ...prev, code: e.target.value }))}
                      placeholder="请输入申请编码" className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700 shrink-0 w-20 text-right">项目名称</label>
                    <input type="text" value={fundSearch.name} onChange={(e) => setFundSearch(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="请输入项目名称" className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="text-gray-500">
                      <th className="w-10 px-4 py-2.5 text-left"><span className="sr-only">选择</span></th>
                      <th className="px-3 py-2.5 text-left font-medium">申请编码</th>
                      <th className="px-3 py-2.5 text-left font-medium">项目名称</th>
                      <th className="px-3 py-2.5 text-left font-medium">投资类型</th>
                      <th className="px-3 py-2.5 text-right font-medium">申请金额（元）</th>
                      <th className="px-3 py-2.5 text-left font-medium">申请人</th>
                      <th className="px-3 py-2.5 text-left font-medium">创建时间</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredFunds.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">暂无待批复的资金申请</td></tr>
                    ) : (
                      filteredFunds.map(fund => (
                        <tr key={fund.id} className={clsx('cursor-pointer hover:bg-blue-50/50 transition-colors', selectedFundId === fund.id && 'bg-blue-50')}
                          onClick={() => setSelectedFundId(fund.id)}>
                          <td className="px-4 py-3"><input type="radio" name="fund" checked={selectedFundId === fund.id} onChange={() => setSelectedFundId(fund.id)} className="w-4 h-4 text-blue-600" /></td>
                          <td className="px-3 py-3 text-gray-800 font-medium">{fund.code}</td>
                          <td className="px-3 py-3 text-gray-800">{fund.projectName}</td>
                          <td className="px-3 py-3 text-gray-600">{fund.investmentType || '-'}</td>
                          <td className="px-3 py-3 text-gray-800 text-right">{fund.applyAmount}</td>
                          <td className="px-3 py-3 text-gray-600">{fund.applyUser}</td>
                          <td className="px-3 py-3 text-gray-500">{fund.createTime}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
                <button type="button" onClick={() => setShowFundSelectModal(false)}
                  className="px-6 py-1.5 text-sm text-blue-600 bg-white border border-blue-600 rounded hover:bg-blue-50 transition-colors">取消</button>
                <button type="button" onClick={handleConfirmFundSelect}
                  className="px-6 py-1.5 text-sm text-white bg-[#1677FF] rounded hover:bg-[#1668DD] transition-colors">确认并进入录入</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ========== 列表视图 ==========
  return (
    <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50 p-4">
      <div className="w-full space-y-3">
        {/* 查询条件 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">申请单编码</label>
              <input type="text" value={filter.fundApplyCode} onChange={(e) => handleChange('fundApplyCode', e.target.value)}
                placeholder="请输入资金申请单编码" className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">项目名称</label>
              <input type="text" value={filter.projectName} onChange={(e) => handleChange('projectName', e.target.value)}
                placeholder="请输入项目名称" className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <label className="w-28 text-right text-sm text-gray-700 shrink-0">录入状态</label>
              <select value={filter.status} onChange={(e) => handleChange('status', e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white">
                <option value="">全部状态</option>
                <option value="pending">待录入</option>
                <option value="entered">已录入</option>
              </select>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-4 pt-4 border-t border-gray-100">
            <button type="button" onClick={handleReset}
              className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" />重置
            </button>
            <button type="button" onClick={handleSearch}
              className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5">
              <Search className="w-4 h-4" />查询
            </button>
          </div>
        </div>

        {/* 批复录入列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">批复录入列表</h3>
              <span className="text-xs text-gray-400">共 {filteredList.length} 条</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={handleNewEntry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors">
                <FileText className="w-3.5 h-3.5" />
                新建批复录入
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资金申请编码</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">项目名称</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">批复金额（万元）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">PMS批复文号</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">批复日期</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">录入状态</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">录入人</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">录入时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pagedList.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-gray-400">暂无数据</td>
                  </tr>
                ) : (
                  pagedList.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap font-medium">{item.fundApplyCode}</td>
                      <td className="px-3 py-3 text-gray-800 whitespace-nowrap">{item.projectName}</td>
                      <td className="px-3 py-3 text-gray-800 text-right whitespace-nowrap font-medium">{item.approveAmount}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.pmsNo}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.approveTime}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full ${getStatusClass(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{item.entryUser || '-'}</td>
                      <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{item.entryTime || '-'}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {item.status === 'pending' && (
                          <button type="button" onClick={() => handleStartEntry(item)}
                            className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-[#1668DD] hover:underline">
                            <Check className="w-3.5 h-3.5" />
                            录入
                          </button>
                        )}
                        {item.status === 'entered' && (
                          <button type="button" onClick={() => handleStartEntry(item)}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 hover:underline">
                            查看
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {filteredList.length > 0 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-500">共 {filteredList.length} 条记录，第 {page}/{totalPages || 1} 页</div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setPage(1)} disabled={page === 1}
                  className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">首页</button>
                <button type="button" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">上一页</button>
                <span className="text-sm text-gray-600 min-w-[60px] text-center">{page} / {totalPages || 1}</span>
                <button type="button" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                  className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">下一页</button>
                <button type="button" onClick={() => setPage(totalPages)} disabled={page >= totalPages}
                  className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">末页</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InvestField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center min-h-[36px]">
      <label className="w-56 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">{label}：</label>
      <div className="flex-1 min-w-0 text-sm text-gray-800">{value || '-'}</div>
    </div>
  )
}
