import { FavoritesStorageNotice as FavoritesStorageNoticeType } from '@features/favorites/model/favorites-storage';

import styles from '../index.module.less';

type FavoriteStorageNoticeProps = {
  notice: FavoritesStorageNoticeType;
  onDismiss: () => void;
};

export function FavoriteStorageNotice({ notice, onDismiss }: FavoriteStorageNoticeProps) {
  return (
    <div className={notice.variant === 'reset' ? styles.storageNoticeReset : styles.storageNotice}>
      <div>
        <strong>{notice.title}</strong>
        <p>{notice.message}</p>
      </div>
      <button type="button" onClick={onDismiss}>
        知道了
      </button>
    </div>
  );
}
