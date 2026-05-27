/**
 * RAG System Configuration
 * Multi-model AI infrastructure for VCC application
 */

export const RAG_CONFIG = {
  // Vector Database
  mongodb: {
    uri: process.env.MONGODB_URI!,
    database: process.env.MONGODB_DB || 'vcc_documents',
    collections: {
      documents: 'documents',
      embeddings: 'embeddings',
      chunks: 'chunks',
      queries: 'query_history',
    },
    vectorIndex: 'vector_index',
    dimensions: 1536, // OpenAI ada-002 dimensions
  },

  // AI Models Configuration
  models: {
    // Primary model for embeddings
    embedding: {
      provider: 'openai',
      model: 'text-embedding-ada-002',
      apiKey: process.env.OPENAI_API_KEY,
      dimensions: 1536,
    },

    // Chat/Completion models (multi-provider)
    chat: [
      {
        name: 'opencode-minimax',
        provider: 'opencode',
        model: 'minimax-m2.5',
        apiKey: process.env.OPENCODE_API_KEY,
        baseURL: 'https://opencode.ai/zen/v1',
        maxTokens: 4096,
        temperature: 0.3,
        priority: 0,
      },
      {
        name: 'claude-sonnet',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        apiKey: process.env.ANTHROPIC_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        maxTokens: 8192,
        temperature: 0.7,
        priority: 1,
      },
      {
        name: 'gpt-4-turbo',
        provider: 'openai',
        model: 'gpt-4-turbo-preview',
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
        maxTokens: 4096,
        temperature: 0.7,
        priority: 2,
      },
      {
        name: 'deepseek-chat',
        provider: 'deepseek',
        model: 'deepseek-chat',
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1',
        maxTokens: 4096,
        temperature: 0.7,
        priority: 3,
      },
      {
        name: 'nvidia-glm',
        provider: 'nvidia',
        model: process.env.NVIDIA_MODEL || 'z-ai/glm-5.1',
        apiKey: process.env.NVIDIA_API_KEY,
        baseURL: process.env.NVIDIA_BASE_URL,
        maxTokens: 4096,
        temperature: 0.7,
        priority: 4,
      },
      {
        name: 'gemini-pro',
        provider: 'google',
        model: 'gemini-pro',
        apiKey: process.env.GEMINI_API_KEY,
        maxTokens: 2048,
        temperature: 0.7,
        priority: 5,
      },
    ],

    // Specialized models for specific tasks
    specialized: {
      codeAnalysis: 'opencode-minimax',
      technicalDocs: 'opencode-minimax',
      quickAnswers: 'opencode-minimax',
      complexReasoning: 'opencode-minimax',
    },
  },

  // Chunking Strategy
  chunking: {
    maxChunkSize: 1000, // tokens
    overlap: 200, // tokens
    separators: ['\n\n', '\n', '. ', ' '],
    minChunkSize: 100,
  },

  // Retrieval Configuration
  retrieval: {
    topK: 10, // Number of chunks to retrieve
    similarityThreshold: 0.7, // Minimum similarity score
    rerankTopK: 5, // After reranking
    hybridSearch: true, // Combine vector + keyword search
    keywordWeight: 0.3,
    vectorWeight: 0.7,
  },

  // Multi-Agent Configuration
  agents: {
    coordinator: {
      model: 'opencode-minimax',
      systemPrompt: `You are the Coordinator Agent for the VCC (Vehicle Control Cabinet) system.
Your role is to:
1. Understand user queries and break them into sub-tasks
2. Delegate tasks to specialized agents
3. Synthesize responses from multiple agents
4. Ensure accuracy and completeness of answers`,
    },
    retriever: {
      model: 'opencode-minimax',
      systemPrompt: `You are the Retriever Agent for VCC documentation.
Your role is to:
1. Search and retrieve relevant documents
2. Rank results by relevance
3. Extract key information from documents
4. Provide context for other agents`,
    },
    analyzer: {
      model: 'opencode-minimax',
      systemPrompt: `You are the Analyzer Agent for VCC technical analysis.
Your role is to:
1. Analyze wiring diagrams and circuits
2. Trace wire connections across drawings
3. Identify system relationships
4. Validate technical specifications`,
    },
    synthesizer: {
      model: 'opencode-minimax',
      systemPrompt: `You are the Synthesizer Agent for VCC responses.
Your role is to:
1. Combine information from multiple sources
2. Generate clear, accurate technical explanations
3. Format responses for end users
4. Cite sources and provide references`,
    },
  },

  // Cache Configuration
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    maxSize: 1000, // Max cached queries
  },

  // Logging
  logging: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    logQueries: true,
    logResponses: true,
    logPerformance: true,
  },
};

export type RAGConfig = typeof RAG_CONFIG;
export type ModelConfig = typeof RAG_CONFIG.models.chat[0];
export type AgentConfig = typeof RAG_CONFIG.agents.coordinator;
