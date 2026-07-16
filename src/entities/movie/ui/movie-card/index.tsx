import { MouseEvent, ReactNode, useState } from 'react';

import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

import { MovieSummary } from '@entities/movie/model/types';

import styles from './index.module.less';

type MovieCardProps = {
  action?: ReactNode;
  isFavorited?: boolean;
  movie: MovieSummary;
  showOverview?: boolean;
  onToggleFavorite?: (movie: MovieSummary) => void;
};

export function MovieCard({
  action,
  isFavorited = false,
  movie,
  onToggleFavorite,
  showOverview = false
}: MovieCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const hasPoster = Boolean(movie.posterUrl) && !hasImageError;

  const handleToggleFavorite = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onToggleFavorite?.(movie);
  };

  return (
    <article className={styles.card}>
      <Link className={styles.link} to={`/movies/${movie.id}`}>
        <div className={styles.poster}>
          {hasPoster ? (
            <img
              alt={movie.title}
              decoding="async"
              loading="lazy"
              src={movie.posterUrl ?? undefined}
              onError={() => setHasImageError(true)}
            />
          ) : (
            <div className={styles.posterPlaceholder}>
              <span>{movie.title}</span>
            </div>
          )}
        </div>
        <div className={styles.meta}>
          <strong>{movie.title}</strong>
          <span>
            {movie.releaseYear ?? '未知年份'} / {movie.voteAverage.toFixed(1)}
          </span>
          {showOverview ? <p>{movie.overview || '暂无简介。'}</p> : null}
        </div>
      </Link>
      {onToggleFavorite ? (
        <button
          aria-label={isFavorited ? '从默认收藏夹移除' : '加入默认收藏夹'}
          className={isFavorited ? styles.favoriteActive : styles.favoriteButton}
          type="button"
          onClick={handleToggleFavorite}
        >
          <Heart fill={isFavorited ? 'currentColor' : 'none'} size={17} />
        </button>
      ) : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </article>
  );
}

export function MovieCardSkeleton() {
  return (
    <div className={styles.skeleton}>
      <div />
    </div>
  );
}
