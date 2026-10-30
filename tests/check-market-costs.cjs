// Development-only: pass a local playwright-core module path as argv[2].
const {chromium}=require(process.argv[2]||'playwright-core');
const path=require('node:path');const fs=require('node:fs');
const assert=require('node:assert/strict');const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))errors.push(r.url())});
  const out=path.join(root,'exports/browser-review');fs.mkdirSync(out,{recursive:true});
  for(const width of [960,800,720,640,560,521,520,390,320])for(const bg of ['white','#e7edf4']){
   await page.setViewportSize({width,height:900});
   await page.goto(pathToFileURL(path.join(root,'exports/scs101--lesson-1--market-costs--paste.html')).href);
   await page.evaluate(()=>document.fonts.ready);await page.evaluate(bg=>document.body.style.background=bg,bg);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow');
   assert.equal(await page.locator('.origin').count(),1);
   assert.equal(await page.locator('p').first().evaluate(el=>getComputedStyle(el).fontSize),'18px');assert.equal(await page.locator('.groups li').count(),2);
   assert.equal(await page.locator('button,a,input,[tabindex],h1').count(),0);
   for(const p of await page.locator('p').all())assert.ok(await p.isVisible());
   const boxes=await page.locator('.groups li').evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y}}));
   assert.ok(width>520?boxes[0].y===boxes[1].y&&boxes[0].x<boxes[1].x:boxes[0].x===boxes[1].x&&boxes[0].y<boxes[1].y);
   await page.screenshot({path:path.join(out,`market-costs-${width}-${bg==='white'?'white':'ice'}.png`),fullPage:true});
  }
  await page.setViewportSize({width:1040,height:900});
  await page.goto(pathToFileURL(path.join(root,'library/previews/scs101--lesson-1--market-costs.html')).href);
  await page.getByRole('button').click();
  await page.screenshot({path:path.join(out,'market-costs-context.png'),fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('PASS: final export at nine widths, white/ice backgrounds, branching layouts, visible content, no overflow or external requests; lesson preview.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
