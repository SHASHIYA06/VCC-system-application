const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TRAINLINE_DETAILED = [
  { wireNo: '1032', itemName: 'RESET', lineGroup: 'Control', carType: 'ALL', function: 'System Reset' },
  { wireNo: '1050', itemName: 'SHUT DOWN', lineGroup: 'Control', carType: 'ALL', function: 'System Shutdown' },
  { wireNo: '1040', itemName: 'AUX ON', lineGroup: 'Control', carType: 'ALL', function: 'Aux Power On' },
  { wireNo: '1205', itemName: 'LINE VOLTAGE', lineGroup: 'Power', carType: 'ALL', function: '750V DC Line' },
  { wireNo: '1207', itemName: 'VVF FAULT', lineGroup: 'Status', carType: 'ALL', function: 'VVVF Fault Signal' },
  { wireNo: '1209', itemName: 'HSCB TRIP', lineGroup: 'Status', carType: 'ALL', function: 'HSCB Trip Signal' },
  { wireNo: '1515', itemName: 'ATP', lineGroup: 'Control', carType: 'ALL', function: 'ATP Enable' },
  { wireNo: '2043', itemName: 'SCS', lineGroup: 'Control', carType: 'ALL', function: 'Stationary Condition' },
  { wireNo: '3003', itemName: 'FORWARD', lineGroup: 'Traction', carType: 'ALL', function: 'Forward Command' },
  { wireNo: '3004', itemName: 'REVERSE', lineGroup: 'Traction', carType: 'ALL', function: 'Reverse Command' },
  { wireNo: '3005', itemName: 'POWERING1', lineGroup: 'Traction', carType: 'ALL', function: 'Propulsion Enable 1' },
  { wireNo: '3006', itemName: 'POWERING2', lineGroup: 'Traction', carType: 'ALL', function: 'Propulsion Enable 2' },
  { wireNo: '3010', itemName: 'BRAKING', lineGroup: 'Traction', carType: 'ALL', function: 'Braking Command' },
  { wireNo: '3011', itemName: 'FULL SERVICE BRAKE', lineGroup: 'Brake', carType: 'ALL', function: 'Full Service Brake' },
  { wireNo: '3013', itemName: 'RM', lineGroup: 'Control', carType: 'ALL', function: 'Restricted Mode' },
  { wireNo: '3018', itemName: 'STANDBY', lineGroup: 'Control', carType: 'ALL', function: 'Standby Mode' },
  { wireNo: '3019', itemName: 'WC', lineGroup: 'Control', carType: 'ALL', function: 'Wheelspin Control' },
  { wireNo: '4024', itemName: 'BRAKE LOOP', lineGroup: 'Brake', carType: 'ALL', function: 'Emergency Brake Loop' },
  { wireNo: '4062', itemName: 'EM BRAKE LOOP NORMAL', lineGroup: 'Brake', carType: 'ALL', function: 'EB Loop Normal' },
  { wireNo: '4103', itemName: 'EM BRAKE LOOP REDUNDANCY', lineGroup: 'Brake', carType: 'ALL', function: 'EB Loop Redundancy' },
  { wireNo: '4122', itemName: 'PARKING BRAKE APPLIED', lineGroup: 'Brake', carType: 'ALL', function: 'Parking Brake Applied' },
  { wireNo: '4153', itemName: 'PARKING BRAKE RELEASED', lineGroup: 'Brake', carType: 'ALL', function: 'Parking Brake Released' },
  { wireNo: '5000', itemName: 'SHORE SUPPLY CONTACT', lineGroup: 'Power', carType: 'TC', function: 'Shore Supply Enable' },
  { wireNo: '5030', itemName: 'SIV CONTACT1', lineGroup: 'Power', carType: 'TC', function: 'SIV Contactor 1' },
  { wireNo: '5031', itemName: 'SIV CONTACT2', lineGroup: 'Power', carType: 'TC', function: 'SIV Contactor 2' },
  { wireNo: '5064', itemName: 'BATTERY UNDER-VOLTAGE', lineGroup: 'Power', carType: 'ALL', function: 'Battery Low Warning' },
  { wireNo: '6009', itemName: 'DOOR OPEN LEFT', lineGroup: 'Door', carType: 'MC', function: 'Left Door Open' },
  { wireNo: '6014', itemName: 'DOOR CLOSE LEFT', lineGroup: 'Door', carType: 'MC', function: 'Left Door Close' },
  { wireNo: '6046', itemName: 'DOOR OPEN RIGHT', lineGroup: 'Door', carType: 'MC', function: 'Right Door Open' },
  { wireNo: '6051', itemName: 'DOOR CLOSE RIGHT', lineGroup: 'Door', carType: 'MC', function: 'Right Door Close' },
  { wireNo: '6112', itemName: 'ZERO SPEED', lineGroup: 'Status', carType: 'ALL', function: 'Zero Speed Signal' },
  { wireNo: '7001', itemName: 'CAB VAC IN SSK', lineGroup: 'VAC', carType: 'DMC', function: 'Cab VAC Control' },
  { wireNo: '7050', itemName: 'SALOON VAC1', lineGroup: 'VAC', carType: 'TC', function: 'Saloon VAC 1' },
  { wireNo: '7060', itemName: 'SALOON VAC2', lineGroup: 'VAC', carType: 'TC', function: 'Saloon VAC 2' },
  { wireNo: '7070', itemName: 'SMOKE DETECTION', lineGroup: 'VAC', carType: 'ALL', function: 'Smoke Alarm' },
  { wireNo: '9214', itemName: 'ATP MODE', lineGroup: 'Control', carType: 'ALL', function: 'ATP Mode Ind' },
  { wireNo: '9215', itemName: 'FWD MODE', lineGroup: 'Control', carType: 'ALL', function: 'Forward Mode' },
  { wireNo: '9216', itemName: 'REV MODE', lineGroup: 'Control', carType: 'ALL', function: 'Reverse Mode' },
];

const CAB_WIRE_CONNECTIONS = [
  { wireNo: '3003', signalName: 'FWD_CMD', description: 'FORWARD' },
  { wireNo: '3004', signalName: 'REV_CMD', description: 'REVERSE' },
  { wireNo: '3005', signalName: 'PWR_EN1', description: 'POWERING 1' },
  { wireNo: '3006', signalName: 'PWR_EN2', description: 'POWERING 2' },
  { wireNo: '3010', signalName: 'BRAKE_CMD', description: 'BRAKING' },
  { wireNo: '3011', signalName: 'FSB_CMD', description: 'FULL SERVICE BRAKE' },
  { wireNo: '3013', signalName: 'RM_MODE', description: 'RM MODE' },
  { wireNo: '1515', signalName: 'ATP_EN', description: 'ATP ENABLE' },
  { wireNo: '1032', signalName: 'SYS_RST', description: 'RESET' },
  { wireNo: '1050', signalName: 'SHT_DWN', description: 'SHUT DOWN' },
  { wireNo: '1040', signalName: 'AUX_ON', description: 'AUX ON' },
  { wireNo: '9214', signalName: 'ATP_MODE', description: 'ATP MODE' },
  { wireNo: '9215', signalName: 'FWD_MODE', description: 'FWD MODE' },
  { wireNo: '9216', signalName: 'REV_MODE', description: 'REV MODE' },
  { wireNo: '4024', signalName: 'BRAKE_LP', description: 'BRAKE LOOP' },
  { wireNo: '4122', signalName: 'PB_APPLIED', description: 'PARKING BRAKE APPLIED' },
  { wireNo: '4153', signalName: 'PB_RELEASED', description: 'PARKING BRAKE RELEASED' },
];

async function quickSeed() {
  console.log('=== Quick VCC Seed ===\n');
  try {
    const project = await prisma.project.findFirst();
    if (!project) { console.log('No project'); return; }
    
    const drawing = await prisma.drawing.findFirst();
    if (!drawing) { console.log('No drawing'); return; }

    console.log('Adding trainlines...');
    for (const tl of TRAINLINE_DETAILED) {
      const exists = await prisma.trainLine.findFirst({ where: { wireNo: tl.wireNo } });
      if (!exists && drawing) {
        await prisma.trainLine.create({
          data: { wireNo: tl.wireNo, itemName: tl.itemName, lineGroup: tl.lineGroup, note: tl.function, carType: tl.carType, drawingId: drawing.id }
        });
      }
    }
    console.log('Trainlines done.\n');

    console.log('Adding wires...');
    for (const wc of CAB_WIRE_CONNECTIONS) {
      const exists = await prisma.wire.findUnique({ where: { wireNo: wc.wireNo } });
      if (!exists) {
        await prisma.wire.create({
          data: { wireNo: wc.wireNo, signalName: wc.signalName, description: wc.description, voltageClass: '110V', wireSize: '2.5mm²', wireColor: 'BLUE' }
        });
      }
    }
    console.log('Wires done.\n');

    const stats = await Promise.all([
      prisma.trainLine.count(),
      prisma.wire.count(),
    ]);

    console.log(`Trainlines: ${stats[0]}, Wires: ${stats[1]}`);
    console.log('\n=== Seed Complete ===');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

quickSeed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });