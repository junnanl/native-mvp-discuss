import { useState, useEffect } from 'react'
import { Header, Sider } from '@/components/Layout'
import {
  MultiWindowTabs,
  SolutionManagerDashboard,
  LeaderDashboard
} from '@/components/Dashboard'
import type { RoleKey } from '@/data/mock'
import { todoList } from '@/data/mock'
import { SharedClueInput, SharedClueQuery, OpportunityInput, OpportunityManage, ContractQuery, ContractParse, ContractParseConfirm, ContractParseApproval, IncomePlanChange, IncomePlanChangeConfirm, IncomePlanChangeInit, IncomePlanTimeAdjustInit, IncomePlanTimeAdjustApproval, PurchaseContractSupplement, SupplementAgreementDraft, SettlementAmountChange, AssetTransferList, AssetTransferCreate, AssetTransferApproval, ProductActivation, IncomeConfirmApproval } from '@/pages/Business'
import WorkOrderQuery from '@/pages/Business/WorkOrderQuery'
import WorkOrderCreate from '@/pages/Business/WorkOrderCreate'
import MyTodo from '@/pages/My/Todo'
import PreSaleSupport from '@/pages/My/PreSaleSupport'
import SupportOrderDetail from '@/pages/My/SupportOrderDetail'
import ContractHandover from '@/pages/My/ContractHandover'
import ProjectKickoff from '@/pages/My/ProjectKickoff'
import ProjectPlan from '@/pages/My/ProjectPlan'
import ProjectPlanReview from '@/pages/My/ProjectPlanReview'
import ProjectImplement from '@/pages/My/ProjectImplement'
import BenefitEvaluation from '@/pages/My/BenefitEvaluation'
import BenefitEvaluationOnline from '@/pages/My/BenefitEvaluationOnline'
import FundApplication from '@/pages/My/FundApplication'
import ContractDrafting from '@/pages/My/ContractDrafting'
import ContractAttachmentUpload from '@/pages/My/ContractAttachmentUpload'
import ProductOrderList from '@/pages/Finance/ProductOrderList'
import ProductOrderCreate from '@/pages/Finance/ProductOrderCreate'
import IncomeConfirmList from '@/pages/Finance/IncomeConfirmList'
import IncomeConfirmCreate from '@/pages/Finance/IncomeConfirmCreate'
import IncomeConfirmDetail from '@/pages/Finance/IncomeConfirmDetail'
import CertificateAudit from '@/pages/Finance/CertificateAudit'
import ProvisionManagement from '@/pages/Finance/ProvisionManagement'
import PrepaymentManagement from '@/pages/Finance/PrepaymentManagement'
import PrepaymentCreate from '@/pages/Finance/PrepaymentCreate'
import PrepaymentDetail from '@/pages/Finance/PrepaymentDetail'
import PrepaymentEdit from '@/pages/Finance/PrepaymentEdit'
import PaymentManagement from '@/pages/Finance/PaymentManagement'
import PaymentCreate from '@/pages/Finance/PaymentCreate'
import PaymentEdit from '@/pages/Finance/PaymentEdit'
import PaymentDetail from '@/pages/Finance/PaymentDetail'
import ProvisionWithContractCreate from '@/pages/Finance/ProvisionWithContractCreate'
import ProvisionDetail from '@/pages/Finance/ProvisionDetail'
import ProvisionEdit from '@/pages/Finance/ProvisionEdit'
import ProvisionCopy from '@/pages/Finance/ProvisionCopy'
import WriteoffManagement from '@/pages/Finance/WriteoffManagement'
import WriteoffCreate from '@/pages/Finance/WriteoffCreate'
import WriteoffDetail from '@/pages/Finance/WriteoffDetail'
import ExpenseReimbursement from '@/pages/Finance/ExpenseReimbursement'
import ExpenseCreateWithContract from '@/pages/Finance/ExpenseCreateWithContract'
import ExpenseBillSubmit from '@/pages/Finance/ExpenseBillSubmit'
import CostPrepaymentBillSubmit from '@/pages/Finance/CostPrepaymentBillSubmit'
import CostPrepaymentBillApproval from '@/pages/Finance/CostPrepaymentBillApproval'
import ExpenseBillApproval from '@/pages/Finance/ExpenseBillApproval'
import PaymentProofProvide from '@/pages/Finance/PaymentProofProvide'
import PaymentBillSubmit from '@/pages/Finance/PaymentBillSubmit'
import PaymentBillApproval from '@/pages/Finance/PaymentBillApproval'
import ExpenseCreateWithoutContract from '@/pages/Finance/ExpenseCreateWithoutContract'
import ExpenseEdit from '@/pages/Finance/ExpenseEdit'
import ExpenseCopy from '@/pages/Finance/ExpenseCopy'
import ExpenseSupplement from '@/pages/Finance/ExpenseSupplement'
import PurchaseOrderList from '@/pages/Finance/PurchaseOrderList'
import ForwardOrderList from '@/pages/Finance/ForwardOrderList'
import OrderParse from '@/pages/Finance/OrderParse'
import ForwardOrderPlanChange from '@/pages/Finance/ForwardOrderPlanChange'
import ForwardOrderPlanChangeApproval from '@/pages/Finance/ForwardOrderPlanChangeApproval'
import ProductAssociation from '@/pages/Finance/ProductAssociation'
import ProductAssociationList from '@/pages/Finance/ProductAssociationList'
import WorkOrderDetail from '@/pages/Finance/WorkOrderDetail'
import GroupCustomerArrears from '@/pages/Finance/GroupCustomerArrears'
import ProjectArrears from '@/pages/Finance/ProjectArrears'
import IncomeExpenseContractParse from '@/pages/Finance/IncomeExpenseContractParse'
import IncomeExpenseContractParseApproval from '@/pages/Finance/IncomeExpenseContractParseApproval'
import IncomeExpensePlanAdjustment from '@/pages/Finance/IncomeExpensePlanAdjustment'
import IncomeExpensePlanAdjustmentApproval from '@/pages/Finance/IncomeExpensePlanAdjustmentApproval'
import BackwardContractSimilarityFix from '@/pages/Business/BackwardContractSimilarityFix'
import BackwardContractParseApproval from '@/pages/Business/BackwardContractParseApproval'
import ExpensePlanAdjustment from '@/pages/Business/ExpensePlanAdjustment'
import ExpensePlanAdjustmentApproval from '@/pages/Business/ExpensePlanAdjustmentApproval'
import BlockNotice from '@/pages/Finance/BlockNotice'
import CostFundApply from '@/pages/Finance/fundManage/CostFundApply'
import InvestFundApply from '@/pages/Finance/fundManage/InvestFundApply'
import FundApplyDetail from '@/pages/Finance/fundManage/FundApplyDetail'
import CostFundDetail from '@/pages/Finance/fundManage/CostFundDetail'
import GovInvestFundDetail from '@/pages/Finance/fundManage/GovInvestFundDetail'
import InvestFundApproval from '@/pages/Finance/fundManage/InvestFundApproval'
import ApproveEntry from '@/pages/Finance/fundManage/ApproveEntry'
import ICTInvestFundManage from '@/pages/Finance/fundManage/ICTInvestFundManage'
import ICTCostFundManage from '@/pages/Finance/fundManage/ICTCostFundManage'
import IncomeContractDetail from '@/pages/Business/IncomeContractDetail'
import ExpenseContractDetail from '@/pages/Business/ExpenseContractDetail'
import IncomeExpenseContractDetail from '@/pages/Business/IncomeExpenseContractDetail'
import { ModalProvider } from '@/components/Modal'

// 多开窗口数据
interface WindowTab {
  id: string
  title: string
  pinned?: boolean
  path?: string
}

// 根据path返回对应页面
function renderPageContent(path: string, onNavigate: (path: string) => void) {
  if (path === '/business/clue/share-input') return <SharedClueInput />
  if (path === '/business/clue/shared-query') return <SharedClueQuery onNavigate={onNavigate} />
  if (path === '/business/opportunity/input') return <OpportunityInput />
  if (path === '/business/opportunity/query') return <OpportunityManage onNavigate={onNavigate} />
  if (path === '/my/work-order') return <WorkOrderQuery />
  if (path === '/business/work-order/create') return <WorkOrderCreate />
  if (path === '/my/todo') return <MyTodo onNavigate={onNavigate} />
  if (path === '/my/todo/read') return <MyTodo onNavigate={onNavigate} />

  // 售前支撑处理页（带 id 参数）
  const presaleMatch = path.match(/^\/my\/todo\/presale-support\/([^/]+)$/)
  if (presaleMatch) {
    return <PreSaleSupport onNavigate={onNavigate} todoId={presaleMatch[1]} />
  }

  // 售前支撑工单详情页
  const supportOrderMatch = path.match(/^\/my\/todo\/presale-support\/([^/]+)\/support-order\/([^/]+)$/)
  if (supportOrderMatch) {
    return (
      <SupportOrderDetail
        onNavigate={onNavigate}
        presaleId={supportOrderMatch[1]}
        supportId={supportOrderMatch[2]}
      />
    )
  }

  // 合同交底处理页（带 id 参数）
  const contractHandoverMatch = path.match(/^\/my\/todo\/contract-handover\/([^/]+)$/)
  if (contractHandoverMatch) {
    return <ContractHandover onNavigate={onNavigate} todoId={contractHandoverMatch[1]} />
  }

  // 收入计划确认发起 - 从工作台待办进入（带 contractId 参数）
  const todoIncomeConfirmCreateMatch = path.match(/^\/my\/todo\/income-confirm\/create\/([^/]+)$/)
  if (todoIncomeConfirmCreateMatch) {
    return <IncomeConfirmCreate onNavigate={onNavigate} todoContractId={todoIncomeConfirmCreateMatch[1]} />
  }

  // 合同附件上传页面（带 id 参数）
  const contractAttachmentMatch = path.match(/^\/my\/todo\/contract-attachment\/([^/]+)$/)
  if (contractAttachmentMatch) {
    const todoId = contractAttachmentMatch[1]
    const todoItem = todoList.find(item => item.id === todoId)
    return <ContractAttachmentUpload onNavigate={onNavigate} todoId={todoId} contractId={todoItem?.contractId} />
  }

  // 项目开工处理页（带 id 参数）
  const projectKickoffMatch = path.match(/^\/my\/todo\/project-kickoff\/([^/]+)$/)
  if (projectKickoffMatch) {
    return <ProjectKickoff onNavigate={onNavigate} todoId={projectKickoffMatch[1]} />
  }

  // 项目启动与规划处理页（带 id 参数）
  const projectPlanMatch = path.match(/^\/my\/todo\/project-plan\/([^/]+)$/)
  if (projectPlanMatch) {
    return <ProjectPlan onNavigate={onNavigate} todoId={projectPlanMatch[1]} />
  }

  // 项目启动与规划审核页（带 id 参数）
  const projectPlanReviewMatch = path.match(/^\/my\/todo\/project-plan-review\/([^/]+)$/)
  if (projectPlanReviewMatch) {
    return <ProjectPlanReview onNavigate={onNavigate} todoId={projectPlanReviewMatch[1]} />
  }

  // 项目实施处理页（带 id 参数）
  const projectImplementMatch = path.match(/^\/my\/todo\/project-implement\/([^/]+)$/)
  if (projectImplementMatch) {
    return <ProjectImplement onNavigate={onNavigate} todoId={projectImplementMatch[1]} />
  }

  // 资金申请页面
  const fundApplicationMatch = path.match(/^\/my\/todo\/fund-application\/([^/]+)$/)
  if (fundApplicationMatch) {
    return <FundApplication onNavigate={onNavigate} id={fundApplicationMatch[1]} />
  }

  // 效益预评估主页面
  if (path === '/project/pre-sale/benefit') {
    return <BenefitEvaluation onNavigate={onNavigate} />
  }

  // 效益预评估在线填写页面
  if (path === '/project/pre-sale/benefit/online') {
    return <BenefitEvaluationOnline onNavigate={onNavigate} />
  }

  // 合同起草页面
  if (path === '/finance/contract/draft') {
    return <ContractDrafting onNavigate={onNavigate} />
  }

  // 合同起草页面（编辑模式）
  const contractDraftEditMatch = path.match(/^\/finance\/contract\/draft\/([^/]+)$/)
  if (contractDraftEditMatch) {
    return <ContractDrafting onNavigate={onNavigate} editId={contractDraftEditMatch[1]} />
  }

  // 合同管理页面
  if (path === '/finance/contract/query') {
    return <ContractQuery onNavigate={onNavigate} />
  }

  // 采购合同补录页面
  if (path === '/finance/contract/purchase-supplement') {
    return <PurchaseContractSupplement onNavigate={onNavigate} />
  }

  // 补充协议起草页面
  if (path === '/finance/contract/supplement-draft') {
    return <SupplementAgreementDraft onNavigate={onNavigate} />
  }

  // 前向合同解析页面（带 id 参数）
  const contractParseMatch = path.match(/^\/finance\/contract\/parse\/([^/]+)$/)
  if (contractParseMatch) {
    return <ContractParse onNavigate={onNavigate} contractId={contractParseMatch[1]} parseType="forward" />
  }

  // 前向合同解析审批页面（带 id 参数）
  const contractParseApprovalMatch = path.match(/^\/finance\/contract\/parse-approval\/([^/]+)$/)
  if (contractParseApprovalMatch) {
    return <ContractParseApproval onNavigate={onNavigate} contractId={contractParseApprovalMatch[1]} parseType="forward" />
  }

  // 产品开通页面（带 id 参数）
  const productActivationMatch = path.match(/^\/finance\/contract\/product-activation\/([^/]+)$/)
  if (productActivationMatch) {
    return <ProductActivation onNavigate={onNavigate} contractId={productActivationMatch[1]} />
  }

  // 收入计划确认审批页面（带 id 参数）
  const incomeConfirmApprovalMatch = path.match(/^\/finance\/income\/confirm\/approval\/([^/]+)$/)
  if (incomeConfirmApprovalMatch) {
    return <IncomeConfirmApproval onNavigate={onNavigate} contractId={incomeConfirmApprovalMatch[1]} />
  }

  // 前向合同解析确认与补充页面（带 id 参数）
  const contractParseConfirmMatch = path.match(/^\/finance\/contract\/parse-confirm\/([^/]+)$/)
  if (contractParseConfirmMatch) {
    return <ContractParseConfirm onNavigate={onNavigate} contractId={contractParseConfirmMatch[1]} />
  }

  // 后向合同解析页面（带 id 参数）
  const backwardContractParseMatch = path.match(/^\/finance\/contract\/backward-parse\/([^/]+)$/)
  if (backwardContractParseMatch) {
    return <ContractParse onNavigate={onNavigate} contractId={backwardContractParseMatch[1]} parseType="backward" />
  }

  // 后向合同内容相似度过高修改页面（带 id 参数）
  const backwardSimilarityFixMatch = path.match(/^\/finance\/contract\/backward-similarity-fix\/([^/]+)$/)
  if (backwardSimilarityFixMatch) {
    return <BackwardContractSimilarityFix onNavigate={onNavigate} contractId={backwardSimilarityFixMatch[1]} />
  }

  // 后向合同解析审批页面（带 id 参数）
  const backwardParseApprovalMatch = path.match(/^\/finance\/contract\/backward-parse-approval\/([^/]+)$/)
  if (backwardParseApprovalMatch) {
    return <BackwardContractParseApproval onNavigate={onNavigate} contractId={backwardParseApprovalMatch[1]} />
  }

  // 支出计划调整发起页面（带 id 参数）
  const expensePlanAdjustmentMatch = path.match(/^\/finance\/contract\/expense-plan-adjustment\/([^/]+)$/)
  if (expensePlanAdjustmentMatch) {
    return <ExpensePlanAdjustment onNavigate={onNavigate} contractId={expensePlanAdjustmentMatch[1]} />
  }

  // 支出计划调整审批页面（带 id 参数）
  const expensePlanAdjustmentApprovalMatch = path.match(/^\/finance\/contract\/expense-plan-adjustment-approval\/([^/]+)$/)
  if (expensePlanAdjustmentApprovalMatch) {
    return <ExpensePlanAdjustmentApproval onNavigate={onNavigate} contractId={expensePlanAdjustmentApprovalMatch[1]} />
  }

  // 合同详情页面（带 id 参数，只读）
  const contractDetailMatch = path.match(/^\/finance\/contract\/detail\/([^/]+)$/)
  if (contractDetailMatch) {
    return <ContractParse onNavigate={onNavigate} contractId={contractDetailMatch[1]} readOnly />
  }

  // 收入合同详情页面
  const incomeContractDetailMatch = path.match(/^\/finance\/contract\/detail\/income\/([^/]+)$/)
  if (incomeContractDetailMatch) {
    return <IncomeContractDetail onNavigate={onNavigate} contractId={incomeContractDetailMatch[1]} />
  }

  // 支出合同详情页面
  const expenseContractDetailMatch = path.match(/^\/finance\/contract\/detail\/expense\/([^/]+)$/)
  if (expenseContractDetailMatch) {
    return <ExpenseContractDetail onNavigate={onNavigate} contractId={expenseContractDetailMatch[1]} />
  }

  // 有收有支合同详情页面
  const incomeExpenseContractDetailMatch = path.match(/^\/finance\/contract\/detail\/income-expense\/([^/]+)$/)
  if (incomeExpenseContractDetailMatch) {
    return <IncomeExpenseContractDetail onNavigate={onNavigate} contractId={incomeExpenseContractDetailMatch[1]} />
  }

  // 收入计划变更页面（带 id 参数）
  const incomePlanChangeMatch = path.match(/^\/finance\/contract\/income-plan-change\/([^/]+)$/)
  if (incomePlanChangeMatch) {
    return <IncomePlanChange onNavigate={onNavigate} contractId={incomePlanChangeMatch[1]} />
  }

  // 收入计划调整确认与补充页面（带 id 参数）
  const incomePlanChangeConfirmMatch = path.match(/^\/finance\/contract\/income-plan-change-confirm\/([^/]+)$/)
  if (incomePlanChangeConfirmMatch) {
    return <IncomePlanChangeConfirm onNavigate={onNavigate} contractId={incomePlanChangeConfirmMatch[1]} />
  }

  // 收入计划调整发起页面（带 id 参数）
  const incomePlanChangeInitMatch = path.match(/^\/finance\/contract\/income-plan-change-init\/([^/]+)$/)
  if (incomePlanChangeInitMatch) {
    return <IncomePlanChangeInit onNavigate={onNavigate} contractId={incomePlanChangeInitMatch[1]} />
  }

  // 收入计划时间调整发起页面（带 id 参数）
  const incomePlanTimeAdjustInitMatch = path.match(/^\/finance\/contract\/income-plan-time-adjust-init\/([^/]+)$/)
  if (incomePlanTimeAdjustInitMatch) {
    return <IncomePlanTimeAdjustInit onNavigate={onNavigate} contractId={incomePlanTimeAdjustInitMatch[1]} />
  }

  // 收入计划时间调整审批页面（带 id 参数）
  const incomePlanTimeAdjustApprovalMatch = path.match(/^\/finance\/contract\/income-plan-time-adjust-approval\/([^/]+)$/)
  if (incomePlanTimeAdjustApprovalMatch) {
    return <IncomePlanTimeAdjustApproval onNavigate={onNavigate} contractId={incomePlanTimeAdjustApprovalMatch[1]} />
  }

  // 预付款管理页面
  if (path === '/finance/expense/prepayment') {
    return <PrepaymentManagement onNavigate={onNavigate} />
  }

  // 发起预付款页面
  if (path === '/finance/expense/prepayment/create') {
    return <PrepaymentCreate onNavigate={onNavigate} />
  }

  // 预付款详情页面
  const prepaymentDetailMatch = path.match(/^\/finance\/expense\/prepayment\/detail\/([^/]+)$/)
  if (prepaymentDetailMatch) {
    return <PrepaymentDetail onNavigate={onNavigate} id={prepaymentDetailMatch[1]} />
  }

  // 修改预付款页面
  const prepaymentEditMatch = path.match(/^\/finance\/expense\/prepayment\/edit\/([^/]+)$/)
  if (prepaymentEditMatch) {
    return <PrepaymentEdit onNavigate={onNavigate} id={prepaymentEditMatch[1]} />
  }

  // 付款管理页面
  if (path === '/finance/payment') {
    return <PaymentManagement onNavigate={onNavigate} />
  }

  // 修改付款页面
  const paymentEditMatch = path.match(/^\/finance\/payment\/edit\/([^/]+)$/)
  if (paymentEditMatch) {
    return <PaymentEdit onNavigate={onNavigate} id={paymentEditMatch[1]} />
  }

  // 付款详情页面
  const paymentDetailMatch = path.match(/^\/finance\/payment\/detail\/([^/]+)$/)
  if (paymentDetailMatch) {
    return <PaymentDetail onNavigate={onNavigate} id={paymentDetailMatch[1]} />
  }

  // 发起付款页面
  if (path === '/finance/payment/create') {
    return <PaymentCreate onNavigate={onNavigate} />
  }

  // 付款报账单提交页面
  if (path === '/finance/payment/bill-submit') {
    return <PaymentBillSubmit onNavigate={onNavigate} />
  }

  // 付款报账单审批页面
  if (path === '/finance/payment/bill-approval') {
    return <PaymentBillApproval onNavigate={onNavigate} />
  }

  // 计提管理页面
  if (path === '/finance/expense/provision') {
    return <ProvisionManagement onNavigate={onNavigate} />
  }

  // 计提详情页面
  const provisionDetailMatch = path.match(/^\/finance\/expense\/provision\/detail\/([^/]+)$/)
  if (provisionDetailMatch) {
    return <ProvisionDetail onNavigate={onNavigate} id={provisionDetailMatch[1]} />
  }

  // 修改计提页面
  const provisionEditMatch = path.match(/^\/finance\/expense\/provision\/edit\/([^/]+)$/)
  if (provisionEditMatch) {
    return <ProvisionEdit onNavigate={onNavigate} id={provisionEditMatch[1]} />
  }

  // 复制计提页面
  const provisionCopyMatch = path.match(/^\/finance\/expense\/provision\/copy\/([^/]+)$/)
  if (provisionCopyMatch) {
    return <ProvisionCopy onNavigate={onNavigate} id={provisionCopyMatch[1]} />
  }

  // 发起计提页面
  if (path === '/finance/expense/provision/create-with-contract') {
    return <ProvisionWithContractCreate onNavigate={onNavigate} />
  }

  // 冲销管理页面
  if (path === '/finance/expense/writeoff') {
    return <WriteoffManagement onNavigate={onNavigate} />
  }

  // 发起冲销页面
  if (path === '/finance/expense/writeoff/create') {
    return <WriteoffCreate onNavigate={onNavigate} />
  }

  // 冲销详情页面
  const writeoffDetailMatch = path.match(/^\/finance\/expense\/writeoff\/detail\/([^/]+)$/)
  if (writeoffDetailMatch) {
    return <WriteoffDetail onNavigate={onNavigate} id={writeoffDetailMatch[1]} />
  }

  // 支出报账管理页面
  if (path === '/finance/expense/expense') {
    return <ExpenseReimbursement onNavigate={onNavigate} />
  }

  // 修改报账页面
  const expenseEditMatch = path.match(/^\/finance\/expense\/edit\/([^/]+)$/)
  if (expenseEditMatch) {
    return <ExpenseEdit onNavigate={onNavigate} id={expenseEditMatch[1]} />
  }

  // 复制报账页面
  const expenseCopyMatch = path.match(/^\/finance\/expense\/copy\/([^/]+)$/)
  if (expenseCopyMatch) {
    return <ExpenseCopy onNavigate={onNavigate} id={expenseCopyMatch[1]} />
  }

  // 发起报账（普通项目）页面
  if (path === '/finance/expense/create-with-contract') {
    return <ExpenseCreateWithContract onNavigate={onNavigate} />
  }

  // 项目类费用报账单提交页面
  if (path === '/finance/expense/bill-submit') {
    return <ExpenseBillSubmit onNavigate={onNavigate} />
  }

  // 预付款报账单提交页面
  if (path === '/finance/expense/cost-prepayment-bill-submit') {
    return <CostPrepaymentBillSubmit onNavigate={onNavigate} />
  }

  // 项目类费用报账单审批页面
  if (path === '/finance/expense/bill-approval') {
    return <ExpenseBillApproval onNavigate={onNavigate} />
  }

  // 预付款报账单审批页面
  if (path === '/finance/expense/cost-prepayment-bill-approval') {
    return <CostPrepaymentBillApproval onNavigate={onNavigate} />
  }

  // 回款证明提供页面
  const paymentProofProvideMatch = path.match(/^\/finance\/expense\/payment-proof\/([^/]+)$/)
  if (paymentProofProvideMatch) {
    return <PaymentProofProvide onNavigate={onNavigate} contractId={paymentProofProvideMatch[1]} />
  }

  // 发起报账（网格小微项目）页面
  if (path === '/finance/expense/create-without-contract') {
    return <ExpenseCreateWithoutContract onNavigate={onNavigate} />
  }

  // 报账详情（普通项目）
  const detailWithContractMatch = path.match(/^\/finance\/expense\/detail-with-contract\/([^/]+)$/)
  if (detailWithContractMatch) {
    return <ExpenseCreateWithContract onNavigate={onNavigate} readOnly id={detailWithContractMatch[1]} />
  }

  // 支出报账详情（无合同）
  const detailWithoutContractMatch = path.match(/^\/finance\/expense\/detail-without-contract\/([^/]+)$/)
  if (detailWithoutContractMatch) {
    return <ExpenseCreateWithoutContract onNavigate={onNavigate} readOnly id={detailWithoutContractMatch[1]} />
  }

  // 报账单补录
  if (path === '/finance/expense/supplement') {
    return <ExpenseSupplement onNavigate={onNavigate} />
  }

  // 资金申请页面
  if (path === '/finance/expense/fund-application') {
    return <FundApplication onNavigate={onNavigate} />
  }

  // 集团客户欠费管理页面
  if (path === '/finance/arrears/group-customer') {
    return <GroupCustomerArrears />
  }

  // 项目欠费管理页面
  if (path === '/finance/arrears/project') {
    return <ProjectArrears />
  }

  // 结算金额变更页面（带 id 参数）
  const settlementAmountChangeMatch = path.match(/^\/finance\/contract\/settlement-amount-change\/([^/]+)$/)
  if (settlementAmountChangeMatch) {
    return <SettlementAmountChange onNavigate={onNavigate} contractId={settlementAmountChangeMatch[1]} />
  }

  // 有收有支合同解析页面（带 id 参数）
  const incomeExpenseContractParseMatch = path.match(/^\/finance\/contract\/income-expense-parse\/([^/]+)$/)
  if (incomeExpenseContractParseMatch) {
    return <IncomeExpenseContractParse onNavigate={onNavigate} contractId={incomeExpenseContractParseMatch[1]} />
  }

  // 有收有支合同解析审批页面（带 id 参数）
  const incomeExpenseContractParseApprovalMatch = path.match(/^\/finance\/contract\/income-expense-parse-approval\/([^/]+)$/)
  if (incomeExpenseContractParseApprovalMatch) {
    return <IncomeExpenseContractParseApproval onNavigate={onNavigate} contractId={incomeExpenseContractParseApprovalMatch[1]} />
  }

  // 收支计划调整发起页面（带 id 参数）
  const incomeExpensePlanAdjustmentMatch = path.match(/^\/finance\/contract\/income-expense-plan-adjustment\/([^/]+)$/)
  if (incomeExpensePlanAdjustmentMatch) {
    return <IncomeExpensePlanAdjustment onNavigate={onNavigate} contractId={incomeExpensePlanAdjustmentMatch[1]} />
  }

  // 收支计划调整审批页面（带 id 参数）
  const incomeExpensePlanAdjustmentApprovalMatch = path.match(/^\/finance\/contract\/income-expense-plan-adjustment-approval\/([^/]+)$/)
  if (incomeExpensePlanAdjustmentApprovalMatch) {
    return <IncomeExpensePlanAdjustmentApproval onNavigate={onNavigate} contractId={incomeExpensePlanAdjustmentApprovalMatch[1]} />
  }

  // 前向订单管理页面
  if (path === '/finance/contract/order/forward') {
    return <ForwardOrderList onNavigate={onNavigate} />
  }

  // 采购订单管理页面
  if (path === '/finance/contract/order/purchase') {
    return <PurchaseOrderList onNavigate={onNavigate} />
  }

  // 前向订单解析页面（带 id 参数）
  const forwardOrderParseMatch = path.match(/^\/finance\/contract\/order\/forward\/parse\/([^/]+)$/)
  if (forwardOrderParseMatch) {
    return <OrderParse onNavigate={onNavigate} orderId={forwardOrderParseMatch[1]} orderType="forward" />
  }

  // 收入计划调整审批页面（带 id 参数）
  const forwardOrderPlanChangeApprovalMatch = path.match(/^\/finance\/contract\/order\/forward\/plan-change-approval\/([^/]+)$/)
  if (forwardOrderPlanChangeApprovalMatch) {
    return <ForwardOrderPlanChangeApproval onNavigate={onNavigate} contractId={forwardOrderPlanChangeApprovalMatch[1]} />
  }

  // 前向订单计划变更页面（带 id 参数）
  const forwardOrderPlanChangeMatch = path.match(/^\/finance\/contract\/order\/forward\/plan-change\/([^/]+)$/)
  if (forwardOrderPlanChangeMatch) {
    return <ForwardOrderPlanChange onNavigate={onNavigate} orderId={forwardOrderPlanChangeMatch[1]} />
  }

  // 采购订单解析页面（带 id 参数）
  const purchaseOrderParseMatch = path.match(/^\/finance\/contract\/order\/purchase\/parse\/([^/]+)$/)
  if (purchaseOrderParseMatch) {
    return <OrderParse onNavigate={onNavigate} orderId={purchaseOrderParseMatch[1]} orderType="purchase" />
  }

  // 产品订购列表页面
  if (path === '/finance/income/product-order') {
    return <ProductOrderList onNavigate={onNavigate} />
  }

  // 产品订购创建页面
  if (path === '/finance/income/product-order/create') {
    return <ProductOrderCreate onNavigate={onNavigate} />
  }

  // 收入确认列表页面
  if (path === '/finance/income/confirm') {
    return <IncomeConfirmList onNavigate={onNavigate} />
  }

  // 收入确认发起页面
  if (path === '/finance/income/confirm/create') {
    return <IncomeConfirmCreate onNavigate={onNavigate} />
  }

  // 三证一书稽核页面
  if (path === '/finance/certificate/audit') {
    return <CertificateAudit onNavigate={onNavigate} />
  }

  // 收入确认详情页面（带 id 参数，只读）
  const incomeConfirmDetailMatch = path.match(/^\/finance\/income\/confirm\/detail\/([^/]+)$/)
  if (incomeConfirmDetailMatch) {
    return <IncomeConfirmDetail onNavigate={onNavigate} contractId={incomeConfirmDetailMatch[1]} />
  }

  // CT产品订购列表页面
  if (path === '/finance/income/product-association') {
    return <ProductAssociationList onNavigate={onNavigate} />
  }

  // CT产品订购工单发起页面
  if (path === '/finance/income/product-association/create') {
    return <ProductAssociation onNavigate={onNavigate} />
  }

  // CT产品订购修改页面
  const productAssociationEditMatch = path.match(/^\/finance\/income\/product-association\/edit\/([^/]+)$/)
  if (productAssociationEditMatch) {
    return <ProductAssociation onNavigate={onNavigate} editId={productAssociationEditMatch[1]} />
  }

  // CT产品订购详情页面
  const productAssociationDetailMatch = path.match(/^\/finance\/income\/product-association\/detail\/([^/]+)$/)
  if (productAssociationDetailMatch) {
    return <ProductAssociation onNavigate={onNavigate} readOnly detailId={productAssociationDetailMatch[1]} />
  }

  // CT产品订购工单详情页面
  const workOrderDetailMatch = path.match(/^\/finance\/income\/product-association\/workorder-detail\/([^/]+)$/)
  if (workOrderDetailMatch) {
    return <WorkOrderDetail onNavigate={onNavigate} workOrderId={workOrderDetailMatch[1]} />
  }

  // 合同资产转出管理页面
  if (path === '/finance/contract/asset-transfer') {
    return <AssetTransferList onNavigate={onNavigate} />
  }

  // 合同资产转出发起页面
  if (path === '/finance/contract/asset-transfer/create') {
    return <AssetTransferCreate onNavigate={onNavigate} />
  }

  // 合同资产转出发起页面（带合同资产 id 参数，从列表点击"合同资产转出"进入）
  const assetTransferCreateMatch = path.match(/^\/finance\/contract\/asset-transfer\/create\/([^/]+)$/)
  if (assetTransferCreateMatch) {
    return <AssetTransferCreate onNavigate={onNavigate} id={assetTransferCreateMatch[1]} />
  }

  // 合同资产转出详情页面（带 id 参数，只读）
  const assetTransferDetailMatch = path.match(/^\/finance\/contract\/asset-transfer\/detail\/([^/]+)$/)
  if (assetTransferDetailMatch) {
    return <AssetTransferCreate onNavigate={onNavigate} readOnly id={assetTransferDetailMatch[1]} />
  }

  // 合同资产转出修改页面（带 id 参数）
  const assetTransferEditMatch = path.match(/^\/finance\/contract\/asset-transfer\/edit\/([^/]+)$/)
  if (assetTransferEditMatch) {
    return <AssetTransferCreate onNavigate={onNavigate} id={assetTransferEditMatch[1]} />
  }

  // 合同资产转出审批页面（带合同 id 参数）
  const assetTransferApprovalMatch = path.match(/^\/finance\/contract\/asset-transfer\/approval\/([^/]+)$/)
  if (assetTransferApprovalMatch) {
    return <AssetTransferApproval onNavigate={onNavigate} id={assetTransferApprovalMatch[1]} />
  }

  // 合同资产转出审批页面（无参数入口）
  if (path === '/finance/contract/asset-transfer/approval') {
    return <AssetTransferApproval onNavigate={onNavigate} />
  }

  // 阻断提示页面
  if (path === '/finance/block-notice') {
    return <BlockNotice onNavigate={onNavigate} />
  }

  // ========== 资金管理模块 ==========
  // 投资资金管理
  if (path === '/finance/fund/ict-invest') {
    return <ICTInvestFundManage onNavigate={onNavigate} />
  }

  // 成本资金管理
  if (path === '/finance/fund/ict-cost') {
    return <ICTCostFundManage onNavigate={onNavigate} />
  }

  // 成本类资金申请
  if (path === '/finance/fund/cost-apply') {
    return <CostFundApply onNavigate={onNavigate} />
  }

  // 成本类资金申请（预设项目名称，从资金申请页"新增"带入，不允许选择）
  const costPresetMatch = path.match(/^\/finance\/fund\/cost-apply\/preset\/(.+)$/)
  if (costPresetMatch) {
    return <CostFundApply onNavigate={onNavigate} presetProjectName={decodeURIComponent(costPresetMatch[1])} />
  }

  // 成本类资金申请编辑
  const costApplyEditMatch = path.match(/^\/finance\/fund\/cost-apply\/([^/]+)$/)
  if (costApplyEditMatch) {
    return <CostFundApply onNavigate={onNavigate} editId={costApplyEditMatch[1]} />
  }

  // 投资类资金申请
  if (path === '/finance/fund/invest-apply') {
    return <InvestFundApply onNavigate={onNavigate} source="ict" />
  }

  // 投资类资金申请（预设项目名称，从资金申请页"新增"带入，不允许选择）
  const investPresetMatch = path.match(/^\/finance\/fund\/invest-apply\/preset\/(.+)$/)
  if (investPresetMatch) {
    return <InvestFundApply onNavigate={onNavigate} source="ict" presetProjectName={decodeURIComponent(investPresetMatch[1])} />
  }

  // 投资类资金申请编辑
  const investApplyEditMatch = path.match(/^\/finance\/fund\/invest-apply\/([^/]+)$/)
  if (investApplyEditMatch) {
    return <InvestFundApply onNavigate={onNavigate} editId={investApplyEditMatch[1]} source="ict" />
  }

  // 政企项目投资类资金申请
  if (path === '/finance/fund/gov-invest-apply') {
    return <InvestFundApply onNavigate={onNavigate} source="gov" />
  }

  // 政企项目投资类资金申请编辑
  const govInvestApplyEditMatch = path.match(/^\/finance\/fund\/gov-invest-apply\/([^/]+)$/)
  if (govInvestApplyEditMatch) {
    return <InvestFundApply onNavigate={onNavigate} editId={govInvestApplyEditMatch[1]} source="gov" />
  }

  // 资金申请详情
  const fundDetailMatch = path.match(/^\/finance\/fund\/detail\/([^/]+)$/)
  if (fundDetailMatch) {
    return <FundApplyDetail onNavigate={onNavigate} id={fundDetailMatch[1]} />
  }

  // 成本立项工单详情
  const costFundDetailMatch = path.match(/^\/finance\/fund\/cost-detail\/([^/]+)$/)
  if (costFundDetailMatch) {
    return <CostFundDetail onNavigate={onNavigate} id={costFundDetailMatch[1]} />
  }

  // 政企项目投资立项工单详情
  const govInvestDetailMatch = path.match(/^\/finance\/fund\/gov-invest-detail\/([^/]+)$/)
  if (govInvestDetailMatch) {
    return <GovInvestFundDetail onNavigate={onNavigate} id={govInvestDetailMatch[1]} />
  }

  // 投资类资金申请审批页面（带资金申请ID参数）
  const investFundApprovalMatch = path.match(/^\/finance\/fund\/invest-approval\/([^/]+)$/)
  if (investFundApprovalMatch) {
    return <InvestFundApproval onNavigate={onNavigate} id={investFundApprovalMatch[1]} />
  }

  // 批复录入列表
  if (path === '/finance/fund/approve-entry') {
    return <ApproveEntry onNavigate={onNavigate} />
  }

  // 批复录入处理（带资金申请ID参数）
  const approveEntryMatch = path.match(/^\/finance\/fund\/approve-entry\/([^/]+)$/)
  if (approveEntryMatch) {
    return <ApproveEntry onNavigate={onNavigate} fundApplyId={approveEntryMatch[1]} />
  }
}

export default function App() {
  const [currentRole, setCurrentRole] = useState<RoleKey>('solution-manager')
  const [windowTabs, setWindowTabs] = useState<WindowTab[]>([
    { id: 'dashboard', title: '工作台', pinned: true }
  ])
  const [activeWindowId, setActiveWindowId] = useState('dashboard')
  const [currentPath, setCurrentPath] = useState('/dashboard')

  // 菜单点击处理
  const handleNavigate = (path: string) => {
    // 简单实现：直接用path最后一段作为标题
    const titleMap: Record<string, string> = {
      '/business/clue/share-input': '共享线索录入',
      '/business/clue/shared-query': '共享线索池',
      '/business/opportunity/input': '商机录入',
      '/business/opportunity/query': '商机管理',
      '/my/todo': '我的待办',
      '/my/todo/read': '我的待阅',
      '/my/done': '我的已办',
      '/my/reminder': '我的提醒',
      '/my/clue': '我的线索',
      '/my/business': '我的商机',
      '/my/project': '我的项目',
      '/my/starred-project': '我关注的项目',
      '/my/contract': '我的合同',
      '/my/work-order': '摸排工单管理',
      '/business/work-order/create': '摸排工单处理',
      '/project/pre-sale/benefit': '效益预评估',
      '/project/pre-sale/benefit/online': '在线填写效益预评估',
      '/finance/contract/draft': '合同起草',
      '/finance/contract/query': '合同管理',
      '/finance/contract/purchase-supplement': '采购合同补录',
      '/finance/contract/supplement-draft': '补充协议起草',
      '/finance/income/product-order': '产品订购管理',
      '/finance/income/product-order/create': '产品订购',
      '/finance/income/confirm': 'IT收入计划确认',
      '/finance/income/confirm/create': '收入计划确认发起',
      '/finance/certificate/audit': '三证一书稽核',
      '/finance/expense/prepayment': '预付款管理',
      '/finance/expense/prepayment/create': '发起预付款',
      '/finance/expense/prepayment/edit': '修改预付款',
      '/finance/payment': '付款管理',
      '/finance/payment/create': '发起付款',
      '/finance/payment/edit': '修改付款',
      '/finance/payment/detail': '付款详情',
      '/finance/payment/bill-submit': '付款报账单提交',
      '/finance/payment/bill-approval': '付款报账单审批',
      '/finance/expense/provision': '计提管理',
      '/finance/expense/provision/detail': '计提详情',
      '/finance/expense/provision/edit': '修改计提',
      '/finance/expense/provision/copy': '复制计提',
      '/finance/expense/provision/create-with-contract': '发起计提',
      '/finance/expense/writeoff': '冲销管理',
      '/finance/expense/writeoff/create': '发起冲销',
      '/finance/expense/writeoff/detail': '冲销详情',
      '/finance/expense/expense': '报账管理',
      '/finance/expense/create-with-contract': '发起报账',
      '/finance/expense/edit': '修改报账',
      '/finance/expense/copy': '复制报账',
      '/finance/expense/bill-submit': '项目类费用报账单提交',
      '/finance/expense/cost-prepayment-bill-submit': '预付款报账单提交',
      '/finance/expense/bill-approval': '项目类费用报账单审批',
      '/finance/expense/cost-prepayment-bill-approval': '预付款报账单审批',
      '/finance/expense/create-without-contract': '发起报账（网格小微项目）',
      '/finance/expense/payment-proof': '回款证明提供',
      '/finance/expense/supplement': '报账单补录',
      '/finance/expense/fund-application': '资金申请',
      '/finance/contract/order/forward': '前向订单管理',
      '/finance/contract/order/purchase': '采购订单管理',
      '/finance/income/product-association': 'CT产品订购',
      '/finance/income/product-association/create': 'CT产品订购工单发起',
      '/finance/income/product-association/edit': 'CT产品订购补录',
      '/finance/income/product-association/detail': 'CT产品订购详情',
      '/finance/contract/asset-transfer': '合同资产管理',
      '/finance/arrears/group-customer': '集团客户欠费管理',
      '/finance/arrears/project': '项目欠费管理',
      '/finance/block-notice': '阻断提示',
      '/finance/fund/ict-invest': '投资资金管理',
      '/finance/fund/ict-cost': '成本资金管理',
      '/finance/fund/cost-apply': '成本类资金申请',
      '/finance/fund/invest-apply': 'ICT项目投资类资金申请',
      '/finance/fund/gov-invest-apply': '政企项目投资类资金申请',
      '/finance/fund/approve-entry': '投资类资金申请PMS批复录入',
      '/finance/fund/invest-approval': '投资类资金申请审批'
    }
    // 售前支撑处理页（按前缀匹配）
    let title: string
    if (path.startsWith('/my/todo/presale-support/')) {
      if (path.includes('/support-order/')) {
        title = '支撑工单详情'
      } else {
        title = '售前支撑处理'
      }
    } else if (path.startsWith('/my/todo/contract-handover/')) {
      title = '合同交底处理'
    } else if (path.startsWith('/my/todo/income-confirm/create/')) {
      title = '收入计划确认发起'
    } else if (path.startsWith('/my/todo/contract-attachment/')) {
      title = '合同附件上传'
    } else if (path.startsWith('/my/todo/project-kickoff/')) {
      title = '项目开工处理'
    } else if (path.startsWith('/my/todo/project-plan/')) {
      title = '项目启动与规划'
    } else if (path.startsWith('/my/todo/project-plan-review/')) {
      title = '项目启动与规划审核'
    } else if (path.startsWith('/my/todo/project-implement/')) {
      title = '项目实施'
    } else if (path.startsWith('/finance/contract/parse/')) {
      title = '前向合同解析'
    } else if (path.startsWith('/finance/contract/parse-approval/')) {
      title = '前向合同解析审批'
    } else if (path.startsWith('/finance/contract/product-activation/')) {
      title = '产品开通'
    } else if (path.startsWith('/finance/income/confirm/approval/')) {
      title = '收入计划确认审批'
    } else if (path.startsWith('/finance/contract/parse-confirm/')) {
      title = '前向合同解析确认与补充'
    } else if (path.startsWith('/finance/contract/backward-parse/')) {
      title = '后向合同解析'
    } else if (path.startsWith('/finance/contract/backward-similarity-fix/')) {
      title = '后向合同内容相似度过高修改'
    } else if (path.startsWith('/finance/contract/backward-parse-approval/')) {
      title = '后向合同解析审批'
    } else if (path.startsWith('/finance/contract/expense-plan-adjustment-approval/')) {
      title = '支出计划调整审批'
    } else if (path.startsWith('/finance/contract/expense-plan-adjustment/')) {
      title = '支出计划调整发起'
    } else if (path.startsWith('/finance/contract/detail/income-expense/')) {
      title = '有收有支合同详情'
    } else if (path.startsWith('/finance/contract/detail/income/')) {
      title = '收入合同详情'
    } else if (path.startsWith('/finance/contract/detail/expense/')) {
      title = '支出合同详情'
    } else if (path.startsWith('/finance/contract/detail/')) {
      title = '合同详情'
    } else if (path.startsWith('/finance/contract/draft/')) {
      title = '合同修改'
    } else if (path.startsWith('/finance/contract/income-plan-change/')) {
      title = '收入计划调整'
    } else if (path.startsWith('/finance/contract/income-plan-change-confirm/')) {
      title = '收入计划调整确认与补充'
    } else if (path.startsWith('/finance/contract/income-plan-change-init/')) {
      title = '收入计划调整发起'
    } else if (path.startsWith('/finance/contract/income-plan-time-adjust-init/')) {
      title = '收入计划时间调整发起'
    } else if (path.startsWith('/finance/contract/income-plan-time-adjust-approval/')) {
      title = '收入计划时间调整审批'
    } else if (path.startsWith('/finance/contract/settlement-amount-change/')) {
      title = '结算金额变更'
    } else if (path.startsWith('/finance/contract/income-expense-parse-approval/')) {
      title = '有收有支合同解析审批'
    } else if (path.startsWith('/finance/contract/income-expense-parse/')) {
      title = '有收有支合同解析'
    } else if (path.startsWith('/finance/contract/income-expense-plan-adjustment/')) {
      title = '收支计划调整发起'
    } else if (path.startsWith('/finance/contract/income-expense-plan-adjustment-approval/')) {
      title = '收支计划调整审批'
    } else if (path.startsWith('/finance/contract/order/forward/parse/')) {
      title = '前向订单解析'
    } else if (path.startsWith('/finance/contract/order/forward/plan-change/')) {
      title = '前向订单计划变更'
    } else if (path.startsWith('/finance/contract/order/forward/plan-change-approval/')) {
      title = '收入计划调整审批'
    } else if (path.startsWith('/finance/contract/order/purchase/parse/')) {
      title = '采购订单解析'
    } else if (path.startsWith('/finance/income/confirm/detail/')) {
      title = '收入计划确认详情'
    } else if (path.startsWith('/finance/income/product-association/edit/')) {
      title = 'CT产品订购补录'
    } else if (path.startsWith('/finance/income/product-association/detail/')) {
      title = 'CT产品订购详情'
    } else if (path.startsWith('/finance/income/product-association/workorder-detail/')) {
      title = 'CT产品订购工单详情'
    } else if (path.startsWith('/finance/contract/asset-transfer/create')) {
      title = '合同资产转出发起'
    } else if (path.startsWith('/finance/contract/asset-transfer/approval/')) {
      title = '合同资产转出审批'
    } else if (path.startsWith('/finance/contract/asset-transfer/detail/')) {
      title = '合同资产详情'
    } else if (path.startsWith('/finance/contract/asset-transfer/edit/')) {
      title = '合同资产转出修改'
    } else if (path.startsWith('/finance/contract/asset-transfer/force-transfer/')) {
      title = '合同资产强制转出'
    } else if (path.startsWith('/finance/contract/asset-transfer/approval')) {
      title = '合同资产转出审批'
    } else if (path.startsWith('/finance/expense/prepayment/detail/')) {
      title = '预付款详情'
    } else if (path.startsWith('/finance/expense/prepayment/edit/')) {
      title = '修改预付款'
    } else if (path.startsWith('/finance/payment/edit/')) {
      title = '修改付款'
    } else if (path.startsWith('/finance/payment/detail/')) {
      title = '付款详情'
    } else if (path.startsWith('/finance/expense/provision/detail/')) {
      title = '计提详情'
    } else if (path.startsWith('/finance/expense/provision/edit/')) {
      title = '修改计提'
    } else if (path.startsWith('/finance/expense/provision/copy/')) {
      title = '复制计提'
    } else if (path.startsWith('/finance/expense/edit/')) {
      title = '修改报账'
    } else if (path.startsWith('/finance/expense/copy/')) {
      title = '复制报账'
    } else if (path.startsWith('/finance/expense/writeoff/detail/')) {
      title = '冲销详情'
    } else if (path.startsWith('/finance/expense/detail-with-contract/')) {
      title = '报账详情'
    } else if (path.startsWith('/finance/expense/detail-without-contract/')) {
      title = '支出报账单详情（无合同）'
    } else if (path.startsWith('/finance/expense/payment-proof/')) {
      title = '回款证明提供'
    } else if (path.startsWith('/finance/fund/detail/')) {
      title = 'ICT项目投资立项工单详情'
    } else if (path.startsWith('/finance/fund/cost-detail/')) {
      title = '成本立项工单详情'
    } else if (path.startsWith('/finance/fund/gov-invest-detail/')) {
      title = '政企项目投资立项工单详情'
    } else if (path.startsWith('/finance/fund/invest-apply/preset/')) {
      title = 'ICT项目投资类资金申请'
    } else if (path.startsWith('/finance/fund/cost-apply/preset/')) {
      title = '成本类资金申请'
    } else if (path.startsWith('/finance/fund/cost-apply/')) {
      title = '编辑成本类资金申请'
    } else if (path.startsWith('/finance/fund/invest-apply/')) {
      title = '编辑ICT项目投资类资金申请'
    } else if (path.startsWith('/finance/fund/gov-invest-apply/')) {
      title = '编辑政企项目投资类资金申请'
    } else if (path.startsWith('/finance/fund/invest-approval/')) {
      title = '投资类资金申请审批'
    } else if (path.startsWith('/finance/fund/approve-entry/')) {
      title = '投资类资金申请PMS批复录入'
    } else {
      title = titleMap[path] || '新窗口'
    }

    // 检查是否已经存在同path的窗口
    const existingTab = windowTabs.find(t => t.path === path)
    if (existingTab) {
      setActiveWindowId(existingTab.id)
      setCurrentPath(path)
      return
    }

    // 创建新窗口
    const newId = `window-${Date.now()}`
    setWindowTabs(prev => [...prev, { id: newId, title, path }])
    setActiveWindowId(newId)
    setCurrentPath(path)
  }

  const handleAddWindow = (title: string) => {
    const newId = `window-${Date.now()}`
    setWindowTabs(prev => [...prev, { id: newId, title }])
    setActiveWindowId(newId)
  }

  const handleCloseWindow = (id: string) => {
    if (id === 'dashboard') return

    setWindowTabs(prev => prev.filter(tab => tab.id !== id))

    if (activeWindowId === id) {
      const remaining = windowTabs.filter(tab => tab.id !== id)
      const nextActive = remaining[remaining.length - 1]?.id || 'dashboard'
      setActiveWindowId(nextActive)
      const nextTab = windowTabs.find(t => t.id === nextActive)
      setCurrentPath(nextTab?.path || '/dashboard')
    }
  }

  const handleCloseOtherWindows = (keepId: string) => {
    setWindowTabs(prev => prev.filter(tab => tab.id === keepId || tab.pinned))
    setActiveWindowId(keepId)
    const tab = windowTabs.find(t => t.id === keepId)
    setCurrentPath(tab?.path || '/dashboard')
  }

  const handleCloseAllWindows = () => {
    setWindowTabs(prev => prev.filter(tab => tab.pinned))
    setActiveWindowId('dashboard')
    setCurrentPath('/dashboard')
  }

  const handleTabChange = (tabId: string) => {
    setActiveWindowId(tabId)
    const tab = windowTabs.find(t => t.id === tabId)
    setCurrentPath(tab?.path || '/dashboard')
  }

  // 切换角色：自动切回工作台（dashboard）
  const handleRoleChange = (key: RoleKey) => {
    setCurrentRole(key)
    setActiveWindowId('dashboard')
    setCurrentPath('/dashboard')
  }

  // 监听子页面发起的"按路径关闭标签"事件
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { path?: string } | undefined
      if (!detail?.path) return
      const target = windowTabs.find(t => t.path === detail.path)
      if (target) {
        handleCloseWindow(target.id)
      }
    }
    window.addEventListener('close-tab-by-path', handler as EventListener)
    return () => window.removeEventListener('close-tab-by-path', handler as EventListener)
  }, [windowTabs])

  return (
    <ModalProvider>
      <div className="h-full bg-gray-50 flex flex-col">
        {/* 顶部导航栏 */}
        <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

        {/* 主体区域 */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* 左侧菜单 */}
          <Sider onNavigate={handleNavigate} />

          {/* 内容区域 */}
          <main className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* 多开窗口标签栏 */}
            <MultiWindowTabs
              windowTabs={windowTabs}
              activeWindowId={activeWindowId}
              onTabChange={handleTabChange}
              onAddWindow={handleAddWindow}
              onCloseWindow={handleCloseWindow}
              onCloseOtherWindows={handleCloseOtherWindows}
              onCloseAllWindows={handleCloseAllWindows}
            />

            {/* 窗口内容区域 */}
            <div className="flex-1 overflow-hidden min-h-0">
              {currentPath === '/dashboard' ? (
                currentRole === 'leader'
                  ? <LeaderDashboard onNavigate={handleNavigate} />
                  : <SolutionManagerDashboard onNavigate={handleNavigate} />
              ) : (
                renderPageContent(currentPath, handleNavigate)
              )}
            </div>
          </main>
        </div>
      </div>
    </ModalProvider>
  )
}
