import { prisma } from '@/lib/prisma';
import { RAG_CONFIG } from './config';

export interface RAGDocumentChunk {
  id?: string;
  documentId: string;
  documentType: string;
  chunkIndex: number;
  content: string;
  metadata: any;
  embedding?: number[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QueryResult {
  chunk: RAGDocumentChunk;
  score: number;
  rank: number;
}

/**
 * Store document chunks with embeddings in Postgres using pgvector
 */
export async function storeChunks(chunks: RAGDocumentChunk[]): Promise<void> {
  for (const chunk of chunks) {
    const drawingNo = chunk.metadata?.drawingNo || null;
    const systemCode = chunk.metadata?.systemCode || null;
    const pageNo = chunk.metadata?.pageNo ? Number(chunk.metadata.pageNo) : null;
    const sheetNo = chunk.metadata?.sheetNo ? Number(chunk.metadata.sheetNo) : null;
    const entityRefs = chunk.metadata ? JSON.stringify(chunk.metadata) : '[]';

    if (chunk.embedding && chunk.embedding.length > 0) {
      const embeddingStr = `[${chunk.embedding.join(',')}]`;
      await prisma.$executeRawUnsafe(`
        INSERT INTO "DocumentChunk" ("id", "sourceFileId", "pageNo", "drawingNo", "sheetNo", "systemCode", "chunkType", "content", "embedding", "entityRefs", "createdAt")
        VALUES (
          gen_random_uuid()::text,
          $1, $2, $3, $4, $5, $6, $7,
          $8::vector,
          $9::jsonb,
          NOW()
        )
      `, 
        chunk.documentId, 
        pageNo, 
        drawingNo, 
        sheetNo, 
        systemCode, 
        chunk.documentType, 
        chunk.content, 
        embeddingStr,
        entityRefs
      );
    } else {
      await prisma.documentChunk.create({
        data: {
          sourceFileId: chunk.documentId,
          pageNo: pageNo,
          drawingNo: drawingNo,
          sheetNo: sheetNo,
          systemCode: systemCode,
          chunkType: chunk.documentType,
          content: chunk.content,
          entityRefs: chunk.metadata || [],
        }
      });
    }
  }
  console.log(`✅ Stored ${chunks.length} chunks to Postgres`);
}

/**
 * Vector similarity search
 */
export async function vectorSearch(
  embedding: number[],
  options: {
    topK?: number;
    filter?: any;
    threshold?: number;
  } = {}
): Promise<QueryResult[]> {
  const topK = options.topK || RAG_CONFIG.retrieval.topK;
  const threshold = options.threshold || RAG_CONFIG.retrieval.similarityThreshold;
  
  const embeddingString = `[${embedding.join(',')}]`;

  const results = await prisma.$queryRawUnsafe<any[]>(`
    SELECT 
      id, "sourceFileId", "pageNo", "drawingNo", "sheetNo", "systemCode", "chunkType", "content", "entityRefs",
      1 - (embedding <=> $1::vector) as similarity
    FROM "DocumentChunk"
    WHERE 1 - (embedding <=> $1::vector) >= $2
    ORDER BY embedding <=> $1::vector
    LIMIT $3
  `, embeddingString, threshold, topK);

  return results.map((doc, index) => {
    const meta = typeof doc.entityRefs === 'string' ? JSON.parse(doc.entityRefs) : doc.entityRefs;
    return {
      chunk: {
        id: doc.id,
        documentId: doc.sourceFileId,
        documentType: doc.chunkType,
        chunkIndex: 0,
        content: doc.content,
        metadata: meta,
      },
      score: doc.similarity,
      rank: index + 1,
    };
  });
}

/**
 * Hybrid search (vector + keyword) 
 */
export async function hybridSearch(
  query: string,
  embedding: number[],
  options: {
    topK?: number;
    filter?: any;
    vectorWeight?: number;
    keywordWeight?: number;
  } = {}
): Promise<QueryResult[]> {
  const topK = options.topK || RAG_CONFIG.retrieval.topK;
  const vectorWeight = options.vectorWeight || RAG_CONFIG.retrieval.vectorWeight;
  const keywordWeight = options.keywordWeight || RAG_CONFIG.retrieval.keywordWeight;
  
  const vectorResults = await vectorSearch(embedding, { topK, filter: options.filter });
  
  const keywordDocs = await prisma.documentChunk.findMany({
    where: {
      content: { contains: query, mode: 'insensitive' }
    },
    take: topK
  });

  const combined = new Map<string, { chunk: RAGDocumentChunk; vectorScore: number; keywordScore: number }>();
  
  vectorResults.forEach((result) => {
    combined.set(result.chunk.id!, {
      chunk: result.chunk,
      vectorScore: result.score,
      keywordScore: 0,
    });
  });
  
  keywordDocs.forEach((doc, index) => {
    const keywordScore = 1 - (index / keywordDocs.length);
    if (combined.has(doc.id)) {
      combined.get(doc.id)!.keywordScore = keywordScore;
    } else {
      const meta = typeof doc.entityRefs === 'string' ? JSON.parse(doc.entityRefs) : doc.entityRefs;
      combined.set(doc.id, {
        chunk: {
          id: doc.id,
          documentId: doc.sourceFileId,
          documentType: doc.chunkType,
          chunkIndex: 0,
          content: doc.content,
          metadata: meta,
        },
        vectorScore: 0,
        keywordScore,
      });
    }
  });
  
  const results: QueryResult[] = Array.from(combined.values())
    .map(item => ({
      chunk: item.chunk,
      score: (item.vectorScore * vectorWeight) + (item.keywordScore * keywordWeight),
      rank: 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((item, index) => ({ ...item, rank: index + 1 }));
  
  return results;
}

export async function getChunksByDocument(documentId: string): Promise<RAGDocumentChunk[]> {
  const docs = await prisma.documentChunk.findMany({
    where: { sourceFileId: documentId },
    orderBy: { createdAt: 'asc' }
  });
  
  return docs.map(doc => {
    const meta = typeof doc.entityRefs === 'string' ? JSON.parse(doc.entityRefs) : doc.entityRefs;
    return {
      id: doc.id,
      documentId: doc.sourceFileId,
      documentType: doc.chunkType,
      chunkIndex: 0,
      content: doc.content,
      metadata: meta,
    };
  });
}
