import { useMemo } from 'react'
import { clsx } from 'clsx'
import { ChevronLeft, ArrowLeft, Clock, User, Paperclip, FileText } from 'lucide-react'
import { supportOrdersData, supportStatusConfig, SupportType } from '@/data/supportOrders'

interface SupportOrderDetailProps {
  onNavigate?: (path: string) => void
  presaleId?: string
  supportId?: string
}

// 在所有 6 大支撑类型数据中按 id 查找工单
function findSupportOrder(supportId?: string) {
  if (!supportId) return null
  for (const key of Object.keys(supportOrdersData) as SupportType[]) {
    const found = supportOrdersData[key].find(o => o.id === supportId)
    if (found) return { order: found, type: key }
  }
  return null
}

export default function SupportOrderDetail({ onNavigate, presaleId, supportId }: SupportOrderDetailProps) {
  const result = useMemo(() => findSupportOrder(supportId), [supportId])

  if (!result) {
    return (
      <div className="h-full overflow-auto bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 mb-3">未找到对应的支撑工单</div>
          <button
            onClick={() => onNavigate?.(`/my/todo/presale-support/${presaleId || ''}`)}
            className="text-[#1677FF] hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            返回售前支撑处理
          </button>
        </div>
      </div>
    )
  }

  const { order, type } = result
  const statusCfg = supportStatusConfig[order.status] || { label: order.status, className: 'bg-gray-50 text-gray-600' }

  // 关键字段 - 根据支撑类型显示对应字段
  const renderKeyFields = () => {
    if (type === 'techSolution') {
      return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <KeyField label="签约模式" value={order.signMode} />
          <KeyField label="服务内容" value={order.serviceContent} />
          <KeyField label="技术方案" value={order.techDoc} attachment />
        </div>
      )
    }
    if (type === 'partnerSelect') {
      return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <KeyField label="合作方式" value={order.cooperateMode} />
        </div>
      )
    }
    if (type === 'bidSupport') {
      return (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <KeyField label="招标方式" value={order.bidMode} />
          <KeyField label="投标方案" value={order.bidDoc} attachment />
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="w-full min-w-0 mx-auto p-3 space-y-3">
        {/* 顶部返回 + 标题 */}
        <div className="bg-white rounded-lg shadow-sm px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => onNavigate?.(`/my/todo/presale-support/${presaleId || ''}`)}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-[#1677FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h2 className="text-sm font-semibold text-gray-800">
              支撑工单详情 · {order.type}
            </h2>
            <span className={clsx('inline-block px-2 py-0.5 text-xs rounded', statusCfg.className)}>
              {statusCfg.label}
            </span>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">基本信息</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <FieldRow label="工单编号">{order.id}</FieldRow>
            <FieldRow label="工单名称">
              <span className="text-gray-800 font-medium">{order.name}</span>
            </FieldRow>
            <FieldRow label="支撑类型">{order.type}</FieldRow>
            <FieldRow label="期望完成时间">
              <span className="inline-flex items-center gap-1 text-gray-700">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {order.expectedDate}
              </span>
            </FieldRow>
            <FieldRow label="当前处理人员">
              <span className="inline-flex items-center gap-1 text-gray-700">
                <User className="w-3.5 h-3.5 text-gray-400" />
                {order.handler}
              </span>
            </FieldRow>
            <FieldRow label="发起人">{order.applicant}</FieldRow>
            <FieldRow label="发起时间">{order.applyTime}</FieldRow>
            <FieldRow label="当前状态">
              <span className={clsx('inline-block px-2 py-0.5 text-xs rounded', statusCfg.className)}>
                {statusCfg.label}
              </span>
            </FieldRow>
            {order.description && (
              <FieldRow label="支撑说明" full>
                <span className="text-gray-700">{order.description}</span>
              </FieldRow>
            )}
          </div>
        </div>

        {/* 关键字段（按支撑类型显示） */}
        {renderKeyFields() && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
              <h3 className="text-sm font-semibold text-gray-800">关键字段</h3>
            </div>
            {renderKeyFields()}
          </div>
        )}

        {/* 流程轨迹 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">流程轨迹</h3>
            <span className="text-xs text-gray-400 ml-1">共 {order.trail.length} 步</span>
          </div>
          <div className="relative pl-6">
            {/* 时间线竖线 */}
            <div className="absolute left-2 top-2 bottom-2 w-px bg-gray-200" />
            <ol className="space-y-4">
              {order.trail.map((item, idx) => (
                <li key={idx} className="relative">
                  {/* 圆点 */}
                  <div
                    className={clsx(
                      'absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2',
                      idx === order.trail.length - 1
                        ? 'bg-[#1677FF] border-[#1677FF]'
                        : 'bg-white border-gray-300'
                    )}
                  />
                  <div className="text-xs text-gray-400 mb-0.5">{item.time}</div>
                  <div className="text-sm text-gray-800">
                    <span className="font-medium">{item.actor}</span>
                    <span className="text-gray-500 ml-1.5">{item.action}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate?.(`/my/todo/presale-support/${presaleId || ''}`)}
            className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            返回
          </button>
        </div>
      </div>
    </div>
  )
}

// 标准字段行
function FieldRow({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={clsx('flex items-start min-h-[36px]', full && 'col-span-2')}>
      <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2 pt-1.5">{label}</label>
      <div className="flex-1 min-w-0 px-3 py-1.5 text-sm text-gray-800">
        {children}
      </div>
    </div>
  )
}

// 关键字段行（带标签 / 值 / 可选附件图标）
function KeyField({ label, value, attachment }: { label: string; value?: string; attachment?: boolean }) {
  return (
    <div className="flex items-center min-h-[36px]">
      <label className="w-32 text-right text-sm text-gray-700 shrink-0 whitespace-nowrap pr-2">{label}</label>
      <div className="flex-1 min-w-0 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-800 flex items-center gap-1.5">
        {attachment && <Paperclip className="w-3.5 h-3.5 text-[#1677FF] shrink-0" />}
        {!attachment && value && <FileText className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
        <span className="truncate" title={value}>{value || '-'}</span>
      </div>
    </div>
  )
}
