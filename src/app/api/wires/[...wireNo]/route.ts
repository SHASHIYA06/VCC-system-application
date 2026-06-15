import { NextRequest, NextResponse } from 'next/server';
import { prisma, withDatabaseRetry } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wireNo: string[] }> }
) {
  try {
    const { wireNo: segments } = await params;
    const rawWireNo = segments.map(decodeURIComponent).join('/');
    // Normalize wire number (e.g. remove trailing -W, but keep / since it's a valid separator in wireNo)
    const wireNo = rawWireNo.replace(/-W$/, '').trim();

    let wire = await withDatabaseRetry(async () => prisma.wire.findFirst({
      where: {
        OR: [
          { wireNo: wireNo },
          { wireNo: { equals: wireNo, mode: Prisma.QueryMode.insensitive } },
          { wireAlias: { equals: wireNo, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      include: {
        drawings: {
          include: {
            drawing: {
              select: {
                id: true,
                drawingNo: true,
                title: true,
                revision: true,
                systemId: true,
                system: {
                  select: {
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }), 'Wire detail fetch');

    if (!wire) {
      // Try with slash removed if we searched with it, or try startsWith base
      const noSlash = wireNo.replace(/[\/]/g, '');
      wire = await withDatabaseRetry(async () => prisma.wire.findFirst({
        where: {
          OR: [
            { wireNo: noSlash },
            { wireNo: { startsWith: wireNo.substring(0, 4), mode: Prisma.QueryMode.insensitive } },
          ]
        },
        include: {
          drawings: {
            include: {
              drawing: {
                select: {
                  id: true,
                  drawingNo: true,
                  title: true,
                  revision: true,
                  systemId: true,
                  system: {
                    select: {
                      code: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      }), 'Wire detail fetch fallback');
    }

    if (!wire) {
      return NextResponse.json({ error: 'Wire not found', searchTerm: wireNo }, { status: 404 });
    }

    const relatedTrainLines = await withDatabaseRetry(async () => prisma.trainLine.findMany({
      where: { 
        OR: [
          { wireNo: wire!.wireNo },
          { wireNo: { contains: wire!.wireNo } }
        ]
      },
      include: { drawing: true },
    }), 'Related TrainLines');

    const relatedPins = await withDatabaseRetry(async () => prisma.connectorPin.findMany({
      where: { 
        OR: [
          { wireNo: wire!.wireNo },
          { wireNo: { contains: wire!.wireNo } }
        ]
      },
      include: { connector: { include: { drawing: true } } },
    }), 'Related Pins');

    const relatedSignals = await withDatabaseRetry(async () => prisma.signal.findMany({
      where: {
        OR: [
          { signalCode: { contains: wire!.wireNo } },
          { signalName: { contains: wire!.signalName || '' } },
        ],
      },
    }), 'Related Signals');

    // Get all related drawings from the junction table
    const allRelatedDrawings = wire.drawings.map(dw => ({
      id: dw.drawing.id,
      drawingNo: dw.drawing.drawingNo,
      title: dw.drawing.title,
      revision: dw.drawing.revision,
      systemCode: dw.drawing.system?.code || 'GEN',
      systemName: dw.drawing.system?.name || 'General',
      type: 'Wire Connection',
      pageNo: dw.pageNo,
      sheetNo: dw.sheetNo,
    }));

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
        wireAlias: wire.wireAlias,
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
      relatedDrawings: allRelatedDrawings,
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
        drawingCount: allRelatedDrawings.length,
      }
    });
  } catch (error) {
    console.error('Error fetching wire:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Failed to fetch wire', details: errMsg }, { status: 500 });
  }
}
