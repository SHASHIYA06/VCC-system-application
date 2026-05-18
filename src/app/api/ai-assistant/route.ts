import { NextRequest, NextResponse } from 'next/server';
import { callLLM, callLLMWithFallback } from '@/lib/llm';
import { prisma } from '@/lib/prisma';

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

    const llmResponse = await callLLMWithFallback(query, {
      system: systemPrompt,
      temperature: 0.3,
      maxTokens: 2000,
      preferredProviders: ['openrouter', 'nvidia', 'gemini', 'openai'],
    });

    if (llmResponse.error) {
      return NextResponse.json({
        success: false,
        error: llmResponse.error,
        fallback: generateFallbackResponse(query, dbData),
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

function generateFallbackResponse(query: string, dbData: any): string {
  let response = `## Analysis for: ${query}\n\n`;

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

export async function GET() {
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
    availableProviders: ['openrouter', 'nvidia', 'gemini', 'openai'],
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