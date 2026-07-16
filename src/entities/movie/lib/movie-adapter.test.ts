import { describe, expect, it } from 'vitest';

import { TmdbImageConfig } from '@shared/api/config/tmdb-image-config';

import { adaptTmdbMovieDetail, adaptTmdbMovieSummary } from './movie-adapter';

const imageConfig: TmdbImageConfig = {
  backdropBaseUrl: 'https://image.example/backdrop',
  logoBaseUrl: 'https://image.example/logo',
  posterBaseUrl: 'https://image.example/poster',
  profileBaseUrl: 'https://image.example/profile'
};

describe('movie adapter', () => {
  it('builds image urls from TMDB image configuration', () => {
    const movie = adaptTmdbMovieSummary(
      {
        backdrop_path: '/backdrop.jpg',
        genre_ids: [],
        id: 1,
        poster_path: '/poster.jpg',
        release_date: '2026-07-16',
        title: 'Configured Movie'
      },
      imageConfig
    );

    expect(movie.backdropUrl).toBe('https://image.example/backdrop/backdrop.jpg');
    expect(movie.posterUrl).toBe('https://image.example/poster/poster.jpg');
  });

  it('maps summary genre ids to genre names when a genre map is available', () => {
    const movie = adaptTmdbMovieSummary(
      {
        genre_ids: [18, 53, 999],
        id: 1,
        title: 'Genre Movie'
      },
      imageConfig,
      {
        18: { id: 18, name: 'Drama' },
        53: { id: 53, name: 'Thriller' }
      }
    );

    expect(movie.genres).toEqual([
      { id: 18, name: 'Drama' },
      { id: 53, name: 'Thriller' }
    ]);
  });

  it('keeps optional detail modules safe when image paths are missing', () => {
    const movie = adaptTmdbMovieDetail(
      {
        credits: {
          cast: [{ id: 2, name: 'Actor' }],
          crew: [{ id: 3, job: 'Director', name: 'Director' }]
        },
        genre_ids: [],
        id: 1,
        title: 'Detail Movie'
      },
      imageConfig
    );

    expect(movie.cast[0].profileUrl).toBeNull();
    expect(movie.directors[0].name).toBe('Director');
    expect(movie.watchProviders).toBeNull();
  });
});
