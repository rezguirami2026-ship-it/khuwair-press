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

test('date helper writes Gregorian, Hijri (Umm al-Qura) or both', async ({page}) => {
  const errors = await openV2(page);
  const field = page.locator('#f-cert-date'), row = field.locator('xpath=following-sibling::div[contains(@class,"date-row")]');
  await row.locator('input[type=date]').fill('2026-10-13');
  await row.locator('select').selectOption('g'); await row.locator('button').click();
  await expect(field).toHaveValue('13 أكتوبر 2026م');
  await row.locator('select').selectOption('h'); await row.locator('button').click();
  await expect(field).toHaveValue('2 جمادى الأولى 1448هـ');
  await row.locator('select').selectOption('both'); await row.locator('button').click();
  await expect(field).toHaveValue('13 أكتوبر 2026م الموافق 2 جمادى الأولى 1448هـ');
  await page.locator('.tab[data-type="notice"]').click();
  const nf = page.locator('#f-notice-date'), nrow = nf.locator('xpath=following-sibling::div[contains(@class,"date-row")]');
  await nrow.locator('input[type=date]').fill('2026-10-13'); await nrow.locator('select').selectOption('both'); await nrow.locator('button').click();
  await expect(nf).toHaveValue('الثلاثاء، 13 أكتوبر 2026م الموافق 2 جمادى الأولى 1448هـ');
  expect(errors).toEqual([]);
});

test('size buttons enlarge and shrink a text element without breaking the layout', async ({page}) => {
  const errors = await openV2(page);
  const nameRow = page.locator('.lab-row', {has:page.locator('label[for="f-cert-names"]')});
  const sizeOf = () => page.evaluate(() => { const r = window.__kp.render(1000, 0, true); return r.boxes.filter(b => b.name === 'name').reduce((a, b) => Math.max(a, b.h), 0); });
  const h0 = await sizeOf();
  for(let i = 0; i < 6; i++) await nameRow.locator('.sz', {hasText:'أ+'}).click();
  await expect(nameRow.locator('.pct')).toHaveText('١٦٠٪');
  await expect(nameRow.locator('.sz', {hasText:'أ+'})).toBeDisabled();
  const h1 = await sizeOf();
  expect(h1).toBeGreaterThan(h0 * 1.15);
  for(let i = 0; i < 10; i++) await nameRow.locator('.sz', {hasText:'أ−'}).click();
  await expect(nameRow.locator('.pct')).toHaveText('٦٠٪');
  const h2 = await sizeOf();
  expect(h2).toBeLessThan(h0 * 0.8);
  // every element at its largest still fits without overlaps
  for(const label of ['f-cert-title', 'f-cert-intro', 'f-cert-reason', 'f-cert-date']){
    const row = page.locator('.lab-row', {has:page.locator(`label[for="${label}"]`)});
    for(let i = 0; i < 6; i++) await row.locator('.sz', {hasText:'أ+'}).click();
  }
  const r = await page.evaluate(() => window.__kp.render(1000, 0, true));
  expect(overlaps(r.boxes)).toEqual([]);
  expect(r.over).toBe(false);
  expect(errors).toEqual([]);
});

test('undo and redo (buttons and keyboard)', async ({page}) => {
  const errors = await openV2(page);
  await page.clock.install({time:new Date('2026-10-12T09:00:00+04:00')});
  const title = page.locator('#f-cert-title');
  await expect(page.locator('#undoBtn')).toBeDisabled();
  await title.fill('شهادة تفوّق');
  await page.clock.runFor(1000);
  await page.locator('.sw').nth(2).click();                       // theme → navy
  await page.clock.runFor(1000);
  await expect(page.locator('#undoBtn')).toBeEnabled();
  await page.locator('#undoBtn').click();
  expect(await page.evaluate(() => window.__kp.state.theme)).toBe('maroon');
  await expect(title).toHaveValue('شهادة تفوّق');
  await page.locator('#undoBtn').click();
  await expect(title).toHaveValue('شهادة شكر وتقدير');
  await page.locator('body').click({position:{x:5, y:5}});
  await page.keyboard.press('Control+Y');
  await expect(title).toHaveValue('شهادة تفوّق');
  await page.keyboard.press('Control+Y');
  expect(await page.evaluate(() => window.__kp.state.theme)).toBe('navy');
  await page.keyboard.press('Control+Z');
  expect(await page.evaluate(() => window.__kp.state.theme)).toBe('maroon');
  expect(errors).toEqual([]);
});
