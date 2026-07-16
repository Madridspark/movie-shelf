import { createInitialFavoritesState, FavoritesState } from './favorites-slice';

const STORAGE_KEY = 'movie-shelf:favorites:v1';

function isValidFavoritesState(value: unknown): value is FavoritesState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const state = value as FavoritesState;

  return (
    state.version === 1 &&
    typeof state.activeCollectionId === 'string' &&
    Array.isArray(state.collections) &&
    state.collections.length > 0 &&
    typeof state.moviesById === 'object'
  );
}

export function loadFavoritesState() {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);

    if (!rawValue) {
      return undefined;
    }

    const parsedValue = JSON.parse(rawValue) as unknown;

    return isValidFavoritesState(parsedValue) ? parsedValue : createInitialFavoritesState();
  } catch {
    return createInitialFavoritesState();
  }
}

export function saveFavoritesState(state: FavoritesState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
