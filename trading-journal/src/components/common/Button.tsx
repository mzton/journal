/**
 * components/common/Button.tsx
 * ----------------------------------------------------------------------------
 * The one button component the whole app uses. Styling lives in
 * styles/components.css under .btn / .btn--{variant} / .btn--sm, so every
 * button stays visually consistent without repeating utility classes.
 * ----------------------------------------------------------------------------
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/classNames';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'md' | 'sm';
  children: ReactNode;
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn('btn', `btn--${variant}`, size === 'sm' && 'btn--sm', className)}
      {...rest}
    >
      {children}
    </button>
  );
}
