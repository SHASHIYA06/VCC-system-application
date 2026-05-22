export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  distance?: number;
}

export interface ChunkSearchResult {
  documentId: string;
  fileName: string;
  pageNumber: number;
  content: string;
  score: number;
}

export interface WiringSearchResult {
  entityType: string;
  entityCode: string;
  name: string;
  description: string;
  carType: string;
  subsystem: string;
  score: number;
}

export interface RAGConfig {
  embeddingModel: string;
  chunkSize: number;
  chunkOverlap: number;
  topK: number;
  similarityThreshold: number;
}

export const DEFAULT_RAG_CONFIG: RAGConfig = {
  embeddingModel: 'text-embedding-3-small',
  chunkSize: 1000,
  chunkOverlap: 200,
  topK: 5,
  similarityThreshold: 0.7,
};

export interface AgentTask {
  id: string;
  type: 'search' | 'trace' | 'analyze' | 'compare';
  query: string;
  context: Record<string, unknown>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
  error?: string;
}

export interface AgentResponse {
  taskId: string;
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}