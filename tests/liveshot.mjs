// Screenshot of the published site (GitHub Pages).
import { chromium } from '@playwright/test';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1366, height:900}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('https://rezguirami2026-ship-it.github.io/khuwair-press/'); await p.waitForTimeout(2500);
if(await p.locator('#welcomeDlg').evaluate(d => d.open)) await p.locator('#wSkip').click();
await p.waitForTimeout(1200);
await p.screenshot({path:'tests/__output__/live.png'});
console.log('errors:', errs, 'frame chips:', await p.locator('#frames .chip').allTextContents());
await b.close();
