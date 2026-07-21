import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '@app/providers/AppProviders';

import { server } from '../../../test/msw/server';
import { MovieSearchPanel } from './MovieSearchPanel';

const tmdbBaseUrl = 'https://api.themoviedb.org/3';

function renderMovieSearchPanel() {
  return render(
    <AppProviders>
      <MovieSearchPanel />
    </AppProviders>
  );
}

describe('MovieSearchPanel', () => {
  it('loads now playing movies on the home surface', async () => {
    renderMovieSearchPanel();

    expect(screen.queryByText('暂无候选电影')).not.toBeInTheDocument();
    expect(await screen.findByText('MSW Banner')).toBeInTheDocument();
    expect(await screen.findByText('MSW Now Playing')).toBeInTheDocument();
    expect(await screen.findByText('Drama')).toBeInTheDocument();
  });

  it('prefetches the home movie pool to 100 items without continuously requesting later pages', async () => {
    const requestedPages: number[] = [];

    server.use(
      http.get(`${tmdbBaseUrl}/movie/now_playing`, ({ request }) => {
        const page = Number(new URL(request.url).searchParams.get('page') ?? 1);

        requestedPages.push(page);

        return HttpResponse.json({
          page,
          results: Array.from({ length: 20 }, (_, index) => {
            const id = page * 1000 + index;

            return {
              backdrop_path: `/now-backdrop-${id}.jpg`,
              genre_ids: [18],
              id,
              original_title: `MSW Now Playing ${id}`,
              overview: 'A mocked now playing movie.',
              poster_path: `/now-poster-${id}.jpg`,
              release_date: '2026-07-01',
              title: `MSW Now Playing ${id}`,
              vote_average: 8.1,
              vote_count: 120
            };
          }),
          total_pages: 10,
          total_results: 200
        });
      })
    );
    renderMovieSearchPanel();

    expect(await screen.findByText('MSW Now Playing 1000')).toBeInTheDocument();

    await waitFor(() => expect(requestedPages).toContain(5), { timeout: 4000 });

    await new Promise((resolve) => {
      window.setTimeout(resolve, 900);
    });

    expect(requestedPages).toEqual([1, 2, 3, 4, 5]);
  });

  it('switches to search state and renders search results', async () => {
    const user = userEvent.setup();

    renderMovieSearchPanel();

    await user.type(screen.getByLabelText('搜索电影'), 'batman');

    expect(await screen.findByText('搜索结果')).toBeInTheDocument();
    expect(await screen.findByText('MSW Search Result')).toBeInTheDocument();
    expect(screen.queryByText('本周热映')).not.toBeInTheDocument();
  });

  it('keeps the search box usable when search returns an empty result', async () => {
    server.use(
      http.get(`${tmdbBaseUrl}/search/movie`, () =>
        HttpResponse.json({
          page: 1,
          results: [],
          total_pages: 1,
          total_results: 0
        })
      )
    );
    renderMovieSearchPanel();

    fireEvent.change(screen.getByLabelText('搜索电影'), { target: { value: 'nothing' } });

    expect(await screen.findByText('没有找到相关电影')).toBeInTheDocument();
    expect(screen.getByLabelText('搜索电影')).toHaveValue('nothing');
  });

  it('shows a retryable network dialog without clearing the search keyword', async () => {
    server.use(http.get(`${tmdbBaseUrl}/search/movie`, () => HttpResponse.json({}, { status: 500 })));
    renderMovieSearchPanel();

    fireEvent.change(screen.getByLabelText('搜索电影'), { target: { value: 'broken' } });

    expect(await screen.findByRole('dialog', { name: '网络连接断开' }, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('请检查网络连接后重试。')).toBeInTheDocument();
    expect(screen.getByLabelText('搜索电影')).toHaveValue('broken');
  });
});
