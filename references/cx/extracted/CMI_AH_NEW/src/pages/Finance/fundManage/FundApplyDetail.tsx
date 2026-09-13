import { useMemo, useState } from 'react'
import { ArrowLeft, FileText, Eye, Download, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { getFundApplyDetail, getCostFundStatusText, getInvestFundStatusText, getFundStatusClass, investmentTypeMap, decisionLevelMap, getApproveEntryByFundId, getApprovalTrail } from '@/data/mock'
import clsx from 'clsx'

interface FundApplyDetailProps {
  onNavigate: (path: string) => void
  id: string
}

const businessTypeLabels: Record<string, string> = { network: '网络费用', software: '软件费用', service: '服务费用', other: '其他费用' }

// 项目附件（按项目编码匹配，复制自政企详情页）
interface GovAttachFile {
  id: string
  name: string
  size: string
  uploadTime: string
  tag: string
}
const projectAttachments: Record<string, GovAttachFile[]> = {
  'PRJ-2026-HF-001': [
    { id: 'p1-d1', name: '合肥市第一人民医院_签报文件.pdf', size: '1,245.6 KB', uploadTime: '2026-05-10 09:30', tag: '签报文件' },
    { id: 'p1-f1', name: '合肥市第一人民医院_前向合同.pdf', size: '3,512.2 KB', uploadTime: '2026-05-12 14:20', tag: '前向合同' },
    { id: 'p1-b1', name: '合肥市第一人民医院_中标通知书.pdf', size: '856.4 KB', uploadTime: '2026-05-08 16:45', tag: '中标通知书' }
  ],
  'PRJ-2026-WH-001': [
    { id: 'p2-d1', name: '芜湖市政务服务中心_签报文件.pdf', size: '1,102.3 KB', uploadTime: '2026-05-15 10:15', tag: '签报文件' },
    { id: 'p2-b1', name: '芜湖市政务服务中心_中标通知书.pdf', size: '724.1 KB', uploadTime: '2026-05-13 11:30', tag: '中标通知书' }
  ],
  'PRJ-2026-BB-001': [
    { id: 'p3-d1', name: '蚌埠市教育局_签报文件.pdf', size: '985.7 KB', uploadTime: '2026-05-18 09:00', tag: '签报文件' },
    { id: 'p3-f1', name: '蚌埠市教育局_前向合同.pdf', size: '2,876.9 KB', uploadTime: '2026-05-20 15:45', tag: '前向合同' },
    { id: 'p3-b1', name: '蚌埠市教育局_中标通知书.pdf', size: '820.3 KB', uploadTime: '2026-05-19 10:20', tag: '中标通知书' }
  ],
  'PRJ-2026-HF-002': [
    { id: 'p4-d1', name: '合肥市轨道交通_签报文件.pdf', size: '1,532.4 KB', uploadTime: '2026-05-22 13:20', tag: '签报文件' },
    { id: 'p4-f1', name: '合肥市轨道交通_前向合同.pdf', size: '4,210.6 KB', uploadTime: '2026-05-24 10:10', tag: '前向合同' },
    { id: 'p4-b1', name: '合肥市轨道交通_中标通知书.pdf', size: '1,024.8 KB', uploadTime: '2026-05-23 09:45', tag: '中标通知书' }
  ],
  'PRJ20260005': [
    { id: 'p5-d1', name: '马鞍山智慧城市_签报文件.pdf', size: '1,378.2 KB', uploadTime: '2026-05-25 14:30', tag: '签报文件' },
    { id: 'p5-b1', name: '马鞍山智慧城市_中标通知书.pdf', size: '912.8 KB', uploadTime: '2026-05-23 16:00', tag: '中标通知书' }
  ],
  'PRJ20260002': [
    { id: 'p6-d1', name: '合肥政务云平台_签报文件.pdf', size: '1,156.5 KB', uploadTime: '2026-05-28 11:45', tag: '签报文件' },
    { id: 'p6-f1', name: '合肥政务云平台_前向合同.pdf', size: '3,024.1 KB', uploadTime: '2026-05-30 09:15', tag: '前向合同' },
    { id: 'p6-b1', name: '合肥政务云平台_中标通知书.pdf', size: '880.2 KB', uploadTime: '2026-05-29 15:10', tag: '中标通知书' }
  ]
}

export default function FundApplyDetail({ onNavigate, id }: FundApplyDetailProps) {
  const item = useMemo(() => getFundApplyDetail(id), [id])
  const [attachExpanded, setAttachExpanded] = useState(true)
  const [trailExpanded, setTrailExpanded] = useState(false)

  if (!item) {
    return (
      <div className="h-full overflow-y-auto overflow-x-hidden bg-gray-50 p-4">
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-sm px-4 py-12 text-center text-gray-400">未找到该资金申请记录</div>
        </div>
      </div>
    )
  }

  const isInvest = item.type === 'invest'
  const isCost = item.type === 'cost'
  const statusText = isInvest ? getInvestFundStatusText(item.status) : getCostFundStatusText(item.status)
  const entryRecords = isInvest ? getApproveEntryByFundId(item.id) : undefined
  const approvalTrail = isInvest ? getApprovalTrail(item.id) : undefined

  // 项目附件（按项目编码匹配）
  const attachments = isInvest ? (projectAttachments[item.projectCode] || []) : []

  const handleBack = () => onNavigate?.('/finance/fund/ict-invest')

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
            <h2 className="text-sm font-semibold text-gray-800">{isInvest ? 'ICT项目投资立项工单详情' : '成本类资金申请详情'}</h2>
          </div>
          <div className="ml-auto">
            <span className={`inline-flex items-center px-2.5 py-0.5 text-xs rounded-full font-medium ${getFundStatusClass(item.status, item.type)}`}>{statusText}</span>
          </div>
        </div>

        {/* ========== 投资类详情 ========== */}
        {isInvest && (
          <>
            {/* 资金申请工单 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">资金申请工单</h3>
              </div>
              <div className="px-4 py-4">
                <div className="grid grid-cols-3 gap-x-6 gap-y-0">
                  <InvestField label="省内项目编码" value={item.projectCode} />
                  <InvestField label="全省项目编码" value={item.globalCode} />
                  <InvestField label="项目名称" value={item.projectName} />
                  <InvestField label="归属地市" value={item.cityName} />
                  <InvestField label="投资类型" value={item.investmentType ? investmentTypeMap[item.investmentType] : '-'} />
                  <InvestField label="决策层级" value={item.decisionLevel ? decisionLevelMap[item.decisionLevel] : '-'} />
                  <InvestField label="IT投资（不含税，元）" value={item.itInvestAmount} />
                  <InvestField label="传输大网投资（不含税，元）" value={item.transmissionNetAmount} />
                  <InvestField label="传输政企投资（不含税，元）" value={item.transmissionGeAmount} />
                  <InvestField label="IDC投资（不含税，元）" value={item.idcInvestAmount} />
                  <InvestField label="核心网投资（不含税，元）" value={item.coreNetAmount} />
                  <InvestField label="无线网投资（不含税，元）" value={item.wirelessNetAmount} />
                  <InvestField label="投资申请总金额（不含税，元）" value={item.applyAmount} />
                  <InvestField label="协议期（年）" value={item.agreementPeriod} />
                  <InvestField label="预计总投入（不含税，元）" value={item.estimateAmount} />
                  <InvestField label="总收入（不含税，元）" value={item.totalIncomeAmount} />
                  <InvestField label="动态回收期（年）" value={item.paybackPeriod} />
                  <InvestField label="项目净现值（元）" value={item.netPresentValue} />
                  <InvestField label="项目净现值率（%）" value={item.netPresentValueRate} />
                  <InvestField label="项目内部收益率（%）" value={item.internalRateOfReturn} />
                  <InvestField label="工程进度要求" value={item.constructionSchedule} />
                </div>
                <div>
                  <div className="flex items-center min-h-[36px]">
                    <label className="w-56 text-right text-sm text-gray-500 shrink-0 whitespace-nowrap pr-2">建设内容：</label>
                    <div className="flex-1 min-w-0 text-sm text-gray-800 whitespace-pre-wrap">{item.applyContent || '-'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 项目附件（可展开/收起，复制自政企详情页） */}
            <div className="bg-white rounded-lg shadow-sm">
              <div
                className="flex items-center gap-2 cursor-pointer select-none hover:bg-gray-50 px-4 py-3 rounded-t-lg"
                onClick={() => setAttachExpanded(v => !v)}
              >
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">项目附件</h3>
                <span className="text-xs text-gray-400">共 {attachments.length} 个</span>
                <div className="ml-auto flex items-center">
                  {attachExpanded
                    ? <ChevronDown className="w-4 h-4 text-gray-500" />
                    : <ChevronRight className="w-4 h-4 text-gray-500" />
                  }
                </div>
              </div>
              {attachExpanded && (
                <div className="px-4 pb-4">
                  <div className="pt-2 border-t border-gray-100 space-y-2">
                    {attachments.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-400">暂无附件</div>
                    ) : (
                      attachments.map(file => (
                        <div key={file.id} className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-md hover:bg-gray-50/50">
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="w-4 h-4 text-[#1677FF] shrink-0" />
                            <span className="text-sm text-gray-800 truncate">{file.name}</span>
                            <span className="inline-flex items-center px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded shrink-0">{file.tag}</span>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 ml-3">
                            <span className="text-xs text-gray-400 whitespace-nowrap">{file.size}</span>
                            <span className="text-xs text-gray-400 whitespace-nowrap">{file.uploadTime}</span>
                            <button type="button" className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-blue-700 whitespace-nowrap">
                              <Eye className="w-3.5 h-3.5" />
                              预览
                            </button>
                            <button type="button" className="inline-flex items-center gap-1 text-xs text-[#1677FF] hover:text-blue-700 whitespace-nowrap">
                              <Download className="w-3.5 h-3.5" />
                              下载
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PMS批复录入信息（只读，复制自投资类资金申请PMS批复录入） */}
            {entryRecords && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h3 className="text-sm font-semibold text-gray-800">PMS批复录入信息</h3>
                </div>
                <div className="px-4 py-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="text-gray-500">
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">PMS批复文号</th>
                          <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">PMS项目编码</th>
                          <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap w-40">批复金额（万元）</th>
                          <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap w-36">批复日期</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50/50">
                          <td className="px-3 py-2.5 text-sm text-gray-800 whitespace-nowrap">{entryRecords.pmsNo || '-'}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-800 whitespace-nowrap">{entryRecords.pmsProjectCode || '-'}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-800 text-right whitespace-nowrap font-medium">{entryRecords.approveAmount || '-'}</td>
                          <td className="px-3 py-2.5 text-sm text-gray-600 text-center whitespace-nowrap">{entryRecords.approveTime || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 流程轨迹（时间线，复制自政企详情页）默认折叠 */}
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

            {/* 底部返回按钮 */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                返回
              </button>
            </div>
          </>
        )}

        {/* ========== 成本类详情 ========== */}
        {isCost && (
          <>
            {/* 成本类资金申请信息 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">成本类资金申请信息</h3>
              </div>
              <div className="px-4 py-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  <Field label="申请单编码" value={item.code} />
                  <Field label="项目名称" value={item.projectName} />
                  <Field label="项目编码" value={item.projectCode} />
                  <Field label="申请金额(单位:元)" value={item.applyAmount} />
                  <Field label="业务类型" value={item.businessType ? businessTypeLabels[item.businessType] || item.businessType : '-'} />
                  <Field label="申请人" value={item.applyUser} />
                  <Field label="申请部门" value={item.applyDept} />
                  <Field label="创建时间" value={item.createTime} />
                  {item.contractCode && <Field label="关联合同编码" value={item.contractCode} />}
                  {item.contractName && <Field label="关联合同名称" value={item.contractName} />}
                  {item.approveUser && <Field label="审批人" value={item.approveUser} />}
                </div>
                {item.applyContent && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-start">
                      <label className="w-36 text-right text-sm text-gray-500 shrink-0 pr-2 pt-1">申请内容</label>
                      <div className="flex-1 min-w-0 text-sm text-gray-800 whitespace-pre-wrap">{item.applyContent}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 成本类资金申请业务类型 */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">成本类资金申请业务类型</h3>
              </div>
              <div className="px-4 py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-gray-500">
                        <th className="px-3 py-2 text-left font-medium">预算年度</th>
                        <th className="px-3 py-2 text-left font-medium">业务大类编码</th>
                        <th className="px-3 py-2 text-left font-medium">业务大类名称</th>
                        <th className="px-3 py-2 text-left font-medium">业务小类编码</th>
                        <th className="px-3 py-2 text-left font-medium">业务小类名称</th>
                        <th className="px-3 py-2 text-left font-medium">业务活动类型</th>
                        <th className="px-3 py-2 text-right font-medium">申报行金额(单位:元)</th>
                        <th className="px-3 py-2 text-left font-medium">备注</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-3 py-2 text-gray-800">2026年</td>
                        <td className="px-3 py-2 text-gray-800">IT001</td>
                        <td className="px-3 py-2 text-gray-800">IT设备-01</td>
                        <td className="px-3 py-2 text-gray-800">IT00101</td>
                        <td className="px-3 py-2 text-gray-800">服务器</td>
                        <td className="px-3 py-2 text-gray-800">新建项目</td>
                        <td className="px-3 py-2 text-right text-gray-800 font-medium">{item.applyAmount}</td>
                        <td className="px-3 py-2 text-gray-600">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center min-h-[36px]">
      <label className="w-36 text-right text-sm text-gray-500 shrink-0 pr-2">{label}</label>
      <div className="flex-1 min-w-0 text-sm text-gray-800">{value || '-'}</div>
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
