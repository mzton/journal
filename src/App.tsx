/**
 * App.tsx
 * ----------------------------------------------------------------------------
 * Composes the three context providers and the route table.
 *
 * Provider order matters: TradeProvider calls useAuth() internally to know
 * whose trades to load, so AuthProvider must wrap it. ThemeProvider doesn't
 * depend on anything and is kept outermost so even the login/signup pages
 * (outside ProtectedRoute) get themed correctly.
 * ----------------------------------------------------------------------------
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TradeProvider } from './context/TradeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { TradesPage } from './pages/TradesPage';
import { CalendarPage } from './pages/CalendarPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <TradeProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/trades" element={<TradesPage />} />
                  <Route path="/calendar" element={<CalendarPage />} />
                </Route>
              </Route>

              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </TradeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
