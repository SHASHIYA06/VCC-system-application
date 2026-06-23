/**
 * RAILWAY DIGITAL TWIN — WIRING VALIDATION ENGINE
 * =================================================================
 * Railway-grade integrity checks over the connectivity graph. Produces
 * an engineering validation report flagging the defects the user listed:
 *   - pins referencing a wire number with no Wire row
 *   - wires with no termination (dangling conductors)
 *   - single-ended wires (only one endpoint — likely incomplete)
 *   - connectors with zero pins
 *   - devices not linked to a system
 *   - drawings with no page mapping
 *
 * Read-only. Safe to run any time. Designed to power the Validation Center.
 */
import { prisma } from '@/lib/prisma';

export type Severity = 'critical' | 'warning' | 'info';

export interface ValidationFinding {
  code: string;
  title: string;
  severity: Severity;
  count: number;
  description: string;
  sample?: string[];
}

export interface ValidationReport {
  generatedAt: string;
  overallScore: number; // 0-100 connectivity health
  totals: Record<string, number>;
  findings: ValidationFinding[];
}

async function scalar(sql: string): Promise<number> {
  const rows = await prisma.$queryRawUnsafe<{ count: bigint }[]>(sql);
  return Number(rows[0]?.count ?? 0);
}

export async function runValidation(): Promise<ValidationReport> {
  const findings: ValidationFinding[] = [];

  // ---- Totals -----------------------------------------------------------
  const [wires, pins, connectors, devices, drawings, endpoints] =
    await Promise.all([
      prisma.wire.count(),
      prisma.connectorPin.count(),
      prisma.connector.count(),
      prisma.device.count(),
      prisma.drawing.count(),
      prisma.wireEndpoint.count(),
    ]);

  // ---- 1. Pins referencing a missing Wire row (critical) ---------------
  const pinsMissingWire = await scalar(
    `SELECT COUNT(*)::bigint AS count
     FROM "ConnectorPin" p
     WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
       AND NOT EXISTS (SELECT 1 FROM "Wire" w WHERE w."wireNo" = p."wireNo")`
  );
  if (pinsMissingWire > 0) {
    const sample = await prisma.$queryRawUnsafe<{ wireNo: string }[]>(
      `SELECT DISTINCT p."wireNo" FROM "ConnectorPin" p
       WHERE p."wireNo" IS NOT NULL AND p."wireNo" <> ''
         AND NOT EXISTS (SELECT 1 FROM "Wire" w WHERE w."wireNo" = p."wireNo")
       LIMIT 8`
    );
    findings.push({
      code: 'PIN_NO_WIRE',
      title: 'Pins reference a wire number with no Wire record',
      severity: 'critical',
      count: pinsMissingWire,
      description:
        'These pins cannot be traced because their wire number has no Wire row. Run the data-integrity repair to create the missing wires.',
      sample: sample.map((s) => s.wireNo),
    });
  }

  // ---- 2. Wires with no termination (dangling) -------------------------
  const danglingWires = await prisma.wire.count({
    where: { endpoints: { none: {} } },
  });
  if (danglingWires > 0) {
    findings.push({
      code: 'WIRE_NO_ENDPOINT',
      title: 'Wires with no termination point',
      severity: danglingWires > wires * 0.25 ? 'critical' : 'warning',
      count: danglingWires,
      description:
        'These conductors have no WireEndpoint, so neither end is connected to a pin/connector. They are not traceable until linked.',
    });
  }

  // ---- 3. Single-ended wires (only one endpoint) -----------------------
  const singleEnded = await scalar(
    `SELECT COUNT(*)::bigint AS count FROM (
       SELECT "wireId" FROM "WireEndpoint" GROUP BY "wireId" HAVING COUNT(*) = 1
     ) t`
  );
  if (singleEnded > 0) {
    findings.push({
      code: 'WIRE_SINGLE_ENDED',
      title: 'Single-ended wires (one termination only)',
      severity: 'warning',
      count: singleEnded,
      description:
        'A wire normally connects two points. Single-ended wires may indicate an incomplete import or a genuine spur — review against the drawing.',
    });
  }

  // ---- 4. Connectors with zero pins ------------------------------------
  const connectorsNoPins = await prisma.connector.count({
    where: { pins: { none: {} } },
  });
  if (connectorsNoPins > 0) {
    findings.push({
      code: 'CONNECTOR_NO_PINS',
      title: 'Connectors with no pins defined',
      severity: 'warning',
      count: connectorsNoPins,
      description:
        'These connectors have no pin records, so their wiring cannot be represented. Likely need pin extraction from the PIN drawing.',
    });
  }

  // ---- 5. Devices not linked to a system -------------------------------
  const devicesNoSystem = await prisma.device.count({
    where: { systemId: null },
  });
  if (devicesNoSystem > 0) {
    findings.push({
      code: 'DEVICE_NO_SYSTEM',
      title: 'Devices not assigned to a system',
      severity: 'warning',
      count: devicesNoSystem,
      description:
        'These devices are not linked to any system, so they are invisible in the hierarchy navigation.',
    });
  }

  // ---- 6. Drawings with no page mapping --------------------------------
  const drawingsNoMapping = await prisma.drawing.count({
    where: { pageMappings: { none: {} } },
  });
  if (drawingsNoMapping > 0) {
    findings.push({
      code: 'DRAWING_NO_MAPPING',
      title: 'Drawings with no PDF page mapping',
      severity: 'info',
      count: drawingsNoMapping,
      description:
        'These drawings cannot open a PDF page because no mapping exists.',
    });
  }

  // ---- Health score -----------------------------------------------------
  // Weighted: critical findings hurt most. Score reflects how much of the
  // graph is sound rather than a raw defect count.
  const criticalCount = findings
    .filter((f) => f.severity === 'critical')
    .reduce((s, f) => s + f.count, 0);
  const warningCount = findings
    .filter((f) => f.severity === 'warning')
    .reduce((s, f) => s + f.count, 0);

  const totalChecked = wires + pins + connectors + devices;
  const penalty = (criticalCount * 1.0 + warningCount * 0.25) / Math.max(totalChecked, 1);
  const overallScore = Math.max(0, Math.round((1 - penalty) * 100));

  return {
    generatedAt: new Date().toISOString(),
    overallScore,
    totals: { wires, pins, connectors, devices, drawings, endpoints },
    findings: findings.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    }),
  };
}
