const {chromium}=require(process.argv[2]||'playwright-core');
const path=require('node:path');const fs=require('node:fs');
const assert=require('node:assert/strict');const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))errors.push(r.url())});
  const out=path.join(root,'exports/browser-review');fs.mkdirSync(out,{recursive:true});
  const content=JSON.parse(fs.readFileSync(path.join(root,'courses/scs101/lesson-1/five-objectives/block.json'))).data;
  for(const width of [1040,960,800,720,390,320])for(const bg of ['white','#e7edf4']){
   await page.setViewportSize({width,height:900});
   await page.goto(pathToFileURL(path.join(root,'exports/scs101--lesson-1--five-objectives--paste.html')).href);
   await page.evaluate(()=>document.fonts.ready);await page.evaluate(bg=>document.body.style.background=bg,bg);
   assert.equal(await page.locator('h2,[data-progress]').count(),0);
   assert.equal(await page.locator('.instruction').innerText(),content.instruction);
   assert.ok(await page.locator('img').evaluateAll(es=>es.length===5&&es.every(e=>e.complete&&e.naturalWidth>0&&e.src.startsWith('data:'))));
   const cards=page.locator('[data-card]');assert.equal(await cards.count(),5);
   const rects=await cards.evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}}));
   if(width>760){assert.equal(rects[0].y,rects[2].y);assert.equal(rects[3].y,rects[4].y);assert.ok(rects[3].y>rects[0].y);assert.ok(Math.abs(rects[3].x+rects[4].x+rects[4].w-width)<2)}
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await page.screenshot({path:path.join(out,`five-objectives-${width}-${bg==='white'?'white':'ice'}-front.png`),fullPage:true});
   for(let i=0;i<5;i++){
    const card=cards.nth(i);await card.click();
    assert.equal(await card.getAttribute('aria-pressed'),'true');
    assert.equal(await card.locator('.back').innerText(),content.cards[i].back.text);
    assert.equal(await card.locator('.front').evaluate(e=>getComputedStyle(e).visibility),'hidden');
    assert.equal((await card.boundingBox()).height,rects[i].h);
   }
   await page.screenshot({path:path.join(out,`five-objectives-${width}-${bg==='white'?'white':'ice'}-back.png`),fullPage:true});
   for(let i=0;i<5;i++){await cards.nth(i).click();assert.equal(await cards.nth(i).getAttribute('aria-pressed'),'false')}
   await cards.first().focus();
   for(let i=0;i<5;i++){
    const card=cards.nth(i);assert.ok(await card.evaluate(e=>e===document.activeElement));
    assert.ok(await card.evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth)>=3));
    await page.keyboard.press('Enter');assert.equal(await card.getAttribute('aria-pressed'),'true');
    await page.keyboard.press('Space');assert.equal(await card.getAttribute('aria-pressed'),'false');
    if(i<4)await page.keyboard.press('Tab');
   }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: five-card 3+2 layout, six widths, white/ice, all mouse/Enter/Space reveals and returns, Tab order/focus, stable card heights, exact copy, embedded icons, no overflow/external requests.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
