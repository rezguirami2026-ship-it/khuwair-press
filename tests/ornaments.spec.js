// Ornament engine: every gallery entry renders (normal, gold, ink-saving) without errors and draws something.
import { test, expect } from '@playwright/test';

test('every ornament renders in all modes', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if(m.type() === 'error') errors.push(m.text()); });
  await page.goto('/dist/gallery/gallery.html');
  await page.waitForFunction(() => window.__gallery);
  const res = await page.evaluate(() => {
    const out = [];
    for(const id of window.__gallery.ids()) for(const mode of [{}, {accent:'gold', gold:true}, {ink:true}, {density:2, lw:2.5, rot:0.4}]){
      window.__gallery.render(id, mode);
      // count non-white pixels on a downscaled copy
      const src = [...document.querySelectorAll('canvas')].find(c => c.nextSibling && c.nextSibling.textContent.endsWith(id));
      const c = document.createElement('canvas'); c.width = 90; c.height = Math.round(90 * src.height / src.width);
      const g = c.getContext('2d'); g.drawImage(src, 0, 0, c.width, c.height);
      const d = g.getImageData(0, 0, c.width, c.height).data; let ink = 0;
      for(let i = 0; i < d.length; i += 4) if(d[i] < 235 || d[i + 1] < 235 || d[i + 2] < 235) ink++;
      out.push({id, mode:JSON.stringify(mode), ink});
    }
    return out;
  });
  expect(res.length).toBeGreaterThan(100);
  expect(res.filter(r => r.ink < 20), 'blank renders').toEqual([]);
  expect(errors).toEqual([]);
});
