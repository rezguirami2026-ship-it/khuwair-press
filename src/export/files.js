/* Handing a finished file to the user: claude.ai downloads capability when present, <a download> otherwise.
 * Returns the status message to show. */
let dlReady = null;
function downloads(){
  if(!dlReady) dlReady = (async () => {
    try{ if(window.claude && typeof window.claude.use === 'function') return await window.claude.use('downloads'); }catch(e){}
    return null;
  })();
  return dlReady;
}

export async function offerFile(blob, filename){
  const dl = await downloads();
  if(dl){
    try{ await dl.save({filename, data:blob}); return 'تم حفظ الملف.'; }
    catch(e){
      const c = e && e.code;
      if(c === 'declined') return 'أُلغي التنزيل.';
      if(c === 'rate_limited') return 'نافذة تنزيل مفتوحة بالفعل، أعد المحاولة بعد لحظات.';
      if(c === 'too_large') return 'الملف كبير جداً، قلّل عدد الأسماء ونزّلها على دفعات.';
      return 'التنزيل غير متاح في هذا العرض.';
    }
  }
  let top = false; try{ top = window.top === window.self; }catch(e){}
  if(top){
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.append(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    return 'تم التنزيل.';
  }
  return 'التنزيل غير متاح في هذا العرض. افتح الصفحة من رابطها المباشر.';
}

/** File name from the document's main title, safe on every OS. */
export function baseName(st){
  const d = st.docs[st.type];
  let n = st.type === 'cert' ? d.title : st.type === 'notice' ? d.title : st.type === 'poster' ? (d.kind === 'honor' ? d.hTitle : d.gTitle) : (d.occasion || d.heading);
  n = String(n || 'تصميم').replace(/[\\/:*?"<>|\n\r\t]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  return n || 'تصميم';
}
export const safePart = s => String(s || '').replace(/[\\/:*?"<>|]+/g, ' ').trim();
