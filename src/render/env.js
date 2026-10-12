/* Render environment shared by primitives and templates during one draw() call.
 * draw() fills it in, so templates never reach into the UI or the store directly. */
import { FONTS, TFONTS } from '../schema/themes.js';

export const env = {
  /** The state being drawn (school header, heading font, digits). */
  state:null,
  /** Decoded logo images by slot: {center, side}. */
  logos:{center:null, side:null},
  /** Arabic-Indic digits on/off for this draw. */
  DIG:true,
  /** Set by any block whose content could not fit. */
  OVER:false
};

/** Heading font family and weight chosen by the user. */
export const tfam = () => FONTS[env.state.tfont] || FONTS.ruqaa;
export const tw = () => (TFONTS.find(f => f[0] === env.state.tfont) || TFONTS[0])[2];
