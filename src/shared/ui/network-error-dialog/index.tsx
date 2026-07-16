import { RefreshCw } from 'lucide-react';

import * as Dialog from '@shared/ui/dialog';

import styles from './index.module.less';

type NetworkErrorDialogProps = {
  onRetry: () => void;
  open: boolean;
};

export function NetworkErrorDialog({ onRetry, open }: NetworkErrorDialogProps) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>网络连接断开</Dialog.Title>
          <Dialog.Description className={styles.description}>请检查网络连接后重试。</Dialog.Description>
          <button className={styles.retryButton} type="button" onClick={onRetry}>
            <RefreshCw size={16} />
            重新加载
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
