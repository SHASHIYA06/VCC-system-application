import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { multiAgentRAG } from '@/lib/rag/multiagent';
import { callLLM, getAvailableProviders, LLMResponse } from '@/lib/llm';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const wireNo = searchParams.get('wire_no');
  const systemCode = searchParams.get('system_code');
  const drawingNo = searchParams.get('drawing_no');

  try {
    if (action === 'status') {
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
    const { action, query, wireNo, systemCode, taskType, context } = body;

    if (action === 'query' && query) {
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
      const task = {
        taskId: `multi-${Date.now()}`,
        taskType: taskType || 'unified_search',
        query,
        context: context || {},
      };
      const result = await multiAgentRAG.executeMultiAgent(task);
      return NextResponse.json(result);
    }

    if (action === 'llm') {
      const { prompt, system, provider, model } = body;
      if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
      }
      const result = await callLLM(prompt, { system, provider, model });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('RAG POST error:', error);
    return NextResponse.json({ error: 'RAG operation failed' }, { status: 500 });
  }
}

async function generateSystemTree() {
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