import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Color output helpers
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title: string) {
  console.log('\n' + colors.cyan + '═'.repeat(80) + colors.reset);
  console.log(colors.cyan + colors.bright + title + colors.reset);
  console.log(colors.cyan + '═'.repeat(80) + colors.reset);
}

async function main() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║               BULK DRAWING-WIRE REPAIR (App Logic)                         ║
║              Efficiently link wires to drawings via Prisma                 ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    // Show current state
    section('CURRENT STATE');
    const currentCount = await prisma.drawingWire.count();
    const totalWires = await prisma.wire.count();
    const totalEndpoints = await prisma.wireEndpoint.count();
    
    log(colors.green, `✓ Current DrawingWire links: ${currentCount.toLocaleString()}`);
    log(colors.green, `✓ Total Wires: ${totalWires.toLocaleString()}`);
    log(colors.green, `✓ Total WireEndpoints: ${totalEndpoints.toLocaleString()}`);

    // Phase: Load and process endpoints
    section('PROCESSING ENDPOINTS');
    log(colors.blue, '📊 Loading wire endpoints with connector information...\n');

    // Get all valid endpoints where connector has a drawing
    const endpoints = await prisma.wireEndpoint.findMany({
      where: {
        connectorId: { not: null }
      },
      include: {
        connector: {
          select: {
            drawingId: true,
            connectorCode: true
          }
        },
        pin: {
          select: { pinNo: true }
        }
      }
    });

    log(colors.green, `✓ Found ${endpoints.length.toLocaleString()} endpoints total`);

    // Filter to only those with valid drawings
    const validEndpoints = endpoints.filter(e => e.connector?.drawingId);
    log(colors.green, `✓ ${validEndpoints.length.toLocaleString()} have valid drawings`);

    // Create DrawingWire records using batch creates
    section('CREATING DRAWING-WIRE LINKS');
    log(colors.blue, `📊 Creating DrawingWire records (batch size: 1,000)...\n`);

    let created = 0;
    let skipped = 0;
    const batchSize = 1000;
    
    for (let i = 0; i < validEndpoints.length; i += batchSize) {
      const batch = validEndpoints.slice(i, i + batchSize);
      const data = batch
        .filter(e => e.wireId && e.connector?.drawingId)
        .map(e => ({
          wireId: e.wireId,
          drawingId: e.connector!.drawingId!,
          context: `${e.connector!.connectorCode}:${e.pin?.pinNo || 'unknown'}`
        }));

      try {
        const result = await prisma.drawingWire.createMany({
          data,
          skipDuplicates: true
        });
        created += result.count;
      } catch (err) {
        skipped += batch.length;
      }

      const progress = Math.min(i + batchSize, validEndpoints.length);
      const pct = ((progress / validEndpoints.length) * 100).toFixed(1);
      log(colors.blue, `  Progress: ${progress.toLocaleString()}/${validEndpoints.length.toLocaleString()} (${pct}%)`);
    }

    log(colors.green, `✓ Created: ${created.toLocaleString()} new DrawingWire records`);
    if (skipped > 0) {
      log(colors.yellow, `⚠️  Skipped/errors: ${skipped.toLocaleString()}`);
    }

    // Verify results
    section('VERIFICATION');
    const newCount = await prisma.drawingWire.count();
    const totalCreated = newCount - currentCount;
    const coverage = ((newCount / totalWires) * 100).toFixed(1);

    log(colors.green, `✓ Total DrawingWire records: ${newCount.toLocaleString()}`);
    log(colors.green, `✓ Created in this run: ${totalCreated.toLocaleString()}`);
    log(colors.green, `✓ Wire coverage: ${coverage}%`);

    if (newCount > 50000) {
      log(colors.green, `✓ EXCELLENT: Strong wire-to-drawing coverage!`);
    } else if (newCount > 10000) {
      log(colors.yellow, `⚠️  PARTIAL: Good progress but room for improvement`);
    } else {
      log(colors.yellow, `⚠️  LIMITED: Additional data linking may be needed`);
    }

    // Show sample of what was created
    log(colors.blue, '\n📋 Sample of created links (first 10):');
    const samples = await prisma.drawingWire.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        wire: { select: { wireNo: true } },
        drawing: { select: { drawingNo: true } }
      }
    });

    for (const s of samples) {
      log(colors.green, `   • Wire ${s.wire.wireNo} → Drawing ${s.drawing.drawingNo} (${s.context})`);
    }

    log(colors.green + colors.bright, '\n✓ BULK REPAIR COMPLETE' + colors.reset);

  } catch (error) {
    log(colors.red, `\n❌ Error: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
