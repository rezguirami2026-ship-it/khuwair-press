/* Parsing pasted lists (names with class, poster points) into records. */
export const lines = s => String(s || '').split('\n').map(x => x.trim()).filter(Boolean);

/** One record per line: name, then optional class, subject and rank, separated by tabs (pasted from Excel),
 *  « - » or « | ». A line with only name and class keeps v1 behaviour. */
export function parseNames(s){
  return lines(s).map(l => {
    const parts = l.split(/\t|\s+[-–—]\s*|\s*[-–—]\s+|\s*\|\s*/).map(p => p.trim());
    const name = parts.shift() || '';
    if(parts.length <= 1) return {name, cls:(parts[0] || '')};
    return {name, cls:parts[0] || '', subject:parts[1] || '', rank:parts.slice(2).join(' ')};
  }).filter(e => e.name);
}
export const cleanPoint = s => s.replace(/^\s*(?:[-•*]|[0-9٠-٩]+[.)\-])\s*/, '');

/** One record per page: certificates get one per student, everything else a single blank record. */
export function records(state){
  if(state.type !== 'cert') return [{name:'', cls:''}];
  const r = parseNames(state.docs.cert.names);
  return r.length ? r : [{name:'', cls:''}];
}
export const detRows = d => [['اليوم والتاريخ', d.date], ['الوقت', d.time], ['المكان', d.place]].filter(r => r[1] && String(r[1]).trim());
