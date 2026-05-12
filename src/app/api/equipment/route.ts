import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EQUIPMENT_STATIC = [
  { id: 'eq-1', code: 'TCMS-RIO-1', name: 'TCMS RIO Unit 1', system_code: 'TCMS', car_code: 'MC', description: 'Remote IO module for TCMS', remarks: '' },
  { id: 'eq-2', code: 'TCMS-RIO-2', name: 'TCMS RIO Unit 2', system_code: 'TCMS', car_code: 'MC', description: 'Remote IO module for TCMS', remarks: '' },
  { id: 'eq-3', code: 'ETH-SW-1', name: 'Ethernet Switch', system_code: 'CCTV', car_code: 'MC', description: '8-port M12 Ethernet switch', remarks: '' },
  { id: 'eq-4', code: 'CAM-INT-1', name: 'Interior Camera 1', system_code: 'CCTV', car_code: 'MC', description: 'Interior CCTV camera', remarks: '' },
  { id: 'eq-5', code: 'CAM-INT-2', name: 'Interior Camera 2', system_code: 'CCTV', car_code: 'MC', description: 'Interior CCTV camera', remarks: '' },
  { id: 'eq-6', code: 'AAU-1', name: 'AAU', system_code: 'AAU', car_code: 'MC', description: 'Audio alarm unit', remarks: '' },
  { id: 'eq-7', code: 'PEAU-R1', name: 'PEAU R1', system_code: 'AAU', car_code: 'MC', description: 'Passenger emergency alarm unit', remarks: '' },
  { id: 'eq-8', code: 'PEAU-R2', name: 'PEAU R2', system_code: 'AAU', car_code: 'MC', description: 'Passenger emergency alarm unit', remarks: '' },
  { id: 'eq-9', code: 'PEAU-L1', name: 'PEAU L1', system_code: 'AAU', car_code: 'MC', description: 'Passenger emergency alarm unit', remarks: '' },
  { id: 'eq-10', code: 'PEAU-L2', name: 'PEAU L2', system_code: 'AAU', car_code: 'MC', description: 'Passenger emergency alarm unit', remarks: '' },
  { id: 'eq-11', code: 'TFT-R1', name: 'TFT Display R1', system_code: 'PIS', car_code: 'MC', description: 'Passenger TFT display', remarks: '' },
  { id: 'eq-12', code: 'TFT-R2', name: 'TFT Display R2', system_code: 'PIS', car_code: 'MC', description: 'Passenger TFT display', remarks: '' },
  { id: 'eq-13', code: 'TFT-L1', name: 'TFT Display L1', system_code: 'PIS', car_code: 'MC', description: 'Passenger TFT display', remarks: '' },
  { id: 'eq-14', code: 'TFT-L2', name: 'TFT Display L2', system_code: 'PIS', car_code: 'MC', description: 'Passenger TFT display', remarks: '' },
  { id: 'eq-15', code: 'BECU-1', name: 'BECU', system_code: 'BECU', car_code: 'MC', description: 'Brake electronic control unit', remarks: '' },
  { id: 'eq-16', code: 'COMM-NODE-1', name: 'TCMS Communication Node 1', system_code: 'COMM', car_code: 'MC', description: 'Communication node', remarks: '' },
  { id: 'eq-17', code: 'COMM-NODE-2', name: 'TCMS Communication Node 2', system_code: 'COMM', car_code: 'MC', description: 'Communication node', remarks: '' },
  { id: 'eq-18', code: 'DII-1', name: 'Door Inside Indicator', system_code: 'DOOR', car_code: 'MC', description: 'Door inside indicator', remarks: '' },
  { id: 'eq-19', code: 'DOI-1', name: 'Door Outside Indicator', system_code: 'DOOR', car_code: 'MC', description: 'Door outside indicator', remarks: '' },
  { id: 'eq-20', code: 'LTEB-1', name: 'LTEB', system_code: 'LTEB', car_code: 'MC', description: 'Low tension equipment box', remarks: '' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const car_code = searchParams.get('car_code');
  const system_code = searchParams.get('system_code');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '100');

  try {
    const devices = await prisma.deviceInstance.findMany({
      where: {
        ...(car_code ? { carType: car_code } : {}),
        ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      include: { system: true, type: true, connectors: { include: { pins: true } } },
      take: limit,
      orderBy: { name: 'asc' },
    });

    const equipment = devices.map(d => ({
      id: d.id,
      code: d.tag || d.name,
      name: d.name,
      system_code: d.system?.code || '',
      car_code: d.carType || '',
      description: d.remarks || '',
      remarks: d.remarks || '',
      connector_count: d.connectors.length,
    }));

    return NextResponse.json({ equipment, count: equipment.length });
  } catch {
    let result = EQUIPMENT_STATIC;
    if (car_code) result = result.filter(e => e.car_code === car_code);
    if (system_code) result = result.filter(e => e.system_code === system_code);
    if (search) result = result.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
    return NextResponse.json({ equipment: result, count: result.length });
  }
}