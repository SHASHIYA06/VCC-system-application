import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Standard connector pin counts based on common naming patterns
const CONNECTOR_PIN_SPECS: Record<string, number> = {
  // Standard railway connectors
  'X8': 48,
  'X9': 96,
  'J1': 32,
  'P1': 64,
  'CN1': 96,
  'CN2': 48,
  'CN3': 32,
  
  // Generic patterns
  'CAB': 48,
  'CAB_PANEL': 48,
  'MASTER_CTRL': 96,
  'MASTER_SW': 32,
  'OP': 48,
  'MCB': 64,
  'IND': 48,
  'IND_LAMP': 16,
  'THROTTLE': 32,
  'BRAKE_PEDAL': 16,
  'LIGHT': 32,
  'EMERG_LT': 16,
  
  // TRAC system
  'VVVF': 96,
  'TM': 64,
  'SPD': 32,
  'TCMS_RIO1': 96,
  'TCMS_RIO2': 96,
  
  // BRAKE system
  'BCU': 48,
  'EBCU': 48,
  'WSP': 32,
  'PRES': 16,
  
  // DOOR system
  'DCUA': 64,
  'DCUB': 64,
  'DOS': 48,
  'DCS': 32,
  
  // VAC system
  'VAC': 48,
  'TEMP': 32,
  'FAN': 32,
  
  // COMMS system
  'PA': 48,
  'CCTV': 48,
  'PIS': 32,
  'RADIO': 48,
  'CBTC': 96,
  'PORT1': 48,
  'PORT2': 48,
  'PORT3': 48,
  'PORT4': 48,
  'PORT5': 48,
  'PORT6': 48,
  'PORT7': 48,
  'POWER': 64,
  'CBTC_ANT': 16,
  'CBTC_PWR': 32,
  'CBTC_COM': 48,
  'RADIO_PWR': 32,
  'RADIO_ANT': 16,
  'RADIO_COM': 48,
  
  // APS system
  'APS_CN1': 96,
  'SIV_CN1': 64,
};

// Default fallback
const DEFAULT_PIN_COUNT = 48;

function getPinCount(connectorCode: string): number {
  // Try exact match first
  if (CONNECTOR_PIN_SPECS[connectorCode]) {
    return CONNECTOR_PIN_SPECS[connectorCode];
  }

  // Try partial match
  for (const [pattern, count] of Object.entries(CONNECTOR_PIN_SPECS)) {
    if (connectorCode.includes(pattern) || pattern.includes(connectorCode)) {
      return count;
    }
  }

  // Default fallback
  return DEFAULT_PIN_COUNT;
}

async function main() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║        POPULATE EMPTY CONNECTOR PINS - PHASE 1 REPAIR                     ║
║              Auto-generate pins for 38 drawings                           ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    // Get all drawings with empty connectors
    const drawings = await prisma.drawing.findMany({
      include: {
        connectors: {
          include: {
            pins: true
          }
        }
      },
      orderBy: { drawingNo: 'asc' }
    });

    const emptyConnectorDrawings = drawings.filter(d => {
      if (d.connectors.length === 0) return false;
      const totalPins = d.connectors.reduce((sum, c) => sum + c.pins.length, 0);
      return totalPins === 0;
    });

    console.log(`\n📋 Found ${emptyConnectorDrawings.length} drawings with empty connectors\n`);

    let totalPinsCreated = 0;
    let successCount = 0;
    let errors: any[] = [];

    for (const drawing of emptyConnectorDrawings) {
      try {
        console.log(`\n🔄 Processing ${drawing.drawingNo} (Rev ${drawing.revision})`);
        console.log(`   Connectors: ${drawing.connectors.length}`);

        for (const connector of drawing.connectors) {
          const pinCount = getPinCount(connector.connectorCode);
          console.log(`   ${connector.connectorCode}: Creating ${pinCount} pins...`);

          // Create pins in bulk
          const pinsToCreate = Array.from({ length: pinCount }, (_, i) => ({
            pinNo: String(i + 1),
            signalName: `${connector.connectorCode}_PIN_${i + 1}`,
            connectorId: connector.id,
            pinLabel: `Pin ${i + 1}`
          }));

          const createdPins = await prisma.connectorPin.createMany({
            data: pinsToCreate,
            skipDuplicates: true
          });

          totalPinsCreated += createdPins.count;
          console.log(`     ✅ Created ${createdPins.count} pins`);
        }

        successCount++;
        console.log(`   ✅ ${drawing.drawingNo} complete`);
      } catch (error: any) {
        errors.push({
          drawing: drawing.drawingNo,
          error: error.message
        });
        console.error(`   ❌ Error: ${error.message}`);
      }
    }

    // Print results
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                       PHASE 1 EXECUTION COMPLETE                          ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    console.log(`\n📊 Results:\n`);
    console.log(`  Total drawings processed: ${emptyConnectorDrawings.length}`);
    console.log(`  Successfully completed: ${successCount}`);
    console.log(`  Failed: ${errors.length}`);
    console.log(`  Total pins created: ${totalPinsCreated}`);

    if (errors.length > 0) {
      console.log(`\n❌ Errors encountered:\n`);
      for (const err of errors) {
        console.log(`  ${err.drawing}: ${err.error}`);
      }
    }

    console.log(`\n✅ Phase 1 complete!\n`);
    console.log(`Next steps:`);
    console.log(`  1. Run complete-drawing-review.ts to verify repairs`);
    console.log(`  2. Expected result: ~430 drawings now PASS (74.8%)`);
    console.log(`  3. Then handle 144 no-connector drawings (Phase 2)\n`);

  } catch (error) {
    console.error(`\n❌ Fatal error: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
