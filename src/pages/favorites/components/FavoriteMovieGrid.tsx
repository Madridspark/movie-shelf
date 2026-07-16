import { Link } from 'react-router-dom';

import { MovieCard } from '@entities/movie/ui/movie-card';
import { MovieWaterfallGrid } from '@entities/movie/ui/movie-waterfall-grid';
import { FavoriteMovieItem } from '@features/favorites/model/favorites-slice';
import { Button } from '@shared/ui/button';
import { StateResult } from '@shared/ui/state-result';

type FavoriteMovieGridProps = {
  activeMovieSet: Set<number>;
  allMovies: FavoriteMovieItem[];
  movies: FavoriteMovieItem[];
  onRemoveMovie: (movieId: number) => void;
};

export function FavoriteMovieGrid({
  activeMovieSet,
  allMovies,
  movies,
  onRemoveMovie
}: FavoriteMovieGridProps) {
  if (movies.length === 0) {
    return (
      <StateResult
        action={
          <Button asChild>
            <Link to="/">去发现电影</Link>
          </Button>
        }
        description="回到首页搜索或浏览最新上映电影，把想看的电影加入收藏夹。"
        title={allMovies.length > 0 && activeMovieSet.size === 0 ? '当前收藏夹为空' : '还没有收藏电影'}
      />
    );
  }

  return (
    <MovieWaterfallGrid>
      {movies.map(({ movie }) => (
        <MovieCard
          action={
            <Button type="button" onClick={() => onRemoveMovie(movie.id)}>
              移除
            </Button>
          }
          key={movie.id}
          movie={movie}
        />
      ))}
    </MovieWaterfallGrid>
  );
}
