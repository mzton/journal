/**
 * components/layout/Navbar.tsx
 * ----------------------------------------------------------------------------
 * The app's top nav: brand mark, the three main sections, a light/dark/
 * system theme switcher, and sign-out. Rendered once by AppLayout above
 * every authenticated page.
 * ----------------------------------------------------------------------------
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import type { ThemePreference } from '../../types';
import { cn } from '../../utils/classNames';
import { LogOutIcon, MonitorIcon, MoonIcon, SunIcon, TrendingUpIcon } from '../common/icons';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/trades', label: 'Trades', end: false },
  { to: '/calendar', label: 'Calendar', end: false },
];

const THEME_OPTIONS: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
  { value: 'light', label: 'Light theme', icon: SunIcon },
  { value: 'dark', label: 'Dark theme', icon: MoonIcon },
  { value: 'system', label: 'Match system theme', icon: MonitorIcon },
];

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const { themePreference, setThemePreference } = useTheme();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">
            <TrendingUpIcon size={18} />
          </span>
          <span className="brand-name">Ledger</span>
        </NavLink>

        <nav className="navbar-links" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => cn('navbar-link', isActive && 'navbar-link--active')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="navbar-actions">
          <div className="theme-switch" role="group" aria-label="Theme">
            {THEME_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isActive = themePreference === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn('theme-switch-option', isActive && 'theme-switch-option--active')}
                  aria-pressed={isActive}
                  title={option.label}
                  onClick={() => setThemePreference(option.value)}
                >
                  <Icon size={15} />
                </button>
              );
            })}
          </div>

          {currentUser && (
            <div className="navbar-user">
              <span className="navbar-user-name">{currentUser.name}</span>
              <button
                type="button"
                className="icon-button"
                onClick={logout}
                aria-label="Log out"
                title="Log out"
              >
                <LogOutIcon size={17} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}