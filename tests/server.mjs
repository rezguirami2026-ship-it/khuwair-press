// Minimal static server over the repo root, so tests can load legacy/v1.html and the built dist/ side by side.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const ROOT = process.cwd(), PORT = Number(process.env.PORT || 4321);
const TYPES = {'.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.woff2':'font/woff2', '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json'};

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  if(path.startsWith('..')){ res.writeHead(403).end(); return; }
  try{
    const file = /[\\/]$/.test(path) || !path ? path + 'index.html' : path;   // a folder serves its index.html
    const body = await readFile(join(ROOT, file));
    res.writeHead(200, {'content-type':TYPES[extname(file)] || 'application/octet-stream', 'cache-control':'no-store'}).end(body);
  }catch(e){ res.writeHead(404).end('not found'); }
}).listen(PORT, () => console.log('test server on', PORT));
