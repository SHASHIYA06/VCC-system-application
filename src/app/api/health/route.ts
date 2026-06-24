/**
 * DEPLOYMENT HEALTH CHECK
 *
 * GET /api/health
 *
 * Verifies that the deployed app (Vercel) can reach the database and that
 * environment variables are configured. Use this to diagnose why a
 * deployment shows empty data.
 *
 * Visit: https://<your-app>.vercel.app/api/health
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      nodeEnv: process.env.NODE_ENV ?? 'unknown',
      vercelEnv: process.env.VERCEL_ENV ?? 'not-on-vercel',
    },
  };

  try {
    // Lightweight connectivity test + real counts
    const [systems, drawings, wires, connectors, pins] = await Promise.all([
      prisma.system.count(),
      prisma.drawing.count(),
      prisma.wire.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
    ]);

    checks.database = {
      connected: true,
      counts: { systems, drawings, wires, connectors, pins },
    };

    return NextResponse.json({ status: 'ok', ...checks });
  } catch (error) {
    checks.database = {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
    return NextResponse.json({ status: 'error', ...checks }, { status: 503 });
  }
}
