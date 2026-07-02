/**
 * GET /api/systems/status
 * Fetch all system status with metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const systemCode = searchParams.get('systemCode');

    if (systemCode) {
      // Get specific system status
      const system = await prisma.system.findUnique({
        where: { code: systemCode },
        include: {
          metadata: true,
          vccDescription: {
            select: {
              description: true,
              source: true,
              lastUpdated: true
            }
          },
          _count: {
            select: {
              drawings: true,
              devices: true
            }
          }
        }
      });

      if (!system) {
        return NextResponse.json(
          { error: 'System not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          code: system.code,
          name: system.name,
          category: system.category,
          dataStatus: system.dataStatus,
          dataCompleteness: system.metadata?.dataCompleteness || 0,
          syncStatus: system.metadata?.syncStatus || 'PENDING',
          totalDrawings: system.metadata?.totalDrawings || system._count.drawings,
          verifiedDrawings: system.metadata?.verifiedDrawings || 0,
          totalDevices: system.metadata?.totalDevices || system._count.devices,
          lastSync: system.metadata?.lastSyncTime,
          description: system.vccDescription?.description,
          descriptionSource: system.vccDescription?.source,
          descriptionLastUpdated: system.vccDescription?.lastUpdated
        },
        executionTime: Date.now() - startTime
      });
    }

    // Get all systems status
    const systems = await prisma.system.findMany({
      where: { isActive: true },
      include: {
        metadata: true,
        _count: {
          select: {
            drawings: true,
            devices: true
          }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });

    const systemsData = systems.map(system => ({
      code: system.code,
      name: system.name,
      category: system.category,
      displayName: system.uiMenuDisplayName || system.name,
      iconName: system.iconName,
      colorTheme: system.colorTheme,
      dataStatus: system.dataStatus,
      dataCompleteness: system.metadata?.dataCompleteness || 0,
      syncStatus: system.metadata?.syncStatus || 'PENDING',
      totalDrawings: system.metadata?.totalDrawings || system._count.drawings,
      verifiedDrawings: system.metadata?.verifiedDrawings || 0,
      totalDevices: system.metadata?.totalDevices || system._count.devices,
      totalConnectors: system.metadata?.totalConnectors || 0,
      lastSync: system.metadata?.lastSyncTime,
      syncErrors: system.metadata?.syncErrors
    }));

    // Calculate aggregate stats
    const aggregateStats = {
      totalSystems: systemsData.length,
      averageCompleteness: systemsData.reduce((sum, s) => sum + s.dataCompleteness, 0) / systemsData.length,
      completeCount: systemsData.filter(s => s.syncStatus === 'COMPLETE').length,
      pendingCount: systemsData.filter(s => s.syncStatus === 'PENDING').length,
      syncingCount: systemsData.filter(s => s.syncStatus === 'SYNCING').length,
      failedCount: systemsData.filter(s => s.syncStatus === 'FAILED').length,
      totalDrawingsAcross: systemsData.reduce((sum, s) => sum + s.totalDrawings, 0),
      totalDevicesAcross: systemsData.reduce((sum, s) => sum + s.totalDevices, 0)
    };

    return NextResponse.json({
      success: true,
      data: systemsData,
      aggregateStats,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to fetch system status:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch system status',
      executionTime: Date.now() - startTime
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { systemCode, metadata } = await request.json();

    if (!systemCode) {
      return NextResponse.json(
        { error: 'systemCode is required' },
        { status: 400 }
      );
    }

    const updated = await prisma.systemMetadata.upsert({
      where: { systemCode },
      update: {
        ...metadata,
        updatedAt: new Date()
      },
      create: {
        systemCode,
        ...metadata
      }
    });

    console.log(`✅ Updated metadata for system ${systemCode}`);

    return NextResponse.json({
      success: true,
      message: `Updated metadata for system ${systemCode}`,
      data: updated,
      executionTime: Date.now() - startTime
    });

  } catch (error) {
    console.error('Failed to update system metadata:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update metadata',
      executionTime: Date.now() - startTime
    }, { status: 500 });
  }
}
