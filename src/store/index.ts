import { configureStore } from '@reduxjs/toolkit';

import { loadFavoritesState, saveFavoritesState } from '@features/favorites/model/favorites-storage';
import { favoritesReducer } from '@features/favorites/model/favorites-slice';
import { lotteryBannerReducer } from '@features/lottery-banner/model/lottery-banner-slice';
import { preferencesReducer } from '@features/preferences/model/preferences-slice';

const preloadedFavoritesState = loadFavoritesState();

export const store = configureStore({
  preloadedState: preloadedFavoritesState
    ? {
        favorites: preloadedFavoritesState
      }
    : undefined,
  reducer: {
    favorites: favoritesReducer,
    lotteryBanner: lotteryBannerReducer,
    preferences: preferencesReducer
  }
});

store.subscribe(() => {
  saveFavoritesState(store.getState().favorites);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
