const tmdbBaseUrl = typeof __TMDB_BASE_URL__ === 'string' ? __TMDB_BASE_URL__ : 'https://api.themoviedb.org/3';
const tmdbAccessToken = typeof __TMDB_ACCESS_TOKEN__ === 'string' ? __TMDB_ACCESS_TOKEN__ : '';

export const tmdbConfig = {
  baseUrl: tmdbBaseUrl || 'https://api.themoviedb.org/3',
  accessToken: tmdbAccessToken
};
