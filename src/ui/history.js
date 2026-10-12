/* Undo / redo over the document state. Edits are grouped: typing that pauses for less than GROUP ms is one step.
 * Uploaded images are not part of the history (too large); everything else is. */
import { state } from '../state/store.js';

const GROUP = 600, LIMIT = 100;
const snap = () => JSON.stringify(Object.assign({}, state, {logos:null, idx:0}));
let past = [], future = [], timer = 0, onRestore = () => {}, onChange = () => {};

/** Starts the history from the current state. restore() is called after an undo/redo to refresh the UI. */
export function initHistory(restore, change){
  onRestore = restore; onChange = change || (() => {});
  past = [snap()]; future = []; onChange();
}
/** Call after every edit; commits a step once the user pauses. */
export function note(){
  clearTimeout(timer);
  timer = setTimeout(commit, GROUP);
}
function commit(){
  clearTimeout(timer);
  const s = snap();
  if(s === past[past.length - 1]) return;
  past.push(s); if(past.length > LIMIT) past.shift();
  future = []; onChange();
}
function apply(s){
  const o = JSON.parse(s), logos = state.logos, idx = state.idx;
  Object.assign(state, o, {logos, idx});
  onRestore(); onChange();
}
export function undo(){
  commit();                          // a pending edit becomes its own step first
  if(past.length < 2) return false;
  future.push(past.pop());
  apply(past[past.length - 1]);
  return true;
}
export function redo(){
  if(!future.length) return false;
  const s = future.pop(); past.push(s);
  apply(s);
  return true;
}
export const canUndo = () => past.length > 1 || snap() !== past[past.length - 1];
export const canRedo = () => future.length > 0;
