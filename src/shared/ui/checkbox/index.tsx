import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import styles from './index.module.less';

type CheckboxProps = {
  checked: boolean;
  label: string;
  meta?: string;
  onCheckedChange: (checked: boolean) => void;
};

export function Checkbox({ checked, label, meta, onCheckedChange }: CheckboxProps) {
  return (
    <label className={styles.option}>
      <CheckboxPrimitive.Root
        checked={checked}
        className={styles.checkbox}
        onCheckedChange={(nextChecked) => onCheckedChange(nextChecked === true)}
      >
        <CheckboxPrimitive.Indicator className={styles.indicator}>
          <Check size={14} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      <span>{label}</span>
      {meta ? <em>{meta}</em> : null}
    </label>
  );
}
