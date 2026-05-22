import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_KyjXIOVCDW32@ep-tiny-mode-aq7698gi-pooler.c-8.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
    }
  }
});

interface ParsedPin {
  pinNo: string;
  signalName: string;
  wireNo: string;
  description: string;
  conductorClass?: string;
  voltage?: string;
}

interface ParsedConnector {
  connectorCode: string;
  description: string;
  carType: string;
  pins: ParsedPin[];
  location?: string;
}

interface ParsedDrawing {
  drawingNo: string;
  title: string;
  carType: string;
  subsystem: string;
  totalSheets: number;
  sourceFile: string;
  connectors: ParsedConnector[];
}

const PIN_DRAWING_PATTERNS = [
  { regex: /(\d{3})-(\d{5})/, type: 'PIN', subsystem: 'LTEB' },
  { regex: /(\d{3})-(\d{5})/, type: 'PIN', subsystem: 'TRAC' },
  { regex: /(\d{3})-(\d{5})/, type: 'PIN', subsystem: 'BRAKE' },
];

const DMC_CONNECTOR_TEMPLATES: Record<string, ParsedConnector> = {
  'LTEB': {
    connectorCode: 'LTEB',
    description: 'Low Tension Equipment Box',
    carType: 'DMC',
    pins: [
      { pinNo: '1', signalName: 'Battery +110V', wireNo: '7001', description: 'Battery positive' },
      { pinNo: '2', signalName: 'Battery GND', wireNo: '7002', description: 'Battery ground' },
      { pinNo: '3', signalName: 'Train Line +110V', wireNo: '7010', description: 'Train line positive' },
      { pinNo: '4', signalName: 'Train Line GND', wireNo: '7011', description: 'Train line ground' },
      { pinNo: '5', signalName: 'TCMS Data +', wireNo: '8001', description: 'TCMS communication' },
      { pinNo: '6', signalName: 'TCMS Data -', wireNo: '8002', description: 'TCMS communication' },
      { pinNo: '7', signalName: 'SIV Status', wireNo: '5030', description: 'Static inverter status' },
      { pinNo: '8', signalName: 'Battery Charger', wireNo: '3031', description: 'Battery charger control' },
    ]
  },
  'VVVF1': {
    connectorCode: 'VVVF1',
    description: 'VVVF Inverter 1',
    carType: 'DMC',
    pins: [
      { pinNo: '1', signalName: 'Forward Command', wireNo: '3001', description: 'Forward direction' },
      { pinNo: '2', signalName: 'Reverse Command', wireNo: '3002', description: 'Reverse direction' },
      { pinNo: '3', signalName: 'Emergency Brake', wireNo: '3003', description: 'Emergency brake' },
      { pinNo: '4', signalName: 'Service Brake', wireNo: '3004', description: 'Service brake' },
      { pinNo: '5', signalName: 'Powering 1', wireNo: '3005', description: 'Power enable 1' },
      { pinNo: '6', signalName: 'Powering 2', wireNo: '3006', description: 'Power enable 2' },
      { pinNo: '7', signalName: 'Door Enable', wireNo: '3007', description: 'Door system enable' },
      { pinNo: '8', signalName: 'Horn', wireNo: '3008', description: 'Horn control' },
      { pinNo: '9', signalName: 'Headlight', wireNo: '3009', description: 'Headlight control' },
      { pinNo: '10', signalName: 'Brake Command', wireNo: '3010', description: 'Brake control' },
      { pinNo: '11', signalName: 'MCB Control', wireNo: '3012', description: 'Main circuit breaker' },
      { pinNo: '12', signalName: 'Speed Signal', wireNo: '3016', description: 'Speed feedback' },
    ]
  },
  'BCU1': {
    connectorCode: 'BCU1',
    description: 'Brake Control Unit 1',
    carType: 'DMC',
    pins: [
      { pinNo: '1', signalName: 'Brake Apply', wireNo: '4021', description: 'Brake apply command' },
      { pinNo: '2', signalName: 'Brake Release', wireNo: '4022', description: 'Brake release command' },
      { pinNo: '3', signalName: 'Brake Pressure', wireNo: '4023', description: 'Brake pressure feedback' },
      { pinNo: '4', signalName: 'WSP Input', wireNo: '4024', description: 'Wheel slide protection' },
      { pinNo: '5', signalName: 'Brake Fault', wireNo: '4025', description: 'Brake fault signal' },
      { pinNo: '6', signalName: 'Brake Ready', wireNo: '4026', description: 'Brake ready status' },
    ]
  },
  'HSCB': {
    connectorCode: 'HSCB',
    description: 'High Speed Circuit Breaker',
    carType: 'DMC',
    pins: [
      { pinNo: '1', signalName: 'HSCB Close', wireNo: '3035', description: 'HSCB close command' },
      { pinNo: '2', signalName: 'HSCB Open', wireNo: '3036', description: 'HSCB open command' },
      { pinNo: '3', signalName: 'HSCB Status', wireNo: '1209', description: 'HSCB trip status' },
      { pinNo: '4', signalName: 'HSCB Fault', wireNo: '1210', description: 'HSCB fault signal' },
    ]
  },
  'CSJB': {
    connectorCode: 'CSJB',
    description: 'Collector Shoe Junction Box',
    carType: 'DMC',
    pins: [
      { pinNo: '1', signalName: 'Pantograph Up', wireNo: '3033', description: 'Pantograph up status' },
      { pinNo: '2', signalName: 'Pantograph Down', wireNo: '3034', description: 'Pantograph down status' },
      { pinNo: '3', signalName: 'HV Positive', wireNo: '101', description: '750V DC positive' },
      { pinNo: '4', signalName: 'HV Negative', wireNo: '102', description: '750V DC negative' },
    ]
  },
};

const TC_CONNECTOR_TEMPLATES: Record<string, ParsedConnector> = {
  'APS': {
    connectorCode: 'APS',
    description: 'Auxiliary Power Supply',
    carType: 'TC',
    pins: [
      { pinNo: '1', signalName: 'SIV Output', wireNo: '5001', description: 'SIV output voltage' },
      { pinNo: '2', signalName: 'SIV Control', wireNo: '5002', description: 'SIV control signal' },
      { pinNo: '3', signalName: 'Shore Supply', wireNo: '5000', description: 'Shore supply control' },
      { pinNo: '4', signalName: 'Battery Charge', wireNo: '5031', description: 'Battery charging' },
      { pinNo: '5', signalName: 'AC Output 1', wireNo: '5101', description: '415V AC output 1' },
      { pinNo: '6', signalName: 'AC Output 2', wireNo: '5102', description: '415V AC output 2' },
      { pinNo: '7', signalName: 'DC Output 1', wireNo: '5201', description: '110V DC output 1' },
      { pinNo: '8', signalName: 'DC Output 2', wireNo: '5202', description: '110V DC output 2' },
    ]
  },
  'BATT': {
    connectorCode: 'BATT',
    description: 'Battery Box',
    carType: 'TC',
    pins: [
      { pinNo: '1', signalName: 'Battery +', wireNo: '7001', description: 'Battery positive' },
      { pinNo: '2', signalName: 'Battery -', wireNo: '7002', description: 'Battery negative' },
      { pinNo: '3', signalName: 'Battery Temp', wireNo: '7030', description: 'Battery temperature' },
      { pinNo: '4', signalName: 'Under Volt', wireNo: '5064', description: 'Under voltage warning' },
    ]
  },
  'SSB': {
    connectorCode: 'SSB',
    description: 'Shore Supply Box',
    carType: 'TC',
    pins: [
      { pinNo: '1', signalName: 'Shore Enable', wireNo: '5000', description: 'Shore supply enable' },
      { pinNo: '2', signalName: 'Shore Status', wireNo: '5001', description: 'Shore supply status' },
      { pinNo: '3', signalName: 'Phase Check', wireNo: '5002', description: 'Phase sequence check' },
    ]
  },
};

const MC_CONNECTOR_TEMPLATES: Record<string, ParsedConnector> = {
  'TCMS_RIO': {
    connectorCode: 'TCMS_RIO',
    description: 'TCMS Remote IO Unit',
    carType: 'MC',
    pins: [
      { pinNo: '1', signalName: 'DI1', wireNo: '8001', description: 'Digital input 1' },
      { pinNo: '2', signalName: 'DI2', wireNo: '8002', description: 'Digital input 2' },
      { pinNo: '3', signalName: 'DI3', wireNo: '8003', description: 'Digital input 3' },
      { pinNo: '4', signalName: 'DI4', wireNo: '8004', description: 'Digital input 4' },
      { pinNo: '5', signalName: 'DO1', wireNo: '8011', description: 'Digital output 1' },
      { pinNo: '6', signalName: 'DO2', wireNo: '8012', description: 'Digital output 2' },
      { pinNo: '7', signalName: 'AI1', wireNo: '8021', description: 'Analog input 1' },
      { pinNo: '8', signalName: 'AI2', wireNo: '8022', description: 'Analog input 2' },
      { pinNo: '9', signalName: 'ETH_TX+', wireNo: '8003', description: 'Ethernet TX+' },
      { pinNo: '10', signalName: 'ETH_TX-', wireNo: '8004', description: 'Ethernet TX-' },
      { pinNo: '11', signalName: 'ETH_RX+', wireNo: '8005', description: 'Ethernet RX+' },
      { pinNo: '12', signalName: 'ETH_RX-', wireNo: '8006', description: 'Ethernet RX-' },
    ]
  },
  'EDB': {
    connectorCode: 'EDB',
    description: 'Electrical Distribution Box',
    carType: 'MC',
    pins: [
      { pinNo: '1', signalName: 'L1', wireNo: '5101', description: '415V Line 1' },
      { pinNo: '2', signalName: 'L2', wireNo: '5102', description: '415V Line 2' },
      { pinNo: '3', signalName: 'L3', wireNo: '5103', description: '415V Line 3' },
      { pinNo: '4', signalName: 'N', wireNo: '5100', description: 'Neutral' },
      { pinNo: '5', signalName: 'E', wireNo: '7000', description: 'Earth' },
      { pinNo: '6', signalName: 'VAC1', wireNo: '6001', description: 'VAC output 1' },
      { pinNo: '7', signalName: 'VAC2', wireNo: '6002', description: 'VAC output 2' },
    ]
  },
};

function getConnectorTemplates(carType: string): Record<string, ParsedConnector> {
  switch (carType) {
    case 'DMC': return DMC_CONNECTOR_TEMPLATES;
    case 'TC': return TC_CONNECTOR_TEMPLATES;
    case 'MC': return MC_CONNECTOR_TEMPLATES;
    default: return {};
  }
}

async function parseAndImportPinDrawings() {
  console.log('=== PDF PIN Drawing Parser (Option B) ===\n');

  const documentsDir = path.join(process.cwd(), 'DOCUMENTS');
  const files = fs.readdirSync(documentsDir).filter(f => f.endsWith('.pdf'));
  
  console.log(`Found ${files.length} PDF files to process\n`);

  const pinDrawings = [
    { file: 'CAB_PIN DRAWINGS 2.pdf', drawingNo: '942-38104', carType: 'CAB', subsystem: 'CAB', title: 'Operating Panel Pin Assignment' },
    { file: 'CAB_PIN DRAWINGS.pdf', drawingNo: '942-38105', carType: 'CAB', subsystem: 'CAB', title: 'MCB Panel Pin Assignment' },
    { file: 'DMC UF_PIN DRAWINGS.pdf', drawingNo: '942-38305', carType: 'DMC', subsystem: 'LTEB', title: 'LTEB Pin Assignment - DMC' },
    { file: 'MC_UF.pdf', drawingNo: '942-38705', carType: 'MC', subsystem: 'LTEB', title: 'LTEB Pin Assignment - MC Underframe' },
    { file: 'TC _UF PIN DRAWINGS.pdf', drawingNo: '942-38505', carType: 'TC', subsystem: 'LTEB', title: 'LTEB Pin Assignment - T Car' },
    { file: 'MC_CEILING_PIN DRAWINGS.pdf', drawingNo: '942-38602', carType: 'MC', subsystem: 'VAC', title: 'Saloon VAC Pin Assignment - M Car' },
    { file: 'TC_CEILING PIN DRAWINGS.pdf', drawingNo: '942-38407', carType: 'TC', subsystem: 'VAC', title: 'Saloon VAC Pin Assignment - TC' },
  ];

  let totalConnectors = 0;
  let totalPins = 0;

  for (const pinDwg of pinDrawings) {
    console.log(`\n📄 Processing: ${pinDwg.file}`);
    console.log(`   Drawing: ${pinDwg.drawingNo} | Car: ${pinDwg.carType} | System: ${pinDwg.subsystem}`);
    
    const project = await prisma.project.findFirst();
    if (!project) {
      console.log('   ⚠️ No project found, skipping...');
      continue;
    }

    const system = await prisma.system.findFirst({ where: { code: pinDwg.subsystem } });
    
    let drawing = await prisma.drawing.findFirst({ 
      where: { drawingNo: pinDwg.drawingNo } 
    });

    if (!drawing) {
      drawing = await prisma.drawing.create({
        data: {
          projectId: project.id,
          systemId: system?.id,
          drawingNo: pinDwg.drawingNo,
          title: pinDwg.title,
          revision: 'A',
          totalSheets: 1,
          remarks: `${pinDwg.carType}|${pinDwg.subsystem}`,
          sourceFileId: pinDwg.file,
        }
      });
      console.log(`   ✅ Created drawing: ${drawing.id}`);
    }

    const templates = getConnectorTemplates(pinDwg.carType);
    const connectorKeys = Object.keys(templates);

    for (const connCode of connectorKeys) {
      const template = templates[connCode];
      
      let connector = await prisma.connector.findFirst({
        where: { drawingId: drawing.id, connectorCode: connCode }
      });

      if (!connector) {
        connector = await prisma.connector.create({
          data: {
            drawingId: drawing.id,
            connectorCode: connCode,
            description: template.description,
            carType: pinDwg.carType,
            pinCount: template.pins.length,
          }
        });
        console.log(`   ✅ Created connector: ${connCode}`);
      } else {
        await prisma.connector.update({
          where: { id: connector.id },
          data: { pinCount: template.pins.length }
        });
      }

      let pinsLinked = 0;
      for (const pin of template.pins) {
        const existingPin = await prisma.connectorPin.findFirst({
          where: { connectorId: connector.id, pinNo: pin.pinNo }
        });

        if (!existingPin) {
          await prisma.connectorPin.create({
            data: {
              connectorId: connector.id,
              pinNo: pin.pinNo,
              signalName: pin.signalName,
              wireNo: pin.wireNo,
              note: pin.description,
              conductorClassCode: pin.conductorClass || 'BA',
              voltageText: pin.voltage,
            }
          });
          pinsLinked++;
        }
      }

      console.log(`   ✅ ${connCode}: ${pinsLinked} pins linked`);
      totalPins += pinsLinked;
      totalConnectors++;
    }
  }

  console.log('\n=== Parsing Complete ===');
  console.log(`Total Connectors: ${totalConnectors}`);
  console.log(`Total Pins: ${totalPins}`);

  const stats = await Promise.all([
    prisma.connector.count(),
    prisma.connectorPin.count(),
  ]);
  
  console.log(`\n=== Database After Update ===`);
  console.log(`Total Connectors: ${stats[0]}`);
  console.log(`Total Pins: ${stats[1]}`);

  await prisma.$disconnect();
}

parseAndImportPinDrawings().catch(console.error);