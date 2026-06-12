/**
 * GSD Pi Integration API - Enhanced with Real Database Sync
 * GET /api/gsd/pi-integration - Get GSD Pi topology and metrics
 * POST /api/gsd/pi-integration - Trigger sync operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { gsdPiService } from '@/lib/services/gsd-pi-integration';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'topology';
  const systemCode = searchParams.get('systemCode');

  try {
    switch (action) {
      case 'topology': {
        const topology = await gsdPiService.getTopology();
        return NextResponse.json({
          success: true,
          action: 'topology',
          data: topology,
          executionTime: Date.now() - startTime,
        });
      }

      case 'enhanced': {
        const enhanced = await gsdPiService.getEnhancedTopology();
        return NextResponse.json({
          success: true,
          action: 'enhanced',
          data: enhanced,
          executionTime: Date.now() - startTime,
        });
      }

      case 'system': {
        if (!systemCode) {
          return NextResponse.json({ error: 'systemCode required for system action' }, { status: 400 });
        }
        const systemDetails = await gsdPiService.getSystemDetails(systemCode);
        return NextResponse.json({
          success: true,
          action: 'system',
          data: systemDetails,
          executionTime: Date.now() - startTime,
        });
      }

      case 'health': {
        const health = await gsdPiService.healthCheck();
        return NextResponse.json({
          success: true,
          action: 'health',
          data: health,
          executionTime: Date.now() - startTime,
        });
      }

      case 'statistics': {
        const statistics = await gsdPiService.getStatistics();
        return NextResponse.json({
          success: true,
          action: 'statistics',
          data: statistics,
          executionTime: Date.now() - startTime,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Valid: topology, enhanced, system, health, statistics` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GSD Pi Integration API error:', error);
    return NextResponse.json(
      { success: false, error: 'GSD Pi operation failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { action, systemCode, metadata } = body;

    switch (action) {
      case 'sync': {
        if (!systemCode) {
          return NextResponse.json({ error: 'systemCode required for sync' }, { status: 400 });
        }
        const updated = await gsdPiService.updateSystemMetadata(systemCode, metadata || {});
        return NextResponse.json({
          success: true,
          action: 'sync',
          data: updated,
          executionTime: Date.now() - startTime,
        });
      }

      case 'refresh': {
        const topology = await gsdPiService.getTopology();
        return NextResponse.json({
          success: true,
          action: 'refresh',
          message: 'GSD Pi topology refreshed',
          data: topology.metadata,
          executionTime: Date.now() - startTime,
        });
      }

      default:
        return NextResponse.json(
          { error: `Unknown POST action: ${action}. Valid: sync, refresh` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GSD Pi POST error:', error);
    return NextResponse.json(
      { success: false, error: 'GSD Pi POST operation failed', details: String(error) },
      { status: 500 }
    );
  }
}
