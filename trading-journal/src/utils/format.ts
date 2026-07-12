/**
 * utils/format.ts
 * ----------------------------------------------------------------------------
 * Every place a raw number turns into on-screen text goes through one of
 * these, so "how do we display money" is answered in exactly one place.
 * (Currency is fixed to USD for now — swap the Intl locale/currency here if
 * you need multi-currency support later.)
 * ----------------------------------------------------------------------------
 */

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  signDisplay: 'exceptZero',
});

const plainCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

/** "+$120.50" / "-$45.00" / "$0.00" — signed, for PnL figures. */
export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** "$120.50" — unsigned, for plain prices (entry/exit/stop/target). */
export function formatPrice(value: number): string {
  return plainCurrencyFormatter.format(value);
}

/** "+3.20%" / "-1.05%" / "0.00%". */
export function formatPercent(value: number, decimals = 2): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/** "+2.00R" / "-1.00R" / "—" when there's nothing to show (e.g. no
 *  stop-loss was set, so no risk was defined to measure against). */
export function formatR(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}R`;
}

/** "1.50" for a plain planned-RR ratio, or "—" if not set. */
export function formatRatio(value: number | undefined): string {
  if (value === undefined || !Number.isFinite(value)) return '—';
  return value.toFixed(2);
}

/** Profit factor renders specially: infinite (no losing trades yet) reads
 *  better as "∞" than "Infinity". */
export function formatProfitFactor(value: number): string {
  if (!Number.isFinite(value)) return '∞';
  return value.toFixed(2);
}
