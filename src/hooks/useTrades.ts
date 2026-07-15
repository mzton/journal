import { useContext } from 'react';
import { TradeContext, type TradeContextValue } from '../context/TradeContext';

/** Access the current user's trades and CRUD actions. Must be called from
 *  inside <TradeProvider>. */
export function useTrades(): TradeContextValue {
  const ctx = useContext(TradeContext);
  if (!ctx) throw new Error('useTrades must be used within a TradeProvider');
  return ctx;
}
