import { NextRequest, NextResponse } from 'next/server';

// Runtime configuration for bundle optimization
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds max for complex RAG queries

// Lazy load heavy dependencies to reduce bundle size
// import { prisma } from '@/lib/prisma';
// import { multiAgentRAG } from '@/lib/rag/multiagent';
// import { callLLM, getAvailableProviders, LLMResponse } from '@/lib/llm';
// import { Prisma } from '@prisma/client';
// import { executeLangchainTree } from '@/lib/rag/langchain-tree';
// import { executeRAGQuery, executeMultiAgentQuery } from '@/lib/ai/rag-pipeline';

// Lazy loading functions to reduce initial bundle size
async function getPrismaClient() {
  const { prisma } = await import('@/lib/prisma');
  return prisma;
}

async function getMultiAgentRAG() {
  const { multiAgentRAG } = await import('@/lib/rag/multiagent');
  return multiAgentRAG;
}

async function getLLMUtils() {
  const module = await import('@/lib/llm');
  return {
    callLLM: module.callLLM,
    getAvailableProviders: module.getAvailableProviders,
  };
}

async function getLangchainTree() {
  const { executeLangchainTree } = await import('@/lib/rag/langchain-tree');
  return executeLangchainTree;
}

async function getRAGPipeline() {
  const module = await import('@/lib/ai/rag-pipeline');
  return {
    executeRAGQuery: module.executeRAGQuery,
    executeMultiAgentQuery: module.executeMultiAgentQuery,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const wireNo = searchParams.get('wire_no');
  const systemCode = searchParams.get('system_code');
  const drawingNo = searchParams.get('drawing_no');

  try {
    if (action === 'status') {
      // Lazy load prisma client
      const prisma = await getPrismaClient();
      
      const [systemCount, deviceCount, wireCount, drawingCount, circuitCount, trainlineCount, connectorCount, pinCount] = await Promise.all([
        prisma.system.count(),
        prisma.device.count(),
        prisma.wire.count(),
        prisma.drawing.count(),
        prisma.circuit.count(),
        prisma.trainLine.count(),
        prisma.connector.count(),
        prisma.connectorPin.count(),
      ]);

      // Lazy load LLM utils
      const { getAvailableProviders } = await getLLMUtils();
      const providers = getAvailableProviders();

      return NextResponse.json({
        status: 'operational',
        database: {
          systems: systemCount,
          devices: deviceCount,
          wires: wireCount,
          drawings: drawingCount,
          circuits: circuitCount,
          trainlines: trainlineCount,
          connectors: connectorCount,
          pins: pinCount,
        },
        rag: {
          enabled: true,
          multiagent: true,
          indexed_entities: ['drawings', 'circuits', 'wires', 'trainlines', 'connectors', 'devices', 'pins'],
        },
        llm: {
          availableProviders: providers.map(p => p.name),
          totalProviders: providers.length,
        },
      });
    }

    if (action === 'query' && query) {
      // Lazy load multi-agent RAG
      const multiAgentRAG = await getMultiAgentRAG();
      
      const task = {
        taskId: `rag-${Date.now()}`,
        taskType: 'semantic_search' as const,
        query: query as string,
        context: {},
      };
      const result = await multiAgentRAG.executeTask(task);
      return NextResponse.json({
        content: result.content,
        data: result.data,
        confidence: result.confidence,
        sources: result.sources,
        agent: result.agentId,
      });
    }

    if (action === 'explain' && wireNo) {
      const multiAgentRAG = await getMultiAgentRAG();
      const task = {
        taskId: `explain-${Date.now()}`,
        taskType: 'explain_wire' as const,
        query: wireNo as string,
        context: {},
      };
      const result = await multiAgentRAG.executeTask(task);
      return NextResponse.json({
        content: result.content,
        data: result.data,
        wireNo,
      });
    }

    if (action === 'trace' && wireNo) {
      const multiAgentRAG = await getMultiAgentRAG();
      const task = {
        taskId: `trace-${Date.now()}`,
        taskType: 'trace_trainline' as const,
        query: wireNo as string,
        context: {},
      };
      const result = await multiAgentRAG.executeTask(task);
      return NextResponse.json({
        content: result.content,
        data: result.data,
        wireNo,
      });
    }

    if (action === 'system' && systemCode) {
      const multiAgentRAG = await getMultiAgentRAG();
      const task = {
        taskId: `system-${Date.now()}`,
        taskType: 'analyze_system' as const,
        query: systemCode as string,
        context: {},
      };
      const result = await multiAgentRAG.executeTask(task);
      return NextResponse.json({
        content: result.content,
        data: result.data,
        system: systemCode,
      });
    }

    if (action === 'search' && query) {
      const multiAgentRAG = await getMultiAgentRAG();
      const task = {
        taskId: `search-${Date.now()}`,
        taskType: 'unified_search' as const,
        query: query as string,
        context: {},
      };
      const result = await multiAgentRAG.executeMultiAgent(task);
      return NextResponse.json({
        primaryResponse: {
          agent: result.primaryResponse.agentId,
          content: result.primaryResponse.content,
          confidence: result.primaryResponse.confidence,
        },
        unifiedResponse: result.unifiedResponse,
        allData: result.allData,
        executionTime: result.executionTime,
      });
    }

    if (action === 'tree') {
      const tree = await generateSystemTree();
      return NextResponse.json(tree);
    }

    return NextResponse.json({
      message: 'RAG API - Use ?action=status, query, explain, trace, system, search, or tree',
      examples: {
        status: '?action=status',
        query: '?action=query&query=forward',
        explain: '?action=explain&wire_no=3003',
        trace: '?action=trace&wire_no=3003',
        system: '?action=system&system_code=TRAC',
        search: '?action=search&query=door',
        tree: '?action=tree',
      },
    });
  } catch (error) {
    console.error('RAG API error:', error);
    return NextResponse.json({ error: 'RAG operation failed', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, query, wireNo, systemCode, taskType, context, useMultiAgent, useLangChain } = body;

    // ── New LangChain RAG System (PREFERRED) ──────────────────────────────
    if (query && !action) {
      const shouldUseLangChain = useLangChain !== false; // Default to LangChain

      if (shouldUseLangChain) {
        console.log('🦜 Using Enhanced LangChain RAG System');
        
        try {
          // Lazy load the new LangChain system
          const { executeLangChainMultiAgent, executeLangChainAgent } = await import('@/lib/ai/langchain-rag');
          
          if (useMultiAgent) {
            const result = await executeLangChainMultiAgent(query);
            return NextResponse.json({
              query: result.query,
              primaryResponse: {
                agent: 'LangChainCoordinator',
                content: result.unifiedResponse,
                confidence: result.success ? 0.95 : 0.1,
              },
              unifiedResponse: result.unifiedResponse,
              allData: {
                agents: result.agents,
                langchain: true,
                system: 'enhanced',
                tools_used: result.agents.flatMap(a => a.tools_used || []),
              },
              executionTime: result.executionTime,
              success: result.success,
            });
          } else {
            // Determine best agent for single query
            const agentType = determineAgentType(query);
            const result = await executeLangChainAgent(agentType, query);
            
            return NextResponse.json({
              query: result.query,
              primaryResponse: {
                agent: result.agent,
                content: result.response,
                confidence: result.confidence,
              },
              unifiedResponse: result.response,
              allData: {
                agent: result,
                langchain: true,
                tools_used: result.tools_used,
                reasoning: result.reasoning,
              },
              executionTime: result.executionTime,
            });
          }
        } catch (langchainError) {
          console.error('LangChain system error, falling back:', langchainError);
          // Fall through to legacy system
        }
      }

      // ── Legacy Multi-Agent System (FALLBACK) ──────────────────────────────
      const task = {
        taskId: `rag-${Date.now()}`,
        taskType: taskType || 'unified_search',
        query,
        context: context || {},
      };

      if (useMultiAgent) {
        // Use new multi-agent pipeline
        try {
          const { executeMultiAgentQuery } = await getRAGPipeline();
          const result = await executeMultiAgentQuery({
            query,
            taskType: taskType || 'unified_search',
            context: context || {},
            model: body.model || 'openrouter-claude',
            temperature: body.temperature || 0.2,
            useMultiAgent: true,
          });
          return NextResponse.json(result);
        } catch (error) {
          console.error('Pipeline multi-agent error, final fallback:', error);
          // Final fallback to original implementation
          const multiAgentRAG = await getMultiAgentRAG();
          const result = await multiAgentRAG.executeMultiAgent(task);
          return NextResponse.json({
            query,
            primaryResponse: result.primaryResponse,
            supportingResponses: result.supportingResponses,
            unifiedResponse: result.unifiedResponse,
            allData: result.allData,
            executionTime: result.executionTime,
          });
        }
      } else {
        // Use new single-agent pipeline
        try {
          const { executeRAGQuery } = await getRAGPipeline();
          const result = await executeRAGQuery({
            query,
            taskType: taskType || 'unified_search',
            context: context || {},
            model: body.model || 'openrouter-claude',
            temperature: body.temperature || 0.2,
          });
          return NextResponse.json({
            query,
            primaryResponse: {
              agent: result.model,
              content: result.response,
              confidence: result.confidence,
            },
            unifiedResponse: result.response,
            supportingResponses: [],
            sources: result.sources,
            executionTime: result.executionTime,
          });
        } catch (error) {
          console.error('Pipeline single-agent error, final fallback:', error);
          // Final fallback to original implementation
          const multiAgentRAG = await getMultiAgentRAG();
          const result = await multiAgentRAG.executeTask(task);
          return NextResponse.json({
            query,
            primaryResponse: result,
            unifiedResponse: result.content,
            supportingResponses: [],
            executionTime: result.executionTime,
          });
        }
      }
    }

    // ── Legacy format: { action, query } ─────────────────────────────────
    if (action === 'query' && query) {
      const multiAgentRAG = await getMultiAgentRAG();
      const task = {
        taskId: `rag-${Date.now()}`,
        taskType: taskType || 'semantic_search',
        query,
        context: context || {},
      };
      const result = await multiAgentRAG.executeTask(task);
      return NextResponse.json(result);
    }

    if (action === 'multiagent' && query) {
      const multiAgentRAG = await getMultiAgentRAG();
      const task = {
        taskId: `multi-${Date.now()}`,
        taskType: taskType || 'unified_search',
        query,
        context: context || {},
      };
      const result = await multiAgentRAG.executeMultiAgent(task);
      return NextResponse.json(result);
    }

    if (action === 'langchain' && query) {
      const executeLangchainTree = await getLangchainTree();
      const result = await executeLangchainTree(query);
      return NextResponse.json(result);
    }

    if (action === 'llm') {
      const { prompt, system, provider, model } = body;
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
      }
      const { callLLM } = await getLLMUtils();
      const result = await callLLM(prompt, { system, provider, model });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action. Provide {query} or {action, query}.' }, { status: 400 });
  } catch (error) {
    console.error('RAG POST error:', error);
    
    let requestBody: any = {};
    try {
      requestBody = await request.json();
    } catch {
      // Request body parsing failed
    }
    
    return NextResponse.json({ 
      error: 'RAG operation failed', 
      details: String(error),
      query: requestBody?.query || 'unknown',
      primaryResponse: {
        agent: 'ErrorHandler',
        content: `System error: ${error instanceof Error ? error.message : String(error)}`,
        confidence: 0,
      },
      unifiedResponse: `I apologize, but I encountered an error while processing your query: ${error instanceof Error ? error.message : String(error)}`,
      allData: { error: true },
      executionTime: 0,
    }, { status: 500 });
  }
}

/**
 * Determine the most appropriate agent type based on query content
 */
function determineAgentType(query: string): 'drawing' | 'wire' | 'system' | 'device' | 'diagnostic' {
  const lowerQuery = query.toLowerCase();
  
  // Drawing-related keywords
  if (lowerQuery.includes('drawing') || lowerQuery.includes('schematic') || lowerQuery.includes('pdf') || /\d{3}-\d{5}/.test(lowerQuery)) {
    return 'drawing';
  }
  
  // Wire-related keywords
  if (lowerQuery.includes('wire') || lowerQuery.includes('signal') || lowerQuery.includes('connection') || lowerQuery.includes('cable')) {
    return 'wire';
  }
  
  // System-related keywords
  if (lowerQuery.includes('system') || lowerQuery.includes('trl') || lowerQuery.includes('brake') || lowerQuery.includes('cab') || lowerQuery.includes('trac')) {
    return 'system';
  }
  
  // Device-related keywords
  if (lowerQuery.includes('device') || lowerQuery.includes('equipment') || lowerQuery.includes('connector') || lowerQuery.includes('tag')) {
    return 'device';
  }
  
  // Default to diagnostic for complex queries
  return 'diagnostic';
}


async function generateSystemTree() {
  // Lazy load prisma client
  const prisma = await getPrismaClient();
  
  const systems = await prisma.system.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { drawings: true, devices: true } },
    },
  });

  const tree = await Promise.all(
    systems.map(async (system) => {
      const drawings = await prisma.drawing.findMany({
        where: { systemId: system.id },
        take: 10,
        orderBy: { drawingNo: 'asc' },
        include: {
          _count: { select: { connectors: true, trainLines: true } },
        },
      });

      const devices = await prisma.device.findMany({
        where: { systemId: system.id },
        take: 20,
        orderBy: { deviceName: 'asc' },
      });

      const connectors = await prisma.connector.findMany({
        where: { drawing: { systemId: system.id } },
        take: 30,
        orderBy: { connectorCode: 'asc' },
        include: { _count: { select: { pins: true } } },
      });

      return {
        code: system.code,
        name: system.name,
        category: system.category,
        description: system.description,
        stats: {
          drawings: system._count.drawings,
          devices: system._count.devices,
        },
        children: {
          drawings: drawings.map(d => ({
            id: d.id,
            drawingNo: d.drawingNo,
            title: d.title,
            revision: d.revision,
            sheets: d.totalSheets,
            connectors: d._count.connectors,
            trainlines: d._count.trainLines,
          })),
          devices: devices.map(d => ({
            id: d.id,
            tagNo: d.tagNo,
            deviceName: d.deviceName,
            carType: d.carType,
          })),
          connectors: connectors.slice(0, 20).map(c => ({
            id: c.id,
            connectorCode: c.connectorCode,
            type: c.connectorTypeCode,
            pins: c._count.pins,
          })),
        },
      };
    })
  );

  return {
    tree,
    metadata: {
      totalSystems: systems.length,
      generatedAt: new Date().toISOString(),
    },
  };
}