// One-off course block: node courses/scs101/lesson-1/bringing-it-together/build.cjs
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../..');
const fonts = path.join(root, 'experiments/fonts');
const faces = [
  ['Archivo', 700, 'archivo-latin-700-normal.woff2'],
  ['Atkinson Hyperlegible Next', 400, 'atkinson-hyperlegible-next-latin-400-normal.woff2'],
  ['Atkinson Hyperlegible Next', 700, 'atkinson-hyperlegible-next-latin-700-normal.woff2']
].map(([family, weight, file]) => `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;src:url(data:font/woff2;base64,${fs.readFileSync(path.join(fonts, file)).toString('base64')}) format('woff2')}`).join('\n');
const licences = ['OFL-Archivo.txt', 'OFL-Atkinson-Hyperlegible-Next.txt'].map(file => fs.readFileSync(path.join(fonts, file), 'utf8')).join('\n').replaceAll('--', '—');
const foundation = fs.readFileSync(path.join(root, 'experiments/groundwork-foundation.css'), 'utf8');
const page = fs.readFileSync(path.join(__dirname, 'block.html'), 'utf8').replace('/* EMBED_FONTS */', faces).replace('/* EMBED_FOUNDATION */', foundation).replace('</body>', `<!-- Embedded font licences:\n${licences}\n--></body>`);
const name = 'scs101--lesson-1--bringing-it-together';
const output = path.join(root, 'exports', name + '--paste.html');
fs.writeFileSync(output, page);
const escape = text => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const preview = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SCS101 Lesson 1 · Lesson 1 principles preview</title><style>*{box-sizing:border-box}body{margin:0;color:#1d2030;font:18px/1.5 system-ui;background:white}header{padding:20px;background:#f8fafc;font-size:15px}h1{font-size:22px;margin:0 0 8px}button{font:inherit;padding:8px 14px;cursor:pointer}button:focus-visible{outline:3px solid #3656bd;outline-offset:3px}.lesson{max-width:1040px;margin:auto;padding:28px 24px}.lesson>p{margin:0 8px 24px}iframe{border:0;width:100%;display:block;height:600px}.ice{background:#e7edf4}@media(max-width:480px){.lesson{padding:24px 8px}}</style></head><body><header><h1>SCS101 · Lesson 1 · Code</h1><p>Static summary · exact export shown below. Edit block.html and run the adjacent build.cjs to regenerate.</p><button aria-pressed="false">Use ice-blue background</button></header><div class="lesson"><h2>Bringing it all together</h2><iframe title="Lesson 1 principles" srcdoc="${escape(page)}"></iframe></div><script>const frame=document.querySelector('iframe');frame.addEventListener('load',()=>{const doc=frame.contentDocument;const resize=()=>frame.style.height=Math.ceil(doc.body.getBoundingClientRect().height+4)+'px';new ResizeObserver(resize).observe(doc.body);doc.fonts.ready.then(resize);resize()});document.querySelector('button').addEventListener('click',e=>{const ice=document.body.classList.toggle('ice');e.target.setAttribute('aria-pressed',String(ice));e.target.textContent=ice?'Use white background':'Use ice-blue background'});</script></body></html>`;
fs.writeFileSync(path.join(root, 'library/previews', name + '.html'), preview);
console.log(output);

