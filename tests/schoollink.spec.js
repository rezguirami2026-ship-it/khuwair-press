// School link (?school=<id>): the school's logos appear on a fresh device and are kept; logos the user set are never replaced.
import { test, expect } from '@playwright/test';
import { FIXED_NOW } from './helpers.js';

test('school link fills empty logo slots on a fresh device', async ({page}) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto('/dist/site/index.html?test&school=khuwair');
  await page.waitForFunction(() => window.__kp && ['school', 'center', 'side'].every(k => window.__kp.logoImg[k]));
  await expect(page.locator('.logo-slot[data-key=school] .thumb img')).toHaveCount(1);
  // reopened without the link, the logos are still there
  await page.goto('/dist/site/index.html?test');
  await page.waitForFunction(() => window.__kp && window.__kp.logoImg.side);
});

test('school link never replaces a logo the user uploaded', async ({page}) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto('/dist/site/index.html?test');
  await page.waitForFunction(() => window.__kp);
  const mine = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 10; const u = c.toDataURL('image/png');
    window.__kp.state.logos.center = u; localStorage.setItem('khuwair-press-v2', JSON.stringify(window.__kp.state)); return u; });
  await page.goto('/dist/site/index.html?test&school=khuwair');
  await page.waitForFunction(() => window.__kp && window.__kp.state.logos.side);
  expect(await page.evaluate(() => window.__kp.state.logos.center)).toBe(mine);
});

test('unknown school link is ignored', async ({page}) => {
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('/dist/site/index.html?test&school=nope');
  await page.waitForFunction(() => window.__kp);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__kp.state.logos.side)).toBeNull();
  expect(errors).toEqual([]);
});
