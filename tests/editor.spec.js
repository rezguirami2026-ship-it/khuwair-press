// Editor features (phase 4), driven through the real UI.
import { test, expect } from '@playwright/test';
import { openV2, overlaps } from './helpers.js';

const render = page => page.evaluate(() => window.__kp.render(1000, 0, true));

test('every occasion preset fits every type and template, in both genders', async ({page}) => {
  const errors = await openV2(page);
  const problems = [];
  for(const type of ['cert', 'notice', 'poster', 'invite']){
    await page.locator(`.tab[data-type="${type}"]`).click();
    for(const kind of type === 'poster' ? ['guide', 'honor'] : [null]){
      if(kind) await page.locator('#kinds .chip', {hasText:kind === 'guide' ? 'إرشادات' : 'لوحة الشرف'}).click();
      const ids = await page.locator('#preset option').evaluateAll(os => os.map(o => o.value).filter(Boolean));
      expect(ids.length).toBe(9);
      for(const id of ids){
        await page.locator('#preset').selectOption(id);
        for(const layout of ['luxe', 'modern', 'heritage', 'joy']){
          await page.evaluate(l => { window.__kp.state.docs[window.__kp.state.type].layout = l; }, layout);
          const r = await render(page);
          const ov = overlaps(r.boxes);
          if(r.over || ov.length) problems.push(`${type}/${kind || ''}/${id}/${layout}: over=${r.over} ${ov.join(' | ')}`);
        }
      }
    }
  }
  expect(problems).toEqual([]);
  expect(errors).toEqual([]);
});

test('gender switch rewrites the certificate wording and back', async ({page}) => {
  const errors = await openV2(page);
  const intro = page.locator('#f-cert-intro'), reason = page.locator('#f-cert-reason');
  await expect(intro).toHaveValue(/إلى الطالب$/);
  await page.locator('.chip', {hasText:/^طالبة$/}).click();
  await expect(intro).toHaveValue(/إلى الطالبة$/);
  await expect(reason).toHaveValue(/لتفوّقها.*متمنّين لها/);
  await page.locator('#preset').selectOption('contests');              // presets follow the chosen gender
  await expect(reason).toHaveValue('لحصولها على {المركز} في مسابقة {المادة}، متمنّين لها دوام التفوّق.');
  await page.locator('.chip', {hasText:/^طالب$/}).click();
  await expect(reason).toHaveValue('لحصوله على {المركز} في مسابقة {المادة}، متمنّين له دوام التفوّق.');
  expect(errors).toEqual([]);
});
