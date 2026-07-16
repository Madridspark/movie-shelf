import { FavoriteCollection, FavoriteSortMode } from '@features/favorites/model/favorites-slice';
import { DropdownSelect, DropdownSelectOption } from '@shared/ui/dropdown-select';

import { DeleteFavoriteDialog } from './DeleteFavoriteDialog';
import styles from '../index.module.less';

type FavoriteHeaderProps = {
  activeCollection?: FavoriteCollection;
  activeMovieCount: number;
  isDeleteDialogOpen: boolean;
  renameValue: string;
  sortMode: FavoriteSortMode;
  sortOptions: DropdownSelectOption<FavoriteSortMode>[];
  onDeleteCollection: () => void;
  onDeleteDialogOpenChange: (isOpen: boolean) => void;
  onRenameCommit: () => void;
  onRenameValueChange: (name: string) => void;
  onSortModeChange: (sortMode: FavoriteSortMode) => void;
};

export function FavoriteHeader({
  activeCollection,
  activeMovieCount,
  isDeleteDialogOpen,
  onDeleteCollection,
  onDeleteDialogOpenChange,
  onRenameCommit,
  onRenameValueChange,
  onSortModeChange,
  renameValue,
  sortMode,
  sortOptions
}: FavoriteHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <input
          aria-label="收藏夹名称"
          onBlur={onRenameCommit}
          onChange={(event) => onRenameValueChange(event.target.value)}
          value={renameValue}
        />
        <p>
          {activeMovieCount} 部电影 / 最近更新{' '}
          {activeCollection ? new Date(activeCollection.updatedAt).toLocaleDateString() : '-'}
        </p>
      </div>
      <div className={styles.headerActions}>
        <DropdownSelect
          ariaLabel="收藏夹排序"
          options={sortOptions}
          value={sortMode}
          onValueChange={onSortModeChange}
        />
        <DeleteFavoriteDialog
          activeCollection={activeCollection}
          isOpen={isDeleteDialogOpen}
          onDelete={onDeleteCollection}
          onOpenChange={onDeleteDialogOpenChange}
        />
      </div>
    </header>
  );
}
