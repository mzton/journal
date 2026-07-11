/**
 * pages/LoginPage.tsx
 * ----------------------------------------------------------------------------
 * Public route at /login. The actual form logic lives in
 * components/auth/LoginForm.tsx — this page is just the branded shell
 * around it, shared visually with SignupPage.
 * ----------------------------------------------------------------------------
 */

import { Link } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { TrendingUpIcon } from '../components/common/icons';

export function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand brand--centered">
          <span className="brand-mark">
            <TrendingUpIcon size={20} />
          </span>
          <span className="brand-name">Ledger</span>
        </div>
        <p className="auth-tagline">Sign in to your trading journal.</p>

        <LoginForm />

        <p className="auth-switch">
          New here? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </div>
  );
}