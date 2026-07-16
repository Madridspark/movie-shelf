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

const genreListResponse = {
  genres: [
    { id: 12, name: 'Adventure' },
    { id: 18, name: 'Drama' },
    { id: 53, name: 'Thriller' }
  ]
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

const detailResponse = {
  backdrop_path: '/detail-backdrop.jpg',
  credits: {
    cast: [
      {
        character: 'Pilot',
        id: 11,
        name: 'MSW Actor',
        profile_path: '/actor.jpg'
      }
    ],
    crew: [
      {
        id: 12,
        job: 'Director',
        name: 'MSW Director',
        profile_path: null
      }
    ]
  },
  genres: [{ id: 18, name: 'Drama' }],
  id: 401,
  original_language: 'en',
  original_title: 'MSW Detail Movie',
  overview: 'A mocked detail movie.',
  poster_path: '/detail-poster.jpg',
  recommendations: {
    page: 1,
    results: [],
    total_pages: 1,
    total_results: 0
  },
  release_date: '2026-05-01',
  reviews: {
    results: [
      {
        author: 'MSW Reviewer',
        author_details: { rating: 8 },
        content: 'A mocked review.',
        created_at: '2026-07-16T00:00:00.000Z',
        id: 'review-1'
      }
    ]
  },
  runtime: 120,
  status: 'Released',
  title: 'MSW Detail Movie',
  videos: {
    results: [
      {
        id: 'video-1',
        key: 'youtube-key',
        name: 'MSW Trailer',
        site: 'YouTube',
        type: 'Trailer'
      }
    ]
  },
  vote_average: 8.4,
  vote_count: 320,
  'watch/providers': {
    results: {
      US: {
        flatrate: [
          {
            logo_path: '/provider.jpg',
            provider_id: 1,
            provider_name: 'MSW Stream'
          }
        ],
        link: 'https://example.com/watch'
      }
    }
  }
};

export const tmdbHandlers = [
  http.get(`${tmdbBaseUrl}/configuration`, () => HttpResponse.json(configurationResponse)),
  http.get(`${tmdbBaseUrl}/genre/movie/list`, () => HttpResponse.json(genreListResponse)),
  http.get(`${tmdbBaseUrl}/movie/now_playing`, () => HttpResponse.json(nowPlayingResponse)),
  http.get(`${tmdbBaseUrl}/trending/movie/week`, () => HttpResponse.json(bannerResponse)),
  http.get(`${tmdbBaseUrl}/movie/:movieId`, () => HttpResponse.json(detailResponse)),
  http.get(`${tmdbBaseUrl}/search/movie`, () => HttpResponse.json(searchResponse))
];
