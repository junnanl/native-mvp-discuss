import * as XLSX from 'xlsx'
import path from 'path'
import fs from 'fs'

const templatePath = path.join(process.cwd(), '效益评估模型.xlsx')
const outputPath = path.join(process.cwd(), '效益评估测试数据.xlsx')

try {
  const fileBuffer = fs.readFileSync(templatePath)
  const workbook = XLSX.read(fileBuffer, { type: 'buffer' })
  
  const sheetName = '收入支出明细表（基础数据表）'
  const sheet = workbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  
  console.log('模板总行数:', jsonData.length)
  
  // 找到表头行，确定年份列的位置
  let headerRowIndex = -1
  for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
    const row = jsonData[i]
    const hasYearColumn = row.some(cell => 
      typeof cell === 'string' && /第\d+年/.test(cell)
    )
    if (hasYearColumn) {
      headerRowIndex = i
      break
    }
  }
  
  console.log('表头行索引:', headerRowIndex)
  
  const headerRow = jsonData[headerRowIndex] || []
  
  // 找到"金额（含税）"部分的年份列（从G列后开始，到S列左右结束）
  // 表头行结构：G=金额（含税）、H=期初、I=第1年、J=第2年...
  // 后面T列开始是"金额（不含税）"的部分，我们只填前面含税的
  const yearColIndices = []
  let inTaxInclusiveSection = false
  for (let i = 0; i < headerRow.length; i++) {
    const cell = headerRow[i]?.toString()?.trim() || ''
    // 遇到"金额（不含税）"标记，停止记录（先判断不含税，避免误匹配）
    if (cell.includes('不含税')) {
      if (inTaxInclusiveSection) break
      continue
    }
    // 遇到"金额（含税）"标记，开始记录年份列
    if (cell.includes('金额') && cell.includes('含税')) {
      inTaxInclusiveSection = true
      continue
    }
    if (inTaxInclusiveSection && /第\d+年/.test(cell)) {
      yearColIndices.push({ label: cell, index: i })
    }
  }
  
  console.log('年份列:', yearColIndices.map(y => `${y.label}(列${y.index+1})`).join(', '))
  
  // 定义测试数据 - 按 B列(二级分类) + C列(三级分类) 组合匹配，填入对应年份的金额
  // 每个产品填3行：收入/支出行、进度-金额行、进度-比例行
  const testData = [
    // === IT类收入 ===
    {
      moduleB: 'IT类收入',
      productC: '1-1 集成收入-信息服务',
      amounts: { '第1年': 120000, '第2年': 150000, '第3年': 180000 }
    },
    {
      moduleB: 'IT类收入',
      productC: '1-3 维保收入-信息服务',
      amounts: { '第1年': 80000, '第2年': 80000, '第3年': 80000, '第4年': 80000 }
    },
    {
      moduleB: 'IT类收入',
      productC: '2、商品销售收入',
      amounts: { '第1年': 500000 }
    },
    
    // === CT类收入 ===
    {
      moduleB: 'CT类收入',
      productC: '互联网专线',
      amounts: { '第1年': 36000, '第2年': 36000, '第3年': 36000, '第4年': 36000, '第5年': 36000 }
    },
    {
      moduleB: 'CT类收入',
      productC: '云计算',
      amounts: { '第1年': 24000, '第2年': 24000, '第3年': 24000 }
    },
    
    // === IT类投资 ===
    {
      moduleB: 'IT类投资',
      productC: '1、硬件设备类投资',
      amounts: { '第1年': 150000 }
    },
    {
      moduleB: 'IT类投资',
      productC: '2、定制软件类投资',
      amounts: { '第1年': 80000 }
    },
    
    // === CT类投资 ===
    {
      moduleB: 'CT类投资',
      productC: '1、硬件设备类投资',
      amounts: { '第1年': 300000 }
    },
    {
      moduleB: 'CT类投资',
      productC: '3、施工费用',
      amounts: { '第1年': 50000 }
    },
    
    // === IT类成本 ===
    {
      moduleB: 'IT类成本',
      productC: '1-1集成费-信息服务',
      amounts: { '第1年': 50000 }
    },
    {
      moduleB: 'IT类成本',
      productC: '2、商品销售成本',
      amounts: { '第1年': 200000 }
    },
    
    // === CT类成本 ===
    {
      moduleB: 'CT类成本',
      productC: '5、网络维护成本',
      amounts: { '第1年': 12000, '第2年': 12000, '第3年': 12000 }
    },
    
    // === 非本项目新增支出成本分摊 ===
    {
      moduleA: '非本项目新增支出成本分摊',
      productC: '1、IT收入所对应的相关成本分摊',
      amounts: { '第1年': 50000, '第2年': 50000 }
    },
    {
      moduleA: '非本项目新增支出成本分摊',
      productC: '2、CT收入所对应的基础网络资源的成本分摊',
      amounts: { '第1年': 30000, '第2年': 30000 }
    }
  ]
  
  // 遍历所有行，找到匹配的产品行，填入数据
  let filledCount = 0
  let currentB = ''  // 当前的B列值（二级分类），用于继承
  let currentA = ''  // 当前的A列值（大分类），用于继承
  
  for (let rowIndex = headerRowIndex + 1; rowIndex < jsonData.length; rowIndex++) {
    const row = jsonData[rowIndex]
    if (!row || row.length < 6) continue
    
    const colA = row[0]?.toString()?.trim() || ''
    const colB = row[1]?.toString()?.trim() || ''
    const colC = row[2]?.toString()?.trim() || ''
    const colD = row[3]?.toString()?.trim() || ''
    
    // 更新当前分类值（用于行继承）
    if (colA) {
      currentA = colA
    }
    if (colB) {
      currentB = colB
    }
    
    // 检查这一行是否是我们要填数据的产品行（D列 = 收入 或 支出）
    if ((colD === '收入' || colD === '支出') && colC) {
      // 查找匹配的测试数据：
      // - 对于分摊模块（moduleA有值），匹配A列 + C列
      // - 对于其他模块（moduleB有值），匹配B列 + C列
      const matchItem = testData.find(item => {
        const cMatch = colC.includes(item.productC) || item.productC.includes(colC)
        if (!cMatch) return false
        
        if (item.moduleA) {
          // 匹配A列（大分类）
          const aMatch = (colA && colA.includes(item.moduleA)) || 
                         (currentA && currentA.includes(item.moduleA))
          return aMatch
        }
        
        if (item.moduleB) {
          // 匹配B列（二级分类）
          const bMatch = (colB && colB.includes(item.moduleB)) || 
                         (currentB && currentB.includes(item.moduleB))
          return bMatch
        }
        
        return false
      })
      
      if (matchItem) {
        console.log(`找到匹配行 ${rowIndex+1}: A=${colA || currentA} / B=${colB || currentB} / C=${colC} / D=${colD}`)
        
        // 填入金额数据（收入/支出行）
        let totalAmount = 0
        for (const { label, index } of yearColIndices) {
          if (matchItem.amounts[label]) {
            row[index] = matchItem.amounts[label]
            totalAmount += matchItem.amounts[label]
            console.log(`  填入 ${label}: ${matchItem.amounts[label]}`)
          }
        }
        
        // 如果有G列（金额合计），也填上
        const gColHeader = headerRow[6]?.toString()?.trim() || ''
        if (gColHeader.includes('金额') && gColHeader.includes('含税') && totalAmount > 0) {
          row[6] = totalAmount
        }
        
        filledCount++
        
        // 接下来两行是进度-金额行和进度-比例行
        // 进度-金额行（下一行）
        const amountRow = jsonData[rowIndex + 1]
        if (amountRow) {
          const amountRowD = amountRow[3]?.toString()?.trim() || ''
          if (amountRowD.includes('进度') && amountRowD.includes('金额')) {
            for (const { label, index } of yearColIndices) {
              if (matchItem.amounts[label]) {
                amountRow[index] = matchItem.amounts[label]
              }
            }
            console.log(`  进度-金额行 (行${rowIndex+2}) 已填入`)
          }
        }
        
        // 进度-比例行（下两行）
        const ratioRow = jsonData[rowIndex + 2]
        if (ratioRow) {
          const ratioRowD = ratioRow[3]?.toString()?.trim() || ''
          if (ratioRowD.includes('进度') && ratioRowD.includes('比例')) {
            for (const { label, index } of yearColIndices) {
              if (matchItem.amounts[label]) {
                ratioRow[index] = 1  // 100%
              }
            }
            console.log(`  进度-比例行 (行${rowIndex+3}) 已填入`)
          }
        }
      }
    }
  }
  
  console.log(`\n共填入 ${filledCount} 个产品/项目的数据`)
  
  // 将修改后的数据写回sheet
  const newSheet = XLSX.utils.aoa_to_sheet(jsonData)
  
  // 复制原sheet的列宽等设置
  if (sheet['!cols']) {
    newSheet['!cols'] = sheet['!cols']
  }
  if (sheet['!merges']) {
    newSheet['!merges'] = sheet['!merges']
  }
  if (sheet['!rows']) {
    newSheet['!rows'] = sheet['!rows']
  }
  
  workbook.Sheets[sheetName] = newSheet
  
  // 写入文件
  XLSX.writeFile(workbook, outputPath)
  
  console.log('\n✅ 测试数据文件已生成:', outputPath)
  console.log('')
  console.log('基于真实模板生成，包含以下测试数据：')
  console.log('  收入 - IT类收入：3项（集成收入-信息服务、维保收入-信息服务、商品销售收入）')
  console.log('  收入 - CT类收入：2项（互联网专线、云计算）')
  console.log('  投资支出 - IT类投资：2项（硬件设备类投资、定制软件类投资）')
  console.log('  成本支出 - IT类成本：2项（集成费-信息服务、商品销售成本）')
  console.log('  成本支出 - CT类成本：1项（网络维护成本）')
  console.log('  非本项目新增支出成本分摊：1项（IT收入相关成本分摊）')
  console.log('')
  console.log('每项均包含：收入/支出行 + 收款/付款进度-金额行 + 收款/付款进度-比例行')
  
} catch (err) {
  console.error('生成测试数据失败:', err)
  process.exit(1)
}
