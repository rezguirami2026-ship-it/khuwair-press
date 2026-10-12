export const $ = s => document.querySelector(s);
export const $$ = s => document.querySelectorAll(s);
/** Status line under the actions (announced politely to screen readers). */
export const say = m => { $('#status').textContent = m || ''; };
