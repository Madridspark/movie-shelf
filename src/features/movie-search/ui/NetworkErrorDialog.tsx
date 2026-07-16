import { RefreshCw } from 'lucide-react';

import * as Dialog from '@shared/ui/dialog';

import styles from './index.module.less';

type NetworkErrorDialogProps = {
  open: boolean;
  onRetry: () => void;
};

export function NetworkErrorDialog({ onRetry, open }: NetworkErrorDialogProps) {
  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.networkErrorOverlay} />
        <Dialog.Content className={styles.networkErrorContent}>
          <Dialog.Title className={styles.networkErrorTitle}>网络连接断开</Dialog.Title>
          <Dialog.Description className={styles.networkErrorDescription}>
            请检查网络连接后重试。
          </Dialog.Description>
          <button className={styles.networkErrorButton} type="button" onClick={onRetry}>
            <RefreshCw size={16} />
            <span>重试</span>
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
