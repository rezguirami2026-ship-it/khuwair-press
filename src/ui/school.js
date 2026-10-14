/* School settings file (move a school's setup between devices) and the first-run welcome screen. */
import { state, save } from '../state/store.js';
import { KEY, KEY_V1 } from '../state/migrate.js';
import { THEMES, TFONTS } from '../schema/themes.js';
import { offerFile } from '../export/files.js';
import { $, say } from './dom.js';

export const FORMAT = 'khuwair-press/school';
const SCHOOL_KEYS = ['l1', 'l2', 'l3', 'year', 'director'];
const LOGO_KEYS = ['center', 'side', 'school', 'signature', 'stamp'];

/** The shareable part of the state: school lines, images and look — never the documents themselves. */
export function settingsOf(st){
  return {format:FORMAT, version:1, savedAt:new Date().toISOString(),
    school:Object.fromEntries(SCHOOL_KEYS.map(k => [k, st.school[k] || ''])),
    logos:Object.fromEntries(LOGO_KEYS.map(k => [k, st.logos[k] || null])),
    look:{theme:st.theme, tfont:st.tfont, digits:st.digits, gold:st.gold, ink:st.ink}};
}
const isImage = v => v == null || (typeof v === 'string' && /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length < 4e6);

/** Validates and applies a settings object. Returns an error message, or '' on success. */
export function applySettings(st, o){
  if(!o || o.format !== FORMAT || typeof o.school !== 'object') return 'هذا ليس ملف إعدادات مدرسة صالحاً.';
  for(const k of SCHOOL_KEYS) if(typeof o.school[k] === 'string') st.school[k] = o.school[k].slice(0, 200);
  for(const k of LOGO_KEYS) if(o.logos && k in o.logos && isImage(o.logos[k])) st.logos[k] = o.logos[k];
  const L = o.look || {};
  if(THEMES[L.theme]) st.theme = L.theme;
  if(TFONTS.some(f => f[0] === L.tfont)) st.tfont = L.tfont;
  for(const k of ['digits', 'gold', 'ink']) if(typeof L[k] === 'boolean') st[k] = L[k];
  return '';
}

export function exportSettings(){
  const blob = new Blob([JSON.stringify(settingsOf(state), null, 1)], {type:'application/json'});
  const name = (state.school.l3 || 'المدرسة').replace(/[\\/:*?"<>|]+/g, ' ').trim();
  return offerFile(blob, 'إعدادات ' + name + '.khuwair.json').then(say);
}
/** Lets the user pick a settings file; calls done() after a successful import. */
export function importSettings(done){
  const input = document.createElement('input'); input.type = 'file'; input.accept = '.json,application/json';
  input.addEventListener('change', async () => {
    const f = input.files[0]; if(!f) return;
    let o = null; try{ o = JSON.parse(await f.text()); }catch(e){}
    const err = applySettings(state, o);
    if(err){ say(err); return; }
    done(); say('حُمّلت إعدادات المدرسة.');
  });
  input.click();
}

/** First run (nothing saved yet): ask for the school's details so the tool fits any school. */
export function isFirstRun(){
  try{ return !localStorage.getItem(KEY) && !localStorage.getItem(KEY_V1); }catch(e){ return false; }
}
export function showWelcome(done){
  const dlg = $('#welcomeDlg');
  const fields = SCHOOL_KEYS.map(k => [k, dlg.querySelector(`[data-w="${k}"]`)]);
  for(const [k, el] of fields) el.value = k === 'l3' || k === 'director' ? '' : state.school[k] || '';
  const finish = () => { save(); dlg.close(); done(); };
  dlg.querySelector('#wStart').onclick = () => {
    for(const [k, el] of fields) state.school[k] = el.value.trim();
    finish();
  };
  dlg.querySelector('#wSkip').onclick = finish;
  dlg.querySelector('#wImport').onclick = () => importSettings(() => { for(const [k, el] of fields) el.value = state.school[k] || ''; finish(); });
  dlg.addEventListener('cancel', e => { e.preventDefault(); finish(); }, {once:true});
  dlg.showModal();
  fields[2][1].focus();
}
