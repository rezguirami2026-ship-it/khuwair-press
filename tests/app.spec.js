// App-level checks: offline builds, v1 → v2 migration, PDF page count, UI screenshots, console errors.
import { test, expect } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { openV1, openV2, V2_URLS } from './helpers.js';
import { STRESS_NAMES_60 } from './cases.js';

const OUT = 'tests/__output__/ui';
mkdirSync(OUT, {recursive:true});
const TABS = ['cert', 'notice', 'poster', 'invite'];
const SPECS = ['400 30px "Amiri"', '700 30px "Amiri"', '400 30px "Aref Ruqaa"', '700 30px "Aref Ruqaa"', '500 30px "Reem Kufi"',
  '600 30px "Reem Kufi"', '700 30px "Reem Kufi"', '400 30px "Tajawal"', '500 30px "Tajawal"', '700 30px "Tajawal"', '800 30px "Tajawal"'];

for(const which of ['single', 'site']){
  test(`${which} build works fully offline`, async ({page}) => {
    const external = [];
    await page.route('**/*', r => {
      if(new URL(r.request().url()).hostname !== 'localhost'){ external.push(r.request().url()); return r.abort(); }
      return r.continue();
    });
    const errors = await openV2(page, which);
    const ok = await page.evaluate(specs => specs.filter(s => !document.fonts.check(s, 'شهادة 123')), SPECS);
    expect(ok, 'fonts not loaded').toEqual([]);
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('migrates saved v1 data and keeps the v1 key', async ({page}) => {
  const v1 = {v:1, type:'notice', theme:'navy', tfont:'kufi', digits:false, idx:0,
    school:{l1:'سلطنة عمان', l2:'وزارة التعليم', l3:'مدرسة السلام', year:'2025 / 2026م', director:'أ. سعيد'},
    logos:{center:null, side:null},
    docs:{notice:{layout:'card', title:'عنوان محفوظ', body:'نص محفوظ'}, cert:{names:'أحمد - 5/1\nخالد - 5/2'}}};
  await page.addInitScript(s => { if(!localStorage.getItem('khuwair-press-v1')) localStorage.setItem('khuwair-press-v1', s); }, JSON.stringify(v1));
  const errors = await openV2(page);
  const st = await page.evaluate(() => JSON.parse(JSON.stringify(window.__kp.state)));
  expect(st.v).toBe(2);
  expect([st.type, st.theme, st.tfont, st.digits]).toEqual(['notice', 'navy', 'kufi', false]);
  expect(st.school.l3).toBe('مدرسة السلام');
  expect(st.docs.notice.title).toBe('عنوان محفوظ');
  expect(st.docs.notice.layout).toBe('card');
  expect(st.docs.notice.closing).toBeTruthy(); // missing fields fall back to defaults
  expect(st.docs.cert.names).toBe('أحمد - 5/1\nخالد - 5/2');
  await expect(page.locator('#f-notice-title')).toHaveValue('عنوان محفوظ');
  await expect(page.locator('#s-l3')).toHaveValue('مدرسة السلام');
  await page.locator('#f-notice-title').fill('عنوان جديد');
  await page.waitForFunction(() => localStorage.getItem('khuwair-press-v2'));
  const keys = await page.evaluate(() => ({v1:JSON.parse(localStorage.getItem('khuwair-press-v1')), v2:JSON.parse(localStorage.getItem('khuwair-press-v2'))}));
  expect(keys.v1.docs.notice.title).toBe('عنوان محفوظ');
  expect(keys.v2.docs.notice.title).toBe('عنوان جديد');
  expect(keys.v2.v).toBe(2);
  await page.reload();
  await page.waitForFunction(() => window.__kp);
  await expect(page.locator('#f-notice-title')).toHaveValue('عنوان جديد');
  expect(errors).toEqual([]);
});

test('PDF of 60 students has 60 pages', async ({page}) => {
  const errors = await openV2(page);
  await page.locator('#f-cert-names').fill(STRESS_NAMES_60);
  await expect(page.locator('#pdfBtn')).toContainText('٦٠');
  const [dl] = await Promise.all([page.waitForEvent('download', {timeout:110_000}), page.locator('#pdfBtn').click()]);
  const pdf = readFileSync(await dl.path(), 'latin1');
  expect(pdf.startsWith('%PDF-')).toBe(true);
  expect((pdf.match(/\/Type \/Page\b(?!s)/g) || []).length).toBe(60);
  expect(dl.suggestedFilename()).toBe('شهادة شكر وتقدير.pdf');
  expect(errors).toEqual([]);
});

test('PNG download and single-page PDF for a notice', async ({page}) => {
  const errors = await openV2(page);
  await page.locator('.tab[data-type="notice"]').click();
  const [png] = await Promise.all([page.waitForEvent('download'), page.locator('#pngBtn').click()]);
  expect(png.suggestedFilename()).toBe('اجتماع أولياء الأمور.png');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#pdfBtn').click()]);
  const pdf = readFileSync(await dl.path(), 'latin1');
  expect((pdf.match(/\/Type \/Page\b(?!s)/g) || []).length).toBe(1);
  expect(errors).toEqual([]);
});

for(const [label, viewport, dpr] of [['desktop', {width:1366, height:900}, 1], ['mobile', {width:390, height:844}, 2]]){
  test(`UI screenshots ${label} (v1 and v2)`, async ({browser}) => {
    for(const ver of ['v1', 'v2']){
      const page = await (await browser.newContext({viewport, deviceScaleFactor:dpr, locale:'ar-OM'})).newPage();
      const errors = ver === 'v1' ? (await openV1(page), []) : await openV2(page);
      for(const t of TABS){
        await page.locator(`.tab[data-type="${t}"]`).click();
        await page.waitForTimeout(150);
        await page.screenshot({path:`${OUT}/${label}-${t}-${ver}.png`, fullPage:true});
      }
      expect(errors).toEqual([]);
    }
  });
}
