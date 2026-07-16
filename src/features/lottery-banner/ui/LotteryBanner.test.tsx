import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { MovieSummary } from '@entities/movie/model/types';

import { LotteryBanner } from './LotteryBanner';

const createMovie = (id: number, title: string): MovieSummary => ({
  backdropUrl: `https://image.tmdb.org/t/p/w1280/${id}.jpg`,
  genreIds: [],
  id,
  originalTitle: title,
  overview: `${title} overview`,
  posterUrl: `https://image.tmdb.org/t/p/w500/${id}.jpg`,
  releaseDate: '2026-01-01',
  releaseYear: 2026,
  title,
  voteAverage: 7.8,
  voteCount: 1000
});

function renderLotteryBanner() {
  return render(
    <MemoryRouter initialEntries={['/favorites']}>
      <Routes>
        <Route
          element={
            <LotteryBanner
              actionMode="readonly"
              movies={[createMovie(401, 'First Movie'), createMovie(402, 'Second Movie')]}
              sourceType="favorite"
              variant="compact"
            />
          }
          path="/favorites"
        />
        <Route element={<span>Detail Route</span>} path="/movies/:movieId" />
      </Routes>
    </MemoryRouter>
  );
}

describe('LotteryBanner', () => {
  it('selects poster cards without navigating to detail', async () => {
    const user = userEvent.setup();

    renderLotteryBanner();

    await user.click(screen.getAllByRole('button', { name: '定位到 Second Movie' })[0]);

    expect(screen.getByText('Second Movie')).toBeInTheDocument();
    expect(screen.queryByText('Detail Route')).not.toBeInTheDocument();
  });

  it('opens the active movie through the explicit detail action', async () => {
    const user = userEvent.setup();

    renderLotteryBanner();

    await user.click(screen.getByRole('button', { name: /打开详情/ }));

    expect(screen.getByText('Detail Route')).toBeInTheDocument();
  });
});
