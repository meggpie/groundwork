// Development-only: pass the local playwright-core module path as argv[2].
const {chromium}=require(process.argv[2]||'playwright-core');
const fs=require('node:fs');const path=require('node:path');
const {pathToFileURL}=require('node:url');const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url()))errors.push(r.url())});
  const out=path.join(root,'exports/browser-review');fs.mkdirSync(out,{recursive:true});
  for(const width of [1040,800,760,390,320])for(const bg of ['white','#e7edf4']){
   await page.setViewportSize({width,height:900});
   await page.goto(pathToFileURL(path.join(root,'exports/scs101--lesson-1--why-code-steps--paste.html')).href);
   await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(bg=>document.body.style.background=bg,bg);
   assert.equal(await page.locator('ol>li').count(),4);
   assert.equal(await page.locator('h1,h2,button,a,[tabindex]').count(),0);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow');
   const boxes=await page.locator('li').evaluateAll(items=>items.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y}}));
   for(let i=1;i<4;i++)assert.ok(width>760?boxes[i].x>boxes[i-1].x&&boxes[i].y===boxes[0].y:boxes[i].y>boxes[i-1].y&&boxes[i].x===boxes[0].x);
   for(const paragraph of await page.locator('li p').all())assert.ok(await paragraph.isVisible());
   const connector=await page.locator('li').first().evaluate(el=>{const s=getComputedStyle(el,'::before');return [s.borderTopWidth,s.borderLeftWidth]});
   assert.equal(connector[width>760?0:1],'1px');
   await page.screenshot({path:path.join(out,`why-code-steps-${width}-${bg==='white'?'white':'ice'}.png`),fullPage:true});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: final export at 1040/800/760/390/320px, white and ice; horizontal/vertical order, connectors, visible content, no overflow or external requests.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
