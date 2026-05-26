// src/lib/vectorStore.ts
import { MongoClient, Collection } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI!, {
  // Optional TLS settings are handled by the driver automatically
});

let vectorCollection: Collection<any> | null = null;

export async function getVectorCollection() {
  if (!vectorCollection) {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);
    vectorCollection = db.collection('vector_embeddings');
    // Ensure vector index exists – MongoDB Atlas Vector Search requires a special index definition.
    // This is a no‑op if the index already exists.
    await vectorCollection.createIndex({ embedding: 'vector' } as any);
  }
  return vectorCollection;
}

export async function upsertEmbedding(id: string, embedding: number[], metadata: Record<string, unknown>) {
  const coll = await getVectorCollection();
  await coll.updateOne(
    { _id: id },
    { $set: { embedding, metadata } },
    { upsert: true }
  );
}

export async function searchEmbedding(query: number[], k: number = 10) {
  const coll = await getVectorCollection();
  const results = await coll.aggregate([
    {
      $vectorSearch: {
        queryVector: query,
        limit: k,
        path: 'embedding',
      },
    },
    { $project: { _id: 1, score: 1, metadata: 1 } },
  ]).toArray();
  return results;
}
