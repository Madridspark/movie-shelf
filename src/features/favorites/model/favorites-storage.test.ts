import { describe, expect, it } from 'vitest';

import { getFavoritesStorageNotice, loadFavoritesState } from './favorites-storage';

const STORAGE_KEY = 'movie-shelf:favorites:v1';

const movie = {
  backdropUrl: null,
  genreIds: [],
  id: 123,
  originalTitle: 'Recovered Movie',
  overview: '',
  posterUrl: null,
  releaseDate: '2026-01-01',
  releaseYear: 2026,
  title: 'Recovered Movie',
  voteAverage: 8,
  voteCount: 100
};

describe('favorites storage recovery', () => {
  it('resets unreadable local storage and exposes a reset notice', () => {
    window.localStorage.setItem(STORAGE_KEY, '{broken');

    const state = loadFavoritesState();
    const notice = getFavoritesStorageNotice();

    expect(state?.collections[0].name).toBe('默认收藏夹');
    expect(notice?.variant).toBe('reset');
  });

  it('repairs malformed version 1 data and keeps valid movies', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeCollectionId: 'missing',
        collections: [
          {
            createdAt: Date.now(),
            id: 'default',
            movieIds: [123, 123, 999],
            name: '默认收藏夹',
            updatedAt: Date.now()
          }
        ],
        lotterySource: 'favorite',
        moviesById: {
          123: {
            addedAt: Date.now(),
            movie
          }
        },
        sortMode: 'addedAt',
        version: 1
      })
    );

    const state = loadFavoritesState();
    const notice = getFavoritesStorageNotice();

    expect(state?.activeCollectionId).toBe('default');
    expect(state?.collections[0].movieIds).toEqual([123]);
    expect(state?.moviesById['123'].movie.title).toBe('Recovered Movie');
    expect(notice?.variant).toBe('recovered');
  });
});
