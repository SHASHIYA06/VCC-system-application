import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TRAINLINES_STATIC = [
  { trainline_no: '3003', name: 'DOOR_STATUS_1', voltage_domain: '24V', description: 'Door status monitoring circuit 1', car_code: 'MC', system_code: 'DOOR', is_cross_connected: false },
  { trainline_no: '3004', name: 'DOOR_STATUS_2', voltage_domain: '24V', description: 'Door status monitoring circuit 2', car_code: 'MC', system_code: 'DOOR', is_cross_connected: false },
  { trainline_no: '3005', name: 'PROPULSION_SIGNAL', voltage_domain: '110V', description: 'Propulsion system signal - cross-connected via X1-19', car_code: 'MC', system_code: 'TCMS', is_cross_connected: true },
  { trainline_no: '3006', name: 'PROPULSION_FEEDBACK', voltage_domain: '110V', description: 'Propulsion feedback - cross-connected via X1-20', car_code: 'MC', system_code: 'TCMS', is_cross_connected: true },
  { trainline_no: '3007', name: 'TCMS_RIO_IN_1', voltage_domain: '24V', description: 'TCMS RIO input 1', car_code: 'MC', system_code: 'TCMS', is_cross_connected: false },
  { trainline_no: '3008', name: 'TCMS_RIO_IN_2', voltage_domain: '24V', description: 'TCMS RIO input 2', car_code: 'MC', system_code: 'TCMS', is_cross_connected: false },
  { trainline_no: '3009', name: 'TCMS_RIO_OUT_1', voltage_domain: '24V', description: 'TCMS RIO output 1', car_code: 'MC', system_code: 'TCMS', is_cross_connected: false },
  { trainline_no: '3010', name: 'TCMS_RIO_OUT_2', voltage_domain: '24V', description: 'TCMS RIO output 2', car_code: 'MC', system_code: 'TCMS', is_cross_connected: false },
  { trainline_no: '4021', name: 'CCTV_ETH_1', voltage_domain: '24V', description: 'CCTV Ethernet channel 1', car_code: 'MC', system_code: 'CCTV', is_cross_connected: false },
  { trainline_no: '4022', name: 'CCTV_ETH_2', voltage_domain: '24V', description: 'CCTV Ethernet channel 2', car_code: 'MC', system_code: 'CCTV', is_cross_connected: false },
  { trainline_no: '4024', name: 'AAU_AUDIO_IN', voltage_domain: '24V', description: 'AAU audio input', car_code: 'MC', system_code: 'AAU', is_cross_connected: false },
  { trainline_no: '4062', name: 'PEAU_SIGNAL', voltage_domain: '24V', description: 'PEAU signal circuit', car_code: 'MC', system_code: 'AAU', is_cross_connected: false },
  { trainline_no: '4103', name: 'TFT_ETH_1', voltage_domain: '24V', description: 'TFT display Ethernet - CAT5e shielded', car_code: 'MC', system_code: 'PIS', is_cross_connected: false },
  { trainline_no: '4122', name: 'TCMS_COMM_1', voltage_domain: '24V', description: 'TCMS communication channel 1', car_code: 'MC', system_code: 'COMM', is_cross_connected: false },
  { trainline_no: '6009', name: 'DOOR_OPEN_CMD', voltage_domain: '110V', description: 'Door open command - jumper 43-44', car_code: 'MC', system_code: 'DOOR', is_cross_connected: true },
  { trainline_no: '6014', name: 'DOOR_CLOSE_CMD', voltage_domain: '110V', description: 'Door close command - jumper 46-47', car_code: 'MC', system_code: 'DOOR', is_cross_connected: true },
  { trainline_no: '6046', name: 'DOOR_OPEN_FB', voltage_domain: '110V', description: 'Door open feedback - jumper 43-44', car_code: 'MC', system_code: 'DOOR', is_cross_connected: true },
  { trainline_no: '6051', name: 'DOOR_CLOSE_FB', voltage_domain: '110V', description: 'Door close feedback - jumper 46-47', car_code: 'MC', system_code: 'DOOR', is_cross_connected: true },
  { trainline_no: '7001', name: 'BECU_POWER', voltage_domain: '110V', description: 'BECU main power supply', car_code: 'MC', system_code: 'BECU', is_cross_connected: false },
  { trainline_no: '7050', name: 'BECU_SIGNAL', voltage_domain: '24V', description: 'BECU signal circuit', car_code: 'MC', system_code: 'BECU', is_cross_connected: false },
  { trainline_no: '7060', name: 'BECU_GROUND', voltage_domain: '0V', description: 'BECU ground connection', car_code: 'MC', system_code: 'BECU', is_cross_connected: false },
  { trainline_no: '6112', name: 'TCMS_TB_SIGNAL', voltage_domain: '24V', description: 'TCMS terminal block signal', car_code: 'MC', system_code: 'TCMS', is_cross_connected: false },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const voltage_domain = searchParams.get('voltage_domain');
  const is_cross_connected = searchParams.get('is_cross_connected');
  const system_code = searchParams.get('system_id');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    const pins = await prisma.connectorPin.findMany({
      take: limit,
      include: { connector: { include: { device: { include: { system: true } } } } },
    });

    const trainlines = pins
      .filter(p => p.wireNo)
      .map(p => ({
        trainline_no: p.wireNo,
        name: p.endpointLabel || p.signalName || `PIN-${p.pinNo}`,
        voltage_domain: '24V',
        description: `${p.connector?.connectorCode || ''} pin ${p.pinNo} - ${p.endpointLabel || ''}`,
        car_code: p.connector?.device?.carType || 'MC',
        system_code: p.connector?.device?.system?.code || 'TCMS',
        is_cross_connected: ['3005', '3006', '6009', '6046', '6014', '6051'].includes(p.wireNo || ''),
      }));

    return NextResponse.json({ trainlines, count: trainlines.length });
  } catch {
    let result = TRAINLINES_STATIC;
    if (voltage_domain) result = result.filter(t => t.voltage_domain === voltage_domain);
    if (is_cross_connected === 'true') result = result.filter(t => t.is_cross_connected);
    if (system_code) result = result.filter(t => t.system_code === system_code);
    return NextResponse.json({ trainlines: result, count: result.length });
  }
}