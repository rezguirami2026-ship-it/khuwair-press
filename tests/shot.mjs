import { chromium } from '@playwright/test';
const [,, url, out, w = '1400', h = '900'] = process.argv;
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:+w, height:+h}});
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto(url); await p.waitForTimeout(800);
await p.screenshot({path:out, fullPage:true}); console.log('errors:', errs); await b.close();
