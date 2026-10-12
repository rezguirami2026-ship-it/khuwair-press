// Editor features (phase 4), driven through the real UI.
import { test, expect } from '@playwright/test';
import { openV2, overlaps } from './helpers.js';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

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

test('import names from Excel (with headers) and from an Arabic Windows-1256 CSV', async ({page}) => {
  const XLSX = await import('xlsx');
  const errors = await openV2(page);
  const rows = [['م', 'الاسم', 'الصف', 'المادة', 'المركز'],
    [1, 'سالم بن محمد الحارثي', '6/1', 'الرياضيات', 1], [2, 'خالد بن سعيد الكندي', '6/2', 'العلوم', 2], [3, 'يوسف بن حمد الرواحي', '6/4', 'اللغة العربية', 3]];
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'المتفوقون');
  const xlsx = XLSX.write(wb, {type:'buffer', bookType:'xlsx'});
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.import-btn').first().click()]);
  await chooser.setFiles({name:'الطلبة.xlsx', mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer:xlsx});
  const dlg = page.locator('#importDlg');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('.count')).toContainText('٣ أسماء');
  await dlg.locator('[data-mode="replace"]').click();
  await expect(page.locator('#f-cert-names')).toHaveValue('سالم بن محمد الحارثي | 6/1 | الرياضيات | 1\nخالد بن سعيد الكندي | 6/2 | العلوم | 2\nيوسف بن حمد الرواحي | 6/4 | اللغة العربية | 3');
  const recs = await page.evaluate(() => window.__kp.records(window.__kp.state));
  expect(recs[1]).toEqual({name:'خالد بن سعيد الكندي', cls:'6/2', subject:'العلوم', rank:'2'});
  // CSV in Windows-1256 without a header row → appended
  const cp = new TextDecoder('windows-1256'); const enc = {};
  for(let b = 128; b < 256; b++) enc[cp.decode(new Uint8Array([b]))] = b;
  const csv = 'أحمد بن علي العامري,5/3\r\nعمر بن ناصر الشكيلي,5/4\r\n';
  const bytes = Buffer.from([...csv].map(ch => ch.charCodeAt(0) < 128 ? ch.charCodeAt(0) : enc[ch]));
  const [ch2] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.import-btn').first().click()]);
  await ch2.setFiles({name:'قائمة.csv', mimeType:'text/csv', buffer:bytes});
  await expect(dlg.locator('.count')).toContainText('٢');
  await dlg.locator('[data-mode="append"]').click();
  await expect(page.locator('#f-cert-names')).toHaveValue(/\nأحمد بن علي العامري - 5\/3\nعمر بن ناصر الشكيلي - 5\/4$/);
  await expect(page.locator('#pdfBtn')).toContainText('٥ شهادات');
  expect(errors).toEqual([]);
});

test('first run asks for the school, and the settings file moves it to another device', async ({browser}) => {
  const page = await (await browser.newContext({acceptDownloads:true})).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/dist/single/khuwair-press.html?test&firstrun');
  const dlg = page.locator('#welcomeDlg');
  await expect(dlg).toBeVisible();
  await expect(dlg.locator('[data-w="l2"]')).toHaveValue('وزارة التعليم');
  await dlg.locator('[data-w="l3"]').fill('مدرسة السلام للتعليم الأساسي (1-4)');
  await dlg.locator('[data-w="director"]').fill('أ. سعاد البلوشية');
  await dlg.locator('#wStart').click();
  await expect(dlg).toBeHidden();
  await page.locator('#schoolSec summary').click();
  await expect(page.locator('#s-l3')).toHaveValue('مدرسة السلام للتعليم الأساسي (1-4)');
  // reload: no welcome screen any more
  await page.reload(); await page.waitForFunction(() => window.__kp);
  await expect(page.locator('#welcomeDlg')).toBeHidden();
  // export the settings file …
  await page.locator('#schoolSec summary').click();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('#exportSchool').click()]);
  expect(dl.suggestedFilename()).toBe('إعدادات مدرسة السلام للتعليم الأساسي (1-4).khuwair.json');
  const json = JSON.parse(require('node:fs').readFileSync(await dl.path(), 'utf8'));
  expect(json.format).toBe('khuwair-press/school');
  expect(json.school.director).toBe('أ. سعاد البلوشية');
  // … and import it on a fresh device through the welcome screen
  const p2 = await (await browser.newContext()).newPage();
  await p2.goto('/dist/single/khuwair-press.html?test&firstrun');
  const [chooser] = await Promise.all([p2.waitForEvent('filechooser'), p2.locator('#wImport').click()]);
  await chooser.setFiles({name:'s.json', mimeType:'application/json', buffer:Buffer.from(JSON.stringify(json))});
  await expect(p2.locator('#welcomeDlg')).toBeHidden();
  expect(await p2.evaluate(() => window.__kp.state.school.director)).toBe('أ. سعاد البلوشية');
  // a wrong file is refused politely
  await p2.locator('#schoolSec summary').click();
  const [c2] = await Promise.all([p2.waitForEvent('filechooser'), p2.locator('#importSchool').click()]);
  await c2.setFiles({name:'x.json', mimeType:'application/json', buffer:Buffer.from('{"hello":1}')});
  await expect(p2.locator('#status')).toHaveText('هذا ليس ملف إعدادات مدرسة صالحاً.');
  expect(errors).toEqual([]);
});

test('template gallery: live thumbnails, click to switch', async ({page}) => {
  const errors = await openV2(page);
  const tpls = page.locator('#layouts .tpl');
  await expect(tpls).toHaveCount(5);                                   // فاخر، ملكي، عصري، تراثي، مبهج
  await page.waitForTimeout(600);
  const inked = await tpls.evaluateAll(bs => bs.map(b => { const c = b.querySelector('canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    let n = 0; for(let i = 0; i < d.length; i += 4) if(d[i] < 200) n++; return n; }));
  expect(inked.every(n => n > 200)).toBe(true);
  await tpls.nth(3).click();
  expect(await page.evaluate(() => window.__kp.state.docs.cert.layout)).toBe('heritage');
  await expect(tpls.nth(3)).toHaveAttribute('aria-pressed', 'true');
  await page.locator('details.older summary').click();
  await page.locator('#layoutsV1 .tpl').first().click();
  expect(await page.evaluate(() => window.__kp.state.docs.cert.layout)).toBe('classic');
  await expect(page.locator('.lab-row')).toHaveCount(0);                  // v1 layouts have fixed sizes
  expect(errors).toEqual([]);
});
