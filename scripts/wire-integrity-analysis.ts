/**
 * WIRE INTEGRITY ANALYSIS - TASK 1 & 2
 * 
 * Analyzes the complete wire dataset to:
 * 1. Classify wires as: Verified (from pins), Synthetic (auto-generated), Duplicate, Unused, Missing
 * 2. Identify auto-generated suffixes and patterns
 * 3. Generate comprehensive wire_integrity_report
 * 
 * This is the foundation for wire reconstruction and synthetic wire removal.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface WireClassification {
  category: 'verified' | 'synthetic' | 'duplicate' | 'unused' | 'missing-referenced';
  wireNo: string;
  hasEndpoints: boolean;
  referencedByPin: boolean;
  source?: string;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   WIRE INTEGRITY ANALYSIS - ENGINEERING DATA ACCURACY');
  console.log('═══════════════════════════════════════════════════════════\n');

  // 1. Get ALL wires from the database
  const allWires = await prisma.wire.findMany({
    select: { 
      id: true, 
      wireNo: true, 
      signalName: true, 
      description: true,
      remarks: true 
    },
    orderBy: { wireNo: 'asc' }
  });

  console.log(`Total wires in database: ${allWires.length.toLocaleString()}\n`);

  // 2. Get all wire numbers referenced by pins (the REAL engineering source)
  const pinWireRefs = await prisma.connectorPin.findMany({
    where: { wireNo: { not: null, not: '' } },
    select: { wireNo: true },
    distinct: ['wireNo']
  });
  const realWireNumbers = new Set(pinWireRefs.map(p => p.wireNo!.trim().toUpperCase()));
  console.log(`Distinct wire numbers referenced by pins: ${realWireNumbers.size.toLocaleString()}`);

  // 3. Get wires that have actual endpoints (connected to pins)
  const wiresWithEndpoints = await prisma.wire.findMany({
    where: { endpoints: { some: {} } },
    select: { wireNo: true }
  });
  const wiresWithEndpointsSet = new Set(wiresWithEndpoints.map(w => w.wireNo.toUpperCase()));
  console.log(`Wires with actual termination endpoints: ${wiresWithEndpointsSet.size.toLocaleString()}\n`);

  // 4. Classify each wire
  const classified: WireClassification[] = [];
  const syntheticPatterns = ['/1', '/2', '/3', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  for (const wire of allWires) {
    const wNo = wire.wireNo.trim().toUpperCase();
    const normalized = wNo.replace(/-/g, '').replace(/\//g, '');
    
    const hasEndpoints = wiresWithEndpointsSet.has(wNo);
    const isReferencedByPin = realWireNumbers.has(wNo);
    
    // Check if this is a synthetic variant (auto-generated suffix)
    const isSyntheticVariant = syntheticPatterns.some(suffix => 
      wNo.endsWith(suffix) || wNo.endsWith('/' + suffix)
    );
    
    // Check if this looks like a base number (no suffix)
    const isBaseNumber = !syntheticPatterns.some(suffix => wNo.endsWith(suffix)) && 
                         !wNo.includes('/') && 
                         !wNo.match(/[A-Z]$/);

    let category: WireClassification['category'];
    let source = '';

    if (hasEndpoints && isReferencedByPin) {
      category = 'verified';
      source = 'pin-termination';
    } else if (isReferencedByPin && !hasEndpoints) {
      category = 'verified'; // Still verified, just no endpoint linked yet
      source = 'pin-reference';
    } else if (isSyntheticVariant && !isReferencedByPin) {
      category = 'synthetic';
      source = 'auto-generated-variant';
    } else if (!isReferencedByPin && !hasEndpoints) {
      // Check if it looks like a base number that should have variants
      if (isBaseNumber) {
        category = 'unused';
        source = 'base-number-no-pins';
      } else {
        category = 'unused';
        source = 'no-pin-reference';
      }
    } else {
      category = 'unused';
      source = 'unknown';
    }

    classified.push({
      category,
      wireNo: wire.wireNo,
      hasEndpoints,
      referencedByPin: isReferencedByPin,
      source
    });
  }

  // 5. Generate report statistics
  const verified = classified.filter(c => c.category === 'verified');
  const synthetic = classified.filter(c => c.category === 'synthetic');
  const unused = classified.filter(c => c.category === 'unused');

  console.log('═══════════════════════════════════════════════════════════');
  console.log('   WIRE INTEGRITY REPORT');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log('CATEGORY BREAKDOWN:');
  console.log(`  ✓ VERIFIED (real engineering data):     ${verified.length.toLocaleString()} (${(verified.length/allWires.length*100).toFixed(1)}%)`);
  console.log(`  ⚠ SYNTHETIC (auto-generated, not real): ${synthetic.length.toLocaleString()} (${(synthetic.length/allWires.length*100).toFixed(1)}%)`);
  console.log(`  ○ UNUSED (no pin reference):            ${unused.length.toLocaleString()} (${(unused.length/allWires.length*100).toFixed(1)}%)`);
  console.log('');

  // 6. Analyze synthetic patterns
  console.log('SYNTHETIC WIRE ANALYSIS:');
  const suffixCounts: Record<string, number> = {};
  synthetic.forEach(w => {
    const match = w.wireNo.match(/(\d+)(.+)?$/);
    if (match) {
      const suffix = match[2] || 'BASE';
      suffixCounts[suffix] = (suffixCounts[suffix] || 0) + 1;
    }
  });
  
  const sortedSuffixes = Object.entries(suffixCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);
  
  console.log('  Top suffix patterns in synthetic wires:');
  sortedSuffixes.forEach(([suffix, count]) => {
    console.log(`    ${suffix.padEnd(8)} ${count.toLocaleString()} wires`);
  });
  console.log('');

  // 7. Show sample verified wires (real engineering data)
  console.log('SAMPLE VERIFIED WIRES (Real Engineering Data):');
  verified.slice(0, 10).forEach(w => {
    console.log(`  ✓ ${w.wireNo.padEnd(15)} endpoints: ${w.hasEndpoints ? 'YES' : 'NO '} | pin-ref: ${w.referencedByPin ? 'YES' : 'NO '}`);
  });
  console.log('');

  // 8. Show sample synthetic wires  
  console.log('SAMPLE SYNTHETIC WIRES (Auto-Generated, NOT Real):');
  synthetic.slice(0, 10).forEach(w => {
    console.log(`  ⚠ ${w.wireNo.padEnd(15)} source: ${w.source}`);
  });
  console.log('');

  // 9. Analyze wire number patterns
  console.log('WIRE NUMBER PATTERN ANALYSIS:');
  const patterns = {
    'simple-numeric': 0,
    'with-dash': 0,
    'with-slash': 0,
    'with-letter-suffix': 0,
    'complex': 0
  };

  allWires.forEach(w => {
    const no = w.wireNo;
    if (/^\d+$/.test(no)) patterns['simple-numeric']++;
    else if (/^\d+-\d+$/.test(no)) patterns['with-dash']++;
    else if (/^\d+\/\d+$/.test(no)) patterns['with-slash']++;
    else if (/^[A-Z0-9]+-[A-Z0-9]+$/i.test(no)) patterns['with-letter-suffix']++;
    else patterns['complex']++;
  });

  Object.entries(patterns).forEach(([pattern, count]) => {
    console.log(`  ${pattern.padEnd(20)} ${count.toLocaleString()} (${(count/allWires.length*100).toFixed(1)}%)`);
  });
  console.log('');

  // 10. Recommendations
  console.log('═══════════════��═══════════════════════════════════════════');
  console.log('   RECOMMENDATIONS');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log(`1. IMMEDIATE: Mark ${synthetic.length.toLocaleString()} synthetic wires as DEPRECATED`);
  console.log(`   - These were auto-generated and do not represent real wiring`);
  console.log(`   - Keep for backward compatibility but exclude from searches\n`);
  
  console.log(`2. RECONSTRUCTION: Extract real wires from PIN drawings`);
  console.log(`   - Only ${realWireNumbers.size} distinct wire numbers are referenced`);
  console.log(`   - These represent the actual engineering data\n`);
  
  console.log(`3. CLEANUP PRIORITY:`);
  console.log(`   - Remove synthetic suffix generation from seeding scripts`);
  console.log(`   - Update search to prioritize verified wires`);
  console.log(`   - Update AI to exclude synthetic data from answers\n`);

  console.log('═══════════════════════════════════════════════════════════\n');

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});