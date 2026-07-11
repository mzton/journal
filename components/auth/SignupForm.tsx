/**
 * components/auth/SignupForm.tsx
 * ----------------------------------------------------------------------------
 * Creates a new local account. Password confirmation and minimum length are
 * checked client-side before ever calling the auth context.
 * ----------------------------------------------------------------------------
 */

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isValidEmail } from '../../utils/validation';
import { Input } from '../common/Input';
import { Button } from '../common/Button';

const MIN_PASSWORD_LENGTH = 8;

export function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(name, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <Input id="signup-name" label="Name" value={name} onChange={setName} placeholder="Jane Trader" required />
      <Input
        id="signup-email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <Input
        id="signup-password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="At least 8 characters"
        autoComplete="new-password"
        required
      />
      <Input
        id="signup-confirm-password"
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="••••••••"
        autoComplete="new-password"
        required
      />

      {error && <p className="field-error">{error}</p>}

      <Button type="submit" variant="primary" disabled={isSubmitting} className="auth-submit">
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  );
}