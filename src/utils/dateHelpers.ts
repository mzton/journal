/**
 * utils/dateHelpers.ts
 * ----------------------------------------------------------------------------
 * Date helpers, written by hand instead of pulling in a date library.
 *
 * Every Trade date (entryDate/exitDate) is a plain "YYYY-MM-DD" string, the
 * same format <input type="date"> produces. That sidesteps timezones almost
 * entirely — but the moment you convert one of those strings to a JS `Date`
 * (e.g. to build the calendar grid), you have to be careful:
 * `new Date("2026-07-11")` is parsed as UTC midnight, which renders as the
 * *previous* day in any timezone west of UTC. `parseLocalDate` below exists
 * specifically to avoid that trap — always use it instead of `new Date(str)`.
 * ----------------------------------------------------------------------------
 */

/** Normalizes any ISO/SQL date string or date key to a clean "YYYY-MM-DD" string. */
export function normalizeDateKey(dateString: string | null | undefined): string {
  if (!dateString) return todayKey();
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return dateString.slice(0, 10);
}

/** Parses a "YYYY-MM-DD" or ISO date string as a local-time Date safely. */
export function parseLocalDate(dateString: string | null | undefined): Date {
  if (!dateString) return new Date();
  const cleanKey = normalizeDateKey(dateString);
  const [year, month, day] = cleanKey.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    const fallback = new Date(dateString);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  }
  return new Date(year, month - 1, day);
}

/** Formats a Date as "YYYY-MM-DD" using local time components (the inverse
 *  of parseLocalDate — again, deliberately not using toISOString()). */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Today's date as a "YYYY-MM-DD" string, suitable as a date input default. */
export function todayKey(): string {
  return toDateKey(new Date());
}

/** Short, locale-aware display format, e.g. "Jul 11, 2026". */
export function formatDateShort(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  const parsed = parseLocalDate(dateString);
  if (isNaN(parsed.getTime())) return String(dateString);
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(parsed);
}

/** "July 2026" — used as the Calendar page's month heading. */
export function formatMonthYear(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

/** Returns a new Date moved forward/back by `delta` whole months, pinned to
 *  the 1st (so it's always safe to use as a "current month" cursor). */
export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

/**
 * Builds a 7-column calendar grid for the given month, padded with `null`
 * for the leading/trailing blank cells so every row has exactly 7 entries.
 * Weeks start on Sunday.
 */
export function buildMonthGrid(monthCursor: Date): (Date | null)[] {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
