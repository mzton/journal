/**
 * components/common/Input.tsx
 * ----------------------------------------------------------------------------
 * A labeled form field that renders either an <input> or a <textarea>,
 * chosen via the `multiline` discriminant. Reports changes as plain
 * strings (not raw events) so calling code stays terse:
 *
 *   <Input label="Symbol" id="symbol" value={form.symbol}
 *          onChange={(v) => setForm((f) => ({ ...f, symbol: v }))} />
 * ----------------------------------------------------------------------------
 */

import { cn } from '../../utils/classNames';

interface SharedProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
}

interface SingleLineProps extends SharedProps {
  multiline?: false;
  type?: 'text' | 'number' | 'date' | 'email' | 'password';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: string;
  autoComplete?: string;
}

interface MultiLineProps extends SharedProps {
  multiline: true;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

type InputProps = SingleLineProps | MultiLineProps;

export function Input(props: InputProps) {
  const { label, id, error, hint } = props;
  const controlClassName = cn('field-control', error && 'field-control--error');

  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>

      {props.multiline ? (
        <textarea
          id={id}
          className={controlClassName}
          value={props.value}
          placeholder={props.placeholder}
          rows={props.rows ?? 3}
          onChange={(event) => props.onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          type={props.type ?? 'text'}
          className={controlClassName}
          value={props.value}
          placeholder={props.placeholder}
          required={props.required}
          step={props.step}
          min={props.min}
          autoComplete={props.autoComplete}
          onChange={(event) => props.onChange(event.target.value)}
        />
      )}

      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
