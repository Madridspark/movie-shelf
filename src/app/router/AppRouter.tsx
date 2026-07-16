import { Suspense, lazy } from 'react';

import { Route, Routes } from 'react-router-dom';

import styles from './index.module.less';

const HomePage = lazy(() => import('@pages/home').then((module) => ({ default: module.HomePage })));
const MovieDetailPage = lazy(() =>
  import('@pages/movie-detail').then((module) => ({ default: module.MovieDetailPage }))
);
const FavoritesPage = lazy(() => import('@pages/favorites').then((module) => ({ default: module.FavoritesPage })));

export function AppRouter() {
  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Suspense fallback={<div className={styles.routeFallback}>正在加载...</div>}>
          <Routes>
            <Route element={<HomePage />} path="/" />
            <Route element={<MovieDetailPage />} path="/movies/:movieId" />
            <Route element={<FavoritesPage />} path="/favorites" />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
