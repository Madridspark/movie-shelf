export type TmdbMovieSummary = {
  backdrop_path?: string | null;
  genre_ids?: number[];
  id: number;
  name?: string;
  original_title?: string;
  overview?: string;
  first_air_date?: string;
  poster_path?: string | null;
  release_date?: string;
  title?: string;
  vote_average?: number;
  vote_count?: number;
};

export type TmdbSearchResponse = {
  page: number;
  results: TmdbMovieSummary[];
  total_pages: number;
  total_results: number;
};

export type TmdbGenre = {
  id: number;
  name?: string;
};

export type TmdbGenreListResponse = {
  genres: TmdbGenre[];
};

export type TmdbCastMember = {
  id: number;
  name?: string;
  character?: string;
  profile_path?: string | null;
};

export type TmdbCrewMember = {
  id: number;
  job?: string;
  name?: string;
  profile_path?: string | null;
};

export type TmdbVideo = {
  id: string;
  key?: string;
  name?: string;
  site?: string;
  type?: string;
};

export type TmdbReview = {
  author?: string;
  author_details?: {
    rating?: number | null;
  };
  content?: string;
  created_at?: string;
  id: string;
};

export type TmdbWatchProvider = {
  logo_path?: string | null;
  provider_id: number;
  provider_name?: string;
};

export type TmdbWatchProviderRegion = {
  buy?: TmdbWatchProvider[];
  flatrate?: TmdbWatchProvider[];
  link?: string;
  rent?: TmdbWatchProvider[];
};

export type TmdbMovieDetail = TmdbMovieSummary & {
  credits?: {
    cast?: TmdbCastMember[];
    crew?: TmdbCrewMember[];
  };
  genres?: TmdbGenre[];
  original_language?: string;
  recommendations?: TmdbSearchResponse;
  reviews?: {
    results?: TmdbReview[];
  };
  runtime?: number | null;
  status?: string;
  videos?: {
    results?: TmdbVideo[];
  };
  'watch/providers'?: {
    results?: Record<string, TmdbWatchProviderRegion>;
  };
};
