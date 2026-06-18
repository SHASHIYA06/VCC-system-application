/**
 * GET /api/gsd/tree - Get hierarchical tree data for GSD visualization
 * Returns: System → Drawings → Connectors hierarchy with counts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const systemCode = searchParams.get('system');

  try {
    const startTime = Date.now();

    // Build system tree with drawing and connector counts
    const systemsWhere = systemCode ? { code: systemCode } : {};

    const systems = await prisma.system.findMany({
      where: systemsWhere,
      include: {
        metadata: { select: { dataCompleteness: true, syncStatus: true, totalDrawings: true, totalDevices: true } },
        _count: { select: { drawings: true, devices: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    // For each system, get top drawings with connector counts
    const tree = await Promise.all(
      systems.map(async (sys) => {
        const drawings = await prisma.drawing.findMany({
          where: { systemId: sys.id },
          select: {
            id: true,
            drawingNo: true,
            title: true,
            totalSheets: true,
            _count: { select: { connectors: true, devices: true, trainLines: true } },
          },
          orderBy: { drawingNo: 'asc' },
          take: 30, // Limit per system for performance
        });

        return {
          code: sys.code,
          name: sys.name,
          category: sys.category,
          drawingCount: sys._count.drawings,
          deviceCount: sys._count.devices,
          completeness: sys.metadata?.dataCompleteness || 0,
          syncStatus: sys.metadata?.syncStatus || 'PENDING',
          drawings: drawings.map(d => ({
            id: d.id,
            drawingNo: d.drawingNo,
            title: d.title,
            sheets: d.totalSheets,
            connectorCount: d._count.connectors,
            deviceCount: d._count.devices,
            trainlineCount: d._count.trainLines,
          })),
        };
      })
    );

    // Summary statistics
    const totalDrawings = tree.reduce((sum, s) => sum + s.drawingCount, 0);
    const totalDevices = tree.reduce((sum, s) => sum + s.deviceCount, 0);

    return NextResponse.json({
      success: true,
      data: tree,
      statistics: {
        totalSystems: tree.length,
        totalDrawings,
        totalDevices,
        totalConnectors: await prisma.connector.count(),
        totalWires: await prisma.wire.count(),
        totalPins: await prisma.connectorPin.count(),
      },
      executionTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error('GSD Tree API error:', error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
