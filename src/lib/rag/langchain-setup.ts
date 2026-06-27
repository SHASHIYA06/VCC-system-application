/**
 * LangChain Setup and Configuration
 * Initializes LangChain components for RAG pipeline
 */

import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Document } from '@langchain/core/documents';

export interface LangChainConfig {
  llmProvider: 'openai' | 'anthropic' | 'gemini' | 'openrouter';
  temperature: number;
  maxTokens: number;
}

const defaultConfig: LangChainConfig = {
  llmProvider: 'openai',
  temperature: 0.3,
  maxTokens: 2000
};

/**
 * Initialize LLM based on provider
 */
export function initializeLLM(config: Partial<LangChainConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  switch (finalConfig.llmProvider) {
    case 'openai':
      return new ChatOpenAI({
        modelName: 'gpt-4',
        temperature: finalConfig.temperature,
        maxTokens: finalConfig.maxTokens,
        apiKey: process.env.OPENAI_API_KEY
      });

    case 'anthropic':
      return new ChatAnthropic({
        modelName: 'claude-3-sonnet-20240229',
        temperature: finalConfig.temperature,
        maxTokens: finalConfig.maxTokens,
        apiKey: process.env.ANTHROPIC_API_KEY
      });

    case 'gemini':
      return new ChatGoogleGenerativeAI({
        model: 'gemini-pro',
        temperature: finalConfig.temperature,
        maxOutputTokens: finalConfig.maxTokens,
        apiKey: process.env.GEMINI_API_KEY
      });

    default:
      throw new Error(`Unsupported LLM provider: ${finalConfig.llmProvider}`);
  }
}

/**
 * Wire Search RAG Prompt Template
 */
export const wireSearchPromptTemplate = PromptTemplate.fromTemplate(`
You are an expert VCC (Vehicle Control System) electrical engineer assistant.
Given the following wire information and context, provide a comprehensive analysis.

Context: {context}
Query: {query}

Provide:
1. Wire identification and purpose
2. Source and destination connectors
3. Electrical characteristics (voltage, current rating)
4. Associated systems and subsystems
5. Related drawings and documentation
6. Troubleshooting tips if applicable

Answer:
`);

/**
 * Connector Search RAG Prompt Template
 */
export const connectorSearchPromptTemplate = PromptTemplate.fromTemplate(`
You are an expert in electrical connectors and pin assignments.
Given the following connector information, provide detailed analysis.

Context: {context}
Query: {query}

Provide:
1. Connector identification and type
2. Pin assignments and signal names
3. Pin specifications (voltage, current)
4. Associated wires and connections
5. Related subsystems
6. Pin compatibility notes

Answer:
`);

/**
 * System Troubleshooting RAG Prompt Template
 */
export const troubleshootingPromptTemplate = PromptTemplate.fromTemplate(`
You are an expert VCC system troubleshooter.
Given the fault description and system context, provide troubleshooting steps.

System Context: {context}
Fault Description: {query}

Provide:
1. Likely causes of the fault
2. Diagnostic steps to isolate the problem
3. Required test equipment
4. Step-by-step repair procedure
5. Verification tests
6. Prevention measures

Answer:
`);

export const langchainConfig = {
  llmProvider: (process.env.LANGCHAIN_LLM_PROVIDER as any) || 'openai',
  temperature: parseFloat(process.env.LANGCHAIN_TEMPERATURE || '0.3'),
  maxTokens: parseInt(process.env.LANGCHAIN_MAX_TOKENS || '2000')
};
