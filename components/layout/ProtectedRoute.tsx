/**
 * components/layout/ProtectedRoute.tsx
 * ----------------------------------------------------------------------------
 * A layout route (see App.tsx) that gates every authenticated page. While
 * the session is still being restored from localStorage we render nothing
 * rather than the login page, so a genuinely logged-in user never sees a
 * flash of the login screen on refresh.
 * ----------------------------------------------------------------------------
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;

  return <Outlet />;
}