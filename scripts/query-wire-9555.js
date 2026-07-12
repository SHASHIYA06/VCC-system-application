const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Querying wire 9555 info...');
  
  // Find wire endpoints / pins that match wireNo containing '9555'
  const pins = await prisma.connectorPin.findMany({
    where: {
      wireNo: {
        contains: '9555',
        mode: 'insensitive'
      }
    },
    include: {
      connector: {
        include: {
          drawing: {
            include: {
              pageMappings: true,
              system: true
            }
          }
        }
      }
    }
  });

  console.log(`Found ${pins.length} pins with wire 9555`);
  for (const pin of pins) {
    console.log(`\nPin: ${pin.pinNo}, Signal: ${pin.signalName}, Wire: ${pin.wireNo}`);
    const conn = pin.connector;
    console.log(`Connector: ${conn.connectorCode} in Drawing: ${conn.drawing.drawingNo} (${conn.drawing.title})`);
    console.log(`Drawing System: ${conn.drawing.system?.code} - ${conn.drawing.system?.name}`);
    console.log(`Drawing Page Mappings:`);
    for (const mapping of conn.drawing.pageMappings) {
      console.log(`  - Page ${mapping.pdfPageNo} in ${mapping.sourceFileName} (Verified: ${mapping.verified})`);
    }
  }

  // Find wire table entries
  const wires = await prisma.wire.findMany({
    where: {
      wireNo: {
        contains: '9555',
        mode: 'insensitive'
      }
    },
    include: {
      drawings: {
        include: {
          drawing: {
            include: {
              pageMappings: true
            }
          }
        }
      }
    }
  });
  console.log(`\nFound ${wires.length} wires in Wire table`);
  for (const w of wires) {
    console.log(`WireNo: ${w.wireNo}, Signal: ${w.signalName}`);
    for (const dw of w.drawings) {
      console.log(`  Connected Drawing: ${dw.drawing.drawingNo} (${dw.drawing.title})`);
      for (const m of dw.drawing.pageMappings) {
        console.log(`    - Page ${m.pdfPageNo} in ${m.sourceFileName}`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
