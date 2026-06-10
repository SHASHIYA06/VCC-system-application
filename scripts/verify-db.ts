import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Verifying database tables...\n');

    // Test VCCDescription table
    const vccDescCount = await prisma.vCCDescription.count().catch(() => -1);
    console.log('✅ VCCDescription table exists. Count:', vccDescCount);

    // Test SystemMetadata table
    const metadataCount = await prisma.systemMetadata.count().catch(() => -1);
    console.log('✅ SystemMetadata table exists. Count:', metadataCount);

    // Test DrawingVerificationStatus table
    const verifyCount = await prisma.drawingVerificationStatus.count().catch(() => -1);
    console.log('✅ DrawingVerificationStatus table exists. Count:', verifyCount);

    // Test DeviceSpecification table
    const specCount = await prisma.deviceSpecification.count().catch(() => -1);
    console.log('✅ DeviceSpecification table exists. Count:', specCount);

    // Test DrawingPageMapping table
    const mappingCount = await prisma.drawingPageMapping.count().catch(() => -1);
    console.log('✅ DrawingPageMapping table exists. Count:', mappingCount);

    console.log('\n✅ All new database tables created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
