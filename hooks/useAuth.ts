import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '../context/AuthContext';

/** Access the current user and auth actions. Must be called from inside
 *  <AuthProvider> (App.tsx wraps the whole app with it). */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}