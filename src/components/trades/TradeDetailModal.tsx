/**
 * components/trades/TradeDetailModal.tsx
 * ----------------------------------------------------------------------------
 * Read-only view of a single trade — every field plus its derived metrics,
 * and a screenshot gallery reusing ScreenshotThumbnail in read-only mode
 * (no `onRemove` passed in).
 * ----------------------------------------------------------------------------
 */

import type { Trade } from '../../types';
import { calculateTradeMetrics } from '../../utils/calculations';
import { formatDateShort } from '../../utils/dateHelpers';
import { formatCurrency, formatLeverage, formatPercent, formatPrice, formatR, formatRatio } from '../../utils/format';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { ScreenshotThumbnail } from './ScreenshotUpload';

interface TradeDetailModalProps {
  trade: Trade | null;
  onClose: () => void;
}

export function TradeDetailModal({ trade, onClose }: TradeDetailModalProps) {
  if (!trade) return null;

  const metrics = calculateTradeMetrics(trade);
  const pnlClass = metrics.pnl > 0 ? 'text-profit' : metrics.pnl < 0 ? 'text-loss' : '';

  return (
    <Modal isOpen={Boolean(trade)} onClose={onClose} title={trade.symbol} maxWidth="lg">
      <div className="trade-detail">
        <div className="trade-detail-header">
          <Badge tone={trade.positionType === 'long' ? 'profit' : 'loss'}>
            {trade.positionType === 'long' ? 'Long' : 'Short'}
          </Badge>
          <Badge tone={trade.status === 'open' ? 'warn' : 'neutral'}>
            {trade.status === 'open' ? 'Open' : 'Closed'}
          </Badge>
        </div>

        <div className="trade-detail-grid">
          <DetailField label="Quantity" value={String(trade.quantity)} />
          <DetailField label="Leverage" value={formatLeverage(trade.leverage ?? 1)} />
          <DetailField label="Margin used" value={formatPrice(metrics.marginUsed)} />
          <DetailField label="Entry price" value={trade.entryPrice.toFixed(2)} />
          <DetailField label="Exit price" value={trade.exitPrice !== undefined ? trade.exitPrice.toFixed(2) : '—'} />
          <DetailField label="Stop-loss" value={trade.stopLoss !== undefined ? trade.stopLoss.toFixed(2) : '—'} />
          <DetailField label="Take-profit" value={trade.takeProfit !== undefined ? trade.takeProfit.toFixed(2) : '—'} />
          <DetailField label="Fees" value={trade.fees !== undefined ? trade.fees.toFixed(2) : '—'} />
          <DetailField label="Entry date" value={formatDateShort(trade.entryDate)} />
          <DetailField label="Exit date" value={trade.exitDate ? formatDateShort(trade.exitDate) : '—'} />
        </div>

        <div className="trade-preview">
          <div className="trade-preview-item">
            <span className="trade-preview-label">Planned R:R</span>
            <span className="num">{formatRatio(metrics.plannedRR)}</span>
          </div>
          <div className="trade-preview-item">
            <span className="trade-preview-label">PnL</span>
            <span className={`num ${pnlClass}`}>{trade.status === 'closed' ? formatCurrency(metrics.pnl) : '—'}</span>
          </div>
          <div className="trade-preview-item">
            <span className="trade-preview-label">PnL % (ROE)</span>
            <span className={`num ${pnlClass}`}>
              {trade.status === 'closed' ? formatPercent(metrics.pnlPercent) : '—'}
            </span>
          </div>
          <div className="trade-preview-item">
            <span className="trade-preview-label">Realized R</span>
            <span className="num">{trade.status === 'closed' ? formatR(metrics.realizedR) : '—'}</span>
          </div>
        </div>

        {trade.notes && (
          <div className="trade-detail-notes">
            <h4>Notes</h4>
            <p>{trade.notes}</p>
          </div>
        )}

        {trade.screenshotIds && trade.screenshotIds.length > 0 && (
          <div className="trade-detail-notes">
            <h4>Screenshots</h4>
            <div className="screenshot-grid">
              {trade.screenshotIds.map((id) => (
                <ScreenshotThumbnail key={id} id={id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="trade-detail-field">
      <span className="trade-detail-field-label">{label}</span>
      <span className="num">{value}</span>
    </div>
  );
}
