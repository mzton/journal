/**
 * components/trades/TradeForm.tsx
 * ----------------------------------------------------------------------------
 * Used for both creating and editing a trade — pass `initialTrade` to
 * pre-fill it in edit mode. All numeric fields are kept as strings in form
 * state (so an input can be legitimately empty or mid-edit like "12.") and
 * only converted to numbers on submit, after validation.
 *
 * The live preview panel re-runs calculateTradeMetrics on every keystroke
 * against a throwaway draft Trade, so the user sees projected PnL/RR update
 * before they've saved anything.
 * ----------------------------------------------------------------------------
 */

import { useMemo, useState, type FormEvent } from 'react';
import type { PositionType, Trade, TradeFormValues } from '../../types';
import { calculateTradeMetrics } from '../../utils/calculations';
import { todayKey } from '../../utils/dateHelpers';
import { formatCurrency, formatPercent, formatPrice, formatR, formatRatio } from '../../utils/format';
import { validateTradeForm, type TradeFormErrors, type TradeFormInput } from '../../utils/validation';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { ScreenshotUpload } from './ScreenshotUpload';

interface TradeFormProps {
  /** Pass the existing trade to edit it; omit to create a new one. */
  initialTrade?: Trade;
  onSubmit: (values: TradeFormValues, screenshotIds: string[]) => void;
  onCancel: () => void;
}

function tradeToFormInput(trade?: Trade): TradeFormInput {
  return {
    symbol: trade?.symbol ?? '',
    positionType: trade?.positionType ?? 'long',
    quantity: trade?.quantity !== undefined ? String(trade.quantity) : '',
    leverage: trade?.leverage !== undefined ? String(trade.leverage) : '1',
    entryPrice: trade?.entryPrice !== undefined ? String(trade.entryPrice) : '',
    exitPrice: trade?.exitPrice !== undefined ? String(trade.exitPrice) : '',
    stopLoss: trade?.stopLoss !== undefined ? String(trade.stopLoss) : '',
    takeProfit: trade?.takeProfit !== undefined ? String(trade.takeProfit) : '',
    fees: trade?.fees !== undefined ? String(trade.fees) : '',
    entryDate: trade?.entryDate ?? todayKey(),
    exitDate: trade?.exitDate ?? '',
    notes: trade?.notes ?? '',
  };
}

export function TradeForm({ initialTrade, onSubmit, onCancel }: TradeFormProps) {
  const [values, setValues] = useState<TradeFormInput>(() => tradeToFormInput(initialTrade));
  const [screenshotIds, setScreenshotIds] = useState<string[]>(initialTrade?.screenshotIds ?? []);
  const [errors, setErrors] = useState<TradeFormErrors>({});

  function updateField<K extends keyof TradeFormInput>(field: K, value: string): void {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  const preview = useMemo(() => {
    const quantity = Number(values.quantity);
    const entryPrice = Number(values.entryPrice);
    if (!quantity || !entryPrice) return null;

    const draft: Trade = {
      id: 'preview',
      userId: 'preview',
      symbol: values.symbol,
      positionType: values.positionType as PositionType,
      quantity,
      leverage: values.leverage.trim() !== '' ? Number(values.leverage) : 1,
      entryPrice,
      exitPrice: values.exitPrice.trim() !== '' ? Number(values.exitPrice) : undefined,
      stopLoss: values.stopLoss.trim() !== '' ? Number(values.stopLoss) : undefined,
      takeProfit: values.takeProfit.trim() !== '' ? Number(values.takeProfit) : undefined,
      fees: values.fees.trim() !== '' ? Number(values.fees) : undefined,
      entryDate: values.entryDate,
      exitDate: values.exitDate || undefined,
      status: values.exitPrice.trim() !== '' ? 'closed' : 'open',
      notes: values.notes,
      createdAt: '',
      updatedAt: '',
    };
    return calculateTradeMetrics(draft);
  }, [values]);

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    const validationErrors = validateTradeForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const tradeValues: TradeFormValues = {
      symbol: values.symbol.trim().toUpperCase(),
      positionType: values.positionType as PositionType,
      quantity: Number(values.quantity),
      leverage: Number(values.leverage),
      entryPrice: Number(values.entryPrice),
      exitPrice: values.exitPrice.trim() !== '' ? Number(values.exitPrice) : undefined,
      stopLoss: values.stopLoss.trim() !== '' ? Number(values.stopLoss) : undefined,
      takeProfit: values.takeProfit.trim() !== '' ? Number(values.takeProfit) : undefined,
      fees: values.fees.trim() !== '' ? Number(values.fees) : undefined,
      entryDate: values.entryDate,
      exitDate: values.exitDate.trim() !== '' ? values.exitDate : undefined,
      notes: values.notes.trim() !== '' ? values.notes.trim() : undefined,
    };
    onSubmit(tradeValues, screenshotIds);
  }

  return (
    <form className="trade-form" onSubmit={handleSubmit}>
      <div className="trade-form-grid">
        <Input
          id="trade-symbol"
          label="Symbol"
          value={values.symbol}
          onChange={(v) => updateField('symbol', v.toUpperCase())}
          placeholder="AAPL"
          error={errors.symbol}
          required
        />
        <Select
          id="trade-position-type"
          label="Position"
          value={values.positionType}
          onChange={(v) => updateField('positionType', v)}
          options={[
            { value: 'long', label: 'Long' },
            { value: 'short', label: 'Short' },
          ]}
        />
        <Input
          id="trade-quantity"
          label="Quantity"
          type="number"
          step="any"
          min="0"
          value={values.quantity}
          onChange={(v) => updateField('quantity', v)}
          error={errors.quantity}
          required
        />
        <Input
          id="trade-leverage"
          label="Leverage"
          type="number"
          step="1"
          min="1"
          value={values.leverage}
          onChange={(v) => updateField('leverage', v)}
          error={errors.leverage}
          hint="1x = no leverage"
          required
        />

        <Input
          id="trade-entry-price"
          label="Entry price"
          type="number"
          step="any"
          min="0"
          value={values.entryPrice}
          onChange={(v) => updateField('entryPrice', v)}
          error={errors.entryPrice}
          required
        />
        <Input
          id="trade-exit-price"
          label="Exit price"
          type="number"
          step="any"
          min="0"
          value={values.exitPrice}
          onChange={(v) => updateField('exitPrice', v)}
          error={errors.exitPrice}
          hint="Leave blank while still open"
        />
        <Input
          id="trade-fees"
          label="Fees"
          type="number"
          step="any"
          min="0"
          value={values.fees}
          onChange={(v) => updateField('fees', v)}
          error={errors.fees}
          hint="Commission, spread, swap"
        />

        <Input
          id="trade-stop-loss"
          label="Stop-loss"
          type="number"
          step="any"
          min="0"
          value={values.stopLoss}
          onChange={(v) => updateField('stopLoss', v)}
          error={errors.stopLoss}
          hint="Defines risk for R:R"
        />
        <Input
          id="trade-take-profit"
          label="Take-profit"
          type="number"
          step="any"
          min="0"
          value={values.takeProfit}
          onChange={(v) => updateField('takeProfit', v)}
          error={errors.takeProfit}
          hint="Defines planned reward"
        />
        <Input
          id="trade-entry-date"
          label="Entry date"
          type="date"
          value={values.entryDate}
          onChange={(v) => updateField('entryDate', v)}
          error={errors.entryDate}
          required
        />

        <Input
          id="trade-exit-date"
          label="Exit date"
          type="date"
          value={values.exitDate}
          onChange={(v) => updateField('exitDate', v)}
          error={errors.exitDate}
        />
      </div>

      {preview && (
        <div className="trade-preview">
          <div className="trade-preview-item">
            <span className="trade-preview-label">Margin used</span>
            <span className="num">{formatPrice(preview.marginUsed)}</span>
          </div>
          <div className="trade-preview-item">
            <span className="trade-preview-label">Planned R:R</span>
            <span className="num">{formatRatio(preview.plannedRR)}</span>
          </div>
          <div className="trade-preview-item">
            <span className="trade-preview-label">Projected PnL</span>
            <span className={`num ${preview.pnl > 0 ? 'text-profit' : preview.pnl < 0 ? 'text-loss' : ''}`}>
              {formatCurrency(preview.pnl)}
            </span>
          </div>
          <div className="trade-preview-item">
            <span className="trade-preview-label">PnL % (ROE)</span>
            <span className="num">{formatPercent(preview.pnlPercent)}</span>
          </div>
          <div className="trade-preview-item">
            <span className="trade-preview-label">Realized R</span>
            <span className="num">{formatR(preview.realizedR)}</span>
          </div>
        </div>
      )}

      <Input
        id="trade-notes"
        label="Notes"
        multiline
        rows={3}
        value={values.notes}
        onChange={(v) => updateField('notes', v)}
        placeholder="Setup, thesis, mistakes, lessons learned…"
      />

      <ScreenshotUpload screenshotIds={screenshotIds} onChange={setScreenshotIds} />

      <div className="modal-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initialTrade ? 'Save changes' : 'Log trade'}
        </Button>
      </div>
    </form>
  );
}
