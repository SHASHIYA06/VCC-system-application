import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TRAINLINE_TRACES: Record<string, { source: any; destination: any; junctions: any[]; wires: string[] }> = {
  '3003': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'X1-17', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'VVVF Inverter 1', pin: 'CN1-12', car: 'DMC' }, wires: ['3003', '3004'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: '17' }] },
  '3004': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'X1-18', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'VVVF Inverter 1', pin: 'CN1-13', car: 'DMC' }, wires: ['3004', '3003'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: '18' }] },
  '3005': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'X1-19', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'VVVF Inverter 1', pin: 'CN1-14', car: 'DMC' }, wires: ['3005', '3006'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper (CROSSED)', pin: '19/20', description: 'Crossed with 3006 at X1 pins 19/20 - propulsion interlock' }] },
  '3006': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'X1-20', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'VVVF Inverter 1', pin: 'CN1-15', car: 'DMC' }, wires: ['3006', '3005'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper (CROSSED)', pin: '20/19', description: 'Crossed with 3005 at X1 pins 20/19 - propulsion interlock' }] },
  '3007': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN11-1', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO CN11', pin: 'Pin 1', car: 'MC' }, wires: ['3007'], junctions: [] },
  '3008': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN11-2', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO CN11', pin: 'Pin 2', car: 'MC' }, wires: ['3008'], junctions: [] },
  '3009': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN11-3', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO CN11', pin: 'Pin 3', car: 'MC' }, wires: ['3009'], junctions: [] },
  '3010': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'X1-22', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'VVVF Inverter 1', pin: 'CN1-16', car: 'DMC' }, wires: ['3010'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: '22' }] },
  '4024': { source: { type: 'equipment', code: 'AAU-1', name: 'Audio Alarm Unit', pin: 'CN1-1', car: 'MC' }, destination: { type: 'equipment', code: 'PEAU-R1', name: 'PEAU R1', pin: 'CN1-1', car: 'MC' }, wires: ['4024'], junctions: [] },
  '4062': { source: { type: 'equipment', code: 'PEAU-R1', name: 'PEAU R1', pin: 'CN1-2', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN12-5', car: 'MC' }, wires: ['4062'], junctions: [] },
  '4103': { source: { type: 'equipment', code: 'TFT-R1', name: 'TFT Display R1', pin: 'CN1-1', car: 'MC' }, destination: { type: 'equipment', code: 'ETH-SW-1', name: 'Ethernet Switch', pin: 'M12-1', car: 'MC' }, wires: ['4103'], junctions: [{ type: 'cable', code: 'CAT5e', name: 'CAT5e Shielded', pin: 'TX+' }] },
  '4122': { source: { type: 'equipment', code: 'COMM-NODE-1', name: 'TCMS Communication Node 1', pin: 'CN1-1', car: 'MC' }, destination: { type: 'equipment', code: 'COMM-NODE-2', name: 'TCMS Communication Node 2', pin: 'CN1-1', car: 'MC' }, wires: ['4122'], junctions: [] },
  '6009': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN17-3', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'Door Control Unit', pin: 'CN1-3', car: 'MC' }, wires: ['6009', '6046'], junctions: [{ type: 'connector', code: 'JUMPER', name: 'Jumper 43-44 (CROSSED)', pin: '43/44', description: 'Door open circuit crossed at jumpers 43-44' }] },
  '6014': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN17-5', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'Door Control Unit', pin: 'CN1-5', car: 'MC' }, wires: ['6014', '6051'], junctions: [{ type: 'connector', code: 'JUMPER', name: 'Jumper 46-47 (CROSSED)', pin: '46/47', description: 'Door close circuit crossed at jumpers 46-47' }] },
  '6046': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN17-4', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'Door Control Unit', pin: 'CN1-4', car: 'MC' }, wires: ['6046', '6009'], junctions: [{ type: 'connector', code: 'JUMPER', name: 'Jumper 43-44 (CROSSED)', pin: '43/44', description: 'Door open circuit - right side' }] },
  '6051': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN17-6', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'Door Control Unit', pin: 'CN1-6', car: 'MC' }, wires: ['6051', '6014'], junctions: [{ type: 'connector', code: 'JUMPER', name: 'Jumper 46-47 (CROSSED)', pin: '46/47', description: 'Door close circuit - right side' }] },
  '6112': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN15-3', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS TB', pin: 'TB-3', car: 'MC' }, wires: ['6112'], junctions: [{ type: 'trainline', code: 'X1', name: 'Inter-car Jumper', pin: '48' }] },
  '7001': { source: { type: 'equipment', code: 'BECU-1', name: 'BECU', pin: 'CN1-1', car: 'MC' }, destination: { type: 'equipment', code: 'EDB-1', name: 'EDB', pin: 'CN1-1', car: 'MC' }, wires: ['7001'], junctions: [] },
  '7050': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN15-4', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'VAC Unit', pin: 'CN1-3', car: 'MC' }, wires: ['7050', '7060'], junctions: [{ type: 'trainline', code: 'X1', name: 'VAC Status Loop', pin: '55' }] },
  '7060': { source: { type: 'equipment', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', pin: 'CN15-5', car: 'MC' }, destination: { type: 'equipment', code: 'TCMS-RIO-1', name: 'VAC Unit', pin: 'CN1-4', car: 'MC' }, wires: ['7060', '7050'], junctions: [{ type: 'trainline', code: 'X1', name: 'VAC Status Loop', pin: '56' }] },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trainlineNo = searchParams.get('trainline_no');

  if (!trainlineNo) {
    return NextResponse.json({ error: 'trainline_no required' }, { status: 400 });
  }

  try {
    const wire = await prisma.wire.findUnique({ where: { wireNo: trainlineNo } });
    const pins = await prisma.connectorPin.findMany({
      where: { wireNo: trainlineNo },
      include: { connector: { include: { device: { include: { system: true } } } } },
    });

    const trace = TRAINLINE_TRACES[trainlineNo] || {
      source: { type: 'unknown', code: 'N/A', name: 'See pin data', pin: 'N/A', car: 'N/A' },
      destination: { type: 'unknown', code: 'N/A', name: 'See pin data', pin: 'N/A', car: 'N/A' },
      wires: [trainlineNo],
      junctions: [],
    };

    return NextResponse.json({
      trainline_no: trainlineNo,
      wire: wire || { wire_no: trainlineNo, wire_type: 'FENW', voltage_class: '24V' },
      pins,
      trace,
      is_cross_connected: ['3005', '3006', '6009', '6046', '6014', '6051'].includes(trainlineNo),
    });
  } catch (e) {
    const trace = TRAINLINE_TRACES[trainlineNo] || {
      source: { type: 'unknown', code: 'N/A', name: 'Unknown', pin: 'N/A', car: 'N/A' },
      destination: { type: 'unknown', code: 'N/A', name: 'Unknown', pin: 'N/A', car: 'N/A' },
      wires: [trainlineNo],
      junctions: [],
    };
    return NextResponse.json({
      trainline_no: trainlineNo,
      wire: { wire_no: trainlineNo, wire_type: 'FENW', voltage_class: '24V' },
      trace,
      is_cross_connected: ['3005', '3006', '6009', '6046', '6014', '6051'].includes(trainlineNo),
    });
  }
}