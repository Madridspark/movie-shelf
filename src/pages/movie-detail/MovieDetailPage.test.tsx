import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { App } from '@app/App';

import { server } from '../../test/msw/server';

const tmdbBaseUrl = 'https://api.themoviedb.org/3';

function renderMovieDetailPage(movieId = '401') {
  window.history.pushState({}, '', `/movies/${movieId}`);

  return render(<App />);
}

describe('MovieDetailPage', () => {
  it('renders TMDB detail modules from the mocked API', async () => {
    renderMovieDetailPage();

    expect(await screen.findByRole('heading', { name: 'MSW Detail Movie' }, { timeout: 4000 })).toBeInTheDocument();
    expect(await screen.findByText((_, element) => element?.textContent === '导演：MSW Director')).toBeInTheDocument();
    expect(await screen.findByText('MSW Actor')).toBeInTheDocument();
    expect(await screen.findByText('MSW Trailer')).toBeInTheDocument();
    expect(await screen.findByText('MSW Reviewer')).toBeInTheDocument();
    expect(await screen.findByText('MSW Stream')).toBeInTheDocument();
  });

  it('keeps the page usable when optional detail submodules are malformed or empty', async () => {
    server.use(
      http.get(`${tmdbBaseUrl}/movie/:movieId`, () =>
        HttpResponse.json({
          backdrop_path: null,
          credits: {
            cast: { unexpected: true },
            crew: { unexpected: true }
          },
          genres: { unexpected: true },
          id: 402,
          original_language: '',
          overview: '',
          poster_path: null,
          release_date: '',
          reviews: {
            results: { unexpected: true }
          },
          runtime: null,
          status: '',
          title: 'Malformed Detail Movie',
          videos: {
            results: []
          },
          vote_average: 0,
          vote_count: 0,
          'watch/providers': {
            results: {}
          }
        })
      )
    );
    renderMovieDetailPage('402');

    expect(
      await screen.findByRole('heading', { name: 'Malformed Detail Movie' }, { timeout: 4000 })
    ).toBeInTheDocument();
    expect(await screen.findByText('暂无预告片。')).toBeInTheDocument();
    expect(await screen.findByText('暂无评论。')).toBeInTheDocument();
    expect(await screen.findByText('当前地区暂无观看平台信息。')).toBeInTheDocument();
    expect(await screen.findByText('导演：未知')).toBeInTheDocument();
  });
});
