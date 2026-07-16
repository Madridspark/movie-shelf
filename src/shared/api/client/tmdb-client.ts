import { tmdbConfig } from '@shared/api/config/tmdb-config';

type RequestParams = Record<string, string | number | boolean | undefined>;

const REQUEST_TIMEOUT_MS = 12_000;

function buildUrl(path: string, params: RequestParams = {}) {
  const url = new URL(`${tmdbConfig.baseUrl}${path}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

export const tmdbClient = {
  async get<TData>(path: string, params?: RequestParams): Promise<TData> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(buildUrl(path, params), {
      headers: {
        Accept: 'application/json',
        ...(tmdbConfig.accessToken ? { Authorization: `Bearer ${tmdbConfig.accessToken}` } : {})
      },
      signal: controller.signal
    }).finally(() => window.clearTimeout(timeoutId));

    if (!response.ok) {
      throw new Error(`TMDB request failed: ${response.status}`);
    }

    return response.json() as Promise<TData>;
  }
};
