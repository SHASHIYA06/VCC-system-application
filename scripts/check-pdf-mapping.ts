#!/usr/bin/env tsx
/**
 * Check PDF Page Mapping in Database
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking PDF Page Mapping in Database...\n');

  // Check specific drawings
  const drawings = await prisma.drawing.findMany({
    where: {
      drawingNo: {
        in: ['942-58120', '942-58121', '942-58128', '942-38103', '942-38305'],
      },
    },
    include: {
      pages: {
        orderBy: { pageNo: 'asc' },
        take: 1
      }
    }
  });

  console.log('Drawing PDF Page Mappings:');
  console.log('--------------------------');
  for (const drawing of drawings) {
    const page = drawing.pages[0];
    const extra = page?.extra as any;
    const pdfPageNo = extra?.pdfPageNo || 'Not set';
    
    if (page) {
      console.log(`${drawing.drawingNo}: Page ${page.pageNo} (PDF Page: ${pdfPageNo})`);
    } else {
      console.log(`${drawing.drawingNo}: No pages found`);
    }
  }

  // Check total mapped drawings (distinct drawing IDs)
  const totalMappedDrawings = await prisma.drawingPage.findMany({
    where: {
      extra: {
        path: ['pdfPageNo'],
        not: null,
      },
    },
    select: {
      drawingId: true
    },
    distinct: ['drawingId']
  });

  console.log(`\nTotal mapped drawings: ${totalMappedDrawings.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
