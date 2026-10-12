/* Storage format migrations. v1 (key khuwair-press-v1) → v2 (key khuwair-press-v2).
 * v2 keeps the v1 shape and adds a format version; future fields get their defaults here. */
import { TYPES } from '../schema/types.js';
import { THEMES } from '../schema/themes.js';
import { defaults, defaultSchool } from '../schema/defaults.js';

export const KEY_V1 = 'khuwair-press-v1';
export const KEY = 'khuwair-press-v2';
export const VERSION = 2;

export function freshState(){
  return {
    v:VERSION, type:'cert', theme:'maroon', tfont:'ruqaa', digits:true, idx:0,
    school:defaultSchool(),
    logos:{center:null, side:null},
    docs:Object.fromEntries(Object.keys(TYPES).map(t => [t, defaults(t)]))
  };
}

/** Merges a saved object (v1 or v2) onto a fresh state. Unknown or broken values fall back to defaults. */
export function migrate(saved){
  const st = freshState();
  if(!saved || typeof saved !== 'object' || (saved.v !== 1 && saved.v !== 2)) return st;
  ['type','theme','tfont','digits'].forEach(k => { if(saved[k] !== undefined) st[k] = saved[k]; });
  if(!TYPES[st.type]) st.type = 'cert';
  if(!THEMES[st.theme]) st.theme = 'maroon';
  Object.assign(st.school, saved.school || {});
  Object.assign(st.logos, saved.logos || {});
  for(const t of Object.keys(TYPES)) st.docs[t] = Object.assign(defaults(t), (saved.docs || {})[t] || {});
  st.v = VERSION;
  return st;
}
