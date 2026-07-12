/**
 * utils/validation.ts
 * ----------------------------------------------------------------------------
 * Plain validation functions returning a field -> error-message map. Kept
 * separate from the form components so the rules are easy to scan (and
 * easy to unit test later) without wading through JSX.
 * ----------------------------------------------------------------------------
 */

import type { TradeFormValues } from '../types';

export type TradeFormErrors = Partial<Record<keyof TradeFormValues, string>>;

/** Validates the raw string values coming straight out of <input> elements,
 *  before they're parsed into numbers — this is what lets us give a useful
 *  "Entry price is required" message instead of a silent NaN. */
export interface TradeFormInput {
  symbol: string;
  positionType: string;
  quantity: string;
  entryPrice: string;
  exitPrice: string;
  stopLoss: string;
  takeProfit: string;
  fees: string;
  entryDate: string;
  exitDate: string;
  notes: string;
}

export function validateTradeForm(input: TradeFormInput): TradeFormErrors {
  const errors: TradeFormErrors = {};

  if (!input.symbol.trim()) errors.symbol = 'Symbol is required.';

  const quantity = Number(input.quantity);
  if (!input.quantity || Number.isNaN(quantity) || quantity <= 0) {
    errors.quantity = 'Enter a quantity greater than 0.';
  }

  const entryPrice = Number(input.entryPrice);
  if (!input.entryPrice || Number.isNaN(entryPrice) || entryPrice <= 0) {
    errors.entryPrice = 'Enter an entry price greater than 0.';
  }

  if (!input.entryDate) errors.entryDate = 'Entry date is required.';

  // Exit price and exit date must be provided together, or not at all —
  // that's what determines whether the trade is "open" or "closed".
  const hasExitPrice = input.exitPrice.trim() !== '';
  const hasExitDate = input.exitDate.trim() !== '';
  if (hasExitPrice !== hasExitDate) {
    errors.exitPrice = 'Set both an exit price and exit date to close the trade, or leave both blank.';
  }
  if (hasExitPrice) {
    const exitPrice = Number(input.exitPrice);
    if (Number.isNaN(exitPrice) || exitPrice <= 0) {
      errors.exitPrice = 'Exit price must be greater than 0.';
    }
  }
  if (hasExitDate && input.entryDate && input.exitDate < input.entryDate) {
    errors.exitDate = 'Exit date cannot be before the entry date.';
  }

  if (input.stopLoss.trim() !== '' && Number(input.stopLoss) <= 0) {
    errors.stopLoss = 'Stop-loss must be greater than 0.';
  }
  if (input.takeProfit.trim() !== '' && Number(input.takeProfit) <= 0) {
    errors.takeProfit = 'Take-profit must be greater than 0.';
  }
  if (input.fees.trim() !== '' && Number(input.fees) < 0) {
    errors.fees = 'Fees cannot be negative.';
  }

  return errors;
}

/** Basic, permissive email shape check — good enough for a local-only demo
 *  auth system, not meant to be a strict RFC validator. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
