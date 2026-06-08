/**
 * POPULATE SAMPLE PIN DATA
 * 
 * This endpoint populates sample pin data for test drawings to demonstrate
 * the pin assignment and connector pinout display functionality.
 * 
 * Generates realistic sample data for a few key drawings.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Populating sample pin data...');

    // Get a few test drawings
    const testDrawings = ['942-58142', '942-58103', '942-38104', '942-38305'];
    let totalPinsCreated = 0;
    let totalConnectorsProcessed = 0;

    for (const drawingNo of testDrawings) {
      try {
        const drawing = await prisma.drawing.findFirst({
          where: { drawingNo: { equals: drawingNo, mode: 'insensitive' } },
          include: { connectors: { include: { pins: true } } },
        });

        if (!drawing) {
          console.log(`⏭️ Drawing ${drawingNo} not found, skipping`);
          continue;
        }

        console.log(`📍 Processing drawing ${drawingNo}`);

        // Process each connector
        for (const connector of drawing.connectors) {
          totalConnectorsProcessed++;

          // If connector already has pins, skip
          if (connector.pins.length > 0) {
            console.log(`✓ Connector ${connector.connectorCode} already has ${connector.pins.length} pins`);
            continue;
          }

          // Generate sample pins based on pinCount
          const pinCount = connector.pinCount || 16; // Default to 16 if not specified
          const sampleSignals = [
            'GND', 'VCC', '+5V', '+12V', '+24V', '−12V', '+3.3V',
            'SDA', 'SCL', 'RX', 'TX', 'CTS', 'RTS', 'DTR', 'DCD', 'DSR',
            'CONTROL_1', 'CONTROL_2', 'FEEDBACK_1', 'FEEDBACK_2',
            'POWER_IN', 'POWER_OUT', 'SIGNAL_A', 'SIGNAL_B',
            'SPARE_1', 'SPARE_2', 'SPARE_3', 'SPARE_4',
          ];

          const pinsToCreate = [];
          const wiresForConnector = await prisma.wire.findMany({
            take: pinCount,
            orderBy: { wireNo: 'asc' },
          });

          for (let i = 0; i < pinCount; i++) {
            const signal = sampleSignals[i % sampleSignals.length];
            const wireNo = wiresForConnector[i]?.wireNo;

            pinsToCreate.push({
              connectorId: connector.id,
              pinNo: String(i + 1).padStart(2, '0'),
              signalName: `${signal}_${i + 1}`,
              wireNo: wireNo || `WIRE_${connector.connectorCode}_${i + 1}`,
              conductorClassCode: i % 5 === 0 ? 'HV' : i % 5 === 1 ? 'LV' : i % 5 === 2 ? 'DATA' : i % 5 === 3 ? 'GND' : 'CONTROL',
              terminalFrom: `J${drawingNo}_${i + 1}`,
              terminalTo: null,
              note: `Sample pin for connector ${connector.connectorCode}`,
            });
          }

          // Batch insert pins
          if (pinsToCreate.length > 0) {
            await prisma.connectorPin.createMany({ data: pinsToCreate });
            totalPinsCreated += pinsToCreate.length;
            console.log(`✓ Created ${pinsToCreate.length} sample pins for ${connector.connectorCode}`);
          }
        }

      } catch (err) {
        console.error(`❌ Error processing ${drawingNo}:`, err);
      }
    }

    console.log(`✅ Sample data population complete!`);
    console.log(`📊 Summary: ${totalPinsCreated} pins created across ${totalConnectorsProcessed} connectors`);

    return NextResponse.json({
      success: true,
      message: `Created ${totalPinsCreated} sample pins`,
      summary: {
        pinsCreated: totalPinsCreated,
        connectorsProcessed: totalConnectorsProcessed,
        drawingsProcessed: testDrawings.length,
      },
    });

  } catch (error) {
    console.error('❌ Sample data population error:', error);
    return NextResponse.json(
      {
        error: 'Failed to populate sample data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get statistics about current pin population
    const totalConnectors = await prisma.connector.count();
    const totalPins = await prisma.connectorPin.count();
    const connectorsWithPins = await prisma.connector.count({
      where: { pins: { some: {} } },
    });

    const avgPinsPerConnector = totalConnectors > 0
      ? Math.round((totalPins / connectorsWithPins) * 10) / 10
      : 0;

    const pinsAssignedToWires = await prisma.connectorPin.count({
      where: { wireNo: { not: null } },
    });

    const pinsAssignmentPercentage = totalPins > 0
      ? Math.round((pinsAssignedToWires / totalPins) * 100)
      : 0;

    return NextResponse.json({
      status: 'ready',
      statistics: {
        totalConnectors,
        totalPins,
        connectorsWithPins,
        connectorsWithoutPins: totalConnectors - connectorsWithPins,
        avgPinsPerConnector,
        pinsAssignedToWires,
        pinsUnassigned: totalPins - pinsAssignedToWires,
        assignmentPercentage: pinsAssignmentPercentage,
      },
      recommendation:
        pinsAssignmentPercentage < 50
          ? 'POST to this endpoint to populate sample pins for demo drawings'
          : 'Good pin coverage. Consider running verification to sync all pins.',
    });

  } catch (error) {
    console.error('❌ Statistics error:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}
