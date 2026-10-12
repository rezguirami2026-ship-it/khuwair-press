// How a class like «1/6» is drawn: digits on/off, canvas vs page text.
import { chromium } from '@playwright/test';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:900, height:420}});
await p.goto('http://localhost:4321/dist/single/khuwair-press.html?test'); await p.waitForFunction(() => window.__kp); await p.evaluate(() => window.__kp.fontsReady());
await p.evaluate(() => {
  document.body.innerHTML = '<canvas id="c" width="900" height="420" style="background:#fff"></canvas>';
  const ctx = document.getElementById('c').getContext('2d'); ctx.fillStyle = '#000';
  const rows = [['1/6', 'لاتيني'], ['١/٦', 'عربي'], ['الصف: 1/6', 'لاتيني مع نص'], ['الصف: ١/٦', 'عربي مع نص'], ['أحمد - ١/٦', 'اسم']];
  rows.forEach(([s, l], i) => { ctx.font = '700 34px Tajawal'; ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.fillText(s, 860, 60 + i * 75);
    ctx.direction = 'ltr'; ctx.textAlign = 'left'; ctx.font = '20px sans-serif'; ctx.fillText(l + '   (' + [...s].map(c => c.charCodeAt(0).toString(16)).join(' ') + ')', 20, 60 + i * 75); });
});
await p.screenshot({path:'tests/__output__/cls.png'}); await b.close(); console.log('ok');
