import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MultiAgentOrchestrator, simpleRAGQuery } from '@/lib/rag/agents';
import { RAG_CONFIG } from '@/lib/rag/config';
import { langFlowClient } from '@/lib/rag/langflow';
import { mcpClient } from '@/lib/mcp/stitch';

/**
 * GET - Return API status and configuration
 */
export async function GET() {
  try {
    // Check database connection
    const drawingCount = await prisma.drawing.count();
    const wireCount = await prisma.wire.count();
    const connectorCount = await prisma.connector.count();
    
    // Get configured providers
    const configuredProviders = RAG_CONFIG.models.chat
      .filter(model => model.apiKey)
      .map(model => ({
        name: model.name,
        provider: model.provider,
        defaultModel: model.model,
        priority: model.priority,
      }))
      .sort((a, b) => a.priority - b.priority);
    
    return NextResponse.json({
      name: 'VCC Personal AI Infrastructure',
      version: '2.0.0',
      status: 'operational',
      features: [
        'Multi-Agent RAG System',
        'Vector Search',
        'Hybrid Retrieval',
        'Technical Analysis',
        'Wire Tracing',
        'System Navigation',
      ],
      availableProviders: ['openai', 'anthropic', 'deepseek', 'nvidia', 'google'],
      configuredProviders,
      database: {
        systems: '25+',
        drawings: drawingCount,
        wires: wireCount,
        circuits: '1141+',
        connectors: connectorCount,
        trainlines: '978+',
        status: 'connected',
      },
      rag: {
        enabled: true,
        vectorStore: 'mongodb',
        embeddingModel: RAG_CONFIG.models.embedding.model,
        chunkSize: RAG_CONFIG.chunking.maxChunkSize,
        topK: RAG_CONFIG.retrieval.topK,
      },
      endpoints: {
        POST: '/api/ai-assistant - Ask AI questions about VCC system',
      },
    });
  } catch (error) {
    console.error('API status error:', error);
    return NextResponse.json(
      {
        name: 'VCC Personal AI Infrastructure',
        version: '2.0.0',
        status: 'error',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Process AI query with RAG system
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context, mode = 'operator' } = body;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }
    
    console.log(`🤖 Processing query: "${query}" (mode: ${mode})`);
    
    // Check if RAG system is available
    const hasEmbeddingKey = !!RAG_CONFIG.models.embedding.apiKey;
    const hasChatKey = RAG_CONFIG.models.chat.some(m => m.apiKey);
    
    if (!hasEmbeddingKey || !hasChatKey) {
      // Fallback to database search
      return await fallbackDatabaseSearch(query);
    }
    
    // LangFlow execution mode
    if (mode === 'langflow') {
      try {
        const result = await langFlowClient.query(query);
        return NextResponse.json({
          success: true,
          response: result,
          model: 'langflow',
          tokens: 0,
          sources: [],
          mode,
        });
      } catch (lfError) {
        console.error('LangFlow execution failed:', lfError);
        // Fallback to RAG agents if LangFlow fails
      }
    }
    
    // Use multi-agent RAG system
    try {
      const orchestrator = new MultiAgentOrchestrator();
      const response = await orchestrator.process(query, mode);
      
      return NextResponse.json({
        success: true,
        response: response.content,
        model: response.model,
        tokens: response.tokens,
        sources: response.sources?.map(s => ({
          type: s.chunk.documentType,
          label: s.chunk.metadata.drawingNo || s.chunk.metadata.wireNo || s.chunk.metadata.connectorCode || 'Document',
          score: s.score,
        })),
        mode,
      });
    } catch (ragError) {
      console.error('RAG system error:', ragError);
      // Fallback to database search
      return await fallbackDatabaseSearch(query);
    }
  } catch (error) {
    console.error('AI Assistant API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process query',
        details: String(error),
        fallback: 'Please try a simpler query or check API configuration',
      },
      { status: 500 }
    );
  }
}

/**
 * Fallback to direct database search when RAG is unavailable
 */
async function fallbackDatabaseSearch(query: string) {
  try {
    // The raw query is a natural-language phrase (e.g. "what is wire 3003").
    // Searching the whole phrase as a substring never matches, so extract
    // meaningful tokens: alphanumeric codes, wire/drawing numbers, etc.
    const stopWords = new Set([
      'what', 'is', 'the', 'a', 'an', 'of', 'for', 'to', 'in', 'on', 'show',
      'me', 'tell', 'about', 'find', 'where', 'which', 'how', 'does', 'do',
      'and', 'or', 'with', 'this', 'that', 'are', 'list', 'all', 'wire',
      'drawing', 'connector', 'system', 'pin', 'please', 'can', 'you',
    ]);

    const tokens = query
      .toLowerCase()
      .split(/[^a-z0-9-]+/i)
      .filter(t => t.length >= 2 && !stopWords.has(t));

    // Always keep the longest tokens first (codes/numbers are most specific).
    const searchTokens = tokens.sort((a, b) => b.length - a.length).slice(0, 5);
    // Fall back to the trimmed phrase if tokenization removed everything.
    if (searchTokens.length === 0) {
      searchTokens.push(query.trim().toLowerCase());
    }

    const drawingOr = searchTokens.flatMap(t => [
      { drawingNo: { contains: t, mode: 'insensitive' as const } },
      { title: { contains: t, mode: 'insensitive' as const } },
    ]);
    const wireOr = searchTokens.flatMap(t => [
      { wireNo: { contains: t, mode: 'insensitive' as const } },
      { signalName: { contains: t, mode: 'insensitive' as const } },
    ]);
    const connectorOr = searchTokens.map(t => ({
      connectorCode: { contains: t, mode: 'insensitive' as const },
    }));

    // Search drawings
    const drawings = await prisma.drawing.findMany({
      where: { OR: drawingOr },
      include: { system: true },
      take: 5,
    });

    // Search wires
    const wires = await prisma.wire.findMany({
      where: { OR: wireOr },
      take: 5,
    });

    // Search connectors
    const connectors = await prisma.connector.findMany({
      where: { OR: connectorOr },
      include: { drawing: true },
      take: 5,
    });
    
    // Build response
    let response = `## Search Results for "${query}"\n\n`;
    
    if (drawings.length > 0) {
      response += `### Drawings (${drawings.length})\n`;
      drawings.forEach(d => {
        response += `- **${d.drawingNo}**: ${d.title}\n`;
        response += `  System: ${d.system?.name || 'N/A'}\n`;
      });
      response += '\n';
    }
    
    if (wires.length > 0) {
      response += `### Wires (${wires.length})\n`;
      wires.forEach(w => {
        response += `- **${w.wireNo}**: ${w.signalName || 'N/A'}\n`;
        response += `  ${w.description || ''}\n`;
      });
      response += '\n';
    }
    
    if (connectors.length > 0) {
      response += `### Connectors (${connectors.length})\n`;
      connectors.forEach(c => {
        response += `- **${c.connectorCode}**: ${c.description || 'N/A'}\n`;
        response += `  Drawing: ${c.drawing?.drawingNo || 'N/A'}\n`;
      });
      response += '\n';
    }
    
    if (drawings.length === 0 && wires.length === 0 && connectors.length === 0) {
      response = `No results found for "${query}". Try:\n- Using specific wire numbers (e.g., 3003, 6009)\n- Drawing numbers (e.g., 942-38104)\n- Connector codes (e.g., CN11, X1)\n- System names (TCMS, Brake, Door)`;
    } else {
      response += `\n**Note**: This is a basic database search. For detailed analysis, please configure AI API keys.`;
    }
    
    return NextResponse.json({
      success: true,
      response,
      model: 'database-fallback',
      tokens: 0,
      sources: [
        ...drawings.map(d => ({ type: 'drawing', label: d.drawingNo })),
        ...wires.map(w => ({ type: 'wire', label: w.wireNo })),
        ...connectors.map(c => ({ type: 'connector', label: c.connectorCode })),
      ],
    });
  } catch (error) {
    console.error('Fallback search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
        details: String(error),
      },
      { status: 500 }
    );
  }
}
