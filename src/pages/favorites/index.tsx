import { useEffect, useMemo, useState } from 'react';

import { Home, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { MovieCard } from '@entities/movie/ui/movie-card';
import { MovieWaterfallGrid } from '@entities/movie/ui/movie-waterfall-grid';
import {
  createFavoriteCollection,
  deleteFavoriteCollection,
  DEFAULT_COLLECTION_ID,
  FavoriteLotterySource,
  FavoriteSortMode,
  removeMovieFromCollection,
  renameFavoriteCollection,
  setActiveCollection,
  setFavoriteLotterySource,
  setFavoriteSortMode
} from '@features/favorites/model/favorites-slice';
import {
  selectActiveCollection,
  selectActiveFavoriteMovies,
  selectAllFavoriteMovies,
  selectFavoriteCollections,
  selectFavoriteLotterySource,
  selectFavoriteSortMode
} from '@features/favorites/model/favorites-selectors';
import { LotteryBanner } from '@features/lottery-banner/ui/LotteryBanner';
import { Button } from '@shared/ui/button';
import * as Dialog from '@shared/ui/dialog';
import { DropdownSelect, DropdownSelectOption } from '@shared/ui/dropdown-select';
import { StateResult } from '@shared/ui/state-result';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import styles from './index.module.less';

const FAVORITE_SORT_OPTIONS: DropdownSelectOption<FavoriteSortMode>[] = [
  { label: '加入时间', value: 'addedAt' },
  { label: '评分', value: 'rating' },
  { label: '上映年份从新到旧', value: 'releaseYear' },
  { label: '上映年份从旧到新', value: 'releaseYearAsc' },
  { label: '标题 A-Z', value: 'title' },
  { label: '标题 Z-A', value: 'titleDesc' }
];
const LOTTERY_SOURCE_OPTIONS: DropdownSelectOption<FavoriteLotterySource>[] = [
  { label: '全部收藏夹', value: 'allFavorites' },
  { label: '当前收藏夹', value: 'favorite' }
];

function formatCollectionDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString();
}

export function FavoritesPage() {
  const dispatch = useAppDispatch();
  const collections = useAppSelector(selectFavoriteCollections);
  const activeCollection = useAppSelector(selectActiveCollection);
  const activeMovies = useAppSelector(selectActiveFavoriteMovies);
  const allMovies = useAppSelector(selectAllFavoriteMovies);
  const sortMode = useAppSelector(selectFavoriteSortMode);
  const lotterySource = useAppSelector(selectFavoriteLotterySource);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [renameValue, setRenameValue] = useState(activeCollection?.name ?? '');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const lotteryMovies = lotterySource === 'allFavorites' ? allMovies : activeMovies;
  const collectionOptions: DropdownSelectOption<string>[] = useMemo(
    () =>
      collections.map((collection) => ({
        label: `${collection.name} (${collection.movieIds.length})`,
        value: collection.id
      })),
    [collections]
  );
  const activeMovieSet = useMemo(
    () => new Set(activeMovies.map((item) => item.movie.id)),
    [activeMovies]
  );

  useEffect(() => {
    setRenameValue(activeCollection?.name ?? '');
  }, [activeCollection?.name]);

  const handleCreateCollection = () => {
    dispatch(createFavoriteCollection(newCollectionName));
    setNewCollectionName('');
    setIsCreateDialogOpen(false);
  };

  const handleRenameCollection = () => {
    if (!activeCollection) {
      return;
    }

    dispatch(renameFavoriteCollection({ collectionId: activeCollection.id, name: renameValue }));
  };

  const handleDeleteCollection = () => {
    if (!activeCollection || activeCollection.id === DEFAULT_COLLECTION_ID) {
      return;
    }

    dispatch(deleteFavoriteCollection(activeCollection.id));
    setIsDeleteDialogOpen(false);
  };

  const handleActiveCollectionChange = (collectionId: string) => {
    const nextCollection = collections.find((collection) => collection.id === collectionId);

    dispatch(setActiveCollection(collectionId));
    setRenameValue(nextCollection?.name ?? '');
  };

  return (
    <section className={styles.page}>
      <nav className={styles.topActions}>
        <Link aria-label="返回首页" to="/">
          <Home size={20} />
        </Link>
      </nav>

      <aside className={styles.sidebar}>
        <Link className={styles.logo} to="/">
          <img alt="MovieShelf" src="/assets/brand/movie-shelf-horizontal-white.png" />
        </Link>
        <h1>收藏夹</h1>
        <div className={styles.mobileCollectionSelect}>
          <DropdownSelect
            ariaLabel="切换收藏夹"
            options={collectionOptions}
            value={activeCollection?.id ?? DEFAULT_COLLECTION_ID}
            onValueChange={handleActiveCollectionChange}
          />
        </div>
        <div className={styles.collectionList}>
          {collections.map((collection) => (
            <button
              className={collection.id === activeCollection?.id ? styles.activeCollection : undefined}
              key={collection.id}
              type="button"
              onClick={() => {
                dispatch(setActiveCollection(collection.id));
                setRenameValue(collection.name);
              }}
            >
              <span>
                <strong>{collection.name}</strong>
                <small>
                  创建 {formatCollectionDate(collection.createdAt)} / 更新 {formatCollectionDate(collection.updatedAt)}
                </small>
              </span>
              <em>{collection.movieIds.length}</em>
            </button>
          ))}
        </div>
        <div className={styles.createBox}>
          <Dialog.Root
            open={isCreateDialogOpen}
            onOpenChange={(nextOpen) => {
              setIsCreateDialogOpen(nextOpen);

              if (!nextOpen) {
                setNewCollectionName('');
              }
            }}
          >
            <Dialog.Trigger asChild>
              <button type="button">
                <Plus size={16} />
                新建收藏夹
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className={styles.dialogOverlay} />
              <Dialog.Content className={styles.dialogContent}>
                <Dialog.Title className={styles.dialogTitle}>新建收藏夹</Dialog.Title>
                <Dialog.Description className={styles.dialogDescription}>
                  给新的电影片单起一个方便识别的名字。
                </Dialog.Description>
                <input
                  aria-label="新收藏夹名称"
                  className={styles.dialogInput}
                  onChange={(event) => setNewCollectionName(event.target.value)}
                  placeholder="例如：周末片单"
                  value={newCollectionName}
                />
                <div className={styles.dialogFooter}>
                  <Dialog.Close asChild>
                    <button type="button">取消</button>
                  </Dialog.Close>
                  <button type="button" onClick={handleCreateCollection}>
                    创建
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <input
              aria-label="收藏夹名称"
              onBlur={handleRenameCollection}
              onChange={(event) => setRenameValue(event.target.value)}
              value={renameValue}
            />
            <p>
              {activeMovies.length} 部电影 / 最近更新{' '}
              {activeCollection ? new Date(activeCollection.updatedAt).toLocaleDateString() : '-'}
            </p>
          </div>
          <div className={styles.headerActions}>
            <DropdownSelect
              ariaLabel="收藏夹排序"
              options={FAVORITE_SORT_OPTIONS}
              value={sortMode}
              onValueChange={(nextSortMode) => dispatch(setFavoriteSortMode(nextSortMode))}
            />
            <Dialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <Dialog.Trigger asChild>
                <button disabled={activeCollection?.id === DEFAULT_COLLECTION_ID} type="button">
                  <Trash2 size={16} />
                  删除
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className={styles.dialogOverlay} />
                <Dialog.Content className={styles.dialogContent}>
                  <Dialog.Title className={styles.dialogTitle}>删除收藏夹</Dialog.Title>
                  <Dialog.Description className={styles.dialogDescription}>
                    删除「{activeCollection?.name}」后，其中的电影会从这个收藏夹移除，不影响其它收藏夹。
                  </Dialog.Description>
                  <div className={styles.dialogFooter}>
                    <Dialog.Close asChild>
                      <button type="button">取消</button>
                    </Dialog.Close>
                    <button type="button" onClick={handleDeleteCollection}>
                      确认删除
                    </button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        </header>

        <div className={styles.lotteryWrap}>
          <div className={styles.lotteryHeader}>
            <span>随机片单</span>
            <DropdownSelect
              ariaLabel="随机片单来源"
              options={LOTTERY_SOURCE_OPTIONS}
              value={lotterySource}
              onValueChange={(nextSource) => dispatch(setFavoriteLotterySource(nextSource))}
            />
          </div>
          <LotteryBanner
            actionMode={lotterySource === 'allFavorites' ? 'readonly' : 'removeFromFavorite'}
            movies={lotteryMovies.map((item) => item.movie)}
            sourceType={lotterySource}
            variant="compact"
          />
        </div>

        {activeMovies.length > 0 ? (
          <MovieWaterfallGrid>
            {activeMovies.map(({ movie }) => (
              <MovieCard
                action={
                  <Button type="button" onClick={() => dispatch(removeMovieFromCollection({ movieId: movie.id }))}>
                    移除
                  </Button>
                }
                key={movie.id}
                movie={movie}
              />
            ))}
          </MovieWaterfallGrid>
        ) : (
          <StateResult
            action={
              <Button asChild>
                <Link to="/">去发现电影</Link>
              </Button>
            }
            description="回到首页搜索或浏览最新上映电影，把想看的电影加入收藏夹。"
            title={allMovies.length > 0 && activeMovieSet.size === 0 ? '当前收藏夹为空' : '还没有收藏电影'}
          />
        )}
      </main>
    </section>
  );
}
