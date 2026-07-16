const defaultBaseUrl = 'https://movie.zhangpengbo.com';
const baseUrl = getArgValue('--base-url') ?? process.env.MOVIE_SHELF_BASE_URL ?? defaultBaseUrl;

function getArgValue(name) {
  const index = process.argv.indexOf(name);

  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function request(pathname, expectedContentType) {
  const response = await fetch(new URL(pathname, baseUrl), {
    redirect: 'follow'
  });

  if (!response.ok) {
    throw new Error(`${pathname} returned ${response.status}`);
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (expectedContentType && !contentType.includes(expectedContentType)) {
    throw new Error(`${pathname} returned unexpected content-type: ${contentType}`);
  }

  return response;
}

const homeResponse = await request('/', 'text/html');
const homeHtml = await homeResponse.text();
const scriptMatch = homeHtml.match(/src="([^"]+\.js(?:\?[^"]*)?)"/);
const styleMatch = homeHtml.match(/href="([^"]+\.css(?:\?[^"]*)?)"/);

if (!scriptMatch || !styleMatch) {
  throw new Error('index.html is missing bundled js or css');
}

if (!homeResponse.headers.get('cache-control')?.includes('no-store')) {
  throw new Error('index.html should be served with cache-control: no-store');
}

await request(scriptMatch[1], 'application/javascript');
await request(styleMatch[1], 'text/css');
await request('/movies/550', 'text/html');
await request('/assets/brand/movie-shelf-horizontal-white.png', 'image/png');
await request('/favicon.png', 'image/png');
await request('/apple-touch-icon.png', 'image/png');

console.log(`MovieShelf smoke passed: ${baseUrl}`);
