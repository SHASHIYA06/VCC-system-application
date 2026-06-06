/**
 * Lightweight RAG Client for Serverless Deployment
 * Minimal dependencies with lazy loading for heavy AI operations
 */

// Lightweight types for reduced bundle size
export interface LightweightRAGResponse {
  query: string;
  response: string;
  confidence: number;
  executionTime: number;
  sources: string[];
  model: string;
}

export interface MultiAgentRAGResponse {
  query: string;
  unifiedResponse: string;
  executionTime: number;
  degradedMode?: boolean;
  agentCount: number;
}

/**
 * Lightweight RAG query execution with lazy loading
 */
export async function executeLightweightRAGQuery(
  query: string,
  options: {
    model?: string;
    temperature?: number;
    useMultiAgent?: boolean;
  } = {}
): Promise<LightweightRAGResponse | MultiAgentRAGResponse> {
  const startTime = Date.now();
  
  try {
    // Check if we should use multi-agent or single agent
    if (options.useMultiAgent) {
      // Lazy load the full multi-agent system
      const { executeMultiAgentQuery } = await import('./multi-agent-rag');
      const result = await executeMultiAgentQuery(query);
      
      return {
        query: result.query,
        unifiedResponse: result.unifiedResponse,
        executionTime: result.executionTime,
        degradedMode: result.degradedMode,
        agentCount: result.agents.length
      };
    } else {
      // Use lightweight single-agent approach
      const response = await executeSingleAgentQuery(query, options);
      return response;
    }
  } catch (error) {
    console.error('Lightweight RAG Error:', error);
    
    // Fallback response
    return {
      query,
      response: `I'm having trouble processing that request right now. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      confidence: 0,
      executionTime: Date.now() - startTime,
      sources: [],
      model: 'fallback'
    };
  }
}

/**
 * Single agent query with minimal dependencies
 */
async function executeSingleAgentQuery(
  query: string,
  options: {
    model?: string;
    temperature?: number;
  } = {}
): Promise<LightweightRAGResponse> {
  const startTime = Date.now();
  
  try {
    // Lazy load database client
    const { prisma } = await import('@/lib/prisma');
    
    // Quick database search for relevant information
    const [wires, systems, drawings] = await Promise.all([
      prisma.wire.findMany({
        where: {
          OR: [
            { wireNo: { contains: query, mode: 'insensitive' } },
            { signalName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        include: { endpoints: { take: 2 } }
      }),
      
      prisma.system.findMany({
        where: {
          OR: [
            { code: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 3,
      }),
      
      prisma.drawing.findMany({
        where: {
          OR: [
            { drawingNo: { contains: query, mode: 'insensitive' } },
            { title: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 3,
      }),
    ]);
    
    // Build context from database results
    const context = [
      ...wires.map(w => `Wire ${w.wireNo}: ${w.signalName || 'No signal'}`),
      ...systems.map(s => `System ${s.code}: ${s.name}`),
      ...drawings.map(d => `Drawing ${d.drawingNo}: ${d.title}`),
    ].join('\n');
    
    let response: string;
    let sources: string[] = [];
    
    if (context.length > 0) {
      // Generate contextual response
      sources = [
        ...wires.map(w => w.wireNo),
        ...systems.map(s => s.code),
        ...drawings.map(d => d.drawingNo),
      ];
      
      response = generateContextualResponse(query, {
        wires,
        systems,
        drawings,
      });
    } else {
      // No database matches found
      response = `I couldn't find specific information about "${query}" in the VCC system database. Try searching for wire numbers, system codes, or drawing numbers.`;
    }
    
    return {
      query,
      response,
      confidence: context.length > 0 ? 0.85 : 0.2,
      executionTime: Date.now() - startTime,
      sources,
      model: 'lightweight-local'
    };
    
  } catch (error) {
    console.error('Single agent query error:', error);
    
    return {
      query,
      response: `Error processing query: ${error instanceof Error ? error.message : 'Unknown error'}`,
      confidence: 0,
      executionTime: Date.now() - startTime,
      sources: [],
      model: 'error-fallback'
    };
  }
}

/**
 * Generate contextual response without external AI APIs
 */
function generateContextualResponse(
  query: string, 
  data: {
    wires: any[];
    systems: any[];
    drawings: any[];
  }
): string {
  const { wires, systems, drawings } = data;
  
  // Build a comprehensive response based on found data
  let response = `Found information about "${query}":\n\n`;
  
  if (systems.length > 0) {
    response += `**Systems:**\n`;
    systems.forEach(s => {
      response += `• ${s.code} - ${s.name}\n`;
      if (s.description) response += `  ${s.description}\n`;
    });
    response += '\n';
  }
  
  if (drawings.length > 0) {
    response += `**Drawings:**\n`;
    drawings.forEach(d => {
      response += `• ${d.drawingNo} - ${d.title}\n`;
      if (d.revision) response += `  Revision: ${d.revision}\n`;
    });
    response += '\n';
  }
  
  if (wires.length > 0) {
    response += `**Wires:**\n`;
    wires.forEach(w => {
      response += `• Wire ${w.wireNo}`;
      if (w.signalName) response += ` - ${w.signalName}`;
      response += '\n';
      if (w.endpoints.length > 0) {
        response += `  Connections: ${w.endpoints.length} endpoints\n`;
      }
    });
    response += '\n';
  }
  
  // Add helpful suggestions
  response += `**Suggestions:**\n`;
  response += `• Use the search function for more detailed information\n`;
  response += `• Check the diagnostics panel for system health\n`;
  response += `• Navigate to specific sections for detailed analysis\n`;
  
  return response;
}

/**
 * Check if lightweight mode should be used based on query complexity
 */
export function shouldUseLightweightMode(query: string): boolean {
  // Use lightweight mode for simple queries
  const lightweightPatterns = [
    /^(show|find|search|get)\s+/i,
    /^(wire|drawing|system|device|connector)\s+[\w\d]+$/i,
    /^\w+\s*\d+$/i, // Simple codes like "TRAC 3003"
  ];
  
  return lightweightPatterns.some(pattern => pattern.test(query.trim()));
}

/**
 * Optimized voice RAG integration
 */
export async function executeLightweightVoiceRAG(
  transcription: string,
  options: {
    includeVoiceResponse?: boolean;
    model?: string;
  } = {}
): Promise<{
  textResponse: LightweightRAGResponse | MultiAgentRAGResponse;
  voiceResponse?: { audioFile: string; duration: number };
}> {
  const startTime = Date.now();
  
  try {
    // Execute lightweight RAG query
    const textResponse = await executeLightweightRAGQuery(transcription, {
      model: options.model || 'lightweight-local',
      useMultiAgent: false // Keep it lightweight for voice
    });
    
    let voiceResponse;
    
    if (options.includeVoiceResponse && 'response' in textResponse) {
      try {
        // Lazy load voice client
        const { vibeVoiceClient } = await import('../voice/vibeVoiceClient');
        
        // Get the text to synthesize based on response type
        const textToSynthesize = (textResponse as any).response || (textResponse as any).unifiedResponse || 'Unable to generate voice response';
        
        const ttsResult = await vibeVoiceClient.textToSpeech(textToSynthesize);
        
        voiceResponse = {
          audioFile: ttsResult.audioFile,
          duration: ttsResult.duration
        };
      } catch (voiceError) {
        console.error('Voice response generation failed:', voiceError);
        // Continue without voice response
      }
    }
    
    return {
      textResponse,
      voiceResponse
    };
    
  } catch (error) {
    console.error('Lightweight Voice RAG Error:', error);
    
    // Fallback response
    const fallbackResponse: LightweightRAGResponse = {
      query: transcription,
      response: 'Voice processing is temporarily unavailable. Please try again.',
      confidence: 0,
      executionTime: Date.now() - startTime,
      sources: [],
      model: 'voice-fallback'
    };
    
    return { textResponse: fallbackResponse };
  }
}