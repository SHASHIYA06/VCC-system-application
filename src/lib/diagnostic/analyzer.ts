import { prisma } from '@/lib/prisma';

/**
 * Diagnostic Analyzer
 * Provides fault detection, system health checks, and wire continuity verification
 */

export interface DiagnosticIssue {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  title: string;
  description: string;
  affectedEntity: string;
  affectedId: string;
  recommendation: string;
  timestamp: Date;
}

export interface SystemHealth {
  systemCode: string;
  systemName: string;
  healthScore: number; // 0-100
  status: 'healthy' | 'warning' | 'critical';
  deviceCount: number;
  connectorCount: number;
  wireCount: number;
  issueCount: number;
  issues: DiagnosticIssue[];
}

export interface WireContinuity {
  wireNo: string;
  signalName: string;
  status: 'continuous' | 'broken' | 'incomplete';
  sourceDevice: string;
  destDevice: string;
  endpointCount: number;
  issues: string[];
}

export interface DiagnosticReport {
  timestamp: Date;
  totalSystems: number;
  healthySystems: number;
  warningSystems: number;
  criticalSystems: number;
  overallHealth: number;
  systemHealth: SystemHealth[];
  wireContinuity: WireContinuity[];
  criticalIssues: DiagnosticIssue[];
  recommendations: string[];
}

/**
 * Analyze system health
 */
export async function analyzeSystemHealth(systemCode?: string): Promise<SystemHealth[]> {
  try {
    const where = systemCode ? { code: systemCode } : {};
    // Use count aggregations instead of loading full device/connector/wire
    // relations. Loading the relations pulled tens of thousands of rows per
    // system and made the report take 30s+ / time out.
    const systems = await prisma.system.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        _count: { select: { devices: true } },
        drawings: {
          select: {
            _count: { select: { connectors: true, wires: true } },
          },
        },
      },
    });

    const systemHealths = await Promise.all(
      systems.map(async (system) => {
        const issues = await detectSystemIssues(system.id);
        const deviceCount = system._count.devices;
        const connectorCount = system.drawings.reduce((sum, d) => sum + d._count.connectors, 0);
        const wireCount = system.drawings.reduce((sum, d) => sum + d._count.wires, 0);

        const issueCount = issues.length;
        const criticalCount = issues.filter(i => i.severity === 'critical').length;
        const warningCount = issues.filter(i => i.severity === 'warning').length;

        let healthScore = 100;
        healthScore -= criticalCount * 20;
        healthScore -= warningCount * 5;
        healthScore = Math.max(0, Math.min(100, healthScore));

        const status: SystemHealth['status'] =
          healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'warning' : 'critical';

        return {
          systemCode: system.code,
          systemName: system.name,
          healthScore,
          status,
          deviceCount,
          connectorCount,
          wireCount,
          issueCount,
          issues,
        };
      })
    );

    return systemHealths;
  } catch (error) {
    console.error('Error analyzing system health:', error);
    return [];
  }
}

/**
 * Detect issues in a system
 */
async function detectSystemIssues(systemId: string): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];

  try {
    // Run the three scans concurrently to keep per-system latency low.
    const [devicesWithoutConnections, incompleteWires, connectorsWithoutPins] = await Promise.all([
      prisma.device.findMany({
        where: {
          systemId,
          wireEndpoints: { none: {} },
        },
        select: { id: true, tagNo: true, deviceName: true },
        take: 50,
      }),
      prisma.wire.findMany({
        where: {
          drawings: { some: { drawing: { systemId } } },
          endpoints: { none: {} },
        },
        select: { id: true, wireNo: true },
        take: 25,
      }),
      prisma.connector.findMany({
        where: {
          drawing: { systemId },
          pins: { none: {} },
        },
        select: { id: true, connectorCode: true },
        take: 50,
      }),
    ]);

    for (const device of devicesWithoutConnections) {
      issues.push({
        id: `issue_${device.id}_no_conn`,
        severity: 'warning',
        type: 'disconnected_device',
        title: 'Device Without Connections',
        description: `Device ${device.tagNo || device.deviceName} has no wire connections`,
        affectedEntity: 'device',
        affectedId: device.id,
        recommendation: 'Verify device connections and wire mappings',
        timestamp: new Date(),
      });
    }

    for (const wire of incompleteWires) {
      issues.push({
        id: `issue_${wire.id}_incomplete`,
        severity: 'critical',
        type: 'incomplete_wire',
        title: 'Incomplete Wire Connection',
        description: `Wire ${wire.wireNo} has no endpoints defined, expected 2`,
        affectedEntity: 'wire',
        affectedId: wire.id,
        recommendation: 'Complete wire connections by adding missing endpoints',
        timestamp: new Date(),
      });
    }

    for (const connector of connectorsWithoutPins) {
      issues.push({
        id: `issue_${connector.id}_no_pins`,
        severity: 'warning',
        type: 'connector_no_pins',
        title: 'Connector Without Pins',
        description: `Connector ${connector.connectorCode} has no pins defined`,
        affectedEntity: 'connector',
        affectedId: connector.id,
        recommendation: 'Define pins for this connector',
        timestamp: new Date(),
      });
    }
  } catch (error) {
    console.error('Error detecting system issues:', error);
  }

  return issues;
}

/**
 * Check wire continuity
 */
export async function checkWireContinuity(wireNo?: string): Promise<WireContinuity[]> {
  try {
    // When a specific wire is requested, look it up directly. Otherwise only
    // sample wires that actually have endpoints and cap the result so the
    // report stays fast on large datasets (the wire table can hold 100k+ rows).
    const wires = await prisma.wire.findMany({
      where: wireNo ? { wireNo } : { endpoints: { some: {} } },
      include: {
        endpoints: {
          include: {
            device: true,
            connector: true,
          },
        },
      },
      ...(wireNo ? {} : { take: 200 }),
    });

    const continuities: WireContinuity[] = [];

    for (const wire of wires) {
      const endpointCount = wire.endpoints.length;
      let status: 'continuous' | 'broken' | 'incomplete' = 'continuous';
      const issues: string[] = [];

      if (endpointCount < 2) {
        status = 'broken';
        issues.push(`Only ${endpointCount} endpoint(s) found, expected 2`);
      } else if (endpointCount > 2) {
        status = 'incomplete';
        issues.push(`${endpointCount} endpoints found, expected 2`);
      }

      const sourceEndpoint = wire.endpoints[0];
      const destEndpoint = wire.endpoints[1];

      const sourceDevice = sourceEndpoint?.device?.tagNo || sourceEndpoint?.device?.deviceName || 'Unknown';
      const destDevice = destEndpoint?.device?.tagNo || destEndpoint?.device?.deviceName || 'Unknown';

      continuities.push({
        wireNo: wire.wireNo,
        signalName: wire.signalName || 'Unknown',
        status,
        sourceDevice,
        destDevice,
        endpointCount,
        issues,
      });
    }

    return continuities;
  } catch (error) {
    console.error('Error checking wire continuity:', error);
    return [];
  }
}

/**
 * Generate comprehensive diagnostic report
 */
export async function generateDiagnosticReport(): Promise<DiagnosticReport> {
  try {
    const systemHealths = await analyzeSystemHealth();
    const wireContinuities = await checkWireContinuity();

    const healthySystems = systemHealths.filter(s => s.status === 'healthy').length;
    const warningSystems = systemHealths.filter(s => s.status === 'warning').length;
    const criticalSystems = systemHealths.filter(s => s.status === 'critical').length;

    const overallHealth = systemHealths.length > 0
      ? Math.round(systemHealths.reduce((sum, s) => sum + s.healthScore, 0) / systemHealths.length)
      : 0;

    const criticalIssues = systemHealths
      .flatMap(s => s.issues)
      .filter(i => i.severity === 'critical')
      .slice(0, 10);

    const recommendations: string[] = [];
    if (criticalSystems > 0) {
      recommendations.push(`${criticalSystems} system(s) in critical condition - immediate attention required`);
    }
    if (warningSystems > 0) {
      recommendations.push(`${warningSystems} system(s) with warnings - review and address issues`);
    }

    const brokenWires = wireContinuities.filter(w => w.status === 'broken');
    if (brokenWires.length > 0) {
      recommendations.push(`${brokenWires.length} wire(s) with continuity issues - verify connections`);
    }

    return {
      timestamp: new Date(),
      totalSystems: systemHealths.length,
      healthySystems,
      warningSystems,
      criticalSystems,
      overallHealth,
      systemHealth: systemHealths,
      wireContinuity: wireContinuities,
      criticalIssues,
      recommendations,
    };
  } catch (error) {
    console.error('Error generating diagnostic report:', error);
    return {
      timestamp: new Date(),
      totalSystems: 0,
      healthySystems: 0,
      warningSystems: 0,
      criticalSystems: 0,
      overallHealth: 0,
      systemHealth: [],
      wireContinuity: [],
      criticalIssues: [],
      recommendations: ['Error generating diagnostic report'],
    };
  }
}

/**
 * Get system health for specific system
 */
export async function getSystemHealthStatus(systemCode: string): Promise<SystemHealth | null> {
  try {
    const healths = await analyzeSystemHealth(systemCode);
    return healths.length > 0 ? healths[0] : null;
  } catch (error) {
    console.error('Error getting system health status:', error);
    return null;
  }
}

/**
 * Validate pin connections
 */
export async function validatePinConnections(connectorId: string): Promise<DiagnosticIssue[]> {
  const issues: DiagnosticIssue[] = [];

  try {
    const connector = await prisma.connector.findUnique({
      where: { id: connectorId },
      include: { pins: { include: { wireEndpoints: true } } },
    });

    if (!connector) {
      return issues;
    }

    for (const pin of connector.pins) {
      if (pin.wireEndpoints.length === 0 && pin.wireNo) {
        issues.push({
          id: `issue_${pin.id}_no_endpoint`,
          severity: 'warning',
          type: 'pin_no_endpoint',
          title: 'Pin Without Endpoint',
          description: `Pin ${pin.pinNo} has wire ${pin.wireNo} but no wire endpoint`,
          affectedEntity: 'pin',
          affectedId: pin.id,
          recommendation: 'Create wire endpoint for this pin',
          timestamp: new Date(),
        });
      }
    }
  } catch (error) {
    console.error('Error validating pin connections:', error);
  }

  return issues;
}
