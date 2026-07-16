import { tmdbClient } from '@shared/api/client/tmdb-client';
import { getTmdbImageConfig } from '@shared/api/config/tmdb-image-config';

import { adaptTmdbMovieDetail, adaptTmdbSearchResponse } from '../lib/movie-adapter';
import { MovieDetail, MovieSearchResult } from '../model/types';
import { parseTmdbMovieDetail, parseTmdbSearchResponse } from './tmdb-schemas';

const TMDB_LANGUAGE = 'zh-TW';

export async function searchMovies(query: string, page = 1): Promise<MovieSearchResult> {
  const [response, imageConfig] = await Promise.all([
    tmdbClient.get<unknown>('/search/movie', {
      query,
      page: String(page),
      include_adult: 'false',
      language: TMDB_LANGUAGE
    }),
    getTmdbImageConfig()
  ]);

  return adaptTmdbSearchResponse(parseTmdbSearchResponse(response), imageConfig);
}

export async function getNowPlayingMovies(page = 1): Promise<MovieSearchResult> {
  const [response, imageConfig] = await Promise.all([
    tmdbClient.get<unknown>('/movie/now_playing', {
      page: String(page),
      language: TMDB_LANGUAGE
    }),
    getTmdbImageConfig()
  ]);

  return adaptTmdbSearchResponse(parseTmdbSearchResponse(response), imageConfig);
}

export async function getHomeBannerMovies(page = 1): Promise<MovieSearchResult> {
  const [response, imageConfig] = await Promise.all([
    tmdbClient.get<unknown>('/trending/movie/week', {
      page: String(page),
      language: TMDB_LANGUAGE
    }),
    getTmdbImageConfig()
  ]);

  return adaptTmdbSearchResponse(parseTmdbSearchResponse(response), imageConfig);
}

export async function getMovieDetail(movieId: string): Promise<MovieDetail> {
  const [response, imageConfig] = await Promise.all([
    tmdbClient.get<unknown>(`/movie/${movieId}`, {
      append_to_response: 'credits,videos,reviews,watch/providers,recommendations',
      language: TMDB_LANGUAGE
    }),
    getTmdbImageConfig()
  ]);

  return adaptTmdbMovieDetail(parseTmdbMovieDetail(response), imageConfig);
}
