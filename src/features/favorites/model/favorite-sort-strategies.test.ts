import { describe, expect, it } from 'vitest';

import { FavoriteMovieItem } from './favorites-slice';
import { sortFavoriteItems } from './favorite-sort-strategies';

const items: FavoriteMovieItem[] = [
  {
    addedAt: 1,
    movie: {
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
    }
  },
  {
    addedAt: 2,
    movie: {
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
  }
];

describe('sortFavoriteItems', () => {
  it('sorts release year from oldest to newest', () => {
    expect(sortFavoriteItems(items, 'releaseYearAsc').map((item) => item.movie.id)).toEqual([1, 2]);
  });

  it('sorts title from Z to A', () => {
    expect(sortFavoriteItems(items, 'titleDesc').map((item) => item.movie.id)).toEqual([2, 1]);
  });
});
