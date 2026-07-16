import { MovieDetail } from '@entities/movie/model/types';

import styles from '../index.module.less';

function formatRuntime(runtime: number | null) {
  if (!runtime) {
    return '未知时长';
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  return `${hours}h ${minutes}m`;
}

type MovieMetaPanelProps = {
  movie: MovieDetail;
};

export function MovieMetaPanel({ movie }: MovieMetaPanelProps) {
  return (
    <div className={styles.panel}>
      <h2>元信息</h2>
      <dl>
        <div>
          <dt>上映日期</dt>
          <dd>{movie.releaseDate || '未知'}</dd>
        </div>
        <div>
          <dt>时长</dt>
          <dd>{formatRuntime(movie.runtime)}</dd>
        </div>
        <div>
          <dt>类型</dt>
          <dd>{movie.genres.map((genre) => genre.name).join(' / ') || '未知'}</dd>
        </div>
        <div>
          <dt>语言 / 状态</dt>
          <dd>
            {movie.language || '未知'} / {movie.status || '未知'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
