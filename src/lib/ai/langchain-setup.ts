/**
 * LangChain Setup for Multi-Agent RAG System
 * Configures multiple AI models and vector store
 */

import { ChatOpenAI } from '@langchain/openai';
import { MongoClient } from 'mongodb';

// MongoDB connection for vector storage
let mongoClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (mongoClient) {
    return mongoClient;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  console.log('✅ Connected to MongoDB for vector storage');
  
  return mongoClient;
}

export async function getMongoDatabase() {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || 'vcc_documents';
  return client.db(dbName);
}

// AI Model Configurations
export interface ModelConfig {
  name: string;
  provider: string;
  apiKey: string;
  baseURL?: string;
  modelName: string;
  temperature?: number;
  maxTokens?: number;
}

export const AI_MODELS: Record<string, ModelConfig> = {
  'openrouter-claude': {
    name: 'Claude via OpenRouter',
    provider: 'openrouter',
    apiKey: process.env.OPENROUTER_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    modelName: 'anthropic/claude-3.5-sonnet',
    temperature: 0.2,
    maxTokens: 4096,
  },
  'openai-gpt': {
    name: 'GPT-4 via OpenRouter',
    provider: 'openrouter',
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    modelName: 'openai/gpt-4-turbo',
    temperature: 0.2,
    maxTokens: 4096,
  },
  'deepseek-flash': {
    name: 'Deepseek Flash v4',
    provider: 'openrouter',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: 'https://openrouter.ai/api/v1',
    modelName: 'deepseek/deepseek-chat',
    temperature: 0.1,
    maxTokens: 4096,
  },
  'opencode-minimax': {
    name: 'MiniMax M2.5 Free',
    provider: 'opencode',
    apiKey: process.env.OPENCODE_API_KEY || '',
    baseURL: 'https://api.opencode.ai/v1',
    modelName: 'minimax/abab6.5s-chat',
    temperature: 0.2,
    maxTokens: 4096,
  },
};

/**
 * Create a LangChain ChatOpenAI instance for a specific model
 */
export function createChatModel(modelKey: string = 'openrouter-claude'): ChatOpenAI {
  const config = AI_MODELS[modelKey];
  
  if (!config) {
    throw new Error(`Unknown model: ${modelKey}`);
  }

  if (!config.apiKey) {
    throw new Error(`API key not configured for model: ${modelKey}`);
  }

  return new ChatOpenAI({
    openAIApiKey: config.apiKey,
    modelName: config.modelName,
    temperature: config.temperature || 0.2,
    maxTokens: config.maxTokens || 4096,
    configuration: {
      baseURL: config.baseURL,
    },
  });
}

/**
 * Create multiple chat models for multi-agent system
 */
export function createMultiAgentModels(): Record<string, ChatOpenAI> {
  const models: Record<string, ChatOpenAI> = {};
  
  for (const [key, config] of Object.entries(AI_MODELS)) {
    if (config.apiKey) {
      try {
        models[key] = createChatModel(key);
      } catch (error) {
        console.warn(`Failed to create model ${key}:`, error);
      }
    }
  }
  
  return models;
}

/**
 * System prompts for different agent roles
 */
export const AGENT_PROMPTS = {
  drawing_expert: `You are an expert in electrical drawings and schematics for railway vehicles.
You specialize in interpreting wiring diagrams, connector layouts, and system architectures.
Provide precise, technical answers based on the drawing data provided.`,

  wire_expert: `You are an expert in electrical wiring and cable management for railway vehicles.
You specialize in wire routing, signal paths, voltage classifications, and conductor specifications.
Provide detailed wire tracing and connection information.`,

  system_expert: `You are an expert in railway vehicle electrical systems.
You specialize in system architecture, subsystem interactions, and equipment integration.
Provide comprehensive system-level analysis and recommendations.`,

  diagnostic_expert: `You are an expert in electrical diagnostics and troubleshooting for railway vehicles.
You specialize in fault detection, symptom analysis, and solution recommendations.
Provide actionable diagnostic guidance based on the data.`,

  unified_coordinator: `You are a coordinator that synthesizes information from multiple specialized agents.
Your role is to combine insights from drawing, wire, system, and diagnostic experts
into a coherent, comprehensive response. Prioritize accuracy and completeness.`,
};

/**
 * Get system prompt for a specific agent role
 */
export function getAgentPrompt(role: keyof typeof AGENT_PROMPTS): string {
  return AGENT_PROMPTS[role];
}

/**
 * Close MongoDB connection
 */
export async function closeMongoConnection() {
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
    console.log('✅ MongoDB connection closed');
  }
}
