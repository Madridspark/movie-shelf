import styles from '../index.module.less';

export function MovieDetailSkeleton() {
  return (
    <article className={styles.page} aria-label="正在加载电影详情">
      <section className={styles.detailSkeletonHero}>
        <div className={styles.detailSkeletonPoster} />
        <div className={styles.detailSkeletonInfo}>
          <span />
          <strong />
          <p />
          <p />
          <div>
            <i />
            <i />
            <i />
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.infoGrid}>
          <div className={styles.skeletonPanel} />
          <div className={styles.skeletonPanel} />
          <div className={styles.skeletonPanel} />
        </section>
        <section className={styles.skeletonWidePanel} />
        <section className={styles.bottomGrid}>
          <div className={styles.skeletonPanel} />
          <div className={styles.skeletonPanel} />
        </section>
      </div>
    </article>
  );
}
