import { MovieSearchResult, WatchProviderGroup } from '@entities/movie/model/types';

export const UNKNOWN_MOVIE_TITLE = 'Untitled';
export const UNKNOWN_PERSON_NAME = 'Unknown';
export const UNKNOWN_PROVIDER_NAME = 'Provider';

export const emptyMovieSearchResult: MovieSearchResult = {
  items: [],
  page: 1,
  totalPages: 1,
  totalResults: 0
};

export const emptyWatchProviderGroup: WatchProviderGroup = {
  buy: [],
  flatrate: [],
  rent: []
};
