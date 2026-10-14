/* The single app state, persisted to localStorage (v2). The v1 key is read once as a fallback and never deleted. */
import { KEY, KEY_V1, freshState, migrate } from './migrate.js';

export const state = freshState();

function read(key){
  try{ return JSON.parse(localStorage.getItem(key) || 'null'); }catch(e){ return null; }
}
export function load(){
  Object.assign(state, migrate(read(KEY) || read(KEY_V1)));
}
export function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }
  catch(e){
    try{ const lite = Object.assign({}, state, {logos:{center:null, side:null, school:null, signature:null, stamp:null}}); localStorage.setItem(KEY, JSON.stringify(lite)); }catch(e2){}
  }
}
export const curDoc = () => state.docs[state.type];
