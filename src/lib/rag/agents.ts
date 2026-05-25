/**
 * Multi-Agent RAG System
 * Orchestrates specialized agents for complex VCC queries
 */

import { RAG_CONFIG, ModelConfig, AgentConfig } from './config';
import { generateEmbedding } from './embeddings';
import { hybridSearch, QueryResult } from './mongodb';

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AgentResponse {
  content: string;
  model: string;
  tokens: number;
  sources?: QueryResult[];
}

export interface AgentTask {
  type: 'retrieve' | 'analyze' | 'synthesize' | 'coordinate';
  query: string;
  context?: any;
}

/**
 * Call AI model
 */
async function callModel(
  messages: AgentMessage[],
  modelConfig: ModelConfig
): Promise<AgentResponse> {
  const { provider, model, apiKey, baseURL, maxTokens, temperature } = modelConfig;
  
  if (!apiKey) {
    throw new Error(`API key not configured for ${provider}`);
  }
  
  // Determine endpoint based on provider
  let endpoint = baseURL || 'https://api.openai.com/v1';
  if (provider === 'anthropic') {
    endpoint = 'https://openrouter.ai/api/v1';
  } else if (provider === 'google') {
    endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  }
  
  // Handle different API formats
  if (provider === 'google') {
    // Gemini API format
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${await response.text()}`);
    }
    
    const data = await response.json();
    return {
      content: data.candidates[0].content.parts[0].text,
      model,
      tokens: data.usageMetadata?.totalTokenCount || 0,
    };
  } else {
    // OpenAI-compatible API format
    const response = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        ...(provider === 'anthropic' && { 'HTTP-Referer': 'https://vcc-explorer.com' }),
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`${provider} API error: ${await response.text()}`);
    }
    
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model,
      tokens: data.usage?.total_tokens || 0,
    };
  }
}

/**
 * Coordinator Agent
 * Breaks down complex queries and orchestrates other agents
 */
export class CoordinatorAgent {
  private config: AgentConfig;
  private modelConfig: ModelConfig;
  
  constructor() {
    this.config = RAG_CONFIG.agents.coordinator;
    this.modelConfig = RAG_CONFIG.models.chat.find(m => m.name === this.config.model)!;
  }
  
  async process(query: string): Promise<{
    tasks: AgentTask[];
    strategy: string;
  }> {
    const messages: AgentMessage[] = [
      { role: 'system', content: this.config.systemPrompt },
      {
        role: 'user',
        content: `Analyze this query and break it into sub-tasks:

Query: "${query}"

Determine:
1. What type of information is needed (drawings, wires, connectors, systems)?
2. What analysis is required (tracing, validation, explanation)?
3. How should the response be structured?

Respond with a JSON object containing:
- tasks: Array of {type, query, context}
- strategy: Overall approach description`,
      },
    ];
    
    const response = await callModel(messages, this.modelConfig);
    
    try {
      const parsed = JSON.parse(response.content);
      return parsed;
    } catch {
      // Fallback if JSON parsing fails
      return {
        tasks: [{ type: 'retrieve', query, context: {} }],
        strategy: 'Simple retrieval',
      };
    }
  }
}

/**
 * Retriever Agent
 * Searches and retrieves relevant documents
 */
export class RetrieverAgent {
  private config: AgentConfig;
  private modelConfig: ModelConfig;
  
  constructor() {
    this.config = RAG_CONFIG.agents.retriever;
    this.modelConfig = RAG_CONFIG.models.chat.find(m => m.name === this.config.model)!;
  }
  
  async retrieve(query: string, filter?: any): Promise<QueryResult[]> {
    // Generate query embedding
    const { embedding } = await generateEmbedding(query);
    
    // Perform hybrid search
    const results = await hybridSearch(query, embedding, {
      topK: RAG_CONFIG.retrieval.topK,
      filter,
    });
    
    return results;
  }
  
  async extractKeyInfo(results: QueryResult[]): Promise<string> {
    const context = results
      .map((r, i) => `[${i + 1}] ${r.chunk.content}`)
      .join('\n\n');
    
    const messages: AgentMessage[] = [
      { role: 'system', content: this.config.systemPrompt },
      {
        role: 'user',
        content: `Extract key information from these documents:

${context}

Provide a concise summary of the most relevant information.`,
      },
    ];
    
    const response = await callModel(messages, this.modelConfig);
    return response.content;
  }
}

/**
 * Analyzer Agent
 * Performs technical analysis on VCC data
 */
export class AnalyzerAgent {
  private config: AgentConfig;
  private modelConfig: ModelConfig;
  
  constructor() {
    this.config = RAG_CONFIG.agents.analyzer;
    this.modelConfig = RAG_CONFIG.models.chat.find(m => m.name === this.config.model)!;
  }
  
  async analyze(query: string, context: string): Promise<string> {
    const messages: AgentMessage[] = [
      { role: 'system', content: this.config.systemPrompt },
      {
        role: 'user',
        content: `Analyze this VCC technical query:

Query: ${query}

Context:
${context}

Provide detailed technical analysis including:
1. Wire connections and paths
2. System relationships
3. Potential issues or warnings
4. Technical specifications`,
      },
    ];
    
    const response = await callModel(messages, this.modelConfig);
    return response.content;
  }
}

/**
 * Synthesizer Agent
 * Combines information and generates final response
 */
export class SynthesizerAgent {
  private config: AgentConfig;
  private modelConfig: ModelConfig;
  
  constructor() {
    this.config = RAG_CONFIG.agents.synthesizer;
    this.modelConfig = RAG_CONFIG.models.chat.find(m => m.name === this.config.model)!;
  }
  
  async synthesize(
    query: string,
    retrievedInfo: string,
    analysis: string,
    sources: QueryResult[]
  ): Promise<AgentResponse> {
    const messages: AgentMessage[] = [
      { role: 'system', content: this.config.systemPrompt },
      {
        role: 'user',
        content: `Generate a comprehensive response to this query:

Query: ${query}

Retrieved Information:
${retrievedInfo}

Technical Analysis:
${analysis}

Requirements:
1. Provide clear, accurate technical explanation
2. Include specific wire numbers, connector codes, and drawing references
3. Format with proper markdown (headers, lists, tables)
4. Cite sources using [Drawing: XXX] format
5. Add warnings or notes where relevant`,
      },
    ];
    
    const response = await callModel(messages, this.modelConfig);
    
    return {
      ...response,
      sources,
    };
  }
}

/**
 * Multi-Agent Orchestrator
 * Coordinates all agents to answer complex queries
 */
export class MultiAgentOrchestrator {
  private coordinator: CoordinatorAgent;
  private retriever: RetrieverAgent;
  private analyzer: AnalyzerAgent;
  private synthesizer: SynthesizerAgent;
  
  constructor() {
    this.coordinator = new CoordinatorAgent();
    this.retriever = new RetrieverAgent();
    this.analyzer = new AnalyzerAgent();
    this.synthesizer = new SynthesizerAgent();
  }
  
  async process(query: string, mode: 'operator' | 'engineer' | 'admin' = 'operator'): Promise<AgentResponse> {
    try {
      // Step 1: Coordinate and plan
      const { tasks, strategy } = await this.coordinator.process(query);
      console.log('📋 Strategy:', strategy);
      console.log('📋 Tasks:', tasks);
      
      // Step 2: Retrieve relevant documents
      const retrievalResults = await this.retriever.retrieve(query);
      console.log(`📚 Retrieved ${retrievalResults.length} documents`);
      
      if (retrievalResults.length === 0) {
        return {
          content: `I couldn't find specific information about "${query}" in the VCC documentation. Please try:
- Using different keywords
- Checking wire numbers, connector codes, or drawing numbers
- Asking about specific systems (TCMS, Brake, Door, etc.)`,
          model: 'fallback',
          tokens: 0,
        };
      }
      
      // Step 3: Extract key information
      const keyInfo = await this.retriever.extractKeyInfo(retrievalResults);
      console.log('🔍 Key info extracted');
      
      // Step 4: Perform technical analysis
      let analysis = keyInfo;
      if (mode === 'operator') {
        analysis = await this.analyzer.analyze(query, keyInfo + "\n\nProvide a guided, high-level answer suitable for a system operator.");
      } else if (mode === 'engineer') {
        analysis = await this.analyzer.analyze(query, keyInfo + "\n\nProvide raw references, exact wire traces, pin numbers, and schematic locations for an engineer.");
      } else if (mode === 'admin') {
        analysis = await this.analyzer.analyze(query, keyInfo + "\n\nProvide parser validation details, consistency checks, and data confidence scores for admin validation.");
      }
      console.log('🔬 Analysis complete');
      
      // Step 5: Synthesize final response
      const response = await this.synthesizer.synthesize(
        query,
        keyInfo,
        analysis,
        retrievalResults
      );
      console.log('✅ Response synthesized');
      
      return response;
    } catch (error) {
      console.error('Multi-agent orchestration error:', error);
      throw error;
    }
  }
}

/**
 * Simple RAG query (without multi-agent orchestration)
 */
export async function simpleRAGQuery(query: string): Promise<AgentResponse> {
  const retriever = new RetrieverAgent();
  
  // Retrieve documents
  const results = await retriever.retrieve(query);
  
  if (results.length === 0) {
    return {
      content: 'No relevant information found.',
      model: 'simple',
      tokens: 0,
    };
  }
  
  // Extract and return key info
  const content = await retriever.extractKeyInfo(results);
  
  return {
    content,
    model: 'simple',
    tokens: 0,
    sources: results,
  };
}
