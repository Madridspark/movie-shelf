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
  limit: number
): MovieStreamState {
  const moviePool = movies.slice(0, limit);

  return {
    displayMovies: shouldSort ? sortSearchMovies(moviePool, sortMode) : moviePool,
    moviePool
  };
}

export function appendMovieStream(
  currentState: MovieStreamState,
  incomingMovies: MovieSummary[],
  limit: number
): MovieStreamState {
  const existingMovieIds = new Set(currentState.moviePool.map((movie) => movie.id));
  const appendedMovies = incomingMovies.filter((movie) => !existingMovieIds.has(movie.id));

  if (appendedMovies.length === 0) {
    return currentState;
  }

  return {
    displayMovies: [...currentState.displayMovies, ...appendedMovies].slice(0, limit),
    moviePool: [...currentState.moviePool, ...appendedMovies].slice(0, limit)
  };
}

export function sortMovieStream(moviePool: MovieSummary[], sortMode: MovieSearchSortMode) {
  return sortSearchMovies(moviePool, sortMode);
}
