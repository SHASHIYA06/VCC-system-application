import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trainline_no: string }> }
) {
  try {
    const { trainline_no } = await params;
    
    const trainline = await prisma.trainLine.findFirst({
      where: {
        OR: [
          { wireNo: trainline_no },
          { itemName: { contains: trainline_no, mode: 'insensitive' } },
        ],
      },
      include: {
        drawing: { include: { system: true } },
      },
    });

    if (!trainline) {
      return NextResponse.json({ error: 'Trainline not found' }, { status: 404 });
    }

    const relatedWires = await prisma.wire.findMany({
      where: {
        OR: [
          { wireNo: trainline.wireNo || undefined },
          { signalName: { contains: trainline.itemName } },
        ],
      },
    });

    const crossConnections = await prisma.crossConnection.findMany({
      where: {
        OR: [
          { wireA: trainline.wireNo },
          { wireB: trainline.wireNo },
        ],
      },
    });

    return NextResponse.json({
      trainline: {
        ...trainline,
        isCrossConnected: crossConnections.length > 0,
      },
      relatedWires,
      crossConnections,
    });
  } catch (error) {
    console.error('Error fetching trainline:', error);
    return NextResponse.json({ error: 'Failed to fetch trainline' }, { status: 500 });
  }
}