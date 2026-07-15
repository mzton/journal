/**
 * components/calendar/CalendarGrid.tsx
 * ----------------------------------------------------------------------------
 * Renders one month as a 7-column grid. Each day that had closed trades
 * shows its net PnL and PnL%; clicking it opens DayDetailModal (wired up by
 * CalendarPage). Days outside the current month render as blank filler
 * cells (see utils/dateHelpers.buildMonthGrid).
 * ----------------------------------------------------------------------------
 */

import type { DailyPnlSummary } from '../../types';
import { buildMonthGrid, formatMonthYear, isSameDay, toDateKey } from '../../utils/dateHelpers';
import { formatCurrency } from '../../utils/format';
import { cn } from '../../utils/classNames';
import { ChevronLeftIcon, ChevronRightIcon } from '../common/icons';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarGridProps {
  monthCursor: Date;
  summaryByDate: Map<string, DailyPnlSummary>;
  onSelectDay: (dateKey: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarGrid({
  monthCursor,
  summaryByDate,
  onSelectDay,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarGridProps) {
  const cells = buildMonthGrid(monthCursor);
  const today = new Date();

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h2>{formatMonthYear(monthCursor)}</h2>
        <div className="calendar-nav">
          <button type="button" className="icon-button" onClick={onPrevMonth} aria-label="Previous month">
            <ChevronLeftIcon size={18} />
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onToday}>
            Today
          </button>
          <button type="button" className="icon-button" onClick={onNextMonth} aria-label="Next month">
            <ChevronRightIcon size={18} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((date, index) => {
          if (!date) return <div key={`blank-${index}`} className="calendar-cell calendar-cell--blank" />;

          const dateKey = toDateKey(date);
          const summary = summaryByDate.get(dateKey);
          const isToday = isSameDay(date, today);
          const pnlClass = summary ? (summary.pnl > 0 ? 'text-profit' : summary.pnl < 0 ? 'text-loss' : '') : '';

          return (
            <button
              key={dateKey}
              type="button"
              className={cn('calendar-cell', isToday && 'calendar-cell--today', summary && 'calendar-cell--has-data')}
              onClick={() => summary && onSelectDay(dateKey)}
              disabled={!summary}
            >
              <span className="calendar-cell-date">{date.getDate()}</span>
              {summary && (
                <span className={cn('calendar-cell-pnl', 'num', pnlClass)}>{formatCurrency(summary.pnl)}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
