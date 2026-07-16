import { FavoriteMovieItem, FavoriteSortMode } from './favorites-slice';

function compareTitle(left: FavoriteMovieItem, right: FavoriteMovieItem) {
  return left.movie.title.localeCompare(right.movie.title);
}

function compareReleaseYear(left: FavoriteMovieItem, right: FavoriteMovieItem) {
  return (right.movie.releaseYear ?? 0) - (left.movie.releaseYear ?? 0);
}

export function sortFavoriteItems(items: FavoriteMovieItem[], sortMode: FavoriteSortMode) {
  return [...items].sort((left, right) => {
    if (sortMode === 'rating') {
      return right.movie.voteAverage - left.movie.voteAverage;
    }

    if (sortMode === 'releaseYear') {
      return compareReleaseYear(left, right);
    }

    if (sortMode === 'releaseYearAsc') {
      return compareReleaseYear(right, left);
    }

    if (sortMode === 'title') {
      return compareTitle(left, right);
    }

    if (sortMode === 'titleDesc') {
      return compareTitle(right, left);
    }

    return right.addedAt - left.addedAt;
  });
}
