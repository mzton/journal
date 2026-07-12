# Ledger — Trading Journal

A trading journal built with React + TypeScript + Vite. Log trades, get
automatic PnL and risk:reward math, filter and review your history, see it
summarized on an analytics dashboard, and browse performance day-by-day on
a calendar — all themeable in light or dark.

## Features

**Must have**
- Full CRUD for trades (create, view, edit, delete)
- Automatic PnL ($ and %) and risk:reward calculation — both the *planned*
  R:R (from stop-loss/take-profit, set before the trade) and the *realized*
  R-multiple (actual PnL ÷ planned risk, once closed)
- Local account system (sign up / log in / log out)
- Long or short position type
- Entry price and exit (closing) price

**Should have**
- Filtering by symbol/notes search, position type, status, outcome, and
  date range
- Analytics dashboard: total PnL, win rate, profit factor, average
  R-multiple, an equity curve, PnL by symbol, and a win/loss breakdown

**Could have**
- Screenshot attachments per trade (stored locally in IndexedDB, not
  localStorage — see "How data is stored" below)
- Calendar view of daily total PnL / PnL%, with drill-down into each day's
  trades

**Also included**
- Full light/dark/system theming, persisted per-user, with no flash of the
  wrong theme on page load

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and build for production
npm run preview   # preview the production build locally
```

## How data is stored

This app is entirely client-side — there is no backend or database.
Everything lives in **this browser**:

- **Accounts & sessions**: `localStorage`, hashed with SHA-256 client-side
  (see the warning in `src/utils/auth.ts`). This is fine for a personal,
  local journal but is **not** how real multi-user auth should work —
  swap `AuthContext` for a real backend (Supabase Auth, Auth0, a custom
  API with bcrypt/argon2) before putting this in front of real users over
  a network. Nothing else in the app needs to change; every screen reads
  auth state through the `useAuth()` hook.
- **Trades**: `localStorage`, namespaced per account, so multiple local
  logins on the same device never see each other's journals.
- **Screenshots**: `IndexedDB` (not `localStorage`, which caps out around
  5–10MB) — trades only store a screenshot *id*, and the image is resolved
  to a viewable URL on demand.
- **Theme preference**: `localStorage`, read synchronously by a small
  inline script in `index.html` before React mounts, so there's no flash
  of the wrong theme.

Clearing your browser's site data will erase your journal — there's
currently no export/backup feature.

## Project structure

```
src/
├── types/         Central data model (Trade, User, Filters, Analytics…)
├── utils/         Pure functions: PnL/RR math, formatting, dates, storage,
│                  validation, IndexedDB screenshot store
├── context/        AuthContext, ThemeContext, TradeContext (state + logic)
├── hooks/          useAuth / useTheme / useTrades — how components consume
│                  the contexts above
├── components/
│   ├── common/     Reusable primitives: Button, Input, Select, Card,
│   │               Badge, Modal, ConfirmDialog, EmptyState, icons
│   ├── layout/      Navbar, AppLayout, ProtectedRoute
│   ├── auth/        LoginForm, SignupForm
│   ├── trades/      TradeForm, TradeFilters, TradeTable, TradeDetailModal,
│   │               ScreenshotUpload
│   ├── analytics/   StatCard, PerformanceCharts (equity curve, per-symbol,
│   │               win/loss)
│   └── calendar/    CalendarGrid, DayDetailModal
├── pages/          One file per route (Login, Signup, Dashboard, Trades,
│                  Calendar, NotFound)
└── styles/         theme.css (design tokens), layout.css, components.css,
                    calendar.css
```

Every non-trivial function has a doc comment explaining *why*, not just
*what* — start with `src/utils/calculations.ts` if you want to see the
PnL/RR formulas, or `src/context/` for how state is organized.

## Design notes

No UI framework (no Tailwind/MUI/etc.) — just hand-written CSS using
custom properties for theming, so the whole visual identity is defined in
`src/styles/theme.css`. The one deliberate signature choice: every price,
PnL, and quantity is rendered in a monospace face with tabular figures
(the `.num` utility class) — a small "trading ledger" touch that also
makes columns of numbers genuinely easier to scan and compare.

## Known trade-offs / good next steps

- **Currency is fixed to USD** display formatting (`src/utils/format.ts`) —
  swap the `Intl.NumberFormat` locale/currency there for multi-currency
  support.
- **No tags or CSV export** yet — `Trade` doesn't currently track tags;
  add a `tags: string[]` field and a small chip input if you want that
  back.
- **Bundle size**: `recharts` pulls in `d3` internals and pushes the main
  JS bundle past Vite's 500kB warning threshold. Splitting the dashboard
  route with `React.lazy()` would fix this if it matters for your
  deployment.
- **Auth**, as noted above, is local-only and should be replaced with a
  real backend before handling real users' data over a network.
