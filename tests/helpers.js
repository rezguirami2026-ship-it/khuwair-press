// Page helpers: open v1 (with an injected test hook) or the v2 build, apply a case, render a page to PNG.
import { readFileSync } from 'node:fs';

export const V2_URLS = {single:'/dist/single/khuwair-press.html?test', site:'/dist/site/index.html?test'};

/** Opens the legacy v1 page, exposing the same window.__kp surface as v2's test hook. */
export async function openV1(page){
  const html = readFileSync('legacy/v1.html', 'utf8');
  const hook = `window.__kp = {state, logoImg, setLogoImg,
    render(px, i){ const c = renderTo(px, i); return {url:c.toDataURL('image/png'), over:OVER}; },
    fontsReady(){ return Promise.all(FONT_SPECS.map(f => document.fonts.load(f, 'شهادة تقدير ١٢٣ 123'))).then(() => document.fonts.ready); },
    refresh(){ document.querySelectorAll('[data-s]').forEach(inp => { inp.value = state.school[inp.dataset.s] || ''; }); refreshLogos(); buildPanel(); renderPreview(); }};\n})();`;
  const patched = html.replace(/\}\)\(\);\s*<\/script>\s*$/, hook + '\n</script>\n');
  if(patched === html) throw new Error('v1 hook injection failed');
  await page.route('**/legacy/v1.html', r => r.fulfill({contentType:'text/html; charset=utf-8', body:patched}));
  await page.goto('/legacy/v1.html');
  await page.waitForFunction(() => window.__kp);
  await page.evaluate(() => window.__kp.fontsReady());
}

/** Opens the v2 build and collects console errors into the returned array. */
export async function openV2(page, which = 'single'){
  const errors = [];
  page.on('console', m => { if(m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(V2_URLS[which]);
  await page.waitForFunction(() => window.__kp);
  await page.evaluate(() => window.__kp.fontsReady());
  return errors;
}

/** Applies a case to the live state (fresh state assumed) and returns {url, over} for the page at px wide. */
export async function renderCase(page, c, px = 1200){
  return page.evaluate(async ({c, px}) => {
    const kp = window.__kp, st = kp.state;
    st.type = c.type; st.theme = c.theme || 'maroon'; st.tfont = c.tfont || 'ruqaa'; st.digits = c.digits !== false;
    st.docs[c.type].layout = c.layout;
    Object.assign(st.docs[c.type], c.doc || {});
    Object.assign(st.school, c.school || {});
    for(const key of ['center', 'side']){
      let url = null;
      if(c.logos){
        const cv = document.createElement('canvas'); cv.width = key === 'center' ? 300 : 240; cv.height = 200;
        const g = cv.getContext('2d');
        g.fillStyle = key === 'center' ? '#2E6B4F' : '#8A2432'; g.beginPath(); g.arc(cv.width / 2, 100, 90, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#E2B84F'; g.fillRect(cv.width / 2 - 40, 60, 80, 80);
        url = cv.toDataURL('image/png');
      }
      st.logos[key] = url; kp.setLogoImg(key, url);
      if(url) await new Promise(r => { const t = setInterval(() => { if(kp.logoImg[key]){ clearInterval(t); r(); } }, 10); });
    }
    return kp.render(px, c.rec || 0);
  }, {c, px});
}
export const pngBuffer = url => Buffer.from(url.split(',')[1], 'base64');
