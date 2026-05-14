import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type AgentType = 'wiring' | 'drawing' | 'equipment' | 'system' | 'trainline' | 'connector' | 'signal' | 'circuit';

export interface AgentResult {
  agentType: AgentType;
  query: string;
  results: unknown[];
  confidence: number;
  metadata: Record<string, unknown>;
}

export interface MultiAgentQueryResult {
  query: string;
  agentResults: AgentResult[];
  consolidatedResults: {
    wires: unknown[];
    drawings: unknown[];
    equipment: unknown[];
    connectors: unknown[];
    trainlines: unknown[];
    signals: unknown[];
    circuits: unknown[];
  };
  executionTime: number;
}

const AGENT_CONFIGS: Record<AgentType, { keywords: string[]; priority: number }> = {
  wiring: {
    keywords: ['wire', 'cable', 'connection', 'signal', 'trace', 'routing', 'voltage', 'color'],
    priority: 1,
  },
  drawing: {
    keywords: ['drawing', 'schematic', 'diagram', 'pin', 'assignment', 'pdf', 'sheet'],
    priority: 2,
  },
  equipment: {
    keywords: ['equipment', 'device', 'unit', 'vvvf', 'bcu', 'hscb', 'aps', 'becu', 'dcu'],
    priority: 3,
  },
  system: {
    keywords: ['system', 'subsystem', 'brake', 'traction', 'door', 'vac', 'comms', 'tms'],
    priority: 4,
  },
  trainline: {
    keywords: ['trainline', 'train line', 'tl', 'cross connect', '3000', '4000', '6000'],
    priority: 1,
  },
  connector: {
    keywords: ['connector', 'pin', 'x1', 'x2', 'cn1', 'cn2', 'junction', 'jumper'],
    priority: 2,
  },
  signal: {
    keywords: ['signal', 'protocol', 'rs422', 'rs485', 'can', 'ethernet', 'communication'],
    priority: 3,
  },
  circuit: {
    keywords: ['circuit', 'loop', 'power', 'control', 'feedback', 'interlock'],
    priority: 2,
  },
};

function identifyRelevantAgents(query: string): AgentType[] {
  const queryLower = query.toLowerCase();
  const scores: Record<AgentType, number> = {
    wiring: 0, drawing: 0, equipment: 0, system: 0,
    trainline: 0, connector: 0, signal: 0, circuit: 0,
  };

  Object.entries(AGENT_CONFIGS).forEach(([agent, config]) => {
    config.keywords.forEach(keyword => {
      if (queryLower.includes(keyword)) {
        scores[agent as AgentType] += config.priority;
      }
    });
  });

  return Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([agent]) => agent as AgentType)
    .slice(0, 4);
}

async function executeWiringAgent(query: string): Promise<AgentResult> {
  try {
    const wires = await prisma.wire.findMany({
      where: {
        OR: [
          { wireNo: { contains: query, mode: 'insensitive' } },
          { signalName: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 50,
    });
    return {
      agentType: 'wiring',
      query,
      results: wires,
      confidence: wires.length > 0 ? 0.9 : 0.1,
      metadata: { count: wires.length },
    };
  } catch (error) {
    return { agentType: 'wiring', query, results: [], confidence: 0, metadata: { error: String(error) } };
  }
}

async function executeDrawingAgent(query: string): Promise<AgentResult> {
  try {
    const drawings = await prisma.drawing.findMany({
      where: {
        OR: [
          { drawingNo: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { remarks: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { system: true },
      take: 30,
    });
    return {
      agentType: 'drawing',
      query,
      results: drawings,
      confidence: drawings.length > 0 ? 0.9 : 0.1,
      metadata: { count: drawings.length },
    };
  } catch (error) {
    return { agentType: 'drawing', query, results: [], confidence: 0, metadata: { error: String(error) } };
  }
}

async function executeEquipmentAgent(query: string): Promise<AgentResult> {
  try {
    const devices = await prisma.device.findMany({
      where: {
        OR: [
          { tagNo: { contains: query, mode: 'insensitive' } },
          { deviceName: { contains: query, mode: 'insensitive' } },
          { locationTag: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { system: true },
      take: 30,
    });
    return {
      agentType: 'equipment',
      query,
      results: devices,
      confidence: devices.length > 0 ? 0.9 : 0.1,
      metadata: { count: devices.length },
    };
  } catch (error) {
    return { agentType: 'equipment', query, results: [], confidence: 0, metadata: { error: String(error) } };
  }
}

async function executeTrainlineAgent(query: string): Promise<AgentResult> {
  try {
    const trainlines = await prisma.trainLine.findMany({
      where: {
        OR: [
          { wireNo: { contains: query, mode: 'insensitive' } },
          { itemName: { contains: query, mode: 'insensitive' } },
          { note: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { drawing: true },
      take: 50,
    });
    return {
      agentType: 'trainline',
      query,
      results: trainlines,
      confidence: trainlines.length > 0 ? 0.9 : 0.1,
      metadata: { count: trainlines.length },
    };
  } catch (error) {
    return { agentType: 'trainline', query, results: [], confidence: 0, metadata: { error: String(error) } };
  }
}

async function executeConnectorAgent(query: string): Promise<AgentResult> {
  try {
    const connectors = await prisma.connector.findMany({
      where: {
        OR: [
          { connectorCode: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { pins: { take: 10 } },
      take: 30,
    });
    return {
      agentType: 'connector',
      query,
      results: connectors,
      confidence: connectors.length > 0 ? 0.9 : 0.1,
      metadata: { count: connectors.length },
    };
  } catch (error) {
    return { agentType: 'connector', query, results: [], confidence: 0, metadata: { error: String(error) } };
  }
}

async function executeSignalAgent(query: string): Promise<AgentResult> {
  try {
    const signals = await prisma.signal.findMany({
      where: {
        OR: [
          { signalName: { contains: query, mode: 'insensitive' } },
          { signalCode: { contains: query, mode: 'insensitive' } },
          { protocol: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 30,
    });
    return {
      agentType: 'signal',
      query,
      results: signals,
      confidence: signals.length > 0 ? 0.9 : 0.1,
      metadata: { count: signals.length },
    };
  } catch (error) {
    return { agentType: 'signal', query, results: [], confidence: 0, metadata: { error: String(error) } };
  }
}

async function executeSystemAgent(query: string): Promise<AgentResult> {
  try {
    const systems = await prisma.system.findMany({
      where: {
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    });
    return {
      agentType: 'system',
      query,
      results: systems,
      confidence: systems.length > 0 ? 0.9 : 0.1,
      metadata: { count: systems.length },
    };
  } catch (error) {
    return { agentType: 'system', query, results: [], confidence: 0, metadata: { error: String(error) } };
  }
}

const AGENT_EXECUTORS: Record<AgentType, (query: string) => Promise<AgentResult>> = {
  wiring: executeWiringAgent,
  drawing: executeDrawingAgent,
  equipment: executeEquipmentAgent,
  trainline: executeTrainlineAgent,
  connector: executeConnectorAgent,
  signal: executeSignalAgent,
  system: executeSystemAgent,
  circuit: async (query) => ({ agentType: 'circuit', query, results: [], confidence: 0, metadata: {} }),
};

export async function searchWiringComplex(query: string, carType?: string, subsystem?: string): Promise<MultiAgentQueryResult> {
  const startTime = Date.now();
  const agents = identifyRelevantAgents(query);

  const agentResults: AgentResult[] = await Promise.all(
    agents.map(async (agentType) => {
      const executor = AGENT_EXECUTORS[agentType];
      return executor ? await executor(query) : { agentType, query, results: [], confidence: 0, metadata: {} };
    })
  );

  const consolidatedResults = {
    wires: agentResults.find(r => r.agentType === 'wiring')?.results || [],
    drawings: agentResults.find(r => r.agentType === 'drawing')?.results || [],
    equipment: agentResults.find(r => r.agentType === 'equipment')?.results || [],
    connectors: agentResults.find(r => r.agentType === 'connector')?.results || [],
    trainlines: agentResults.find(r => r.agentType === 'trainline')?.results || [],
    signals: agentResults.find(r => r.agentType === 'signal')?.results || [],
    circuits: [],
  };

  return {
    query,
    agentResults,
    consolidatedResults,
    executionTime: Date.now() - startTime,
  };
}

export async function analyzeCircuit(traceId: string) {
  const wire = await prisma.wire.findUnique({ where: { wireNo: traceId } });
  if (!wire) return { traceId, nodes: [], connections: [], error: 'Wire not found' };

  const pins = await prisma.connectorPin.findMany({
    where: { wireNo: traceId },
    include: { connector: true },
  });

  const nodes = [
    { id: traceId, type: 'wire', label: wire.wireNo, data: wire },
    ...pins.map(p => ({
      id: `${p.connector?.connectorCode}-${p.pinNo}`,
      type: 'pin',
      label: `${p.connector?.connectorCode}:${p.pinNo}`,
      data: p,
    })),
  ];

  return { traceId, nodes, connections: pins.map(p => ({ from: traceId, to: `${p.connector?.connectorCode}-${p.pinNo}` })) };
}

export async function traceTrainline(trainlineNo: string) {
  const trainlines = await prisma.trainLine.findMany({
    where: { wireNo: { contains: trainlineNo } },
    include: { drawing: true },
  });

  if (trainlines.length === 0) {
    return { trainlineNo, segments: [], path: [], error: 'Trainline not found' };
  }

  const path = [];
  for (const tl of trainlines) {
    const pins = await prisma.connectorPin.findMany({
      where: { wireNo: tl.wireNo },
      include: { connector: true },
    });
    path.push({ trainline: tl, pins });
  }

  return { trainlineNo, segments: trainlines, path };
}

export async function searchAcrossAll(query: string, filters?: {
  carType?: string;
  systemCode?: string;
  wireNo?: string;
}) {
  const where: any = {};

  if (filters?.carType) {
    where.carType = filters.carType;
  }

  const [wires, connectors, devices, drawings, trainlines, signals] = await Promise.all([
    prisma.wire.findMany({
      where: {
        OR: [
          { wireNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { signalName: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
        ...(filters?.wireNo ? { wireNo: filters.wireNo } : {}),
      },
      take: 50,
    }),
    prisma.connector.findMany({
      where: { connectorCode: { contains: query, mode: Prisma.QueryMode.insensitive } },
      take: 30,
    }),
    prisma.device.findMany({
      where: {
        OR: [
          { deviceName: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { tagNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      take: 30,
    }),
    prisma.drawing.findMany({
      where: {
        OR: [
          { drawingNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      take: 30,
    }),
    prisma.trainLine.findMany({
      where: {
        OR: [
          { wireNo: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { itemName: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      take: 50,
    }),
    prisma.signal.findMany({
      where: {
        OR: [
          { signalName: { contains: query, mode: Prisma.QueryMode.insensitive } },
          { signalCode: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ],
      },
      take: 30,
    }),
  ]);

  return {
    wires,
    connectors,
    devices,
    drawings,
    trainlines,
    signals,
    total: wires.length + connectors.length + devices.length + drawings.length + trainlines.length + signals.length,
  };
}