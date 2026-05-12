import { connectMongoDB, getCollection, VCCDocument, DocumentChunk } from '../mongodb';
import { prisma } from '../prisma';
import { DEFAULT_RAG_CONFIG, RAGConfig, ChunkSearchResult, WiringSearchResult } from './types';

const config = DEFAULT_RAG_CONFIG;

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
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

async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return simpleHashEmbedding(text);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error('Embedding API error');
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch {
    return simpleHashEmbedding(text);
  }
}

function simpleHashEmbedding(text: string): number[] {
  const hash = text.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);
  const embedding = new Array(1536).fill(0);
  for (let i = 0; i < 1536; i++) {
    embedding[i] = Math.sin(hash + i) * Math.cos(hash + i);
  }
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map((val) => val / norm);
}

function chunkText(text: string, chunkSize: number, overlap: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = start + chunkSize;
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
  }
  return chunks;
}

export async function indexDocument(
  documentId: string,
  fileName: string,
  carType: string,
  subsystem: string,
  title: string,
  content: string,
  pageCount: number
): Promise<void> {
  await connectMongoDB();

  const docsCollection = await getCollection<VCCDocument>('vcc_documents');
  const chunksCollection = await getCollection<DocumentChunk>('document_chunks');

  const existingDoc = await docsCollection.findOne({ documentId });
  if (existingDoc) {
    await docsCollection.deleteOne({ documentId });
    await chunksCollection.deleteMany({ documentId });
  }

  const embeddings = await generateEmbedding(content);
  await docsCollection.insertOne({
    documentId,
    fileName,
    filePath: `/DOCUMENTS/${fileName}`,
    carType,
    subsystem,
    title,
    content,
    pageCount,
    metadata: {},
    embeddings,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const chunks = chunkText(content, config.chunkSize, config.chunkOverlap);
  const chunkDocs = await Promise.all(
    chunks.map(async (chunk, index) => ({
      documentId,
      chunkIndex: index,
      content: chunk,
      pageNumber: Math.floor((index * content.length) / chunks.length / 2000) + 1,
      startChar: index * (config.chunkSize - config.chunkOverlap),
      endChar: (index + 1) * (config.chunkSize - config.chunkOverlap),
      embeddings: await generateEmbedding(chunk),
      metadata: {},
      createdAt: new Date(),
    }))
  );

  if (chunkDocs.length > 0) {
    await chunksCollection.insertMany(chunkDocs);
  }

  console.log(`Indexed document ${fileName} with ${chunks.length} chunks`);
}

export async function searchDocuments(query: string, topK: number = 5): Promise<ChunkSearchResult[]> {
  await connectMongoDB();

  const queryEmbedding = await generateEmbedding(query);
  const chunksCollection = await getCollection<DocumentChunk>('document_chunks');

  const chunks = await chunksCollection.find({}).limit(100).toArray();

  const scoredChunks = chunks
    .filter((chunk) => chunk.embeddings)
    .map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embeddings!),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const docsCollection = await getCollection<VCCDocument>('vcc_documents');

  const results: ChunkSearchResult[] = await Promise.all(
    scoredChunks.map(async (item) => {
      const doc = await docsCollection.findOne({ documentId: item.chunk.documentId });
      return {
        documentId: item.chunk.documentId,
        fileName: doc?.fileName || 'Unknown',
        pageNumber: item.chunk.pageNumber,
        content: item.chunk.content,
        score: item.score,
      };
    })
  );

  return results;
}

export async function searchWiring(
  query: string,
  carType?: string,
  subsystem?: string
): Promise<WiringSearchResult[]> {
  const normalizedQuery = query.toLowerCase();

  const whereClause: any = {
    OR: [
      { wireNo: { contains: normalizedQuery, mode: 'insensitive' } },
      { connectorCode: { contains: normalizedQuery, mode: 'insensitive' } },
      { signalName: { contains: normalizedQuery, mode: 'insensitive' } },
      { endpointLabel: { contains: normalizedQuery, mode: 'insensitive' } },
    ],
  };

  if (carType) {
    whereClause.connector = { device: { carType } };
  }

  const pins = await prisma.connectorPin.findMany({
    where: whereClause,
    include: {
      connector: {
        include: {
          device: {
            include: { system: true },
          },
        },
      },
    },
    take: 20,
  });

  return pins.map((pin) => ({
    entityType: 'pin',
    entityCode: `${pin.connector?.connectorCode || ''}-${pin.pinNo}`,
    name: pin.signalName || pin.endpointLabel || `Pin ${pin.pinNo}`,
    description: `Wire: ${pin.wireNo || 'N/A'}, Type: ${pin.wireType || 'N/A'}`,
    carType: pin.connector?.device?.carType || 'Unknown',
    subsystem: pin.connector?.device?.system?.code || 'Unknown',
    score: 1,
  }));
}

export async function getAllDocuments(): Promise<VCCDocument[]> {
  await connectMongoDB();
  const collection = await getCollection<VCCDocument>('vcc_documents');
  return collection.find({}).toArray();
}

export async function deleteDocument(documentId: string): Promise<void> {
  await connectMongoDB();
  const docsCollection = await getCollection<VCCDocument>('vcc_documents');
  const chunksCollection = await getCollection<DocumentChunk>('document_chunks');

  await docsCollection.deleteOne({ documentId });
  await chunksCollection.deleteMany({ documentId });
}

export async function reindexAllDocuments(): Promise<void> {
  const drawings = await prisma.drawingDocument.findMany({
    include: { pages: true },
  });

  for (const drawing of drawings) {
    const content = drawing.pages.map((p) => p.ocrText || '').join('\n\n');
    await indexDocument(
      drawing.id,
      drawing.sourceFile || drawing.drawingNo || 'unknown',
      drawing.carType || 'Unknown',
      drawing.subsystem || 'Unknown',
      drawing.title || 'Untitled',
      content,
      drawing.pages.length
    );
  }

  console.log(`Reindexed ${drawings.length} documents`);
}