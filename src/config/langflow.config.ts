/**
 * LangFlow Configuration
 * Centralized configuration for LangFlow RAG integration
 * Supports multiple flow types for different use cases
 */

export interface LangFlowFlowConfig {
  id: string;
  name: string;
  description: string;
  baseURL: string;
  flowId: string;
  inputKey: string;
  outputKey: string;
  enabled: boolean;
  timeout: number;
  retries: number;
}

export interface LangFlowConfig {
  enabled: boolean;
  baseURL: string;
  apiToken: string;
  flows: Record<string, LangFlowFlowConfig>;
  defaultFlow: string;
}

const LANGFLOW_BASE_URL = process.env.LANGFLOW_BASE_URL || 'http://localhost:7860/api/v1';
const LANGFLOW_API_TOKEN = process.env.LANGFLOW_API_TOKEN || '';

export const langflowConfig: LangFlowConfig = {
  enabled: !!process.env.LANGFLOW_BASE_URL && !!process.env.LANGFLOW_API_TOKEN,
  baseURL: LANGFLOW_BASE_URL,
  apiToken: LANGFLOW_API_TOKEN,
  
  flows: {
    wire_search: {
      id: 'wire-search-flow',
      name: 'Wire Search & Trace',
      description: 'RAG flow for searching and tracing wires across the system',
      baseURL: LANGFLOW_BASE_URL,
      flowId: process.env.LANGFLOW_WIRE_FLOW_ID || 'wire-search-flow-id',
      inputKey: 'wire_query',
      outputKey: 'wire_results',
      enabled: true,
      timeout: 30000,
      retries: 2
    },

    connector_search: {
      id: 'connector-search-flow',
      name: 'Connector Search',
      description: 'RAG flow for searching electrical connectors and pin mappings',
      baseURL: LANGFLOW_BASE_URL,
      flowId: process.env.LANGFLOW_CONNECTOR_FLOW_ID || 'connector-search-flow-id',
      inputKey: 'connector_query',
      outputKey: 'connector_results',
      enabled: true,
      timeout: 25000,
      retries: 2
    },

    drawing_analysis: {
      id: 'drawing-analysis-flow',
      name: 'Drawing Analysis',
      description: 'RAG flow for analyzing and extracting data from drawings',
      baseURL: LANGFLOW_BASE_URL,
      flowId: process.env.LANGFLOW_DRAWING_FLOW_ID || 'drawing-analysis-flow-id',
      inputKey: 'drawing_query',
      outputKey: 'drawing_analysis',
      enabled: true,
      timeout: 45000,
      retries: 2
    },

    system_troubleshooting: {
      id: 'system-troubleshooting-flow',
      name: 'System Troubleshooting',
      description: 'RAG flow for system troubleshooting and fault diagnosis',
      baseURL: LANGFLOW_BASE_URL,
      flowId: process.env.LANGFLOW_TROUBLESHOOTING_FLOW_ID || 'troubleshooting-flow-id',
      inputKey: 'fault_description',
      outputKey: 'troubleshooting_steps',
      enabled: true,
      timeout: 40000,
      retries: 2
    },

    knowledge_base: {
      id: 'knowledge-base-flow',
      name: 'Knowledge Base Query',
      description: 'RAG flow for querying the VCC knowledge base',
      baseURL: LANGFLOW_BASE_URL,
      flowId: process.env.LANGFLOW_KB_FLOW_ID || 'knowledge-base-flow-id',
      inputKey: 'kb_query',
      outputKey: 'kb_response',
      enabled: true,
      timeout: 30000,
      retries: 2
    }
  },

  defaultFlow: 'wire_search'
};

/**
 * Get specific flow configuration
 */
export function getFlowConfig(flowType: string): LangFlowFlowConfig | undefined {
  return langflowConfig.flows[flowType];
}

/**
 * Check if LangFlow is properly configured
 */
export function isLangFlowConfigured(): boolean {
  if (!langflowConfig.enabled) {
    return false;
  }

  const defaultFlow = langflowConfig.flows[langflowConfig.defaultFlow];
  return !!(
    defaultFlow &&
    langflowConfig.apiToken &&
    langflowConfig.baseURL &&
    defaultFlow.flowId
  );
}

/**
 * Validate LangFlow configuration
 */
export function validateLangFlowConfig(): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  if (!process.env.LANGFLOW_BASE_URL) {
    warnings.push('LANGFLOW_BASE_URL not set - LangFlow integration disabled');
  }
  if (!process.env.LANGFLOW_API_TOKEN) {
    warnings.push('LANGFLOW_API_TOKEN not set - LangFlow integration disabled');
  }

  // Validate flows
  for (const [key, flow] of Object.entries(langflowConfig.flows)) {
    if (flow.enabled) {
      if (!flow.flowId) {
        warnings.push(`Flow "${key}" is enabled but flowId is not configured`);
      }
      if (!flow.baseURL) {
        errors.push(`Flow "${key}" is enabled but baseURL is not set`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get all enabled flows
 */
export function getEnabledFlows(): LangFlowFlowConfig[] {
  return Object.values(langflowConfig.flows).filter(flow => flow.enabled);
}
