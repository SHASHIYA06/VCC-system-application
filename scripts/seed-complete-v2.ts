import { PrismaClient } from '@prisma/client';
import { VCC_OCR_DRAWINGS } from '../src/lib/vcc-drawings';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Starting Complete VCC Seed v2 ===\n');

  // Get the project
  const project = await prisma.project.findFirst();
  if (!project) {
    console.log('No project found. Please run initial seed first.');
    return;
  }
  console.log(`Project: ${project.projectName}\n`);

  // Step 1: Create Systems
  console.log('Step 1: Creating Systems...');
  const systems = [
    { code: 'GEN', name: 'General', category: 'Foundation', description: 'General system documentation' },
    { code: 'CAB', name: 'Cab Equipment', category: 'Core Systems', description: 'Driver cab equipment and controls' },
    { code: 'TRAC', name: 'Traction', category: 'Core Systems', description: 'Traction system and VVVF control' },
    { code: 'BRAKE', name: 'Brake System', category: 'Core Systems', description: 'Brake control and air supply' },
    { code: 'AUX', name: 'Auxiliary Electric', category: 'Power', description: 'Auxiliary power and battery' },
    { code: 'DOOR', name: 'Door System', category: 'Passenger Systems', description: 'Passenger door control' },
    { code: 'VAC', name: 'VAC/HVAC', category: 'Passenger Systems', description: 'HVAC systems' },
    { code: 'TMS', name: 'TCMS', category: 'Communication', description: 'Train Control Management System' },
    { code: 'COMMS', name: 'Communication', category: 'Communication', description: 'PIS, PA, CCTV, Radio' },
    { code: 'HV', name: 'High Voltage', category: 'Power', description: 'High voltage distribution' },
    { code: 'LIGHT', name: 'Lighting', category: 'Auxiliary', description: 'Interior and exterior lighting' },
    { code: 'LTEB', name: 'LTEB', category: 'Electrical', description: 'Low Tension Equipment Box' },
    { code: 'LTJB', name: 'LTJB', category: 'Electrical', description: 'Low Tension Junction Box' },
    { code: 'APS', name: 'APS', category: 'Power', description: 'Auxiliary Power Supply' },
    { code: 'BOGIE', name: 'Bogie', category: 'Mechanical', description: 'Bogie systems' },
    { code: 'COUPLING', name: 'Coupling', category: 'Mechanical', description: 'Train coupling systems' },
  ];

  for (const sys of systems) {
    const existing = await prisma.system.findFirst({ where: { code: sys.code } });
    if (!existing) {
      await prisma.system.create({ data: sys });
      console.log(`  Created system: ${sys.code}`);
    }
  }
  console.log('Systems done.\n');

  // Step 2: Create Drawings with proper system links
  console.log('Step 2: Creating Drawings...');
  const drawingsToCreate = [
    { drawingNo: '942-58100', title: 'VCC Drawing List & Index', system: 'GEN', carTypes: 'ALL', sheets: 127 },
    { drawingNo: '942-38104', title: 'Cab Panel PIN Assignment', system: 'CAB', carTypes: 'CAB', sheets: 48 },
    { drawingNo: '942-38310', title: 'DMC Ceiling PIN Assignment', system: 'TMS', carTypes: 'DMC', sheets: 28 },
    { drawingNo: '942-38305', title: 'DMC Underframe PIN Assignment', system: 'LTEB', carTypes: 'DMC', sheets: 26 },
    { drawingNo: '942-38409', title: 'TC Ceiling PIN Assignment', system: 'TMS', carTypes: 'TC', sheets: 27 },
    { drawingNo: '942-38508', title: 'TC Underframe PIN Assignment', system: 'APS', carTypes: 'TC', sheets: 21 },
    { drawingNo: '942-38606', title: 'MC Ceiling PIN Assignment', system: 'TMS', carTypes: 'MC', sheets: 58 },
    { drawingNo: '942-38602', title: 'MC Underframe PIN Assignment', system: 'LTEB', carTypes: 'MC', sheets: 27 },
    { drawingNo: 'VCC-DESC-01', title: 'VCC System Description', system: 'GEN', carTypes: 'ALL', sheets: 54 },
  ];

  for (const d of drawingsToCreate) {
    const sys = await prisma.system.findFirst({ where: { code: d.system } });
    const existing = await prisma.drawing.findFirst({ where: { drawingNo: d.drawingNo } });
    if (!existing) {
      await prisma.drawing.create({
        data: {
          drawingNo: d.drawingNo,
          title: d.title,
          totalSheets: d.sheets,
          projectId: project.id,
          systemId: sys?.id,
          revision: 'A',
          status: 'ACTIVE',
          remarks: `${d.carTypes}|${d.system}`,
        },
      });
      console.log(`  Created drawing: ${d.drawingNo}`);
    }
  }
  console.log('Drawings done.\n');

  // Step 3: Create Trainlines with proper wire links
  console.log('Step 3: Creating Trainlines...');
  const trainlines = [
    { wireNo: '3003', itemName: 'FORWARD', lineGroup: 'Traction', carType: 'ALL', note: 'Forward Command' },
    { wireNo: '3004', itemName: 'REVERSE', lineGroup: 'Traction', carType: 'ALL', note: 'Reverse Command' },
    { wireNo: '3005', itemName: 'POWERING1', lineGroup: 'Traction', carType: 'ALL', note: 'Propulsion Enable 1' },
    { wireNo: '3006', itemName: 'POWERING2', lineGroup: 'Traction', carType: 'ALL', note: 'Propulsion Enable 2' },
    { wireNo: '6009', itemName: 'DOOR_OPEN_LEFT', lineGroup: 'Door', carType: 'MC', note: 'Left Door Open' },
    { wireNo: '6014', itemName: 'DOOR_CLOSE_LEFT', lineGroup: 'Door', carType: 'MC', note: 'Left Door Close' },
    { wireNo: '6046', itemName: 'DOOR_OPEN_RIGHT', lineGroup: 'Door', carType: 'MC', note: 'Right Door Open' },
    { wireNo: '6051', itemName: 'DOOR_CLOSE_RIGHT', lineGroup: 'Door', carType: 'MC', note: 'Right Door Close' },
    { wireNo: '4024', itemName: 'BRAKE_LOOP', lineGroup: 'Brake', carType: 'ALL', note: 'Emergency Brake Loop' },
  ];

  for (const tl of trainlines) {
    const existing = await prisma.trainLine.findFirst({ where: { wireNo: tl.wireNo } });
    if (!existing) {
      const drawing = await prisma.drawing.findFirst();
      await prisma.trainLine.create({
        data: {
          wireNo: tl.wireNo,
          itemName: tl.itemName,
          lineGroup: tl.lineGroup,
          note: tl.note,
          carType: tl.carType,
          drawingId: drawing?.id,
        },
      });
      console.log(`  Created trainline: ${tl.wireNo}`);
    }
  }
  console.log('Trainlines done.\n');

  // Step 4: Create Wires with proper signal names
  console.log('Step 4: Creating Wires...');
  const wires = [
    { wireNo: '3003', signalName: 'FWD_CMD', voltageClass: '110V', wireSize: '2.5mm²', wireColor: 'BLUE' },
    { wireNo: '3004', signalName: 'REV_CMD', voltageClass: '110V', wireSize: '2.5mm²', wireColor: 'BLUE' },
    { wireNo: '3005', signalName: 'PWR_EN1', voltageClass: '110V', wireSize: '2.5mm²', wireColor: 'BLUE' },
    { wireNo: '3006', signalName: 'PWR_EN2', voltageClass: '110V', wireSize: '2.5mm²', wireColor: 'BLUE' },
    { wireNo: '6009', signalName: 'DOOR_OPEN_L', voltageClass: '110V', wireSize: '2.5mm²', wireColor: 'YELLOW' },
    { wireNo: '6014', signalName: 'DOOR_CLOSE_L', voltageClass: '110V', wireSize: '2.5mm²', wireColor: 'YELLOW' },
    { wireNo: '6046', signalName: 'DOOR_OPEN_R', voltageClass: '110V', wireSize: '2.5mm²', wireColor: 'YELLOW' },
    { wireNo: '6051', signalName: 'DOOR_CLOSE_R', voltageClass: '110V', wireSize: '2.5mm²', wireColor: 'YELLOW' },
    { wireNo: '4024', signalName: 'EB_LOOP', voltageClass: '110V', wireSize: '2.5mm²', wireColor: 'RED' },
  ];

  for (const w of wires) {
    const existing = await prisma.wire.findUnique({ where: { wireNo: w.wireNo } });
    if (!existing) {
      await prisma.wire.create({
        data: w,
      });
      console.log(`  Created wire: ${w.wireNo}`);
    }
  }
  console.log('Wires done.\n');

  // Step 5: Create Connectors with pins
  console.log('Step 5: Creating Connectors with Pins...');
  const cabDrawing = await prisma.drawing.findFirst({ where: { drawingNo: '942-38104' } });
  
  if (cabDrawing) {
    // Create CAB panel connectors
    const connectors = [
      { code: 'J1', description: 'Master Controller Connector', carType: 'CAB', location: 'Cab Desk' },
      { code: 'J2', description: 'ATP/ATO Connector', carType: 'CAB', location: 'Cab Desk' },
      { code: 'J3', description: 'Mode Selection Connector', carType: 'CAB', location: 'Cab Desk' },
      { code: 'J4', description: 'Brake Control Connector', carType: 'CAB', location: 'Cab Desk' },
      { code: 'J5', description: 'Parking Brake Connector', carType: 'CAB', location: 'Cab Desk' },
      { code: 'J6', description: 'Door Control Connector', carType: 'CAB', location: 'Cab Desk' },
      { code: 'J7', description: 'VAC/HVAC Connector', carType: 'CAB', location: 'Cab Desk' },
      { code: 'TB1', description: 'Battery Terminal Block', carType: 'CAB', location: 'Cab' },
      { code: 'TB2', description: 'High Voltage Terminal Block', carType: 'CAB', location: 'Cab' },
    ];

    for (const conn of connectors) {
      const existing = await prisma.connector.findFirst({ where: { drawingId: cabDrawing.id, connectorCode: conn.code } });
      if (!existing) {
        const connector = await prisma.connector.create({
          data: {
            drawingId: cabDrawing.id,
            connectorCode: conn.code,
            description: conn.description,
            carType: conn.carType,
            locationTag: conn.location,
            pinCount: 20,
          },
        });

        // Create pins for each connector
        for (let i = 1; i <= 20; i++) {
          await prisma.connectorPin.create({
            data: {
              connectorId: connector.id,
              pinNo: String(i),
              pinLabel: `P${i}`,
              signalName: `${conn.code}-SIG-${i}`,
              wireNo: String(1000 + (i % 9000)),
            },
          });
        }
        console.log(`  Created connector: ${conn.code} with 20 pins`);
      }
    }
  }
  console.log('Connectors done.\n');

  // Step 6: Create Wire Endpoints linking wires to connectors/pins
  console.log('Step 6: Creating Wire Endpoints...');
  const wireEndpoints = [
    { wireNo: '3003', connectorCode: 'J1', pinNo: '1', role: 'SOURCE', label: 'FWD_CMD_SOURCE' },
    { wireNo: '3004', connectorCode: 'J1', pinNo: '2', role: 'SOURCE', label: 'REV_CMD_SOURCE' },
    { wireNo: '3005', connectorCode: 'J1', pinNo: '3', role: 'SOURCE', label: 'PWR_EN1_SOURCE' },
    { wireNo: '3006', connectorCode: 'J1', pinNo: '4', role: 'SOURCE', label: 'PWR_EN2_SOURCE' },
    { wireNo: '6009', connectorCode: 'J6', pinNo: '1', role: 'SOURCE', label: 'DOOR_OPEN_L_SOURCE' },
    { wireNo: '6014', connectorCode: 'J6', pinNo: '2', role: 'SOURCE', label: 'DOOR_CLOSE_L_SOURCE' },
    { wireNo: '6046', connectorCode: 'J6', pinNo: '3', role: 'SOURCE', label: 'DOOR_OPEN_R_SOURCE' },
    { wireNo: '6051', connectorCode: 'J6', pinNo: '4', role: 'SOURCE', label: 'DOOR_CLOSE_R_SOURCE' },
  ];

  for (const we of wireEndpoints) {
    const wire = await prisma.wire.findUnique({ where: { wireNo: we.wireNo } });
    const connector = await prisma.connector.findFirst({
      where: { drawingId: cabDrawing?.id, connectorCode: we.connectorCode },
    });
    const pin = connector ? await prisma.connectorPin.findFirst({
      where: { connectorId: connector.id, pinNo: we.pinNo },
    }) : null;

    if (wire && connector && pin) {
      const existing = await prisma.wireEndpoint.findFirst({
        where: { wireId: wire.id, connectorId: connector.id, pinId: pin.id },
      });
      if (!existing) {
        await prisma.wireEndpoint.create({
          data: {
            wireId: wire.id,
            connectorId: connector.id,
            pinId: pin.id,
            endpointRole: we.role,
            endpointLabel: we.label,
          },
        });
        console.log(`  Created wire endpoint: ${we.wireNo} -> ${we.connectorCode}:${we.pinNo}`);
      }
    }
  }
  console.log('Wire Endpoints done.\n');

  // Step 7: Link trainlines to drawings
  console.log('Step 7: Linking Trainlines to Drawings...');
  const drawing = await prisma.drawing.findFirst();
  if (drawing) {
    // Get all trainlines without a drawing
    const allTrainlines = await prisma.trainLine.findMany();
    const trainlinesToUpdate = allTrainlines.filter(tl => !tl.drawingId);

    for (const tl of trainlinesToUpdate) {
      await prisma.trainLine.update({
        where: { id: tl.id },
        data: { drawingId: drawing.id },
      });
      console.log(`  Linked trainline ${tl.wireNo} to drawing`);
    }
  }
  console.log('Trainline linking done.\n');

  // Summary
  const stats = await Promise.all([
    prisma.system.count(),
    prisma.drawing.count(),
    prisma.trainLine.count(),
    prisma.wire.count(),
    prisma.connector.count(),
    prisma.connectorPin.count(),
    prisma.wireEndpoint.count(),
  ]);

  console.log('\n=== Seed Complete ===');
  console.log(`Systems: ${stats[0]}`);
  console.log(`Drawings: ${stats[1]}`);
  console.log(`Trainlines: ${stats[2]}`);
  console.log(`Wires: ${stats[3]}`);
  console.log(`Connectors: ${stats[4]}`);
  console.log(`Pins: ${stats[5]}`);
  console.log(`Wire Endpoints: ${stats[6]}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
