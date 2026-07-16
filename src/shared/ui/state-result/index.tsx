import { ReactNode } from 'react';

import styles from './index.module.less';

type StateResultProps = {
  action?: ReactNode;
  description?: string;
  title: string;
  variant?: 'error' | 'empty';
};

export function StateResult({ action, description, title, variant = 'empty' }: StateResultProps) {
  return (
    <div className={variant === 'error' ? styles.error : styles.empty}>
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
