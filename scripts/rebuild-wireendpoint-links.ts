/**
 * Rebuild WireEndpoint Links
 * 
 * This script populates the WireEndpoint table by linking:
 * - Wire records to ConnectorPin records (via wireNo)
 * - Wire records to Connector records (via connectorId)
 * - Wire records to Device records (via connector-device relationship)
 * 
 * Expected result: 150,000+ WireEndpoint records created
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   REBUILD WIRE ENDPOINT LINKS                              ║
║             Link 167K wires to their connector pin endpoints               ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

  try {
    // ========== PHASE 1: AUDIT ==========
    section('PHASE 1: AUDIT CURRENT STATE');

    const [
      totalWires,
      totalConnectors,
      totalPins,
      totalDevices,
      currentEndpoints,
      pinsWithWireNo,
    ] = await Promise.all([
      prisma.wire.count(),
      prisma.connector.count(),
      prisma.connectorPin.count(),
      prisma.device.count(),
      prisma.wireEndpoint.count(),
      prisma.connectorPin.count({ where: { wireNo: { not: null } } }),
    ]);

    log(colors.blue, '📊 Database State:');
    log(colors.green, `  ✓ Total Wires: ${totalWires.toLocaleString()}`);
    log(colors.green, `  ✓ Total Connectors: ${totalConnectors.toLocaleString()}`);
    log(colors.green, `  ✓ Total Connector Pins: ${totalPins.toLocaleString()}`);
    log(colors.green, `  ✓ Total Devices: ${totalDevices.toLocaleString()}`);
    log(colors.yellow, `  ⚠️  Current WireEndpoint records: ${currentEndpoints.toLocaleString()}`);
    log(colors.yellow, `  ⚠️  Pins with wireNo field: ${pinsWithWireNo.toLocaleString()}`);

    log(colors.blue, '\n📈 Linking Plan:');
    log(colors.green, `  • Will create ~${pinsWithWireNo.toLocaleString()} WireEndpoint records`);
    log(colors.green, `  • Linking pins to their wires via wireNo field`);
    log(colors.green, `  • Including connector and device relationships`);

    // ========== PHASE 2: LINKING ==========
    section('PHASE 2: CREATE WIREENDPOINT LINKS');

    let created = 0;
    let skipped = 0;
    let failed = 0;
    let batchSize = 1000;
    let processedBatches = 0;

    // Get all connector pins with wireNo
    const pins = await prisma.connectorPin.findMany({
      where: { wireNo: { not: null } },
      include: {
        connector: {
          include: {
            drawing: {
              include: {
                system: true,
              },
            },
          },
        },
      },
    });

    log(colors.blue, `🔗 Processing ${pins.length.toLocaleString()} pins with wire numbers...\n`);

    // Process pins in batches
    for (let i = 0; i < pins.length; i += batchSize) {
      const batch = pins.slice(i, i + batchSize);
      processedBatches++;

      log(colors.blue, `Batch ${processedBatches}: Processing pins ${i + 1} to ${Math.min(i + batchSize, pins.length)}...`);

      for (const pin of batch) {
        try {
          // Find the wire by wireNo
          const wire = await prisma.wire.findUnique({
            where: { wireNo: pin.wireNo! },
          });

          if (!wire) {
            skipped++;
            continue;
          }

          // Find devices at this connector (if any)
          const devicesAtConnector = await prisma.device.findMany({
            where: {
              OR: [
                { tagNo: pin.connector.connectorCode },
                { locationTag: pin.connector.connectorCode },
              ],
            },
          });

          // Create WireEndpoint record(s)
          // Strategy: One endpoint linking wire to pin/connector
          // Additional endpoints if we know the equipment
          try {
            // Primary endpoint: wire → connector → pin
            await prisma.wireEndpoint.upsert({
              where: {
                id: `${wire.id}-${pin.id}-primary`,
              },
              create: {
                wireId: wire.id,
                connectorId: pin.connectorId,
                pinId: pin.id,
                endpointRole: 'connector_pin',
                endpointLabel: `${pin.connector.connectorCode}:${pin.pinNo}`,
                endpointPin: pin.pinNo,
                sourcePage: pin.connector.drawing?.id ? 1 : undefined,
              },
              update: {},
            });

            created++;
          } catch (err) {
            // Likely duplicate or constraint - skip
            skipped++;
          }

          // Secondary endpoints: wire → device (if equipment known)
          for (const device of devicesAtConnector) {
            try {
              await prisma.wireEndpoint.upsert({
                where: {
                  id: `${wire.id}-${device.id}-equipment`,
                },
                create: {
                  wireId: wire.id,
                  deviceId: device.id,
                  connectorId: pin.connectorId,
                  pinId: pin.id,
                  endpointRole: 'equipment',
                  endpointLabel: device.deviceName,
                },
                update: {},
              });
              created++;
            } catch (err) {
              skipped++;
            }
          }
        } catch (error) {
          failed++;
          if (failed <= 5) {
            log(colors.yellow, `  ⚠️  Error processing pin ${pin.pinNo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      log(colors.green, `  ✓ Batch ${processedBatches} complete (created: ${created}, skipped: ${skipped})\n`);
    }

    // ========== PHASE 3: VERIFY ==========
    section('PHASE 3: VERIFICATION');

    const newEndpointCount = await prisma.wireEndpoint.count();
    const wiresWithEndpoints = await prisma.wire.count({
      where: {
        endpoints: { some: {} },
      },
    });
    const pinsWithEndpoints = await prisma.connectorPin.count({
      where: {
        wireEndpoints: { some: {} },
      },
    });

    log(colors.blue, '📊 Results:');
    log(colors.green, `  ✓ WireEndpoint records created: ${created.toLocaleString()}`);
    log(colors.yellow, `  ⚠️  Skipped (duplicates/errors): ${skipped.toLocaleString()}`);
    log(colors.yellow, `  ⚠️  Failed: ${failed.toLocaleString()}`);
    log(colors.blue, '\n📈 New State:');
    log(colors.green, `  ✓ Total WireEndpoint records: ${newEndpointCount.toLocaleString()}`);
    log(colors.green, `  ✓ Wires with endpoints: ${wiresWithEndpoints.toLocaleString()}`);
    log(colors.green, `  ✓ Pins with endpoints: ${pinsWithEndpoints.toLocaleString()}`);

    // Test 1: Check wire 9555
    log(colors.blue, '\n🧪 Test 1: Wire 9555 Endpoints');
    const wire9555 = await prisma.wire.findUnique({
      where: { wireNo: '9555' },
      include: { endpoints: { take: 5 } },
    });

    if (wire9555 && wire9555.endpoints.length > 0) {
      log(colors.green, `  ✓ Wire 9555 found with ${wire9555.endpoints.length} endpoints`);
    } else {
      log(colors.yellow, `  ⚠️  Wire 9555 not found or has no endpoints`);
    }

    // Test 2: Check connector CN1
    log(colors.blue, '\n🧪 Test 2: Connector CN1 Pin Linkage');
    const connectorCN1 = await prisma.connector.findFirst({
      where: { connectorCode: { contains: 'CN1' } },
      include: {
        pins: {
          where: { wireNo: { not: null } },
          take: 5,
          include: { wireEndpoints: true },
        },
      },
    });

    if (connectorCN1) {
      const pinsWithLinks = connectorCN1.pins.filter(p => p.wireEndpoints.length > 0).length;
      log(colors.green, `  ✓ Connector ${connectorCN1.connectorCode}: ${connectorCN1.pins.length} pins checked`);
      log(colors.green, `  ✓ Pins with wire links: ${pinsWithLinks}/${connectorCN1.pins.length}`);
    } else {
      log(colors.yellow, `  ⚠️  Connector CN1 not found`);
    }

    // Test 3: Coverage
    log(colors.blue, '\n🧪 Test 3: Coverage Analysis');
    const coveragePercent = (wiresWithEndpoints / totalWires) * 100;
    const coverage = coveragePercent.toFixed(1);
    log(colors.green, `  ✓ Wire coverage: ${coverage}% (${wiresWithEndpoints}/${totalWires})`);

    if (coveragePercent >= 80) {
      log(colors.green, `  ✓ Excellent coverage!`);
    } else if (coveragePercent >= 50) {
      log(colors.yellow, `  ⚠️  Partial coverage - some wires missing endpoints`);
    } else {
      log(colors.red, `  ✗ Poor coverage - investigate data quality`);
    }

    // ========== PHASE 4: RECOMMENDATIONS ==========
    section('PHASE 4: NEXT STEPS');

    if (newEndpointCount >= 100000) {
      log(colors.green, '✓ SUCCESS! Wire endpoints successfully rebuilt.');
      log(colors.green, '✓ Wire tracing should now work correctly.');
      log(colors.green, '\nNext steps:');
      log(colors.blue, '  1. Test wire search: /api/search?wire=9555');
      log(colors.blue, '  2. Test wire trace: /api/search?wire=9555&type=wire_trace');
      log(colors.blue, '  3. Test connector details: /api/connectors?connector_code=CN1');
      log(colors.blue, '  4. Refresh production: Vercel will auto-use updated database');
    } else if (newEndpointCount >= 50000) {
      log(colors.yellow, '⚠️  Partial success - some endpoints created but not at expected volume');
      log(colors.yellow, '\nRecommendations:');
      log(colors.blue, '  1. Check ConnectorPin.wireNo field population');
      log(colors.blue, '  2. Verify Wire.wireNo field integrity');
      log(colors.blue, '  3. Run data quality audit');
    } else {
      log(colors.red, '✗ FAILED - Very few endpoints created');
      log(colors.red, '\nInvestigate:');
      log(colors.blue, '  1. Are there ConnectorPin records with wireNo?');
      log(colors.blue, '  2. Do Wire.wireNo values match ConnectorPin.wireNo?');
      log(colors.blue, '  3. Check database for data format inconsistencies');
    }

    log(colors.cyan, '\n' + '═'.repeat(80));
    log(colors.green + colors.bright, '✓ SCRIPT COMPLETE' + colors.reset);

  } catch (error) {
    log(colors.red, `\n❌ Fatal error: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
