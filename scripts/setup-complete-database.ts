#!/usr/bin/env tsx
// scripts/setup-complete-database.ts
// Reviews each document file and sets up complete database with drawing mappings

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// Complete drawing data extracted from VCC DESCRIPTION document
const DRAWING_CATALOG = [
  // GENERAL SYSTEM (Category 0)
  { drawingNo: '942-58099', title: 'Drawing List', systemCode: 'GENERAL', sheets: 1, category: 0, description: 'Master drawing register - complete list of all VCC drawings' },
  { drawingNo: '942-58100', title: 'Classification', systemCode: 'GENERAL', sheets: 1, category: 0, description: 'System classification - lists all subsystems and their categories' },
  { drawingNo: '942-58101', title: 'Wiring Numbers Description', systemCode: 'GENERAL', sheets: 1, category: 0, description: 'Wire numbering system - 5 digit format: UNIT+CAR_TYPE+TRAINLINES+SERIAL_NO' },
  { drawingNo: '942-58102', title: 'Symbols', systemCode: 'GENERAL', sheets: 4, category: 0, description: 'IEC standard symbols and abbreviations - multi-sheet document' },
  { drawingNo: '942-58103', title: 'Train Lines, Control', systemCode: 'GENERAL', sheets: 4, category: 0, description: 'Control train lines with X1 jumper connector - forward/reverse, brake, door, power' },
  { drawingNo: '942-58104', title: 'Train Lines, Signal', systemCode: 'GENERAL', sheets: 8, category: 0, description: 'Signal train lines with RS422/RS485 communication - CBTC, Ethernet, CCTV' },
  { drawingNo: '942-58105', title: 'Train Lines, Low Tension Power', systemCode: 'GENERAL', sheets: 1, category: 0, description: 'Low tension 110VDC power distribution train lines' },
  { drawingNo: '942-58106', title: 'Train Lines, High Tension Power', systemCode: 'GENERAL', sheets: 1, category: 0, description: 'High tension 750VDC propulsion power train lines' },

  // TRAIN CONTROL (Category 1)
  { drawingNo: '942-58107', title: 'Controlling Cab', systemCode: 'AUX', sheets: 1, category: 1, description: 'Cab equipment control - active cab designation' },
  { drawingNo: '942-58108', title: 'Start-up Relay', systemCode: 'AUX', sheets: 1, category: 1, description: 'System start-up relay control circuit' },
  { drawingNo: '942-58109', title: 'System Status Indication', systemCode: 'AUX', sheets: 2, category: 1, description: 'System status indicator lights - car specific sheets' },
  { drawingNo: '942-58110', title: 'MCB Trip Status Monitoring', systemCode: 'AUX', sheets: 2, category: 1, description: 'Main circuit breaker trip status monitoring with TCMS' },
  { drawingNo: '942-58111', title: 'DC Train Line Supply Contactor', systemCode: 'AUX', sheets: 1, category: 1, description: 'DC train line power supply contactor control' },

  // VEHICLE STRUCTURE (Category 2)
  { drawingNo: '942-58112', title: 'Head Cab Main Light', systemCode: 'GENERAL', sheets: 1, category: 2, description: 'Head cab front light circuit' },
  { drawingNo: '942-58113', title: 'Tail Light, Flasher Light, Console Light', systemCode: 'GENERAL', sheets: 1, category: 2, description: 'Tail and marker lights' },
  { drawingNo: '942-58114', title: 'Interior Light', systemCode: 'GENERAL', sheets: 1, category: 2, description: 'Saloon interior lighting circuit' },
  { drawingNo: '942-58115', title: 'Interior Light (continued)', systemCode: 'GENERAL', sheets: 1, category: 2, description: 'Saloon interior lighting circuit continuation' },
  { drawingNo: '942-58116', title: 'Windscreen Wiper', systemCode: 'GENERAL', sheets: 1, category: 2, description: 'Driver windscreen wiper circuit' },

  // COUPLING (Category 4)
  { drawingNo: '942-58117', title: 'Coupling Uncoupling Control', systemCode: 'GENERAL', sheets: 1, category: 4, description: 'Train coupling/uncoupling control' },

  // TRACTION SYSTEM (Category 5)
  { drawingNo: '942-58119', title: 'Speed Control', systemCode: 'TRACTION', sheets: 2, category: 5, description: 'Traction speed control system' },
  { drawingNo: '942-58120', title: 'VVVF Control', systemCode: 'TRACTION', sheets: 1, category: 5, description: 'Variable Voltage Variable Frequency inverter control' },
  { drawingNo: '942-58121', title: 'Traction Return Current', systemCode: 'TRACTION', sheets: 1, category: 5, description: 'Traction motor return current path' },

  // BRAKE SYSTEM (Category 6)
  { drawingNo: '942-58123', title: 'Compressor Control', systemCode: 'BRAKE', sheets: 1, category: 6, description: 'Air brake compressor control (TC car only)' },
  { drawingNo: '942-58124', title: 'Brake Loop', systemCode: 'BRAKE', sheets: 1, category: 6, description: 'Brake control loop circuit - fail-safe normally energized' },
  { drawingNo: '942-58125', title: 'Emergency Brake', systemCode: 'BRAKE', sheets: 2, category: 6, description: 'Emergency brake circuit - multi-sheet' },
  { drawingNo: '942-58126', title: 'Parking Brake', systemCode: 'BRAKE', sheets: 1, category: 6, description: 'Parking brake application circuit' },
  { drawingNo: '942-58127', title: 'Horn', systemCode: 'BRAKE', sheets: 1, category: 6, description: 'Driver horn control (DMC only)' },
  { drawingNo: '942-58128', title: 'Brake Control (DMC, MC)', systemCode: 'BRAKE', sheets: 1, category: 6, description: 'Brake control circuit for DMC and MC cars' },
  { drawingNo: '942-58129', title: 'Brake Control (TC)', systemCode: 'BRAKE', sheets: 1, category: 6, description: 'Brake control circuit for TC car' },

  // AUXILIARY SYSTEM (Category 7)
  { drawingNo: '942-58130', title: 'APS', systemCode: 'AUX', sheets: 2, category: 7, description: 'Auxiliary Power Supply - 750VDC to 415VAC/230VAC conversion' },
  { drawingNo: '942-58131', title: 'AC 415V Shore Supply Circuit', systemCode: 'AUX', sheets: 1, category: 7, description: 'AC 415V shore supply connection circuit' },
  { drawingNo: '942-58132', title: 'Battery Control', systemCode: 'AUX', sheets: 1, category: 7, description: 'Battery charging and control circuit - 110VDC' },

  // DOOR SYSTEM (Category 8)
  { drawingNo: '942-58136', title: 'Door Operation Left', systemCode: 'DOOR', sheets: 1, category: 8, description: 'Left door operation control - DMC/TC/MC' },
  { drawingNo: '942-58137', title: 'Saloon Door Supply Voltage', systemCode: 'DOOR', sheets: 1, category: 8, description: 'Saloon door power supply voltage selection' },
  { drawingNo: '942-58138', title: 'Door Operation Left (revised)', systemCode: 'DOOR', sheets: 1, category: 8, description: 'Left door operation - revised version' },
  { drawingNo: '942-58139', title: 'Door Operation Right', systemCode: 'DOOR', sheets: 2, category: 8, description: 'Right door operation - multi-sheet' },
  { drawingNo: '942-58140', title: 'Door Proving Loop', systemCode: 'DOOR', sheets: 1, category: 8, description: 'Door closed/open proving loop circuit' },
  { drawingNo: '942-58141', title: 'Local Door Interlock', systemCode: 'DOOR', sheets: 1, category: 8, description: 'Local door interlock circuit' },
  { drawingNo: '942-58142', title: 'Door Communication With IMS', systemCode: 'DOOR', sheets: 1, category: 8, description: 'Door system communication with IMS/TIMS' },

  // AIR CONDITIONING (Category 9)
  { drawingNo: '942-58143', title: 'Cab VAC', systemCode: 'AIRCON', sheets: 1, category: 9, description: 'Cab air conditioning control (DMC only)' },
  { drawingNo: '942-58144', title: 'Saloon VAC Power', systemCode: 'AIRCON', sheets: 1, category: 9, description: 'Saloon AC power supply circuit' },
  { drawingNo: '942-58145', title: 'Saloon VAC Control', systemCode: 'AIRCON', sheets: 2, category: 9, description: 'Saloon AC control - multi-sheet' },

  // TIMS (Category 10)
  { drawingNo: '942-58146', title: 'TCMS Communication', systemCode: 'TIMS', sheets: 4, category: 10, description: 'Train Control Monitoring System communication - dual Ethernet ring' },

  // COMMUNICATION (Category 11)
  { drawingNo: '942-58147', title: 'TFT FDI-TNI DMC', systemCode: 'COMM', sheets: 1, category: 11, description: 'TFT display for DMC car' },
  { drawingNo: '942-58148', title: 'TFT TC, MC', systemCode: 'COMM', sheets: 1, category: 11, description: 'TFT display for TC and MC cars' },
  { drawingNo: '942-58149', title: 'CCU, PAPIS CCTV System DMC', systemCode: 'COMM', sheets: 1, category: 11, description: 'Central Control Unit, PAPIS, CCTV for DMC' },
  { drawingNo: '942-58150', title: 'PA Amplifier DMC, MC', systemCode: 'COMM', sheets: 1, category: 11, description: 'Public Address amplifier for DMC and MC' },
  { drawingNo: '942-58151', title: 'PA Amplifier TC', systemCode: 'COMM', sheets: 1, category: 11, description: 'Public Address amplifier for TC' },
  { drawingNo: '942-58152', title: 'CBTC', systemCode: 'COMM', sheets: 5, category: 11, description: 'Communication Based Train Control - multi-sheet' },
  { drawingNo: '942-58153', title: 'Train Radio Interface', systemCode: 'COMM', sheets: 1, category: 11, description: 'Train radio communication interface' },
  { drawingNo: '942-58154', title: 'CCTV', systemCode: 'COMM', sheets: 1, category: 11, description: 'Closed Circuit Television system' },

  // PIN DRAWINGS (942-38xxx)
  // CAB PIN DRAWINGS 2.pdf
  { drawingNo: '942-38104', title: 'CAB PIN Assignment', systemCode: 'CAB', sheets: 1, category: 1, description: 'CAB connector pin assignment' },
  { drawingNo: '942-38105', title: 'CAB PIN Assignment (continued)', systemCode: 'CAB', sheets: 1, category: 1, description: 'CAB connector pin assignment continuation' },
  { drawingNo: '942-38108', title: 'CAB PIN Assignment', systemCode: 'CAB', sheets: 1, category: 1, description: 'CAB connector pin assignment' },
  { drawingNo: '942-38109', title: 'CAB PIN Assignment', systemCode: 'CAB', sheets: 1, category: 1, description: 'CAB connector pin assignment' },
  { drawingNo: '942-38119', title: 'CAB PIN Assignment', systemCode: 'CAB', sheets: 1, category: 1, description: 'CAB connector pin assignment' },

  // DMC UF PIN DRAWINGS.pdf
  { drawingNo: '942-38310', title: 'DMC UF PIN Assignment', systemCode: 'LTEB', sheets: 1, category: 8, description: 'DMC underframe connector pin assignment' },
  { drawingNo: '942-38312', title: 'DMC UF PIN Assignment', systemCode: 'LTEB', sheets: 1, category: 8, description: 'DMC underframe connector pin assignment' },
  { drawingNo: '942-38314', title: 'DMC UF PIN Assignment', systemCode: 'LTEB', sheets: 1, category: 8, description: 'DMC underframe connector pin assignment' },

  // DMC_CEILING.pdf
  { drawingNo: '942-38209', title: 'DMC Ceiling PIN Assignment', systemCode: 'LIGHT', sheets: 1, category: 2, description: 'DMC ceiling connector pin assignment' },
  { drawingNo: '942-38212', title: 'DMC Ceiling PIN Assignment', systemCode: 'LIGHT', sheets: 1, category: 2, description: 'DMC ceiling connector pin assignment' },
  { drawingNo: '942-38214', title: 'DMC Ceiling PIN Assignment', systemCode: 'LIGHT', sheets: 1, category: 2, description: 'DMC ceiling connector pin assignment' },
  { drawingNo: '942-38217', title: 'DMC Ceiling PIN Assignment', systemCode: 'LIGHT', sheets: 1, category: 2, description: 'DMC ceiling connector pin assignment' },

  // TC _UF PIN DRAWINGS.pdf
  { drawingNo: '942-38506', title: 'TC UF PIN Assignment', systemCode: 'LTEB', sheets: 1, category: 8, description: 'TC underframe connector pin assignment' },
  { drawingNo: '942-38518', title: 'TC UF PIN Assignment', systemCode: 'LTEB', sheets: 1, category: 8, description: 'TC underframe connector pin assignment' },
  { drawingNo: '942-38519', title: 'TC UF PIN Assignment', systemCode: 'LTEB', sheets: 1, category: 8, description: 'TC underframe connector pin assignment' },

  // TC_CEILING PIN DRAWINGS.pdf
  { drawingNo: '942-38408', title: 'TC Ceiling PIN Assignment', systemCode: 'LIGHT', sheets: 1, category: 2, description: 'TC ceiling connector pin assignment' },

  // MC_UF.pdf
  { drawingNo: '942-38101', title: 'MC UF PIN Assignment', systemCode: 'LTJB', sheets: 1, category: 8, description: 'MC underframe connector pin assignment' },
  { drawingNo: '942-38106', title: 'MC UF PIN Assignment', systemCode: 'LTJB', sheets: 1, category: 8, description: 'MC underframe connector pin assignment' },
  { drawingNo: '942-38110', title: 'MC UF PIN Assignment', systemCode: 'LTJB', sheets: 1, category: 8, description: 'MC underframe connector pin assignment' },
  { drawingNo: '942-38111', title: 'MC UF PIN Assignment', systemCode: 'LTJB', sheets: 1, category: 8, description: 'MC underframe connector pin assignment' },
  { drawingNo: '942-38112', title: 'MC UF PIN Assignment', systemCode: 'LTJB', sheets: 1, category: 8, description: 'MC underframe connector pin assignment' },
  { drawingNo: '942-38114', title: 'MC UF PIN Assignment', systemCode: 'LTJB', sheets: 1, category: 8, description: 'MC underframe connector pin assignment' },
  { drawingNo: '942-38115', title: 'MC UF PIN Assignment', systemCode: 'LTJB', sheets: 1, category: 8, description: 'MC underframe connector pin assignment' },
  { drawingNo: '942-38116', title: 'MC UF PIN Assignment', systemCode: 'LTJB', sheets: 1, category: 8, description: 'MC underframe connector pin assignment' },
  { drawingNo: '942-38118', title: 'MC UF PIN Assignment', systemCode: 'LTJB', sheets: 1, category: 8, description: 'MC underframe connector pin assignment' },
  { drawingNo: '942-38120', title: 'MC UF PIN Assignment', systemCode: 'LTJB', sheets: 1, category: 8, description: 'MC underframe connector pin assignment' },
  { drawingNo: '942-38121', title: 'MC UF PIN Assignment', systemCode: 'LTJB', sheets: 1, category: 8, description: 'MC underframe connector pin assignment' },

  // MC_CEILING_PIN DRAWINGS.pdf
  { drawingNo: '942-38604', title: 'MC Ceiling PIN Assignment', systemCode: 'LIGHT', sheets: 1, category: 2, description: 'MC ceiling connector pin assignment' },
  { drawingNo: '942-38609', title: 'MC Ceiling PIN Assignment', systemCode: 'LIGHT', sheets: 1, category: 2, description: 'MC ceiling connector pin assignment' },
  { drawingNo: '942-38610', title: 'MC Ceiling PIN Assignment', systemCode: 'LIGHT', sheets: 1, category: 2, description: 'MC ceiling connector pin assignment' },
];

// PDF file to drawing mapping
const PDF_DRAWING_MAP: Record<string, { drawingNo: string; pdfPageNo: number }[]> = {
  'KMRCL VCC Drawings_OCR.pdf': [
    { drawingNo: '942-58099', pdfPageNo: 2 },
    { drawingNo: '942-58100', pdfPageNo: 3 },
    { drawingNo: '942-58101', pdfPageNo: 4 },
    { drawingNo: '942-58102', pdfPageNo: 5 },
    { drawingNo: '942-58103', pdfPageNo: 9 },
    { drawingNo: '942-58104', pdfPageNo: 13 },
    { drawingNo: '942-58105', pdfPageNo: 21 },
    { drawingNo: '942-58106', pdfPageNo: 22 },
    { drawingNo: '942-58108', pdfPageNo: 24 },
    { drawingNo: '942-58109', pdfPageNo: 26 },
    { drawingNo: '942-58110', pdfPageNo: 27 },
    { drawingNo: '942-58111', pdfPageNo: 29 },
    { drawingNo: '942-58112', pdfPageNo: 30 },
    { drawingNo: '942-58113', pdfPageNo: 31 },
    { drawingNo: '942-58114', pdfPageNo: 32 },
    { drawingNo: '942-58115', pdfPageNo: 33 },
    { drawingNo: '942-58116', pdfPageNo: 34 },
    { drawingNo: '942-58119', pdfPageNo: 36 },
    { drawingNo: '942-58120', pdfPageNo: 38 },
    { drawingNo: '942-58121', pdfPageNo: 39 },
    { drawingNo: '942-58123', pdfPageNo: 40 },
    { drawingNo: '942-58125', pdfPageNo: 43 },
    { drawingNo: '942-58126', pdfPageNo: 44 },
    { drawingNo: '942-58128', pdfPageNo: 46 },
    { drawingNo: '942-58130', pdfPageNo: 48 },
    { drawingNo: '942-58131', pdfPageNo: 50 },
    { drawingNo: '942-58132', pdfPageNo: 51 },
    { drawingNo: '942-58138', pdfPageNo: 54 },
    { drawingNo: '942-58139', pdfPageNo: 55 },
    { drawingNo: '942-58140', pdfPageNo: 57 },
    { drawingNo: '942-58141', pdfPageNo: 58 },
    { drawingNo: '942-58143', pdfPageNo: 60 },
    { drawingNo: '942-58144', pdfPageNo: 61 },
    { drawingNo: '942-58146', pdfPageNo: 64 },
    { drawingNo: '942-58148', pdfPageNo: 69 },
    { drawingNo: '942-58149', pdfPageNo: 70 },
    { drawingNo: '942-58150', pdfPageNo: 71 },
    { drawingNo: '942-58151', pdfPageNo: 72 },
    { drawingNo: '942-58152', pdfPageNo: 73 },
    { drawingNo: '942-58154', pdfPageNo: 79 },
  ],
  'CAB_PIN DRAWINGS 2.pdf': [
    { drawingNo: '942-38104', pdfPageNo: 9 },
    { drawingNo: '942-38105', pdfPageNo: 16 },
    { drawingNo: '942-38108', pdfPageNo: 24 },
    { drawingNo: '942-38109', pdfPageNo: 27 },
    { drawingNo: '942-38119', pdfPageNo: 35 },
  ],
  'DMC UF_PIN DRAWINGS.pdf': [
    { drawingNo: '942-38310', pdfPageNo: 8 },
    { drawingNo: '942-38312', pdfPageNo: 11 },
    { drawingNo: '942-38314', pdfPageNo: 15 },
  ],
  'DMC_CEILING.pdf': [
    { drawingNo: '942-38209', pdfPageNo: 14 },
    { drawingNo: '942-38212', pdfPageNo: 22 },
    { drawingNo: '942-38214', pdfPageNo: 24 },
    { drawingNo: '942-38217', pdfPageNo: 28 },
  ],
  'TC _UF PIN DRAWINGS.pdf': [
    { drawingNo: '942-38506', pdfPageNo: 3 },
    { drawingNo: '942-38518', pdfPageNo: 18 },
    { drawingNo: '942-38519', pdfPageNo: 19 },
  ],
  'TC_CEILING PIN DRAWINGS.pdf': [
    { drawingNo: '942-38408', pdfPageNo: 16 },
  ],
  'MC_UF.pdf': [
    { drawingNo: '942-38101', pdfPageNo: 6 },
    { drawingNo: '942-38105', pdfPageNo: 1 },
    { drawingNo: '942-38106', pdfPageNo: 3 },
    { drawingNo: '942-38109', pdfPageNo: 7 },
    { drawingNo: '942-38110', pdfPageNo: 8 },
    { drawingNo: '942-38111', pdfPageNo: 9 },
    { drawingNo: '942-38112', pdfPageNo: 10 },
    { drawingNo: '942-38114', pdfPageNo: 13 },
    { drawingNo: '942-38115', pdfPageNo: 14 },
    { drawingNo: '942-38116', pdfPageNo: 15 },
    { drawingNo: '942-38118', pdfPageNo: 18 },
    { drawingNo: '942-38119', pdfPageNo: 19 },
    { drawingNo: '942-38120', pdfPageNo: 20 },
    { drawingNo: '942-38121', pdfPageNo: 22 },
  ],
  'MC_CEILING_PIN DRAWINGS.pdf': [
    { drawingNo: '942-38604', pdfPageNo: 3 },
    { drawingNo: '942-38609', pdfPageNo: 16 },
    { drawingNo: '942-38610', pdfPageNo: 20 },
  ],
  'VCC DESCRIPTION 13.12.2017.pdf': [
    { drawingNo: '942-58099', pdfPageNo: 13 },
    { drawingNo: '942-58100', pdfPageNo: 13 },
    { drawingNo: '942-58101', pdfPageNo: 14 },
    { drawingNo: '942-58102', pdfPageNo: 14 },
    { drawingNo: '942-58103', pdfPageNo: 14 },
    { drawingNo: '942-58104', pdfPageNo: 14 },
    { drawingNo: '942-58105', pdfPageNo: 15 },
    { drawingNo: '942-58106', pdfPageNo: 15 },
    { drawingNo: '942-58107', pdfPageNo: 16 },
    { drawingNo: '942-58108', pdfPageNo: 17 },
    { drawingNo: '942-58109', pdfPageNo: 18 },
    { drawingNo: '942-58110', pdfPageNo: 19 },
    { drawingNo: '942-58111', pdfPageNo: 20 },
    { drawingNo: '942-58112', pdfPageNo: 22 },
    { drawingNo: '942-58113', pdfPageNo: 23 },
    { drawingNo: '942-58114', pdfPageNo: 24 },
    { drawingNo: '942-58115', pdfPageNo: 24 },
    { drawingNo: '942-58117', pdfPageNo: 25 },
    { drawingNo: '942-58119', pdfPageNo: 28 },
    { drawingNo: '942-58120', pdfPageNo: 30 },
    { drawingNo: '942-58121', pdfPageNo: 31 },
    { drawingNo: '942-58123', pdfPageNo: 32 },
    { drawingNo: '942-58124', pdfPageNo: 33 },
    { drawingNo: '942-58125', pdfPageNo: 34 },
    { drawingNo: '942-58126', pdfPageNo: 37 },
    { drawingNo: '942-58127', pdfPageNo: 37 },
    { drawingNo: '942-58128', pdfPageNo: 37 },
    { drawingNo: '942-58129', pdfPageNo: 37 },
    { drawingNo: '942-58130', pdfPageNo: 38 },
    { drawingNo: '942-58131', pdfPageNo: 39 },
    { drawingNo: '942-58132', pdfPageNo: 40 },
    { drawingNo: '942-58137', pdfPageNo: 45 },
    { drawingNo: '942-58138', pdfPageNo: 45 },
    { drawingNo: '942-58139', pdfPageNo: 45 },
    { drawingNo: '942-58140', pdfPageNo: 46 },
    { drawingNo: '942-58141', pdfPageNo: 47 },
    { drawingNo: '942-58142', pdfPageNo: 47 },
    { drawingNo: '942-58143', pdfPageNo: 48 },
    { drawingNo: '942-58144', pdfPageNo: 48 },
    { drawingNo: '942-58145', pdfPageNo: 48 },
    { drawingNo: '942-58146', pdfPageNo: 50 },
    { drawingNo: '942-58147', pdfPageNo: 51 },
    { drawingNo: '942-58148', pdfPageNo: 51 },
    { drawingNo: '942-58149', pdfPageNo: 52 },
    { drawingNo: '942-58150', pdfPageNo: 52 },
    { drawingNo: '942-58151', pdfPageNo: 52 },
    { drawingNo: '942-58152', pdfPageNo: 54 },
    { drawingNo: '942-58153', pdfPageNo: 54 },
    { drawingNo: '942-58154', pdfPageNo: 54 },
  ],
};

async function main() {
  console.log('=== VCC Complete Database Setup ===\n');

  // 1. Get project
  const project = await prisma.project.findFirst();
  if (!project) {
    console.error('No project found. Run seed first.');
    process.exit(1);
  }
  console.log(`Project: ${project.projectCode}`);

  // 2. Create SourceFile records for each PDF
  console.log('\n--- Creating SourceFile records ---');
  const pdfFiles = Object.keys(PDF_DRAWING_MAP);
  const sourceFiles: Record<string, string> = {};

  for (const filename of pdfFiles) {
    const existing = await prisma.sourceFile.findFirst({ where: { filename } });
    if (existing) {
      sourceFiles[filename] = existing.id;
      console.log(`  [exists] ${filename}`);
    } else {
      const sf = await prisma.sourceFile.create({
        data: {
          projectId: project.id,
          filename,
          fileType: 'application/pdf',
          mimeType: 'application/pdf',
          status: 'PROCESSED',
        },
      });
      sourceFiles[filename] = sf.id;
      console.log(`  [created] ${filename}`);
    }
  }

  // 3. Ensure all systems exist
  console.log('\n--- Ensuring systems exist ---');
  const systemCodes = [...new Set(DRAWING_CATALOG.map(d => d.systemCode))];
  for (const code of systemCodes) {
    const existing = await prisma.system.findFirst({ where: { code } });
    if (!existing) {
      await prisma.system.create({
        data: { code, name: code, sortOrder: 99 },
      });
      console.log(`  [created] System: ${code}`);
    }
  }

  // 4. Create all drawings from catalog
  console.log('\n--- Creating drawings from catalog ---');
  let created = 0, updated = 0, existing = 0;

  for (const drawing of DRAWING_CATALOG) {
    const system = await prisma.system.findFirst({ where: { code: drawing.systemCode } });
    const existingDrawing = await prisma.drawing.findFirst({
      where: { drawingNo: drawing.drawingNo, revision: '0' },
    });

    if (existingDrawing) {
      // Update if title is different
      if (existingDrawing.title !== drawing.title) {
        await prisma.drawing.update({
          where: { id: existingDrawing.id },
          data: { title: drawing.title, totalSheets: drawing.sheets },
        });
        updated++;
      } else {
        existing++;
      }
    } else {
      await prisma.drawing.create({
        data: {
          projectId: project.id,
          drawingNo: drawing.drawingNo,
          revision: '0',
          title: drawing.title,
          totalSheets: drawing.sheets,
          systemId: system?.id,
          remarks: drawing.description,
        },
      });
      created++;
    }
  }
  console.log(`  Created: ${created}, Updated: ${updated}, Existing: ${existing}`);

  // 5. Create DrawingPageMapping for all PDFs
  console.log('\n--- Creating DrawingPageMappings ---');
  let mappingsCreated = 0;

  for (const [filename, mappings] of Object.entries(PDF_DRAWING_MAP)) {
    const sfId = sourceFiles[filename];
    for (const mapping of mappings) {
      const drawing = await prisma.drawing.findFirst({
        where: { drawingNo: mapping.drawingNo, revision: '0' },
      });
      if (!drawing) continue;

      const existing = await prisma.drawingPageMapping.findFirst({
        where: {
          drawingId: drawing.id,
          sourceFileName: filename,
        },
      });

      if (!existing) {
        await prisma.drawingPageMapping.create({
          data: {
            drawingId: drawing.id,
            sourceFileId: sfId,
            sourceFileName: filename,
            pdfPageNo: mapping.pdfPageNo,
            drawingNumber: mapping.drawingNo,
            verified: true,
            confidence: 1.0,
          },
        });
        mappingsCreated++;
      }
    }
  }
  console.log(`  Created: ${mappingsCreated} page mappings`);

  // 6. Create DrawingSheets for multi-sheet drawings
  console.log('\n--- Creating DrawingSheets ---');
  let sheetsCreated = 0;

  for (const drawing of DRAWING_CATALOG) {
    if (drawing.sheets <= 1) continue;

    const dbDrawing = await prisma.drawing.findFirst({
      where: { drawingNo: drawing.drawingNo, revision: '0' },
    });
    if (!dbDrawing) continue;

    for (let i = 1; i <= drawing.sheets; i++) {
      const existing = await prisma.drawingSheet.findFirst({
        where: { drawingId: dbDrawing.id, sheetNo: i },
      });
      if (!existing) {
        await prisma.drawingSheet.create({
          data: {
            drawingId: dbDrawing.id,
            sheetNo: i,
            sheetLabel: `Sheet ${i} of ${drawing.sheets}`,
          },
        });
        sheetsCreated++;
      }
    }
  }
  console.log(`  Created: ${sheetsCreated} drawing sheets`);

  // 7. Create DrawingRevisions
  console.log('\n--- Creating DrawingRevisions ---');
  let revisionsCreated = 0;

  for (const drawing of DRAWING_CATALOG) {
    const dbDrawing = await prisma.drawing.findFirst({
      where: { drawingNo: drawing.drawingNo, revision: '0' },
    });
    if (!dbDrawing) continue;

    const existing = await prisma.drawingRevision.findFirst({
      where: { drawingId: dbDrawing.id, revisionLabel: '0' },
    });
    if (!existing) {
      await prisma.drawingRevision.create({
        data: {
          drawingId: dbDrawing.id,
          revisionLabel: '0',
          revisionNo: 0,
          isCurrent: true,
          notes: `Initial revision - ${drawing.description}`,
        },
      });
      revisionsCreated++;
    }
  }
  console.log(`  Created: ${revisionsCreated} drawing revisions`);

  // 8. Create DrawingApplicability
  console.log('\n--- Creating DrawingApplicability ---');
  let applicabilityCreated = 0;

  for (const drawing of DRAWING_CATALOG) {
    const dbDrawing = await prisma.drawing.findFirst({
      where: { drawingNo: drawing.drawingNo, revision: '0' },
    });
    if (!dbDrawing) continue;

    // Determine car applicability based on drawing category
    const carTypes = ['DMC', 'TC', 'MC'];
    for (const carType of carTypes) {
      const existing = await prisma.drawingApplicability.findFirst({
        where: { drawingId: dbDrawing.id, carType },
      });
      if (!existing) {
        let applicable = true;
        let remark = 'Standard VCC drawing';

        // Traction drawings only apply to MC
        if (drawing.systemCode === 'TRACTION' && carType !== 'MC') {
          applicable = false;
          remark = 'Traction system - MC car only';
        }
        // Cab VAC only applies to DMC
        if (drawing.drawingNo === '942-58143' && carType !== 'DMC') {
          applicable = false;
          remark = 'Cab AC - DMC only';
        }
        // Horn only applies to DMC
        if (drawing.drawingNo === '942-58127' && carType !== 'DMC') {
          applicable = false;
          remark = 'Horn - DMC only';
        }

        await prisma.drawingApplicability.create({
          data: {
            drawingId: dbDrawing.id,
            carType,
            applicable,
            remark,
          },
        });
        applicabilityCreated++;
      }
    }
  }
  console.log(`  Created: ${applicabilityCreated} applicability records`);

  // 9. Summary
  console.log('\n=== SUMMARY ===');
  const counts = {
    drawings: await prisma.drawing.count(),
    systems: await prisma.system.count(),
    subsystems: await prisma.subsystem.count(),
    sourceFiles: await prisma.sourceFile.count(),
    pageMappings: await prisma.drawingPageMapping.count(),
    drawingSheets: await prisma.drawingSheet.count(),
    drawingRevisions: await prisma.drawingRevision.count(),
    drawingApplicability: await prisma.drawingApplicability.count(),
    connectors: await prisma.connector.count(),
    connectorPins: await prisma.connectorPin.count(),
    wires: await prisma.wire.count(),
    drawingWires: await prisma.drawingWire.count(),
    wireEndpoints: await prisma.wireEndpoint.count(),
    devices: await prisma.device.count(),
    circuits: await prisma.circuit.count(),
    circuitEndpoints: await prisma.circuitEndpoint.count(),
    signals: await prisma.signal.count(),
    trainlines: await prisma.trainLine.count(),
    vccDescriptions: await prisma.vCCDescription.count(),
    systemMetadata: await prisma.systemMetadata.count(),
    notes: await prisma.note.count(),
  };

  console.log('\nDatabase counts:');
  Object.entries(counts).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  console.log('\n=== SETUP COMPLETE ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
