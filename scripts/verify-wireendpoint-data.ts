/**
 * Verify Wire Endpoint Data
 * 
 * Test that wire tracing relationships are working
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                   VERIFY WIRE ENDPOINT DATA                                ║
║                Test if wire relationships are working                      ║
╚════════════════════════════════════════════════════════════════════════════╝
`);

  try {
    console.log('\n🧪 TEST 1: Basic Wire Endpoint Count');
    const endpointCount = await prisma.wireEndpoint.count();
    console.log(`✓ Total WireEndpoint records: ${endpointCount.toLocaleString()}`);

    console.log('\n🧪 TEST 2: Wires with Endpoints');
    const wiresWithEndpoints = await prisma.wire.count({
      where: {
        endpoints: {
          some: {}
        }
      }
    });
    console.log(`✓ Wires with endpoints: ${wiresWithEndpoints.toLocaleString()}`);

    console.log('\n🧪 TEST 3: Find Wire 9555');
    const wire9555 = await prisma.wire.findUnique({
      where: { wireNo: '9555' },
      include: {
        endpoints: {
          include: {
            connector: true,
            pin: true,
          }
        }
      }
    });

    if (wire9555) {
      console.log(`✓ Wire 9555 FOUND`);
      console.log(`  - SignalName: ${wire9555.signalName || 'N/A'}`);
      console.log(`  - VoltageClass: ${wire9555.voltageClass || 'N/A'}`);
      console.log(`  - Endpoints: ${wire9555.endpoints.length}`);
      
      if (wire9555.endpoints.length > 0) {
        console.log(`  - Sample endpoint:`);
        const ep = wire9555.endpoints[0];
        console.log(`    Connector: ${ep.connector?.connectorCode || 'N/A'}`);
        console.log(`    Pin: ${ep.pin?.pinNo || 'N/A'}`);
      } else {
        console.log(`  ⚠️  NO ENDPOINTS (wire exists but not linked)`);
      }
    } else {
      console.log(`❌ Wire 9555 NOT FOUND`);
    }

    console.log('\n🧪 TEST 4: Find Connector CN1 with Pins');
    const connectorCN1 = await prisma.connector.findFirst({
      where: {
        connectorCode: {
          contains: 'CN1'
        }
      },
      include: {
        pins: {
          where: { wireNo: { not: null } },
          take: 5,
          include: { wireEndpoints: true }
        }
      }
    });

    if (connectorCN1) {
      console.log(`✓ Connector ${connectorCN1.connectorCode} FOUND`);
      console.log(`  - Total pins: ${connectorCN1.pins.length}`);
      
      const pinsWithEndpoints = connectorCN1.pins.filter(p => p.wireEndpoints.length > 0).length;
      console.log(`  - Pins with endpoints: ${pinsWithEndpoints}/${connectorCN1.pins.length}`);
      
      if (connectorCN1.pins.length > 0) {
        console.log(`  - Sample pin:`);
        const pin = connectorCN1.pins[0];
        console.log(`    Pin#: ${pin.pinNo}`);
        console.log(`    WireNo: ${pin.wireNo}`);
        console.log(`    Has wire endpoints: ${pin.wireEndpoints.length > 0}`);
      }
    } else {
      console.log(`❌ Connector CN1 NOT FOUND`);
    }

    console.log('\n🧪 TEST 5: Wire Trace for Specific Wire');
    const traceWire = await prisma.wire.findFirst({
      where: {
        endpoints: {
          some: {
            connector: {
              isNot: null
            }
          }
        }
      },
      include: {
        endpoints: {
          include: {
            connector: {
              include: {
                drawing: {
                  include: {
                    system: true
                  }
                }
              }
            },
            pin: true,
            device: true
          },
          take: 3
        }
      }
    });

    if (traceWire) {
      console.log(`✓ Sample trace wire: ${traceWire.wireNo}`);
      console.log(`  - Found ${traceWire.endpoints.length} endpoint(s)`);
      
      for (const ep of traceWire.endpoints) {
        console.log(`  - Endpoint:`);
        if (ep.connector) {
          console.log(`    Connector: ${ep.connector.connectorCode}`);
          console.log(`    Drawing: ${ep.connector.drawing?.drawingNo || 'N/A'}`);
          console.log(`    System: ${ep.connector.drawing?.system?.name || 'N/A'}`);
        }
        if (ep.pin) {
          console.log(`    Pin: ${ep.pin.pinNo}`);
        }
        if (ep.device) {
          console.log(`    Equipment: ${ep.device.deviceName}`);
        }
      }
    } else {
      console.log(`⚠️  No wires with connected endpoints found`);
    }

    console.log('\n📊 SUMMARY');
    console.log(`✓ Total WireEndpoint records: ${endpointCount.toLocaleString()}`);
    console.log(`✓ Wires with endpoints: ${wiresWithEndpoints.toLocaleString()}`);
    
    if (endpointCount > 50000) {
      console.log(`\n✅ EXCELLENT: Wire tracing data is populated!`);
      console.log(`   Wire searching and tracing should work correctly.`);
    } else if (endpointCount > 10000) {
      console.log(`\n⚠️  PARTIAL: Some wire endpoints exist but not complete coverage`);
    } else {
      console.log(`\n❌ CRITICAL: Very few or no wire endpoints (tracing will fail)`);
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
