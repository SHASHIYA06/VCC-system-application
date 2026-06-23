/**
 * FULL DATA INTEGRITY AUDIT
 * Identifies every gap in the database so we can fix to 100% accuracy.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('==================================================');
  console.log('   VCC DATABASE FULL INTEGRITY AUDIT');
  console.log('==================================================\n');

  // 1. Core counts
  const [systems, drawings, devices, connectors, pins, wires, trainlines, endpoints, circuits] =
    await Promise.all([
      prisma.system.count(),
      prisma.drawing.count(),
      prisma.device.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
      prisma.wire.count(),
      prisma.trainLine.count(),
      prisma.wireEndpoint.count(),
      prisma.circuit.count().catch(() => 0),
    ]);

  console.log('=== CORE COUNTS ===');
  console.log(`Systems:        ${systems}`);
  console.log(`Drawings:       ${drawings}`);
  console.log(`Devices:        ${devices}`);
  console.log(`Connectors:     ${connectors}`);
  console.log(`Pins:           ${pins}`);
  console.log(`Wires:          ${wires}`);
  console.log(`TrainLines:     ${trainlines}`);
  console.log(`WireEndpoints:  ${endpoints}`);
  console.log(`Circuits:       ${circuits}\n`);

  // 2. Orphan checks
  console.log('=== ORPHAN / GAP CHECKS ===');

  const devicesNoSystem = await prisma.device.count({ where: { systemId: null } });
  console.log(`Devices without system:        ${devicesNoSystem}`);

  const drawingsNoSystem = await prisma.drawing.count({ where: { systemId: null } });
  console.log(`Drawings without system:       ${drawingsNoSystem}`);

  const connectorsNoDrawing = 0; // drawingId is non-nullable on Connector
  console.log(`Connectors without drawing:    N/A (required field)`);

  const pinsNoWire = await prisma.connectorPin.count({ where: { wireNo: null } });
  console.log(`Pins without wireNo:           ${pinsNoWire}`);

  const pinsWithWire = await prisma.connectorPin.count({ where: { wireNo: { not: null } } });
  console.log(`Pins WITH wireNo:              ${pinsWithWire}`);

  // 3. Distinct wireNos in pins vs Wire table
  const distinctPinWires = await prisma.connectorPin.findMany({
    where: { wireNo: { not: null } },
    distinct: ['wireNo'],
    select: { wireNo: true },
  });
  console.log(`Distinct wireNos in pins:      ${distinctPinWires.length}`);

  // 4. PDF page mapping coverage
  const drawingsWithPdfUrl = await prisma.drawing.count({ where: { drawingPdfUrl: { not: null } } }).catch(() => -1);
  const pageMappingCount = await prisma.drawingPageMapping.count().catch(() => -1);
  const drawingsWithMapping = await prisma.drawing.count({ where: { pageMappings: { some: {} } } }).catch(() => -1);
  console.log(`Drawings with drawingPdfUrl:   ${drawingsWithPdfUrl}`);
  console.log(`Total DrawingPageMappings:     ${pageMappingCount}`);
  console.log(`Drawings with >=1 mapping:     ${drawingsWithMapping}`);

  // 5. Synced drawings
  const syncedDrawings = await prisma.drawing.count({ where: { isSynced: true } }).catch(() => -1);
  console.log(`Synced drawings (isSynced):    ${syncedDrawings}`);

  // 6. Systems breakdown
  console.log('\n=== SYSTEMS BREAKDOWN ===');
  const systemsList = await prisma.system.findMany({
    select: {
      code: true,
      name: true,
      _count: { select: { devices: true, drawings: true } },
    },
    orderBy: { code: 'asc' },
  });
  for (const s of systemsList) {
    console.log(`  ${s.code.padEnd(12)} ${(s.name || '').slice(0, 40).padEnd(42)} devices=${s._count.devices} drawings=${s._count.drawings}`);
  }

  // 7. Sample wires with suffixes
  console.log('\n=== WIRE SUFFIX SAMPLES ===');
  const suffixWires = await prisma.wire.findMany({
    where: {
      OR: [
        { wireNo: { contains: 'a' } },
        { wireNo: { contains: '/' } },
        { wireNo: { contains: 'b' } },
      ],
    },
    take: 20,
    select: { wireNo: true, signalName: true },
    orderBy: { wireNo: 'asc' },
  });
  console.log(`Wires with a/b// suffix (sample): ${suffixWires.length}`);
  suffixWires.forEach(w => console.log(`  ${w.wireNo} -> ${w.signalName || ''}`));

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
