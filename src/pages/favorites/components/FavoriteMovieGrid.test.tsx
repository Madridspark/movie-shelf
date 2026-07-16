import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { MovieSummary } from '@entities/movie/model/types';
import { FavoriteMovieItem } from '@features/favorites/model/favorites-slice';

import { FavoriteMovieGrid } from './FavoriteMovieGrid';

const movie: MovieSummary = {
  backdropUrl: null,
  genreIds: [],
  id: 401,
  originalTitle: 'Favorite Movie',
  overview: '',
  posterUrl: null,
  releaseDate: '2026-01-01',
  releaseYear: 2026,
  title: 'Favorite Movie',
  voteAverage: 8.2,
  voteCount: 1200
};

const favoriteItem: FavoriteMovieItem = {
  addedAt: 1000,
  movie
};

function renderGrid(props: Partial<Parameters<typeof FavoriteMovieGrid>[0]> = {}) {
  const defaultProps: Parameters<typeof FavoriteMovieGrid>[0] = {
    activeMovieSet: new Set(),
    allMovies: [],
    movies: [],
    onRemoveMovie: vi.fn()
  };

  return render(
    <MemoryRouter>
      <FavoriteMovieGrid {...defaultProps} {...props} />
    </MemoryRouter>
  );
}

describe('FavoriteMovieGrid', () => {
  it('renders the empty favorite state with a discovery link', () => {
    renderGrid();

    expect(screen.getByText('还没有收藏电影')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '去发现电影' })).toHaveAttribute('href', '/');
  });

  it('renders collection empty state when other favorites exist', () => {
    renderGrid({
      allMovies: [favoriteItem]
    });

    expect(screen.getByText('当前收藏夹为空')).toBeInTheDocument();
  });

  it('removes a movie from the current collection', async () => {
    const user = userEvent.setup();
    const onRemoveMovie = vi.fn();

    renderGrid({
      activeMovieSet: new Set([movie.id]),
      allMovies: [favoriteItem],
      movies: [favoriteItem],
      onRemoveMovie
    });

    await user.click(screen.getByRole('button', { name: '移除' }));

    expect(onRemoveMovie).toHaveBeenCalledWith(movie.id);
  });
});
