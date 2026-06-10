/**
 * Script to populate system metadata with current database statistics
 * Run: npx tsx scripts/populate-system-metadata.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📊 Starting system metadata population...\n');

  try {
    const systems = await prisma.system.findMany({
      include: {
        _count: {
          select: {
            drawings: true,
            devices: true
          }
        }
      },
      orderBy: { code: 'asc' }
    });

    console.log(`Found ${systems.length} systems\n`);

    for (const system of systems) {
      console.log(`Processing ${system.code} (${system.name})...`);

      // Count entities
      const drawingCount = system._count.drawings;
      const deviceCount = system._count.devices;

      // Count verified entities
      const verifiedDrawings = await prisma.drawingVerificationStatus.count({
        where: {
          drawing: { systemId: system.id },
          status: 'VERIFIED'
        }
      });

      const verifiedDevices = await prisma.device.count({
        where: {
          systemId: system.id,
          isVerified: true
        }
      });

      const connectorCount = await prisma.connector.count({
        where: { drawing: { systemId: system.id } }
      });

      const wireCount = await prisma.drawingWire.count({
        where: { drawing: { systemId: system.id } }
      });

      // Calculate completeness
      const maxDrawingsBySystem = 100; // Estimated max
      const drawingCompleteness = Math.min(drawingCount / maxDrawingsBySystem, 1.0);

      // Upsert metadata
      const metadata = await prisma.systemMetadata.upsert({
        where: { systemCode: system.code },
        update: {
          totalDrawings: drawingCount,
          verifiedDrawings,
          totalDevices: deviceCount,
          totalConnectors: connectorCount,
          totalWires: wireCount,
          dataCompleteness: drawingCompleteness,
          syncStatus: drawingCount > 0 ? 'COMPLETE' : 'PENDING',
          lastSyncTime: new Date(),
          updatedAt: new Date()
        },
        create: {
          systemCode: system.code,
          totalDrawings: drawingCount,
          verifiedDrawings,
          totalDevices: deviceCount,
          totalConnectors: connectorCount,
          totalWires: wireCount,
          dataCompleteness: drawingCompleteness,
          syncStatus: drawingCount > 0 ? 'COMPLETE' : 'PENDING',
          lastSyncTime: new Date()
        }
      });

      // Also update System model UI fields
      await prisma.system.update({
        where: { id: system.id },
        data: {
          dataStatus: drawingCount > 0 ? 'COMPLETE' : 'PENDING',
          isActive: drawingCount > 0 // Mark as active if has data
        }
      });

      console.log(`  ✅ ${system.code}`);
      console.log(`     Drawings: ${drawingCount} (${verifiedDrawings} verified)`);
      console.log(`     Devices: ${deviceCount} (${verifiedDevices} verified)`);
      console.log(`     Connectors: ${connectorCount}, Wires: ${wireCount}`);
      console.log(`     Completeness: ${(drawingCompleteness * 100).toFixed(1)}%\n`);
    }

    console.log('✅ System metadata population complete!');
    
    // Show summary
    const totalMetadata = await prisma.systemMetadata.count();
    const completeCount = await prisma.systemMetadata.count({
      where: { syncStatus: 'COMPLETE' }
    });

    console.log(`\n📊 Summary:`);
    console.log(`   Total Systems with Metadata: ${totalMetadata}`);
    console.log(`   Complete: ${completeCount}`);
    console.log(`   Pending: ${totalMetadata - completeCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
