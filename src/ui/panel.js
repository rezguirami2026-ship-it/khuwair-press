/* Side panel: layout/theme/font controls, content fields generated from TYPES, school data, reset. */
import { state, curDoc } from '../state/store.js';
import { TYPES } from '../schema/types.js';
import { THEMES, FONTS, TFONTS } from '../schema/themes.js';
import { defaults } from '../schema/defaults.js';
import { lines, parseNames } from '../schema/parse.js';
import { toGender } from '../schema/gender.js';
import { arNum, plural } from '../render/text.js';
import { changed } from './preview.js';
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
  box.append(lab, inp);
  let counter = null;
  if(f.t === 'list'){ counter = document.createElement('span'); counter.className = 'count'; counter.textContent = countText(f.k, inp.value); box.append(counter); }
  if(f.hint){ const h = document.createElement('p'); h.className = 'hint'; h.textContent = arNum(f.hint); box.append(h); }
  inp.addEventListener('input', () => { d[f.k] = inp.value; if(counter) counter.textContent = countText(f.k, inp.value); changed(); });
  return box;
}
function buildFields(){
  const t = TYPES[state.type], d = curDoc(), box = $('#fields');
  box.textContent = '';
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
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = label;
    b.setAttribute('aria-pressed', String(d.layout === id));
    b.addEventListener('click', () => { d.layout = id; buildPanel(); changed(); });
    (group === 'v1' ? old : lay).append(b);
  });
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
  $$('.sw').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.theme === state.theme)));
  $$('.chip.font').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.font === state.tfont)));
  $('#digits').checked = state.digits;
  $('#contentTitle').textContent = 'محتوى ' + t.noun;
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
