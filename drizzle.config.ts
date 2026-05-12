import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || '',
  },
  verbose: true,
  strict: true,
});