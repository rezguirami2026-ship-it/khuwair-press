/* Side panel: layout/theme/font controls, content fields generated from TYPES, school data, reset. */
import { state, curDoc } from '../state/store.js';
import { TYPES } from '../schema/types.js';
import { THEMES, FONTS, TFONTS } from '../schema/themes.js';
import { defaults, fmtDateMode } from '../schema/defaults.js';
import { lines, parseNames } from '../schema/parse.js';
import { toGender } from '../schema/gender.js';
import { OCCASIONS, presetFor } from '../schema/presets.js';
import { openImport } from './importer.js';
import { FRAME_STYLES } from '../templates/skins.js';
import { updateExportControls } from './actions.js';
import { arNum, plural } from '../render/text.js';
import { changed, schedule } from './preview.js';
import { draw, pageSize } from '../render/draw.js';
import { logoImg } from './logos.js';
import { $, $$, say } from './dom.js';

function countText(k, v){
  if(k === 'gPoints'){ const n = lines(v).length; return n ? arNum(n) + ' ' + plural(n, 'نقطة', 'نقطتان', 'نقاط', 'نقطة') : 'لا توجد نقاط بعد'; }
  const n = parseNames(v).length;
  if(!n) return 'لا توجد أسماء بعد';
  const base = arNum(n) + ' ' + plural(n, 'اسم', 'اسمان', 'أسماء', 'اسماً');
  return k === 'names' ? base + ' ← ' + arNum(n) + ' ' + plural(n, 'شهادة', 'شهادتان', 'شهادات', 'شهادة') : base;
}
function fieldEl(f, d){
  const id = 'f-' + state.type + '-' + f.k;
  const box = document.createElement('div'); box.className = 'field';
  if(f.t === 'gender'){
    const lab = document.createElement('span'); lab.className = 'lbl'; lab.textContent = f.l;
    const chips = document.createElement('div'); chips.className = 'chips'; chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', f.l);
    [['m', 'طالب'], ['f', 'طالبة']].forEach(([g, label]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label;
      b.setAttribute('aria-pressed', String((d.gender || 'm') === g));
      b.addEventListener('click', () => {
        if((d.gender || 'm') === g) return;
        d.gender = g;
        // rewrite every gender-aware field of this document (الطالب/الطالبة، لتفوّقه/لتفوّقها، له/لها …)
        TYPES[state.type].fields.filter(x => x.g).forEach(x => { if(typeof d[x.k] === 'string') d[x.k] = toGender(d[x.k], g); });
        buildFields(); changed();
      });
      chips.append(b);
    });
    box.append(lab, chips); return box;
  }
  if(f.t === 'check'){
    const lab = document.createElement('label'); lab.className = 'switch';
    const inp = document.createElement('input'); inp.type = 'checkbox'; inp.id = id; inp.checked = !!d[f.k];
    const sp = document.createElement('span');
    lab.append(inp, sp, document.createTextNode(f.l));
    inp.addEventListener('change', () => { d[f.k] = inp.checked; changed(); });
    box.append(lab); return box;
  }
  const lab = document.createElement('label'); lab.htmlFor = id; lab.textContent = f.l;
  const inp = f.t === 'text' ? document.createElement('input') : document.createElement('textarea');
  if(f.t === 'text') inp.type = 'text'; else inp.rows = f.rows || 3;
  inp.id = id; inp.dir = 'rtl'; inp.value = d[f.k] == null ? '' : d[f.k];
  if(f.ph) inp.placeholder = f.ph;
  const sizable = SIZE_KEYS[state.type].includes(f.k) && !isV1Layout(d);
  box.append(sizable ? labelRow(lab, f, d) : lab, inp);
  let counter = null;
  if(f.t === 'list'){ counter = document.createElement('span'); counter.className = 'count'; counter.textContent = countText(f.k, inp.value); box.append(counter); }
  if(f.date) box.append(datePicker(f, d, inp));
  if(f.t === 'list' && f.k !== 'gPoints'){
    const b = document.createElement('button'); b.type = 'button'; b.className = 'btn small import-btn'; b.textContent = 'استيراد من Excel أو CSV';
    b.addEventListener('click', () => openImport(f.l, !!f.import, (ls, mode) => {
      const cur = String(d[f.k] || '').trim();
      d[f.k] = mode === 'append' && cur ? cur + '\n' + ls.join('\n') : ls.join('\n');
      inp.value = d[f.k]; if(counter) counter.textContent = countText(f.k, inp.value);
      state.idx = 0; changed();
    }));
    box.append(b);
  }
  if(f.hint){ const h = document.createElement('p'); h.className = 'hint'; h.textContent = arNum(f.hint); box.append(h); }
  inp.addEventListener('input', () => { d[f.k] = inp.value; if(counter) counter.textContent = countText(f.k, inp.value); changed(); });
  return box;
}
/* ---- template gallery: each choice shows a live thumbnail of the current content ---- */
let thumbTimer = 0;
/** Redraws the template thumbnails (debounced; v1 thumbnails only while their group is open). */
export function thumbs(delay){
  clearTimeout(thumbTimer);
  thumbTimer = setTimeout(() => {
    const t = TYPES[state.type], [W, H] = pageSize(state), dpr = Math.min(2, window.devicePixelRatio || 1);
    const openOld = $('#layoutsV1').parentElement.open;
    for(const g of ['#layouts', '#layoutsV1']) $(g).style.setProperty('--cols', W > H ? 2 : 4);
    document.querySelectorAll('.tpl').forEach(b => {
      if(!openOld && b.closest('#layoutsV1')) return;
      const cv = b.querySelector('canvas'), wCss = W > H ? 132 : 92, px = Math.round(wCss * dpr);
      if(cv.width !== px){ cv.width = px; cv.height = Math.round(px * H / W); cv.style.width = wCss + 'px'; }
      const doc = Object.assign({}, state.docs[state.type], {layout:b.dataset.layout});
      const st = Object.assign({}, state, {docs:Object.assign({}, state.docs, {[state.type]:doc})});
      try{ draw(cv.getContext('2d'), st, logoImg, px, state.idx); }catch(e){ console.warn(e); }
    });
    if(t) schedule(); // the preview restores the shared render environment for the live page
  }, delay == null ? 350 : delay);
}
/** Text elements whose size the user can change (new templates only; v1 layouts keep their fixed sizes). */
const SIZE_KEYS = {
  cert:['title', 'intro', 'names', 'cls', 'reason', 'date'],
  notice:['kicker', 'title', 'greeting', 'body', 'note', 'closing'],
  poster:['gKicker', 'gTitle', 'gSub', 'gPoints', 'gFooter', 'hTitle', 'hSub', 'hNames', 'hFooter'],
  invite:['heading', 'lead', 'occasion', 'desc', 'closing']
};
const isV1Layout = d => TYPES[state.type].layouts.some(l => l[0] === d.layout && l[2] === 'v1');
/** Label with «أ− ١٠٠٪ أ+» size buttons (10 % steps, 60–160 %). The layout engine still keeps everything inside the page. */
function labelRow(lab, f, d){
  const row = document.createElement('div'); row.className = 'lab-row';
  const ctl = document.createElement('span'); ctl.className = 'size-ctl'; ctl.setAttribute('role', 'group'); ctl.setAttribute('aria-label', 'حجم ' + f.l);
  const pct = document.createElement('span'); pct.className = 'pct';
  const cur = () => Math.round(((d.sz && d.sz[f.k]) || 1) * 100);
  const show = () => { pct.textContent = arNum(cur()) + '٪'; minus.disabled = cur() <= 60; plus.disabled = cur() >= 160; };
  const step = delta => {
    d.sz = Object.assign({}, d.sz);
    const v = Math.max(60, Math.min(160, cur() + delta)) / 100;
    if(v === 1) delete d.sz[f.k]; else d.sz[f.k] = v;
    show(); changed();
  };
  const minus = document.createElement('button'), plus = document.createElement('button');
  minus.type = plus.type = 'button'; minus.className = plus.className = 'sz';
  minus.textContent = 'أ−'; plus.textContent = 'أ+';
  minus.title = 'تصغير'; plus.title = 'تكبير'; minus.setAttribute('aria-label', 'تصغير ' + f.l); plus.setAttribute('aria-label', 'تكبير ' + f.l);
  minus.addEventListener('click', () => step(-10)); plus.addEventListener('click', () => step(10));
  ctl.append(minus, pct, plus); show();
  row.append(lab, ctl);
  return row;
}
/** Date helper under a date field: pick a day and a calendar (ميلادي / هجري / كلاهما); the text stays editable. */
function datePicker(f, d, inp){
  const row = document.createElement('div'); row.className = 'date-row';
  const day = document.createElement('input'); day.type = 'date'; day.setAttribute('aria-label', 'اختر اليوم');
  const now = new Date(); day.value = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const mode = document.createElement('select'); mode.setAttribute('aria-label', 'التقويم');
  [['g', 'ميلادي'], ['h', 'هجري'], ['both', 'ميلادي وهجري']].forEach(([v, l]) => { const o = document.createElement('option'); o.value = v; o.textContent = l; mode.append(o); });
  const go = document.createElement('button'); go.type = 'button'; go.className = 'btn small'; go.textContent = 'أدخل التاريخ';
  go.addEventListener('click', () => {
    if(!day.value) return;
    const [y, m, dd] = day.value.split('-').map(Number);
    d[f.k] = inp.value = fmtDateMode(new Date(y, m - 1, dd, 12), mode.value, f.date === 'weekday');
    changed();
  });
  row.append(day, mode, go);
  return row;
}
/** «نصوص جاهزة»: replaces the document's texts with an occasion's wording (names, dates and places are kept). */
function presetPicker(d){
  const box = document.createElement('div'); box.className = 'field preset';
  const lab = document.createElement('label'); lab.htmlFor = 'preset'; lab.textContent = 'نصوص جاهزة لمناسبة';
  const sel = document.createElement('select'); sel.id = 'preset';
  const first = document.createElement('option'); first.value = ''; first.textContent = 'اختر مناسبة…'; sel.append(first);
  for(const [id, label] of OCCASIONS){ if(!presetFor(id, state.type)) continue; const op = document.createElement('option'); op.value = id; op.textContent = label; sel.append(op); }
  sel.addEventListener('change', () => {
    const p = presetFor(sel.value, state.type); if(!p) return;
    const label = sel.selectedOptions[0].textContent;
    Object.assign(d, p);
    if(d.gender === 'f') TYPES[state.type].fields.filter(x => x.g).forEach(x => { if(typeof d[x.k] === 'string') d[x.k] = toGender(d[x.k], 'f'); });
    buildFields(); changed(); say('طُبّقت نصوص «' + label + '». يمكنك التراجع عنها.');
  });
  box.append(lab, sel);
  return box;
}
function buildFields(){
  const t = TYPES[state.type], d = curDoc(), box = $('#fields');
  box.textContent = '';
  box.append(presetPicker(d));
  const fs = t.fields.filter(f => !f.when || f.when(d));
  for(let i = 0; i < fs.length; i++){
    const f = fs[i];
    if(f.half && fs[i + 1] && fs[i + 1].half){
      const row = document.createElement('div'); row.className = 'row2';
      row.append(fieldEl(f, d), fieldEl(fs[i + 1], d)); box.append(row); i++;
    } else box.append(fieldEl(f, d));
  }
}
/** Rebuilds everything that depends on the current type/document. */
export function buildPanel(){
  const t = TYPES[state.type], d = curDoc();
  $$('.tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.type === state.type)));
  const lay = $('#layouts'), old = $('#layoutsV1'); lay.textContent = ''; old.textContent = '';
  t.layouts.forEach(([id, label, group]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tpl'; b.dataset.layout = id;
    b.setAttribute('aria-pressed', String(d.layout === id));
    const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
    const cap = document.createElement('span'); cap.textContent = label;
    b.append(cv, cap);
    b.addEventListener('click', () => { d.layout = id; buildPanel(); changed(); });
    (group === 'v1' ? old : lay).append(b);
  });
  thumbs();
  if(t.layouts.some(l => l[2] === 'v1' && l[0] === d.layout)) old.parentElement.open = true;
  const kinds = $('#kinds'); kinds.textContent = '';
  $('#kindGroup').hidden = !t.kinds;
  (t.kinds || []).forEach(([id, label]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label;
    b.setAttribute('aria-pressed', String((d.kind || t.kinds[0][0]) === id));
    b.addEventListener('click', () => { d.kind = id; buildPanel(); changed(); });
    kinds.append(b);
  });
  $('#gold').checked = state.gold !== false; $('#ink').checked = !!state.ink;
  // frame styles of the «فاخر» identity
  const frames = $('#frames'); frames.textContent = '';
  $('#frameGroup').hidden = d.layout !== 'luxe';
  for(const [id, label] of FRAME_STYLES){
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label;
    b.setAttribute('aria-pressed', String((d.frame || FRAME_STYLES[0][0]) === id));
    b.addEventListener('click', () => { d.frame = id; buildPanel(); changed(); });
    frames.append(b);
  }
  $$('.sw').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.theme === state.theme)));
  $$('.chip.font').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.font === state.tfont)));
  $('#digits').checked = state.digits;
  $('#contentTitle').textContent = 'محتوى ' + t.noun;
  updateExportControls();
  buildFields();
  resetArm(false);
}
/** Puts the school fields back in sync with state (after load or import). */
export function fillSchool(){ $$('[data-s]').forEach(inp => { inp.value = state.school[inp.dataset.s] || ''; }); }

/* reset with in-page confirmation */
let resetTimer = 0;
function resetArm(on){
  const b = $('#resetBtn'); clearTimeout(resetTimer);
  b.dataset.armed = on ? '1' : '';
  b.textContent = on ? 'اضغط مرة أخرى للتأكيد' : 'استعادة النص الافتراضي لهذا القسم';
  if(on) resetTimer = setTimeout(() => resetArm(false), 3500);
}

/** One-time controls: swatches, font chips, digits, tabs, school fields, reset. */
export function bindPanel(){
  const sws = $('#swatches');
  Object.entries(THEMES).forEach(([k, th]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sw'; b.dataset.theme = k;
    b.style.setProperty('--p', th.primary); b.style.setProperty('--a', th.accent);
    b.setAttribute('aria-label', th.name); b.title = th.name;
    b.addEventListener('click', () => { state.theme = k; buildPanel(); changed(); });
    sws.append(b);
  });
  const fontsBox = $('#fonts');
  TFONTS.forEach(([k, label]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip font'; b.dataset.font = k;
    b.textContent = label; b.style.fontFamily = FONTS[k];
    b.addEventListener('click', () => { state.tfont = k; buildPanel(); changed(); });
    fontsBox.append(b);
  });
  $('#digits').addEventListener('change', e => { state.digits = e.target.checked; changed(); });
  $('#gold').addEventListener('change', e => { state.gold = e.target.checked; changed(); });
  $('#ink').addEventListener('change', e => { state.ink = e.target.checked; changed(); });
  $$('.tab').forEach(b => b.addEventListener('click', () => {
    if(state.type === b.dataset.type) return;
    state.type = b.dataset.type; state.idx = 0; say(''); buildPanel(); changed();
  }));
  $$('[data-s]').forEach(inp => {
    inp.addEventListener('input', () => { state.school[inp.dataset.s] = inp.value; changed(); });
  });
  $('#resetBtn').addEventListener('click', () => {
    if(!$('#resetBtn').dataset.armed){ resetArm(true); return; }
    state.docs[state.type] = defaults(state.type); state.idx = 0;
    buildPanel(); changed(); say('استُعيد النص الافتراضي.');
  });
}
