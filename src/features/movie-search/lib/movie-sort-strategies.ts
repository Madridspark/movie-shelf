import { MovieSummary } from '@entities/movie/model/types';
import { MovieSearchSortMode } from '@features/preferences/model/preferences-slice';

function compareMovieTitle(left: MovieSummary, right: MovieSummary) {
  return left.title.localeCompare(right.title);
}

function compareMovieReleaseYear(left: MovieSummary, right: MovieSummary) {
  return (right.releaseYear ?? 0) - (left.releaseYear ?? 0);
}

export function sortSearchMovies(movies: MovieSummary[], sortMode: MovieSearchSortMode) {
  if (sortMode === 'rating') {
    return [...movies].sort((left, right) => right.voteAverage - left.voteAverage);
  }

  if (sortMode === 'releaseDate') {
    return [...movies].sort(compareMovieReleaseYear);
  }

  if (sortMode === 'releaseDateAsc') {
    return [...movies].sort((left, right) => compareMovieReleaseYear(right, left));
  }

  if (sortMode === 'title') {
    return [...movies].sort(compareMovieTitle);
  }

  if (sortMode === 'titleDesc') {
    return [...movies].sort((left, right) => compareMovieTitle(right, left));
  }

  return movies;
}
