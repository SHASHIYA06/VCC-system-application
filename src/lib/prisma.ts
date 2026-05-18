import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function testConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    await prisma.$connect();
    await prisma.system.count();
    return { connected: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Database connection test failed:', message);
    return { connected: false, error: message };
  } finally {
    await prisma.$disconnect();
  }
}