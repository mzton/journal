/**
 * context/ThemeContext.tsx
 * ----------------------------------------------------------------------------
 * Theme state: the user can pin 'light' or 'dark', or leave it on 'system'
 * to follow the OS preference (and keep following it live if the OS
 * setting changes, e.g. at sunset with an OS-level auto dark mode).
 *
 * The resolved theme is written to `document.documentElement.dataset.theme`,
 * which src/styles/theme.css keys its CSS variables off of. index.html also
 * has a small inline bootstrap script that sets this same attribute
 * *before* React mounts, so there's no flash of the wrong theme on load —
 * if you change STORAGE_KEYS.themePreference, update that script too.
 * ----------------------------------------------------------------------------
 */

import { createContext, useEffect, useState, type ReactNode } from 'react';
import type { ThemePreference } from '../types';
import { readJSON, STORAGE_KEYS, writeJSON } from '../utils/storage';

export interface ThemeContextValue {
  /** The theme actually in effect right now — always 'light' or 'dark',
   *  even when the preference is 'system'. Use this for chart colors etc. */
  theme: 'light' | 'dark';
  /** What the user asked for, which may be 'system'. Use this to render the
   *  theme switcher's selected state. */
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveTheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return preference;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() =>
    readJSON<ThemePreference>(STORAGE_KEYS.themePreference, 'system'),
  );
  const [theme, setTheme] = useState<'light' | 'dark'>(() => resolveTheme(themePreference));

  // Re-resolve whenever the user changes their preference.
  useEffect(() => {
    setTheme(resolveTheme(themePreference));
  }, [themePreference]);

  // While following 'system', keep listening for OS-level changes.
  useEffect(() => {
    if (themePreference !== 'system') return undefined;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setTheme(media.matches ? 'dark' : 'light');
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [themePreference]);

  // Reflect the resolved theme onto <html> so CSS can key off it.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function setThemePreference(preference: ThemePreference): void {
    setThemePreferenceState(preference);
    writeJSON(STORAGE_KEYS.themePreference, preference);
  }

  return (
    <ThemeContext.Provider value={{ theme, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}