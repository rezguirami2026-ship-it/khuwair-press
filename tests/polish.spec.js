// Phase 6: appearance, about, keyboard, installable offline app.
import { test, expect } from '@playwright/test';
import { openV2 } from './helpers.js';

test('appearance toggle: auto → light → dark, remembered', async ({page}) => {
  const errors = await openV2(page);
  const html = page.locator('html'), btn = page.locator('#themeBtn');
  await expect(btn).toHaveAttribute('aria-label', 'المظهر: تلقائي');
  await btn.click(); await expect(html).toHaveAttribute('data-theme', 'light');
  await btn.click(); await expect(html).toHaveAttribute('data-theme', 'dark');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(15, 20, 18)');
  await page.reload(); await page.waitForFunction(() => window.__kp);
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({path:'tests/__output__/ui6-dark.png', fullPage:true});
  await page.locator('#themeBtn').click();
  await expect(html).not.toHaveAttribute('data-theme', /./);
  expect(errors).toEqual([]);
});

test('about: author credit, privacy, licenses', async ({page}) => {
  const errors = await openV2(page);
  await page.locator('#aboutBtn').click();
  const dlg = page.locator('#aboutDlg');
  await expect(dlg).toBeVisible();
  await expect(dlg).not.toContainText('رامي');                     // the owner asked not to show his name
  await expect(dlg).toContainText('SIL Open Font License');
  await expect(dlg.locator('#ver')).toHaveText('2.0.4');
  await expect(dlg.locator('.standalone')).toBeHidden();           // the single file does not link to itself
  await page.screenshot({path:'tests/__output__/ui6-about.png'});
  await page.keyboard.press('Escape');
  await expect(dlg).toBeHidden();
  await page.locator('[data-about]').click();
  await expect(dlg).toBeVisible();
  expect(errors).toEqual([]);
});

test('keyboard: tabs with arrows, preview arrows, Ctrl+S downloads the PDF', async ({page}) => {
  const errors = await openV2(page);
  await page.locator('.tab[data-type="cert"]').focus();
  await page.keyboard.press('ArrowLeft');                          // RTL: left = next
  expect(await page.evaluate(() => window.__kp.state.type)).toBe('notice');
  await expect(page.locator('.tab[data-type="notice"]')).toBeFocused();
  await page.keyboard.press('End');
  expect(await page.evaluate(() => window.__kp.state.type)).toBe('invite');
  await page.keyboard.press('Home');
  expect(await page.evaluate(() => window.__kp.state.type)).toBe('cert');
  await expect(page.locator('.tab[data-type="notice"]')).toHaveAttribute('tabindex', '-1');
  await page.locator('#desk').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#pos')).toHaveText('الشهادة ٢ من ٣');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#pos')).toHaveText('الشهادة ١ من ٣');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.keyboard.press('Control+s')]);
  expect(dl.suggestedFilename()).toBe('شهادة شكر وتقدير.pdf');
  // skip link goes to the content fields
  await page.keyboard.press('Tab');
  expect(errors).toEqual([]);
});

test('installed site works offline (service worker) and offers the standalone file', async ({page, context}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/dist/site/index.html');
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  const manifest = await (await page.request.get('/dist/site/manifest.webmanifest')).json();
  expect(manifest.name).toBe('مطبعة الخوير');
  expect(manifest.icons.map(i => i.sizes)).toEqual(['192x192', '512x512', '512x512']);
  await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller || navigator.serviceWorker.ready.then(() => true), null, {timeout:20000});
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();                                              // now controlled by the service worker
  await page.evaluate(() => navigator.serviceWorker.controller ? true : new Promise(r => navigator.serviceWorker.addEventListener('controllerchange', () => r(true))));
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toHaveText('مطبعة الخوير');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.fonts.check('700 30px "Aref Ruqaa"', 'شهادة'))).toBe(true);
  await page.locator('#welcomeDlg').evaluate(d => d.open && d.close());
  const [dl] = await Promise.all([page.waitForEvent('download', {timeout:60000}), page.locator('#pdfBtn').click()]);
  expect(dl.suggestedFilename()).toMatch(/\.pdf$/);
  await page.locator('#aboutBtn').click();
  await expect(page.locator('#aboutDlg .standalone')).toBeVisible();
  await context.setOffline(false);
  const r = await page.request.get('/dist/site/khuwair-press.html');
  expect(r.ok()).toBe(true);
  expect(errors).toEqual([]);
});
