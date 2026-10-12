/* Default content per type, and the default school header (configurable — only defaults). */
export function addDays(n){ const d = new Date(); d.setDate(d.getDate() + n); return d; }
export function fmtDate(dt, wk){
  try{ const o = {day:'numeric', month:'long', year:'numeric', numberingSystem:'latn'}; if(wk) o.weekday = 'long';
    return new Intl.DateTimeFormat('ar', o).format(dt) + 'م'; }catch(e){ return ''; }
}
export const defaultSchool = () => ({l1:'سلطنة عمان', l2:'وزارة التعليم', l3:'مدرسة الخوير للبنين (5-9)', year:'2026 / 2027م', director:'أ. هلال الحسيني'});

export function defaults(type){
  switch(type){
    case 'cert': return {layout:'classic', title:'شهادة شكر وتقدير', intro:'تتقدّم إدارة المدرسة بخالص الشكر والتقدير إلى الطالب',
      names:'سالم بن محمد الحارثي - 6/1\nعبدالله بن سعيد الكندي - 6/2\nيوسف بن حمد الرواحي - 6/4', cls:'',
      reason:'وذلك لتفوّقه الدراسي وتميّزه في مادة الرياضيات خلال الفصل الدراسي الأول، متمنّين له دوام التوفيق والنجاح.',
      teacherLabel:'معلم الرياضيات', teacherName:'أ. رامي الرزقي', date:fmtDate(new Date()), seal:true};
    case 'notice': return {layout:'formal', kicker:'إعلان', title:'اجتماع أولياء الأمور', greeting:'حضرات أولياء أمور الطلبة الكرام،',
      body:'السلام عليكم ورحمة الله وبركاته، وبعد: يسرّ إدارة المدرسة دعوتكم لحضور اجتماع أولياء الأمور، للاطلاع على مستوى أبنائكم الدراسي خلال الفصل الدراسي الأول، والتعاون معاً على دعم تعلّمهم.',
      date:fmtDate(addDays(6), true), time:'10:00 صباحاً', place:'قاعة المدرسة', note:'يمكنكم مقابلة معلمي المواد بعد الاجتماع مباشرة.',
      closing:'حضوركم دعمٌ لأبنائكم، شاكرين لكم حسن تعاونكم.', signer:'إدارة المدرسة'};
    case 'poster': return {layout:'guide', gKicker:'إرشادات', gTitle:'قواعد الفصل الذهبية', gSub:'معاً نصنع بيئة تعلّم آمنة وممتعة',
      gPoints:'أحترم معلّمي وزملائي في القول والفعل\nأرفع يدي قبل أن أتحدّث\nأحضر أدواتي وكتبي كل يوم\nأحافظ على نظافة فصلي ومدرستي\nأنجز واجباتي في وقتها\nأسأل عندما لا أفهم، فالسؤال طريق التعلّم',
      gFooter:'الالتزام سرّ النجاح', hTitle:'لوحة الشرف', hSub:'المتفوّقون في مادة الرياضيات — الفصل الدراسي الأول',
      hNames:'سالم بن محمد الحارثي - 6/1\nعبدالله بن سعيد الكندي - 6/2\nمحمد بن خالد البلوشي - 6/3\nيوسف بن حمد الرواحي - 6/4\nأحمد بن علي العامري - 6/5\nعمر بن ناصر الشكيلي - 6/6\nخالد بن سيف الهنائي - 5/2\nإبراهيم بن يوسف المعمري - 5/4',
      hFooter:'فخورون بكم.. وإلى مزيد من التميّز'};
    case 'invite': return {layout:'ornate', heading:'دعوة', lead:'يتشرّف مدير المدرسة وأسرة المدرسة بدعوتكم لحضور',
      occasion:'حفل تكريم الطلبة المتفوّقين', desc:'للفصل الدراسي الأول من العام الدراسي 2026 / 2027م',
      date:fmtDate(addDays(10), true), time:'9:00 صباحاً', place:'مسرح المدرسة', closing:'حضوركم يسعدنا ويُشرّفنا', signer:'مدير المدرسة'};
  }
  return {};
}
