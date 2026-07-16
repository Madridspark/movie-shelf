import { describe, expect, it } from 'vitest';

import { MovieSummary } from '@entities/movie/model/types';

import { sortSearchMovies } from './movie-sort-strategies';

const movies: MovieSummary[] = [
  {
    backdropUrl: null,
    genreIds: [],
    id: 1,
    originalTitle: 'Alpha',
    overview: '',
    posterUrl: null,
    releaseDate: '2000-01-01',
    releaseYear: 2000,
    title: 'Alpha',
    voteAverage: 7,
    voteCount: 10
  },
  {
    backdropUrl: null,
    genreIds: [],
    id: 2,
    originalTitle: 'Zulu',
    overview: '',
    posterUrl: null,
    releaseDate: '2020-01-01',
    releaseYear: 2020,
    title: 'Zulu',
    voteAverage: 8,
    voteCount: 20
  }
];

describe('sortSearchMovies', () => {
  it('sorts release date from oldest to newest', () => {
    expect(sortSearchMovies(movies, 'releaseDateAsc').map((movie) => movie.id)).toEqual([1, 2]);
  });

  it('sorts title from Z to A', () => {
    expect(sortSearchMovies(movies, 'titleDesc').map((movie) => movie.id)).toEqual([2, 1]);
  });
});
