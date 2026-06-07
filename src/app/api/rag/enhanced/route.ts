/**
 * Enhanced RAG API with TinyFish Integration
 * Combines internal database search with external web search
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { tinyFishService } from '@/lib/services/tinyfish';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Initialize OpenAI for embeddings and completions
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface EnhancedRAGRequest {
  query: string;
  includeWebSearch?: boolean;
  maxWebResults?: number;
  useMultiAgent?: boolean;
  model?: string;
  temperature?: number;
  confidenceThreshold?: number;
}

interface AgentResponse {
  agent: string;
  response: string;
  confidence: number;
  source: 'internal' | 'web' | 'hybrid';
  executionTime: number;
  metadata?: any;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: EnhancedRAGRequest = await request.json();
    const {
      query,
      includeWebSearch = true,
      maxWebResults = 5,
      useMultiAgent = true,
      model = 'gpt-3.5-turbo',
      temperature = 0.2,
      confidenceThreshold = 0.75
    } = body;

    if (!query?.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Query is required'
      }, { status: 400 });
    }

    console.log(`🤖 Enhanced RAG Query: "${query}"`);

    // Execute searches in parallel for better performance
    const [internalResults, webResults] = await Promise.allSettled([
      searchInternalDatabase(query),
      includeWebSearch ? searchWithTinyFish(query, maxWebResults) : Promise.resolve(null)
    ]);

    // Process internal results
    const internal = internalResults.status === 'fulfilled' 
      ? internalResults.value 
      : { results: [], executionTime: 0 };

    // Process web results
    const web = webResults.status === 'fulfilled' 
      ? webResults.value 
      : null;

    // Generate AI responses based on available data
    const agents = await generateAgentResponses({
      query,
      internalData: internal,
      webData: web,
      useMultiAgent,
      model,
      temperature,
      confidenceThreshold
    });

    // Create unified response
    const unifiedResponse = await createUnifiedResponse({
      query,
      agents,
      model,
      temperature
    });

    const totalTime = Date.now() - startTime;

    console.log(`✅ Enhanced RAG completed in ${totalTime}ms with ${agents.length} agents`);

    return NextResponse.json({
      success: true,
      query,
      agents,
      unifiedResponse,
      metadata: {
        internalResults: internal.results && typeof internal.results === 'object' && 'total' in internal.results 
          ? internal.results.total 
          : 0,
        webResults: web?.results?.length || 0,
        executionTime: totalTime,
        model,
        temperature,
        includeWebSearch
      }
    });

  } catch (error) {
    console.error('❌ Enhanced RAG error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Enhanced RAG processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Search internal VCC database
 */
async function searchInternalDatabase(query: string) {
  const startTime = Date.now();
  
  try {
    // Search across multiple tables
    const [wires, drawings, equipment, systems, trainlines] = await Promise.all([
      // Wires search
      prisma.wire.findMany({
        where: {
          OR: [
            { wireNo: { contains: query, mode: 'insensitive' } },
            { signalName: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: {
          wireNo: true,
          signalName: true,
          description: true,
          sourceEquipment: true,
          destEquipment: true,
          wireColor: true
        }
      }),
      
      // Drawings search
      prisma.drawing.findMany({
        where: {
          OR: [
            { drawingNo: { contains: query, mode: 'insensitive' } },
            { title: { contains: query, mode: 'insensitive' } },
            { remarks: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: {
          drawingNo: true,
          title: true,
          revision: true,
          systemId: true,
          remarks: true,
          system: { select: { name: true, code: true } }
        }
      }),
      
      // Equipment search
      prisma.device.findMany({
        where: {
          OR: [
            { tagNo: { contains: query, mode: 'insensitive' } },
            { deviceName: { contains: query, mode: 'insensitive' } },
            { note: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: {
          tagNo: true,
          deviceName: true,
          note: true,
          systemId: true,
          system: { select: { name: true, code: true } }
        }
      }),
      
      // Systems search
      prisma.system.findMany({
        where: {
          OR: [
            { code: { contains: query, mode: 'insensitive' } },
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 5,
        select: {
          code: true,
          name: true,
          description: true,
          category: true
        }
      }),
      
      // Trainlines search
      prisma.trainLine.findMany({
        where: {
          OR: [
            { wireNo: { contains: query, mode: 'insensitive' } },
            { itemName: { contains: query, mode: 'insensitive' } },
            { note: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 10,
        select: {
          wireNo: true,
          itemName: true,
          note: true,
          lineGroup: true
        }
      })
    ]);

    const results = {
      wires,
      drawings,
      equipment,
      systems,
      trainlines,
      total: wires.length + drawings.length + equipment.length + systems.length + trainlines.length
    };

    return {
      results,
      executionTime: Date.now() - startTime
    };

  } catch (error) {
    console.error('❌ Internal database search error:', error);
    return {
      results: { wires: [], drawings: [], equipment: [], systems: [], trainlines: [], total: 0 },
      executionTime: Date.now() - startTime
    };
  }
}

/**
 * Search web using TinyFish
 */
async function searchWithTinyFish(query: string, maxResults: number) {
  try {
    // Enhance query for railway/electrical context
    const enhancedQuery = `railway train control system "${query}" electrical specification manual`;
    
    const webSearch = await tinyFishService.search(enhancedQuery, {
      location: 'US',
      language: 'en',
      limit: maxResults
    });

    return webSearch;

  } catch (error) {
    console.error('❌ TinyFish search error:', error);
    return null;
  }
}

/**
 * Generate AI responses using multiple agents
 */
async function generateAgentResponses({
  query,
  internalData,
  webData,
  useMultiAgent,
  model,
  temperature,
  confidenceThreshold
}: {
  query: string;
  internalData: any;
  webData: any;
  useMultiAgent: boolean;
  model: string;
  temperature: number;
  confidenceThreshold: number;
}): Promise<AgentResponse[]> {
  
  const agents: AgentResponse[] = [];

  // Internal Database Agent
  if (internalData?.results?.total > 0) {
    const internalAgent = await generateInternalResponse(query, internalData, model, temperature);
    agents.push(internalAgent);
  }

  // Web Search Agent (if web data available)
  if (webData?.results?.length > 0) {
    const webAgent = await generateWebResponse(query, webData, model, temperature);
    agents.push(webAgent);
  }

  // Hybrid Agent (combines both sources)
  if (internalData?.results?.total > 0 && webData?.results?.length > 0) {
    const hybridAgent = await generateHybridResponse(query, internalData, webData, model, temperature);
    agents.push(hybridAgent);
  }

  // Filter agents by confidence threshold
  return agents.filter(agent => agent.confidence >= confidenceThreshold);
}

/**
 * Generate response based on internal database data
 */
async function generateInternalResponse(query: string, internalData: any, model: string, temperature: number): Promise<AgentResponse> {
  const startTime = Date.now();
  
  try {
    const context = formatInternalDataForAI(internalData.results);
    
    const completion = await openai.chat.completions.create({
      model,
      temperature,
      messages: [
        {
          role: 'system',
          content: `You are a VCC Railway System expert. Analyze the internal database search results and provide a comprehensive answer about the query. Focus on specific technical details, wire numbers, drawing references, and system relationships.`
        },
        {
          role: 'user',
          content: `Query: ${query}\n\nInternal Database Results:\n${context}\n\nPlease provide a detailed technical response based on this data.`
        }
      ],
      max_tokens: 800
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';
    const confidence = calculateConfidence(response, internalData.results.total);

    return {
      agent: 'Internal Database Agent',
      response,
      confidence,
      source: 'internal',
      executionTime: Date.now() - startTime,
      metadata: {
        resultsCount: internalData.results.total,
        dataTypes: Object.keys(internalData.results).filter(key => 
          key !== 'total' && internalData.results[key].length > 0
        )
      }
    };

  } catch (error) {
    console.error('❌ Internal response generation error:', error);
    return {
      agent: 'Internal Database Agent',
      response: 'Failed to generate response from internal data',
      confidence: 0,
      source: 'internal',
      executionTime: Date.now() - startTime
    };
  }
}

/**
 * Generate response based on web search data
 */
async function generateWebResponse(query: string, webData: any, model: string, temperature: number): Promise<AgentResponse> {
  const startTime = Date.now();
  
  try {
    const context = formatWebDataForAI(webData);
    
    const completion = await openai.chat.completions.create({
      model,
      temperature,
      messages: [
        {
          role: 'system',
          content: `You are a Railway Systems research expert. Analyze web search results to provide additional context and industry standards for the VCC system query. Focus on external documentation, standards, and best practices.`
        },
        {
          role: 'user',
          content: `Query: ${query}\n\nWeb Search Results:\n${context}\n\nPlease provide insights from external sources and industry standards.`
        }
      ],
      max_tokens: 800
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';
    const confidence = Math.min(0.8, calculateConfidence(response, webData.results.length));

    return {
      agent: 'Web Research Agent',
      response,
      confidence,
      source: 'web',
      executionTime: Date.now() - startTime,
      metadata: {
        resultsCount: webData.results.length,
        sources: webData.results.map((r: any) => r.domain).slice(0, 3)
      }
    };

  } catch (error) {
    console.error('❌ Web response generation error:', error);
    return {
      agent: 'Web Research Agent',
      response: 'Failed to generate response from web data',
      confidence: 0,
      source: 'web',
      executionTime: Date.now() - startTime
    };
  }
}

/**
 * Generate hybrid response combining both sources
 */
async function generateHybridResponse(query: string, internalData: any, webData: any, model: string, temperature: number): Promise<AgentResponse> {
  const startTime = Date.now();
  
  try {
    const internalContext = formatInternalDataForAI(internalData.results);
    const webContext = formatWebDataForAI(webData);
    
    const completion = await openai.chat.completions.create({
      model,
      temperature,
      messages: [
        {
          role: 'system',
          content: `You are the Senior VCC Railway System Architect. Synthesize information from both internal VCC database and external sources to provide the most comprehensive and accurate answer. Cross-reference internal technical data with industry standards and best practices.`
        },
        {
          role: 'user',
          content: `Query: ${query}\n\nVCC Internal Database:\n${internalContext}\n\nExternal Industry Sources:\n${webContext}\n\nPlease provide a comprehensive analysis that integrates both internal technical data and external industry knowledge.`
        }
      ],
      max_tokens: 1000
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';
    const confidence = Math.min(0.95, calculateConfidence(response, internalData.results.total + webData.results.length));

    return {
      agent: 'Hybrid Integration Agent',
      response,
      confidence,
      source: 'hybrid',
      executionTime: Date.now() - startTime,
      metadata: {
        internalResults: internalData.results.total,
        webResults: webData.results.length,
        synthesis: true
      }
    };

  } catch (error) {
    console.error('❌ Hybrid response generation error:', error);
    return {
      agent: 'Hybrid Integration Agent',
      response: 'Failed to generate hybrid response',
      confidence: 0,
      source: 'hybrid',
      executionTime: Date.now() - startTime
    };
  }
}

/**
 * Create unified response from all agents
 */
async function createUnifiedResponse({
  query,
  agents,
  model,
  temperature
}: {
  query: string;
  agents: AgentResponse[];
  model: string;
  temperature: number;
}): Promise<string> {
  
  if (agents.length === 0) {
    return `I couldn't find specific information about "${query}" in the VCC system database or external sources. Please try rephrasing your query or check if the component/system code is correct.`;
  }

  if (agents.length === 1) {
    return agents[0].response;
  }

  try {
    // Combine multiple agent responses into a unified answer
    const agentSummaries = agents.map(agent => 
      `**${agent.agent}** (Confidence: ${Math.round(agent.confidence * 100)}%):\n${agent.response}`
    ).join('\n\n---\n\n');

    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.1, // Lower temperature for synthesis
      messages: [
        {
          role: 'system',
          content: `You are a VCC Railway System Integration Expert. Synthesize multiple agent responses into a single, comprehensive, and coherent answer. Prioritize higher confidence responses and resolve any conflicts by favoring internal VCC data over external sources.`
        },
        {
          role: 'user',
          content: `Query: ${query}\n\nAgent Responses:\n${agentSummaries}\n\nPlease create a unified, comprehensive answer that integrates the best insights from all agents.`
        }
      ],
      max_tokens: 1200
    });

    return completion.choices[0]?.message?.content || agents[0].response;

  } catch (error) {
    console.error('❌ Unified response generation error:', error);
    // Fallback to highest confidence agent
    const bestAgent = agents.sort((a, b) => b.confidence - a.confidence)[0];
    return bestAgent.response;
  }
}

/**
 * Format internal data for AI consumption
 */
function formatInternalDataForAI(results: any): string {
  const sections = [];

  if (results.systems?.length > 0) {
    sections.push(`Systems:\n${results.systems.map((s: any) => 
      `- ${s.code}: ${s.name} (${s.category})`
    ).join('\n')}`);
  }

  if (results.wires?.length > 0) {
    sections.push(`Wires:\n${results.wires.map((w: any) => 
      `- ${w.wireNo}: ${w.signalName || 'No signal name'} (${w.sourceEquipment} → ${w.destEquipment})`
    ).join('\n')}`);
  }

  if (results.drawings?.length > 0) {
    sections.push(`Drawings:\n${results.drawings.map((d: any) => 
      `- ${d.drawingNo}: ${d.title} (${d.system?.name || 'Unknown system'})`
    ).join('\n')}`);
  }

  if (results.equipment?.length > 0) {
    sections.push(`Equipment:\n${results.equipment.map((e: any) => 
      `- ${e.tagNo}: ${e.deviceName} (${e.system?.name || 'Unknown system'})`
    ).join('\n')}`);
  }

  if (results.trainlines?.length > 0) {
    sections.push(`Trainlines:\n${results.trainlines.map((t: any) => 
      `- ${t.wireNo}: ${t.itemName} (${t.lineGroup})`
    ).join('\n')}`);
  }

  return sections.join('\n\n') || 'No relevant internal data found.';
}

/**
 * Format web data for AI consumption
 */
function formatWebDataForAI(webData: any): string {
  if (!webData?.results?.length) {
    return 'No relevant web results found.';
  }

  return webData.results.map((result: any, index: number) => 
    `${index + 1}. **${result.title}** (${result.domain})\n   ${result.snippet}`
  ).join('\n\n');
}

/**
 * Calculate confidence score based on response quality and data availability
 */
function calculateConfidence(response: string, dataCount: number): number {
  let confidence = Math.min(0.9, 0.3 + (dataCount * 0.1));
  
  // Boost confidence for detailed responses
  if (response.length > 200) confidence += 0.1;
  if (response.includes('wire') || response.includes('drawing') || response.includes('system')) confidence += 0.1;
  
  return Math.min(1.0, confidence);
}

export async function GET() {
  return NextResponse.json({
    service: 'Enhanced RAG API with TinyFish Integration',
    version: '2.0.0',
    features: [
      'Internal VCC database search',
      'External web search via TinyFish',
      'Multi-agent response generation',
      'Hybrid analysis combining both sources',
      'Confidence-based filtering',
      'Unified response synthesis'
    ],
    usage: {
      endpoint: '/api/rag/enhanced',
      method: 'POST',
      body: {
        query: 'Search query (required)',
        includeWebSearch: 'Include external web search (optional, default: true)',
        maxWebResults: 'Maximum web results (optional, default: 5)',
        useMultiAgent: 'Use multiple AI agents (optional, default: true)',
        model: 'AI model to use (optional, default: gpt-3.5-turbo)',
        temperature: 'AI temperature (optional, default: 0.2)',
        confidenceThreshold: 'Minimum confidence threshold (optional, default: 0.75)'
      }
    },
    example: {
      query: 'TRAC system brake control',
      includeWebSearch: true,
      maxWebResults: 5,
      useMultiAgent: true
    }
  });
}