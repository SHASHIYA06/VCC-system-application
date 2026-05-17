import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TRAINLINE_DETAILS = [
  { wireNo: '1032', itemName: 'RESET', lineGroup: 'Control', note: 'System reset command' },
  { wireNo: '1050', itemName: 'SHUT DOWN', lineGroup: 'Control', note: 'System shutdown command' },
  { wireNo: '1040', itemName: 'AUX ON', lineGroup: 'Control', note: 'Auxiliary power on' },
  { wireNo: '1205', itemName: 'LINE VOLTAGE', lineGroup: 'Power', note: '750V DC line voltage' },
  { wireNo: '1207', itemName: 'VVVF FAULT', lineGroup: 'Status', note: 'VVVF fault signal' },
  { wireNo: '1209', itemName: 'HSCB TRIP', lineGroup: 'Status', note: 'High speed circuit breaker trip' },
  { wireNo: '1515', itemName: 'ATP', lineGroup: 'Control', note: 'Automatic train protection' },
  { wireNo: '2043', itemName: 'SCS', lineGroup: 'Control', note: 'Stationary condition signal' },
  { wireNo: '3003', itemName: 'FORWARD', lineGroup: 'Traction', note: 'Forward command' },
  { wireNo: '3004', itemName: 'REVERSE', lineGroup: 'Traction', note: 'Reverse command' },
  { wireNo: '3005', itemName: 'POWERING1', lineGroup: 'Traction', note: 'Propulsion enable 1' },
  { wireNo: '3006', itemName: 'POWERING2', lineGroup: 'Traction', note: 'Propulsion enable 2' },
  { wireNo: '3010', itemName: 'BRAKING', lineGroup: 'Traction', note: 'Braking command' },
  { wireNo: '3011', itemName: 'FULL SERVICE BRAKE', lineGroup: 'Brake', note: 'Full service brake' },
  { wireNo: '3013', itemName: 'RM', lineGroup: 'Control', note: 'Restricted manual mode' },
  { wireNo: '3018', itemName: 'STANDBY', lineGroup: 'Control', note: 'Standby mode' },
  { wireNo: '3019', itemName: 'WC', lineGroup: 'Control', note: 'Wash coupling mode' },
  { wireNo: '4024', itemName: 'BRAKE LOOP', lineGroup: 'Brake', note: 'Emergency brake loop' },
  { wireNo: '4062', itemName: 'EM BRAKE LOOP NORMAL', lineGroup: 'Brake', note: 'EB loop normal path' },
  { wireNo: '4103', itemName: 'EM BRAKE LOOP REDUNDANCY', lineGroup: 'Brake', note: 'EB loop redundant path' },
  { wireNo: '4122', itemName: 'PARKING BRAKE APPLIED', lineGroup: 'Brake', note: 'Parking brake applied' },
  { wireNo: '4153', itemName: 'PARKING BRAKE RELEASED', lineGroup: 'Brake', note: 'Parking brake released' },
  { wireNo: '4155', itemName: 'PARKING BRAKE PRESSURE SW', lineGroup: 'Brake', note: 'PB pressure feedback' },
  { wireNo: '5000', itemName: 'SHORE SUPPLY CONTACT', lineGroup: 'Power', note: 'Shore supply enable' },
  { wireNo: '5030', itemName: 'SIV CONTACT1', lineGroup: 'Power', note: 'Static inverter contact 1' },
  { wireNo: '5031', itemName: 'SIV CONTACT2', lineGroup: 'Power', note: 'Static inverter contact 2' },
  { wireNo: '5064', itemName: 'BATTERY UNDER-VOLTAGE', lineGroup: 'Power', note: 'Battery low warning' },
  { wireNo: '6009', itemName: 'DOOR OPEN LEFT', lineGroup: 'Door', note: 'Left door open' },
  { wireNo: '6014', itemName: 'DOOR CLOSE LEFT', lineGroup: 'Door', note: 'Left door close' },
  { wireNo: '6046', itemName: 'DOOR OPEN RIGHT', lineGroup: 'Door', note: 'Right door open' },
  { wireNo: '6051', itemName: 'DOOR CLOSE RIGHT', lineGroup: 'Door', note: 'Right door close' },
  { wireNo: '6073', itemName: 'DOOR PROVING LOOP 1', lineGroup: 'Door', note: 'Door proving loop 1' },
  { wireNo: '6076', itemName: 'DOOR PROVING LOOP 2', lineGroup: 'Door', note: 'Door proving loop 2' },
  { wireNo: '6112', itemName: 'ZERO SPEED', lineGroup: 'Status', note: 'Zero speed signal' },
  { wireNo: '7001', itemName: 'CAB VAC IN SSK', lineGroup: 'VAC', note: 'Cab VAC control' },
  { wireNo: '7050', itemName: 'SALOON VAC1', lineGroup: 'VAC', note: 'Saloon VAC 1' },
  { wireNo: '7060', itemName: 'SALOON VAC2', lineGroup: 'VAC', note: 'Saloon VAC 2' },
  { wireNo: '7070', itemName: 'SMOKE DETECTION', lineGroup: 'VAC', note: 'Smoke detection alarm' },
  { wireNo: '7071', itemName: 'DAMPER OPERATION', lineGroup: 'VAC', note: 'Damper control' },
  { wireNo: '9214', itemName: 'ATP MODE', lineGroup: 'Control', note: 'ATP mode indicator' },
  { wireNo: '9215', itemName: 'FWD MODE', lineGroup: 'Control', note: 'Forward mode' },
  { wireNo: '9216', itemName: 'REV MODE', lineGroup: 'Control', note: 'Reverse mode' },
];

const WIRE_DETAILS = [
  { wireNo: '1032', signalName: 'RESET', description: 'System Reset', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '1040', signalName: 'AUX_ON', description: 'Auxiliary Power On', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '1050', signalName: 'SHUT_DWN', description: 'System Shutdown', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '1205', signalName: 'LINE_VOLT', description: 'Line Voltage 750V', voltageClass: '750VDC', wireSize: '3x2.5', wireColor: 'RED' },
  { wireNo: '1207', signalName: 'VVVF_FAULT', description: 'VVVF Fault', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'YELLOW' },
  { wireNo: '1209', signalName: 'HSCB_TRIP', description: 'HSCB Trip', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'ORANGE' },
  { wireNo: '1515', signalName: 'ATP', description: 'ATP Enable', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'WHITE' },
  { wireNo: '2043', signalName: 'SCS', description: 'Stationary Condition', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BROWN' },
  { wireNo: '3003', signalName: 'FWD_CMD', description: 'Forward Command', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '3004', signalName: 'REV_CMD', description: 'Reverse Command', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '3005', signalName: 'PWR_EN1', description: 'Powering Enable 1', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '3006', signalName: 'PWR_EN2', description: 'Powering Enable 2', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '3010', signalName: 'BRAKE_CMD', description: 'Braking Command', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '3011', signalName: 'FSB_CMD', description: 'Full Service Brake', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '3013', signalName: 'RM_MODE', description: 'Restricted Manual', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'YELLOW' },
  { wireNo: '3018', signalName: 'STANDBY', description: 'Standby Mode', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '3019', signalName: 'WC', description: 'Wash Coupling', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'WHITE' },
  { wireNo: '4024', signalName: 'BRAKE_LP', description: 'Brake Loop', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '4062', signalName: 'EM_BRAKE_N', description: 'EM Brake Loop Normal', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '4103', signalName: 'EM_BRAKE_R', description: 'EM Brake Loop Redundant', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '4122', signalName: 'PB_APPLIED', description: 'Parking Brake Applied', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'YELLOW' },
  { wireNo: '4153', signalName: 'PB_RELEASED', description: 'Parking Brake Released', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '4155', signalName: 'PB_PS', description: 'Parking Brake Pressure', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'WHITE' },
  { wireNo: '5000', signalName: 'SHORE_CNT', description: 'Shore Supply', voltageClass: '415VAC', wireSize: '3x2.5', wireColor: 'BLACK' },
  { wireNo: '5030', signalName: 'SIV_C1', description: 'SIV Contact 1', voltageClass: '415VAC', wireSize: '3x2.5', wireColor: 'BLACK' },
  { wireNo: '5031', signalName: 'SIV_C2', description: 'SIV Contact 2', voltageClass: '415VAC', wireSize: '3x2.5', wireColor: 'BLACK' },
  { wireNo: '5064', signalName: 'BATT_UV', description: 'Battery Under-Voltage', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '6009', signalName: 'DOOR_OPEN_L', description: 'Door Open Left', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '6014', signalName: 'DOOR_CLOSE_L', description: 'Door Close Left', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '6046', signalName: 'DOOR_OPEN_R', description: 'Door Open Right', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '6051', signalName: 'DOOR_CLOSE_R', description: 'Door Close Right', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '6073', signalName: 'DOOR_PROV1', description: 'Door Proving Loop 1', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'WHITE' },
  { wireNo: '6076', signalName: 'DOOR_PROV2', description: 'Door Proving Loop 2', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'WHITE' },
  { wireNo: '6112', signalName: 'ZERO_SPD', description: 'Zero Speed', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BROWN' },
  { wireNo: '7001', signalName: 'CAB_VAC', description: 'Cab VAC Control', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '7050', signalName: 'SALOON_VAC1', description: 'Saloon VAC 1', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'ORANGE' },
  { wireNo: '7060', signalName: 'SALOON_VAC2', description: 'Saloon VAC 2', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'ORANGE' },
  { wireNo: '7070', signalName: 'SMOKE_DET', description: 'Smoke Detection', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
  { wireNo: '7071', signalName: 'DAMPER', description: 'Damper Operation', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'YELLOW' },
  { wireNo: '9214', signalName: 'ATP_MODE', description: 'ATP Mode', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'BLUE' },
  { wireNo: '9215', signalName: 'FWD_MODE', description: 'Forward Mode', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'GREEN' },
  { wireNo: '9216', signalName: 'REV_MODE', description: 'Reverse Mode', voltageClass: '110VDC', wireSize: '3x1.0', wireColor: 'RED' },
];

export async function POST() {
  try {
    console.log('=== Starting VCC Full Data Seed ===\n');

    const project = await prisma.project.findFirst();
    if (!project) return NextResponse.json({ error: 'No project found' }, { status: 400 });

    const drawing = await prisma.drawing.findFirst();
    if (!drawing) return NextResponse.json({ error: 'No drawing found' }, { status: 400 });

    console.log('Step 1: Updating Trainlines...');
    let trainlinesUpdated = 0;
    for (const tl of TRAINLINE_DETAILS) {
      const existing = await prisma.trainLine.findFirst({ where: { wireNo: tl.wireNo } });
      if (existing) {
        await prisma.trainLine.update({
          where: { id: existing.id },
          data: { itemName: tl.itemName, lineGroup: tl.lineGroup, note: tl.note }
        });
      } else {
        await prisma.trainLine.create({
          data: { ...tl, drawingId: drawing.id }
        });
      }
      trainlinesUpdated++;
    }
    console.log(`Trainlines: ${trainlinesUpdated}\n`);

    console.log('Step 2: Updating Wires...');
    let wiresUpdated = 0;
    for (const w of WIRE_DETAILS) {
      const existing = await prisma.wire.findUnique({ where: { wireNo: w.wireNo } });
      if (existing) {
        await prisma.wire.update({
          where: { wireNo: w.wireNo },
          data: { signalName: w.signalName, description: w.description, voltageClass: w.voltageClass, wireSize: w.wireSize, wireColor: w.wireColor }
        });
      } else {
        await prisma.wire.create({ data: w });
      }
      wiresUpdated++;
    }
    console.log(`Wires: ${wiresUpdated}\n`);

    console.log('Step 3: Updating Systems...');
    const systemsData = [
      { code: 'GEN', name: 'General & Conventions', category: 'Foundation', description: 'Drawing list, classification, wiring numbers, symbols', sortOrder: 1 },
      { code: 'TRL', name: 'Trainlines', category: 'Core Systems', description: 'Train line control, signal, low/high tension power', sortOrder: 2 },
      { code: 'CAB', name: 'Cab Control & Status', category: 'Core Systems', description: 'Controlling cab, startup, status indication, MCB trip', sortOrder: 3 },
      { code: 'TRAC', name: 'Traction & Propulsion', category: 'Propulsion', description: 'Speed control, VVVF control, traction return current', sortOrder: 4 },
      { code: 'BRAKE', name: 'Brake System', category: 'Core Systems', description: 'Compressor, brake loop, emergency brake, parking brake, horn', sortOrder: 5 },
      { code: 'APS', name: 'Auxiliary Power Supply', category: 'Power', description: 'APS, shore supply, battery control', sortOrder: 6 },
      { code: 'DOOR', name: 'Door System', category: 'Core Systems', description: 'Door supply, left/right operation, proving loop, interlock', sortOrder: 7 },
      { code: 'VAC', name: 'VAC / HVAC', category: 'Core Systems', description: 'Cab VAC, saloon VAC power and control', sortOrder: 8 },
      { code: 'TMS', name: 'Train Management System', category: 'Control', description: 'TMS interface, TCMS remote I/O, communication nodes', sortOrder: 9 },
      { code: 'COMMS', name: 'Communication Systems', category: 'Core Systems', description: 'PIS/TIS, DVAS/PA, CBTC, train radio, CCTV', sortOrder: 10 },
      { code: 'LIGHT', name: 'Lighting', category: 'Auxiliary', description: 'Head cab light, saloon lights, console light', sortOrder: 11 },
      { code: 'LTEB', name: 'Low Tension Equipment Box', category: 'Electrical', description: 'LTEB pin assignments and wiring', sortOrder: 13 },
      { code: 'LTJB', name: 'Low Tension Junction Box', category: 'Electrical', description: 'LTJB pin assignments and wiring', sortOrder: 14 },
      { code: 'EDB', name: 'Electrical Distribution Box', category: 'Electrical', description: 'EDB panel assignments', sortOrder: 15 },
      { code: 'HV', name: 'High Voltage Equipment', category: 'Power', description: 'Collector shoe, HSCB, main switch box, HTEB', sortOrder: 16 },
    ];
    for (const sys of systemsData) {
      const existing = await prisma.system.findFirst({ where: { code: sys.code } });
      if (existing) {
        await prisma.system.update({ where: { id: existing.id }, data: sys });
      } else {
        await prisma.system.create({ data: sys });
      }
    }
    console.log(`Systems: ${await prisma.system.count()}\n`);

    const stats = {
      systems: await prisma.system.count(),
      drawings: await prisma.drawing.count(),
      trainlines: await prisma.trainLine.count(),
      wires: await prisma.wire.count(),
      equipment: await prisma.equipment.count(),
      connectors: await prisma.connector.count(),
      pins: await prisma.connectorPin.count(),
    };

    console.log('=== Final Database Statistics ===');
    console.log(`  Systems: ${stats.systems}`);
    console.log(`  Drawings: ${stats.drawings}`);
    console.log(`  Trainlines: ${stats.trainlines}`);
    console.log(`  Wires: ${stats.wires}`);
    console.log(`  Equipment: ${stats.equipment}`);
    console.log(`  Connectors: ${stats.connectors}`);
    console.log(`  Pins: ${stats.pins}`);
    console.log('\n=== VCC Full Data Seed Complete ===');

    return NextResponse.json({ 
      success: true, 
      message: 'VCC Full Data Seed Complete',
      stats 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed', details: String(error) }, { status: 500 });
  }
}