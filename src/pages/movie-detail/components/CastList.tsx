import { Person } from '@entities/movie/model/types';

import styles from '../index.module.less';

type CastListProps = {
  cast: Person[];
  directors: Person[];
};

export function CastList({ cast, directors }: CastListProps) {
  return (
    <section className={styles.panel}>
      <h2>导演与演员</h2>
      <p className={styles.directors}>
        导演：{directors.map((person) => person.name).join(' / ') || '未知'}
      </p>
      <div className={styles.castList}>
        {cast.map((person) => (
          <div className={styles.personCard} key={person.id}>
            <div>
              {person.profileUrl ? <img alt={person.name} decoding="async" loading="lazy" src={person.profileUrl} /> : null}
            </div>
            <strong>{person.name}</strong>
            <span>{person.character}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
