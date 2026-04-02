const http = require('http');
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const indexFile = path.join(distDir, 'index.html');
const port = Number(process.env.PORT || 8080);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

const sendFile = (res, filePath) => {
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] ?? 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal server error');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
};

http
  .createServer((req, res) => {
    const requestPath = req.url ? req.url.split('?')[0] : '/';

    if (requestPath === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('OK');
      return;
    }

    const normalizedPath = requestPath === '/' ? '/index.html' : requestPath;
    const filePath = path.join(distDir, normalizedPath);
    const resolvedPath = path.resolve(filePath);

    if (!resolvedPath.startsWith(path.resolve(distDir))) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    fs.stat(resolvedPath, (error, stats) => {
      if (!error && stats.isFile()) {
        sendFile(res, resolvedPath);
        return;
      }

      sendFile(res, indexFile);
    });
  })
  .listen(port, () => {
    console.log(`Static server listening on ${port}`);
  });
