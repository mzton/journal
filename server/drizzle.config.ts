import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle Kit config — drives `db:generate` (create SQL migrations from the
 * schema) and `db:migrate` (apply them). DATABASE_URL is injected by Railway
 * once you attach the Postgres plugin; locally it comes from server/.env.
 */
export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
