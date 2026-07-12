/**
 * components/layout/AppLayout.tsx
 * ----------------------------------------------------------------------------
 * Wraps every authenticated page with the Navbar and a consistent content
 * container. Rendered as a layout route in App.tsx, so `<Outlet />` is
 * whichever page route matched (Dashboard, Trades, Calendar).
 * ----------------------------------------------------------------------------
 */

import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-container">
        <Outlet />
      </main>
    </div>
  );
}
