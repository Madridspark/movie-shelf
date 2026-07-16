const env = import.meta.env;

export const tmdbConfig = {
  baseUrl: env.VITE_TMDB_BASE_URL ?? 'https://api.themoviedb.org/3',
  accessToken: env.VITE_TMDB_ACCESS_TOKEN
};
