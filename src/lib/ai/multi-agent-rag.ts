import { prisma } from '@/lib/prisma';

/**
 * Multi-Agent RAG System with Circuit Breaker and Graceful Degradation
 * Coordinates multiple specialized agents for comprehensive VCC system analysis
 */

// Circuit breaker pattern for reliability
interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_RESET_TIME = 60000; // 60 seconds
const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds per agent

const circuitBreakers: Map<string, CircuitBreakerState> = new Map();

function getCircuitBreaker(agentId: string): CircuitBreakerState {
  if (!circuitBreakers.has(agentId)) {
    circuitBreakers.set(agentId, {
      failures: 0,
      lastFailureTime: 0,
      isOpen: false,
    });
  }
  return circuitBreakers.get(agentId)!;
}

function checkCircuitBreaker(agentId: string): boolean {
  const cb = getCircuitBreaker(agentId);
  const now = Date.now();

  if (cb.isOpen) {
    if (now - cb.lastFailureTime > CIRCUIT_BREAKER_RESET_TIME) {
      // Half-open state - attempt recovery
      cb.failures = 0;
      cb.isOpen = false;
      return true;
    }
    return false;
  }
  return true;
}

function recordSuccess(agentId: string): void {
  const cb = getCircuitBreaker(agentId);
  cb.failures = 0;
  cb.isOpen = false;
}

function recordFailure(agentId: string): void {
  const cb = getCircuitBreaker(agentId);
  cb.failures++;
  cb.lastFailureTime = Date.now();

  if (cb.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    cb.isOpen = true;
    console.warn(`⚠️  Circuit breaker opened for agent: ${agentId}`);
  }
}

// Lazy initialize OpenAI client - IMPORTANT: DO NOT import OpenAI at module level
let openaiClient: any = null;

async function getOpenAIClient(): Promise<any> {
  if (!openaiClient) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    // Import OpenAI only when needed at runtime
    const { OpenAI } = await import('openai');
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: CIRCUIT_BREAKER_TIMEOUT,
    });
  }
  return openaiClient;
}

export interface AgentResponse {
  agent: string;
  query: string;
  response: string;
  confidence: number;
  sources: string[];
  executionTime: number;
  error?: string;
}

export interface MultiAgentResponse {
  query: string;
  agents: AgentResponse[];
  unifiedResponse: string;
  recommendations: string[];
  executionTime: number;
  degradedMode?: boolean;
}

/**
 * Drawing Expert Agent
 * Specializes in drawing analysis, schematic interpretation, and document relationships
 */
async function drawingExpertAgent(query: string): Promise<AgentResponse> {
  const agentId = 'DrawingExpert';
  const startTime = Date.now();

  try {
    if (!checkCircuitBreaker(agentId)) {
      throw new Error('Circuit breaker is open - agent temporarily unavailable');
    }

    const openai = await getOpenAIClient();

    // Search relevant drawings
    const drawings = await prisma.drawing.findMany({
      where: {
        OR: [
          { drawingNo: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { system: true, connectors: { take: 5 }, wires: { take: 5 } },
      take: 5,
    });

    const context = drawings
      .map(d => `Drawing ${d.drawingNo}: ${d.title} (System: ${d.system?.code})`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a VCC train drawing expert. Provide analysis of schematic drawings, circuits, and documentation.',
        },
        {
          role: 'user',
          content: `Context of drawings:\n${context}\n\nQuery: ${query}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      timeout: CIRCUIT_BREAKER_TIMEOUT,
    });

    recordSuccess(agentId);

    return {
      agent: agentId,
      query,
      response: response.choices[0]?.message?.content || 'No response',
      confidence: 0.95,
      sources: drawings.map(d => d.drawingNo),
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    recordFailure(agentId);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Drawing Expert Agent Error: ${errorMsg}`);

    return {
      agent: agentId,
      query,
      response: `Error analyzing drawings: ${errorMsg}`,
      confidence: 0,
      sources: [],
      executionTime: Date.now() - startTime,
      error: errorMsg,
    };
  }
}

/**
 * Wire Expert Agent
 * Specializes in wire tracing, signal analysis, and connectivity verification
 */
async function wireExpertAgent(query: string): Promise<AgentResponse> {
  const agentId = 'WireExpert';
  const startTime = Date.now();

  try {
    if (!checkCircuitBreaker(agentId)) {
      throw new Error('Circuit breaker is open - agent temporarily unavailable');
    }

    const openai = await getOpenAIClient();

    // Search relevant wires
    const wires = await prisma.wire.findMany({
      where: {
        OR: [
          { wireNo: { contains: query, mode: 'insensitive' } },
          { signalName: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { endpoints: { include: { device: true, connector: true }, take: 10 } },
      take: 5,

    });

    const context = wires
      .map(w => `Wire ${w.wireNo}: ${w.signalName || 'No signal'} (Endpoints: ${w.endpoints.length})`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a VCC wiring expert. Analyze wire connections, signal flows, and connectivity issues.',
        },
        {
          role: 'user',
          content: `Context of wires:\n${context}\n\nQuery: ${query}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      timeout: CIRCUIT_BREAKER_TIMEOUT,
    });

    recordSuccess(agentId);

    return {
      agent: agentId,
      query,
      response: response.choices[0]?.message?.content || 'No response',
      confidence: 0.92,
      sources: wires.map(w => w.wireNo),
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    recordFailure(agentId);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Wire Expert Agent Error: ${errorMsg}`);

    return {
      agent: agentId,
      query,
      response: `Error analyzing wires: ${errorMsg}`,
      confidence: 0,
      sources: [],
      executionTime: Date.now() - startTime,
      error: errorMsg,
    };
  }
}

/**
 * System Expert Agent
 * Specializes in system architecture, subsystem relationships, and integration
 */
async function systemExpertAgent(query: string): Promise<AgentResponse> {
  const agentId = 'SystemExpert';
  const startTime = Date.now();

  try {
    if (!checkCircuitBreaker(agentId)) {
      throw new Error('Circuit breaker is open - agent temporarily unavailable');
    }

    const openai = await getOpenAIClient();

    // Get system information
    const systems = await prisma.system.findMany({
      where: {
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { devices: { take: 10 }, drawings: { take: 10 } },
      take: 5,

    });

    const context = systems
      .map(s => `System ${s.code} (${s.name}): ${s.devices.length} devices, ${s.drawings.length} drawings`)
      .join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a VCC system architecture expert. Explain system components, interactions, and relationships.',
        },
        {
          role: 'user',
          content: `Context of systems:\n${context}\n\nQuery: ${query}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      timeout: CIRCUIT_BREAKER_TIMEOUT,
    });

    recordSuccess(agentId);

    return {
      agent: agentId,
      query,
      response: response.choices[0]?.message?.content || 'No response',
      confidence: 0.90,
      sources: systems.map(s => s.code),
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    recordFailure(agentId);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`System Expert Agent Error: ${errorMsg}`);

    return {
      agent: agentId,
      query,
      response: `Error analyzing systems: ${errorMsg}`,
      confidence: 0,
      sources: [],
      executionTime: Date.now() - startTime,
      error: errorMsg,
    };
  }
}

/**
 * Device Expert Agent
 * Specializes in equipment, connectors, and device specifications
 */
async function deviceExpertAgent(query: string): Promise<AgentResponse> {
  const agentId = 'DeviceExpert';
  const startTime = Date.now();

  try {
    if (!checkCircuitBreaker(agentId)) {
      throw new Error('Circuit breaker is open - agent temporarily unavailable');
    }

    const openai = await getOpenAIClient();

    // Search devices and connectors
    const devices = await prisma.device.findMany({
      where: {
        OR: [
          { tagNo: { contains: query, mode: 'insensitive' } },
          { deviceName: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { system: true, wireEndpoints: { take: 10 } },
      take: 5,

    });

    const connectors = await prisma.connector.findMany({
      where: { connectorCode: { contains: query, mode: 'insensitive' } },
      include: { drawing: true, pins: { take: 10 } },
      take: 5,

    });

    const context = [
      ...devices.map(d => `Device ${d.tagNo} (${d.deviceName}): ${d.wireEndpoints.length} connections`),
      ...connectors.map(c => `Connector ${c.connectorCode}: ${c.pins.length} pins`),
    ].join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a VCC device expert. Analyze equipment specs, connector types, and physical connections.',
        },
        {
          role: 'user',
          content: `Context of devices:\n${context}\n\nQuery: ${query}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      timeout: CIRCUIT_BREAKER_TIMEOUT,
    });

    recordSuccess(agentId);

    return {
      agent: agentId,
      query,
      response: response.choices[0]?.message?.content || 'No response',
      confidence: 0.88,
      sources: [...devices.map(d => d.tagNo || d.deviceName), ...connectors.map(c => c.connectorCode)],
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    recordFailure(agentId);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Device Expert Agent Error: ${errorMsg}`);

    return {
      agent: agentId,
      query,
      response: `Error analyzing devices: ${errorMsg}`,
      confidence: 0,
      sources: [],
      executionTime: Date.now() - startTime,
      error: errorMsg,
    };
  }
}

/**
 * Diagnostic Expert Agent
 * Specializes in fault detection, system health, and troubleshooting
 */
async function diagnosticExpertAgent(query: string): Promise<AgentResponse> {
  const agentId = 'DiagnosticExpert';
  const startTime = Date.now();

  try {
    if (!checkCircuitBreaker(agentId)) {
      throw new Error('Circuit breaker is open - agent temporarily unavailable');
    }

    const openai = await getOpenAIClient();

    // Check for wires with incomplete connections (potential issues)
    const allWires = await prisma.wire.findMany({
      include: { endpoints: { take: 5 } },
      take: 100,

    });

    const problematicWires = allWires.filter(w => w.endpoints.length < 2);
    const incompleteConnectors = await prisma.connector.findMany({
      where: { pins: { none: {} } },
      take: 10,

    });

    const context = [
      `Problematic wires found: ${problematicWires.length}`,
      `Connectors without pins: ${incompleteConnectors.length}`,
    ].join('\n');

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a VCC diagnostic expert. Identify issues, suggest troubleshooting steps, and recommend solutions.',
        },
        {
          role: 'user',
          content: `System diagnostics:\n${context}\n\nQuery: ${query}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
      timeout: CIRCUIT_BREAKER_TIMEOUT,
    });

    recordSuccess(agentId);

    return {
      agent: agentId,
      query,
      response: response.choices[0]?.message?.content || 'No response',
      confidence: 0.85,
      sources: ['diagnostic_analysis'],
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    recordFailure(agentId);
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Diagnostic Expert Agent Error: ${errorMsg}`);

    return {
      agent: agentId,
      query,
      response: `Error performing diagnostics: ${errorMsg}`,
      confidence: 0,
      sources: [],
      executionTime: Date.now() - startTime,
      error: errorMsg,
    };
  }
}

/**
 * Unified Coordinator Agent
 * Synthesizes responses from all specialist agents into a comprehensive answer
 */
async function unifiedCoordinator(
  query: string,
  agentResponses: AgentResponse[],
  timeout: number = CIRCUIT_BREAKER_TIMEOUT
): Promise<string> {
  try {
    const openai = await getOpenAIClient();

    // Filter out failed responses for synthesis
    const validResponses = agentResponses.filter(r => !r.error && r.confidence > 0);

    if (validResponses.length === 0) {
      return `Unable to synthesize response - all agents failed. Query: "${query}"`;
    }

    const synthesisPrompt = `
You are the VCC system coordinator. Synthesize the following expert opinions into a clear, comprehensive answer.

Query: ${query}

Expert Responses:
${validResponses
  .map(
    (r) => `
${r.agent} (Confidence: ${r.confidence}):
${r.response}

Sources: ${r.sources.join(', ')}
`
  )
  .join('\n')}

Provide a unified, coherent response that:
1. Integrates insights from available experts
2. Identifies agreements and conflicts when present
3. Provides clear recommendations
4. Highlights any concerns or issues
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a comprehensive VCC system analyst. Synthesize information from multiple experts into actionable insights.',
        },
        {
          role: 'user',
          content: synthesisPrompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      timeout,
    });

    return response.choices[0]?.message?.content || 'Unable to synthesize response';
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Coordinator Error: ${errorMsg}`);
    return `Coordination failed: ${errorMsg}. Please review individual agent responses above.`;
  }
}

/**
 * Execute multi-agent RAG query with graceful degradation
 */
export async function executeMultiAgentQuery(query: string): Promise<MultiAgentResponse> {
  const startTime = Date.now();

  try {
    // Execute all agents in parallel with timeout protection
    const agentPromises = [
      Promise.race([
        drawingExpertAgent(query),
        new Promise<AgentResponse>((_resolve, reject) =>
          setTimeout(() => reject(new Error('Drawing agent timeout')), CIRCUIT_BREAKER_TIMEOUT + 5000)
        ),
      ]).catch((error) => ({
        agent: 'DrawingExpert',
        query,
        response: `Timeout: ${error.message}`,
        confidence: 0,
        sources: [],
        executionTime: CIRCUIT_BREAKER_TIMEOUT,
        error: error.message,
      })),

      Promise.race([
        wireExpertAgent(query),
        new Promise<AgentResponse>((_resolve, reject) =>
          setTimeout(() => reject(new Error('Wire agent timeout')), CIRCUIT_BREAKER_TIMEOUT + 5000)
        ),
      ]).catch((error) => ({
        agent: 'WireExpert',
        query,
        response: `Timeout: ${error.message}`,
        confidence: 0,
        sources: [],
        executionTime: CIRCUIT_BREAKER_TIMEOUT,
        error: error.message,
      })),

      Promise.race([
        systemExpertAgent(query),
        new Promise<AgentResponse>((_resolve, reject) =>
          setTimeout(() => reject(new Error('System agent timeout')), CIRCUIT_BREAKER_TIMEOUT + 5000)
        ),
      ]).catch((error) => ({
        agent: 'SystemExpert',
        query,
        response: `Timeout: ${error.message}`,
        confidence: 0,
        sources: [],
        executionTime: CIRCUIT_BREAKER_TIMEOUT,
        error: error.message,
      })),

      Promise.race([
        deviceExpertAgent(query),
        new Promise<AgentResponse>((_resolve, reject) =>
          setTimeout(() => reject(new Error('Device agent timeout')), CIRCUIT_BREAKER_TIMEOUT + 5000)
        ),
      ]).catch((error) => ({
        agent: 'DeviceExpert',
        query,
        response: `Timeout: ${error.message}`,
        confidence: 0,
        sources: [],
        executionTime: CIRCUIT_BREAKER_TIMEOUT,
        error: error.message,
      })),

      Promise.race([
        diagnosticExpertAgent(query),
        new Promise<AgentResponse>((_resolve, reject) =>
          setTimeout(() => reject(new Error('Diagnostic agent timeout')), CIRCUIT_BREAKER_TIMEOUT + 5000)
        ),
      ]).catch((error) => ({
        agent: 'DiagnosticExpert',
        query,
        response: `Timeout: ${error.message}`,
        confidence: 0,
        sources: [],
        executionTime: CIRCUIT_BREAKER_TIMEOUT,
        error: error.message,
      })),
    ];

    const agents = await Promise.all(agentPromises);

    // Check if we're in degraded mode (some agents failed)
    const failedAgents = agents.filter(a => a.error).length;
    const degradedMode = failedAgents > 0;

    // Synthesize unified response
    const unifiedResponse = await unifiedCoordinator(query, agents);

    // Generate recommendations from high-confidence responses
    const recommendations = agents
      .filter(a => a.confidence > 0.7 && !a.error)
      .flatMap(a => a.response.split('.').filter(s => s.trim().length > 20))
      .slice(0, 5);

    return {
      query,
      agents,
      unifiedResponse,
      recommendations,
      executionTime: Date.now() - startTime,
      degradedMode,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Multi-Agent Query Error:', errorMsg);

    return {
      query,
      agents: [],
      unifiedResponse: `Critical error: ${errorMsg}. System in fallback mode.`,
      recommendations: [],
      executionTime: Date.now() - startTime,
      degradedMode: true,
    };
  }
}

/**
 * Execute single agent query for faster responses
 */
export async function executeSingleAgentQuery(
  agentType: 'drawing' | 'wire' | 'system' | 'device' | 'diagnostic',
  query: string
): Promise<AgentResponse> {
  const agentMap = {
    drawing: drawingExpertAgent,
    wire: wireExpertAgent,
    system: systemExpertAgent,
    device: deviceExpertAgent,
    diagnostic: diagnosticExpertAgent,
  };

  return agentMap[agentType](query);
}

