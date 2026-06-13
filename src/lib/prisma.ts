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
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
  });
}

// Singleton pattern - reuse connection across hot reloads
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

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

// Process cleanup with enhanced logging
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    console.log('🧹 Process cleanup: Disconnecting database...');
    await shutdownDatabase();
  });

  process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, cleaning up database connections...');
    await shutdownDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, cleaning up database connections...');
    await shutdownDatabase();
    process.exit(0);
  });

  process.on('uncaughtException', async (error) => {
    console.error('💥 Uncaught exception, cleaning up database:', error);
    await shutdownDatabase();
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason, promise) => {
    console.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
    await shutdownDatabase();
    process.exit(1);
  });
}