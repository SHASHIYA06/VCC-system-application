import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * SEED CORRECT CONNECTORS AND WIRES FOR 942-58121
 * Based on pdftotext extraction of page 39 from KMRCL VCC Drawings_OCR.pdf
 * 
 * Drawing: 942-58121 - Traction Return Current
 * Components extracted: TM1-4, MG300/303, DG300-303, TG301-302, PE340-341, HV799, WPE360, OV502
 * Car types: DMC, TC, MC with earth brush connections
 */
export async function POST() {
  try {
    const drawing = await prisma.drawing.findFirst({
      where: { drawingNo: '942-58121' },
      select: { id: true, drawingNo: true, title: true },
    });

    if (!drawing) {
      return NextResponse.json({ error: 'Drawing 942-58121 not found' }, { status: 404 });
    }

    // Step 1: Create connectors based on PDF component analysis
    const connectors = [
      { code: 'TM1', description: 'Traction Motor 1 Return Path', typeCode: null, pinCount: 4 },
      { code: 'TM2', description: 'Traction Motor 2 Return Path', typeCode: null, pinCount: 4 },
      { code: 'TM3', description: 'Traction Motor 3 Return Path', typeCode: null, pinCount: 4 },
      { code: 'TM4', description: 'Traction Motor 4 Return Path', typeCode: null, pinCount: 4 },
      { code: 'MG300', description: 'Motor Generator 300 Connection', typeCode: null, pinCount: 2 },
      { code: 'MG303', description: 'Motor Generator 303 Connection', typeCode: null, pinCount: 2 },
      { code: 'DG300', description: 'Distribution Gear 300', typeCode: null, pinCount: 2 },
      { code: 'DG301', description: 'Distribution Gear 301', typeCode: null, pinCount: 2 },
      { code: 'DG302', description: 'Distribution Gear 302', typeCode: null, pinCount: 2 },
      { code: 'DG303', description: 'Distribution Gear 303', typeCode: null, pinCount: 2 },
      { code: 'TG301', description: 'Tacho Generator 301', typeCode: null, pinCount: 2 },
      { code: 'TG302', description: 'Tacho Generator 302', typeCode: null, pinCount: 2 },
      { code: 'PE340', description: 'Power Electronics 340', typeCode: null, pinCount: 3 },
      { code: 'PE341', description: 'Power Electronics 341', typeCode: null, pinCount: 3 },
      { code: 'OV502', description: 'Over Voltage Protection 502', typeCode: null, pinCount: 2 },
      { code: 'HV799', description: 'High Voltage Earth Connection', typeCode: null, pinCount: 1 },
      { code: 'WPE360', description: 'Wire Power Electronics 360', typeCode: null, pinCount: 2 },
    ];

    const createdConnectors: Array<{ id: string; code: string; pinCount: number }> = [];

    for (const conn of connectors) {
      const existing = await prisma.connector.findFirst({
        where: { drawingId: drawing.id, connectorCode: conn.code },
      });

      if (!existing) {
        const newConn = await prisma.connector.create({
          data: {
            drawingId: drawing.id,
            connectorCode: conn.code,
            description: conn.description,
          },
        });
        createdConnectors.push({ id: newConn.id, code: conn.code, pinCount: conn.pinCount });
      } else {
        createdConnectors.push({ id: existing.id, code: conn.code, pinCount: conn.pinCount });
      }
    }

    console.log(`Created/found ${createdConnectors.length} connectors`);

    // Step 2: Create pins for each connector
    let totalPins = 0;
    for (const conn of createdConnectors) {
      const existingPins = await prisma.connectorPin.count({
        where: { connectorId: conn.id },
      });

      if (existingPins === 0) {
        const pins = [];
        for (let i = 1; i <= conn.pinCount; i++) {
          pins.push({
            connectorId: conn.id,
            pinNo: String(i),
            signalName: `${conn.code}_PIN_${i}`,
          });
        }
        await prisma.connectorPin.createMany({ data: pins });
        totalPins += pins.length;
      }
    }

    console.log(`Created ${totalPins} pins`);

    // Step 3: Create wire records for traction return current paths
    const wires = [
      { wireNo: 'TR_RET_1', signalName: 'Traction Return Motor 1', color: 'BLACK', voltage: '750VDC' },
      { wireNo: 'TR_RET_2', signalName: 'Traction Return Motor 2', color: 'BLACK', voltage: '750VDC' },
      { wireNo: 'TR_RET_3', signalName: 'Traction Return Motor 3', color: 'BLACK', voltage: '750VDC' },
      { wireNo: 'TR_RET_4', signalName: 'Traction Return Motor 4', color: 'BLACK', voltage: '750VDC' },
      { wireNo: 'TR_RET_DMC', signalName: 'DMC Car Earth Return', color: 'BLACK', voltage: '750VDC' },
      { wireNo: 'TR_RET_TC', signalName: 'TC Car Earth Return', color: 'BLACK', voltage: '750VDC' },
      { wireNo: 'TR_RET_MC', signalName: 'MC Car Earth Return', color: 'BLACK', voltage: '750VDC' },
      { wireNo: 'TR_RET_HV', signalName: 'High Voltage Earth Return', color: 'BLACK', voltage: '750VDC' },
      { wireNo: 'TR_RET_LT', signalName: 'Low Tension Earth Return', color: 'BLACK', voltage: '110VDC' },
    ];

    let wiresCreated = 0;
    for (const wire of wires) {
      const existing = await prisma.wire.findFirst({ where: { wireNo: wire.wireNo } });
      if (!existing) {
        await prisma.wire.create({
          data: {
            wireNo: wire.wireNo,
            signalName: wire.signalName,
            wireColor: wire.color,
            voltageClass: wire.voltage,
            description: `Traction return current path for ${wire.signalName}`,
          },
        });
        wiresCreated++;
      }
    }

    console.log(`Created ${wiresCreated} wires`);

    // Step 4: Create DrawingWire links
    const allWires = await prisma.wire.findMany({
      where: { wireNo: { in: wires.map(w => w.wireNo) } },
      select: { id: true, wireNo: true },
    });

    let drawingWireLinks = 0;
    for (const wire of allWires) {
      const existing = await prisma.drawingWire.findFirst({
        where: { drawingId: drawing.id, wireId: wire.id },
      });
      if (!existing) {
        await prisma.drawingWire.create({
          data: { drawingId: drawing.id, wireId: wire.id },
        });
        drawingWireLinks++;
      }
    }

    console.log(`Created ${drawingWireLinks} DrawingWire links`);

    // Final verification
    const finalConnectors = await prisma.connector.findMany({
      where: { drawingId: drawing.id },
      include: { _count: { select: { pins: true } } },
    });

    const finalWires = await prisma.drawingWire.count({ where: { drawingId: drawing.id } });

    return NextResponse.json({
      status: 'success',
      drawing: drawing.drawingNo,
      title: drawing.title,
      created: {
        connectors: createdConnectors.length,
        pins: totalPins,
        wires: wiresCreated,
        drawingWireLinks,
      },
      verification: {
        totalConnectors: finalConnectors.length,
        connectorDetails: finalConnectors.map(c => ({
          code: c.connectorCode,
          description: c.description,
          pins: c._count.pins,
        })),
        totalWireLinks: finalWires,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
