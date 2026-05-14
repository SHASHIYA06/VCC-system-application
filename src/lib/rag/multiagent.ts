import { prisma } from '@/lib/prisma';

export async function searchWiringComplex(query: string, carType?: string, subsystem?: string) {
  const results = {
    wires: [] as any[],
    connectors: [] as any[],
    devices: [] as any[],
    drawings: [] as any[],
    trainlines: [] as any[],
    signals: [] as any[],
  };

  const [wires, connectors, devices, drawings, trainlines, signals] = await Promise.all([
    prisma.wire.findMany({ where: { wireNo: { contains: query } }, take: 50 }),
    prisma.connector.findMany({ where: { connectorCode: { contains: query } }, take: 50 }),
    prisma.device.findMany({ where: { OR: [{ deviceName: { contains: query } }, { tagNo: { contains: query } }] }, take: 50 }),
    prisma.drawing.findMany({ where: { OR: [{ drawingNo: { contains: query } }, { title: { contains: query } }] }, take: 50 }),
    prisma.trainLine.findMany({ where: { OR: [{ wireNo: { contains: query } }, { itemName: { contains: query } }] }, take: 50 }),
    prisma.signal.findMany({ where: { OR: [{ signalName: { contains: query } }, { signalCode: { contains: query } }] }, take: 50 }),
  ]);

  return { ...results, wires, connectors, devices, drawings, trainlines, signals, total: wires.length + connectors.length + devices.length + drawings.length };
}

export async function analyzeCircuit(traceId: string) {
  return { traceId, nodes: [], connections: [] };
}

export async function traceTrainline(trainlineNo: string) {
  const trainlines = await prisma.trainLine.findMany({ where: { wireNo: trainlineNo } });
  return { trainlineNo, segments: trainlines, path: [] };
}