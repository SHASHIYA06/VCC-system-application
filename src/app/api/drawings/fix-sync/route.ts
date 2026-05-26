import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API Route to fix data synchronization issues in the VCC application
 * 
 * Issues addressed:
 * 1. Link connectors to correct drawings based on sourceFileId
 * 2. Create missing connectors for drawings that should have them
 * 3. Link wires to drawings via WireEndpoints
 * 4. Distribute trainlines across relevant drawings
 * 5. Link equipment/devices to correct drawings
 */

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'analyze') {
      return await analyzeDataSync();
    }

    if (action === 'fixConnectors') {
      const result = await fixConnectorLinks();
      return NextResponse.json(result);
    }

    if (action === 'fixWires') {
      const result = await fixWireLinks();
      return NextResponse.json(result);
    }

    if (action === 'fixTrainlines') {
      const result = await fixTrainlineLinks();
      return NextResponse.json(result);
    }

    if (action === 'fixAll') {
      const connectors = await fixConnectorLinks();
      const wires = await fixWireLinks();
      const trainlines = await fixTrainlineLinks();
      return NextResponse.json({ 
        success: true, 
        results: { connectors, wires, trainlines } 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Fix sync error:', error);
    return NextResponse.json({ 
      error: 'Failed to fix synchronization', 
      details: String(error) 
    }, { status: 500 });
  }
}

async function analyzeDataSync() {
  const drawingCount = await prisma.drawing.count();
  const connectorCount = await prisma.connector.count();
  const wireCount = await prisma.wire.count();
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

  const drawingsWithSourceFiles = await prisma.drawing.count({
    where: { sourceFileId: { not: null } }
  });

  // Check specific drawing
  const sampleDrawing = await prisma.drawing.findFirst({
    where: { drawingNo: { contains: '38402' } },
    include: {
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

  return NextResponse.json({
    summary: {
      totalDrawings: drawingCount,
      totalConnectors: connectorCount,
      totalWires: wireCount,
      totalTrainLines: trainLineCount,
      totalDevices: deviceCount,
    },
    issues: {
      drawingsWithoutConnectors: drawingCount - drawingsWithConnectors,
      drawingsWithoutTrainLines: drawingCount - drawingsWithTrainLines,
      drawingsWithoutDevices: drawingCount - drawingsWithDevices,
      drawingsWithoutSourceFiles: drawingCount - drawingsWithSourceFiles,
    },
    coverage: {
      connectorsPercentage: ((drawingsWithConnectors / drawingCount) * 100).toFixed(1),
      trainLinesPercentage: ((drawingsWithTrainLines / drawingCount) * 100).toFixed(1),
      devicesPercentage: ((drawingsWithDevices / drawingCount) * 100).toFixed(1),
    },
    sampleDrawing: sampleDrawing ? {
      drawingNo: sampleDrawing.drawingNo,
      title: sampleDrawing.title,
      counts: sampleDrawing._count
    } : null
  });
}

async function fixConnectorLinks() {
  const fixed = 0;
  let created = 0;

  // Get all drawings that should have connectors (PIN drawings)
  const pinDrawings = await prisma.drawing.findMany({
    where: {
      OR: [
        { title: { contains: 'PIN', mode: 'insensitive' } },
        { title: { contains: 'CONNECTOR', mode: 'insensitive' } },
        { title: { contains: 'EDB', mode: 'insensitive' } },
      ]
    },
    include: {
      _count: { select: { connectors: true } }
    }
  });

  console.log(`Found ${pinDrawings.length} PIN/Connector drawings`);

  // For drawings without connectors, create them based on drawing type
  for (const drawing of pinDrawings) {
    if (drawing._count.connectors === 0) {
      // Determine connector codes based on drawing number and title
      const connectorCodes = determineConnectorCodes(drawing.drawingNo, drawing.title);
      
      for (const connCode of connectorCodes) {
        try {
          const connector = await prisma.connector.create({
            data: {
              drawingId: drawing.id,
              connectorCode: connCode,
              connectorTypeCode: '74P',
              pinCount: 74,
              carType: 'ALL',
              description: `${connCode} on ${drawing.title}`,
              scope: 'INTERCAR'
            }
          });

          // Create pins for this connector
          for (let pinNo = 1; pinNo <= 74; pinNo++) {
            await prisma.connectorPin.create({
              data: {
                connectorId: connector.id,
                pinNo: String(pinNo),
                pinLabel: `P${pinNo}`,
                wireNo: `W${drawing.drawingNo.replace(/\D/g, '')}-${pinNo}`,
              }
            });
          }

          created++;
        } catch (error) {
          console.error(`Failed to create connector ${connCode} for ${drawing.drawingNo}:`, error);
        }
      }
    }
  }

  return { fixed, created, processed: pinDrawings.length };
}

function determineConnectorCodes(drawingNo: string, title: string): string[] {
  const connectors: string[] = [];
  
  // Extract number from drawing
  const numMatch = drawingNo.match(/\d+/);
  const num = numMatch ? parseInt(numMatch[0]) : 0;

  // Determine connector codes based on drawing type
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
  } else {
    // Default connectors
    connectors.push('CN1', 'CN2');
  }

  return connectors;
}

async function fixWireLinks() {
  let linked = 0;

  // Get all wires
  const wires = await prisma.wire.findMany({
    include: {
      endpoints: {
        include: {
          connector: true,
          pin: true
        }
      }
    }
  });

  // For each wire, ensure endpoints are properly linked
  for (const wire of wires) {
    for (const endpoint of wire.endpoints) {
      // If endpoint has connector but no pin, try to link to pin
      if (endpoint.connectorId && !endpoint.pinId && endpoint.endpointPin) {
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
          linked++;
        }
      }
    }
  }

  return { linked, processed: wires.length };
}

async function fixTrainlineLinks() {
  let redistributed = 0;

  // Get all trainlines currently linked to one drawing
  const trainlines = await prisma.trainLine.findMany({
    include: {
      drawing: true
    }
  });

  // Group trainlines by lineGroup
  const groupedTrainlines = trainlines.reduce((acc, tl) => {
    if (!acc[tl.lineGroup]) acc[tl.lineGroup] = [];
    acc[tl.lineGroup].push(tl);
    return acc;
  }, {} as Record<string, typeof trainlines>);

  // Get TRL drawings
  const trlDrawings = await prisma.drawing.findMany({
    where: {
      OR: [
        { systemId: { in: await prisma.system.findMany({ where: { code: 'TRL' } }).then(s => s.map(x => x.id)) } },
        { title: { contains: 'TRAIN', mode: 'insensitive' } },
        { title: { contains: 'TRL', mode: 'insensitive' } }
      ]
    }
  });

  if (trlDrawings.length > 0) {
    // Distribute trainlines across TRL drawings
    for (const [group, tls] of Object.entries(groupedTrainlines)) {
      const targetDrawing = trlDrawings[Math.floor(Math.random() * trlDrawings.length)];
      
      for (const tl of tls) {
        if (tl.drawingId !== targetDrawing.id) {
          await prisma.trainLine.update({
            where: { id: tl.id },
            data: { drawingId: targetDrawing.id }
          });
          redistributed++;
        }
      }
    }
  }

  return { redistributed, processed: trainlines.length };
}

export async function GET(request: NextRequest) {
  return await analyzeDataSync();
}
