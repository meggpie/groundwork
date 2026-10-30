// node tests/check-knowledge-check.cjs <local playwright-core path>
const {chromium}=require(process.argv[2]||'playwright-core');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');const root=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(root,'courses/scs101/lesson-2/knowledge-check/block.json'))).data;
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage({reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))errors.push(r.url())});
  const out=path.join(root,'exports/browser-review');fs.mkdirSync(out,{recursive:true});
  for(const width of [960,800,720,640,390,320])for(const bg of ['#104c8f']){
   await page.setViewportSize({width,height:1000});
   await page.goto(pathToFileURL(path.join(root,'exports/scs101--lesson-2--knowledge-check--paste.html')).href);
   await page.evaluate(()=>document.fonts.ready);await page.evaluate(bg=>document.body.style.background=bg,bg);
   const snap=async state=>{assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow');await page.screenshot({path:path.join(out,`lesson-2-approved-kc-${width}-${'blue'}-${state}.png`),fullPage:true})};
   assert.ok(await page.locator('.kc-action').isDisabled());await snap('initial');
   for(let q=0;q<2;q++){
    const question=data.questions[q];assert.equal(await page.locator('legend').innerText(),question.question);
    assert.equal(await page.locator('.kc-counter').innerText(),`Question ${q+1} of 2`);
    assert.deepEqual(await page.locator('.kc-option span').allTextContents(),question.answers.map(a=>a.text));
    for(let i=0;i<question.answers.length;i++)if(!question.answers[i].correct){
     await page.getByRole('radio').nth(i).check();if(q===0&&i===0)await snap('selected');await page.getByRole('button',{name:'Check Answer',exact:true}).click();
     assert.equal(await page.locator('.kc-feedback p').innerText(),question.answers[i].feedback);
     assert.equal(await page.locator('.kc-feedback strong').innerText(),'Not quite. Try again.');
     assert.equal(await page.locator('.kc-option[data-result=incorrect]').count(),1);
     assert.equal(await page.locator('.kc-option[data-result] .kc-result').count(),1);
     assert.equal(await page.locator('.kc-feedback .kc-result').count(),1);
     assert.equal(await page.locator('.kc-option[data-result]').evaluate(e=>getComputedStyle(e).borderTopColor),await page.locator('.kc-feedback').evaluate(e=>getComputedStyle(e).borderTopColor));
     assert.equal(await page.getByRole('button',{name:'Next Question'}).count(),0);
     assert.ok(await page.locator('fieldset').evaluate(e=>!e.disabled));
    }
    await snap(`q${q+1}-incorrect`);
    const index=question.answers.findIndex(a=>a.correct);await page.getByRole('radio').nth(index).check();
    assert.ok(await page.locator('.kc-feedback').isHidden());
    assert.equal(await page.locator('.kc-option[data-result]').count(),0);
    await page.getByRole('button',{name:'Check Answer',exact:true}).click();
    assert.equal(await page.locator('.kc-feedback p').innerText(),question.answers[index].feedback);
    assert.equal(await page.locator('.kc-feedback strong').innerText(),'Correct.');
    assert.equal(await page.locator('.kc-option[data-result=correct]').count(),1);
    assert.equal(await page.locator('.kc-feedback .kc-result').count(),1);
    assert.ok(await page.locator('fieldset').evaluate(e=>e.disabled));assert.ok(await page.getByRole('radio').first().isDisabled());
    assert.ok(await page.locator('.kc-action').evaluate(e=>e===document.activeElement));
    await snap(`q${q+1}-correct`);await page.locator('.kc-action').click();
    assert.ok(await page.locator(q===0?'legend':'.kc-complete h2').evaluate(e=>e===document.activeElement));
   }
   assert.ok(await page.locator('.kc-complete').isVisible());assert.ok(await page.locator('form').isHidden());await snap('complete');
  }
  // Native keyboard operation and focus, using Lesson 2 answer order.
  await page.goto(pathToFileURL(path.join(root,'exports/scs101--lesson-2--knowledge-check--paste.html')).href);
  await page.keyboard.press('Tab');assert.ok(await page.getByRole('radio').first().evaluate(e=>e===document.activeElement));
  await page.keyboard.press('Space');
  assert.ok(await page.locator('.kc-option').first().evaluate(e=>parseFloat(getComputedStyle(e).outlineWidth)>=3));
  await page.keyboard.press('Tab');await page.keyboard.press('Enter');assert.equal(await page.locator('.kc-feedback strong').innerText(),'Correct.');
  await page.keyboard.press('Enter');assert.ok(await page.locator('legend').evaluate(e=>e===document.activeElement));
  await page.keyboard.press('Tab');await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Tab');await page.keyboard.press('Enter');assert.equal(await page.locator('.kc-feedback strong').innerText(),'Correct.');
  await page.keyboard.press('Enter');assert.ok(await page.locator('.kc-complete').isVisible());
  await page.setViewportSize({width:900,height:1000});await page.goto(pathToFileURL(path.join(root,'library/previews/scs101--lesson-2--knowledge-check.html')).href);
  assert.equal(await page.locator('section').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(16, 76, 143)');await page.screenshot({path:path.join(out,'lesson-2-approved-kc-context.png'),fullPage:true});
  assert.deepEqual(errors,[]);console.log('PASS: final export, six widths on dark-blue, every incorrect feedback/retry, both correct paths, locking/progression/completion, native keyboard and focus, no overflow/external requests; preview.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
