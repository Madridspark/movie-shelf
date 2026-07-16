import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import { Check, ChevronDown } from 'lucide-react';

import styles from './index.module.less';

export type DropdownSelectOption<TValue extends string> = {
  disabled?: boolean;
  label: string;
  value: TValue;
};

type DropdownSelectProps<TValue extends string> = {
  ariaLabel: string;
  className?: string;
  options: DropdownSelectOption<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
};

export function DropdownSelect<TValue extends string>({
  ariaLabel,
  className,
  options,
  value,
  onValueChange
}: DropdownSelectProps<TValue>) {
  const activeOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger aria-label={ariaLabel} className={clsx(styles.trigger, className)}>
        <span>{activeOption?.label}</span>
        <ChevronDown size={16} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" className={styles.content} sideOffset={8}>
          {options.map((option) => (
            <DropdownMenu.Item
              className={styles.item}
              disabled={option.disabled}
              key={option.value}
              onSelect={() => onValueChange(option.value)}
            >
              <span>{option.label}</span>
              {option.value === value ? <Check size={16} /> : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
