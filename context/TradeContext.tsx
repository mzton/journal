/**
 * context/TradeContext.tsx
 * ----------------------------------------------------------------------------
 * CRUD for the trade journal itself. Trades are namespaced per user
 * (STORAGE_KEYS.trades(userId)) so switching accounts on the same device
 * never mixes journals together.
 *
 * This context depends on AuthContext (via useAuth) to know *whose* trades
 * to load — AuthProvider must be an ancestor of TradeProvider in the tree
 * (see App.tsx).
 * ----------------------------------------------------------------------------
 */

import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Trade, TradeFormValues } from '../types';
import { useAuth } from '../hooks/useAuth';
import { deleteScreenshot } from '../utils/screenshotStore';
import { readJSON, STORAGE_KEYS, writeJSON } from '../utils/storage';

export interface TradeContextValue {
  trades: Trade[];
  isLoading: boolean;
  addTrade: (values: TradeFormValues, screenshotIds: string[]) => void;
  updateTrade: (id: string, values: TradeFormValues, screenshotIds: string[]) => void;
  deleteTrade: (id: string) => void;
  getTradeById: (id: string) => Trade | undefined;
}

export const TradeContext = createContext<TradeContextValue | undefined>(undefined);

export function TradeProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load (or clear) the journal whenever the logged-in user changes.
  useEffect(() => {
    if (!currentUser) {
      setTrades([]);
      setIsLoading(false);
      return;
    }
    setTrades(readJSON<Trade[]>(STORAGE_KEYS.trades(currentUser.id), []));
    setIsLoading(false);
  }, [currentUser]);

  function persist(userId: string, next: Trade[]): void {
    writeJSON(STORAGE_KEYS.trades(userId), next);
  }

  function addTrade(values: TradeFormValues, screenshotIds: string[]): void {
    if (!currentUser) return;
    const now = new Date().toISOString();
    const trade: Trade = {
      ...values,
      id: crypto.randomUUID(),
      userId: currentUser.id,
      status: values.exitPrice !== undefined ? 'closed' : 'open',
      screenshotIds,
      createdAt: now,
      updatedAt: now,
    };
    setTrades((prev) => {
      const next = [trade, ...prev];
      persist(currentUser.id, next);
      return next;
    });
  }

  function updateTrade(id: string, values: TradeFormValues, screenshotIds: string[]): void {
    if (!currentUser) return;
    setTrades((prev) => {
      const next = prev.map((trade) =>
        trade.id === id
          ? {
              ...trade,
              ...values,
              status: (values.exitPrice !== undefined ? 'closed' : 'open') as Trade['status'],
              screenshotIds,
              updatedAt: new Date().toISOString(),
            }
          : trade,
      );
      persist(currentUser.id, next);
      return next;
    });
  }

  function deleteTrade(id: string): void {
    if (!currentUser) return;
    const trade = trades.find((t) => t.id === id);
    trade?.screenshotIds?.forEach((screenshotId) => {
      void deleteScreenshot(screenshotId);
    });
    setTrades((prev) => {
      const next = prev.filter((t) => t.id !== id);
      persist(currentUser.id, next);
      return next;
    });
  }

  function getTradeById(id: string): Trade | undefined {
    return trades.find((trade) => trade.id === id);
  }

  return (
    <TradeContext.Provider
      value={{ trades, isLoading, addTrade, updateTrade, deleteTrade, getTradeById }}
    >
      {children}
    </TradeContext.Provider>
  );
}