/**
 * Add wire status columns directly to the database
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding wire status columns...\n');

  // Add wireStatus column
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Wire" ADD COLUMN IF NOT EXISTS "wireStatus" VARCHAR(20) DEFAULT 'UNVERIFIED'
    `);
    console.log('✓ Added wireStatus column');
  } catch (e: any) {
    if (e.message?.includes('already exists')) {
      console.log('✓ wireStatus column already exists');
    } else {
      console.log('⚠ wireStatus:', e.message.slice(0, 100));
    }
  }

  // Add verificationSource column
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Wire" ADD COLUMN IF NOT EXISTS "verificationSource" TEXT
    `);
    console.log('✓ Added verificationSource column');
  } catch (e: any) {
    if (e.message?.includes('already exists')) {
      console.log('✓ verificationSource column already exists');
    } else {
      console.log('⚠ verificationSource:', e.message.slice(0, 100));
    }
  }

  // Add verifiedAt column
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Wire" ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP
    `);
    console.log('✓ Added verifiedAt column');
  } catch (e: any) {
    if (e.message?.includes('already exists')) {
      console.log('✓ verifiedAt column already exists');
    } else {
      console.log('⚠ verifiedAt:', e.message.slice(0, 100));
    }
  }

  // Create index
  try {
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "Wire_wireStatus_idx" ON "Wire"("wireStatus")
    `);
    console.log('✓ Created wireStatus index');
  } catch (e: any) {
    console.log('⚠ Index:', e.message.slice(0, 100));
  }

  console.log('\n✅ Wire status columns ready!\n');
  
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});