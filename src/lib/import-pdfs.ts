import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function importPDFData(fileName: string, drawingNo: string, carType: string, subsystem: string, pageCount: number) {
  const project = await prisma.project.findFirst() || await prisma.project.create({ data: { projectCode: 'KMRCL_RS3R', projectName: 'KMRCL RS3R' } });
  const system = await prisma.system.findFirst({ where: { code: subsystem } });

  const existing = await prisma.drawing.findFirst({ where: { drawingNo } });
  
  if (existing) {
    return await prisma.drawing.update({
      where: { id: existing.id },
      data: { totalSheets: pageCount, sourceFileId: fileName }
    });
  }

  return await prisma.drawing.create({
    data: {
      projectId: project.id,
      systemId: system?.id,
      drawingNo,
      title: `${carType} ${subsystem} Drawing`,
      sourceFileId: fileName,
      totalSheets: pageCount,
      remarks: `${carType}|${subsystem}`,
      revision: 'A',
    }
  });
}

export async function importConnectors(drawingId: string, connectors: any[]) {
  for (const conn of connectors) {
    const existing = await prisma.connector.findFirst({ where: { drawingId, connectorCode: conn.code } });
    if (!existing) {
      const newConn = await prisma.connector.create({
        data: { drawingId, connectorCode: conn.code, carType: conn.carType, description: conn.description }
      });
      for (let i = 1; i <= (conn.pinCount || 10); i++) {
        await prisma.connectorPin.create({
          data: { connectorId: newConn.id, pinNo: String(i) }
        });
      }
    }
  }
}

export async function importWires(wires: any[]) {
  for (const wire of wires) {
    await prisma.wire.upsert({
      where: { wireNo: wire.wireNo },
      update: { signalName: wire.signalName, wireColor: wire.color },
      create: { wireNo: wire.wireNo, signalName: wire.signalName, wireColor: wire.color || 'Blue', voltageClass: '110V' }
    });
  }
}