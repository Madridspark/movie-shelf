import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '@store/index';

import { sortFavoriteItems } from './favorite-sort-strategies';
import { FavoriteMovieItem } from './favorites-slice';

export const selectFavoriteCollections = (state: RootState) => state.favorites.collections;
export const selectActiveCollectionId = (state: RootState) => state.favorites.activeCollectionId;
export const selectFavoriteSortMode = (state: RootState) => state.favorites.sortMode;
export const selectFavoriteLotterySource = (state: RootState) => state.favorites.lotterySource;

export const selectActiveCollection = createSelector(
  [selectFavoriteCollections, selectActiveCollectionId],
  (collections, activeCollectionId) =>
    collections.find((collection) => collection.id === activeCollectionId) ?? collections[0]
);

export const selectActiveFavoriteMovies = createSelector(
  [selectActiveCollection, (state: RootState) => state.favorites.moviesById, selectFavoriteSortMode],
  (collection, moviesById, sortMode) => {
    const items =
      collection?.movieIds
        .map((movieId) => moviesById[String(movieId)])
        .filter((item): item is FavoriteMovieItem => Boolean(item)) ?? [];

    return sortFavoriteItems(items, sortMode);
  }
);

export const selectAllFavoriteMovies = createSelector(
  [(state: RootState) => state.favorites.moviesById, selectFavoriteSortMode],
  (moviesById, sortMode) => sortFavoriteItems(Object.values(moviesById), sortMode)
);

export const selectIsMovieFavorited = (movieId: number) => (state: RootState) =>
  Object.values(state.favorites.collections).some((collection) => collection.movieIds.includes(movieId));
