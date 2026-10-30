// Pass the path to a locally available playwright-core module as argv[2].
const {chromium}=require(process.argv[2] || 'playwright-core');
const path=require('node:path');
const fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1040,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://**',r=>{errors.push('External request: '+r.request().url());return r.abort()});
  await page.goto(pathToFileURL(path.join(root,'exports/scs101--lesson-1--code-definition--paste.html')).href);
  await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.explanation').isVisible(),false);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('.term').first().evaluate(b=>b===document.activeElement),true);
  assert.ok(await page.locator('.term').first().evaluate(b=>parseFloat(getComputedStyle(b).outlineWidth)>=3));
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('#explanation-title').innerText(),'Requirement');
  await page.keyboard.press('Space');
  assert.equal(await page.locator('.explanation').isVisible(),false);
  await page.keyboard.press('Tab');await page.keyboard.press('Enter');
  assert.equal(await page.locator('#explanation-title').innerText(),'Scope');
  await page.keyboard.press('Tab');await page.keyboard.press('Enter');
  assert.equal(await page.locator('#explanation-title').innerText(),'Regulate');
  assert.equal(await page.locator('#explanation-text').innerText(),'To govern an activity by establishing mandatory requirements for how it must be carried out.');
  await page.keyboard.press('Tab');await page.keyboard.press('Enter');
  assert.equal(await page.locator('[data-term="regulate"]').evaluate(b=>b===document.activeElement),true);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.locator('.term').nth(1).evaluate(b=>b===document.activeElement),true);
  await page.keyboard.press('Enter');await page.keyboard.press('Escape');
  assert.equal(await page.locator('.explanation').isVisible(),false);
  await page.locator('.term').first().click();await page.locator('.term').nth(1).click();
  assert.equal(await page.locator('[aria-expanded="true"]').count(),1);
  assert.equal(await page.locator('#explanation-title').innerText(),'Scope');
  const out=path.join(root,'exports/browser-review');fs.mkdirSync(out,{recursive:true});
  for(const width of [1040,390,320])for(const bg of ['white','ice']){
   await page.setViewportSize({width,height:900});
   await page.evaluate(bg=>document.body.style.background=bg==='ice'?'#e7edf4':'#fff',bg);
   for(const state of ['closed','requirement','scope','regulate']){
    await page.keyboard.press('Escape');
    if(state!=='closed')await page.locator(`[data-term="${state}"]`).click();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} ${state}: overflow`);
    await page.screenshot({path:path.join(out,`code-definition-${width}-${bg}-${state}.png`),fullPage:true});
   }
  }
  assert.deepEqual(errors,[]);
  await page.goto(pathToFileURL(path.join(root,'library/previews/scs101--lesson-1--code-definition.html')).href);
  await page.getByRole('button').click();
  const frame=page.frameLocator('iframe');await frame.locator('[data-term="scope"]').click();
  await page.screenshot({path:path.join(out,'code-definition-context-mobile-ice.png'),fullPage:true});
  assert.equal(await frame.locator('#explanation-title').innerText(),'Scope');
  console.log('PASS: final export, desktop/mobile, white/ice, term switching, keyboard activation, close/Escape, focus, no overflow or external requests; preview verified.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
