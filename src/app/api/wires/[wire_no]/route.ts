import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wire_no: string }> }
) {
  try {
    const { wire_no } = await params;
    const wireNo = wire_no;

    const wire = await prisma.wire.findUnique({
      where: { wireNo },
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
        sourceEquipment: wire.sourceEquipment,
        sourceConnector: wire.sourceConnector,
        sourcePin: wire.sourcePin,
        destEquipment: wire.destEquipment,
        destConnector: wire.destConnector,
        destPin: wire.destPin,
        remarks: wire.remarks,
      },
      relatedTrainLines,
      relatedPins,
      relatedSignals,
      wireTrace: {
        source: wire.sourceEquipment ? {
          equipment: wire.sourceEquipment,
          connector: wire.sourceConnector,
          pin: wire.sourcePin,
        } : null,
        destination: wire.destEquipment ? {
          equipment: wire.destEquipment,
          connector: wire.destConnector,
          pin: wire.destPin,
        } : null,
      },
    });
  } catch (error) {
    console.error('Error fetching wire:', error);
    return NextResponse.json({ error: 'Failed to fetch wire' }, { status: 500 });
  }
}