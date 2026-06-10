/**
 * GET /api/drawings/sync-status
 * Get drawing synchronization status across all systems
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);
    const systemCode = searchParams.get('systemCode');

    let query: any = {};
    if (systemCode) {
      query = { system: { code: systemCode } };
    }

    // Get drawing counts
    const totalDrawings = await prisma.drawing.count({ where: query });
    const syncedDrawings = await prisma.drawing.count({
      where: {
        ...query,
        isSynced: true
      }
    });

    const verifiedDrawings = await prisma.drawingVerificationStatus.count({
      where: {
        status: 'VERIFIED',
        ...(systemCode && { drawing: { system: { code: systemCode } } })
      }
    });

    // Get mapping status
    const mappedDrawings = await prisma.drawingPageMapping.count({
      where: {
        verified: true,
        ...(systemCode && { drawing: { system: { code: systemCode } } })
      }
    });

    // Get device verification
    const verifiedDevices = await prisma.device.count({
      where: {
        isVerified: true,
        ...(systemCode && { system: { code: systemCode } })
      }
    });

    const totalDevices = await prisma.device.count({
      where: systemCode ? { system: { code: systemCode } } : {}
    });

    // Get system-wise breakdown
    let systemBreakdown: any[] = [];
    if (!systemCode) {
      const systems = await prisma.system.findMany({
        include: {
          _count: {
            select: {
              drawings: true,
              devices: true
            }
          }
        }
      });

      systemBreakdown = await Promise.all(
        systems.map(async (sys) => {
          const synced = await prisma.drawing.count({
            where: {
              systemId: sys.id,
              isSynced: true
            }
          });

          const verified = await prisma.drawingVerificationStatus.count({
            where: {
              drawing: { systemId: sys.id },
              status: 'VERIFIED'
            }
          });

          return {
            systemCode: sys.code,
            systemName: sys.name,
            totalDrawings: sys._count.drawings,
            syncedDrawings: synced,
            syncPercentage: sys._count.drawings > 0 
              ? Math.round((synced / sys._count.drawings) * 100)
              : 0,
            verifiedDrawings: verified,
            verificationPercentage: sys._count.drawings > 0
              ? Math.round((verified / sys._count.drawings) * 100)
              : 0,
            totalDevices: sys._count.devices,
            verifiedDevices: await prisma.device.count({
              where: {
                systemId: sys.id,
                isVerified: true
              }
            })
          };
        })
      );
    }

    const response = {
      success: true,
      summary: {
        totalDrawings,
        syncedDrawings,
        syncPercentage: totalDrawings > 0 ? Math.round((syncedDrawings / totalDrawings) * 100) : 0,
        unsyncedDrawings: totalDrawings - syncedDrawings,
        verifiedDrawings,
        verificationPercentage: totalDrawings > 0 ? Math.round((verifiedDrawings / totalDrawings) * 100) : 0,
        mappedDrawings,
        mappingPercentage: totalDrawings > 0 ? Math.round((mappedDrawings / totalDrawings) * 100) : 0,
        totalDevices,
        verifiedDevices,
        deviceVerificationPercentage: totalDevices > 0 ? Math.round((verifiedDevices / totalDevices) * 100) : 0
      },
      ...(systemBreakdown.length > 0 && { systemBreakdown }),
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to fetch sync status:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch sync status',
      executionTime: Date.now() - startTime
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
