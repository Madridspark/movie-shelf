import { Heart } from 'lucide-react';

import { FavoriteCollection } from '@features/favorites/model/favorites-slice';
import { Checkbox } from '@shared/ui/checkbox';
import * as Dialog from '@shared/ui/dialog';

import styles from '../index.module.less';

type FavoriteMenuProps = {
  collections: FavoriteCollection[];
  isDialogOpen: boolean;
  isInDefaultCollection: boolean;
  newCollectionName: string;
  selectedCollectionIds: string[];
  onCreateCollection: () => void;
  onDialogOpenChange: (isOpen: boolean) => void;
  onNewCollectionNameChange: (name: string) => void;
  onSaveSelectedCollections: () => void;
  onToggleDefaultCollection: () => void;
  onToggleSelectedCollection: (collectionId: string) => void;
};

export function FavoriteMenu({
  collections,
  isDialogOpen,
  isInDefaultCollection,
  newCollectionName,
  onCreateCollection,
  onDialogOpenChange,
  onNewCollectionNameChange,
  onSaveSelectedCollections,
  onToggleDefaultCollection,
  onToggleSelectedCollection,
  selectedCollectionIds
}: FavoriteMenuProps) {
  return (
    <>
      <button
        aria-label={isInDefaultCollection ? '从默认收藏夹移除' : '加入默认收藏夹'}
        className={isInDefaultCollection ? styles.defaultFavoriteActive : styles.defaultFavoriteButton}
        type="button"
        onClick={onToggleDefaultCollection}
      >
        <Heart fill={isInDefaultCollection ? 'currentColor' : 'none'} size={18} />
      </button>
      <Dialog.Root open={isDialogOpen} onOpenChange={onDialogOpenChange}>
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
                  onCheckedChange={() => onToggleSelectedCollection(collection.id)}
                />
              ))}
            </div>
            <div className={styles.dialogCreateRow}>
              <input
                aria-label="新收藏夹名称"
                onChange={(event) => onNewCollectionNameChange(event.target.value)}
                placeholder="新建收藏夹"
                value={newCollectionName}
              />
              <button type="button" onClick={onCreateCollection}>
                创建并选中
              </button>
            </div>
            <div className={styles.dialogFooter}>
              <Dialog.Close asChild>
                <button type="button">取消</button>
              </Dialog.Close>
              <button type="button" onClick={onSaveSelectedCollections}>
                保存
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
