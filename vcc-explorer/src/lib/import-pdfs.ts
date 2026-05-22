import { prisma } from '@/lib/prisma';

export async function importPDFData(
  fileName: string,
  drawingNo: string,
  carType: string,
  subsystem: string,
  pageCount: number,
  title?: string
) {
  const project = await prisma.project.findFirst() || await prisma.project.create({
    data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R' }
  });

  const system = await prisma.system.findFirst({ where: { code: subsystem } });

  const existing = await prisma.drawing.findFirst({
    where: { projectId: project.id, drawingNo }
  });

  if (existing) {
    return await prisma.drawing.update({
      where: { id: existing.id },
      data: {
        totalSheets: pageCount,
        sourceFileId: fileName,
        title: title || existing.title,
        remarks: `${carType}|${subsystem}`
      }
    });
  }

  return await prisma.drawing.create({
    data: {
      projectId: project.id,
      systemId: system?.id,
      drawingNo,
      title: title || `${carType} ${subsystem} Drawing`,
      sourceFileId: fileName,
      totalSheets: pageCount,
      remarks: `${carType}|${subsystem}`,
      revision: 'A',
    }
  });
}

export async function importConnectors(drawingId: string, connectors: {
  code: string;
  description?: string;
  carType?: string;
  pinCount?: number;
  location?: string;
  scope?: string;
}[]) {
  const results = [];

  for (const conn of connectors) {
    const existing = await prisma.connector.findFirst({
      where: { drawingId, connectorCode: conn.code }
    });

    if (existing) {
      const updated = await prisma.connector.update({
        where: { id: existing.id },
        data: {
          description: conn.description,
          carType: conn.carType,
          locationTag: conn.location,
          scope: conn.scope as any,
        }
      });
      results.push({ action: 'updated', ...updated });
    } else {
      const created = await prisma.connector.create({
        data: {
          drawingId,
          connectorCode: conn.code,
          description: conn.description,
          carType: conn.carType,
          locationTag: conn.location,
          pinCount: conn.pinCount || 20,
          scope: conn.scope as any,
        }
      });

      for (let i = 1; i <= (conn.pinCount || 20); i++) {
        await prisma.connectorPin.create({
          data: {
            connectorId: created.id,
            pinNo: String(i),
          }
        });
      }
      results.push({ action: 'created', ...created });
    }
  }

  return results;
}

export async function importWires(wires: {
  wireNo: string;
  signalName?: string;
  color?: string;
  voltageClass?: string;
  cableSpec?: string;
  description?: string;
  sourceEquipment?: string;
  sourceConnector?: string;
  sourcePin?: string;
  destEquipment?: string;
  destConnector?: string;
  destPin?: string;
}[]) {
  const results = [];

  for (const wire of wires) {
    const existing = await prisma.wire.findUnique({ where: { wireNo: wire.wireNo } });

    if (existing) {
      const updated = await prisma.wire.update({
        where: { wireNo: wire.wireNo },
        data: {
          signalName: wire.signalName,
          wireColor: wire.color,
          voltageClass: wire.voltageClass,
          cableSpec: wire.cableSpec,
          description: wire.description,
          sourceEquipment: wire.sourceEquipment,
          sourceConnector: wire.sourceConnector,
          sourcePin: wire.sourcePin,
          destEquipment: wire.destEquipment,
          destConnector: wire.destConnector,
          destPin: wire.destPin,
        }
      });
      results.push({ action: 'updated', wireNo: wire.wireNo });
    } else {
      const created = await prisma.wire.create({
        data: {
          wireNo: wire.wireNo,
          signalName: wire.signalName,
          wireColor: wire.color || 'Blue',
          voltageClass: wire.voltageClass || '110V',
          cableSpec: wire.cableSpec || '1.5 sqmm',
          description: wire.description,
          sourceEquipment: wire.sourceEquipment,
          sourceConnector: wire.sourceConnector,
          sourcePin: wire.sourcePin,
          destEquipment: wire.destEquipment,
          destConnector: wire.destConnector,
          destPin: wire.destPin,
        }
      });
      results.push({ action: 'created', wireNo: wire.wireNo });
    }
  }

  return results;
}

export async function importEquipment(drawingId: string, equipment: {
  tagNo: string;
  deviceName: string;
  carType?: string;
  location?: string;
  systemCode?: string;
  deviceType?: string;
  description?: string;
}[]) {
  const results = [];

  for (const eq of equipment) {
    const system = eq.systemCode ? await prisma.system.findFirst({ where: { code: eq.systemCode } }) : null;

    const existing = await prisma.device.findFirst({
      where: { tagNo: eq.tagNo }
    });

    if (existing) {
      const updated = await prisma.device.update({
        where: { id: existing.id },
        data: {
          carType: eq.carType,
          locationTag: eq.location,
          deviceType: eq.deviceType,
          note: eq.description,
          systemId: system?.id,
        }
      });
      results.push({ action: 'updated', ...updated });
    } else {
      const created = await prisma.device.create({
        data: {
          drawingId,
          systemId: system?.id,
          tagNo: eq.tagNo,
          deviceName: eq.deviceName,
          carType: eq.carType,
          locationTag: eq.location,
          deviceType: eq.deviceType,
          note: eq.description,
        }
      });
      results.push({ action: 'created', ...created });
    }
  }

  return results;
}

export async function importTrainLines(drawingId: string, trainlines: {
  wireNo: string;
  itemName: string;
  lineGroup: string;
  carType?: string;
  connectorCode?: string;
  pinNo?: string;
  note?: string;
}[]) {
  const results = [];

  for (const tl of trainlines) {
    const existing = await prisma.trainLine.findFirst({
      where: { drawingId, wireNo: tl.wireNo }
    });

    if (existing) {
      const updated = await prisma.trainLine.update({
        where: { id: existing.id },
        data: {
          itemName: tl.itemName,
          lineGroup: tl.lineGroup,
          carType: tl.carType,
          connectorCode: tl.connectorCode,
          pinNo: tl.pinNo,
          note: tl.note,
        }
      });
      results.push({ action: 'updated', wireNo: tl.wireNo });
    } else {
      const created = await prisma.trainLine.create({
        data: {
          drawingId,
          wireNo: tl.wireNo,
          itemName: tl.itemName,
          lineGroup: tl.lineGroup,
          carType: tl.carType,
          connectorCode: tl.connectorCode,
          pinNo: tl.pinNo,
          note: tl.note,
        }
      });
      results.push({ action: 'created', wireNo: tl.wireNo });
    }
  }

  return results;
}

export async function indexDrawingContent(
  drawingNo: string,
  content: string,
  pageNo: number = 1
) {
  const drawing = await prisma.drawing.findFirst({ where: { drawingNo } });
  if (!drawing) return null;

  const existingPage = await prisma.drawingPage.findFirst({
    where: { drawingId: drawing.id, pageNo }
  });

  if (existingPage) {
    return await prisma.drawingPage.update({
      where: { id: existingPage.id },
      data: { ocrText: content, parseStatus: 'COMPLETED' }
    });
  }

  return await prisma.drawingPage.create({
    data: {
      drawingId: drawing.id,
      pageNo,
      ocrText: content,
      parseStatus: 'COMPLETED',
    }
  });
}

export async function getDrawingIndexingStats() {
  const [totalDrawings, drawingsWithPages, totalPages] = await Promise.all([
    prisma.drawing.count(),
    prisma.drawing.count({ where: { pages: { some: {} } } }),
    prisma.drawingPage.count(),
  ]);

  return {
    totalDrawings,
    drawingsWithPages,
    totalPages,
    indexedPercentage: totalDrawings > 0 ? Math.round((drawingsWithPages / totalDrawings) * 100) : 0,
  };
}