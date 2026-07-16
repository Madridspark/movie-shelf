import { describe, expect, it } from 'vitest';

import { MovieSummary } from '@entities/movie/model/types';

import { addMovieToCollection, favoritesReducer, removeMovieFromCollection } from './favorites-slice';

const movie: MovieSummary = {
  backdropUrl: null,
  genreIds: [],
  id: 123,
  originalTitle: 'Test Movie',
  overview: '',
  posterUrl: null,
  releaseDate: '2026-01-01',
  releaseYear: 2026,
  title: 'Test Movie',
  voteAverage: 8,
  voteCount: 100
};

describe('favoritesReducer', () => {
  it('adds and removes favorite movies without duplicates', () => {
    const initialState = favoritesReducer(undefined, { type: 'unknown' });
    const addedState = favoritesReducer(initialState, addMovieToCollection({ movie }));
    const duplicateState = favoritesReducer(addedState, addMovieToCollection({ movie }));
    const removedState = favoritesReducer(duplicateState, removeMovieFromCollection({ movieId: 123 }));

    expect(duplicateState.collections[0].movieIds).toEqual([123]);
    expect(removedState.collections[0].movieIds).toEqual([]);
  });
});
