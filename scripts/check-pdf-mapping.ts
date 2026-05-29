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
    
    console.log(`${drawing.drawingNo}: Page ${page?.pageNo || 1} (PDF Page: ${pdfPageNo})`);
  }

  // Check total mapped drawings
  const totalMapped = await prisma.drawingPage.count({
    where: {
      extra: {
        path: ['pdfPageNo'],
        not: null,
      },
    },
  });

  console.log(`\nTotal mapped drawings: ${totalMapped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
