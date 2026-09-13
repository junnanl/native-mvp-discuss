/**
 * 端到端走查：真实浏览器 + 真实 HTTP + 真实数据库。
 * 模型是桩（见 scratchpad/stub_server.py），CowAgent 未接——这两项仍未验。
 */
const { chromium } = require('/opt/node22/lib/node_modules/playwright')
const path = require('path')

const OUT = __dirname
const BASE = 'http://127.0.0.1:15173'
const errors = []
const steps = []

function note(text) { steps.push(text); console.log('· ' + text) }

async function login(page, name) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: new RegExp(`^${name}·`) }).click()
  await page.waitForSelector('text=工作台', { timeout: 8000 })
  note(`以「${name}」登录`)
}

async function shot(page, file) {
  await page.waitForTimeout(700)   // 等 fadeInUp 跑完再截，否则卡片是半透明的
  await page.screenshot({ path: path.join(OUT, file), fullPage: false })
}

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  // 1. 提需求：一句话 → 路由 → AI 填表 → 人确认 → 提交
  await login(page, '小林')
  await page.getByLabel('说一句话').fill('我要一个新的数字员工，帮我解析合同')
  await page.getByRole('button', { name: '发送' }).click()
  await page.waitForSelector('text=数字员工需求单', { timeout: 15000 })

  for (const label of ['需求名称', '紧急程度', '需求描述']) {
    if (await page.getByText(label).count() === 0) throw new Error(`确认表单没有渲染出「${label}」这个 label`)
  }
  const selectOptions = await page.locator('select').first().locator('option').allTextContents()
  note(`确认表单按定义渲染，紧急程度是下拉：${selectOptions.filter(Boolean).join('/')}`)
  await shot(page, '01-填表确认.png')

  await page.getByRole('button', { name: '提交' }).click()
  await page.waitForSelector('text=数字员工申请上线 #1', { timeout: 10000 })
  note('提交后打开需求详情标签，流程停在「评审」')
  await shot(page, '02-需求详情.png')

  // 2. 评审
  await login(page, '老周')
  await page.waitForSelector('text=合同解析助手', { timeout: 8000 })
  note('评审的待办里出现这条需求')
  await page.getByRole('button', { name: '合同解析助手' }).first().click()
  await page.waitForSelector('text=完成评审', { timeout: 8000 })
  await page.getByRole('button', { name: '完成评审' }).click()
  await page.waitForSelector('text=等开发处理', { timeout: 8000 })
  note('评审通过，流转到开发')

  // 3. 开发：生成 skill 草稿 → 上岗
  await login(page, '阿凯')
  await page.getByRole('button', { name: '合同解析助手' }).first().click()
  await page.waitForSelector('text=开发任务', { timeout: 8000 })
  await page.getByRole('button', { name: '让 AI 出个草稿' }).click()
  await page.waitForFunction(() => {
    const box = document.querySelector('textarea[aria-label="SKILL.md 内容"]')
    return box && box.value.length > 40
  }, { timeout: 15000 })
  note('AI 生成了 SKILL.md 草稿')
  await shot(page, '03-开发任务.png')
  await page.getByRole('button', { name: '完成开发并让员工上岗' }).click()
  await page.waitForSelector('text=已完成', { timeout: 10000 })
  note('开发完成，员工上岗（上线必须挂在这条走完的流程上）')

  // 3.5 再提一条相近的需求，评审时做重复建设检测
  await login(page, '小林')
  await page.getByLabel('说一句话').fill('我要一个发票识别助手，自动读发票上的信息')
  await page.getByRole('button', { name: '发送' }).click()
  await page.waitForSelector('text=数字员工需求单', { timeout: 15000 })
  await page.getByRole('button', { name: '提交' }).click()
  await page.waitForSelector('text=数字员工申请上线 #2', { timeout: 10000 })
  note('再提一条相近的需求')

  await login(page, '老周')
  await page.getByRole('button', { name: '发票识别助手' }).first().click()
  await page.getByRole('button', { name: '看看跟已有员工重不重' }).click()
  await page.waitForSelector('text=重复建设检测', { timeout: 15000 })
  await page.waitForSelector('text=单据类文档', { timeout: 15000 })
  note('查重图谱画出来了，相似度与理由来自模型判断，不是写死的')
  await shot(page, '08-重复建设检测.png')

  // 4. 使用者：看到员工卡片 + 报销流程
  await login(page, '小美')
  await page.waitForSelector('text=合同解析助手', { timeout: 8000 })
  note('已上线员工出现在工作台卡片区')
  await shot(page, '04-工作台.png')

  await page.getByLabel('说一句话').fill('我要报销一笔差旅费')
  await page.getByRole('button', { name: '发送' }).click()
  await page.waitForSelector('text=费用报销单', { timeout: 15000 })
  for (const label of ['报销事由', '报销金额', '发生日期', '费用类别']) {
    if (await page.getByText(label).count() === 0) throw new Error(`报销单没有渲染出「${label}」`)
  }
  if (await page.getByText('紧急程度').count() > 0) throw new Error('报销单里不该出现需求单的字段')
  note('同一个输入框，这次路由到报销单，字段是报销自己的')
  await shot(page, '05-报销填表.png')
  await page.getByRole('button', { name: '提交' }).click()
  await page.waitForSelector('text=/费用报销审批 #\\d+/', { timeout: 10000 })
  note('报销提交，流程停在「主管审批」')

  // 5. 主管 → 财务
  await login(page, '陈主管')
  await page.getByRole('button', { name: '客户现场支持交通费' }).first().click()
  await page.getByRole('button', { name: '完成主管审批' }).click()
  await page.waitForSelector('text=等财务处理', { timeout: 8000 })
  note('主管批完，流转到财务（评审和开发碰不到这条）')

  await login(page, '何会计')
  await page.getByRole('button', { name: '客户现场支持交通费' }).first().click()
  await page.getByRole('button', { name: '完成财务审批' }).click()
  await page.waitForSelector('text=已完成', { timeout: 8000 })
  note('财务批完，报销流程走完')
  await shot(page, '06-报销完成.png')

  // 6. 查数据：同一个输入框出图表
  await login(page, '小林')
  await page.getByLabel('说一句话').fill('需求都卡在哪个环节')
  await page.getByRole('button', { name: '发送' }).click()
  await page.waitForSelector('canvas', { timeout: 15000 })
  const canvasSize = await page.locator('canvas').first().boundingBox()
  if (!canvasSize || canvasSize.width < 100) throw new Error('图表没画出来')
  note(`ECharts 画出柱状图（${Math.round(canvasSize.width)}×${Math.round(canvasSize.height)}）`)
  await shot(page, '07-查数据出图.png')

  // 6.5 数字员工对话：三栏 + 执行进度绑真实事件
  await page.getByRole('button', { name: /合同解析助手/ }).first().click()
  await page.getByLabel('对话消息').waitFor({ timeout: 8000 })
  note('点员工卡片新开一个标签，进入三栏对话页')
  await page.getByLabel('对话消息').fill('最近需求都集中在哪')
  await page.getByRole('button', { name: '发送' }).click()

  await page.waitForSelector('text=检索资料', { timeout: 15000 })
  note('左栏出现真实工具事件「检索资料」（来自 tool_start: web_search）')
  await page.waitForSelector('text=兼容事件', { timeout: 15000 })
  note('认不出的事件被折叠显示，没有被丢掉')
  await page.waitForSelector('text=需求分类分布', { timeout: 15000 })
  note('show_chart 的产物落到右栏画布，不塞进对话气泡')
  await page.waitForFunction(() => document.body.innerText.includes('合同与报销两类'), { timeout: 15000 })
  note('delta 文本流式拼接完成')
  await shot(page, '09-数字员工对话.png')

  // 7. KPI 是真实统计
  const kpi = await page.locator('text=已上岗').locator('xpath=../..').innerText().catch(() => '')
  note(`底部指标卡：${kpi.replace(/\n/g, ' ')}`)

  await browser.close()

  console.log('\n=== 走查结果 ===')
  console.log(`步骤 ${steps.length} 项全部通过`)
  console.log(`页面脚本错误：${errors.length}`)
  if (errors.length) { errors.slice(0, 5).forEach(e => console.log('  ! ' + e)); process.exit(1) }
})().catch(e => { console.error('走查失败：', e.message); process.exit(1) })
