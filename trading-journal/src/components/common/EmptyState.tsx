/**
 * components/common/EmptyState.tsx
 * ----------------------------------------------------------------------------
 * Shown wherever a list could be empty: no trades logged yet, a filter that
 * matched nothing, no closed trades to chart yet. Treats emptiness as an
 * invitation to act rather than a dead end (per the design brief) — always
 * pair this with a next step via `action` where one makes sense.
 * ----------------------------------------------------------------------------
 */

import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
