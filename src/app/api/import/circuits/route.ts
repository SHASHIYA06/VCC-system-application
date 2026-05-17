import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

const TRAINLINE_DATA = [
  { wireNo: '1032', itemName: 'RESET', carType: 'ALL', lineGroup: 'Control', note: 'Trainline system reset command' },
  { wireNo: '1050', itemName: 'SHUT DOWN', carType: 'ALL', lineGroup: 'Control', note: 'System shutdown command' },
  { wireNo: '1040', itemName: 'AUX ON', carType: 'ALL', lineGroup: 'Control', note: 'Auxiliary power on command' },
  { wireNo: '1207', itemName: 'VVF FAULT', carType: 'ALL', lineGroup: 'Status', note: 'VVVF fault signal' },
  { wireNo: '1209', itemName: 'HSCB TRIP', carType: 'ALL', lineGroup: 'Status', note: 'High speed circuit breaker trip' },
  { wireNo: '1215', itemName: 'AUX FAULT', carType: 'ALL', lineGroup: 'Status', note: 'Auxiliary system fault' },
  { wireNo: '1217', itemName: 'VAC FAULT', carType: 'ALL', lineGroup: 'Status', note: 'VAC system fault' },
  { wireNo: '1205', itemName: 'LINE VOLTAGE', carType: 'ALL', lineGroup: 'Power', note: 'DC line voltage feedback' },
  { wireNo: '1219', itemName: 'PARKING BRAKE APPLIED', carType: 'ALL', lineGroup: 'Status', note: 'Parking brake status' },
  { wireNo: '2043', itemName: 'SCS', carType: 'ALL', lineGroup: 'Control', note: 'Stationary condition signal' },
  { wireNo: '1515', itemName: 'ATP', carType: 'ALL', lineGroup: 'Control', note: 'Automatic train protection' },
  { wireNo: '3003', itemName: 'FORWARD', carType: 'ALL', lineGroup: 'Traction', note: 'Forward command - from cab to VVVF' },
  { wireNo: '3004', itemName: 'REVERSE', carType: 'ALL', lineGroup: 'Traction', note: 'Reverse command' },
  { wireNo: '3005', itemName: 'POWERING1', carType: 'ALL', lineGroup: 'Traction', note: 'Propulsion enable 1 - crossed at X1/19-20' },
  { wireNo: '3006', itemName: 'POWERING2', carType: 'ALL', lineGroup: 'Traction', note: 'Propulsion enable 2 - crossed at X1/20-19' },
  { wireNo: '3010', itemName: 'BRAKING', carType: 'ALL', lineGroup: 'Traction', note: 'Braking command' },
  { wireNo: '3011', itemName: 'FULL SERVICE BRAKE', carType: 'ALL', lineGroup: 'Brake', note: 'Full service brake command' },
  { wireNo: '3013', itemName: 'RM', carType: 'ALL', lineGroup: 'Control', note: 'Restricted mode' },
  { wireNo: '3018', itemName: 'STANDBY', carType: 'ALL', lineGroup: 'Control', note: 'Standby mode' },
  { wireNo: '3019', itemName: 'WC', carType: 'ALL', lineGroup: 'Control', note: 'Wheelspin control' },
  { wireNo: '3020A', itemName: 'BRAKE DEMAND', carType: 'ALL', lineGroup: 'Brake', note: 'Brake demand signal' },
  { wireNo: '3026', itemName: 'LOAD COMP', carType: 'ALL', lineGroup: 'Traction', note: 'Load compensation' },
  { wireNo: '3060', itemName: 'ATO', carType: 'ALL', lineGroup: 'Control', note: 'Automatic train operation' },
  { wireNo: '4024', itemName: 'BRAKE LOOP', carType: 'ALL', lineGroup: 'Brake', note: 'Emergency brake loop normal' },
  { wireNo: '4028', itemName: 'BRAKE LOOP RETURN', carType: 'ALL', lineGroup: 'Brake', note: 'Emergency brake loop return' },
  { wireNo: '4062', itemName: 'EM BRAKE LOOP NORMAL', carType: 'ALL', lineGroup: 'Brake', note: 'Emergency brake loop normal path' },
  { wireNo: '4070', itemName: 'EM BRAKE LOOP RETURN', carType: 'ALL', lineGroup: 'Brake', note: 'Emergency brake loop return path' },
  { wireNo: '4103', itemName: 'EM BRAKE LOOP REDUNDANCY', carType: 'ALL', lineGroup: 'Brake', note: 'Emergency brake loop redundancy path' },
  { wireNo: '4110', itemName: 'EM BRAKE LOOP REDUNDANCY RETURN', carType: 'ALL', lineGroup: 'Brake', note: 'Emergency brake loop redundancy return' },
  { wireNo: '4122', itemName: 'PARKING BRAKE APPLIED', carType: 'ALL', lineGroup: 'Brake', note: 'Parking brake applied status' },
  { wireNo: '4123', itemName: 'HOLDING BRAKE', carType: 'ALL', lineGroup: 'Brake', note: 'Holding brake command' },
  { wireNo: '4153', itemName: 'PARKING BRAKE RELEASED', carType: 'ALL', lineGroup: 'Brake', note: 'Parking brake released status' },
  { wireNo: '4155', itemName: 'PARKING BRAKE PRESSURE SWITCH', carType: 'ALL', lineGroup: 'Brake', note: 'Parking brake pressure feedback' },
  { wireNo: '4600', itemName: 'ATO BRAKE CUTOUT', carType: 'ALL', lineGroup: 'Control', note: 'ATO brake cut-out signal' },
  { wireNo: '5000', itemName: 'SHORE SUPPLY CONTACT', carType: 'TC', lineGroup: 'Power', note: 'Shore supply contactor control' },
  { wireNo: '5030', itemName: 'SIV CONTACT1', carType: 'TC', lineGroup: 'Power', note: 'Static inverter contact 1' },
  { wireNo: '5031', itemName: 'SIV CONTACT2', carType: 'TC', lineGroup: 'Power', note: 'Static inverter contact 2' },
  { wireNo: '5064', itemName: 'BATTERY UNDER-VOLTAGE', carType: 'ALL', lineGroup: 'Power', note: 'Battery under-voltage monitoring' },
  { wireNo: '6009', itemName: 'DOOR OPEN LEFT', carType: 'MC', lineGroup: 'Door', note: 'Left door open command - door L1' },
  { wireNo: '6010', itemName: 'DOOR OPEN L2', carType: 'MC', lineGroup: 'Door', note: 'Left door open L2' },
  { wireNo: '6011', itemName: 'DOOR OPEN L3', carType: 'MC', lineGroup: 'Door', note: 'Left door open L3' },
  { wireNo: '6014', itemName: 'DOOR CLOSE LEFT', carType: 'MC', lineGroup: 'Door', note: 'Left door close - crossed at X1/46-47' },
  { wireNo: '6015', itemName: 'DOOR CLOSE L2', carType: 'MC', lineGroup: 'Door', note: 'Left door close L2' },
  { wireNo: '6016', itemName: 'DOOR CLOSE L3', carType: 'MC', lineGroup: 'Door', note: 'Left door close L3' },
  { wireNo: '6034', itemName: 'DOOR CLOSE ANNOUNCEMENT', carType: 'ALL', lineGroup: 'Door', note: 'Door close announcement' },
  { wireNo: '6046', itemName: 'DOOR OPEN RIGHT', carType: 'MC', lineGroup: 'Door', note: 'Right door open - door R1' },
  { wireNo: '6047', itemName: 'DOOR OPEN R2', carType: 'MC', lineGroup: 'Door', note: 'Right door open R2' },
  { wireNo: '6048', itemName: 'DOOR OPEN R3', carType: 'MC', lineGroup: 'Door', note: 'Right door open R3' },
  { wireNo: '6051', itemName: 'DOOR CLOSE RIGHT', carType: 'MC', lineGroup: 'Door', note: 'Right door close - crossed at X1/47-46' },
  { wireNo: '6052', itemName: 'DOOR CLOSE R2', carType: 'MC', lineGroup: 'Door', note: 'Right door close R2' },
  { wireNo: '6053', itemName: 'DOOR CLOSE R3', carType: 'MC', lineGroup: 'Door', note: 'Right door close R3' },
  { wireNo: '6073', itemName: 'DOOR PROVING LOOP 1', carType: 'MC', lineGroup: 'Door', note: 'Door proving loop 1 - safety interlock' },
  { wireNo: '6076', itemName: 'DOOR PROVING LOOP 2', carType: 'MC', lineGroup: 'Door', note: 'Door proving loop 2' },
  { wireNo: '6112', itemName: 'ZERO SPEED', carType: 'ALL', lineGroup: 'Status', note: 'Zero speed signal - required for door operation' },
  { wireNo: '7001', itemName: 'CAB VAC IN SSK', carType: 'DMC', lineGroup: 'VAC', note: 'Cab VAC in stationary keeper' },
  { wireNo: '7050', itemName: 'SALOON VAC1 IN SSK', carType: 'TC', lineGroup: 'VAC', note: 'Saloon VAC 1 in SSK' },
  { wireNo: '7060', itemName: 'SALOON VAC2 IN SSK', carType: 'TC', lineGroup: 'VAC', note: 'Saloon VAC 2 in SSK' },
  { wireNo: '7070', itemName: 'SMOKE DETECTION', carType: 'ALL', lineGroup: 'VAC', note: 'Smoke detection signal' },
  { wireNo: '7071', itemName: 'DAMPER OPERATION', carType: 'ALL', lineGroup: 'VAC', note: 'Damper operation control' },
  { wireNo: '9214', itemName: 'ATP MODE', carType: 'ALL', lineGroup: 'Control', note: 'ATP mode indicator' },
  { wireNo: '9215', itemName: 'FWD MODE', carType: 'ALL', lineGroup: 'Control', note: 'Forward mode indicator' },
  { wireNo: '9216', itemName: 'REV MODE', carType: 'ALL', lineGroup: 'Control', note: 'Reverse mode indicator' },
];

const CIRCUITS_DATA = [
  { wireNo: '3001', description: 'Forward signal - 110VDC', itemName: 'FWD', systemCode: 'TRL', carType: 'ALL' },
  { wireNo: '3002', description: 'Reverse signal - 110VDC', itemName: 'REV', systemCode: 'TRL', carType: 'ALL' },
  { wireNo: '3003', description: 'Forward command - 110VDC', itemName: 'FORWARD', systemCode: 'TRAC', carType: 'ALL' },
  { wireNo: '3004', description: 'Reverse command - 110VDC', itemName: 'REVERSE', systemCode: 'TRAC', carType: 'ALL' },
  { wireNo: '3005', description: 'Powering 1 - 110VDC', itemName: 'POWERING1', systemCode: 'TRAC', carType: 'ALL' },
  { wireNo: '3006', description: 'Powering 2 - 110VDC', itemName: 'POWERING2', systemCode: 'TRAC', carType: 'ALL' },
  { wireNo: '3010', description: 'Braking command - 110VDC', itemName: 'BRAKING', systemCode: 'TRAC', carType: 'ALL' },
  { wireNo: '3011', description: 'Full service brake - 110VDC', itemName: 'FULL SERVICE BRAKE', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '3013', description: 'Restricted mode - 110VDC', itemName: 'RM', systemCode: 'TRL', carType: 'ALL' },
  { wireNo: '3018', description: 'Standby mode - 110VDC', itemName: 'STANDBY', systemCode: 'TRL', carType: 'ALL' },
  { wireNo: '3019', description: 'Wheelspin control - 110VDC', itemName: 'WC', systemCode: 'TRAC', carType: 'ALL' },
  { wireNo: '3020A', description: 'Brake demand - 110VDC', itemName: 'BRAKE DEMAND', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '3026', description: 'Load compensation - 110VDC', itemName: 'LOAD COMP', systemCode: 'TRAC', carType: 'ALL' },
  { wireNo: '3060', description: 'ATO command - 110VDC', itemName: 'ATO', systemCode: 'TRL', carType: 'ALL' },
  { wireNo: '4024', description: 'Brake loop - 110VDC', itemName: 'BRAKE LOOP', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '4028', description: 'Brake loop return - 110VDC', itemName: 'BRAKE LOOP RETURN', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '4062', description: 'Emergency brake loop normal - 110VDC', itemName: 'EM BRAKE LOOP NORMAL', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '4070', description: 'Emergency brake loop return - 110VDC', itemName: 'EM BRAKE LOOP RETURN', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '4103', description: 'Emergency brake loop redundancy - 110VDC', itemName: 'EM BRAKE LOOP REDUNDANCY', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '4110', description: 'Emergency brake loop redundancy return - 110VDC', itemName: 'EM BRAKE LOOP REDUNDANCY RETURN', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '4122', description: 'Parking brake applied - 110VDC', itemName: 'PARKING BRAKE APPLIED', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '4123', description: 'Holding brake - 110VDC', itemName: 'HOLDING BRAKE', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '4153', description: 'Parking brake released - 110VDC', itemName: 'PARKING BRAKE RELEASED', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '4155', description: 'Parking brake pressure switch - 110VDC', itemName: 'PARKING BRAKE PRESSURE SWITCH', systemCode: 'BRAKE', carType: 'ALL' },
  { wireNo: '4600', description: 'ATO brake cutout - 110VDC', itemName: 'ATO BRAKE CUTOUT', systemCode: 'TRL', carType: 'ALL' },
  { wireNo: '5000', description: 'Shore supply contact - 415VAC', itemName: 'SHORE SUPPLY CONTACT', systemCode: 'AUX', carType: 'TC' },
  { wireNo: '5030', description: 'SIV contact 1 - 110VDC', itemName: 'SIV CONTACT1', systemCode: 'AUX', carType: 'TC' },
  { wireNo: '5031', description: 'SIV contact 2 - 110VDC', itemName: 'SIV CONTACT2', systemCode: 'AUX', carType: 'TC' },
  { wireNo: '5064', description: 'Battery under-voltage - 110VDC', itemName: 'BATTERY UNDER-VOLTAGE', systemCode: 'AUX', carType: 'ALL' },
  { wireNo: '6009', description: 'Door open left - 110VDC', itemName: 'DOOR OPEN LEFT', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6010', description: 'Door open L2 - 110VDC', itemName: 'DOOR OPEN L2', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6011', description: 'Door open L3 - 110VDC', itemName: 'DOOR OPEN L3', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6014', description: 'Door close left - 110VDC', itemName: 'DOOR CLOSE LEFT', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6015', description: 'Door close L2 - 110VDC', itemName: 'DOOR CLOSE L2', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6016', description: 'Door close L3 - 110VDC', itemName: 'DOOR CLOSE L3', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6034', description: 'Door close announcement - 110VDC', itemName: 'DOOR CLOSE ANNOUNCEMENT', systemCode: 'DOOR', carType: 'ALL' },
  { wireNo: '6046', description: 'Door open right - 110VDC', itemName: 'DOOR OPEN RIGHT', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6047', description: 'Door open R2 - 110VDC', itemName: 'DOOR OPEN R2', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6048', description: 'Door open R3 - 110VDC', itemName: 'DOOR OPEN R3', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6051', description: 'Door close right - 110VDC', itemName: 'DOOR CLOSE RIGHT', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6052', description: 'Door close R2 - 110VDC', itemName: 'DOOR CLOSE R2', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6053', description: 'Door close R3 - 110VDC', itemName: 'DOOR CLOSE R3', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6073', description: 'Door proving loop 1 - 110VDC', itemName: 'DOOR PROVING LOOP 1', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6076', description: 'Door proving loop 2 - 110VDC', itemName: 'DOOR PROVING LOOP 2', systemCode: 'DOOR', carType: 'MC' },
  { wireNo: '6112', description: 'Zero speed - 110VDC', itemName: 'ZERO SPEED', systemCode: 'TRL', carType: 'ALL' },
  { wireNo: '7001', description: 'Cab VAC in SSK - 110VDC', itemName: 'CAB VAC IN SSK', systemCode: 'VAC', carType: 'DMC' },
  { wireNo: '7050', description: 'Saloon VAC1 in SSK - 110VDC', itemName: 'SALOON VAC1 IN SSK', systemCode: 'VAC', carType: 'TC' },
  { wireNo: '7060', description: 'Saloon VAC2 in SSK - 110VDC', itemName: 'SALOON VAC2 IN SSK', systemCode: 'VAC', carType: 'TC' },
  { wireNo: '7070', description: 'Smoke detection - 110VDC', itemName: 'SMOKE DETECTION', systemCode: 'VAC', carType: 'ALL' },
  { wireNo: '7071', description: 'Damper operation - 110VDC', itemName: 'DAMPER OPERATION', systemCode: 'VAC', carType: 'ALL' },
  { wireNo: '9214', description: 'ATP mode - 110VDC', itemName: 'ATP MODE', systemCode: 'TRL', carType: 'ALL' },
  { wireNo: '9215', description: 'FWD mode - 110VDC', itemName: 'FWD MODE', systemCode: 'TRL', carType: 'ALL' },
  { wireNo: '9216', description: 'REV mode - 110VDC', itemName: 'REV MODE', systemCode: 'TRL', carType: 'ALL' },
];

export async function POST() {
  try {
    let trainlinesAdded = 0;
    let circuitsAdded = 0;

    for (const tl of TRAINLINE_DATA) {
      const existing = await prisma.trainLine.findFirst({
        where: { wireNo: tl.wireNo }
      });

      if (!existing) {
        const system = await prisma.system.findFirst({ 
          where: { code: { in: ['TRL', 'TRAC', 'BRAKE', 'AUX', 'DOOR', 'VAC'] } }
        });
        const drawing = await prisma.drawing.findFirst({
          where: { drawingNo: { contains: '942-581', mode: Prisma.QueryMode.insensitive } }
        });

        await prisma.trainLine.create({
          data: {
            wireNo: tl.wireNo,
            itemName: tl.itemName,
            carType: tl.carType,
            lineGroup: tl.lineGroup,
            note: tl.note,
            drawingId: drawing?.id || 'default',
          }
        });
        trainlinesAdded++;
      }
    }

    for (const c of CIRCUITS_DATA) {
      const existing = await prisma.circuit.findFirst({
        where: { circuitCode: c.wireNo }
      });

      if (!existing) {
        const drawing = await prisma.drawing.findFirst();

        await prisma.circuit.create({
          data: {
            circuitCode: c.wireNo,
            circuitName: c.itemName,
            category: c.systemCode,
            voltageText: '110VDC',
            carScope: c.carType,
            note: c.description,
            drawingId: drawing?.id || 'default',
          }
        });
        circuitsAdded++;
      }
    }

    const totalTrainlines = await prisma.trainLine.count();
    const totalCircuits = await prisma.circuit.count();

    return NextResponse.json({
      success: true,
      message: 'Circuit data seeded successfully',
      results: {
        trainlinesAdded,
        circuitsAdded,
        totalTrainlines,
        totalCircuits,
      }
    });
  } catch (error) {
    console.error('Circuit seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed circuits', details: (error as Error).message },
      { status: 500 }
    );
  }
}