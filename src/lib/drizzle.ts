import postgres from 'postgres';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL!;

export const sql = postgres(connectionString, {
  ssl: 'require',
  max: 10,
  prepare: false,
});