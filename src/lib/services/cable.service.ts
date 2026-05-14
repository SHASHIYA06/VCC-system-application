import { prisma } from '@/lib/prisma';

export interface CableData {
  cableNo: string;
  cableType: string;
  description: string;
  fromDevice: string;
  fromConnector: string;
  toDevice: string;
  toConnector: string;
  wireCount: number;
  length?: number;
  carType: string;
  subsystem: string;
  drawingNo: string;
}

export interface WireToDrawingMap {
  wireNo: string;
  signalName: string;
  sourceDevice: string;
  sourceConnector: string;
  sourcePin: string;
  destDevice: string;
  destConnector: string;
  destPin: string;
  carType: string;
  subsystem: string;
  trainlineGroup: number;
  relatedDrawings: string[];
  cableNo?: string;
}

export async function getAllCables(options?: { carType?: string; subsystem?: string }) {
  const wires = await prisma.wire.findMany({
    where: {
      ...(options?.carType && { remarks: { contains: options.carType } }),
    },
    take: 500,
    orderBy: { wireNo: 'asc' },
  });

  return wires.map(w => ({
    cableNo: w.wireNo,
    cableType: 'Single Wire',
    fromDevice: w.sourceEquipment || '',
    fromConnector: w.sourceConnector || '',
    toDevice: w.destEquipment || '',
    toConnector: w.destConnector || '',
    wireCount: 1,
    carType: options?.carType || 'Unknown',
    subsystem: w.signalName?.split('_')[0] || 'GEN',
  }));
}

export async function getWireToDrawingMapping(wireNo?: string) {
  const whereClause = wireNo ? { wireNo: { contains: wireNo } } : {};

  const wires = await prisma.wire.findMany({
    where: whereClause,
    include: { endpoints: true },
    take: wireNo ? 1 : 100,
    orderBy: { wireNo: 'asc' },
  });

  return wires.map(wire => {
    const sourceEndpoint = wire.endpoints.find(e => e.endpointRole === 'source');
    const destEndpoint = wire.endpoints.find(e => e.endpointRole === 'destination');

    return {
      wireNo: wire.wireNo,
      signalName: wire.signalName || '',
      sourceDevice: wire.sourceEquipment || '',
      sourceConnector: wire.sourceConnector || '',
      sourcePin: wire.sourcePin || '',
      destDevice: wire.destEquipment || '',
      destConnector: wire.destConnector || '',
      destPin: wire.destPin || '',
      carType: 'Unknown',
      subsystem: wire.signalName?.split('_')[0] || 'GEN',
      trainlineGroup: getTrainlineGroup(parseInt(wire.wireNo) || 0),
      relatedDrawings: getRelatedDrawings(wire.signalName || '', wire.wireNo),
    } as WireToDrawingMap;
  });
}

export async function getDrawingWires(drawingNo: string) {
  const drawing = await prisma.drawing.findFirst({
    where: { drawingNo: { contains: drawingNo } },
    include: { connectors: { include: { pins: true } } },
  });

  if (!drawing) return [];

  const wires = new Set<string>();
  drawing.connectors.forEach((conn: { pins: { wireNo: string | null }[] }) => {
    conn.pins.forEach((pin: { wireNo: string | null }) => {
      if (pin.wireNo) wires.add(pin.wireNo);
    });
  });

  return Array.from(wires);
}

export async function getSystemDrawingCrossReference() {
  const systems = await prisma.system.findMany({
    include: { drawings: true },
  });

  const crossRef: Record<string, { drawings: string[]; equipment: string[]; trainlines: string[] }> = {};

  systems.forEach(system => {
    const drawings = new Set<string>();
    const equipment = new Set<string>();
    const trainlines = new Set<string>();

    system.drawings.forEach(d => drawings.add(d.drawingNo));
    crossRef[system.code] = {
      drawings: Array.from(drawings),
      equipment: Array.from(equipment),
      trainlines: Array.from(trainlines),
    };
  });

  return crossRef;
}

function getTrainlineGroup(wireNo: number): number {
  if (wireNo >= 1000 && wireNo < 2000) return 1;
  if (wireNo >= 2000 && wireNo < 3000) return 2;
  if (wireNo >= 3000 && wireNo < 4000) return 3;
  if (wireNo >= 4000 && wireNo < 5000) return 4;
  if (wireNo >= 5000 && wireNo < 6000) return 5;
  if (wireNo >= 6000 && wireNo < 7000) return 6;
  if (wireNo >= 7000 && wireNo < 8000) return 7;
  return 0;
}

function getRelatedDrawings(signal: string, wireNo: string): string[] {
  const drawings: string[] = [];
  const signalLower = signal.toLowerCase();

  if (signalLower.includes('trac') || signalLower.includes('vvvf')) {
    drawings.push('942-58119', '942-58120');
  }
  if (signalLower.includes('brake') || signalLower.includes('bcu')) {
    drawings.push('942-58123', '942-58124');
  }
  if (signalLower.includes('door') || signalLower.includes('dcu')) {
    drawings.push('942-58138', '942-58139');
  }
  if (signalLower.includes('vac')) {
    drawings.push('942-58143', '942-58144');
  }
  if (signalLower.includes('tcms') || signalLower.includes('rio')) {
    drawings.push('942-58146');
  }

  return drawings.length > 0 ? drawings : ['942-58101'];
}