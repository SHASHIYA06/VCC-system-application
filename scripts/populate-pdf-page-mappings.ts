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

function inferPageFromDrawingNumber(drawingNo: string, sourceFile: string): number {
  // Strip prefix
  const cleanNo = drawingNo.replace(/^942[-_]/i, '');
  const numMatch = cleanNo.match(/\d+/);
  if (!numMatch) return 1;
  const num = parseInt(numMatch[0]);

  // DMC UF PIN Drawings mapping
  if (sourceFile.includes('DMC UF_PIN DRAWINGS')) {
    const DMC_UF_MAPPING: Record<number, number> = {
      38305: 1, // LTEB: 2 sheets (page 1, 2)
      38306: 3, // VVVF: 2 sheets (page 3, 4)
      38307: 5, // Collector Shoe JB: 1 sheet (page 5)
      38308: 6, // Stinger Box: 1 sheet (page 6)
      38309: 7, // DMC Underframe PIN: 1 sheet (page 7)
      38310: 8, // BCU: 1 sheet (page 8)
      38311: 9, // ASCOS: 1 sheet (page 9)
      38312: 10, // LTJB: 3 sheets (page 10, 11, 12)
      38314: 15, // Speed Sensor: 1 sheet (page 15)
      38315: 14, // Brake Resistor: 1 sheet (page 14)
      38316: 17, // Main Switch Box: 1 sheet (page 17)
      38317: 16, // Current Collector Fuse Box: 1 sheet (page 16)
      38319: 19, // HSCB: 1 sheet (page 19)
      38320: 20, // TM Connector: 1 sheet (page 20)
      38321: 21, // Earth Brush: 1 sheet (page 21)
      38322: 22, // Anti Skid Auto Coupler: 1 sheet (page 22)
      38323: 26  // HTEB HTJB: 1 sheet (page 26)
    };
    return DMC_UF_MAPPING[num] || 1;
  }

  // CAB PIN Drawings mapping
  if (sourceFile.includes('CAB_PIN DRAWINGS')) {
    const CAB_PIN_MAPPING: Record<number, number> = {
      38103: 1, // HV System PIN
      38104: 8, // Operating Panel: 8 sheets (pages 8-15)
      38105: 16, // MCB Panel: 3 sheets (pages 16-18)
      38108: 24, // Start-up Relay
      38109: 27, // PIS/TIS
      38111: 28, // DC Supply Contactor
      38112: 29, // Head Cab Main Light
      38113: 30, // Tail Light
      38117: 33, // Cab VAC
      38118: 34,
      38119: 35,
      38120: 37,
      38121: 38,
      38122: 41,
      38110: 42,
      38128: 46
    };
    return CAB_PIN_MAPPING[num] || 1;
  }

  // DMC Ceiling mapping
  if (sourceFile.includes('DMC_CEILING')) {
    const DMC_CEILING_MAPPING: Record<number, number> = {
      38402: 1,
      38403: 3,
      38404: 5,
      38405: 7,
      38406: 9,
      38407: 11,
      38409: 15,
      38410: 17,
      38411: 19,
      38413: 23
    };
    return DMC_CEILING_MAPPING[num] || 1;
  }

  // TC Underframe mapping
  if (sourceFile.includes('TC _UF')) {
    const TC_UF_MAPPING: Record<number, number> = {
      38505: 2,
      38506: 3, // LTJB1 (3 sheets: pages 3, 4, 5)
      38507: 7, // LTJB2
      38508: 8,
      38509: 9,
      38510: 10,
      38512: 12, // APS (2 sheets: pages 12, 13)
      38514: 14,
      38515: 15,
      38516: 16,
      38518: 18,
      38519: 19,
      38520: 20,
      38521: 21
    };
    return TC_UF_MAPPING[num] || 1;
  }

  // TC Ceiling mapping
  if (sourceFile.includes('TC_CEILING')) {
    const TC_CEILING_MAPPING: Record<number, number> = {
      38602: 1,
      38603: 3,
      38605: 5,
      38606: 7,
      38607: 9,
      38608: 11,
      38611: 17,
      38612: 19,
      38614: 23
    };
    return TC_CEILING_MAPPING[num] || 1;
  }

  // MC Ceiling mapping
  if (sourceFile.includes('MC_CEILING')) {
    const MC_CEILING_MAPPING: Record<number, number> = {
      38604: 3,  // Saloon Lights
      38609: 16, // MC Underframe
      38610: 20, // MC Ceiling
      38705: 21,
      38706: 22,
      38707: 23,
      38709: 25,
      38710: 26,
      38711: 27
    };
    return MC_CEILING_MAPPING[num] || 1;
  }

  // MC Underframe mapping
  if (sourceFile.includes('MC_UF')) {
    const MC_UF_MAPPING: Record<number, number> = {
      38105: 1,
      38106: 3,
      38101: 6,
      38109: 7,
      38110: 8,
      38111: 9,
      38112: 10,
      38114: 13,
      38115: 14,
      38116: 15,
      38118: 18,
      38119: 19,
      38120: 20,
      38121: 22,
      38122: 23,
      38123: 24,
      38124: 25
    };
    return MC_UF_MAPPING[num] || 1;
  }

  // Schematics file KMRCL VCC Drawings_OCR.pdf mapping
  if (sourceFile.includes('KMRCL VCC Drawings_OCR')) {
    if (num >= 58100 && num <= 58154) {
      const KMRCL_MAPPING: Record<number, number> = {
        58100: 3,  // Classification
        58101: 4,  // Wiring
        58102: 5,  // Symbols (4 sheets: 5-8)
        58103: 9,  // Train Lines Control (4 sheets: 9-12)
        58104: 13, // Train Lines Signal (8 sheets: 13-20)
        58105: 21, // LT Power
        58106: 22, // HT Power
        58107: 23, // Cab
        58108: 24, // Start-up (2 sheets: 24-25)
        58109: 26, // Status (2 sheets: 26-27)
        58110: 28, // MCB Trip
        58111: 29, // Supply Contactor
        58112: 30, // Head Cab
        58113: 31, // Tail Light
        58114: 32, // Interior
        58115: 33,
        58116: 34, // Wiper
        58117: 35, // Coupling
        58118: 36,
        58119: 37, // Speed
        58120: 38, // VVVF
        58121: 39, // Return Current (6 sheets: 39-44)
        58123: 45, // Compressor
        58124: 46, // Brake Loop
        58125: 47, // Emergency Brake
        58126: 48, // Parking Brake
        58127: 49, // Horn
        58128: 50, // Brake Control DMC
        58129: 51, // Brake Control TC
        58130: 52, // APS
        58131: 53, // AC Shore
        58132: 54, // Battery Control
        58137: 55, // Saloon Door Volt
        58138: 56, // Left Door (2 sheets: 56-57)
        58139: 58, // Right Door (2 sheets: 58-59)
        58140: 60, // Door Proving Loop
        58141: 61, // Local Door Interlock
        58142: 62, // Door Comm
        58143: 63, // Cab VAC
        58144: 64, // Saloon VAC Power
        58145: 65, // Saloon VAC Control (2 sheets: 65-66)
        58146: 67, // TMS Interface
        58147: 68, // PIS/TIS
        58148: 69, // PIS/TIS Sh2
        58149: 70, // DVAS/PA
        58150: 71, // PA Amp
        58151: 72, // PA Amp Sh2
        58152: 73, // CBTC
        58153: 74, // Train Radio
        58154: 75  // CCTV
      };
      return KMRCL_MAPPING[num] || 1;
    }
  }

  // System Description mapping
  if (sourceFile.includes('VCC DESCRIPTION')) {
    if (drawingNo.startsWith('VCC-REF-')) {
      const pageNum = parseInt(drawingNo.replace('VCC-REF-', ''));
      return pageNum || 1;
    }
  }

  return 1;
}

async function populatePdfPageMappings() {
  console.log('🚀 Starting PDF page mapping population with corrected logic...\n');
  
  const drawings = await prisma.drawing.findMany({
    orderBy: { drawingNo: 'asc' }
  });
  
  console.log(`Found ${drawings.length} drawings in database to process.`);
  
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalCreated = 0;
  let totalRedirected = 0;
  
  for (const drawing of drawings) {
    let sourceFile = drawing.sourceFileId || 'KMRCL VCC Drawings_OCR.pdf';
    
    // Redirect CAB_PIN DRAWINGS.pdf to CAB_PIN DRAWINGS 2.pdf (which has the OCR text layer)
    if (sourceFile === 'CAB_PIN DRAWINGS.pdf') {
      sourceFile = 'CAB_PIN DRAWINGS 2.pdf';
      await prisma.drawing.update({
        where: { id: drawing.id },
        data: { sourceFileId: sourceFile }
      });
      totalRedirected++;
    }
    
    const pdfPageNo = inferPageFromDrawingNumber(drawing.drawingNo, sourceFile);
    totalProcessed++;
    
    // Check if drawing page already exists
    const existingPage = await prisma.drawingPage.findFirst({
      where: { drawingId: drawing.id, pageNo: 1 }
    });
    
    const extra = {
      pdfPageNo,
      sourceFile,
      mappedAt: new Date().toISOString(),
      mappingSource: 'hardcoded_aligned'
    };
    
    if (existingPage) {
      await prisma.drawingPage.update({
        where: { id: existingPage.id },
        data: {
          extra,
          ocrText: existingPage.ocrText || `Auto-mapped to ${sourceFile} page ${pdfPageNo}`
        }
      });
      totalUpdated++;
    } else {
      await prisma.drawingPage.create({
        data: {
          drawingId: drawing.id,
          pageNo: 1,
          parseStatus: 'MAPPED',
          extra
        }
      });
      totalCreated++;
    }
    
    if (totalProcessed % 50 === 0 || pdfPageNo > 1) {
      console.log(`  Processed ${drawing.drawingNo} (${drawing.title}) -> ${sourceFile} page ${pdfPageNo}`);
    }
  }
  
  console.log(`\n✅ Mapping Population Complete!`);
  console.log(`📊 Summary:`);
  console.log(`   Total Processed: ${totalProcessed}`);
  console.log(`   Updated: ${totalUpdated}`);
  console.log(`   Created: ${totalCreated}`);
  console.log(`   CAB Redirects: ${totalRedirected}`);
}

populatePdfPageMappings()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
