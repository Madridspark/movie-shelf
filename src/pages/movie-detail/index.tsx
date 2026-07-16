import { useEffect, useMemo, useState } from 'react';

import { ExternalLink, Heart, Home, Play, Star } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { useMovieDetailQuery } from '@entities/movie/api/use-movie-search-query';
import {
  addMovieToCollection,
  createFavoriteCollection,
  DEFAULT_COLLECTION_ID,
  removeMovieFromCollection
} from '@features/favorites/model/favorites-slice';
import { selectFavoriteCollections } from '@features/favorites/model/favorites-selectors';
import { Checkbox } from '@shared/ui/checkbox';
import * as Dialog from '@shared/ui/dialog';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import styles from './index.module.less';

function formatRuntime(runtime: number | null) {
  if (!runtime) {
    return '未知时长';
  }

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  return `${hours}h ${minutes}m`;
}

function formatDate(date: string) {
  if (!date) {
    return '未知日期';
  }

  return new Date(date).toLocaleDateString();
}

export function MovieDetailPage() {
  const { movieId } = useParams();
  const dispatch = useAppDispatch();
  const collections = useAppSelector(selectFavoriteCollections);
  const [isCollectionDialogOpen, setIsCollectionDialogOpen] = useState(false);
  const [expandedReviewIds, setExpandedReviewIds] = useState<string[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const { data: movie, isError, isFetching } = useMovieDetailQuery(movieId);
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
    return <div className={styles.statePage}>正在加载电影详情...</div>;
  }

  if (isError || !movie) {
    return (
      <div className={styles.statePage}>
        <Link to="/">返回首页</Link>
        <p>暂时无法加载电影详情。</p>
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

      <section className={styles.hero} style={movie.backdropUrl ? { backgroundImage: `url(${movie.backdropUrl})` } : undefined}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.poster}>
            {movie.posterUrl ? <img alt={movie.title} decoding="async" loading="eager" src={movie.posterUrl} /> : null}
          </div>

          <div className={styles.heroInfo}>
            <span className={styles.eyebrow}>{movie.releaseYear ?? 'MovieShelf'}</span>
            <h1>{movie.title}</h1>
            {movie.originalTitle && movie.originalTitle !== movie.title ? (
              <span className={styles.originalTitle}>{movie.originalTitle}</span>
            ) : null}
            <p>{movie.overview || '暂无简介。'}</p>
            <div className={styles.scoreLine}>
              <span>
                <Star size={18} />
                {movie.voteAverage.toFixed(1)}
              </span>
              <span>{movie.voteCount.toLocaleString()} votes</span>
            </div>

            <div className={styles.heroButtons}>
              {primaryTrailer ? (
                <a href={primaryTrailer.url} rel="noreferrer" target="_blank">
                  <Play size={18} />
                  预告片
                </a>
              ) : null}
              <button
                aria-label={isInDefaultCollection ? '从默认收藏夹移除' : '加入默认收藏夹'}
                className={isInDefaultCollection ? styles.defaultFavoriteActive : styles.defaultFavoriteButton}
                type="button"
                onClick={handleToggleDefaultCollection}
              >
                <Heart fill={isInDefaultCollection ? 'currentColor' : 'none'} size={18} />
              </button>
              <Dialog.Root
                open={isCollectionDialogOpen}
                onOpenChange={(nextOpen) => {
                  setIsCollectionDialogOpen(nextOpen);

                  if (nextOpen) {
                    setSelectedCollectionIds(movieCollectionIds);
                    setNewCollectionName('');
                  }
                }}
              >
                <Dialog.Trigger asChild>
                  <button className={styles.collectionPickerButton} type="button">
                    添加到收藏夹
                  </button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className={styles.dialogOverlay} />
                  <Dialog.Content className={styles.dialogContent}>
                    <Dialog.Title className={styles.dialogTitle}>添加到收藏夹</Dialog.Title>
                    <Dialog.Description className={styles.dialogDescription}>
                      选择一个或多个收藏夹保存这部电影。
                    </Dialog.Description>
                    <div className={styles.collectionPickerList}>
                      {collections.map((collection) => (
                        <Checkbox
                          checked={selectedCollectionIds.includes(collection.id)}
                          key={collection.id}
                          label={collection.name}
                          meta={String(collection.movieIds.length)}
                          onCheckedChange={() => handleToggleSelectedCollection(collection.id)}
                        />
                      ))}
                    </div>
                    <div className={styles.dialogCreateRow}>
                      <input
                        aria-label="新收藏夹名称"
                        onChange={(event) => setNewCollectionName(event.target.value)}
                        placeholder="新建收藏夹"
                        value={newCollectionName}
                      />
                      <button type="button" onClick={handleCreateCollection}>
                        创建并选中
                      </button>
                    </div>
                    <div className={styles.dialogFooter}>
                      <Dialog.Close asChild>
                        <button type="button">取消</button>
                      </Dialog.Close>
                      <button type="button" onClick={handleSaveSelectedCollections}>
                        保存
                      </button>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.content}>
        <section className={styles.infoGrid}>
          <div className={styles.panel}>
            <h2>元信息</h2>
            <dl>
              <div>
                <dt>上映日期</dt>
                <dd>{movie.releaseDate || '未知'}</dd>
              </div>
              <div>
                <dt>时长</dt>
                <dd>{formatRuntime(movie.runtime)}</dd>
              </div>
              <div>
                <dt>类型</dt>
                <dd>{movie.genres.map((genre) => genre.name).join(' / ') || '未知'}</dd>
              </div>
              <div>
                <dt>语言 / 状态</dt>
                <dd>
                  {movie.language || '未知'} / {movie.status || '未知'}
                </dd>
              </div>
            </dl>
          </div>

          <div className={styles.panel}>
            <h2>预告片</h2>
            {primaryTrailer ? (
              <a className={styles.trailerLink} href={primaryTrailer.url} rel="noreferrer" target="_blank">
                <Play size={20} />
                <span>{primaryTrailer.name}</span>
                <ExternalLink size={16} />
              </a>
            ) : (
              <p className={styles.muted}>暂无预告片。</p>
            )}
          </div>

          <div className={styles.panel}>
            <h2>观看平台</h2>
            {providerGroups.length > 0 ? (
              <div className={styles.providerGroups}>
                {providerGroups.map((providerGroup) => (
                  <div className={styles.providerGroup} key={providerGroup.label}>
                    <h3>{providerGroup.label}</h3>
                    <div className={styles.providerList}>
                      {providerGroup.providers.slice(0, 6).map((provider) => (
                        <span key={provider.id}>
                          {provider.logoUrl ? <img alt="" decoding="async" loading="lazy" src={provider.logoUrl} /> : null}
                          {provider.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.muted}>当前地区暂无观看平台信息。</p>
            )}
          </div>
        </section>

        <section className={styles.panel}>
          <h2>导演与演员</h2>
          <p className={styles.directors}>
            导演：{movie.directors.map((person) => person.name).join(' / ') || '未知'}
          </p>
          <div className={styles.castList}>
            {movie.cast.map((person) => (
              <div className={styles.personCard} key={person.id}>
                <div>
                  {person.profileUrl ? (
                    <img alt={person.name} decoding="async" loading="lazy" src={person.profileUrl} />
                  ) : null}
                </div>
                <strong>{person.name}</strong>
                <span>{person.character}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.bottomGrid}>
          <div className={styles.panel}>
            <h2>评论</h2>
            {movie.reviews.length > 0 ? (
              <div className={styles.reviewList}>
                {movie.reviews.map((review) => (
                  <article key={review.id}>
                    <div className={styles.reviewMeta}>
                      <strong>{review.author}</strong>
                      <span>
                        {review.rating ? `${review.rating.toFixed(1)} / 10` : '未评分'} · {formatDate(review.createdAt)}
                      </span>
                    </div>
                    <p className={expandedReviewIds.includes(review.id) ? styles.reviewExpanded : undefined}>
                      {review.content}
                    </p>
                    {review.content.length > 180 ? (
                      <button type="button" onClick={() => handleToggleReview(review.id)}>
                        {expandedReviewIds.includes(review.id) ? '收起' : '展开'}
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className={styles.muted}>暂无评论。</p>
            )}
          </div>

          <div className={styles.panel}>
            <h2>相关推荐</h2>
            {movie.recommendations.length > 0 ? (
              <div className={styles.relatedRail}>
                {movie.recommendations.map((item) => (
                  <Link key={item.id} to={`/movies/${item.id}`}>
                    {item.posterUrl ? (
                      <img alt={item.title} decoding="async" loading="lazy" src={item.posterUrl} />
                    ) : null}
                    <span>{item.title}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className={styles.muted}>暂无相关推荐。</p>
            )}
          </div>
        </section>
      </div>
    </article>
  );
}
