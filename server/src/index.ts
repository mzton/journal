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
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.register(multipart, {
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per screenshot
  });

  await app.register(authPlugin);

  app.get('/', async () => ({ status: 'ok', service: 'journal-api' }));
  app.get('/health', async () => ({ status: 'ok' }));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(tradeRoutes, { prefix: '/trades' });
  await app.register(screenshotRoutes, { prefix: '/screenshots' });

  await ensureUploadDir();

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });

    // Handle graceful shutdown to avoid confusing npm errors when Railway stops the container
    const shutdown = async (signal: string) => {
      app.log.info(`Received ${signal}, shutting down gracefully...`);
      await app.close();
      process.exit(0);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT', () => void shutdown('SIGINT'));

  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
