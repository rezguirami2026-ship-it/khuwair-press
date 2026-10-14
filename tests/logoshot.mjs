// Uploads real logo files through the app's file inputs, then renders pages: node tests/logoshot.mjs out.png dir '<json cases>' [scale]
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { writeFileSync } from 'node:fs';
const [,, out, dir, json, scale = '0.6'] = process.argv;
const cases = JSON.parse(json);
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1300, height:900}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:4321/dist/single/khuwair-press.html?test'); await p.waitForFunction(() => window.__kp); await p.evaluate(() => window.__kp.fontsReady());
for(const [key, f] of [['school', 'logokhwair.jpeg'], ['center', 'moe-ministry-logo.png'], ['side', 'Oman_Vision_2040_logo.png']]){
  await p.setInputFiles('#logo-' + key, dir + '/' + f);
  await p.waitForFunction(k => window.__kp.logoImg[k], key);
}
const imgs = [];
for(const c of cases){
  const r = await p.evaluate(c => {
    const kp = window.__kp, st = kp.state;
    st.type = c.type; st.theme = c.theme || 'maroon';
    Object.assign(st.docs[c.type], {layout:c.layout}, c.kind ? {kind:c.kind} : {}, c.doc || {});
    return kp.render(c.px || (c.type === 'cert' ? 1600 : 1100), 0, true);
  }, c);
  imgs.push(PNG.sync.read(Buffer.from(r.url.split(',')[1], 'base64')));
  console.log(c.type, c.layout, 'over:', r.over);
}
const s = +scale, g = 12, ws = imgs.map(i => Math.round(i.width * s)), hs = imgs.map(i => Math.round(i.height * s));
const perRow = Math.min(imgs.length, Math.max(1, Math.floor(2400 / (Math.max(...ws) + g))));
const rows = Math.ceil(imgs.length / perRow), cw = Math.max(...ws), ch = Math.max(...hs);
const o = new PNG({width:perRow * (cw + g) + g, height:rows * (ch + g) + g}); o.data.fill(200);
imgs.forEach((im, k) => { const ox = g + (k % perRow) * (cw + g), oy = g + Math.floor(k / perRow) * (ch + g);
  for(let y = 0; y < hs[k]; y++) for(let x = 0; x < ws[k]; x++){ const si = (Math.floor(y / s) * im.width + Math.floor(x / s)) * 4, di = ((y + oy) * o.width + ox + x) * 4; for(let q = 0; q < 4; q++) o.data[di + q] = im.data[si + q]; } });
writeFileSync(out, PNG.sync.write(o)); console.log('errors:', errs); await b.close();
