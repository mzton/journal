/**
 * components/analytics/StatCard.tsx
 * ----------------------------------------------------------------------------
 * One tile in the dashboard's stat grid: a label, a big tabular-numeral
 * value, and an optional tone that colors the value (profit/loss).
 * ----------------------------------------------------------------------------
 */

import { Card } from '../common/Card';
import { cn } from '../../utils/classNames';

interface StatCardProps {
  label: string;
  value: string;
  tone?: 'profit' | 'loss' | 'neutral';
}

export function StatCard({ label, value, tone = 'neutral' }: StatCardProps) {
  return (
    <Card className="stat-card">
      <span className="stat-card-label">{label}</span>
      <span
        className={cn(
          'stat-card-value',
          'num',
          tone === 'profit' && 'text-profit',
          tone === 'loss' && 'text-loss',
        )}
      >
        {value}
      </span>
    </Card>
  );
}