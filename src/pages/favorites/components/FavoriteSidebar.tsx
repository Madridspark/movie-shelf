import { Link } from 'react-router-dom';

import { DEFAULT_COLLECTION_ID, FavoriteCollection } from '@features/favorites/model/favorites-slice';
import { DropdownSelect, DropdownSelectOption } from '@shared/ui/dropdown-select';

import { CreateFavoriteDialog } from './CreateFavoriteDialog';
import styles from '../index.module.less';

function formatCollectionDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString();
}

type FavoriteSidebarProps = {
  activeCollectionId?: string;
  collectionOptions: DropdownSelectOption<string>[];
  collections: FavoriteCollection[];
  isCreateDialogOpen: boolean;
  newCollectionName: string;
  onActiveCollectionChange: (collectionId: string) => void;
  onCreateCollection: () => void;
  onCreateDialogOpenChange: (isOpen: boolean) => void;
  onNewCollectionNameChange: (name: string) => void;
};

export function FavoriteSidebar({
  activeCollectionId,
  collectionOptions,
  collections,
  isCreateDialogOpen,
  newCollectionName,
  onActiveCollectionChange,
  onCreateCollection,
  onCreateDialogOpenChange,
  onNewCollectionNameChange
}: FavoriteSidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <Link className={styles.logo} to="/">
        <img alt="MovieShelf" src="/assets/brand/movie-shelf-horizontal-white.png" />
      </Link>
      <h1>收藏夹</h1>
      <div className={styles.mobileCollectionSelect}>
        <DropdownSelect
          ariaLabel="切换收藏夹"
          options={collectionOptions}
          value={activeCollectionId ?? DEFAULT_COLLECTION_ID}
          onValueChange={onActiveCollectionChange}
        />
      </div>
      <div className={styles.collectionList}>
        {collections.map((collection) => (
          <button
            className={collection.id === activeCollectionId ? styles.activeCollection : undefined}
            key={collection.id}
            type="button"
            onClick={() => onActiveCollectionChange(collection.id)}
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
        <CreateFavoriteDialog
          isOpen={isCreateDialogOpen}
          name={newCollectionName}
          onCreate={onCreateCollection}
          onNameChange={onNewCollectionNameChange}
          onOpenChange={onCreateDialogOpenChange}
        />
      </div>
    </aside>
  );
}
