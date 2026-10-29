#!/usr/bin/env node
/**
 * Groundwork preview check for a packed block (needs Playwright, which Claude's workspace has).
 *
 *   node tools/preview.cjs exports/flashcards.html [--ice] [--out dir]
 *
 * Renders at 920px (Rise block width), 1280px (laptop page) and 390px (phone) with the network blocked,
 * on a white section (or ice with --ice), saves full-page screenshots, and reports:
 * network requests, console errors, undefined <wa-*> tags, icons that failed, horizontal overflow, fonts loaded.
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const file = args.find(a => !a.startsWith('--'));
if (!file) { console.error('Usage: node tools/preview.cjs <packed.html> [--ice] [--out dir]'); process.exit(1); }
const ice = args.includes('--ice');
const outDir = args.includes('--out') ? args[args.indexOf('--out') + 1] : path.join(path.dirname(path.resolve(file)), 'preview');
fs.mkdirSync(outDir, { recursive: true });
const name = path.basename(file, '.html') + (ice ? '-ice' : '');

(async () => {
  const browser = await chromium.launch();
  let problems = 0;
  for (const [label, width] of [['920', 920], ['1280', 1280], ['390', 390]]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1.5 });
    const net = [], errors = [];
    await page.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file:') || u.startsWith('data:')) return r.continue(); net.push(u); r.abort(); });
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text().slice(0, 200)); });
    page.on('pageerror', e => errors.push('script error: ' + e.message));
    await page.addInitScript(() => { window.__gwComplete = 0; window.parent.postMessage = d => { if (d && d.type === 'complete') window.__gwComplete++; }; });
    if (ice) await page.addInitScript(() => document.addEventListener('DOMContentLoaded', () => { document.documentElement.style.background = 'var(--gw-ice)'; }));
    await page.goto('file://' + path.resolve(file));
    await page.waitForTimeout(900);
    const r = await page.evaluate(async () => {
      await document.fonts.ready;
      const all = [...document.querySelectorAll('*')];
      return {
        undefinedTags: [...new Set(all.filter(e => e.localName.startsWith('wa-') && !customElements.get(e.localName)).map(e => e.localName))],
        brokenIcons: [...document.querySelectorAll('wa-icon')].filter(i => i.offsetParent && !i.shadowRoot?.querySelector('svg')).map(i => i.getAttribute('name')),
        overflowPx: document.documentElement.scrollWidth - innerWidth,
        fonts: [...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family} ${f.weight}`),
      };
    });
    const shot = path.join(outDir, `${name}-${label}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    const bad = net.length || errors.length || r.undefinedTags.length || r.brokenIcons.length || r.overflowPx > 0;
    if (bad) problems++;
    console.log(`${bad ? 'CHECK' : 'OK   '} ${label}px  ${shot}`);
    if (net.length) console.log('   network requests:', net.slice(0, 5));
    if (errors.length) console.log('   console:', errors.slice(0, 5));
    if (r.undefinedTags.length) console.log('   undefined components:', r.undefinedTags);
    if (r.brokenIcons.length) console.log('   icons not rendered:', r.brokenIcons);
    if (r.overflowPx > 0) console.log('   horizontal overflow:', r.overflowPx + 'px');
    if (label === '920') console.log('   fonts:', r.fonts.join(', '));
    await page.close();
  }
  await browser.close();
  process.exit(problems ? 2 : 0);
})();
