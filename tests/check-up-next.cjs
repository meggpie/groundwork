// node tests/check-up-next.cjs <local playwright-core path>
const {chromium}=require(process.argv[2]||'playwright-core');
const path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))errors.push(r.url())});
  for(const width of [1200,960,800,720,640,390,320])for(const bg of ['white','#e7edf4']){
   await page.setViewportSize({width,height:650});
   await page.goto(pathToFileURL(path.join(root,'exports/scs101--lesson-1--up-next--paste.html')).href);
   await page.evaluate(()=>document.fonts.ready);await page.evaluate(bg=>document.body.style.background=bg,bg);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   assert.equal(await page.locator('p').count(),2);assert.equal(await page.locator('strong').innerText(),'standards');
   assert.equal(await page.locator('.up-next-label').innerText(),'UP NEXT');
   const style=await page.locator('main').evaluate(e=>{const s=getComputedStyle(e);return [s.backgroundColor,s.borderRadius,s.color,e.getBoundingClientRect().width]});
   assert.deepEqual(style.slice(0,3),['rgb(16, 76, 143)','16px','rgb(255, 255, 255)']);assert.equal(style[3],width-12);
   assert.equal(await page.locator('p').first().evaluate(e=>getComputedStyle(e).fontSize),'18px');
   assert.equal(await page.locator('h1,h2,button,a,input,[tabindex],script').count(),0);
   await page.screenshot({path:path.join(root,`exports/browser-review/up-next-${width}-${bg==='white'?'white':'ice'}.png`),fullPage:true});
  }
  assert.deepEqual(errors,[]);console.log('PASS: rounded full-width blue component, seven widths on white/ice, 18px body, emphasis, no overflow or external dependencies.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
