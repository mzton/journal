/**
 * components/calendar/DayDetailModal.tsx
 * ----------------------------------------------------------------------------
 * Opened when a calendar cell with data is clicked. Lists that day's closed
 * trades; clicking one hands off to CalendarPage's shared TradeDetailModal
 * via onSelectTrade.
 * ----------------------------------------------------------------------------
 */

import type { DailyPnlSummary, Trade } from '../../types';
import { calculateTradeMetrics } from '../../utils/calculations';
import { formatDateShort } from '../../utils/dateHelpers';
import { formatCurrency, formatPercent } from '../../utils/format';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

interface DayDetailModalProps {
  dateKey: string | null;
  summary: DailyPnlSummary | undefined;
  trades: Trade[];
  onClose: () => void;
  onSelectTrade: (id: string) => void;
}

export function DayDetailModal({ dateKey, summary, trades, onClose, onSelectTrade }: DayDetailModalProps) {
  if (!dateKey) return null;

  return (
    <Modal isOpen={Boolean(dateKey)} onClose={onClose} title={formatDateShort(dateKey)}>
      {summary && (
        <div className="trade-preview">
          <div className="trade-preview-item">
            <span className="trade-preview-label">Net PnL</span>
            <span className={`num ${summary.pnl > 0 ? 'text-profit' : summary.pnl < 0 ? 'text-loss' : ''}`}>
              {formatCurrency(summary.pnl)}
            </span>
          </div>
          <div className="trade-preview-item">
            <span className="trade-preview-label">PnL %</span>
            <span className="num">{formatPercent(summary.pnlPercent)}</span>
          </div>
          <div className="trade-preview-item">
            <span className="trade-preview-label">Trades</span>
            <span className="num">{summary.tradeCount}</span>
          </div>
        </div>
      )}

      <ul className="day-trade-list">
        {trades.map((trade) => {
          const metrics = calculateTradeMetrics(trade);
          return (
            <li key={trade.id}>
              <button type="button" className="day-trade-list-item" onClick={() => onSelectTrade(trade.id)}>
                <span className="day-trade-list-symbol">{trade.symbol}</span>
                <Badge tone={trade.positionType === 'long' ? 'profit' : 'loss'}>
                  {trade.positionType === 'long' ? 'Long' : 'Short'}
                </Badge>
                <span className={`num ${metrics.pnl > 0 ? 'text-profit' : metrics.pnl < 0 ? 'text-loss' : ''}`}>
                  {formatCurrency(metrics.pnl)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Modal>
  );
}