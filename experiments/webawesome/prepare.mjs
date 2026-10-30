import fs from 'node:fs';
import path from 'node:path';
const root=import.meta.dirname, source=path.join(root,'package/dist-cdn'), dest=path.join(root,'vendor'),seen=new Set();
function copy(rel){
 const p=path.resolve(source,rel); if(seen.has(p))return;
 if(!p.startsWith(source+path.sep))throw Error(p);seen.add(p);
 const out=path.join(dest,path.relative(source,p));fs.mkdirSync(path.dirname(out),{recursive:true});fs.copyFileSync(p,out);
 const text=fs.readFileSync(p,'utf8'),regex=p.endsWith('.js')?/(?:from\s*|import\s*)['"]([^'"]+)['"]/g:/@import\s+(?:url\()?\s*['"]([^'"]+)/g;
 for(const [,ref] of text.matchAll(regex)){if(p.endsWith('.js')&&!ref.startsWith('.'))throw Error(ref);copy(path.relative(source,path.resolve(path.dirname(p),ref)));}
}
for(const n of ['callout','card','details'])copy(`components/${n}/${n}.js`);
copy('styles/themes/default.css');fs.copyFileSync(path.join(root,'package/LICENSE.md'),path.join(dest,'LICENSE.md'));
const files=[...seen].map(p=>({file:path.relative(source,p).replaceAll('\\','/'),bytes:fs.statSync(p).size}));
fs.writeFileSync(path.join(root,'asset-manifest.json'),JSON.stringify({version:'3.14.0',totalBytes:files.reduce((s,p)=>s+p.bytes,0),files},null,2));
console.log(files.length,files.reduce((s,p)=>s+p.bytes,0));
