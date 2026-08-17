/**
 * context/TradeContext.tsx
 * ----------------------------------------------------------------------------
 * CRUD for the trade journal itself.
 * ----------------------------------------------------------------------------
 */

import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { Trade, TradeFormValues } from '../types';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

export interface TradeContextValue {
  trades: Trade[];
  isLoading: boolean;
  addTrade: (values: TradeFormValues, screenshotIds: string[]) => Promise<void>;
  updateTrade: (id: string, values: TradeFormValues, screenshotIds: string[]) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
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
    
    setIsLoading(true);
    api.trades.list()
      .then(({ trades: fetchedTrades }) => setTrades(fetchedTrades))
      .catch((err) => console.error('Failed to load trades:', err))
      .finally(() => setIsLoading(false));
  }, [currentUser]);

  async function addTrade(values: TradeFormValues, screenshotIds: string[]): Promise<void> {
    if (!currentUser) return;
    const { trade } = await api.trades.create(values, screenshotIds);
    setTrades((prev) => [trade, ...prev]);
  }

  async function updateTrade(id: string, values: TradeFormValues, screenshotIds: string[]): Promise<void> {
    if (!currentUser) return;
    const { trade } = await api.trades.update(id, values, screenshotIds);
    setTrades((prev) => prev.map((t) => (t.id === id ? trade : t)));
  }

  async function deleteTrade(id: string): Promise<void> {
    if (!currentUser) return;
    await api.trades.remove(id);
    setTrades((prev) => prev.filter((t) => t.id !== id));
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
