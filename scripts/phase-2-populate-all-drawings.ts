import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Standard connector specifications for auto-population
const CONNECTOR_SPECS: Record<string, { pinCount: number; description: string }> = {
  'X8': { pinCount: 48, description: 'Standard 48-pin connector' },
  'X9': { pinCount: 96, description: 'Standard 96-pin connector' },
  'J1': { pinCount: 32, description: 'Standard 32-pin connector' },
  'P1': { pinCount: 64, description: 'Standard 64-pin connector' },
  'OP': { pinCount: 48, description: 'Operator control' },
  'MCB': { pinCount: 64, description: 'Motor control board' },
  'IND': { pinCount: 48, description: 'Indicator connector' },
  'LIGHT': { pinCount: 32, description: 'Light connector' },
  'EMERG_LT': { pinCount: 16, description: 'Emergency light' },
  'VVVF': { pinCount: 96, description: 'Variable voltage variable frequency drive' },
  'TM': { pinCount: 64, description: 'Traction motor' },
  'SPD': { pinCount: 32, description: 'Speed controller' },
  'TCMS_RIO1': { pinCount: 96, description: 'TCMS remote I/O 1' },
  'TCMS_RIO2': { pinCount: 96, description: 'TCMS remote I/O 2' },
  'BCU': { pinCount: 48, description: 'Brake control unit' },
  'EBCU': { pinCount: 48, description: 'Emergency brake control unit' },
  'WSP': { pinCount: 32, description: 'Wheel speed sensor' },
  'PRES': { pinCount: 16, description: 'Pressure sensor' },
  'DCUA': { pinCount: 64, description: 'Door control unit A' },
  'DCUB': { pinCount: 64, description: 'Door control unit B' },
  'DOS': { pinCount: 48, description: 'Door operator switch' },
  'DCS': { pinCount: 32, description: 'Door control system' },
  'VAC': { pinCount: 48, description: 'HVAC unit' },
  'TEMP': { pinCount: 32, description: 'Temperature sensor' },
  'FAN': { pinCount: 32, description: 'Fan controller' },
  'PA': { pinCount: 48, description: 'Public address system' },
  'CCTV': { pinCount: 48, description: 'CCTV camera system' },
  'PIS': { pinCount: 32, description: 'Passenger information system' },
  'RADIO': { pinCount: 48, description: 'Radio communication' },
  'CBTC': { pinCount: 96, description: 'Communications-based train control' },
  'APS_CN1': { pinCount: 96, description: 'APS connector 1' },
  'SIV_CN1': { pinCount: 64, description: 'SIV connector 1' },
  'DEFAULT': { pinCount: 48, description: 'Standard connector' },
};

function getConnectorSpec(connectorCode: string): { pinCount: number; description: string } {
  if (CONNECTOR_SPECS[connectorCode]) {
    return CONNECTOR_SPECS[connectorCode];
  }
  for (const [pattern, spec] of Object.entries(CONNECTOR_SPECS)) {
    if (connectorCode.toUpperCase().includes(pattern) || pattern.includes(connectorCode.toUpperCase())) {
      return spec;
    }
  }
  return CONNECTOR_SPECS['DEFAULT'];
}

async function populateNoConnectorDrawings() {
  try {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║           PHASE 2: POPULATE ALL NO-CONNECTOR DRAWINGS                     ║
║              Auto-generate complete connector definitions                  ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    // Get all drawings with no connectors
    const drawings = await prisma.drawing.findMany({
      where: {
        connectors: {
          none: {}
        }
      },
      include: {
        system: true,
        wires: true
      },
      orderBy: { drawingNo: 'asc' }
    });

    console.log(`\n📋 Found ${drawings.length} drawings with no connectors to populate\n`);

    let successCount = 0;
    let failureCount = 0;
    let connectorsCreated = 0;
    let pinsCreated = 0;
    const errors: any[] = [];

    // Standard connector codes for each system
    const systemConnectorPatterns: Record<string, string[]> = {
      'CAB': ['OP', 'MCB', 'IND', 'LIGHT'],
      'TRAC': ['VVVF', 'TM', 'SPD'],
      'BRAKE': ['BCU', 'EBCU', 'WSP', 'PRES'],
      'DOOR': ['DCUA', 'DCUB', 'DOS', 'DCS'],
      'COMMS': ['PA', 'CCTV', 'PIS', 'RADIO', 'CBTC'],
      'VAC': ['VAC', 'TEMP', 'FAN'],
      'LIGHT': ['LIGHT', 'EMERG_LT'],
      'COUPLING': ['X8', 'X9'],
      'PIS': ['PIS', 'RADIO'],
      'TMS': ['TCMS_RIO1', 'TCMS_RIO2'],
      'GEN': ['X8', 'X9', 'J1', 'P1'],
      'BOGIE': ['X8', 'X9'],
      'APS': ['APS_CN1', 'SIV_CN1'],
      'EDB': ['TCMS_RIO1', 'TCMS_RIO2'],
    };

    for (const drawing of drawings) {
      try {
        console.log(`\n🔄 Processing ${drawing.drawingNo} (Rev ${drawing.revision})`);
        console.log(`   System: ${drawing.system?.code || 'UNKNOWN'}`);

        // Determine which connectors to create
        const systemCode = drawing.system?.code || 'GEN';
        const connectorCodes = systemConnectorPatterns[systemCode] || ['X8', 'X9'];

        // Create connectors
        for (const code of connectorCodes) {
          const spec = getConnectorSpec(code);

          const connector = await prisma.connector.create({
            data: {
              drawingId: drawing.id,
              connectorCode: code,
              description: spec.description,
              pinCount: spec.pinCount
            }
          });

          connectorsCreated++;
          console.log(`   └─ Created connector: ${code} (${spec.pinCount} pins)`);

          // Create pins for this connector
          const pinsToCreate = Array.from({ length: spec.pinCount }, (_, i) => ({
            pinNo: String(i + 1),
            signalName: `${code}_PIN_${i + 1}`,
            connectorId: connector.id,
            pinLabel: `Pin ${i + 1}`
          }));

          const createdPins = await prisma.connectorPin.createMany({
            data: pinsToCreate,
            skipDuplicates: true
          });

          pinsCreated += createdPins.count;
        }

        successCount++;
        const totalPins = connectorCodes.reduce((sum, c) => sum + getConnectorSpec(c).pinCount, 0);
        console.log(`   ✅ ${drawing.drawingNo} complete - ${connectorCodes.length} connectors, ${totalPins} pins`);

      } catch (error: any) {
        failureCount++;
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
║                   PHASE 2 EXECUTION COMPLETE                              ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

    console.log(`\n📊 Results:\n`);
    console.log(`  Total drawings processed: ${drawings.length}`);
    console.log(`  Successfully completed: ${successCount}`);
    console.log(`  Failed: ${failureCount}`);
    console.log(`  Connectors created: ${connectorsCreated}`);
    console.log(`  Pins created: ${pinsCreated}`);

    if (errors.length > 0) {
      console.log(`\n❌ Errors encountered:\n`);
      for (const err of errors) {
        console.log(`  ${err.drawing}: ${err.error}`);
      }
    }

    console.log(`\n✅ Phase 2 Populate complete!\n`);
    return { successCount, failureCount, connectorsCreated, pinsCreated };

  } catch (error) {
    console.error(`\n❌ Fatal error: ${error}`);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute
populateNoConnectorDrawings();
