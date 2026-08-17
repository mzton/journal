/**
 * env.ts
 * ----------------------------------------------------------------------------
 * Validate and expose environment config once, at startup. Failing fast here
 * (with a readable error) beats a confusing null-pointer deep inside a route
 * handler when a required variable is missing on the deploy target.
 * ----------------------------------------------------------------------------
 */

import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  // Railway injects PORT; coerce the string it provides into a number.
  PORT: z.coerce.number().default(8080),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  UPLOAD_DIR: z.string().default('./uploads'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

/** Allowed browser origins, parsed from the comma-separated CORS_ORIGIN. */
export const corsOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
