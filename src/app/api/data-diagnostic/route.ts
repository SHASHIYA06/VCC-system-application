import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Comprehensive data diagnostic endpoint
 * Returns complete count and sample data from each table
 * Helps identify why pages show fallback data instead of real data
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      directUrl: process.env.DIRECT_URL ? '✅ Set' : '❌ Missing',
    },
    connection: {},
    tables: {},
    errors: [],
  };

  try {
    // Test database connection
    const connectionStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    diagnostics.connection.status = 'connected';
    diagnostics.connection.responseTime = Date.now() - connectionStart;
    console.log(`✅ Database connected in ${diagnostics.connection.responseTime}ms`);
  } catch (error) {
    diagnostics.connection.status = 'failed';
    diagnostics.connection.error = error instanceof Error ? error.message : 'Unknown error';
    diagnostics.errors.push(`Database connection failed: ${diagnostics.connection.error}`);
    console.error('❌ Database connection failed:', error);
    return NextResponse.json(diagnostics, { status: 503 });
  }

  // Diagnostic queries for each table
  const diagnosticQueries = [
    {
      name: 'Wire',
      query: () => prisma.wire.count(),
      sample: () => prisma.wire.findMany({ take: 3 }),
    },
    {
      name: 'Connector',
      query: () => prisma.connector.count(),
      sample: () => prisma.connector.findMany({ take: 3 }),
    },
    {
      name: 'ConnectorPin',
      query: () => prisma.connectorPin.count(),
      sample: () => prisma.connectorPin.findMany({ take: 3 }),
    },
    {
      name: 'Device',
      query: () => prisma.device.count(),
      sample: () => prisma.device.findMany({ take: 3 }),
    },
    {
      name: 'Drawing',
      query: () => prisma.drawing.count(),
      sample: () => prisma.drawing.findMany({ take: 3 }),
    },
    {
      name: 'System',
      query: () => prisma.system.count(),
      sample: () => prisma.system.findMany({ take: 3 }),
    },
    {
      name: 'TrainLine',
      query: () => prisma.trainLine.count(),
      sample: () => prisma.trainLine.findMany({ take: 3 }),
    },
    {
      name: 'Formation',
      query: () => prisma.formation.count(),
      sample: () => prisma.formation.findMany({ take: 3 }),
    },
    {
      name: 'Car',
      query: () => prisma.car.count(),
      sample: () => prisma.car.findMany({ take: 3 }),
    },
  ];

  // Run all diagnostic queries in parallel
  const results = await Promise.allSettled(
    diagnosticQueries.map(async (diag) => ({
      name: diag.name,
      count: await diag.query(),
      sample: await diag.sample(),
    }))
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { name, count, sample } = result.value;
      diagnostics.tables[name] = {
        count,
        sampleData: sample,
        status: count > 0 ? '✅ Has data' : '⚠️ Empty',
      };
      console.log(`📊 ${name}: ${count} records`);
    } else {
      const error = result.reason;
      diagnostics.tables[`${result.reason?.modelName || 'Unknown'}`] = {
        status: '❌ Error',
        error: error instanceof Error ? error.message : String(error),
      };
      console.error(`❌ Query failed:`, error);
      diagnostics.errors.push(`Failed to query ${result.reason}: ${error}`);
    }
  }

  // Specific diagnostic for Wire table
  try {
    const wireStats = await prisma.wire.groupBy({
      by: ['wireStatus'],
      _count: true,
    });
    diagnostics.tables.Wire.statusBreakdown = wireStats;
  } catch (e) {
    console.log('Could not get wire status breakdown');
  }

  // Check API endpoints accessibility
  diagnostics.endpoints = {
    '/api/wires': 'Should return wires with pagination',
    '/api/pins': 'Should return pins from connectors',
    '/api/connectors': 'Should return connectors',
    '/api/equipment': 'Should return devices',
    '/api/trainlines': 'Should return trainlines',
    '/api/search': 'Should search all resources',
    '/api/twin/hierarchy': 'Should return formation hierarchy',
    '/api/vcc-descriptions': 'Should return VCC system descriptions',
  };

  diagnostics.executionTime = Date.now() - startTime;
  diagnostics.recommendation = generateRecommendation(diagnostics);

  return NextResponse.json(diagnostics);
}

function generateRecommendation(diagnostics: any): string {
  const tables = diagnostics.tables;
  
  // Check if major tables have data
  const hasWires = tables.Wire?.count > 100000;
  const hasConnectors = tables.Connector?.count > 1000;
  const hasDrawings = tables.Drawing?.count > 500;
  const hasDevices = tables.Device?.count > 100;

  if (!hasWires || !hasConnectors || !hasDrawings) {
    return '⚠️ WARNING: Database appears to have incomplete data. Check if migrations were run. Run: npm run db:push or npm run db:migrate';
  }

  if (diagnostics.connection.responseTime > 1000) {
    return '⚠️ WARNING: Database connection is slow (>1s). This might cause pages to timeout and use fallback data. Check Vercel environment variables and Neon connection pooler.';
  }

  if (diagnostics.errors.length > 0) {
    return `⚠️ WARNING: ${diagnostics.errors.length} errors detected. Check DATABASE_URL and DIRECT_URL environment variables.`;
  }

  return '✅ All diagnostics passed. If pages still show fallback data, check frontend API calls and error handling.';
}

export async function POST(request: NextRequest) {
  // Also allow running diagnostics via POST for flexibility
  return GET(request);
}
