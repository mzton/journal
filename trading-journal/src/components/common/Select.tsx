/**
 * components/common/Select.tsx
 * ----------------------------------------------------------------------------
 * Labeled <select>, styled to match Input so form rows line up visually.
 * ----------------------------------------------------------------------------
 */

import { cn } from '../../utils/classNames';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
}

export function Select({ label, id, value, onChange, options, error }: SelectProps) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <select
        id={id}
        className={cn('field-control', error && 'field-control--error')}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
