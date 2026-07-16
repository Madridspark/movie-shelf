import styles from '../index.module.less';

export function FavoritesPageSkeleton() {
  return (
    <section className={styles.page} aria-label="正在加载收藏夹">
      <aside className={styles.sidebar}>
        <div className={styles.favoriteSkeletonLogo} />
        <div className={styles.favoriteSkeletonTitle} />
        <div className={styles.favoriteSkeletonCollection} />
        <div className={styles.favoriteSkeletonCollection} />
        <div className={styles.favoriteSkeletonCollection} />
        <div className={styles.favoriteSkeletonCreate} />
      </aside>

      <main className={styles.main}>
        <div className={styles.favoriteSkeletonHeader} />
        <div className={styles.favoriteSkeletonLottery} />
        <div className={styles.favoriteSkeletonGrid}>
          {Array.from({ length: 10 }).map((_, index) => (
            <div className={styles.favoriteSkeletonPoster} key={index} />
          ))}
        </div>
      </main>
    </section>
  );
}
