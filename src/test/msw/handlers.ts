import { http, HttpResponse } from 'msw';

const tmdbBaseUrl = 'https://api.themoviedb.org/3';

const configurationResponse = {
  images: {
    backdrop_sizes: ['w780', 'w1280'],
    logo_sizes: ['w154', 'w185'],
    poster_sizes: ['w342', 'w500'],
    profile_sizes: ['w154', 'w185'],
    secure_base_url: 'https://image.tmdb.org/t/p/'
  }
};

const nowPlayingResponse = {
  page: 1,
  results: [
    {
      backdrop_path: '/now-backdrop.jpg',
      genre_ids: [18],
      id: 101,
      original_title: 'MSW Now Playing',
      overview: 'A mocked now playing movie.',
      poster_path: '/now-poster.jpg',
      release_date: '2026-07-01',
      title: 'MSW Now Playing',
      vote_average: 8.1,
      vote_count: 120
    }
  ],
  total_pages: 1,
  total_results: 1
};

const bannerResponse = {
  page: 1,
  results: [
    {
      backdrop_path: '/banner-backdrop.jpg',
      genre_ids: [12],
      id: 201,
      original_title: 'MSW Banner',
      overview: 'A mocked banner movie.',
      poster_path: '/banner-poster.jpg',
      release_date: '2026-06-20',
      title: 'MSW Banner',
      vote_average: 7.6,
      vote_count: 98
    }
  ],
  total_pages: 1,
  total_results: 1
};

const searchResponse = {
  page: 1,
  results: [
    {
      backdrop_path: '/search-backdrop.jpg',
      genre_ids: [53],
      id: 301,
      original_title: 'MSW Search Result',
      overview: 'A mocked search result.',
      poster_path: '/search-poster.jpg',
      release_date: '2025-12-24',
      title: 'MSW Search Result',
      vote_average: 8.8,
      vote_count: 240
    }
  ],
  total_pages: 1,
  total_results: 1
};

export const tmdbHandlers = [
  http.get(`${tmdbBaseUrl}/configuration`, () => HttpResponse.json(configurationResponse)),
  http.get(`${tmdbBaseUrl}/movie/now_playing`, () => HttpResponse.json(nowPlayingResponse)),
  http.get(`${tmdbBaseUrl}/trending/movie/week`, () => HttpResponse.json(bannerResponse)),
  http.get(`${tmdbBaseUrl}/search/movie`, () => HttpResponse.json(searchResponse))
];
