#!/usr/bin/env tsx
/**
 * Fix PDF Mapping for Drawings
 * Creates comprehensive page mappings for all drawings
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Fixing PDF Mapping for Drawings...\n');

  // Get all drawings with sourceFile
  const drawings = await prisma.drawing.findMany({
    where: {
      sourceFileId: { not: null },
    },
    include: {
      pages: {
        orderBy: { pageNo: 'asc' },
        take: 1
      }
    }
  });

  console.log(`Found ${drawings.length} drawings with sourceFile\n`);

  // PDF file to drawing number prefix mappings
  const PDF_FILE_REGISTRY: Record<string, { prefix: string; description: string }> = {
    'KMRCL VCC Drawings_OCR.pdf': {
      prefix: '942-58',
      description: 'Main VCC Drawings (all schematics)',
    },
    'DMC UF_PIN DRAWINGS.pdf': {
      prefix: '942-383',
      description: 'DMC Underframe PIN Drawing',
    },
    'DMC_CEILING.pdf': {
      prefix: '942-384',
      description: 'DMC Ceiling PIN Drawing',
    },
    'TC _UF PIN DRAWINGS.pdf': {
      prefix: '942-385',
      description: 'TC Underframe PIN Drawing',
    },
    'TC_CEILING PIN DRAWINGS.pdf': {
      prefix: '942-386',
      description: 'TC Ceiling PIN Drawing',
    },
    'MC_UF.pdf': {
      prefix: '942-386',
      description: 'MC Underframe PIN Drawing',
    },
    'MC_CEILING_PIN DRAWINGS.pdf': {
      prefix: '942-387',
      description: 'MC Ceiling PIN Drawing',
    },
    'CAB_PIN DRAWINGS.pdf': {
      prefix: '942-381',
      description: 'CAB PIN Drawing',
    },
    'CAB_PIN DRAWINGS 2.pdf': {
      prefix: '942-382',
      description: 'CAB PIN Drawing (Part 2)',
    },
    'VCC DESCRIPTION 13.12.2017.pdf': {
      prefix: 'VCC-REF-',
      description: 'VCC System Description',
    },
  };

  // Create comprehensive page mappings
  let updated = 0;
  let skipped = 0;

  for (const drawing of drawings) {
    if (!drawing.sourceFileId) continue;

    // Get the source file name
    const sourceFile = typeof drawing.sourceFileId === 'string' 
      ? drawing.sourceFileId 
      : (drawing.sourceFileId as any).filename;

    if (!sourceFile) continue;

    // Find the matching PDF file
    let matchingPdf: { prefix: string; description: string } | null = null;
    for (const [pdfName, config] of Object.entries(PDF_FILE_REGISTRY)) {
      if (sourceFile.includes(pdfName)) {
        matchingPdf = config;
        break;
      }
    }

    if (!matchingPdf) {
      console.log(`  Skipping ${drawing.drawingNo}: No matching PDF found for ${sourceFile}`);
      skipped++;
      continue;
    }

    // Extract the numeric part of the drawing number
    const numMatch = drawing.drawingNo.match(/\d+/);
    if (!numMatch) {
      console.log(`  Skipping ${drawing.drawingNo}: No numeric part found`);
      skipped++;
      continue;
    }

    const num = parseInt(numMatch[0]);

    // Determine page number based on prefix and number
    let inferredPage = 1;

    // KMRCL VCC Drawings_OCR.pdf mapping
    if (matchingPdf.prefix === '942-58') {
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
        inferredPage = KMRCL_MAPPING[num] || 1;
      }
    }

    // CAB_PIN DRAWINGS mapping
    if (matchingPdf.prefix === '942-381' || matchingPdf.prefix === '942-382') {
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
      inferredPage = CAB_PIN_MAPPING[num] || 1;
    }

    // DMC UF_PIN DRAWINGS mapping
    if (matchingPdf.prefix === '942-383') {
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
      inferredPage = DMC_UF_MAPPING[num] || 1;
    }

    // Update the drawing page with the inferred page number
    try {
      await prisma.drawingPage.upsert({
        where: { drawingId_pageNo: { drawingId: drawing.id, pageNo: 1 } },
        update: { 
          extra: { 
            pdfPageNo: inferredPage, 
            sourceFile: sourceFile,
            verified: true,
            mappingSource: 'auto-generated' 
          } as any 
        },
        create: {
          drawingId: drawing.id,
          pageNo: 1,
          parseStatus: 'MAPPED',
          extra: { 
            pdfPageNo: inferredPage, 
            sourceFile: sourceFile,
            verified: true,
            mappingSource: 'auto-generated' 
          } as any
        }
      });
      updated++;
    } catch (error) {
      console.error(`Error updating ${drawing.drawingNo}:`, error);
    }

    if (updated % 50 === 0) {
      console.log(`  Progress: ${updated} updated, ${skipped} skipped`);
    }
  }

  console.log(`\n✅ PDF mapping fix complete!`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
