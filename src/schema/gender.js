/* Arabic gender agreement: switches the wording of a text between masculine and feminine
 * (الطالب/الطالبة، لتفوّقه/لتفوّقها، له/لها …). Words are matched whole, with or without diacritics.
 * Only unambiguous pairs are listed; adjectives that also qualify feminine nouns are left alone. */

const PAIRS = [
  ['الطالب', 'الطالبة'], ['للطالب', 'للطالبة'], ['بالطالب', 'بالطالبة'], ['طالب', 'طالبة'],
  ['الأستاذ', 'الأستاذة'], ['للأستاذ', 'للأستاذة'], ['ابننا', 'ابنتنا'], ['لابننا', 'لابنتنا'],
  ['المتفوّقون', 'المتفوّقات'], ['المتفوّقين', 'المتفوّقات'], ['الفائزون', 'الفائزات'],
  ['له', 'لها'], ['وله', 'ولها'], ['لديه', 'لديها'], ['وهو', 'وهي'], ['إنه', 'إنها'], ['فإنه', 'فإنها'],
  ['تفوّقه', 'تفوّقها'], ['لتفوّقه', 'لتفوّقها'], ['وتفوّقه', 'وتفوّقها'],
  ['تميّزه', 'تميّزها'], ['لتميّزه', 'لتميّزها'], ['وتميّزه', 'وتميّزها'],
  ['جهوده', 'جهودها'], ['لجهوده', 'لجهودها'], ['وجهوده', 'وجهودها'],
  ['عطائه', 'عطائها'], ['وعطائه', 'وعطائها'], ['لعطائه', 'لعطائها'],
  ['رسالته', 'رسالتها'], ['لرسالته', 'لرسالتها'],
  ['مشاركته', 'مشاركتها'], ['لمشاركته', 'لمشاركتها'], ['ومشاركته', 'ومشاركتها'],
  ['حصوله', 'حصولها'], ['لحصوله', 'لحصولها'],
  ['إبداعه', 'إبداعها'], ['وإبداعه', 'وإبداعها'], ['لإبداعه', 'لإبداعها'],
  ['إلقائه', 'إلقائها'], ['أدائه', 'أدائها'], ['لأدائه', 'لأدائها'], ['وأدائه', 'وأدائها'],
  ['اجتهاده', 'اجتهادها'], ['لاجتهاده', 'لاجتهادها'], ['واجتهاده', 'واجتهادها'],
  ['التزامه', 'التزامها'], ['لالتزامه', 'لالتزامها'], ['والتزامه', 'والتزامها'],
  ['حرصه', 'حرصها'], ['لحرصه', 'لحرصها'], ['إنجازه', 'إنجازها'], ['لإنجازه', 'لإنجازها'],
  ['سلوكه', 'سلوكها'], ['لسلوكه', 'لسلوكها'], ['انضباطه', 'انضباطها'], ['لانضباطه', 'لانضباطها'],
  ['تعاونه', 'تعاونها'], ['لتعاونه', 'لتعاونها'], ['مستواه', 'مستواها'], ['زملائه', 'زميلاتها'],
  ['يستحق', 'تستحق'], ['حصل', 'حصلت'], ['شارك', 'شاركت'], ['فاز', 'فازت']
];

const MARKS = '[\\u064B-\\u0652\\u0670\\u0640]*';            // harakat, shadda, superscript alef, tatweel
const LETTER = '\\u0621-\\u064A\\u0671-\\u06D3';
const strip = s => s.replace(/[ً-ْٰـ]/g, '');
const pattern = w => new RegExp(`(?<![${LETTER}])${[...strip(w)].join(MARKS)}${MARKS}(?![${LETTER}])`, 'g');

const RULES = {
  f:PAIRS.map(([m, f]) => [pattern(m), f]).sort((a, b) => b[1].length - a[1].length),
  m:PAIRS.filter(([m, f]) => !PAIRS.some(([m2, f2]) => f2 === f && m2 !== m && strip(m2).length > strip(m).length))
    .map(([m, f]) => [pattern(f), m])
};

/** Rewrites text for gender g ('m' | 'f'). */
export function toGender(text, g){
  let s = String(text == null ? '' : text);
  for(const [re, to] of RULES[g === 'f' ? 'f' : 'm']) s = s.replace(re, to);
  return s;
}

/* ---- per-record placeholders: {الاسم} {الصف} {المادة} {المركز} ---- */
const RANKS = {1:'المركز الأول', 2:'المركز الثاني', 3:'المركز الثالث', 4:'المركز الرابع', 5:'المركز الخامس',
  'الأول':'المركز الأول', 'الثاني':'المركز الثاني', 'الثالث':'المركز الثالث', 'الرابع':'المركز الرابع', 'الخامس':'المركز الخامس'};
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
/** "1", "١", "الأول", "المركز الأول" → "المركز الأول"; anything else is kept as written. */
export function rankText(r){
  const s = String(r || '').trim().replace(/[٠-٩]/g, d => AR_DIGITS.indexOf(d));
  if(!s) return '';
  if(/^المركز/.test(s)) return s;
  return RANKS[s] || s;
}
/** Replaces placeholders with the record's values (sensible wording when a value is missing). */
export function fillTokens(text, rec){
  if(!text || text.indexOf('{') < 0) return text;
  rec = rec || {};
  return String(text)
    .replace(/\{الاسم\}/g, rec.name || '')
    .replace(/\{الصف\}/g, rec.cls || '')
    .replace(/\{المادة\}/g, rec.subject || 'المدرسة')
    .replace(/\{المركز\}/g, rankText(rec.rank) || 'مركز متقدّم')
    .replace(/\s{2,}/g, ' ');
}
