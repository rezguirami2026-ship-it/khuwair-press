// Draws the app icons (khatam star on the brand green) into pwa/: icon-192.png, icon-512.png, maskable-512.png.
import { chromium } from '@playwright/test';
const svg = (size, pad) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 40 40">
  <rect width="40" height="40" ${pad ? '' : 'rx="9"'} fill="#1E5B47"/>
  <g transform="translate(20 20) scale(${pad ? 0.62 : 0.8}) translate(-20 -20)">
    <g fill="none" stroke="#E9CF92" stroke-width="2.4" stroke-linejoin="miter">
      <rect x="9.5" y="9.5" width="21" height="21"/><rect x="9.5" y="9.5" width="21" height="21" transform="rotate(45 20 20)"/>
    </g>
    <circle cx="20" cy="20" r="3.2" fill="#E9CF92"/>
  </g></svg>`;
const b = await chromium.launch(), p = await b.newPage();
for(const [name, size, pad] of [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['maskable-512.png', 512, true]]){
  await p.setViewportSize({width:size, height:size});
  await p.setContent(`<body style="margin:0;background:transparent">${svg(size, pad)}</body>`);
  await p.locator('svg').screenshot({path:'pwa/' + name, omitBackground:true});
}
await b.close(); console.log('icons ok');
