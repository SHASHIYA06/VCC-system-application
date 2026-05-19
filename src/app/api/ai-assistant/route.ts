import { NextRequest, NextResponse } from 'next/server';
import { callLLM, callLLMWithFallback, getAvailableProviders } from '@/lib/llm';
import { prisma } from '@/lib/prisma';

async function getQuickAnswer(query: string, prismaClient: any): Promise<string | null> {
  const q = query.toLowerCase().trim();
  
  if (q === 'list connectors' || q === 'show connectors' || q === 'all connectors') {
    const connectors = await prismaClient.connector.findMany({
      take: 20,
      orderBy: { connectorCode: 'asc' },
    });
    if (connectors.length > 0) {
      return `## All Connectors (${connectors.length} found)\n\n` +
        connectors.map((c: any) => 
          `- **${c.connectorCode}**: ${c.connectorTypeCode || 'N/A'} (${c.carType || 'N/A'})`
        ).join('\n');
    }
    return null;
  }
  
  if (q === 'list wires' || q === 'show wires' || q === 'all wires') {
    const wires = await prismaClient.wire.findMany({
      take: 20,
      orderBy: { wireNo: 'asc' },
    });
    if (wires.length > 0) {
      return `## All Wires (showing first 20)\n\n` +
        wires.map((w: any) => 
          `- **${w.wireNo}**: ${w.signalName || 'N/A'} (${w.voltageClass || 'N/A'})`
        ).join('\n');
    }
    return null;
  }
  
  if (q === 'list drawings' || q === 'show drawings' || q === 'all drawings') {
    const drawings = await prismaClient.drawing.findMany({
      take: 20,
      orderBy: { drawingNo: 'asc' },
    });
    if (drawings.length > 0) {
      return `## All Drawings (${drawings.length} found)\n\n` +
        drawings.map((d: any) => 
          `- **${d.drawingNo}**: ${d.title}`
        ).join('\n');
    }
    return null;
  }
  
  if (q === 'list trainlines' || q === 'show trainlines' || q === 'all trainlines') {
    const trainlines = await prismaClient.trainLine.findMany({
      take: 20,
      orderBy: { wireNo: 'asc' },
    });
    if (trainlines.length > 0) {
      return `## All Trainlines (${trainlines.length} found)\n\n` +
        trainlines.map((t: any) => 
          `- **${t.wireNo}**: ${t.itemName} (${t.lineGroup})`
        ).join('\n');
    }
    return null;
  }
  
  if (q === 'systems' || q === 'list systems' || q === 'all systems') {
    const systems = await prismaClient.system.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    if (systems.length > 0) {
      return `## VCC Systems\n\n` +
        systems.map((s: any) => 
          `- **${s.code}**: ${s.name || 'N/A'} - ${s.description?.slice(0, 50) || ''}`
        ).join('\n');
    }
    return null;
  }
  
  return null;
}

export async function GET() {
  const availableProviders = getAvailableProviders();
  
  return NextResponse.json({
    name: 'VCC Personal AI Infrastructure',
    version: '1.0.0',
    capabilities: [
      'expert_consultation',
      'circuit_analysis',
      'troubleshooting',
      'training',
      'documentation_generation',
    ],
    availableProviders: availableProviders.map(p => p.name),
    configuredProviders: availableProviders.map(p => ({
      name: p.name,
      defaultModel: p.defaultModel,
    })),
    database: {
      systems: '25+',
      drawings: '564+',
      wires: '19000+',
      circuits: '1141+',
      connectors: '400+',
      trainlines: '978+',
    },
    endpoints: {
      POST: '/api/ai-assistant - Ask AI questions about VCC system',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context, mode } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const searchContext = context || {};
    let dbData: any = {};

    if (mode === 'expert' || mode === 'all') {
      const [systems, drawings, wires, connectors, trainLines] = await Promise.all([
        prisma.system.findMany({ take: 20 }),
        prisma.drawing.findMany({ 
          where: { 
            OR: [
              { drawingNo: { contains: query } },
              { title: { contains: query, mode: 'insensitive' } }
            ]
          },
          take: 10 
        }),
        prisma.wire.findMany({
          where: {
            OR: [
              { wireNo: { contains: query } },
              { signalName: { contains: query, mode: 'insensitive' } }
            ]
          },
          take: 20,
        }),
        prisma.connector.findMany({
          where: { connectorCode: { contains: query } },
          include: { pins: true, drawing: true },
          take: 10,
        }),
        prisma.trainLine.findMany({
          where: {
            OR: [
              { wireNo: { contains: query } },
              { itemName: { contains: query, mode: 'insensitive' } }
            ]
          },
          take: 20,
        }),
      ]);

      dbData = { systems, drawings, wires, connectors, trainLines };
    }

    const quickAnswer = await getQuickAnswer(query, prisma);
    if (quickAnswer) {
      return NextResponse.json({
        success: true,
        response: quickAnswer,
        type: 'quick_answer',
        context: {
          systemsFound: dbData.systems?.length || 0,
          drawingsFound: dbData.drawings?.length || 0,
          wiresFound: dbData.wires?.length || 0,
          connectorsFound: dbData.connectors?.length || 0,
          trainLinesFound: dbData.trainLines?.length || 0,
        },
      });
    }

    const systemPrompt = `You are a VCC (Vehicle Control Circuit) Expert AI Assistant for KMRCL RS3R Metro Trains.
    
You have access to a comprehensive database containing:
- 25+ Systems (TRAC, BRAKE, TMS, DOOR, APS, VAC, TRL, CAB, COMMS, etc.)
- 564+ Drawings with pin assignments
- 19,000+ Wires with detailed specifications
- 1,100+ Circuits
- 978 Trainlines

Your role is to provide:
1. **Expert Analysis** - Detailed circuit and system explanations
2. **Troubleshooting** - Identify potential issues and solutions
3. **Training** - Explain concepts for learning purposes
4. **Documentation** - Generate clear technical references

Database context:
${JSON.stringify(dbData, null, 2)}

Provide accurate, detailed, and actionable responses. Use technical terminology appropriately.`;

    let llmResponse;
    try {
      llmResponse = await callLLMWithFallback(query, {
        system: systemPrompt,
        temperature: 0.3,
        maxTokens: 2000,
        preferredProviders: ['openrouter', 'nvidia', 'gemini', 'openai'],
      });
    } catch (llmError) {
      console.error('LLM call error:', llmError);
    }

    if (!llmResponse || llmResponse.error) {
      const fallbackResponse = generateFallbackResponse(query, dbData);
      return NextResponse.json({
        success: true,
        response: fallbackResponse,
        type: 'database_fallback',
        note: 'Showing database results (AI service unavailable)',
        context: {
          systemsFound: dbData.systems?.length || 0,
          drawingsFound: dbData.drawings?.length || 0,
          wiresFound: dbData.wires?.length || 0,
          connectorsFound: dbData.connectors?.length || 0,
          trainLinesFound: dbData.trainLines?.length || 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      response: llmResponse.content,
      model: llmResponse.model,
      context: {
        systemsFound: dbData.systems?.length || 0,
        drawingsFound: dbData.drawings?.length || 0,
        wiresFound: dbData.wires?.length || 0,
        connectorsFound: dbData.connectors?.length || 0,
        trainLinesFound: dbData.trainLines?.length || 0,
      },
      sources: extractSources(dbData),
    });

  } catch (error) {
    console.error('Personal AI error:', error);
    return NextResponse.json({ 
      error: 'AI processing failed', 
      details: String(error) 
    }, { status: 500 });
  }
}

function hasDatabaseData(dbData: any): boolean {
  return (dbData.wires?.length > 0) || 
         (dbData.drawings?.length > 0) || 
         (dbData.trainLines?.length > 0) ||
         (dbData.connectors?.length > 0) ||
         (dbData.systems?.length > 0);
}

function generateFallbackResponse(query: string, dbData: any): string {
  const hasData = hasDatabaseData(dbData);
  
  let response = `## VCC Query Results for: "${query}"\n\n`;
  
  if (!hasData) {
    response += `### Available Commands\n` +
      `- **"list connectors"** - Show all connectors\n` +
      `- **"list wires"** - Show all wires\n` +
      `- **"list drawings"** - Show all drawings\n` +
      `- **"list trainlines"** - Show all trainlines\n` +
      `- **"systems"** - Show all VCC systems\n` +
      `- **"wire ####"** - Lookup specific wire (e.g., "wire 3003")\n` +
      `- **"connector XXX"** - Lookup connector\n` +
      `- **"drawing ###-#####"** - Lookup drawing\n\n`;
    
    response += `### Database Statistics\n` +
      `- Systems: 25\n` +
      `- Drawings: 564\n` +
      `- Wires: 19,016\n` +
      `- Connectors: 413\n` +
      `- Trainlines: 978\n`;
    
    return response;
  }

  if (dbData.wires?.length > 0) {
    response += `### Matching Wires (${dbData.wires.length}):\n`;
    dbData.wires.slice(0, 5).forEach((w: any) => {
      response += `- **${w.wireNo}**: ${w.signalName || 'N/A'} (${w.voltageClass || 'N/A'})\n`;
    });
    response += '\n';
  }

  if (dbData.drawings?.length > 0) {
    response += `### Matching Drawings (${dbData.drawings.length}):\n`;
    dbData.drawings.slice(0, 5).forEach((d: any) => {
      response += `- **${d.drawingNo}**: ${d.title}\n`;
    });
    response += '\n';
  }

  if (dbData.trainLines?.length > 0) {
    response += `### Matching Trainlines (${dbData.trainLines.length}):\n`;
    dbData.trainLines.slice(0, 5).forEach((t: any) => {
      response += `- **${t.wireNo}**: ${t.itemName} (${t.lineGroup})\n`;
    });
    response += '\n';
  }

  if (dbData.connectors?.length > 0) {
    response += `### Matching Connectors (${dbData.connectors.length}):\n`;
    dbData.connectors.slice(0, 5).forEach((c: any) => {
      response += `- **${c.connectorCode}**: ${c.drawing?.drawingNo || 'N/A'} (${c.pins?.length || 0} pins)\n`;
    });
  }

  return response || `No matching data found for "${query}". Try searching with a wire number, drawing number, or system code.`;
}

function extractSources(dbData: any): Array<{ type: string; id: string; label: string }> {
  const sources: Array<{ type: string; id: string; label: string }> = [];

  dbData.wires?.forEach((w: any) => sources.push({ type: 'wire', id: w.id, label: w.wireNo }));
  dbData.drawings?.forEach((d: any) => sources.push({ type: 'drawing', id: d.id, label: d.drawingNo }));
  dbData.connectors?.forEach((c: any) => sources.push({ type: 'connector', id: c.id, label: c.connectorCode }));
  dbData.systems?.forEach((s: any) => sources.push({ type: 'system', id: s.id, label: s.code }));

  return sources.slice(0, 20);
}