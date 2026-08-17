/**
 * routes/auth.ts
 * ----------------------------------------------------------------------------
 * Signup / login / me. Mirrors the frontend AuthContext API, but does the
 * hashing server-side and hands back a JWT the SPA stores and sends as a
 * Bearer token on every subsequent request.
 * ----------------------------------------------------------------------------
 */

import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { hashPassword, verifyPassword } from '../lib/password.js';

const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().toLowerCase().email('A valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

/** Strip the password hash before returning a user to the client. */
function toPublicUser(user: typeof users.$inferSelect) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

export default async function authRoutes(app: FastifyInstance) {
  app.post('/signup', async (request, reply) => {
    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: parsed.error.issues[0]?.message ?? 'Invalid input' });
    }
    const { name, email, password } = parsed.data;

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return reply.code(409).send({ error: 'An account with this email already exists.' });
    }

    const [user] = await db
      .insert(users)
      .values({ name, email, passwordHash: await hashPassword(password) })
      .returning();

    const token = app.jwt.sign({ id: user.id });
    return reply.code(201).send({ token, user: toPublicUser(user) });
  });

  app.post('/login', async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid input' });
    }
    const { email, password } = parsed.data;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    // Same generic error whether the email is unknown or the password is wrong,
    // so we don't leak which emails have accounts.
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return reply.code(401).send({ error: 'Incorrect email or password.' });
    }

    const token = app.jwt.sign({ id: user.id });
    return reply.send({ token, user: toPublicUser(user) });
  });

  app.get('/me', { preHandler: app.authenticate }, async (request, reply) => {
    const [user] = await db.select().from(users).where(eq(users.id, request.user.id));
    if (!user) return reply.code(404).send({ error: 'User not found' });
    return reply.send({ user: toPublicUser(user) });
  });
}
