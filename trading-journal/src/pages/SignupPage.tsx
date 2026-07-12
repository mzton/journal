/**
 * pages/SignupPage.tsx
 * ----------------------------------------------------------------------------
 * Public route at /signup. Mirrors LoginPage's shell around SignupForm.
 * ----------------------------------------------------------------------------
 */

import { Link } from 'react-router-dom';
import { SignupForm } from '../components/auth/SignupForm';
import { TrendingUpIcon } from '../components/common/icons';

export function SignupPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand brand--centered">
          <span className="brand-mark">
            <TrendingUpIcon size={20} />
          </span>
          <span className="brand-name">Ledger</span>
        </div>
        <p className="auth-tagline">Create an account to start journaling your trades.</p>

        <SignupForm />

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
