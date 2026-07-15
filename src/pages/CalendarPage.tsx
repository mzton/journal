/**
 * pages/CalendarPage.tsx
 * ----------------------------------------------------------------------------
 * Route "/calendar". Owns the current month cursor and which day/trade is
 * currently drilled into. Reuses TradeDetailModal from the trades feature
 * so clicking a trade inside a day's list opens the same detail view used
 * on the Trades page.
 * ----------------------------------------------------------------------------
 */

import { useMemo, useState } from 'react';
import { useTrades } from '../hooks/useTrades';
import { calculateDailySummaries } from '../utils/calculations';
import { addMonths } from '../utils/dateHelpers';
import { CalendarGrid } from '../components/calendar/CalendarGrid';
import { DayDetailModal } from '../components/calendar/DayDetailModal';
import { TradeDetailModal } from '../components/trades/TradeDetailModal';

export function CalendarPage() {
  const { trades, getTradeById } = useTrades();

  const [monthCursor, setMonthCursor] = useState(() => addMonths(new Date(), 0));
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [viewingTradeId, setViewingTradeId] = useState<string | null>(null);

  const summaryByDate = useMemo(() => {
    const summaries = calculateDailySummaries(trades);
    return new Map(summaries.map((summary) => [summary.date, summary]));
  }, [trades]);

  const tradesForSelectedDay = useMemo(() => {
    if (!selectedDateKey) return [];
    return trades.filter((trade) => trade.status === 'closed' && trade.exitDate === selectedDateKey);
  }, [trades, selectedDateKey]);

  const viewingTrade = viewingTradeId ? (getTradeById(viewingTradeId) ?? null) : null;

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>Calendar</h1>
      </div>

      <CalendarGrid
        monthCursor={monthCursor}
        summaryByDate={summaryByDate}
        onSelectDay={setSelectedDateKey}
        onPrevMonth={() => setMonthCursor((current) => addMonths(current, -1))}
        onNextMonth={() => setMonthCursor((current) => addMonths(current, 1))}
        onToday={() => setMonthCursor(addMonths(new Date(), 0))}
      />

      <DayDetailModal
        dateKey={selectedDateKey}
        summary={selectedDateKey ? summaryByDate.get(selectedDateKey) : undefined}
        trades={tradesForSelectedDay}
        onClose={() => setSelectedDateKey(null)}
        onSelectTrade={setViewingTradeId}
      />

      <TradeDetailModal trade={viewingTrade} onClose={() => setViewingTradeId(null)} />
    </div>
  );
}
