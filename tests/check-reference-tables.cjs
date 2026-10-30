// node tests/check-reference-tables.cjs <local Playwright module path>
const {chromium}=require(process.argv[2]||'playwright-core');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))errors.push(r.url())});
  for(const name of ['standards-organizations','technical-code-examples']){
   const data=JSON.parse(fs.readFileSync(path.join(root,`courses/scs101/lesson-2/${name}/block.json`))).data;
   for(const width of [1280,1040,900,768,700,390,320]){
    await page.setViewportSize({width,height:900});
    await page.goto(pathToFileURL(path.join(root,`exports/scs101--lesson-2--${name}--paste.html`)).href);
    await page.evaluate(()=>document.fonts.ready);
    assert.equal(await page.getByRole('table').count(),1);assert.equal(await page.getByRole('columnheader').count(),3);
    assert.equal(await page.getByRole('rowheader').count(),data.rows.length);
    for(let i=0;i<data.rows.length;i++){
     const row=page.locator('tbody tr').nth(i),expected=data.rows[i];
     assert.equal(await row.locator('th').evaluate(e=>e.lastChild.textContent),expected.organization||expected.discipline);
     assert.equal(await row.locator('.code-designation').textContent(),expected.designation);
     assert.equal(await row.locator('td').last().evaluate(e=>e.lastChild.textContent),expected.coverage);
     if(expected.publication)assert.equal(await row.locator('em').textContent(),expected.publication);
    }
    assert.ok(await page.evaluate(()=>[...document.querySelectorAll('[headers]')].every(e=>e.getAttribute('headers').split(' ').every(id=>document.getElementById(id)))));
    assert.equal(await page.locator('.mobile-label:visible').count(),0);
    const bounds=await page.locator('.table-surface').boundingBox();assert.ok(bounds.width<=(data.layout==='organizations'?880:960));
    if(width<=700){
     const a=await page.locator('tbody th').first().boundingBox(),b=await page.locator('tbody td').first().boundingBox();
     assert.ok(b.y>a.y);assert.equal(a.x,b.x);
    }else{
     assert.equal(await page.locator('tbody td').first().evaluate(e=>getComputedStyle(e).paddingTop),'9px');
     assert.ok(await page.locator('thead th').evaluateAll(cells=>cells.every(e=>getComputedStyle(e).verticalAlign==='middle')));
     assert.ok(await page.locator('thead th').evaluateAll(cells=>cells.every(e=>{const range=document.createRange();range.selectNodeContents(e);return range.getClientRects().length===1})), 'Single-line table headings');
    }
    for(const [bg,color] of [['white','#fff'],['ice','#e7edf4']]){
     await page.evaluate(c=>document.body.style.background=c,color);
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
     if([1040,768,390].includes(width))await page.screenshot({path:path.join(root,`exports/browser-review/reference-${name}-${width}-${bg}.png`),fullPage:true});
    }
    console.log(`${name} ${width}px: PASS`);
   }
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
