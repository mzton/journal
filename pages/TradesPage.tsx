/**
 * pages/TradesPage.tsx
 * ----------------------------------------------------------------------------
 * Route "/trades" — the CRUD home base. Owns all the modal/dialog state
 * (which trade is being created, edited, viewed, or deleted) and wires it
 * to useTrades() for the actual persistence.
 * ----------------------------------------------------------------------------
 */

import { useMemo, useState } from 'react';
import type { Trade, TradeFilters as TradeFiltersState, TradeFormValues } from '../types';
import { useTrades } from '../hooks/useTrades';
import { applyTradeFilters } from '../utils/calculations';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { PlusIcon } from '../components/common/icons';
import { EMPTY_FILTERS, TradeFilters } from '../components/trades/TradeFilters';
import { TradeDetailModal } from '../components/trades/TradeDetailModal';
import { TradeForm } from '../components/trades/TradeForm';
import { TradeTable } from '../components/trades/TradeTable';

export function TradesPage() {
  const { trades, addTrade, updateTrade, deleteTrade, getTradeById } = useTrades();

  const [filters, setFilters] = useState<TradeFiltersState>(EMPTY_FILTERS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTradeId, setEditingTradeId] = useState<string | null>(null);
  const [viewingTradeId, setViewingTradeId] = useState<string | null>(null);
  const [deletingTradeId, setDeletingTradeId] = useState<string | null>(null);

  const filteredTrades = useMemo(() => applyTradeFilters(trades, filters), [trades, filters]);
  const editingTrade: Trade | undefined = editingTradeId ? getTradeById(editingTradeId) : undefined;
  const viewingTrade: Trade | null = viewingTradeId ? (getTradeById(viewingTradeId) ?? null) : null;

  function openCreateForm(): void {
    setEditingTradeId(null);
    setIsFormOpen(true);
  }

  function openEditForm(id: string): void {
    setEditingTradeId(id);
    setIsFormOpen(true);
  }

  function closeForm(): void {
    setIsFormOpen(false);
    setEditingTradeId(null);
  }

  function handleFormSubmit(values: TradeFormValues, screenshotIds: string[]): void {
    if (editingTradeId) {
      updateTrade(editingTradeId, values, screenshotIds);
    } else {
      addTrade(values, screenshotIds);
    }
    closeForm();
  }

  function handleConfirmDelete(): void {
    if (deletingTradeId) deleteTrade(deletingTradeId);
    setDeletingTradeId(null);
  }

  return (
    <div className="trades-page">
      <div className="page-header">
        <h1>Trades</h1>
        <Button variant="primary" onClick={openCreateForm}>
          <PlusIcon size={16} />
          Log trade
        </Button>
      </div>

      <TradeFilters filters={filters} onChange={setFilters} />

      {filteredTrades.length === 0 ? (
        <EmptyState
          title={trades.length === 0 ? 'No trades logged yet' : 'No trades match your filters'}
          description={
            trades.length === 0
              ? 'Log your first trade to start building your track record.'
              : 'Try adjusting or clearing the filters above.'
          }
          action={
            trades.length === 0 ? (
              <Button variant="primary" onClick={openCreateForm}>
                Log your first trade
              </Button>
            ) : undefined
          }
        />
      ) : (
        <TradeTable
          trades={filteredTrades}
          onView={setViewingTradeId}
          onEdit={openEditForm}
          onDelete={setDeletingTradeId}
        />
      )}

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingTradeId ? 'Edit trade' : 'Log a new trade'}
        maxWidth="lg"
      >
        <TradeForm initialTrade={editingTrade} onSubmit={handleFormSubmit} onCancel={closeForm} />
      </Modal>

      <TradeDetailModal trade={viewingTrade} onClose={() => setViewingTradeId(null)} />

      <ConfirmDialog
        isOpen={Boolean(deletingTradeId)}
        title="Delete trade"
        message="This permanently deletes the trade and any attached screenshots. This can't be undone."
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingTradeId(null)}
      />
    </div>
  );
}