import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * VCC System Tree Synchronization & Hierarchy Management
 * Implements proper tree architecture: Dashboard → Systems → Equipment → Wires → Connectors → Pins
 * Fixes orphaned data and ensures referential integrity
 */

export interface TreeSyncResult {
  success: boolean;
  message: string;
  statistics: {
    orphansFound: number;
    orphansFixed: number;
    connectorsCreated: number;
    pinsCreated: number;
    wiresLinked: number;
    systemsUpdated: number;
  };
  errors: string[];
  warnings: string[];
}

export interface SystemTreeNode {
  id: string;
  code: string;
  name: string;
  category: string;
  level: 'system';
  children: EquipmentTreeNode[];
  statistics: {
    totalEquipment: number;
    totalWires: number;
    totalConnectors: number;
    totalPins: number;
  };
}

export interface EquipmentTreeNode {
  id: string;
  tagNo: string | null;
  deviceName: string;
  deviceType: string | null;
  systemCode: string;
  level: 'equipment';
  children: WireTreeNode[];
  statistics: {
    connectedWires: number;
    connectors: number;
  };
}

export interface WireTreeNode {
  id: string;
  wireNo: string;
  signalName: string | null;
  voltageClass: string | null;
  wireColor: string | null;
  level: 'wire';
  children: ConnectorTreeNode[];
  endpoints: {
    source: string | null;
    destination: string | null;
  };
}

export interface ConnectorTreeNode {
  id: string;
  connectorCode: string;
  connectorType: string | null;
  level: 'connector';
  children: PinTreeNode[];
  statistics: {
    totalPins: number;
    assignedPins: number;
  };
}

export interface PinTreeNode {
  id: string;
  pinNo: string;
  wireNo: string | null;
  signalName: string | null;
  level: 'pin';
  isAssigned: boolean;
}

/**
 * Synchronize the entire VCC system tree and fix data integrity issues
 */
export async function syncSystemTree(): Promise<TreeSyncResult> {
  console.log('🌳 Starting VCC System Tree Synchronization...');
  
  const result: TreeSyncResult = {
    success: false,
    message: '',
    statistics: {
      orphansFound: 0,
      orphansFixed: 0,
      connectorsCreated: 0,
      pinsCreated: 0,
      wiresLinked: 0,
      systemsUpdated: 0,
    },
    errors: [],
    warnings: [],
  };

  try {
    // Step 1: Find and fix orphaned equipment (devices without systems)
    const orphanedDevices = await prisma.device.findMany({
      where: { systemId: null },
      include: { drawing: { include: { system: true } } },
    });

    result.statistics.orphansFound += orphanedDevices.length;

    for (const device of orphanedDevices) {
      if (device.drawing?.system?.id) {
        // Link device to the drawing's system
        await prisma.device.update({
          where: { id: device.id },
          data: { systemId: device.drawing.system.id },
        });
        result.statistics.orphansFixed++;
      } else {
        // Create a general system if none exists
        const generalSystem = await prisma.system.upsert({
          where: { code: 'GEN' },
          update: {},
          create: {
            code: 'GEN',
            name: 'General & Conventions',
            category: 'Foundation',
            description: 'Drawing list, classification, wiring numbers, symbols & conventions',
            sortOrder: 0,
          },
        });

        await prisma.device.update({
          where: { id: device.id },
          data: { systemId: generalSystem.id },
        });
        result.statistics.orphansFixed++;
      }
    }

    // Step 2: Find and fix orphaned wires (wires without proper endpoints)
    const orphanedWires = await prisma.wire.findMany({
      include: { endpoints: { include: { device: true, connector: true, pin: true } } },
    });

    for (const wire of orphanedWires) {
      if (wire.endpoints.length < 2) {
        result.statistics.orphansFound++;

        // Try to create endpoints based on wire properties
        if (wire.sourceEquipment && wire.destEquipment) {
          // Find or create devices for the endpoints
          const sourceDevice = await findOrCreateDevice(wire.sourceEquipment, wire.sourceConnector);
          const destDevice = await findOrCreateDevice(wire.destEquipment, wire.destConnector);

          if (sourceDevice && destDevice) {
            // Create missing endpoints
            if (!wire.endpoints.find(ep => ep.deviceId === sourceDevice.id)) {
              await prisma.wireEndpoint.create({
                data: {
                  wireId: wire.id,
                  deviceId: sourceDevice.id,
                  endpointRole: 'source',
                  endpointLabel: wire.sourceConnector || 'SOURCE',
                  endpointPin: wire.sourcePin || undefined,
                },
              });
            }

            if (!wire.endpoints.find(ep => ep.deviceId === destDevice.id)) {
              await prisma.wireEndpoint.create({
                data: {
                  wireId: wire.id,
                  deviceId: destDevice.id,
                  endpointRole: 'destination',
                  endpointLabel: wire.destConnector || 'DEST',
                  endpointPin: wire.destPin || undefined,
                },
              });
            }

            result.statistics.wiresLinked++;
            result.statistics.orphansFixed++;
          }
        }
      }
    }

    // Step 3: Ensure all drawings have proper connectors
    const drawingsWithoutConnectors = await prisma.drawing.findMany({
      where: {
        connectors: { none: {} },
        // Focus on drawings that should have connectors (PIN, EDB, Panel drawings)
        OR: [
          { title: { contains: 'PIN', mode: 'insensitive' } },
          { title: { contains: 'EDB', mode: 'insensitive' } },
          { title: { contains: 'Panel', mode: 'insensitive' } },
          { title: { contains: 'Connector', mode: 'insensitive' } },
        ],
      },
      include: { system: true },
    });

    for (const drawing of drawingsWithoutConnectors) {
      result.statistics.orphansFound++;

      // Create standard connectors for the drawing
      const connectorTypes = ['X1', 'X2', 'X3', 'X4']; // Standard intercar connectors

      for (const connectorCode of connectorTypes) {
        const connector = await prisma.connector.create({
          data: {
            drawingId: drawing.id,
            connectorCode,
            connectorTypeCode: '74P', // 74-pin intercar connector
            pinCount: 74,
            scope: 'INTERCAR',
            description: `Standard 74-pin intercar connector ${connectorCode}`,
            carType: 'ALL',
          },
        });

        result.statistics.connectorsCreated++;

        // Create 74 pins for each connector
        for (let pinNumber = 1; pinNumber <= 74; pinNumber++) {
          await prisma.connectorPin.create({
            data: {
              connectorId: connector.id,
              pinNo: pinNumber.toString().padStart(2, '0'),
              pinLabel: `Pin ${pinNumber}`,
              conductorClassCode: 'CN',
            },
          });
          result.statistics.pinsCreated++;
        }
      }

      result.statistics.orphansFixed++;
    }

    // Step 4: Link wire endpoints to connector pins where possible
    const unlinkedEndpoints = await prisma.wireEndpoint.findMany({
      where: { pinId: null, connectorId: { not: null } },
      include: { connector: { include: { pins: true } } },
    });

    for (const endpoint of unlinkedEndpoints) {
      if (endpoint.connector && endpoint.endpointPin) {
        const pin = endpoint.connector.pins.find(
          p => p.pinNo === endpoint.endpointPin || p.pinLabel === endpoint.endpointPin
        );

        if (pin) {
          await prisma.wireEndpoint.update({
            where: { id: endpoint.id },
            data: { pinId: pin.id },
          });
          result.statistics.wiresLinked++;
        }
      }
    }

    // Step 5: Update system statistics and validate tree integrity
    const systems = await prisma.system.findMany({
      include: {
        _count: {
          select: {
            devices: true,
            drawings: true,
          },
        },
      },
    });

    for (const system of systems) {
      // Update sort order if not set
      if (system.sortOrder === 0 && system.code !== 'GEN') {
        const sortOrder = getSortOrderForSystem(system.code);
        await prisma.system.update({
          where: { id: system.id },
          data: { sortOrder },
        });
        result.statistics.systemsUpdated++;
      }
    }

    // Final validation: Check tree integrity
    const treeValidation = await validateTreeIntegrity();
    result.warnings = treeValidation.warnings;

    result.success = true;
    result.message = `Tree synchronization completed successfully. Fixed ${result.statistics.orphansFixed} orphaned records, created ${result.statistics.connectorsCreated} connectors, ${result.statistics.pinsCreated} pins, and linked ${result.statistics.wiresLinked} wire endpoints.`;

    console.log('✅ VCC System Tree Synchronization completed');
    return result;

  } catch (error) {
    console.error('❌ Tree synchronization failed:', error);
    result.errors.push(error instanceof Error ? error.message : String(error));
    result.message = 'Tree synchronization failed due to database errors';
    return result;
  }
}

/**
 * Find or create a device based on equipment name and connector
 */
async function findOrCreateDevice(equipmentName: string, connectorCode?: string | null): Promise<{ id: string } | null> {
  try {
    // Try to find existing device
    let device = await prisma.device.findFirst({
      where: {
        OR: [
          { tagNo: equipmentName },
          { deviceName: { contains: equipmentName, mode: 'insensitive' } },
        ],
      },
    });

    if (!device) {
      // Create new device
      const generalSystem = await prisma.system.findFirst({
        where: { code: 'GEN' },
      });

      if (generalSystem) {
        device = await prisma.device.create({
          data: {
            deviceName: equipmentName,
            tagNo: equipmentName,
            deviceType: 'EQUIPMENT',
            systemId: generalSystem.id,
            drawingId: '', // Will need to be updated when we know the drawing
          },
        });
      }
    }

    return device;
  } catch (error) {
    console.error(`Failed to find/create device ${equipmentName}:`, error);
    return null;
  }
}

/**
 * Get appropriate sort order for a system code
 */
function getSortOrderForSystem(code: string): number {
  const sortMap: Record<string, number> = {
    'GEN': 1,
    'TRL': 2,
    'CAB': 3,
    'TRAC': 4,
    'BRAKE': 5,
    'APS': 6,
    'DOOR': 7,
    'VAC': 8,
    'COMMS': 9,
    'TMS': 10,
  };

  return sortMap[code] || 99;
}

/**
 * Validate the complete tree integrity
 */
async function validateTreeIntegrity(): Promise<{ warnings: string[] }> {
  const warnings: string[] = [];

  try {
    // Check for devices without systems
    const orphanDevices = await prisma.device.count({
      where: { systemId: null },
    });

    if (orphanDevices > 0) {
      warnings.push(`Found ${orphanDevices} devices without system assignment`);
    }

    // Check for wires without endpoints
    const incompleteWires = await prisma.wire.findMany({
      include: { _count: { select: { endpoints: true } } },
    });

    const wiresWithoutEndpoints = incompleteWires.filter(w => w._count.endpoints < 2);

    if (wiresWithoutEndpoints.length > 0) {
      warnings.push(`Found ${wiresWithoutEndpoints.length} wires with incomplete endpoints`);
    }

    // Check for connectors without pins
    const connectorsWithoutPins = await prisma.connector.findMany({
      include: { _count: { select: { pins: true } } },
    });

    const emptyConnectors = connectorsWithoutPins.filter(c => c._count.pins === 0);

    if (emptyConnectors.length > 0) {
      warnings.push(`Found ${emptyConnectors.length} connectors without pins`);
    }

    return { warnings };
  } catch (error) {
    console.error('Tree validation failed:', error);
    return { warnings: ['Tree validation failed due to database error'] };
  }
}

/**
 * Get the complete system tree structure
 */
export async function getSystemTree(systemCode?: string): Promise<SystemTreeNode[]> {
  try {
    const whereCondition = systemCode ? { code: systemCode } : {};

    const systems = await prisma.system.findMany({
      where: whereCondition,
      include: {
        devices: {
          include: {
            wireEndpoints: {
              include: {
                wire: true,
                connector: {
                  include: {
                    pins: true,
                  },
                },
                pin: true,
              },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return systems.map(system => ({
      id: system.id,
      code: system.code,
      name: system.name,
      category: system.category || 'General',
      level: 'system' as const,
      children: system.devices.map(device => ({
        id: device.id,
        tagNo: device.tagNo,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        systemCode: system.code,
        level: 'equipment' as const,
        children: getWiresForDevice(device),
        statistics: {
          connectedWires: device.wireEndpoints.length,
          connectors: new Set(device.wireEndpoints.map(ep => ep.connectorId).filter(Boolean)).size,
        },
      })),
      statistics: {
        totalEquipment: system.devices.length,
        totalWires: system.devices.reduce((sum, device) => sum + device.wireEndpoints.length, 0),
        totalConnectors: new Set(
          system.devices.flatMap(device => 
            device.wireEndpoints.map(ep => ep.connectorId).filter(Boolean)
          )
        ).size,
        totalPins: system.devices.reduce((sum, device) => 
          sum + device.wireEndpoints.filter(ep => ep.pinId).length, 0
        ),
      },
    }));
  } catch (error) {
    console.error('Failed to get system tree:', error);
    return [];
  }
}

/**
 * Helper function to extract wires for a device
 */
function getWiresForDevice(device: any): WireTreeNode[] {
  const wireMap = new Map<string, any>();

  // Collect unique wires from endpoints
  device.wireEndpoints.forEach((endpoint: any) => {
    if (endpoint.wire && !wireMap.has(endpoint.wire.id)) {
      wireMap.set(endpoint.wire.id, endpoint.wire);
    }
  });

  return Array.from(wireMap.values()).map(wire => ({
    id: wire.id,
    wireNo: wire.wireNo,
    signalName: wire.signalName,
    voltageClass: wire.voltageClass,
    wireColor: wire.wireColor,
    level: 'wire' as const,
    children: getConnectorsForWire(device.wireEndpoints, wire.id),
    endpoints: {
      source: wire.sourceEquipment,
      destination: wire.destEquipment,
    },
  }));
}

/**
 * Helper function to extract connectors for a wire
 */
function getConnectorsForWire(wireEndpoints: any[], wireId: string): ConnectorTreeNode[] {
  const connectorMap = new Map<string, any>();

  wireEndpoints
    .filter(ep => ep.wire?.id === wireId && ep.connector)
    .forEach(endpoint => {
      if (!connectorMap.has(endpoint.connector.id)) {
        connectorMap.set(endpoint.connector.id, endpoint.connector);
      }
    });

  return Array.from(connectorMap.values()).map(connector => ({
    id: connector.id,
    connectorCode: connector.connectorCode,
    connectorType: connector.connectorTypeCode,
    level: 'connector' as const,
    children: connector.pins?.map((pin: any) => ({
      id: pin.id,
      pinNo: pin.pinNo,
      wireNo: pin.wireNo,
      signalName: pin.signalName,
      level: 'pin' as const,
      isAssigned: Boolean(pin.wireNo),
    })) || [],
    statistics: {
      totalPins: connector.pins?.length || 0,
      assignedPins: connector.pins?.filter((pin: any) => pin.wireNo).length || 0,
    },
  }));
}

/**
 * Get tree statistics for the dashboard
 */
export async function getTreeStatistics(): Promise<{
  totalSystems: number;
  totalEquipment: number;
  totalWires: number;
  totalConnectors: number;
  totalPins: number;
  orphanedDevices: number;
  incompleteWires: number;
  emptyConnectors: number;
  hierarchyHealth: number; // Percentage score
}> {
  try {
    const [
      totalSystems,
      totalEquipment,
      totalWires,
      totalConnectors,
      totalPins,
      orphanedDevices,
      incompleteWires,
      emptyConnectors,
    ] = await Promise.all([
      prisma.system.count(),
      prisma.device.count(),
      prisma.wire.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
      prisma.device.count({ where: { systemId: null } }),
      prisma.wire.count({
        where: { endpoints: { none: {} } },
      }),
      prisma.connector.count({
        where: { pins: { none: {} } },
      }),
    ]);

    // Calculate hierarchy health score (0-100%)
    const totalIssues = orphanedDevices + incompleteWires + emptyConnectors;
    const totalEntities = totalEquipment + totalWires + totalConnectors;
    const hierarchyHealth = totalEntities > 0 
      ? Math.round(((totalEntities - totalIssues) / totalEntities) * 100)
      : 100;

    return {
      totalSystems,
      totalEquipment,
      totalWires,
      totalConnectors,
      totalPins,
      orphanedDevices,
      incompleteWires,
      emptyConnectors,
      hierarchyHealth,
    };
  } catch (error) {
    console.error('Failed to get tree statistics:', error);
    return {
      totalSystems: 0,
      totalEquipment: 0,
      totalWires: 0,
      totalConnectors: 0,
      totalPins: 0,
      orphanedDevices: 0,
      incompleteWires: 0,
      emptyConnectors: 0,
      hierarchyHealth: 0,
    };
  }
}