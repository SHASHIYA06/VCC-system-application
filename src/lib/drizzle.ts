import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const connectionString =
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL!;

export const db = drizzle(
  postgres(connectionString, {
    ssl: 'require',
    max: 1,
    prepare: false,
  })
);