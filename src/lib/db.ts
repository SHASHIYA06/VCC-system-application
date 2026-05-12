import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;
let _hasDb = false;

function getSql() {
  if (!_sql) {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      _hasDb = false;
      return null;
    }
    _sql = neon(dbUrl);
    _hasDb = true;
  }
  return _sql;
}

export function hasDatabase(): boolean {
  getSql();
  return _hasDb;
}

export async function query<T = unknown>(queryString: string, params?: unknown[]): Promise<T[]> {
  const sql = getSql();
  if (!sql) {
    return [];
  }
  try {
    const result = await sql(queryString, params);
    return result as T[];
  } catch (error) {
    console.error('Query error:', error);
    return [];
  }
}

export async function execute(queryString: string, params?: unknown[]): Promise<{ success: boolean; error?: string }> {
  const sql = getSql();
  if (!sql) {
    return { success: false, error: 'DATABASE_URL not set' };
  }
  try {
    await sql(queryString, params);
    return { success: true };
  } catch (error) {
    console.error('Execute error:', error);
    return { success: false, error: String(error) };
  }
}

export async function transaction<T>(fn: (sql: ReturnType<typeof neon>) => Promise<T>): Promise<T | null> {
  const sql = getSql();
  if (!sql) return null;
  try {
    return await fn(sql);
  } catch (error) {
    console.error('Transaction error:', error);
    return null;
  }
}