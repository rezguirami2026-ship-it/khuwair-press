/* Print palettes (always on white paper), heading fonts and page sizes. */
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
  sans:'"Tajawal","IBM Plex Sans Arabic",sans-serif'
};
/** [id, label, weight] of the selectable heading fonts. */
export const TFONTS = [['ruqaa','رقعة',700],['kufi','كوفي',600],['naskh','نسخ',700]];
/** Page units: always 1000 wide, A-series √2 ratio. */
export const PAGE = {landscape:[1000,707], portrait:[1000,1414]};
