import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Enabling pgvector extension...');
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log('pgvector enabled.');

    // Note: The table DocumentChunk is created by prisma db push, so we just need to create the index here
    console.log('Creating HNSW index on DocumentChunk.embedding...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_chunks_embedding_hnsw 
      ON "DocumentChunk" USING hnsw (embedding vector_cosine_ops);
    `);
    console.log('HNSW index created successfully.');
  } catch (error) {
    console.error('Error during vector setup:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
