/**
 * lib/password.ts
 * ----------------------------------------------------------------------------
 * Server-side password hashing with bcrypt (per-user salt built in). This is
 * the real replacement for the frontend's client-side SHA-256 in
 * ../../../src/utils/auth.ts — hashes never leave the server and are never
 * exposed to the client.
 *
 * bcryptjs (pure JS) is used instead of native bcrypt so there's no compiler
 * toolchain needed on the Railway build image.
 * ----------------------------------------------------------------------------
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
