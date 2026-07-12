/**
 * pages/DashboardPage.tsx
 * ----------------------------------------------------------------------------
 * Route "/". Rolls up every trade into the headline stats and three charts.
 * All the math is delegated to utils/calculations.ts — this file is just
 * shaping that data for display and layout.
 * ----------------------------------------------------------------------------
 */

import { useMemo } from 'react';
import { useTrades } from '../hooks/useTrades';
import { calculateAnalyticsSummary, calculateDailySummaries, calculateTradeMetrics } from '../utils/calculations';
import { parseLocalDate } from '../utils/dateHelpers';
import { formatCurrency, formatPercent, formatProfitFactor, formatR } from '../utils/format';
import { StatCard } from '../components/analytics/StatCard';
import { EquityCurveChart, SymbolPerformanceChart, WinLossChart } from '../components/analytics/PerformanceCharts';

/** Compact axis label, e.g. "Jul 11" — full dates would crowd the x-axis. */
function formatAxisDate(dateKey: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(parseLocalDate(dateKey));
}

export function DashboardPage() {
  const { trades, isLoading } = useTrades();

  const summary = useMemo(() => calculateAnalyticsSummary(trades), [trades]);

  const equityData = useMemo(() => {
    const daily = calculateDailySummaries(trades).sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    return daily.map((day) => {
      running += day.pnl;
      return { date: formatAxisDate(day.date), cumulativePnl: running };
    });
  }, [trades]);

  const symbolData = useMemo(() => {
    const totals = new Map<string, number>();
    trades
      .filter((trade) => trade.status === 'closed')
      .forEach((trade) => {
        const { pnl } = calculateTradeMetrics(trade);
        totals.set(trade.symbol, (totals.get(trade.symbol) ?? 0) + pnl);
      });
    return Array.from(totals.entries())
      .map(([symbol, pnl]) => ({ symbol, pnl }))
      .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
      .slice(0, 10);
  }, [trades]);

  const outcomeCounts = useMemo(() => {
    const closed = trades.filter((trade) => trade.status === 'closed');
    const wins = closed.filter((trade) => calculateTradeMetrics(trade).pnl > 0).length;
    const losses = closed.filter((trade) => calculateTradeMetrics(trade).pnl < 0).length;
    return { wins, losses, breakeven: closed.length - wins - losses };
  }, [trades]);

  if (isLoading) return null;

  const pnlTone = summary.totalPnl > 0 ? 'profit' : summary.totalPnl < 0 ? 'loss' : 'neutral';

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <div className="stat-grid">
        <StatCard label="Total PnL" value={formatCurrency(summary.totalPnl)} tone={pnlTone} />
        <StatCard label="Win rate" value={formatPercent(summary.winRate, 1)} />
        <StatCard label="Profit factor" value={formatProfitFactor(summary.profitFactor)} />
        <StatCard label="Avg R-multiple" value={formatR(summary.averageRR)} />
        <StatCard label="Closed trades" value={String(summary.closedTrades)} />
        <StatCard label="Open positions" value={String(summary.openTrades)} />
      </div>

      <EquityCurveChart data={equityData} />

      <div className="dashboard-charts-row">
        <SymbolPerformanceChart data={symbolData} />
        <WinLossChart wins={outcomeCounts.wins} losses={outcomeCounts.losses} breakeven={outcomeCounts.breakeven} />
      </div>
    </div>
  );
}
