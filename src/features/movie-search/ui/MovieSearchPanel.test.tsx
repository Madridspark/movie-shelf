import { fireEvent, render, screen } from '@testing-library/react';
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

    expect(screen.getAllByText('全面启动').length).toBeGreaterThan(0);
    expect(screen.queryByText('暂无候选电影')).not.toBeInTheDocument();
    expect(await screen.findByText('MSW Now Playing')).toBeInTheDocument();
    expect(await screen.findByText('Drama')).toBeInTheDocument();
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
