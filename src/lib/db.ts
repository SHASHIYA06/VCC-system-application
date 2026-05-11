import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

function getSql() {
  if (!_sql) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not set');
    }
    _sql = neon(dbUrl);
  }
  return _sql;
}

export async function query<T = unknown>(queryString: string, params?: unknown[]): Promise<T[]> {
  const sql = getSql();
  const result = await sql(queryString, params);
  return result as T[];
}

export async function execute(queryString: string, params?: unknown[]): Promise<void> {
  const sql = getSql();
  await sql(queryString, params);
}