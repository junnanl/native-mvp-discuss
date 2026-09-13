import * as XLSX from 'xlsx'
import {
  itTariffTaxMap,
  itTariffMgmtNameMap,
  itTariffCoaMap,
  ctTariffTaxMap,
  ctTariffMgmtNameMap,
  ctTariffCoaMap,
  ctTariffThirdSubjectMap,
  businessSubjectMap
} from '@/components/plan-modules/constants'

/**
 * 效益预评估模型.xlsx 解析器
 * 仅解析"收入支出明细表（基础数据表）"sheet
 * 
 * 模板结构：
 * - A列(索引0): 大分类（收入、投资支出（Capex）、成本支出（Opex）、非本项目新增支出成本分摊）
 * - B列(索引1): 二级分类（IT类收入、CT类收入、IT类投资、CT类投资、IT类成本、CT类成本）
 * - C列(索引2): 三级分类（具体产品/内容名称）
 * - D列(索引3): 类型（收入、支出、收款进度-金额、收款进度-比例、付款进度-金额、付款进度-比例）
 * - E列(索引4): 具体内容（资费名称/支出类型等）
 * - F列(索引5): 增值税率（小数格式，如0.06）
 * - G列(索引6): 金额（含税）合计
 * - H列(索引7): 期初
 * - I列(索引8): 第1年
 * - J列(索引9): 第2年
 * - K列(索引10): 第3年
 * - ...以此类推
 */

export interface ParsedBenefitData {
  itIncome: ParsedITIncomeRow[]
  ctIncome: ParsedCTIncomeRow[]
  itCost: ParsedCostRow[]
  ctCost: ParsedCostRow[]
  agentPayable: ParsedCostRow[]
  itInvestment: ParsedInvestmentRow[]
  ctInvestment: ParsedInvestmentRow[]
  allocation: ParsedAllocationRow[]
}

interface ParsedITIncomeRow {
  id: string
  productName: string
  tariffName: string
  mgmtProductCode: string
  mgmtProductName: string
  thirdLevelSubject: string
  coaSubject: string
  taxRate: string
  isFixedRate: string
  planIncome: string
  contractStage: string
  billingShareType: string
  billingCycle: string
  isContractAsset: string
  planOrderTime: string
  billingStartDate: string
}

interface ParsedCTIncomeRow {
  id: string
  productName: string
  packageName: string
  bandwidth: string
  orderQuantity: string
  tariffName: string
  planIncome: string
  taxRate: string
  discount: string
  billingShareType: string
  billingSharePeriod: string
  billingStartDate: string
  mgmtProductCode: string
  mgmtProductName: string
  thirdLevelSubject: string
  coaSubject: string
  planOrderTime: string
}

interface ParsedCostRow {
  id: string
  expendProductName: string
  expendType: string
  correspondTariff: string
  taxRate: string
  billingTime: string
  billingAmount: string
  billingStartTime: string
  budgetType: string
  plannedExpense: string
  reimbursementMethod: string
  reimbursementPeriod: string
  reimbursementStartDate: string
  contractStage: string
  businessSubject: string
}

interface ParsedInvestmentRow {
  id: string
  investCode: string
  correspondTariff: string
  expendProductName: string
  expendType: string
  taxRate: string
  planInvestAmount: string
  investTime: string
  investmentType: string
  plannedExpense: string
  reimbursementMethod: string
  reimbursementPeriod: string
  reimbursementStartDate: string
  contractStage: string
  businessSubject: string
}

interface ParsedAllocationRow {
  id: string
  allocationType: string
  allocationAmount: string
  allocationStartTime: string
  allocationContent: string
  allocationDesc: string
  allocationMethod: string
  allocationPeriod: string
}

// B列二级分类 → 模块映射
const MODULE_MAP: Record<string, string> = {
  'IT类收入': 'it-income',
  'CT类收入': 'ct-income',
  'IT类投资': 'it-investment',
  'CT类投资': 'ct-investment',
  'IT类成本': 'it-cost',
  'CT类成本': 'ct-cost'
}

// 需要跳过的行（合计行等）
const SKIP_PATTERNS = [
  '合计',
  '项目收入合计',
  '项目支出合计',
  '综合类成本',
  '通信及信息服务收入合计',
  '通信业务收入'
]

/**
 * 解析xlsx文件
 */
export function parseBenefitEvaluationExcel(file: File): Promise<ParsedBenefitData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })

        // 查找目标sheet
        const sheetName = workbook.SheetNames.find(name =>
          name.includes('收入支出明细表') && name.includes('基础数据表')
        )

        if (!sheetName) {
          reject(new Error('未找到"收入支出明细表（基础数据表）"sheet'))
          return
        }

        const sheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as string[][]

        const result = parseSheetData(jsonData)
        resolve(result)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * 解析sheet数据
 */
function parseSheetData(rows: string[][]): ParsedBenefitData {
  const result: ParsedBenefitData = {
    itIncome: [],
    ctIncome: [],
    itCost: [],
    ctCost: [],
    agentPayable: [],
    itInvestment: [],
    ctInvestment: [],
    allocation: []
  }

  // 找到表头行（包含"第1年"等字样的行）
  let headerRowIndex = -1
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i]
    const hasYearColumn = row.some(cell => 
      typeof cell === 'string' && /第\d+年/.test(cell)
    )
    if (hasYearColumn) {
      headerRowIndex = i
      break
    }
  }

  if (headerRowIndex === -1) {
    headerRowIndex = 1 // 默认第2行是表头
  }

  const headerRow = rows[headerRowIndex] || []
  
  // 解析年份列（只解析"金额（含税）"部分的年份，跳过后面"金额（不含税）"的部分）
  // 表头结构：G=金额（含税）、H=期初、I=第1年、...、S=...、T=金额（不含税）、...
  const yearColumns: { index: number; year: number }[] = []
  let baseYear = 2025 // 默认起始年份
  let inTaxInclusiveSection = false
  
  for (let i = 0; i < headerRow.length; i++) {
    const cell = headerRow[i]?.toString()?.trim() || ''
    
    // 遇到"不含税"就停止（先判断不含税，避免误匹配"含税"）
    if (cell.includes('不含税')) {
      if (inTaxInclusiveSection) break
      continue
    }
    
    // 遇到"金额（含税）"就开始记录
    if (cell.includes('金额') && cell.includes('含税')) {
      inTaxInclusiveSection = true
      continue
    }
    
    // 在含税区域内，匹配"第N年"格式
    if (inTaxInclusiveSection) {
      const match = cell.match(/第(\d+)年/)
      if (match) {
        const yearNum = parseInt(match[1])
        yearColumns.push({ index: i, year: baseYear + yearNum - 1 })
      }
    }
  }

  // 如果没找到年份，使用默认值（从第8列开始的10年）
  if (yearColumns.length === 0) {
    for (let i = 8; i <= 17; i++) {
      yearColumns.push({ index: i, year: baseYear + i - 8 })
    }
  }

  // 记录当前的模块（B列值），用于后续行继承
  let currentModule = ''
  
  // 从表头下一行开始解析
  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex]
    if (!row || row.length < 6) continue

    const colB = row[1]?.toString()?.trim() || ''  // 二级分类
    const colC = row[2]?.toString()?.trim() || ''  // 三级分类/产品名
    const colD = row[3]?.toString()?.trim() || ''  // 类型
    const colE = row[4]?.toString()?.trim() || ''  // 具体内容/资费名
    const colF = row[5]?.toString()?.trim() || ''  // 税率

    // 更新当前模块
    if (colB && MODULE_MAP[colB]) {
      currentModule = MODULE_MAP[colB]
    }

    // 判断是否是分摊模块（A列包含"非本项目新增支出成本分摊"）
    const colA = row[0]?.toString()?.trim() || ''
    if (colA.includes('非本项目新增支出成本分摊')) {
      currentModule = 'allocation'
    }

    // 跳过非数据行
    if (!colD && !colC) continue
    
    // 跳过合计行
    if (SKIP_PATTERNS.some(pattern => colC.includes(pattern) || colB.includes(pattern))) {
      continue
    }
    
    // 跳过比例行（只解析金额行）
    if (colD.includes('比例')) continue
    
    // 只解析"收入"或"支出"类型的行（进度-金额行也跳过，用主行数据）
    if (colD !== '收入' && colD !== '支出') continue
    
    // 跳过没有产品名的行（如空行、仅分类标题行）
    if (!colC && !colE) continue

    // 解析税率（小数转百分比）
    let taxRateStr = ''
    if (colF) {
      const rate = parseFloat(colF)
      if (!isNaN(rate)) {
        if (rate < 1) {
          // 小数格式（如0.06）转百分比
          taxRateStr = `${rate * 100}%`
        } else {
          taxRateStr = `${rate}%`
        }
      }
    }

    // 解析每个年份的数据
    for (const { index, year } of yearColumns) {
      const amount = row[index]?.toString()?.trim() || ''
      if (!amount || amount === '0' || amount === '-') continue

      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) continue

      const planDate = `${year}-01-01`
      const id = `parsed-${rowIndex}-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`

      // 清理产品名称和资费名称的序号
      const cleanProduct = cleanProductName(colC)
      const cleanTariff = cleanTariffName(colE)

      // 根据模块类型创建对应数据
      switch (currentModule) {
        case 'it-income': {
          // 用原始资费名称查找关联数据（支持带[数字]和不带的）
          const related = getITTariffRelatedData(colE)
          const finalTaxRate = taxRateStr || related.taxRate
          // 优先使用系统中匹配到的带序号资费名（与下拉选项格式一致），找不到则用清理后的名称
          const tariffNameToUse = related.matchedKey || cleanTariff || cleanProduct
          result.itIncome.push({
            id,
            productName: cleanProduct || '',
            tariffName: tariffNameToUse,
            mgmtProductCode: '',
            mgmtProductName: related.mgmtProductName,
            thirdLevelSubject: '',
            coaSubject: related.coaSubject,
            taxRate: finalTaxRate,
            isFixedRate: finalTaxRate ? '是' : '',
            planIncome: formatAmount(amount),
            contractStage: '',
            billingShareType: '',
            billingCycle: '',
            isContractAsset: '',
            planOrderTime: planDate,
            billingStartDate: ''
          })
          break
        }

        case 'ct-income': {
          const related = getCTTariffRelatedData(colE)
          const finalTaxRate = taxRateStr || related.taxRate
          const tariffNameToUse = related.matchedKey || cleanTariff || cleanProduct
          result.ctIncome.push({
            id,
            productName: cleanProduct || '',
            packageName: '',
            bandwidth: '',
            orderQuantity: '',
            tariffName: tariffNameToUse,
            planIncome: formatAmount(amount),
            taxRate: finalTaxRate,
            discount: '',
            billingShareType: '',
            billingSharePeriod: '',
            billingStartDate: '',
            mgmtProductCode: '',
            mgmtProductName: related.mgmtProductName,
            thirdLevelSubject: related.thirdLevelSubject,
            coaSubject: related.coaSubject,
            planOrderTime: planDate
          })
          break
        }

        case 'it-cost': {
          const bizSubject = getBusinessSubject(colC)
          result.itCost.push({
            id,
            expendProductName: cleanProduct || '',
            expendType: cleanTariff || '',
            correspondTariff: '',
            taxRate: taxRateStr || '',
            billingTime: planDate,
            billingAmount: formatAmount(amount),
            billingStartTime: planDate,
            budgetType: '',
            plannedExpense: formatAmount(amount),
            reimbursementMethod: '',
            reimbursementPeriod: '',
            reimbursementStartDate: planDate,
            contractStage: '',
            businessSubject: bizSubject
          })
          break
        }

        case 'ct-cost': {
          const bizSubject = getBusinessSubject(colC)
          result.ctCost.push({
            id,
            expendProductName: cleanProduct || '',
            expendType: cleanTariff || '',
            correspondTariff: '',
            taxRate: taxRateStr || '',
            billingTime: planDate,
            billingAmount: formatAmount(amount),
            billingStartTime: planDate,
            budgetType: '',
            plannedExpense: formatAmount(amount),
            reimbursementMethod: '',
            reimbursementPeriod: '',
            reimbursementStartDate: planDate,
            contractStage: '',
            businessSubject: bizSubject
          })
          break
        }

        case 'it-investment': {
          const bizSubject = getBusinessSubject(colC)
          result.itInvestment.push({
            id,
            investCode: `INV-${rowIndex}`,
            correspondTariff: '',
            expendProductName: cleanProduct || '',
            expendType: cleanTariff || '',
            taxRate: taxRateStr || '',
            planInvestAmount: formatAmount(amount),
            investTime: planDate,
            investmentType: '',
            plannedExpense: formatAmount(amount),
            reimbursementMethod: '',
            reimbursementPeriod: '',
            reimbursementStartDate: planDate,
            contractStage: '',
            businessSubject: bizSubject
          })
          break
        }

        case 'ct-investment': {
          const bizSubject = getBusinessSubject(colC)
          result.ctInvestment.push({
            id,
            investCode: `INV-${rowIndex}`,
            correspondTariff: '',
            expendProductName: cleanProduct || '',
            expendType: cleanTariff || '',
            taxRate: taxRateStr || '',
            planInvestAmount: formatAmount(amount),
            investTime: planDate,
            investmentType: '',
            plannedExpense: formatAmount(amount),
            reimbursementMethod: '',
            reimbursementPeriod: '',
            reimbursementStartDate: planDate,
            contractStage: '',
            businessSubject: bizSubject
          })
          break
        }

        case 'allocation':
          result.allocation.push({
            id,
            allocationType: cleanProduct || '',
            allocationAmount: formatAmount(amount),
            allocationStartTime: planDate,
            allocationContent: cleanProduct || '',
            allocationDesc: '',
            allocationMethod: '',
            allocationPeriod: ''
          })
          break
      }
    }
  }

  return result
}

// 格式化金额（添加千分位分隔符）
function formatAmount(amount: string): string {
  const num = parseFloat(amount)
  if (isNaN(num)) return amount
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

// 去掉名称中的序号（如 "[1372]业务集成费" → "业务集成费"）
function cleanTariffName(name: string): string {
  if (!name) return name
  return name.replace(/^\[\d+\]\s*/, '').trim()
}

// 去掉产品名称中的分类序号（如 "1-1 集成收入-信息服务" → "集成收入-信息服务"，"2、商品销售收入" → "商品销售收入"）
function cleanProductName(name: string): string {
  if (!name) return name
  let result = name
  // 去掉 "数字-数字 " 格式（如 "1-1 "）
  result = result.replace(/^\d+-\d+\s+/, '')
  // 去掉 "数字、" 格式（如 "2、"）
  result = result.replace(/^\d+、/, '')
  // 去掉 "数字. " 格式（如 "1. "）
  result = result.replace(/^\d+\.\s*/, '')
  // 去掉 "数字 " 格式（如 "1 "）
  result = result.replace(/^\d+\s+/, '')
  return result.trim()
}

// 通过资费名称查找 IT 收入关联数据（税率、管理产品名、COA科目）
function getITTariffRelatedData(tariffName: string) {
  let matchedKey = ''
  let taxRate = ''
  let mgmtProductName = ''
  let coaSubject = ''
  
  // 先用原始名称查找
  if (itTariffTaxMap[tariffName]) {
    matchedKey = tariffName
    taxRate = itTariffTaxMap[tariffName]
    mgmtProductName = itTariffMgmtNameMap[tariffName] || ''
    coaSubject = itTariffCoaMap[tariffName] || ''
  }
  
  // 如果没找到，尝试去掉序号后匹配（遍历所有key）
  if (!matchedKey) {
    for (const key of Object.keys(itTariffTaxMap)) {
      if (cleanTariffName(key) === cleanTariffName(tariffName)) {
        matchedKey = key
        taxRate = itTariffTaxMap[key]
        mgmtProductName = itTariffMgmtNameMap[key] || ''
        coaSubject = itTariffCoaMap[key] || ''
        break
      }
    }
  }
  
  return { matchedKey, taxRate, mgmtProductName, coaSubject }
}

// 通过资费名称查找 CT 收入关联数据
function getCTTariffRelatedData(tariffName: string) {
  let matchedKey = ''
  let taxRate = ''
  let mgmtProductName = ''
  let coaSubject = ''
  let thirdLevelSubject = ''
  
  // 先用原始名称查找
  if (ctTariffTaxMap[tariffName]) {
    matchedKey = tariffName
    taxRate = ctTariffTaxMap[tariffName]
    mgmtProductName = ctTariffMgmtNameMap[tariffName] || ''
    coaSubject = ctTariffCoaMap[tariffName] || ''
    thirdLevelSubject = ctTariffThirdSubjectMap[tariffName] || ''
  }
  
  // 如果没找到，尝试去掉序号后匹配
  if (!matchedKey) {
    for (const key of Object.keys(ctTariffTaxMap)) {
      if (cleanTariffName(key) === cleanTariffName(tariffName)) {
        matchedKey = key
        taxRate = ctTariffTaxMap[key]
        mgmtProductName = ctTariffMgmtNameMap[key] || ''
        coaSubject = ctTariffCoaMap[key] || ''
        thirdLevelSubject = ctTariffThirdSubjectMap[key] || ''
        break
      }
    }
  }
  
  return { matchedKey, taxRate, mgmtProductName, coaSubject, thirdLevelSubject }
}

// 通过支出内容查找业务科目
function getBusinessSubject(content: string): string {
  // 直接查找
  if (businessSubjectMap[content]) return businessSubjectMap[content]
  // 去掉序号后查找
  const cleaned = cleanProductName(content)
  if (businessSubjectMap[cleaned]) return businessSubjectMap[cleaned]
  return ''
}
