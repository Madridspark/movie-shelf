import { describe, expect, it } from 'vitest';

import { MovieSummary } from '@entities/movie/model/types';

import {
  buildLotteryVisualQueue,
  findVisualIndexByMovieId,
  getNextLotteryIndex,
  getNextSequentialIndex,
  getUniqueLotteryMovies
} from './lottery-candidates';

const createMovie = (id: number): MovieSummary => ({
  backdropUrl: `https://image.tmdb.org/t/p/w1280/${id}.jpg`,
  genreIds: [],
  id,
  originalTitle: `Movie ${id}`,
  overview: '',
  posterUrl: `https://image.tmdb.org/t/p/w500/${id}.jpg`,
  releaseDate: '2026-01-01',
  releaseYear: 2026,
  title: `Movie ${id}`,
  voteAverage: 7,
  voteCount: 100
});

describe('lottery candidates', () => {
  it('deduplicates movie candidates by id', () => {
    const movies = [createMovie(1), createMovie(2), createMovie(1)];

    expect(getUniqueLotteryMovies(movies).map((movie) => movie.id)).toEqual([1, 2]);
  });

  it('keeps one-item queues compact', () => {
    expect(buildLotteryVisualQueue([createMovie(1)]).map((item) => item.movie.id)).toEqual([1]);
  });

  it('fills small visual queues without changing the real candidate pool', () => {
    const queue = buildLotteryVisualQueue([createMovie(1), createMovie(2), createMovie(3)], 8);

    expect(queue).toHaveLength(8);
    expect(queue.map((item) => item.movie.id)).toEqual([1, 2, 3, 1, 2, 3, 1, 2]);
  });

  it('finds the visual slide for the active background movie', () => {
    const queue = buildLotteryVisualQueue([createMovie(1), createMovie(2), createMovie(3)], 8);

    expect(findVisualIndexByMovieId(queue, 3)).toBe(2);
    expect(findVisualIndexByMovieId(queue, 3, 6)).toBe(5);
  });

  it('picks a different random candidate when possible', () => {
    expect(getNextLotteryIndex(0, 4, () => 0)).toBe(1);
    expect(getNextLotteryIndex(0, 4, () => 0.99)).toBe(3);
    expect(getNextLotteryIndex(0, 1, () => 0.99)).toBe(0);
  });

  it('cycles sequential candidates from tail to head', () => {
    expect(getNextSequentialIndex(0, 4)).toBe(1);
    expect(getNextSequentialIndex(3, 4)).toBe(0);
    expect(getNextSequentialIndex(0, 1)).toBe(0);
  });
});
