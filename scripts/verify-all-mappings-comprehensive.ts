#!/usr/bin/env npx tsx
/**
 * Comprehensive Drawing Mapping Verification
 * 
 * 1. Lists all drawings in the database
 * 2. Checks which have page mappings
 * 3. Cross-references with seed-complete.ts
 * 4. Shows missing mappings
 * 5. Shows multi-PDF conflicts
 * 
 * Usage: npx tsx scripts/verify-all-mappings-comprehensive.ts
 */

import { PrismaClient } from '@prisma/client';
import { ALL_DRAWING_MAPPINGS_MULTI, getMappingStatistics } from '../ACCURATE_DRAWING_PAGE_MAPPINGS';

const prisma = new PrismaClient();

async function main() {
  console.log('=== COMPREHENSIVE DRAWING MAPPING VERIFICATION ===\n');

  // 1. Get all drawings from DB
  const drawings = await prisma.drawing.findMany({
    include: {
      system: true,
      pageMappings: true,
      connectors: { select: { id: true } },
      _count: { select: { connectors: true, pages: true, trainLines: true } },
    },
    orderBy: { drawingNo: 'asc' },
  });

  console.log(`Total drawings in database: ${drawings.length}\n`);

  // 2. Get all page mappings from DB
  const dbMappings = await prisma.drawingPageMapping.findMany({
    orderBy: [{ drawingNumber: 'asc' }, { pdfPageNo: 'asc' }],
  });

  console.log(`Total page mappings in database: ${dbMappings.length}\n`);

  // 3. Get mapping file statistics
  const mappingStats = getMappingStatistics();
  console.log('=== MAPPING FILE STATISTICS ===');
  console.log(`Total mappings in ACCURATE file: ${mappingStats.totalMappings}`);
  console.log(`Unique drawings in ACCURATE file: ${mappingStats.uniqueDrawings}`);
  console.log(`Verified: ${mappingStats.verified}`);
  console.log(`Unverified: ${mappingStats.unverified}`);
  console.log(`Drawings in multiple PDFs: ${mappingStats.drawingsInMultiplePdfs.length}`);
  
  if (mappingStats.drawingsInMultiplePdfs.length > 0) {
    console.log('\nMulti-PDF drawings:');
    for (const d of mappingStats.drawingsInMultiplePdfs) {
      console.log(`  ${d.drawingNo}: ${d.pdfs.join(' + ')}`);
    }
  }

  console.log('\n=== PDF FILE COVERAGE ===');
  const byPdf = mappingStats.byPdf;
  for (const [pdf, count] of Object.entries(byPdf).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${pdf}: ${count} drawings`);
  }

  // 4. Check which DB drawings have page mappings
  const withDbMapping = drawings.filter(d => d.pageMappings.length > 0);
  const withoutDbMapping = drawings.filter(d => d.pageMappings.length === 0);

  console.log(`\n=== DATABASE MAPPING STATUS ===`);
  console.log(`Drawings WITH page mapping: ${withDbMapping.length} (${Math.round(withDbMapping.length / drawings.length * 100)}%)`);
  console.log(`Drawings WITHOUT page mapping: ${withoutDbMapping.length} (${Math.round(withoutDbMapping.length / drawings.length * 100)}%)`);

  if (withoutDbMapping.length > 0) {
    console.log('\nDrawings WITHOUT page mappings:');
    for (const d of withoutDbMapping) {
      const systemCode = d.system?.code || 'N/A';
      const hasAccurateMapping = ALL_DRAWING_MAPPINGS_MULTI[d.drawingNo] !== undefined;
      console.log(`  ${d.drawingNo} (${d.title}) [${systemCode}] - ${hasAccurateMapping ? 'HAS ACCURATE FILE MAPPING (not in DB)' : 'NO MAPPING ANYWHERE'}`);
    }
  }

  // 5. Check which ACCURATE file mappings are not in DB
  const accurateNotInDb: string[] = [];
  for (const [drawingNo, mappings] of Object.entries(ALL_DRAWING_MAPPINGS_MULTI)) {
    const dbDrawing = drawings.find(d => d.drawingNo === drawingNo);
    if (!dbDrawing) {
      accurateNotInDb.push(drawingNo);
    }
  }

  if (accurateNotInDb.length > 0) {
    console.log(`\n=== ACCURATE FILE DRAWINGS NOT IN DATABASE ===`);
    console.log(`Count: ${accurateNotInDb.length}`);
    for (const d of accurateNotInDb) {
      const mappings = ALL_DRAWING_MAPPINGS_MULTI[d];
      console.log(`  ${d}: ${mappings.map(m => `${m.pdfFile} p.${m.pageNumber}`).join(', ')}`);
    }
  }

  // 6. Check for page conflicts in DB
  console.log(`\n=== PAGE CONFLICTS IN DATABASE ===`);
  const byDrawingNo = new Map<string, typeof dbMappings>();
  for (const m of dbMappings) {
    if (!byDrawingNo.has(m.drawingNumber)) byDrawingNo.set(m.drawingNumber, []);
    byDrawingNo.get(m.drawingNumber)!.push(m);
  }

  let conflictCount = 0;
  for (const [drawingNo, mappings] of byDrawingNo) {
    const pages = mappings.map(m => m.pdfPageNo);
    const uniquePages = [...new Set(pages)];
    if (uniquePages.length > 1) {
      conflictCount++;
      console.log(`  CONFLICT: ${drawingNo} mapped to pages: ${pages.join(', ')}`);
      for (const m of mappings) {
        console.log(`    ${m.sourceFileName} → page ${m.pdfPageNo} (verified: ${m.verified})`);
      }
    }
  }
  if (conflictCount === 0) {
    console.log('  No page conflicts found.');
  }

  // 7. Drawings with connectors but no page mapping
  console.log(`\n=== DRAWINGS WITH CONNECTORS BUT NO PAGE MAPPING ===`);
  const withConnectorsNoMapping = drawings.filter(d => d._count.connectors > 0 && d.pageMappings.length === 0);
  console.log(`Count: ${withConnectorsNoMapping.length}`);
  for (const d of withConnectorsNoMapping.slice(0, 20)) {
    console.log(`  ${d.drawingNo} (${d._count.connectors} connectors) [${d.system?.code || 'N/A'}]`);
  }
  if (withConnectorsNoMapping.length > 20) {
    console.log(`  ... and ${withConnectorsNoMapping.length - 20} more`);
  }

  // 8. Summary
  console.log(`\n=== FINAL SUMMARY ===`);
  console.log(`Total DB drawings: ${drawings.length}`);
  console.log(`With DB page mapping: ${withDbMapping.length}`);
  console.log(`Without DB page mapping: ${withoutDbMapping.length}`);
  console.log(`ACCURATE file unique drawings: ${mappingStats.uniqueDrawings}`);
  console.log(`ACCURATE file total mappings: ${mappingStats.totalMappings}`);
  console.log(`Page conflicts: ${conflictCount}`);
  console.log(`Drawings in multiple PDFs: ${mappingStats.drawingsInMultiplePdfs.length}`);
  
  const coveragePct = Math.round(withDbMapping.length / drawings.length * 100);
  console.log(`\nDB mapping coverage: ${coveragePct}%`);
  console.log(`Target: 100% (all ${drawings.length} drawings should have page mappings)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
