/**
 * MongoDB Vector Store for RAG System
 * Handles document storage, embeddings, and vector search
 */

import { MongoClient, Db, Collection } from 'mongodb';
import { RAG_CONFIG } from './config';

let client: MongoClient | null = null;
let db: Db | null = null;

export interface DocumentChunk {
  _id?: string;
  documentId: string;
  documentType: 'drawing' | 'wire' | 'connector' | 'system' | 'description' | 'manual';
  chunkIndex: number;
  content: string;
  metadata: {
    drawingNo?: string;
    wireNo?: string;
    connectorCode?: string;
    systemCode?: string;
    carType?: string;
    pageNo?: number;
    sheetNo?: number;
    title?: string;
    source?: string;
  };
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryResult {
  chunk: DocumentChunk;
  score: number;
  rank: number;
}

/**
 * Connect to MongoDB
 */
export async function connectMongoDB(): Promise<Db> {
  if (db) return db;

  try {
    const uri = RAG_CONFIG.mongodb.uri;
    if (!uri) {
      throw new Error('MONGODB_URI not configured');
    }

    client = new MongoClient(uri);
    await client.connect();
    
    db = client.db(RAG_CONFIG.mongodb.database);
    
    console.log('✅ MongoDB connected:', RAG_CONFIG.mongodb.database);
    
    // Ensure indexes exist
    await ensureIndexes(db);
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Ensure required indexes exist
 */
async function ensureIndexes(database: Db) {
  const chunksCollection = database.collection<DocumentChunk>(RAG_CONFIG.mongodb.collections.chunks);
  
  // Text index for keyword search
  await chunksCollection.createIndex({ content: 'text', 'metadata.title': 'text' });
  
  // Metadata indexes
  await chunksCollection.createIndex({ documentId: 1 });
  await chunksCollection.createIndex({ documentType: 1 });
  await chunksCollection.createIndex({ 'metadata.drawingNo': 1 });
  await chunksCollection.createIndex({ 'metadata.wireNo': 1 });
  await chunksCollection.createIndex({ 'metadata.connectorCode': 1 });
  await chunksCollection.createIndex({ 'metadata.systemCode': 1 });
  
  // Vector search index (requires MongoDB Atlas)
  // This is created via Atlas UI or mongosh
  console.log('✅ MongoDB indexes ensured');
}

/**
 * Store document chunks with embeddings
 */
export async function storeChunks(chunks: DocumentChunk[]): Promise<void> {
  const database = await connectMongoDB();
  const collection = database.collection<DocumentChunk>(RAG_CONFIG.mongodb.collections.chunks);
  
  const operations = chunks.map(chunk => ({
    updateOne: {
      filter: { documentId: chunk.documentId, chunkIndex: chunk.chunkIndex },
      update: { $set: { ...chunk, updatedAt: new Date() } },
      upsert: true,
    },
  }));
  
  if (operations.length > 0) {
    await collection.bulkWrite(operations);
    console.log(`✅ Stored ${chunks.length} chunks`);
  }
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
  const database = await connectMongoDB();
  const collection = database.collection<DocumentChunk>(RAG_CONFIG.mongodb.collections.chunks);
  
  const topK = options.topK || RAG_CONFIG.retrieval.topK;
  const threshold = options.threshold || RAG_CONFIG.retrieval.similarityThreshold;
  
  // MongoDB Atlas Vector Search
  const pipeline: any[] = [
    {
      $vectorSearch: {
        index: RAG_CONFIG.mongodb.vectorIndex,
        path: 'embedding',
        queryVector: embedding,
        numCandidates: topK * 10,
        limit: topK,
      },
    },
    {
      $addFields: {
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ];
  
  // Add filters if provided
  if (options.filter) {
    pipeline.push({ $match: options.filter });
  }
  
  // Filter by threshold
  pipeline.push({ $match: { score: { $gte: threshold } } });
  
  const results = await collection.aggregate(pipeline).toArray();
  
  return results.map((doc, index) => ({
    chunk: doc as DocumentChunk,
    score: doc.score || 0,
    rank: index + 1,
  }));
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
  const database = await connectMongoDB();
  const collection = database.collection<DocumentChunk>(RAG_CONFIG.mongodb.collections.chunks);
  
  const topK = options.topK || RAG_CONFIG.retrieval.topK;
  const vectorWeight = options.vectorWeight || RAG_CONFIG.retrieval.vectorWeight;
  const keywordWeight = options.keywordWeight || RAG_CONFIG.retrieval.keywordWeight;
  
  // Vector search results
  const vectorResults = await vectorSearch(embedding, { topK, filter: options.filter });
  
  // Keyword search results
  const keywordResults = await collection
    .find({
      $text: { $search: query },
      ...options.filter,
    })
    .limit(topK)
    .toArray();
  
  // Combine and rerank
  const combined = new Map<string, { chunk: DocumentChunk; vectorScore: number; keywordScore: number }>();
  
  vectorResults.forEach((result, index) => {
    const id = result.chunk._id?.toString() || result.chunk.documentId;
    combined.set(id, {
      chunk: result.chunk,
      vectorScore: result.score,
      keywordScore: 0,
    });
  });
  
  keywordResults.forEach((doc, index) => {
    const id = doc._id?.toString() || doc.documentId;
    const existing = combined.get(id);
    const keywordScore = 1 - (index / keywordResults.length);
    
    if (existing) {
      existing.keywordScore = keywordScore;
    } else {
      combined.set(id, {
        chunk: doc as DocumentChunk,
        vectorScore: 0,
        keywordScore,
      });
    }
  });
  
  // Calculate hybrid scores
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

/**
 * Get chunks by document ID
 */
export async function getChunksByDocument(documentId: string): Promise<DocumentChunk[]> {
  const database = await connectMongoDB();
  const collection = database.collection<DocumentChunk>(RAG_CONFIG.mongodb.collections.chunks);
  
  return collection
    .find({ documentId })
    .sort({ chunkIndex: 1 })
    .toArray();
}

/**
 * Get chunks by metadata filter
 */
export async function getChunksByMetadata(filter: any): Promise<DocumentChunk[]> {
  const database = await connectMongoDB();
  const collection = database.collection<DocumentChunk>(RAG_CONFIG.mongodb.collections.chunks);
  
  const metadataFilter: any = {};
  Object.keys(filter).forEach(key => {
    metadataFilter[`metadata.${key}`] = filter[key];
  });
  
  return collection.find(metadataFilter).toArray();
}

/**
 * Delete chunks by document ID
 */
export async function deleteChunks(documentId: string): Promise<void> {
  const database = await connectMongoDB();
  const collection = database.collection<DocumentChunk>(RAG_CONFIG.mongodb.collections.chunks);
  
  await collection.deleteMany({ documentId });
  console.log(`✅ Deleted chunks for document: ${documentId}`);
}

/**
 * Get collection statistics
 */
export async function getStats(): Promise<{
  totalChunks: number;
  byType: Record<string, number>;
  byDrawing: Record<string, number>;
}> {
  const database = await connectMongoDB();
  const collection = database.collection<DocumentChunk>(RAG_CONFIG.mongodb.collections.chunks);
  
  const [totalChunks, byType, byDrawing] = await Promise.all([
    collection.countDocuments(),
    collection.aggregate([
      { $group: { _id: '$documentType', count: { $sum: 1 } } },
    ]).toArray(),
    collection.aggregate([
      { $match: { 'metadata.drawingNo': { $exists: true } } },
      { $group: { _id: '$metadata.drawingNo', count: { $sum: 1 } } },
      { $limit: 20 },
    ]).toArray(),
  ]);
  
  return {
    totalChunks,
    byType: Object.fromEntries(byType.map(item => [item._id, item.count])),
    byDrawing: Object.fromEntries(byDrawing.map(item => [item._id, item.count])),
  };
}

/**
 * Close MongoDB connection
 */
export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✅ MongoDB connection closed');
  }
}
