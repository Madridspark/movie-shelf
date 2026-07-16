import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '@app/providers/AppProviders';

import { MovieSearchPanel } from './MovieSearchPanel';

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

    expect(await screen.findByText('MSW Now Playing')).toBeInTheDocument();
  });

  it('switches to search state and renders search results', async () => {
    const user = userEvent.setup();

    renderMovieSearchPanel();

    await user.type(screen.getByLabelText('搜索电影'), 'batman');

    expect(await screen.findByText('搜索结果')).toBeInTheDocument();
    expect(await screen.findByText('MSW Search Result')).toBeInTheDocument();
  });
});
