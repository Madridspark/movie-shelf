import { z } from 'zod';

import {
  TmdbCastMember,
  TmdbCrewMember,
  TmdbGenreListResponse,
  TmdbMovieDetail,
  TmdbMovieSummary,
  TmdbReview,
  TmdbSearchResponse,
  TmdbVideo,
  TmdbWatchProvider,
  TmdbWatchProviderRegion
} from './tmdb-types';

const nullableStringSchema = z.string().nullable().optional();

const movieSummarySchema = z
  .object({
    backdrop_path: nullableStringSchema,
    first_air_date: z.string().optional(),
    genre_ids: z.array(z.coerce.number()).catch([]).optional(),
    id: z.coerce.number(),
    name: z.string().optional(),
    original_title: z.string().optional(),
    overview: z.string().optional(),
    poster_path: nullableStringSchema,
    release_date: z.string().optional(),
    title: z.string().optional(),
    vote_average: z.coerce.number().catch(0).optional(),
    vote_count: z.coerce.number().catch(0).optional()
  })
  .passthrough();

const genreSchema = z.object({
  id: z.coerce.number(),
  name: z.string().optional()
});

const castMemberSchema = z.object({
  character: z.string().optional(),
  id: z.coerce.number(),
  name: z.string().optional(),
  profile_path: nullableStringSchema
});

const crewMemberSchema = z.object({
  id: z.coerce.number(),
  job: z.string().optional(),
  name: z.string().optional(),
  profile_path: nullableStringSchema
});

const videoSchema = z.object({
  id: z.coerce.string(),
  key: z.string().optional(),
  name: z.string().optional(),
  site: z.string().optional(),
  type: z.string().optional()
});

const reviewSchema = z.object({
  author: z.string().optional(),
  author_details: z
    .object({
      rating: z.coerce.number().nullable().optional()
    })
    .passthrough()
    .optional(),
  content: z.string().optional(),
  created_at: z.string().optional(),
  id: z.coerce.string()
});

const watchProviderSchema = z.object({
  logo_path: nullableStringSchema,
  provider_id: z.coerce.number(),
  provider_name: z.string().optional()
});

const searchResponseEnvelopeSchema = z
  .object({
    page: z.coerce.number().catch(1),
    results: z.array(z.unknown()).catch([]),
    total_pages: z.coerce.number().catch(1),
    total_results: z.coerce.number().catch(0)
  })
  .passthrough();

const genreListEnvelopeSchema = z
  .object({
    genres: z.array(z.unknown()).catch([])
  })
  .passthrough();

const movieDetailEnvelopeSchema = movieSummarySchema.extend({
  credits: z
    .object({
      cast: z.array(z.unknown()).catch([]).optional(),
      crew: z.array(z.unknown()).catch([]).optional()
    })
    .passthrough()
    .optional(),
  genres: z.array(z.unknown()).catch([]).optional(),
  original_language: z.string().optional(),
  recommendations: z.unknown().optional(),
  reviews: z
    .object({
      results: z.array(z.unknown()).catch([]).optional()
    })
    .passthrough()
    .optional(),
  runtime: z.coerce.number().nullable().catch(null).optional(),
  status: z.string().optional(),
  videos: z
    .object({
      results: z.array(z.unknown()).catch([]).optional()
    })
    .passthrough()
    .optional(),
  'watch/providers': z
    .object({
      results: z.record(z.string(), z.unknown()).catch({})
    })
    .passthrough()
    .optional()
});

function parseArrayItems<TItem>(items: unknown[] | undefined, schema: z.ZodType<TItem, z.ZodTypeDef, unknown>) {
  const parsedItems: TItem[] = [];

  items?.forEach((item) => {
    const result = schema.safeParse(item);

    if (result.success) {
      parsedItems.push(result.data);
    }
  });

  return parsedItems;
}

export function parseTmdbSearchResponse(value: unknown): TmdbSearchResponse {
  const response = searchResponseEnvelopeSchema.safeParse(value);

  if (!response.success) {
    return {
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0
    } as unknown as TmdbSearchResponse;
  }

  return {
    page: response.data.page,
    results: parseArrayItems<TmdbMovieSummary>(response.data.results, movieSummarySchema),
    total_pages: response.data.total_pages,
    total_results: response.data.total_results
  };
}

export function parseTmdbGenreListResponse(value: unknown): TmdbGenreListResponse {
  const response = genreListEnvelopeSchema.safeParse(value);

  if (!response.success) {
    return {
      genres: []
    };
  }

  return {
    genres: parseArrayItems(response.data.genres, genreSchema)
  };
}

function parseWatchProviderRegion(value: unknown) {
  const regionSchema = z.object({
    buy: z.array(z.unknown()).catch([]).optional(),
    flatrate: z.array(z.unknown()).catch([]).optional(),
    link: z.string().optional(),
    rent: z.array(z.unknown()).catch([]).optional()
  });
  const region = regionSchema.safeParse(value);

  if (!region.success) {
    return undefined;
  }

  return {
    buy: parseArrayItems<TmdbWatchProvider>(region.data.buy, watchProviderSchema),
    flatrate: parseArrayItems<TmdbWatchProvider>(region.data.flatrate, watchProviderSchema),
    link: region.data.link,
    rent: parseArrayItems<TmdbWatchProvider>(region.data.rent, watchProviderSchema)
  };
}

export function parseTmdbMovieDetail(value: unknown): TmdbMovieDetail {
  const movie = movieDetailEnvelopeSchema.safeParse(value);

  if (!movie.success) {
    throw new Error('Invalid TMDB movie detail response');
  }

  const providerResults = movie.data['watch/providers']?.results ?? {};
  const parsedProviderResults = Object.entries(providerResults).reduce<Record<string, TmdbWatchProviderRegion>>(
    (regions, [region, providerValue]) => {
      const parsedRegion = parseWatchProviderRegion(providerValue);

      if (parsedRegion) {
        regions[region] = parsedRegion;
      }

      return regions;
    },
    {}
  );

  return {
    ...movie.data,
    credits: {
      cast: parseArrayItems<TmdbCastMember>(movie.data.credits?.cast, castMemberSchema),
      crew: parseArrayItems<TmdbCrewMember>(movie.data.credits?.crew, crewMemberSchema)
    },
    genres: parseArrayItems(movie.data.genres, genreSchema),
    recommendations: movie.data.recommendations
      ? parseTmdbSearchResponse(movie.data.recommendations)
      : undefined,
    reviews: {
      results: parseArrayItems<TmdbReview>(movie.data.reviews?.results, reviewSchema)
    },
    videos: {
      results: parseArrayItems<TmdbVideo>(movie.data.videos?.results, videoSchema)
    },
    'watch/providers': {
      results: parsedProviderResults
    }
  };
}
