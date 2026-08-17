/**
 * plugins/auth.ts
 * ----------------------------------------------------------------------------
 * Registers @fastify/jwt and exposes a `authenticate` preHandler that guards
 * protected routes. On success it leaves the verified payload on
 * `request.user` ({ id }), so handlers can scope queries to the caller.
 * ----------------------------------------------------------------------------
 */

import type { FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import { env } from '../env.js';

// Shape of what we sign into every token, and therefore what request.user is.
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string };
    user: { id: string };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (app) => {
  app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: { expiresIn: env.JWT_EXPIRES_IN },
  });

  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      await reply.code(401).send({ error: 'Unauthorized' });
    }
  });
});
