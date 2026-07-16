import { Link } from 'react-router-dom';

import { MovieSummary } from '@entities/movie/model/types';

import styles from '../index.module.less';

type RelatedMovieRailProps = {
  recommendations: MovieSummary[];
};

export function RelatedMovieRail({ recommendations }: RelatedMovieRailProps) {
  return (
    <div className={styles.panel}>
      <h2>相关推荐</h2>
      {recommendations.length > 0 ? (
        <div className={styles.relatedRail}>
          {recommendations.map((item) => (
            <Link key={item.id} to={`/movies/${item.id}`}>
              {item.posterUrl ? <img alt={item.title} decoding="async" loading="lazy" src={item.posterUrl} /> : null}
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.muted}>暂无相关推荐。</p>
      )}
    </div>
  );
}
