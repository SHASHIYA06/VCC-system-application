import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

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
  const cables = await prisma.wire.findMany({
    where: {
      ...(options?.carType && { sourceEq: { contains: options.carType } }),
      ...(options?.subsystem && { signalName: { contains: options.subsystem } }),
    },
    select: {
      wireNo: true,
      signalName: true,
      wireColor: true,
      sourceEq: true,
      sourceConnector: true,
      destEq: true,
      destConnector: true,
      wireType: true,
    },
    orderBy: { wireNo: 'asc' },
    take: 500,
  });

  return cables.map(c => ({
    cableNo: c.wireNo,
    cableType: c.wireType || 'Single Wire',
    fromDevice: c.sourceEq || '',
    fromConnector: c.sourceConnector || '',
    toDevice: c.destEq || '',
    toConnector: c.destConnector || '',
    wireCount: 1,
    carType: extractCarType(c.sourceEq || ''),
    subsystem: extractSubsystem(c.signalName || ''),
  }));
}

export async function getWireToDrawingMapping(wireNo?: string) {
  const whereClause: Prisma.WireWhereInput = wireNo ? { wireNo: { contains: wireNo, mode: Prisma.QueryMode.insensitive } } : {};

  const wires = await prisma.wire.findMany({
    where: whereClause,
    include: {
      endpoints: {
        include: {
          device: { include: { system: true } },
          connector: true,
          pin: true,
        },
      },
    },
    take: wireNo ? 1 : 100,
    orderBy: { wireNo: 'asc' },
  });

  return wires.map(wire => {
    const sourceEndpoint = wire.endpoints.find(e => e.endpointRole === 'source');
    const destEndpoint = wire.endpoints.find(e => e.endpointRole === 'destination');

    return {
      wireNo: wire.wireNo,
      signalName: wire.signalName || '',
      sourceDevice: sourceEndpoint?.device?.name || wire.sourceEq || '',
      sourceConnector: sourceEndpoint?.connector?.connectorCode || wire.sourceConnector || '',
      sourcePin: sourceEndpoint?.pin?.pinNo || sourceEndpoint?.endpointPin || '',
      destDevice: destEndpoint?.device?.name || wire.destEq || '',
      destConnector: destEndpoint?.connector?.connectorCode || wire.destConnector || '',
      destPin: destEndpoint?.pin?.pinNo || destEndpoint?.endpointPin || '',
      carType: sourceEndpoint?.device?.carType || '',
      subsystem: sourceEndpoint?.device?.system?.code || '',
      trainlineGroup: getTrainlineGroup(parseInt(wire.wireNo)),
      relatedDrawings: getRelatedDrawings(wire.signalName || '', wire.wireNo),
    } as WireToDrawingMap;
  });
}

export async function getDrawingWires(drawingNo: string) {
  const drawing = await prisma.drawingDocument.findFirst({
    where: {
      OR: [
        { drawingNo: { contains: drawingNo, mode: Prisma.QueryMode.insensitive } },
        { id: drawingNo },
      ],
    },
    include: {
      devices: {
        include: {
          connectors: {
            include: {
              pins: true,
            },
          },
        },
      },
    },
  });

  if (!drawing) return [];

  const wires = new Set<string>();
  drawing.devices.forEach(device => {
    device.connectors.forEach(conn => {
      conn.pins.forEach(pin => {
        if (pin.wireNo) wires.add(pin.wireNo);
      });
    });
  });

  return Array.from(wires);
}

export async function getSystemDrawingCrossReference() {
  const systems = await prisma.system.findMany({
    include: {
      devices: {
        include: {
          document: true,
        },
      },
    },
  });

  const crossRef: Record<string, { drawings: string[]; equipment: string[]; trainlines: string[] }> = {};

  systems.forEach(system => {
    const drawings = new Set<string>();
    const equipment = new Set<string>();
    const trainlines = new Set<string>();

    system.devices.forEach(device => {
      if (device.documentId) drawings.add(device.documentId);
      equipment.add(device.name);
    });

    crossRef[system.code || system.name] = {
      drawings: Array.from(drawings),
      equipment: Array.from(equipment),
      trainlines: Array.from(trainlines),
    };
  });

  return crossRef;
}

function extractCarType(source: string): string {
  if (source.includes('DMC') || source.includes('DM')) return 'DMC';
  if (source.includes('TC')) return 'TC';
  if (source.includes('MC')) return 'MC';
  return 'Unknown';
}

function extractSubsystem(signal: string): string {
  const signalLower = signal.toLowerCase();
  if (signalLower.includes('trac') || signalLower.includes('vvvf')) return 'TRAC';
  if (signalLower.includes('brake') || signalLower.includes('bcu')) return 'BRAKE';
  if (signalLower.includes('door') || signalLower.includes('dcu')) return 'DOOR';
  if (signalLower.includes('vac') || signalLower.includes('hvac')) return 'VAC';
  if (signalLower.includes('aps') || signalLower.includes('battery')) return 'APS';
  if (signalLower.includes('tcms') || signalLower.includes('rio')) return 'TMS';
  if (signalLower.includes('comms') || signalLower.includes('cctv')) return 'COMMS';
  return 'GEN';
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
    drawings.push('942-58119', '942-58120', '942-38306', '942-38706');
  }
  if (signalLower.includes('brake') || signalLower.includes('bcu')) {
    drawings.push('942-58123', '942-58124', '942-58125', '942-38310', '942-38519');
  }
  if (signalLower.includes('door') || signalLower.includes('dcu')) {
    drawings.push('942-58137', '942-58138', '942-58139', '942-38603', '942-38403');
  }
  if (signalLower.includes('vac')) {
    drawings.push('942-58143', '942-58144', '942-58145', '942-38602', '942-38407');
  }
  if (signalLower.includes('aps') || signalLower.includes('battery')) {
    drawings.push('942-58130', '942-58131', '942-58132', '942-38512', '942-38516');
  }
  if (signalLower.includes('tcms') || signalLower.includes('rio')) {
    drawings.push('942-58146', '942-38409', '942-38606', '942-38607');
  }

  return drawings.length > 0 ? drawings : ['942-58101'];
}