import { PropsWithChildren, ReactNode } from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import styles from './index.module.less';

type TooltipProps = PropsWithChildren<{
  content: ReactNode;
}>;

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={180}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className={styles.content} sideOffset={8}>
            {content}
            <TooltipPrimitive.Arrow className={styles.arrow} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

