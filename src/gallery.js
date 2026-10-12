/* Development page: every ornament with live parameters. */
import { fontsReady } from './fonts/index.js';
import { THEMES } from './schema/themes.js';
import { CATALOG } from './ornaments/catalog.js';

const $ = s => document.querySelector(s);
const cards = [];
const sel = $('#theme');
for(const [k, t] of Object.entries(THEMES)){ const op = document.createElement('option'); op.value = k; op.textContent = t.name; sel.append(op); }

function params(){
  const th = THEMES[sel.value], gold = $('#gold').checked;
  return {color:th.primary, accent:gold ? 'gold' : th.accent, gold, ink:$('#ink').checked,
    density:+$('#density').value, lw:+$('#lw').value, rot:+$('#rot').value * Math.PI / 180, bg:'#FFFFFF'};
}
function paintCard(c, o){
  const ctx = c.cv.getContext('2d'), W = 600, H = Math.round(W / c.aspect), k = c.cv.width / W;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, c.cv.width, c.cv.height);
  ctx.setTransform(k, 0, 0, k, 0, 0);
  c.draw(ctx, W, H, o);
}
function build(){
  const main = $('#main');
  for(const g of CATALOG){
    const h = document.createElement('h2'); h.textContent = g.group; main.append(h);
    const grid = document.createElement('div'); grid.className = 'grid'; main.append(grid);
    for(const [id, label, aspect, draw] of g.items){
      const fig = document.createElement('figure'); if(aspect > 1.6) fig.className = 'wide';
      const cv = document.createElement('canvas'); cv.width = 900; cv.height = Math.round(900 / aspect);
      const cap = document.createElement('figcaption'); cap.innerHTML = `<span></span><code>${id}</code>`; cap.firstChild.textContent = label;
      fig.append(cv, cap); grid.append(fig);
      cards.push({id, aspect, draw, cv});
    }
  }
}
let raf = 0;
const redraw = () => { if(!raf) raf = requestAnimationFrame(() => { raf = 0; const o = params(); cards.forEach(c => paintCard(c, o)); }); };
build();
document.querySelectorAll('header input, header select').forEach(el => el.addEventListener('input', redraw));
redraw();

/* Test hook: render one entry with given params and return a PNG data URL. */
window.__gallery = {
  ids:() => cards.map(c => c.id),
  render(id, over){
    const c = cards.find(q => q.id === id), o = Object.assign(params(), over || {});
    paintCard(c, o); return c.cv.toDataURL('image/png');
  }
};
import * as stars from './ornaments/stars.js';
import * as pats from './ornaments/patterns.js';
import * as frames from './ornaments/frames.js';
import * as oman from './ornaments/oman.js';
import * as awards from './ornaments/awards.js';
window.__orn = Object.assign({fontsReady}, stars, pats, frames, oman, awards);
