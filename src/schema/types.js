/* Content types: the side panel is generated from this schema. */
const guide = d => d.layout === 'guide', honor = d => d.layout === 'honor';

export const TYPES = {
  cert:{noun:'الشهادة', orient:'landscape', layouts:[['classic','إطار كلاسيكي'],['band','شريط جانبي']], fields:[
    {k:'title', l:'عنوان الشهادة', t:'text'},
    {k:'intro', l:'نص التقديم', t:'text'},
    {k:'names', l:'أسماء الطلبة', t:'list', rows:7, hint:'اسم في كل سطر والصف بعد شَرطة، مثل: سالم بن محمد - 6/2. يمكنك اللصق من Excel مباشرة. الأسماء الحالية أمثلة.'},
    {k:'cls', l:'الصف (لمن لم يُكتب صفّه)', t:'text', ph:'مثال: السادس / 3'},
    {k:'reason', l:'سبب التكريم', t:'area', rows:3},
    {k:'teacherLabel', l:'صفة الموقّع الأول', t:'text', half:true},
    {k:'teacherName', l:'اسمه', t:'text', half:true},
    {k:'date', l:'التاريخ', t:'text'},
    {k:'seal', l:'إظهار مكان الختم', t:'check'}
  ]},
  notice:{noun:'الإعلان', orient:'portrait', layouts:[['formal','رسمي'],['card','بطاقة ملوّنة']], fields:[
    {k:'kicker', l:'الشارة', t:'text', ph:'إعلان / تعميم / تنبيه'},
    {k:'title', l:'العنوان', t:'text'},
    {k:'greeting', l:'التحية', t:'text'},
    {k:'body', l:'نص الإعلان', t:'area', rows:5},
    {k:'date', l:'اليوم والتاريخ', t:'text'},
    {k:'time', l:'الوقت', t:'text', half:true},
    {k:'place', l:'المكان', t:'text', half:true},
    {k:'note', l:'ملاحظة (اختياري)', t:'area', rows:2},
    {k:'closing', l:'الخاتمة', t:'text'},
    {k:'signer', l:'جهة التوقيع', t:'text'}
  ]},
  poster:{noun:'الملصق', orient:'portrait', layouts:[['guide','إرشادات وتوعية'],['honor','لوحة الشرف']], fields:[
    {k:'gKicker', l:'العنوان الصغير', t:'text', when:guide},
    {k:'gTitle', l:'العنوان الرئيسي', t:'text', when:guide},
    {k:'gSub', l:'العنوان الفرعي', t:'text', when:guide},
    {k:'gPoints', l:'النقاط', t:'list', rows:8, when:guide, hint:'نقطة في كل سطر، حتى 10 نقاط.'},
    {k:'gFooter', l:'عبارة الختام', t:'text', when:guide},
    {k:'hTitle', l:'العنوان', t:'text', when:honor},
    {k:'hSub', l:'العنوان الفرعي', t:'text', when:honor},
    {k:'hNames', l:'أسماء المتفوّقين', t:'list', rows:9, when:honor, hint:'اسم في كل سطر والصف بعد شَرطة، حتى 24 اسماً. الأسماء الحالية أمثلة.'},
    {k:'hFooter', l:'عبارة الختام', t:'text', when:honor}
  ]},
  invite:{noun:'الدعوة', orient:'portrait', layouts:[['ornate','مزخرفة'],['band','شريط علوي']], fields:[
    {k:'heading', l:'الكلمة الكبيرة', t:'text'},
    {k:'lead', l:'نص الدعوة', t:'area', rows:2},
    {k:'occasion', l:'المناسبة', t:'text'},
    {k:'desc', l:'تفاصيل المناسبة', t:'area', rows:2},
    {k:'date', l:'اليوم والتاريخ', t:'text'},
    {k:'time', l:'الوقت', t:'text', half:true},
    {k:'place', l:'المكان', t:'text', half:true},
    {k:'closing', l:'عبارة الختام', t:'text'},
    {k:'signer', l:'صفة الداعي', t:'text'}
  ]}
};
