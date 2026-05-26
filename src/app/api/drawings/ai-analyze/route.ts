import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { multiAgentRAG } from '@/lib/rag/multiagent';
import { callLLMWithFallback } from '@/lib/llm';

/**
 * POST /api/drawings/ai-analyze
 * 
 * Multi-agent RAG analysis for a specific drawing.
 * Connects drawing numbers to full AI intelligence via LangChain-style chain.
 * 
 * MCP-compatible endpoint — can be called by MCP tools.
 * 
 * Body: { drawingNo: string, query?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { drawingNo, query } = body;

    if (!drawingNo) {
      return NextResponse.json({ error: 'drawingNo is required' }, { status: 400 });
    }

    const startTime = Date.now();

    // ── Step 1: Fetch Drawing from DB ────────────────────────────────────
    const drawing = await prisma.drawing.findFirst({
      where: {
        OR: [
          { drawingNo: { equals: drawingNo } },
          { drawingNo: { contains: drawingNo.replace(/-/g, '') } },
          { drawingNo: { contains: drawingNo } },
        ],
      },
      include: {
        system: true,
        connectors: {
          take: 30,
          include: {
            pins: { take: 20 },
            _count: { select: { pins: true } },
          },
          orderBy: { connectorCode: 'asc' },
        },
        trainLines: {
          take: 50,
          orderBy: { wireNo: 'asc' },
        },
        devices: {
          take: 20,
          include: { system: true },
        },
        circuits: { take: 20 },
        _count: {
          select: {
            connectors: true,
            trainLines: true,
            devices: true,
            circuits: true,
          },
        },
      },
    });

    if (!drawing) {
      return NextResponse.json({
        error: `Drawing ${drawingNo} not found`,
        suggestions: await getSuggestedDrawings(drawingNo),
      }, { status: 404 });
    }

    // ── Step 2: Run Multi-Agent RAG ──────────────────────────────────────
    const ragQuery = query || `Analyze drawing ${drawing.drawingNo}: ${drawing.title}`;
    
    const ragTask = {
      taskId: `drawing-ai-${Date.now()}`,
      taskType: 'search_drawing' as const,
      query: ragQuery,
      context: {
        drawingNo: drawing.drawingNo,
        systemCode: drawing.system?.code,
        title: drawing.title,
      },
    };

    const [ragResult, wireAnalysis] = await Promise.all([
      multiAgentRAG.executeMultiAgent(ragTask),
      analyzeConnectedWires(drawing),
    ]);

    // ── Step 3: LLM Summary ──────────────────────────────────────────────
    const systemPrompt = `You are an expert VCC (Vehicle Control Circuit) analyst for KMRCL RS3R Metro trains.
Analyze the drawing and provide a concise technical summary including:
1. Drawing purpose and system role
2. Key connectors and their function
3. Important wires and signals
4. Related systems/drawings
5. Any notable circuit paths`;

    const llmPrompt = `Analyze Drawing ${drawing.drawingNo}: ${drawing.title}

System: ${drawing.system?.code} - ${drawing.system?.name}
Revision: ${drawing.revision}

Connectors (${drawing._count.connectors}):
${drawing.connectors.slice(0, 10).map(c => 
  `- ${c.connectorCode}: ${c._count.pins} pins`
).join('\n')}

Trainlines (${drawing._count.trainLines}):
${drawing.trainLines.slice(0, 10).map(t =>
  `- Wire ${t.wireNo}: ${t.itemName} (${t.lineGroup})`
).join('\n')}

Equipment (${drawing._count.devices}):
${drawing.devices.slice(0, 5).map(d =>
  `- ${d.tagNo || d.deviceName}: ${d.deviceName}`
).join('\n')}

RAG Agent Findings:
${ragResult.unifiedResponse || ragResult.primaryResponse.content}

${query ? `User Question: ${query}` : ''}

Provide a structured technical analysis.`;

    const llmResult = await callLLMWithFallback(llmPrompt, {
      system: systemPrompt,
      temperature: 0.2,
      maxTokens: 2000,
    });

    const executionTime = Date.now() - startTime;

    // ── Step 4: Return Complete Analysis ─────────────────────────────────
    return NextResponse.json({
      drawing: {
        id: drawing.id,
        drawingNo: drawing.drawingNo,
        title: drawing.title,
        revision: drawing.revision,
        system: drawing.system ? {
          code: drawing.system.code,
          name: drawing.system.name,
          category: drawing.system.category,
        } : null,
        stats: drawing._count,
      },
      connectors: drawing.connectors.map(c => ({
        code: c.connectorCode,
        description: c.description,
        pinCount: c._count.pins,
        scope: c.scope,
        carType: c.carType,
        samplePins: c.pins.slice(0, 5).map(p => ({
          pinNo: p.pinNo,
          wireNo: p.wireNo,
          signalName: p.signalName,
        })),
      })),
      trainlines: drawing.trainLines.slice(0, 20).map(t => ({
        wireNo: t.wireNo,
        itemName: t.itemName,
        lineGroup: t.lineGroup,
        carType: t.carType,
      })),
      equipment: drawing.devices.slice(0, 10).map(d => ({
        tagNo: d.tagNo,
        deviceName: d.deviceName,
        deviceType: d.deviceType,
        carType: d.carType,
      })),
      wireAnalysis,
      ragAnalysis: {
        unifiedResponse: ragResult.unifiedResponse,
        primaryContent: ragResult.primaryResponse.content,
        agentCount: 1 + (ragResult.supportingResponses?.length || 0),
        executionTime: ragResult.executionTime,
      },
      aiSummary: llmResult.content || ragResult.unifiedResponse,
      executionTime,
      mcpMetadata: {
        tool: 'drawing_intelligence',
        version: '2.0',
        agentsUsed: ['drawing-agent', 'wire-agent', 'connector-agent', 'equipment-agent', 'trainline-agent'],
        ragEnabled: true,
        llmProvider: llmResult.model || 'fallback',
      },
    });

  } catch (error) {
    console.error('Drawing AI analysis error:', error);
    return NextResponse.json(
      { error: 'AI analysis failed', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/drawings/ai-analyze?drawing_no=942-38309
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const drawingNo = searchParams.get('drawing_no');
  const query = searchParams.get('query');

  if (!drawingNo) {
    return NextResponse.json({ error: 'drawing_no query param required' }, { status: 400 });
  }

  return POST(new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ drawingNo, query }),
  }) as NextRequest);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

async function analyzeConnectedWires(drawing: unknown): Promise<{
  totalWires: number;
  wires: Array<{ wireNo: string; signalName: string | null; connections: number }>;
  trainlineGroups: Record<string, string[]>;
}> {
  try {
    // Get all wire numbers from trainlines
    const wireNos = [...new Set(drawing.trainLines.map((t: unknown) => t.wireNo).filter(Boolean))];
    
    // Get all wire numbers from connector pins
    const pinWireNos = [...new Set(
      drawing.connectors.flatMap((c: unknown) => c.pins.map((p: unknown) => p.wireNo)).filter(Boolean)
    )];
    
    const allWireNos = [...new Set([...wireNos, ...pinWireNos])];
    
    const wires = await prisma.wire.findMany({
      where: { wireNo: { in: allWireNos as string[] } },
      include: {
        _count: { select: { endpoints: true } },
      },
      take: 50,
    });

    // Group trainlines by line group
    const trainlineGroups: Record<string, string[]> = {};
    for (const tl of drawing.trainLines) {
      if (!trainlineGroups[tl.lineGroup]) trainlineGroups[tl.lineGroup] = [];
      trainlineGroups[tl.lineGroup].push(tl.wireNo || tl.itemName);
    }

    return {
      totalWires: allWireNos.length,
      wires: wires.map(w => ({
        wireNo: w.wireNo,
        signalName: w.signalName,
        connections: w._count.endpoints,
      })),
      trainlineGroups,
    };
  } catch {
    return { totalWires: 0, wires: [], trainlineGroups: {} };
  }
}

async function getSuggestedDrawings(drawingNo: string): Promise<string[]> {
  try {
    const numericPart = drawingNo.replace(/[^0-9]/g, '');
    const drawings = await prisma.drawing.findMany({
      where: {
        OR: [
          { drawingNo: { contains: numericPart } },
          { drawingNo: { startsWith: '942-' } },
        ],
      },
      take: 5,
      select: { drawingNo: true },
      orderBy: { drawingNo: 'asc' },
    });
    return drawings.map(d => d.drawingNo);
  } catch {
    return [];
  }
}
