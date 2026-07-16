export type MovieSummary = {
  id: number;
  title: string;
  originalTitle: string;
  overview: string;
  backdropUrl: string | null;
  genres?: Genre[];
  genreIds: number[];
  posterUrl: string | null;
  releaseDate: string;
  releaseYear: number | null;
  voteAverage: number;
  voteCount: number;
};

export type Genre = {
  id: number;
  name: string;
};

export type Person = {
  id: number;
  name: string;
  character?: string;
  job?: string;
  profileUrl: string | null;
};

export type Trailer = {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  url: string;
};

export type Review = {
  id: string;
  author: string;
  content: string;
  createdAt: string;
  rating: number | null;
};

export type WatchProvider = {
  id: number;
  logoUrl: string | null;
  name: string;
};

export type WatchProviderGroup = {
  buy: WatchProvider[];
  flatrate: WatchProvider[];
  link?: string;
  rent: WatchProvider[];
};

export type MovieDetail = MovieSummary & {
  cast: Person[];
  directors: Person[];
  genres: Genre[];
  language: string;
  recommendations: MovieSummary[];
  reviews: Review[];
  runtime: number | null;
  status: string;
  trailers: Trailer[];
  watchProviders: WatchProviderGroup | null;
};

export type MovieSearchResult = {
  items: MovieSummary[];
  page: number;
  totalPages: number;
  totalResults: number;
};
