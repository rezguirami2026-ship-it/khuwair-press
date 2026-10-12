// Renders chosen gallery entries side by side: node tests/gshot.mjs out.png id1 id2 ... [--gold] [--ink]
import { chromium } from '@playwright/test';
const args = process.argv.slice(2), out = args.shift(), flags = args.filter(a => a.startsWith('--')), ids = args.filter(a => !a.startsWith('--'));
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1800, height:900}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('http://localhost:4321/dist/gallery/gallery.html'); await p.waitForFunction(() => window.__gallery);
const urls = await p.evaluate(({ids, flags}) => ids.map(id => window.__gallery.render(id, Object.assign({}, flags.includes('--gold') ? {accent:'gold', gold:true} : {}, flags.includes('--ink') ? {ink:true} : {}))), {ids, flags});
await p.setContent('<body style="margin:0;background:#ccc;display:flex;gap:8px;padding:8px;align-items:flex-start">' + urls.map(u => `<img src="${u}" style="width:${Math.floor(1780 / urls.length) - 8}px;background:#fff">`).join('') + '</body>');
await p.waitForTimeout(200);
await p.screenshot({path:out, fullPage:true}); console.log('errors:', errs); await b.close();
