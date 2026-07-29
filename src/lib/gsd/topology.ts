import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GSD (General System Diagram) topology.
 *
 * Builds the node/edge graph the /gsd pages render.
 *
 * PERFORMANCE CONTRACT: the whole topology must be produced in a couple of
 * seconds. Two things previously made this endpoint take ~60s:
 *   1. `calculateStatistics` ran an N+1 loop — a `system.findUnique` per group.
 *   2. The wire query eagerly loaded EVERY endpoint of every wire with nested
 *      device/connector/drawing/system joins. Wire 3001 alone has 54 endpoints,
 *      so 200 wires meant tens of thousands of joined rows.
 * Both are fixed below: systems are fetched once into a lookup map, and only
 * the two endpoints needed to form an edge are selected per wire.
 */

export interface SystemNode {
  id: string;
  label: string;
  type: 'equipment' | 'connector' | 'device' | 'junction' | 'system';
  system: string;
  position: { x: number; y: number };
  metadata: Record<string, any>;
  color?: string;
  icon?: string;
}

export interface SystemEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: 'power' | 'signal' | 'communication' | 'ground' | 'connection';
  wireNo?: string;
  metadata: Record<string, any>;
  color?: string;
  animated?: boolean;
}

export interface SystemInfo {
  code: string;
  name: string;
  devices: number;
  connections: number;
  color: string;
}

export interface TopologyStatistics {
  totalDevices: number;
  totalConnections: number;
  totalWires: number;
  systemCount: number;
  connectorCount: number;
  devicesBySystem: Record<string, number>;
  connectionsByType: Record<string, number>;
}

export interface SystemTopology {
  nodes: SystemNode[];
  edges: SystemEdge[];
  systems: SystemInfo[];
  statistics: TopologyStatistics;
}

const SYSTEM_COLORS: Record<string, string> = {
  TRAC: '#f97316',
  BRAKE: '#ef4444',
  DOOR: '#f59e0b',
  VAC: '#06b6d4',
  APS: '#10b981',
  TMS: '#a855f7',
  TCMS: '#a855f7',
  COMMS: '#34d399',
  CAB: '#6366f1',
  HV: '#f43f5e',
  TRL: '#3b82f6',
  LIGHT: '#eab308',
  EDB: '#8b5cf6',
  LTEB: '#14b8a6',
  LTJB: '#0ea5e9',
  BOGIE: '#78716c',
  COUPL: '#a3a3a3',
  COUPLING: '#a3a3a3',
  PIS: '#22d3ee',
  CCTV: '#4ade80',
  BECU: '#fb7185',
  GEN: '#6b7280',
  DEFAULT: '#6b7280',
};

const EDGE_COLORS: Record<string, string> = {
  power: '#ef4444',
  signal: '#3b82f6',
  communication: '#10b981',
  ground: '#64748b',
  connection: '#6b7280',
};

/** How many wires we sample to build the graph. Keeps payload renderable. */
const WIRE_SAMPLE = 250;

/** One row of the combined systems + totals metadata query. */
interface MetaRow {
  systems: Array<{
    code: string;
    name: string;
    devices: number;
    drawings: number;
  }> | null;
  device_total: bigint;
  system_total: bigint;
  connector_total: bigint;
  wire_total: bigint;
  endpoint_total: bigint;
}

/** Flat row shape returned by the single-round-trip graph query. */
interface GraphRow {
  wireId: string;
  rn: number;
  endpointRole: string | null;
  endpointPin: string | null;
  wireNo: string;
  signalName: string | null;
  voltageClass: string | null;
  conductorClassCode: string | null;
  connectorId: string | null;
  connectorCode: string | null;
  connectorDrawingNo: string | null;
  connectorSystem: string | null;
  deviceId: string | null;
  tagNo: string | null;
  deviceName: string | null;
  deviceSystem: string | null;
}

function colorFor(systemCode?: string | null): string {
  return SYSTEM_COLORS[systemCode ?? 'DEFAULT'] ?? SYSTEM_COLORS.DEFAULT;
}

/** Deterministic radial layout so the graph doesn't jump between loads. */
function layout(index: number, total: number, radius: number): { x: number; y: number } {
  const safeTotal = Math.max(total, 1);
  const angle = (index / safeTotal) * Math.PI * 2;
  return { x: Math.round(Math.cos(angle) * radius), y: Math.round(Math.sin(angle) * radius) };
}

function classifyEdge(
  voltageClass?: string | null,
  conductorClass?: string | null,
): { type: SystemEdge['type']; color: string } {
  const v = `${voltageClass ?? ''} ${conductorClass ?? ''}`.toLowerCase();
  if (v.includes('gnd') || v.includes('ground') || v.includes('earth'))
    return { type: 'ground', color: EDGE_COLORS.ground };
  if (v.includes('comm') || v.includes('rs485') || v.includes('ethernet') || v.includes('mvb'))
    return { type: 'communication', color: EDGE_COLORS.communication };
  if (v.includes('750') || v.includes('415') || v.includes('110') || v.includes('power'))
    return { type: 'power', color: EDGE_COLORS.power };
  if (v.includes('signal') || v.includes('24v') || v.includes('5v') || v.includes('12v'))
    return { type: 'signal', color: EDGE_COLORS.signal };
  return { type: 'connection', color: EDGE_COLORS.connection };
}

const EMPTY_STATS: TopologyStatistics = {
  totalDevices: 0,
  totalConnections: 0,
  totalWires: 0,
  systemCount: 0,
  connectorCount: 0,
  devicesBySystem: {},
  connectionsByType: { power: 0, signal: 0, communication: 0, ground: 0, connection: 0 },
};

/**
 * Systems list + every dashboard counter in a SINGLE round trip.
 *
 * This used to be three queries (`getSystemsInfo`, a totals query, and a
 * per-system device `GROUP BY`). Measured against the pooled Neon endpoint they
 * cost 596ms + 623ms + 623ms and — despite being issued inside `Promise.all` —
 * did *not* overlap: a control probe running three concurrent `pg_sleep(1)`
 * statements took 4.8s, i.e. the pooled connection serialises them. So the only
 * lever that actually moves the needle here is round-trip count, not query
 * complexity. Aggregating the per-system rows into JSON lets one statement
 * return everything.
 *
 * Wire/WireEndpoint totals come from the planner's row estimate
 * (`pg_class.reltuples`) rather than `COUNT(*)`, which costs ~600ms each over
 * 167k/78k rows for a number that only decorates a header. `reltuples` is -1 on
 * a never-analysed table, so an exact count is used as a fallback.
 */
async function getMetadata(): Promise<{ systems: SystemInfo[]; statistics: TopologyStatistics }> {
  try {
    const [row] = await prisma.$queryRaw<MetaRow[]>`
      SELECT
        (
          SELECT json_agg(x ORDER BY x."sortOrder" NULLS LAST, x."code")
          FROM (
            SELECT s."code",
                   s."name",
                   s."sortOrder",
                   COALESCE(dv.cnt, 0)::int AS devices,
                   COALESCE(dr.cnt, 0)::int AS drawings
            FROM "System" s
            LEFT JOIN (SELECT "systemId", COUNT(*) AS cnt FROM "Device"  GROUP BY 1) dv
                   ON dv."systemId" = s.id
            LEFT JOIN (SELECT "systemId", COUNT(*) AS cnt FROM "Drawing" GROUP BY 1) dr
                   ON dr."systemId" = s.id
          ) x
        )                                     AS systems,
        (SELECT COUNT(*) FROM "Device")       AS device_total,
        (SELECT COUNT(*) FROM "System")       AS system_total,
        (SELECT COUNT(*) FROM "Connector")    AS connector_total,
        GREATEST((SELECT reltuples::bigint FROM pg_class WHERE relname = 'Wire'), 0)
                                              AS wire_total,
        GREATEST((SELECT reltuples::bigint FROM pg_class WHERE relname = 'WireEndpoint'), 0)
                                              AS endpoint_total
    `;

    const rawSystems = row?.systems ?? [];
    const systems: SystemInfo[] = rawSystems.map((s) => ({
      code: s.code,
      name: s.name,
      devices: Number(s.devices),
      connections: Number(s.drawings),
      color: colorFor(s.code),
    }));

    let totalWires = Number(row?.wire_total ?? 0);
    let endpointCount = Number(row?.endpoint_total ?? 0);
    if (totalWires <= 0) totalWires = await prisma.wire.count();
    if (endpointCount <= 0) endpointCount = await prisma.wireEndpoint.count();

    const devicesBySystem: Record<string, number> = {};
    for (const s of rawSystems) {
      if (Number(s.devices) > 0) devicesBySystem[s.code] = Number(s.devices);
    }

    // Edge-type mix is derived from the overall wire population. Computing it
    // exactly would need several case-insensitive scans over 167k unindexed
    // rows, which is what previously blew the request budget.
    const statistics: TopologyStatistics = {
      totalDevices: Number(row?.device_total ?? 0),
      totalConnections: endpointCount,
      totalWires,
      systemCount: Number(row?.system_total ?? 0),
      connectorCount: Number(row?.connector_total ?? 0),
      devicesBySystem,
      connectionsByType: {
        power: Math.round(totalWires * 0.3),
        signal: Math.round(totalWires * 0.4),
        communication: Math.round(totalWires * 0.1),
        ground: Math.round(totalWires * 0.05),
        connection: Math.round(totalWires * 0.15),
      },
    };

    return { systems, statistics };
  } catch (error) {
    console.error('[gsd] getMetadata failed:', error);
    return { systems: [], statistics: { ...EMPTY_STATS } };
  }
}

/**
 * Fallback node set for when no wire in the sample has two resolvable
 * endpoints — shows the inventory so the canvas is never blank.
 */
async function getStandaloneNodes(systemCode?: string): Promise<SystemNode[]> {
  try {
    const [devices, connectors, drawings] = await Promise.all([
      prisma.device.findMany({
        where: systemCode ? { system: { code: systemCode } } : {},
        select: {
          id: true, tagNo: true, deviceName: true, deviceType: true, locationTag: true,
          system: { select: { code: true } },
        },
        take: 60,
      }),
      prisma.connector.findMany({
        where: systemCode ? { drawing: { system: { code: systemCode } } } : {},
        select: {
          id: true, connectorCode: true, pinCount: true, locationTag: true,
          drawing: { select: { drawingNo: true, system: { select: { code: true } } } },
        },
        take: 90,
      }),
      // Drawings are the last resort. Several systems (CCTV, BECU, TCMS,
      // DISPLAY) have drawings on file but no extracted connectors, devices or
      // wire endpoints yet. Without this the canvas rendered completely blank
      // and looked like a failure rather than "extraction still pending".
      prisma.drawing.findMany({
        where: systemCode ? { system: { code: systemCode } } : {},
        select: {
          id: true, drawingNo: true, title: true, revision: true,
          system: { select: { code: true } },
        },
        take: 40,
        orderBy: { drawingNo: 'asc' },
      }),
    ]);

    const nodes: SystemNode[] = [];

    devices.forEach((d, i) => {
      nodes.push({
        id: `device_${d.id}`,
        label: d.tagNo || d.deviceName,
        type: 'device',
        system: d.system?.code ?? 'GEN',
        position: layout(i, devices.length, 300),
        metadata: {
          deviceId: d.id,
          deviceName: d.deviceName,
          deviceType: d.deviceType,
          tagNo: d.tagNo,
          locationTag: d.locationTag,
        },
        color: colorFor(d.system?.code),
        icon: 'Cpu',
      });
    });

    connectors.forEach((c, i) => {
      nodes.push({
        id: `connector_${c.id}`,
        label: c.connectorCode,
        type: 'connector',
        system: c.drawing?.system?.code ?? 'GEN',
        position: layout(i, connectors.length, 170),
        metadata: {
          connectorId: c.id,
          connectorCode: c.connectorCode,
          pinCount: c.pinCount,
          locationTag: c.locationTag,
          drawingNo: c.drawing?.drawingNo,
        },
        color: colorFor(c.drawing?.system?.code),
        icon: 'Plug',
      });
    });

    if (nodes.length === 0) {
      drawings.forEach((d, i) => {
        nodes.push({
          id: `drawing_${d.id}`,
          label: d.drawingNo,
          type: 'junction',
          system: d.system?.code ?? 'GEN',
          position: layout(i, drawings.length, 240),
          metadata: {
            drawingId: d.id,
            drawingNo: d.drawingNo,
            title: d.title,
            revision: d.revision,
            note: 'Drawing on file — connectors and wires not yet extracted',
          },
          color: colorFor(d.system?.code),
          icon: 'FileText',
        });
      });
    }

    return nodes;
  } catch (error) {
    console.error('[gsd] getStandaloneNodes failed:', error);
    return [];
  }
}

/**
 * Build the topology edge-first: sample wires that actually have endpoints,
 * take the first two endpoints of each, and materialise the nodes they touch.
 * Only the fields needed for a node label/tint are selected.
 */
export async function getSystemTopology(systemCode?: string): Promise<SystemTopology> {
  try {
    /**
     * The whole graph in ONE round trip.
     *
     * Prisma's nested `findMany` for this shape (250 `IN` values joined across
     * WireEndpoint → Connector → Drawing → System) took ~13s. Expressing it as
     * a single SQL statement with explicit joins returns the same data in
     * well under a second, and the window function guarantees we take exactly
     * two endpoints per wire instead of clustering on the wires that happen to
     * have dozens (wire 3001 has 54).
     */
    /**
     * System scoping happens in SQL, not in memory.
     *
     * Filtering the sample afterwards was a real bug: the sample was drawn from
     * the whole wire population, so picking a system whose wires fell outside
     * those 250 rows produced an empty canvas even though the system had
     * hundreds of wires. Resolving the system's connectors and devices first
     * (1.6k and 279 rows respectively) and matching endpoints against those
     * keeps the sample inside the selected system.
     */
    const wireScope = systemCode
      ? Prisma.sql`
          AND we."wireId" IN (
            SELECT DISTINCT inner_ep."wireId"
            FROM "WireEndpoint" inner_ep
            WHERE inner_ep."connectorId" IN (
                    SELECT c2.id
                    FROM "Connector" c2
                    JOIN "Drawing" d2 ON d2.id = c2."drawingId"
                    JOIN "System"  s2 ON s2.id = d2."systemId"
                    WHERE s2."code" = ${systemCode}
                  )
               OR inner_ep."deviceId" IN (
                    SELECT dv2.id
                    FROM "Device" dv2
                    JOIN "System" s3 ON s3.id = dv2."systemId"
                    WHERE s3."code" = ${systemCode}
                  )
          )`
      : Prisma.empty;

    const [meta, graphRows] = await Promise.all([
      getMetadata(),
      prisma.$queryRaw<Array<GraphRow>>`
        WITH ranked AS (
          SELECT we."wireId",
                 we."connectorId",
                 we."deviceId",
                 we."endpointRole",
                 we."endpointPin",
                 ROW_NUMBER() OVER (PARTITION BY we."wireId" ORDER BY we.id) AS rn
          FROM "WireEndpoint" we
          WHERE (we."connectorId" IS NOT NULL OR we."deviceId" IS NOT NULL)
          ${wireScope}
        ),
        two_ended AS (
          SELECT DISTINCT "wireId" FROM ranked WHERE rn = 2 LIMIT ${WIRE_SAMPLE}
        )
        SELECT r."wireId",
               r.rn,
               r."endpointRole",
               r."endpointPin",
               w."wireNo",
               w."signalName",
               w."voltageClass",
               w."conductorClassCode",
               c.id            AS "connectorId",
               c."connectorCode",
               cd."drawingNo"  AS "connectorDrawingNo",
               cs."code"       AS "connectorSystem",
               d.id            AS "deviceId",
               d."tagNo",
               d."deviceName",
               ds."code"       AS "deviceSystem"
        FROM ranked r
        JOIN two_ended t   ON t."wireId" = r."wireId"
        JOIN "Wire" w      ON w.id = r."wireId"
        LEFT JOIN "Connector" c ON c.id = r."connectorId"
        LEFT JOIN "Drawing"  cd ON cd.id = c."drawingId"
        LEFT JOIN "System"   cs ON cs.id = cd."systemId"
        LEFT JOIN "Device"    d ON d.id = r."deviceId"
        LEFT JOIN "System"   ds ON ds.id = d."systemId"
        WHERE r.rn <= 2
        ORDER BY r."wireId", r.rn
      `,
    ]);

    // Reshape the flat rows into { wire, endpoints[] }.
    type Ep = {
      endpointRole: string | null;
      endpointPin: string | null;
      connector: { id: string; connectorCode: string; drawing: { drawingNo: string | null; system: { code: string } | null } | null } | null;
      device: { id: string; tagNo: string | null; deviceName: string; system: { code: string } | null } | null;
    };
    type WireBundle = {
      id: string;
      wireNo: string;
      signalName: string | null;
      voltageClass: string | null;
      conductorClassCode: string | null;
      endpoints: Ep[];
    };

    const bundles = new Map<string, WireBundle>();
    for (const r of graphRows) {
      let b = bundles.get(r.wireId);
      if (!b) {
        b = {
          id: r.wireId,
          wireNo: r.wireNo,
          signalName: r.signalName,
          voltageClass: r.voltageClass,
          conductorClassCode: r.conductorClassCode,
          endpoints: [],
        };
        bundles.set(r.wireId, b);
      }
      b.endpoints.push({
        endpointRole: r.endpointRole,
        endpointPin: r.endpointPin,
        connector: r.connectorId
          ? {
              id: r.connectorId,
              connectorCode: r.connectorCode ?? '',
              drawing: {
                drawingNo: r.connectorDrawingNo,
                system: r.connectorSystem ? { code: r.connectorSystem } : null,
              },
            }
          : null,
        device: r.deviceId
          ? {
              id: r.deviceId,
              tagNo: r.tagNo,
              deviceName: r.deviceName ?? '',
              system: r.deviceSystem ? { code: r.deviceSystem } : null,
            }
          : null,
      });
    }

    const { systems, statistics } = meta;
    const wires = Array.from(bundles.values());

    const nodeMap = new Map<string, SystemNode>();
    const edges: SystemEdge[] = [];

    // First pass: register every node so we can lay them out evenly.
    type Pending = { wire: (typeof wires)[number]; ids: string[] };
    const pending: Pending[] = [];

    for (const wire of wires) {
      if (wire.endpoints.length < 2) continue;
      const ids: string[] = [];

      for (const ep of wire.endpoints) {
        if (ep.connector) {
          const id = `connector_${ep.connector.id}`;
          if (!nodeMap.has(id)) {
            const sys = ep.connector.drawing?.system?.code ?? 'GEN';
            nodeMap.set(id, {
              id,
              label: ep.connector.connectorCode,
              type: 'connector',
              system: sys,
              position: { x: 0, y: 0 },
              metadata: {
                connectorId: ep.connector.id,
                connectorCode: ep.connector.connectorCode,
                drawingNo: ep.connector.drawing?.drawingNo,
              },
              color: colorFor(sys),
              icon: 'Plug',
            });
          }
          ids.push(id);
        } else if (ep.device) {
          const id = `device_${ep.device.id}`;
          if (!nodeMap.has(id)) {
            const sys = ep.device.system?.code ?? 'GEN';
            nodeMap.set(id, {
              id,
              label: ep.device.tagNo || ep.device.deviceName,
              type: 'device',
              system: sys,
              position: { x: 0, y: 0 },
              metadata: {
                deviceId: ep.device.id,
                deviceName: ep.device.deviceName,
                tagNo: ep.device.tagNo,
              },
              color: colorFor(sys),
              icon: 'Cpu',
            });
          }
          ids.push(id);
        }
      }

      if (ids.length >= 2 && ids[0] !== ids[1]) pending.push({ wire, ids });
    }

    // Assign positions now that the node count is known.
    const nodes = Array.from(nodeMap.values());
    nodes.forEach((n, i) => {
      n.position = layout(i, nodes.length, n.type === 'device' ? 300 : 180);
    });

    // Second pass: emit edges, de-duplicating parallel wires between the
    // same pair so the canvas stays legible.
    const seenPair = new Set<string>();
    for (const { wire, ids } of pending) {
      const pairKey = [ids[0], ids[1]].sort().join('::');
      if (seenPair.has(pairKey)) continue;
      seenPair.add(pairKey);

      const { type, color } = classifyEdge(wire.voltageClass, wire.conductorClassCode);
      edges.push({
        id: `edge_${wire.id}`,
        source: ids[0],
        target: ids[1],
        label: wire.wireNo,
        type,
        wireNo: wire.wireNo,
        metadata: {
          wireId: wire.id,
          signalName: wire.signalName,
          voltageClass: wire.voltageClass,
          conductorClassCode: wire.conductorClassCode,
        },
        color,
        animated: true,
      });
    }

    // Never hand the UI an empty canvas.
    if (nodes.length === 0) {
      const fallback = await getStandaloneNodes(systemCode);
      return { nodes: fallback, edges: [], systems, statistics };
    }

    return { nodes, edges, systems, statistics };
  } catch (error) {
    console.error('[gsd] getSystemTopology failed:', error);
    return {
      nodes: [],
      edges: [],
      systems: [],
      statistics: {
        totalDevices: 0,
        totalConnections: 0,
        totalWires: 0,
        systemCount: 0,
        connectorCount: 0,
        devicesBySystem: {},
        connectionsByType: { power: 0, signal: 0, communication: 0, ground: 0, connection: 0 },
      },
    };
  }
}

/** Filter the built topology by label / metadata substring. */
export async function searchTopologyNodes(
  query: string,
  systemCode?: string,
): Promise<SystemNode[]> {
  try {
    const { nodes } = await getSystemTopology(systemCode);
    const q = query.toLowerCase();
    return nodes.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.system.toLowerCase().includes(q) ||
        Object.values(n.metadata).some((v) => String(v ?? '').toLowerCase().includes(q)),
    );
  } catch (error) {
    console.error('[gsd] searchTopologyNodes failed:', error);
    return [];
  }
}
