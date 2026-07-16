import { ExternalLink, Play } from 'lucide-react';

import { Trailer } from '@entities/movie/model/types';

import styles from '../index.module.less';

type TrailerPanelProps = {
  trailer?: Trailer;
};

export function TrailerPanel({ trailer }: TrailerPanelProps) {
  return (
    <div className={styles.panel}>
      <h2>预告片</h2>
      {trailer ? (
        <a className={styles.trailerLink} href={trailer.url} rel="noreferrer" target="_blank">
          <Play size={20} />
          <span>{trailer.name}</span>
          <ExternalLink size={16} />
        </a>
      ) : (
        <p className={styles.muted}>暂无预告片。</p>
      )}
    </div>
  );
}
