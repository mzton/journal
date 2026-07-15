/**
 * components/trades/TradeFilters.tsx
 * ----------------------------------------------------------------------------
 * Controlled filter bar — TradesPage owns the TradeFilters state and passes
 * it down, so the filtering logic itself lives in one place
 * (utils/calculations.ts's applyTradeFilters).
 * ----------------------------------------------------------------------------
 */

import type { TradeFilters as TradeFiltersState } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

interface TradeFiltersProps {
  filters: TradeFiltersState;
  onChange: (filters: TradeFiltersState) => void;
}

export const EMPTY_FILTERS: TradeFiltersState = {
  search: '',
  positionType: 'all',
  status: 'all',
  outcome: 'all',
  dateFrom: '',
  dateTo: '',
};

export function TradeFilters({ filters, onChange }: TradeFiltersProps) {
  function set<K extends keyof TradeFiltersState>(key: K, value: TradeFiltersState[K]): void {
    onChange({ ...filters, [key]: value });
  }

  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <div className="trade-filters">
      <Input
        id="filter-search"
        label="Search"
        value={filters.search}
        onChange={(v) => set('search', v)}
        placeholder="Symbol or notes…"
      />
      <Select
        id="filter-position-type"
        label="Position"
        value={filters.positionType}
        onChange={(v) => set('positionType', v as TradeFiltersState['positionType'])}
        options={[
          { value: 'all', label: 'All' },
          { value: 'long', label: 'Long' },
          { value: 'short', label: 'Short' },
        ]}
      />
      <Select
        id="filter-status"
        label="Status"
        value={filters.status}
        onChange={(v) => set('status', v as TradeFiltersState['status'])}
        options={[
          { value: 'all', label: 'All' },
          { value: 'open', label: 'Open' },
          { value: 'closed', label: 'Closed' },
        ]}
      />
      <Select
        id="filter-outcome"
        label="Outcome"
        value={filters.outcome}
        onChange={(v) => set('outcome', v as TradeFiltersState['outcome'])}
        options={[
          { value: 'all', label: 'All' },
          { value: 'win', label: 'Wins' },
          { value: 'loss', label: 'Losses' },
        ]}
      />
      <Input
        id="filter-date-from"
        label="From"
        type="date"
        value={filters.dateFrom}
        onChange={(v) => set('dateFrom', v)}
      />
      <Input
        id="filter-date-to"
        label="To"
        type="date"
        value={filters.dateTo}
        onChange={(v) => set('dateTo', v)}
      />

      <Button
        variant="ghost"
        size="sm"
        className="trade-filters-clear"
        disabled={!hasActiveFilters}
        onClick={() => onChange(EMPTY_FILTERS)}
      >
        Clear filters
      </Button>
    </div>
  );
}
