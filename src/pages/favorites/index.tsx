import { useEffect, useMemo, useState } from 'react';

import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

import { getFavoritesStorageNotice } from '@features/favorites/model/favorites-storage';
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
import { DropdownSelectOption } from '@shared/ui/dropdown-select';
import { useAppDispatch, useAppSelector } from '@store/hooks';

import { FavoriteHeader } from './components/FavoriteHeader';
import { FavoriteLotteryPanel } from './components/FavoriteLotteryPanel';
import { FavoriteMovieGrid } from './components/FavoriteMovieGrid';
import { FavoriteSidebar } from './components/FavoriteSidebar';
import { FavoriteStorageNotice } from './components/FavoriteStorageNotice';
import { FavoritesPageSkeleton } from './components/FavoritesPageSkeleton';
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

export function FavoritesPage() {
  const dispatch = useAppDispatch();
  const collections = useAppSelector(selectFavoriteCollections);
  const activeCollection = useAppSelector(selectActiveCollection);
  const activeMovies = useAppSelector(selectActiveFavoriteMovies);
  const allMovies = useAppSelector(selectAllFavoriteMovies);
  const sortMode = useAppSelector(selectFavoriteSortMode);
  const lotterySource = useAppSelector(selectFavoriteLotterySource);
  const [isPageReady, setIsPageReady] = useState(false);
  const [storageNotice, setStorageNotice] = useState(() => getFavoritesStorageNotice());
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

  useEffect(() => {
    setIsPageReady(true);
  }, []);

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

  if (!isPageReady) {
    return <FavoritesPageSkeleton />;
  }

  return (
    <section className={styles.page}>
      <nav className={styles.topActions}>
        <Link aria-label="返回首页" to="/">
          <Home size={20} />
        </Link>
      </nav>

      <FavoriteSidebar
        activeCollectionId={activeCollection?.id}
        collectionOptions={collectionOptions}
        collections={collections}
        isCreateDialogOpen={isCreateDialogOpen}
        newCollectionName={newCollectionName}
        onActiveCollectionChange={handleActiveCollectionChange}
        onCreateCollection={handleCreateCollection}
        onCreateDialogOpenChange={(nextOpen) => {
          setIsCreateDialogOpen(nextOpen);

          if (!nextOpen) {
            setNewCollectionName('');
          }
        }}
        onNewCollectionNameChange={setNewCollectionName}
      />

      <main className={styles.main}>
        {storageNotice ? (
          <FavoriteStorageNotice notice={storageNotice} onDismiss={() => setStorageNotice(null)} />
        ) : null}

        <FavoriteHeader
          activeCollection={activeCollection}
          activeMovieCount={activeMovies.length}
          isDeleteDialogOpen={isDeleteDialogOpen}
          renameValue={renameValue}
          sortMode={sortMode}
          sortOptions={FAVORITE_SORT_OPTIONS}
          onDeleteCollection={handleDeleteCollection}
          onDeleteDialogOpenChange={setIsDeleteDialogOpen}
          onRenameCommit={handleRenameCollection}
          onRenameValueChange={setRenameValue}
          onSortModeChange={(nextSortMode) => dispatch(setFavoriteSortMode(nextSortMode))}
        />

        <FavoriteLotteryPanel
          lotteryMovies={lotteryMovies}
          lotterySource={lotterySource}
          sourceOptions={LOTTERY_SOURCE_OPTIONS}
          onLotterySourceChange={(nextSource) => dispatch(setFavoriteLotterySource(nextSource))}
        />

        <FavoriteMovieGrid
          activeMovieSet={activeMovieSet}
          allMovies={allMovies}
          movies={activeMovies}
          onRemoveMovie={(movieId) => dispatch(removeMovieFromCollection({ movieId }))}
        />
      </main>
    </section>
  );
}
