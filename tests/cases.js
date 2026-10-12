// Render cases shared by the parity and visual tests.
export const LAYOUTS = {cert:['classic', 'band'], notice:['formal', 'card'], poster:['guide', 'honor'], invite:['ornate', 'band']};
export const THEMES = ['maroon', 'green', 'navy', 'flag'];
export const ALL = Object.entries(LAYOUTS).flatMap(([type, ls]) => ls.map(layout => ({type, layout})));

const LONG_NAME = 'عبدالرحمن بن عبدالله بن سليمان بن حمد بن ناصر بن سيف الحارثي';
const NAMES_60 = Array.from({length:60}, (_, i) => `طالب رقم ${i + 1} بن محمد العامري - ${5 + (i % 5)}/${1 + (i % 6)}`).join('\n');
const HONOR_24 = Array.from({length:24}, (_, i) => `محمد بن سعيد بن ناصر ${['الحارثي', 'الكندي', 'البلوشي', 'الرواحي', 'العامري', 'الشكيلي'][i % 6]} - ${5 + (i % 5)}/${1 + (i % 6)}`).join('\n');
const POINTS_10 = Array.from({length:10}, (_, i) => `${['أحترم', 'أحافظ على', 'ألتزم بـ', 'أشارك في', 'أتعاون مع'][i % 5]} ${['زملائي ومعلّمي في كل وقت', 'نظافة الفصل والساحة والمرافق المدرسية', 'مواعيد الحصص والطابور الصباحي', 'الأنشطة الصفية واللاصفية بحماس', 'فريقي لإنجاز المهام'][i % 5]}`).join('\n');
const LONG_BODY = Array(6).fill('يسرّ إدارة المدرسة دعوتكم لحضور اجتماع أولياء الأمور للاطلاع على مستوى أبنائكم الدراسي والتعاون معاً على دعم تعلّمهم ومتابعة واجباتهم اليومية.').join(' ');

const EMPTY = {
  cert:{title:'', intro:'', names:'', cls:'', reason:'', teacherLabel:'', teacherName:'', date:'', seal:false},
  notice:{kicker:'', title:'', greeting:'', body:'', date:'', time:'', place:'', note:'', closing:'', signer:''},
  poster:{gKicker:'', gTitle:'', gSub:'', gPoints:'', gFooter:'', hTitle:'', hSub:'', hNames:'', hFooter:''},
  invite:{heading:'', lead:'', occasion:'', desc:'', date:'', time:'', place:'', closing:'', signer:''}
};

/** Each case: {name, type, layout, theme?, tfont?, digits?, doc?, school?, logos?, rec?, over?}
 *  `over` is the expected overflow flag where the content is (or is not) impossible to fit. */
export const LEGACY_CASES = [
  ...ALL.flatMap(({type, layout}) => THEMES.map(theme => ({name:`${type}-${layout}-${theme}`, type, layout, theme, over:false}))),
  ...ALL.flatMap(({type, layout}) => ['kufi', 'naskh'].map(tfont => ({name:`${type}-${layout}-font-${tfont}`, type, layout, tfont}))),
  ...ALL.map(({type, layout}) => ({name:`${type}-${layout}-latin-digits`, type, layout, digits:false})),
  ...ALL.map(({type, layout}) => ({name:`${type}-${layout}-logos`, type, layout, theme:'green', logos:true})),
  ...ALL.map(({type, layout}) => ({name:`${type}-${layout}-empty`, type, layout, doc:EMPTY[type], school:{l1:'', l2:'', l3:'', year:'', director:''}, over:false})),
  ...LAYOUTS.cert.map(layout => ({name:`stress-cert-${layout}-long-name`, type:'cert', layout, doc:{names:LONG_NAME + ' - 9/12'}, over:false})),
  ...LAYOUTS.cert.map(layout => ({name:`stress-cert-${layout}-60-students-last`, type:'cert', layout, doc:{names:NAMES_60}, rec:59, over:false})),
  {name:'stress-poster-honor-24', type:'poster', layout:'honor', doc:{hNames:HONOR_24}, over:false},
  {name:'stress-poster-honor-24-long', type:'poster', layout:'honor', doc:{hNames:HONOR_24.split('\n').map(l => LONG_NAME + ' - ' + l.split(' - ')[1]).join('\n')}, over:false},
  {name:'stress-poster-guide-10', type:'poster', layout:'guide', doc:{gPoints:POINTS_10}, over:false},
  ...LAYOUTS.notice.map(layout => ({name:`stress-notice-${layout}-long-body`, type:'notice', layout, doc:{body:LONG_BODY}, over:true})),
  ...LAYOUTS.invite.map(layout => ({name:`stress-invite-${layout}-long`, type:'invite', layout, doc:{lead:LONG_BODY.slice(0, 200), occasion:'حفل تكريم الطلبة المتفوّقين والمجيدين في المسابقات العلمية والثقافية والرياضية', desc:LONG_BODY.slice(0, 160)}}))
];
export const STRESS_NAMES_60 = NAMES_60;

/* ---- the four new identities (phase 3) ---- */
export const NEW_LAYOUTS = ['luxe', 'modern', 'heritage', 'joy'];
const TYPES4 = ['cert', 'notice', 'poster', 'invite'];
const each = fn => TYPES4.flatMap(type => (type === 'poster' ? ['guide', 'honor'] : [null]).flatMap(kind => NEW_LAYOUTS.map(layout => fn(type, kind, layout))));
const nm = (type, kind, layout, tail) => ['new', type, kind, layout, tail].filter(Boolean).join('-');
const HUGE_BODY = Array(5).fill(LONG_BODY).join(' ');
const HONOR_24_LONG = HONOR_24.split('\n').map(l => LONG_NAME + ' - ' + l.split(' - ')[1]).join('\n');

/** `over` is the expected warning: false whenever the content can fit; true only for impossible content. */
export const NEW_CASES = [
  ...each((type, kind, layout) => THEMES.map(theme => ({name:nm(type, kind, layout, theme), type, kind, layout, theme, over:false}))).flat(),
  ...each((type, kind, layout) => ({name:nm(type, kind, layout, 'empty'), type, kind, layout, doc:EMPTY[type], school:{l1:'', l2:'', l3:'', year:'', director:''}, over:false})),
  ...each((type, kind, layout) => ({name:nm(type, kind, layout, 'images'), type, kind, layout, theme:'navy', logos:true, images:true, over:false})),
  ...each((type, kind, layout) => ({name:nm(type, kind, layout, 'ink'), type, kind, layout, theme:'green', ink:true, gold:false, over:false})),
  ...NEW_LAYOUTS.flatMap(layout => [
    {name:nm('cert', null, layout, 'long-name'), type:'cert', layout, doc:{names:LONG_NAME + ' - 9/12', reason:LONG_BODY.slice(0, 260)}, over:false},
    {name:nm('cert', null, layout, '60-last'), type:'cert', layout, doc:{names:NAMES_60}, rec:59, over:false},
    {name:nm('cert', null, layout, 'font-kufi'), type:'cert', layout, tfont:'notokufi', over:false},
    {name:nm('notice', null, layout, 'long-body'), type:'notice', layout, doc:{body:LONG_BODY}, over:false},
    {name:nm('notice', null, layout, 'impossible'), type:'notice', layout, doc:{body:HUGE_BODY}, over:true},
    {name:nm('poster', 'honor', layout, '24-long'), type:'poster', kind:'honor', layout, doc:{hNames:HONOR_24_LONG}, over:false},
    {name:nm('poster', 'honor', layout, '24'), type:'poster', kind:'honor', layout, doc:{hNames:HONOR_24}, over:false},
    {name:nm('poster', 'guide', layout, '10'), type:'poster', kind:'guide', layout, doc:{gPoints:POINTS_10}, over:false},
    {name:nm('invite', null, layout, 'long'), type:'invite', layout, doc:{lead:LONG_BODY.slice(0, 200), occasion:'حفل تكريم الطلبة المتفوّقين والمجيدين في المسابقات العلمية والثقافية والرياضية', desc:LONG_BODY.slice(0, 160)}, over:false}
  ])
];
