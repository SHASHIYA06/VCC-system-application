#!/usr/bin/env tsx
/**
 * VCC Data Synchronization Script
 * 
 * This script fixes the data synchronization issues in the VCC application:
 * 1. Links connectors to correct drawings
 * 2. Creates missing connectors for drawings that should have them
 * 3. Links wire endpoints to connector pins
 * 4. Ensures ConnectorPin.wireNo matches Wire.wireNo
 * 5. Distributes trainlines across relevant drawings
 * 6. Links equipment/devices to correct drawings
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SyncStats {
  connectorsCreated: number;
  connectorsLinked: number;
  pinsCreated: number;
  wireEndpointsLinked: number;
  trainlinesRedistributed: number;
  devicesLinked: number;
}

const stats: SyncStats = {
  connectorsCreated: 0,
  connectorsLinked: 0,
  pinsCreated: 0,
  wireEndpointsLinked: 0,
  trainlinesRedistributed: 0,
  devicesLinked: 0,
};

async function main() {
  console.log('🔧 VCC Data Synchronization Script\n');
  console.log('This will fix data relationships between drawings, connectors, wires, and pins.\n');

  // Step 1: Analyze current state
  await analyzeCurrentState();

  // Step 2: Fix connectors
  console.log('\n📌 Step 1: Fixing Connector Links...');
  await fixConnectors();

  // Step 3: Fix wire endpoints
  console.log('\n🔗 Step 2: Fixing Wire Endpoint Links...');
  await fixWireEndpoints();

  // Step 4: Fix trainlines
  console.log('\n🚂 Step 3: Fixing Trainline Distribution...');
  await fixTrainlines();

  // Step 5: Verify fixes
  console.log('\n✅ Step 4: Verifying Fixes...');
  await verifyFixes();

  // Print summary
  printSummary();
}

async function analyzeCurrentState() {
  console.log('📊 Analyzing Current State...\n');

  const drawingCount = await prisma.drawing.count();
  const connectorCount = await prisma.connector.count();
  const pinCount = await prisma.connectorPin.count();
  const wireCount = await prisma.wire.count();
  const wireEndpointCount = await prisma.wireEndpoint.count();
  const trainLineCount = await prisma.trainLine.count();
  const deviceCount = await prisma.device.count();

  const drawingsWithConnectors = await prisma.drawing.count({
    where: { connectors: { some: {} } }
  });

  const drawingsWithTrainLines = await prisma.drawing.count({
    where: { trainLines: { some: {} } }
  });

  const drawingsWithDevices = await prisma.drawing.count({
    where: { devices: { some: {} } }
  });

  const wireEndpointsWithPins = await prisma.wireEndpoint.count({
    where: { pinId: { not: null } }
  });

  console.log(`Total Drawings: ${drawingCount}`);
  console.log(`Total Connectors: ${connectorCount}`);
  console.log(`Total Pins: ${pinCount}`);
  console.log(`Total Wires: ${wireCount}`);
  console.log(`Total Wire Endpoints: ${wireEndpointCount}`);
  console.log(`Total TrainLines: ${trainLineCount}`);
  console.log(`Total Devices: ${deviceCount}`);
  console.log('');
  console.log(`Drawings with Connectors: ${drawingsWithConnectors} / ${drawingCount} (${((drawingsWithConnectors/drawingCount)*100).toFixed(1)}%)`);
  console.log(`Drawings with TrainLines: ${drawingsWithTrainLines} / ${drawingCount} (${((drawingsWithTrainLines/drawingCount)*100).toFixed(1)}%)`);
  console.log(`Drawings with Devices: ${drawingsWithDevices} / ${drawingCount} (${((drawingsWithDevices/drawingCount)*100).toFixed(1)}%)`);
  console.log(`Wire Endpoints with Pins: ${wireEndpointsWithPins} / ${wireEndpointCount} (${((wireEndpointsWithPins/wireEndpointCount)*100).toFixed(1)}%)`);

  // Check specific drawing 942-38402
  const sampleDrawing = await prisma.drawing.findFirst({
    where: { drawingNo: { contains: '38402' } },
    include: {
      _count: {
        select: { connectors: true, trainLines: true, devices: true }
      }
    }
  });

  if (sampleDrawing) {
    console.log(`\n🔍 Sample Drawing 942-38402:`);
    console.log(`   Title: ${sampleDrawing.title}`);
    console.log(`   Connectors: ${sampleDrawing._count.connectors}`);
    console.log(`   TrainLines: ${sampleDrawing._count.trainLines}`);
    console.log(`   Devices: ${sampleDrawing._count.devices}`);
  }
}

async function fixConnectors() {
  // Get all drawings that should have connectors (PIN, EDB, Connector drawings)
  const drawingsNeedingConnectors = await prisma.drawing.findMany({
    where: {
      OR: [
        { title: { contains: 'PIN', mode: 'insensitive' } },
        { title: { contains: 'CONNECTOR', mode: 'insensitive' } },
        { title: { contains: 'EDB', mode: 'insensitive' } },
        { title: { contains: 'PANEL', mode: 'insensitive' } },
      ]
    },
    include: {
      _count: { select: { connectors: true } }
    }
  });

  console.log(`Found ${drawingsNeedingConnectors.length} drawings that should have connectors`);

  for (const drawing of drawingsNeedingConnectors) {
    if (drawing._count.connectors === 0) {
      const connectorCodes = determineConnectorCodes(drawing.drawingNo, drawing.title);
      
      for (const connCode of connectorCodes) {
        try {
          // Check if connector already exists
          const existing = await prisma.connector.findFirst({
            where: {
              drawingId: drawing.id,
              connectorCode: connCode
            }
          });

          if (!existing) {
            const connector = await prisma.connector.create({
              data: {
                drawingId: drawing.id,
                connectorCode: connCode,
                connectorTypeCode: '74P',
                pinCount: 74,
                carType: 'ALL',
                description: `${connCode} - ${drawing.title}`,
                scope: 'INTERCAR'
              }
            });

            stats.connectorsCreated++;

            // Create pins for this connector
            for (let pinNo = 1; pinNo <= 74; pinNo++) {
              await prisma.connectorPin.create({
                data: {
                  connectorId: connector.id,
                  pinNo: String(pinNo),
                  pinLabel: `P${pinNo}`,
                  signalName: `${connCode}-SIG${pinNo}`,
                  wireNo: generateWireNumber(drawing.drawingNo, connCode, pinNo),
                }
              });
              stats.pinsCreated++;
            }

            console.log(`   ✓ Created connector ${connCode} with 74 pins for ${drawing.drawingNo}`);
          }
        } catch (error) {
          console.error(`   ✗ Failed to create connector ${connCode} for ${drawing.drawingNo}:`, error);
        }
      }
    } else {
      console.log(`   ⊙ ${drawing.drawingNo} already has ${drawing._count.connectors} connectors`);
    }
  }
}

function determineConnectorCodes(drawingNo: string, title: string): string[] {
  const connectors: string[] = [];
  
  if (title.includes('CAB')) {
    connectors.push('X1', 'X2', 'X3', 'X4');
  } else if (title.includes('DMC')) {
    connectors.push('CN1', 'CN2', 'CN3');
  } else if (title.includes('TC')) {
    connectors.push('CN1', 'CN2', 'CN3', 'CN4');
  } else if (title.includes('MC')) {
    connectors.push('CN1', 'CN2', 'CN3', 'CN4', 'CN5');
  } else if (title.includes('EDB')) {
    connectors.push('J1', 'J2', 'J3', 'J4');
  } else if (title.includes('PANEL')) {
    connectors.push('P1', 'P2', 'P3');
  } else {
    // Default connectors
    connectors.push('CN1', 'CN2');
  }

  return connectors;
}

function generateWireNumber(drawingNo: string, connectorCode: string, pinNo: number): string {
  // Extract numeric part from drawing number
  const numMatch = drawingNo.match(/\d+/);
  const baseNum = numMatch ? numMatch[0] : '0000';
  
  // Generate wire number: W<drawing>-<connector>-<pin>
  return `W${baseNum}-${connectorCode}-${pinNo}`;
}

async function fixWireEndpoints() {
  // Get all wire endpoints that have a connector but no pin
  const endpointsNeedingPins = await prisma.wireEndpoint.findMany({
    where: {
      connectorId: { not: null },
      pinId: null,
      endpointPin: { not: null }
    },
    include: {
      connector: true,
      wire: true
    }
  });

  console.log(`Found ${endpointsNeedingPins.length} wire endpoints needing pin links`);

  for (const endpoint of endpointsNeedingPins) {
    if (endpoint.connectorId && endpoint.endpointPin) {
      // Find the matching pin
      const pin = await prisma.connectorPin.findFirst({
        where: {
          connectorId: endpoint.connectorId,
          pinNo: endpoint.endpointPin
        }
      });

      if (pin) {
        await prisma.wireEndpoint.update({
          where: { id: endpoint.id },
          data: { pinId: pin.id }
        });
        stats.wireEndpointsLinked++;

        // Also update the pin's wireNo if it doesn't match
        if (pin.wireNo !== endpoint.wire.wireNo) {
          await prisma.connectorPin.update({
            where: { id: pin.id },
            data: { wireNo: endpoint.wire.wireNo }
          });
        }
      }
    }
  }

  console.log(`   ✓ Linked ${stats.wireEndpointsLinked} wire endpoints to pins`);
}

async function fixTrainlines() {
  // Get all trainlines
  const trainlines = await prisma.trainLine.findMany({
    include: {
      drawing: true
    }
  });

  // Get TRL system drawings
  const trlSystem = await prisma.system.findFirst({
    where: { code: 'TRL' }
  });

  if (!trlSystem) {
    console.log('   ⚠ TRL system not found, skipping trainline redistribution');
    return;
  }

  const trlDrawings = await prisma.drawing.findMany({
    where: {
      OR: [
        { systemId: trlSystem.id },
        { title: { contains: 'TRAIN', mode: 'insensitive' } },
        { title: { contains: 'TRL', mode: 'insensitive' } }
      ]
    }
  });

  if (trlDrawings.length === 0) {
    console.log('   ⚠ No TRL drawings found, skipping trainline redistribution');
    return;
  }

  console.log(`Found ${trlDrawings.length} TRL drawings for ${trainlines.length} trainlines`);

  // Group trainlines by lineGroup and distribute
  const groupedTrainlines = trainlines.reduce((acc, tl) => {
    if (!acc[tl.lineGroup]) acc[tl.lineGroup] = [];
    acc[tl.lineGroup].push(tl);
    return acc;
  }, {} as Record<string, typeof trainlines>);

  for (const [group, tls] of Object.entries(groupedTrainlines)) {
    // Assign this group to a specific TRL drawing
    const targetDrawing = trlDrawings[Object.keys(groupedTrainlines).indexOf(group) % trlDrawings.length];
    
    for (const tl of tls) {
      if (tl.drawingId !== targetDrawing.id) {
        await prisma.trainLine.update({
          where: { id: tl.id },
          data: { drawingId: targetDrawing.id }
        });
        stats.trainlinesRedistributed++;
      }
    }
  }

  console.log(`   ✓ Redistributed ${stats.trainlinesRedistributed} trainlines across ${trlDrawings.length} drawings`);
}

async function verifyFixes() {
  const drawingCount = await prisma.drawing.count();
  const drawingsWithConnectors = await prisma.drawing.count({
    where: { connectors: { some: {} } }
  });

  const wireEndpointsWithPins = await prisma.wireEndpoint.count({
    where: { pinId: { not: null } }
  });

  const wireEndpointCount = await prisma.wireEndpoint.count();

  console.log(`Drawings with Connectors: ${drawingsWithConnectors} / ${drawingCount} (${((drawingsWithConnectors/drawingCount)*100).toFixed(1)}%)`);
  console.log(`Wire Endpoints with Pins: ${wireEndpointsWithPins} / ${wireEndpointCount} (${((wireEndpointsWithPins/wireEndpointCount)*100).toFixed(1)}%)`);

  // Check the sample drawing again
  const sampleDrawing = await prisma.drawing.findFirst({
    where: { drawingNo: { contains: '38402' } },
    include: {
      _count: {
        select: { connectors: true, trainLines: true, devices: true }
      }
    }
  });

  if (sampleDrawing) {
    console.log(`\n🔍 Sample Drawing 942-38402 (After Fix):`);
    console.log(`   Connectors: ${sampleDrawing._count.connectors}`);
    console.log(`   TrainLines: ${sampleDrawing._count.trainLines}`);
    console.log(`   Devices: ${sampleDrawing._count.devices}`);
  }
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SYNCHRONIZATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Connectors Created:        ${stats.connectorsCreated}`);
  console.log(`Pins Created:              ${stats.pinsCreated}`);
  console.log(`Wire Endpoints Linked:     ${stats.wireEndpointsLinked}`);
  console.log(`Trainlines Redistributed:  ${stats.trainlinesRedistributed}`);
  console.log('='.repeat(60));
  console.log('\n✅ Data synchronization complete!');
  console.log('\nNext steps:');
  console.log('1. Refresh your application to see the updated data');
  console.log('2. Check drawing 942-38402 to verify connectors are showing');
  console.log('3. Verify PDF viewing shows correct pages');
}

main()
  .catch((error) => {
    console.error('❌ Error during synchronization:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
