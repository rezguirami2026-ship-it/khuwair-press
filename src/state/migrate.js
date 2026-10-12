/* Storage format migrations. v1 (key khuwair-press-v1) → v2 (key khuwair-press-v2).
 * v2 adds: gold / ink switches, signature and stamp images, poster `kind` (was encoded in the v1 poster layout),
 * and the heading font 'auto' (template pairing). Saved layouts are kept, so v1 users see exactly what they had. */
import { TYPES } from '../schema/types.js';
import { THEMES, TFONTS } from '../schema/themes.js';
import { defaults, defaultSchool } from '../schema/defaults.js';

export const KEY_V1 = 'khuwair-press-v1';
export const KEY = 'khuwair-press-v2';
export const VERSION = 2;

export function freshState(){
  return {
    v:VERSION, type:'cert', theme:'maroon', tfont:'auto', digits:true, gold:true, ink:false, quality:'print', idx:0,
    school:defaultSchool(),
    logos:{center:null, side:null, signature:null, stamp:null},
    docs:Object.fromEntries(Object.keys(TYPES).map(t => [t, defaults(t)]))
  };
}

/** Merges a saved object (v1 or v2) onto a fresh state. Unknown or broken values fall back to defaults. */
export function migrate(saved){
  const st = freshState();
  if(!saved || typeof saved !== 'object' || (saved.v !== 1 && saved.v !== 2)) return st;
  ['type','theme','tfont','digits','gold','ink','quality'].forEach(k => { if(saved[k] !== undefined) st[k] = saved[k]; });
  if(!TYPES[st.type]) st.type = 'cert';
  if(!THEMES[st.theme]) st.theme = 'maroon';
  if(saved.v === 1 && st.tfont === 'ruqaa') st.tfont = 'auto'; // v1 default; v1 layouts still draw Ruqaa under 'auto'
  if(!TFONTS.some(f => f[0] === st.tfont)) st.tfont = 'auto';
  Object.assign(st.school, saved.school || {});
  Object.assign(st.logos, saved.logos || {});
  for(const t of Object.keys(TYPES)){
    const doc = Object.assign(defaults(t), (saved.docs || {})[t] || {});
    if(t === 'poster' && (doc.layout === 'guide' || doc.layout === 'honor')){ doc.kind = doc.layout; doc.layout = 'v1'; }
    if(!TYPES[t].layouts.some(l => l[0] === doc.layout)) doc.layout = TYPES[t].layouts[0][0];
    st.docs[t] = doc;
  }
  st.v = VERSION;
  return st;
}
