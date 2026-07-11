/**
 * utils/auth.ts
 * ----------------------------------------------------------------------------
 * Password hashing for the local, browser-only auth system.
 *
 * ⚠️ Production note: this hashes with SHA-256 entirely on the client and
 * compares hashes stored in the same browser's localStorage. That is fine
 * for a single-user, local-first journal, but it is NOT how real
 * multi-user auth should work — there's no per-user salt, no server-side
 * secret, and anyone with local storage access can read the hashes. Before
 * shipping this to real users over a network, swap AuthContext's
 * signup/login internals for a real backend (e.g. Supabase Auth, Auth0, or
 * a custom API that hashes with bcrypt/argon2 server-side). Nothing else
 * in the app needs to change — every screen consumes auth through the
 * `useAuth()` hook.
 * ----------------------------------------------------------------------------
 */

/** SHA-256 hash of a UTF-8 string, returned as lowercase hex. Requires a
 *  secure context (https or localhost), which the Web Crypto API mandates. */
export async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}