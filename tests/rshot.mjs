// Renders app pages through the test hook: node tests/rshot.mjs out.png '<json array of cases>' [scale]
// case: {type, layout, theme?, kind?, doc?, school?, rec?, gold?, ink?, tfont?}
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { writeFileSync } from 'node:fs';
const [,, out, json, scale = '0.5'] = process.argv;
const cases = JSON.parse(json.startsWith('@') ? (await import('node:fs')).readFileSync(json.slice(1), 'utf8') : json);
const b = await chromium.launch(); const p = await b.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:4321/dist/single/khuwair-press.html?test'); await p.waitForFunction(() => window.__kp); await p.evaluate(() => window.__kp.fontsReady());
const imgs = [];
for(const c of cases){
  const r = await p.evaluate(c => {
    const kp = window.__kp, st = kp.state, fresh = kp.migrate(null);
    Object.assign(st, JSON.parse(JSON.stringify(fresh)));
    st.type = c.type; st.theme = c.theme || 'maroon'; if(c.tfont) st.tfont = c.tfont; if(c.gold !== undefined) st.gold = c.gold; if(c.ink) st.ink = true;
    Object.assign(st.docs[c.type], {layout:c.layout}, c.kind ? {kind:c.kind} : {}, c.doc || {}); Object.assign(st.school, c.school || {});
    return kp.render(c.type === 'cert' ? 1400 : 1000, c.rec || 0, true);
  }, c);
  imgs.push(PNG.sync.read(Buffer.from(r.url.split(',')[1], 'base64')));
  console.log(c.type, c.layout, c.kind || '', 'over:', r.over);
}
const s = +scale, g = 12, ws = imgs.map(i => Math.round(i.width * s)), hs = imgs.map(i => Math.round(i.height * s));
const perRow = Math.min(imgs.length, Math.max(1, Math.floor(2200 / (Math.max(...ws) + g))));
const rows = Math.ceil(imgs.length / perRow), cw = Math.max(...ws), ch = Math.max(...hs);
const o = new PNG({width:perRow * (cw + g) + g, height:rows * (ch + g) + g}); o.data.fill(200);
imgs.forEach((im, k) => { const ox = g + (k % perRow) * (cw + g), oy = g + Math.floor(k / perRow) * (ch + g);
  for(let y = 0; y < hs[k]; y++) for(let x = 0; x < ws[k]; x++){ const si = (Math.floor(y / s) * im.width + Math.floor(x / s)) * 4, di = ((y + oy) * o.width + ox + x) * 4; for(let q = 0; q < 4; q++) o.data[di + q] = im.data[si + q]; } });
writeFileSync(out, PNG.sync.write(o)); console.log('errors:', errs); await b.close();
