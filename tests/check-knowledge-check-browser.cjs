// Run against the final Lesson 2 export; argv[2] may specify a Playwright module.
const { chromium } = require(process.argv[2] || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const source = JSON.parse(fs.readFileSync(path.join(root, 'courses/scs101/lesson-2/knowledge-check/block.json'), 'utf8')).data;
const check = (condition, message) => { if (!condition) throw Error(message); };
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  try {
    const page = await browser.newPage();
    const external = [], errors = [];
    page.on('request', r => { if (/^https?:/.test(r.url())) external.push(r.url()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      window.completions = 0;
      window.addEventListener('message', e => { if (e.data?.type === 'complete') window.completions++; });
    });
    for (const width of [1040, 900, 768, 599, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(pathToFileURL(path.join(root, 'exports/scs101--lesson-2--knowledge-check--paste.html')).href);
      await page.evaluate(() => document.fonts.ready);
      const shot = async state => {
        check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'Overflow: ' + state);
        if ([1040, 390].includes(width)) for (const [name, color] of [['white', '#fff'], ['ice', '#e7edf4']]) {
          await page.evaluate(c => document.body.style.background = c, color);
          await page.screenshot({ path: path.join(root, `exports/browser-review/lesson-2-kc-${width}-${state}-${name}.png`), fullPage: true });
        }
      };
      check(await page.locator('[data-question]:visible').count() === 1, 'Sequential presentation');
      await shot('initial');
      await page.keyboard.press('Tab');
      check(await page.locator('input').first().evaluate(e => e === document.activeElement && parseFloat(getComputedStyle(e).outlineWidth) >= 3), 'Radio keyboard focus');
      await page.keyboard.press('ArrowDown');
      check(await page.locator('input').nth(1).isChecked(), 'Arrow key selection');
      await page.keyboard.press('Tab');
      check(await page.locator('[data-check]').first().evaluate(e => e === document.activeElement && parseFloat(getComputedStyle(e).outlineWidth) >= 3), 'Button focus');
      for (let i = 0; i < 2; i++) {
        const q = page.locator('[data-question]').nth(i), expected = source.questions[i];
        check(await q.locator('h2').textContent() === expected.question, 'Question copy');
        // Empty submission must show an error and remain on the current question.
        await q.locator('input').evaluateAll(inputs => inputs.forEach(input => input.checked = false));
        await q.locator('[data-check]').click();
        check(await q.locator('[data-error]').isVisible(), 'Empty selection error');
        const options = q.locator('[data-option]');
        const wrong = expected.answers.map((a, n) => a.correct ? -1 : n).filter(n => n >= 0);
        for (const n of wrong) {
          await options.nth(n).locator('input').check();
          await shot(`q${i + 1}-selected-${n}`);
          await q.locator('[data-check]').click();
          check(await options.nth(n).getAttribute('data-result') === 'wrong', 'Incorrect state');
          check(await q.locator('[data-feedback-text]').textContent() === expected.answers[n].feedback, 'Incorrect feedback copy');
          check(!await q.locator('[data-next]').isVisible(), 'No advance before success');
          check(await q.locator('[data-feedback]').evaluate(e => e === document.activeElement), 'Feedback focus');
          await shot(`q${i + 1}-wrong-${n}`);
        }
        const n = expected.answers.findIndex(a => a.correct);
        await options.nth(n).locator('input').check();
        await q.locator('[data-check]').click();
        check(await options.nth(n).getAttribute('data-result') === 'correct', 'Correct state');
        check(await q.locator('[data-feedback-text]').textContent() === expected.answers[n].feedback, 'Correct feedback copy');
        check(await q.locator('[data-next]').isVisible(), 'Advance available after success');
        await shot(`q${i + 1}-correct`);
        await q.locator('[data-next]').click();
      }
      check(await page.locator('[data-done]').isVisible(), 'Completion');
      await page.waitForFunction(() => window.completions === 1);
      await shot('complete');
      await page.locator('[data-retry]').click();
      check(await page.locator('[data-question]').first().isVisible(), 'Restart');
      check(await page.locator('input:disabled').count() === 0, 'Restart resets all answers');
      console.log(width + 'px: PASS keyboard, errors, all feedback, retries, advance, completion and restart');
    }
    check(!external.length && !errors.length, JSON.stringify({ external, errors }));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
