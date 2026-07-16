import { PropsWithChildren, useEffect, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { HOME_BANNER_INITIAL_MOVIES } from '@entities/movie/model/home-banner-snapshot';
import type { MovieSearchResult } from '@entities/movie/model/types';

import { store } from '@store/index';

const BANNER_PREFETCH_DELAY = 5200;

function preloadBannerImages(movies: MovieSearchResult | undefined) {
  movies?.items.slice(0, 4).forEach((movie) => {
    const imageUrl = movie.backdropUrl ?? movie.posterUrl;

    if (!imageUrl) {
      return;
    }

    const image = new Image();

    image.decoding = 'async';
    image.src = imageUrl;
  });
}

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            retry: 1,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  useEffect(() => {
    let shouldPreloadImages = true;
    const prefetchTimer = window.setTimeout(() => {
      void import('@entities/movie/api/use-movie-search-query').then(
        ({ HOME_BANNER_MOVIES_QUERY_KEY, homeBannerMoviesQueryOptions }) => {
          void queryClient.prefetchQuery(homeBannerMoviesQueryOptions()).then(() => {
            if (!shouldPreloadImages) {
              return;
            }

            preloadBannerImages(queryClient.getQueryData<MovieSearchResult>(HOME_BANNER_MOVIES_QUERY_KEY));
          });
        }
      );
    }, BANNER_PREFETCH_DELAY);

    preloadBannerImages(HOME_BANNER_INITIAL_MOVIES);

    return () => {
      shouldPreloadImages = false;
      window.clearTimeout(prefetchTimer);
    };
  }, [queryClient]);

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
