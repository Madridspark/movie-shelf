import { useEffect, useMemo, useState } from 'react';

import { MovieSummary } from '@entities/movie/model/types';

import styles from './index.module.less';

type LotterySourceType = 'homeBanner' | 'homeNowPlaying' | 'allFavorites' | 'favorite';
type LotteryBannerActionMode = 'addToFavorite' | 'removeFromFavorite' | 'readonly';

type LotteryBannerProps = {
  actionMode: LotteryBannerActionMode;
  movies: MovieSummary[];
  sourceType: LotterySourceType;
  variant?: 'compact' | 'hero';
};

function getBannerImage(movie: MovieSummary | undefined) {
  return movie?.backdropUrl ?? movie?.posterUrl ?? '';
}

export function LotteryBanner({ actionMode, movies, sourceType, variant = 'hero' }: LotteryBannerProps) {
  const candidates = useMemo(() => movies.filter((movie) => movie.backdropUrl || movie.posterUrl), [movies]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= candidates.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, candidates.length]);

  useEffect(() => {
    if (candidates.length < 2) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % candidates.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [candidates.length]);

  const activeMovie = candidates[activeIndex];
  const imageUrl = getBannerImage(activeMovie);
  const displayCandidates = candidates.length > 0 ? candidates : [];

  const handleChangeMovie = () => {
    if (candidates.length < 2) {
      return;
    }

    setActiveIndex((currentIndex) => (currentIndex + 1) % candidates.length);
  };

  return (
    <section
      className={[styles.banner, variant === 'compact' ? styles.compact : ''].filter(Boolean).join(' ')}
      data-action-mode={actionMode}
      data-source-type={sourceType}
      style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
    >
      <div className={styles.overlay} />
      {variant === 'compact' ? (
        <div className={styles.resultPanel}>
          <span>{sourceType === 'allFavorites' ? '全部收藏夹' : '当前收藏夹'}</span>
          <strong>{activeMovie?.title ?? '暂无候选电影'}</strong>
          <p>
            {activeMovie
              ? `${activeMovie.releaseYear ?? '未知年份'} / ${activeMovie.voteAverage.toFixed(1)}`
              : '先添加电影，再随机挑一部。'}
          </p>
          <button disabled={candidates.length < 2} type="button" onClick={handleChangeMovie}>
            换一换
          </button>
        </div>
      ) : null}
      <div className={styles.track} aria-hidden="true">
        {displayCandidates.slice(0, 8).map((movie) => (
          <div className={styles.poster} key={movie.id}>
            {movie.posterUrl ? <img alt="" decoding="async" loading="lazy" src={movie.posterUrl} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
