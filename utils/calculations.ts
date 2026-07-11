/**
 * utils/calculations.ts
 * ----------------------------------------------------------------------------
 * All the trading math lives here, and nowhere else. Trades only ever store
 * the raw inputs (entry/exit price, quantity, stop-loss, take-profit); PnL
 * and R:R are always *derived* from those inputs on every render. That way
 * a bug fix or formula tweak applies retroactively to every trade instead
 * of requiring a data migration.
 *
 * Formulas used:
 *
 * PnL ($)      = (exit - entry) * quantity * direction - fees
 *                where direction is +1 for long, -1 for short
 * PnL (%)      = PnL / (entry * quantity) * 100
 *                — i.e. return on the capital committed at entry
 * Planned R:R  = |takeProfit - entry| / |entry - stopLoss|
 *                the "1:2" style ratio traders set *before* taking a trade
 * Realized R   = PnL / (|entry - stopLoss| * quantity)
 *                the "R-multiple" — how many multiples of your planned risk
 *                you actually made or lost. This is what most trading
 *                journals mean by "RR" once a trade is closed: +2R means you
 *                made twice what you were risking, -1R means you lost
 *                exactly your planned risk, -1.5R means the trade lost more
 *                than planned (e.g. slippage past the stop).
 * ----------------------------------------------------------------------------
 */

import type { AnalyticsSummary, DailyPnlSummary, Trade, TradeFilters, TradeMetrics } from '../types';

/** Computes PnL, PnL%, planned R:R, realized R-multiple, and win/loss for a
 *  single trade. Safe to call on open trades (exitPrice undefined) — PnL is
 *  reported as 0 and realizedR is left undefined since nothing is realized
 *  yet, but plannedRR is still computed if stop-loss & take-profit are set. */
export function calculateTradeMetrics(trade: Trade): TradeMetrics {
  const riskPerUnit =
    trade.stopLoss !== undefined ? Math.abs(trade.entryPrice - trade.stopLoss) : undefined;
  const riskAmount = riskPerUnit !== undefined ? riskPerUnit * trade.quantity : undefined;

  const plannedRR = (() => {
    if (riskPerUnit === undefined || riskPerUnit === 0 || trade.takeProfit === undefined) {
      return undefined;
    }
    const rewardPerUnit = Math.abs(trade.takeProfit - trade.entryPrice);
    return rewardPerUnit / riskPerUnit;
  })();

  if (trade.exitPrice === undefined) {
    return { pnl: 0, pnlPercent: 0, plannedRR, realizedR: undefined, isWin: false };
  }

  const direction = trade.positionType === 'long' ? 1 : -1;
  const grossPnl = (trade.exitPrice - trade.entryPrice) * trade.quantity * direction;
  const pnl = grossPnl - (trade.fees ?? 0);

  const costBasis = trade.entryPrice * trade.quantity;
  const pnlPercent = costBasis !== 0 ? (pnl / costBasis) * 100 : 0;

  const realizedR = riskAmount !== undefined && riskAmount !== 0 ? pnl / riskAmount : undefined;

  return { pnl, pnlPercent, plannedRR, realizedR, isWin: pnl > 0 };
}

/** Applies the Trades page filter bar to a list of trades. Pure function so
 *  it's trivial to memoize with useMemo at the call site. */
export function applyTradeFilters(trades: Trade[], filters: TradeFilters): Trade[] {
  const search = filters.search.trim().toLowerCase();

  return trades.filter((trade) => {
    if (search) {
      const haystack = `${trade.symbol} ${trade.notes ?? ''}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    if (filters.positionType !== 'all' && trade.positionType !== filters.positionType) return false;
    if (filters.status !== 'all' && trade.status !== filters.status) return false;

    if (filters.outcome !== 'all') {
      if (trade.status !== 'closed') return false;
      const { isWin, pnl } = calculateTradeMetrics(trade);
      if (filters.outcome === 'win' && !isWin) return false;
      if (filters.outcome === 'loss' && pnl >= 0) return false;
    }

    if (filters.dateFrom && trade.entryDate < filters.dateFrom) return false;
    if (filters.dateTo && trade.entryDate > filters.dateTo) return false;

    return true;
  });
}

/** Rolls a list of trades up into the headline stats shown on the Analytics
 *  dashboard. Only closed trades count toward PnL/win-rate/etc. — open
 *  positions are tracked separately since they have no realized outcome. */
export function calculateAnalyticsSummary(trades: Trade[]): AnalyticsSummary {
  const closed = trades.filter((t) => t.status === 'closed');
  const open = trades.filter((t) => t.status === 'open');
  const closedWithMetrics = closed.map((trade) => ({ trade, metrics: calculateTradeMetrics(trade) }));

  const wins = closedWithMetrics.filter((x) => x.metrics.pnl > 0);
  const losses = closedWithMetrics.filter((x) => x.metrics.pnl < 0);

  const totalPnl = closedWithMetrics.reduce((sum, x) => sum + x.metrics.pnl, 0);
  const grossProfit = wins.reduce((sum, x) => sum + x.metrics.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, x) => sum + x.metrics.pnl, 0));

  const rMultiples = closedWithMetrics
    .map((x) => x.metrics.realizedR)
    .filter((value): value is number => value !== undefined);

  const best = closedWithMetrics.reduce<(typeof closedWithMetrics)[number] | null>(
    (acc, x) => (!acc || x.metrics.pnl > acc.metrics.pnl ? x : acc),
    null,
  );
  const worst = closedWithMetrics.reduce<(typeof closedWithMetrics)[number] | null>(
    (acc, x) => (!acc || x.metrics.pnl < acc.metrics.pnl ? x : acc),
    null,
  );

  return {
    totalTrades: trades.length,
    closedTrades: closed.length,
    openTrades: open.length,
    totalPnl,
    winRate: closed.length ? (wins.length / closed.length) * 100 : 0,
    averageRR: rMultiples.length ? rMultiples.reduce((sum, v) => sum + v, 0) / rMultiples.length : 0,
    profitFactor: grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0,
    bestTrade: best?.trade ?? null,
    worstTrade: worst?.trade ?? null,
    averageWin: wins.length ? grossProfit / wins.length : 0,
    averageLoss: losses.length ? grossLoss / losses.length : 0,
  };
}

/** Groups closed trades by their exit date for the Calendar view. PnL% is
 *  cost-basis-weighted (total PnL / total capital committed that day) rather
 *  than a naive average, so a day with one huge trade and one tiny trade
 *  isn't skewed by treating both percentages as equally important. */
export function calculateDailySummaries(trades: Trade[]): DailyPnlSummary[] {
  const byDay = new Map<string, { pnl: number; costBasis: number; tradeCount: number }>();

  trades.forEach((trade) => {
    if (trade.status !== 'closed' || !trade.exitDate) return;
    const day = trade.exitDate;
    const { pnl } = calculateTradeMetrics(trade);
    const costBasis = trade.entryPrice * trade.quantity;

    const existing = byDay.get(day) ?? { pnl: 0, costBasis: 0, tradeCount: 0 };
    existing.pnl += pnl;
    existing.costBasis += costBasis;
    existing.tradeCount += 1;
    byDay.set(day, existing);
  });

  return Array.from(byDay.entries()).map(([date, agg]) => ({
    date,
    pnl: agg.pnl,
    pnlPercent: agg.costBasis !== 0 ? (agg.pnl / agg.costBasis) * 100 : 0,
    tradeCount: agg.tradeCount,
  }));
}