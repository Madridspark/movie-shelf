import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

import clsx from 'clsx';
import { Heart, RefreshCw, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  useHomeBannerMoviesQuery,
  useMovieSearchQuery,
  useNowPlayingMoviesQuery
} from '@entities/movie/api/use-movie-search-query';
import { MovieSummary } from '@entities/movie/model/types';
import { MovieCard } from '@entities/movie/ui/movie-card';
import { MovieWaterfallGrid } from '@entities/movie/ui/movie-waterfall-grid';
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
import { Button } from '@shared/ui/button';
import { DropdownSelect, DropdownSelectOption } from '@shared/ui/dropdown-select';
import { StateResult } from '@shared/ui/state-result';
import { useAppDispatch, useAppSelector } from '@store/hooks';

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

  const handleKeywordChange = (event: ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  };

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
        <div className={isSearching ? styles.searchToolbar : undefined}>
          <label className={styles.searchBar}>
            <Search size={22} />
            <input
              aria-label="搜索电影"
              onChange={handleKeywordChange}
              placeholder="搜索电影、导演、演员"
              type="search"
              value={keyword}
            />
          </label>

          {isSearching ? (
            <div className={styles.toolbarActions}>
              <DropdownSelect
                ariaLabel="搜索结果排序"
                options={SEARCH_SORT_OPTIONS}
                value={searchSortMode}
                onValueChange={handleSortModeChange}
              />
              <Link to="/favorites">
                <Heart size={18} />
                收藏夹
              </Link>
            </div>
          ) : null}
        </div>

        <div className={styles.gridHeader}>
          <span>{isSearching ? '搜索结果' : '最新上映'}</span>
          <span>
            {displayMovies.length > 0
              ? `${displayMovies.length}${displayMovies.length >= MOVIE_STREAM_LIMIT ? ' / 已达上限' : ' 部'}`
              : ''}
          </span>
        </div>

        {hasError ? (
          <StateResult
            action={
              <Button icon={<RefreshCw size={16} />} type="button" onClick={() => void refetchMovies()}>
                重试
              </Button>
            }
            description="请确认 TMDB Token 或稍后重试。"
            title="暂时无法加载电影数据"
            variant="error"
          />
        ) : null}

        <MovieWaterfallGrid isInitialLoading={isLoading && displayMovies.length === 0}>
          {displayMovies.map((movie) => (
            <MovieCard
              isFavorited={defaultFavoriteMovieIds.has(movie.id)}
              key={movie.id}
              movie={movie}
              showOverview={isSearching}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </MovieWaterfallGrid>

        {!hasError && !isLoading && displayMovies.length === 0 ? (
          <StateResult
            description={isSearching ? '换个关键词再试试。' : '稍后刷新看看新的片单。'}
            title={isSearching ? '没有找到相关电影' : '暂无最新上映电影'}
          />
        ) : null}

        <div className={styles.loadMore} ref={loadMoreRef}>
          {isFetchingNextPage ? '正在加载更多...' : null}
          {!isFetchingNextPage && reachedStreamLimit ? '已达到本页加载上限' : null}
          {!isFetchingNextPage && !reachedStreamLimit && !canLoadMore && displayMovies.length > 0
            ? '已经到底了'
            : null}
        </div>
      </div>
    </section>
  );
}
