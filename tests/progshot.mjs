// Screenshot of the export area mid-export (60 certificates).
import { chromium } from '@playwright/test';
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280, height:900}});
await p.goto('http://localhost:4321/dist/single/khuwair-press.html?test'); await p.waitForFunction(() => window.__kp);
await p.locator('#f-cert-names').fill(Array.from({length:60}, (_, i) => `طالب ${i + 1} - 6/${1 + i % 5}`).join('\n'));
await p.locator('#pdfBtn').click();
await p.waitForFunction(() => +document.querySelector('#prog').value >= 20, null, {timeout:60000});
await p.locator('.stage').screenshot({path:'tests/__output__/ui5-progress.png'});
await b.close(); console.log('ok');
