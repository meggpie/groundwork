// Development-only: node tests/check-code-threshold.cjs <playwright-core path>
const {chromium}=require(process.argv[2] || 'playwright-core');
const path=require('node:path');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url()))errors.push(r.url())});
  const out=path.join(root,'exports/browser-review');fs.mkdirSync(out,{recursive:true});
  for(const width of [1040,390,320])for(const background of ['white','#e7edf4']){
   await page.setViewportSize({width,height:900});
   await page.goto(pathToFileURL(path.join(root,'exports/scs101--lesson-1--code-threshold--paste.html')).href);
   await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(bg=>document.body.style.background=bg,background);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Horizontal overflow');
   const positions=await page.evaluate(()=>['.above','.minimum','.below'].map(s=>document.querySelector(s).getBoundingClientRect().top));
   assert.ok(positions[0]<positions[1]&&positions[1]<positions[2]);
   assert.equal(await page.locator('button,a,input,[tabindex]').count(),0);
   await page.screenshot({path:path.join(out,`code-threshold-${width}-${background==='white'?'white':'ice'}.png`),fullPage:true});
  }
  await page.setViewportSize({width:1040,height:1000});
  await page.goto(pathToFileURL(path.join(root,'library/previews/scs101--lesson-1--code-threshold.html')).href);
  await page.getByRole('button').click();
  await page.screenshot({path:path.join(out,'code-threshold-context.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: final export at 1040, 390 and 320px on white/ice; spatial order, no overflow, no external requests, no unnecessary tab stops; lesson preview.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
