import { ButtonHTMLAttributes, ReactNode } from 'react';

import { Slot } from '@radix-ui/react-slot';
import clsx from 'clsx';

import styles from './index.module.less';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
  icon?: ReactNode;
};

export function Button({ asChild = false, children, className, icon, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button';

  if (asChild) {
    return (
      <Component className={clsx(styles.button, className)} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <Component className={clsx(styles.button, className)} {...props}>
      {icon}
      <span>{children}</span>
    </Component>
  );
}
