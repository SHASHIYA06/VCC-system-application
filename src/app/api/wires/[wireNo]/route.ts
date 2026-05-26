import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wireNo: string }> }
) {
  try {
    const { wireNo: rawWireNo } = await params;
    // Normalize wire number (e.g. remove trailing -W, dashes, etc.)
    const wireNo = rawWireNo.replace(/-W$/, '').replace(/-/g, '').trim();

    let wire = await prisma.wire.findFirst({
      where: {
        OR: [
          { wireNo: wireNo },
          { wireNo: { equals: wireNo, mode: Prisma.QueryMode.insensitive } },
          { wireAlias: { equals: wireNo, mode: Prisma.QueryMode.insensitive } },
        ],
      },
    });

    if (!wire) {
      wire = await prisma.wire.findFirst({
        where: {
          wireNo: { startsWith: wireNo.substring(0, 4), mode: Prisma.QueryMode.insensitive },
        },
      });
    }

    if (!wire) {
      const allWires = await prisma.wire.findMany({ take: 1 });
      if (allWires.length === 0) {
        return NextResponse.json({ 
          error: 'No wire found',
          message: 'Database is empty. Please seed the database first.',
          hint: 'Call /api/vcc-master-seed to populate the database',
          searchTerm: wireNo
        }, { status: 404 });
      }
    }

    if (!wire) {
      return NextResponse.json({ error: 'Wire not found', searchTerm: wireNo }, { status: 404 });
    }

    const relatedTrainLines = await prisma.trainLine.findMany({
      where: { 
        OR: [
          { wireNo: wireNo },
          { wireNo: { contains: wireNo } }
        ]
      },
      include: { drawing: true },
    });

    const relatedPins = await prisma.connectorPin.findMany({
      where: { 
        OR: [
          { wireNo: wireNo },
          { wireNo: { contains: wireNo } }
        ]
      },
      include: { connector: { include: { drawing: true } } },
    });

    const relatedSignals = await prisma.signal.findMany({
      where: {
        OR: [
          { signalCode: { contains: wireNo } },
          { signalName: { contains: wire.signalName || '' } },
        ],
      },
    });

    const allRelatedDrawings: Array<{id: string, drawingNo: string, title: string, type: string}> = [];
    
    relatedTrainLines.forEach(tl => {
      if (tl.drawing) {
        allRelatedDrawings.push({
          id: tl.drawing.id,
          drawingNo: tl.drawing.drawingNo,
          title: tl.drawing.title,
          type: 'Trainline'
        });
      }
    });

    relatedPins.forEach(pin => {
      if (pin.connector?.drawing) {
        allRelatedDrawings.push({
          id: pin.connector.drawing.id,
          drawingNo: pin.connector.drawing.drawingNo,
          title: pin.connector.drawing.title,
          type: 'Pin Connection'
        });
      }
    });

    const uniqueDrawings = allRelatedDrawings.filter((v, i, a) => 
      a.findIndex(d => d.id === v.id) === i
    );

    const wireTrace = (wire.sourceEquipment && wire.destEquipment) ? {
      source: {
        type: 'equipment',
        code: wire.sourceEquipment,
        name: wire.sourceEquipment,
        pin: wire.sourcePin ? (wire.sourceConnector ? `${wire.sourceConnector}-${wire.sourcePin}` : wire.sourcePin) : undefined,
        description: '',
      },
      destination: {
        type: 'equipment',
        code: wire.destEquipment,
        name: wire.destEquipment,
        pin: wire.destPin ? (wire.destConnector ? `${wire.destConnector}-${wire.destPin}` : wire.destPin) : undefined,
        description: '',
      },
      wires: [wire.wireNo],
      colorCode: wire.voltageClass === 'HV' ? '#FF4444' : 
                 wire.voltageClass === 'ED' ? '#FFA500' :
                 wire.voltageClass === 'AP' ? '#44FF44' : '#00BFFF',
    } : null;

    return NextResponse.json({
      wire: {
        id: wire.id,
        wireNo: wire.wireNo,
        signalName: wire.signalName,
        description: wire.description,
        wireColor: wire.wireColor,
        voltageClass: wire.voltageClass,
        cableSpec: wire.cableSpec,
        conductorClass: wire.conductorClassCode,
        wireSize: wire.wireSize,
        sourceEq: wire.sourceEquipment,
        sourceConnector: wire.sourceConnector,
        sourcePin: wire.sourcePin,
        destEq: wire.destEquipment,
        destConnector: wire.destConnector,
        destPin: wire.destPin,
        remarks: wire.remarks,
      },
      relatedDrawings: uniqueDrawings,
      relatedPins: relatedPins.map(p => ({
        id: p.id,
        pinNo: p.pinNo,
        signalName: p.signalName,
        wireNo: p.wireNo,
        connectorCode: p.connector?.connectorCode || 'N/A',
        connectorId: p.connector?.id,
        drawingNo: p.connector?.drawing?.drawingNo,
      })),
      relatedSignals,
      trace: wireTrace,
      metadata: {
        trainlineCount: relatedTrainLines.length,
        pinCount: relatedPins.length,
        drawingCount: uniqueDrawings.length,
      }
    });
  } catch (error) {
    console.error('Error fetching wire:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to fetch wire', details: errMsg }, { status: 500 });
  }
}
