/**
 * Embedding Generation Service
 * Supports multiple AI providers for generating text embeddings
 */

import { RAG_CONFIG } from './config';

export interface EmbeddingResult {
  embedding: number[];
  model: string;
  tokens: number;
}

/**
 * Generate embeddings using OpenAI
 */
async function generateOpenAIEmbedding(text: string): Promise<EmbeddingResult> {
  const apiKey = RAG_CONFIG.models.embedding.apiKey;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: RAG_CONFIG.models.embedding.model,
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI embedding error: ${error}`);
  }

  const data = await response.json();
  
  return {
    embedding: data.data[0].embedding,
    model: RAG_CONFIG.models.embedding.model,
    tokens: data.usage.total_tokens,
  };
}

/**
 * Generate embeddings (main function)
 */
export async function generateEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    // Truncate text if too long (max 8191 tokens for ada-002)
    const maxLength = 8000; // Conservative limit
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;
    
    return await generateOpenAIEmbedding(truncatedText);
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw error;
  }
}

/**
 * Generate embeddings for multiple texts (batch)
 */
export async function generateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  const results: EmbeddingResult[] = [];
  
  // Process in batches to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(text => generateEmbedding(text))
    );
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embeddings must have same dimensions');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find most similar embeddings
 */
export function findMostSimilar(
  queryEmbedding: number[],
  candidateEmbeddings: Array<{ id: string; embedding: number[] }>,
  topK: number = 5
): Array<{ id: string; similarity: number }> {
  const similarities = candidateEmbeddings.map(candidate => ({
    id: candidate.id,
    similarity: cosineSimilarity(queryEmbedding, candidate.embedding),
  }));
  
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}
