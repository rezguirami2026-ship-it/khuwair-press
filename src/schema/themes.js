/* Print palettes (always on white paper), fonts and page sizes.
 * Text colors (ink, muted, primary) keep ≥ 4.5:1 contrast on white so they survive ordinary school printers;
 * the accent is for ornaments and large type only. */
export const THEMES = {
  maroon:{name:'عنابي وذهبي', primary:'#7A1F2B', accent:'#AE873A', ink:'#2A2120', muted:'#6D605B', tint:'#F7F0EC', onDark:'#E9CF92'},
  green:{name:'أخضر وذهبي', primary:'#1E5B47', accent:'#AE873A', ink:'#1D2824', muted:'#5A6A63', tint:'#EEF5F1', onDark:'#E9CF92'},
  navy:{name:'كحلي وذهبي', primary:'#1F3A5C', accent:'#B0873A', ink:'#1D2532', muted:'#5B6677', tint:'#EEF2F8', onDark:'#E9CF92'},
  flag:{name:'ألوان العلم', primary:'#B3182C', accent:'#13803F', ink:'#262022', muted:'#6A5F61', tint:'#FBF0F0', onDark:'#FFFFFF'}
};
export const FONTS = {
  ruqaa:'"Aref Ruqaa","Amiri",serif',
  kufi:'"Reem Kufi","Tajawal",sans-serif',
  naskh:'"Amiri","Times New Roman",serif',
  sans:'"Tajawal","IBM Plex Sans Arabic",sans-serif',
  plex:'"IBM Plex Sans Arabic","Tajawal",sans-serif',
  messiri:'"El Messiri","Tajawal",sans-serif',
  notokufi:'"Noto Kufi Arabic","Tajawal",sans-serif',
  scheherazade:'"Scheherazade New","Amiri",serif',
  lalezar:'"Lalezar","Tajawal",sans-serif',
  rakkas:'"Rakkas","Amiri",serif'
};
/** [id, label, weight] of the selectable heading fonts. 'auto' = the template's own pairing. */
export const TFONTS = [['auto','حسب القالب',0],['ruqaa','رقعة',700],['kufi','كوفي',600],['naskh','نسخ',700],
  ['messiri','المسيري',700],['notokufi','كوفي حديث',700],['scheherazade','شهرزاد',700],['rakkas','ركّاس',400],['lalezar','لاله‌زار',400]];
/** Page units: always 1000 wide, A-series √2 ratio. */
export const PAGE = {landscape:[1000,707], portrait:[1000,1414]};
