const http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const SHOT = process.env.UF_SHOT || path.join(root, 'dist');
const TY = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.zip': 'application/zip' };
http.createServer((q, s) => {
  let u = decodeURIComponent(q.url.split('?')[0]);
  if (q.method === 'POST' && u === '/shot') {
    let b = '';
    q.on('data', c => b += c);
    q.on('end', () => {
      fs.mkdirSync(SHOT, { recursive: true });
      const f = path.join(SHOT, 'shot.png');
      fs.writeFileSync(f, Buffer.from(b.split(',')[1], 'base64'));
      s.writeHead(200); s.end(f);
    });
    return;
  }
  if (u === '/') { s.writeHead(302, { Location: '/src/index.html' }); s.end(); return }
  const f = path.join(root, u);
  fs.readFile(f, (e, d) => {
    if (e) { s.writeHead(404); s.end('404'); return }
    s.writeHead(200, { 'Content-Type': TY[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    s.end(d);
  });
}).listen(8137, () => console.log('http://localhost:8137/'));
