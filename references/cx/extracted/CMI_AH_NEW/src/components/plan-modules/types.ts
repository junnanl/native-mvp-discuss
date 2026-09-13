export interface PaymentPlanItem {
  id: string
  milestone: string
  amount: string
  paymentDate: string
  transferDate: string
}

export interface MilestoneOption {
  name: string
  date: string
}

export interface ITIncomeRow {
  id: string
  productName: string
  tariffName: string
  mgmtProductCode: string
  mgmtProductName: string
  thirdLevelSubject: string
  coaSubject: string
  taxRate: string
  isFixedRate?: string
  plannedIncome: string
  plannedTariffAmount?: string
  budgetTariffAmount?: string
  contractStage: string
  billingShareType: string
  billingSharePeriod: string
  isContractAsset: string
  plannedOrderDate: string
  milestoneName?: string
  orderStatus?: string
  billingStartDate: string
  paymentPlans?: PaymentPlanItem[]
}

export interface CTIncomeRow {
  id: string
  productName: string
  packageName?: string
  productCode?: string
  productFullName?: string
  bandwidth?: string
  orderQuantity: string
  tariffName: string
  plannedIncome: string
  plannedTariffAmount?: string
  budgetTariffAmount?: string
  taxRate: string
  discount?: string
  billingShareType: string
  billingSharePeriod: string
  isContractAsset?: string
  plannedOrderDate: string
  billingStartDate: string
  mgmtProductCode?: string
  mgmtProductName?: string
  thirdLevelSubject?: string
  coaSubject: string
  coaSubjectName?: string
  orderStatus?: string
}

export interface StageReimburseRow {
  date: string
  amount: string
}

export interface CostRow {
  id: string
  expenseContent: string
  budgetType: string
  plannedExpense: string
  budgetExpenseAmount?: string
  reimbursementMethod: string
  reimbursementPeriod: string
  reimbursementStartDate: string
  taxRate: string
  correspondingTariff: string
  contractStage: string
  businessSubject: string
  stageReimburseRows?: StageReimburseRow[]
}

export interface InvestmentRow {
  id: string
  expenseContent: string
  investmentType: string
  investmentCode: string
  plannedExpense: string
  reimbursementMethod: string
  reimbursementPeriod: string
  reimbursementStartDate: string
  taxRate: string
  correspondingTariff: string
  contractStage: string
  businessSubject: string
  stageReimburseRows?: StageReimburseRow[]
}

export interface AllocationRow {
  id: string
  allocationContent: string
  allocationType: string
  allocationDesc: string
  allocationAmount: string
  allocationMethod: string
  allocationPeriod: string
  allocationStartDate: string
}
