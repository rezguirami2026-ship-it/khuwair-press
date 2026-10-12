// Ad-hoc ornament experiments: node tests/exp.mjs out.png W H "<js drawing code using ctx and O (ornaments)>"
import { chromium } from '@playwright/test';
let [,, out, W, H, code] = process.argv;
if(code.startsWith('@')) code = (await import('node:fs')).readFileSync(code.slice(1), 'utf8');
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:+W, height:+H}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('http://localhost:4321/dist/gallery/gallery.html'); await p.waitForFunction(() => window.__orn); await p.evaluate(() => window.__orn.fontsReady());
await p.evaluate(({W, H, code}) => {
  document.body.innerHTML = ''; document.body.style.margin = 0;
  const c = document.createElement('canvas'); c.width = W; c.height = H; document.body.append(c);
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
  new Function('ctx', 'O', 'W', 'H', code)(ctx, window.__orn, W, H);
}, {W:+W, H:+H, code});
await p.screenshot({path:out}); console.log('errors:', errs); await b.close();
