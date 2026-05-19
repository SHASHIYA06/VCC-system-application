import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: '942-38307' }
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing not found' });
    }

    const existing = await prisma.connector.count({ where: { drawingId: drawing.id } });
    if (existing > 0) {
      return NextResponse.json({ message: 'Already has connectors', count: existing });
    }

    const connectors = [
      { code: 'CSJB', desc: 'Collector Shoe Junction Box', carType: 'DMC', pins: 10 },
      { code: 'HSCB', desc: 'High Speed Circuit Breaker', carType: 'DMC', pins: 8 },
      { code: 'HTEB', desc: 'High Tension Equipment Box', carType: 'DMC', pins: 20 },
      { code: 'HTJB', desc: 'High Tension Junction Box', carType: 'DMC', pins: 15 },
    ];

    let added = 0;
    for (const c of connectors) {
      const conn = await prisma.connector.create({
        data: {
          drawingId: drawing.id,
          connectorCode: c.code,
          description: c.desc,
          carType: c.carType,
          pinCount: c.pins
        }
      });

      const pins = [];
      for (let i = 1; i <= c.pins; i++) {
        pins.push({
          connectorId: conn.id,
          pinNo: String(i),
          signalName: `PIN_${i}`
        });
      }
      await prisma.connectorPin.createMany({ data: pins as any });
      added++;
    }

    return NextResponse.json({ success: true, added });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}

export async function GET() {
  const d = await prisma.drawing.findFirst({ where: { drawingNo: '942-38307' }, include: { connectors: true } });
  return NextResponse.json({ drawing: d?.drawingNo, connectors: d?.connectors?.length || 0 });
}