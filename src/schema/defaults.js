/* Default content per type, and the default school header (configurable — only defaults). */
export function addDays(n){ const d = new Date(); d.setDate(d.getDate() + n); return d; }
export function fmtDate(dt, wk){
  try{ const o = {day:'numeric', month:'long', year:'numeric', numberingSystem:'latn'}; if(wk) o.weekday = 'long';
    return new Intl.DateTimeFormat('ar', o).format(dt) + 'م'; }catch(e){ return ''; }
}
/** Hijri date (Umm al-Qura calendar, built into the browser): «2 جمادى الأولى 1448هـ». */
export function fmtHijri(dt){
  try{
    const parts = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {day:'numeric', month:'long', year:'numeric', numberingSystem:'latn'}).formatToParts(dt);
    const get = t => (parts.find(p => p.type === t) || {}).value || '';
    return `${get('day')} ${get('month')} ${get('year')}هـ`;
  }catch(e){ return ''; }
}
/** Date text in the chosen calendar(s): mode 'g' (Gregorian) | 'h' (Hijri) | 'both'. */
export function fmtDateMode(dt, mode, wk){
  const wd = wk ? (() => { try{ return new Intl.DateTimeFormat('ar', {weekday:'long'}).format(dt) + ' '; }catch(e){ return ''; } })() : '';
  if(mode === 'h') return wd + fmtHijri(dt);
  if(mode === 'both') return fmtDate(dt, wk) + ' الموافق ' + fmtHijri(dt);
  return fmtDate(dt, wk);
}
export const defaultSchool = () => ({l1:'سلطنة عمان', l2:'وزارة التعليم', l3:'اسم المدرسة', year:'2026 / 2027م', director:'أ. اسم المدير'});

export function defaults(type){
  switch(type){
    case 'cert': return {layout:'luxe', title:'شهادة شكر وتقدير', intro:'تتقدّم إدارة المدرسة بخالص الشكر والتقدير إلى الطالب',
      names:'أحمد بن سالم - 6/1\nمحمد بن خالد - 6/2\nيوسف بن علي - 6/3', cls:'',
      reason:'وذلك لتفوّقه الدراسي وتميّزه في مادة الرياضيات خلال الفصل الدراسي الأول، متمنّين له دوام التوفيق والنجاح.',
      teacherLabel:'', teacherName:'', date:fmtDate(new Date()), seal:true, gender:'m'};
    case 'notice': return {layout:'luxe', kicker:'إعلان', title:'اجتماع أولياء الأمور', greeting:'حضرات أولياء أمور الطلبة الكرام،',
      body:'السلام عليكم ورحمة الله وبركاته، وبعد: يسرّ إدارة المدرسة دعوتكم لحضور اجتماع أولياء الأمور، للاطلاع على مستوى أبنائكم الدراسي خلال الفصل الدراسي الأول، والتعاون معاً على دعم تعلّمهم.',
      date:fmtDate(addDays(6), true), time:'10:00 صباحاً', place:'قاعة المدرسة', note:'يمكنكم مقابلة معلمي المواد بعد الاجتماع مباشرة.',
      closing:'حضوركم دعمٌ لأبنائكم، شاكرين لكم حسن تعاونكم.', signer:'إدارة المدرسة'};
    case 'poster': return {layout:'luxe', kind:'guide', gKicker:'إرشادات', gTitle:'قواعد الفصل الذهبية', gSub:'معاً نصنع بيئة تعلّم آمنة وممتعة',
      gPoints:'أحترم معلّمي وزملائي في القول والفعل\nأرفع يدي قبل أن أتحدّث\nأحضر أدواتي وكتبي كل يوم\nأحافظ على نظافة فصلي ومدرستي\nأنجز واجباتي في وقتها\nأسأل عندما لا أفهم، فالسؤال طريق التعلّم',
      gFooter:'الالتزام سرّ النجاح', hTitle:'لوحة الشرف', hSub:'المتفوّقون في مادة الرياضيات — الفصل الدراسي الأول',
      hNames:'أحمد بن سالم - 6/1\nمحمد بن خالد - 6/2\nيوسف بن علي - 6/3\nعبدالله بن سعيد - 6/4\nخالد بن ناصر - 6/5\nعمر بن حمد - 6/6\nسالم بن يوسف - 5/1\nإبراهيم بن محمد - 5/2',
      hFooter:'فخورون بكم.. وإلى مزيد من التميّز', gender:'m'};
    case 'invite': return {layout:'luxe', heading:'دعوة', lead:'يتشرّف مدير المدرسة وأسرتها التعليمية بدعوتكم لحضور',
      occasion:'حفل تكريم الطلبة المتفوّقين', desc:'للفصل الدراسي الأول من العام الدراسي 2026 / 2027م',
      date:fmtDate(addDays(10), true), time:'9:00 صباحاً', place:'مسرح المدرسة', closing:'حضوركم يسعدنا ويُشرّفنا', signer:'مدير المدرسة'};
  }
  return {};
}
