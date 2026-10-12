// Page helpers: open v1 (with an injected test hook) or the v2 build, apply a case, render a page to PNG.
import { readFileSync } from 'node:fs';

/** Default texts contain today's date: pin the clock so renders do not change from day to day. */
export const FIXED_NOW = new Date('2026-10-12T09:00:00+04:00');

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
  await page.clock.setFixedTime(FIXED_NOW);
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
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto(V2_URLS[which]);
  await page.waitForFunction(() => window.__kp);
  await page.evaluate(() => window.__kp.fontsReady());
  return errors;
}

/** Applies a case to the live state (fresh state assumed) and returns {url, over} for the page at px wide. */
export async function renderCase(page, c, px = 1200, withBoxes = false){
  return page.evaluate(async ({c, px, withBoxes}) => {
    const kp = window.__kp, st = kp.state;
    st.type = c.type; st.theme = c.theme || 'maroon'; st.digits = c.digits !== false;
    st.tfont = c.tfont || (kp.isV2 ? 'auto' : 'ruqaa');
    if(kp.isV2){ st.gold = c.gold !== false; st.ink = !!c.ink; }
    const doc = st.docs[c.type];
    doc.layout = c.layout;
    if(c.kind) doc.kind = c.kind;
    // v1 poster layouts encode the poster kind; v2 keeps them as kind + the 'v1' layout
    if(kp.isV2 && c.type === 'poster' && (c.layout === 'guide' || c.layout === 'honor')){ doc.kind = c.layout; doc.layout = 'v1'; }
    Object.assign(doc, c.doc || {});
    Object.assign(st.school, c.school || {});
    const make = key => {
      const cv = document.createElement('canvas'), g = cv.getContext('2d');
      if(key === 'signature'){ // transparent scribble
        cv.width = 300; cv.height = 110; g.strokeStyle = '#1B2A6B'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(20, 80);
        for(let x = 20; x < 280; x += 10) g.lineTo(x, 55 + Math.sin(x / 13) * 28 - (x > 200 ? (x - 200) * 0.3 : 0)); g.stroke();
      } else if(key === 'stamp'){ // transparent round stamp
        cv.width = 220; cv.height = 220; g.strokeStyle = 'rgba(40,60,160,.85)'; g.lineWidth = 8;
        g.beginPath(); g.arc(110, 110, 100, 0, Math.PI * 2); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(110, 110, 76, 0, Math.PI * 2); g.stroke();
        g.fillStyle = 'rgba(40,60,160,.85)'; g.fillRect(60, 98, 100, 24);
      } else {
        cv.width = key === 'center' ? 300 : 240; cv.height = 200;
        g.fillStyle = key === 'center' ? '#2E6B4F' : '#8A2432'; g.beginPath(); g.arc(cv.width / 2, 100, 90, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#E2B84F'; g.fillRect(cv.width / 2 - 40, 60, 80, 80);
      }
      return cv.toDataURL('image/png');
    };
    const keys = kp.isV2 ? ['center', 'side', 'signature', 'stamp'] : ['center', 'side'];
    for(const key of keys){
      const want = (key === 'center' || key === 'side') ? c.logos : c.images;
      const url = want ? make(key) : null;
      st.logos[key] = url; kp.setLogoImg(key, url);
      if(url) await new Promise(r => { const t = setInterval(() => { if(kp.logoImg[key]){ clearInterval(t); r(); } }, 10); });
    }
    return kp.render(px, c.rec || 0, withBoxes);
  }, {c, px, withBoxes});
}

/** Overlapping element boxes (ignores a container and its own '-in' children, and boxes that merely touch). */
export function overlaps(boxes){
  const out = [], eps = 0.75;
  for(let i = 0; i < boxes.length; i++) for(let j = i + 1; j < boxes.length; j++){
    const a = boxes[i], b = boxes[j];
    if(a.name + '-in' === b.name || b.name + '-in' === a.name) continue;
    const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if(ox > eps && oy > eps) out.push(`${a.name}[${a.x.toFixed(0)},${a.y.toFixed(0)},${a.w.toFixed(0)}×${a.h.toFixed(0)}] ∩ ${b.name}[${b.x.toFixed(0)},${b.y.toFixed(0)},${b.w.toFixed(0)}×${b.h.toFixed(0)}]`);
  }
  return out;
}
export const pngBuffer = url => Buffer.from(url.split(',')[1], 'base64');
