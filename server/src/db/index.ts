/**
 * db/index.ts
 * ----------------------------------------------------------------------------
 * The single Drizzle client used across the app, backed by the `postgres`
 * (postgres.js) driver. Import { db } wherever you need the database.
 * ----------------------------------------------------------------------------
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '../env.js';
import * as schema from './schema.js';

// A small pool is plenty for a journal API. Two Supabase-specific settings:
//  - prepare:false — Supabase's Supavisor pooler doesn't support prepared
//    statements in transaction mode, so disabling them keeps us compatible
//    with both the transaction (6543) and session (5432) connection strings.
//  - ssl:'require' — Supabase mandates TLS. Local Postgres usually doesn't,
//    so SSL is only turned on for non-local hosts.
const isLocalDb = /localhost|127\.0\.0\.1/.test(env.DATABASE_URL);
const client = postgres(env.DATABASE_URL, {
  max: 10,
  prepare: false,
  ssl: isLocalDb ? false : 'require',
});

export const db = drizzle(client, { schema });
export { schema };
