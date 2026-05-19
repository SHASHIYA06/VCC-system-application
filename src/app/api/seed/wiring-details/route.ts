import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const results = { updated: 0, errors: 0 };
    
    const drawings = await prisma.drawing.findMany({
      where: { 
        sourceFileId: { not: null },
      },
      select: { id: true, drawingNo: true, sourceFileId: true, remarks: true }
    });

    for (const d of drawings.slice(0, 50)) {
      try {
        const connCount = await prisma.connector.count({ where: { drawingId: d.id } });
        if (connCount === 0) {
          const connectors = getConnectorsBySource(d.sourceFileId || '');
          
          for (const c of connectors) {
            const conn = await prisma.connector.create({
              data: {
                drawingId: d.id,
                connectorCode: c.code,
                description: c.desc,
                carType: c.carType,
                pinCount: c.pins
              }
            });

            const pins = [];
            for (let i = 1; i <= c.pins; i++) {
              pins.push({ connectorId: conn.id, pinNo: String(i), signalName: `PIN_${i}` });
            }
            if (pins.length) await prisma.connectorPin.createMany({ data: pins as any });
          }
          results.updated++;
        }
      } catch { results.errors++; }
    }

    return NextResponse.json(results);
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}

function getConnectorsBySource(source: string): any[] {
  if (source.includes('DMC UF')) return [
    { code: 'CSJB', desc: 'Collector Shoe Junction Box', carType: 'DMC', pins: 10 },
    { code: 'HSCB', desc: 'High Speed Circuit Breaker', carType: 'DMC', pins: 8 },
    { code: 'HTEB', desc: 'High Tension Equipment Box', carType: 'DMC', pins: 20 },
    { code: 'MSB', desc: 'Main Switch Box', carType: 'DMC', pins: 12 },
  ];
  if (source.includes('TC _UF')) return [
    { code: 'APS', desc: 'Auxiliary Power Supply', carType: 'TC', pins: 30 },
    { code: 'SIV', desc: 'Static Inverter', carType: 'TC', pins: 20 },
  ];
  if (source.includes('MC_CEILING')) return [
    { code: 'TCMS_RIO1', desc: 'TCMS RIO 1', carType: 'MC', pins: 40 },
    { code: 'DCU1', desc: 'Door Control 1', carType: 'MC', pins: 30 },
  ];
  return [{ code: 'CN1', desc: 'Connector', carType: 'ALL', pins: 20 }];
}

export async function GET() {
  return NextResponse.json({ status: 'Run POST to seed' });
}