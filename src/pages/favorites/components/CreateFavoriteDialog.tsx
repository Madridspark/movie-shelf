import { Plus } from 'lucide-react';

import * as Dialog from '@shared/ui/dialog';

import styles from '../index.module.less';

type CreateFavoriteDialogProps = {
  isOpen: boolean;
  name: string;
  onCreate: () => void;
  onNameChange: (name: string) => void;
  onOpenChange: (isOpen: boolean) => void;
};

export function CreateFavoriteDialog({
  isOpen,
  name,
  onCreate,
  onNameChange,
  onOpenChange
}: CreateFavoriteDialogProps) {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
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
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="例如：周末片单"
            value={name}
          />
          <div className={styles.dialogFooter}>
            <Dialog.Close asChild>
              <button type="button">取消</button>
            </Dialog.Close>
            <button type="button" onClick={onCreate}>
              创建
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
