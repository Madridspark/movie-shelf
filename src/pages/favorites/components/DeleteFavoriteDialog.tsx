import { Trash2 } from 'lucide-react';

import { DEFAULT_COLLECTION_ID, FavoriteCollection } from '@features/favorites/model/favorites-slice';
import * as Dialog from '@shared/ui/dialog';

import styles from '../index.module.less';

type DeleteFavoriteDialogProps = {
  activeCollection?: FavoriteCollection;
  isOpen: boolean;
  onDelete: () => void;
  onOpenChange: (isOpen: boolean) => void;
};

export function DeleteFavoriteDialog({
  activeCollection,
  isOpen,
  onDelete,
  onOpenChange
}: DeleteFavoriteDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
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
            <button type="button" onClick={onDelete}>
              确认删除
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
