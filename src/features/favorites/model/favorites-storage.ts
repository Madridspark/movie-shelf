import { createInitialFavoritesState, FavoritesState } from './favorites-slice';

const STORAGE_KEY = 'movie-shelf:favorites:v1';

export type FavoritesStorageNotice = {
  message: string;
  title: string;
  variant: 'recovered' | 'reset';
};

let latestStorageNotice: FavoritesStorageNotice | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidMovieSnapshot(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  return isNumber(value.id) && typeof value.title === 'string';
}

function normalizeFavoritesState(value: unknown) {
  const fallbackState = createInitialFavoritesState();

  if (!isRecord(value) || value.version !== 1 || !isRecord(value.moviesById)) {
    latestStorageNotice = {
      title: '收藏夹数据已重建',
      message: '本地收藏夹数据版本不兼容或结构损坏，已保留一个空的默认收藏夹。',
      variant: 'reset'
    };

    return fallbackState;
  }

  let didRecover = false;
  const moviesById = Object.entries(value.moviesById).reduce<FavoritesState['moviesById']>(
    (movies, [movieId, item]) => {
      if (!isRecord(item) || !isNumber(item.addedAt) || !isValidMovieSnapshot(item.movie)) {
        didRecover = true;
        return movies;
      }

      movies[movieId] = item as FavoritesState['moviesById'][string];

      return movies;
    },
    {}
  );
  const collections = Array.isArray(value.collections)
    ? value.collections.flatMap((collection) => {
        if (!isRecord(collection) || typeof collection.id !== 'string' || typeof collection.name !== 'string') {
          didRecover = true;
          return [];
        }

        const movieIds = Array.isArray(collection.movieIds)
          ? collection.movieIds
              .filter((movieId): movieId is number => isNumber(movieId) && Boolean(moviesById[String(movieId)]))
              .filter((movieId, index, allMovieIds) => allMovieIds.indexOf(movieId) === index)
          : [];

        if (!Array.isArray(collection.movieIds) || movieIds.length !== collection.movieIds.length) {
          didRecover = true;
        }

        return [
          {
            createdAt: isNumber(collection.createdAt) ? collection.createdAt : Date.now(),
            id: collection.id,
            movieIds,
            name: collection.name.trim() || '未命名收藏夹',
            updatedAt: isNumber(collection.updatedAt) ? collection.updatedAt : Date.now()
          }
        ];
      })
    : [];
  const safeCollections = collections.length > 0 ? collections : fallbackState.collections;
  const activeCollectionId =
    typeof value.activeCollectionId === 'string' &&
    safeCollections.some((collection) => collection.id === value.activeCollectionId)
      ? value.activeCollectionId
      : safeCollections[0].id;
  const sortMode =
    value.sortMode === 'rating' ||
    value.sortMode === 'releaseYear' ||
    value.sortMode === 'releaseYearAsc' ||
    value.sortMode === 'title' ||
    value.sortMode === 'titleDesc'
      ? value.sortMode
      : 'addedAt';
  const lotterySource = value.lotterySource === 'allFavorites' ? 'allFavorites' : 'favorite';

  if (safeCollections === fallbackState.collections || activeCollectionId !== value.activeCollectionId) {
    didRecover = true;
  }

  latestStorageNotice = didRecover
    ? {
        title: '收藏夹数据已修复',
        message: '检测到本地收藏夹数据有缺失或异常字段，已自动清理不可用条目并保留可恢复内容。',
        variant: 'recovered'
      }
    : null;

  return {
    activeCollectionId,
    collections: safeCollections,
    lotterySource,
    moviesById,
    sortMode,
    version: 1
  } satisfies FavoritesState;
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

    return normalizeFavoritesState(parsedValue);
  } catch {
    latestStorageNotice = {
      title: '收藏夹数据读取失败',
      message: '本地收藏夹数据无法解析，已重建默认收藏夹，后续收藏会继续正常保存。',
      variant: 'reset'
    };

    return createInitialFavoritesState();
  }
}

export function getFavoritesStorageNotice() {
  return latestStorageNotice;
}

export function saveFavoritesState(state: FavoritesState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
