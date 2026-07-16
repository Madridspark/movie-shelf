import { MovieSummary } from '@entities/movie/model/types';
import { MovieSearchSortMode } from '@features/preferences/model/preferences-slice';

import { sortSearchMovies } from './movie-sort-strategies';

export type MovieStreamState = {
  displayMovies: MovieSummary[];
  moviePool: MovieSummary[];
};

export function initializeMovieStream(
  movies: MovieSummary[],
  sortMode: MovieSearchSortMode,
  shouldSort: boolean,
  limit?: number
): MovieStreamState {
  const moviePool = typeof limit === 'number' ? movies.slice(0, limit) : movies;

  return {
    displayMovies: shouldSort ? sortSearchMovies(moviePool, sortMode) : moviePool,
    moviePool
  };
}

export function appendMovieStream(
  currentState: MovieStreamState,
  incomingMovies: MovieSummary[],
  limit?: number
): MovieStreamState {
  const existingMovieIds = new Set(currentState.moviePool.map((movie) => movie.id));
  const appendedMovies = incomingMovies.filter((movie) => !existingMovieIds.has(movie.id));

  if (appendedMovies.length === 0) {
    return currentState;
  }

  const nextDisplayMovies = [...currentState.displayMovies, ...appendedMovies];
  const nextMoviePool = [...currentState.moviePool, ...appendedMovies];

  return {
    displayMovies: typeof limit === 'number' ? nextDisplayMovies.slice(0, limit) : nextDisplayMovies,
    moviePool: typeof limit === 'number' ? nextMoviePool.slice(0, limit) : nextMoviePool
  };
}

export function sortMovieStream(moviePool: MovieSummary[], sortMode: MovieSearchSortMode) {
  return sortSearchMovies(moviePool, sortMode);
}
