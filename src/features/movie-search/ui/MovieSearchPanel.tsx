import { useEffect, useMemo, useRef, useState } from 'react';

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
import { sortSearchMovies } from '@features/movie-search/lib/movie-sort-strategies';
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

const MOVIE_STREAM_LIMIT = 100;
const MIN_HOME_ITEMS = 36;
const SEARCH_SORT_OPTIONS: DropdownSelectOption<MovieSearchSortMode>[] = [
  { label: '相关性', value: 'relevance' },
  { label: '评分从高到低', value: 'rating' },
  { label: '上映时间从新到旧', value: 'releaseDate' },
  { label: '上映时间从旧到新', value: 'releaseDateAsc' },
  { label: '片名 A-Z', value: 'title' },
  { label: '片名 Z-A', value: 'titleDesc' }
];

function flattenVisibleMovies(pages: { items: MovieSummary[] }[] | undefined) {
  return (
    pages
      ?.flatMap((page) => page.items)
      .filter((movie) => movie.posterUrl || movie.backdropUrl)
      .slice(0, MOVIE_STREAM_LIMIT) ?? []
  );
}

export function MovieSearchPanel() {
  const dispatch = useAppDispatch();
  const collections = useAppSelector(selectFavoriteCollections);
  const searchSortMode = useAppSelector((state) => state.preferences.movieSearchSortMode);
  const [keyword, setKeyword] = useState('');
  const searchKeyword = keyword.trim();
  const debouncedSearchKeyword = useDebouncedValue(searchKeyword);
  const isSearching = searchKeyword.length > 0;
  const isSearchSettling = isSearching && searchKeyword !== debouncedSearchKeyword;
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const bannerQuery = useHomeBannerMoviesQuery();
  const nowPlayingQuery = useNowPlayingMoviesQuery();
  const searchQuery = useMovieSearchQuery(debouncedSearchKeyword);

  const rawDisplayMovies = useMemo(() => {
    const pages = isSearching ? searchQuery.data?.pages : nowPlayingQuery.data?.pages;

    return flattenVisibleMovies(pages);
  }, [isSearching, nowPlayingQuery.data?.pages, searchQuery.data?.pages]);

  const displayMovies = useMemo(
    () => (isSearching ? sortSearchMovies(rawDisplayMovies, searchSortMode) : rawDisplayMovies),
    [isSearching, rawDisplayMovies, searchSortMode]
  );

  const fetchNextPage = isSearching ? searchQuery.fetchNextPage : nowPlayingQuery.fetchNextPage;
  const hasNextPage = isSearching ? searchQuery.hasNextPage : nowPlayingQuery.hasNextPage;
  const refetchMovies = isSearching ? searchQuery.refetch : nowPlayingQuery.refetch;
  const isLoading = isSearchSettling || (isSearching ? searchQuery.isFetching : nowPlayingQuery.isFetching);
  const isFetchingNextPage = isSearching
    ? searchQuery.isFetchingNextPage
    : nowPlayingQuery.isFetchingNextPage;
  const hasError = !isSearchSettling && (isSearching ? searchQuery.isError : nowPlayingQuery.isError);
  const reachedStreamLimit = displayMovies.length >= MOVIE_STREAM_LIMIT;
  const canLoadMore =
    Boolean(hasNextPage) &&
    !isFetchingNextPage &&
    !reachedStreamLimit;
  const defaultCollection = collections.find((collection) => collection.id === DEFAULT_COLLECTION_ID);
  const defaultFavoriteMovieIds = useMemo(
    () => new Set(defaultCollection?.movieIds ?? []),
    [defaultCollection?.movieIds]
  );

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
    if (isSearching) {
      return;
    }

    if (
      displayMovies.length < MIN_HOME_ITEMS &&
      canLoadMore
    ) {
      void fetchNextPage();
    }
  }, [canLoadMore, displayMovies.length, fetchNextPage, isSearching]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !canLoadMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: '640px 0px'
      }
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [canLoadMore, fetchNextPage]);

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
        <img alt="MovieShelf" src="/assets/brand/movie-shelf-horizontal-white.png" />
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
          reachedStreamLimit={reachedStreamLimit}
          streamLimit={MOVIE_STREAM_LIMIT}
          onRefetch={() => void refetchMovies()}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>
    </section>
  );
}
