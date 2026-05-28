/**
 * RAG Pipeline for Multi-Agent System
 * Handles document retrieval and AI-powered query processing
 */

import { createChatModel, getAgentPrompt, createMultiAgentModels } from './langchain-setup';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { prisma } from '@/lib/prisma';

export interface RAGQuery {
  query: string;
  taskType?: 'drawing' | 'wire' | 'system' | 'diagnostic' | 'unified_search';
  context?: Record<string, any>;
  model?: string;
  temperature?: number;
  useMultiAgent?: boolean;
}

export interface RAGResponse {
  query: string;
  response: string;
  sources: Array<{
    type: string;
    id: string;
    title: string;
    relevance: number;
  }>;
  confidence: number;
  model: string;
  executionTime: number;
}

export interface MultiAgentResponse {
  query: string;
  primaryResponse: {
    agent: string;
    content: string;
    confidence: number;
  };
  allResponses: Record<string, string>;
  unifiedResponse: string;
  sources: Array<{
    type: string;
    id: string;
    title: string;
  }>;
  executionTime: number;
}

/**
 * Retrieve relevant documents from database based on query
 */
async function retrieveRelevantDocuments(query: string, taskType?: string) {
  const lowerQuery = query.toLowerCase();
  const sources: Array<{ type: string; id: string; title: string; data: any }> = [];

  // Extract potential wire numbers (e.g., 3001, Y4181, etc.)
  const wirePattern = /\b[A-Z]?\d{3,5}[a-z]?\b/gi;
  const wireMatches = query.match(wirePattern);

  // Extract potential drawing numbers (e.g., 942-58120)
  const drawingPattern = /\b\d{3}-\d{5}[A-Z]?\b/gi;
  const drawingMatches = query.match(drawingPattern);

  // Search for wires if wire numbers detected or taskType is wire
  if (wireMatches || taskType === 'wire') {
    const wires = await prisma.wire.findMany({
      where: wireMatches ? {
        OR: wireMatches.map(w => ({
          wireNo: { contains: w, mode: 'insensitive' as const },
        })),
      } : {
        OR: [
          { signalName: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
        ],
      },
      take: 10,
      include: {
        drawings: {
          include: {
            drawing: {
              select: {
                drawingNo: true,
                title: true,
              },
            },
          },
        },
      },
    });

    wires.forEach(wire => {
      sources.push({
        type: 'wire',
        id: wire.id,
        title: `Wire ${wire.wireNo}`,
        data: wire,
      });
    });
  }

  // Search for drawings
  if (drawingMatches || taskType === 'drawing') {
    const drawings = await prisma.drawing.findMany({
      where: drawingMatches ? {
        OR: drawingMatches.map(d => ({
          drawingNo: { contains: d, mode: 'insensitive' as const },
        })),
      } : {
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { remarks: { contains: query, mode: 'insensitive' as const } },
        ],
      },
      take: 10,
      include: {
        system: true,
        connectors: {
          take: 5,
        },
      },
    });

    drawings.forEach(drawing => {
      sources.push({
        type: 'drawing',
        id: drawing.id,
        title: `Drawing ${drawing.drawingNo}`,
        data: drawing,
      });
    });
  }

  // Search for systems
  if (taskType === 'system' || lowerQuery.includes('system')) {
    const systems = await prisma.system.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { code: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
        ],
      },
      take: 5,
      include: {
        _count: {
          select: {
            drawings: true,
            devices: true,
          },
        },
      },
    });

    systems.forEach(system => {
      sources.push({
        type: 'system',
        id: system.id,
        title: `System ${system.code}`,
        data: system,
      });
    });
  }

  // Search for connectors
  if (lowerQuery.includes('connector') || lowerQuery.includes('pin')) {
    const connectors = await prisma.connector.findMany({
      where: {
        OR: [
          { connectorCode: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
        ],
      },
      take: 10,
      include: {
        drawing: {
          select: {
            drawingNo: true,
            title: true,
          },
        },
        pins: {
          take: 10,
        },
      },
    });

    connectors.forEach(connector => {
      sources.push({
        type: 'connector',
        id: connector.id,
        title: `Connector ${connector.connectorCode}`,
        data: connector,
      });
    });
  }

  return sources;
}

/**
 * Execute single-agent RAG query
 */
export async function executeRAGQuery(query: RAGQuery): Promise<RAGResponse> {
  const startTime = Date.now();
  const modelKey = query.model || 'openrouter-claude';
  
  try {
    // Retrieve relevant documents
    const sources = await retrieveRelevantDocuments(query.query, query.taskType);

    // Build context from sources
    const contextText = sources.map(source => {
      return `[${source.type.toUpperCase()}] ${source.title}:\n${JSON.stringify(source.data, null, 2)}`;
    }).join('\n\n');

    // Determine agent role based on task type
    const agentRole = query.taskType === 'drawing' ? 'drawing_expert' :
                      query.taskType === 'wire' ? 'wire_expert' :
                      query.taskType === 'system' ? 'system_expert' :
                      query.taskType === 'diagnostic' ? 'diagnostic_expert' :
                      'unified_coordinator';

    const systemPrompt = getAgentPrompt(agentRole);

    // Create chat model
    const model = createChatModel(modelKey);

    // Build messages
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(`Context:\n${contextText}\n\nQuery: ${query.query}\n\nProvide a detailed, accurate response based on the context provided.`),
    ];

    // Get response from AI
    const response = await model.invoke(messages);

    const executionTime = Date.now() - startTime;

    return {
      query: query.query,
      response: response.content as string,
      sources: sources.map(s => ({
        type: s.type,
        id: s.id,
        title: s.title,
        relevance: 0.8, // Placeholder
      })),
      confidence: 0.85, // Placeholder
      model: modelKey,
      executionTime,
    };
  } catch (error) {
    console.error('Error in RAG query:', error);
    throw error;
  }
}

/**
 * Execute multi-agent RAG query
 */
export async function executeMultiAgentQuery(query: RAGQuery): Promise<MultiAgentResponse> {
  const startTime = Date.now();
  
  try {
    // Retrieve relevant documents
    const sources = await retrieveRelevantDocuments(query.query, query.taskType);

    // Build context from sources
    const contextText = sources.map(source => {
      return `[${source.type.toUpperCase()}] ${source.title}:\n${JSON.stringify(source.data, null, 2)}`;
    }).join('\n\n');

    // Create multiple agent models
    const models = createMultiAgentModels();
    const agentRoles: Array<keyof typeof import('./langchain-setup').AGENT_PROMPTS> = [
      'drawing_expert',
      'wire_expert',
      'system_expert',
      'diagnostic_expert',
    ];

    // Query each agent in parallel
    const agentPromises = agentRoles.map(async (role) => {
      const modelKey = Object.keys(models)[0]; // Use first available model
      if (!models[modelKey]) return null;

      const systemPrompt = getAgentPrompt(role);
      const messages = [
        new SystemMessage(systemPrompt),
        new HumanMessage(`Context:\n${contextText}\n\nQuery: ${query.query}\n\nProvide your specialized analysis.`),
      ];

      const response = await models[modelKey].invoke(messages);
      return {
        role,
        content: response.content as string,
      };
    });

    const agentResponses = await Promise.all(agentPromises);
    const validResponses = agentResponses.filter(r => r !== null);

    // Combine responses
    const allResponses: Record<string, string> = {};
    validResponses.forEach(r => {
      if (r) allResponses[r.role] = r.content;
    });

    // Use coordinator to synthesize
    const coordinatorModel = Object.values(models)[0];
    const coordinatorPrompt = getAgentPrompt('unified_coordinator');
    
    const synthesisMessages = [
      new SystemMessage(coordinatorPrompt),
      new HumanMessage(`Original Query: ${query.query}\n\nAgent Responses:\n${JSON.stringify(allResponses, null, 2)}\n\nSynthesize a unified, comprehensive response.`),
    ];

    const unifiedResponse = await coordinatorModel.invoke(synthesisMessages);

    const executionTime = Date.now() - startTime;

    return {
      query: query.query,
      primaryResponse: {
        agent: validResponses[0]?.role || 'unknown',
        content: validResponses[0]?.content || '',
        confidence: 0.85,
      },
      allResponses,
      unifiedResponse: unifiedResponse.content as string,
      sources: sources.map(s => ({
        type: s.type,
        id: s.id,
        title: s.title,
      })),
      executionTime,
    };
  } catch (error) {
    console.error('Error in multi-agent query:', error);
    throw error;
  }
}
