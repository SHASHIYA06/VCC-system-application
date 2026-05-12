import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const fleetFormation = ['DMC', 'TC', 'MC', 'MC', 'TC', 'DMC'];

  try {
    const dbCars = await prisma.deviceInstance.findMany({
      where: { type: { name: { in: ['BECU', 'ETHERNET SWITCH', 'TCMS RIO'] } } },
      select: { carType: true },
      distinct: ['carType'],
    });
    return NextResponse.json({ car_types: dbCars.map(c => ({ code: c.carType || 'MC', name: c.carType || 'MC' })), fleet_formation: fleetFormation });
  } catch {
    return NextResponse.json({
      car_types: [
        { code: 'DMC', name: 'Driving Motor Car' },
        { code: 'TC', name: 'Trailer Car' },
        { code: 'MC', name: 'Motor Car' },
      ],
      fleet_formation: fleetFormation,
    });
  }
}