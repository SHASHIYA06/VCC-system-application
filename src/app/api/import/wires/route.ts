import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const WIRE_TRACES = [
  { trainlineNo: 3003, sourceDevice: 'TCMS_RIO1', sourceConn: 'X1', sourcePin: '17', destDevice: 'V1', destConn: 'CN1', destPin: '12', color: '#00BFFF', desc: 'Forward command' },
  { trainlineNo: 3004, sourceDevice: 'TCMS_RIO1', sourceConn: 'X1', sourcePin: '18', destDevice: 'V1', destConn: 'CN1', destPin: '13', color: '#00BFFF', desc: 'Reverse command' },
  { trainlineNo: 3005, sourceDevice: 'TCMS_RIO1', sourceConn: 'X1', sourcePin: '19', destDevice: 'V1', destConn: 'CN1', destPin: '14', color: '#FF6600', desc: 'Powering 1 (Crossed)', crossed: true, crossWith: '3006' },
  { trainlineNo: 3006, sourceDevice: 'TCMS_RIO1', sourceConn: 'X1', sourcePin: '20', destDevice: 'V1', destConn: 'CN1', destPin: '15', color: '#FF6600', desc: 'Powering 2 (Crossed)', crossed: true, crossWith: '3005' },
  { trainlineNo: 3010, sourceDevice: 'TCMS_RIO1', sourceConn: 'X1', sourcePin: '22', destDevice: 'V1', destConn: 'CN1', destPin: '16', color: '#00BFFF', desc: 'Braking command' },
  { trainlineNo: 3011, sourceDevice: 'TCMS_RIO1', sourceConn: 'X1', sourcePin: '23', destDevice: 'V1', destConn: 'CN1', destPin: '17', color: '#00BFFF', desc: 'Full service brake' },
  { trainlineNo: 4024, sourceDevice: 'BCU1', sourceConn: 'X1', sourcePin: '24', destDevice: 'BCU2', destConn: 'X1', destPin: '24', color: '#FF4444', desc: 'Brake loop normal' },
  { trainlineNo: 4028, sourceDevice: 'BCU2', sourceConn: 'X1', sourcePin: '24', destDevice: 'BCU1', destConn: 'X1', destPin: '24', color: '#444444', desc: 'Brake loop return' },
  { trainlineNo: 4062, sourceDevice: 'BCU1', sourceConn: 'X1', sourcePin: '42', destDevice: 'BCU3', destConn: 'X1', destPin: '42', color: '#FF0000', desc: 'EM brake loop normal' },
  { trainlineNo: 4070, sourceDevice: 'BCU3', sourceConn: 'X1', sourcePin: '42', destDevice: 'BCU1', destConn: 'X1', destPin: '42', color: '#444444', desc: 'EM brake loop return' },
  { trainlineNo: 4103, sourceDevice: 'BCU1', sourceConn: 'X1', sourcePin: '44', destDevice: 'BCU3', destConn: 'X1', destPin: '44', color: '#FF0000', desc: 'EM brake loop redundant' },
  { trainlineNo: 4122, sourceDevice: 'TCMS_RIO1', sourceConn: 'U15', sourcePin: 'K4', destDevice: 'PBMV1', destConn: 'CN1', destPin: '2', color: '#00BFFF', desc: 'Parking brake applied' },
  { trainlineNo: 4153, sourceDevice: 'TCMS_RIO1', sourceConn: 'U15', sourcePin: 'K5', destDevice: 'PBMV1', destConn: 'CN1', destPin: '3', color: '#00BFFF', desc: 'Parking brake released' },
  { trainlineNo: 6009, sourceDevice: 'TCMS_RIO1', sourceConn: 'U15', sourcePin: 'J7', destDevice: 'DCU1', destConn: 'CN1', destPin: '3', color: '#FFA500', desc: 'Door open left (Crossed)', crossed: true, crossWith: '6046' },
  { trainlineNo: 6014, sourceDevice: 'TCMS_RIO1', sourceConn: 'U15', sourcePin: 'J9', destDevice: 'DCU1', destConn: 'CN1', destPin: '5', color: '#FFA500', desc: 'Door close left (Crossed)', crossed: true, crossWith: '6051' },
  { trainlineNo: 6046, sourceDevice: 'TCMS_RIO1', sourceConn: 'U15', sourcePin: 'J8', destDevice: 'DCU1', destConn: 'CN1', destPin: '4', color: '#FFA500', desc: 'Door open right (Crossed)', crossed: true, crossWith: '6009' },
  { trainlineNo: 6051, sourceDevice: 'TCMS_RIO1', sourceConn: 'U15', sourcePin: 'J10', destDevice: 'DCU1', destConn: 'CN1', destPin: '6', color: '#FFA500', desc: 'Door close right (Crossed)', crossed: true, crossWith: '6014' },
  { trainlineNo: 6073, sourceDevice: 'DCU1', sourceConn: 'CN2', sourcePin: '3', destDevice: 'TCMS_RIO1', destConn: 'U15', destPin: 'H2', color: '#00BFFF', desc: 'Door 1 proving loop' },
  { trainlineNo: 6076, sourceDevice: 'DCU1', sourceConn: 'CN2', sourcePin: '4', destDevice: 'TCMS_RIO1', destConn: 'U15', destPin: 'H3', color: '#00BFFF', desc: 'Door 2 proving loop' },
  { trainlineNo: 6112, sourceDevice: 'V1', sourceConn: 'CN2', sourcePin: '3', destDevice: 'TCMS_RIO1', destConn: 'U15', destPin: 'L3', color: '#00BFFF', desc: 'Zero speed signal' },
  { trainlineNo: 7001, sourceDevice: 'CAB_VAC1', sourceConn: 'CN1', sourcePin: '5', destDevice: 'TCMS_RIO2', destConn: 'U25', destPin: 'F2', color: '#00BFFF', desc: 'Cab VAC fault' },
  { trainlineNo: 7050, sourceDevice: 'VAC1', sourceConn: 'CN1', sourcePin: '3', destDevice: 'TCMS_RIO1', destConn: 'U15', destPin: 'F4', color: '#00BFFF', desc: 'Saloon VAC 1 status' },
  { trainlineNo: 7060, sourceDevice: 'VAC1', sourceConn: 'CN1', sourcePin: '4', destDevice: 'TCMS_RIO1', destConn: 'U15', destPin: 'F5', color: '#00BFFF', desc: 'Saloon VAC 2 status' },
  { trainlineNo: 7070, sourceDevice: 'SMOKE_SNS', sourceConn: 'CN1', sourcePin: '1', destDevice: 'TCMS_RIO1', destConn: 'U15', destPin: 'F6', color: '#00BFFF', desc: 'Smoke detection' },
  { trainlineNo: 5000, sourceDevice: 'TCMS_RIO2', sourceConn: 'U25', sourcePin: 'H5', destDevice: 'SSB1', destConn: 'CN1', destPin: '3', color: '#00FF00', desc: 'Shore supply contact' },
  { trainlineNo: 5030, sourceDevice: 'APS1', sourceConn: 'CN3', sourcePin: '1', destDevice: 'TCMS_RIO2', destConn: 'U25', destPin: 'J6', color: '#00FF00', desc: 'SIV contactor 1' },
  { trainlineNo: 5031, sourceDevice: 'APS1', sourceConn: 'CN3', sourcePin: '2', destDevice: 'TCMS_RIO2', destConn: 'U25', destPin: 'J6', color: '#00FF00', desc: 'SIV contactor 2' },
  { trainlineNo: 5064, sourceDevice: 'BATT1', sourceConn: 'CN1', sourcePin: '2', destDevice: 'TCMS_RIO2', destConn: 'U25', destPin: 'G4', color: '#00FF00', desc: 'Battery under-voltage' },
  { trainlineNo: 1207, sourceDevice: 'V1', sourceConn: 'CN2', sourcePin: '5', destDevice: 'TCMS_RIO1', destConn: 'U15', destPin: 'M2', color: '#FF0000', desc: 'VVVF fault indication' },
  { trainlineNo: 1209, sourceDevice: 'HSCB1', sourceConn: 'CN1', sourcePin: '3', destDevice: 'TCMS_RIO1', destConn: 'U15', destPin: 'H4', color: '#FF0000', desc: 'HSCB trip status' },
  { trainlineNo: 1032, sourceDevice: 'OP_PNL1', sourceConn: 'CN1', sourcePin: '1', destDevice: 'TCMS_RIO1', destConn: 'X1', destPin: '32', color: '#00BFFF', desc: 'System reset' },
  { trainlineNo: 1040, sourceDevice: 'OP_PNL1', sourceConn: 'CN1', sourcePin: '2', destDevice: 'APS1', destConn: 'CN2', destPin: '1', color: '#00FF00', desc: 'Auxiliary power on' },
  { trainlineNo: 1050, sourceDevice: 'OP_PNL1', sourceConn: 'CN1', sourcePin: '3', destDevice: 'APS1', destConn: 'CN2', destPin: '2', color: '#444444', desc: 'System shutdown' },
];

export async function POST() {
  try {
    let imported = 0;

    for (const trace of WIRE_TRACES) {
      const wire = await prisma.wire.findUnique({ where: { wireNo: String(trace.trainlineNo) } });

      if (wire) {
        await prisma.wire.update({
          where: { id: wire.id },
          data: {
            sourceEq: trace.sourceDevice,
            sourceConnector: trace.sourceConn,
            sourcePin: trace.sourcePin,
            destEq: trace.destDevice,
            destConnector: trace.destConn,
            destPin: trace.destPin,
            wireColor: trace.color === '#FF6600' || trace.color === '#FFA500' ? 'Orange' : trace.color === '#FF0000' ? 'Red' : trace.color === '#00FF00' ? 'Green' : 'Blue',
          }
        });
        imported++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Wire traces imported successfully',
      count: imported,
    });
  } catch (error) {
    console.error('Wire import error:', error);
    return NextResponse.json({ success: false, message: 'Wire import failed', errors: [(error as Error).message] }, { status: 500 });
  }
}