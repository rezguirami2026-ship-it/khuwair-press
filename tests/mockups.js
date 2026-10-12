// Design-direction mockups (phase 2 decision). Evaluated in the gallery page: ctx, O (ornaments), W, H are in scope.
function mock(V, kind){
  const land = kind !== 'portrait', PW = 1000, PH = land ? 707 : 1414, k = W / PW;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  const th = {primary:'#7A1F2B', accent:'gold', gold:'#AE873A', ink:'#2A2120', muted:'#6D605B', tint:'#F7F0EC'};
  const F = {ruqaa:'"Aref Ruqaa"', naskh:'"Amiri"', sans:'"Tajawal"', kufi:'"Reem Kufi"'};
  const T = (s, x, y, size, fam, w, color, align) => {
    ctx.font = `${w || 400} ${size}px ${fam}`; ctx.direction = 'rtl'; ctx.textAlign = align || 'center';
    ctx.fillStyle = color === 'gold' ? gold(x - 300, y - size, 600, size) : color; ctx.fillText(s, x, y);
  };
  const gold = (x, y, w, h) => { const g = ctx.createLinearGradient(x, y, x + w, y + h);
    [[0, '#7C5A1E'], [0.22, '#C49A45'], [0.42, '#E9CF86'], [0.55, '#C8A04D'], [0.72, '#9C7429'], [0.86, '#D9B96A'], [1, '#7C5A1E']].forEach(([t, c]) => g.addColorStop(t, c)); return g; };
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, PW, PH);
  const header = (x0, x1, top, sc) => {
    ['سلطنة عمان', 'وزارة التعليم', 'مدرسة الخوير للبنين (٥-٩)'].forEach((l, i) => T(l, x1, top + (i + 1) * 21 * sc, (i === 2 ? 15.5 : 14.5) * sc, F.sans, i === 2 ? 800 : 700, th.ink, 'right'));
    T('العام الدراسي', x0, top + 21 * sc, 13 * sc, F.sans, 500, th.muted, 'left');
    T('٢٠٢٦ / ٢٠٢٧م', x0, top + 42 * sc, 14.5 * sc, F.sans, 700, th.ink, 'left');
  };
  const signs = (y, xs) => {
    T('معلم الرياضيات', xs[0], y, 15, F.sans, 500, th.muted); T('أ. رامي الرزقي', xs[0], y + 30, 20, F.naskh, 700, th.ink);
    T('مدير المدرسة', xs[1], y, 15, F.sans, 500, th.muted); T('أ. هلال الحسيني', xs[1], y + 30, 20, F.naskh, 700, th.ink);
  };
  const body = (cy0, fam, titleW) => {
    T('شهادة شكر وتقدير', 500, cy0, 56, fam, titleW || 700, th.primary);
    return cy0;
  };

  if(V === 'A'){ // فاخر كلاسيكي
    O.pattern(ctx, '4.8.8', 52, 52, PW - 104, PH - 104, {size:90, color:th.primary, alpha:0.06, lw:0.9});
    O.frame(ctx, 18, 18, PW - 36, PH - 36, {band:34, motif:'khatam', corner:'rosette', color:th.primary, accent:'gold'});
    header(84, 916, 62, 1);
    O.rosette(ctx, 500, 104, 40, 12, {layers:2, color:th.primary, accent:'gold'});
    body(212, F.ruqaa);
    O.ornDivider(ctx, 500, 240, 170, {style:'rosette', size:9, color:th.primary, accent:'gold'});
    T('تتقدّم إدارة المدرسة بخالص الشكر والتقدير إلى الطالب', 500, 286, 22, F.naskh, 400, th.ink);
    T('سالم بن محمد الحارثي', 500, 352, 50, F.ruqaa, 700, th.primary);
    ctx.fillStyle = gold(330, 370, 340, 2); ctx.fillRect(330, 372, 340, 1.6);
    T('الصف: ٦/١', 500, 402, 17, F.sans, 500, th.muted);
    T('وذلك لتفوّقه الدراسي وتميّزه في مادة الرياضيات خلال الفصل الدراسي الأول،', 500, 446, 21, F.naskh, 400, th.ink);
    T('متمنّين له دوام التوفيق والنجاح.', 500, 482, 21, F.naskh, 400, th.ink);
    signs(574, [780, 220]);
    O.awardBadge(ctx, 500, 566, 44, {color:'gold', accent:th.primary, tails:true});
    T('تحريراً في: ١٢ أكتوبر ٢٠٢٦م', 500, 520, 14, F.sans, 400, th.muted);
  }
  if(V === 'B'){ // عصري هادئ
    ctx.fillStyle = th.primary; ctx.fillRect(0, 0, 14, PH); // slim colour spine on the right edge (RTL start)
    ctx.fillRect(PW - 14, 0, 14, PH);
    O.medallion(ctx, PW - 40, PH / 2, 330, 16, {color:th.primary, accent:th.primary, alpha:0.06, lw:1.2});
    O.fineFrame(ctx, 40, 32, PW - 80, PH - 64, {color:th.primary, accent:'gold', notch:30, gap:7, rules:3, lw:0.9});
    header(92, 908, 56, 1);
    T('شهادة شكر وتقدير', 500, 210, 50, F.kufi, 700, th.primary);
    O.ornDivider(ctx, 500, 238, 120, {style:'taper', size:8, color:'gold', accent:'gold'});
    T('تتقدّم إدارة المدرسة بخالص الشكر والتقدير إلى الطالب', 500, 284, 20, F.sans, 500, th.muted);
    T('سالم بن محمد الحارثي', 500, 352, 46, F.kufi, 600, th.ink);
    T('الصف: ٦/١', 500, 394, 17, F.sans, 700, th.primary);
    T('وذلك لتفوّقه الدراسي وتميّزه في مادة الرياضيات خلال الفصل الدراسي الأول،', 500, 444, 20, F.sans, 400, th.ink);
    T('متمنّين له دوام التوفيق والنجاح.', 500, 478, 20, F.sans, 400, th.ink);
    signs(572, [770, 230]);
    O.seal(ctx, 500, 590, 44, {color:'gold', accent:th.primary, scallops:40, star:12});
    T('تحريراً في: ١٢ أكتوبر ٢٠٢٦م', 500, 514, 14, F.sans, 400, th.muted);
  }
  if(V === 'C'){ // عُماني تراثي
    ctx.fillStyle = '#FBF6EE'; ctx.fillRect(0, 0, PW, PH);
    O.pattern(ctx, '3.12.12', 60, 60, PW - 120, PH - 120, {size:150, color:th.gold, alpha:0.09, lw:0.9, bg:'#FBF6EE'});
    O.frame(ctx, 18, 18, PW - 36, PH - 36, {band:30, motif:'studs', corner:'khatam', color:th.primary, accent:'gold', bg:'#FBF6EE'});
    O.crenellation(ctx, 54, 48, PW - 108, 22, {color:th.primary, bg:'#FBF6EE', density:1.25});
    ctx.save(); ctx.translate(PW, PH); ctx.rotate(Math.PI); O.crenellation(ctx, 54, 48, PW - 108, 22, {color:th.primary, bg:'#FBF6EE', density:1.25}); ctx.restore();
    header(84, 916, 78, 0.95);
    O.archFrame(ctx, 280, 150, 440, 300, {kind:'scalloped', spring:0.42, color:th.primary, accent:'gold', gap:9});
    T('شهادة شكر وتقدير', 500, 252, 46, F.ruqaa, 700, th.primary);
    T('تتقدّم إدارة المدرسة بخالص الشكر والتقدير إلى الطالب', 500, 296, 19, F.naskh, 400, th.ink);
    T('سالم بن محمد الحارثي', 500, 360, 44, F.ruqaa, 700, th.primary);
    T('الصف: ٦/١', 500, 400, 16, F.sans, 600, th.muted);
    T('وذلك لتفوّقه الدراسي وتميّزه في مادة الرياضيات خلال الفصل الدراسي الأول،', 500, 486, 20, F.naskh, 400, th.ink);
    T('متمنّين له دوام التوفيق والنجاح.', 500, 518, 20, F.naskh, 400, th.ink);
    signs(574, [790, 210]);
    O.rosette(ctx, 500, 592, 38, 8, {layers:2, color:th.primary, accent:'gold', bg:'#FBF6EE'});
    T('تحريراً في: ١٢ أكتوبر ٢٠٢٦م', 500, 550, 14, F.sans, 400, th.muted);
  }
}
