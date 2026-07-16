import { tmdbClient } from '@shared/api/client/tmdb-client';
import { getTmdbImageConfig } from '@shared/api/config/tmdb-image-config';

import { adaptTmdbMovieDetail, adaptTmdbSearchResponse, MovieGenreMap } from '../lib/movie-adapter';
import { MovieDetail, MovieSearchResult } from '../model/types';
import { parseTmdbGenreListResponse, parseTmdbMovieDetail, parseTmdbSearchResponse } from './tmdb-schemas';

const TMDB_LANGUAGE = 'zh-TW';
let movieGenreMapPromise: Promise<MovieGenreMap> | null = null;

function getMovieGenreMap() {
  movieGenreMapPromise ??= tmdbClient
    .get<unknown>('/genre/movie/list', {
      language: TMDB_LANGUAGE
    })
    .then((response) =>
      parseTmdbGenreListResponse(response).genres.reduce<MovieGenreMap>((genreMap, genre) => {
        genreMap[genre.id] = {
          id: genre.id,
          name: genre.name ?? ''
        };

        return genreMap;
      }, {})
    )
    .catch(() => ({}));

  return movieGenreMapPromise;
}

export async function searchMovies(query: string, page = 1): Promise<MovieSearchResult> {
  const [response, imageConfig, genreMap] = await Promise.all([
    tmdbClient.get<unknown>('/search/movie', {
      query,
      page: String(page),
      include_adult: 'false',
      language: TMDB_LANGUAGE
    }),
    getTmdbImageConfig(),
    getMovieGenreMap()
  ]);

  return adaptTmdbSearchResponse(parseTmdbSearchResponse(response), imageConfig, genreMap);
}

export async function getNowPlayingMovies(page = 1): Promise<MovieSearchResult> {
  const [response, imageConfig, genreMap] = await Promise.all([
    tmdbClient.get<unknown>('/movie/now_playing', {
      page: String(page),
      language: TMDB_LANGUAGE
    }),
    getTmdbImageConfig(),
    getMovieGenreMap()
  ]);

  return adaptTmdbSearchResponse(parseTmdbSearchResponse(response), imageConfig, genreMap);
}

export async function getHomeBannerMovies(page = 1): Promise<MovieSearchResult> {
  const [response, imageConfig, genreMap] = await Promise.all([
    tmdbClient.get<unknown>('/trending/movie/week', {
      page: String(page),
      language: TMDB_LANGUAGE
    }),
    getTmdbImageConfig(),
    getMovieGenreMap()
  ]);

  return adaptTmdbSearchResponse(parseTmdbSearchResponse(response), imageConfig, genreMap);
}

export async function getMovieDetail(movieId: string): Promise<MovieDetail> {
  const [response, imageConfig, genreMap] = await Promise.all([
    tmdbClient.get<unknown>(`/movie/${movieId}`, {
      append_to_response: 'credits,videos,reviews,watch/providers,recommendations',
      language: TMDB_LANGUAGE
    }),
    getTmdbImageConfig(),
    getMovieGenreMap()
  ]);

  return adaptTmdbMovieDetail(parseTmdbMovieDetail(response), imageConfig, genreMap);
}
