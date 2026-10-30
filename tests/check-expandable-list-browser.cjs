// Verify the final export. Pass a local Playwright module path as argv[2].
const { chromium } = require(process.argv[2] || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'courses/scs101/lesson-2/what-standards-cover/block.json'), 'utf8')).data;
const check = (condition, message) => { if (!condition) throw Error(message); };
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    const errors = [], external = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('request', r => { if (/^https?:/.test(r.url())) external.push(r.url()); });
    for (const width of [1040, 900, 768, 640, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(pathToFileURL(path.join(root, 'exports/scs101--lesson-2--what-standards-cover--paste.html')).href);
      await page.evaluate(() => document.fonts.ready);
      const summaries = page.locator('summary');
      check(await summaries.count() === 4, 'Four rows');
      check(await page.locator('details[open]').count() === 0, 'Initially closed');
      for (let i = 0; i < 4; i++) {
        const row = page.locator('details').nth(i), expected = source.rows[i];
        check(await row.locator('.row-heading').textContent() === expected.heading, 'Heading copy');
        check(await row.locator('.row-summary').textContent() === expected.summary, 'Summary copy');
        check(await row.locator('.row-body > p').textContent() === expected.explanation, 'Explanation copy');
        check(await row.locator('.row-example p').nth(1).textContent() === `${expected.exampleCode}, ${expected.exampleTitle}, ${expected.exampleText}`, 'Example copy');
        check(!await row.locator('.row-body').isVisible(), 'Closed content hidden');
      }
      await page.keyboard.press('Tab');
      check(await summaries.first().evaluate(e => e === document.activeElement && parseFloat(getComputedStyle(e).outlineWidth) >= 3), 'Visible keyboard focus');
      await page.keyboard.press('Enter');
      check(await page.locator('details[open]').count() === 1, 'Enter opens');
      await page.keyboard.press('Space');
      check(await page.locator('details[open]').count() === 0, 'Space closes');
      for (let i = 0; i < 4; i++) {
        await page.keyboard.press('Enter');
        if (i < 3) await page.keyboard.press('Tab');
      }
      check(await page.locator('details[open]').count() === 4, 'Multiple open via keyboard');
      for (const state of ['open', 'closed']) {
        if (state === 'closed') for (let i = 0; i < 4; i++) await summaries.nth(i).click();
        for (const [name, color] of [['white', '#fff'], ['ice', '#e7edf4']]) {
          await page.evaluate(c => document.body.style.background = c, color);
          check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'No overflow');
          check(await page.evaluate(() => [...document.fonts].every(f => f.status === 'loaded')), 'Embedded fonts loaded');
          if ([1040, 390].includes(width)) {
            await page.screenshot({ path: path.join(root, `exports/browser-review/lesson-2-expandable-${width}-${state}-${name}.png`), fullPage: true });
          }
        }
      }
      console.log(`${width}px: PASS copy, keyboard, independent disclosure, focus, layouts`);
    }
    check(!errors.length && !external.length, JSON.stringify({ errors, external }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
