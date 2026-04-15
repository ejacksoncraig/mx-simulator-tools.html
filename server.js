const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3847;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.json': 'application/json'
};

function sendJSON(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON')); }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // ── API Routes ──────────────────────────────────────────────────────────

  if (url.pathname === '/api/scan-folder' && req.method === 'POST') {
    try {
      const { folderPath } = await parseBody(req);
      const entries = fs.readdirSync(folderPath, { withFileTypes: true });
      const files = entries.filter(e => e.isFile()).map(e => e.name);
      sendJSON(res, { ok: true, files });
    } catch (err) {
      sendJSON(res, { ok: false, error: err.message });
    }
    return;
  }

  if (url.pathname === '/api/read-file' && req.method === 'POST') {
    try {
      const { filePath } = await parseBody(req);
      const content = fs.readFileSync(filePath, 'utf-8');
      sendJSON(res, { ok: true, content });
    } catch (err) {
      sendJSON(res, { ok: false, error: err.message });
    }
    return;
  }

  if (url.pathname === '/api/write-file' && req.method === 'POST') {
    try {
      const { filePath, content } = await parseBody(req);
      fs.writeFileSync(filePath, content, 'utf-8');
      sendJSON(res, { ok: true });
    } catch (err) {
      sendJSON(res, { ok: false, error: err.message });
    }
    return;
  }

  if (url.pathname === '/api/read-image' && req.method === 'POST') {
    try {
      const { filePath } = await parseBody(req);
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase().replace('.', '');
      const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      const b64 = buffer.toString('base64');
      sendJSON(res, { ok: true, dataUrl: `data:${mime};base64,${b64}` });
    } catch (err) {
      sendJSON(res, { ok: false, error: err.message });
    }
    return;
  }

  if (url.pathname === '/api/list-dir' && req.method === 'POST') {
    try {
      const { dirPath } = await parseBody(req);
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      const dirs = entries.filter(e => e.isDirectory()).map(e => ({
        name: e.name,
        path: path.join(dirPath, e.name)
      }));
      const files = entries.filter(e => e.isFile()).map(e => ({
        name: e.name,
        path: path.join(dirPath, e.name)
      }));
      sendJSON(res, { ok: true, dirs, files });
    } catch (err) {
      sendJSON(res, { ok: false, error: err.message });
    }
    return;
  }

  if (url.pathname === '/api/home-dir' && req.method === 'GET') {
    sendJSON(res, { ok: true, path: require('os').homedir() });
    return;
  }

  // ── Serve static files ─────────────────────────────────────────────────

  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  const fullPath = path.join(__dirname, filePath);

  try {
    const stat = fs.statSync(fullPath);
    if (!stat.isFile()) throw new Error('Not a file');
    const ext = path.extname(fullPath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(fullPath).pipe(res);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  MX Simulator Tools running at: ${url}\n`);

  // Auto-open in browser
  const cmd = process.platform === 'darwin' ? 'open'
    : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} ${url}`);
});
