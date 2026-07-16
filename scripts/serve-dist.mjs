import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const rootDir = resolve(process.cwd(), 'dist');
const publicDir = resolve(process.cwd(), 'public');
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? '127.0.0.1';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp'
};

function getFilePath(requestUrl) {
  const pathname = new URL(requestUrl, `http://${host}:${port}`).pathname;
  const normalizedPath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const assetPath = join(rootDir, normalizedPath);
  const publicAssetPath = join(publicDir, normalizedPath);

  if (existsSync(assetPath) && statSync(assetPath).isFile()) {
    return assetPath;
  }

  if (existsSync(publicAssetPath) && statSync(publicAssetPath).isFile()) {
    return publicAssetPath;
  }

  return join(rootDir, 'index.html');
}

const server = createServer((request, response) => {
  if (!existsSync(rootDir)) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('dist not found, run pnpm build first');
    return;
  }

  const filePath = getFilePath(request.url ?? '/');
  const extension = extname(filePath);
  const isHtml = extension === '.html';

  response.writeHead(200, {
    'cache-control': isHtml ? 'no-store' : 'public, max-age=2592000, immutable',
    'content-type': contentTypes[extension] ?? 'application/octet-stream'
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`MovieShelf dist server listening on http://${host}:${port}`);
});
