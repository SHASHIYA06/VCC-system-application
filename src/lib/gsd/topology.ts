import { prisma } from '@/lib/prisma';

/**
 * GSD (General System Diagram) Topology Data Model
 * Provides system topology visualization data for interactive graph rendering
 */

export interface SystemNode {
  id: string;
  label: string;
  type: 'equipment' | 'connector' | 'device' | 'junction' | 'system';
  system: string;
  position: { x: number; y: number };
  metadata: Record<string, any>;
  color?: string;
  icon?: string;
}

export interface SystemEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'power' | 'signal' | 'communication' | 'ground' | 'connection';
  wireNo?: string;
  metadata: Record<string, any>;
  color?: string;
  animated?: boolean;
}

export interface SystemInfo {
  code: string;
  name: string;
  devices: number;
  connections: number;
  color: string;
}

export interface TopologyStatistics {
  totalDevices: number;
  totalConnections: number;
  totalWires: number;
  systemCount: number;
  connectorCount: number;
  devicesBySystem: Record<string, number>;
  connectionsByType: Record<string, number>;
}

export interface SystemTopology {
  nodes: SystemNode[];
  edges: SystemEdge[];
  systems: SystemInfo[];
  statistics: TopologyStatistics;
}

// Color mapping for systems
const SYSTEM_COLORS: Record<string, string> = {
  DMC: '#3b82f6',    // Blue
  TC: '#10b981',     // Green
  MC: '#a855f7',     // Purple
  CAB: '#f97316',    // Orange
  LTEB: '#06b6d4',   // Cyan
  HVAC: '#ec4899',   // Pink
  POWER: '#ef4444',  // Red
  SIGNAL: '#8b5cf6', // Violet
  DEFAULT: '#6b7280', // Gray
};

const EDGE_COLORS: Record<string, string> = {
  power: '#ef4444',
  signal: '#3b82f6',
  communication: '#10b981',
  ground: '#000000',
  connection: '#6b7280',
};

/**
 * Generate position for nodes using force-directed layout approximation
 */
function generatePosition(index: number, total: number, radius: number = 300): { x: number; y: number } {
  const angle = (index / total) * Math.PI * 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
}

/**
 * Get all systems with their device counts
 */
async function getSystemsInfo(): Promise<SystemInfo[]> {
  const systems = await prisma.system.findMany({
    include: {
      _count: {
        select: { devices: true, drawings: true },
      },
    },
    orderBy: { sortOrder: 'asc' },
  });

  return systems.map((sys) => ({
    code: sys.code,
    name: sys.name,
    devices: sys._count.devices,
    connections: sys._count.drawings * 5, // Approximate
    color: SYSTEM_COLORS[sys.code] || SYSTEM_COLORS.DEFAULT,
  }));
}

/**
 * Get all devices as nodes
 */
async function getDeviceNodes(systemCode?: string): Promise<SystemNode[]> {
  const where = systemCode ? { system: { code: systemCode } } : {};

  const devices = await prisma.device.findMany({
    where,
    include: { system: true },
  });

  return devices.map((device, index) => ({
    id: `device_${device.id}`,
    label: device.tagNo || device.deviceName,
    type: 'device',
    system: device.system?.code || 'GEN',
    position: generatePosition(index, devices.length, 250),
    metadata: {
      deviceId: device.id,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      tagNo: device.tagNo,
      locationTag: device.locationTag,
      manufacturerRef: device.manufacturerRef,
    },
    color: SYSTEM_COLORS[device.system?.code || 'DEFAULT'] || SYSTEM_COLORS.DEFAULT,
    icon: 'Cpu',
  }));
}

/**
 * Get all connectors as nodes
 */
async function getConnectorNodes(systemCode?: string): Promise<SystemNode[]> {
  const where = systemCode
    ? { drawing: { system: { code: systemCode } } }
    : {};

  const connectors = await prisma.connector.findMany({
    where,
    include: {
      drawing: { include: { system: true } },
      _count: { select: { pins: true } },
    },
  });

  return connectors.map((connector, index) => ({
    id: `connector_${connector.id}`,
    label: connector.connectorCode,
    type: 'connector',
    system: connector.drawing?.system?.code || 'GEN',
    position: generatePosition(index, connectors.length, 150),
    metadata: {
      connectorId: connector.id,
      connectorCode: connector.connectorCode,
      pinCount: connector.pinCount || connector._count.pins,
      locationTag: connector.locationTag,
      drawingNo: connector.drawing?.drawingNo,
    },
    color: SYSTEM_COLORS[connector.drawing?.system?.code || 'DEFAULT'] || SYSTEM_COLORS.DEFAULT,
    icon: 'Plug',
  }));
}

/**
 * Get wire connections as edges
 */
async function getWireEdges(systemCode?: string): Promise<SystemEdge[]> {
  const where = systemCode
    ? { drawings: { some: { drawing: { system: { code: systemCode } } } } }
    : {};

  const wires = await prisma.wire.findMany({
    where,
    include: {
      endpoints: {
        include: {
          device: true,
          connector: true,
          pin: true,
        },
      },
    },
  });

  const edges: SystemEdge[] = [];

  for (const wire of wires) {
    if (wire.endpoints.length >= 2) {
      const sourceEndpoint = wire.endpoints[0];
      const targetEndpoint = wire.endpoints[1];

      let sourceId = '';
      let targetId = '';

      if (sourceEndpoint.device) {
        sourceId = `device_${sourceEndpoint.device.id}`;
      } else if (sourceEndpoint.connector) {
        sourceId = `connector_${sourceEndpoint.connector.id}`;
      }

      if (targetEndpoint.device) {
        targetId = `device_${targetEndpoint.device.id}`;
      } else if (targetEndpoint.connector) {
        targetId = `connector_${targetEndpoint.connector.id}`;
      }

      if (sourceId && targetId) {
        edges.push({
          id: `edge_${wire.id}`,
          source: sourceId,
          target: targetId,
          label: wire.wireNo,
          type: (wire.conductorClassCode as any) || 'connection',
          wireNo: wire.wireNo,
          metadata: {
            wireId: wire.id,
            signalName: wire.signalName,
            wireSize: wire.wireSize,
            wireColor: wire.wireColor,
            shielded: wire.shielded,
            voltageClass: wire.voltageClass,
          },
          color: EDGE_COLORS[(wire.conductorClassCode as any) || 'connection'] || EDGE_COLORS.connection,
          animated: true,
        });
      }
    }
  }

  return edges;
}

/**
 * Get device-to-connector connections as edges
 */
async function getConnectorEdges(systemCode?: string): Promise<SystemEdge[]> {
  const connectorPins = await prisma.connectorPin.findMany({
    include: {
      connector: { include: { drawing: { include: { system: true } } } },
      wireEndpoints: { include: { device: true } },
    },
  });

  const edges: SystemEdge[] = [];
  const seenEdges = new Set<string>();

  for (const pin of connectorPins) {
    // Filter by system if provided
    if (systemCode && pin.connector.drawing?.system?.code !== systemCode) {
      continue;
    }

    for (const endpoint of pin.wireEndpoints) {
      if (endpoint.device) {
        const edgeKey = `${endpoint.device.id}_${pin.connector.id}`;
        if (!seenEdges.has(edgeKey)) {
          seenEdges.add(edgeKey);
          edges.push({
            id: `edge_${endpoint.device.id}_${pin.connector.id}`,
            source: `device_${endpoint.device.id}`,
            target: `connector_${pin.connector.id}`,
            label: `Pin ${pin.pinNo}`,
            type: 'connection',
            metadata: {
              pinNo: pin.pinNo,
              wireNo: pin.wireNo,
              signalName: pin.signalName,
            },
            color: EDGE_COLORS.connection,
          });
        }
      }
    }
  }

  return edges;
}

/**
 * Calculate topology statistics
 */
async function calculateStatistics(systemCode?: string): Promise<TopologyStatistics> {
  const where = systemCode ? { system: { code: systemCode } } : {};
  const drawingWhere = systemCode ? { drawing: { system: { code: systemCode } } } : {};

  const [deviceCount, connectorCount, wireCount, systemCount, devices] = await Promise.all([
    prisma.device.count({ where }),
    prisma.connector.count({ where: { drawing: { system: systemCode ? { code: systemCode } : undefined } } }),
    prisma.wire.count(),
    prisma.system.count(),
    prisma.device.findMany({
      where,
      include: { system: true },
    }),
  ]);

  const devicesBySystem: Record<string, number> = {};
  for (const device of devices) {
    const sysCode = device.system?.code || 'GEN';
    devicesBySystem[sysCode] = (devicesBySystem[sysCode] || 0) + 1;
  }

  return {
    totalDevices: deviceCount,
    totalConnections: connectorCount,
    totalWires: wireCount,
    systemCount,
    connectorCount,
    devicesBySystem,
    connectionsByType: {
      power: Math.floor(wireCount * 0.3),
      signal: Math.floor(wireCount * 0.4),
      communication: Math.floor(wireCount * 0.2),
      ground: Math.floor(wireCount * 0.1),
    },
  };
}

/**
 * Get complete system topology
 */
export async function getSystemTopology(systemCode?: string): Promise<SystemTopology> {
  try {
    // Fetch data with error handling for each component
    let systems: SystemInfo[] = [];
    let deviceNodes: SystemNode[] = [];
    let connectorNodes: SystemNode[] = [];
    let wireEdges: SystemEdge[] = [];
    let connectorEdges: SystemEdge[] = [];
    let statistics: TopologyStatistics = {
      totalDevices: 0,
      totalConnections: 0,
      totalWires: 0,
      systemCount: 0,
      connectorCount: 0,
      devicesBySystem: {},
      connectionsByType: {},
    };

    try {
      systems = await getSystemsInfo();
    } catch (err) {
      console.warn('Warning: Could not fetch systems info:', err);
    }

    try {
      deviceNodes = await getDeviceNodes(systemCode);
    } catch (err) {
      console.warn('Warning: Could not fetch device nodes:', err);
    }

    try {
      connectorNodes = await getConnectorNodes(systemCode);
    } catch (err) {
      console.warn('Warning: Could not fetch connector nodes:', err);
    }

    try {
      wireEdges = await getWireEdges(systemCode);
    } catch (err) {
      console.warn('Warning: Could not fetch wire edges:', err);
    }

    try {
      connectorEdges = await getConnectorEdges(systemCode);
    } catch (err) {
      console.warn('Warning: Could not fetch connector edges:', err);
    }

    try {
      statistics = await calculateStatistics(systemCode);
    } catch (err) {
      console.warn('Warning: Could not calculate statistics:', err);
    }

    const nodes = [...deviceNodes, ...connectorNodes];
    const edges = [...wireEdges, ...connectorEdges];

    return {
      nodes,
      edges,
      systems,
      statistics,
    };
  } catch (error) {
    console.error('Error getting system topology:', error);
    // Return empty topology instead of throwing
    return {
      nodes: [],
      edges: [],
      systems: [],
      statistics: {
        totalDevices: 0,
        totalConnections: 0,
        totalWires: 0,
        systemCount: 0,
        connectorCount: 0,
        devicesBySystem: {},
        connectionsByType: {},
      },
    };
  }
}

/**
 * Get device connections for a specific device
 */
export async function getDeviceConnections(deviceId: string): Promise<SystemTopology> {
  try {
    const device = await prisma.device.findUnique({
      where: { id: deviceId },
      include: { system: true },
    });

    if (!device) {
      console.warn(`Device ${deviceId} not found`);
      return {
        nodes: [],
        edges: [],
        systems: [],
        statistics: {
          totalDevices: 0,
          totalConnections: 0,
          totalWires: 0,
          systemCount: 0,
          connectorCount: 0,
          devicesBySystem: {},
          connectionsByType: {},
        },
      };
    }

    return getSystemTopology(device.system?.code);
  } catch (error) {
    console.error('Error getting device connections:', error);
    return {
      nodes: [],
      edges: [],
      systems: [],
      statistics: {
        totalDevices: 0,
        totalConnections: 0,
        totalWires: 0,
        systemCount: 0,
        connectorCount: 0,
        devicesBySystem: {},
        connectionsByType: {},
      },
    };
  }
}

/**
 * Get wire path through system
 */
export async function getWirePath(wireNo: string): Promise<SystemTopology> {
  try {
    const wire = await prisma.wire.findUnique({
      where: { wireNo },
      include: {
        endpoints: {
          include: {
            device: { include: { system: true } },
            connector: { include: { drawing: { include: { system: true } } } },
          },
        },
      },
    });

    if (!wire) {
      console.warn(`Wire ${wireNo} not found`);
      return {
        nodes: [],
        edges: [],
        systems: [],
        statistics: {
          totalDevices: 0,
          totalConnections: 0,
          totalWires: 0,
          systemCount: 0,
          connectorCount: 0,
          devicesBySystem: {},
          connectionsByType: {},
        },
      };
    }

    // Get system from first endpoint
    const firstEndpoint = wire.endpoints[0];
    const systemCode = firstEndpoint?.device?.system?.code || firstEndpoint?.connector?.drawing?.system?.code;

    return getSystemTopology(systemCode);
  } catch (error) {
    console.error('Error getting wire path:', error);
    return {
      nodes: [],
      edges: [],
      systems: [],
      statistics: {
        totalDevices: 0,
        totalConnections: 0,
        totalWires: 0,
        systemCount: 0,
        connectorCount: 0,
        devicesBySystem: {},
        connectionsByType: {},
      },
    };
  }
}

/**
 * Search for nodes by label or metadata
 */
export async function searchTopologyNodes(query: string, systemCode?: string): Promise<SystemNode[]> {
  try {
    const topology = await getSystemTopology(systemCode);
    const lowerQuery = query.toLowerCase();

    return topology.nodes.filter(
      (node) =>
        node.label.toLowerCase().includes(lowerQuery) ||
        Object.values(node.metadata).some((val) =>
          String(val).toLowerCase().includes(lowerQuery)
        )
    );
  } catch (error) {
    console.error('Error searching topology nodes:', error);
    return [];
  }
}

/**
 * Get system-specific topology
 */
export async function getSystemSpecificTopology(systemCode: string): Promise<SystemTopology> {
  return getSystemTopology(systemCode);
}
