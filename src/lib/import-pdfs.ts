import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

interface PinData {
  connectorCode: string;
  pinNo: string;
  signalName?: string;
  wireNo?: string;
  description?: string;
  deviceCode: string;
  carType: string;
}

interface WireData {
  wireNo: string;
  signalName?: string;
  description?: string;
  fromDevice: string;
  fromPin: string;
  toDevice: string;
  toPin: string;
  carType: string;
  systemCode: string;
}

interface EquipmentData {
  code: string;
  name: string;
  carType: string;
  systemCode: string;
  location: string;
  connectors: string[];
}

const CAR_TYPES = ['DMC', 'TC', 'MC', 'CAB'];
const SYSTEM_CODES = ['TRAC', 'BRAKE', 'DOOR', 'VAC', 'APS', 'TMS', 'COMMS', 'HV', 'LTEB', 'LTJB', 'EDB', 'CAB', 'GEN'];

function parsePinDrawing(text: string, carType: string): PinData[] {
  const pins: PinData[] = [];
  const lines = text.split('\n');
  
  let currentConnector = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Look for connector names like CN1, CN2, X1, X2, etc.
    const connMatch = trimmed.match(/^(CN\d+|X\d+|JCN\d+|PE\d+|PSB_CN\d+)\s*[-:]/i);
    if (connMatch) {
      currentConnector = connMatch[1];
      continue;
    }
    
    // Look for pin patterns like "1 - Signal" or "J7 - Description"
    const pinMatch = trimmed.match(/^([A-Z]?\d+)\s*[-:]\s*(.+)/);
    if (pinMatch && currentConnector) {
      const [, pinNo, rest] = pinMatch;
      
      // Extract wire number if present
      const wireMatch = rest.match(/(\d{4})/);
      const wireNo = wireMatch ? wireMatch[1] : undefined;
      
      // Extract signal name
      const signalMatch = rest.match(/^([A-Z][A-Z0-9_]+)/i);
      const signalName = signalMatch ? signalMatch[1] : rest.split(/[-:,]/)[0].trim();
      
      pins.push({
        connectorCode: currentConnector,
        pinNo,
        signalName,
        wireNo,
        description: rest,
        deviceCode: '',
        carType,
      });
    }
  }
  
  return pins;
}

function extractFromPDF(pdfPath: string): { pins: PinData[]; wires: WireData[]; equipment: EquipmentData[]; drawings: any[] } {
  const pdf = require('pdf-parse');
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = pdf(dataBuffer);
  const text = data.text;
  const fileName = path.basename(pdfPath, '.pdf');
  
  console.log(`\n=== Processing ${fileName} ===`);
  console.log(`Pages: ${data.numpages}`);
  
  // Determine car type from filename
  let carType = 'UNKNOWN';
  if (fileName.includes('DMC')) carType = 'DMC';
  else if (fileName.includes('TC')) carType = 'TC';
  else if (fileName.includes('MC')) carType = 'MC';
  else if (fileName.includes('CAB')) carType = 'CAB';
  
  console.log(`Car Type: ${carType}`);
  
  const pins = parsePinDrawing(text, carType);
  console.log(`Found ${pins.length} pins from PIN drawings`);
  
  // Extract drawings from the OCR document (drawing list)
  const drawings: any[] = [];
  const drawingMatches = text.matchAll(/(\d{3}-\d{5})\s+([^\n]+)/g);
  for (const match of drawingMatches) {
    const drawingNo = match[1];
    const title = match[2].trim().substring(0, 100);
    if (!drawings.find(d => d.drawingNo === drawingNo)) {
      drawings.push({ drawingNo, title });
    }
  }
  console.log(`Found ${drawings.length} drawings`);
  
  // Extract equipment mentioned in text
  const equipment: EquipmentData[] = [];
  const eqPatterns = [
    { pattern: /VVVF\s*(Inverter\s*)?(\d+)?/gi, code: 'V', system: 'TRAC' },
    { pattern: /TCMS[_\s]?RIO\d*/gi, code: 'TCMS_RIO', system: 'TMS' },
    { pattern: /BCU\d*/gi, code: 'BCU', system: 'BRAKE' },
    { pattern: /BECU\d*/gi, code: 'BECU', system: 'BRAKE' },
    { pattern: /APS\d*/gi, code: 'APS', system: 'APS' },
    { pattern: /VAC\d*/gi, code: 'VAC', system: 'VAC' },
    { pattern: /CAB[_\s]?VAC\d*/gi, code: 'CAB_VAC', system: 'VAC' },
    { pattern: /DCU\d*/gi, code: 'DCU', system: 'DOOR' },
    { pattern: /HSCB\d*/gi, code: 'HSCB', system: 'HV' },
    { pattern: /LTEB\d*/gi, code: 'LTEB', system: 'LTEB' },
    { pattern: /LTJB\d*/gi, code: 'LTJB', system: 'LTJB' },
    { pattern: /EDB\d*/gi, code: 'EDB', system: 'EDB' },
    { pattern: /ETH[_\s]?SW\d*/gi, code: 'ETH_SW', system: 'COMMS' },
    { pattern: /BATT\d*/gi, code: 'BATT', system: 'APS' },
    { pattern: /SSB\d*/gi, code: 'SSB', system: 'APS' },
    { pattern: /COMP\d*/gi, code: 'COMP', system: 'BRAKE' },
  ];
  
  for (const { pattern, code, system } of eqPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        const cleanCode = match.toUpperCase().replace(/\s+/g, '_');
        if (!equipment.find(e => e.code === cleanCode)) {
          equipment.push({
            code: cleanCode,
            name: match,
            carType: 'ALL',
            systemCode: system,
            location: 'Various',
            connectors: [],
          });
        }
      }
    }
  }
  console.log(`Found ${equipment.length} equipment items`);
  
  // Extract wires/trainlines
  const wires: WireData[] = [];
  const wireMatches = text.matchAll(/\b(3\d{3}|4\d{3}|5\d{3}|6\d{3}|7\d{3}|1\d{4})\b\s+([A-Z][A-Z0-9_]+)/gi);
  for (const match of wireMatches) {
    wires.push({
      wireNo: match[1],
      signalName: match[2],
      fromDevice: '',
      toDevice: '',
      fromPin: '',
      toPin: '',
      carType: 'ALL',
      systemCode: 'TRL',
    });
  }
  console.log(`Found ${wires.length} trainline references`);
  
  return { pins, wires, equipment, drawings };
}

async function importData() {
  const docsPath = path.join(process.cwd(), 'DOCUMENTS');
  
  if (!fs.existsSync(docsPath)) {
    console.error('DOCUMENTS folder not found');
    return;
  }
  
  const files = fs.readdirSync(docsPath).filter(f => f.endsWith('.pdf'));
  console.log(`Found ${files.length} PDF files to process\n`);
  
  let totalPins = 0;
  let totalWires = 0;
  let totalEquipment = 0;
  let totalDrawings = 0;
  
  for (const file of files) {
    const pdfPath = path.join(docsPath, file);
    
    try {
      const { pins, wires, equipment, drawings } = extractFromPDF(pdfPath);
      
      // Save drawings
      for (const dwg of drawings) {
        const existing = await prisma.drawingDocument.findUnique({ where: { drawingNo: dwg.drawingNo } });
        if (!existing) {
          await prisma.drawingDocument.create({
            data: {
              drawingNo: dwg.drawingNo,
              title: dwg.title,
              revision: 'A',
              carType: 'ALL',
            },
          });
          totalDrawings++;
        }
      }
      
      // Save equipment
      for (const eq of equipment) {
        const system = await prisma.system.findFirst({ where: { code: eq.systemCode } });
        const existing = await prisma.deviceInstance.findFirst({ where: { tag: eq.code } });
        
        if (!existing && system) {
          await prisma.deviceInstance.create({
            data: {
              name: eq.name,
              tag: eq.code,
              carType: eq.carType,
              location: eq.location,
              systemId: system.id,
            },
          });
          totalEquipment++;
        }
      }
      
      // Save wires (deduplicate)
      const uniqueWires = [...new Map(wires.map(w => [w.wireNo, w])).values()];
      for (const wire of uniqueWires) {
        const existing = await prisma.wire.findUnique({ where: { wireNo: wire.wireNo } });
        if (!existing) {
          await prisma.wire.create({
            data: {
              wireNo: wire.wireNo,
              wireType: 'single',
              wireColor: 'Blue',
              voltageClass: '110V',
              cableSpec: '1.5sqmm',
              remarks: wire.signalName || '',
            },
          });
          totalWires++;
        }
      }
      
      // Save pins if we have devices
      if (pins.length > 0) {
        const devices = await prisma.deviceInstance.findMany({ take: 20 });
        for (const pin of pins.slice(0, 50)) {
          const device = devices.find(d => 
            pin.description?.includes(d.tag || '') || 
            (pin.signalName && pin.signalName.includes(d.tag || ''))
          );
          
          if (device) {
            let connector = await prisma.connector.findFirst({
              where: { deviceId: device.id, connectorCode: pin.connectorCode },
            });
            
            if (!connector) {
              connector = await prisma.connector.create({
                data: {
                  deviceId: device.id,
                  connectorCode: pin.connectorCode,
                  connectorType: 'IO',
                  normCode: pin.connectorCode,
                },
              });
            }
            
            await prisma.connectorPin.upsert({
              where: { connectorId_pinNo: { connectorId: connector.id, pinNo: pin.pinNo } },
              update: { signalName: pin.signalName, wireNo: pin.wireNo, normPinNo: `${pin.connectorCode}-${pin.pinNo}` },
              create: {
                connectorId: connector.id,
                pinNo: pin.pinNo,
                signalName: pin.signalName,
                wireNo: pin.wireNo,
                normPinNo: `${pin.connectorCode}-${pin.pinNo}`,
              },
            });
            totalPins++;
          }
        }
      }
      
    } catch (e: any) {
      console.error(`Error processing ${file}: ${e.message}`);
    }
  }
  
  console.log('\n========== Import Summary ==========');
  console.log(`Total new drawings: ${totalDrawings}`);
  console.log(`Total new equipment: ${totalEquipment}`);
  console.log(`Total new trainlines/wires: ${totalWires}`);
  console.log(`Total new pins: ${totalPins}`);
  
  console.log('\n========== Final Database Status ==========');
  console.log('Systems:', await prisma.system.count());
  console.log('Devices:', await prisma.deviceInstance.count());
  console.log('Wires:', await prisma.wire.count());
  console.log('Connectors:', await prisma.connector.count());
  console.log('Pins:', await prisma.connectorPin.count());
  console.log('Drawings:', await prisma.drawingDocument.count());
}

importData()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });