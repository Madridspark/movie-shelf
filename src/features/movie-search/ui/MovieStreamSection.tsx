import { MovieSummary } from '@entities/movie/model/types';
import { MovieCard } from '@entities/movie/ui/movie-card';
import { MovieWaterfallGrid } from '@entities/movie/ui/movie-waterfall-grid';
import { NetworkErrorDialog } from '@shared/ui/network-error-dialog';
import { StateResult } from '@shared/ui/state-result';

import styles from './index.module.less';

type MovieStreamSectionProps = {
  canLoadMore: boolean;
  defaultFavoriteMovieIds: Set<number>;
  hasError: boolean;
  isFetchingNextPage: boolean;
  isInitialLoading: boolean;
  isLoading: boolean;
  isSearching: boolean;
  loadMoreRef: (element: HTMLDivElement | null) => void;
  movies: MovieSummary[];
  priorityImageCount?: number;
  reachedStreamLimit: boolean;
  streamLimit?: number;
  onRefetch: () => void;
  onToggleFavorite: (movie: MovieSummary) => void;
};

export function MovieStreamSection({
  canLoadMore,
  defaultFavoriteMovieIds,
  hasError,
  isFetchingNextPage,
  isInitialLoading,
  isLoading,
  isSearching,
  loadMoreRef,
  movies,
  onRefetch,
  onToggleFavorite,
  priorityImageCount = 0,
  reachedStreamLimit,
  streamLimit
}: MovieStreamSectionProps) {
  return (
    <>
      <div className={styles.gridHeader}>
        <span>{isSearching ? '搜索结果' : '最新上映'}</span>
        <span>
          {movies.length > 0
            ? `${movies.length}${streamLimit && movies.length >= streamLimit ? ' / 已达上限' : ' 部'}`
            : ''}
        </span>
      </div>

      <NetworkErrorDialog open={hasError} onRetry={onRefetch} />

      <MovieWaterfallGrid isInitialLoading={isInitialLoading}>
        {movies.map((movie, index) => (
          <MovieCard
            isFavorited={defaultFavoriteMovieIds.has(movie.id)}
            key={movie.id}
            movie={movie}
            priority={index < priorityImageCount}
            showOverview={isSearching}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </MovieWaterfallGrid>

      {!hasError && !isLoading && movies.length === 0 ? (
        <StateResult
          description={isSearching ? '换个关键词再试试。' : '稍后刷新看看新的片单。'}
          title={isSearching ? '没有找到相关电影' : '暂无最新上映电影'}
        />
      ) : null}

      <div className={styles.loadMore} ref={loadMoreRef}>
        {isFetchingNextPage ? '正在加载更多...' : null}
        {!isFetchingNextPage && reachedStreamLimit ? '已达到本页加载上限' : null}
        {!isFetchingNextPage && !reachedStreamLimit && !canLoadMore && movies.length > 0 ? '已经到底了' : null}
      </div>
    </>
  );
}
