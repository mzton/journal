/**
 * db/schema.ts
 * ----------------------------------------------------------------------------
 * Drizzle table definitions — the server-side mirror of the frontend's
 * `Trade` / `User` types (see ../../../src/types/index.ts).
 *
 * Design notes:
 *  - IDs are minted by Postgres (defaultRandom → gen_random_uuid), so the
 *    server owns identity instead of trusting client-generated UUIDs.
 *  - Money/quantity fields use doublePrecision so they round-trip as JS
 *    numbers (Postgres `numeric` would come back as strings).
 *  - Date fields use timestamptz in `string` mode so the JSON the API sends
 *    and receives stays ISO-8601 strings, exactly like the frontend expects.
 *  - `tags` and `screenshotIds` are jsonb arrays, matching the shapes the
 *    trade form already produces.
 * ----------------------------------------------------------------------------
 */

import {
  doublePrecision,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const trades = pgTable('trades', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  symbol: text('symbol').notNull(),
  positionType: text('position_type').notNull(), // 'long' | 'short'
  quantity: doublePrecision('quantity').notNull(),
  leverage: doublePrecision('leverage').notNull().default(1),

  entryPrice: doublePrecision('entry_price').notNull(),
  exitPrice: doublePrecision('exit_price'),
  stopLoss: doublePrecision('stop_loss'),
  takeProfit: doublePrecision('take_profit'),
  fees: doublePrecision('fees'),

  entryDate: timestamp('entry_date', { withTimezone: true, mode: 'string' }).notNull(),
  exitDate: timestamp('exit_date', { withTimezone: true, mode: 'string' }),

  status: text('status').notNull(), // 'open' | 'closed'
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>(),
  screenshotIds: jsonb('screenshot_ids').$type<string[]>(),

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

export const screenshots = pgTable('screenshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  mimeType: text('mime_type').notNull(),
  storagePath: text('storage_path').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' })
    .defaultNow()
    .notNull(),
});

export type UserRow = typeof users.$inferSelect;
export type TradeRow = typeof trades.$inferSelect;
export type ScreenshotRow = typeof screenshots.$inferSelect;
