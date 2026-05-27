import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

// Singleton pattern — reuse connection across hot-reloads in dev
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Graceful disconnect helper for scripts
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// Health check with auto-reconnect
export async function testConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Database connection test failed:', message);
    // Try to reconnect
    try {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      return { connected: true };
    } catch (retryError) {
      return { connected: false, error: message };
    }
  }
}