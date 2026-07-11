/**
 * context/AuthContext.tsx
 * ----------------------------------------------------------------------------
 * Local authentication: accounts and sessions live entirely in this
 * browser's localStorage (see utils/auth.ts for the important caveat about
 * why this isn't real production-grade auth).
 *
 * Consume this via the `useAuth()` hook (hooks/useAuth.ts) rather than
 * importing AuthContext directly.
 * ----------------------------------------------------------------------------
 */

import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { PublicUser, User } from '../types';
import { hashPassword } from '../utils/auth';
import { readJSON, removeKey, STORAGE_KEYS, writeJSON } from '../utils/storage';

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

function toPublicUser(user: User): PublicUser {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore whichever account (if any) was last logged in.
  useEffect(() => {
    const sessionUserId = readJSON<string | null>(STORAGE_KEYS.session, null);
    if (sessionUserId) {
      const users = readJSON<User[]>(STORAGE_KEYS.users, []);
      const found = users.find((user) => user.id === sessionUserId);
      if (found) setCurrentUser(toPublicUser(found));
    }
    setIsLoading(false);
  }, []);

  async function signup(name: string, email: string, password: string): Promise<void> {
    const users = readJSON<User[]>(STORAGE_KEYS.users, []);
    const normalizedEmail = email.trim().toLowerCase();

    if (users.some((user) => user.email === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    writeJSON(STORAGE_KEYS.users, [...users, newUser]);
    writeJSON<string>(STORAGE_KEYS.session, newUser.id);
    setCurrentUser(toPublicUser(newUser));
  }

  async function login(email: string, password: string): Promise<void> {
    const users = readJSON<User[]>(STORAGE_KEYS.users, []);
    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = await hashPassword(password);

    const found = users.find(
      (user) => user.email === normalizedEmail && user.passwordHash === passwordHash,
    );
    if (!found) throw new Error('Incorrect email or password.');

    writeJSON<string>(STORAGE_KEYS.session, found.id);
    setCurrentUser(toPublicUser(found));
  }

  function logout(): void {
    removeKey(STORAGE_KEYS.session);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}