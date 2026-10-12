/* Import names from Excel (.xlsx/.xls) or CSV: choose the sheet and the name / class / subject / rank columns,
 * preview, then replace or extend the list. Arabic CSV files saved by older Excel (Windows-1256) are decoded too. */
import { arNum, plural } from '../render/text.js';
import { $, say } from './dom.js';

let XLSX = null;
const lib = async () => XLSX || (XLSX = await import('xlsx'));

const GUESS = {
  name:/^(الاسم|اسم|اسم الطالب|اسم الطالبة|الاسم الكامل|اسم المتفوق|name|student)/i,
  cls:/(الصف|صف|الشعبة|الفصل|class|grade|section)/i,
  subject:/(المادة|مادة|subject|course)/i,
  rank:/(المركز|مركز|الترتيب|ترتيب|rank|place)/i
};
const clean = v => String(v == null ? '' : v).replace(/\s+[-–—]\s+|\s*\|\s*|\t/g, ' ').replace(/\s+/g, ' ').trim();

/** Reads a File into {sheets:[{name, rows}]}; rows are arrays of strings. */
export async function readTable(file){
  const X = await lib();
  let wb;
  if(/\.(csv|txt|tsv)$/i.test(file.name)){
    const bytes = new Uint8Array(await file.arrayBuffer());
    let text;
    try{ text = new TextDecoder('utf-8', {fatal:true}).decode(bytes); }
    catch(e){ text = new TextDecoder('windows-1256').decode(bytes); }
    wb = X.read(text.replace(/^﻿/, ''), {type:'string', raw:false});
  } else wb = X.read(await file.arrayBuffer(), {type:'array'});
  return {sheets:wb.SheetNames.map(name => ({name,
    rows:X.utils.sheet_to_json(wb.Sheets[name], {header:1, raw:false, defval:'', blankrows:false})
      .map(r => r.map(clean)).filter(r => r.some(Boolean))}))};
}

/** Picks columns from a header row (or, without headers, the first mostly-Arabic text column as the name). */
export function guessColumns(rows){
  const head = rows[0] || [], cols = {name:-1, cls:-1, subject:-1, rank:-1};
  head.forEach((h, i) => { for(const k of Object.keys(GUESS)) if(cols[k] < 0 && GUESS[k].test(h)) cols[k] = i; });
  const hasHeader = cols.name >= 0 || cols.cls >= 0;
  if(cols.name < 0){
    const body = rows.slice(hasHeader ? 1 : 0, 30), width = Math.max(0, ...rows.map(r => r.length));
    let best = -1, score = -1;
    for(let i = 0; i < width; i++){
      const sc = body.filter(r => /[ء-ي]{2,}.*\s.*[ء-ي]{2,}/.test(r[i] || '')).length;
      if(sc > score){ score = sc; best = i; }
    }
    cols.name = best;
  }
  if(cols.cls < 0){ // a column of short values like «5/3» or «السادس 2» is the class
    const body = rows.slice(hasHeader ? 1 : 0, 30), width = Math.max(0, ...rows.map(r => r.length));
    for(let i = 0; i < width; i++){
      if(Object.values(cols).includes(i)) continue;
      const vals = body.map(r => r[i] || '').filter(Boolean);
      if(vals.length && vals.filter(v => v.length <= 12 && /[0-9٠-٩]/.test(v) && /[\/\\\-–]|^\S+\s+\S+$|^[0-9٠-٩]+$/.test(v)).length >= vals.length * 0.8){ cols.cls = i; break; }
    }
  }
  return {cols, hasHeader};
}

/** Builds name-list lines: «الاسم - الصف», or «الاسم | الصف | المادة | المركز» when there are extra columns. */
export function toLines(rows, cols, hasHeader){
  const out = [];
  for(const r of rows.slice(hasHeader ? 1 : 0)){
    const name = r[cols.name] || ''; if(!name) continue;
    const cls = cols.cls >= 0 ? r[cols.cls] || '' : '', sub = cols.subject >= 0 ? r[cols.subject] || '' : '', rank = cols.rank >= 0 ? r[cols.rank] || '' : '';
    if(sub || rank) out.push([name, cls, sub, rank].join(' | '));
    else out.push(cls ? name + ' - ' + cls : name);
  }
  return out;
}

/** Opens the import dialog for a list field. apply(lines, mode) with mode 'replace' | 'append'. */
export function openImport(fieldLabel, extras, apply){
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.xlsx,.xls,.csv,.txt,.tsv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv';
  input.addEventListener('change', async () => {
    const file = input.files[0]; if(!file) return;
    let table;
    try{ say('جارٍ قراءة الملف…'); table = await readTable(file); say(''); }
    catch(e){ console.warn(e); say('تعذّرت قراءة الملف. احفظه بصيغة xlsx أو csv وأعد المحاولة.'); return; }
    if(!table.sheets.some(s => s.rows.length)){ say('الملف فارغ.'); return; }
    showDialog(file.name, table, fieldLabel, extras, apply);
  });
  input.click();
}

function showDialog(fileName, table, fieldLabel, extras, apply){
  const dlg = $('#importDlg'), body = dlg.querySelector('.dlg-body');
  body.textContent = '';
  let sheet = table.sheets.find(s => s.rows.length) || table.sheets[0];
  let {cols, hasHeader} = guessColumns(sheet.rows);
  const h = document.createElement('p'); h.className = 'hint'; h.textContent = 'الملف: ' + fileName; body.append(h);

  const grid = document.createElement('div'); grid.className = 'imp-grid'; body.append(grid);
  const mk = (label, el) => { const w = document.createElement('label'); w.className = 'imp-field'; const s = document.createElement('span'); s.textContent = label; w.append(s, el); grid.append(w); return el; };
  const sheetSel = document.createElement('select');
  table.sheets.forEach((s, i) => { const o = document.createElement('option'); o.value = i; o.textContent = s.name; sheetSel.append(o); });
  sheetSel.value = String(table.sheets.indexOf(sheet));
  if(table.sheets.length > 1) mk('الورقة', sheetSel);
  const headChk = document.createElement('input'); headChk.type = 'checkbox';
  const colSels = {};
  const fields = [['name', 'عمود الاسم'], ['cls', 'عمود الصف'], ...(extras ? [['subject', 'عمود المادة (اختياري)'], ['rank', 'عمود المركز (اختياري)']] : [])];
  fields.forEach(([k, l]) => { colSels[k] = mk(l, document.createElement('select')); });
  const hw = document.createElement('label'); hw.className = 'switch imp-head'; hw.append(headChk, document.createElement('span'), document.createTextNode('الصف الأول عناوين أعمدة')); body.append(hw);
  const prev = document.createElement('div'); prev.className = 'imp-preview'; body.append(prev);
  const count = document.createElement('p'); count.className = 'count'; body.append(count);

  const fillCols = () => {
    const width = Math.max(1, ...sheet.rows.map(r => r.length)), head = sheet.rows[0] || [];
    for(const [k] of fields){
      const sel = colSels[k]; sel.textContent = '';
      if(k !== 'name'){ const o = document.createElement('option'); o.value = -1; o.textContent = '— لا يوجد —'; sel.append(o); }
      for(let i = 0; i < width; i++){
        const o = document.createElement('option'); o.value = i;
        o.textContent = 'العمود ' + arNum(i + 1) + (hasHeader && head[i] ? ': ' + head[i] : (sheet.rows[hasHeader ? 1 : 0] || [])[i] ? ' (' + String(sheet.rows[hasHeader ? 1 : 0][i]).slice(0, 24) + ')' : '');
        sel.append(o);
      }
      sel.value = String(cols[k] >= 0 ? cols[k] : (k === 'name' ? 0 : -1));
    }
    headChk.checked = hasHeader;
  };
  const read = () => { for(const [k] of fields) cols[k] = +colSels[k].value; hasHeader = headChk.checked; };
  const refresh = () => {
    read();
    const lines = toLines(sheet.rows, cols, hasHeader);
    prev.textContent = '';
    const ul = document.createElement('ol');
    lines.slice(0, 6).forEach(l => { const li = document.createElement('li'); li.textContent = l; ul.append(li); });
    prev.append(ul);
    if(lines.length > 6){ const m = document.createElement('p'); m.className = 'hint'; m.textContent = '… و' + arNum(lines.length - 6) + ' ' + plural(lines.length - 6, 'اسم', 'اسمان', 'أسماء', 'اسماً') + ' أخرى'; prev.append(m); }
    count.textContent = lines.length ? arNum(lines.length) + ' ' + plural(lines.length, 'اسم', 'اسمان', 'أسماء', 'اسماً') + ' جاهزة للاستيراد إلى «' + fieldLabel + '»' : 'لا توجد أسماء في العمود المختار';
    dlg.querySelectorAll('[data-mode]').forEach(b => { b.disabled = !lines.length; });
    return lines;
  };
  sheetSel.addEventListener('change', () => { sheet = table.sheets[+sheetSel.value]; ({cols, hasHeader} = guessColumns(sheet.rows)); fillCols(); refresh(); });
  headChk.addEventListener('change', () => { hasHeader = headChk.checked; refresh(); });
  Object.values(colSels).forEach(s => s.addEventListener('change', refresh));
  fillCols(); refresh();

  dlg.querySelectorAll('[data-mode]').forEach(b => {
    b.onclick = () => { const lines = refresh(); dlg.close(); apply(lines, b.dataset.mode); say('استُورد ' + arNum(lines.length) + ' ' + plural(lines.length, 'اسم', 'اسمان', 'أسماء', 'اسماً') + '.'); };
  });
  dlg.querySelector('[data-close]').onclick = () => dlg.close();
  dlg.showModal();
}
