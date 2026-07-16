import { ReactNode } from 'react';

import { MovieCardSkeleton } from '@entities/movie/ui/movie-card';

import styles from './index.module.less';

type MovieWaterfallGridProps = {
  children: ReactNode;
  isInitialLoading?: boolean;
  skeletonCount?: number;
};

export function MovieWaterfallGrid({
  children,
  isInitialLoading = false,
  skeletonCount = 12
}: MovieWaterfallGridProps) {
  return (
    <div className={styles.grid}>
      {children}
      {isInitialLoading
        ? Array.from({ length: skeletonCount }, (_, index) => <MovieCardSkeleton key={index} />)
        : null}
    </div>
  );
}
