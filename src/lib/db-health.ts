import { prisma } from './prisma';

export async function checkDatabaseHealth() {
  const started = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latencyMs: Date.now() - started, timestamp: new Date().toISOString() };
  } catch {
    return { ok: false, latencyMs: Date.now() - started, timestamp: new Date().toISOString() };
  }
}