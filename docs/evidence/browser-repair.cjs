const { chromium } = require('/opt/mvp/node_modules/playwright');
(async () => {
 const browser = await chromium.connectOverCDP('http://127.0.0.1:39222');
 const context = await browser.newContext({viewport:{width:1440,height:1000}});
 const page = await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 try {
  const base='http://172.17.0.1:15173';
  // HTTP setup supplies instances; UI assertions below use the live Vite proxy and backend.
  for(let i=0;i<6;i++) await page.request.post(base+'/api/flow-instances',{data:{name:`浏览器验证-${i+1}`}});
  await page.goto(base); await page.getByRole('combobox').selectOption('提需求');
  await page.getByRole('button',{name:'浏览器验证-1',exact:true}).waitFor();
  await page.getByRole('button',{name:'2',exact:true}).click();
  await page.getByRole('button',{name:'浏览器验证-6',exact:true}).click();
  await page.getByRole('button',{name:'完成提交需求',exact:true}).click();
  await page.getByText('当前节点：评审 · 进行中').waitFor();
  await page.getByRole('combobox').selectOption('评审');
  await page.getByRole('button',{name:'完成评审',exact:true}).click();
  await page.getByText('当前节点：开发 · 进行中').waitFor();
  await page.getByRole('combobox').selectOption('开发');
  await page.getByRole('button',{name:'完成开发',exact:true}).click();
  await page.getByText('当前节点：已上线 · 已完成').waitFor();
  await page.getByText('工作台',{exact:true}).click();
  await page.getByRole('combobox').selectOption('提需求');
  await page.getByText('共 5 条，第 1/1 页').waitFor();
  await page.screenshot({path:'/tmp/oa-repair-desktop.png',fullPage:true});
  if(errors.length) throw Error(JSON.stringify(errors));
  console.log(JSON.stringify({result:'PASS',browser:await browser.version(),checks:['Vite API proxy','six instances / pagination','detail tab','three role transitions','terminal completion','page count shrink'],pageErrors:errors}));
 } finally { await context.close(); await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1});
