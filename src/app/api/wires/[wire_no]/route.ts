import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wire_no: string }> }
) {
  try {
    const { wire_no } = await params;
    const wireNo = wire_no.replace(/-W$/, '');

    const wire = await prisma.wire.findFirst({
      where: {
        OR: [
          { wireNo: wireNo },
          { wireNo: { contains: wireNo, mode: Prisma.QueryMode.insensitive } },
        ],
      },
    });

    if (!wire) {
      return NextResponse.json({ error: 'Wire not found' }, { status: 404 });
    }

    const relatedTrainLines = await prisma.trainLine.findMany({
      where: { wireNo: wireNo },
      include: { drawing: true },
    });

    const relatedPins = await prisma.connectorPin.findMany({
      where: { wireNo: wireNo },
      include: { connector: true },
    });

    const relatedSignals = await prisma.signal.findMany({
      where: {
        OR: [
          { signalCode: { contains: wireNo } },
          { signalName: { contains: wire.signalName || '' } },
        ],
      },
    });

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

    const relatedDrawings = relatedTrainLines
      .filter(tl => tl.drawing)
      .map(tl => ({
        id: tl.drawing.id,
        drawingNo: tl.drawing.drawingNo,
        title: tl.drawing.title,
      }))
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

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
      relatedDrawings,
      relatedPins,
      relatedSignals,
      trace: wireTrace,
    });
  } catch (error) {
    console.error('Error fetching wire:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to fetch wire', details: errMsg }, { status: 500 });
  }
}