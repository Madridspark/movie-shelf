import { tmdbClient } from '@shared/api/client/tmdb-client';

type TmdbConfigurationResponse = {
  images?: {
    backdrop_sizes?: string[];
    logo_sizes?: string[];
    poster_sizes?: string[];
    profile_sizes?: string[];
    secure_base_url?: string;
  };
};

export type TmdbImageConfig = {
  backdropBaseUrl: string;
  logoBaseUrl: string;
  posterBaseUrl: string;
  profileBaseUrl: string;
};

const FALLBACK_SECURE_BASE_URL = 'https://image.tmdb.org/t/p/';

export const fallbackTmdbImageConfig: TmdbImageConfig = {
  backdropBaseUrl: `${FALLBACK_SECURE_BASE_URL}w1280`,
  logoBaseUrl: `${FALLBACK_SECURE_BASE_URL}w185`,
  posterBaseUrl: `${FALLBACK_SECURE_BASE_URL}w500`,
  profileBaseUrl: `${FALLBACK_SECURE_BASE_URL}w185`
};

let imageConfigPromise: Promise<TmdbImageConfig> | null = null;

function pickSize(sizes: string[] | undefined, preferredSizes: string[], fallbackSize: string) {
  return preferredSizes.find((size) => sizes?.includes(size)) ?? fallbackSize;
}

function buildImageConfig(response: TmdbConfigurationResponse): TmdbImageConfig {
  const images = response.images;
  const secureBaseUrl = images?.secure_base_url ?? FALLBACK_SECURE_BASE_URL;

  return {
    backdropBaseUrl: `${secureBaseUrl}${pickSize(images?.backdrop_sizes, ['w1280', 'w780'], 'w1280')}`,
    logoBaseUrl: `${secureBaseUrl}${pickSize(images?.logo_sizes, ['w185', 'w154'], 'w185')}`,
    posterBaseUrl: `${secureBaseUrl}${pickSize(images?.poster_sizes, ['w500', 'w342'], 'w500')}`,
    profileBaseUrl: `${secureBaseUrl}${pickSize(images?.profile_sizes, ['w185', 'w154'], 'w185')}`
  };
}

export function getTmdbImageConfig() {
  imageConfigPromise ??= tmdbClient
    .get<TmdbConfigurationResponse>('/configuration')
    .then(buildImageConfig)
    .catch(() => fallbackTmdbImageConfig);

  return imageConfigPromise;
}
