/**
 * components/common/Badge.tsx
 * ----------------------------------------------------------------------------
 * A small pill for anything that needs an at-a-glance tone: Long/Short,
 * Open/Closed, Win/Loss. The `tone` prop maps straight to the profit/loss
 * color tokens defined in styles/theme.css, so it stays correct across
 * light and dark automatically.
 * ----------------------------------------------------------------------------
 */

import type { ReactNode } from 'react';
import { cn } from '../../utils/classNames';

type Tone = 'profit' | 'loss' | 'neutral' | 'accent' | 'warn';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return <span className={cn('badge', `badge--${tone}`)}>{children}</span>;
}
