import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, HelpCircle, RotateCcw, Check, X } from 'lucide-react'
import { useModal } from '@/components/Modal'
import { ParsedBenefitData } from '@/lib/benefitEvaluationParser'
import IncomeCTSection from '@/components/plan-modules/IncomeCTSection'
import PaymentPlanCostDisplay from '@/components/plan-modules/common/PaymentPlanCostDisplay'
import ModalShell from '@/components/plan-modules/common/ModalShell'
import ModalFooter from '@/components/plan-modules/common/ModalFooter'
import FormRow from '@/components/plan-modules/common/FormRow'
import SearchableSelect from '@/components/plan-modules/common/SearchableSelect'
import SegmentedSelect from '@/components/plan-modules/common/SegmentedSelect'
import NumberInput from '@/components/plan-modules/common/NumberInput'
import DateInput from '@/components/plan-modules/common/DateInput'
import PaymentPlanSection, { validatePaymentPlans, defaultMilestones } from '@/components/PaymentPlanSection'
import PaymentPlansDisplay from '@/components/plan-modules/common/PaymentPlansDisplay'
import MonthPicker from '@/components/plan-modules/common/MonthPicker'
import type { CTIncomeRow } from '@/components/plan-modules/types'
import {
  ctProductTypeProductNameMap,
  ctProductNameTariffMap,
  parseCtProductName,
  isCtBandwidthRequired
} from '@/components/plan-modules/constants'

// IT成本计划行
export interface ITCostPlanRow {
  id: string
  productName: string
  plannedExpense: string
  taxRate: string
  tariffName: string
  plannedTariffExpense: string
  maxTariffAmount: string
  shareType: string
  sharePeriod: string
  costPaymentDate: string
  mgmtProduct: string
  coaSubject: string
  paymentPlans?: { id: string; amount: string; paymentDate: string }[]
}

// CT 成本计划行
export interface CTCostPlanRow {
  id: string
  expenseBusinessSubject: string
  plannedExpense: string
  taxRate: string
  mgmtProduct: string
  coaSubject: string
}

// IT/CT 投资计划行
export interface InvestmentPlanRow {
  id: string
  expenseBusinessSubject: string
  plannedExpense: string
  shareType: string
  sharePeriod: string
  taxRate: string
  mgmtProduct: string
  coaSubject: string
}

// 非本项目支出成本分摊计划行
export interface NonProjectAllocationRow {
  id: string
  expenseBusinessSubject: string
  plannedExpense: string
  mgmtProduct: string
  coaSubject: string
}

// 综合成本计划行
export interface ComprehensiveCostRow {
  id: string
  expenseBusinessSubject: string
  plannedExpense: string
  taxRate: string
  mgmtProduct: string
  coaSubject: string
}

// 新 IT 收入计划
export interface NewITIncomeTariff {
  id: string
  tariffName: string
  plannedTariffAmount: string
  billingShareType: string
  billingSharePeriod: string
  plannedOrderDate: string
  mgmtProductCode: string
  mgmtProductName: string
  coaSubject: string
  paymentPlans: { id: string; milestone: string; amount: string; paymentDate: string; transferDate: string }[]
}

export interface NewITIncomeProduct {
  id: string
  productName: string
  plannedIncome: string
  taxRate: string
  tariffs: NewITIncomeTariff[]
}

// 新 CT 收入计划
export interface NewCTIncomeTariff {
  id: string
  productCode: string
  productFullName: string
  tariffName: string
  bandwidth: string
  orderQuantity: string
  plannedTariffAmount: string
  billingShareType: string
  billingSharePeriod: string
  plannedOrderDate: string
  mgmtProductCode: string
  mgmtProductName: string
  coaSubject: string
  paymentPlans: { id: string; milestone: string; amount: string; paymentDate: string; transferDate: string }[]
}

export interface NewCTIncomeProduct {
  id: string
  productName: string
  plannedIncome: string
  taxRate: string
  tariffs: NewCTIncomeTariff[]
}

// 通用枚举
const yesNoOptions = ['是', '否']

// IT 资费 → 税率 映射
const itTariffTaxMap: Record<string, string> = {
  '[1372]业务集成费': '6%',
  '[849]ICT维保服务费': '6%',
  '[1205]系统集成服务': '9%',
  '[956]软件开发服务': '13%'
}

// IT 资费 → 管会产品名称 映射
const itTariffMgmtNameMap: Record<string, string> = {
  '[1372]业务集成费': '业务集成服务',
  '[849]ICT维保服务费': 'ICT维保服务',
  '[1205]系统集成服务': '系统集成服务',
  '[956]软件开发服务': '软件开发服务'
}

// IT 资费 → coa科目 映射
const itTariffCoaMap: Record<string, string> = {
  '[1372]业务集成费': 'C-1372-01',
  '[849]ICT维保服务费': 'C-849-01',
  '[1205]系统集成服务': 'C-1205-01',
  '[956]软件开发服务': 'C-956-01'
}

// IT 资费名称选项
const itTariffOptions = [
  '[1372]业务集成费',
  '[849]ICT维保服务费',
  '[1205]系统集成服务',
  '[956]软件开发服务'
]

// CT 资费 → 税率 映射
const ctTariffTaxMap: Record<string, string> = {
  '[1372]宽带费': '6%',
  '[849]融合通信费': '6%',
  '[1205]专线费': '9%',
  '[956]云服务费用': '6%'
}

// CT 资费 → 管会产品名称 映射
const ctTariffMgmtNameMap: Record<string, string> = {
  '[1372]宽带费': '宽带服务',
  '[849]融合通信费': '融合通信服务',
  '[1205]专线费': '专线服务',
  '[956]云服务费用': '云服务'
}

// CT 资费 → coa科目 映射
const ctTariffCoaMap: Record<string, string> = {
  '[1372]宽带费': 'C-1372-02',
  '[849]融合通信费': 'C-849-02',
  '[1205]专线费': 'C-1205-02',
  '[956]云服务费用': 'C-956-02'
}

// CT 资费名称选项
const ctTariffOptions = [
  '[1372]宽带费',
  '[849]融合通信费',
  '[1205]专线费',
  '[956]云服务费用'
]

interface BenefitEvaluationModulesProps {
  initialHasParsedData?: boolean
}

export default function BenefitEvaluationModules({ initialHasParsedData = false }: BenefitEvaluationModulesProps) {
  const modal = useModal()
  const [hasParsedData, setHasParsedData] = useState(initialHasParsedData)
  const [activeTab, setActiveTab] = useState<'benefit' | 'businessValue'>('benefit')
  const [estimatedContractPeriod] = useState('3')

  const parseAmount = (val: string) => parseFloat((val || '0').replace(/,/g, '')) || 0

  // 新 CT 收入计划
  const [newCtIncomeList, setNewCtIncomeList] = useState<NewCTIncomeProduct[]>([
    { id: 'new-ct-product-1', productName: '互联网专线', plannedIncome: '18000', taxRate: '6%', tariffs: [] },
    { id: 'new-ct-product-2', productName: '云计算', plannedIncome: '50000', taxRate: '6%', tariffs: [] }
  ])

  // 新CT收入计划弹框状态
  const [newCtIncomeModalState, setNewCtIncomeModalState] = useState<{
    visible: boolean
    productId: string
    editingTariff: NewCTIncomeTariff | null
  }>({ visible: false, productId: '', editingTariff: null })

  // 新CT收入计划回款计划查看弹框
  const [newCtIncomeViewingPlans, setNewCtIncomeViewingPlans] = useState<{
    productId: string
    tariffId: string
  } | null>(null)

  // 新CT收入计划弹框表单
  const [newCtIncomeForm, setNewCtIncomeForm] = useState({
    productDisplay: '',
    productCode: '',
    productFullName: '',
    tariffName: '',
    bandwidth: '',
    orderQuantity: '',
    taxRate: '',
    plannedTariffAmount: '',
    billingShareType: '月',
    billingSharePeriod: '12',
    plannedOrderDate: '',
    mgmtProductCode: '',
    mgmtProductName: '',
    coaSubject: '',
    paymentPlans: [] as { id: string; milestone: string; amount: string; paymentDate: string; transferDate: string }[]
  })

  const handleNewCtIncomeTariffChange = (v: string) => {
    setNewCtIncomeForm(prev => ({
      ...prev,
      tariffName: v,
      taxRate: ctTariffTaxMap[v] || '',
      mgmtProductName: ctTariffMgmtNameMap[v] || '',
      coaSubject: ctTariffCoaMap[v] || ''
    }))
  }

  const handleNewCtIncomeProductNameChange = (v: string) => {
    const { code, name } = parseCtProductName(v)
    // 选择产品名称后仅更新产品编码/名称，不自动带出资费和税率；资费options已联动，且禁用条件已保证先选产品再选资费
    setNewCtIncomeForm(prev => ({
      ...prev,
      productDisplay: v,
      productCode: code,
      productFullName: name,
      tariffName: '',
      bandwidth: prev.bandwidth,
      orderQuantity: prev.orderQuantity,
      taxRate: prev.taxRate,
      mgmtProductName: '',
      mgmtProductCode: '',
      coaSubject: ''
    }))
  }

  const handleNewCtIncomeBillingShareTypeChange = (v: string) => {
    setNewCtIncomeForm(prev => ({
      ...prev,
      billingShareType: v,
      billingSharePeriod: v === '一次性' ? '1' : '12'
    }))
  }

  const openNewCtIncomeModal = (productId: string, tariff?: NewCTIncomeTariff) => {
    const product = newCtIncomeList.find(p => p.id === productId)
    if (!product) return
    if (tariff) {
      const { productCode, productFullName } = tariff
      const productDisplay = productCode && productFullName ? `【${productCode}】${productFullName}` : ''
      setNewCtIncomeForm({
        productDisplay,
        productCode: productCode || '',
        productFullName: productFullName || '',
        tariffName: tariff.tariffName,
        bandwidth: tariff.bandwidth || '',
        orderQuantity: tariff.orderQuantity || '',
        taxRate: ctTariffTaxMap[tariff.tariffName] || '',
        plannedTariffAmount: tariff.plannedTariffAmount,
        billingShareType: tariff.billingShareType || '月',
        billingSharePeriod: tariff.billingSharePeriod || '12',
        plannedOrderDate: tariff.plannedOrderDate || '',
        mgmtProductCode: tariff.mgmtProductCode || '',
        mgmtProductName: tariff.mgmtProductName,
        coaSubject: tariff.coaSubject,
        paymentPlans: tariff.paymentPlans || []
      })
    } else {
      setNewCtIncomeForm({
        productDisplay: '',
        productCode: '',
        productFullName: '',
        tariffName: '',
        bandwidth: '',
        orderQuantity: '',
        taxRate: product.taxRate,
        plannedTariffAmount: '',
        billingShareType: '月',
        billingSharePeriod: '12',
        plannedOrderDate: '',
        mgmtProductCode: '',
        mgmtProductName: '',
        coaSubject: '',
        paymentPlans: []
      })
    }
    setNewCtIncomeModalState({ visible: true, productId, editingTariff: tariff || null })
  }

  const closeNewCtIncomeModal = () => {
    setNewCtIncomeModalState({ visible: false, productId: '', editingTariff: null })
  }

  const submitNewCtIncomeModal = () => {
    const { productCode, productFullName, tariffName, bandwidth, orderQuantity, plannedTariffAmount, billingShareType, billingSharePeriod, plannedOrderDate, mgmtProductCode, mgmtProductName, coaSubject, paymentPlans } = newCtIncomeForm
    const product = newCtIncomeList.find(p => p.id === newCtIncomeModalState.productId)
    const showBandwidth = product ? isCtBandwidthRequired(product.productName) : false
    if (!productFullName || !tariffName || !plannedTariffAmount || !billingShareType || !billingSharePeriod || !plannedOrderDate || !orderQuantity) {
      alert('请填写必填项（产品名称、资费名称、订购数量、计划订购金额、分摊类型、分摊周期、计划订购时间）')
      return
    }
    if (showBandwidth && !bandwidth) {
      alert('请填写带宽')
      return
    }
    const tariffData: NewCTIncomeTariff = {
      id: newCtIncomeModalState.editingTariff?.id || 'new-ct-tariff-' + Date.now(),
      productCode,
      productFullName,
      tariffName,
      bandwidth: showBandwidth ? bandwidth : '',
      orderQuantity,
      plannedTariffAmount,
      billingShareType,
      billingSharePeriod,
      plannedOrderDate,
      mgmtProductCode,
      mgmtProductName,
      coaSubject,
      paymentPlans
    }
    setNewCtIncomeList(prev => prev.map(product => {
      if (product.id === newCtIncomeModalState.productId) {
        if (newCtIncomeModalState.editingTariff) {
          return {
            ...product,
            tariffs: product.tariffs.map(t => t.id === newCtIncomeModalState.editingTariff!.id ? tariffData : t)
          }
        } else {
          return { ...product, tariffs: [...product.tariffs, tariffData] }
        }
      }
      return product
    }))
    closeNewCtIncomeModal()
  }

  const deleteNewCtIncomeTariff = (productId: string, tariffId: string) => {
    modal.confirm('确定要删除该CT收入计划吗？', '确认删除').then(ok => {
      if (ok) {
        setNewCtIncomeList(prev => prev.map(product => {
          if (product.id === productId) {
            return { ...product, tariffs: product.tariffs.filter(t => t.id !== tariffId) }
          }
          return product
        }))
      }
    })
  }

  // 新 IT 收入计划
  const [newItIncomeList, setNewItIncomeList] = useState<NewITIncomeProduct[]>([
    { id: 'new-it-product-1', productName: '集成收入-信息服务', plannedIncome: '10000', taxRate: '6%', tariffs: [] },
    { id: 'new-it-product-2', productName: '集成收入-安装服务', plannedIncome: '20000', taxRate: '9%', tariffs: [] },
    { id: 'new-it-product-3', productName: '商品销售收入', plannedIncome: '5000', taxRate: '13%', tariffs: [] }
  ])

  // 新IT收入计划弹框状态
  const [newItIncomeModalState, setNewItIncomeModalState] = useState<{
    visible: boolean
    productId: string
    editingTariff: NewITIncomeTariff | null
  }>({ visible: false, productId: '', editingTariff: null })

  // 新IT收入计划回款计划查看弹框
  const [newItIncomeViewingPlans, setNewItIncomeViewingPlans] = useState<{
    productId: string
    tariffId: string
  } | null>(null)

  // 新IT收入计划弹框表单
  const [newItIncomeForm, setNewItIncomeForm] = useState({
    tariffName: '',
    taxRate: '',
    plannedTariffAmount: '',
    billingShareType: '月',
    billingSharePeriod: '12',
    plannedOrderDate: '',
    mgmtProductCode: '',
    mgmtProductName: '',
    coaSubject: '',
    paymentPlans: [] as { id: string; milestone: string; amount: string; paymentDate: string; transferDate: string }[]
  })

  const handleNewItIncomeTariffChange = (v: string) => {
    setNewItIncomeForm(prev => ({
      ...prev,
      tariffName: v,
      taxRate: itTariffTaxMap[v] || '',
      mgmtProductName: itTariffMgmtNameMap[v] || '',
      coaSubject: itTariffCoaMap[v] || ''
    }))
  }

  const handleNewItIncomeBillingShareTypeChange = (v: string) => {
    setNewItIncomeForm(prev => ({
      ...prev,
      billingShareType: v,
      billingSharePeriod: v === '一次性' ? '1' : '12'
    }))
  }

  const openNewItIncomeModal = (productId: string, tariff?: NewITIncomeTariff) => {
    const product = newItIncomeList.find(p => p.id === productId)
    if (!product) return
    if (tariff) {
      setNewItIncomeForm({
        tariffName: tariff.tariffName,
        taxRate: itTariffTaxMap[tariff.tariffName] || '',
        plannedTariffAmount: tariff.plannedTariffAmount,
        billingShareType: tariff.billingShareType || '月',
        billingSharePeriod: tariff.billingSharePeriod || '12',
        plannedOrderDate: tariff.plannedOrderDate,
        mgmtProductCode: tariff.mgmtProductCode || '',
        mgmtProductName: tariff.mgmtProductName,
        coaSubject: tariff.coaSubject,
        paymentPlans: tariff.paymentPlans || []
      })
    } else {
      setNewItIncomeForm({
        tariffName: '',
        taxRate: product.taxRate,
        plannedTariffAmount: '',
        billingShareType: '月',
        billingSharePeriod: '12',
        plannedOrderDate: '',
        mgmtProductCode: '',
        mgmtProductName: '',
        coaSubject: '',
        paymentPlans: []
      })
    }
    setNewItIncomeModalState({ visible: true, productId, editingTariff: tariff || null })
  }

  const closeNewItIncomeModal = () => {
    setNewItIncomeModalState({ visible: false, productId: '', editingTariff: null })
  }

  const submitNewItIncomeModal = () => {
    const { tariffName, plannedTariffAmount, billingShareType, billingSharePeriod, plannedOrderDate, mgmtProductCode, mgmtProductName, coaSubject, paymentPlans } = newItIncomeForm
    if (!tariffName || !plannedTariffAmount || !billingShareType || !billingSharePeriod) {
      alert('请填写必填项')
      return
    }
    const err = validatePaymentPlans(paymentPlans, plannedTariffAmount, '否', true, true, plannedOrderDate)
    if (err) {
      alert(err)
      return
    }
    const tariffData: NewITIncomeTariff = {
      id: newItIncomeModalState.editingTariff?.id || 'new-it-tariff-' + Date.now(),
      tariffName,
      plannedTariffAmount,
      billingShareType,
      billingSharePeriod,
      plannedOrderDate,
      mgmtProductCode,
      mgmtProductName,
      coaSubject,
      paymentPlans
    }
    setNewItIncomeList(prev => {
      const updatedList = prev.map(product => {
        if (product.id === newItIncomeModalState.productId) {
          if (newItIncomeModalState.editingTariff) {
            return {
              ...product,
              tariffs: product.tariffs.map(t => t.id === newItIncomeModalState.editingTariff!.id ? tariffData : t)
            }
          } else {
            return { ...product, tariffs: [...product.tariffs, tariffData] }
          }
        }
        return product
      })
      if (!newItIncomeModalState.editingTariff) {
        const product = updatedList.find(p => p.id === newItIncomeModalState.productId)
        if (product) {
          setItCostList(prevCost => {
            const existingCostProduct = prevCost.find(c => c.productName === product.productName)
            if (existingCostProduct) {
              const newCostRow: ITCostPlanRow = {
                id: 'cost-auto-' + Date.now(),
                productName: product.productName,
                plannedExpense: existingCostProduct.plannedExpense,
                taxRate: existingCostProduct.taxRate,
                tariffName: tariffData.tariffName,
                plannedTariffExpense: '',
                maxTariffAmount: tariffData.plannedTariffAmount,
                shareType: tariffData.billingShareType,
                sharePeriod: tariffData.billingSharePeriod,
                costPaymentDate: tariffData.plannedOrderDate,
                mgmtProduct: tariffData.mgmtProductName,
                coaSubject: tariffData.coaSubject,
                paymentPlans: []
              }
              return [...prevCost.filter(r => r.productName !== product.productName || r.tariffName), newCostRow].sort((a, b) => a.productName.localeCompare(b.productName))
            }
            return prevCost
          })
        }
      }
      return updatedList
    })
    closeNewItIncomeModal()
  }

  const deleteNewItIncomeTariff = (productId: string, tariffId: string) => {
    modal.confirm('确定要删除该IT收入计划吗？', '确认删除').then(ok => {
      if (ok) {
        setNewItIncomeList(prev => prev.map(product => {
          if (product.id === productId) {
            return { ...product, tariffs: product.tariffs.filter(t => t.id !== tariffId) }
          }
          return product
        }))
      }
    })
  }

  // IT 成本
  const [itCostList, setItCostList] = useState<ITCostPlanRow[]>([
    { id: 'cost-demo-1', productName: '集成收入-信息服务', plannedExpense: '5,000', taxRate: '6%', tariffName: '', plannedTariffExpense: '', maxTariffAmount: '', shareType: '', sharePeriod: '', costPaymentDate: '', mgmtProduct: '', coaSubject: '', paymentPlans: [] },
    { id: 'cost-demo-2', productName: '商品销售收入', plannedExpense: '5,000', taxRate: '13%', tariffName: '', plannedTariffExpense: '', maxTariffAmount: '', shareType: '', sharePeriod: '', costPaymentDate: '', mgmtProduct: '', coaSubject: '', paymentPlans: [] }
  ])

  const [viewingCostPlanRow, setViewingCostPlanRow] = useState<ITCostPlanRow | null>(null)
  const [editingPaymentPlans, setEditingPaymentPlans] = useState<{ id: string; amount: string; paymentDate: string }[]>([])

  // CT 成本
  const [ctCostList, setCtCostList] = useState<CTCostPlanRow[]>([
    { id: 'ct-cost-1', expenseBusinessSubject: '网络维护成本', plannedExpense: '12,000', taxRate: '6%', mgmtProduct: '维护成本', coaSubject: '-' },
    { id: 'ct-cost-2', expenseBusinessSubject: '网络维护成本', plannedExpense: '12,000', taxRate: '6%', mgmtProduct: '维护成本', coaSubject: '-' },
    { id: 'ct-cost-3', expenseBusinessSubject: '网络维护成本', plannedExpense: '12,000', taxRate: '6%', mgmtProduct: '维护成本', coaSubject: '-' }
  ])

  // IT 投资
  const [itInvestmentList, setItInvestmentList] = useState<InvestmentPlanRow[]>([
    { id: 'it-invest-1', expenseBusinessSubject: '硬件设备类投资', plannedExpense: '150,000', shareType: '-', sharePeriod: '-', taxRate: '13%', mgmtProduct: '硬件设备投资', coaSubject: '-' },
    { id: 'it-invest-2', expenseBusinessSubject: '定制软件类投资', plannedExpense: '80,000', shareType: '-', sharePeriod: '-', taxRate: '6%', mgmtProduct: '软件投资', coaSubject: '-' }
  ])

  // CT 投资
  const [ctInvestmentList] = useState<InvestmentPlanRow[]>([
    { id: 'ct-invest-1', expenseBusinessSubject: '硬件设备类投资', plannedExpense: '300,000', shareType: '-', sharePeriod: '-', taxRate: '13%', mgmtProduct: '硬件设备投资', coaSubject: '-' },
    { id: 'ct-invest-2', expenseBusinessSubject: '施工费用', plannedExpense: '50,000', shareType: '-', sharePeriod: '-', taxRate: '9%', mgmtProduct: '施工费用', coaSubject: '-' }
  ])

  // 非本项目分摊
  const [allocationList] = useState<NonProjectAllocationRow[]>([
    { id: 'alloc-1', expenseBusinessSubject: 'IT收入所对应的相关成本分摊', plannedExpense: '50,000', mgmtProduct: '-', coaSubject: '-' },
    { id: 'alloc-2', expenseBusinessSubject: 'CT收入所对应的基础网络资源的成本分摊', plannedExpense: '30,000', mgmtProduct: '-', coaSubject: '-' }
  ])

  // 综合成本
  const [comprehensiveCostList] = useState<ComprehensiveCostRow[]>([
    { id: 'comp-cost-1', expenseBusinessSubject: '综合成本分摊', plannedExpense: '20,000', taxRate: '6%', mgmtProduct: '-', coaSubject: '-' }
  ])

  // 金额计算
  const newItIncomeAmount = newItIncomeList.reduce((sum, product) => sum + parseAmount(product.plannedIncome), 0)
  const ctIncomeAmount = newCtIncomeList.reduce((sum, product) => sum + parseAmount(product.plannedIncome), 0)
  const itCostAmount = itCostList.reduce((sum, r) => sum + parseAmount(r.plannedExpense), 0)
  const ctCostAmount = ctCostList.reduce((sum, r) => sum + parseAmount(r.plannedExpense), 0)
  const comprehensiveCostAmount = comprehensiveCostList.reduce((sum, r) => sum + parseAmount(r.plannedExpense), 0)
  const itInvestmentAmount = itInvestmentList.reduce((sum, r) => sum + parseAmount(r.plannedExpense), 0)
  const ctInvestmentAmount = ctInvestmentList.reduce((sum, r) => sum + parseAmount(r.plannedExpense), 0)
  const allocationAmount = allocationList.reduce((sum, r) => sum + parseAmount(r.plannedExpense), 0)
  const totalIncome = newItIncomeAmount + ctIncomeAmount
  const totalExpense = itCostAmount + ctCostAmount + comprehensiveCostAmount + itInvestmentAmount + ctInvestmentAmount + allocationAmount

  // 业务价值评估
  const [businessValueAssessment, setBusinessValueAssessment] = useState({
    customerScale: '',
    benchmarkEffect: '',
    governmentKeyProject: '',
    fiveGApplication: '',
    marketShareImpact: '',
    otherBusinessValue: ''
  })

  const helpTips: Record<string, string> = {
    customerScale: '主要评价集团客户的级别，规模和影响力。',
    benchmarkEffect: '主要考核项目对于行业的影响作用；对CT拉动的影响作用。',
    governmentKeyProject: '主要考核政府对于项目的重视程度。',
    fiveGApplication: '主要评价项目是否涉及5G应用场景，能否复制已有的应用场景，并对5G应用场景有其他方面的扩展。',
    marketShareImpact: '主要评价项目投资对于扩大市场占有率和影响力的带动作用。',
    otherBusinessValue: '如有其他业务价值，可视需求增加，请自行补充。'
  }

  const businessValueFields = [
    { key: 'customerScale', label: '客户规模' },
    { key: 'benchmarkEffect', label: '标杆效应及对CT拉动效应分析' },
    { key: 'governmentKeyProject', label: '政府重点建设项目' },
    { key: 'fiveGApplication', label: '项目可能涉及5G应用场景的复制' },
    { key: 'marketShareImpact', label: '对市场占有率的影响' },
    { key: 'otherBusinessValue', label: '其他业务价值' }
  ]

  const handleBusinessValueChange = (key: string, value: string) => {
    if (value.length <= 250) {
      setBusinessValueAssessment(prev => ({ ...prev, [key]: value }))
    }
  }

  // 从 sessionStorage 读取解析数据
  useEffect(() => {
    const storedData = sessionStorage.getItem('benefitEvaluationParsedData')
    if (storedData) {
      try {
        const parsedData: ParsedBenefitData = JSON.parse(storedData)
        const hasData =
          parsedData.itIncome.length > 0 ||
          parsedData.ctIncome.length > 0 ||
          parsedData.itCost.length > 0 ||
          parsedData.ctCost.length > 0 ||
          parsedData.itInvestment.length > 0 ||
          parsedData.ctInvestment.length > 0 ||
          parsedData.allocation.length > 0
        if (hasData) {
          setHasParsedData(true)
          if (parsedData.ctIncome.length > 0) {
            const productMap = new Map<string, NewCTIncomeProduct>()
            parsedData.ctIncome.forEach((item, idx) => {
              const productName = item.productName || ''
              const existingProduct = productMap.get(productName)
              // 兼容：Excel里的产品类型如果在ctProductTypeProductNameMap中存在，默认取第一个产品名称
              const defaultProductDisplay = (ctProductTypeProductNameMap[productName] || [])[0] || ''
              const { code: defCode, name: defName } = parseCtProductName(defaultProductDisplay)
              const productCode = item.productCode || defCode
              const productFullName = item.productFullName || defName
              const tariff: NewCTIncomeTariff = {
                id: item.id || `parsed-ct-tariff-${idx}-${Date.now()}`,
                productCode,
                productFullName,
                tariffName: item.tariffName || '',
                bandwidth: item.bandwidth || '',
                orderQuantity: item.orderQuantity || '',
                plannedTariffAmount: item.planIncome || '',
                billingShareType: item.billingShareType || '月',
                billingSharePeriod: item.billingSharePeriod || '12',
                plannedOrderDate: item.planOrderTime || '',
                mgmtProductCode: item.mgmtProductCode || '',
                mgmtProductName: item.mgmtProductName || '',
                coaSubject: item.coaSubject || '',
                paymentPlans: []
              }
              if (existingProduct) {
                existingProduct.tariffs.push(tariff)
              } else {
                productMap.set(productName, {
                  id: `parsed-ct-product-${idx}-${Date.now()}`,
                  productName,
                  plannedIncome: item.planIncome || '',
                  taxRate: item.taxRate || '',
                  tariffs: [tariff]
                })
              }
            })
            setNewCtIncomeList(Array.from(productMap.values()))
          }

          if (parsedData.ctCost.length > 0) {
            const mapped: CTCostPlanRow[] = parsedData.ctCost.map((item, idx) => ({
              id: item.id || `parsed-ct-cost-${idx}-${Date.now()}`,
              expenseBusinessSubject: item.expendProductName || '',
              plannedExpense: item.plannedExpense || item.billingAmount || '',
              taxRate: item.taxRate || '',
              mgmtProduct: '',
              coaSubject: ''
            }))
            setCtCostList(mapped)
          }
          if (parsedData.itInvestment.length > 0) {
            const mapped: InvestmentPlanRow[] = parsedData.itInvestment.map((item, idx) => ({
              id: item.id || `parsed-it-inv-${idx}-${Date.now()}`,
              expenseBusinessSubject: item.expendProductName || '',
              plannedExpense: item.plannedExpense || item.planInvestAmount || '',
              shareType: item.reimbursementMethod || '',
              sharePeriod: item.reimbursementPeriod || '',
              taxRate: item.taxRate || '',
              mgmtProduct: '',
              coaSubject: ''
            }))
            setItInvestmentList(mapped)
          }
        }
        sessionStorage.removeItem('benefitEvaluationParsedData')
      } catch (e) {
        console.error('解析数据读取失败', e)
      }
    }
  }, [])

  // 计算 IT 成本合并信息
  const itCostMergeInfo: { productName: { rowSpan: number; show: boolean }[]; plannedExpense: { rowSpan: number; show: boolean }[]; taxRate: { rowSpan: number; show: boolean }[] } = {
    productName: [],
    plannedExpense: [],
    taxRate: []
  }
  {
    let i = 0
    while (i < itCostList.length) {
      const currentProductName = itCostList[i].productName
      let count = 1
      while (i + count < itCostList.length && itCostList[i + count].productName === currentProductName) {
        count++
      }
      for (let j = 0; j < count; j++) {
        itCostMergeInfo.productName.push({ rowSpan: count, show: j === 0 })
        itCostMergeInfo.plannedExpense.push({ rowSpan: count, show: j === 0 })
        itCostMergeInfo.taxRate.push({ rowSpan: count, show: j === 0 })
      }
      i += count
    }
  }

  return (
    <div className="space-y-3">
      {/* 财务价值评估 + 业务价值评估（标签页） */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('benefit')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'benefit' ? 'text-[#1677FF] bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                财务价值评估
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('businessValue')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'businessValue' ? 'text-[#1677FF] bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                业务价值评估
              </button>
            </div>
          </div>
          {activeTab === 'benefit' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-md border border-green-100">
                <span className="text-xs text-gray-500">项目总收入</span>
                <span className="text-sm font-semibold text-green-600">¥{totalIncome.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 rounded-md border border-red-100">
                <span className="text-xs text-gray-500">项目总支出</span>
                <span className="text-sm font-semibold text-red-600">¥{totalExpense.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-md border border-blue-100">
                <span className="text-xs text-gray-500">预估合同期</span>
                <span className="text-sm font-semibold text-[#1677FF]">{estimatedContractPeriod}</span>
                <span className="text-xs text-gray-500">年</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-3">
          {activeTab === 'benefit' ? (
            <div className="space-y-2">
              <div className="grid grid-cols-6 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg border border-emerald-100 bg-emerald-50/30">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-emerald-600 text-sm font-bold">¥</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-bold text-emerald-700">{newItIncomeAmount.toLocaleString()}<span className="text-xs font-medium ml-0.5">元</span></div>
                    <div className="text-[10px] text-emerald-600/70">IT收入</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-emerald-100 bg-emerald-50/30">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-emerald-600 text-sm font-bold">¥</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-bold text-emerald-700">{ctIncomeAmount.toLocaleString()}<span className="text-xs font-medium ml-0.5">元</span></div>
                    <div className="text-[10px] text-emerald-600/70">CT收入</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg border border-rose-100 bg-rose-50/30">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <span className="text-rose-600 text-sm font-bold">¥</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-bold text-rose-700">{itCostAmount.toLocaleString()}<span className="text-xs font-medium">元</span></div>
                    <div className="text-[10px] text-rose-600/70">IT成本支出</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-rose-100 bg-rose-50/30">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <span className="text-rose-600 text-sm font-bold">¥</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-bold text-rose-700">{ctCostAmount.toLocaleString()}<span className="text-xs font-medium">元</span></div>
                    <div className="text-[10px] text-rose-600/70">CT成本支出</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-rose-100 bg-rose-50/30">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <span className="text-rose-600 text-sm font-bold">¥</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-bold text-rose-700">{comprehensiveCostAmount.toLocaleString()}<span className="text-xs font-medium">元</span></div>
                    <div className="text-[10px] text-rose-600/70">综合成本支出</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-rose-100 bg-rose-50/30">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <span className="text-rose-600 text-sm font-bold">¥</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-bold text-rose-700">{itInvestmentAmount.toLocaleString()}<span className="text-xs font-medium">元</span></div>
                    <div className="text-[10px] text-rose-600/70">IT投资支出</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-rose-100 bg-rose-50/30">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <span className="text-rose-600 text-sm font-bold">¥</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-bold text-rose-700">{ctInvestmentAmount.toLocaleString()}<span className="text-xs font-medium">元</span></div>
                    <div className="text-[10px] text-rose-600/70">CT投资支出</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg border border-rose-100 bg-rose-50/30">
                  <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <span className="text-rose-600 text-sm font-bold">¥</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-sm font-bold text-rose-700">{allocationAmount.toLocaleString()}<span className="text-xs font-medium">元</span></div>
                    <div className="text-[10px] text-rose-600/70">非项目类支出成本分摊</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '动态回收期（年）', tag: '基础指标', value: '0.00' },
                  { label: '静态回收期（年）', tag: '基础指标', value: '0.00' },
                  { label: '净现值（元）', tag: '基础指标', value: '9,653.33' },
                  { label: '净现值率（%）', tag: '基础指标', value: '132.60%' },
                  { label: '项目整体毛利（元）', tag: '辅助指标', value: '282,800.00' },
                  { label: '项目整体利润率（%）', tag: '辅助指标', value: '56.56%' },
                  { label: 'IT部分毛利（元）', tag: '辅助指标', value: '7,590.00' },
                  { label: 'IT部分利润率（%）', tag: '辅助指标', value: '7.59%' },
                  { label: '项目通服毛利（元）', tag: '辅助指标', value: '282,800.00' },
                  { label: '项目通服利润率（%）', tag: '辅助指标', value: '56.56%' },
                  { label: '内部收益率（%）', tag: '基础指标', value: '99,999.00%' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-md hover:bg-gray-50/50 transition-colors">
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">{item.tag}</span>
                      <span className="text-sm font-medium text-gray-800">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {businessValueFields.map((field) => (
                <div key={field.key} className="flex items-start gap-2">
                  <div className="flex items-center justify-end w-56 shrink-0 pt-1.5">
                    <span className="text-sm text-gray-700 whitespace-nowrap">{field.label}</span>
                    <div className="relative ml-1 group shrink-0">
                      <HelpCircle className="w-3.5 h-3.5 text-yellow-500 cursor-help" />
                      <div className="absolute top-full left-0 mt-1 w-72 p-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-pre-wrap">
                        {helpTips[field.key]}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <textarea
                      value={businessValueAssessment[field.key as keyof typeof businessValueAssessment]}
                      onChange={(e) => handleBusinessValueChange(field.key, e.target.value)}
                      placeholder={`请输入${field.label}`}
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 resize-none"
                      rows={1}
                    />
                    <span className="text-xs text-gray-400 shrink-0">
                      {businessValueAssessment[field.key as keyof typeof businessValueAssessment].length}/250
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* IT 收入计划 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">IT收入计划</h3>
            <span className="text-xs text-gray-400">【{newItIncomeList.length}】</span>
          </div>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                  <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody>
                {newItIncomeList.map((product) => {
                  const rowCount = product.tariffs.length + 1
                  return (
                    <NewITIncomeRows
                      key={product.id}
                      product={product}
                      rowCount={rowCount}
                      onOpenModal={openNewItIncomeModal}
                      onDelete={deleteNewItIncomeTariff}
                      onViewPlans={(tariffId) => setNewItIncomeViewingPlans({ productId: product.id, tariffId })}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{newItIncomeAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CT 收入计划 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">CT收入计划</h3>
            <span className="text-xs text-gray-400">【{newCtIncomeList.length}】</span>
          </div>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品类型</th>
                  <th className="px-3 py-2.5 text-right font-medium whitespace-nowrap">概算收入金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">带宽（M）</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">订购数量</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划订购时间</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                  <th className="px-3 py-2.5 text-center font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody>
                {newCtIncomeList.map((product) => {
                  const rowCount = product.tariffs.length + 1
                  return (
                    <NewCTIncomeRows
                      key={product.id}
                      product={product}
                      rowCount={rowCount}
                      onOpenModal={openNewCtIncomeModal}
                      onDelete={deleteNewCtIncomeTariff}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">概算收入合计（含税）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{ctIncomeAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* IT 成本计划 */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
            <h3 className="text-sm font-semibold text-gray-800">IT成本计划</h3>
            <span className="text-xs text-gray-400">【{itCostList.length}】</span>
          </div>
        </div>
        <div className="p-4">
          <div className="overflow-x-auto border border-gray-100 rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-xs">
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">产品名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">概算支出金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">税率</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">资费名称</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">计划支出金额</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊类型</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">分摊周期</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">
                    <div className="relative inline-flex items-center gap-1 group">
                      <span>计划成本列支时间</span>
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1.5 z-20 px-3 py-2 bg-gray-800 text-white text-xs rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none whitespace-nowrap">
                        包含通过计提方式和报账方式入账的成本列支时间
                        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-800" />
                      </div>
                    </div>
                  </th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">管会产品</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">COA科目</th>
                  <th className="px-3 py-2.5 text-left font-medium whitespace-nowrap">操作</th>
                </tr>
              </thead>
              <tbody>
                {itCostList.map((row, idx) => (
                  <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                    {itCostMergeInfo.productName[idx].show && (
                      <td rowSpan={itCostMergeInfo.productName[idx].rowSpan} className="px-3 py-2.5 text-gray-700 whitespace-nowrap border-r border-gray-100">{row.productName}</td>
                    )}
                    {itCostMergeInfo.plannedExpense[idx].show && (
                      <td rowSpan={itCostMergeInfo.plannedExpense[idx].rowSpan} className="px-3 py-2.5 text-gray-700 whitespace-nowrap border-r border-gray-100">{row.plannedExpense}</td>
                    )}
                    {itCostMergeInfo.taxRate[idx].show && (
                      <td rowSpan={itCostMergeInfo.taxRate[idx].rowSpan} className="px-3 py-2.5 text-gray-700 whitespace-nowrap border-r border-gray-100">{row.taxRate}</td>
                    )}
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.tariffName}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {row.tariffName && (
                        <input
                          type="number"
                          value={row.plannedTariffExpense}
                          onChange={e => {
                            const val = e.target.value
                            setItCostList(prev => prev.map(r => r.id === row.id ? { ...r, plannedTariffExpense: val } : r))
                          }}
                          className="w-full px-2 py-1 text-sm text-gray-700 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        />
                      )}
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <select
                        value={row.shareType}
                        onChange={e => {
                          const val = e.target.value
                          setItCostList(prev => prev.map(r => r.id === row.id ? { ...r, shareType: val } : r))
                        }}
                        className="px-2 py-1 text-sm text-gray-700 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
                      >
                        <option value="">请选择</option>
                        <option value="一次性">一次性</option>
                        <option value="月">月</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <input
                        type="number"
                        value={row.sharePeriod}
                        onChange={e => {
                          const val = e.target.value
                          setItCostList(prev => prev.map(r => r.id === row.id ? { ...r, sharePeriod: val } : r))
                        }}
                        className="w-20 px-2 py-1 text-sm text-gray-700 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.costPaymentDate}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.mgmtProduct}</td>
                    <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row.coaSubject}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {parseFloat(row.plannedTariffExpense) > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setViewingCostPlanRow(row)
                            setEditingPaymentPlans(row.paymentPlans || [])
                          }}
                          className="px-2 py-1 text-xs text-[#1677FF] hover:underline"
                        >
                          付款计划
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-sm font-semibold text-gray-800">概算支出合计（含税）：</span>
              <span className="text-base font-semibold text-[#1677FF]">¥{itCostAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CT 成本计划 */}
      <SimpleTableCard
        title="CT成本计划"
        label="概算支出合计（含税）"
        count={ctCostList.length}
        total={ctCostAmount}
        columns={[
          { key: 'expenseBusinessSubject', label: '支出业务科目' },
          { key: 'plannedExpense', label: '概算支出金额' },
          { key: 'taxRate', label: '税率' },
          { key: 'coaSubject', label: 'COA科目' }
        ]}
        data={ctCostList}
      />

      {/* 综合成本计划 */}
      <SimpleTableCard
        title="综合成本计划"
        label="概算支出合计（含税）"
        count={comprehensiveCostList.length}
        total={comprehensiveCostAmount}
        columns={[
          { key: 'expenseBusinessSubject', label: '支出业务科目' },
          { key: 'plannedExpense', label: '概算支出金额' },
          { key: 'taxRate', label: '税率' },
          { key: 'coaSubject', label: 'COA科目' }
        ]}
        data={comprehensiveCostList}
      />

      {/* IT 投资计划 */}
      <SimpleTableCard
        title="IT投资计划"
        count={itInvestmentList.length}
        total={itInvestmentAmount}
        columns={[
          { key: 'expenseBusinessSubject', label: '支出业务科目' },
          { key: 'plannedExpense', label: '概算支出金额' },
          { key: 'taxRate', label: '税率' },
          { key: 'coaSubject', label: 'COA科目' }
        ]}
        data={itInvestmentList}
      />

      {/* CT 投资计划 */}
      <SimpleTableCard
        title="CT投资计划"
        count={ctInvestmentList.length}
        total={ctInvestmentAmount}
        columns={[
          { key: 'expenseBusinessSubject', label: '支出业务科目' },
          { key: 'plannedExpense', label: '概算支出金额' },
          { key: 'taxRate', label: '税率' },
          { key: 'coaSubject', label: 'COA科目' }
        ]}
        data={ctInvestmentList}
      />

      {/* 非本项目支出成本分摊计划 */}
      <SimpleTableCard
        title="非本项目支出成本分摊计划"
        count={allocationList.length}
        total={allocationAmount}
        columns={[
          { key: 'expenseBusinessSubject', label: '支出业务科目' },
          { key: 'plannedExpense', label: '概算支出金额' },
          { key: 'coaSubject', label: 'COA科目' }
        ]}
        data={allocationList}
      />

      {/* 付款计划弹框（IT成本计划） */}
      {viewingCostPlanRow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                <h3 className="text-sm font-semibold text-gray-800">付款计划明细</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPaymentPlans(prev => [...prev, { id: 'plan-' + Date.now(), amount: '', paymentDate: '' }])}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  付款计划新增
                </button>
                <button type="button" onClick={() => setViewingCostPlanRow(null)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              <PaymentPlanCostDisplay
                value={editingPaymentPlans}
                onChange={setEditingPaymentPlans}
                totalAmount={viewingCostPlanRow.plannedTariffExpense || viewingCostPlanRow.plannedExpense}
                hideHeader
              />
              {/* 合计：放在表格卡片外面的右下角 */}
              <div className="mt-3 flex justify-end items-baseline gap-2">
                <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">合计：</span>
                <span className="text-lg font-semibold text-[#1677FF] whitespace-nowrap tabular-nums">
                  {editingPaymentPlans.reduce((acc, curr) => acc + (parseFloat(curr.amount.replace(/,/g, '')) || 0), 0).toLocaleString()}
                </span>
                <span className="text-sm font-medium text-gray-500 whitespace-nowrap tabular-nums">
                  / {(() => {
                    const total = parseFloat((viewingCostPlanRow.plannedTariffExpense || viewingCostPlanRow.plannedExpense).replace(/,/g, '')) || 0
                    return total.toLocaleString()
                  })()}
                </span>
              </div>
            </div>
            <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
              <button type="button" onClick={() => setViewingCostPlanRow(null)} className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4" />取消
              </button>
              <button
                type="button"
                onClick={() => {
                  setItCostList(prev => prev.map(r => r.id === viewingCostPlanRow.id ? { ...r, paymentPlans: editingPaymentPlans } : r))
                  setViewingCostPlanRow(null)
                }}
                className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新IT收入计划新增/修改弹框 */}
      {newItIncomeModalState.visible && (
        <ModalShell
          title={newItIncomeModalState.editingTariff ? 'IT收入计划修改' : 'IT收入计划新增'}
          onClose={closeNewItIncomeModal}
        >
          <div className="grid grid-cols-2 gap-x-5 gap-y-4">
            <FormRow label="产品名称" required>
              <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                {newItIncomeList.find(p => p.id === newItIncomeModalState.productId)?.productName}
              </div>
            </FormRow>
            <FormRow label="税率" required>
              <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                {newItIncomeForm.taxRate || '请先选择资费名称'}
              </div>
            </FormRow>
            <FormRow label="资费名称" required>
              <SearchableSelect value={newItIncomeForm.tariffName} onChange={handleNewItIncomeTariffChange} options={itTariffOptions} />
            </FormRow>
            <FormRow label="计划订购金额" required>
              {newItIncomeModalState.editingTariff ? (
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {newItIncomeForm.plannedTariffAmount || '-'}
                </div>
              ) : (
                <NumberInput
                  value={newItIncomeForm.plannedTariffAmount}
                  onChange={(v) => setNewItIncomeForm({ ...newItIncomeForm, plannedTariffAmount: v })}
                  placeholder="请输入金额"
                />
              )}
            </FormRow>
            <FormRow label="分摊类型" required>
              <SegmentedSelect value={newItIncomeForm.billingShareType} onChange={handleNewItIncomeBillingShareTypeChange} options={['一次性', '月']} />
            </FormRow>
            <FormRow label="分摊周期" required>
              <input
                type="text"
                value={newItIncomeForm.billingSharePeriod}
                onChange={(e) => {
                  if (newItIncomeForm.billingShareType !== '一次性') {
                    setNewItIncomeForm({ ...newItIncomeForm, billingSharePeriod: e.target.value })
                  }
                }}
                disabled={newItIncomeForm.billingShareType === '一次性'}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 ${newItIncomeForm.billingShareType === '一次性' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                placeholder="请输入周期"
              />
            </FormRow>
            <FormRow label="计划订购时间" required>
              <DateInput value={newItIncomeForm.plannedOrderDate} onChange={(v) => setNewItIncomeForm({ ...newItIncomeForm, plannedOrderDate: v })} />
            </FormRow>
            <FormRow label="管会产品">
              <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                {newItIncomeForm.mgmtProductName ? `${newItIncomeForm.mgmtProductCode || ''} ${newItIncomeForm.mgmtProductName}` : '-'}
              </div>
            </FormRow>
            <FormRow label="COA科目">
              <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                {newItIncomeForm.coaSubject || '-'}
              </div>
            </FormRow>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <PaymentPlanSection
              value={newItIncomeForm.paymentPlans}
              onChange={(plans) => setNewItIncomeForm({ ...newItIncomeForm, paymentPlans: plans })}
              plannedIncome={newItIncomeForm.plannedTariffAmount}
              milestones={defaultMilestones}
              hideTransferDate
              hideMilestoneName
              plannedOrderDate={newItIncomeForm.plannedOrderDate || ''}
            />
          </div>

          <ModalFooter onCancel={closeNewItIncomeModal} onSubmit={submitNewItIncomeModal} />
        </ModalShell>
      )}

      {/* 新IT收入计划回款计划查看弹框（可编辑） */}
      {newItIncomeViewingPlans && (() => {
        const product = newItIncomeList.find(p => p.id === newItIncomeViewingPlans.productId)
        const tariff = product?.tariffs.find(t => t.id === newItIncomeViewingPlans.tariffId)
        if (!product || !tariff) return null
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
                  <h3 className="text-sm font-semibold text-gray-800">回款计划明细</h3>
                </div>
                <button type="button" onClick={() => setNewItIncomeViewingPlans(null)} className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
                <PaymentPlanCostDisplay
                  value={tariff.paymentPlans || []}
                  onChange={(plans) => {
                    setNewItIncomeList(prev => prev.map(p => p.id === product.id ? {
                      ...p,
                      tariffs: p.tariffs.map(t => t.id === tariff.id ? { ...t, paymentPlans: plans } : t)
                    } : p))
                  }}
                  totalAmount={tariff.plannedTariffAmount || ''}
                  plannedIncome={product.plannedIncome}
                  hideHeader
                />
                {/* 合计：放在表格卡片外面的右下角 */}
                <div className="mt-3 flex justify-end items-baseline gap-2">
                  <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">合计：</span>
                  <span className="text-lg font-semibold text-[#1677FF] whitespace-nowrap tabular-nums">
                    {(tariff.paymentPlans || []).reduce((acc, p) => acc + (parseFloat(p.amount.replace(/,/g, '')) || 0), 0).toLocaleString()}
                  </span>
                  <span className="text-sm font-medium text-gray-500 whitespace-nowrap tabular-nums">
                    / {(parseFloat((tariff.plannedTariffAmount || '').replace(/,/g, '')) || 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-100">
                <button type="button" onClick={() => setNewItIncomeViewingPlans(null)} className="px-6 py-2 text-sm text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4" />关闭
                </button>
                <button type="button" onClick={() => setNewItIncomeViewingPlans(null)} className="px-6 py-2 text-sm text-white bg-[#1677FF] rounded-md hover:bg-[#1668DD] transition-colors flex items-center gap-1.5">
                  <Check className="w-4 h-4" />确认
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* 新CT收入计划新增/修改弹框 */}
      {newCtIncomeModalState.visible && (() => {
        const modalProduct = newCtIncomeList.find(p => p.id === newCtIncomeModalState.productId)
        const showBandwidth = modalProduct ? isCtBandwidthRequired(modalProduct.productName) : false
        const productNameOptions = modalProduct ? (ctProductTypeProductNameMap[modalProduct.productName] || []) : []
        const tariffOptions = newCtIncomeForm.productDisplay && ctProductNameTariffMap[newCtIncomeForm.productDisplay]
          ? ctProductNameTariffMap[newCtIncomeForm.productDisplay]
          : ctTariffOptions
        const tariffDisabled = !newCtIncomeForm.productDisplay && !modalProduct
        return (
          <ModalShell
            title={newCtIncomeModalState.editingTariff ? 'CT收入计划修改' : 'CT收入计划新增'}
            onClose={closeNewCtIncomeModal}
          >
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <FormRow label="产品类型" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {modalProduct?.productName}
                </div>
              </FormRow>
              <FormRow label="税率" required>
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {newCtIncomeForm.taxRate || '请先选择资费名称'}
                </div>
              </FormRow>
              <FormRow label="产品名称" required>
                <SearchableSelect
                  value={newCtIncomeForm.productDisplay}
                  onChange={handleNewCtIncomeProductNameChange}
                  options={productNameOptions}
                  placeholder={modalProduct?.productName ? '请选择产品名称' : '请先选择产品类型'}
                />
              </FormRow>
              <FormRow label="资费名称" required>
                <SearchableSelect
                  value={newCtIncomeForm.tariffName}
                  onChange={handleNewCtIncomeTariffChange}
                  options={tariffOptions}
                  disabled={tariffDisabled}
                  placeholder={tariffDisabled ? '请先选择产品名称' : '请选择资费名称'}
                />
              </FormRow>
              {showBandwidth && (
                <FormRow label="带宽（M）" required>
                  <input
                    type="text"
                    value={newCtIncomeForm.bandwidth}
                    onChange={(e) => setNewCtIncomeForm({ ...newCtIncomeForm, bandwidth: e.target.value })}
                    placeholder="请输入带宽"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
                  />
                </FormRow>
              )}
              <FormRow label="订购数量" required>
                <NumberInput
                  value={newCtIncomeForm.orderQuantity}
                  onChange={(v) => setNewCtIncomeForm({ ...newCtIncomeForm, orderQuantity: v })}
                  placeholder="请输入订购数量"
                />
              </FormRow>
              <FormRow label="计划订购金额" required>
                <NumberInput
                  value={newCtIncomeForm.plannedTariffAmount}
                  onChange={(v) => setNewCtIncomeForm({ ...newCtIncomeForm, plannedTariffAmount: v })}
                  placeholder="请输入金额"
                />
              </FormRow>
              <FormRow label="分摊类型" required>
                <SegmentedSelect value={newCtIncomeForm.billingShareType} onChange={handleNewCtIncomeBillingShareTypeChange} options={['一次性', '月']} />
              </FormRow>
              <FormRow label="分摊周期" required>
                <input
                  type="text"
                  value={newCtIncomeForm.billingSharePeriod}
                  onChange={(e) => {
                    if (newCtIncomeForm.billingShareType !== '一次性') {
                      setNewCtIncomeForm({ ...newCtIncomeForm, billingSharePeriod: e.target.value })
                    }
                  }}
                  disabled={newCtIncomeForm.billingShareType === '一次性'}
                  className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 ${newCtIncomeForm.billingShareType === '一次性' ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                  placeholder="请输入周期"
                />
              </FormRow>
              <FormRow label="计划订购时间" required>
                <MonthPicker
                  value={newCtIncomeForm.plannedOrderDate}
                  onChange={(v) => setNewCtIncomeForm({ ...newCtIncomeForm, plannedOrderDate: v })}
                />
              </FormRow>
              <FormRow label="管会产品">
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {newCtIncomeForm.mgmtProductName ? `${newCtIncomeForm.mgmtProductCode || ''} ${newCtIncomeForm.mgmtProductName}` : '-'}
                </div>
              </FormRow>
              <FormRow label="COA科目">
                <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                  {newCtIncomeForm.coaSubject || '-'}
                </div>
              </FormRow>
            </div>

            <ModalFooter onCancel={closeNewCtIncomeModal} onSubmit={submitNewCtIncomeModal} />
          </ModalShell>
        )
      })()}
    </div>
  )
}

// 新IT收入计划行
function NewITIncomeRows({
  product,
  rowCount,
  onOpenModal,
  onDelete,
  onViewPlans
}: {
  product: NewITIncomeProduct
  rowCount: number
  onOpenModal: (productId: string, tariff?: NewITIncomeTariff) => void
  onDelete: (productId: string, tariffId: string) => void
  onViewPlans: (tariffId: string) => void
}) {
  if (product.tariffs.length === 0) {
    return (
      <tr className="border-t border-gray-100 hover:bg-gray-50/50">
        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{product.productName}</td>
        <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{product.plannedIncome}</td>
        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{product.taxRate}</td>
        <td className="px-3 py-2.5 text-center whitespace-nowrap" colSpan={8}>
          <button onClick={() => onOpenModal(product.id)} className="inline-flex items-center gap-1 px-4 py-1.5 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 hover:border-blue-200 transition-colors">
            <Plus className="w-3 h-3" />补充资费
          </button>
        </td>
      </tr>
    )
  }
  return (
    <>
      {product.tariffs.map((tariff, idx) => (
        <tr key={tariff.id} className="border-t border-gray-100 hover:bg-gray-50/50">
          {idx === 0 && (
            <>
              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{product.productName}</td>
              <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{product.plannedIncome}</td>
              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{product.taxRate}</td>
            </>
          )}
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.tariffName}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.plannedTariffAmount}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.billingShareType}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.billingSharePeriod}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.plannedOrderDate}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.mgmtProductName}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.coaSubject}</td>
          <td className="px-3 py-2.5 text-center whitespace-nowrap">
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => onOpenModal(product.id, tariff)} className="text-gray-500 hover:text-[#1677FF]" title="编辑">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(product.id, tariff.id)} className="text-gray-500 hover:text-red-500" title="删除">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onViewPlans(tariff.id)} className="px-2 py-1 text-xs text-[#1677FF] hover:underline">回款计划</button>
            </div>
          </td>
        </tr>
      ))}
      <tr key={`add-${product.id}`} className="border-t border-gray-100 hover:bg-gray-50/50">
        <td className="px-3 py-2.5 text-center whitespace-nowrap" colSpan={8}>
          <button onClick={() => onOpenModal(product.id)} className="inline-flex items-center gap-1 px-4 py-1.5 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 hover:border-blue-200 transition-colors">
            <Plus className="w-3 h-3" />补充资费
          </button>
        </td>
      </tr>
    </>
  )
}

// CT收入计划表格行组件
function NewCTIncomeRows({
  product,
  rowCount,
  onOpenModal,
  onDelete
}: {
  product: NewCTIncomeProduct
  rowCount: number
  onOpenModal: (productId: string, tariff?: NewCTIncomeTariff) => void
  onDelete: (productId: string, tariffId: string) => void
}) {
  const showBandwidth = isCtBandwidthRequired(product.productName)
  if (product.tariffs.length === 0) {
    return (
      <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50/50">
        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{product.productName}</td>
        <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap">{product.plannedIncome}</td>
        <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{product.taxRate}</td>
        <td className="px-3 py-2.5 text-center whitespace-nowrap" colSpan={11}>
          <button onClick={() => onOpenModal(product.id)} className="inline-flex items-center gap-1 px-4 py-1.5 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 hover:border-blue-200 transition-colors">
            <Plus className="w-3 h-3" />补充资费
          </button>
        </td>
      </tr>
    )
  }
  return (
    <>
      {product.tariffs.map((tariff, idx) => (
        <tr key={tariff.id} className="border-t border-gray-100 hover:bg-gray-50/50">
          {idx === 0 && (
            <>
              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{product.productName}</td>
              <td className="px-3 py-2.5 text-gray-700 text-right whitespace-nowrap" rowSpan={rowCount}>{product.plannedIncome}</td>
              <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap" rowSpan={rowCount}>{product.taxRate}</td>
            </>
          )}
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
            {tariff.productFullName ? `【${tariff.productCode || '-'}】${tariff.productFullName}` : '-'}
          </td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.tariffName}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{showBandwidth ? tariff.bandwidth : ''}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.orderQuantity}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.plannedTariffAmount}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.billingShareType}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.billingSharePeriod}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.plannedOrderDate}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.mgmtProductName}</td>
          <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{tariff.coaSubject}</td>
          <td className="px-3 py-2.5 text-center whitespace-nowrap">
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => onOpenModal(product.id, tariff)} className="text-gray-500 hover:text-[#1677FF]" title="编辑">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(product.id, tariff.id)} className="text-gray-500 hover:text-red-500" title="删除">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>
      ))}
      <tr key={`add-${product.id}`} className="border-t border-gray-100 hover:bg-gray-50/50">
        <td className="px-3 py-2.5 text-center whitespace-nowrap" colSpan={11}>
          <button onClick={() => onOpenModal(product.id)} className="inline-flex items-center gap-1 px-4 py-1.5 text-xs text-[#1677FF] bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 hover:border-blue-200 transition-colors">
            <Plus className="w-3 h-3" />补充资费
          </button>
        </td>
      </tr>
    </>
  )
}

// 简单表格卡片
function SimpleTableCard<T extends Record<string, any>>({
  title,
  label = '概算支出合计（含税）',
  count,
  total,
  columns,
  data
}: {
  title: string
  label?: string
  count: number
  total: number
  columns: { key: string; label: string }[]
  data: T[]
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 bg-[#1677FF] rounded-sm" />
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <span className="text-xs text-gray-400">【{count}】</span>
        </div>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto border border-gray-100 rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs">
                {columns.map(col => (
                  <th key={col.key} className="px-3 py-2.5 text-left font-medium whitespace-nowrap">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(row => (
                <tr key={row.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                  {columns.map(col => (
                    <td key={col.key} className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{row[col.key] || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-sm font-semibold text-gray-800">{label}：</span>
            <span className="text-base font-semibold text-[#1677FF]">¥{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
