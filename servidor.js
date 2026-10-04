/**
 * Servidor estático mínimo (sem dependências) para o Sistema Solar 3D.
 * Uso:  node servidor.js  [porta]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 5500);

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

const METODOS = new Set(['GET', 'HEAD']);

const texto = (res, codigo, corpo, method, extras = {}) => {
  res.writeHead(codigo, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(corpo),
    ...extras
  });
  res.end(method === 'HEAD' ? undefined : corpo);
};

const server = http.createServer((req, res) => {
  const method = req.method || 'GET';

  if (!METODOS.has(method)) {
    return texto(res, 405, '405 — método não permitido', method, { Allow: 'GET, HEAD' });
  }

  // decodeURIComponent pode lançar em URLs malformadas (%ZZ) — não deve derrubar o servidor
  let url;
  try {
    url = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch {
    return texto(res, 400, '400 — URL inválida', method);
  }

  // path.resolve + path.relative evita prefixos parecidos (ex.: "...3D-outro") e ".."
  const arquivo = path.resolve(ROOT, '.' + (url === '/' ? '/index.html' : url));
  const rel = path.relative(ROOT, arquivo);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    return texto(res, 403, '403 — acesso negado', method);
  }

  fs.stat(arquivo, (errStat, st) => {
    if (errStat || !st.isFile()) {
      return texto(res, 404, '404 — não encontrado: ' + url, method);
    }
    fs.readFile(arquivo, (err, buf) => {
      if (err) {
        return texto(res, 500, '500 — erro ao ler o arquivo', method);
      }
      res.writeHead(200, {
        'Content-Type': TIPOS[path.extname(arquivo).toLowerCase()] || 'application/octet-stream',
        'Content-Length': buf.length,
        'Cache-Control': 'no-store'
      });
      res.end(method === 'HEAD' ? undefined : buf);
    });
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`A porta ${PORT} já está em uso. Tente: node servidor.js ${PORT + 1}`);
  } else {
    console.error('Erro no servidor:', err.message);
  }
  process.exitCode = 1;
});

server.listen(PORT, () => {
  console.log(`Sistema Solar 3D disponível em http://localhost:${PORT}`);
  console.log('Ctrl+C para encerrar.');
});
