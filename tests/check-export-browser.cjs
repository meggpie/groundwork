// Development-only check. Pass the temporary playwright-core module path as argv[2].
// Tests the generated exports directly; does not regenerate or modify them.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { chromium } = require(process.argv[2] || 'playwright-core');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'exports/browser-review');
fs.mkdirSync(output, { recursive: true });
const report = { browser: '', files: [], failures: [] };
function check(condition, message) { if (!condition) report.failures.push(message); }

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true
  });
  report.browser = await browser.version();
  try {
    for (const file of ['demo--review-concepts--paste.html', 'flashcards--explore--paste.html', 'flashcards--recall--paste.html']) {
      const context = await browser.newContext({ viewport: { width: 1040, height: 900 }, reducedMotion: 'reduce' });
      const external = [], errors = [], requests = [];
      await context.route('**/*', route => {
        if (/^https?:/.test(route.request().url())) { external.push(route.request().url()); return route.abort(); }
        return route.continue();
      });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      page.on('request', request => requests.push(request.url()));
      const url = pathToFileURL(path.join(root, 'exports', file)).href;
      await page.goto(url);
      await page.evaluate(() => document.fonts.ready);
      const cards = page.locator('[data-card]');
      const count = await cards.count();
      const assetState = await page.evaluate(() => ({
        fonts: [...document.fonts].map(f => ({ family: f.family, weight: f.weight, status: f.status })),
        images: [...document.images].map(i => ({ embedded: i.src.startsWith('data:'), loaded: i.complete && i.naturalWidth > 0 })),
        headingFont: getComputedStyle(document.querySelector('.practice-term')).fontFamily,
        bodyFont: getComputedStyle(document.body).fontFamily,
        tracking: document.querySelector('[data-flashcards]').dataset.tracking === 'true'
      }));
      check(assetState.fonts.length === 3 && assetState.fonts.every(f => f.status === 'loaded'), file + ': embedded font load');
      check(assetState.images.every(i => i.embedded && i.loaded), file + ': embedded artwork load');
      check((await cards.first().getAttribute('aria-pressed')) === 'false', file + ': initial front state');

      await page.keyboard.press('Tab');
      check(await cards.first().evaluate(b => document.activeElement === b), file + ': native Tab focus');
      await page.keyboard.press('Enter');
      check(await cards.first().getAttribute('aria-pressed') === 'true', file + ': Enter reveals');
      const focus = await cards.first().evaluate(b => ({ retained: document.activeElement === b, outline: getComputedStyle(b).outlineWidth }));
      check(focus.retained && parseFloat(focus.outline) >= 3, file + ': visible retained keyboard focus');
      await page.screenshot({ path: path.join(output, file.replace('.html', '-keyboard-focus-white.png')), fullPage: true });
      await page.keyboard.press('Space');
      check(await cards.first().getAttribute('aria-pressed') === 'false', file + ': Space returns to front');
      if (assetState.tracking) check((await page.locator('[data-progress]').innerText()).startsWith('1 of'), file + ': viewed count persists');
      else check(await page.locator('[data-progress]').count() === 0, file + ': tracking omitted');
      await cards.nth(1).click();
      check(await cards.nth(1).getAttribute('aria-pressed') === 'true' && await cards.first().getAttribute('aria-pressed') === 'false', file + ': independent click toggle');
      await page.screenshot({ path: path.join(output, file.replace('.html', '-desktop-mixed-white.png')), fullPage: true });

      const layouts = [];
      for (const width of [1280, 1040, 900, 760, 390, 320]) {
        await page.setViewportSize({ width, height: 900 });
        for (const background of ['#ffffff', '#e7edf4']) {
          // Only the surrounding page canvas changes; component styles stay untouched.
          await page.evaluate(color => { document.documentElement.style.background = color; }, background);
          const state = await page.evaluate(() => {
            const boxes = [...document.querySelectorAll('[data-card]')].map(b => {
              const r = b.getBoundingClientRect();
              return { x: r.x, y: r.y, width: r.width, height: r.height, overflow: b.scrollWidth > b.clientWidth + 1 };
            });
            return { width: innerWidth, documentWidth: document.documentElement.scrollWidth, boxes };
          });
          check(state.documentWidth <= width + 1 && state.boxes.every(b => !b.overflow), file + ': no clipping/overflow at ' + width + ' / ' + background);
          if (width <= 760) check(state.boxes.every(b => Math.abs(b.x - state.boxes[0].x) < 1), file + ': single column at ' + width);
          if (width > 760 && count === 3) {
            const third = state.boxes[2];
            check(Math.abs(third.x + third.width / 2 - width / 2) < 2, file + ': third card centred at ' + width);
          }
          layouts.push({ width, background, ...state });
          if (width === 390) await page.screenshot({ path: path.join(output, file.replace('.html', '-mobile-mixed-' + (background === '#ffffff' ? 'white' : 'ice') + '.png')), fullPage: true });
        }
      }
      for (let i = 0; i < count; i++) if (await cards.nth(i).getAttribute('aria-pressed') !== 'true') await cards.nth(i).click();
      if (assetState.tracking) check((await page.locator('[data-progress]').innerText()).startsWith(`${count} of ${count}`), file + ': all-viewed feedback');
      check(await cards.evaluateAll(all => all.every(b => b.querySelector('.front').hidden && !b.querySelector('.back').hidden)), file + ': all back faces replace fronts');
      await page.screenshot({ path: path.join(output, file.replace('.html', '-mobile-all-backs-ice.png')), fullPage: true });
      await page.setViewportSize({ width: 1040, height: 900 });
      await page.screenshot({ path: path.join(output, file.replace('.html', '-desktop-all-backs-ice.png')), fullPage: true });
      // Text-size stress check; this is separate from the approved default appearance.
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      const enlarged = [];
      for (const width of [1040, 390]) {
        await page.setViewportSize({ width, height: 900 });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1 || [...document.querySelectorAll('[data-card]')].some(b => b.scrollWidth > b.clientWidth + 1));
        enlarged.push({ width, overflow });
        check(!overflow, file + ': 200% root text size at ' + width);
        if (overflow) await page.screenshot({ path: path.join(output, file.replace('.html', '-enlarged-overflow.png')), fullPage: true });
      }
      check(external.length === 0, file + ': no external network requests');
      check(errors.length === 0, file + ': no browser errors: ' + errors.join('; '));
      report.files.push({ file, count, assetState, focus, external, errors, requests, layouts, enlarged });
      await context.close();
    }
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
  }
  console.log(JSON.stringify({ browser: report.browser, exportsTested: report.files.length, failures: report.failures, evidence: output }, null, 2));
  if (report.failures.length) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
