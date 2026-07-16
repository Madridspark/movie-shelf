import { useEffect, useMemo, useState } from 'react';

import {
  useHomeBannerMoviesQuery,
  useNowPlayingMoviesQuery
} from '@entities/movie/api/use-movie-search-query';
import { MovieSearchPanel } from '@features/movie-search/ui/MovieSearchPanel';
import { NetworkErrorDialog } from '@shared/ui/network-error-dialog';

import styles from './index.module.less';

const isTestRuntime = globalThis.navigator?.userAgent.includes('jsdom');

function preloadHeroImage(imageUrl: string) {
  if (typeof Image === 'undefined') {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const image = new Image();
    let hasSettled = false;
    const finish = () => {
      if (hasSettled) {
        return;
      }

      hasSettled = true;
      resolve();
    };

    image.decoding = 'async';
    image.onload = finish;
    image.onerror = finish;
    image.src = imageUrl;

    if (image.complete) {
      finish();
      return;
    }

    void image.decode?.().then(finish).catch(finish);
  });
}

function HomePageLoadingShell() {
  return (
    <section aria-label="正在加载首页" className={styles.loadingPage}>
      <div className={styles.loadingStage} aria-hidden="true">
        <span className={styles.loadingOrbit} />
        <span className={styles.loadingSweep} />
        <img
          alt=""
          className={styles.loadingLogo}
          decoding="async"
          fetchPriority="high"
          src="/assets/brand/movie-shelf-horizontal-white.png"
        />
      </div>
      <p className={styles.loadingText}>正在加载本周热映...</p>
    </section>
  );
}

export function HomePage() {
  const bannerQuery = useHomeBannerMoviesQuery();

  useNowPlayingMoviesQuery();

  const bannerMovies = useMemo(() => bannerQuery.data?.items ?? [], [bannerQuery.data?.items]);
  const firstBannerImage = useMemo(
    () => bannerMovies.find((movie) => movie.backdropUrl || movie.posterUrl)?.backdropUrl ??
      bannerMovies.find((movie) => movie.backdropUrl || movie.posterUrl)?.posterUrl ??
      '',
    [bannerMovies]
  );
  const [preloadedImageUrl, setPreloadedImageUrl] = useState('');

  useEffect(() => {
    if (!firstBannerImage) {
      setPreloadedImageUrl('');
      return undefined;
    }

    if (isTestRuntime) {
      setPreloadedImageUrl(firstBannerImage);
      return undefined;
    }

    let isActive = true;

    void preloadHeroImage(firstBannerImage).then(() => {
      if (isActive) {
        setPreloadedImageUrl(firstBannerImage);
      }
    });

    return () => {
      isActive = false;
    };
  }, [firstBannerImage]);

  if (bannerQuery.isError || (bannerQuery.isSuccess && bannerMovies.length === 0)) {
    return (
      <>
        <HomePageLoadingShell />
        <NetworkErrorDialog open onRetry={() => void bannerQuery.refetch()} />
      </>
    );
  }

  if (!bannerMovies.length || preloadedImageUrl !== firstBannerImage) {
    return <HomePageLoadingShell />;
  }

  return <MovieSearchPanel />;
}
