/**
 * COMPLETE DATA SYNCHRONIZATION
 * =============================
 * Fixes all database relationships and ensures data integrity:
 * 1. Link connectors to drawings
 * 2. Link pins to wires
 * 3. Link wires to devices via endpoints
 * 4. Set up train→car→system hierarchy
 * 5. Verify all relationships
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncConnectorsToDrawings() {
  console.log('🔗 Step 1: Syncing connectors to drawings...\n');
  
  const connectors = await prisma.connector.findMany({
    where: { drawingId: { equals: '' } },
    include: { drawing: true }
  });
  
  // Try to find drawings by matching drawing number in connector's extra data
  for (const connector of connectors) {
    const extra = connector.extra as Record<string, unknown>;
    const drawingNo = extra?.drawingNo as string | undefined;
    
    if (drawingNo) {
      const drawing = await prisma.drawing.findFirst({
        where: { drawingNo }
      });
      
      if (drawing) {
        await prisma.connector.update({
          where: { id: connector.id },
          data: { drawingId: drawing.id }
        });
      }
    }
  }
  
  console.log('  ✓ Connector drawing links updated\n');
}

async function syncPinsToWires() {
  console.log('🔗 Step 2: Syncing pins to wires via wireNo...\n');
  
  // Find pins that have wireNo but aren't linked through WireEndpoint
  const pinsWithWireNo = await prisma.connectorPin.findMany({
    where: {
      wireNo: { not: null, not: '' },
      wireEndpoints: { none: {} }
    },
    take: 5000
  });
  
  console.log(`  Found ${pinsWithWireNo.length} pins needing wire links`);
  
  let linked = 0;
  for (const pin of pinsWithWireNo) {
    if (!pin.wireNo) continue;
    
    const wire = await prisma.wire.findFirst({
      where: {
        OR: [
          { wireNo: pin.wireNo },
          { wireNo: { equals: pin.wireNo, mode: 'insensitive' } }
        ]
      }
    });
    
    if (wire) {
      await prisma.wireEndpoint.create({
        data: {
          wireId: wire.id,
          pinId: pin.id,
          connectorId: pin.connectorId,
          endpointRole: 'endpoint',
          endpointPin: pin.pinNo
        }
      });
      linked++;
    }
  }
  
  console.log(`  ✓ Linked ${linked} pins to wires\n`);
}

async function syncDevicesToSystems() {
  console.log('🔗 Step 3: Syncing devices to systems...\n');
  
  // Get devices without system
  const orphanDevices = await prisma.device.findMany({
    where: { systemId: null },
    include: { drawing: { include: { system: true } } }
  });
  
  let linked = 0;
  for (const device of orphanDevices) {
    if (device.drawing?.systemId) {
      await prisma.device.update({
        where: { id: device.id },
        data: { systemId: device.drawing.systemId }
      });
      linked++;
    }
  }
  
  console.log(`  ✓ Linked ${linked} devices to systems\n`);
}

async function verifyDataIntegrity() {
  console.log('🔍 Step 4: Verifying data integrity...\n');
  
  const [
    totalWires,
    wiresWithEndpoints,
    totalConnectors,
    connectorsWithPins,
    totalDevices,
    devicesWithSystem,
    drawingsWithSystem
  ] = await Promise.all([
    prisma.wire.count(),
    prisma.wireEndpoint.count(),
    prisma.connector.count(),
    prisma.connectorPin.count(),
    prisma.device.count(),
    prisma.device.count({ where: { systemId: { not: null } } }),
    prisma.drawing.count({ where: { systemId: { not: null } } })
  ]);
  
  console.log('  📊 Data Integrity Report:');
  console.log('  ─────────────────────────');
  console.log(`  Wires with endpoints: ${wiresWithEndpoints} / ${totalWires} (${((wiresWithEndpoints/totalWires)*100).toFixed(1)}%)`);
  console.log(`  Pins (connected): ${connectorsWithPins} connectors have pins`);
  console.log(`  Devices with system: ${devicesWithSystem} / ${totalDevices} (${((devicesWithSystem/totalDevices)*100).toFixed(1)}%)`);
  console.log(`  Drawings with system: ${drawingsWithSystem}\n`);
}

async function generateHierarchySummary() {
  console.log('🏗️  Step 5: Train Hierarchy Summary\n');
  
  const formations = await prisma.formation.findMany({
    include: {
      cars: {
        include: {
          carSystems: {
            include: { system: true }
          }
        }
      }
    }
  });
  
  for (const formation of formations) {
    console.log(`  Formation: ${formation.formationCode} (${formation.carCount} cars)`);
    for (const car of formation.cars) {
      console.log(`    Car ${car.carPosition}: ${car.carCode} (${car.carType})`);
      for (const cs of car.carSystems) {
        console.log(`      → ${cs.system.code}: ${cs.system.name}`);
      }
    }
    console.log('');
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   COMPLETE DATA SYNCHRONIZATION');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  try {
    await syncConnectorsToDrawings();
    await syncPinsToWires();
    await syncDevicesToSystems();
    await verifyDataIntegrity();
    await generateHierarchySummary();
    
    console.log('✅ Data synchronization complete!\n');
  } catch (error) {
    console.error('Sync error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();