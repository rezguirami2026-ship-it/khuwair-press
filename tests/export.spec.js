// Phase 5: export quality, paper sizes, ZIP, background rendering, cancel.
import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { unzipSync, strFromU8 } from 'fflate';
import { openV2 } from './helpers.js';
import { STRESS_NAMES_60 } from './cases.js';

const pdfInfo = buf => {
  const s = buf.toString('latin1');
  return {pages:(s.match(/\/Type \/Page\b(?!s)/g) || []).length,
    box:(s.match(/\/MediaBox \[([^\]]+)\]/) || [])[1]?.trim().split(/\s+/).map(Number),
    widths:[...s.matchAll(/\/Width (\d+)/g)].map(m => +m[1]), size:buf.length};
};
const download = async (page, btn) => {
  const [dl] = await Promise.all([page.waitForEvent('download', {timeout:170_000}), page.locator(btn).click()]);
  return {name:dl.suggestedFilename(), buf:readFileSync(await dl.path())};
};

test('60 certificates at 300 dpi: 60 A4 pages, drawn in the worker, UI stays responsive', async ({page}) => {
  test.setTimeout(240_000);
  const errors = await openV2(page);
  await page.locator('#f-cert-names').fill(STRESS_NAMES_60);
  await page.evaluate(() => { window.__long = []; new PerformanceObserver(l => l.getEntries().forEach(e => window.__long.push(e.duration))).observe({type:'longtask'}); });
  const [dl] = await Promise.all([page.waitForEvent('download', {timeout:200_000}), page.locator('#pdfBtn').click()]);
  // while it runs, the progress bar moves
  const info = pdfInfo(readFileSync(await dl.path()));
  expect(info.pages).toBe(60);
  expect(info.box).toEqual([0, 0, 841.89, 595.28]);              // A4 landscape in points
  expect(new Set(info.widths)).toEqual(new Set([3508]));          // 297 mm at 300 dpi
  const long = await page.evaluate(() => window.__long);
  test.info().annotations.push({type:'long tasks (ms)', description:JSON.stringify(long.map(Math.round))});
  expect(long.filter(d => d > 500).length, 'main thread blocked > 500 ms').toBeLessThanOrEqual(1);
  expect(errors).toEqual([]);
});

test('lighter file: 150 dpi and much smaller', async ({page}) => {
  const errors = await openV2(page);
  const hi = pdfInfo((await download(page, '#pdfBtn')).buf);
  await page.locator('#quality').selectOption('light');
  const lo = pdfInfo((await download(page, '#pdfBtn')).buf);
  expect(lo.widths[0]).toBe(1754);
  expect(lo.size).toBeLessThan(hi.size * 0.5);
  expect(errors).toEqual([]);
});

test('paper sizes: A5 invitation, A3 poster', async ({page}) => {
  const errors = await openV2(page);
  await page.locator('.tab[data-type="invite"]').click();
  await page.locator('#paper').selectOption('A5');
  const a5 = pdfInfo((await download(page, '#pdfBtn')).buf);
  expect(a5.box).toEqual([0, 0, 419.53, 595.28]);
  expect(a5.widths[0]).toBe(1748);
  await page.locator('.tab[data-type="poster"]').click();
  await page.locator('#paper').selectOption('A3');
  const a3 = pdfInfo((await download(page, '#pdfBtn')).buf);
  expect(a3.box).toEqual([0, 0, 841.89, 1190.55]);
  expect(a3.widths[0]).toBe(3508);
  await page.locator('.tab[data-type="cert"]').click();
  await expect(page.locator('#paperWrap')).toBeHidden();          // certificates: A4 only
  expect(errors).toEqual([]);
});

test('ZIP with one PNG per certificate', async ({page}) => {
  const errors = await openV2(page);
  await page.locator('#quality').selectOption('light');
  const {name, buf} = await download(page, '#zipBtn');
  expect(name).toBe('شهادة شكر وتقدير - ٣ صور.zip');
  const files = unzipSync(new Uint8Array(buf));
  expect(Object.keys(files)).toEqual(['1 - سالم بن محمد الحارثي.png', '2 - عبدالله بن سعيد الكندي.png', '3 - يوسف بن حمد الرواحي.png']);
  const png = PNG.sync.read(Buffer.from(files['2 - عبدالله بن سعيد الكندي.png']));
  expect([png.width, png.height]).toEqual([1754, 1240]);
  expect(errors).toEqual([]);
});

test('worker and on-page rendering give the same page', async ({browser}) => {
  const get = async q => {
    const page = await (await browser.newContext()).newPage();
    await page.clock.setFixedTime(new Date('2026-10-12T09:00:00+04:00'));
    await page.goto('/dist/single/khuwair-press.html?test' + q); await page.waitForFunction(() => window.__kp); await page.evaluate(() => window.__kp.fontsReady());
    const b64 = await page.evaluate(async () => { const b = await window.__kp.buildPng(window.__kp.state, window.__kp.logoImg, 1, 'light');
      return await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(b); }); });
    return PNG.sync.read(Buffer.from(b64.split(',')[1], 'base64'));
  };
  const [a, b] = [await get(''), await get('&noworker')];
  expect([a.width, a.height]).toEqual([b.width, b.height]);
  const n = pixelmatch(a.data, b.data, null, a.width, a.height, {threshold:0.1});
  expect(n / (a.width * a.height)).toBeLessThan(0.0005);
});

test('cancel stops a long export', async ({page}) => {
  const errors = await openV2(page);
  await page.locator('#f-cert-names').fill(STRESS_NAMES_60);
  let downloaded = false; page.on('download', () => { downloaded = true; });
  await page.locator('#pdfBtn').click();
  await expect(page.locator('#progress')).toBeVisible();
  await expect(page.locator('#prog')).toHaveAttribute('value', /^[1-9]/, {timeout:60_000});
  await page.locator('#cancelBtn').click();
  await expect(page.locator('#status')).toHaveText('أُلغي التصدير.', {timeout:60_000});
  await expect(page.locator('#progress')).toBeHidden();
  expect(downloaded).toBe(false);
  await expect(page.locator('#pdfBtn')).toBeEnabled();
  expect(errors).toEqual([]);
});
