import {
  MovieDetail,
  MovieSearchResult,
  MovieSummary,
  Person,
  Review,
  Trailer,
  WatchProvider,
  WatchProviderGroup
} from '@entities/movie/model/types';
import {
  TmdbImageConfig,
  fallbackTmdbImageConfig
} from '@shared/api/config/tmdb-image-config';

import {
  TmdbCastMember,
  TmdbCrewMember,
  TmdbMovieDetail,
  TmdbMovieSummary,
  TmdbReview,
  TmdbSearchResponse,
  TmdbVideo,
  TmdbWatchProvider,
  TmdbWatchProviderRegion
} from '../api/tmdb-types';
import {
  UNKNOWN_MOVIE_TITLE,
  UNKNOWN_PERSON_NAME,
  UNKNOWN_PROVIDER_NAME
} from './movie-fallbacks';

function buildImageUrl(baseUrl: string, path: string | null | undefined) {
  return path ? `${baseUrl}${path}` : null;
}

export function adaptTmdbMovieSummary(
  movie: TmdbMovieSummary,
  imageConfig: TmdbImageConfig = fallbackTmdbImageConfig
): MovieSummary {
  const releaseDate = movie.release_date ?? movie.first_air_date ?? '';

  return {
    id: movie.id,
    originalTitle: movie.original_title ?? movie.title ?? movie.name ?? UNKNOWN_MOVIE_TITLE,
    title: movie.title ?? movie.name ?? UNKNOWN_MOVIE_TITLE,
    overview: movie.overview ?? '',
    backdropUrl: buildImageUrl(imageConfig.backdropBaseUrl, movie.backdrop_path),
    genreIds: Array.isArray(movie.genre_ids) ? movie.genre_ids : [],
    posterUrl: buildImageUrl(imageConfig.posterBaseUrl, movie.poster_path),
    releaseDate,
    releaseYear: releaseDate ? Number(releaseDate.slice(0, 4)) : null,
    voteAverage: movie.vote_average ?? 0,
    voteCount: movie.vote_count ?? 0
  };
}

export function adaptTmdbSearchResponse(
  response: TmdbSearchResponse,
  imageConfig: TmdbImageConfig = fallbackTmdbImageConfig
): MovieSearchResult {
  return {
    items: response.results.map((movie) => adaptTmdbMovieSummary(movie, imageConfig)),
    page: response.page,
    totalPages: response.total_pages,
    totalResults: response.total_results
  };
}

function adaptCastMember(person: TmdbCastMember, imageConfig: TmdbImageConfig): Person {
  return {
    id: person.id,
    name: person.name ?? UNKNOWN_PERSON_NAME,
    character: person.character,
    profileUrl: buildImageUrl(imageConfig.profileBaseUrl, person.profile_path)
  };
}

function adaptCrewMember(person: TmdbCrewMember, imageConfig: TmdbImageConfig): Person {
  return {
    id: person.id,
    job: person.job,
    name: person.name ?? UNKNOWN_PERSON_NAME,
    profileUrl: buildImageUrl(imageConfig.profileBaseUrl, person.profile_path)
  };
}

function adaptTrailer(video: TmdbVideo): Trailer | null {
  if (!video.key || !video.site) {
    return null;
  }

  return {
    id: video.id,
    key: video.key,
    name: video.name ?? 'Trailer',
    site: video.site,
    type: video.type ?? '',
    url: video.site === 'YouTube' ? `https://www.youtube.com/watch?v=${video.key}` : ''
  };
}

function adaptReview(review: TmdbReview): Review {
  return {
    id: review.id,
    author: review.author ?? 'Anonymous',
    content: review.content ?? '',
    createdAt: review.created_at ?? '',
    rating: review.author_details?.rating ?? null
  };
}

function adaptWatchProvider(provider: TmdbWatchProvider, imageConfig: TmdbImageConfig): WatchProvider {
  return {
    id: provider.provider_id,
    logoUrl: buildImageUrl(imageConfig.logoBaseUrl, provider.logo_path),
    name: provider.provider_name ?? UNKNOWN_PROVIDER_NAME
  };
}

function adaptWatchProviderGroup(
  region: TmdbWatchProviderRegion | undefined,
  imageConfig: TmdbImageConfig
): WatchProviderGroup | null {
  if (!region) {
    return null;
  }

  return {
    buy: Array.isArray(region.buy) ? region.buy.map((provider) => adaptWatchProvider(provider, imageConfig)) : [],
    flatrate: Array.isArray(region.flatrate)
      ? region.flatrate.map((provider) => adaptWatchProvider(provider, imageConfig))
      : [],
    link: region.link,
    rent: Array.isArray(region.rent) ? region.rent.map((provider) => adaptWatchProvider(provider, imageConfig)) : []
  };
}

export function adaptTmdbMovieDetail(
  movie: TmdbMovieDetail,
  imageConfig: TmdbImageConfig = fallbackTmdbImageConfig
): MovieDetail {
  const summary = adaptTmdbMovieSummary(movie, imageConfig);
  const trailers = Array.isArray(movie.videos?.results)
    ? movie.videos.results
        .filter((video) => video.site === 'YouTube' && (video.type === 'Trailer' || video.type === 'Teaser'))
        .map(adaptTrailer)
        .filter((video): video is Trailer => Boolean(video))
    : [];
  const providerResults = movie['watch/providers']?.results;

  return {
    ...summary,
    cast: Array.isArray(movie.credits?.cast)
      ? movie.credits.cast.slice(0, 12).map((person) => adaptCastMember(person, imageConfig))
      : [],
    directors: Array.isArray(movie.credits?.crew)
      ? movie.credits.crew
          .filter((person) => person.job === 'Director')
          .map((person) => adaptCrewMember(person, imageConfig))
      : [],
    genres: Array.isArray(movie.genres)
      ? movie.genres.map((genre) => ({ id: genre.id, name: genre.name ?? UNKNOWN_MOVIE_TITLE }))
      : [],
    language: movie.original_language ?? '',
    recommendations: movie.recommendations
      ? adaptTmdbSearchResponse(movie.recommendations, imageConfig).items.slice(0, 12)
      : [],
    reviews: Array.isArray(movie.reviews?.results) ? movie.reviews.results.slice(0, 3).map(adaptReview) : [],
    runtime: movie.runtime ?? null,
    status: movie.status ?? '',
    trailers,
    watchProviders: adaptWatchProviderGroup(providerResults?.CN ?? providerResults?.US, imageConfig)
  };
}
