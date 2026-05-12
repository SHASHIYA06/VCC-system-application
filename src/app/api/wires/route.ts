import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const WIRES_STATIC = [
  { wire_no: '3003', wire_type: 'FENW 0.75', wire_color: 'GREEN', voltage_class: '24V', description: 'DOOR_STATUS_1', remarks: '' },
  { wire_no: '3004', wire_type: 'FENW 0.75', wire_color: 'GREEN', voltage_class: '24V', description: 'DOOR_STATUS_2', remarks: '' },
  { wire_no: '3005', wire_type: 'FENW 1.0', wire_color: 'YELLOW', voltage_class: '110V', description: 'PROPULSION_SIGNAL', remarks: 'Cross-connected X1-19' },
  { wire_no: '3006', wire_type: 'FENW 1.0', wire_color: 'YELLOW', voltage_class: '110V', description: 'PROPULSION_FEEDBACK', remarks: 'Cross-connected X1-20' },
  { wire_no: '3007', wire_type: 'FENW 0.75', wire_color: 'BLUE', voltage_class: '24V', description: 'TCMS_RIO_IN_1', remarks: '' },
  { wire_no: '3008', wire_type: 'FENW 0.75', wire_color: 'BLUE', voltage_class: '24V', description: 'TCMS_RIO_IN_2', remarks: '' },
  { wire_no: '3009', wire_type: 'FENW 0.75', wire_color: 'WHITE', voltage_class: '24V', description: 'TCMS_RIO_OUT_1', remarks: '' },
  { wire_no: '3010', wire_type: 'FENW 0.75', wire_color: 'WHITE', voltage_class: '24V', description: 'TCMS_RIO_OUT_2', remarks: '' },
  { wire_no: '4021', wire_type: 'FENW 0.5', wire_color: 'RED', voltage_class: '24V', description: 'CCTV_ETHERNET_1', remarks: '' },
  { wire_no: '4022', wire_type: 'FENW 0.5', wire_color: 'RED', voltage_class: '24V', description: 'CCTV_ETHERNET_2', remarks: '' },
  { wire_no: '4024', wire_type: 'FENW 0.75', wire_color: 'BLACK', voltage_class: '24V', description: 'AAU_AUDIO_IN', remarks: '' },
  { wire_no: '4062', wire_type: 'FENW 0.75', wire_color: 'BROWN', voltage_class: '24V', description: 'PEAU_SIGNAL', remarks: '' },
  { wire_no: '4103', wire_type: 'CAT5e', wire_color: 'BLUE', voltage_class: '24V', description: 'TFT_ETH_1', remarks: 'CAT5e shielded' },
  { wire_no: '4122', wire_type: 'FENW 0.5', wire_color: 'ORANGE', voltage_class: '24V', description: 'TCMS_COMM_1', remarks: '' },
  { wire_no: '6009', wire_type: 'FENW 1.5', wire_color: 'RED', voltage_class: '110V', description: 'DOOR_OPEN_COMMAND', remarks: 'Jumper 43-44' },
  { wire_no: '6014', wire_type: 'FENW 1.5', wire_color: 'GREEN', voltage_class: '110V', description: 'DOOR_CLOSE_COMMAND', remarks: 'Jumper 46-47' },
  { wire_no: '6046', wire_type: 'FENW 1.5', wire_color: 'YELLOW', voltage_class: '110V', description: 'DOOR_OPEN_FEEDBACK', remarks: 'Jumper 43-44' },
  { wire_no: '6051', wire_type: 'FENW 1.5', wire_color: 'BLUE', voltage_class: '110V', description: 'DOOR_CLOSE_FEEDBACK', remarks: 'Jumper 46-47' },
  { wire_no: '7001', wire_type: 'FENW 2.5', wire_color: 'BLACK', voltage_class: '110V', description: 'BECU_POWER', remarks: '' },
  { wire_no: '7050', wire_type: 'FENW 2.5', wire_color: 'BLACK', voltage_class: '110V', description: 'BECU_SIGNAL', remarks: '' },
  { wire_no: '7060', wire_type: 'FENW 2.5', wire_color: 'BLACK', voltage_class: '110V', description: 'BECU_GROUND', remarks: '' },
  { wire_no: '6112', wire_type: 'FENW 1.0', wire_color: 'GREY', voltage_class: '24V', description: 'TCMS_TB_SIGNAL', remarks: '' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const voltage_class = searchParams.get('voltage_class');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    const wires = await prisma.wire.findMany({
      where: search ? { wireNo: { contains: search, mode: 'insensitive' } } : {},
      include: { endpoints: { include: { connector: true, device: true } } },
      take: limit,
      orderBy: { wireNo: 'asc' },
    });
    return NextResponse.json({ wires, count: wires.length });
  } catch {
    let result = WIRES_STATIC;
    if (voltage_class) result = result.filter(w => w.voltage_class === voltage_class);
    if (search) result = result.filter(w => w.wire_no.includes(search) || w.description.toLowerCase().includes(search.toLowerCase()));
    return NextResponse.json({ wires: result, count: result.length });
  }
}