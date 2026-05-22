import { prisma } from '@/lib/prisma';

export async function search(query: string, limit: number = 20) {
  const [wires, connectors, devices, drawings] = await Promise.all([
    prisma.wire.findMany({ where: { wireNo: { contains: query } }, take: limit }),
    prisma.connector.findMany({ where: { connectorCode: { contains: query } }, take: limit }),
    prisma.device.findMany({ where: { OR: [{ deviceName: { contains: query } }, { tagNo: { contains: query } }] }, take: limit }),
    prisma.drawing.findMany({ where: { OR: [{ drawingNo: { contains: query } }, { title: { contains: query } }] }, take: limit }),
  ]);

  return { wires, connectors, devices, drawings, total: wires.length + connectors.length + devices.length + drawings.length };
}