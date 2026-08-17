/**
 * context/AuthContext.tsx
 * ----------------------------------------------------------------------------
 * Authentication via the Railway backend API.
 *
 * Consume this via the `useAuth()` hook (hooks/useAuth.ts) rather than
 * importing AuthContext directly.
 * ----------------------------------------------------------------------------
 */

import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { PublicUser } from '../types';
import { api, clearToken, getToken, setToken } from '../utils/api';

export interface AuthContextValue {
  /** The signed-in user (password hash stripped out), or null if signed out. */
  currentUser: PublicUser | null;
  /** True only while restoring a session on first load — lets ProtectedRoute
   *  avoid bouncing a genuinely-logged-in user to /login for a single frame. */
  isLoading: boolean;
  /** Creates a new local account and signs in as it. Throws if the email is
   *  already registered. */
  signup: (name: string, email: string, password: string) => Promise<void>;
  /** Signs in to an existing account. Throws on a wrong email/password. */
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore whichever account (if any) was last logged in.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    
    api.auth.me()
      .then(({ user }) => setCurrentUser(user))
      .catch(() => clearToken())
      .finally(() => setIsLoading(false));
  }, []);

  async function signup(name: string, email: string, password: string): Promise<void> {
    const { token, user } = await api.auth.signup(name, email, password);
    setToken(token);
    setCurrentUser(user);
  }

  async function login(email: string, password: string): Promise<void> {
    const { token, user } = await api.auth.login(email, password);
    setToken(token);
    setCurrentUser(user);
  }

  function logout(): void {
    clearToken();
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
