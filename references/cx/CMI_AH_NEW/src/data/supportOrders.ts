// 售前支撑工单数据
// 类型定义与 mock 数据，供售前支撑处理页与支撑工单详情页共用

export type SupportType =
  | 'techSolution'
  | 'partnerSelect'
  | 'bidSupport'
  | 'planDesign'
  | 'visit'
  | 'other'

export interface TrailItem {
  time: string
  actor: string
  action: string
}

export interface SupportOrder {
  id: string
  name: string
  type: string
  expectedDate: string
  handler: string
  status: string
  applicant: string
  applyTime: string
  description?: string
  // 技术方案支撑
  signMode?: string
  serviceContent?: string
  techDoc?: string
  // 合作伙伴甄选
  cooperateMode?: string
  // 标书支撑
  bidMode?: string
  bidDoc?: string
  // 流程轨迹
  trail: TrailItem[]
}

export const supportTypeLabels: Record<SupportType, string> = {
  techSolution: '技术方案支撑',
  partnerSelect: '合作伙伴甄选',
  bidSupport: '标书支撑',
  planDesign: '规划设计支撑',
  visit: '客户拜访支撑',
  other: '其他支撑'
}

export const supportOrdersData: Record<SupportType, SupportOrder[]> = {
  techSolution: [
    {
      id: 'TECH-2026-001',
      name: '智慧医院整体信息化方案',
      type: '技术方案支撑',
      expectedDate: '2026-06-20',
      handler: '赵明（解决方案室）',
      status: '处理中',
      applicant: '张凯',
      applyTime: '2026-06-05 10:30',
      description: '围绕合肥市第一人民医院数智化升级，输出整体信息化解决方案',
      signMode: '统谈分签',
      serviceContent: '建设+运维',
      techDoc: '智慧医院整体信息化解决方案v2.1.pdf',
      trail: [
        { time: '2026-06-05 10:30', actor: '张凯（客户经理）', action: '发起技术方案支撑申请' },
        { time: '2026-06-06 09:15', actor: '李军（室经理）', action: '审批通过' },
        { time: '2026-06-08 14:20', actor: '赵明（解决方案经理）', action: '已提交技术方案' }
      ]
    },
    {
      id: 'TECH-2026-002',
      name: '医疗云架构规划',
      type: '技术方案支撑',
      expectedDate: '2026-06-25',
      handler: '赵明（解决方案室）',
      status: '已确认',
      applicant: '张凯',
      applyTime: '2026-06-08 11:00',
      description: '面向医联体业务的医疗云架构规划',
      signMode: '统谈分签',
      serviceContent: '建设',
      techDoc: '医疗云架构规划方案v1.0.docx',
      trail: [
        { time: '2026-06-08 11:00', actor: '张凯（客户经理）', action: '发起技术方案支撑申请' },
        { time: '2026-06-09 09:30', actor: '李军（室经理）', action: '审批通过' },
        { time: '2026-06-10 16:00', actor: '赵明（解决方案经理）', action: '已提交技术方案' },
        { time: '2026-06-12 10:00', actor: '张凯（客户经理）', action: '客户已确认方案' }
      ]
    }
  ],
  partnerSelect: [
    {
      id: 'PART-2026-001',
      name: '医疗信息系统集成商甄选',
      type: '合作伙伴甄选',
      expectedDate: '2026-06-22',
      handler: '孙立（合作伙伴室）',
      status: '甄选中',
      applicant: '张凯',
      applyTime: '2026-06-06 14:00',
      description: '为医院信息化项目甄选具备 HIS 集成能力的合作伙伴',
      cooperateMode: '甄选',
      trail: [
        { time: '2026-06-06 14:00', actor: '张凯（客户经理）', action: '发起合作伙伴甄选申请' },
        { time: '2026-06-07 10:00', actor: '李军（室经理）', action: '审批通过' },
        { time: '2026-06-09 11:00', actor: '孙立（合作伙伴经理）', action: '启动甄选流程' }
      ]
    }
  ],
  bidSupport: [
    {
      id: 'BID-2026-001',
      name: '医疗云平台招标方案',
      type: '标书支撑',
      expectedDate: '2026-06-28',
      handler: '周强（投标室）',
      status: '编制中',
      applicant: '张凯',
      applyTime: '2026-06-09 15:30',
      description: '面向院方公开招标的医疗云平台投标文件编制',
      bidMode: '公开招标',
      bidDoc: '医疗云平台投标方案v1.0.pdf',
      trail: [
        { time: '2026-06-09 15:30', actor: '张凯（客户经理）', action: '发起标书支撑申请' },
        { time: '2026-06-10 09:00', actor: '李军（室经理）', action: '审批通过' },
        { time: '2026-06-11 14:00', actor: '周强（投标经理）', action: '启动标书编制' }
      ]
    }
  ],
  planDesign: [
    {
      id: 'PLAN-2026-001',
      name: '医院网络架构规划设计',
      type: '规划设计支撑',
      expectedDate: '2026-06-30',
      handler: '钱伟（规划室）',
      status: '设计中',
      applicant: '张凯',
      applyTime: '2026-06-10 10:00',
      description: '针对院区 5G + 园区网络一体化规划设计',
      trail: [
        { time: '2026-06-10 10:00', actor: '张凯（客户经理）', action: '发起规划设计支撑申请' },
        { time: '2026-06-11 09:30', actor: '李军（室经理）', action: '审批通过' },
        { time: '2026-06-12 14:00', actor: '钱伟（规划设计师）', action: '启动规划设计' }
      ]
    }
  ],
  visit: [
    {
      id: 'VISIT-2026-001',
      name: '院方领导拜访支撑',
      type: '客户拜访支撑',
      expectedDate: '2026-06-18',
      handler: '王琳（客户室）',
      status: '已完成',
      applicant: '张凯',
      applyTime: '2026-06-04 09:00',
      description: '陪同拜访院方分管副院长，介绍整体解决方案',
      trail: [
        { time: '2026-06-04 09:00', actor: '张凯（客户经理）', action: '发起客户拜访支撑申请' },
        { time: '2026-06-05 10:00', actor: '李军（室经理）', action: '审批通过' },
        { time: '2026-06-06 14:00', actor: '王琳（客户经理）', action: '完成客户拜访' },
        { time: '2026-06-07 16:00', actor: '张凯（客户经理）', action: '客户已确认拜访结果' }
      ]
    }
  ],
  other: [
    {
      id: 'OTHER-2026-001',
      name: '招标文件解读',
      type: '其他支撑',
      expectedDate: '2026-06-19',
      handler: '陈刚',
      status: '已完成',
      applicant: '张凯',
      applyTime: '2026-06-03 11:00',
      description: '针对本次招标文件的重点条款进行解读',
      trail: [
        { time: '2026-06-03 11:00', actor: '张凯（客户经理）', action: '发起其他支撑申请' },
        { time: '2026-06-04 09:00', actor: '李军（室经理）', action: '审批通过' },
        { time: '2026-06-05 14:00', actor: '陈刚', action: '完成支撑交付' }
      ]
    }
  ]
}

// 状态颜色映射
export const supportStatusConfig: Record<string, { label: string; className: string }> = {
  '处理中': { label: '处理中', className: 'bg-blue-50 text-blue-600' },
  '已提交': { label: '已提交', className: 'bg-cyan-50 text-cyan-600' },
  '已确认': { label: '已确认', className: 'bg-green-50 text-green-600' },
  '甄选中': { label: '甄选中', className: 'bg-blue-50 text-blue-600' },
  '编制中': { label: '编制中', className: 'bg-blue-50 text-blue-600' },
  '设计中': { label: '设计中', className: 'bg-blue-50 text-blue-600' },
  '已完成': { label: '已完成', className: 'bg-green-50 text-green-600' }
}
