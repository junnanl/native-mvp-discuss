import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 复制解析器逻辑进行测试
const MODULE_MAP = {
  'IT类收入': 'it-income',
  'CT类收入': 'ct-income',
  'IT类投资': 'it-investment',
  'CT类投资': 'ct-investment',
  'IT类成本': 'it-cost',
  'CT类成本': 'ct-cost'
}

const SKIP_PATTERNS = [
  '合计',
  '项目收入合计',
  '项目支出合计',
  '综合类成本',
  '通信及信息服务收入合计',
  '通信业务收入'
]

function formatAmount(amount) {
  const num = parseFloat(amount)
  if (isNaN(num)) return amount
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function parseSheetData(rows) {
  const result = {
    itIncome: [],
    ctIncome: [],
    itCost: [],
    ctCost: [],
    agentPayable: [],
    itInvestment: [],
    ctInvestment: [],
    allocation: []
  }

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
    headerRowIndex = 1
  }

  const headerRow = rows[headerRowIndex] || []
  
  const yearColumns = []
  const baseYear = 2025
  
  for (let i = 7; i < headerRow.length; i++) {
    const cell = headerRow[i]?.toString()?.trim() || ''
    const match = cell.match(/第(\d+)年/)
    if (match) {
      const yearNum = parseInt(match[1])
      yearColumns.push({ index: i, year: baseYear + yearNum - 1 })
    }
  }

  if (yearColumns.length === 0) {
    for (let i = 8; i <= 18; i++) {
      yearColumns.push({ index: i, year: baseYear + i - 8 })
    }
  }

  let currentModule = ''
  
  for (let rowIndex = headerRowIndex + 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex]
    if (!row || row.length < 6) continue

    const colA = row[0]?.toString()?.trim() || ''
    const colB = row[1]?.toString()?.trim() || ''
    const colC = row[2]?.toString()?.trim() || ''
    const colD = row[3]?.toString()?.trim() || ''
    const colE = row[4]?.toString()?.trim() || ''
    const colF = row[5]?.toString()?.trim() || ''

    if (colB && MODULE_MAP[colB]) {
      currentModule = MODULE_MAP[colB]
    }

    if (colA.includes('非本项目新增支出成本分摊')) {
      currentModule = 'allocation'
    }

    if (!colD && !colC) continue
    
    if (SKIP_PATTERNS.some(pattern => colC.includes(pattern) || colB.includes(pattern))) {
      continue
    }
    
    if (colD.includes('比例')) continue
    
    if (colD !== '收入' && colD !== '支出') continue
    
    if (!colC && !colE) continue

    let taxRateStr = ''
    if (colF) {
      const rate = parseFloat(colF)
      if (!isNaN(rate)) {
        if (rate < 1) {
          taxRateStr = `${rate * 100}%`
        } else {
          taxRateStr = `${rate}%`
        }
      }
    }

    for (const { index, year } of yearColumns) {
      const amount = row[index]?.toString()?.trim() || ''
      if (!amount || amount === '0' || amount === '-') continue

      const amountNum = parseFloat(amount)
      if (isNaN(amountNum) || amountNum <= 0) continue

      const planDate = `${year}-01-01`
      const id = `parsed-${rowIndex}-${index}`

      switch (currentModule) {
        case 'it-income':
          result.itIncome.push({
            id,
            productName: colC,
            tariffName: colE || colC,
            taxRate: taxRateStr || '6%',
            planIncome: formatAmount(amount),
            planOrderTime: planDate
          })
          break
        case 'ct-income':
          result.ctIncome.push({
            id,
            productName: colC,
            tariffName: colE || colC,
            taxRate: taxRateStr || '6%',
            planIncome: formatAmount(amount),
            planOrderTime: planDate
          })
          break
        case 'it-cost':
          result.itCost.push({
            id,
            expendProductName: colC,
            expendType: colE || '一次性',
            taxRate: taxRateStr || '6%',
            billingAmount: formatAmount(amount),
            billingTime: planDate
          })
          break
        case 'ct-cost':
          result.ctCost.push({
            id,
            expendProductName: colC,
            expendType: colE || '一次性',
            taxRate: taxRateStr || '6%',
            billingAmount: formatAmount(amount),
            billingTime: planDate
          })
          break
        case 'it-investment':
          result.itInvestment.push({
            id,
            expendProductName: colC,
            expendType: colE || '一次性',
            taxRate: taxRateStr || '13%',
            planInvestAmount: formatAmount(amount),
            investTime: planDate
          })
          break
        case 'ct-investment':
          result.ctInvestment.push({
            id,
            expendProductName: colC,
            expendType: colE || '一次性',
            taxRate: taxRateStr || '13%',
            planInvestAmount: formatAmount(amount),
            investTime: planDate
          })
          break
        case 'allocation':
          result.allocation.push({
            id,
            allocationType: colC,
            allocationAmount: formatAmount(amount),
            allocationStartTime: planDate
          })
          break
      }
    }
  }

  return result
}

// 测试解析
const testFilePath = path.join(__dirname, '..', '效益评估测试数据.xlsx')

try {
  const fileBuffer = fs.readFileSync(testFilePath)
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
  
  console.log('=== Sheet列表 ===')
  console.log(workbook.SheetNames)
  console.log('')
  
  const sheetName = workbook.SheetNames.find(name =>
    name.includes('收入支出明细表') && name.includes('基础数据表')
  )
  
  if (sheetName) {
    console.log(`找到目标sheet: ${sheetName}`)
    console.log('')
    
    const sheet = workbook.Sheets[sheetName]
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    
    console.log(`共 ${jsonData.length} 行`)
    console.log('')
    
    const result = parseSheetData(jsonData)
    
    console.log('=== 解析结果 ===')
    console.log('')
    console.log(`IT类收入: ${result.itIncome.length} 条`)
    result.itIncome.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.productName} - ${item.tariffName} - ${item.taxRate} - ${item.planIncome} - ${item.planOrderTime}`)
    })
    console.log('')
    console.log(`CT类收入: ${result.ctIncome.length} 条`)
    result.ctIncome.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.productName} - ${item.tariffName} - ${item.taxRate} - ${item.planIncome} - ${item.planOrderTime}`)
    })
    console.log('')
    console.log(`IT类投资: ${result.itInvestment.length} 条`)
    result.itInvestment.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.expendProductName} - ${item.expendType} - ${item.taxRate} - ${item.planInvestAmount} - ${item.investTime}`)
    })
    console.log('')
    console.log(`CT类投资: ${result.ctInvestment.length} 条`)
    result.ctInvestment.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.expendProductName} - ${item.expendType} - ${item.taxRate} - ${item.planInvestAmount} - ${item.investTime}`)
    })
    console.log('')
    console.log(`IT类成本: ${result.itCost.length} 条`)
    result.itCost.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.expendProductName} - ${item.expendType} - ${item.taxRate} - ${item.billingAmount} - ${item.billingTime}`)
    })
    console.log('')
    console.log(`CT类成本: ${result.ctCost.length} 条`)
    result.ctCost.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.expendProductName} - ${item.expendType} - ${item.taxRate} - ${item.billingAmount} - ${item.billingTime}`)
    })
    console.log('')
    console.log(`其他分摊: ${result.allocation.length} 条`)
    result.allocation.forEach((item, i) => {
      console.log(`  ${i+1}. ${item.allocationType} - ${item.allocationAmount} - ${item.allocationStartTime}`)
    })
  }
  
} catch (err) {
  console.error('测试失败:', err)
}
