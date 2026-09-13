// Mock数据 - DICT项目管理系统

// 角色列表（顶部栏切换角色用）
export type RoleKey = 'solution-manager' | 'leader'

export const roles: { key: RoleKey; label: string; description: string }[] = [
  { key: 'solution-manager', label: '解决方案经理', description: '日常方案支撑、项目处理' },
  { key: 'leader', label: '领导', description: '全维度数据驾驶舱、决策支持' }
]

// 当前用户信息（默认角色：解决方案经理）
export const currentUser = {
  id: '001',
  name: '张凯',
  role: '解决方案经理',
  roleKey: 'solution-manager' as RoleKey,
  avatar: ''
}

// 领导驾驶舱 - 关键阶段项目数（方案、甄选、投标、合同、实施、验收、维保）
export const stageProjectCount = {
  year: { scheme: 28, selection: 16, bid: 12, contract: 22, implement: 35, acceptance: 18, warranty: 9 },
  quarter: { scheme: 8, selection: 5, bid: 4, contract: 7, implement: 12, acceptance: 6, warranty: 3 },
  month: { scheme: 3, selection: 2, bid: 1, contract: 2, implement: 4, acceptance: 2, warranty: 1 }
}

// 领导驾驶舱 - 签约情况
export const signOverview = {
  year:   { bigDealCount: 18, excellentDealCount: 35, winBidCount: 56, winBidAmount: 42800, directSignCount: 22, directSignAmount: 18600 },
  quarter:{ bigDealCount: 6,  excellentDealCount: 12, winBidCount: 18, winBidAmount: 14200, directSignCount: 7,  directSignAmount: 6200 },
  month:  { bigDealCount: 2,  excellentDealCount: 4,  winBidCount: 5,  winBidAmount: 3800,  directSignCount: 2,  directSignAmount: 1600 }
}

// 领导驾驶舱 - 收入情况（万元）
export const incomeOverview = {
  year:   { planAmount: 52000, actualAmount: 46800, receivedAmount: 41200, owedAmount: 5600 },
  quarter:{ planAmount: 14500, actualAmount: 13200, receivedAmount: 11800, owedAmount: 1400 },
  month:  { planAmount: 4200,  actualAmount: 3850,  receivedAmount: 3500,  owedAmount: 350 }
}

// 地市/区县排行（按当前周期：月）
export const cityRankings = {
  projectCount: [
    { name: '合肥市', value: 48 }, { name: '芜湖市', value: 35 }, { name: '蚌埠市', value: 28 },
    { name: '安庆市', value: 24 }, { name: '滁州市', value: 21 }, { name: '阜阳市', value: 19 }
  ],
  bigDeal: [
    { name: '合肥市', value: 8 }, { name: '芜湖市', value: 5 }, { name: '蚌埠市', value: 3 },
    { name: '安庆市', value: 2 }, { name: '滁州市', value: 2 }, { name: '六安市', value: 1 }
  ],
  signAmount: [
    { name: '合肥市', value: 12500 }, { name: '芜湖市', value: 8200 }, { name: '蚌埠市', value: 6800 },
    { name: '安庆市', value: 5400 }, { name: '滁州市', value: 4800 }, { name: '阜阳市', value: 4200 }
  ],
  receivedAmount: [
    { name: '合肥市', value: 10200 }, { name: '芜湖市', value: 6800 }, { name: '蚌埠市', value: 5600 },
    { name: '安庆市', value: 4500 }, { name: '滁州市', value: 3900 }, { name: '阜阳市', value: 3500 }
  ],
  schemeTimely: [
    { name: '合肥市', value: 97.2 }, { name: '芜湖市', value: 95.6 }, { name: '滁州市', value: 94.1 },
    { name: '蚌埠市', value: 92.8 }, { name: '安庆市', value: 91.5 }, { name: '阜阳市', value: 90.3 }
  ],
  deliveryTimely: [
    { name: '合肥市', value: 96.5 }, { name: '芜湖市', value: 94.2 }, { name: '滁州市', value: 93.8 },
    { name: '蚌埠市', value: 92.1 }, { name: '阜阳市', value: 90.8 }, { name: '安庆市', value: 89.5 }
  ],
  faultTimely: [
    { name: '芜湖市', value: 99.1 }, { name: '合肥市', value: 98.6 }, { name: '滁州市', value: 97.8 },
    { name: '蚌埠市', value: 96.5 }, { name: '安庆市', value: 95.2 }, { name: '阜阳市', value: 94.1 }
  ],
  selfSupport: [
    { name: '合肥市', value: 78.5 }, { name: '芜湖市', value: 72.3 }, { name: '蚌埠市', value: 68.9 },
    { name: '安庆市', value: 65.4 }, { name: '阜阳市', value: 61.2 }, { name: '滁州市', value: 58.7 }
  ]
}

// 行业排行（9 大行业）
export const industryRankings = {
  projectCount: [
    { name: '党政', value: 42 },
    { name: '融合执法', value: 35 },
    { name: '金融', value: 28 },
    { name: '农商', value: 22 },
    { name: '工业能源', value: 18 },
    { name: '互联网', value: 15 },
    { name: '交通', value: 32 },
    { name: '教育', value: 26 },
    { name: '医卫', value: 38 }
  ],
  signAmount: [
    { name: '党政', value: 18600 },
    { name: '融合执法', value: 14200 },
    { name: '金融', value: 9800 },
    { name: '农商', value: 5600 },
    { name: '工业能源', value: 4800 },
    { name: '互联网', value: 4200 },
    { name: '交通', value: 8800 },
    { name: '教育', value: 7200 },
    { name: '医卫', value: 16500 }
  ],
  receivedAmount: [
    { name: '党政', value: 15200 },
    { name: '融合执法', value: 11800 },
    { name: '金融', value: 8200 },
    { name: '农商', value: 4600 },
    { name: '工业能源', value: 3900 },
    { name: '互联网', value: 3500 },
    { name: '交通', value: 7300 },
    { name: '教育', value: 6000 },
    { name: '医卫', value: 13800 }
  ]
}

// TOP5 项目
export const topProjects = [
  { name: '安徽省政务云平台扩容项目', city: '合肥市', signAmount: 6800, stage: '合同签订' },
  { name: '合肥第一人民医院数智化项目', city: '合肥市', signAmount: 8500, stage: '售前支撑' },
  { name: '芜湖智慧政务服务中心', city: '芜湖市', signAmount: 4200, stage: '项目实施' },
  { name: '蚌埠智慧教育云平台', city: '蚌埠市', signAmount: 3800, stage: '项目验收' },
  { name: '安庆市雪亮工程二期', city: '安庆市', signAmount: 3200, stage: '项目立项' },
  { name: '滁州市智慧园区项目', city: '滁州市', signAmount: 2900, stage: '招投标' },
  { name: '阜阳公安警务通升级', city: '阜阳市', signAmount: 2600, stage: '维保' }
]

export const projectList = [
  { id: 'proj-001', name: '安徽省政务云平台扩容项目', code: 'AH-ZW-2026001', type: '云服务', initMethod: '自主立项', customerName: '安徽省政务服务中心', customerCode: 'ZWZX-001', creator: '张三' },
  { id: 'proj-002', name: '合肥第一人民医院数智化项目', code: 'HF-YL-2026001', type: '医疗信息化', initMethod: '招标立项', customerName: '合肥第一人民医院', customerCode: 'HFYY-001', creator: '李四' },
  { id: 'proj-003', name: '芜湖智慧政务服务中心', code: 'WH-ZW-2026001', type: '政务信息化', initMethod: '自主立项', customerName: '芜湖市政务服务中心', customerCode: 'WHZW-001', creator: '王五' },
  { id: 'proj-004', name: '蚌埠智慧教育云平台', code: 'BB-JY-2026001', type: '教育信息化', initMethod: '招标立项', customerName: '蚌埠市教育局', customerCode: 'BBJY-001', creator: '赵六' },
  { id: 'proj-005', name: '安庆市雪亮工程二期', code: 'AQ-XL-2026001', type: '安防', initMethod: '自主立项', customerName: '安庆市公安局', customerCode: 'AQGA-001', creator: '钱七' },
  { id: 'proj-006', name: '滁州市智慧园区项目', code: 'CZ-YQ-2026001', type: '园区信息化', initMethod: '招标立项', customerName: '滁州市经开区', customerCode: 'CZJK-001', creator: '孙八' },
  { id: 'proj-007', name: '阜阳公安警务通升级', code: 'FY-GA-2026001', type: '警务信息化', initMethod: '自主立项', customerName: '阜阳市公安局', customerCode: 'FYGA-001', creator: '周九' },
  { id: 'proj-008', name: '六安大数据中心建设', code: 'LA-DS-2026001', type: '数据中心', initMethod: '招标立项', customerName: '六安市发改委', customerCode: 'LAGW-001', creator: '吴十' }
]

// 菜单数据 - 支持2-3级菜单
export const menuItems = [
  {
    id: '0',
    title: '我的',
    icon: 'User',
    children: [
      { id: '0-1', title: '我的待办', path: '/my/todo' },
      { id: '0-2', title: '我的待阅', path: '/my/todo/read' },
      { id: '0-3', title: '我的已办', path: '/my/done' },
      { id: '0-4', title: '我的提醒', path: '/my/reminder' },
      { id: '0-5', title: '我的线索', path: '/my/clue' },
      { id: '0-6', title: '我的商机', path: '/my/business' },
      { id: '0-7', title: '我的项目', path: '/my/project' },
      { id: '0-8', title: '我关注的项目', path: '/my/starred-project' },
      { id: '0-9', title: '我的合同', path: '/my/contract' }
    ]
  },
  {
    id: '1',
    title: '商机管理',
    icon: 'TrendingUp',
    children: [
      {
        id: '1-1',
        title: '线索管理',
        children: [
          { id: '1-1-1', title: '共享线索录入', path: '/business/clue/share-input' },
          { id: '1-1-2', title: '共享线索池', path: '/business/clue/shared-query' },
          { id: '1-1-3', title: '摸排工单管理', path: '/my/work-order' }
        ]
      },
      {
        id: '1-2',
        title: '商机管理',
        children: [
          { id: '1-2-1', title: '商机录入', path: '/business/opportunity/input' },
          { id: '1-2-2', title: '商机管理', path: '/business/opportunity/query' }
        ]
      }
    ]
  },
  {
    id: '2',
    title: '项目管理',
    icon: 'FolderKanban',
    children: [
      {
        id: '2-1',
        title: '售前管理',
        children: [
          { id: '2-1-1', title: '售前支撑', path: '/project/pre-sale/support' },
          { id: '2-1-2', title: '投标管理', path: '/project/pre-sale/bid' },
          { id: '2-1-3', title: '效益预评估', path: '/project/pre-sale/benefit' }
        ]
      },
      {
        id: '2-2',
        title: '售中管理',
        children: [
          { id: '2-2-1', title: '项目进度管理', path: '/project/mid/progress' },
          { id: '2-2-2', title: '周报管理', path: '/project/mid/weekly' }
        ]
      },
      {
        id: '2-3',
        title: '售后管理',
        children: [
          { id: '2-3-1', title: '故障管理', path: '/project/after-sale/fault' },
          { id: '2-3-2', title: '投诉管理', path: '/project/after-sale/complaint' },
          { id: '2-3-3', title: '巡检管理', path: '/project/after-sale/inspection' },
          { id: '2-3-4', title: '运维管理', path: '/project/after-sale/operation' }
        ]
      },
      {
        id: '2-4',
        title: '项目变更管理',
        children: [
          { id: '2-4-1', title: '项目需求变更', path: '/project/change/requirement' },
          { id: '2-4-2', title: '项目实施变更', path: '/project/change/implementation' },
          { id: '2-4-3', title: '项目停复工', path: '/project/change/stop-resume' },
          { id: '2-4-4', title: '项目非常结项', path: '/project/change/close' }
        ]
      },
      {
        id: '2-5',
        title: '项目查询',
        children: [
          { id: '2-5-1', title: '项目管理', path: '/project/query' }
        ]
      },
      {
        id: '2-6',
        title: '项目评估管理',
        children: [
          { id: '2-6-1', title: '项目后评估', path: '/project/evaluate/after' },
          { id: '2-6-2', title: '项目审计', path: '/project/evaluate/audit' }
        ]
      },
      {
        id: '2-7',
        title: '纵横一体化',
        children: [
          { id: '2-7-1', title: '纵横一体化', path: '/project/integration' }
        ]
      }
    ]
  },
  {
    id: '3',
    title: '业财管理',
    icon: 'Wallet',
    children: [
      {
        id: '3-1',
        title: '合同管理',
        children: [
          { id: '3-1-2', title: '合同管理', path: '/finance/contract/query' },
          {
            id: '3-1-3',
            title: '订单管理',
            children: [
              { id: '3-1-3-1', title: '前向订单管理', path: '/finance/contract/order/forward' },
              { id: '3-1-3-2', title: '采购订单管理', path: '/finance/contract/order/purchase' }
            ]
          }
        ]
      },
      {
        id: '3-2',
        title: '收入管理',
        children: [
          { id: '3-2-2', title: 'IT收入计划确认', path: '/finance/income/confirm' },
          { id: '3-2-3', title: 'CT产品订购', path: '/finance/income/product-association' },
          { id: '3-2-4', title: '合同资产管理', path: '/finance/contract/asset-transfer' }
        ]
      },
      {
        id: '3-3',
        title: '支出管理',
        children: [
          { id: '3-3-0', title: '预付款管理', path: '/finance/expense/prepayment' },
          { id: '3-3-1', title: '计提管理', path: '/finance/expense/provision' },
          { id: '3-3-2', title: '冲销管理', path: '/finance/expense/writeoff' },
          { id: '3-3-3', title: '报账管理', path: '/finance/expense/expense' },
          { id: '3-3-4', title: '付款管理', path: '/finance/payment' },
          { id: '3-3-5', title: '资金申请', path: '/finance/expense/fund-application' }
        ]
      },
      {
        id: '3-4',
        title: '资金管理',
        children: [
          { id: '3-4-2', title: '投资资金管理', path: '/finance/fund/ict-invest' },
          { id: '3-4-3', title: '成本资金管理', path: '/finance/fund/ict-cost' }
        ]
      },
      {
        id: '3-5',
        title: '欠费管理',
        children: [
          { id: '3-5-1', title: '集团客户欠费管理', path: '/finance/arrears/group-customer' },
          { id: '3-5-2', title: '项目欠费管理', path: '/finance/arrears/project' }
        ]
      },
      {
        id: '3-6',
        title: '阻断提示',
        path: '/finance/block-notice'
      }
    ]
  },
  {
    id: '4',
    title: '集省专协同',
    icon: 'Network',
    children: [
      { id: '4-1', title: '通用任务协同', path: '/collaboration/general' },
      { id: '4-2', title: '省专协同统计', path: '/collaboration/province-stats' },
      { id: '4-3', title: '两级协同', path: '/collaboration/two-level' }
    ]
  },
  {
    id: '5',
    title: '运营分析',
    icon: 'BarChart',
    children: [
      { id: '5-1', title: '领导驾驶舱', path: '/operation/leader' },
      { id: '5-2', title: '启航行动报表', path: '/operation/report' }
    ]
  },
  {
    id: '6',
    title: '激励管理',
    icon: 'Gift',
    children: [
      { id: '6-1', title: '大单申报', path: '/incentive/big-deal' },
      { id: '6-2', title: '激励查询', path: '/incentive/query' }
    ]
  },
  {
    id: '7',
    title: '风险管控',
    icon: 'Shield',
    children: [
      { id: '7-1', title: '风险管控查询', path: '/risk/query' }
    ]
  },
  {
    id: '8',
    title: '合作伙伴管理',
    icon: 'Users',
    children: [
      { id: '8-1', title: '合作伙伴基础管理', path: '/partner/base' },
      { id: '8-2', title: '合作伙伴招募管理', path: '/partner/recruit' },
      { id: '8-3', title: '合作伙伴甄选管理', path: '/partner/select' }
    ]
  },
  {
    id: '9',
    title: '四库全书',
    icon: 'Book',
    children: [
      { id: '9-1', title: '方案库', path: '/library/solution' },
      { id: '9-2', title: '资质库', path: '/library/qualification' },
      { id: '9-3', title: '案例库', path: '/library/case' },
      { id: '9-4', title: '投标库', path: '/library/bid' }
    ]
  },
  {
    id: '10',
    title: 'AI智能工具',
    icon: 'Bot',
    children: [
      { id: '10-1', title: '智能问答', path: '/ai/qa' },
      { id: '10-2', title: '智能问数', path: '/ai/query' }
    ]
  },
  {
    id: '11',
    title: '系统管理',
    icon: 'Settings',
    children: [
      { id: '11-1', title: '角色管理', path: '/system/role' },
      { id: '11-2', title: '权限管理', path: '/system/permission' },
      { id: '11-3', title: '流程管理', path: '/system/process' },
      { id: '11-4', title: '菜单管理', path: '/system/menu' },
      { id: '11-5', title: '公告管理', path: '/system/announcement' }
    ]
  }
]

// 一级Tab配置
export const primaryTabs = [
  { key: 'todo', label: '待办' },
  { key: 'read', label: '待阅' },
  { key: 'reminder', label: '提醒' },
  { key: 'done', label: '已办' }
]

// 待办/已办二级Tab配置
export const secondaryTabs = [
  { key: 'all', label: '全部' },
  { key: 'business', label: '商机管理' },
  { key: 'presales', label: '售前支撑' },
  { key: 'decision', label: '立项决策' },
  { key: 'bid', label: '投标' },
  { key: 'contract', label: '合同管理' },
  { key: 'handover', label: '合同交底' },
  { key: 'kickoff', label: '项目开工' },
  { key: 'plan', label: '项目启动与规划' },
  { key: 'income', label: '收入管理' },
  { key: 'expense', label: '支出管理' },
  { key: 'fund', label: '资金管理' },
  { key: 'other', label: '其他' }
]

// 提醒二级Tab配置
export const reminderTabs = [
  { key: 'all', label: '全部' },
  { key: 'expiring', label: '临期提醒' },
  { key: 'overdue', label: '超期提醒' },
  { key: 'other', label: '其他' }
]

// 待阅二级Tab配置
export const readSubTabs = [
  { key: 'all', label: '全部' },
  { key: 'approval', label: '审批待阅' },
  { key: 'change', label: '变更待阅' },
  { key: 'progress', label: '进度待阅' },
  { key: 'other', label: '其他' }
]

// 待阅分类映射
export const readCategoryMap: Record<string, string> = {
  approval: '审批待阅',
  change: '变更待阅',
  progress: '进度待阅',
  other: '其他'
}

// 待办类型映射
export const todoTypeMap: Record<string, string> = {
  presales: '售前支撑',
  decision: '立项决策',
  bid: '投标',
  contract: '合同管理',
  handover: '合同交底',
  kickoff: '项目开工',
  plan: '项目启动与规划',
  implement: '项目实施',
  income: '收入管理',
  expense: '支出管理',
  fund: '资金管理',
  other: '其他',
  business: '商机管理'
}

// 待办事项数据
export const todoList = [
  {
    id: 't-contract-attach-001',
    title: '合同附件上传',
    project: '安徽移动IDC数据中心建设项目',
    deadline: '2026-07-10',
    receiveTime: '2026-07-08 09:00',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060001'
  },
  {
    id: 't-contract-parse-forward-001',
    title: '前向合同解析',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-12',
    receiveTime: '2026-07-08 10:30',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-contract-parse-confirm-001',
    title: '前向合同解析确认与补充',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-12',
    receiveTime: '2026-07-08 10:35',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-contract-parse-approval-001',
    title: '前向合同解析审批',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-13',
    receiveTime: '2026-07-08 10:45',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-income-plan-change-001',
    title: '收入计划调整',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-18',
    receiveTime: '2026-07-08 14:00',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-income-plan-change-confirm-001',
    title: '收入计划调整确认与补充',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-18',
    receiveTime: '2026-07-08 14:05',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-forward-plan-change-approval-001',
    title: '收入计划调整审批',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-19',
    receiveTime: '2026-07-08 14:15',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-income-plan-time-adjust-approval-001',
    title: '收入计划时间调整审批',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-20',
    receiveTime: '2026-07-08 14:20',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-income-expense-contract-parse-001',
    title: '有收有支合同解析',
    project: '合肥政务云平台服务',
    deadline: '2026-07-21',
    receiveTime: '2026-07-08 14:45',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060002'
  },
  {
    id: 't-income-expense-contract-parse-approval-001',
    title: '有收有支合同解析审批',
    project: '合肥政务云平台服务',
    deadline: '2026-07-23',
    receiveTime: '2026-07-09 09:00',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060002'
  },
  {
    id: 't-income-expense-plan-adjustment-approval-001',
    title: '收支计划调整审批',
    project: '合肥政务云平台服务',
    deadline: '2026-07-24',
    receiveTime: '2026-07-10 10:00',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060002'
  },
  {
    id: 't-settlement-change-001',
    title: '结算金额变更',
    project: '安庆5G基站建设项目',
    deadline: '2026-07-25',
    receiveTime: '2026-07-08 15:30',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060008'
  },
  {
    id: 't-contract-similarity-fix-001',
    title: '后向合同内容相似度过高修改',
    project: '蚌埠数据中心网络设备采购',
    deadline: '2026-07-18',
    receiveTime: '2026-07-09 09:30',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060007'
  },
  {
    id: 't-contract-parse-backward-001',
    title: '后向合同解析',
    project: '蚌埠数据中心网络设备采购',
    deadline: '2026-07-15',
    receiveTime: '2026-07-08 11:00',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060007'
  },
  {
    id: 't-contract-parse-approval-001',
    title: '后向合同解析审批',
    project: '蚌埠数据中心网络设备采购',
    deadline: '2026-07-20',
    receiveTime: '2026-07-10 10:00',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060007'
  },
  {
    id: 't-expense-plan-adjustment-approval-001',
    title: '支出计划调整审批',
    project: '淮南IDC机房运维服务采购',
    deadline: '2026-07-22',
    receiveTime: '2026-07-10 11:00',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理',
    contractId: 'CT2026060004'
  },
  {
    id: 't-presale-001',
    title: '合肥第一人民医院数智化项目售前支撑',
    project: '合肥第一人民医院数智化项目',
    deadline: '2026-06-15',
    receiveTime: '2026-06-09 09:00',
    priority: 'high',
    completed: false,
    category: 'presales',
    type: 'todo',
    todoType: '售前支撑'
  },
  {
    id: 't1',
    title: '提交智慧城市项目方案',
    project: '智慧城市一期',
    deadline: '2026-06-08',
    receiveTime: '2026-06-05 09:00',
    priority: 'high',
    completed: false,
    category: 'presales',
    type: 'todo',
    todoType: '售前支撑'
  },
  {
    id: 't2',
    title: '跟进工业园区合同签订',
    project: '工业园区智能化',
    deadline: '2026-06-10',
    receiveTime: '2026-06-04 14:30',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理'
  },
  {
    id: 't3',
    title: '审核医疗信息化项目报价',
    project: '市医院信息化',
    deadline: '2026-06-12',
    receiveTime: '2026-06-03 10:00',
    priority: 'medium',
    completed: false,
    category: 'decision',
    type: 'todo',
    todoType: '立项决策'
  },
  {
    id: 't4',
    title: '准备教育系统演示材料',
    project: '教育局云平台',
    deadline: '2026-06-15',
    receiveTime: '2026-06-02 16:00',
    priority: 'medium',
    completed: false,
    category: 'presales',
    type: 'todo',
    todoType: '售前支撑'
  },
  {
    id: 't5',
    title: '提交政务云项目投标文件',
    project: '政务云建设',
    deadline: '2026-06-18',
    receiveTime: '2026-06-01 11:00',
    priority: 'low',
    completed: false,
    category: 'bid',
    type: 'todo',
    todoType: '投标'
  },
  {
    id: 't6',
    title: '审核智慧城市项目合同',
    project: '智慧城市一期',
    deadline: '2026-06-20',
    receiveTime: '2026-05-30 09:00',
    priority: 'high',
    completed: false,
    category: 'contract',
    type: 'todo',
    todoType: '合同管理'
  },
  {
    id: 't7',
    title: '跟进工业园区项目进度',
    project: '工业园区智能化',
    deadline: '2026-06-22',
    receiveTime: '2026-05-29 15:00',
    priority: 'medium',
    completed: false,
    category: 'business',
    type: 'todo',
    todoType: '商机管理'
  },
  {
    id: 't8',
    title: '完成市医院信息化方案',
    project: '市医院信息化',
    deadline: '2026-06-25',
    receiveTime: '2026-05-28 10:00',
    priority: 'high',
    completed: false,
    category: 'presales',
    type: 'todo',
    todoType: '售前支撑'
  },
  {
    id: 't-income-confirm-001',
    title: '收入计划确认发起',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-18',
    receiveTime: '2026-07-08 15:00',
    priority: 'high',
    completed: false,
    category: 'income',
    type: 'todo',
    todoType: '收入管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-product-activation-001',
    title: '产品开通',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-20',
    receiveTime: '2026-07-10 09:00',
    priority: 'high',
    completed: false,
    category: 'income',
    type: 'todo',
    todoType: '收入管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-certificate-audit-001',
    title: '三证一书稽核',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-21',
    receiveTime: '2026-07-11 09:00',
    priority: 'high',
    completed: false,
    category: 'income',
    type: 'todo',
    todoType: '收入管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-income-confirm-approval-001',
    title: '收入计划确认审批',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-22',
    receiveTime: '2026-07-12 09:00',
    priority: 'high',
    completed: false,
    category: 'income',
    type: 'todo',
    todoType: '收入管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-asset-transfer-001',
    title: '合同资产转出',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-23',
    receiveTime: '2026-07-12 10:00',
    priority: 'high',
    completed: false,
    category: 'income',
    type: 'todo',
    todoType: '收入管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-asset-transfer-approval-001',
    title: '合同资产转出审批',
    project: '芜湖智慧教育云平台服务',
    deadline: '2026-07-24',
    receiveTime: '2026-07-12 10:30',
    priority: 'high',
    completed: false,
    category: 'income',
    type: 'todo',
    todoType: '收入管理',
    contractId: 'CT2026060006'
  },
  {
    id: 't-payment-proof-001',
    title: '回款证明提供',
    project: '合肥市第一人民医院智慧医疗项目',
    deadline: '2026-07-31',
    receiveTime: '2026-07-18 09:00',
    priority: 'high',
    completed: false,
    category: 'expense',
    type: 'todo',
    todoType: '支出管理',
    contractId: 'CT2026060001'
  },
  {
    id: 't-cost-prepayment-bill-submit-001',
    title: '预付款报账单提交',
    project: '合肥市第一人民医院智慧医疗项目',
    deadline: '2026-08-10',
    receiveTime: '2026-08-08 09:00',
    priority: 'high',
    completed: false,
    category: 'expense',
    type: 'todo',
    todoType: '支出管理',
    contractId: 'CT2026060001'
  },
  {
    id: 't-cost-prepayment-bill-approval-001',
    title: '预付款报账单审批',
    project: '合肥市第一人民医院智慧医疗项目',
    deadline: '2026-08-12',
    receiveTime: '2026-08-10 09:00',
    priority: 'high',
    completed: false,
    category: 'expense',
    type: 'todo',
    todoType: '支出管理',
    contractId: 'CT2026060001'
  },
  {
    id: 't-bill-submit-001',
    title: '项目类费用报账单提交',
    project: '合肥市第一人民医院智慧医疗项目',
    deadline: '2026-08-10',
    receiveTime: '2026-08-08 09:00',
    priority: 'high',
    completed: false,
    category: 'expense',
    type: 'todo',
    todoType: '支出管理',
    contractId: 'CT2026060001'
  },
  {
    id: 't-bill-approval-001',
    title: '项目类费用报账单审批',
    project: '合肥市第一人民医院智慧医疗项目',
    deadline: '2026-08-12',
    receiveTime: '2026-08-10 09:00',
    priority: 'high',
    completed: false,
    category: 'expense',
    type: 'todo',
    todoType: '支出管理',
    contractId: 'CT2026060001'
  },
  {
    id: 't-payment-bill-submit-001',
    title: '付款报账单提交',
    project: '合肥市第一人民医院智慧医疗项目',
    deadline: '2026-08-14',
    receiveTime: '2026-08-12 09:00',
    priority: 'high',
    completed: false,
    category: 'expense',
    type: 'todo',
    todoType: '支出管理',
    contractId: 'CT2026060001'
  },
  {
    id: 't-payment-bill-approval-001',
    title: '付款报账单审批',
    project: '合肥市第一人民医院智慧医疗项目',
    deadline: '2026-08-16',
    receiveTime: '2026-08-14 09:00',
    priority: 'high',
    completed: false,
    category: 'expense',
    type: 'todo',
    todoType: '支出管理',
    contractId: 'CT2026060001'
  },
  {
    id: 't-handover-001',
    title: '合肥第一人民医院数智化项目合同交底',
    project: '合肥第一人民医院数智化项目',
    deadline: '2026-06-22',
    receiveTime: '2026-06-10 10:30',
    priority: 'high',
    completed: false,
    category: 'handover',
    type: 'todo',
    todoType: '合同交底'
  },
  {
    id: 't-handover-002',
    title: '智慧城市一期项目合同交底',
    project: '智慧城市一期',
    deadline: '2026-06-26',
    receiveTime: '2026-06-08 14:00',
    priority: 'medium',
    completed: false,
    category: 'handover',
    type: 'todo',
    todoType: '合同交底'
  },
  {
    id: 't-kickoff-001',
    title: '昆明市工商银行智能监控系统项目开工',
    project: '昆明市工商银行智能监控系统',
    deadline: '2026-06-20',
    receiveTime: '2026-06-12 09:00',
    priority: 'high',
    completed: false,
    category: 'kickoff',
    type: 'todo',
    todoType: '项目开工'
  },
  {
    id: 't-plan-001',
    title: '昆明市工商银行智能监控系统项目启动与规划',
    project: '昆明市工商银行智能监控系统',
    deadline: '2026-06-22',
    receiveTime: '2026-06-10 10:00',
    priority: 'high',
    completed: false,
    category: 'plan',
    type: 'todo',
    todoType: '项目启动与规划'
  },
  {
    id: 't-implement-001',
    title: '昆明市工商银行智能监控系统项目实施',
    project: '昆明市工商银行智能监控系统',
    deadline: '2026-07-30',
    receiveTime: '2026-06-15 09:00',
    priority: 'high',
    completed: false,
    category: 'implement',
    type: 'todo',
    todoType: '项目实施'
  },
  {
    id: 't-fund-001',
    title: '资金申请',
    project: '昆明市工商银行智能监控系统',
    deadline: '2026-07-15',
    receiveTime: '2026-07-08 10:00',
    priority: 'high',
    completed: false,
    category: 'fund',
    type: 'todo',
    todoType: '资金管理',
    fundType: 'cost',
    fundId: 'FUND-COST-2026070001',
    fundAction: 'apply'
  },
  {
    id: 't-fund-002',
    title: '投资类资金申请审批',
    project: '合肥市第一人民医院智慧医疗项目',
    deadline: '2026-07-20',
    receiveTime: '2026-07-10 09:30',
    priority: 'high',
    completed: false,
    category: 'fund',
    type: 'todo',
    todoType: '资金管理',
    fundType: 'invest',
    fundId: 'FUND-INVEST-2026070001',
    fundAction: 'approve'
  },
  {
    id: 't-fund-003',
    title: '投资类资金申请PMS批复录入',
    project: '芜湖市政务服务中心数字政府项目',
    deadline: '2026-07-25',
    receiveTime: '2026-07-11 14:00',
    priority: 'medium',
    completed: false,
    category: 'fund',
    type: 'todo',
    todoType: '资金管理',
    fundType: 'invest',
    fundId: 'FUND-INVEST-2026070002',
    fundAction: 'entry'
  }
]

// 待阅数据（之前的提醒数据）
export const readList = [
  {
    id: 'r1',
    type: 'task',
    title: '智慧城市项目方案即将截止',
    content: '距离截止日期还有3天，请尽快提交',
    time: '2026-06-08',
    urgent: true,
    readCategory: 'progress'
  },
  {
    id: 'r2',
    type: 'approval',
    title: '有3份合同待审批',
    content: '工业园区合同、教育系统合同、政务云合同',
    time: '2026-06-06',
    urgent: false,
    readCategory: 'approval'
  },
  {
    id: 'r3',
    type: 'contract',
    title: '智慧城市合同即将到期',
    content: '合同编号HT-2025-001，剩余15天',
    time: '2026-06-20',
    urgent: false,
    readCategory: 'other'
  },
  {
    id: 'r4',
    type: 'task',
    title: '本周销售汇报会议',
    content: '周五下午2点，线上会议',
    time: '2026-06-07',
    urgent: false,
    readCategory: 'other'
  },
  {
    id: 'r5',
    type: 'approval',
    title: '有5份报价单待审批',
    content: '智慧城市报价单、政务云报价单等',
    time: '2026-06-05',
    urgent: true,
    readCategory: 'approval'
  },
  {
    id: 'r6',
    type: 'approval',
    title: '立项决策书待审批',
    content: '市医院信息化项目立项决策书',
    time: '2026-06-06',
    urgent: false,
    readCategory: 'approval'
  },
  {
    id: 'r7',
    type: 'contract',
    title: '项目范围变更申请待查阅',
    content: '智慧城市一期新增3个子模块，需评估影响',
    time: '2026-06-06',
    urgent: true,
    readCategory: 'change'
  },
  {
    id: 'r8',
    type: 'task',
    title: '项目里程碑变更通知',
    content: '政务云项目交付日期从06-30调整至07-15',
    time: '2026-06-05',
    urgent: false,
    readCategory: 'change'
  },
  {
    id: 'r9',
    type: 'task',
    title: '项目进度更新通知',
    content: '工业园区智能化项目本周进度达成 78%',
    time: '2026-06-06',
    urgent: false,
    readCategory: 'progress'
  },
  {
    id: 'r10',
    type: 'task',
    title: '验收阶段进度提醒',
    content: '教育局云平台项目进入验收阶段，请关注',
    time: '2026-06-07',
    urgent: false,
    readCategory: 'progress'
  }
]

// 已办数据
export const doneList = [
  {
    id: 'd1',
    title: '完成智慧城市项目方案',
    project: '智慧城市一期',
    deadline: '2026-06-01',
    priority: 'high',
    completed: true,
    category: 'presales',
    type: 'done',
    completedTime: '2026-06-01 15:30'
  },
  {
    id: 'd2',
    title: '签署工业园区合同',
    project: '工业园区智能化',
    deadline: '2026-05-28',
    priority: 'high',
    completed: true,
    category: 'contract',
    type: 'done',
    completedTime: '2026-05-28 10:00'
  },
  {
    id: 'd3',
    title: '完成市医院信息化投标',
    project: '市医院信息化',
    deadline: '2026-05-25',
    priority: 'high',
    completed: true,
    category: 'bid',
    type: 'done',
    completedTime: '2026-05-25 18:00'
  },
  {
    id: 'd4',
    title: '跟进教育局回款到账',
    project: '教育局云平台',
    deadline: '2026-05-20',
    priority: 'medium',
    completed: true,
    category: 'income',
    type: 'done',
    completedTime: '2026-05-20 09:00'
  },
  {
    id: 'd5',
    title: '完成智慧园区方案设计',
    project: '智慧园区一期',
    deadline: '2026-05-25',
    priority: 'high',
    completed: true,
    category: 'presales',
    type: 'done',
    completedTime: '2026-05-28 14:30'
  },
  {
    id: 'd6',
    title: '审核政务云项目报价',
    project: '政务云建设',
    deadline: '2026-05-30',
    priority: 'medium',
    completed: true,
    category: 'decision',
    type: 'done',
    completedTime: '2026-06-03 10:00'
  }
]

// 提醒数据（保留，用于其他场景）
export const reminders = [
  {
    id: 'r1',
    type: 'task',
    title: '智慧城市项目方案即将截止',
    content: '距离截止日期还有3天，请尽快提交',
    time: '2026-06-08',
    urgent: true
  },
  {
    id: 'r2',
    type: 'approval',
    title: '有3份合同待审批',
    content: '工业园区合同、教育系统合同、政务云合同',
    time: '2026-06-06',
    urgent: false
  },
  {
    id: 'r3',
    type: 'contract',
    title: '智慧城市合同即将到期',
    content: '合同编号HT-2025-001，剩余15天',
    time: '2026-06-20',
    urgent: false
  },
  {
    id: 'r4',
    type: 'task',
    title: '本周销售汇报会议',
    content: '周五下午2点，线上会议',
    time: '2026-06-07',
    urgent: false
  }
]

// 系统公告
export const announcements = [
  {
    id: 'a1',
    title: '关于开展2026年度中期总结的通知',
    content: '公司定于6月30日开展2026年度中期总结会议，各部门请提前准备汇报材料。',
    publishTime: '2026-06-01 09:00',
    level: 'important'
  },
  {
    id: 'a2',
    title: '系统升级维护公告',
    content: '系统将于本周六（6月8日）凌晨2:00-6:00进行升级维护，届时部分功能暂停使用。',
    publishTime: '2026-06-05 10:00',
    level: 'normal'
  },
  {
    id: 'a3',
    title: '端午节放假安排',
    content: '根据国家规定，端午节放假时间为6月10日至6月12日，共3天。',
    publishTime: '2026-06-03 14:00',
    level: 'normal'
  },
  {
    id: 'a4',
    title: '关于规范项目报价流程的通知',
    content: '为提升报价效率，自6月15日起，所有项目报价需通过系统提交审批。',
    publishTime: '2026-06-04 16:00',
    level: 'urgent'
  }
]

// 关键指标数据
export const statsData = [
  {
    id: 's1',
    name: '商机数量',
    value: 128,
    unit: '个',
    change: 12.5,
    icon: 'Target'
  },
  {
    id: 's2',
    name: '中标金额',
    value: 2850,
    unit: '万',
    change: 8.3,
    icon: 'Trophy'
  },
  {
    id: 's3',
    name: '回款金额',
    value: 1680,
    unit: '万',
    change: -5.2,
    icon: 'Banknote'
  },
  {
    id: 's4',
    name: '欠费金额',
    value: 420,
    unit: '万',
    change: -15.8,
    icon: 'AlertTriangle'
  },
  {
    id: 's5',
    name: '项目数量',
    value: 45,
    unit: '个',
    change: 6.7,
    icon: 'FolderKanban'
  },
  {
    id: 's6',
    name: '在建项目',
    value: 23,
    unit: '个',
    change: 10.2,
    icon: 'Play'
  }
]

// ==================== 合同数据 ====================
export interface ContractItem {
  id: string
  code: string
  name: string
  projectCode: string
  projectName: string
  type: 'income' | 'income-expense' | 'expense'
  secondCategory: string
  thirdCategory: string
  isFramework: boolean
  frameworkRelationType: string
  signSubject: string
  amountWithTax: string
  amountWithoutTax: string
  customer: string
  status: string
  draftTime: string
  effectiveDate: string
  terminationDate: string
  counterpartName: string
  inputMethod: string
  isSupplement: boolean
  creator: string
  createTime: string
  hasAttachment: boolean
  branch: string
  networkProjectCode: string
  signTime: string
  hasEffectivePlan?: boolean
}

export interface ContractAttachment {
  id: string
  name: string
  size: string
  uploadTime: string
  tag?: string
}

export interface ContractInfo {
  name: string
  projectCode: string
  projectName: string
  code: string
  serialNo: string
  type: string
  typeKey: 'income' | 'income-expense' | 'expense'
  isFramework: string
  frameworkRelationType: string
  secondCategory: string
  thirdCategory: string
  organizer: string
  handler: string
  dept: string
  signSubject: string
  draftTime: string
  status: string
  statusChangeTime: string
  nature: string
  projectAmountWithTax: string
  projectAmountNoTax: string
  effectiveTime: string
  terminationTime: string
  contractPeriodMonths: string
  signTime: string
  counterpartName: string
  collectedCustomer: string
  amountWithTax: string
  amountNoTax: string
  adjustedAmountWithTax: string
  adjustedAmountNoTax: string
  performanceStartTime: string
  performanceEndTime: string
  isSupplement: string
  supplementType: string
  attachments: ContractAttachment[]
}

const typeKeyMap: Record<string, string> = {
  income: '收入类',
  'income-expense': '有收有支类',
  expense: '支出类'
}

const statusMap: Record<string, string> = {
  draft: '草稿',
  executing: '履行中',
  signed: '已签订',
  approved: '审核通过',
  reviewing: '审核中',
  rejected: '审核不通过',
  completed: '履行完毕',
  voided: '已作废',
  revoked: '撤销',
  changing: '变更中',
  terminating: '解除中',
  terminated: '已解除',
  voiding: '作废中'
}

export const contractList: ContractItem[] = [
  {
    id: 'CT2026060001',
    code: 'CTR2026000001',
    name: '安徽移动IDC数据中心建设项目合同',
    projectCode: 'PRJ20260001',
    projectName: '安徽移动IDC数据中心建设项目',
    type: 'income',
    secondCategory: 'IDC服务类',
    thirdCategory: '数据中心服务',
    isFramework: false,
    frameworkRelationType: '-',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '1,200,000.00',
    amountWithoutTax: '1,061,946.90',
    customer: '安徽省政务信息中心',
    status: 'draft',
    draftTime: '2026-06-01 10:00:00',
    effectiveDate: '2026-07-01',
    terminationDate: '2027-06-30',
    counterpartName: '安徽省政务信息中心',
    inputMethod: '起草',
    isSupplement: false,
    creator: '王芳',
    createTime: '2026-06-01 10:00:00',
    hasAttachment: true,
    branch: 'hq',
    networkProjectCode: 'NPRJ20260001',
    signTime: '2026-06-15',
    hasEffectivePlan: false
  },
  {
    id: 'CT2026060002',
    code: 'CTR2026000002',
    name: '合肥政务云平台服务合同',
    projectCode: 'PRJ20260002',
    projectName: '合肥政务云平台服务',
    type: 'income-expense',
    secondCategory: '云服务类',
    thirdCategory: '云计算服务',
    isFramework: true,
    frameworkRelationType: '关联订单',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '3,500,000.00',
    amountWithoutTax: '3,097,345.13',
    customer: '合肥市大数据局',
    status: 'draft',
    draftTime: '2026-06-02 09:30:00',
    effectiveDate: '2026-06-15',
    terminationDate: '2027-06-14',
    counterpartName: '合肥市大数据局',
    inputMethod: '起草',
    isSupplement: false,
    creator: '李明',
    createTime: '2026-06-02 09:30:00',
    hasAttachment: true,
    branch: 'hf',
    networkProjectCode: 'NPRJ20260002',
    signTime: '2026-06-20',
    hasEffectivePlan: false
  },
  {
    id: 'CT2026060003',
    code: 'CTR2026000003',
    name: '企业专线接入服务协议',
    projectCode: 'PRJ20260003',
    projectName: '企业专线接入服务',
    type: 'expense',
    secondCategory: '专线服务类',
    thirdCategory: '专线接入服务',
    isFramework: false,
    frameworkRelationType: '-',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '850,000.00',
    amountWithoutTax: '752,212.39',
    customer: '中国移动通信集团安徽有限公司',
    status: 'draft',
    draftTime: '2026-06-03 09:15:00',
    effectiveDate: '2026-07-01',
    terminationDate: '2028-06-30',
    counterpartName: '中国移动通信集团安徽有限公司',
    inputMethod: '起草',
    isSupplement: false,
    creator: '张凯',
    createTime: '2026-06-03 09:15:00',
    hasAttachment: false,
    branch: 'wuhu',
    networkProjectCode: 'NPRJ20260003',
    signTime: '2026-07-01',
    hasEffectivePlan: false
  },
  {
    id: 'CT2026060004',
    code: 'CTR2026000004',
    name: '淮南IDC机房运维服务采购合同',
    projectCode: 'PRJ20260004',
    projectName: '淮南IDC机房运维服务采购',
    type: 'expense',
    secondCategory: 'IDC服务类',
    thirdCategory: '数据中心服务',
    isFramework: true,
    frameworkRelationType: '关联订单',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '2,000,000.00',
    amountWithoutTax: '1,769,911.50',
    customer: '淮南市信息技术服务有限公司',
    status: 'executing',
    draftTime: '2026-06-04 14:20:00',
    effectiveDate: '2026-06-10',
    terminationDate: '2027-06-09',
    counterpartName: '淮南市信息技术服务有限公司',
    inputMethod: '起草',
    isSupplement: false,
    creator: '赵静',
    createTime: '2026-06-04 14:20:00',
    hasAttachment: true,
    branch: 'huainan',
    networkProjectCode: 'NPRJ20260004',
    signTime: '2026-06-10',
    hasEffectivePlan: true
  },
  {
    id: 'CT2026060005',
    code: 'CTR2026000005',
    name: '马鞍山智慧城市云平台建设运营合同',
    projectCode: 'PRJ20260005',
    projectName: '马鞍山智慧城市云平台建设运营',
    type: 'income-expense',
    secondCategory: '云服务类',
    thirdCategory: '云计算服务',
    isFramework: false,
    frameworkRelationType: '-',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '5,800,000.00',
    amountWithoutTax: '5,132,743.36',
    customer: '马鞍山市大数据资源管理局',
    status: 'executing',
    draftTime: '2026-06-05 11:45:00',
    effectiveDate: '2026-06-20',
    terminationDate: '2028-06-19',
    counterpartName: '马鞍山市大数据资源管理局',
    inputMethod: '起草',
    isSupplement: false,
    creator: '陈强',
    createTime: '2026-06-05 11:45:00',
    hasAttachment: true,
    branch: 'maanshan',
    networkProjectCode: 'NPRJ20260005',
    signTime: '2026-06-25',
    hasEffectivePlan: true
  },
  {
    id: 'CT2026060006',
    code: 'CTR2026000006',
    name: '芜湖智慧教育云平台服务合同',
    projectCode: 'PRJ20260006',
    projectName: '芜湖智慧教育云平台服务',
    type: 'income',
    secondCategory: '云服务类',
    thirdCategory: '云计算服务',
    isFramework: false,
    frameworkRelationType: '-',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '1,500,000.00',
    amountWithoutTax: '1,327,433.63',
    customer: '芜湖市教育局',
    status: 'executing',
    draftTime: '2026-06-06 08:30:00',
    effectiveDate: '2026-07-01',
    terminationDate: '2027-06-30',
    counterpartName: '芜湖市教育局',
    inputMethod: '起草',
    isSupplement: false,
    creator: '刘洋',
    createTime: '2026-06-06 08:30:00',
    hasAttachment: true,
    branch: 'wuhu',
    networkProjectCode: 'NPRJ20260006',
    signTime: '2026-07-01',
    hasEffectivePlan: false
  },
  {
    id: 'CT2026060007',
    code: 'CTR2026000007',
    name: '蚌埠数据中心网络设备采购合同',
    projectCode: 'PRJ20260007',
    projectName: '蚌埠数据中心网络设备采购',
    type: 'expense',
    secondCategory: '网络设备类',
    thirdCategory: '数据中心网络',
    isFramework: false,
    frameworkRelationType: '-',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '800,000.00',
    amountWithoutTax: '707,964.60',
    customer: '华为技术有限公司',
    status: 'executing',
    draftTime: '2026-06-07 10:15:00',
    effectiveDate: '2026-07-01',
    terminationDate: '2027-06-30',
    counterpartName: '华为技术有限公司',
    inputMethod: '起草',
    isSupplement: false,
    creator: '周敏',
    createTime: '2026-06-07 10:15:00',
    hasAttachment: true,
    branch: 'bengbu',
    networkProjectCode: 'NPRJ20260007',
    signTime: '2026-07-05',
    hasEffectivePlan: false
  },
  {
    id: 'CT2026060008',
    code: 'CTR2026000008',
    name: '阜阳智慧医疗信息化建设项目合同',
    projectCode: 'PRJ20260008',
    projectName: '阜阳智慧医疗信息化建设',
    type: 'income-expense',
    secondCategory: '信息化类',
    thirdCategory: '智慧医疗',
    isFramework: true,
    frameworkRelationType: '关联订单',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '4,200,000.00',
    amountWithoutTax: '3,716,814.16',
    customer: '阜阳市卫健委',
    status: 'executing',
    draftTime: '2026-06-08 14:00:00',
    effectiveDate: '2026-07-01',
    terminationDate: '2028-06-30',
    counterpartName: '阜阳市卫健委',
    inputMethod: '起草',
    isSupplement: false,
    creator: '吴磊',
    createTime: '2026-06-08 14:00:00',
    hasAttachment: true,
    branch: 'fuyang',
    networkProjectCode: 'NPRJ20260008',
    signTime: '2026-07-10',
    hasEffectivePlan: false
  },
  {
    id: 'CT2026060009',
    code: 'CTR2026000009',
    name: '安庆云计算中心运维服务合同',
    projectCode: 'PRJ20260009',
    projectName: '安庆云计算中心运维服务',
    type: 'income',
    secondCategory: '云服务类',
    thirdCategory: '云计算服务',
    isFramework: false,
    frameworkRelationType: '-',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '2,800,000.00',
    amountWithoutTax: '2,477,876.11',
    customer: '安庆市数据资源局',
    status: 'executing',
    draftTime: '2026-06-09 09:00:00',
    effectiveDate: '2026-07-01',
    terminationDate: '2027-06-30',
    counterpartName: '安庆市数据资源局',
    inputMethod: '起草',
    isSupplement: false,
    creator: '郑涛',
    createTime: '2026-06-09 09:00:00',
    hasAttachment: true,
    branch: 'anhqing',
    networkProjectCode: 'NPRJ20260009',
    signTime: '2026-07-15',
    hasEffectivePlan: true
  },
  {
    id: 'CT2026060010',
    code: 'CTR2026000010',
    name: '滁州5G基站建设设备采购合同',
    projectCode: 'PRJ20260010',
    projectName: '滁州5G基站建设设备采购',
    type: 'expense',
    secondCategory: '通信设备类',
    thirdCategory: '5G基站设备',
    isFramework: false,
    frameworkRelationType: '-',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '3,600,000.00',
    amountWithoutTax: '3,185,840.71',
    customer: '中兴通讯股份有限公司',
    status: 'executing',
    draftTime: '2026-06-10 11:30:00',
    effectiveDate: '2026-07-01',
    terminationDate: '2027-06-30',
    counterpartName: '中兴通讯股份有限公司',
    inputMethod: '起草',
    isSupplement: false,
    creator: '孙丽',
    createTime: '2026-06-10 11:30:00',
    hasAttachment: true,
    branch: 'suizhou',
    networkProjectCode: 'NPRJ20260010',
    signTime: '2026-07-20',
    hasEffectivePlan: true
  },
  {
    id: 'CT2026060011',
    code: 'CTR2026000011',
    name: '六安智慧城市综合服务平台合同',
    projectCode: 'PRJ20260011',
    projectName: '六安智慧城市综合服务平台',
    type: 'income-expense',
    secondCategory: '信息化类',
    thirdCategory: '智慧城市',
    isFramework: true,
    frameworkRelationType: '关联订单',
    signSubject: '中国移动通信集团安徽有限公司',
    amountWithTax: '6,500,000.00',
    amountWithoutTax: '5,752,212.39',
    customer: '六安市数据资源管理局',
    status: 'executing',
    draftTime: '2026-06-11 15:00:00',
    effectiveDate: '2026-07-01',
    terminationDate: '2028-06-30',
    counterpartName: '六安市数据资源管理局',
    inputMethod: '起草',
    isSupplement: false,
    creator: '钱伟',
    createTime: '2026-06-11 15:00:00',
    hasAttachment: true,
    branch: 'liuan',
    networkProjectCode: 'NPRJ20260011',
    signTime: '2026-07-25',
    hasEffectivePlan: true
  }
]

export function getContractInfo(id: string): ContractInfo {
  const contract = contractList.find(c => c.id === id) || contractList[0]

  const match = id.match(/CT202606(\d{4})/)
  const idx = match ? parseInt(match[1], 10) - 1 : 0
  const nameIdx = idx % 5

  const amountWithTaxNum = parseFloat(contract.amountWithTax.replace(/,/g, ''))
  const projectAmountWithTax = (amountWithTaxNum * 0.68).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const projectAmountNoTax = (amountWithTaxNum * 0.68 / 1.13).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return {
    name: contract.name,
    projectCode: contract.projectCode,
    projectName: contract.projectName,
    code: contract.code,
    serialNo: contract.id,
    type: typeKeyMap[contract.type] || '收入类',
    typeKey: contract.type as 'income' | 'income-expense' | 'expense',
    isFramework: contract.isFramework ? '是' : '否',
    frameworkRelationType: contract.frameworkRelationType,
    secondCategory: contract.secondCategory,
    thirdCategory: contract.thirdCategory,
    organizer: ['安徽移动合肥分公司', '安徽移动芜湖分公司', '安徽移动蚌埠分公司', '安徽移动阜阳分公司', '安徽移动淮南分公司'][nameIdx],
    handler: contract.creator,
    dept: '政企客户部',
    signSubject: contract.signSubject,
    draftTime: contract.draftTime,
    status: statusMap[contract.status] || '草稿',
    statusChangeTime: `2026-06-${String(((idx + 2) % 28) + 1).padStart(2, '0')} 14:20:00`,
    nature: '业务合同',
    projectAmountWithTax,
    projectAmountNoTax,
    effectiveTime: contract.effectiveDate,
    terminationTime: contract.terminationDate,
    contractPeriodMonths: '36',
    signTime: '2026-06-15',
    counterpartName: contract.counterpartName,
    collectedCustomer: contract.customer,
    amountWithTax: contract.amountWithTax,
    amountNoTax: contract.amountWithoutTax,
    adjustedAmountWithTax: contract.amountWithTax,
    adjustedAmountNoTax: contract.amountWithoutTax,
    performanceStartTime: contract.effectiveDate,
    performanceEndTime: contract.terminationDate,
    isSupplement: contract.isSupplement ? '是' : '否',
    supplementType: contract.isSupplement ? '金额变更' : '-',
    attachments: contract.hasAttachment
      ? (() => {
          // 所有合同统一使用芜湖智慧教育云平台4个标准附件（含文件名称/大小/上传时间/标签）
          return [
            {
              id: `attach-${contract.id}-contract`,
              name: '芜湖智慧教育云平台服务合同.pdf',
              size: '4.8 MB',
              uploadTime: '2026-06-06 14:45:00',
              tag: '前向合同'
            },
            {
              id: `attach-${contract.id}-benefit`,
              name: '芜湖智慧教育云平台效益评估表',
              size: '2.3 MB',
              uploadTime: '2026-06-06 15:00:00',
              tag: '效益评估表'
            },
            {
              id: `attach-${contract.id}-ppt`,
              name: '芜湖智慧教育云平台上会PPT',
              size: '15.6 MB',
              uploadTime: '2026-06-06 15:30:00',
              tag: '上会PPT文件'
            },
            {
              id: `attach-${contract.id}-report`,
              name: '芜湖智慧教育云平台签报文件',
              size: '1.8 MB',
              uploadTime: '2026-06-06 16:00:00',
              tag: '签报文件'
            }
          ]
        })()
      : []
  }
}

// ==================== 资金管理数据 ====================

// 资金申请类型
export type FundType = 'cost' | 'invest'

// 投资类型（投资类专用）
export type InvestmentType = '1' | '2' | '3' | '4' | '5' | '6'

// 成本类资金申请状态
export const costFundStatusMap: Record<string, string> = {
  '01': '草稿',
  '02': '审批中',
  '03': '待生效',
  '04': '生效',
  '05': '调整中',
  '06': '失效'
}

// 投资类资金申请状态
export const investFundStatusMap: Record<string, string> = {
  '01': '草稿',
  '02': '审批中',
  '03': '审批',
  '04': '审批完成',
  '05': '批复录入中',
  '06': '完成',
  '07': '作废'
}

// 投资类型映射
export const investmentTypeMap: Record<string, string> = {
  '1': '纯IT',
  '2': '纯CT',
  '3': 'IT+CT',
  '4': '5GToB',
  '5': 'IT投资',
  '6': 'CT投资'
}

// 决策层级映射
export const decisionLevelMap: Record<string, string> = {
  '0': '省公司总经理办公会决策',
  '1': '省公司分管领导专题办公会决策',
  '2': '省公司分管领导OA签报决策',
  '3': '省公司各部门评审会议纪要决策'
}

// 成本类资金申请字段
export const costBusinessTypeOptions = [
  { value: 'network', label: '网络费用' },
  { value: 'software', label: '软件费用' },
  { value: 'service', label: '服务费用' },
  { value: 'other', label: '其他费用' }
]

export function getCostFundStatusText(status: string): string {
  return costFundStatusMap[status] || status
}

export function getInvestFundStatusText(status: string): string {
  return investFundStatusMap[status] || status
}

export function getFundStatusClass(status: string, type: FundType): string {
  if (type === 'cost') {
    if (status === '01') return 'bg-gray-100 text-gray-600'
    if (status === '02') return 'bg-blue-100 text-blue-600'
    if (status === '03') return 'bg-yellow-100 text-yellow-600'
    if (status === '04') return 'bg-green-100 text-green-600'
    if (status === '05') return 'bg-orange-100 text-orange-600'
    if (status === '06') return 'bg-red-100 text-red-600'
    return 'bg-gray-100 text-gray-600'
  }
  // investment type
  if (status === '01') return 'bg-gray-100 text-gray-600'
  if (status === '02' || status === '03') return 'bg-blue-100 text-blue-600'
  if (status === '04') return 'bg-cyan-100 text-cyan-600'
  if (status === '05') return 'bg-orange-100 text-orange-600'
  if (status === '06') return 'bg-green-100 text-green-600'
  if (status === '07') return 'bg-red-100 text-red-600'
  return 'bg-gray-100 text-gray-600'
}

export interface FundApplyItem {
  id: string
  code: string
  projectCode: string
  globalCode: string
  projectName: string
  type: FundType
  investmentType?: InvestmentType
  applyAmount: string
  applyContent: string
  status: string
  applyUser: string
  applyDept: string
  createTime: string
  businessType?: string
  contractCode?: string
  contractName?: string
  decisionLevel?: string
  agreementPeriod?: string
  paybackPeriod?: string
  constructionSchedule?: string
  approveUser?: string
  cityName?: string
  itInvestAmount?: string
  transmissionNetAmount?: string
  transmissionGeAmount?: string
  idcInvestAmount?: string
  coreNetAmount?: string
  wirelessNetAmount?: string
  estimateAmount?: string
  totalIncomeAmount?: string
  netPresentValue?: string
  netPresentValueRate?: string
  internalRateOfReturn?: string
}

export const fundApplyList: FundApplyItem[] = [
  {
    id: 'FUND-COST-2026070001',
    code: 'ZJSQ-2026-0001',
    projectCode: 'PRJ-2026-KM-001',
    globalCode: 'NET-2026-KM-001',
    projectName: '昆明市工商银行智能监控系统',
    type: 'cost',
    applyAmount: '850,000.00',
    applyContent: '项目网络设备采购及安装费用',
    status: '01',
    applyUser: '张凯',
    applyDept: '政企客户部',
    createTime: '2026-07-08 10:00:00',
    businessType: 'network',
    contractCode: 'CTR2026000003',
    contractName: '企业专线接入服务协议'
  },
  {
    id: 'FUND-COST-2026070002',
    code: 'ZJSQ-2026-0002',
    projectCode: 'PRJ20260003',
    globalCode: 'NET-20260003',
    projectName: '企业专线接入服务',
    type: 'cost',
    applyAmount: '420,000.00',
    applyContent: '专线接入设备及施工成本申请',
    status: '02',
    applyUser: '李明',
    applyDept: '政企客户部',
    createTime: '2026-07-05 14:30:00',
    businessType: 'service',
    contractCode: 'CTR2026000003',
    contractName: '企业专线接入服务协议'
  },
  {
    id: 'FUND-COST-2026070003',
    code: 'ZJSQ-2026-0003',
    projectCode: 'PRJ20260007',
    globalCode: 'NET-20260007',
    projectName: '蚌埠数据中心网络设备采购',
    type: 'cost',
    applyAmount: '1,200,000.00',
    applyContent: '数据中心网络设备采购成本',
    status: '03',
    applyUser: '周敏',
    applyDept: '政企客户部',
    createTime: '2026-06-20 09:00:00',
    businessType: 'network',
    contractCode: 'CTR2026000007',
    contractName: '蚌埠数据中心网络设备采购合同'
  },
  {
    id: 'FUND-INVEST-2026070001',
    code: 'ZJSQ-2026-0004',
    projectCode: 'PRJ-2026-HF-001',
    globalCode: 'NET-2026-HF-001',
    projectName: '合肥市第一人民医院智慧医疗项目',
    type: 'invest',
    investmentType: '1',
    applyAmount: '5,000,000.00',
    applyContent: '建设智慧医疗信息系统，包括HIS、LIS、PACS等核心业务系统，配套采购网络与安全设备并完成系统集成部署。',
    status: '02',
    applyUser: '张凯',
    applyDept: '政企客户部',
    createTime: '2026-07-10 09:30:00',
    decisionLevel: '0',
    agreementPeriod: '3',
    paybackPeriod: '5',
    constructionSchedule: '2027-06-30',
    approveUser: '王处长',
    cityName: '合肥市',
    itInvestAmount: '5,000,000.00',
    estimateAmount: '6,500,000.00',
    totalIncomeAmount: '8,000,000.00',
    netPresentValue: '1,500,000.00',
    netPresentValueRate: '18.75',
    internalRateOfReturn: '15.20'
  },
  {
    id: 'FUND-INVEST-2026070002',
    code: 'ZJSQ-2026-0005',
    projectCode: 'PRJ-2026-WH-001',
    globalCode: 'NET-2026-WH-001',
    projectName: '芜湖市政务服务中心数字政府项目',
    type: 'invest',
    investmentType: '3',
    applyAmount: '8,200,000.00',
    applyContent: '建设数字政府云平台，采购云服务器、存储及网络安全设备，完成政务网络基础设施升级改造。',
    status: '04',
    applyUser: '李华',
    applyDept: '政企客户部',
    createTime: '2026-07-11 14:00:00',
    decisionLevel: '0',
    agreementPeriod: '5',
    paybackPeriod: '7',
    constructionSchedule: '2028-12-31',
    approveUser: '赵主任',
    cityName: '芜湖市',
    itInvestAmount: '3,200,000.00',
    transmissionNetAmount: '5,000,000.00',
    transmissionGeAmount: '0.00',
    estimateAmount: '10,000,000.00',
    totalIncomeAmount: '13,500,000.00',
    netPresentValue: '3,500,000.00',
    netPresentValueRate: '25.93',
    internalRateOfReturn: '18.40'
  },
  {
    id: 'FUND-INVEST-2026070003',
    code: 'ZJSQ-2026-0006',
    projectCode: 'PRJ-2026-BB-001',
    globalCode: 'NET-2026-BB-001',
    projectName: '蚌埠市教育局智慧教育项目',
    type: 'invest',
    investmentType: '2',
    applyAmount: '3,500,000.00',
    applyContent: '建设智慧教育网络基础设施，包括校园网改造、教学资源平台及网络安全体系建设。',
    status: '03',
    applyUser: '王强',
    applyDept: '政企客户部',
    createTime: '2026-06-25 11:00:00',
    decisionLevel: '1',
    agreementPeriod: '3',
    paybackPeriod: '4',
    constructionSchedule: '2027-03-31',
    approveUser: '钱科长',
    cityName: '蚌埠市',
    transmissionNetAmount: '3,500,000.00',
    transmissionGeAmount: '0.00',
    estimateAmount: '4,200,000.00',
    totalIncomeAmount: '5,600,000.00',
    netPresentValue: '1,400,000.00',
    netPresentValueRate: '25.00',
    internalRateOfReturn: '16.80'
  },
  {
    id: 'FUND-INVEST-2026070004',
    code: 'ZJSQ-2026-0007',
    projectCode: 'PRJ-2026-HF-002',
    globalCode: 'NET-2026-HF-002',
    projectName: '合肥市轨道交通集团智慧交通项目',
    type: 'invest',
    investmentType: '4',
    applyAmount: '12,000,000.00',
    applyContent: '建设5G+智慧交通系统，部署5G专网、车载终端及交通大数据平台，实现交通智能化管理。',
    status: '05',
    applyUser: '赵明',
    applyDept: '政企客户部',
    createTime: '2026-06-15 08:30:00',
    decisionLevel: '0',
    agreementPeriod: '5',
    paybackPeriod: '8',
    constructionSchedule: '2029-06-30',
    approveUser: '李总',
    cityName: '合肥市',
    itInvestAmount: '4,000,000.00',
    transmissionNetAmount: '4,000,000.00',
    transmissionGeAmount: '0.00',
    coreNetAmount: '2,000,000.00',
    wirelessNetAmount: '2,000,000.00',
    estimateAmount: '14,500,000.00',
    totalIncomeAmount: '20,000,000.00',
    netPresentValue: '5,500,000.00',
    netPresentValueRate: '27.50',
    internalRateOfReturn: '19.60'
  },
  {
    id: 'FUND-INVEST-2026070005',
    code: 'ZJSQ-2026-0008',
    projectCode: 'PRJ20260005',
    globalCode: 'NET-20260005',
    projectName: '马鞍山智慧城市云平台建设运营',
    type: 'invest',
    investmentType: '3',
    applyAmount: '6,800,000.00',
    applyContent: '建设智慧城市云平台及网络基础设施，包括云数据中心、城市感知网络及数据中台建设。',
    status: '06',
    applyUser: '陈强',
    applyDept: '政企客户部',
    createTime: '2026-05-20 10:00:00',
    decisionLevel: '0',
    agreementPeriod: '5',
    paybackPeriod: '6',
    constructionSchedule: '2028-12-31',
    approveUser: '周总',
    cityName: '马鞍山市',
    itInvestAmount: '2,800,000.00',
    transmissionNetAmount: '4,000,000.00',
    transmissionGeAmount: '0.00',
    estimateAmount: '8,200,000.00',
    totalIncomeAmount: '11,000,000.00',
    netPresentValue: '2,800,000.00',
    netPresentValueRate: '25.45',
    internalRateOfReturn: '17.90'
  },
  {
    id: 'FUND-INVEST-2026070006',
    code: 'ZJSQ-2026-0009',
    projectCode: 'PRJ20260002',
    globalCode: 'NET-20260002',
    projectName: '合肥政务云平台服务',
    type: 'invest',
    investmentType: '1',
    applyAmount: '2,500,000.00',
    applyContent: '投资建设政务云平台，采购服务器、存储、网络及安全等IT设备，支撑政务系统上云。',
    status: '07',
    applyUser: '李明',
    applyDept: '政企客户部',
    createTime: '2026-04-10 16:00:00',
    decisionLevel: '1',
    agreementPeriod: '3',
    paybackPeriod: '4',
    constructionSchedule: '2027-03-31',
    cityName: '合肥市',
    itInvestAmount: '2,500,000.00',
    estimateAmount: '3,000,000.00',
    totalIncomeAmount: '4,000,000.00',
    netPresentValue: '1,000,000.00',
    netPresentValueRate: '25.00',
    internalRateOfReturn: '16.50'
  }
]

// PMS批复结果数据
export interface ApproveEntryItem {
  id: string
  fundApplyId: string
  fundApplyCode: string
  projectName: string
  approveAmount: string
  approveContent: string
  pmsNo: string
  pmsProjectCode: string
  approveTime: string
  status: string
  entryUser?: string
  entryTime?: string
}

export const approveEntryList: ApproveEntryItem[] = [
  {
    id: 'AE-2026-0001',
    fundApplyId: 'FUND-INVEST-2026070002',
    fundApplyCode: 'ZJSQ-2026-0005',
    projectName: '芜湖市政务服务中心数字政府项目',
    approveAmount: '7,800,000.00',
    approveContent: '同意数字政府云平台+网络基础设施投资，批复金额780万元',
    pmsNo: 'PMS-2026-AH-0012',
    pmsProjectCode: 'PMS-2026-0002',
    approveTime: '2026-07-18',
    status: 'pending',
    entryUser: '',
    entryTime: ''
  },
  {
    id: 'AE-2026-0002',
    fundApplyId: 'FUND-INVEST-2026070004',
    fundApplyCode: 'ZJSQ-2026-0007',
    projectName: '合肥市轨道交通集团智慧交通项目',
    approveAmount: '11,500,000.00',
    approveContent: '同意5G+智慧交通系统投资建设，批复金额1150万元',
    pmsNo: 'PMS-2026-AH-0008',
    pmsProjectCode: 'PMS-2026-0004',
    approveTime: '2026-07-05',
    status: 'entered',
    entryUser: '张凯',
    entryTime: '2026-07-10 15:30:00'
  },
  {
    id: 'AE-2026-0003',
    fundApplyId: 'FUND-INVEST-2026070005',
    fundApplyCode: 'ZJSQ-2026-0008',
    projectName: '马鞍山智慧城市云平台建设运营',
    approveAmount: '6,500,000.00',
    approveContent: '同意智慧城市云平台+网络基础设施建设，批复金额650万元',
    pmsNo: 'PMS-2026-AH-0005',
    pmsProjectCode: 'PMS-2026-0005',
    approveTime: '2026-06-15',
    status: 'entered',
    entryUser: '陈强',
    entryTime: '2026-06-20 10:00:00'
  },
  {
    id: 'AE-2026-0004',
    fundApplyId: 'FUND-INVEST-2026070001',
    fundApplyCode: 'ZJSQ-2026-0004',
    projectName: '合肥市第一人民医院智慧医疗项目',
    approveAmount: '4,800,000.00',
    approveContent: '同意智慧医疗信息系统投资建设，批复金额480万元',
    pmsNo: 'PMS-2026-AH-0001',
    pmsProjectCode: 'PMS-2026-0001',
    approveTime: '2026-07-15',
    status: 'entered',
    entryUser: '李明',
    entryTime: '2026-07-16 09:30:00'
  },
  {
    id: 'AE-2026-0005',
    fundApplyId: 'FUND-INVEST-2026070003',
    fundApplyCode: 'ZJSQ-2026-0006',
    projectName: '蚌埠市教育局智慧教育项目',
    approveAmount: '3,200,000.00',
    approveContent: '同意智慧教育网络基础设施建设，批复金额320万元',
    pmsNo: 'PMS-2026-AH-0003',
    pmsProjectCode: 'PMS-2026-0003',
    approveTime: '2026-07-20',
    status: 'pending',
    entryUser: '',
    entryTime: ''
  },
  {
    id: 'AE-2026-0006',
    fundApplyId: 'FUND-INVEST-2026070006',
    fundApplyCode: 'ZJSQ-2026-0009',
    projectName: '合肥政务云平台服务',
    approveAmount: '2,300,000.00',
    approveContent: '同意政务云平台建设投资，批复金额230万元',
    pmsNo: 'PMS-2026-AH-0006',
    pmsProjectCode: 'PMS-2026-0006',
    approveTime: '2026-04-25',
    status: 'entered',
    entryUser: '赵明',
    entryTime: '2026-04-28 14:00:00'
  }
]

export function getFundApplyDetail(id: string): FundApplyItem | undefined {
  return fundApplyList.find(item => item.id === id)
}

export function getApproveEntryByFundId(fundApplyId: string): ApproveEntryItem | undefined {
  return approveEntryList.find(item => item.fundApplyId === fundApplyId)
}

// ========== 审批轨迹 ==========
export interface ApprovalStep {
  id: string
  nodeName: string          // 节点名称
  approver: string           // 审批人
  approverRole: string       // 审批角色
  action: string             // 操作：同意/退回/转办/提交
  comment: string            // 审批意见
  time: string               // 审批时间
  status: 'done' | 'current' | 'pending'  // 已完成/当前/待办
}

export interface ApprovalTrail {
  fundApplyId: string
  steps: ApprovalStep[]
}

export const approvalTrailMap: Record<string, ApprovalTrail> = {
  // 投资类资金申请审批轨迹（PTC多节点审批）
  'FUND-INVEST-2026070001': {
    fundApplyId: 'FUND-INVEST-2026070001',
    steps: [
      { id: 'step-1', nodeName: '提交申请', approver: '张凯', approverRole: '申请人', action: '提交', comment: '投资类资金申请提交', time: '2026-07-10 09:00:00', status: 'done' },
      { id: 'step-2', nodeName: '项目负责人审批', approver: '赵曙光', approverRole: '项目负责人', action: '同意', comment: '项目符合投资要求，建议推进', time: '2026-07-11 14:30:00', status: 'done' },
      { id: 'step-3', nodeName: '部门负责人审批', approver: '王明辉', approverRole: '部门负责人', action: '同意', comment: '同意，请继续推进', time: '2026-07-12 10:00:00', status: 'done' },
      { id: 'step-4', nodeName: '财务审批', approver: '陈丽华', approverRole: '财务负责人', action: '同意', comment: '财务测算审核通过', time: '2026-07-14 16:00:00', status: 'done' },
      { id: 'step-5', nodeName: '分管领导审批', approver: '李明', approverRole: '分管领导', action: '同意', comment: '同意立项', time: '2026-07-16 09:30:00', status: 'done' },
      { id: 'step-6', nodeName: '批复录入', approver: '张凯', approverRole: '申请人', action: '录入', comment: 'PMS批复信息已录入', time: '2026-07-18 11:00:00', status: 'current' },
      { id: 'step-7', nodeName: '归档', approver: '-', approverRole: '系统', action: '-', comment: '', time: '', status: 'pending' }
    ]
  },
  // 投资类资金申请审批中
  'FUND-INVEST-2026070002': {
    fundApplyId: 'FUND-INVEST-2026070002',
    steps: [
      { id: 'step-1', nodeName: '提交申请', approver: '周敏', approverRole: '申请人', action: '提交', comment: '5GToB智慧工厂项目资金申请', time: '2026-07-15 08:30:00', status: 'done' },
      { id: 'step-2', nodeName: '项目负责人审批', approver: '杨海波', approverRole: '项目负责人', action: '退回', comment: '投资测算数据需要补充5G基站部署明细', time: '2026-07-16 10:00:00', status: 'done' },
      { id: 'step-3', nodeName: '重新提交', approver: '周敏', approverRole: '申请人', action: '重新提交', comment: '已补充5G基站部署明细及投资测算', time: '2026-07-17 15:00:00', status: 'done' },
      { id: 'step-4', nodeName: '项目负责人审批', approver: '杨海波', approverRole: '项目负责人', action: '同意', comment: '材料补充完整，同意推进', time: '2026-07-18 09:30:00', status: 'done' },
      { id: 'step-5', nodeName: '部门负责人审批', approver: '王明辉', approverRole: '部门负责人', action: '同意', comment: '同意', time: '2026-07-20 14:00:00', status: 'done' },
      { id: 'step-6', nodeName: '财务审批', approver: '陈丽华', approverRole: '财务负责人', action: '', comment: '', time: '', status: 'current' },
      { id: 'step-7', nodeName: '分管领导审批', approver: '-', approverRole: '分管领导', action: '-', comment: '', time: '', status: 'pending' },
      { id: 'step-8', nodeName: '批复录入', approver: '-', approverRole: '申请人', action: '-', comment: '', time: '', status: 'pending' },
      { id: 'step-9', nodeName: '归档', approver: '-', approverRole: '系统', action: '-', comment: '', time: '', status: 'pending' }
    ]
  },
  // 投资类资金申请（已完成）
  'FUND-INVEST-2026070003': {
    fundApplyId: 'FUND-INVEST-2026070003',
    steps: [
      { id: 'step-1', nodeName: '提交申请', approver: '刘洋', approverRole: '申请人', action: '提交', comment: '合肥轨道交通智慧交通项目申请', time: '2026-06-20 10:00:00', status: 'done' },
      { id: 'step-2', nodeName: '项目负责人审批', approver: '赵曙光', approverRole: '项目负责人', action: '同意', comment: '项目符合投资方向', time: '2026-06-22 09:30:00', status: 'done' },
      { id: 'step-3', nodeName: '部门负责人审批', approver: '王明辉', approverRole: '部门负责人', action: '同意', comment: '同意', time: '2026-06-24 11:00:00', status: 'done' },
      { id: 'step-4', nodeName: '财务审批', approver: '陈丽华', approverRole: '财务负责人', action: '同意', comment: '财务审核通过', time: '2026-06-26 15:00:00', status: 'done' },
      { id: 'step-5', nodeName: '分管领导审批', approver: '李明', approverRole: '分管领导', action: '同意', comment: '批准立项', time: '2026-06-28 10:00:00', status: 'done' },
      { id: 'step-6', nodeName: '批复录入', approver: '刘洋', approverRole: '申请人', action: '录入', comment: 'PMS信息录入完成', time: '2026-07-02 14:00:00', status: 'done' },
      { id: 'step-7', nodeName: '归档', approver: '系统', approverRole: '系统', action: '自动归档', comment: '审批流程完成，已归档', time: '2026-07-03 08:00:00', status: 'done' }
    ]
  }
}

export function getApprovalTrail(fundApplyId: string): ApprovalTrail | undefined {
  return approvalTrailMap[fundApplyId]
}
