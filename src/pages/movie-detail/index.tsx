import { useEffect, useMemo, useState } from 'react';

import { Heart, Home } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { useMovieDetailQuery } from '@entities/movie/api/use-movie-search-query';
import {
  addMovieToCollection,
  createFavoriteCollection,
  DEFAULT_COLLECTION_ID,
  removeMovieFromCollection
} from '@features/favorites/model/favorites-slice';
import { selectFavoriteCollections } from '@features/favorites/model/favorites-selectors';
import { NetworkErrorDialog } from '@shared/ui/network-error-dialog';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import { CastList } from './components/CastList';
import { FavoriteMenu } from './components/FavoriteMenu';
import { MovieDetailSkeleton } from './components/MovieDetailSkeleton';
import { MovieHero } from './components/MovieHero';
import { MovieMetaPanel } from './components/MovieMetaPanel';
import { RelatedMovieRail } from './components/RelatedMovieRail';
import { ReviewList } from './components/ReviewList';
import { TrailerPanel } from './components/TrailerPanel';
import { WatchProviderList } from './components/WatchProviderList';
import styles from './index.module.less';

export function MovieDetailPage() {
  const { movieId } = useParams();
  const dispatch = useAppDispatch();
  const collections = useAppSelector(selectFavoriteCollections);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [expandedReviewIds, setExpandedReviewIds] = useState<string[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const { data: movie, isError, isFetching, refetch } = useMovieDetailQuery(movieId);
  const primaryTrailer = movie?.trailers[0];
  const streamProviders = movie?.watchProviders?.flatrate ?? [];
  const rentProviders = movie?.watchProviders?.rent ?? [];
  const buyProviders = movie?.watchProviders?.buy ?? [];
  const defaultCollection = collections.find((collection) => collection.id === DEFAULT_COLLECTION_ID) ?? collections[0];
  const movieCollectionIds = useMemo(() => {
    if (!movie) {
      return [];
    }

    return collections
      .filter((collection) => collection.movieIds.includes(movie.id))
      .map((collection) => collection.id);
  }, [collections, movie]);
  const isInDefaultCollection = Boolean(movie && defaultCollection?.movieIds.includes(movie.id));
  const providerGroups = [
    { label: '流媒体', providers: streamProviders },
    { label: '租赁', providers: rentProviders },
    { label: '购买', providers: buyProviders }
  ].filter((providerGroup) => providerGroup.providers.length > 0);

  useEffect(() => {
    setSelectedCollectionIds(movieCollectionIds);
  }, [movieCollectionIds]);

  const handleToggleDefaultCollection = () => {
    if (!movie || !defaultCollection) {
      return;
    }

    dispatch(
      isInDefaultCollection
        ? removeMovieFromCollection({ collectionId: defaultCollection.id, movieId: movie.id })
        : addMovieToCollection({ collectionId: defaultCollection.id, movie })
    );
  };

  const handleToggleSelectedCollection = (collectionId: string) => {
    setSelectedCollectionIds((currentCollectionIds) =>
      currentCollectionIds.includes(collectionId)
        ? currentCollectionIds.filter((currentCollectionId) => currentCollectionId !== collectionId)
        : [...currentCollectionIds, collectionId]
    );
  };

  const handleToggleReview = (reviewId: string) => {
    setExpandedReviewIds((currentReviewIds) =>
      currentReviewIds.includes(reviewId)
        ? currentReviewIds.filter((currentReviewId) => currentReviewId !== reviewId)
        : [...currentReviewIds, reviewId]
    );
  };

  const handleCreateCollection = () => {
    const action = createFavoriteCollection(newCollectionName);

    dispatch(action);
    setSelectedCollectionIds((currentCollectionIds) => [...currentCollectionIds, action.payload.id]);
    setNewCollectionName('');
  };

  const handleSaveSelectedCollections = () => {
    if (!movie) {
      return;
    }

    collections.forEach((collection) => {
      const isSelected = selectedCollectionIds.includes(collection.id);
      const isAlreadyIncluded = collection.movieIds.includes(movie.id);

      if (isSelected && !isAlreadyIncluded) {
        dispatch(addMovieToCollection({ collectionId: collection.id, movie }));
      }

      if (!isSelected && isAlreadyIncluded) {
        dispatch(removeMovieFromCollection({ collectionId: collection.id, movieId: movie.id }));
      }
    });
    setIsCollectionDialogOpen(false);
  };

  if (isFetching && !movie) {
    return <MovieDetailSkeleton />;
  }

  if (isError || !movie) {
    return (
      <div className={styles.statePage}>
        <Link to="/">返回首页</Link>
        <NetworkErrorDialog open onRetry={() => void refetch()} />
      </div>
    );
  }

  return (
    <article className={styles.page}>
      <nav className={styles.topActions}>
        <Link aria-label="返回首页" to="/">
          <Home size={20} />
        </Link>
        <Link aria-label="打开收藏夹" to="/favorites">
          <Heart size={20} />
        </Link>
      </nav>

      <MovieHero
        favoriteMenu={
          <FavoriteMenu
            collections={collections}
            isDialogOpen={isCollectionDialogOpen}
            isInDefaultCollection={isInDefaultCollection}
            newCollectionName={newCollectionName}
            selectedCollectionIds={selectedCollectionIds}
            onCreateCollection={handleCreateCollection}
            onDialogOpenChange={(nextOpen) => {
              setIsCollectionDialogOpen(nextOpen);

              if (nextOpen) {
                setSelectedCollectionIds(movieCollectionIds);
                setNewCollectionName('');
              }
            }}
            onNewCollectionNameChange={setNewCollectionName}
            onSaveSelectedCollections={handleSaveSelectedCollections}
            onToggleDefaultCollection={handleToggleDefaultCollection}
            onToggleSelectedCollection={handleToggleSelectedCollection}
          />
        }
        movie={movie}
        primaryTrailer={primaryTrailer}
      />

      <div className={styles.content}>
        <section className={styles.infoGrid}>
          <MovieMetaPanel movie={movie} />
          <TrailerPanel trailer={primaryTrailer} />
          <WatchProviderList providerGroups={providerGroups} />
        </section>

        <CastList cast={movie.cast} directors={movie.directors} />

        <section className={styles.bottomGrid}>
          <ReviewList
            expandedReviewIds={expandedReviewIds}
            reviews={movie.reviews}
            onToggleReview={handleToggleReview}
          />
          <RelatedMovieRail recommendations={movie.recommendations} />
        </section>
      </div>
    </article>
  );
}
