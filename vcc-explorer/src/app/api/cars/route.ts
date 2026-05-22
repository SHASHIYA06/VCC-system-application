import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeStats = searchParams.get('stats') === 'true';

  const carTypes = [
    { code: 'DMC', name: 'Driving Motor Car', position: 1, description: 'Leading Driving Car with Cab A - Controls train from front' },
    { code: 'TC', name: 'Trailer Car', position: 2, description: 'Trailer Car with Pantograph - Contains APS and pantograph' },
    { code: 'MC', name: 'Motor Car', position: 3, description: 'Motor Car without Cab - Contains VVVF and traction equipment' },
    { code: 'MC', name: 'Motor Car', position: 4, description: 'Motor Car without Cab - Contains VVVF and traction equipment' },
    { code: 'TC', name: 'Trailer Car', position: 5, description: 'Trailer Car with Pantograph - Contains APS and pantograph' },
    { code: 'DMC', name: 'Driving Motor Car', position: 6, description: 'Trailing Driving Car with Cab B - Controls train from rear' },
  ];

  try {
    if (includeStats) {
      const stats = await Promise.all(
        carTypes.map(async (car) => {
          const [equipmentCount, connectorCount, wireCount] = await Promise.all([
            prisma.device.count({ where: { carType: car.code } }),
            prisma.connector.count({
              where: { carType: car.code },
            }),
            prisma.wire.count({
              where: { remarks: { contains: car.code } },
            }),
          ]);
          return {
            ...car,
            stats: { equipment: equipmentCount, connectors: connectorCount, wires: wireCount },
          };
        })
      );
      return NextResponse.json({
        cars: stats,
        formation: 'DMC-TC-MC-MC-TC-DMC',
        totalCars: 6,
      });
    }

    return NextResponse.json({
      cars: carTypes,
      formation: 'DMC-TC-MC-MC-TC-DMC',
      totalCars: 6,
    });
  } catch (error) {
    console.error('Error fetching car types:', error);
    return NextResponse.json({ error: 'Failed to fetch car types' }, { status: 500 });
  }
}