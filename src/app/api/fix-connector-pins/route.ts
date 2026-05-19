import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get all connectors that have pinCount but no pins
    const connectors = await prisma.connector.findMany({
      where: {
        pinCount: { gt: 0 }
      },
      include: {
        pins: true
      }
    });
    
    let fixed = 0;
    let skipped = 0;
    
    for (const conn of connectors) {
      // If pins exist, skip
      if (conn.pins.length > 0) {
        skipped++;
        continue;
      }
      
      // Generate default pins based on pinCount
      const pinData = [];
      for (let i = 1; i <= (conn.pinCount || 0); i++) {
        pinData.push({
          connectorId: conn.id,
          pinNo: String(i),
          signalName: `PIN_${i}`,
        });
      }
      
      // Create pins
      if (pinData.length > 0) {
        await prisma.connectorPin.createMany({
          data: pinData
        });
        fixed++;
      }
    }
    
    const totalPins = await prisma.connectorPin.count();
    const totalConnectors = await prisma.connector.count();
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed} connectors, skipped ${skipped}`,
      stats: { 
        connectors: totalConnectors, 
        pins: totalPins 
      }
    });
    
  } catch (error) {
    console.error('Fix error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  const connectorCount = await prisma.connector.count();
  const pinCount = await prisma.connectorPin.count();
  
  // Find connectors with missing pins
  const missingPins = await prisma.connector.findMany({
    where: {
      pinCount: { gt: 0 },
      pins: { none: {} }
    },
    select: { id: true, connectorCode: true, pinCount: true }
  });
  
  return NextResponse.json({
    current: { 
      connectors: connectorCount, 
      pins: pinCount 
    },
    missingPins: missingPins.length,
    missingConnectors: missingPins.slice(0, 10).map(c => ({
      code: c.connectorCode,
      pinCount: c.pinCount
    })),
    endpoint: 'POST to /api/fix-connector-pins to populate missing pins'
  });
}