/**
 * utils/storage.ts
 * ----------------------------------------------------------------------------
 * Thin, typed wrapper around localStorage.
 *
 * Everything here is deliberately small and boring: read/write JSON safely
 * (private browsing, quota errors, corrupted data can all make localStorage
 * throw or return garbage), and centralize every key name so a typo can't
 * quietly create a second copy of the user's data under a different key.
 *
 * IMPORTANT: STORAGE_KEYS.themePreference must stay in sync with the
 * inline "no theme flash" bootstrap script in index.html, which reads the
 * same key before React even mounts.
 * ----------------------------------------------------------------------------
 */

/** Read and JSON-parse a value, falling back gracefully if it's missing,
 *  corrupted, or localStorage is unavailable (e.g. private browsing). */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** JSON-stringify and persist a value. Failures (quota exceeded, storage
 *  disabled) are logged but never thrown — losing a write shouldn't crash
 *  the app, since state still lives in memory for the current session. */
export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[storage] Failed to persist "${key}":`, error);
  }
}

/** Remove a key entirely (used on logout, e.g. to clear the session key). */
export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`[storage] Failed to remove "${key}":`, error);
  }
}

/** Every localStorage key the app uses, in one place. */
export const STORAGE_KEYS = {
  /** Array<User> — every registered account (local-only auth, see AuthContext). */
  users: 'tj_users',
  /** The currently logged-in user's id, or absent if signed out. */
  session: 'tj_session',
  /** ThemePreference ('system' | 'light' | 'dark'). */
  themePreference: 'tj_theme_preference',
  /** Array<Trade> for a given user, namespaced so multiple local accounts
   *  never see each other's journals. */
  trades: (userId: string): string => `tj_trades_${userId}`,
} as const;