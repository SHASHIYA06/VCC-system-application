import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ circuit_id: string }> }
) {
  try {
    const { circuit_id } = await params;

    const circuit = await prisma.circuit.findFirst({
      where: {
        OR: [
          { id: circuit_id },
          { circuitCode: { contains: circuit_id, mode: Prisma.QueryMode.insensitive } },
          { circuitName: { contains: circuit_id, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      include: {
        drawing: { include: { system: true } },
        endpoints: {
          orderBy: { fromLabel: 'asc' },
        },
      },
    });

    if (!circuit) {
      return NextResponse.json({ error: 'Circuit not found' }, { status: 404 });
    }

    const relatedCircuits = await prisma.circuit.findMany({
      where: {
        category: circuit.category,
        id: { not: circuit.id },
      },
      select: { id: true, circuitCode: true, circuitName: true, carScope: true },
      take: 20,
    });

    return NextResponse.json({
      circuit: {
        id: circuit.id,
        circuitCode: circuit.circuitCode,
        circuitName: circuit.circuitName,
        category: circuit.category,
        voltageText: circuit.voltageText,
        carScope: circuit.carScope,
        note: circuit.note,
        drawing: circuit.drawing ? {
          id: circuit.drawing.id,
          drawingNo: circuit.drawing.drawingNo,
          title: circuit.drawing.title,
          system: circuit.drawing.system ? {
            code: circuit.drawing.system.code,
            name: circuit.drawing.system.name,
          } : null,
        } : null,
        endpoints: circuit.endpoints.map(e => ({
          id: e.id,
          fromLabel: e.fromLabel,
          toLabel: e.toLabel,
          connectorFrom: e.connectorFrom,
          pinFrom: e.pinFrom,
          connectorTo: e.connectorTo,
          pinTo: e.pinTo,
          wireNo: e.wireNo,
          note: e.note,
        })),
      },
      relatedCircuits,
    });
  } catch (error) {
    console.error('Error fetching circuit:', error);
    return NextResponse.json({ error: 'Failed to fetch circuit' }, { status: 500 });
  }
}