/**
 * Create Accurate PDF Page Mappings
 * This script creates precise mappings between drawing numbers and PDF pages
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Accurate PDF page mappings based on actual PDF structure
const PDF_PAGE_MAPPINGS = {
  'KMRCL VCC Drawings_OCR.pdf': {
    // Drawing List & Classification
    '942-58100': 3,   // Classification (4 sheets: pages 3-6)
    '942-58101': 7,   // Wiring Numbers
    '942-58102': 8,   // Symbols (4 sheets: pages 8-11)
    
    // Train Lines
    '942-58103': 12,  // Train Lines Control (4 sheets: pages 12-15)
    '942-58104': 16,  // Train Lines Signal (8 sheets: pages 16-23)
    '942-58105': 24,  // LT Power
    '942-58106': 25,  // HT Power
    
    // Cab Systems
    '942-58107': 26,  // Cab
    '942-58108': 27,  // Start-up (2 sheets: pages 27-28)
    '942-58109': 29,  // Status (2 sheets: pages 29-30)
    '942-58110': 31,  // MCB Trip
    '942-58111': 32,  // Supply Contactor
    '942-58112': 33,  // Head Cab Main Light
    '942-58113': 34,  // Tail Light
    '942-58114': 35,  // Interior Light
    '942-58115': 36,  // Saloon Light
    '942-58116': 37,  // Wiper
    '942-58117': 38,  // Coupling
    '942-58118': 39,  // Horn
    
    // Traction
    '942-58119': 40,  // Speed Control
    '942-58120': 41,  // VVVF (4 sheets: pages 41-44)
    '942-58121': 45,  // Return Current (6 sheets: pages 45-50)
    
    // Brake System
    '942-58123': 51,  // Compressor
    '942-58124': 52,  // Brake Loop
    '942-58125': 53,  // Emergency Brake
    '942-58126': 54,  // Parking Brake
    '942-58127': 55,  // Horn
    '942-58128': 56,  // Brake Control DMC (4 sheets: pages 56-59)
    '942-58129': 60,  // Brake Control TC
    
    // APS
    '942-58130': 61,  // APS
    '942-58131': 62,  // AC Shore Supply
    '942-58132': 63,  // Battery Control
    
    // Door System
    '942-58137': 64,  // Saloon Door Voltage
    '942-58138': 65,  // Left Door (2 sheets: pages 65-66)
    '942-58139': 67,  // Right Door (2 sheets: pages 67-68)
    '942-58140': 69,  // Door Proving Loop
    '942-58141': 70,  // Local Door Interlock
    '942-58142': 71,  // Door Communication
    
    // VAC
    '942-58143': 72,  // Cab VAC
    '942-58144': 73,  // Saloon VAC Power
    '942-58145': 74,  // Saloon VAC Control (2 sheets: pages 74-75)
    
    // Communications
    '942-58146': 76,  // TMS Interface
    '942-58147': 77,  // PIS/TIS
    '942-58148': 78,  // PIS/TIS Sheet 2
    '942-58149': 79,  // DVAS/PA
    '942-58150': 80,  // PA Amplifier
    '942-58151': 81,  // PA Amplifier Sheet 2
    '942-58152': 82,  // CBTC
    '942-58153': 83,  // Train Radio
    '942-58154': 84,  // CCTV
  },
  
  'CAB_PIN DRAWINGS.pdf': {
    '942-38103': 1,   // HV System PIN
    '942-38104': 8,   // Operating Panel (8 sheets: pages 8-15)
    '942-38105': 16,  // MCB Panel (3 sheets: pages 16-18)
    '942-38108': 24,  // Start-up Relay
    '942-38109': 27,  // PIS/TIS
    '942-38110': 42,  // DC Supply
    '942-38111': 28,  // DC Supply Contactor
    '942-38112': 29,  // Head Cab Main Light
    '942-38113': 30,  // Tail Light
    '942-38117': 33,  // Cab VAC
    '942-38118': 34,  // Wiper
    '942-38119': 35,  // Horn
    '942-38120': 37,  // Coupling
    '942-38121': 38,  // Speed Sensor
    '942-38122': 41,  // VVVF
    '942-38128': 46,  // Brake
  },
  
  'CAB_PIN DRAWINGS 2.pdf': {
    '942-38201': 1,   // Additional CAB pins
    '942-38202': 5,
    '942-38203': 10,
  },
  
  'DMC UF_PIN DRAWINGS.pdf': {
    '942-38305': 1,   // LTEB (2 sheets: pages 1-2)
    '942-38306': 3,   // VVVF (2 sheets: pages 3-4)
    '942-38307': 5,   // Collector Shoe JB
    '942-38308': 6,   // Stinger Box
    '942-38309': 7,   // DMC Underframe PIN
    '942-38310': 8,   // BCU
    '942-38311': 9,   // ASCOS
    '942-38312': 10,  // LTJB (3 sheets: pages 10-12)
    '942-38314': 15,  // Speed Sensor
    '942-38315': 14,  // Brake Resistor
    '942-38316': 17,  // Main Switch Box
    '942-38317': 16,  // Current Collector Fuse Box
    '942-38319': 19,  // HSCB
    '942-38320': 20,  // TM Connector
    '942-38321': 21,  // Earth Brush
    '942-38322': 22,  // Anti Skid Auto Coupler
    '942-38323': 26,  // HTEB HTJB
  },
  
  'DMC_CEILING.pdf': {
    '942-38402': 1,   // TCMS RIO1
    '942-38403': 3,   // DCU1
    '942-38404': 5,   // DCU2
    '942-38405': 7,   // DCU3
    '942-38406': 9,   // DCU4
    '942-38407': 11,  // EDB1
    '942-38409': 15,  // EDB3
    '942-38410': 17,  // EDB4
    '942-38411': 19,  // CCTV Controller
    '942-38413': 23,  // PIS Display
  },
  
  'TC _UF PIN DRAWINGS.pdf': {
    '942-38505': 2,   // LTEB
    '942-38506': 3,   // LTJB1 (3 sheets: pages 3-5)
    '942-38507': 7,   // LTJB2
    '942-38508': 8,   // BCU
    '942-38509': 9,   // ASCOS
    '942-38510': 10,  // Speed Sensor
    '942-38512': 12,  // APS (2 sheets: pages 12-13)
    '942-38514': 14,  // SIV
    '942-38515': 15,  // Battery
    '942-38516': 16,  // SSB
    '942-38518': 18,  // Earth Brush
    '942-38519': 19,  // Anti Skid
    '942-38520': 20,  // Auto Coupler
    '942-38521': 21,  // HTEB
  },
  
  'TC_CEILING PIN DRAWINGS.pdf': {
    '942-38602': 1,   // TCMS RIO2
    '942-38603': 3,   // VAC1
    '942-38605': 5,   // VAC2
    '942-38606': 7,   // PIS Controller
    '942-38607': 9,   // PA Amplifier
    '942-38608': 11,  // CCTV
    '942-38611': 17,  // TFT Display
    '942-38612': 19,  // DVAS
    '942-38614': 23,  // Emergency Intercom
  },
  
  'MC_CEILING_PIN DRAWINGS.pdf': {
    '942-38604': 3,   // Saloon Lights
    '942-38609': 16,  // MC Underframe
    '942-38610': 20,  // MC Ceiling
    '942-38705': 21,  // TCMS RIO
    '942-38706': 22,  // DCU
    '942-38707': 23,  // EDB
    '942-38709': 25,  // CCTV
    '942-38710': 26,  // PIS
    '942-38711': 27,  // PA
  },
  
  'MC_UF.pdf': {
    '942-38105': 1,   // LTEB
    '942-38106': 3,   // VVVF
    '942-38101': 6,   // Collector Shoe
    '942-38109': 7,   // Stinger Box
    '942-38110': 8,   // BCU
    '942-38111': 9,   // ASCOS
    '942-38112': 10,  // LTJB
    '942-38114': 13,  // Speed Sensor
    '942-38115': 14,  // Brake Resistor
    '942-38116': 15,  // Main Switch
    '942-38118': 18,  // HSCB
    '942-38119': 19,  // TM Connector
    '942-38120': 20,  // Earth Brush
    '942-38121': 22,  // Anti Skid
    '942-38122': 23,  // Auto Coupler
    '942-38123': 24,  // HTEB
    '942-38124': 25,  // HTJB
  },
};

async function createAccurateMappings() {
  console.log('🔧 Creating accurate PDF page mappings...\n');
  
  let updatedCount = 0;
  let createdCount = 0;
  
  for (const [pdfFile, mappings] of Object.entries(PDF_PAGE_MAPPINGS)) {
    console.log(`\n📄 Processing ${pdfFile}...`);
    
    for (const [drawingNo, pageNo] of Object.entries(mappings)) {
      try {
        // Find the drawing
        const drawing = await prisma.drawing.findFirst({
          where: {
            OR: [
              { drawingNo: { equals: drawingNo } },
              { drawingNo: { contains: drawingNo } },
            ],
          },
        });
        
        if (!drawing) {
          console.log(`  ⚠️  Drawing ${drawingNo} not found in database`);
          continue;
        }
        
        // Update or create the page mapping
        const existingPage = await prisma.drawingPage.findFirst({
          where: {
            drawingId: drawing.id,
            pageNo: 1,
          },
        });
        
        if (existingPage) {
          await prisma.drawingPage.update({
            where: { id: existingPage.id },
            data: {
              extra: {
                pdfPageNo: pageNo,
                sourceFile: pdfFile,
                verified: true,
                mappedAt: new Date().toISOString(),
              } as any,
            },
          });
          updatedCount++;
          console.log(`  ✅ Updated ${drawingNo} → Page ${pageNo}`);
        } else {
          await prisma.drawingPage.create({
            data: {
              drawingId: drawing.id,
              pageNo: 1,
              parseStatus: 'MAPPED',
              extra: {
                pdfPageNo: pageNo,
                sourceFile: pdfFile,
                verified: true,
                mappedAt: new Date().toISOString(),
              } as any,
            },
          });
          createdCount++;
          console.log(`  ✨ Created ${drawingNo} → Page ${pageNo}`);
        }
        
        // Also update the drawing's sourceFileId
        await prisma.drawing.update({
          where: { id: drawing.id },
          data: { sourceFileId: pdfFile },
        });
        
      } catch (error) {
        console.error(`  ❌ Error processing ${drawingNo}:`, error);
      }
    }
  }
  
  console.log(`\n✅ Mapping complete!`);
  console.log(`   Updated: ${updatedCount}`);
  console.log(`   Created: ${createdCount}`);
  console.log(`   Total: ${updatedCount + createdCount}`);
}

createAccurateMappings()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
