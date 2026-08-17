/**
 * index.ts
 * ----------------------------------------------------------------------------
 * Fastify bootstrap: plugins (CORS, JWT auth, multipart), route registration,
 * and the listen call. Binds to 0.0.0.0 on Railway's injected PORT so the
 * platform's edge can reach the container.
 * ----------------------------------------------------------------------------
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { corsOrigins, env } from './env.js';
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth.js';
import tradeRoutes from './routes/trades.js';
import screenshotRoutes from './routes/screenshots.js';
import { ensureUploadDir } from './lib/storage.js';

async function main() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.register(multipart, {
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per screenshot
  });

  await app.register(authPlugin);

  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(tradeRoutes, { prefix: '/trades' });
  await app.register(screenshotRoutes, { prefix: '/screenshots' });

  await ensureUploadDir();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
