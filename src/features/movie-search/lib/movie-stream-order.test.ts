import { describe, expect, it } from 'vitest';

import { MovieSummary } from '@entities/movie/model/types';

import { appendMovieStream, initializeMovieStream, sortMovieStream } from './movie-stream-order';

const movies: MovieSummary[] = [
  {
    backdropUrl: null,
    genreIds: [],
    id: 1,
    originalTitle: 'Alpha',
    overview: '',
    posterUrl: null,
    releaseDate: '2020-01-01',
    releaseYear: 2020,
    title: 'Alpha',
    voteAverage: 5,
    voteCount: 10
  },
  {
    backdropUrl: null,
    genreIds: [],
    id: 2,
    originalTitle: 'Bravo',
    overview: '',
    posterUrl: null,
    releaseDate: '2021-01-01',
    releaseYear: 2021,
    title: 'Bravo',
    voteAverage: 8,
    voteCount: 10
  },
  {
    backdropUrl: null,
    genreIds: [],
    id: 3,
    originalTitle: 'Charlie',
    overview: '',
    posterUrl: null,
    releaseDate: '2022-01-01',
    releaseYear: 2022,
    title: 'Charlie',
    voteAverage: 10,
    voteCount: 10
  }
];

describe('movie stream order', () => {
  it('sorts the initial loaded pool with the selected mode', () => {
    const streamState = initializeMovieStream(movies.slice(0, 2), 'rating', true, 100);

    expect(streamState.displayMovies.map((movie) => movie.id)).toEqual([2, 1]);
    expect(streamState.moviePool.map((movie) => movie.id)).toEqual([1, 2]);
  });

  it('appends lazy-loaded movies without re-sorting the visible stream', () => {
    const streamState = initializeMovieStream(movies.slice(0, 2), 'rating', true, 100);
    const nextState = appendMovieStream(streamState, movies, 100);

    expect(nextState.displayMovies.map((movie) => movie.id)).toEqual([2, 1, 3]);
    expect(nextState.moviePool.map((movie) => movie.id)).toEqual([1, 2, 3]);
  });

  it('keeps every incoming movie when no stream limit is provided', () => {
    const streamState = initializeMovieStream(movies.slice(0, 2), 'relevance', false);
    const nextState = appendMovieStream(streamState, movies);

    expect(nextState.displayMovies.map((movie) => movie.id)).toEqual([1, 2, 3]);
    expect(nextState.moviePool.map((movie) => movie.id)).toEqual([1, 2, 3]);
  });

  it('re-sorts the whole loaded pool when the user changes sort mode', () => {
    const streamState = appendMovieStream(
      initializeMovieStream(movies.slice(0, 2), 'rating', true, 100),
      movies,
      100
    );

    expect(sortMovieStream(streamState.moviePool, 'rating').map((movie) => movie.id)).toEqual([3, 2, 1]);
    expect(sortMovieStream(streamState.moviePool, 'relevance').map((movie) => movie.id)).toEqual([1, 2, 3]);
  });
});
