import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { drawingNo } = await req.json();
    
    if (!drawingNo) {
      return NextResponse.json({ error: 'drawingNo required' }, { status: 400 });
    }

    const drawing = await prisma.drawing.findFirst({ where: { drawingNo } });
    if (!drawing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const existing = await prisma.connector.count({ where: { drawingId: drawing.id } });
    if (existing > 0) return NextResponse.json({ message: 'Already has connectors', existing });

    const source = drawing.sourceFileId || '';
    const connectors = source.includes('DMC UF') ? [
      { code: 'CSJB', desc: 'Collector Shoe Junction Box', carType: 'DMC', pins: 10 },
      { code: 'HSCB', desc: 'High Speed Circuit Breaker', carType: 'DMC', pins: 8 },
      { code: 'HTEB', desc: 'High Tension Equipment Box', carType: 'DMC', pins: 20 },
      { code: 'HTJB', desc: 'High Tension Junction Box', carType: 'DMC', pins: 15 },
    ] : source.includes('TC UF') || source.includes('TC _UF') ? [
      { code: 'APS', desc: 'Auxiliary Power Supply', carType: 'TC', pins: 30 },
      { code: 'SIV', desc: 'Static Inverter', carType: 'TC', pins: 20 },
      { code: 'BATT', desc: 'Battery Connector', carType: 'TC', pins: 20 },
    ] : source.includes('MC_CEILING') ? [
      { code: 'TCMS_RIO1', desc: 'TCMS RIO 1', carType: 'MC', pins: 40 },
      { code: 'TCMS_RIO2', desc: 'TCMS RIO 2', carType: 'MC', pins: 40 },
    ] : source.includes('TC_CEILING') ? [
      { code: 'VAC1', desc: 'HVAC 1', carType: 'TC', pins: 25 },
      { code: 'PIS', desc: 'PIS Controller', carType: 'TC', pins: 15 },
    ] : [
      { code: 'CN1', desc: 'Connector 1', carType: 'ALL', pins: 20 },
      { code: 'CN2', desc: 'Connector 2', carType: 'ALL', pins: 20 },
    ];

    for (const c of connectors) {
      const conn = await prisma.connector.create({
        data: { drawingId: drawing.id, connectorCode: c.code, description: c.desc, carType: c.carType, pinCount: c.pins }
      });
      const pins = [];
      for (let i = 1; i <= c.pins; i++) {
        pins.push({ connectorId: conn.id, pinNo: String(i), signalName: `PIN_${i}` });
      }
      if (pins.length) await prisma.connectorPin.createMany({ data: pins as any });
    }

    return NextResponse.json({ success: true, count: connectors.length });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ usage: 'POST { drawingNo: "942-38508" }' });
}