import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { MovieSummary } from '@entities/movie/model/types';

export type FavoriteSortMode = 'addedAt' | 'rating' | 'releaseYear' | 'releaseYearAsc' | 'title' | 'titleDesc';
export type FavoriteLotterySource = 'allFavorites' | 'favorite';

export type FavoriteMovieItem = {
  addedAt: number;
  movie: MovieSummary;
};

export type FavoriteCollection = {
  createdAt: number;
  id: string;
  movieIds: number[];
  name: string;
  updatedAt: number;
};

export type FavoritesState = {
  activeCollectionId: string;
  collections: FavoriteCollection[];
  lotterySource: FavoriteLotterySource;
  moviesById: Record<string, FavoriteMovieItem>;
  sortMode: FavoriteSortMode;
  version: 1;
};

export const DEFAULT_COLLECTION_ID = 'default';

export function createInitialFavoritesState(): FavoritesState {
  const now = Date.now();

  return {
    activeCollectionId: DEFAULT_COLLECTION_ID,
    collections: [
      {
        createdAt: now,
        id: DEFAULT_COLLECTION_ID,
        movieIds: [],
        name: '默认收藏夹',
        updatedAt: now
      }
    ],
    lotterySource: 'favorite',
    moviesById: {},
    sortMode: 'addedAt',
    version: 1
  };
}

function findCollection(state: FavoritesState, collectionId: string) {
  return state.collections.find((collection) => collection.id === collectionId);
}

function ensureDefaultCollection(state: FavoritesState) {
  if (state.collections.length > 0) {
    return;
  }

  const fallback = createInitialFavoritesState();
  state.activeCollectionId = fallback.activeCollectionId;
  state.collections = fallback.collections;
}

function removeOrphanMovies(state: FavoritesState) {
  const usedMovieIds = new Set(state.collections.flatMap((collection) => collection.movieIds));

  Object.keys(state.moviesById).forEach((movieId) => {
    if (!usedMovieIds.has(Number(movieId))) {
      delete state.moviesById[movieId];
    }
  });
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: createInitialFavoritesState(),
  reducers: {
    addMovieToCollection(
      state,
      action: PayloadAction<{
        collectionId?: string;
        movie: MovieSummary;
      }>
    ) {
      const collectionId = action.payload.collectionId ?? state.activeCollectionId;
      const collection = findCollection(state, collectionId) ?? findCollection(state, DEFAULT_COLLECTION_ID);
      const now = Date.now();

      if (!collection) {
        return;
      }

      state.moviesById[String(action.payload.movie.id)] = {
        addedAt: state.moviesById[String(action.payload.movie.id)]?.addedAt ?? now,
        movie: action.payload.movie
      };

      if (!collection.movieIds.includes(action.payload.movie.id)) {
        collection.movieIds.unshift(action.payload.movie.id);
        collection.updatedAt = now;
      }
    },
    createFavoriteCollection: {
      prepare(name: string) {
        return {
          payload: {
            id: `collection-${Date.now()}`,
            name
          }
        };
      },
      reducer(state, action: PayloadAction<{ id: string; name: string }>) {
        const now = Date.now();
        const name = action.payload.name.trim() || '新收藏夹';

        state.collections.push({
          createdAt: now,
          id: action.payload.id,
          movieIds: [],
          name,
          updatedAt: now
        });
        state.activeCollectionId = action.payload.id;
      }
    },
    deleteFavoriteCollection(state, action: PayloadAction<string>) {
      if (action.payload === DEFAULT_COLLECTION_ID) {
        return;
      }

      state.collections = state.collections.filter((collection) => collection.id !== action.payload);
      ensureDefaultCollection(state);

      if (state.activeCollectionId === action.payload) {
        state.activeCollectionId = state.collections[0]?.id ?? DEFAULT_COLLECTION_ID;
      }

      removeOrphanMovies(state);
    },
    removeMovieFromCollection(
      state,
      action: PayloadAction<{
        collectionId?: string;
        movieId: number;
      }>
    ) {
      const collection = findCollection(state, action.payload.collectionId ?? state.activeCollectionId);

      if (!collection) {
        return;
      }

      collection.movieIds = collection.movieIds.filter((movieId) => movieId !== action.payload.movieId);
      collection.updatedAt = Date.now();
      removeOrphanMovies(state);
    },
    renameFavoriteCollection(state, action: PayloadAction<{ collectionId: string; name: string }>) {
      const collection = findCollection(state, action.payload.collectionId);

      if (!collection) {
        return;
      }

      collection.name = action.payload.name.trim() || collection.name;
      collection.updatedAt = Date.now();
    },
    setActiveCollection(state, action: PayloadAction<string>) {
      if (findCollection(state, action.payload)) {
        state.activeCollectionId = action.payload;
      }
    },
    setFavoriteLotterySource(state, action: PayloadAction<FavoriteLotterySource>) {
      state.lotterySource = action.payload;
    },
    setFavoriteSortMode(state, action: PayloadAction<FavoriteSortMode>) {
      state.sortMode = action.payload;
    }
  }
});

export const {
  addMovieToCollection,
  createFavoriteCollection,
  deleteFavoriteCollection,
  removeMovieFromCollection,
  renameFavoriteCollection,
  setActiveCollection,
  setFavoriteLotterySource,
  setFavoriteSortMode
} = favoritesSlice.actions;
export const favoritesReducer = favoritesSlice.reducer;
