/* Render environment shared by primitives and templates during one draw() call.
 * draw() fills it in, so templates never reach into the UI or the store directly. */
import { FONTS, TFONTS } from '../schema/themes.js';

export const env = {
  /** The state being drawn (school header, heading font, digits). */
  state:null,
  /** Decoded images by slot: {center, side, signature, stamp}. */
  logos:{center:null, side:null, signature:null, stamp:null},
  /** Arabic-Indic digits on/off for this draw. */
  DIG:true,
  /** Set by any block whose content could not fit. */
  OVER:false,
  /** Gold-foil effect on ornaments, and ink-saving mode (outlines instead of large fills). */
  gold:true, ink:false,
  /** When an array, every drawn text/element box is recorded here (tests check for overlaps). */
  boxes:null
};

/** Heading font family and weight chosen by the user (legacy templates: Ruqaa when 'auto'). */
export const tfam = () => FONTS[env.state.tfont] || FONTS.ruqaa;
export const tw = () => { const f = TFONTS.find(x => x[0] === env.state.tfont); return f && f[2] ? f[2] : 700; };
/** User's heading font override for the new templates, or null for the template's own pairing. */
export const headingOverride = () => {
  const f = TFONTS.find(x => x[0] === env.state.tfont);
  return f && f[0] !== 'auto' ? {fam:FONTS[f[0]], w:f[2]} : null;
};
