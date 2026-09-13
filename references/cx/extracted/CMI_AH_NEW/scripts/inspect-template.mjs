import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const templatePath = path.join(__dirname, '..', '效益评估模型.xlsx')

try {
  const fileBuffer = fs.readFileSync(templatePath)
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
  
  const sheetName = '收入支出明细表（基础数据表）'
  const sheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  
  // 读取第80-160行（成本和投资部分）
  console.log('=== 第80-160行（成本/投资部分） ===')
  for (let i = 79; i < Math.min(jsonData.length, 160); i++) {
    const row = jsonData[i]
    const cells = []
    for (let j = 0; j < Math.min(row.length, 15); j++) {
      const col = String.fromCharCode(65 + j)
      const val = row[j] ? String(row[j]).trim() : ''
      if (val || j < 6) {
        cells.push(`${col}:${val.substring(0, 20)}`)
      }
    }
    if (cells.length > 0) {
      console.log(`行${i+1}: ${cells.join(' | ')}`)
    }
  }
  
  console.log('')
  
  // 读取第160-225行（分摊和其他部分）
  console.log('=== 第160-225行（分摊/其他部分） ===')
  for (let i = 159; i < Math.min(jsonData.length, 225); i++) {
    const row = jsonData[i]
    const cells = []
    for (let j = 0; j < Math.min(row.length, 15); j++) {
      const col = String.fromCharCode(65 + j)
      const val = row[j] ? String(row[j]).trim() : ''
      if (val || j < 6) {
        cells.push(`${col}:${val.substring(0, 20)}`)
      }
    }
    if (cells.length > 0) {
      console.log(`行${i+1}: ${cells.join(' | ')}`)
    }
  }
  
} catch (err) {
  console.error('读取模板文件失败:', err)
}
