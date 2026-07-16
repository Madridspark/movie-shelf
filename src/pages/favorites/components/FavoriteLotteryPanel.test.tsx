import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { MovieSummary } from '@entities/movie/model/types';
import { FavoriteMovieItem } from '@features/favorites/model/favorites-slice';

import { FavoriteLotteryPanel } from './FavoriteLotteryPanel';

const createMovie = (id: number, title: string): MovieSummary => ({
  backdropUrl: `https://image.tmdb.org/t/p/w1280/${id}.jpg`,
  genreIds: [],
  id,
  originalTitle: title,
  overview: '',
  posterUrl: `https://image.tmdb.org/t/p/w500/${id}.jpg`,
  releaseDate: '2026-01-01',
  releaseYear: 2026,
  title,
  voteAverage: 8,
  voteCount: 1000
});

const lotteryMovies: FavoriteMovieItem[] = [
  {
    addedAt: 1000,
    movie: createMovie(401, 'First Favorite')
  },
  {
    addedAt: 2000,
    movie: createMovie(402, 'Second Favorite')
  }
];

function renderPanel(onLotterySourceChange = vi.fn()) {
  return render(
    <MemoryRouter>
      <FavoriteLotteryPanel
        lotteryMovies={lotteryMovies}
        lotterySource="favorite"
        sourceOptions={[
          {
            label: '当前收藏夹',
            value: 'favorite'
          },
          {
            label: '全部收藏夹',
            value: 'allFavorites'
          }
        ]}
        onLotterySourceChange={onLotterySourceChange}
      />
    </MemoryRouter>
  );
}

describe('FavoriteLotteryPanel', () => {
  it('renders the compact lottery banner from favorite movies', () => {
    renderPanel();

    expect(screen.getByText('随机片单')).toBeInTheDocument();
    expect(screen.getByText('First Favorite')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '定位到 Second Favorite' })).not.toHaveLength(0);
  });

  it('changes the lottery source from the Radix dropdown', async () => {
    const user = userEvent.setup();
    const onLotterySourceChange = vi.fn();

    renderPanel(onLotterySourceChange);

    await user.click(screen.getByRole('button', { name: '随机片单来源' }));
    await user.click(await screen.findByRole('menuitem', { name: '全部收藏夹' }));

    expect(onLotterySourceChange).toHaveBeenCalledWith('allFavorites');
  });
});
