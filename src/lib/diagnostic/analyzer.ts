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
    const systems = await prisma.system.findMany({
      where,
      include: {
        devices: { include: { _count: { select: { wireEndpoints: true } } } },
        drawings: { include: { connectors: true, wires: true } },
      },
    });

    const systemHealths: SystemHealth[] = [];

    for (const system of systems) {
      const issues = await detectSystemIssues(system.id);
      const deviceCount = system.devices.length;
      const connectorCount = system.drawings.reduce((sum, d) => sum + d.connectors.length, 0);
      const wireCount = system.drawings.reduce((sum, d) => sum + d.wires.length, 0);

      // Calculate health score
      const issueCount = issues.length;
      const criticalCount = issues.filter(i => i.severity === 'critical').length;
      const warningCount = issues.filter(i => i.severity === 'warning').length;

      let healthScore = 100;
      healthScore -= criticalCount * 20;
      healthScore -= warningCount * 5;
      healthScore = Math.max(0, Math.min(100, healthScore));

      const status = healthScore >= 80 ? 'healthy' : healthScore >= 50 ? 'warning' : 'critical';

      systemHealths.push({
        systemCode: system.code,
        systemName: system.name,
        healthScore,
        status,
        deviceCount,
        connectorCount,
        wireCount,
        issueCount,
        issues,
      });
    }

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
    // Check for devices without connections
    const devicesWithoutConnections = await prisma.device.findMany({
      where: {
        systemId,
        wireEndpoints: { none: {} },
      },
    });

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

    // Check for incomplete wires
    const allWires = await prisma.wire.findMany({
      include: { endpoints: true },
    });

    const incompleteWires = allWires.filter(w => w.endpoints.length < 2);

    for (const wire of incompleteWires) {
      issues.push({
        id: `issue_${wire.id}_incomplete`,
        severity: 'critical',
        type: 'incomplete_wire',
        title: 'Incomplete Wire Connection',
        description: `Wire ${wire.wireNo} has only ${wire.endpoints.length} endpoint(s), expected 2`,
        affectedEntity: 'wire',
        affectedId: wire.id,
        recommendation: 'Complete wire connections by adding missing endpoints',
        timestamp: new Date(),
      });
    }

    // Check for connectors without pins
    const connectorsWithoutPins = await prisma.connector.findMany({
      where: {
        drawing: { systemId },
        pins: { none: {} },
      },
    });

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
    const where = wireNo ? { wireNo } : {};
    const wires = await prisma.wire.findMany({
      where,
      include: {
        endpoints: {
          include: {
            device: true,
            connector: true,
          },
        },
      },
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
