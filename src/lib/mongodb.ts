import { MongoClient, Db, Collection } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'vcc_documents';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongoDB(): Promise<Db> {
  if (db) return db;

  if (!client) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    await client.connect();
  }

  db = client.db(dbName);
  console.log('MongoDB connected:', dbName);
  return db;
}

export function getMongoDB(): Db {
  if (!db) throw new Error('MongoDB not connected. Call connectMongoDB() first.');
  return db;
}

export async function getCollection<T extends object>(name: string): Promise<Collection<T>> {
  const database = getMongoDB();
  return database.collection<T>(name);
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export interface VCCDocument {
  _id?: string;
  documentId: string;
  fileName: string;
  filePath: string;
  carType: string;
  subsystem: string;
  title: string;
  content: string;
  pageCount: number;
  metadata: Record<string, unknown>;
  embeddings?: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  _id?: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  pageNumber: number;
  startChar: number;
  endChar: number;
  embeddings?: number[];
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface WiringEntity {
  _id?: string;
  entityType: 'wire' | 'connector' | 'pin' | 'equipment' | 'trainline' | 'system';
  entityCode: string;
  carType: string;
  subsystem: string;
  name: string;
  description: string;
  properties: Record<string, unknown>;
  relatedEntities: string[];
  embeddings?: number[];
  createdAt: Date;
  updatedAt: Date;
}