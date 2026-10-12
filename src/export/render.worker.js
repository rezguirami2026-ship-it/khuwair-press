/* Export worker: draws pages on an OffscreenCanvas so the page stays responsive during large batches.
 * Messages in:  {type:'fonts', faces:[{family, src, descriptors}]}   → replies {type:'fontsReady', ok}
 *               {type:'job', id, state, logos:{key: ImageBitmap}, px, indices, mime, quality}
 * Messages out: {type:'page', id, i, bytes} (bytes transferred), {type:'done', id}, {type:'error', id, message} */
import { draw, pageSize } from '../render/draw.js';

let cancelled = new Set();

self.onmessage = async ({data}) => {
  if(data.type === 'fonts'){
    try{
      const faces = data.faces.map(f => new FontFace(f.family, f.src, f.descriptors));
      await Promise.all(faces.map(f => f.load()));
      faces.forEach(f => self.fonts.add(f));
      self.postMessage({type:'fontsReady', ok:true});
    }catch(e){ self.postMessage({type:'fontsReady', ok:false, message:String(e)}); }
    return;
  }
  if(data.type === 'cancel'){ cancelled.add(data.id); return; }
  if(data.type !== 'job') return;
  const {id, state, logos, px, indices, mime, quality} = data;
  try{
    const [W, H] = pageSize(state), c = new OffscreenCanvas(px, Math.round(px * H / W)), ctx = c.getContext('2d');
    for(const i of indices){
      if(cancelled.has(id)) break;
      draw(ctx, state, logos, px, i);
      const blob = await c.convertToBlob({type:mime, quality});
      const bytes = new Uint8Array(await blob.arrayBuffer());
      self.postMessage({type:'page', id, i, bytes}, [bytes.buffer]);
    }
    self.postMessage({type:'done', id});
  }catch(e){ self.postMessage({type:'error', id, message:String(e && e.message || e)}); }
  cancelled.delete(id);
};
