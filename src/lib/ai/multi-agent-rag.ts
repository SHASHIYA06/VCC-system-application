import { prisma } from '@/lib/prisma';

/**
 * Multi-Agent RAG System
 * Coordinates multiple specialized agents for comprehensive VCC system analysis
 */

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
}

export interface MultiAgentResponse {
  query: string;
  agents: AgentResponse[];
  unifiedResponse: string;
  recommendations: string[];
  executionTime: number;
}

/**
 * Drawing Expert Agent
 * Specializes in drawing analysis, schematic interpretation, and document relationships
 */
async function drawingExpertAgent(query: string): Promise<AgentResponse> {
  const startTime = Date.now();
  try {
    const openai = await getOpenAIClient();

    // Search relevant drawings
    const drawings = await prisma.drawing.findMany({
      where: {
        OR: [
          { drawingNo: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { system: true, connectors: true, wires: true },
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
    });

    return {
      agent: 'DrawingExpert',
      query,
      response: response.choices[0]?.message?.content || 'No response',
      confidence: 0.95,
      sources: drawings.map(d => d.drawingNo),
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Drawing Expert Agent Error:', error);
    return {
      agent: 'DrawingExpert',
      query,
      response: 'Error analyzing drawings',
      confidence: 0,
      sources: [],
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Wire Expert Agent
 * Specializes in wire tracing, signal analysis, and connectivity verification
 */
async function wireExpertAgent(query: string): Promise<AgentResponse> {
  const startTime = Date.now();
  try {
    const openai = await getOpenAIClient();

    // Search relevant wires
    const wires = await prisma.wire.findMany({
      where: {
        OR: [
          { wireNo: { contains: query, mode: 'insensitive' } },
          { signalName: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { endpoints: { include: { device: true, connector: true } } },
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
    });

    return {
      agent: 'WireExpert',
      query,
      response: response.choices[0]?.message?.content || 'No response',
      confidence: 0.92,
      sources: wires.map(w => w.wireNo),
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Wire Expert Agent Error:', error);
    return {
      agent: 'WireExpert',
      query,
      response: 'Error analyzing wires',
      confidence: 0,
      sources: [],
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * System Expert Agent
 * Specializes in system architecture, subsystem relationships, and integration
 */
async function systemExpertAgent(query: string): Promise<AgentResponse> {
  const startTime = Date.now();
  try {
    const openai = await getOpenAIClient();

    // Get system information
    const systems = await prisma.system.findMany({
      where: {
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { devices: true, drawings: true },
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
    });

    return {
      agent: 'SystemExpert',
      query,
      response: response.choices[0]?.message?.content || 'No response',
      confidence: 0.90,
      sources: systems.map(s => s.code),
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('System Expert Agent Error:', error);
    return {
      agent: 'SystemExpert',
      query,
      response: 'Error analyzing systems',
      confidence: 0,
      sources: [],
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Device Expert Agent
 * Specializes in equipment, connectors, and device specifications
 */
async function deviceExpertAgent(query: string): Promise<AgentResponse> {
  const startTime = Date.now();
  try {
    const openai = await getOpenAIClient();

    // Search devices and connectors
    const devices = await prisma.device.findMany({
      where: {
        OR: [
          { tagNo: { contains: query, mode: 'insensitive' } },
          { deviceName: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: { system: true, wireEndpoints: true },
      take: 5,
    });

    const connectors = await prisma.connector.findMany({
      where: { connectorCode: { contains: query, mode: 'insensitive' } },
      include: { drawing: true, pins: true },
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
    });

    return {
      agent: 'DeviceExpert',
      query,
      response: response.choices[0]?.message?.content || 'No response',
      confidence: 0.88,
      sources: [...devices.map(d => d.tagNo || d.deviceName), ...connectors.map(c => c.connectorCode)],
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Device Expert Agent Error:', error);
    return {
      agent: 'DeviceExpert',
      query,
      response: 'Error analyzing devices',
      confidence: 0,
      sources: [],
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Diagnostic Expert Agent
 * Specializes in fault detection, system health, and troubleshooting
 */
async function diagnosticExpertAgent(query: string): Promise<AgentResponse> {
  const startTime = Date.now();
  try {
    const openai = await getOpenAIClient();

    // Check for wires with incomplete connections (potential issues)
    const allWires = await prisma.wire.findMany({
      include: { endpoints: true },
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
    });

    return {
      agent: 'DiagnosticExpert',
      query,
      response: response.choices[0]?.message?.content || 'No response',
      confidence: 0.85,
      sources: ['diagnostic_analysis'],
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Diagnostic Expert Agent Error:', error);
    return {
      agent: 'DiagnosticExpert',
      query,
      response: 'Error performing diagnostics',
      confidence: 0,
      sources: [],
      executionTime: Date.now() - startTime,
    };
  }
}

/**
 * Unified Coordinator Agent
 * Synthesizes responses from all specialist agents into a comprehensive answer
 */
async function unifiedCoordinator(
  query: string,
  agentResponses: AgentResponse[]
): Promise<string> {
  try {
    const openai = await getOpenAIClient();

    const synthesisPrompt = `
You are the VCC system coordinator. Synthesize the following expert opinions into a clear, comprehensive answer.

Query: ${query}

Expert Responses:
${agentResponses
  .map(
    (r) => `
${r.agent} (Confidence: ${r.confidence}):
${r.response}

Sources: ${r.sources.join(', ')}
`
  )
  .join('\n')}

Provide a unified, coherent response that:
1. Integrates insights from all experts
2. Identifies agreements and conflicts
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
    });

    return response.choices[0]?.message?.content || 'Unable to synthesize response';
  } catch (error) {
    console.error('Coordinator Error:', error);
    return 'Error synthesizing responses';
  }
}

/**
 * Execute multi-agent RAG query
 */
export async function executeMultiAgentQuery(query: string): Promise<MultiAgentResponse> {
  const startTime = Date.now();

  try {
    // Execute all agents in parallel
    const [drawingResponse, wireResponse, systemResponse, deviceResponse, diagnosticResponse] = await Promise.all(
      [
        drawingExpertAgent(query),
        wireExpertAgent(query),
        systemExpertAgent(query),
        deviceExpertAgent(query),
        diagnosticExpertAgent(query),
      ]
    );

    const agents = [drawingResponse, wireResponse, systemResponse, deviceResponse, diagnosticResponse];

    // Synthesize unified response
    const unifiedResponse = await unifiedCoordinator(query, agents);

    // Generate recommendations
    const recommendations = agents
      .filter(a => a.confidence > 0.7)
      .flatMap(a => a.response.split('.').filter(s => s.trim().length > 20))
      .slice(0, 5);

    return {
      query,
      agents,
      unifiedResponse,
      recommendations,
      executionTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error('Multi-Agent Query Error:', error);
    return {
      query,
      agents: [],
      unifiedResponse: 'Error executing multi-agent query',
      recommendations: [],
      executionTime: Date.now() - startTime,
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
