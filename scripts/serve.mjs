import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
const allowed = new Map([
  ['/', ['demo/index.html', 'text/html']],
  ['/demo/style.css', ['demo/style.css', 'text/css']],
  ['/demo/app.mjs', ['demo/app.mjs', 'text/javascript']],
  ['/demo/model.mjs', ['demo/model.mjs', 'text/javascript']],
  ['/assets/kincore.svg', ['assets/kincore.svg', 'image/svg+xml']]
]);
const root = new URL('../', import.meta.url);
createServer(async (req, res) => {
  const path = new URL(req.url, 'http://127.0.0.1').pathname;
  const file = allowed.get(path);
  if (!file || !['GET', 'HEAD'].includes(req.method)) {res.writeHead(404); res.end('Not found'); return;}
  try {
    const body = await readFile(new URL(file[0], root));
    res.writeHead(200, {'Content-Type': `${file[1]}; charset=utf-8`, 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store', 'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; connect-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"});
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {res.writeHead(500); res.end('Unable to load demo');}
}).listen(4173, '127.0.0.1', () => console.log('kinCore showcase: http://127.0.0.1:4173 (local demo only)'));
