/**
 * Populate PDF Page Mappings Script
 * 
 * This script populates the DrawingPage.extra.pdfPageNo field for all drawings
 * to ensure that clicking "View PDF" opens to the correct page instead of the full file.
 * 
 * Usage: npx tsx scripts/populate-pdf-page-mappings.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hardcoded PDF page mappings from pdf-mapping/route.ts
const PDF_PAGE_MAPPINGS: Record<string, Record<string, number>> = {
  'CAB_PIN DRAWINGS.pdf': {
    '58100': 1, '58101': 3, '58102': 5, '58103': 7, '58104': 9,
    '58105': 11, '58106': 13, '58107': 15, '58108': 17, '58109': 19,
    '58110': 21, '58111': 23, '58112': 25, '58113': 27, '58114': 29,
    '58115': 31, '58116': 33, '58117': 35, '58118': 37, '58119': 39,
    '58120': 41, '58121': 43, '58122': 45, '58123': 47
  },
  'CAB_PIN DRAWINGS 2.pdf': {
    '58124': 1, '58125': 3, '58126': 5, '58127': 7, '58128': 9,
    '58129': 11, '58130': 13, '58131': 15, '58132': 17, '58133': 19,
    '58134': 21, '58135': 23, '58136': 25, '58137': 27, '58138': 29,
    '58139': 31, '58140': 33, '58141': 35, '58142': 37, '58143': 39,
    '58144': 41, '58145': 43, '58146': 45, '58147': 47
  },
  'DMC_CEILING.pdf': {
    '58000': 1, '58001': 3, '58002': 5, '58003': 7, '58004': 9,
    '58005': 11, '58006': 13, '58007': 15, '58008': 17, '58009': 19,
    '58010': 21, '58011': 23, '58012': 25, '58013': 27
  },
  'DMC UF_PIN DRAWINGS.pdf': {
    '58050': 1, '58051': 3, '58052': 5, '58053': 7, '58054': 9,
    '58055': 11, '58056': 13, '58057': 15, '58058': 17, '58059': 19,
    '58060': 21, '58061': 23, '58062': 25
  },
  'TC_CEILING PIN DRAWINGS.pdf': {
    '58200': 1, '58201': 3, '58202': 5, '58203': 7, '58204': 9,
    '58205': 11, '58206': 13, '58207': 15, '58208': 17, '58209': 19,
    '58210': 21, '58211': 23, '58212': 25
  },
  'TC _UF PIN DRAWINGS.pdf': {
    '58250': 1, '58251': 3, '58252': 5, '58253': 7, '58254': 9,
    '58255': 11, '58256': 13, '58257': 15, '58258': 17, '58259': 19
  },
  'MC_CEILING_PIN DRAWINGS.pdf': {
    '58300': 1, '58301': 3, '58302': 5, '58303': 7, '58304': 9,
    '58305': 11, '58306': 13, '58307': 15, '58308': 17, '58309': 19,
    '58310': 21, '58311': 23, '58312': 25, '58313': 27, '58314': 29,
    '58315': 31, '58316': 33, '58317': 35, '58318': 37, '58319': 39,
    '58320': 41, '58321': 43, '58322': 45, '58323': 47, '58324': 49,
    '58325': 51, '58326': 53, '58327': 55, '58328': 57
  },
  'MC_UF.pdf': {
    '58350': 1, '58351': 3, '58352': 5, '58353': 7, '58354': 9,
    '58355': 11, '58356': 13, '58357': 15, '58358': 17, '58359': 19,
    '58360': 21, '58361': 23, '58362': 25, '58363': 27
  },
  'VCC DESCRIPTION 13.12.2017.pdf': {
    '942-58100': 1, '942-58101': 5, '942-58102': 9, '942-58103': 13, '942-58104': 17,
    '942-58105': 21, '942-58106': 25, '942-58107': 29, '942-58108': 33, '942-58109': 37,
    '942-58110': 41, '942-58111': 45, '942-58112': 49, '942-58113': 53
  }
};

function extractDrawingNumber(drawingNo: string): string {
  // Remove "942-" prefix and hyphens
  const cleaned = drawingNo.replace(/^942[-_]/i, '').replace(/-/g, '');
  return cleaned;
}

async function populatePdfPageMappings() {
  console.log('🚀 Starting PDF page mapping population...\n');
  
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalCreated = 0;
  let totalSkipped = 0;
  
  try {
    // Process each source file and its mappings
    for (const [sourceFile, mappings] of Object.entries(PDF_PAGE_MAPPINGS)) {
      console.log(`\n📄 Processing: ${sourceFile}`);
      console.log(`   Mappings: ${Object.keys(mappings).length} drawing prefixes`);
      
      let fileUpdated = 0;
      let fileCreated = 0;
      
      for (const [drawingPrefix, pdfPageNo] of Object.entries(mappings)) {
        // Find all drawings matching this prefix and source file
        const drawings = await prisma.drawing.findMany({
          where: {
            sourceFileId: sourceFile,
            OR: [
              { drawingNo: { contains: drawingPrefix } },
              { drawingNo: { startsWith: drawingPrefix } },
              { drawingNo: { contains: `942-${drawingPrefix}` } },
              { drawingNo: { contains: `942${drawingPrefix}` } }
            ]
          },
          include: {
            pages: {
              where: { pageNo: 1 },
              take: 1
            }
          }
        });
        
        if (drawings.length === 0) {
          console.log(`   ⚠️  No drawings found for prefix: ${drawingPrefix}`);
          totalSkipped++;
          continue;
        }
        
        for (const drawing of drawings) {
          totalProcessed++;
          
          // Check if page already exists
          const existingPage = drawing.pages[0];
          
          if (existingPage) {
            // Update existing page
            await prisma.drawingPage.update({
              where: { id: existingPage.id },
              data: {
                extra: {
                  pdfPageNo,
                  sourceFile,
                  mappedAt: new Date().toISOString(),
                  mappingSource: 'hardcoded'
                }
              }
            });
            fileUpdated++;
            totalUpdated++;
          } else {
            // Create new page
            await prisma.drawingPage.create({
              data: {
                drawingId: drawing.id,
                pageNo: 1,
                parseStatus: 'MAPPED',
                extra: {
                  pdfPageNo,
                  sourceFile,
                  mappedAt: new Date().toISOString(),
                  mappingSource: 'hardcoded'
                }
              }
            });
            fileCreated++;
            totalCreated++;
          }
          
          console.log(`   ✅ ${drawing.drawingNo} → Page ${pdfPageNo}`);
        }
      }
      
      console.log(`   📊 File Summary: ${fileUpdated} updated, ${fileCreated} created`);
    }
    
    // Now handle drawings without mappings using inference
    console.log('\n\n🔍 Processing drawings without explicit mappings (using inference)...');
    
    const unmappedDrawings = await prisma.drawing.findMany({
      where: {
        sourceFileId: { not: null },
        pages: {
          none: {
            extra: {
              path: ['pdfPageNo'],
              not: null
            }
          }
        }
      },
      include: {
        pages: {
          where: { pageNo: 1 },
          take: 1
        }
      },
      take: 100 // Limit to avoid overwhelming the system
    });
    
    console.log(`   Found ${unmappedDrawings.length} unmapped drawings`);
    
    let inferredCount = 0;
    
    for (const drawing of unmappedDrawings) {
      if (!drawing.sourceFileId) continue;
      
      const inferredPage = inferPageFromDrawingNumber(drawing.drawingNo, drawing.sourceFileId);
      
      if (inferredPage > 1) {
        const existingPage = drawing.pages[0];
        
        if (existingPage) {
          await prisma.drawingPage.update({
            where: { id: existingPage.id },
            data: {
              extra: {
                pdfPageNo: inferredPage,
                sourceFile: drawing.sourceFileId,
                mappedAt: new Date().toISOString(),
                mappingSource: 'inferred'
              }
            }
          });
        } else {
          await prisma.drawingPage.create({
            data: {
              drawingId: drawing.id,
              pageNo: 1,
              parseStatus: 'MAPPED',
              extra: {
                pdfPageNo: inferredPage,
                sourceFile: drawing.sourceFileId,
                mappedAt: new Date().toISOString(),
                mappingSource: 'inferred'
              }
            }
          });
        }
        
        inferredCount++;
        console.log(`   🔮 ${drawing.drawingNo} → Page ${inferredPage} (inferred)`);
      }
    }
    
    console.log(`\n\n✅ PDF Page Mapping Population Complete!`);
    console.log(`\n📊 Final Summary:`);
    console.log(`   Total Processed: ${totalProcessed}`);
    console.log(`   Updated: ${totalUpdated}`);
    console.log(`   Created: ${totalCreated}`);
    console.log(`   Inferred: ${inferredCount}`);
    console.log(`   Skipped: ${totalSkipped}`);
    console.log(`   Total Mapped: ${totalUpdated + totalCreated + inferredCount}`);
    
    // Verification query
    const verificationCount = await prisma.drawingPage.count({
      where: {
        extra: {
          path: ['pdfPageNo'],
          not: null
        }
      }
    });
    
    console.log(`\n✅ Verification: ${verificationCount} drawing pages now have PDF page mappings`);
    
  } catch (error) {
    console.error('\n❌ Error during PDF page mapping population:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function inferPageFromDrawingNumber(drawingNo: string, sourceFile: string): number {
  // Extract numeric part
  const numMatch = drawingNo.match(/\d+/);
  if (!numMatch) return 1;
  
  const num = parseInt(numMatch[0]);
  
  // For PIN drawings, typically each drawing is 2 pages (drawing + notes)
  // Try to calculate based on sequence
  if (sourceFile.includes('PIN')) {
    // Find the base number for this file
    if (sourceFile.includes('CAB_PIN DRAWINGS 2')) {
      // 58124-58147 range, starting at page 1
      const offset = num - 58124;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('CAB_PIN DRAWINGS')) {
      // 58100-58123 range, starting at page 1
      const offset = num - 58100;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('DMC_CEILING')) {
      const offset = num - 58000;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('DMC UF')) {
      const offset = num - 58050;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('TC_CEILING')) {
      const offset = num - 58200;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('TC _UF')) {
      const offset = num - 58250;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('MC_CEILING')) {
      const offset = num - 58300;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    } else if (sourceFile.includes('MC_UF')) {
      const offset = num - 58350;
      return offset >= 0 ? (offset * 2) + 1 : 1;
    }
  }
  
  return 1;
}

// Run the script
populatePdfPageMappings()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
