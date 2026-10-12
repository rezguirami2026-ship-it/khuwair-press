/* Live preview on the desk, pager for certificate batches, autosave. */
import { state, save } from '../state/store.js';
import { records } from '../schema/parse.js';
import { draw, pageSize } from '../render/draw.js';
import { arNum, plural } from '../render/text.js';
import { logoImg } from './logos.js';
import { $ } from './dom.js';
import { note } from './history.js';

let raf = 0, saveTimer = 0, busyNow = false;

export function schedule(){ if(!raf) raf = requestAnimationFrame(() => { raf = 0; renderPreview(); }); }
/** Any edit: redraw on the next frame and save shortly after. */
export function changed(){ schedule(); note(); clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); }
/** After undo/redo: redraw and save without recording a new history step. */
export function restored(){ schedule(); clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); }

export function renderPreview(){
  const desk = $('#desk'), cv = $('#page');
  const [W, H] = pageSize(state);
  const cs = getComputedStyle(desk);
  const avail = desk.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const maxH = Math.max(300, window.innerHeight * (window.innerWidth > 860 ? 0.72 : 0.62));
  const wCss = Math.max(160, Math.floor(Math.min(avail, maxH * W / H)));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const px = Math.round(Math.min(wCss * dpr, 2200));
  cv.width = px; cv.height = Math.round(px * H / W);
  cv.style.width = wCss + 'px'; cv.style.height = 'auto';
  updatePager();
  const {over} = draw(cv.getContext('2d'), state, logoImg, px, state.idx);
  $('#warn').hidden = !over;
  updateButtons();
}
function updatePager(){
  const recs = records(state), show = state.type === 'cert' && recs.length > 1;
  $('#pager').hidden = !show;
  state.idx = Math.max(0, Math.min(state.idx, recs.length - 1));
  if(show){
    $('#pos').textContent = 'الشهادة ' + arNum(state.idx + 1) + ' من ' + arNum(recs.length);
    $('#prev').disabled = state.idx <= 0; $('#next').disabled = state.idx >= recs.length - 1;
  }
}
export function updateButtons(){
  const pdf = $('#pdfBtn');
  if(state.type === 'cert'){
    const n = records(state).length;
    pdf.textContent = 'تنزيل ' + (n === 1 ? 'الشهادة' : n === 2 ? 'الشهادتين' : arNum(n) + ' ' + plural(n, 'شهادة', 'شهادتان', 'شهادات', 'شهادة')) + ' · PDF';
  } else pdf.textContent = 'تنزيل PDF';
  pdf.disabled = busyNow; $('#pngBtn').disabled = busyNow;
}
export const isBusy = () => busyNow;
export function busy(on){ busyNow = on; updateButtons(); }

export function bindPreview(){
  $('#prev').addEventListener('click', () => { state.idx--; schedule(); });
  $('#next').addEventListener('click', () => { state.idx++; schedule(); });
  if(window.ResizeObserver) new ResizeObserver(schedule).observe($('#desk'));
  window.addEventListener('resize', schedule);
}
