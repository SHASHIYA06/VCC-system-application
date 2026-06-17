/**
 * GSD Pi Integration Service
 * Provides enhanced GSD topology visualization with system metrics
 * Integrates with Raspberry Pi-based GSD data collection
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface GSDNode {
  id: string;
  label: string;
  data: {
    code: string;
    category?: string;
    deviceCount: number;
    drawingCount: number;
    verifiedCount: number;
    dataCompleteness: number;
  };
  position: {
    x: number;
    y: number;
  };
  metrics?: {
    totalDevices: number;
    totalDrawings: number;
    avgDrawingsPerDevice: number;
    completionPercentage: number;
  };
}

export interface GSDEdge {
  id: string;
  source: string;
  target: string;
  animated: boolean;
  label?: string;
  data?: Record<string, any>;
}

export interface GSDTopology {
  nodes: GSDNode[];
  edges: GSDEdge[];
  metadata: {
    totalSystems: number;
    totalDevices: number;
    totalDrawings: number;
    averageCompleteness: number;
    lastUpdated: string;
  };
}

export interface GSDPiConfig {
  host?: string;
  port?: number;
  apiKey?: string;
  timeout?: number;
}

/**
 * GSD Pi Service for topology management and metrics
 */
class GSDPiService {
  private config: GSDPiConfig;

  constructor(config: GSDPiConfig = {}) {
    this.config = {
      host: config.host || process.env.GSD_PI_HOST || 'localhost',
      port: config.port || parseInt(process.env.GSD_PI_PORT || '8080'),
      timeout: config.timeout || 5000
    };

    console.log(`🚀 GSD Pi Service initialized: ${this.config.host}:${this.config.port}`);
  }

  /**
   * Get all systems with metadata
   */
  async getSystems() {
    try {
      const systems = await prisma.system.findMany({
        include: {
          devices: { select: { id: true, tagNo: true } },
          drawings: { select: { id: true, drawingNo: true } },
          vccDescription: { select: { source: true } },
          metadata: true
        },
        orderBy: { code: 'asc' }
      });

      return systems;
    } catch (error) {
      console.error('❌ Failed to fetch systems:', error);
      throw error;
    }
  }

  /**
   * Generate GSD topology with nodes and edges
   */
  async getTopology(): Promise<GSDTopology> {
    try {
      const systems = await this.getSystems();

      // Generate nodes
      const nodes: GSDNode[] = systems.map((sys, idx) => {
        const metadata = sys.metadata;
        return {
          id: sys.id,
          label: `${sys.code} - ${sys.name}`,
          data: {
            code: sys.code,
            category: sys.category || 'General',
            deviceCount: sys.devices.length,
            drawingCount: sys.drawings.length,
            verifiedCount: metadata?.verifiedDrawings || 0,
            dataCompleteness: metadata?.dataCompleteness || 0
          },
          position: {
            x: (idx % 5) * 350,
            y: Math.floor(idx / 5) * 300
          },
          metrics: {
            totalDevices: sys.devices.length,
            totalDrawings: sys.drawings.length,
            avgDrawingsPerDevice: sys.devices.length > 0
              ? sys.drawings.length / sys.devices.length
              : 0,
            completionPercentage: (metadata?.dataCompleteness || 0) * 100
          }
        };
      });

      // Generate edges (connections between systems)
      const edges: GSDEdge[] = [];
      for (let i = 0; i < systems.length - 1; i++) {
        edges.push({
          id: `${systems[i].id}-${systems[i + 1].id}`,
          source: systems[i].id,
          target: systems[i + 1].id,
          animated: true,
          label: 'connected',
          data: {
            type: 'system-link'
          }
        });
      }

      // Calculate metadata
      const totalDevices = systems.reduce((sum, sys) => sum + sys.devices.length, 0);
      const totalDrawings = systems.reduce((sum, sys) => sum + sys.drawings.length, 0);
      const averageCompleteness = systems.length > 0
        ? systems.reduce((sum, sys) => sum + (sys.metadata?.dataCompleteness || 0), 0) / systems.length
        : 0;

      return {
        nodes,
        edges,
        metadata: {
          totalSystems: systems.length,
          totalDevices,
          totalDrawings,
          averageCompleteness,
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Failed to generate topology:', error);
      throw error;
    }
  }

  /**
   * Get detailed information for a specific system
   */
  async getSystemDetails(systemCode: string) {
    try {
      const system = await prisma.system.findUnique({
        where: { code: systemCode },
        include: {
          devices: {
            take: 15,
            select: {
              id: true,
              tagNo: true,
              deviceName: true,
              deviceType: true,
              locationTag: true,
              wireEndpoints: { 
                select: { 
                  wire: { select: { wireNo: true, cableSpec: true } },
                  connector: { select: { connectorCode: true } },
                  pin: { select: { pinNo: true } }
                } 
              }
            }
          },
          drawings: {
            take: 15,
            select: {
              id: true,
              drawingNo: true,
              title: true,
              totalSheets: true,
              sourceFileId: true
            }
          },
          vccDescription: true,
          metadata: true
        }
      });

      if (!system) {
        throw new Error(`System ${systemCode} not found`);
      }

      return system;
    } catch (error) {
      console.error(`❌ Failed to fetch system details for ${systemCode}:`, error);
      throw error;
    }
  }

  /**
   * Get enhanced topology with performance metrics
   */
  async getEnhancedTopology() {
    try {
      const systems = await prisma.system.findMany({
        include: {
          devices: { select: { id: true } },
          drawings: { select: { id: true } },
          metadata: true,
          vccDescription: true
        },
        orderBy: { sortOrder: 'asc' }
      });

      return systems.map(sys => ({
        id: sys.id,
        code: sys.code,
        name: sys.name,
        category: sys.category,
        metrics: {
          totalDevices: sys.devices.length,
          totalDrawings: sys.drawings.length,
          avgDrawingsPerDevice: sys.devices.length > 0
            ? (sys.drawings.length / sys.devices.length).toFixed(2)
            : 0,
          completionPercentage: ((sys.metadata?.dataCompleteness || 0) * 100).toFixed(1),
          syncStatus: sys.metadata?.syncStatus || 'UNKNOWN',
          lastSync: sys.metadata?.lastSyncTime || null
        }
      }));
    } catch (error) {
      console.error('❌ Failed to get enhanced topology:', error);
      throw error;
    }
  }

  /**
   * Health check for Pi connectivity
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unreachable';
    message: string;
    systems: number;
    devices: number;
    timestamp: string;
  }> {
    try {
      const systems = await prisma.system.count();
      const devices = await prisma.device.count();

      return {
        status: 'healthy',
        message: 'GSD Pi Service operational',
        systems,
        devices,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        status: 'unreachable',
        message: 'Failed to connect to database',
        systems: 0,
        devices: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Update system metadata with sync status
   */
  async updateSystemMetadata(systemCode: string, metadata: Partial<any>) {
    try {
      return await prisma.systemMetadata.upsert({
        where: { systemCode },
        update: metadata,
        create: {
          systemCode,
          ...metadata
        }
      });
    } catch (error) {
      console.error(`❌ Failed to update metadata for ${systemCode}:`, error);
      throw error;
    }
  }

  /**
   * Get system statistics dashboard
   */
  async getStatistics() {
    try {
      const systems = await prisma.system.count();
      const devices = await prisma.device.count();
      const drawings = await prisma.drawing.count();
      const connectors = await prisma.connector.count();
      const wires = await prisma.wire.count();

      const completeMetadata = await prisma.systemMetadata.findMany();
      const avgCompleteness = completeMetadata.length > 0
        ? completeMetadata.reduce((sum, m) => sum + m.dataCompleteness, 0) / completeMetadata.length
        : 0;

      return {
        summary: {
          systems,
          devices,
          drawings,
          connectors,
          wires,
          averageCompleteness: (avgCompleteness * 100).toFixed(1) + '%'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get statistics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const gsdPiService = new GSDPiService();

// Export class for custom instances
export { GSDPiService };
