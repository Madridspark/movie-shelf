import { MovieSummary } from '@entities/movie/model/types';

export type LotteryVisualItem = {
  movie: MovieSummary;
  uniqueIndex: number;
  visualIndex: number;
};

export function getUniqueLotteryMovies(movies: MovieSummary[]) {
  const seenMovieIds = new Set<number>();

  return movies.filter((movie) => {
    if (seenMovieIds.has(movie.id)) {
      return false;
    }

    seenMovieIds.add(movie.id);
    return true;
  });
}

export function buildLotteryVisualQueue(movies: MovieSummary[], minLength = 8): LotteryVisualItem[] {
  const uniqueMovies = getUniqueLotteryMovies(movies);

  if (uniqueMovies.length === 0) {
    return [];
  }

  if (uniqueMovies.length === 1) {
    return [{ movie: uniqueMovies[0], uniqueIndex: 0, visualIndex: 0 }];
  }

  const queueLength = Math.max(uniqueMovies.length, minLength);

  return Array.from({ length: queueLength }, (_, visualIndex) => {
    const uniqueIndex = visualIndex % uniqueMovies.length;

    return {
      movie: uniqueMovies[uniqueIndex],
      uniqueIndex,
      visualIndex
    };
  });
}

export function findVisualIndexByMovieId(queue: LotteryVisualItem[], movieId: number, preferredIndex = 0) {
  let selectedIndex = -1;
  let selectedDistance = Number.POSITIVE_INFINITY;

  queue.forEach((item, index) => {
    if (item.movie.id !== movieId) {
      return;
    }

    const distance = Math.abs(index - preferredIndex);

    if (distance < selectedDistance) {
      selectedDistance = distance;
      selectedIndex = index;
    }
  });

  return selectedIndex;
}

export function getNextLotteryIndex(currentIndex: number, total: number, random = Math.random) {
  if (total < 2) {
    return currentIndex;
  }

  const normalizedCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
  const offset = 1 + Math.floor(random() * (total - 1));

  return (normalizedCurrentIndex + offset) % total;
}

export function getNextSequentialIndex(currentIndex: number, total: number) {
  if (total < 2) {
    return currentIndex;
  }

  const normalizedCurrentIndex = currentIndex >= 0 ? currentIndex : 0;

  return (normalizedCurrentIndex + 1) % total;
}
