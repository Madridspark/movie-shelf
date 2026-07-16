import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  useHomeBannerMoviesQuery,
  useMovieSearchQuery,
  useNowPlayingMoviesQuery
} from '@entities/movie/api/use-movie-search-query';
import { MovieSummary } from '@entities/movie/model/types';
import {
  addMovieToCollection,
  DEFAULT_COLLECTION_ID,
  removeMovieFromCollection
} from '@features/favorites/model/favorites-slice';
import { selectFavoriteCollections } from '@features/favorites/model/favorites-selectors';
import { LotteryBanner } from '@features/lottery-banner/ui/LotteryBanner';
import {
  appendMovieStream,
  initializeMovieStream,
  sortMovieStream
} from '@features/movie-search/lib/movie-stream-order';
import {
  MovieSearchSortMode,
  setMovieSearchSortMode
} from '@features/preferences/model/preferences-slice';
import { useDebouncedValue } from '@shared/lib/useDebouncedValue';
import { DropdownSelectOption } from '@shared/ui/dropdown-select';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import { HomeDiscoverySearch } from './HomeDiscoverySearch';
import { HomeToolbar } from './HomeToolbar';
import { MovieStreamSection } from './MovieStreamSection';
import styles from './index.module.less';

const SEARCH_STREAM_LIMIT = 100;
const MIN_HOME_ITEMS = 36;
const HOME_BACKGROUND_FETCH_DELAY = 360;
const HOME_DATA_REQUEST_DELAY = globalThis.navigator?.userAgent.includes('jsdom') ? 0 : 3200;
const HOME_PAGE_PRELOAD_IMAGE_COUNT = 8;
const SEARCH_SORT_OPTIONS: DropdownSelectOption<MovieSearchSortMode>[] = [
  { label: '相关性', value: 'relevance' },
  { label: '评分从高到低', value: 'rating' },
  { label: '上映时间从新到旧', value: 'releaseDate' },
  { label: '上映时间从旧到新', value: 'releaseDateAsc' },
  { label: '片名 A-Z', value: 'title' },
  { label: '片名 Z-A', value: 'titleDesc' }
];

function flattenVisibleMovies(pages: { items: MovieSummary[] }[] | undefined, limit?: number) {
  const movies =
    pages
      ?.flatMap((page) => page.items)
      .filter((movie) => movie.posterUrl || movie.backdropUrl) ?? [];

  return typeof limit === 'number' ? movies.slice(0, limit) : movies;
}

function preloadMovieImages(movies: MovieSummary[], imageCount = HOME_PAGE_PRELOAD_IMAGE_COUNT) {
  if (typeof Image === 'undefined') {
    return;
  }

  movies.slice(0, imageCount).forEach((movie) => {
    const imageUrl = movie.posterUrl ?? movie.backdropUrl;

    if (!imageUrl) {
      return;
    }

    const image = new Image();

    image.decoding = 'async';
    image.src = imageUrl;
  });
}

function getStreamLimit(isSearching: boolean) {
  return isSearching ? SEARCH_STREAM_LIMIT : undefined;
}

function hasReachedStreamLimit(movieCount: number, streamLimit: number | undefined) {
  return (
    typeof streamLimit === 'number' &&
    movieCount >= streamLimit
  );
}

export function MovieSearchPanel() {
  const dispatch = useAppDispatch();
  const collections = useAppSelector(selectFavoriteCollections);
  const searchSortMode = useAppSelector((state) => state.preferences.movieSearchSortMode);
  const [keyword, setKeyword] = useState('');
  const [displayMovies, setDisplayMovies] = useState<MovieSummary[]>([]);
  const [shouldLoadHomeData, setShouldLoadHomeData] = useState(false);
  const [visibleHomePageCount, setVisibleHomePageCount] = useState(1);
  const searchKeyword = keyword.trim();
  const debouncedSearchKeyword = useDebouncedValue(searchKeyword);
  const isSearching = searchKeyword.length > 0;
  const isSearchSettling = isSearching && searchKeyword !== debouncedSearchKeyword;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const loadMoreArmedRef = useRef(true);
  const moviePoolRef = useRef<MovieSummary[]>([]);
  const preloadedNowPlayingPageCountRef = useRef(0);
  const streamKeyRef = useRef('');
  const sortModeRef = useRef(searchSortMode);

  const isHomeDataEnabled = !isSearching && shouldLoadHomeData;
  const bannerQuery = useHomeBannerMoviesQuery(isHomeDataEnabled);
  const nowPlayingQuery = useNowPlayingMoviesQuery(isHomeDataEnabled);
  const searchQuery = useMovieSearchQuery(debouncedSearchKeyword);
  const loadedHomePageCount = nowPlayingQuery.data?.pages.length ?? 0;
  const hasPrefetchedHomePage = !isSearching && visibleHomePageCount < loadedHomePageCount;

  const rawDisplayMovies = useMemo(() => {
    const pages = isSearching
      ? searchQuery.data?.pages
      : nowPlayingQuery.data?.pages.slice(0, visibleHomePageCount);

    return flattenVisibleMovies(pages, getStreamLimit(isSearching));
  }, [isSearching, nowPlayingQuery.data?.pages, searchQuery.data?.pages, visibleHomePageCount]);

  const fetchNextPage = isSearching ? searchQuery.fetchNextPage : nowPlayingQuery.fetchNextPage;
  const hasNextPage = isSearching ? searchQuery.hasNextPage : nowPlayingQuery.hasNextPage;
  const refetchMovies = isSearching ? searchQuery.refetch : nowPlayingQuery.refetch;
  const isHomeDataDeferred = !isSearching && !shouldLoadHomeData && displayMovies.length === 0;
  const isLoading =
    isSearchSettling || isHomeDataDeferred || (isSearching ? searchQuery.isFetching : nowPlayingQuery.isFetching);
  const isFetchingNextPage = isSearching
    ? searchQuery.isFetchingNextPage
    : nowPlayingQuery.isFetchingNextPage;
  const hasError = !isSearchSettling && (isSearching ? searchQuery.isError : isHomeDataEnabled && nowPlayingQuery.isError);
  const streamLimit = getStreamLimit(isSearching);
  const reachedStreamLimit = hasReachedStreamLimit(displayMovies.length, streamLimit);
  const canLoadMore = isSearching
    ? Boolean(hasNextPage) && !isFetchingNextPage && !reachedStreamLimit
    : !reachedStreamLimit && (hasPrefetchedHomePage || (Boolean(hasNextPage) && !isFetchingNextPage));
  const defaultCollection = collections.find((collection) => collection.id === DEFAULT_COLLECTION_ID);
  const defaultFavoriteMovieIds = useMemo(
    () => new Set(defaultCollection?.movieIds ?? []),
    [defaultCollection?.movieIds]
  );
  const streamKey = isSearching ? `search:${debouncedSearchKeyword}` : 'home';

  const handleSortModeChange = (nextSortMode: MovieSearchSortMode) => {
    dispatch(setMovieSearchSortMode(nextSortMode));
  };

  const handleToggleFavorite = (movie: MovieSummary) => {
    dispatch(
      defaultFavoriteMovieIds.has(movie.id)
        ? removeMovieFromCollection({ collectionId: DEFAULT_COLLECTION_ID, movieId: movie.id })
        : addMovieToCollection({ collectionId: DEFAULT_COLLECTION_ID, movie })
    );
  };

  useEffect(() => {
    if (isSearching || shouldLoadHomeData) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShouldLoadHomeData(true);
    }, HOME_DATA_REQUEST_DELAY);

    return () => window.clearTimeout(timer);
  }, [isSearching, shouldLoadHomeData]);

  const handleLoadMore = useCallback(() => {
    if (isSearching) {
      if (canLoadMore) {
        void fetchNextPage();
      }

      return;
    }

    if (visibleHomePageCount < loadedHomePageCount) {
      setVisibleHomePageCount((currentCount) => Math.min(currentCount + 1, loadedHomePageCount));
      return;
    }

    if (hasNextPage && !isFetchingNextPage) {
      setVisibleHomePageCount((currentCount) => currentCount + 1);
      void fetchNextPage();
    }
  }, [
    canLoadMore,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isSearching,
    loadedHomePageCount,
    visibleHomePageCount
  ]);

  useEffect(() => {
    const isNewStream = streamKeyRef.current !== streamKey;

    if (isNewStream) {
      const nextStreamState = initializeMovieStream(
        rawDisplayMovies,
        searchSortMode,
        isSearching,
        streamLimit
      );

      streamKeyRef.current = streamKey;
      moviePoolRef.current = nextStreamState.moviePool;
      setDisplayMovies(nextStreamState.displayMovies);
      return;
    }

    const currentStreamState = {
      displayMovies,
      moviePool: moviePoolRef.current
    };
    const nextStreamState = appendMovieStream(currentStreamState, rawDisplayMovies, streamLimit);

    if (nextStreamState === currentStreamState) {
      return;
    }

    moviePoolRef.current = nextStreamState.moviePool;
    setDisplayMovies(nextStreamState.displayMovies);
  }, [displayMovies, isSearching, rawDisplayMovies, searchSortMode, streamKey, streamLimit]);

  useEffect(() => {
    if (sortModeRef.current === searchSortMode) {
      return;
    }

    sortModeRef.current = searchSortMode;

    if (!isSearching) {
      return;
    }

    setDisplayMovies(sortMovieStream(moviePoolRef.current, searchSortMode));
  }, [isSearching, searchSortMode]);

  useEffect(() => {
    if (isSearching) {
      return;
    }

    if (!shouldLoadHomeData) {
      return;
    }

    if (displayMovies.length >= MIN_HOME_ITEMS) {
      return;
    }

    if (visibleHomePageCount < loadedHomePageCount) {
      setVisibleHomePageCount((currentCount) => Math.min(currentCount + 1, loadedHomePageCount));
      return;
    }

    if (hasNextPage && !isFetchingNextPage) {
      setVisibleHomePageCount((currentCount) => currentCount + 1);
      void fetchNextPage();
    }
  }, [
    displayMovies.length,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isSearching,
    shouldLoadHomeData,
    loadedHomePageCount,
    visibleHomePageCount
  ]);

  useEffect(() => {
    if (
      isSearching ||
      !shouldLoadHomeData ||
      isLoading ||
      isFetchingNextPage ||
      !hasNextPage ||
      displayMovies.length < MIN_HOME_ITEMS
    ) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      void fetchNextPage();
    }, HOME_BACKGROUND_FETCH_DELAY);

    return () => window.clearTimeout(timer);
  }, [
    displayMovies.length,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isSearching,
    shouldLoadHomeData
  ]);

  useEffect(() => {
    if (isSearching) {
      preloadedNowPlayingPageCountRef.current = 0;
      return;
    }

    const pages = nowPlayingQuery.data?.pages ?? [];
    const nextPages = pages.slice(preloadedNowPlayingPageCountRef.current);

    nextPages.forEach((page) => preloadMovieImages(page.items));
    preloadedNowPlayingPageCountRef.current = pages.length;
  }, [isSearching, nowPlayingQuery.data?.pages]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !canLoadMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting);

        if (!isIntersecting) {
          loadMoreArmedRef.current = true;
          return;
        }

        if (loadMoreArmedRef.current) {
          loadMoreArmedRef.current = false;
          handleLoadMore();
        }
      },
      {
        rootMargin: '640px 0px'
      }
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [canLoadMore, handleLoadMore]);

  return (
    <section className={styles.page}>
      {!isSearching ? (
        <LotteryBanner
          actionMode="addToFavorite"
          movies={bannerQuery.data?.items ?? []}
          sourceType="homeBanner"
        />
      ) : null}

      <Link className={styles.logo} to="/">
        <img
          alt="MovieShelf"
          decoding="async"
          fetchPriority="high"
          src="/assets/brand/movie-shelf-horizontal-white.png"
        />
      </Link>

      <Link aria-label="打开收藏夹" className={styles.favoriteAction} to="/favorites">
        <Heart size={22} />
      </Link>

      <div className={clsx(styles.content, isSearching && styles.searchContent)}>
        {isSearching ? (
          <HomeToolbar
            keyword={keyword}
            sortMode={searchSortMode}
            sortOptions={SEARCH_SORT_OPTIONS}
            onKeywordChange={setKeyword}
            onSortModeChange={handleSortModeChange}
          />
        ) : (
          <HomeDiscoverySearch keyword={keyword} onKeywordChange={setKeyword} />
        )}

        <MovieStreamSection
          canLoadMore={canLoadMore}
          defaultFavoriteMovieIds={defaultFavoriteMovieIds}
          hasError={hasError}
          isFetchingNextPage={isFetchingNextPage}
          isInitialLoading={isLoading && displayMovies.length === 0}
          isLoading={isLoading}
          isSearching={isSearching}
          loadMoreRef={(element) => {
            loadMoreRef.current = element;
          }}
          movies={displayMovies}
          priorityImageCount={!isSearching ? 4 : 0}
          reachedStreamLimit={reachedStreamLimit}
          streamLimit={streamLimit}
          onRefetch={() => void refetchMovies()}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    </section>
  );
}
