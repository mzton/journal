/**
 * components/trades/TradeTable.tsx
 * ----------------------------------------------------------------------------
 * Renders a list of trades (already filtered by the caller) as a table,
 * with per-row view/edit/delete actions. Assumes `trades` is non-empty —
 * TradesPage is responsible for showing an EmptyState instead when it isn't.
 * ----------------------------------------------------------------------------
 */

import type { Trade } from '../../types';
import { calculateTradeMetrics } from '../../utils/calculations';
import { formatDateShort } from '../../utils/dateHelpers';
import { formatCurrency, formatLeverage, formatPercent, formatR } from '../../utils/format';
import { Badge } from '../common/Badge';
import { EyeIcon, PencilIcon, TrashIcon } from '../common/icons';

interface TradeTableProps {
  trades: Trade[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TradeTable({ trades, onView, onEdit, onDelete }: TradeTableProps) {
  const sorted = [...trades].sort((a, b) => b.entryDate.localeCompare(a.entryDate));

  return (
    <div className="table-scroll">
      <table className="trade-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Type</th>
            <th>Lev.</th>
            <th>Status</th>
            <th>Entry</th>
            <th>Exit</th>
            <th>Qty</th>
            <th>PnL</th>
            <th>PnL %</th>
            <th>R</th>
            <th>Entry date</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((trade) => {
            const metrics = calculateTradeMetrics(trade);
            const pnlClass = metrics.pnl > 0 ? 'text-profit' : metrics.pnl < 0 ? 'text-loss' : '';

            return (
              <tr key={trade.id}>
                <td className="trade-table-symbol">{trade.symbol}</td>
                <td>
                  <Badge tone={trade.positionType === 'long' ? 'profit' : 'loss'}>
                    {trade.positionType === 'long' ? 'Long' : 'Short'}
                  </Badge>
                </td>
                <td className="num">{formatLeverage(trade.leverage ?? 1)}</td>
                <td>
                  <Badge tone={trade.status === 'open' ? 'warn' : 'neutral'}>
                    {trade.status === 'open' ? 'Open' : 'Closed'}
                  </Badge>
                </td>
                <td className="num">{trade.entryPrice.toFixed(2)}</td>
                <td className="num">{trade.exitPrice !== undefined ? trade.exitPrice.toFixed(2) : '—'}</td>
                <td className="num">{trade.quantity}</td>
                <td className={`num ${pnlClass}`}>{trade.status === 'closed' ? formatCurrency(metrics.pnl) : '—'}</td>
                <td className={`num ${pnlClass}`}>
                  {trade.status === 'closed' ? formatPercent(metrics.pnlPercent) : '—'}
                </td>
                <td className="num">{trade.status === 'closed' ? formatR(metrics.realizedR) : '—'}</td>
                <td>{formatDateShort(trade.entryDate)}</td>
                <td>
                  <div className="trade-table-actions">
                    <button type="button" className="icon-button" onClick={() => onView(trade.id)} aria-label={`View ${trade.symbol}`}>
                      <EyeIcon size={16} />
                    </button>
                    <button type="button" className="icon-button" onClick={() => onEdit(trade.id)} aria-label={`Edit ${trade.symbol}`}>
                      <PencilIcon size={16} />
                    </button>
                    <button
                      type="button"
                      className="icon-button icon-button--danger"
                      onClick={() => onDelete(trade.id)}
                      aria-label={`Delete ${trade.symbol}`}
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
