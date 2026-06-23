/**
 * RAILWAY DIGITAL TWIN — WIRING TRACE ENGINE
 * =================================================================
 * The connectivity backbone of the platform. Turns isolated tables
 * (Wire, ConnectorPin, Connector, Device, System) into a navigable
 * electrical graph using the WireEndpoint join table.
 *
 * A WireEndpoint links:  wire ── pin ── connector ── device
 * so a single wire's endpoints describe every physical termination
 * of that conductor across the train.
 *
 * Capabilities:
 *   - traceWire(wireNo)         full electrical picture of one conductor
 *   - traceFromPin(...)         start at a connector pin, walk outward
 *   - multiHopTrace(wireNo)     follow same-signal continuity across cars
 *
 * Every node returned carries its hierarchy context (system, drawing,
 * car) so the UI can render breadcrumbs and the AI can cite sources.
 */
import { prisma } from '@/lib/prisma';

export interface TraceEndpoint {
  endpointId: string;
  role: string | null;
  label: string | null;
  pin: {
    id: string;
    pinNo: string;
    pinLabel: string | null;
    signalName: string | null;
    voltageText: string | null;
  } | null;
  connector: {
    id: string;
    code: string;
    description: string | null;
    carType: string | null;
    locationTag: string | null;
  } | null;
  device: {
    id: string;
    name: string;
    tagNo: string | null;
    carType: string | null;
  } | null;
  drawing: {
    id: string;
    drawingNo: string;
    title: string;
  } | null;
  system: {
    code: string;
    name: string;
  } | null;
}

export interface WireTrace {
  wire: {
    id: string;
    wireNo: string;
    signalName: string | null;
    voltageClass: string | null;
    wireColor: string | null;
    description: string | null;
    sourceEquipment: string | null;
    destEquipment: string | null;
  };
  endpoints: TraceEndpoint[];
  endpointCount: number;
  systemsTouched: string[];
  carsTouched: string[];
  drawingsTouched: string[];
}

/** Shape a raw WireEndpoint (with includes) into a TraceEndpoint. */
function shapeEndpoint(e: any): TraceEndpoint {
  const drawing = e.connector?.drawing || null;
  return {
    endpointId: e.id,
    role: e.endpointRole ?? null,
    label: e.endpointLabel ?? null,
    pin: e.pin
      ? {
          id: e.pin.id,
          pinNo: e.pin.pinNo,
          pinLabel: e.pin.pinLabel ?? null,
          signalName: e.pin.signalName ?? null,
          voltageText: e.pin.voltageText ?? null,
        }
      : null,
    connector: e.connector
      ? {
          id: e.connector.id,
          code: e.connector.connectorCode,
          description: e.connector.description ?? null,
          carType: e.connector.carType ?? null,
          locationTag: e.connector.locationTag ?? null,
        }
      : null,
    device: e.device
      ? {
          id: e.device.id,
          name: e.device.deviceName,
          tagNo: e.device.tagNo ?? null,
          carType: e.device.carType ?? null,
        }
      : null,
    drawing: drawing
      ? { id: drawing.id, drawingNo: drawing.drawingNo, title: drawing.title }
      : null,
    system: drawing?.system
      ? { code: drawing.system.code, name: drawing.system.name }
      : null,
  };
}

const endpointInclude = {
  pin: {
    select: {
      id: true,
      pinNo: true,
      pinLabel: true,
      signalName: true,
      voltageText: true,
    },
  },
  device: {
    select: { id: true, deviceName: true, tagNo: true, carType: true },
  },
  connector: {
    include: {
      drawing: { include: { system: { select: { code: true, name: true } } } },
    },
  },
} as const;

/**
 * Full electrical trace of a single wire by its number.
 * Returns the wire plus every termination point with hierarchy context.
 */
export async function traceWire(wireNo: string): Promise<WireTrace | null> {
  const normalized = wireNo.trim();

  const wire = await prisma.wire.findFirst({
    where: {
      OR: [
        { wireNo: normalized },
        { wireNo: { equals: normalized, mode: 'insensitive' } },
        { wireAlias: { equals: normalized, mode: 'insensitive' } },
      ],
    },
    include: { endpoints: { include: endpointInclude } },
  });

  if (!wire) return null;

  const endpoints = wire.endpoints.map(shapeEndpoint);

  const systemsTouched = [
    ...new Set(endpoints.map((e) => e.system?.code).filter(Boolean) as string[]),
  ];
  const carsTouched = [
    ...new Set(
      endpoints
        .map((e) => e.connector?.carType || e.device?.carType)
        .filter(Boolean) as string[]
    ),
  ];
  const drawingsTouched = [
    ...new Set(endpoints.map((e) => e.drawing?.drawingNo).filter(Boolean) as string[]),
  ];

  return {
    wire: {
      id: wire.id,
      wireNo: wire.wireNo,
      signalName: wire.signalName,
      voltageClass: wire.voltageClass,
      wireColor: wire.wireColor,
      description: wire.description,
      sourceEquipment: wire.sourceEquipment,
      destEquipment: wire.destEquipment,
    },
    endpoints,
    endpointCount: endpoints.length,
    systemsTouched,
    carsTouched,
    drawingsTouched,
  };
}

/**
 * Multi-hop continuity trace. Many railway signals keep the same base
 * number across cars/sheets with suffixes (3001, 3001/1, 3001a). This
 * follows that family so a technician sees the whole circuit, not one leg.
 */
export async function multiHopTrace(wireNo: string): Promise<{
  origin: string;
  base: string;
  legs: WireTrace[];
  totalEndpoints: number;
  systemsTouched: string[];
}> {
  const trimmed = wireNo.trim();
  const base = trimmed.match(/^(\d+(?:-\d+)?)/)?.[1] || trimmed;

  // Find sibling wires that share the numeric base (the continuity family).
  const family = await prisma.wire.findMany({
    where: { wireNo: { startsWith: base } },
    select: { wireNo: true },
    orderBy: { wireNo: 'asc' },
    take: 40, // safety cap — large families are rare and noisy beyond this
  });

  const legs: WireTrace[] = [];
  for (const f of family) {
    const t = await traceWire(f.wireNo);
    if (t && t.endpointCount > 0) legs.push(t);
  }

  const systemsTouched = [
    ...new Set(legs.flatMap((l) => l.systemsTouched)),
  ];

  return {
    origin: trimmed,
    base,
    legs,
    totalEndpoints: legs.reduce((s, l) => s + l.endpointCount, 0),
    systemsTouched,
  };
}

/**
 * Trace starting from a connector pin. Resolves the pin's wire then
 * returns the full wire trace, so the UI can navigate pin → whole circuit.
 */
export async function traceFromPin(
  connectorCode: string,
  pinNo: string
): Promise<WireTrace | null> {
  const pin = await prisma.connectorPin.findFirst({
    where: {
      pinNo,
      connector: { connectorCode },
    },
    select: { wireNo: true },
  });

  if (!pin?.wireNo) return null;
  return traceWire(pin.wireNo);
}
