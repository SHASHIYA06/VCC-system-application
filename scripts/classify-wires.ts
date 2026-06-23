/**
 * WIRE CLASSIFICATION & STATUS UPDATE - TASK 2
 * 
 * Classifies all wires and updates their status:
 * - VERIFIED: Wire numbers actually referenced by connector pins
 * - SYNTHETIC: Auto-generated variants that don't exist in drawings
 * - DEPRECATED: Mark synthetic as deprecated to exclude from searches
 */
import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   WIRE CLASSIFICATION & STATUS UPDATE');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Get all wire numbers referenced by pins (the REAL engineering source)
  const pinWireRefs = await prisma.connectorPin.findMany({
    where: { wireNo: { not: null, not: '' } },
    select: { wireNo: true },
    distinct: ['wireNo']
  });
  const realWireNumbers = new Set(pinWireRefs.map(p => p.wireNo!.trim().toUpperCase()));
  console.log(`Real wire numbers from pins: ${realWireNumbers.size}`);

  // 2. Update VERIFIED wires (referenced by pins) using raw SQL
  console.log('\nUpdating VERIFIED wires (referenced by connector pins)...');
  const wireNumbersArray = Array.from(realWireNumbers);
  
  // Process in batches to avoid parameter limits
  const batchSize = 100;
  let verifiedCount = 0;
  
  for (let i = 0; i < wireNumbersArray.length; i += batchSize) {
    const batch = wireNumbersArray.slice(i, i + batchSize);
    const result = await prisma.$executeRaw`
      UPDATE "Wire" 
      SET "wireStatus" = 'VERIFIED', 
          "verificationSource" = 'pin-reference',
          "verifiedAt" = NOW(),
          "updatedAt" = NOW()
      WHERE "wireNo" = ANY(${batch}::text[])
    `;
    verifiedCount += Number(result);
  }
  console.log(`  ✓ Marked ${verifiedCount} wires as VERIFIED`);

  // 3. Identify synthetic patterns
  const syntheticSuffixes = ['/1', '/2', '/3', '/4', '/5', '/6', '/7', '/8', '/9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // Get all wires that aren't verified
  const nonVerifiedWiresRaw = await prisma.$queryRaw<{id: string, "wireNo": string}[]>`
    SELECT id, "wireNo" FROM "Wire" WHERE "wireStatus" IS NULL OR "wireStatus" = 'UNVERIFIED'
  `;
  const nonVerifiedWires = nonVerifiedWiresRaw.map(w => ({ id: w.id, wireNo: w.wireNo }));
  
  console.log(`\nClassifying ${nonVerifiedWires.length} non-verified wires...`);

  let syntheticCount = 0;
  let deprecatedCount = 0;
  const processBatchSize = 1000;

  // Process in batches
  for (let i = 0; i < nonVerifiedWires.length; i += processBatchSize) {
    const batch = nonVerifiedWires.slice(i, i + batchSize);
    const syntheticWires = batch.filter(w => {
      const wNo = w.wireNo.toUpperCase();
      return syntheticSuffixes.some(suffix => wNo.endsWith(suffix));
    });

    if (syntheticWires.length > 0) {
      // Use raw SQL for enum handling - cast to text then check
      await prisma.$executeRaw`
        UPDATE "Wire" 
        SET "wireStatus" = 'DEPRECATED', 
            "verificationSource" = 'auto-generated-suffix',
            "updatedAt" = NOW()
        WHERE id IN (${Prisma.join(syntheticWires.map(w => w.id))})
      `;
      syntheticCount += syntheticWires.length;
    }

    // Mark remaining as DEPRECATED (unused)
    const deprecatedWires = batch.filter(w => !syntheticWires.some(s => s.id === w.id));
    if (deprecatedWires.length > 0) {
      await prisma.$executeRaw`
        UPDATE "Wire" 
        SET "wireStatus" = 'DEPRECATED', 
            "verificationSource" = 'unused-no-pin-reference',
            "updatedAt" = NOW()
        WHERE id IN (${Prisma.join(deprecatedWires.map(w => w.id))})
      `;
      deprecatedCount += deprecatedWires.length;
    }

    if ((i + processBatchSize) % 10000 === 0) {
      console.log(`  Processed ${Math.min(i + processBatchSize, nonVerifiedWires.length)}/${nonVerifiedWires.length}...`);
    }
  }

  console.log(`  ✓ Marked ${syntheticCount} synthetic wires as DEPRECATED`);
  console.log(`  ✓ Marked ${deprecatedCount} unused wires as DEPRECATED`);

  // 4. Get final counts using raw SQL
  const statusCountsRaw = await prisma.$queryRaw<{wireStatus: string, count: bigint}[]>`
    SELECT "wireStatus", COUNT(*)::int as count FROM "Wire" GROUP BY "wireStatus"
  `;

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   FINAL WIRE STATUS COUNTS');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  const totalWires = statusCountsRaw.reduce((sum, s) => sum + Number(s.count), 0);
  statusCountsRaw.forEach(s => {
    const pct = (Number(s.count) / totalWires * 100).toFixed(1);
    const label = (s.wireStatus || 'NULL').padEnd(12);
    console.log(`  ${label} ${Number(s.count).toLocaleString().padStart(8)} (${pct}%)`);
  });

  console.log('\n✅ Wire classification complete!\n');
  
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});