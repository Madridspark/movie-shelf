import { queryOptions, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { HOME_BANNER_INITIAL_MOVIES } from '@entities/movie/model/home-banner-snapshot';

import { movieService } from './movie-service';

export const HOME_BANNER_MOVIES_QUERY_KEY = ['movies', 'home-banner', 'trending-week'] as const;

export function useMovieSearchQuery(query: string) {
  return useInfiniteQuery({
    queryKey: ['movies', 'search', query],
    queryFn: ({ pageParam }) => movieService.searchMovies(query, Number(pageParam)),
    enabled: query.trim().length > 0,
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;

      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1
  });
}

export function useNowPlayingMoviesQuery() {
  return useInfiniteQuery({
    queryKey: ['movies', 'now-playing'],
    queryFn: ({ pageParam }) => movieService.getNowPlayingMovies(Number(pageParam)),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;

      return nextPage <= lastPage.totalPages ? nextPage : undefined;
    },
    initialPageParam: 1
  });
}

export function useHomeBannerMoviesQuery() {
  return useQuery(homeBannerMoviesQueryOptions());
}

export function homeBannerMoviesQueryOptions() {
  return queryOptions({
    initialData: HOME_BANNER_INITIAL_MOVIES,
    initialDataUpdatedAt: 0,
    queryKey: HOME_BANNER_MOVIES_QUERY_KEY,
    queryFn: () => movieService.getHomeBannerMovies()
  });
}

export function useMovieDetailQuery(movieId: string | undefined) {
  return useQuery({
    queryKey: ['movies', 'detail', movieId],
    queryFn: () => movieService.getMovieDetail(movieId ?? ''),
    enabled: Boolean(movieId)
  });
}
