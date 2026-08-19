/**
 * routes/trades.ts
 * ----------------------------------------------------------------------------
 * CRUD for the journal, scoped to the authenticated user. Every query filters
 * on request.user.id so one account can never read or mutate another's trades.
 *
 * The request body matches the frontend's TradeFormValues plus screenshotIds;
 * `status` is derived here (closed once an exit price exists) rather than
 * trusted from the client.
 * ----------------------------------------------------------------------------
 */

import type { FastifyInstance } from 'fastify';
import { and, desc, eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { screenshots, trades } from '../db/schema.js';
import { deleteScreenshotFile } from '../lib/storage.js';

const tradeSchema = z.object({
  symbol: z.string().trim().min(1),
  positionType: z.enum(['long', 'short']),
  quantity: z.number().positive(),
  leverage: z.number().min(1),
  entryPrice: z.number(),
  exitPrice: z.number().optional(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  fees: z.number().optional(),
  entryDate: z.string().min(1),
  exitDate: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  screenshotIds: z.array(z.string()).optional(),
});

function formatTrade<T extends { entryDate: string; exitDate?: string | null }>(trade: T): T {
  return {
    ...trade,
    entryDate: trade.entryDate ? trade.entryDate.slice(0, 10) : trade.entryDate,
    exitDate: trade.exitDate ? trade.exitDate.slice(0, 10) : trade.exitDate,
  };
}

export default async function tradeRoutes(app: FastifyInstance) {
  // Everything in this router requires a valid token.
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (request) => {
    const rows = await db
      .select()
      .from(trades)
      .where(eq(trades.userId, request.user.id))
      .orderBy(desc(trades.createdAt));
    return { trades: rows.map(formatTrade) };
  });

  app.post('/', async (request, reply) => {
    const parsed = tradeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? 'Invalid trade' });
    }
    const values = parsed.data;
    const [trade] = await db
      .insert(trades)
      .values({
        ...values,
        userId: request.user.id,
        status: values.exitPrice !== undefined ? 'closed' : 'open',
        screenshotIds: values.screenshotIds ?? [],
      })
      .returning();
    return reply.code(201).send({ trade: formatTrade(trade) });
  });

  app.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = tradeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? 'Invalid trade' });
    }
    const values = parsed.data;

    const [updated] = await db
      .update(trades)
      .set({
        ...values,
        status: values.exitPrice !== undefined ? 'closed' : 'open',
        screenshotIds: values.screenshotIds ?? [],
        updatedAt: new Date().toISOString(),
      })
      .where(and(eq(trades.id, id), eq(trades.userId, request.user.id)))
      .returning();

    if (!updated) return reply.code(404).send({ error: 'Trade not found' });
    return reply.send({ trade: formatTrade(updated) });
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const [trade] = await db
      .select()
      .from(trades)
      .where(and(eq(trades.id, id), eq(trades.userId, request.user.id)));
    if (!trade) return reply.code(404).send({ error: 'Trade not found' });

    // Clean up any attached screenshots (files + rows) before the trade goes.
    const ids = trade.screenshotIds ?? [];
    if (ids.length > 0) {
      const rows = await db.select().from(screenshots).where(inArray(screenshots.id, ids));
      await Promise.all(rows.map((row) => deleteScreenshotFile(row.storagePath)));
      await db.delete(screenshots).where(inArray(screenshots.id, ids));
    }

    await db.delete(trades).where(and(eq(trades.id, id), eq(trades.userId, request.user.id)));
    return reply.code(204).send();
  });
}
