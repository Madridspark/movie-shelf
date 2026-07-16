import { afterEach, describe, expect, it, vi } from 'vitest';

import { MovieSummary } from '@entities/movie/model/types';

import {
  DEFAULT_COLLECTION_ID,
  addMovieToCollection,
  createFavoriteCollection,
  deleteFavoriteCollection,
  favoritesReducer,
  removeMovieFromCollection,
  renameFavoriteCollection,
  setActiveCollection,
  setFavoriteLotterySource,
  setFavoriteSortMode
} from './favorites-slice';

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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds and removes favorite movies without duplicates', () => {
    const initialState = favoritesReducer(undefined, { type: 'unknown' });
    const addedState = favoritesReducer(initialState, addMovieToCollection({ movie }));
    const duplicateState = favoritesReducer(addedState, addMovieToCollection({ movie }));
    const removedState = favoritesReducer(duplicateState, removeMovieFromCollection({ movieId: 123 }));

    expect(duplicateState.collections[0].movieIds).toEqual([123]);
    expect(removedState.collections[0].movieIds).toEqual([]);
  });

  it('creates, renames and activates custom collections', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);

    const initialState = favoritesReducer(undefined, { type: 'unknown' });
    const createdState = favoritesReducer(initialState, createFavoriteCollection('  周末片单  '));
    const renamedState = favoritesReducer(
      createdState,
      renameFavoriteCollection({ collectionId: 'collection-1000', name: '  重温片单  ' })
    );
    const activatedState = favoritesReducer(renamedState, setActiveCollection(DEFAULT_COLLECTION_ID));

    expect(createdState.activeCollectionId).toBe('collection-1000');
    expect(renamedState.collections.find((collection) => collection.id === 'collection-1000')?.name).toBe('重温片单');
    expect(activatedState.activeCollectionId).toBe(DEFAULT_COLLECTION_ID);
  });

  it('keeps the default collection and removes orphan movie snapshots', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1000);

    const initialState = favoritesReducer(undefined, { type: 'unknown' });
    const createdState = favoritesReducer(initialState, createFavoriteCollection('周末片单'));
    const addedState = favoritesReducer(
      createdState,
      addMovieToCollection({
        collectionId: 'collection-1000',
        movie
      })
    );
    const deletedDefaultState = favoritesReducer(addedState, deleteFavoriteCollection(DEFAULT_COLLECTION_ID));
    const deletedCustomState = favoritesReducer(deletedDefaultState, deleteFavoriteCollection('collection-1000'));

    expect(deletedDefaultState.collections.some((collection) => collection.id === DEFAULT_COLLECTION_ID)).toBe(true);
    expect(deletedCustomState.collections).toHaveLength(1);
    expect(deletedCustomState.collections[0].id).toBe(DEFAULT_COLLECTION_ID);
    expect(deletedCustomState.moviesById).toEqual({});
  });

  it('updates favorites preferences', () => {
    const initialState = favoritesReducer(undefined, { type: 'unknown' });
    const lotteryState = favoritesReducer(initialState, setFavoriteLotterySource('allFavorites'));
    const sortState = favoritesReducer(lotteryState, setFavoriteSortMode('titleDesc'));

    expect(sortState.lotterySource).toBe('allFavorites');
    expect(sortState.sortMode).toBe('titleDesc');
  });
});
