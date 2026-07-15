/**
 * components/common/Card.tsx
 * ----------------------------------------------------------------------------
 * The basic surface primitive — a rounded, bordered panel. Almost every
 * piece of UI in the app (stat tiles, the trade table, chart panels, the
 * auth forms) sits inside one of these, so its shadow/radius/background
 * define most of the app's visual identity in one CSS rule (see .card in
 * styles/components.css).
 * ----------------------------------------------------------------------------
 */

import type { ReactNode } from 'react';
import { cn } from '../../utils/classNames';

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Optional heading rendered inside the card, above `children`. */
  title?: string;
}

export function Card({ children, className, title }: CardProps) {
  return (
    <div className={cn('card', className)}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </div>
  );
}
