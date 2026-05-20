/**
 * Document Chunking Service
 * Splits documents into optimal chunks for RAG retrieval
 */

import { RAG_CONFIG } from './config';

export interface TextChunk {
  content: string;
  index: number;
  startChar: number;
  endChar: number;
  tokens: number;
}

/**
 * Estimate token count (rough approximation)
 */
function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
}

/**
 * Split text by separators
 */
function splitBySeparators(text: string, separators: string[]): string[] {
  let chunks = [text];
  
  for (const separator of separators) {
    const newChunks: string[] = [];
    for (const chunk of chunks) {
      newChunks.push(...chunk.split(separator));
    }
    chunks = newChunks;
  }
  
  return chunks.filter(chunk => chunk.trim().length > 0);
}

/**
 * Chunk text with overlap
 */
export function chunkText(text: string, options?: {
  maxChunkSize?: number;
  overlap?: number;
  minChunkSize?: number;
}): TextChunk[] {
  const maxChunkSize = options?.maxChunkSize || RAG_CONFIG.chunking.maxChunkSize;
  const overlap = options?.overlap || RAG_CONFIG.chunking.overlap;
  const minChunkSize = options?.minChunkSize || RAG_CONFIG.chunking.minChunkSize;
  
  const chunks: TextChunk[] = [];
  let currentPosition = 0;
  let chunkIndex = 0;
  
  // First, try to split by paragraphs
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  let chunkStartChar = 0;
  
  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);
    const currentTokens = estimateTokens(currentChunk);
    
    // If adding this paragraph exceeds max size, save current chunk
    if (currentTokens + paragraphTokens > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunkIndex++,
        startChar: chunkStartChar,
        endChar: chunkStartChar + currentChunk.length,
        tokens: currentTokens,
      });
      
      // Start new chunk with overlap
      const overlapText = getOverlapText(currentChunk, overlap);
      currentChunk = overlapText + paragraph;
      chunkStartChar = chunkStartChar + currentChunk.length - overlapText.length - paragraph.length;
    } else {
      // Add paragraph to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }
  
  // Add final chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunkIndex++,
      startChar: chunkStartChar,
      endChar: chunkStartChar + currentChunk.length,
      tokens: estimateTokens(currentChunk),
    });
  }
  
  // Filter out chunks that are too small
  return chunks.filter(chunk => chunk.tokens >= minChunkSize);
}

/**
 * Get overlap text from end of chunk
 */
function getOverlapText(text: string, overlapTokens: number): string {
  const overlapChars = overlapTokens * 4; // Rough estimate
  if (text.length <= overlapChars) return text;
  
  // Try to break at sentence boundary
  const overlapText = text.slice(-overlapChars);
  const sentenceEnd = overlapText.lastIndexOf('. ');
  
  if (sentenceEnd > 0) {
    return overlapText.slice(sentenceEnd + 2);
  }
  
  return overlapText;
}

/**
 * Chunk document with metadata preservation
 */
export interface DocumentChunkInput {
  content: string;
  metadata: {
    documentId: string;
    documentType: string;
    title?: string;
    source?: string;
    [key: string]: any;
  };
}

export interface DocumentChunkOutput {
  content: string;
  chunkIndex: number;
  metadata: any;
  tokens: number;
}

export function chunkDocument(input: DocumentChunkInput): DocumentChunkOutput[] {
  const textChunks = chunkText(input.content);
  
  return textChunks.map(chunk => ({
    content: chunk.content,
    chunkIndex: chunk.index,
    metadata: {
      ...input.metadata,
      startChar: chunk.startChar,
      endChar: chunk.endChar,
    },
    tokens: chunk.tokens,
  }));
}

/**
 * Chunk multiple documents
 */
export function chunkDocuments(inputs: DocumentChunkInput[]): DocumentChunkOutput[] {
  const allChunks: DocumentChunkOutput[] = [];
  
  for (const input of inputs) {
    const chunks = chunkDocument(input);
    allChunks.push(...chunks);
  }
  
  return allChunks;
}

/**
 * Smart chunking for technical documents
 * Preserves tables, code blocks, and structured content
 */
export function chunkTechnicalDocument(text: string): TextChunk[] {
  const chunks: TextChunk[] = [];
  let chunkIndex = 0;
  
  // Detect and preserve tables
  const tableRegex = /(\|[^\n]+\|[\s\S]*?\n\s*\n)/g;
  const tables = [...text.matchAll(tableRegex)];
  
  // Detect and preserve code blocks
  const codeBlockRegex = /(```[\s\S]*?```)/g;
  const codeBlocks = [...text.matchAll(codeBlockRegex)];
  
  // Split text into sections
  const sections: Array<{ content: string; type: 'text' | 'table' | 'code'; start: number }> = [];
  let lastIndex = 0;
  
  // Add tables
  for (const match of tables) {
    if (match.index! > lastIndex) {
      sections.push({
        content: text.slice(lastIndex, match.index),
        type: 'text',
        start: lastIndex,
      });
    }
    sections.push({
      content: match[0],
      type: 'table',
      start: match.index!,
    });
    lastIndex = match.index! + match[0].length;
  }
  
  // Add code blocks
  for (const match of codeBlocks) {
    if (match.index! > lastIndex) {
      sections.push({
        content: text.slice(lastIndex, match.index),
        type: 'text',
        start: lastIndex,
      });
    }
    sections.push({
      content: match[0],
      type: 'code',
      start: match.index!,
    });
    lastIndex = match.index! + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    sections.push({
      content: text.slice(lastIndex),
      type: 'text',
      start: lastIndex,
    });
  }
  
  // Process sections
  for (const section of sections) {
    if (section.type === 'text') {
      // Chunk text normally
      const textChunks = chunkText(section.content);
      chunks.push(...textChunks.map(chunk => ({
        ...chunk,
        index: chunkIndex++,
        startChar: section.start + chunk.startChar,
        endChar: section.start + chunk.endChar,
      })));
    } else {
      // Keep tables and code blocks intact
      chunks.push({
        content: section.content,
        index: chunkIndex++,
        startChar: section.start,
        endChar: section.start + section.content.length,
        tokens: estimateTokens(section.content),
      });
    }
  }
  
  return chunks;
}
