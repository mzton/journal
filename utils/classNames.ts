/**
 * utils/classNames.ts
 * ----------------------------------------------------------------------------
 * A minimal `clsx`-style helper. Small enough to hand-write instead of
 * adding a dependency for it.
 * ----------------------------------------------------------------------------
 */

type ClassValue = string | false | null | undefined;

/** Joins truthy class names with a space, dropping falsy values. Lets you
 *  write `cn('badge', isWin && 'badge--profit')` instead of manual ternaries. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}