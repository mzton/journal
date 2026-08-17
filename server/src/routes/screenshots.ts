/**
 * routes/screenshots.ts
 * ----------------------------------------------------------------------------
 * The server-side replacement for the browser's IndexedDB screenshot store
 * (../../../src/utils/screenshotStore.ts). Upload returns an id the trade
 * references in its screenshotIds array; GET streams the image back.
 * ----------------------------------------------------------------------------
 */

import type { FastifyInstance } from 'fastify';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { screenshots } from '../db/schema.js';
import {
  deleteScreenshotFile,
  readScreenshotStream,
  saveScreenshotFile,
} from '../lib/storage.js';

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

export default async function screenshotRoutes(app: FastifyInstance) {
  app.addHook('preHandler', app.authenticate);

  // multipart/form-data upload of a single image field named "file".
  app.post('/', async (request, reply) => {
    const file = await request.file();
    if (!file) return reply.code(400).send({ error: 'No file uploaded' });
    if (!ALLOWED_TYPES.has(file.mimetype)) {
      return reply.code(415).send({ error: `Unsupported image type: ${file.mimetype}` });
    }

    const buffer = await file.toBuffer();
    const storagePath = await saveScreenshotFile(buffer, file.filename);

    const [row] = await db
      .insert(screenshots)
      .values({
        userId: request.user.id,
        fileName: file.filename,
        mimeType: file.mimetype,
        storagePath,
      })
      .returning();

    return reply.code(201).send({ id: row.id });
  });

  app.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const [row] = await db
      .select()
      .from(screenshots)
      .where(and(eq(screenshots.id, id), eq(screenshots.userId, request.user.id)));
    if (!row) return reply.code(404).send({ error: 'Screenshot not found' });

    return reply.type(row.mimeType).send(readScreenshotStream(row.storagePath));
  });

  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const [row] = await db
      .select()
      .from(screenshots)
      .where(and(eq(screenshots.id, id), eq(screenshots.userId, request.user.id)));
    if (!row) return reply.code(404).send({ error: 'Screenshot not found' });

    await deleteScreenshotFile(row.storagePath);
    await db.delete(screenshots).where(eq(screenshots.id, id));
    return reply.code(204).send();
  });
}
