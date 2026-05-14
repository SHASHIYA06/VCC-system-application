import { prisma } from '../prisma';
import { searchDocuments, searchWiring } from './service';

export type AgentType = 'wiring' | 'drawing' | 'equipment' | 'system' | 'trainline' | 'connector';

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
  };
  executionTime: number;
}

const AGENT_CONFIGS: Record<AgentType, { keywords: string[]; priority: number }> = {
  wiring: {
    keywords: ['wire', 'cable', 'connection', 'signal', 'trace', 'routing'],
    priority: 1,
  },
  drawing: {
    keywords: ['drawing', 'schematic', 'diagram', 'pin', 'assignment', 'pdf'],
    priority: 2,
  },
  equipment: {
    keywords: ['equipment', 'device', 'unit', 'vvvf', 'bcu', 'hscb', 'aps'],
    priority: 3,
  },
  system: {
    keywords: ['system', 'subsystem', 'brake', 'traction', 'door', 'vac', 'comms'],
    priority: 4,
  },
  trainline: {
    keywords: ['trainline', 'train line', 'tl', 'cross connect'],
    priority: 1,
  },
  connector: {
    keywords: ['connector', 'pin', 'x1', 'x2', 'cn1', 'cn2', 'junction'],
    priority: 2,
  },
};

function identifyRelevantAgents(query: string): AgentType[] {
  const queryLower = query.toLowerCase();
  const scores: Record<AgentType, number> = {
    wiring: 0,
    drawing: 0,
    equipment: 0,
    system: 0,
    trainline: 0,
    connector: 0,
  };

  Object.entries(AGENT_CONFIGS).forEach(([agent, config]) => {
    config.keywords.forEach(keyword => {
      if (queryLower.includes(keyword)) {
        scores[agent as AgentType] += config.priority;
      }
    });
  });

  const sorted = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([agent]) => agent as AgentType);

  return sorted.length > 0 ? sorted : ['wiring', 'drawing', 'equipment'];
}

async function executeWiringAgent(query: string): Promise<AgentResult> {
  try {
    const wiringResults = await searchWiring(query);
    return {
      agentType: 'wiring',
      query,
      results: wiringResults,
      confidence: wiringResults.length > 0 ? 0.9 : 0.1,
      metadata: { count: wiringResults.length },
    };
  } catch (error) {
    return {
      agentType: 'wiring',
      query,
      results: [],
      confidence: 0,
      metadata: { error: String(error) },
    };
  }
}

async function executeDrawingAgent(query: string): Promise<AgentResult> {
  try {
    const drawingResults = await searchDocuments(query, 10);
    return {
      agentType: 'drawing',
      query,
      results: drawingResults,
      confidence: drawingResults.length > 0 ? 0.85 : 0.1,
      metadata: { count: drawingResults.length },
    };
  } catch (error) {
    return {
      agentType: 'drawing',
      query,
      results: [],
      confidence: 0,
      metadata: { error: String(error) },
    };
  }
}

async function executeEquipmentAgent(query: string): Promise<AgentResult> {
  try {
    const equipment = await prisma.deviceInstance.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { tag: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { system: true, type: true },
      take: 20,
    });
    return {
      agentType: 'equipment',
      query,
      results: equipment,
      confidence: equipment.length > 0 ? 0.9 : 0.1,
      metadata: { count: equipment.length },
    };
  } catch (error) {
    return {
      agentType: 'equipment',
      query,
      results: [],
      confidence: 0,
      metadata: { error: String(error) },
    };
  }
}

async function executeSystemAgent(query: string): Promise<AgentResult> {
  try {
    const systems = await prisma.system.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        devices: { take: 10 },
      },
    });
    return {
      agentType: 'system',
      query,
      results: systems,
      confidence: systems.length > 0 ? 0.85 : 0.1,
      metadata: { count: systems.length },
    };
  } catch (error) {
    return {
      agentType: 'system',
      query,
      results: [],
      confidence: 0,
      metadata: { error: String(error) },
    };
  }
}

async function executeTrainlineAgent(query: string): Promise<AgentResult> {
  try {
    const trainlines = await prisma.wire.findMany({
      where: {
        signalName: { contains: query, mode: 'insensitive' },
      },
      select: { wireNo: true, signalName: true, wireColor: true },
      take: 20,
    });
    return {
      agentType: 'trainline',
      query,
      results: trainlines,
      confidence: trainlines.length > 0 ? 0.85 : 0.1,
      metadata: { count: trainlines.length },
    };
  } catch (error) {
    return {
      agentType: 'trainline',
      query,
      results: [],
      confidence: 0,
      metadata: { error: String(error) },
    };
  }
}

async function executeConnectorAgent(query: string): Promise<AgentResult> {
  try {
    const connectors = await prisma.connector.findMany({
      where: {
        OR: [
          { connectorCode: { contains: query, mode: 'insensitive' } },
          { normCode: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        device: true,
        pins: { take: 20 },
      },
      take: 20,
    });
    return {
      agentType: 'connector',
      query,
      results: connectors,
      confidence: connectors.length > 0 ? 0.9 : 0.1,
      metadata: { count: connectors.length },
    };
  } catch (error) {
    return {
      agentType: 'connector',
      query,
      results: [],
      confidence: 0,
      metadata: { error: String(error) },
    };
  }
}

export async function executeMultiAgentQuery(query: string): Promise<MultiAgentQueryResult> {
  const startTime = Date.now();
  const agents = identifyRelevantAgents(query);

  const agentExecutors: Record<AgentType, (q: string) => Promise<AgentResult>> = {
    wiring: executeWiringAgent,
    drawing: executeDrawingAgent,
    equipment: executeEquipmentAgent,
    system: executeSystemAgent,
    trainline: executeTrainlineAgent,
    connector: executeConnectorAgent,
  };

  const agentResults: AgentResult[] = await Promise.all(
    agents.map(agent => agentExecutors[agent](query))
  );

  const consolidated = {
    wires: agentResults.find(r => r.agentType === 'wiring')?.results || [],
    drawings: agentResults.find(r => r.agentType === 'drawing')?.results || [],
    equipment: agentResults.find(r => r.agentType === 'equipment')?.results || [],
    connectors: agentResults.find(r => r.agentType === 'connector')?.results || [],
    trainlines: agentResults.find(r => r.agentType === 'trainline')?.results || [],
  };

  return {
    query,
    agentResults,
    consolidatedResults: consolidated,
    executionTime: Date.now() - startTime,
  };
}

export async function traceWirePath(wireNo: string): Promise<{
  wire: unknown;
  endpoints: unknown[];
  relatedDrawings: string[];
  path: { from: string; to: string }[];
}> {
  const wire = await prisma.wire.findUnique({
    where: { wireNo },
    include: {
      endpoints: {
        include: {
          device: true,
          connector: true,
          pin: true,
        },
      },
    },
  });

  if (!wire) {
    throw new Error('Wire not found');
  }

  const relatedDrawings: string[] = [];
  wire.endpoints.forEach(endpoint => {
    if (endpoint.sourceFile) {
      relatedDrawings.push(endpoint.sourceFile);
    }
  });

  const path = wire.endpoints.map(ep => ({
    from: ep.endpointRole === 'source' ? `${ep.endpointLabel}` : '',
    to: ep.endpointRole === 'destination' ? `${ep.endpointLabel}` : '',
  })).filter(p => p.from || p.to);

  return {
    wire,
    endpoints: wire.endpoints,
    relatedDrawings,
    path,
  };
}