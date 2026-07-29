/**
 * Fix Data Integrity Issues
 * 
 * - Remove orphaned CrossConnection records
 * - Remove orphaned Device records
 * - Verify foreign key constraints
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   FIX DATA INTEGRITY ISSUES                                ║
║                  Remove orphaned foreign key references                    ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

  try {
    log(colors.blue, '🔍 Scanning for orphaned records...\n');

    // Find orphaned CrossConnection records
    const allCrossConnections = await prisma.crossConnection.findMany();
    const orphanedCross = [];

    for (const cc of allCrossConnections) {
      const drawing = await prisma.drawing.findUnique({
        where: { id: cc.drawingId },
      });
      if (!drawing) {
        orphanedCross.push(cc.id);
      }
    }

    log(colors.yellow, `⚠️  Found ${orphanedCross.length} orphaned CrossConnection records`);

    if (orphanedCross.length > 0) {
      log(colors.blue, `🗑️  Deleting ${orphanedCross.length} orphaned CrossConnection records...`);
      const deleted = await prisma.crossConnection.deleteMany({
        where: { id: { in: orphanedCross } },
      });
      log(colors.green, `✓ Deleted ${deleted.count} orphaned CrossConnection records\n`);
    }

    // Find orphaned Device records
    const allDevices = await prisma.device.findMany();
    const orphanedDevices = [];

    for (const device of allDevices) {
      const drawing = await prisma.drawing.findUnique({
        where: { id: device.drawingId },
      });
      if (!drawing) {
        orphanedDevices.push(device.id);
      }
    }

    log(colors.yellow, `⚠️  Found ${orphanedDevices.length} orphaned Device records`);

    if (orphanedDevices.length > 0) {
      log(colors.blue, `🗑️  Deleting ${orphanedDevices.length} orphaned Device records...`);
      const deleted = await prisma.device.deleteMany({
        where: { id: { in: orphanedDevices } },
      });
      log(colors.green, `✓ Deleted ${deleted.count} orphaned Device records\n`);
    }

    log(colors.green, '✓ Data integrity cleanup complete!');

  } catch (error) {
    log(colors.red, `❌ Error: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
