import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * VCC Descriptions API
 * Returns VCC system descriptions from the database (not static data)
 * GET /api/vcc-descriptions — returns all systems with their VCC descriptions
 * GET /api/vcc-descriptions?systemCode=TRAC — returns a single system description
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('systemCode');

  try {
    if (systemCode) {
      // Single system with full description
      const system = await prisma.system.findUnique({
        where: { code: systemCode },
        include: {
          vccDescription: true,
          metadata: true,
          subsystems: { orderBy: { sortOrder: 'asc' } },
          devices: {
            take: 50,
            orderBy: { deviceName: 'asc' },
            select: { id: true, deviceName: true, deviceType: true, tagNo: true, carType: true },
          },
          drawings: {
            orderBy: { drawingNo: 'asc' },
            select: { id: true, drawingNo: true, title: true, revision: true, totalSheets: true },
          },
        },
      });

      if (!system) {
        return NextResponse.json({ success: false, error: 'System not found' }, { status: 404 });
      }

      // Also get connector and wire counts for this system
      const connectorCount = await prisma.connector.count({
        where: { drawing: { systemId: system.id } },
      });
      const wireCount = await prisma.drawingWire.count({
        where: { drawing: { systemId: system.id } },
      });
      const trainlineCount = await prisma.trainLine.count({
        where: { drawing: { systemId: system.id } },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...system,
          connectorCount,
          wireCount,
          trainlineCount,
        },
      });
    }

    // All systems with their VCC descriptions
    const systems = await prisma.system.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        vccDescription: {
          select: {
            description: true,
            technicalSpecs: true,
            powerRequirements: true,
            voltage: true,
            safetyFeatures: true,
          },
        },
        metadata: {
          select: {
            dataCompleteness: true,
            totalDrawings: true,
            verifiedDrawings: true,
            totalDevices: true,
            totalConnectors: true,
            totalWires: true,
          },
        },
        _count: {
          select: { devices: true, drawings: true, subsystems: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: systems.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        category: s.category,
        description: s.description,
        vccDescription: s.vccDescription,
        metadata: s.metadata,
        counts: s._count,
      })),
    });
  } catch (error: any) {
    console.error('VCC descriptions error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
