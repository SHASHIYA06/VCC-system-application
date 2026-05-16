import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const start = Date.now();
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    const dbTime = Date.now() - start;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'up',
          latencyMs: dbTime,
        },
        api: {
          status: 'up',
          version: process.env.npm_package_version || '0.2.0',
        },
      },
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: 'down',
          error: String(error),
        },
      },
    }, { status: 503 });
  }
}