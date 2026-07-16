import { describe, expect, it } from 'vitest';

import { parseTmdbMovieDetail, parseTmdbSearchResponse } from './tmdb-schemas';

describe('tmdb schema parsers', () => {
  it('drops invalid search items and keeps the page usable', () => {
    const parsedResponse = parseTmdbSearchResponse({
      page: '2',
      results: [
        { id: 1, poster_path: '/poster.jpg', title: 'Valid movie' },
        { poster_path: '/missing-id.jpg', title: 'Invalid movie' }
      ],
      total_pages: '5',
      total_results: '40'
    });

    expect(parsedResponse.page).toBe(2);
    expect(parsedResponse.results).toHaveLength(1);
    expect(parsedResponse.results[0].title).toBe('Valid movie');
  });

  it('normalizes malformed detail submodules to empty arrays', () => {
    const parsedMovie = parseTmdbMovieDetail({
      credits: {
        cast: { unexpected: true },
        crew: [{ id: 10, job: 'Director', name: 'A Director' }]
      },
      genres: { unexpected: true },
      id: 123,
      reviews: {
        results: { unexpected: true }
      },
      title: 'Detail movie',
      videos: {
        results: [{ id: 'trailer-1', key: 'abc', site: 'YouTube', type: 'Trailer' }]
      }
    });

    expect(parsedMovie.credits?.cast).toEqual([]);
    expect(parsedMovie.credits?.crew?.[0].name).toBe('A Director');
    expect(parsedMovie.genres).toEqual([]);
    expect(parsedMovie.reviews?.results).toEqual([]);
    expect(parsedMovie.videos?.results).toHaveLength(1);
  });
});
