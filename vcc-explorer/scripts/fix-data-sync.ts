import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Analyzing VCC Data Synchronization Issues...\n');

  // 1. Check Drawing Counts
  const drawingCount = await prisma.drawing.count();
  console.log(`📊 Total Drawings: ${drawingCount}`);

  // 2. Check Connector Distribution
  const connectorCount = await prisma.connector.count();
  const drawingsWithConnectors = await prisma.drawing.count({
    where: { connectors: { some: {} } }
  });
  console.log(`🔌 Total Connectors: ${connectorCount}`);
  console.log(`📄 Drawings with Connectors: ${drawingsWithConnectors} / ${drawingCount}`);
  console.log(`⚠️  Drawings WITHOUT Connectors: ${drawingCount - drawingsWithConnectors}`);

  // 3. Check Wire Distribution
  const wireCount = await prisma.wire.count();
  const wireEndpointCount = await prisma.wireEndpoint.count();
  console.log(`\n🔗 Total Wires: ${wireCount}`);
  console.log(`📍 Total Wire Endpoints: ${wireEndpointCount}`);

  // 4. Check ConnectorPin Distribution
  const pinCount = await prisma.connectorPin.count();
  console.log(`\n📌 Total Connector Pins: ${pinCount}`);

  // 5. Check TrainLine Distribution
  const trainLineCount = await prisma.trainLine.count();
  const drawingsWithTrainLines = await prisma.drawing.count({
    where: { trainLines: { some: {} } }
  });
  console.log(`\n🚂 Total TrainLines: ${trainLineCount}`);
  console.log(`📄 Drawings with TrainLines: ${drawingsWithTrainLines} / ${drawingCount}`);

  // 6. Check Device/Equipment Distribution
  const deviceCount = await prisma.device.count();
  const drawingsWithDevices = await prisma.drawing.count({
    where: { devices: { some: {} } }
  });
  console.log(`\n⚙️  Total Devices/Equipment: ${deviceCount}`);
  console.log(`📄 Drawings with Devices: ${drawingsWithDevices} / ${drawingCount}`);

  // 7. Sample a specific drawing to see its data
  console.log('\n\n🔍 Checking Drawing 942-38402...');
  const sampleDrawing = await prisma.drawing.findFirst({
    where: { drawingNo: { contains: '38402' } },
    include: {
      connectors: { include: { pins: true } },
      trainLines: true,
      devices: true,
      _count: {
        select: {
          connectors: true,
          trainLines: true,
          devices: true,
          sheets: true,
          pages: true
        }
      }
    }
  });

  if (sampleDrawing) {
    console.log(`\n📄 Drawing: ${sampleDrawing.drawingNo} - ${sampleDrawing.title}`);
    console.log(`   Sheets: ${sampleDrawing._count.sheets}`);
    console.log(`   Pages: ${sampleDrawing._count.pages}`);
    console.log(`   Connectors: ${sampleDrawing._count.connectors}`);
    console.log(`   TrainLines: ${sampleDrawing._count.trainLines}`);
    console.log(`   Devices: ${sampleDrawing._count.devices}`);
    console.log(`   Source File: ${sampleDrawing.sourceFileId || 'NONE'}`);

    if (sampleDrawing.connectors.length > 0) {
      console.log(`\n   Sample Connector: ${sampleDrawing.connectors[0].connectorCode}`);
      console.log(`   Pins in connector: ${sampleDrawing.connectors[0].pins.length}`);
    }
  } else {
    console.log('   ❌ Drawing 942-38402 not found!');
  }

  // 8. Check which drawings have source files
  const drawingsWithSourceFiles = await prisma.drawing.count({
    where: { sourceFileId: { not: null } }
  });
  console.log(`\n\n📁 Drawings with Source Files: ${drawingsWithSourceFiles} / ${drawingCount}`);

  // 9. Find drawings that should have connectors but don't
  console.log('\n\n🔍 Sample Drawings WITHOUT Connectors:');
  const drawingsWithoutConnectors = await prisma.drawing.findMany({
    where: {
      connectors: { none: {} },
      title: { contains: 'PIN' }
    },
    take: 10,
    select: {
      drawingNo: true,
      title: true,
      sourceFileId: true
    }
  });

  drawingsWithoutConnectors.forEach(d => {
    console.log(`   - ${d.drawingNo}: ${d.title} (Source: ${d.sourceFileId || 'NONE'})`);
  });

  // 10. Check WireEndpoint connections
  const wireEndpointsWithConnectors = await prisma.wireEndpoint.count({
    where: { connectorId: { not: null } }
  });
  const wireEndpointsWithPins = await prisma.wireEndpoint.count({
    where: { pinId: { not: null } }
  });
  console.log(`\n\n🔗 Wire Endpoint Connections:`);
  console.log(`   Connected to Connectors: ${wireEndpointsWithConnectors} / ${wireEndpointCount}`);
  console.log(`   Connected to Pins: ${wireEndpointsWithPins} / ${wireEndpointCount}`);

  console.log('\n\n✅ Analysis Complete!');
  console.log('\n📋 SUMMARY OF ISSUES:');
  console.log(`   1. ${drawingCount - drawingsWithConnectors} drawings have NO connectors`);
  console.log(`   2. ${drawingCount - drawingsWithTrainLines} drawings have NO trainlines`);
  console.log(`   3. ${drawingCount - drawingsWithDevices} drawings have NO devices`);
  console.log(`   4. ${drawingCount - drawingsWithSourceFiles} drawings have NO source file link`);
  console.log(`   5. ${wireEndpointCount - wireEndpointsWithPins} wire endpoints NOT linked to pins`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
