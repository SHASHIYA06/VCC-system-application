import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get connectors with missing pins in smaller batches
    const missingConnectors = await prisma.connector.findMany({
      where: {
        pinCount: { gt: 0 },
        pins: { none: {} }
      },
      take: 50
    });
    
    let fixed = 0;
    
    for (const conn of missingConnectors) {
      const pinCount = conn.pinCount || 0;
      if (pinCount === 0) continue;
      
      const pinData = [];
      for (let i = 1; i <= pinCount; i++) {
        pinData.push({
          connectorId: conn.id,
          pinNo: String(i),
          signalName: `PIN_${i}`,
        });
      }
      
      if (pinData.length > 0) {
        await prisma.connectorPin.createMany({ data: pinData });
        fixed++;
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Fixed ${fixed} connectors`,
    });
    
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}