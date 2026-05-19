import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const result = await seedMissingWiringData();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function seedMissingWiringData() {
  const results = { connectorsAdded: 0, pinsAdded: 0, wiresLinked: 0 };

  const drawingsWithoutConnectors = await prisma.drawing.findMany({
    where: { 
      sourceFileId: { not: null },
      connectors: { none: {} }
    },
    take: 50
  });

  for (const drawing of drawingsWithoutConnectors) {
    const systemCode = drawing.remarks?.split('|')[1] || '';
    const carType = drawing.remarks?.split('|')[0] || 'ALL';
    
    const connectorsToCreate = getDefaultConnectors(drawing.drawingNo, systemCode, carType);
    
    for (const conn of connectorsToCreate) {
      const connector = await prisma.connector.create({
        data: {
          drawingId: drawing.id,
          connectorCode: conn.code,
          description: conn.description,
          carType: conn.carType,
          locationTag: conn.location,
          pinCount: conn.pinCount
        }
      });

      const pins = [];
      for (let i = 1; i <= conn.pinCount; i++) {
        pins.push({
          connectorId: connector.id,
          pinNo: String(i),
          signalName: `PIN_${i}`,
          note: `Pin ${i} for ${conn.code}`
        });
      }

      if (pins.length > 0) {
        await prisma.connectorPin.createMany({ data: pins as any });
        results.pinsAdded += pins.length;
      }
      
      results.connectorsAdded++;
    }
  }

  const connectorsWithoutPins = await prisma.connector.findMany({
    where: { pins: { none: {} } },
    take: 100
  });

  for (const conn of connectorsWithoutPins) {
    const pinCount = conn.pinCount || 10;
    const pins = [];
    for (let i = 1; i <= pinCount; i++) {
      pins.push({
        connectorId: conn.id,
        pinNo: String(i),
        signalName: `PIN_${i}`
      });
    }
    
    if (pins.length > 0) {
      await prisma.connectorPin.createMany({ data: pins as any });
      results.pinsAdded += pins.length;
    }
  }

  return results;
}

function getDefaultConnectors(drawingNo: string, systemCode: string, carType: string): any[] {
  const defaults: Record<string, any[]> = {
    'COUPL': [
      { code: 'ICC_J1', description: 'ICC Junction 1', carType: 'ALL', location: 'Coupler', pinCount: 20 },
      { code: 'ICC_J2', description: 'ICC Junction 2', carType: 'ALL', location: 'Coupler', pinCount: 20 },
    ],
    'TRAC': [
      { code: 'VVVF_CN1', description: 'VVVF Connector 1', carType: 'DMC', location: 'Underframe', pinCount: 40 },
      { code: 'VVVF_CN2', description: 'VVVF Connector 2', carType: 'DMC', location: 'Underframe', pinCount: 40 },
    ],
    'BRAKE': [
      { code: 'BCU_CN1', description: 'Brake Control Unit CN1', carType: 'DMC', location: 'Underframe', pinCount: 30 },
      { code: 'EDB_CN1', description: 'Electronic Brake CN1', carType: 'DMC', location: 'Underframe', pinCount: 20 },
    ],
    'TMS': [
      { code: 'TCMS_RIO1', description: 'TCMS RIO Unit 1', carType: 'MC', location: 'Ceiling', pinCount: 40 },
      { code: 'TCMS_RIO2', description: 'TCMS RIO Unit 2', carType: 'MC', location: 'Ceiling', pinCount: 40 },
    ],
    'DOOR': [
      { code: 'DCU_CN1', description: 'Door Control Unit CN1', carType: 'MC', location: 'Sidewall', pinCount: 30 },
      { code: 'DCU_CN2', description: 'Door Control Unit CN2', carType: 'MC', location: 'Sidewall', pinCount: 30 },
    ],
    'APS': [
      { code: 'APS_CN1', description: 'Auxiliary Power CN1', carType: 'TC', location: 'Underframe', pinCount: 30 },
      { code: 'SIV_CN1', description: 'Static Inverter CN1', carType: 'TC', location: 'Underframe', pinCount: 20 },
    ],
    'CAB': [
      { code: 'CAB_PANEL', description: 'Cab Panel Connector', carType: 'CAB', location: 'Cab', pinCount: 50 },
      { code: 'MASTER_CTRL', description: 'Master Controller', carType: 'CAB', location: 'Cab', pinCount: 30 },
    ],
  };

  return defaults[systemCode] || [];
}

export async function GET() {
  const stats = await Promise.all([
    prisma.drawing.count(),
    prisma.connector.count(),
    prisma.connectorPin.count(),
    prisma.wire.count()
  ]);

  return NextResponse.json({
    drawings: stats[0],
    connectors: stats[1],
    pins: stats[2],
    wires: stats[3]
  });
}