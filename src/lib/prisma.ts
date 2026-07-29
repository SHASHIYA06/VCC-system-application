import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Build the datasource URL with pooling parameters tuned for Neon + pgbouncer.
 *
 * Neon's pooled endpoint (`*-pooler.*`) already multiplexes connections, so each
 * serverless instance should hold a *small* pool and give up quickly rather than
 * queueing — long queues are what produce Prisma's P2024 "Timed out fetching a
 * connection from the pool" errors under bursty dashboard traffic.
 */
function buildDatasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    const isPooled = url.hostname.includes('-pooler');

    // Only set params that aren't already explicitly provided.
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', isPooled ? '10' : '5');
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '20');
    }
    if (!url.searchParams.has('connect_timeout')) {
      url.searchParams.set('connect_timeout', '15');
    }
    if (isPooled && !url.searchParams.has('pgbouncer')) {
      url.searchParams.set('pgbouncer', 'true');
    }
    return url.toString();
  } catch {
    // Malformed URL — hand it to Prisma unchanged so it can surface a clear error.
    return raw;
  }
}

function createPrismaClient() {
  return new PrismaClient({
    datasources: {
      db: {
        url: buildDatasourceUrl(),
      },
    },
    log: ['error'],
  });
}

/**
 * Singleton. Cached on `globalThis` in ALL environments (not just development):
 * Next.js route handlers are re-evaluated per module graph, and creating a new
 * PrismaClient per evaluation exhausts the Postgres connection limit.
 */
export const prisma = globalThis.__prisma ?? createPrismaClient();
globalThis.__prisma = prisma;

// Enhanced Database Manager
export class DatabaseManager {
  private static instance: DatabaseManager;
  private client: PrismaClient;
  private connectionAttempts = 0;
  private maxRetries = 3;
  private retryDelay = 1000;
  private isConnected = false;

  private constructor() {
    this.client = prisma;
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async healthCheck(): Promise<{
    status: 'connected' | 'disconnected' | 'error';
    details: string;
    executionTime: number;
    stats?: {
      systems: number;
      drawings: number;
      wires: number;
      equipment: number;
    };
  }> {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Enhanced database health check...');
      
      // Test basic connection
      await this.client.$queryRaw`SELECT 1`;
      
      // Test comprehensive data access
      const [systemCount, drawingCount, wireCount, equipmentCount] = await Promise.all([
        this.client.system.count(),
        this.client.drawing.count(),
        this.client.wire.count(),
        this.client.device.count(),
      ]);
      
      const executionTime = Date.now() - startTime;
      this.isConnected = true;
      
      console.log(`✅ Enhanced health check passed: ${systemCount} systems, ${drawingCount} drawings in ${executionTime}ms`);
      
      return {
        status: 'connected',
        details: `Connected to Neon PostgreSQL. Full VCC system database accessible.`,
        executionTime,
        stats: {
          systems: systemCount,
          drawings: drawingCount,
          wires: wireCount,
          equipment: equipmentCount
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.isConnected = false;
      console.error('❌ Enhanced health check failed:', error);
      
      return {
        status: 'error',
        details: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        executionTime
      };
    }
  }

  async retryOperation<T>(
    operation: () => Promise<T>,
    operationName = 'Database operation'
  ): Promise<T> {
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`🔄 ${operationName} - Retry ${attempt}/${this.maxRetries}`);
        }
        
        const result = await operation();
        
        if (attempt > 1) {
          console.log(`✅ ${operationName} succeeded on retry ${attempt}`);
        }
        
        // Reset connection attempts on success
        this.connectionAttempts = 0;
        this.isConnected = true;
        
        return result;

      } catch (error) {
        console.error(`❌ ${operationName} failed (attempt ${attempt}):`, error);
        
        this.connectionAttempts = attempt;
        this.isConnected = false;
        
        // Don't retry on the last attempt
        if (attempt === this.maxRetries) {
          throw new Error(`${operationName} failed after ${this.maxRetries} attempts: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`);
        }
        
        // Exponential backoff with jitter
        const baseDelay = this.retryDelay * Math.pow(2, attempt - 1);
        const jitter = Math.random() * 500;
        const delay = baseDelay + jitter;
        
        console.log(`⏳ Retrying ${operationName} in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error('Unexpected retry loop exit');
  }

  async gracefulDisconnect(): Promise<void> {
    try {
      console.log('🔌 Gracefully disconnecting from database...');
      await this.client.$disconnect();
      this.isConnected = false;
      console.log('✅ Database disconnected successfully');
    } catch (error) {
      console.error('❌ Error during database disconnect:', error);
    }
  }

  getClient(): PrismaClient {
    return this.client;
  }

  getConnectionStatus(): {
    attempts: number;
    maxRetries: number;
    isHealthy: boolean;
    isConnected: boolean;
  } {
    return {
      attempts: this.connectionAttempts,
      maxRetries: this.maxRetries,
      isHealthy: this.connectionAttempts === 0,
      isConnected: this.isConnected
    };
  }
}

// Enhanced database utilities with retry logic
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  operationName = 'Database operation'
): Promise<T> {
  const dbManager = DatabaseManager.getInstance();
  return await dbManager.retryOperation(operation, operationName);
}

// Comprehensive database health check
export async function checkDatabaseHealth() {
  const dbManager = DatabaseManager.getInstance();
  return await dbManager.healthCheck();
}

// Graceful shutdown
export async function shutdownDatabase() {
  const dbManager = DatabaseManager.getInstance();
  await dbManager.gracefulDisconnect();
}

// Graceful disconnect helper for scripts
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

// Enhanced connection test with comprehensive verification
export async function testConnection(): Promise<{ 
  connected: boolean; 
  error?: string;
  stats?: any;
  executionTime: number;
}> {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Basic connectivity test
    await prisma.$queryRaw`SELECT 1`;
    
    // Data integrity test
    const stats = await withDatabaseRetry(async () => {
      const [systemCount, drawingCount, wireCount] = await Promise.all([
        prisma.system.count(),
        prisma.drawing.count(),
        prisma.wire.count(),
      ]);
      return { systems: systemCount, drawings: drawingCount, wires: wireCount };
    }, 'Connection verification');
    
    const executionTime = Date.now() - startTime;
    console.log(`✅ Connection test passed in ${executionTime}ms:`, stats);
    
    return { 
      connected: true, 
      stats,
      executionTime 
    };
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`❌ Connection test failed in ${executionTime}ms:`, message);
    
    // Try to reconnect
    try {
      console.log('🔄 Attempting to reconnect...');
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
      
      return { 
        connected: true,
        executionTime: Date.now() - startTime
      };
    } catch (retryError) {
      return { 
        connected: false, 
        error: message,
        executionTime: Date.now() - startTime
      };
    }
  }
}

// Enhanced GSD-Pi integration check
export async function checkGSDPiIntegration(): Promise<{
  available: boolean;
  message: string;
  mockData?: any;
}> {
  try {
    // Check if we have GSD-related data in the database
    const gsdDataCount = await withDatabaseRetry(async () => {
      // Check for systems that might be related to GSD-Pi
      return await prisma.system.count({
        where: {
          OR: [
            { code: { contains: 'GSD', mode: 'insensitive' } },
            { name: { contains: 'topology', mode: 'insensitive' } },
            { description: { contains: 'network', mode: 'insensitive' } }
          ]
        }
      });
    }, 'GSD-Pi integration check');

    if (gsdDataCount > 0) {
      return {
        available: true,
        message: `GSD-Pi integration active with ${gsdDataCount} topology-related systems`,
        mockData: {
          nodeCount: gsdDataCount,
          connectionStatus: 'connected',
          lastUpdate: new Date().toISOString()
        }
      };
    } else {
      return {
        available: false,
        message: 'No GSD-Pi topology data found. Using mock data for development.',
        mockData: {
          nodeCount: 12,
          connectionStatus: 'mock',
          lastUpdate: new Date().toISOString()
        }
      };
    }

  } catch (error) {
    console.error('❌ GSD-Pi integration check failed:', error);
    return {
      available: false,
      message: `GSD-Pi check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      mockData: {
        nodeCount: 0,
        connectionStatus: 'error',
        lastUpdate: new Date().toISOString()
      }
    };
  }
}

/**
 * ⚠️  DO NOT register process-level shutdown handlers here.
 *
 * This module is imported by every Next.js API route. Registering
 * `SIGTERM` / `SIGINT` / `unhandledRejection` / `beforeExit` handlers that call
 * `prisma.$disconnect()` (or `process.exit()`) is catastrophic in a long-running
 * Next.js server:
 *
 *   • Next.js sends SIGTERM during HMR reloads and graceful restarts. Closing the
 *     pool there leaves the still-running server with dead sockets, producing
 *     `Error in PostgreSQL connection: Error { kind: Closed }` on every
 *     subsequent query. The UI then silently falls back to empty/stale data.
 *
 *   • An `unhandledRejection` handler that exits turns ANY stray promise
 *     rejection anywhere in the app into a full server crash.
 *
 * Prisma already tears down its pool when the process genuinely exits, and
 * serverless platforms (Vercel) reuse the pool across invocations. Explicit
 * disconnects are only appropriate in one-shot CLI scripts — those should call
 * `disconnectPrisma()` themselves.
 */
if (typeof process !== 'undefined' && process.env.PRISMA_LOG_REJECTIONS === 'true') {
  // Observability only — never disconnect, never exit.
  process.on('unhandledRejection', (reason) => {
    console.error('[prisma] unhandledRejection (non-fatal):', reason);
  });
}