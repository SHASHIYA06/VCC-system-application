/**
 * RAILWAY DIGITAL TWIN — HIERARCHY ENGINE
 * =================================================================
 * Walks the existing schema to produce the navigable digital-twin tree:
 *
 *   Project → Formation(Train) → Car → System → Subsystem → Device
 *                                        → Drawing → Connector → Pin → Wire
 *
 * Returns lightweight nodes with counts so the UI can lazy-load each
 * level on demand rather than pulling the whole 72k-pin graph at once.
 */
import { prisma } from '@/lib/prisma';

export interface TwinNode {
  id: string;
  type:
    | 'project'
    | 'train'
    | 'car'
    | 'system'
    | 'subsystem'
    | 'device'
    | 'drawing'
    | 'connector'
    | 'pin'
    | 'wire';
  code: string;
  label: string;
  childCount?: number;
  meta?: Record<string, unknown>;
}

/** Top level: project formations (trains) with their cars. */
export async function getTrainLevel(): Promise<TwinNode[]> {
  const formations = await prisma.formation.findMany({
    include: {
      project: { select: { projectCode: true, projectName: true } },
      _count: { select: { cars: true } },
    },
    orderBy: { formationCode: 'asc' },
  });

  return formations.map((f) => ({
    id: f.id,
    type: 'train' as const,
    code: f.formationCode,
    label: f.formationName,
    childCount: f._count.cars,
    meta: { carCount: f.carCount, project: f.project.projectName },
  }));
}

/** Cars within a train (formation). */
export async function getCarLevel(formationId: string): Promise<TwinNode[]> {
  const cars = await prisma.car.findMany({
    where: { formationId },
    include: { _count: { select: { carSystems: true } } },
    orderBy: { carPosition: 'asc' },
  });

  return cars.map((c) => ({
    id: c.id,
    type: 'car' as const,
    code: c.carCode,
    label: c.carLabel || `${c.carType} (pos ${c.carPosition})`,
    childCount: c._count.carSystems,
    meta: { carType: c.carType, position: c.carPosition },
  }));
}

/** Systems present on a car. */
export async function getCarSystems(carId: string): Promise<TwinNode[]> {
  const carSystems = await prisma.carSystem.findMany({
    where: { carId },
    include: {
      system: {
        include: { _count: { select: { subsystems: true, devices: true, drawings: true } } },
      },
    },
  });

  return carSystems.map((cs) => ({
    id: cs.system.id,
    type: 'system' as const,
    code: cs.system.code,
    label: cs.system.name,
    childCount: cs.system._count.subsystems + cs.system._count.devices,
    meta: {
      category: cs.system.category,
      devices: cs.system._count.devices,
      drawings: cs.system._count.drawings,
      subsystems: cs.system._count.subsystems,
    },
  }));
}

/** All systems (when no car context) — global system list. */
export async function getSystemLevel(): Promise<TwinNode[]> {
  const systems = await prisma.system.findMany({
    where: { isActive: true },
    include: { _count: { select: { subsystems: true, devices: true, drawings: true } } },
    orderBy: { sortOrder: 'asc' },
  });

  return systems.map((s) => ({
    id: s.id,
    type: 'system' as const,
    code: s.code,
    label: s.name,
    childCount: s._count.subsystems + s._count.devices,
    meta: {
      category: s.category,
      devices: s._count.devices,
      drawings: s._count.drawings,
      subsystems: s._count.subsystems,
      dataStatus: s.dataStatus,
    },
  }));
}

/** Drill into a system: its subsystems, devices, and drawings. */
export async function getSystemDetail(systemId: string): Promise<{
  subsystems: TwinNode[];
  devices: TwinNode[];
  drawings: TwinNode[];
}> {
  const [subsystems, devices, drawings] = await Promise.all([
    prisma.subsystem.findMany({
      where: { systemId },
      include: { _count: { select: { devices: true } } },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.device.findMany({
      where: { systemId },
      select: { id: true, tagNo: true, deviceName: true, deviceType: true, carType: true },
      orderBy: { deviceName: 'asc' },
      take: 200,
    }),
    prisma.drawing.findMany({
      where: { systemId },
      select: { id: true, drawingNo: true, title: true },
      orderBy: { drawingNo: 'asc' },
      take: 200,
    }),
  ]);

  return {
    subsystems: subsystems.map((s) => ({
      id: s.id,
      type: 'subsystem' as const,
      code: s.code,
      label: s.name,
      childCount: s._count.devices,
    })),
    devices: devices.map((d) => ({
      id: d.id,
      type: 'device' as const,
      code: d.tagNo || d.id.slice(0, 8),
      label: d.deviceName,
      meta: { deviceType: d.deviceType, carType: d.carType },
    })),
    drawings: drawings.map((d) => ({
      id: d.id,
      type: 'drawing' as const,
      code: d.drawingNo,
      label: d.title,
    })),
  };
}

/** Drill into a drawing: its connectors with pin counts. */
export async function getDrawingDetail(drawingId: string): Promise<TwinNode[]> {
  const connectors = await prisma.connector.findMany({
    where: { drawingId },
    include: { _count: { select: { pins: true } } },
    orderBy: { connectorCode: 'asc' },
  });

  return connectors.map((c) => ({
    id: c.id,
    type: 'connector' as const,
    code: c.connectorCode,
    label: c.description || c.connectorCode,
    childCount: c._count.pins,
    meta: { carType: c.carType, locationTag: c.locationTag, pinCount: c.pinCount },
  }));
}

/** Drill into a connector: its pins with wire references. */
export async function getConnectorDetail(connectorId: string): Promise<TwinNode[]> {
  const pins = await prisma.connectorPin.findMany({
    where: { connectorId },
    select: { id: true, pinNo: true, pinLabel: true, wireNo: true, signalName: true, voltageText: true },
    orderBy: { pinNo: 'asc' },
  });

  return pins.map((p) => ({
    id: p.id,
    type: 'pin' as const,
    code: p.pinNo,
    label: p.signalName || p.pinLabel || `Pin ${p.pinNo}`,
    meta: { wireNo: p.wireNo, voltage: p.voltageText },
  }));
}
