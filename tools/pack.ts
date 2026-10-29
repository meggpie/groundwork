#!/usr/bin/env bun
/**
 * Groundwork packer: turns a block's HTML into ONE self-contained file to paste into a Rise code block.
 *
 *   bun tools/pack.ts blocks/flashcards.html            -> exports/flashcards.html
 *   bun tools/pack.ts courses/SCS101/m2-l3-review.html  -> exports/m2-l3-review.html
 *
 * What it embeds (nothing is loaded from the internet):
 *   - only the Web Awesome components the block uses (any <wa-…> tag, or listed in data-gw-components)
 *   - only the Lucide icons the block names (<wa-icon name="…">, or listed in data-gw-icons)
 *   - Web Awesome base styles + theme/groundwork.css, with the fonts as base64
 *   - window.gwComplete(): reports Rise completion once
 *
 * A block source is a normal HTML document: <title>, the block's own <style> in <head>,
 * markup in <body>, and any block JavaScript as <script type="module"> (it runs after the components load).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, mkdtempSync } from 'fs';
import { resolve, dirname, basename, join } from 'path';

const ROOT = resolve(dirname(import.meta.path), '..');
const WA = join(ROOT, 'vendor/webawesome');
const ICONS = JSON.parse(readFileSync(join(ROOT, 'vendor/lucide/icons.json'), 'utf8')) as Record<string, string>;

const src = process.argv[2];
if (!src) { console.error('Usage: bun tools/pack.ts <block.html> [out.html]'); process.exit(1); }
const srcPath = resolve(src);
const outPath = resolve(process.argv[3] || join(ROOT, 'exports', basename(srcPath)));
let page = readFileSync(srcPath, 'utf8');

const fail = (msg: string) => { console.error('ERROR: ' + msg); process.exit(1); };
const words = (re: RegExp) => [...page.matchAll(re)].flatMap(m => m[1].split(/[\s,]+/)).filter(Boolean);

// 1. Components used
const tags = new Set([...page.matchAll(/<(wa-[a-z0-9-]+)/g)].map(m => m[1]));
for (const t of words(/data-gw-components="([^"]*)"/g)) tags.add(t.startsWith('wa-') ? t : 'wa-' + t);
const missing = [...tags].filter(t => !existsSync(join(WA, t.slice(3) + '.js')));
if (missing.length) fail('Not in vendor/webawesome (free components only): ' + missing.join(', '));

// 2. Icons used
const iconNames = new Set([...words(/<wa-icon[^>]*\sname="([^"]+)"/g), ...words(/data-gw-icons="([^"]*)"/g)]);
const unknown = [...iconNames].filter(n => !ICONS[n]);
if (unknown.length) fail('Unknown Lucide icon(s): ' + unknown.join(', ') + ' (see https://lucide.dev/icons)');
const icons = Object.fromEntries([...iconNames].map(n => [n, ICONS[n]]));

// 3. Bundle only what's needed
const tmp = mkdtempSync(join(ROOT, '.pack-tmp-')); // unique per run, so packs can run in parallel
const entry = join(tmp, 'entry.js');
writeFileSync(entry, `
import { registerIconLibrary } from ${JSON.stringify(join(WA, 'icon-library.js'))};
${[...tags].map(t => `import ${JSON.stringify(join(WA, t.slice(3) + '.js'))};`).join('\n')}
const icons = ${JSON.stringify(icons)};
const svg = body => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + body + '</svg>';
registerIconLibrary('default', { resolver: name => icons[name] ? 'data:image/svg+xml,' + encodeURIComponent(svg(icons[name])) : '' });
let done = false;
window.gwComplete = () => { if (done) return; done = true; try { window.parent.postMessage({ type: 'complete' }, '*'); } catch (_) {} };
`);
const built = await Bun.build({ entrypoints: [entry], minify: true, target: 'browser', format: 'esm' });
rmSync(tmp, { recursive: true, force: true });
if (!built.success) { console.error(built.logs); process.exit(1); }
const js = (await built.outputs[0].text()).replace(/<\/script/gi, '<\\/script');

// 4. Styles + fonts (Plex Mono only when the block uses numbers/eyebrows)
const usesMono = /gw-num|gw-eyebrow|font-family-code|wa-(progress|format-number|number-input|pagination)/.test(page);
let css = readFileSync(join(WA, 'webawesome-base.css'), 'utf8') + '\n' + readFileSync(join(ROOT, 'theme/groundwork.css'), 'utf8');
if (!usesMono) css = css.replace(/@font-face\s*\{[^}]*IBM Plex Mono[^}]*\}/, '');
css = css.replace(/url\('fonts\/([\w.-]+\.woff2)'\)/g, (_m, f) =>
  `url(data:font/woff2;base64,${readFileSync(join(ROOT, 'theme/fonts', f)).toString('base64')})`);

// 5. Assemble
if (!/<head[^>]*>/i.test(page) || !/<\/body>/i.test(page)) fail('Block source must be a full HTML document with <head> and <body>.');
page = page.replace(/<head([^>]*)>/i, (_m, a) => `<head${a}>\n<style>${css}</style>`);
// (function replacements: the bundle contains `$` sequences that string replacements would expand)
page = page.replace(/<\/head>/i, () => `<script type="module">${js}</script>\n</head>`);
if (!/<html[^>]*class=/.test(page)) page = page.replace(/<html/i, () => '<html class="wa-cloak"');

// 6. Guard: nothing may load from the network
const external = [...page.matchAll(/<(?:script|link|img|source|iframe)\b[^>]*\s(?:src|href)="(https?:)?\/\/[^"]+"/gi), ...page.matchAll(/@import\s+url\(\s*['"]?https?:/gi), ...page.matchAll(/url\(\s*['"]?https?:/gi)];
if (external.length) fail('External resource found; Rise blocks must be self-contained:\n' + external.map(m => '  ' + m[0].slice(0, 120)).join('\n'));

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, page);
console.log(`Created ${outPath} (${Math.round(page.length / 1024)} KB)`);
console.log(`  components: ${[...tags].join(', ') || 'none'}`);
console.log(`  icons: ${[...iconNames].join(', ') || 'none'}${usesMono ? '' : '  · IBM Plex Mono not embedded'}`);
