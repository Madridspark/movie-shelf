import { ReactNode } from 'react';

import { Play, Star } from 'lucide-react';

import { MovieDetail, Trailer } from '@entities/movie/model/types';

import styles from '../index.module.less';

type MovieHeroProps = {
  favoriteMenu: ReactNode;
  movie: MovieDetail;
  primaryTrailer?: Trailer;
};

export function MovieHero({ favoriteMenu, movie, primaryTrailer }: MovieHeroProps) {
  return (
    <section className={styles.hero} style={movie.backdropUrl ? { backgroundImage: `url(${movie.backdropUrl})` } : undefined}>
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <div className={styles.poster}>
          {movie.posterUrl ? <img alt={movie.title} decoding="async" loading="eager" src={movie.posterUrl} /> : null}
        </div>

        <div className={styles.heroInfo}>
          <span className={styles.eyebrow}>{movie.releaseYear ?? 'MovieShelf'}</span>
          <h1>{movie.title}</h1>
          {movie.originalTitle && movie.originalTitle !== movie.title ? (
            <span className={styles.originalTitle}>{movie.originalTitle}</span>
          ) : null}
          <p>{movie.overview || '暂无简介。'}</p>
          <div className={styles.scoreLine}>
            <span>
              <Star size={18} />
              {movie.voteAverage.toFixed(1)}
            </span>
            <span>{movie.voteCount.toLocaleString()} votes</span>
          </div>

          <div className={styles.heroButtons}>
            {primaryTrailer ? (
              <a href={primaryTrailer.url} rel="noreferrer" target="_blank">
                <Play size={18} />
                预告片
              </a>
            ) : null}
            {favoriteMenu}
          </div>
        </div>
      </div>
    </section>
  );
}
